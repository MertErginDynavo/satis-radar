import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database.js';
import { seedData } from './seed.js';
import authRoutes from './routes/auth.js';
import companyRoutes from './routes/companies.js';
import offerRoutes from './routes/offers.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import reportRoutes from './routes/reports.js';
import directorRoutes from './routes/director.js';
import paymentRoutes from './routes/payment.js';
import { startScheduler } from './scheduler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Apply rate limiting to all routes
app.use('/api/', generalLimiter);

await initDatabase();
await seedData();

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard/director', directorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Otomatik e-posta hatırlatma sistemini başlat
  startScheduler();
});
