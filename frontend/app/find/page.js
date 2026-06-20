'use client';

import Link from 'next/link';
import { useState } from 'react';
import { findInternshipMatches } from '@/lib/api';

const initialForm = {
  fieldOfStudy: '',
  yearOfStudy: '3rd',
  skills: '',
  interests: '',
};

function formatStipend(value) {
  return `\u20b9${value.toLocaleString('en-IN')}/mo`;
}

export default function FindPage() {
  const [form, setForm] = useState(initialForm);
  const [recommendations, setRecommendations] = useState([]);
  const [provider, setProvider] = useState(null);
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setWarning(null);

    try {
      const data = await findInternshipMatches(form);
      setRecommendations(data.recommendations || []);
      setProvider(data.provider);
      setWarning(data.warning);
    } catch (err) {
      setRecommendations([]);
      setProvider(null);
      setWarning(null);
      setError(err.message || 'Failed to find internship matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-8">
      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 self-start"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Find your internship
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Share a few details and get three catalog-based matches.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Field of study
          </label>
          <input
            type="text"
            value={form.fieldOfStudy}
            onChange={(e) => updateField('fieldOfStudy', e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="e.g. Computer Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Year of study
          </label>
          <select
            value={form.yearOfStudy}
            onChange={(e) => updateField('yearOfStudy', e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
            <option value="postgraduate">postgraduate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Skills
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => updateField('skills', e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="e.g. React, JavaScript, Tailwind"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Interests
          </label>
          <textarea
            value={form.interests}
            onChange={(e) => updateField('interests', e.target.value)}
            required
            rows={4}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            placeholder="What kind of work are you looking for?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Finding matches...' : 'Find matches'}
        </button>
      </form>

      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Recommendations
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {provider ? `Matched with ${provider}.` : 'Your matches will appear here.'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 text-red-700 text-sm p-3">{error}</div>
        )}

        {warning && (
          <div className="rounded-md bg-amber-50 text-amber-700 text-sm p-3">
            {warning}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-slate-500">Finding your best matches...</div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Fill out the form to see your top internship matches.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {recommendations.map((item) => (
              <RecommendationCard
                key={item.internship._id}
                internship={item.internship}
                reason={item.reason}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ internship, reason }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-accent hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink leading-tight">{internship.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{internship.company}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
          {internship.workMode}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>{'\uD83D\uDCCD'} {internship.location}</span>
        <span>{'\uD83D\uDCB0'} {formatStipend(internship.stipendPerMonth)}</span>
      </div>

      {internship.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {internship.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm text-slate-700">{reason}</p>

      <Link
        href={`/internships/${internship._id}`}
        className="mt-4 inline-block text-sm font-medium text-accent hover:text-blue-700"
      >
        View internship
      </Link>
    </div>
  );
}
