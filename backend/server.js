require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./db');

const internshipsRouter = require('./routes/internships');
const applicationsRouter = require('./routes/applications');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/internships', internshipsRouter);
app.use('/api/applications', applicationsRouter);

// TODO (candidate): mount a /api/bookmarks router for the "Save for later" feature.
// TODO (candidate): mount a /api/find router for the "Find Your Internship" AI feature.

const PORT = process.env.PORT || 4000;

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] failed to start', err);
    process.exit(1);
  });
