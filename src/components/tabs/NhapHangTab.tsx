/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction, ChangeEvent, FormEvent } from 'react';
import { Product, Unit, ImportBillItem } from '../../types';
import { CurrencyInput } from '../CurrencyInput';
import { formatNumberDots, exportToCSV } from '../../utils';
import { Plus, Minus, Contact, Trash2, Calendar, FileDown, Search, Inbox, AlertCircle } from 'lucide-react';

interface NhapHangTabProps {
  products: Product[];
  units: Unit[];
  imports: ImportBillItem[];
  setImports: Dispatch<SetStateAction<ImportBillItem[]>>;
  onOpenPhonebook: (callback: (contact: { name: string; phone: string }) => void) => void;
  plusTriggered: boolean;
  onResetPlus: () => void;
}

export default function NhapHangTab({
  products,
  units,
  imports,
  setImports,
  onOpenPhonebook,
  plusTriggered,
  onResetPlus
}: NhapHangTabProps) {
  // New entry form input states
  const [selectedProduct, setSelectedProduct] = useState('');
  const [serial, setSerial] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [importPrice, setImportPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');

  // Local Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Handle plus FAB clicks from parent wrapper
  useEffect(() => {
    if (plusTriggered) {
      // Auto-prefill first product and unit if available
      if (products.length > 0 && !selectedProduct) setSelectedProduct(products[0].name);
      if (units.length > 0 && !selectedUnit) setSelectedUnit(units[0].name);
      
      // Highlight form scroll location or focus first input
      const formElement = document.getElementById('new-import-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
      onResetPlus();
    }
  }, [plusTriggered]);

  const handleQtyChange = (val: number) => {
    const nextQty = quantity + val;
    setQuantity(nextQty < 1 ? 1 : nextQty);
  };

  const handleProductSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
  };

  const handleUnitSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
  };

  const handleSelectSupplierContact = () => {
    onOpenPhonebook((contact) => {
      setSupplier(contact.name);
      setSupplierPhone(contact.phone);
    });
  };

  const handleSaveImport = (e: FormEvent) => {
    e.preventDefault();
    const prodName = selectedProduct || (products[0] ? products[0].name : '');
    const untName = selectedUnit || (units[0] ? units[0].name : '');

    if (!prodName) {
      alert('Vui lòng thêm "Tên hàng hoá" vào Danh Mục trước!');
      return;
    }
    if (!untName) {
      alert('Vui lòng thêm "Đơn vị tính" vào Danh Mực trước!');
      return;
    }

    const newImport: ImportBillItem = {
      id: `imp_${Date.now()}`,
      productName: prodName,
      serial: serial.trim() || `SN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      unit: untName,
      quantity: quantity,
      importPrice: importPrice,
      sellPrice: sellPrice,
      supplier: supplier.trim() || 'Nhà cung cấp vãng lai',
      supplierPhone: supplierPhone || undefined,
      date: new Date().toISOString().split('T')[0]
    };

    setImports(prev => [newImport, ...prev]);

    // Reset Form fields
    setSerial('');
    setQuantity(1);
    setImportPrice(0);
    setSellPrice(0);
    setSupplier('');
    setSupplierPhone('');
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá phiếu nhập hàng này khỏi lịch sử không?')) {
      setImports(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mã Phiếu', 'Tên Hàng Hóa', 'Số Serial', 'Đơn Vị Tính', 'Số Lượng', 'Giá Nhập (VNĐ)', 'Giá Bán (VNĐ)', 'Nhà Cung Cấp', 'Ngày Nhập'];
    const rows = imports.map(item => [
      item.id,
      item.productName,
      item.serial,
      item.unit,
      item.quantity,
      item.importPrice,
      item.sellPrice,
      item.supplier + (item.supplierPhone ? ` (${item.supplierPhone})` : ''),
      item.date
    ]);
    exportToCSV(rows, 'LichSu_NhapHang_P3', headers);
  };

  const filteredImports = imports.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(query) ||
      item.serial.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 7 Columns Input Ledger Section */}
      <div id="new-import-form" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-150/80 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span className="p-1 w-2.5 h-2.5 bg-indigo-600 dark:bg-cyan-400 rounded-full inline-block animate-pulse"></span>
            Nhập Phiếu Hàng Hóa (7 Cột)
          </h3>
          <span className="text-[11px] font-medium text-gray-400">Ledger Input Form</span>
        </div>

        <form onSubmit={handleSaveImport} className="grid grid-cols-1 md:grid-cols-7 gap-3.5 items-end">
          
          {/* 1 - Tên hàng hóa */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              1. Tên hàng hóa
            </label>
            {products.length > 0 ? (
              <select
                value={selectedProduct}
                onChange={handleProductSelection}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-850 dark:text-gray-200"
              >
                <option value="">-- Chọn mặt hàng --</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            ) : (
              <div className="text-[10px] text-amber-500 flex items-center gap-1 py-2">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa có sản phẩm
              </div>
            )}
          </div>

          {/* 2 - Serial */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              2. Sỗ Serial
            </label>
            <input
              type="text"
              placeholder="SN-ASUS-..."
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
            />
          </div>

          {/* 3 - Đơn vị tính */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              3. Đơn vị tính
            </label>
            {units.length > 0 ? (
              <select
                value={selectedUnit}
                onChange={handleUnitSelection}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-850 dark:text-gray-200"
              >
                <option value="">-- Chọn ĐVT --</option>
                {units.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            ) : (
              <div className="text-[10px] text-amber-500 flex items-center gap-1 py-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa có ĐVT
              </div>
            )}
          </div>

          {/* 4 - Số lượng with +/- buttons */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              4. Số lượng
            </label>
            <div className="flex items-center border border-gray-250 dark:border-zinc-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => handleQtyChange(-1)}
                className="px-2.5 py-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center text-xs font-bold bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
              />
              <button
                type="button"
                onClick={() => handleQtyChange(1)}
                className="px-2.5 py-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 5 - Giá nhập */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              5. Giá nhập
            </label>
            <CurrencyInput
              value={importPrice}
              onChange={(val) => setImportPrice(val)}
              className="px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
              placeholder="VND"
            />
          </div>

          {/* 6 - Giá bán */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              6. Giá bán
            </label>
            <CurrencyInput
              value={sellPrice}
              onChange={(val) => setSellPrice(val)}
              className="px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
              placeholder="VND"
            />
          </div>

          {/* 7 - Nhà cung cấp */}
          <div className="md:col-span-6">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
              7. Nhà cung cấp
            </label>
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Công ty TNHH tin học..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
                />
              </div>
              <button
                type="button"
                onClick={handleSelectSupplierContact}
                className="p-2 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-150 dark:hover:bg-zinc-800 text-indigo-650 dark:text-cyan-400 rounded-xl transition flex items-center gap-1 text-[11px]"
                title="Nhập từ danh bạ"
              >
                <Contact className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Danh bạ</span>
              </button>
            </div>
            {supplierPhone && (
              <span className="block text-[10px] text-gray-400 mt-1">SĐT: {supplierPhone}</span>
            )}
          </div>

          {/* Action button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md hover:shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Lưu
            </button>
          </div>
        </form>
      </div>

      {/* History List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Top Control Panel */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Lịch sử nhập hàng ({filteredImports.length} bản ghi)
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm hàng hoá, mã SN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-1 text-gray-800 dark:text-gray-200"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 shadow-sm border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded-xl text-xs font-semibold text-gray-650 dark:text-gray-300 flex items-center gap-1 transition"
              title="Xuất Excel"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Goods Display Board */}
        <div className="overflow-x-auto border border-gray-100 dark:border-zinc-850 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-950/80 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-850">
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Serial</th>
                <th className="p-3">Đơn Vị</th>
                <th className="p-3 text-center">SL</th>
                <th className="p-3 text-right">Giá nhập</th>
                <th className="p-3 text-right">Giá bán</th>
                <th className="p-3">Nhà Cung Cấp</th>
                <th className="p-3 text-center">Ngày nhập</th>
                <th className="p-3 text-center w-12">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-850/60 text-xs text-gray-700 dark:text-gray-300">
              {filteredImports.length > 0 ? (
                filteredImports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition">
                    <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">{item.productName}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{item.serial}</td>
                    <td className="p-3 text-gray-500">{item.unit}</td>
                    <td className="p-3 text-center font-bold text-gray-800 dark:text-gray-200">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatNumberDots(item.importPrice)} đ</td>
                    <td className="p-3 text-right font-mono text-indigo-650 dark:text-cyan-400 font-semibold">{formatNumberDots(item.sellPrice)} đ</td>
                    <td className="p-3">
                      <div className="truncate max-w-[120px]" title={item.supplier}>
                        {item.supplier}
                      </div>
                      {item.supplierPhone && <div className="text-[9px] text-gray-400">{item.supplierPhone}</div>}
                    </td>
                    <td className="p-3 text-center text-[11px] text-gray-400">{item.date}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRecord(item.id)}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Inbox className="w-8 h-8 text-gray-300" />
                      <span>Không tìm thấy lịch sử nhập hàng nào.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
