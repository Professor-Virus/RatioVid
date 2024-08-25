import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function updateVideoMetadata(videoUrl, metadata) {
  try {
    await client.connect();
    const database = client.db('your_database_name');
    const videos = database.collection('videos');

    const result = await videos.updateOne(
      { url: videoUrl },
      { $set: metadata },
      { upsert: true }
    );

    console.log(`Updated ${result.modifiedCount} document(s)`);
  } finally {
    await client.close();
  }
}