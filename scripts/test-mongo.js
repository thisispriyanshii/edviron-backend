const mongoose = require('mongoose');

async function testConnection() {
  console.log('🚀 Testing MongoDB Atlas connection...');
  
  const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority';
  
  console.log('🔗 Connection string:', uri.replace(/:[^:]*@/, ':***@'));
  
  try {
    // Set up event listeners
    mongoose.connection.on('connecting', () => console.log('🔌 Connecting to MongoDB...'));
    mongoose.connection.on('connected', () => console.log('✅ Connected to MongoDB'));
    mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    // Attempt connection
    console.log('⏳ Attempting to connect...');
    await mongoose.connect(uri, options);
    
    // If we get here, connection was successful
    console.log('🎉 Successfully connected to MongoDB Atlas!');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🔌 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

testConnection().catch(console.error);
