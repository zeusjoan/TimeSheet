
import express, { Request, Response } from 'express';
// FIX: Corrected PrismaClient import to resolve module export errors.
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// GET /api/settlements - Get all settlements
router.get('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    try {
        const settlements = await prisma.settlement.findMany({
            include: { items: true },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        res.json(settlements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching settlements' });
    }
});

// POST /api/settlements - Create a new settlement
router.post('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const { year, month, date, items } = req.body;

    try {
        // Calculate total amount from items
        const amount = items.reduce((sum: number, item: any) => sum + (item.hours * item.rate), 0);

        const newSettlement = await prisma.settlement.create({
            data: {
                year,
                month,
                amount,
                date: new Date(date),
                items: {
                    create: items.map((item: any) => ({
                        orderId: item.orderId,
                        itemType: item.itemType,
                        hours: item.hours,
                        rate: item.rate,
                    })),
                },
            },
            include: { items: true },
        });
        res.status(201).json(newSettlement);
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint failed
            res.status(409).json({ message: `Settlement for ${month}/${year} already exists.` });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Error creating settlement' });
        }
    }
});

// PUT /api/settlements/:id - Update a settlement
router.put('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    const { year, month, date, items } = req.body;

    try {
        // Calculate total amount from items
        const amount = items.reduce((sum: number, item: any) => sum + (item.hours * item.rate), 0);

        const updatedSettlement = await prisma.$transaction(async (tx) => {
            await tx.settlement.update({
                where: { id },
                data: { year, month, date: new Date(date), amount },
            });
            
            await tx.settlementItem.deleteMany({ where: { settlementId: id } });
            
            await tx.settlementItem.createMany({
                data: items.map((item: any) => ({
                    orderId: item.orderId,
                    itemType: item.itemType,
                    hours: item.hours,
                    rate: item.rate,
                    settlementId: id,
                })),
            });

            return await tx.settlement.findUnique({
                where: { id },
                include: { items: true }
            });
        });
        res.json(updatedSettlement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating settlement' });
    }
});

// DELETE /api/settlements/:id - Delete a settlement
router.delete('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    try {
        await prisma.settlement.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting settlement' });
    }
});


export default router;
