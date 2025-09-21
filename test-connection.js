// test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();