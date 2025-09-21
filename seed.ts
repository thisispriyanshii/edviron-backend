import { connect, connection, Types } from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await connect(mongoUri);

    // Orders collection schema
    const orderSchema = new connection.base.Schema({
      school_id: String,
      created_at: Date,
    });
    const Order = connection.model('Order', orderSchema, 'orders');

    // OrderStatuses collection schema
    const statusSchema = new connection.base.Schema({
      collect_id: { type: Types.ObjectId, ref: 'Order' },
      order_amount: Number,
      transaction_amount: Number,
      status: String,
      payment_time: Date,
    });
    const OrderStatus = connection.model('OrderStatus', statusSchema, 'orderstatuses');

    // Clean old data
    await Order.deleteMany({});
    await OrderStatus.deleteMany({});

    const statuses = ['completed', 'pending', 'failed'];
    const schools = ['school-1', 'school-2', 'school-3'];

    const ordersToInsert: any[] = [];
    const statusesToInsert: any[] = [];

    // Generate 20–30 random orders
    const totalOrders = Math.floor(Math.random() * 11) + 20; // between 20–30
    for (let i = 0; i < totalOrders; i++) {
      const school_id = schools[Math.floor(Math.random() * schools.length)];
      const created_at = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30); // last 30 days

      ordersToInsert.push({ school_id, created_at });
    }

    // Insert orders
    const orders = await Order.insertMany(ordersToInsert);

    // Generate orderstatuses for each order
    for (const order of orders) {
      const order_amount = Math.floor(Math.random() * 2000) + 200; // 200–2200
      const transaction_amount =
        Math.random() > 0.1 ? order_amount : 0; // sometimes failed → 0
      const status =
        transaction_amount === 0
          ? 'failed'
          : statuses[Math.floor(Math.random() * statuses.length)];
      const payment_time = new Date(
        order.created_at.getTime() + Math.random() * 1000 * 60 * 60 * 24,
      );

      statusesToInsert.push({
        collect_id: order._id,
        order_amount,
        transaction_amount,
        status,
        payment_time,
      });
    }

    await OrderStatus.insertMany(statusesToInsert);

    console.log(
      `✅ Seeded ${orders.length} orders with linked orderstatuses successfully`,
    );
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await connection.close();
  }
}

seed();
