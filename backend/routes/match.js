const express = require('express');
const Internship = require('../models/Internship');

const router = express.Router();

const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_TIMEOUT_MS = 12000;
const FALLBACK_WARNING = 'AI matching is unavailable, so fallback matching was used.';

function compactInternship(internship) {
  return {
    id: internship._id.toString(),
    title: internship.title,
    company: internship.company,
    domain: internship.domain,
    location: internship.location,
    workMode: internship.workMode,
    durationMonths: internship.durationMonths,
    stipendPerMonth: internship.stipendPerMonth,
    skills: internship.skills,
    description: internship.description,
  };
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((token) => token.length > 1);
}

function uniqueTokens(...values) {
  return [...new Set(values.flatMap(tokenize))];
}

function scoreInternship(profile, internship) {
  const profileTokens = uniqueTokens(
    profile.fieldOfStudy,
    profile.skills,
    profile.interests
  );

  const searchable = [
    internship.title,
    internship.domain,
    internship.skills.join(' '),
    internship.description,
  ].join(' ').toLowerCase();

  let score = 0;
  const matched = [];

  profileTokens.forEach((token) => {
    if (searchable.includes(token)) {
      score += 1;
      matched.push(token);
    }
  });

  tokenize(profile.skills).forEach((token) => {
    if (internship.skills.some((skill) => skill.toLowerCase().includes(token))) {
      score += 2;
    }
  });

  if (internship.domain.toLowerCase().includes(String(profile.fieldOfStudy || '').toLowerCase())) {
    score += 2;
  }

  return { score, matched };
}

function makeFallbackReason(internship, matched) {
  const skills = internship.skills.slice(0, 2).join(' and ');
  if (matched.length) {
    return `Matches your interest in ${matched.slice(0, 2).join(' and ')}.`;
  }
  if (skills) {
    return `Relevant ${internship.domain} role using ${skills}.`;
  }
  return `Relevant ${internship.domain} opportunity based on your profile.`;
}

function fallbackRecommendations(profile, internships) {
  return internships
    .map((internship, index) => {
      const { score, matched } = scoreInternship(profile, internship);
      return { internship, score, matched, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map(({ internship, matched }) => ({
      internship,
      reason: makeFallbackReason(internship, matched),
    }));
}

function stripJsonFence(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function buildPrompt(profile, catalog) {
  return [
    'Recommend exactly the top 3 internships for this student.',
    'You must choose only from the provided catalog.',
    'Return strict JSON only with this shape:',
    '{"recommendations":[{"internshipId":"existing_mongo_id","reason":"one-line reason"}]}',
    'Do not include markdown, prose, or internships outside the catalog.',
    '',
    `Student profile: ${JSON.stringify(profile)}`,
    '',
    `Catalog: ${JSON.stringify(catalog)}`,
  ].join('\n');
}

async function callGemini(profile, catalog) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: 'You are an internship matching assistant. Return only valid JSON.',
              },
            ],
          },
          contents: [
            {
              parts: [{ text: buildPrompt(profile, catalog) }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error?.message || 'Gemini request failed');
    }

    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || '')
      .join('')
      .trim();

    if (!text) throw new Error('Gemini returned no text');
    return JSON.parse(stripJsonFence(text));
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeGeminiRecommendations(output, internshipsById) {
  if (!output || !Array.isArray(output.recommendations)) {
    throw new Error('Gemini output was not in the expected shape');
  }

  const seen = new Set();
  const recommendations = [];

  output.recommendations.forEach((item) => {
    const id = String(item?.internshipId || '');
    const internship = internshipsById.get(id);
    const reason = String(item?.reason || '').trim();

    if (!internship || seen.has(id) || !reason) return;

    seen.add(id);
    recommendations.push({
      internship,
      reason,
    });
  });

  return recommendations.slice(0, 3);
}

router.post('/', async (req, res) => {
  try {
    const fieldOfStudy = String(req.body.fieldOfStudy || '').trim();
    const yearOfStudy = String(req.body.yearOfStudy || '').trim();
    const skills = String(req.body.skills || '').trim();
    const interests = String(req.body.interests || '').trim();

    if (!fieldOfStudy || !yearOfStudy || !skills || !interests) {
      return res.status(400).json({
        error: 'fieldOfStudy, yearOfStudy, skills, and interests are required',
      });
    }

    const profile = { fieldOfStudy, yearOfStudy, skills, interests };
    const internships = await Internship.find({}).sort({ postedAt: -1 });
    const catalog = internships.map(compactInternship);
    const internshipsById = new Map(
      internships.map((internship) => [internship._id.toString(), internship])
    );

    try {
      const output = await callGemini(profile, catalog);
      const validRecommendations = normalizeGeminiRecommendations(output, internshipsById);

      if (validRecommendations.length < 3) {
        throw new Error('Gemini returned fewer than 3 valid catalog recommendations');
      }

      res.json({
        recommendations: validRecommendations,
        provider: 'gemini',
        warning: null,
      });
    } catch (err) {
      console.warn('[POST /api/match] falling back:', err.message);
      res.json({
        recommendations: fallbackRecommendations(profile, internships),
        provider: 'fallback',
        warning: FALLBACK_WARNING,
      });
    }
  } catch (err) {
    console.error('[POST /api/match]', err);
    res.status(500).json({ error: 'Failed to match internships' });
  }
});

module.exports = router;
