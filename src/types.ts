/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Category items
export interface Product {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface WarrantyCategory {
  id: string;
  name: string;
}

// Transaction items
export interface ImportBillItem {
  id: string;
  productName: string;
  serial: string;
  unit: string;
  quantity: number;
  importPrice: number;
  sellPrice: number;
  supplier: string;
  supplierPhone?: string;
  date: string;
}

export interface InvoiceItem {
  id: string;
  productName: string;
  serial: string;
  unit: string;
  quantity: number;
  sellPrice: number;
}

export interface Invoice {
  id: string;
  invoiceCode: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  isDebt?: boolean;
}

// Warranty Ticket
export interface WarrantyTicket {
  id: string;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  serial: string;
  quantity: number;
  errorDescription: string;
  receivedDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: 'PENDING' | 'RETURNED';
}

// Debt Book Record
export interface DebtRecord {
  id: string;
  debtorName: string;
  phone: string;
  sourceInvoiceId?: string; // Links to invoice if applicable
  productNameOrOrder: string;
  debtAmount: number;
  debtDate: string;
  dueDate: string;
  paidAmount: number;
  status: 'PENDING' | 'RESOLVED';
  notificationOption?: boolean;
}

// Contact for Phonebook simulation
export interface PhoneContact {
  name: string;
  phone: string;
  address?: string;
}
