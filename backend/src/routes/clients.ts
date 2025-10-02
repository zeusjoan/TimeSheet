
import express, { Request, Response } from 'express';
// FIX: Corrected PrismaClient import to resolve module export errors.
import { PrismaClient } from '@prisma/client';

const router = express.Router();

// GET /api/clients - Get all clients
router.get('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    try {
        const clients = await prisma.client.findMany({
            include: { contacts: true },
            orderBy: { name: 'asc' }
        });
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching clients' });
    }
});

// POST /api/clients - Create a new client
router.post('/', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const { name, email, nip, phone, contacts } = req.body;
    try {
        const newClient = await prisma.client.create({
            data: {
                name,
                email,
                nip,
                phone,
                contacts: {
                    create: contacts,
                },
            },
            include: { contacts: true }
        });
        res.status(201).json(newClient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating client' });
    }
});

// PUT /api/clients/:id - Update a client
router.put('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    const { name, nip, phone, contacts } = req.body;
    
    try {
        // Prisma transaction to update client and its contacts
        const updatedClient = await prisma.$transaction(async (tx) => {
            // 1. Update client's main fields
            const clientUpdate = await tx.client.update({
                where: { id },
                data: { name, nip, phone },
            });

            // 2. Handle contacts: update existing, create new, delete missing
            const existingContacts = await tx.contact.findMany({ where: { clientId: id } });
            const existingContactIds = existingContacts.map(c => c.id);
            const incomingContactIds = contacts.map((c: any) => c.id).filter(Boolean);

            const contactsToCreate = contacts.filter((c: any) => !c.id);
            const contactsToUpdate = contacts.filter((c: any) => c.id && existingContactIds.includes(c.id));
            const contactIdsToDelete = existingContactIds.filter(cid => !incomingContactIds.includes(cid));

            if(contactIdsToDelete.length > 0) {
                await tx.contact.deleteMany({
                    where: { id: { in: contactIdsToDelete } }
                });
            }

            if(contactsToCreate.length > 0) {
                await tx.contact.createMany({
                    data: contactsToCreate.map((c: any) => ({ ...c, clientId: id })),
                });
            }

            for (const contact of contactsToUpdate) {
                await tx.contact.update({
                    where: { id: contact.id },
                    data: { name: contact.name, email: contact.email },
                });
            }
            
            return await tx.client.findUnique({
                where: { id },
                include: { contacts: true },
            });
        });

        res.json(updatedClient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating client' });
    }
});

// DELETE /api/clients/:id - Delete a client
router.delete('/:id', async (req: Request, res: Response) => {
    const prisma = (req as any).prisma as PrismaClient;
    const id = parseInt(req.params.id);
    try {
        await prisma.client.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting client' });
    }
});

export default router;
