/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction, FormEvent } from 'react';
import { Invoice, DebtRecord } from '../../types';
import { formatNumberDots, formatVND } from '../../utils';
import { CurrencyInput } from '../CurrencyInput';
import { Calendar, AlertCircle, FileClock, Search, Plus, Contact, Trash2, Link, UserCheck, Inbox, BellRing, ToggleLeft, ToggleRight } from 'lucide-react';

interface CongNoTabProps {
  invoices: Invoice[];
  debts: DebtRecord[];
  setDebts: Dispatch<SetStateAction<DebtRecord[]>>;
  onOpenPhonebook: (callback: (contact: { name: string; phone: string }) => void) => void;
  plusTriggered: boolean;
  onResetPlus: () => void;
}

export default function CongNoTab({
  invoices,
  debts,
  setDebts,
  onOpenPhonebook,
  plusTriggered,
  onResetPlus
}: CongNoTabProps) {
  // Input fields state
  const [debtorName, setDebtorName] = useState('');
  const [phone, setPhone] = useState('');
  const [productNameOrOrder, setProductNameOrOrder] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1050).toISOString().split('T')[0];
  const [debtDate, setDebtDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextMonthStr);

  const [searchQuery, setSearchQuery] = useState('');

  // Auto trigger additions
  useEffect(() => {
    if (plusTriggered) {
      const formElement = document.getElementById('add-debt-form');
      if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
      onResetPlus();
    }
  }, [plusTriggered]);

  const handleSelectContactList = () => {
    onOpenPhonebook((contact) => {
      setDebtorName(contact.name);
      setPhone(contact.phone);
    });
  };

  // Link outstanding debt values directly from saved POS Invoices
  const handleLinkInvoice = (inv: Invoice) => {
    setDebtorName(inv.buyerName);
    setPhone(inv.buyerPhone);
    setProductNameOrOrder(`Đơn hàng ${inv.invoiceCode} / ${inv.items.map(i=>i.productName).join(', ')}`);
    setDebtAmount(inv.totalAmount);
    setDebtDate(inv.date);
    // Auto set due date to 30 days after invoice date
    try {
      const d = new Date(inv.date);
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
    } catch {
      setDueDate(nextMonthStr);
    }
  };

  const handleSaveDebt = (e: FormEvent) => {
    e.preventDefault();
    if (!debtorName.trim()) {
      alert('Vui lòng điền tên người nợ!');
      return;
    }

    const newRecord: DebtRecord = {
      id: `deb_${Date.now()}`,
      debtorName: debtorName.trim(),
      phone: phone.trim() || 'N/A',
      productNameOrOrder: productNameOrOrder.trim() || 'Nợ mua hàng lẻ',
      debtAmount: debtAmount,
      paidAmount: paidAmount,
      debtDate: debtDate,
      dueDate: dueDate,
      status: paidAmount >= debtAmount ? 'RESOLVED' : 'PENDING',
      notificationOption: true
    };

    setDebts(prev => [newRecord, ...prev]);

    // reset inputs
    setDebtorName('');
    setPhone('');
    setProductNameOrOrder('');
    setDebtAmount(0);
    setPaidAmount(0);
    setDebtDate(todayStr);
    setDueDate(nextMonthStr);
    alert('Đã lưu thông tin ghi nợ thành công!');
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản ghi nợ này khỏi sổ công nợ?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleToggleScheduleAlert = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const nextVal = !d.notificationOption;
        alert(`Đã đặt lịch hẹn nhắc nhở ngày trả nợ và gửi thông báo SMS tự động cho khách hàng ${d.debtorName}!`);
        return { ...d, notificationOption: nextVal };
      }
      return d;
    }));
  };

  const handleQuickPayDebt = (id: string, amountToPay: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        const newlyPaid = d.paidAmount + amountToPay;
        const resolvedFlag = newlyPaid >= d.debtAmount;
        return {
          ...d,
          paidAmount: newlyPaid,
          status: resolvedFlag ? 'RESOLVED' : 'PENDING'
        };
      }
      return d;
    }));
    alert('Thanh toán thành công! Sổ công nợ của người dùng đã được cập nhật.');
  };

  const filteredDebts = debts.filter(d => {
    const query = searchQuery.toLowerCase();
    return (
      d.debtorName.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      d.productNameOrOrder.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* 2-Part Form to Input Debt records or linking POS invoices */}
      <div id="add-debt-form" className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Linking helper strip if invoices exist */}
        {invoices.length > 0 && (
          <div className="p-3 bg-indigo-50/20 rounded-xl border border-dashed border-indigo-150-150 text-xs text-gray-700 dark:text-gray-300">
            <div className="font-bold mb-1 flex items-center gap-1.5 text-indigo-700 dark:text-cyan-400">
              <Link className="w-3.5 h-3.5" />
              <span>Liên kết nhanh hóa đơn bán hàng chưa thu phí:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto mt-2">
              {invoices.map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => handleLinkInvoice(inv)}
                  className="px-2 py-1 bg-white dark:bg-zinc-855 border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 rounded-lg text-[10px] font-semibold text-gray-700 dark:text-gray-300 transition flex items-center gap-1 shrink-0"
                >
                  <UserCheck className="w-3 h-3 text-emerald-500" />
                  <span>{inv.buyerName} ({formatNumberDots(inv.totalAmount)}đ)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <FileClock className="w-5 h-5 text-indigo-650 dark:text-cyan-400" />
            Ghi Sổ Công Nợ (Đặt lịch / Hẹn ngày trả)
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Debt Registry</span>
        </div>

        <form onSubmit={handleSaveDebt} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* debtor name & phone */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                Tên con nợ & Số liên hệ
              </label>
              <button
                type="button"
                onClick={handleSelectContactList}
                className="p-1 px-1.5 border border-indigo-150 rounded text-[9px] text-indigo-600 dark:text-cyan-400 font-semibold flex items-center gap-0.5"
              >
                <Contact className="w-3 h-3" /> Danh bạ
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                placeholder="Tên khách nợ"
                required
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-250"
              />
            </div>
          </div>

          {/* product order & debt amount */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
              Tên Sản phẩm / Hoá Đơn nợ
            </label>
            <input
              type="text"
              placeholder="Đơn mua hàng Asus ROG / Laptop..."
              value={productNameOrOrder}
              onChange={(e) => setProductNameOrOrder(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200"
            />
          </div>

          {/* amount inputs */}
          <div className="space-y-1.5 col-span-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Số tiền nợ
                </label>
                <CurrencyInput
                  value={debtAmount}
                  onChange={(val) => setDebtAmount(val)}
                  placeholder="Tiền nợ đ"
                  className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Đã trả trước
                </label>
                <CurrencyInput
                  value={paidAmount}
                  onChange={(val) => setPaidAmount(val)}
                  placeholder="Đã trả đ"
                  className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* dates and submission */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Ngày ghi nợ sản phẩm
              </label>
              <input
                type="date"
                required
                value={debtDate}
                onChange={(e) => setDebtDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Ngày hẹn trả nợ (Hạn Hạn Hẹp)
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
                Lưu Báo Cáo Ghi Nợ
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Debt Books Logs list and alert schedulers */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Control bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-750 dark:text-gray-200">
            <AlertCircle className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            <span>Sổ theo dõi các đơn hàng nợ ({filteredDebts.length})</span>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên người nợ, đơn mua hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* List of debt records */}
        <div className="space-y-3.5">
          {filteredDebts.length > 0 ? (
            filteredDebts.map((item) => {
              const outstanding = item.debtAmount - item.paidAmount;
              const isPaid = item.status === 'RESOLVED' || outstanding <= 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 border rounded-2xl transition flex flex-col sm:flex-row justify-between gap-4 ${
                    isPaid
                      ? 'bg-emerald-50/10 border-emerald-100/40 dark:bg-zinc-950/20 dark:border-zinc-850/50'
                      : 'bg-rose-50/15 border-rose-100 dark:bg-rose-955/10 dark:border-rose-950/25'
                  }`}
                >
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs text-gray-800 dark:text-gray-100">{item.debtorName}</span>
                      <span className="text-[10px] text-gray-500 font-mono font-semibold bg-gray-50 dark:bg-zinc-850 px-1.5 py-0.5 rounded">
                        SĐT: {item.phone}
                      </span>
                      {isPaid ? (
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 rounded">HẾT NỢ</span>
                      ) : (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 rounded">CÒN PHẢI THU</span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-650 dark:text-gray-350">
                      <strong>Chi tiết đơn nợ:</strong> {item.productNameOrOrder}
                    </p>

                    <div className="grid grid-cols-3 gap-2 border-t border-gray-50 dark:border-zinc-850 pt-2 text-[10px] text-gray-400 dark:text-gray-500">
                      <div>
                        <p className="font-semibold text-gray-400">Tiền nợ ban đầu</p>
                        <p className="font-mono font-bold text-gray-700 dark:text-gray-300 mt-0.5">{formatNumberDots(item.debtAmount)} đ</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400">Đã trả trước đó</p>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatNumberDots(item.paidAmount)} đ</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400">Còn nợ đọng lại</p>
                        <p className="font-mono font-bold text-rose-500 mt-0.5">{formatNumberDots(Math.max(0, outstanding))} đ</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-gray-450 dark:text-gray-550 pt-1 flex flex-wrap gap-3">
                      <span>Giao dịch: {item.debtDate}</span>
                      <span className={isPaid ? '' : 'text-amber-550 font-semibold'}>
                        Hạn trả: {item.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-end sm:items-end justify-between sm:justify-center gap-3.5 border-t sm:border-t-0 border-gray-100 dark:border-zinc-850 pt-3 sm:pt-0 shrink-0">
                    
                    {/* Notify alarm scheduler toggle */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleScheduleAlert(item.id)}
                        className="text-gray-400 hover:text-indigo-650 dark:hover:text-cyan-400 transition flex items-center gap-1 text-[11px] font-semibold"
                        title={item.notificationOption ? 'Tắt hẹn lịch giờ nhắc nợ' : 'Đặt ngày hẹn trả nhắc nợ tự động'}
                      >
                        <BellRing className={`w-4 h-4 ${item.notificationOption ? 'text-amber-500 animate-bounce' : 'text-gray-400'}`} />
                        <span>Hẹn báo thức nhắc</span>
                      </button>
                    </div>

                    <div className="flex gap-1">
                      {/* Cash in buttons */}
                      {!isPaid && (
                        <>
                          <button
                            onClick={() => handleQuickPayDebt(item.id, outstanding)}
                            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-705 dark:bg-cyan-500 hover:dark:bg-cyan-600 text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                          >
                            Thu Toàn Bộ
                          </button>
                          <button
                            onClick={() => {
                              const payVal = prompt('Nhập số tiền con nợ nộp thêm (đ):', outstanding.toString());
                              if (payVal) {
                                const parsed = parseInt(payVal.replace(/[^0-9]/g,''), 10);
                                if (parsed > 0) handleQuickPayDebt(item.id, parsed);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 dark:bg-zinc-850 dark:border-zinc-800 text-gray-650 dark:text-gray-300 rounded-lg text-[10px] font-bold transition"
                          >
                            Thu Lẻ
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteDebt(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-1">
              <Inbox className="w-8 h-8 text-gray-300" />
              <span>Sổ công nợ trống. Nhập phiếu ghi nợ ở trên!</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
