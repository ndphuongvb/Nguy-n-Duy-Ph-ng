/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction, FormEvent } from 'react';
import { Product, Customer, WarrantyCategory, WarrantyTicket } from '../../types';
import { Calendar, Search, ShieldCheck, CheckSquare, Clock, Plus, Contact, Users, Trash2, ShieldX, Inbox } from 'lucide-react';

interface BaoHanhTabProps {
  products: Product[];
  customers: Customer[];
  warrantyReasons: WarrantyCategory[];
  warrantyTickets: WarrantyTicket[];
  setWarrantyTickets: Dispatch<SetStateAction<WarrantyTicket[]>>;
  onOpenPhonebook: (callback: (contact: { name: string; phone: string }) => void) => void;
  plusTriggered: boolean;
  onResetPlus: () => void;
}

export default function BaoHanhTab({
  products,
  customers,
  warrantyReasons,
  warrantyTickets,
  setWarrantyTickets,
  onOpenPhonebook,
  plusTriggered,
  onResetPlus
}: BaoHanhTabProps) {
  // Fields state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productName, setProductName] = useState('');
  const [serial, setSerial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorDescription, setErrorDescription] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1050).toISOString().split('T')[0];
  const [receivedDate, setReceivedDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextWeekStr);

  // Return date chooser modal/substate
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [customReturnDate, setCustomReturnDate] = useState(todayStr);

  const [searchQuery, setSearchQuery] = useState('');

  // Handle addition trigger from FAB click
  useEffect(() => {
    if (plusTriggered) {
      if (products.length > 0 && !productName) setProductName(products[0].name);
      if (warrantyReasons.length > 0 && !errorDescription) setErrorDescription(warrantyReasons[0].name);

      const formElement = document.getElementById('add-wrt-form');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
      onResetPlus();
    }
  }, [plusTriggered]);

  const handleSelectPhoneContact = () => {
    onOpenPhonebook((contact) => {
      setCustomerName(contact.name);
      setCustomerPhone(contact.phone);
    });
  };

  const handleImportCustomerRegistry = (cId: string) => {
    const cust = customers.find(c => c.id === cId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
    }
  };

  const handleSaveTicket = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !productName) {
      alert('Vui lòng điền đầy đủ tên khách hàng và chọn tên hàng hoá!');
      return;
    }

    const uniqueCode = `BH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    const newTicket: WarrantyTicket = {
      id: `wrt_${Date.now()}`,
      ticketCode: uniqueCode,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'N/A',
      productName: productName,
      serial: serial.trim() || 'N/A',
      quantity: quantity,
      errorDescription: errorDescription || (warrantyReasons[0] ? warrantyReasons[0].name : 'Lỗi phần cứng chung'),
      receivedDate: receivedDate,
      dueDate: dueDate,
      status: 'PENDING'
    };

    setWarrantyTickets(prev => [newTicket, ...prev]);

    // reset fields
    setCustomerName('');
    setCustomerPhone('');
    setSerial('');
    setQuantity(1);
    setReceivedDate(todayStr);
    setDueDate(nextWeekStr);
    alert(`Đã nhận sản phẩm bảo hành thành công! Mã số: ${uniqueCode}`);
  };

  const handleResolveReturn = (id: string, returnDateValue: string) => {
    setWarrantyTickets(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'RETURNED', returnDate: returnDateValue };
      }
      return t;
    }));
    setActiveReturnId(null);
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Bạn có muốn xoá phiếu bảo hành này khỏi hệ thống không?')) {
      setWarrantyTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTickets = warrantyTickets.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.customerName.toLowerCase().includes(query) ||
      t.productName.toLowerCase().includes(query) ||
      t.serial.toLowerCase().includes(query) ||
      t.ticketCode.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 7 Fields Input Ticket Form */}
      <div id="add-wrt-form" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-650 dark:text-cyan-400" />
            Nhận Thiết Bị Bảo Hành (7 Mục)
          </h3>
          <span className="text-[10px] font-semibold text-gray-450 dark:text-cyan-500 uppercase">New Warranty Ticket</span>
        </div>

        <form onSubmit={handleSaveTicket} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1 - Tên khách hàng & sđt */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                1. Khách hàng & SĐT
              </label>
              <div className="flex gap-1">
                {customers.length > 0 && (
                  <div className="relative group">
                    <button type="button" className="p-1 border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded text-[9px] font-semibold text-gray-650 dark:text-gray-300">
                      <Users className="w-3 h-3 text-indigo-650 dark:text-cyan-400" />
                    </button>
                    <div className="hidden group-hover:block absolute right-0 top-5 w-44 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl rounded-lg z-20 max-h-32 overflow-y-auto">
                      {customers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleImportCustomerRegistry(c.id)}
                          className="w-full text-left px-2 py-1 text-[10px] rounded hover:bg-gray-55 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-350 truncate block"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handleSelectPhoneContact}
                  className="p-1 border border-gray-150 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850 rounded text-[9px] font-semibold text-indigo-650 dark:text-cyan-400"
                  title="Nhập danh bạ"
                >
                  <Contact className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Tên Khách Hàng"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
              />
              <input
                type="text"
                placeholder="SĐT Liên hệ"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
              />
            </div>
          </div>

          {/* 2 - Tên hàng hóa và 3 - Serial */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
              2 & 3. Hàng hóa & mã Serial
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {products.length > 0 ? (
                <select
                  value={productName}
                  required
                  onChange={(e) => setProductName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Chọn linh kiện</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-[9px] text-red-400">Thiếu Danh mục!</span>
              )}
              <input
                type="text"
                placeholder="Nhập Serial SN"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200 font-mono"
              />
            </div>
          </div>

          {/* 4 - Số lượng & 6 - Lỗi mô tả */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
              4 & 5. Số lượng & lỗi mô tả
            </label>
            <div className="grid grid-cols-3 gap-1.5 col-span-2">
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="p-1 px-1.5 text-center text-xs font-bold border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
              />
              <div className="col-span-2">
                {warrantyReasons.length > 0 ? (
                  <select
                    value={errorDescription}
                    onChange={(e) => setErrorDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- Chọn lỗi mô tả --</option>
                    {warrantyReasons.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Mô tả lỗi sản phẩm"
                    value={errorDescription}
                    onChange={(e) => setErrorDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 6 - Ngày nhận & 7 - Ngày hẹn trả & submission */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                6. Ngày nhận thiết bị
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                7. Hạn hẹn ngày trả máy
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Lưu Phiếu Bảo Hành
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Dynamic warrants logs and return date updates */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
            <Clock className="w-4 h-5 text-indigo-600 dark:text-cyan-400" />
            <span>Danh sách thiết bị nhận bảo hành ({filteredTickets.length})</span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tên khách hàng, linh kiện, số SN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* List of active tickets */}
        <div className="space-y-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((t) => {
              const isReturned = t.status === 'RETURNED';

              return (
                <div
                  key={t.id}
                  className={`p-4 border rounded-2xl transition flex flex-col sm:flex-row justify-between gap-3.5 ${
                    isReturned
                      ? 'bg-gray-50/50 border-gray-150/70 dark:bg-zinc-955/20 dark:border-zinc-850/60'
                      : 'bg-indigo-50/15 border-indigo-100 dark:bg-cyan-955/10 dark:border-cyan-950/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-100">{t.customerName}</span>
                      <span className="text-[9px] font-mono font-bold bg-gray-150 dark:bg-zinc-800 text-gray-650 dark:text-gray-300 px-1.5 rounded">
                        Mã: {t.ticketCode}
                      </span>
                      {isReturned ? (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 rounded">ĐÃ TRẢ KHÁCH</span>
                      ) : (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 rounded animate-pulse">LƯU CỬA HÀNG</span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                      Linh kiện: {t.productName} (SL: {t.quantity}) {t.serial && `• SN: ${t.serial}`}
                    </div>

                    {/* Description error */}
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      <strong>Lỗi mô tả:</strong> {t.errorDescription}
                    </p>

                    <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-2.5">
                      <span>Nhận: {t.receivedDate}</span>
                      <span>Hẹn trả: {t.dueDate}</span>
                      {t.returnDate && <span className="text-emerald-600 font-bold">Thực tế trả: {t.returnDate}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!isReturned ? (
                      <button
                        onClick={() => {
                          setActiveReturnId(t.id);
                          setCustomReturnDate(todayStr); // Defaults to today
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Trả Máy</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        ✓ Trả hàng hoàn tất
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-zinc-800 transition"
                      title="Xóa phiếu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1">
              <ShieldX className="w-8 h-8 text-rose-350" />
              <span>Không tìm thấy lịch sử nhận bảo hành nào.</span>
            </div>
          )}
        </div>

      </div>

      {/* Return date picker modal */}
      {activeReturnId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in scale-in-95">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-150 border-b pb-2 mb-3">
              XÁC NHẬN CHỌN NGÀY TRẢ THIẾT BỊ
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Chọn ngày thực tế bàn trả hàng cho khách:
                </label>
                <input
                  type="date"
                  value={customReturnDate}
                  onChange={(e) => setCustomReturnDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveReturnId(null)}
                  className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveReturn(activeReturnId, customReturnDate)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Đồng Ý Trả Hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
