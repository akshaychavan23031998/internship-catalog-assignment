const express = require('express');
const Application = require('../models/Application');
const Internship = require('../models/Internship');

const router = express.Router();

/**
 * POST /api/applications
 * body: { internshipId, userId }
 */
router.post('/', async (req, res) => {
  try {
    const { internshipId, userId } = req.body;

    if (!internshipId || !userId) {
      return res.status(400).json({ error: 'internshipId and userId are required' });
    }

    // Make sure the internship exists.
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    // Prevent duplicate applications by the same user to the same internship.
    const existing = await Application.findOne({ internshipId, userId });
    if (existing) {
      return res.status(409).json({ error: 'You have already applied to this internship' });
    }

    const application = await Application.create({ internshipId, userId });
    res.status(201).json(application);
  } catch (err) {
    console.error('[POST /api/applications]', err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

/**
 * GET /api/applications?userId=...
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const applications = await Application.find({ userId }).populate('internshipId');
    res.json(applications);
  } catch (err) {
    console.error('[GET /api/applications]', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
