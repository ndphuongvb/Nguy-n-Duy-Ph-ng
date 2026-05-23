/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Product, Unit, Customer, ImportBillItem, Invoice, InvoiceItem } from '../../types';
import { CurrencyInput } from '../CurrencyInput';
import { formatNumberDots, formatVND, exportToCSV, exportToWord } from '../../utils';
import { ChevronDown, Plus, Trash2, Printer, Save, FileText, FileSpreadsheet, Contact, Users, Receipt, AlertCircle, Sparkles, Inbox } from 'lucide-react';

interface BanHangTabProps {
  products: Product[];
  units: Unit[];
  customers: Customer[];
  imports: ImportBillItem[];
  invoices: Invoice[];
  setInvoices: Dispatch<SetStateAction<Invoice[]>>;
  onOpenPhonebook: (callback: (contact: { name: string; phone: string; address?: string }) => void) => void;
  plusTriggered: boolean;
  onResetPlus: () => void;
  onTriggerDebtRecord: (debtor: string, phone: string, amount: number, orderDetails: string, sourceId: string) => void;
}

export default function BanHangTab({
  products,
  units,
  customers,
  imports,
  invoices,
  setInvoices,
  onOpenPhonebook,
  plusTriggered,
  onResetPlus,
  onTriggerDebtRecord
}: BanHangTabProps) {
  // Static Seller Details
  const sellerInfo = {
    unit: 'MÁY TÍNH NGUYỄN PHƯƠNG',
    address: 'Khu Gò vầu - Tam Sơn - Phú Thọ',
    phone: '0985.333.9881'
  };

  // Buyer Info State
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // Cart/Form Invoice items state
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([
    { id: 'cart_1', productName: '', serial: '', unit: '', quantity: 1, sellPrice: 0 }
  ]);

  // Is debt toggle
  const [isDebtInvoice, setIsDebtInvoice] = useState(false);

  // Selected Invoice for printing popup print preview
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (plusTriggered) {
      // Add row to current cart
      handleAddCartRow();
      onResetPlus();
    }
  }, [plusTriggered]);

  const handleAddCartRow = () => {
    setCartItems(prev => [
      ...prev,
      { id: `cart_${Date.now()}`, productName: '', serial: '', unit: '', quantity: 1, sellPrice: 0 }
    ]);
  };

  const handleRemoveCartRow = (id: string) => {
    if (cartItems.length === 1) {
      setCartItems([{ id: 'cart_1', productName: '', serial: '', unit: '', quantity: 1, sellPrice: 0 }]);
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCartRowUpdate = (id: string, fields: Partial<InvoiceItem>) => {
    setCartItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      // Start building updated item
      const updated = { ...item, ...fields };

      // Smart Price and Unit autofill from imports stock history!
      if (fields.productName) {
        const stockMatch = imports.find(imp => imp.productName === fields.productName);
        if (stockMatch) {
          updated.sellPrice = stockMatch.sellPrice;
          updated.unit = stockMatch.unit;
          // Autofill first available serial if possible
          const matchedSerials = imports.filter(imp => imp.productName === fields.productName);
          if (matchedSerials.length > 0) {
            updated.serial = matchedSerials[0].serial;
          }
        } else {
          updated.sellPrice = 0;
          updated.unit = units[0]?.name || '';
        }
      }

      return updated;
    }));
  };

  // Import directly from Phone Book Contacts
  const handleImportBuyerPhone = () => {
    onOpenPhonebook((contact) => {
      setBuyerName(contact.name);
      setBuyerPhone(contact.phone);
      if (contact.address) {
        setBuyerAddress(contact.address);
      }
    });
  };

  // Import directly from Category Customers List
  const handleImportCustomerCategory = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      setBuyerName(cust.name);
      setBuyerPhone(cust.phone);
      setBuyerAddress(cust.address);
    }
  };

  // Total Payment Calculator
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0);

  // Validate and Save Invoice
  const handleSaveInvoice = () => {
    const validItems = cartItems.filter(item => item.productName && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Vui lòng thêm sản phẩm hợp lệ trước khi lưu hóa đơn!');
      return;
    }

    const uniqueCode = `HD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceCode: uniqueCode,
      buyerName: buyerName.trim() || 'Khách vãng lai',
      buyerAddress: buyerAddress.trim() || 'Không rõ',
      buyerPhone: buyerPhone.trim() || 'Không có',
      date: new Date().toISOString().split('T')[0],
      items: validItems,
      totalAmount: totalAmount,
      isDebt: isDebtInvoice
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Handle automated debt recording if checked
    if (isDebtInvoice) {
      const orderSummary = validItems.map(i => `${i.productName} (SL: ${i.quantity})`).join(', ');
      onTriggerDebtRecord(
        newInvoice.buyerName,
        newInvoice.buyerPhone,
        newInvoice.totalAmount,
        `Nợ Hoá đơn ${newInvoice.invoiceCode}: ${orderSummary}`,
        newInvoice.id
      );
    }

    alert(`Đã lưu Hóa đơn thành công! Mã hóa đơn: ${uniqueCode}`);

    // Set Active Print Preview
    setActivePrintInvoice(newInvoice);

    // Reset selling form state
    setBuyerName('');
    setBuyerAddress('');
    setBuyerPhone('');
    setCartItems([{ id: 'cart_1', productName: '', serial: '', unit: '', quantity: 1, sellPrice: 0 }]);
    setIsDebtInvoice(false);
  };

  // Invoice Printers
  const handlePrintTrigger = (invoice: Invoice) => {
    setActivePrintInvoice(invoice);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleExportCSV = (invoice: Invoice) => {
    const headers = ['Ma Hoa Don', 'Khach Hang', 'Moi Lien He', 'Dia Chi', 'Ten San Pham', 'Serial', 'So Luong', 'Gia Ban (VND)', 'Thanh Tien', 'Ngay Xuat'];
    const rows = invoice.items.map(item => [
      invoice.invoiceCode,
      invoice.buyerName,
      invoice.buyerPhone,
      invoice.buyerAddress,
      item.productName,
      item.serial,
      item.quantity,
      item.sellPrice,
      item.sellPrice * item.quantity,
      invoice.date
    ]);
    exportToCSV(rows, `Invoice_${invoice.invoiceCode}`, headers);
  };

  const handleWordExport = (invoice: Invoice) => {
    exportToWord(invoice, sellerInfo);
  };

  return (
    <div className="space-y-6">
      
      {/* Sales invoicing layout card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-150/80 dark:border-zinc-800 rounded-2xl shadow-sm p-5 space-y-5">
        
        {/* TOP Seller / Buyer Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 dark:border-zinc-800 pb-5">
          
          {/* Seller Side (INFO PRESETS) */}
          <div className="bg-gray-50/75 dark:bg-zinc-950 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-zinc-900">
            <span className="inline-block px-2.5 py-0.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-400 text-[10px] font-bold rounded uppercase">
              Người bán hàng
            </span>
            <div className="space-y-1 mt-1">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100">{sellerInfo.unit}</h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">ĐC: {sellerInfo.address}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">SĐT: {sellerInfo.phone}</p>
            </div>
          </div>

          {/* Buyer Side (INPUTS WITH IMPORT BUTTONS) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="inline-block px-2.5 py-0.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-400 text-[10px] font-bold rounded uppercase">
                Người mua hàng
              </span>
              
              {/* Database and Directory imports */}
              <div className="flex gap-1.5">
                {/* Customers dropdown shortcut */}
                {customers.length > 0 && (
                  <div className="relative group">
                    <button className="flex items-center gap-1 p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-850 rounded text-[10px] font-semibold text-gray-650 dark:text-gray-300">
                      <Users className="w-3 h-3 text-indigo-650" />
                      <span>Chọn KH lẻ</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                    <div className="hidden group-hover:block absolute right-0 top-6 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl rounded-lg z-10 p-1 py-1.5 text-left max-h-40 overflow-y-auto">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleImportCustomerCategory(c.id)}
                          className="w-full text-left px-2 py-1 text-[10px] rounded hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-350 truncate block"
                        >
                          {c.name} ({c.phone})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleImportBuyerPhone}
                  className="flex items-center gap-1 p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-150 dark:border-zinc-850 rounded text-[10px] font-semibold text-indigo-650 dark:text-cyan-400"
                >
                  <Contact className="w-3 h-3 text-indigo-650 dark:text-cyan-400" />
                  <span>Danh bạ</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Tên người mua hàng"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Điện thoại"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Địa chỉ giao hàng"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5 Column interactive dynamic billing table */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Danh sách sản phẩm mua hàng (5 Cột)
            </span>
            <button
              onClick={handleAddCartRow}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-400 hover:bg-indigo-100 hover:dark:bg-zinc-750 transition-all rounded-lg text-[11px] font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm hàng hóa</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-150/70 dark:border-zinc-850 rounded-xl bg-gray-50/50 dark:bg-zinc-950/20">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-950 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-150/70 dark:border-zinc-850">
                  <th className="p-3 w-5/12">1. Tên hàng hóa</th>
                  <th className="p-3 w-2/12">2. Serial</th>
                  <th className="p-3 w-1/12 text-center">3. ĐVT</th>
                  <th className="p-3 w-1/12 text-center">4. SL</th>
                  <th className="p-3 w-3/12 text-right">5. Giá bán</th>
                  <th className="p-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/70 dark:divide-zinc-850/80">
                {cartItems.map((item, index) => {
                  // Filter out serial numbers available for selected Product
                  const availableSerials = imports.filter(imp => imp.productName === item.productName);

                  return (
                    <tr key={item.id} className="align-middle">
                      {/* Product Selector */}
                      <td className="p-2">
                        {products.length > 0 ? (
                          <select
                            value={item.productName}
                            onChange={(e) => handleCartRowUpdate(item.id, { productName: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200"
                          >
                            <option value="">-- Chọn mặt hàng --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-red-400 font-semibold p-1">Lập danh mục sản phẩm trước!</span>
                        )}
                      </td>

                      {/* Serial selection/auto entry */}
                      <td className="p-2">
                        {availableSerials.length > 0 ? (
                          <select
                            value={item.serial}
                            onChange={(e) => handleCartRowUpdate(item.id, { serial: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 font-mono"
                          >
                            <option value="">Chọn SN</option>
                            {availableSerials.map((s, idx) => (
                              <option key={idx} value={s.serial}>{s.serial}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="Nhập SN thủ công"
                            value={item.serial}
                            onChange={(e) => handleCartRowUpdate(item.id, { serial: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 font-mono"
                          />
                        )}
                      </td>

                      {/* Measure unit */}
                      <td className="p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {item.unit || item.productName ? (item.unit || 'Chiếc') : '-'}
                      </td>

                      {/* Quantity input */}
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleCartRowUpdate(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-full p-1 text-center text-xs font-bold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                      </td>

                      {/* Sell Price (Auto-filled but customizable) */}
                      <td className="p-2">
                        <CurrencyInput
                          value={item.sellPrice}
                          onChange={(val) => handleCartRowUpdate(item.id, { sellPrice: val })}
                          className="px-2 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        />
                        {/* Auto fill notice */}
                        {item.productName && (
                          <span className="block text-[8px] text-right text-gray-450 dark:text-cyan-500 font-mono mt-0.5">
                            {imports.some(imp => imp.productName === item.productName) ? '✓ Đã đồng bộ giá' : 'Nhập tay giá'}
                          </span>
                        )}
                      </td>

                      {/* Remove row button */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveCartRow(item.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Checkout Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-3 gap-3 border-t border-gray-100 dark:border-zinc-800">
          
          {/* Debt toggle option linking */}
          <div className="flex items-center gap-2">
            <input
              id="debtCheck"
              type="checkbox"
              checked={isDebtInvoice}
              onChange={(e) => setIsDebtInvoice(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-250 focus:ring-indigo-500 dark:border-zinc-800"
            />
            <label htmlFor="debtCheck" className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 select-none">
              <span className="text-amber-500">⚠ Ghi nhận công nợ</span>
              <span className="font-normal text-[10px] text-gray-400">(Khách hàng còn nợ hóa đơn này)</span>
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-gray-150/70 dark:border-zinc-800 px-6 flex items-center gap-3 w-full sm:w-auto justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Tổng tiền thanh toán:</span>
            <span className="text-sm font-black text-indigo-650 dark:text-cyan-400 font-mono">
              {formatVND(totalAmount)}
            </span>
          </div>
        </div>

        {/* Global Save action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveInvoice}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none"
          >
            <Save className="w-4 h-4" />
            Lưu Hóa Đơn & Print
          </button>
        </div>

      </div>

      {/* Invoice Statements List History & Export Options */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            Lịch sử hóa đơn đã bán ({invoices.length} hóa đơn)
          </span>
          <span className="text-[10px] text-gray-400">POS Operations</span>
        </div>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3 border border-gray-150/80 dark:border-zinc-850 rounded-xl hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-100">{inv.buyerName}</span>
                    <span className="text-[9px] font-mono font-bold bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-400 px-1.5 py-0.5 rounded">
                      {inv.invoiceCode}
                    </span>
                    {inv.isDebt && (
                      <span className="text-[9px] font-bold bg-rose-50 dark:bg-rose-950/35 text-rose-500 px-1.5 py-0.5 rounded">GHI NỢ</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    Ngày: {inv.date} • SĐT: {inv.buyerPhone} • SL: {inv.items.reduce((a, b) => a + b.quantity, 0)} sản phẩm
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center justify-end w-full sm:w-auto">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-250 font-mono pr-2.5">
                    {formatNumberDots(inv.totalAmount)} đ
                  </div>
                  
                  {/* Print */}
                  <button
                    onClick={() => handlePrintTrigger(inv)}
                    className="p-1.5 border border-gray-150 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-gray-300 transition"
                    title="In Hóa Đơn"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>

                  {/* Word */}
                  <button
                    onClick={() => handleWordExport(inv)}
                    className="p-1.5 border border-sky-100 hover:bg-sky-50 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded-lg text-sky-600 dark:text-sky-400 transition"
                    title="Xuất Word .doc"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  {/* Excel */}
                  <button
                    onClick={() => handleExportCSV(inv)}
                    className="p-1.5 border border-teal-100 hover:bg-teal-50 dark:border-zinc-800 dark:hover:bg-zinc-800 rounded-lg text-teal-600 dark:text-emerald-400 transition"
                    title="Xuất Excel CSV"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1.5">
              <Inbox className="w-8 h-8 text-gray-300" />
              <span>Chưa xuất hóa đơn nào</span>
            </div>
          )}
        </div>
      </div>

      {/* POPUP VIEW ONLY FOR PRINT RENDERING */}
      {activePrintInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-55 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150/85 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header toolbar */}
            <div className="bg-gray-50 dark:bg-zinc-950 p-4 border-b border-gray-100 dark:border-zinc-850 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Mã số: {activePrintInvoice.invoiceCode}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In hóa đơn
                </button>
                <button
                  onClick={() => setActivePrintInvoice(null)}
                  className="px-3 py-1.5 border text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:border-zinc-800 dark:text-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Print Friendly Page Container view */}
            <div id="invoice-print-area" className="p-8 overflow-y-auto flex-1 bg-white text-black font-serif print-container">
              
              {/* TOP HEADER */}
              <div className="text-center space-y-1 mb-6">
                <h2 className="text-base font-black uppercase text-gray-900 font-sans tracking-wide">
                  {sellerInfo.unit}
                </h2>
                <div className="text-xs text-gray-700 font-sans">
                  <p>Địa chỉ: {sellerInfo.address}</p>
                  <p className="font-mono">Điện thoại: {sellerInfo.phone}</p>
                </div>
                <div className="border-b border-dashed border-gray-300 my-4"></div>
              </div>

              {/* TITLE */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold uppercase tracking-wider font-sans">HÓA ĐƠN BÁN HÀNG</h3>
                <span className="text-[11px] font-sans italic text-gray-650">Ngày xuất hóa đơn: {activePrintInvoice.date}</span>
              </div>

              {/* CUSTOMER INFO */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 border border-gray-100 p-3 rounded">
                <div>
                  <p className="mb-1 text-gray-500">Đơn vị mua hàng / Người mua:</p>
                  <p className="font-bold text-gray-800">{activePrintInvoice.buyerName}</p>
                </div>
                <div>
                  <p className="mb-1 text-gray-500">Số điện thoại liên hệ:</p>
                  <p className="font-bold text-gray-800 font-mono">{activePrintInvoice.buyerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-gray-500">Địa chỉ giao nhận:</p>
                  <p className="font-bold text-gray-850">{activePrintInvoice.buyerAddress}</p>
                </div>
              </div>

              {/* GRID */}
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900 font-bold bg-gray-50 text-gray-700 text-[10px] uppercase">
                    <th className="p-2 text-center w-8">STT</th>
                    <th className="p-2">Tên hàng hóa</th>
                    <th className="p-2 text-center">Serial</th>
                    <th className="p-2 text-center w-12">ĐVT</th>
                    <th className="p-2 text-center w-12">SL</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activePrintInvoice.items.map((item, index) => (
                    <tr key={index} className="align-middle py-1 text-gray-800">
                      <td className="p-2 text-center">{index + 1}</td>
                      <td className="p-2 font-semibold">{item.productName}</td>
                      <td className="p-2 text-center font-mono text-[10px] text-gray-500">{item.serial || '-'}</td>
                      <td className="p-2 text-center">{item.unit || 'Chiếc'}</td>
                      <td className="p-2 text-center font-bold">{item.quantity}</td>
                      <td className="p-2 text-right font-mono">{formatNumberDots(item.sellPrice)} đ</td>
                      <td className="p-2 text-right font-mono font-semibold">
                        {formatNumberDots(item.sellPrice * item.quantity)} đ
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-900 font-black text-xs text-gray-900">
                    <td colSpan={6} className="p-3 text-right">Tổng tiền thanh toán:</td>
                    <td className="p-3 text-right font-mono text-[13px]">{formatNumberDots(activePrintInvoice.totalAmount)} đ</td>
                  </tr>
                </tbody>
              </table>

              {/* SIGNATURES */}
              <div className="grid grid-cols-2 text-center text-xs font-sans mt-10">
                <div className="space-y-12">
                  <p className="font-bold">Người mua hàng</p>
                  <p className="italic text-[10px] text-gray-400">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="space-y-12">
                  <p className="font-bold">Đại diện người bán</p>
                  <p className="italic text-[10px] text-gray-400">(Ký và đóng dấu)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* HIDDEN RAW INVOICE PRINT ELEMENT SO NATIVE PRINTER TRIGGERS ON PORTRAIT AND USES ONLY PRINT-AREA */}
      {activePrintInvoice && (
        <div className="hidden print-only print-container text-black font-sans bg-white p-6 leading-relaxed">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wide">{sellerInfo.unit}</h2>
            <p className="text-[10px]">ĐC: {sellerInfo.address}</p>
            <p className="text-[10px]">Điện thoại: {sellerInfo.phone}</p>
            <hr className="my-2 border-t border-dashed border-gray-500" />
            <h3 className="text-base font-black uppercase tracking-widest py-1.5">HÓA ĐƠN BÁN HÀNG</h3>
            <p className="text-[9px] italic">Số HD: {activePrintInvoice.invoiceCode} • Ngày: {activePrintInvoice.date}</p>
          </div>

          <div className="my-4 text-[10px] space-y-0.5 max-w-sm">
            <p><strong>Khách hàng:</strong> {activePrintInvoice.buyerName}</p>
            <p><strong>Điện thoại:</strong> {activePrintInvoice.buyerPhone}</p>
            <p><strong>Địa chỉ:</strong> {activePrintInvoice.buyerAddress}</p>
          </div>

          <table className="w-full text-[9px] border-collapse mt-3 border-t-2 border-b-2 border-black">
            <thead>
              <tr className="border-b border-gray-500 text-left">
                <th className="py-1">Mặt hàng</th>
                <th className="py-1 text-center font-mono">SN</th>
                <th className="py-1 text-center">SL</th>
                <th className="py-1 text-right">Đơn giá</th>
                <th className="py-1 text-right">T.Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {activePrintInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-bold">{item.productName}</td>
                  <td className="py-1.5 text-center font-mono">{item.serial || '-'}</td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right font-mono">{formatNumberDots(item.sellPrice)}</td>
                  <td className="py-1.5 text-right font-mono">{formatNumberDots(item.sellPrice * item.quantity)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-black font-bold">
                <td colSpan={4} className="py-2 text-right">Tổng thanh toán:</td>
                <td className="py-2 text-right font-mono">{formatNumberDots(activePrintInvoice.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between text-[10px] mt-12 text-center">
            <div>
              <p className="font-bold">Khách hàng</p>
              <p className="italic text-[8px] mt-8">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold">Đại diện công ty</p>
              <p className="italic text-[8px] mt-8">(Ký, đóng dấu)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
