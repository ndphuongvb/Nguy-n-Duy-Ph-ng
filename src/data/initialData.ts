/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Unit, Customer, WarrantyCategory, ImportBillItem, Invoice, WarrantyTicket, DebtRecord } from '../types';

export const initialProducts: Product[] = [
  { id: 'p1', name: 'Mainboard ASUS ROG Strix B760-A' },
  { id: 'p2', name: 'CPU Intel Core i5-13400F' },
  { id: 'p3', name: 'RAM Corsair Vengeance LPX 16GB (2x8GB) 3200MHz' },
  { id: 'p4', name: 'SSD Samsung 980 Pro 1TB PCIe NVMe' },
  { id: 'p5', name: 'VGA MSI GeForce RTX 4060 Ventus 2X Black' },
  { id: 'p6', name: 'Nguồn Antec Zen Neo 650W 80 Plus Gold' },
  { id: 'p7', name: 'Màn hình Dell UltraSharp U2422H 24" IPS' },
];

export const initialUnits: Unit[] = [
  { id: 'u1', name: 'Chiếc' },
  { id: 'u2', name: 'Bộ' },
  { id: 'u3', name: 'Hộp' },
  { id: 'u4', name: 'Thùng' },
];

export const initialCustomers: Customer[] = [
  { id: 'c1', name: 'Nguyễn Văn Hùng', address: '12 Lê Lợi, TP. Việt Trì, Phú Thọ', phone: '0912.345.678' },
  { id: 'c2', name: 'Trần Thị Mai', address: 'Khu 3, Trạm Thản, Phù Ninh, Phú Thọ', phone: '0988.776.655' },
  { id: 'c3', name: 'Lê Hoàng Long', address: 'Phố Gò Tháp, Lâm Thao, Phú Thọ', phone: '0905.112.233' },
  { id: 'c4', name: 'Đỗ Quốc Bảo', address: 'Khu Gò vầu, Tam Sơn, Phú Thọ', phone: '0919.123.456' },
];

export const initialWarrantyReasons: WarrantyCategory[] = [
  { id: 'w1', name: 'Lỗi không lên nguồn' },
  { id: 'w2', name: 'Lỗi sọc màn hình, nhấp nháy' },
  { id: 'w3', name: 'Lỗi không nhận driver, crash màn hình xanh' },
  { id: 'w4', name: 'Tốc độ đọc ghi chậm chập chờn' },
  { id: 'w5', name: 'Quạt kêu to, lỗi quá nhiệt tự tắt' },
];

export const initialImports: ImportBillItem[] = [
  {
    id: 'imp1',
    productName: 'Mainboard ASUS ROG Strix B760-A',
    serial: 'SN-AS-760B-998',
    unit: 'Chiếc',
    quantity: 10,
    importPrice: 3800000,
    sellPrice: 4350000,
    supplier: 'Công ty Máy tính SPC',
    supplierPhone: '024.37323888',
    date: '2026-05-15',
  },
  {
    id: 'imp2',
    productName: 'CPU Intel Core i5-13400F',
    serial: 'SN-INT-1340-001',
    unit: 'Chiếc',
    quantity: 12,
    importPrice: 4200000,
    sellPrice: 4850000,
    supplier: 'Nhà phân phối Viết Sơn',
    supplierPhone: '028.38332123',
    date: '2026-05-15',
  },
  {
    id: 'imp3',
    productName: 'RAM Corsair Vengeance LPX 16GB (2x8GB) 3200MHz',
    serial: 'SN-COR-RAM-3200',
    unit: 'Hộp',
    quantity: 20,
    importPrice: 950000,
    sellPrice: 1250000,
    supplier: 'Công ty Kỷ Nguyên Mới',
    supplierPhone: '091.566.7779',
    date: '2026-05-16',
  },
  {
    id: 'imp4',
    productName: 'SSD Samsung 980 Pro 1TB PCIe NVMe',
    serial: 'SN-SAM-980P-1TB',
    unit: 'Hộp',
    quantity: 15,
    importPrice: 2100000,
    sellPrice: 2650000,
    supplier: 'Công ty Máy tính SPC',
    supplierPhone: '024.37323888',
    date: '2026-05-16',
  },
  {
    id: 'imp5',
    productName: 'VGA MSI GeForce RTX 4060 Ventus 2X Black',
    serial: 'SN-MSI-4060-002',
    unit: 'Chiếc',
    quantity: 8,
    importPrice: 7200000,
    sellPrice: 8300000,
    supplier: 'Nhà phân phối Mai Hoàng',
    supplierPhone: '024.39747270',
    date: '2026-05-18',
  },
  {
    id: 'imp6',
    productName: 'Màn hình Dell UltraSharp U2422H 24" IPS',
    serial: 'SN-DEL-U242-45A',
    unit: 'Chiếc',
    quantity: 5,
    importPrice: 5100000,
    sellPrice: 5950000,
    supplier: 'Tổng kho Dell Việt Nam',
    supplierPhone: '1800.545.455',
    date: '2026-05-20',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceCode: 'HD-20260520-001',
    buyerName: 'Nguyễn Văn Hùng',
    buyerAddress: '12 Lê Lợi, TP. Việt Trì, Phú Thọ',
    buyerPhone: '0912.345.678',
    date: '2026-05-20',
    items: [
      {
        id: 'ivi1',
        productName: 'CPU Intel Core i5-13400F',
        serial: 'SN-INT-1340-001',
        unit: 'Chiếc',
        quantity: 1,
        sellPrice: 4850000,
      },
      {
        id: 'ivi2',
        productName: 'RAM Corsair Vengeance LPX 16GB (2x8GB) 3200MHz',
        serial: 'SN-COR-RAM-3200',
        unit: 'Hộp',
        quantity: 2,
        sellPrice: 1250000,
      },
    ],
    totalAmount: 7350000,
    isDebt: false,
  },
  {
    id: 'inv2',
    invoiceCode: 'HD-20260522-002',
    buyerName: 'Trần Thị Mai',
    buyerAddress: 'Khu 3, Trạm Thản, Phù Ninh, Phú Thọ',
    buyerPhone: '0988.776.655',
    date: '2026-05-22',
    items: [
      {
        id: 'ivi3',
        productName: 'Màn hình Dell UltraSharp U2422H 24" IPS',
        serial: 'SN-DEL-U242-45A',
        unit: 'Chiếc',
        quantity: 1,
        sellPrice: 5950000,
      },
    ],
    totalAmount: 5950000,
    isDebt: true,
  },
];

export const initialWarrantyTickets: WarrantyTicket[] = [
  {
    id: 'wrt1',
    ticketCode: 'BH-20260522-001',
    customerName: 'Nguyễn Văn Hùng',
    customerPhone: '0912.345.678',
    productName: 'CPU Intel Core i5-13400F',
    serial: 'SN-INT-1340-001',
    quantity: 1,
    errorDescription: 'Lỗi không lên nguồn',
    receivedDate: '2026-05-22',
    dueDate: '2026-05-29',
    returnDate: null,
    status: 'PENDING',
  },
];

export const initialDebts: DebtRecord[] = [
  {
    id: 'deb1',
    debtorName: 'Trần Thị Mai',
    phone: '0988.776.655',
    sourceInvoiceId: 'inv2',
    productNameOrOrder: 'Đơn hàng HD-20260522-002 / Dell U2422H',
    debtAmount: 5950000,
    debtDate: '2026-05-22',
    dueDate: '2026-06-22',
    paidAmount: 2000000,
    status: 'PENDING',
    notificationOption: true,
  },
];
