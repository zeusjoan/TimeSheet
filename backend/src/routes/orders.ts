
import express, { Request, Response } from 'express';
// FIX: Corrected PrismaClient and OrderStatus imports to resolve module export errors.
import { PrismaClient, OrderStatus } from '@prisma/client';

const router = express.Router();

// GET /api/orders - Get all orders
router.get('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    try {
        const orders = await prisma.order.findMany({
            include: { items: true, attachments: true },
            orderBy: { documentDate: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// POST /api/orders - Create a new order
router.post('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const { clientId, contactId, items, attachments, documentDate, deliveryDate, ...rest } = req.body;
    
    try {
        const attachmentsData = attachments?.map(({ id, ...rest }: { id: string }) => rest) || [];
        const contactIdInt = contactId ? parseInt(contactId) : null;

        const newOrder = await prisma.order.create({
            data: {
                ...rest,
                documentDate: new Date(documentDate),
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                clientId: parseInt(clientId),
                contactId: contactIdInt,
                items: { create: items },
                attachments: { create: attachmentsData },
            },
            include: { items: true, attachments: true },
        });
        res.status(201).json(newOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// PUT /api/orders/:id - Update an order
router.put('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    const { 
        clientId, contactId, items, attachments, documentDate, deliveryDate,
        orderNumber, supplierNumber, contractNumber, description, status 
    } = req.body;

    try {
        const updatedOrder = await prisma.$transaction(async (tx) => {
            const contactIdInt = (contactId && !isNaN(parseInt(contactId))) ? parseInt(contactId) : null;

            // Update main order fields
            await tx.order.update({
                where: { id },
                data: {
                    orderNumber,
                    supplierNumber,
                    contractNumber,
                    description,
                    status,
                    documentDate: new Date(documentDate),
                    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                    clientId: parseInt(clientId),
                    contactId: contactIdInt,
                } as any,
            });

            // Handle items: delete all and recreate
            await tx.orderItem.deleteMany({ where: { orderId: id } });
            await tx.orderItem.createMany({
                data: items.map((item: any) => ({ ...item, orderId: id }))
            });

            // Handle attachments
            await tx.attachment.deleteMany({ where: { orderId: id }});
            if (attachments && attachments.length > 0) {
                 await tx.attachment.createMany({
                    data: attachments.map((att: any) => ({
                        fileName: att.fileName,
                        fileContent: att.fileContent,
                        orderId: id,
                    }))
                });
            }

            return await tx.order.findUnique({
                where: { id },
                include: { items: true, attachments: true },
            });
        });
        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating order' });
    }
});

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    try {
        await prisma.order.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});

export default router;
