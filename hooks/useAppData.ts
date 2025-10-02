
import { useState, useEffect, useCallback } from 'react';
import type { Client, Order, Settlement, MonthlyDocument, SettlementDocument } from '../types';

const API_BASE_URL = '/api';

interface AppData {
  clients: Client[];
  orders: Order[];
  settlements: Settlement[];
  monthlyDocuments: MonthlyDocument[];
  settlementDocuments: SettlementDocument[];
}

export function useAppData() {
  const [data, setData] = useState<AppData>({
    clients: [],
    orders: [],
    settlements: [],
    monthlyDocuments: [],
    settlementDocuments: [],
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsInitialized(false);
    setError(null);
    try {
      const [clientsRes, ordersRes, settlementsRes, monthlyDocumentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clients`),
        fetch(`${API_BASE_URL}/orders`),
        fetch(`${API_BASE_URL}/settlements`),
        fetch(`${API_BASE_URL}/monthly-documents`),
      ]);

      if (!clientsRes.ok || !ordersRes.ok || !settlementsRes.ok || !monthlyDocumentsRes.ok) {
        throw new Error('Network response was not ok');
      }

      const clients = await clientsRes.json();
      const orders = await ordersRes.json();
      const settlements = await settlementsRes.json();
      const monthlyDocuments = await monthlyDocumentsRes.json();

      // Fetch settlement documents for all settlements
      const settlementDocuments: SettlementDocument[] = [];
      for (const settlement of settlements) {
        try {
          const docsRes = await fetch(`${API_BASE_URL}/settlement-documents/${settlement.id}`);
          if (docsRes.ok) {
            const docs = await docsRes.json();
            settlementDocuments.push(...docs);
          }
        } catch (err) {
          console.error(`Error fetching documents for settlement ${settlement.id}:`, err);
        }
      }

      setData({ clients, orders, settlements, monthlyDocuments, settlementDocuments });
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequest = async <T,>(url: string, method: string, body?: any): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return {} as T;
    }
  };
  
  // CLIENTS
  const addClient = async (client: Omit<Client, 'id'>) => {
    await handleRequest(`${API_BASE_URL}/clients`, 'POST', client);
    fetchData();
  };
  
  const updateClient = async (updatedClient: Client) => {
    await handleRequest(`${API_BASE_URL}/clients/${updatedClient.id}`, 'PUT', updatedClient);
    fetchData();
  };

  const deleteClient = async (clientId: number) => {
    await handleRequest(`${API_BASE_URL}/clients/${clientId}`, 'DELETE');
    setData(prevData => ({
      ...prevData,
      clients: prevData.clients.filter(client => client.id !== clientId),
    }));
  };

  // ORDERS
  const addOrder = async (order: Omit<Order, 'id'>) => {
    await handleRequest(`${API_BASE_URL}/orders`, 'POST', order);
    fetchData();
  };
  
  const updateOrder = async (updatedOrder: Order) => {
    await handleRequest(`${API_BASE_URL}/orders/${updatedOrder.id}`, 'PUT', updatedOrder);
    fetchData();
  };
  
  const deleteOrder = async (orderId: number) => {
    await handleRequest(`${API_BASE_URL}/orders/${orderId}`, 'DELETE');
    fetchData();
  };

  // SETTLEMENTS
  const addSettlement = async (settlement: Omit<Settlement, 'id'>) => {
     await handleRequest(`${API_BASE_URL}/settlements`, 'POST', settlement);
     fetchData();
  };
  
  const updateSettlement = async (updatedSettlement: Settlement) => {
    await handleRequest(`${API_BASE_URL}/settlements/${updatedSettlement.id}`, 'PUT', updatedSettlement);
    fetchData();
  };

  const deleteSettlement = async (settlementId: number) => {
    await handleRequest(`${API_BASE_URL}/settlements/${settlementId}`, 'DELETE');
    fetchData();
  };

  // SETTLEMENT DOCUMENTS
  const addOrUpdateSettlementDocument = async (doc: Omit<SettlementDocument, 'id'>) => {
    await handleRequest(`${API_BASE_URL}/settlement-documents`, 'POST', doc);
    fetchData();
  };

  const deleteSettlementDocument = async (documentId: number) => {
    await handleRequest(`${API_BASE_URL}/settlement-documents/${documentId}`, 'DELETE');
    fetchData();
  };

  // MONTHLY DOCUMENTS
  const addOrUpdateMonthlyDocument = async (doc: MonthlyDocument) => {
    await handleRequest(`${API_BASE_URL}/monthly-documents`, 'POST', doc);
    fetchData();
  };

  const replaceData = () => {
    console.warn("replaceData is deprecated and should not be used with a backend.");
    return false;
  };

  return {
    clients: data.clients,
    orders: data.orders,
    settlements: data.settlements,
    monthlyDocuments: data.monthlyDocuments,
    settlementDocuments: data.settlementDocuments,
    addClient,
    updateClient,
    deleteClient,
    addOrder,
    updateOrder,
    deleteOrder,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    addOrUpdateSettlementDocument,
    deleteSettlementDocument,
    addOrUpdateMonthlyDocument,
    replaceData,
    isInitialized,
    error,
    refetch: fetchData,
  };
}
