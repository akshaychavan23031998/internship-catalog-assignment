const express = require('express');
const Internship = require('../models/Internship');

const router = express.Router();

/**
 * GET /api/internships
 *
 * Supported query params:
 *   q              - free text search (title, company, description)
 *   domain         - one or more domains, repeated: ?domain=Software&domain=Design
 *   workMode       - one or more: ?workMode=Remote&workMode=Hybrid
 *   location       - one or more
 *   minStipend     - number, INR
 *   page           - 1-indexed page number, default 1
 *   limit          - page size, default 9
 */
router.get('/', async (req, res) => {
  try {
    const {
      q,
      domain,
      workMode,
      location,
      minStipend,
      page = 1,
      limit = 9,
    } = req.query;

    // Build the list of individual filter clauses.
    const clauses = [];

    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), 'i');
      clauses.push({
        $or: [{ title: rx }, { company: rx }, { description: rx }],
      });
    }

    const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

    const domains = asArray(domain);
    if (domains.length) clauses.push({ domain: { $in: domains } });

    const modes = asArray(workMode);
    if (modes.length) clauses.push({ workMode: { $in: modes } });

    const locations = asArray(location);
    if (locations.length) clauses.push({ location: { $in: locations } });

    if (minStipend) {
      clauses.push({ stipendPerMonth: { $gte: Number(minStipend) } });
    }

    // Combine the clauses. If multiple filters are selected, results should
    // match all of them.
    const filter = clauses.length ? { $or: clauses } : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);
    // const skip = pageNum * limitNum;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Internship.find(filter)
        .sort({ postedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Internship.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('[GET /api/internships]', err);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

/**
 * GET /api/internships/facets
 *
 * Returns the distinct values for filter fields so the sidebar can render
 * checkboxes without hard-coding them.
 */
router.get('/facets', async (_req, res) => {
  try {
    const [domains, workModes, locations] = await Promise.all([
      Internship.distinct('domain'),
      Internship.distinct('workMode'),
      Internship.distinct('location'),
    ]);
    res.json({ domains, workModes, locations });
  } catch (err) {
    console.error('[GET /api/internships/facets]', err);
    res.status(500).json({ error: 'Failed to fetch facets' });
  }
});

/**
 * GET /api/internships/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Not found' });
    res.json(internship);
  } catch (err) {
    console.error('[GET /api/internships/:id]', err);
    res.status(500).json({ error: 'Failed to fetch internship' });
  }
});

module.exports = router;
