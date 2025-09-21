import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { OrdersService } from '../src/modules/orders/orders.service';
import { OrderStatusService } from '../src/modules/order-status/order-status.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
// Define UserRole as a constant object for both type and value
const UserRole = {
  ADMIN: 'admin',
  SCHOOL_ADMIN: 'school_admin',
  TRUSTEE: 'trustee',
  USER: 'user'
} as const;

type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Generates a random date within a range
 */
function getRandomDate(from: Date, to: Date): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

/**
 * Generates a random transaction ID
 */
function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const configService = app.get(ConfigService);
  const usersService = app.get(UsersService);
  const ordersService = app.get(OrdersService);
  const orderStatusService = app.get(OrderStatusService);

  try {
    console.log('🚀 Starting seed process...');

    // School IDs to use for test data
    const schoolIds = [
      '65b0e6293e9f76a9694d84b4', // Main test school
      '65b0e6293e9f76a9694d84b5', // Additional test school 1
      '65b0e6293e9f76a9694d84b6', // Additional test school 2
    ];

    // Create test users with different roles
    const testUsers = [
      // Admin user (super admin)
      {
        email: 'admin@edviron.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Admin User',
        role: UserRole.ADMIN,
        school_id: schoolIds[0],
      },
      // School admins (one per school)
      {
        email: 'school1@edviron.com',
        password: await bcrypt.hash('password123', 10),
        name: 'School 1 Admin',
        role: UserRole.SCHOOL_ADMIN,
        school_id: schoolIds[0],
      },
      {
        email: 'school2@edviron.com',
        password: await bcrypt.hash('password123', 10),
        name: 'School 2 Admin',
        role: UserRole.SCHOOL_ADMIN,
        school_id: schoolIds[1],
      },
      // Regular users (trustees/parents)
      {
        email: 'parent1@edviron.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Parent One',
        role: UserRole.TRUSTEE,
        school_id: schoolIds[0],
      },
      {
        email: 'parent2@edviron.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Parent Two',
        role: UserRole.TRUSTEE,
        school_id: schoolIds[1],
      },
    ];

    console.log('👥 Creating test users...');
    interface CreatedUser {
      _id: any;
      email: string;
      role: string; // Keep as string to match the actual user type
      [key: string]: any; // Allow other properties
    }
    const createdUsers: CreatedUser[] = [];
    for (const userData of testUsers) {
      try {
        const user = await usersService.create(userData);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        createdUsers.push(user);
      } catch (error) {
        if (error.code === 11000) { // Duplicate key error
          console.log(`ℹ️  User ${userData.email} already exists`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Generate test orders with realistic data
    const orderStatuses = ['created', 'pending', 'success', 'failed', 'refunded'];
    const paymentGateways = ['razorpay', 'stripe', 'paypal'];
    const paymentModes = ['credit_card', 'debit_card', 'net_banking', 'upi', 'wallet'];
    
    const ordersPerSchool = 5; // Reduced number for testing
    
    console.log('🛒 Generating test orders...');
    
    for (const schoolId of schoolIds) {
      console.log(`🏫 Creating orders for school ${schoolId}...`);
      
      for (let i = 0; i < ordersPerSchool; i++) {
        try {
          // Determine order status with weighted probabilities
          let status: string;
          const rand = Math.random();
          if (rand < 0.6) status = 'success';         // 60% success
          else if (rand < 0.8) status = 'pending';     // 20% pending
          else if (rand < 0.95) status = 'failed';     // 15% failed
          else status = 'refunded';                    // 5% refunded
          
          const orderAmount = Math.floor(Math.random() * 10000) + 100; // ₹100 to ₹10,100
          const transactionAmount = status === 'success' ? orderAmount : 0;
          const paymentMode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
          const gateway = paymentGateways[Math.floor(Math.random() * paymentGateways.length)];
          const orderDate = getRandomDate(new Date(2024, 0, 1), new Date());
          
          // Generate student info
          const studentName = faker.person.fullName();
          const studentId = `STU${Math.floor(1000 + Math.random() * 9000)}`;
          const firstName = studentName.split(' ')[0];
          const lastName = studentName.split(' ')[1] || 'student';
          const studentEmail = faker.internet.email({ 
            firstName, 
            lastName, 
            provider: 'edviron.com',
            allowSpecialCharacters: false 
          });
          
          // Create order
          const order = await ordersService.create({
            school_id: schoolId,
            student_info: {
              name: studentName,
              id: studentId,
              email: studentEmail,
            },
            gateway_name: gateway,
            custom_order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            order_amount: orderAmount,
          });
          
          console.log(`   ✅ Created order ${order.custom_order_id} (${order.student_info.name} - ₹${orderAmount})`);
          
          // Create order status
          const statusUpdateDate = new Date(orderDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Within 7 days
          
          const orderStatusData: any = {
            collect_id: order._id,
            order_amount: orderAmount,
            transaction_amount: transactionAmount,
            status: status,
            payment_mode: paymentMode,
            payment_details: JSON.stringify({
              card_last4: Math.floor(1000 + Math.random() * 9000).toString(),
              bank: faker.finance.accountName(),
              wallet: gateway === 'paypal' ? 'PayPal' : null,
            }),
            payment_message: status === 'success' ? 'Payment successful' : 
                           status === 'pending' ? 'Payment processing' :
                           status === 'failed' ? 'Payment failed: Insufficient funds' : 'Payment refunded',
            gateway_response: {
              id: `gateway_${generateTransactionId()}`,
              status: status,
              amount: orderAmount,
              currency: 'INR',
              method: paymentMode,
              created_at: Math.floor(statusUpdateDate.getTime() / 1000),
              captured: status === 'success',
              description: `Payment for ${studentName}'s fees`,
              refund_status: status === 'refunded' ? 'full' : null,
              international: false,
              amount_refunded: status === 'refunded' ? orderAmount : 0,
              contact: faker.phone.number(),
              fee: Math.floor(orderAmount * 0.02), // 2% fee
              tax: Math.floor(orderAmount * 0.18),  // 18% GST
              error_code: status === 'failed' ? 'INSUFFICIENT_FUNDS' : null,
              error_description: status === 'failed' ? 'Insufficient funds in the account' : null,
            }
          };
          
          // Add conditional fields
          if (status === 'success') {
            orderStatusData.bank_reference = `BANK${Math.floor(10000000 + Math.random() * 90000000)}`;
            orderStatusData.payment_time = statusUpdateDate;
          }
          
          if (status === 'failed') {
            orderStatusData.error_message = 'Insufficient funds';
          }
          
          await orderStatusService.create(orderStatusData);
          
        } catch (error) {
          console.error(`❌ Error creating order:`, error.message);
          if (error.response?.data?.message) {
            console.error('  Details:', error.response.data.message);
          }
        }
      }
    }
    
    console.log('🎉 Seed process completed successfully!');
    console.log('🔑 Test credentials:');
    console.log('   - Admin: admin@edviron.com / password123');
    console.log('   - School Admin: school1@edviron.com / password123');
    console.log('   - Parent: parent1@edviron.com / password123');
    
  } catch (error: any) {
    console.error('❌ Error during seeding:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      response: error.response?.data
    });
    process.exit(1);
  } finally {
    try {
      await app.close();
    } catch (e) {
      console.error('Error closing app:', e.message);
    }
    process.exit(0);
  }
}

seed();
