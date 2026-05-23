/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Product, ImportBillItem, Invoice } from '../../types';
import { formatNumberDots, formatVND } from '../../utils';
import { Calendar, DollarSign, ArrowUpRight, TrendingUp, Package, Percent, Inbox, RefreshCw, AlertTriangle } from 'lucide-react';

interface ThongKeTabProps {
  products: Product[];
  imports: ImportBillItem[];
  invoices: Invoice[];
}

type PeriodFilter = 'day' | 'month' | 'year' | 'custom';

export default function ThongKeTab({ products, imports, invoices }: ThongKeTabProps) {
  const [period, setPeriod] = useState<PeriodFilter>('month');
  
  // Custom states for date range
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Derive active date boundaries
  const isDateInFilter = (dateStr: string): boolean => {
    const dDate = new Date(dateStr);
    const today = new Date();

    if (period === 'day') {
      const todayOnly = today.toISOString().split('T')[0];
      return dateStr === todayOnly;
    } else if (period === 'month') {
      const curMonth = today.getMonth();
      const curYear = today.getFullYear();
      return dDate.getMonth() === curMonth && dDate.getFullYear() === curYear;
    } else if (period === 'year') {
      return dDate.getFullYear() === today.getFullYear();
    } else if (period === 'custom') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set hours to ignore minor shifts
      dDate.setHours(0,0,0,0);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      return dDate >= start && dDate <= end;
    }
    return true;
  };

  // 1. Profit & Revenue statement computation
  let totalRevenue = 0;
  let totalCost = 0;

  invoices.forEach((inv) => {
    if (isDateInFilter(inv.date)) {
      totalRevenue += inv.totalAmount;
      
      // Calculate actual costs for items sold in this invoice
      inv.items.forEach((item) => {
        // Find cost from imports list
        const importMatch = imports.find(imp => imp.productName === item.productName);
        const unitImportCost = importMatch ? importMatch.importPrice : 0;
        totalCost += (unitImportCost * item.quantity);
      });
    }
  });

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  // 2. Warehouses stock status calculation for registered products
  const inventoryStatus = products.map((prod) => {
    // Sum imported count
    const totalImported = imports
      .filter(imp => imp.productName === prod.name)
      .reduce((sum, item) => sum + item.quantity, 0);

    // Sum sold count
    let totalSold = 0;
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        if (item.productName === prod.name) {
          totalSold += item.quantity;
        }
      });
    });

    const remaining = totalImported - totalSold;
    
    // Fetch unit measurements if any
    const sampleImport = imports.find(imp => imp.productName === prod.name);
    const unitMeasure = sampleImport ? sampleImport.unit : 'Cái';

    return {
      name: prod.name,
      imported: totalImported,
      sold: totalSold,
      remaining: remaining < 0 ? 0 : remaining,
      unit: unitMeasure
    };
  });

  return (
    <div className="space-y-6">
      
      {/* PART 1: Business revenue/profit analytics report card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Báo cáo bán hàng & Lợi nhuận
            </h3>
          </div>

          {/* Quick period toggles */}
          <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl">
            {(['day', 'month', 'year', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPeriod(mode)}
                className={`px-3 py-1 text-[10px] uppercase font-bold rounded-lg transition-all ${
                  period === mode
                    ? 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 shadow-xs'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {mode === 'day' && 'Hành ngày'}
                {mode === 'month' && 'Thống kê Tháng'}
                {mode === 'year' && 'Theo Năm'}
                {mode === 'custom' && 'Tuỳ chỉnh'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range panel */}
        {period === 'custom' && (
          <div className="p-3 bg-gray-55/40 dark:bg-zinc-950 rounded-xl flex flex-wrap gap-3 items-center border border-gray-150-50/20">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Từ ngày:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Đến ngày:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Stats Grid Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/15 p-4 rounded-xl border border-emerald-100/30">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Doanh thu bán ra</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
              {formatVND(totalRevenue)}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Tổng cộng hóa đơn</div>
          </div>

          {/* Import cost */}
          <div className="bg-rose-50/40 dark:bg-rose-950/15 p-4 rounded-xl border border-rose-100/30">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-rose-500 uppercase">Giá vốn nhập hàng</span>
              <ArrowUpRight className="w-4 h-4 text-rose-450" />
            </div>
            <div className="text-sm font-black font-mono text-rose-600 dark:text-rose-450 mt-2">
              {formatVND(totalCost)}
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Giá trị kho đã xuất</div>
          </div>

          {/* Final Net profit */}
          <div className="bg-indigo-50/40 dark:bg-cyan-950/15 p-4 rounded-xl border border-indigo-150-100/30 sm:col-span-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-cyan-400 uppercase">Lợi nhuận ròng thực tế</span>
              <Percent className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-2">
              <div className="text-base font-black font-mono text-indigo-700 dark:text-cyan-400">
                {formatVND(totalProfit)}
              </div>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                totalProfit >= 0 ? 'bg-emerald-100/70 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-650'
              }`}>
                Hiệu suất: {profitMargin}%
              </span>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Lãi ròng sau khấu trừ toàn bộ chi phí vốn ban đầu</div>
          </div>
        </div>

      </div>

      {/* PART 2: Remaining Warehouses Inventory Stock tracker */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Thống kê số lượng hàng tồn kho
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-gray-450 dark:text-cyan-500">Warehouse Stocks</span>
        </div>

        {/* Stock List Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {inventoryStatus.length > 0 ? (
            inventoryStatus.map((item, idx) => {
              const isOut = item.remaining === 0;
              const isLow = item.remaining > 0 && item.remaining < 3;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between hover:shadow-xs ${
                    isOut
                      ? 'bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30'
                      : isLow
                      ? 'bg-amber-50/20 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30'
                      : 'bg-gray-50/50 border-gray-150/70 dark:bg-zinc-950/30 dark:border-zinc-850'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                      {item.name}
                    </h4>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500">
                      Đã mua sỉ: {item.imported} {item.unit} • Đã tiêu thụ: {item.sold} {item.unit}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-850 pt-2.5 mt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Tồn thực tế:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black font-mono ${
                        isOut ? 'text-rose-500' : isLow ? 'text-amber-550' : 'text-gray-850 dark:text-cyan-400'
                      }`}>
                        {item.remaining} {item.unit}
                      </span>
                      {isOut && (
                        <span className="text-[9px] font-black bg-rose-50 dark:bg-rose-950 text-rose-600 px-1 rounded uppercase">HẾT HÀNG</span>
                      )}
                      {isLow && (
                        <span className="text-[9px] font-black bg-amber-55 text-amber-800 px-1 rounded uppercase">CẢNH BÁO TỒN ÍT</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-1">
              <Inbox className="w-8 h-8 text-gray-300" />
              <span>Chưa có sản phẩm nào đăng ký trong kho. Vui lòng khai báo trong Danh Mục!</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
