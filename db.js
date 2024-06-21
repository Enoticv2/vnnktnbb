const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://cyberclubkk:7PU1nrXukss6r2yi@bezdelniki.xqcj4q5.mongodb.net/?retryWrites=true&w=majority&appName=bezdelniki';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('gameDB'); // Название вашей базы данных
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectDB;