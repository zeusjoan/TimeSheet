import request from 'supertest';
import app from '../server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Orders API', () => {
  let testClient: any;

  beforeAll(async () => {
    // Create a test client to associate orders with
    testClient = await prisma.client.create({
      data: {
        name: 'Test Client for Orders',
        email: `test-client-orders-${Date.now()}@example.com`,
        nip: `1234567890-${Date.now()}`,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testClient) {
      // Delete orders associated with the test client first
      await prisma.order.deleteMany({ where: { clientId: testClient.id } });
      // Then delete the client
      await prisma.client.delete({ where: { id: testClient.id } });
    }
    await prisma.$disconnect();
  });

  let createdOrder: any;

  it('should create a new order successfully', async () => {
    const newOrderData = {
      clientId: testClient.id,
      orderNumber: 'TEST-ORDER-123',
      description: 'Test order description',
      documentDate: new Date().toISOString(),
      items: [
        {
          type: 'Konsultacje telefoniczne',
          hours: 10,
          rate: 100,
        },
      ],
      status: 'aktywne',
    };

    const response = await request(app)
      .post('/api/orders')
      .send(newOrderData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.orderNumber).toBe(newOrderData.orderNumber);
    expect(response.body.clientId).toBe(testClient.id);

    createdOrder = response.body; // Save for other tests
  });

  it('should get all orders', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((order: any) => order.id === createdOrder.id)).toBe(true);
  });

  it('should update an existing order', async () => {
    // Simulate a realistic payload from the frontend, without nested objects
    const updatedPayload = {
      clientId: createdOrder.clientId,
      orderNumber: createdOrder.orderNumber,
      description: 'Updated test order description',
      status: 'nieaktywne',
      documentDate: createdOrder.documentDate,
      deliveryDate: createdOrder.deliveryDate,
      contractNumber: createdOrder.contractNumber,
      items: createdOrder.items,
      attachments: createdOrder.attachments,
    };

    const response = await request(app)
      .put(`/api/orders/${createdOrder.id}`)
      .send(updatedPayload);

    expect(response.status).toBe(200);
    expect(response.body.description).toBe(updatedPayload.description);
    expect(response.body.status).toBe(updatedPayload.status);
  });

  it('should delete an order', async () => {
    const response = await request(app).delete(`/api/orders/${createdOrder.id}`);
    expect(response.status).toBe(204);

    // Verify it's gone
    const getResponse = await request(app).get('/api/orders');
    expect(getResponse.body.some((order: any) => order.id === createdOrder.id)).toBe(false);
  });
});
