const connectDB = require('./db');

async function saveProgress(userId, level, score) {
  const db = await connectDB();
  const progressCollection = db.collection('progress');

  const progress = { userId, level, score, timestamp: new Date() };
  await progressCollection.insertOne(progress);
  console.log('Progress saved');
}

async function getProgress(userId) {
  const db = await connectDB();
  const progressCollection = db.collection('progress');

  const userProgress = await progressCollection.find({ userId }).toArray();
  console.log('User Progress:', userProgress);
  return userProgress;
}

module.exports = { saveProgress, getProgress };