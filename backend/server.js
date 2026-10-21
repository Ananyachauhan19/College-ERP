require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedData } = require('./seed');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const academicRoutes = require('./routes/academicRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const feeRoutes = require('./routes/feeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'EduCore College ERP System',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// Global Error Handler
app.use(errorHandler);

// Connect DB and Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedData();

    app.listen(PORT, () => {
      console.log(`[Server] EduCore ERP Backend running on http://localhost:${PORT}`);
      console.log(`[Server] API Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server Startup Error]', err);
    process.exit(1);
  }
};

startServer();
