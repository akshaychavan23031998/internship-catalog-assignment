const express = require('express');
const Bookmark = require('../models/Bookmark');
const Internship = require('../models/Internship');

const router = express.Router();

/**
 * GET /api/bookmarks?userId=...
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const bookmarks = await Bookmark.find({ userId })
      .sort({ savedAt: -1 })
      .populate('internshipId');

    res.json({ items: bookmarks });
  } catch (err) {
    console.error('[GET /api/bookmarks]', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

/**
 * GET /api/bookmarks/:internshipId?userId=...
 */
router.get('/:internshipId', async (req, res) => {
  try {
    const { userId } = req.query;
    const { internshipId } = req.params;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const bookmark = await Bookmark.findOne({ internshipId, userId });
    res.json({ saved: Boolean(bookmark), bookmark });
  } catch (err) {
    console.error('[GET /api/bookmarks/:internshipId]', err);
    res.status(500).json({ error: 'Failed to fetch bookmark state' });
  }
});

/**
 * POST /api/bookmarks
 * body: { internshipId, userId }
 */
router.post('/', async (req, res) => {
  try {
    const { internshipId, userId } = req.body;

    if (!internshipId || !userId) {
      return res.status(400).json({ error: 'internshipId and userId are required' });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    const existing = await Bookmark.findOne({ internshipId, userId });
    if (existing) {
      return res.status(200).json({ saved: true, bookmark: existing });
    }

    const bookmark = await Bookmark.create({ internshipId, userId });
    res.status(201).json({ saved: true, bookmark });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ saved: true });
    }

    console.error('[POST /api/bookmarks]', err);
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
});

/**
 * DELETE /api/bookmarks/:internshipId?userId=...
 */
router.delete('/:internshipId', async (req, res) => {
  try {
    const { userId } = req.query;
    const { internshipId } = req.params;

    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await Bookmark.findOneAndDelete({ internshipId, userId });
    res.json({ saved: false });
  } catch (err) {
    console.error('[DELETE /api/bookmarks/:internshipId]', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

module.exports = router;
