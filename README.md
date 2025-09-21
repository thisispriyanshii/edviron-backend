# Edviron School Payments Backend

A comprehensive NestJS backend application for managing school payments and transactions with MongoDB integration, JWT authentication, and payment gateway integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Payment Integration**: External payment gateway integration with webhook support
- **Transaction Management**: Complete transaction lifecycle management with status tracking
- **Data Aggregation**: Advanced MongoDB aggregation for transaction analytics
- **Filtering & Pagination**: Comprehensive filtering, sorting, and pagination
- **Webhook Processing**: Real-time payment status updates via webhooks
- **Data Validation**: Comprehensive input validation using class-validator
- **Error Handling**: Centralized error handling and logging

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edviron-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/edviron?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=3600s
   PAYMENT_API_KEY=your-payment-api-key
   PAYMENT_PG_KEY=edvtest01
   SCHOOL_ID=65b0e6293e9f76a9694d84b4
   PORT=3000
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## 🗄️ Database Setup

The application uses MongoDB with the following collections:

- **users**: User authentication and profile data
- **orders**: Payment order information
- **orderstatuses**: Transaction status and payment details
- **webhooklogs**: Webhook processing logs

### Seed Data

Run the seed script to populate the database with test data:

```bash
npm run seed
```

This will create:
- Test users (admin, school admin, regular user)
- Sample orders with different statuses
- Corresponding order status records

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)
- `GET /auth/verify` - Verify JWT token (protected)

### Payments
- `POST /payments/create-payment` - Create new payment (protected)
- `GET /payments/status/:orderId` - Get payment status (protected)

### Transactions
- `GET /transactions` - Get all transactions with filtering (protected)
- `GET /transactions/school/:schoolId` - Get transactions by school (protected)
- `GET /transactions/status/:customOrderId` - Get transaction status (protected)
- `GET /transactions/stats` - Get transaction statistics (protected)

### Webhooks
- `POST /webhooks/webhook` - Payment gateway webhook (public)
- `GET /webhooks/logs` - Get webhook logs (protected)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | Yes |
| `PAYMENT_API_KEY` | Payment gateway API key | Yes |
| `PAYMENT_PG_KEY` | Payment gateway PG key | Yes |
| `SCHOOL_ID` | Default school ID | Yes |
| `PORT` | Server port | No (default: 3000) |

### Database Indexes

The application automatically creates the following indexes for optimal performance:

- **orders**: `school_id`, `custom_order_id`, `collect_id`, `status`, `created_at`
- **orderstatuses**: `collect_id`, `status`, `payment_time`, `bank_reference`
- **users**: `email`, `school_id`, `role`
- **webhooklogs**: `received_at`, `processed`, `order_id`, `status`

## 🧪 Testing

### Manual Testing

Use the provided Postman collection (`postman/Edviron-API.postman_collection.json`) to test all endpoints.

### Test Data

After running the seed script, you can use these test credentials:

- **Admin**: `admin@edviron.com` / `password123`
- **School Admin**: `school@edviron.com` / `password123`
- **User**: `user@edviron.com` / `password123`

### Sample API Calls

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@edviron.com", "password": "password123"}'
```

**Create Payment:**
```bash
curl -X POST http://localhost:3000/payments/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "school_id": "65b0e6293e9f76a9694d84b4",
    "student_info": {
      "name": "John Doe",
      "id": "STU001",
      "email": "john@example.com"
    },
    "gateway_name": "razorpay",
    "order_amount": 5000
  }'
```

## 🚀 Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGO_URI=your-mongo-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set PAYMENT_API_KEY=your-payment-api-key
   # ... set other variables
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📊 Monitoring & Logging

- **Webhook Logs**: All webhook requests are logged in the `webhooklogs` collection
- **Error Logging**: Comprehensive error logging throughout the application
- **Performance**: Database queries are optimized with proper indexing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive validation using class-validator
- **CORS Configuration**: Proper CORS setup for frontend integration
- **Rate Limiting**: Built-in rate limiting for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@edviron.com or create an issue in the repository.

## 📈 Performance Considerations

- **Database Indexing**: Proper indexes for frequently queried fields
- **Aggregation Pipelines**: Optimized MongoDB aggregation for complex queries
- **Pagination**: Efficient pagination to handle large datasets
- **Connection Pooling**: MongoDB connection pooling for better performance

## 🔄 Webhook Processing

The webhook endpoint (`POST /webhooks/webhook`) processes payment status updates:

1. **Logs the webhook payload** for debugging
2. **Extracts order information** from the payload
3. **Updates order status** in the database
4. **Handles errors gracefully** with proper error responses

## 📱 Frontend Integration

The backend is designed to work seamlessly with the React frontend:

- **CORS enabled** for frontend domain
- **JWT tokens** for authentication
- **RESTful API** design
- **Comprehensive error responses**

---

**Built with ❤️ using NestJS, MongoDB, and TypeScript**