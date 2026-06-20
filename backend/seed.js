require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connect } = require('./db');
const Internship = require('./models/Internship');

async function run() {
  await connect();

  const file = path.join(__dirname, 'data', 'internships.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  await Internship.deleteMany({});
  await Internship.insertMany(data);

  console.log(`[seed] inserted ${data.length} internships`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
