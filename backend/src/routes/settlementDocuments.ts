import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// GET /api/settlement-documents/:settlementId - Get all documents for a settlement
router.get('/:settlementId', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const settlementId = parseInt(req.params.settlementId);
    
    try {
        const documents = await prisma.settlementDocument.findMany({
            where: { settlementId },
            orderBy: { orderId: 'asc' }
        });
        
        // Convert Buffers to base64 strings for frontend
        const documentsWithBase64 = documents.map(doc => ({
            id: doc.id,
            settlementId: doc.settlementId,
            orderId: doc.orderId,
            pozPdf: doc.pozPdf ? `data:application/pdf;base64,${Buffer.from(doc.pozPdf).toString('base64')}` : undefined,
            invoicePdf: doc.invoicePdf ? `data:application/pdf;base64,${Buffer.from(doc.invoicePdf).toString('base64')}` : undefined,
        }));
        
        res.json(documentsWithBase64);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching settlement documents' });
    }
});

// POST /api/settlement-documents - Create or update a settlement document
router.post('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const { settlementId, orderId, pozPdf, invoicePdf } = req.body;
    
    try {
        // Convert base64 to Buffer if provided
        const pozPdfBuffer = pozPdf ? Buffer.from(pozPdf.split(',')[1] || pozPdf, 'base64') : null;
        const invoicePdfBuffer = invoicePdf ? Buffer.from(invoicePdf.split(',')[1] || invoicePdf, 'base64') : null;
        
        const document = await prisma.settlementDocument.upsert({
            where: { 
                settlementId_orderId: { 
                    settlementId: parseInt(settlementId), 
                    orderId: parseInt(orderId) 
                } 
            },
            update: { 
                pozPdf: pozPdfBuffer, 
                invoicePdf: invoicePdfBuffer 
            },
            create: { 
                settlementId: parseInt(settlementId),
                orderId: parseInt(orderId),
                pozPdf: pozPdfBuffer, 
                invoicePdf: invoicePdfBuffer 
            },
        });
        
        res.status(201).json({
            id: document.id,
            settlementId: document.settlementId,
            orderId: document.orderId,
            pozPdf: document.pozPdf ? `data:application/pdf;base64,${Buffer.from(document.pozPdf).toString('base64')}` : undefined,
            invoicePdf: document.invoicePdf ? `data:application/pdf;base64,${Buffer.from(document.invoicePdf).toString('base64')}` : undefined,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving settlement document' });
    }
});

// DELETE /api/settlement-documents/:id - Delete a settlement document
router.delete('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    
    try {
        await prisma.settlementDocument.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting settlement document' });
    }
});

export default router;
