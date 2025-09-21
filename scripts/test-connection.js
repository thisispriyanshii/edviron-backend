const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority';
  
  console.log('Starting connection test...');
  console.log('Connection string:', uri.replace(/:[^:]*@/, ':***@'));
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    // Try to list collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error code name:', error.codeName);
    
    if (error.errorLabels) {
      console.error('Error labels:', error.errorLabels);
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n')[0]);
    }
    
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

main().catch(console.error);
