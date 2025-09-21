const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority';
  
  console.log('Starting MongoDB connection test...');
  
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

main().catch(console.error);
