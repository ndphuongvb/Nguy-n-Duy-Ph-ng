/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Product, Unit, Customer, WarrantyCategory, ImportBillItem, Invoice, WarrantyTicket, DebtRecord } from './types';
import { initialProducts, initialUnits, initialCustomers, initialWarrantyReasons, initialImports, initialInvoices, initialWarrantyTickets, initialDebts } from './data/initialData';
import { PhonebookModal } from './components/PhonebookModal';

// Tabs
import DanhMucTab from './components/tabs/DanhMucTab';
import NhapHangTab from './components/tabs/NhapHangTab';
import BanHangTab from './components/tabs/BanHangTab';
import ThongKeTab from './components/tabs/ThongKeTab';
import BaoHanhTab from './components/tabs/BaoHanhTab';
import CongNoTab from './components/tabs/CongNoTab';

// Icons
import {
  BookOpen,
  Download,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  FileClock,
  Plus,
  Moon,
  Sun,
  Smartphone,
  Laptop,
  Maximize2,
  RefreshCw,
  Sliders,
  FolderSync,
  Bell,
  Contact,
  PhoneCall,
  Save,
  Grid
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'danhmuc' | 'nhaphang' | 'banhang' | 'thongke' | 'baohanh' | 'congno'>('danhmuc');

  // Core Database Models - Persistent local storage with realistic rollbacks
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('p3_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('p3_units');
    return saved ? JSON.parse(saved) : initialUnits;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('p3_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [warrantyReasons, setWarrantyReasons] = useState<WarrantyCategory[]>(() => {
    const saved = localStorage.getItem('p3_warrantyReasons');
    return saved ? JSON.parse(saved) : initialWarrantyReasons;
  });

  const [imports, setImports] = useState<ImportBillItem[]>(() => {
    const saved = localStorage.getItem('p3_imports');
    return saved ? JSON.parse(saved) : initialImports;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('p3_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [warrantyTickets, setWarrantyTickets] = useState<WarrantyTicket[]>(() => {
    const saved = localStorage.getItem('p3_warrantyTickets');
    return saved ? JSON.parse(saved) : initialWarrantyTickets;
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    const saved = localStorage.getItem('p3_debts');
    return saved ? JSON.parse(saved) : initialDebts;
  });

  // Global Config States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('p3_theme') as 'light' | 'dark') || 'light';
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>(() => {
    return (localStorage.getItem('p3_orientation') as 'portrait' | 'landscape' | 'auto') || 'auto';
  });

  // Reusable Phonebook Directory States
  const [isPhonebookOpen, setIsPhonebookOpen] = useState(false);
  const [phonebookCallback, setPhonebookCallback] = useState<(c: { name: string; phone: string; address?: string }) => void>(() => {});

  // System Permissions Simulation (Contacts, Calls, Notifications)
  const [contactsPermission, setContactsPermission] = useState(() => {
    return localStorage.getItem('p3_p_contacts') === 'granted';
  });
  
  const [callsPermission, setCallsPermission] = useState(() => {
    return localStorage.getItem('p3_p_calls') === 'granted';
  });

  const [notificationsPermission, setNotificationsPermission] = useState(() => {
    return localStorage.getItem('p3_p_notifications') === 'granted';
  });

  // Cloud Linkage & Synced indicators
  const [cloudSynced, setCloudSynced] = useState(false);
  const [cloudUser, setCloudUser] = useState(() => localStorage.getItem('p3_cloud_user') || '');
  const [cloudPassword, setCloudPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // FAB "+" bottom triggers per module
  const [fabTriggers, setFabTriggers] = useState({
    danhmuc: false,
    nhaphang: false,
    banhang: false,
    thongke: false,
    baohanh: false,
    congno: false
  });

  // Synchronizers of LocalStorage
  useEffect(() => {
    localStorage.setItem('p3_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('p3_units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem('p3_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('p3_warrantyReasons', JSON.stringify(warrantyReasons));
  }, [warrantyReasons]);

  useEffect(() => {
    localStorage.setItem('p3_imports', JSON.stringify(imports));
  }, [imports]);

  useEffect(() => {
    localStorage.setItem('p3_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('p3_warrantyTickets', JSON.stringify(warrantyTickets));
  }, [warrantyTickets]);

  useEffect(() => {
    localStorage.setItem('p3_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('p3_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('p3_orientation', orientation);
  }, [orientation]);

  // Global phone book choose trigger
  const handleTriggerPhonebook = (onSelectCallback: (c: { name: string; phone: string; address?: string }) => void) => {
    setPhonebookCallback(() => onSelectCallback);
    setIsPhonebookOpen(true);
  };

  // Contacts picker approval handler
  const handleApproveContactsPermission = () => {
    setContactsPermission(true);
    localStorage.setItem('p3_p_contacts', 'granted');
    alert('✓ Cấp quyền truy cập vào danh bạ thiết bị di động thành công!');
  };

  // Notification permissions trigger
  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      if (res === 'granted') {
        setNotificationsPermission(true);
        localStorage.setItem('p3_p_notifications', 'granted');
        alert('✓ Đã bật cấp quyền nhận thông báo đẩy khi đến kỳ thanh toán của khách hàng!');
      } else {
        alert('❌ Người dùng đã từ chối cấp quyền thông báo đẩy mạng!');
      }
    } else {
      setNotificationsPermission(true);
      localStorage.setItem('p3_p_notifications', 'granted');
      alert('✓ Giao diện mô phỏng Thông báo đẩy hệ thống thành công!');
    }
  };

  // Call dialer permissions trigger
  const handleRequestCallsPermission = () => {
    setCallsPermission(true);
    localStorage.setItem('p3_p_calls', 'granted');
    alert('✓ Đã cho phép ứng dụng mở trình quay cuộc gọi để gọi điện cho nhà cung cấp/khách nợ!');
  };

  // Cloud sync connector simulation
  const handleCloudLinkSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!cloudUser.trim() || !cloudPassword.trim()) {
      alert('Vui lòng nhập tài khoản và mật khẩu liên kết!');
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCloudSynced(true);
      localStorage.setItem('p3_cloud_user', cloudUser.trim());
      alert(`✓ Đồng bộ và liên kết tài khoản đám mây [${cloudUser}] trực tuyến thành công! Đã backup 8 bảng dữ liệu lên Cloud lưu trữ bảo mật.`);
    }, 1500);
  };

  // Hardware Backups on browser storage download
  const handleBackupStateToDevice = () => {
    const fullState = {
      version: 'P3-1.0',
      timestamp: new Date().toISOString(),
      products,
      units,
      customers,
      warrantyReasons,
      imports,
      invoices,
      warrantyTickets,
      debts
    };

    const blob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QL_BanHang_P3_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('✓ Đã xuất tệp tin sao lưu dữ liệu (.json) thành công! Hãy lưu file này ở thiết bị để khôi phục khi cần.');
  };

  // Hardware Backups Restore state
  const handleRestoreStateFromDevice = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Cảnh báo: Hành động này sẽ thay thế toán bộ dữ liệu bán hàng hiện tại của bạn bằng dữ liệu từ tập tin sao lưu. Bạn có muốn tiếp tục không?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.units && parsed.customers) {
          setProducts(parsed.products);
          setUnits(parsed.units);
          setCustomers(parsed.customers);
          if (parsed.warrantyReasons) setWarrantyReasons(parsed.warrantyReasons);
          if (parsed.imports) setImports(parsed.imports);
          if (parsed.invoices) setInvoices(parsed.invoices);
          if (parsed.warrantyTickets) setWarrantyTickets(parsed.warrantyTickets);
          if (parsed.debts) setDebts(parsed.debts);
          alert('✓ Đã khôi phục hoàn toàn dữ liệu bán hàng và thông tin từ tệp sao lưu thành công!');
        } else {
          alert('❌ Lỗi định dạng tập tin sao lưu không chính xác hoặc bị hỏng.');
        }
      } catch (err) {
        alert('❌ Có lỗi xảy ra khi đọc tệp tin khôi phục.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  // Floating Action button triggers modal based on active tab
  const handleFABTriggerClick = () => {
    setFabTriggers(prev => ({
      ...prev,
      [activeTab]: true
    }));
  };

  // Automatic coupling of debts if checkout saves as debt
  const handleTriggerAddDebtFromCheckout = (
    debtor: string,
    phone: string,
    amount: number,
    orderDetails: string,
    sourceId: string
  ) => {
    const newDebt: DebtRecord = {
      id: `deb_${Date.now()}`,
      debtorName: debtor,
      phone: phone || 'N/A',
      sourceInvoiceId: sourceId,
      productNameOrOrder: orderDetails,
      debtAmount: amount,
      paidAmount: 0,
      debtDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1050).toISOString().split('T')[0],
      status: 'PENDING',
      notificationOption: true
    };
    setDebts(prev => [newDebt, ...prev]);
  };

  // Determine orientation wrapper style
  let containerWrapperClass = 'w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 text-gray-850 dark:text-gray-100 flex flex-col p-0 md:p-4';
  if (orientation === 'portrait') {
    containerWrapperClass += ' custom-orientation-portrait';
  } else if (orientation === 'landscape') {
    containerWrapperClass += ' custom-orientation-landscape';
  }

  return (
    <div className={containerWrapperClass}>
      
      {/* 1. TOP UTILITY GLOBAL NAVIGATION STRIP (NO-PRINT) */}
      <header className="no-print bg-white dark:bg-zinc-900 border-b border-gray-150-100 dark:border-zinc-800 p-4 rounded-b-2xl md:rounded-2xl shadow-xs space-y-3.5 mb-4">
        
        {/* Core application visual bar logotype */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 dark:bg-cyan-500 rounded-xl shadow-md text-white">
              <Plus className="w-5 h-5 rotate-45 shrink-0" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-gray-850 dark:text-gray-100 font-sans flex items-center gap-2">
                QL Bán hàng P3
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-400 rounded">
                  v3.5 Build
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                Nguyên bản • Quản lý kho, POS, Bảo hành &amp; Luân chuyển công nợ
              </p>
            </div>
          </div>

          {/* Quick theme inputs & Sync controls */}
          <div className="flex flex-wrap gap-2 items-center justify-end">
            
            {/* Display orientation switches */}
            <div className="flex bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl" title="Điều chỉnh dạng màn hình hiển thị">
              <button
                onClick={() => setOrientation('auto')}
                className={`p-1.5 rounded-lg transition ${
                  orientation === 'auto'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-cyan-400 shadow-sm'
                    : 'text-gray-450 hover:text-gray-750'
                }`}
                title="Tự động"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOrientation('portrait')}
                className={`p-1.5 rounded-lg transition ${
                  orientation === 'portrait'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-cyan-400 shadow-sm'
                    : 'text-gray-450 hover:text-gray-750'
                }`}
                title="Giao diện Dọc (Điện thoại)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`p-1.5 rounded-lg transition ${
                  orientation === 'landscape'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-cyan-400 shadow-sm'
                    : 'text-gray-450 hover:text-gray-750'
                }`}
                title="Giao diện Ngang (Tablet/PC)"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dark/Light toggler */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 border border-gray-150-100 hover:bg-gray-100/50 dark:border-zinc-800 dark:hover:bg-zinc-950 rounded-xl transition-all"
              title="Chuyển đổi sáng / tối"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-gray-650" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* 2. SUB-BAR: Cloud Sync link panel & Permissions Drawer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-100 dark:border-zinc-800 pt-3.5 text-xs text-gray-500">
          
          {/* Backups Panel */}
          <div className="bg-gray-50/50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-100 dark:border-zinc-900 space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sao Lưu &amp; Khôi phục vật lý</span>
            <div className="flex gap-2">
              <button
                onClick={handleBackupStateToDevice}
                className="flex-1 py-1 px-2.5 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 hover:dark:bg-zinc-700 text-indigo-700 dark:text-cyan-400 font-bold rounded-lg text-[10px] transition"
              >
                Tải Backup xuống máy
              </button>
              <label className="flex-1 py-1 px-2.5 bg-gray-50 border dark:bg-zinc-900 dark:border-zinc-800 hover:bg-gray-100 text-gray-650 dark:text-gray-300 font-bold rounded-lg text-[10px] text-center cursor-pointer transition">
                Thu hồi file backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreStateFromDevice}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Simulated Cloud Account Linking & Sync */}
          <div className="bg-gray-50/50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-100 dark:border-zinc-900 space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Liên kết &amp; Đồng bộ tài khoản</span>
            <form onSubmit={handleCloudLinkSubmit} className="flex gap-1">
              <input
                type="text"
                placeholder="Nhập email/tên tài khoản"
                value={cloudUser}
                onChange={(e) => setCloudUser(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 text-[10px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded focus:outline-none"
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                required
                value={cloudPassword}
                onChange={(e) => setCloudPassword(e.target.value)}
                className="w-16 px-2 py-1 text-[10px] border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSyncing}
                className="p-1 px-2.5 bg-indigo-650 dark:bg-cyan-500 hover:bg-indigo-700 text-white rounded font-semibold text-[10px] transition shrink-0"
              >
                {isSyncing ? '...' : cloudSynced ? 'Đã Đồng Bộ' : 'Kết nối'}
              </button>
            </form>
          </div>

          {/* Simulated System Permissions approvals */}
          <div className="bg-gray-50/50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-100 dark:border-zinc-900 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cấp quyền Hệ Thống</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={handleApproveContactsPermission}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  contactsPermission
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                }`}
              >
                <Contact className="w-3 h-3" />
                <span>Danh bạ</span>
              </button>

              <button
                onClick={handleRequestCallsPermission}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  callsPermission
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                }`}
              >
                <PhoneCall className="w-3 h-3" />
                <span>Cuộc gọi</span>
              </button>

              <button
                onClick={handleRequestNotificationPermission}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  notificationsPermission
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
                }`}
              >
                <Bell className="w-3 h-3" />
                <span>Thông báo</span>
              </button>
            </div>
          </div>

        </div>

      </header>

      {/* 3. APP MODULE NAVIGATION TABS (NO-PRINT) */}
      <nav className="no-print bg-white dark:bg-zinc-900 border-b border-gray-150-100 dark:border-zinc-800 p-2 md:rounded-2xl shadow-xs flex flex-wrap gap-1 mb-4 select-none">
        <button
          onClick={() => setActiveTab('danhmuc')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'danhmuc'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-405 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0" />
          <span>1. Danh mục</span>
        </button>

        <button
          onClick={() => setActiveTab('nhaphang')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'nhaphang'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-405 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>2. Nhập hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('banhang')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'banhang'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-405 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span>3. Bán hàng</span>
        </button>

        <button
          onClick={() => setActiveTab('thongke')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'thongke'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-440 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>4. Thống kê</span>
        </button>

        <button
          onClick={() => setActiveTab('baohanh')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'baohanh'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-440 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>5. Bảo hành</span>
        </button>

        <button
          onClick={() => setActiveTab('congno')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'congno'
              ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-cyan-440 shadow-xs'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <FileClock className="w-4 h-4 shrink-0" />
          <span>6. Công nợ</span>
        </button>
      </nav>

      {/* 4. ACTIVE VIEWPORT WRAPPER */}
      <main className="flex-1 w-full pb-20 no-print">
        {activeTab === 'danhmuc' && (
          <DanhMucTab
            products={products}
            setProducts={setProducts}
            units={units}
            setUnits={setUnits}
            customers={customers}
            setCustomers={setCustomers}
            warrantyReasons={warrantyReasons}
            setWarrantyReasons={setWarrantyReasons}
            onOpenPhonebook={handleTriggerPhonebook}
            plusTriggered={fabTriggers.danhmuc}
            onResetPlus={() => setFabTriggers(p => ({ ...p, danhmuc: false }))}
          />
        )}

        {activeTab === 'nhaphang' && (
          <NhapHangTab
            products={products}
            units={units}
            imports={imports}
            setImports={setImports}
            onOpenPhonebook={handleTriggerPhonebook}
            plusTriggered={fabTriggers.nhaphang}
            onResetPlus={() => setFabTriggers(p => ({ ...p, nhaphang: false }))}
          />
        )}

        {activeTab === 'banhang' && (
          <BanHangTab
            products={products}
            units={units}
            customers={customers}
            imports={imports}
            invoices={invoices}
            setInvoices={setInvoices}
            onOpenPhonebook={handleTriggerPhonebook}
            plusTriggered={fabTriggers.banhang}
            onResetPlus={() => setFabTriggers(p => ({ ...p, banhang: false }))}
            onTriggerDebtRecord={handleTriggerAddDebtFromCheckout}
          />
        )}

        {activeTab === 'thongke' && (
          <ThongKeTab
            products={products}
            imports={imports}
            invoices={invoices}
          />
        )}

        {activeTab === 'baohanh' && (
          <BaoHanhTab
            products={products}
            customers={customers}
            warrantyReasons={warrantyReasons}
            warrantyTickets={warrantyTickets}
            setWarrantyTickets={setWarrantyTickets}
            onOpenPhonebook={handleTriggerPhonebook}
            plusTriggered={fabTriggers.baohanh}
            onResetPlus={() => setFabTriggers(p => ({ ...p, baohanh: false }))}
          />
        )}

        {activeTab === 'congno' && (
          <CongNoTab
            invoices={invoices}
            debts={debts}
            setDebts={setDebts}
            onOpenPhonebook={handleTriggerPhonebook}
            plusTriggered={fabTriggers.congno}
            onResetPlus={() => setFabTriggers(p => ({ ...p, congno: false }))}
          />
        )}
      </main>

      {/* 5. GLOBLAL BOTTOM-RIGHT FLOATING ACTION BUTTON "+ EXTREME QUICK ENTRY" (NO-PRINT) */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-600 dark:bg-cyan-500 rounded-full blur-xs opacity-40 group-hover:opacity-60 scale-105 transition-all"></div>
          <button
            onClick={handleFABTriggerClick}
            className="relative flex items-center justify-center w-12 h-12 bg-indigo-600 dark:bg-cyan-500 text-white hover:bg-indigo-700 dark:hover:bg-cyan-600 transition rounded-full shadow-lg group active:scale-95"
            title={`Thêm bản ghi nhanh cho mục [${
              activeTab === 'danhmuc' ? 'Danh mục' :
              activeTab === 'nhaphang' ? 'Nhập hàng' :
              activeTab === 'banhang' ? 'Hộc Bán hàng' :
              activeTab === 'thongke' ? 'Kho Tồn' :
              activeTab === 'baohanh' ? 'Bảo hành' : 'Sổ Công nợ'
            }]`}
          >
            <Plus className="w-6 h-6 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>
      </div>

      {/* REUSABLE SIMULATION DIRECTORY VIEW PICKER OVERLAY (NO-PRINT) */}
      <PhonebookModal
        isOpen={isPhonebookOpen}
        onClose={() => setIsPhonebookOpen(false)}
        onSelect={phonebookCallback}
        permissionGranted={contactsPermission}
        onRequestPermission={handleApproveContactsPermission}
      />

    </div>
  );
}
