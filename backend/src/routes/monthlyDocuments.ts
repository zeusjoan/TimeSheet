
import express, { Request, Response } from 'express';
// FIX: Corrected PrismaClient import to resolve module export errors.
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// GET /api/monthly-documents - Get all monthly documents
router.get('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    try {
        const documents = await prisma.monthlyDocument.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        
        // Convert Buffers to base64 strings for frontend
        const documentsWithBase64 = documents.map(doc => ({
            id: `${doc.year}-${doc.month.toString().padStart(2, '0')}`,
            year: doc.year,
            month: doc.month,
            pozPdf: doc.pozPdf ? `data:application/pdf;base64,${Buffer.from(doc.pozPdf).toString('base64')}` : undefined,
            invoicePdf: doc.invoicePdf ? `data:application/pdf;base64,${Buffer.from(doc.invoicePdf).toString('base64')}` : undefined,
        }));
        
        res.json(documentsWithBase64);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching monthly documents' });
    }
});

// POST /api/monthly-documents - Create or update a monthly document
router.post('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const { year, month, pozPdf, invoicePdf } = req.body;
    
    try {
        // Convert base64 to Buffer if provided
        const pozPdfBuffer = pozPdf ? Buffer.from(pozPdf.split(',')[1] || pozPdf, 'base64') : null;
        const invoicePdfBuffer = invoicePdf ? Buffer.from(invoicePdf.split(',')[1] || invoicePdf, 'base64') : null;
        
        const document = await prisma.monthlyDocument.upsert({
            where: { year_month: { year, month } },
            update: { 
                pozPdf: pozPdfBuffer, 
                invoicePdf: invoicePdfBuffer 
            },
            create: { 
                year, 
                month, 
                fileName: `${year}-${month.toString().padStart(2, '0')}`,
                pozPdf: pozPdfBuffer, 
                invoicePdf: invoicePdfBuffer 
            },
        });
        res.status(201).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving monthly document' });
    }
});

export default router;
