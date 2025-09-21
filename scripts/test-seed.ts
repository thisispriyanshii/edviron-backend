import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import * as bcrypt from 'bcryptjs';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import * as mongoose from 'mongoose';

async function testSeed() {
  console.log('🚀 Starting test seed...');
  
  // Test MongoDB connection to Atlas
  console.log('🔌 Attempting to connect to MongoDB Atlas...');
  try {
    const uri = 'mongodb+srv://edviron-user:heyitsme@edviron-cluster.achi4be.mongodb.net/edviron?retryWrites=true&w=majority&appName=edviron-cluster';
    console.log('🔗 Using connection string:', uri.replace(/:[^:]*@/, ':***@'));
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📊 Database name:', mongoose.connection.name);
    console.log('🔌 Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) console.error('Reason:', error.reason);
    process.exit(1);
  }
  
  // Create a test app
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    // Test user data
    const testUser = {
      email: 'test@edviron.com',
      password: await bcrypt.hash('test123', 10),
      name: 'Test User',
      role: 'user',
      school_id: 'test_school_123'
    };

    console.log('Creating test user...');
    const user = await usersService.create(testUser);
    console.log('✅ Test user created:', user);
    
  } catch (error) {
    console.error('❌ Error in test seed:', error);
    if (error.code === 11000) {
      console.log('User already exists');
    }
  } finally {
    await app.close();
    process.exit(0);
  }
}

testSeed().catch(console.error);
