const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_catalog';
  await mongoose.connect(uri);
  console.log('[db] connected to', uri);
}

module.exports = { connect };
