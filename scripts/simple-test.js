const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority';
  const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000
  });

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');
    
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) console.error(error.stack.split('\n')[0]);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

testConnection().catch(console.error);
