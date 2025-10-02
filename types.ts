
export enum OrderItemType {
  CONSULTATIONS = 'Konsultacje telefoniczne',
  OPEX = 'Prace podstawowe OPEX',
  CAPEX = 'Prace podstawowe CAPEX',
}

export enum OrderStatus {
  ACTIVE = 'aktywne',
  INACTIVE = 'nieaktywne',
  ARCHIVED = 'archiwalne',
}

export interface OrderItem {
  type: OrderItemType;
  hours: number;
  rate: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileContent: string; // base64 data URI
}

export interface Order {
  id: number;
  clientId: number;
  contactId?: number;
  orderNumber: string;
  supplierNumber: string;
  description: string;
  documentDate: string;
  deliveryDate: string;
  contractNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  attachments?: Attachment[];
  contact?: Contact;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  nip: string;
  phone: string;
  contacts: Contact[];
}

export interface SettlementItem {
  id: string;
  orderId: number;
  itemType: OrderItemType;
  hours: number;
  rate: number;
}

export interface SettlementDocument {
  id: number;
  settlementId: number;
  orderId: number;
  pozPdf?: string; // base64
  invoicePdf?: string; // base64
}

export interface Settlement {
  id: number;
  month: number; // 1-12
  year: number;
  date: string;
  amount: number;
  items: SettlementItem[];
  documents?: SettlementDocument[];
}

export interface MonthlyDocument {
  id: string; // year-month, e.g., "2024-07"
  year: number;
  month: number;
  pozPdf?: string; // base64 encoded
  invoicePdf?: string; // base64 encoded
}

export type Page = 'dashboard' | 'clients' | 'orders' | 'settlements';
