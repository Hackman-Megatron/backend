# Stock Management Backend API

Complete Node.js/Express backend for the Military Stock Management System with MySQL database.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-based Access Control**: Administrator and Super Administrator roles
- **Complete CRUD Operations**: For articles, movements, orders, categories, and users
- **Dashboard Analytics**: Real-time statistics and chart data
- **Transaction Safety**: Database transactions for critical operations
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Centralized error handling middleware
- **Security**: CORS enabled, SQL injection protection

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Navigate to the backend folder:
```bash
cd src/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your `.env` file with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stock_management
DB_PORT=3306

JWT_SECRET=your_very_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

## Database Setup

1. Create the database and tables:
```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL file in your MySQL client.

The schema includes:
- Users table with default admin account
- Articles table for inventory items
- Categories table with default categories
- Mouvements table for stock movements
- Commandes table for orders

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Default Admin Account

After running the schema:
- **Email**: admin@military.gov
- **Password**: admin123 (hash needs to be generated properly)

⚠️ **Important**: Change the default admin password in production!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts/:type` - Get chart data (mouvements, categories, monthly, raw-materials)

### Articles
- `GET /api/articles` - List all articles (supports filtering)
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Stock Movements
- `GET /api/mouvements` - List all movements (supports filtering)
- `GET /api/mouvements/:id` - Get single movement
- `GET /api/mouvements/stats` - Get movement statistics
- `POST /api/mouvements` - Create movement (updates stock automatically)
- `DELETE /api/mouvements/:id` - Delete movement

### Orders (Commandes)
- `GET /api/commandes` - List all orders (supports filtering)
- `GET /api/commandes/:id` - Get single order
- `GET /api/commandes/stats` - Get order statistics
- `POST /api/commandes` - Create new order
- `PUT /api/commandes/:id` - Update order
- `DELETE /api/commandes/:id` - Delete order

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Users (Super Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports
- `GET /api/rapports/productions` - Production reports
- `GET /api/rapports/livraisons` - Delivery reports
- `GET /api/rapports/export/:type` - Export report as PDF (not implemented)

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/register` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

### Articles
- `type`: Filter by type (matiere_premiere, uniforme_fini)
- `categorie`: Filter by category
- `institution`: Filter by institution
- `statut`: Filter by status (Normal, Faible)

### Movements
- `type`: Filter by movement type
- `article_id`: Filter by article
- `utilisateur_id`: Filter by user
- `start_date`: Filter by start date
- `end_date`: Filter by end date

### Orders
- `statut`: Filter by status (En attente, En production, Livrée)
- `priorite`: Filter by priority (Basse, Normale, Haute, Urgente)
- `institution`: Filter by institution

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // validation errors if applicable
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict (duplicate entry)
- `500`: Internal Server Error

## Database Transactions

Stock movements use database transactions to ensure data consistency:
- When a movement is created, the article quantity is automatically updated
- If the operation fails, changes are rolled back
- Prevents negative stock quantities

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection protection via parameterized queries
- Input validation on all endpoints
- CORS enabled for frontend integration
- Role-based access control

## Development Tips

1. Use a tool like Postman or Insomnia to test the API
2. Check server logs for debugging
3. The database connection is tested on startup
4. All routes log incoming requests in development mode

## Production Deployment

1. Set `NODE_ENV=production` in your `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name stock-api
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure the database exists
- Check firewall settings

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header is correct

### CORS Issues
- Frontend and backend must have matching CORS settings
- Update CORS configuration in `server.js` if needed

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Environment**: dotenv
- **Security**: CORS

## License

ISC
