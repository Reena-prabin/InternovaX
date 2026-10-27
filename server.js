import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db.js';

// Route imports
import authRoutes from './server/routes/authRoutes.js';
import internshipRoutes from './server/routes/internshipRoutes.js';
import applicationRoutes from './server/routes/applicationRoutes.js';
import reportRoutes from './server/routes/reportRoutes.js';
import mentorRoutes from './server/routes/mentorRoutes.js';
import evaluationRoutes from './server/routes/evaluationRoutes.js';
import certificateRoutes from './server/routes/certificateRoutes.js';
import messageRoutes from './server/routes/messageRoutes.js';
import notificationRoutes from './server/routes/notificationRoutes.js';
import userRoutes from './server/routes/userRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --------------------------------------------------
// PORT CONFIGURATION
// --------------------------------------------------

let parsedPort = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

// Allow --port 3000 or --port=3000
for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i];

  if (arg.startsWith('--port=')) {
    parsedPort = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--port' && process.argv[i + 1]) {
    parsedPort = parseInt(process.argv[i + 1], 10);
  }
}

const PORT = parsedPort || 3000;

const isProduction =
  process.env.NODE_ENV === 'production';

// --------------------------------------------------
// CONNECT TO MONGODB
// --------------------------------------------------

try {
  await connectDB();
} catch (error) {
  console.error('');
  console.error('❌ MongoDB connection failed.');
  console.error('❌ Server will not start.');
  console.error('');

  process.exit(1);
}

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

// --------------------------------------------------
// REST API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/internships', internshipRoutes);

app.use('/api/applications', applicationRoutes);

app.use('/api/reports', reportRoutes);

app.use('/api/mentors', mentorRoutes);

app.use('/api/evaluations', evaluationRoutes);

app.use('/api/certificates', certificateRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/users', userRoutes);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'InternovaX MERN Engine',
    version: '1.0.0',
    database: 'MongoDB Atlas'
  });
});

// --------------------------------------------------
// VITE DEVELOPMENT SERVER
// --------------------------------------------------

if (!isProduction) {
  const { createServer: createViteServer } =
    await import('vite');

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true'
    },
    appType: 'spa'
  });

  app.use(vite.middlewares);
}

// --------------------------------------------------
// PRODUCTION STATIC FILES
// --------------------------------------------------

else {
  const distPath = path.resolve(__dirname, 'dist');

  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(distPath, 'index.html')
    );
  });
}

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log(
    '🚀 InternovaX MERN Platform is running!'
  );
  console.log(
    `🌐 Local: http://localhost:${PORT}`
  );
});