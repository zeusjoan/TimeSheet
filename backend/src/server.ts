
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
// FIX: Corrected PrismaClient import to resolve module export errors.
import { PrismaClient } from '@prisma/client';
import clientRoutes from './routes/clients';
import orderRoutes from './routes/orders';
import settlementRoutes from './routes/settlements';
import settlementDocumentRoutes from './routes/settlementDocuments';
import monthlyDocumentRoutes from './routes/monthlyDocuments';
import nipRoutes from './routes/nip';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 files

// Middleware to inject prisma client
// FIX: Explicitly added types for req, res, and next to resolve middleware signature errors.
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).prisma = prisma;
    next();
});

// API Routes
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/settlement-documents', settlementDocumentRoutes);
app.use('/api/monthly-documents', monthlyDocumentRoutes);
app.use('/api/company-data', nipRoutes);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
