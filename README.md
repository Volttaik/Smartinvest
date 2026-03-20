# SmartInvest

A modern investment platform with session-based authentication, real-time dashboard, and secure payment integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (or MongoDB Atlas connection string)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your_connection_string

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5000

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_key_here

# Paystack Configuration (optional - for payments)
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Cron Secret
CRON_SECRET=your_cron_secret

# Database Init Secret
INIT_SECRET=your_init_secret
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database (seeds investment packages):
```bash
curl -X POST http://localhost:3001/api/init -H "Content-Type: application/json" -d '{"secret":"your_init_secret"}'
```

### Running the Application

**Development (Frontend + Backend):**
```bash
npm run dev:full
```
This runs both the frontend (Vite) on port 5000 and the backend server on port 3001.

**Development (Frontend only):**
```bash
npm run dev
```

**Development (Backend only):**
```bash
npm run dev:backend
```

**Production:**
```bash
npm run build
npm start
```

## 📁 Project Structure

```
Smartinvest/
├── server.js              # Express server (backend)
├── vite.config.ts         # Vite configuration
├── src/                   # Frontend React app
│   ├── components/        # React components
│   ├── lib/               # Utilities (auth, API client)
│   └── pages/             # Page components
├── api/                   # Backend API routes
│   ├── auth/             # Login, register, auth middleware
│   ├── dashboard/        # Dashboard data
│   ├── wallet/           # Payments, withdrawals
│   ├── investments/      # Investment operations
│   ├── packages/         # Investment packages
│   ├── referrals/        # Referral system
│   └── init/             # Database initialization
├── models/               # Mongoose models
│   ├── User.js
│   ├── Package.js
│   ├── Investment.js
│   ├── Transaction.js
│   └── Trade.js
└── lib/
    └── db.js             # MongoDB connection
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Session-based**: Users receive a JWT token upon login/register
- **Token storage**: Stored in `localStorage` as `si_token`
- **User data**: Stored in `localStorage` as `si_user`
- **Token expiration**: 7 days
- **Middleware**: All protected routes validate the Bearer token in the Authorization header

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user profile

#### Dashboard
- `GET /api/dashboard` - Full dashboard data (stats, investments, transactions)
- `GET /api/dashboard/portfolio` - Portfolio breakdown

#### Wallet
- `POST /api/wallet/fund` - Initialize deposit (Paystack)
- `GET /api/wallet/verify/:reference` - Verify payment
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Transaction history

#### Investments
- `GET /api/investments` - All investments
- `GET /api/investments/active` - Active investments
- `GET /api/investments/summary` - Investment statistics
- `POST /api/investments/invest` - Invest in a package

#### Packages
- `GET /api/packages` - List all investment packages

#### Referrals
- `GET /api/referrals` - Referral data and earnings

#### Utilities
- `GET /api/health` - Health check endpoint

## 💰 Payment Integration

The app uses **Paystack** for Nigerian Naira payments:

- **Deposits**: Users can fund their wallet via Paystack
- **Withdrawals**: Automatic transfer to Nigerian bank accounts
- **Minimum deposit**: ₦100
- **Minimum withdrawal**: ₦10,000

### Payment Flow

1. User clicks "Fund Wallet" → Frontend calls `POST /api/wallet/fund`
2. Backend initializes Paystack transaction with callback URL
3. User pays on Paystack's secure page
4. Paystack redirects back with reference
5. Frontend calls `GET /api/wallet/verify/:reference`
6. Backend verifies with Paystack, credits user balance, and records transaction

## 🎯 Key Features

- **Session-based authentication** with JWT tokens
- **Real-time dashboard** with investment tracking
- **30 investment packages** across 5 tiers (Starter, Basic, Standard, Advanced, Professional, Executive)
- **Referral system** with 5% commission
- **Automatic daily returns** credited to user balance
- **Transaction history** with detailed records
- **Responsive design** with mobile support
- **Secure password hashing** with bcrypt
- **Database caching** for optimal performance

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Recharts
- Axios

### Backend
- Express.js
- Mongoose (MongoDB ODM)
- JWT authentication
- Paystack API
- CORS enabled

### Development
- TypeScript
- Concurrently (for running both servers)
- Vite dev server with hot reload

## 🔧 Configuration

### Frontend Port
- Default: `5000`
- Configured in `vite.config.ts`

### Backend Port
- Default: `3001`
- Configurable via `PORT` environment variable

### API Proxy
In development, Vite proxies `/api` requests to `http://localhost:3001` automatically.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `PORT` | Backend server port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for callbacks | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack API secret | No |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | No |
| `CRON_SECRET` | Secret for cron jobs | No |
| `INIT_SECRET` | Secret for database init | Yes |

## 🚀 Deployment

### Vercel Deployment (Recommended for Frontend)

1. Build the frontend:
```bash
npm run build
```

2. Deploy `dist/` folder to Vercel

3. Update `FRONTEND_URL` in backend `.env` to your Vercel URL

### Backend Deployment Options

**Option 1: Railway/Render/Heroku**
- Deploy `server.js` as the entry point
- Set environment variables
- MongoDB URI must be accessible

**Option 2: VPS**
- Clone repository
- Install dependencies
- Set up PM2 or systemd
- Configure nginx reverse proxy (optional)

### Production Considerations

- Change `JWT_SECRET` to a strong random string
- Use MongoDB Atlas for production database
- Configure CORS for your production domain
- Set up SSL/TLS certificates
- Implement rate limiting
- Add error logging (Sentry, etc.)
- Backup database regularly

## 🧪 Testing the API

Test endpoints with cURL or Postman:

```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get dashboard (with token)
curl http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub.