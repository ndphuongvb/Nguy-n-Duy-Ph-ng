/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Dispatch, SetStateAction, FormEvent } from 'react';
import { Product, Unit, Customer, WarrantyCategory } from '../../types';
import { Plus, Edit2, Trash2, Contact, ListCollapse, Bookmark, Users, HeartHandshake } from 'lucide-react';

interface DanhMucTabProps {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  units: Unit[];
  setUnits: Dispatch<SetStateAction<Unit[]>>;
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  warrantyReasons: WarrantyCategory[];
  setWarrantyReasons: Dispatch<SetStateAction<WarrantyCategory[]>>;
  onOpenPhonebook: (callback: (contact: { name: string; phone: string; address?: string }) => void) => void;
  plusTriggered: boolean;
  onResetPlus: () => void;
}

type SubTab = 'sanpham' | 'donvitinh' | 'khachhang' | 'baohanh';

export default function DanhMucTab({
  products,
  setProducts,
  units,
  setUnits,
  customers,
  setCustomers,
  warrantyReasons,
  setWarrantyReasons,
  onOpenPhonebook,
  plusTriggered,
  onResetPlus
}: DanhMucTabProps) {
  const [activeSub, setActiveSub] = useState<SubTab>('sanpham');
  
  // Create / Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Field States
  const [nameField, setNameField] = useState('');
  const [addressField, setAddressField] = useState('');
  const [phoneField, setPhoneField] = useState('');

  // Handle addition trigger from parent "+" button
  useEffect(() => {
    if (plusTriggered) {
      handleAddNew();
      onResetPlus();
    }
  }, [plusTriggered]);

  const handleAddNew = () => {
    setEditingId(null);
    setNameField('');
    setAddressField('');
    setPhoneField('');
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    if (activeSub === 'sanpham') {
      const item = products.find(p => p.id === id);
      if (item) {
        setNameField(item.name);
        setIsModalOpen(true);
      }
    } else if (activeSub === 'donvitinh') {
      const item = units.find(u => u.id === id);
      if (item) {
        setNameField(item.name);
        setIsModalOpen(true);
      }
    } else if (activeSub === 'khachhang') {
      const item = customers.find(c => c.id === id);
      if (item) {
        setNameField(item.name);
        setAddressField(item.address);
        setPhoneField(item.phone);
        setIsModalOpen(true);
      }
    } else if (activeSub === 'baohanh') {
      const item = warrantyReasons.find(w => w.id === id);
      if (item) {
        setNameField(item.name);
        setIsModalOpen(true);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá mặt mục này không?')) return;
    
    if (activeSub === 'sanpham') {
      setProducts(prev => prev.filter(p => p.id !== id));
    } else if (activeSub === 'donvitinh') {
      setUnits(prev => prev.filter(u => u.id !== id));
    } else if (activeSub === 'khachhang') {
      setCustomers(prev => prev.filter(c => c.id !== id));
    } else if (activeSub === 'baohanh') {
      setWarrantyReasons(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!nameField.trim()) return;

    if (editingId) {
      // Edit
      if (activeSub === 'sanpham') {
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, name: nameField.trim() } : p));
      } else if (activeSub === 'donvitinh') {
        setUnits(prev => prev.map(u => u.id === editingId ? { ...u, name: nameField.trim() } : u));
      } else if (activeSub === 'khachhang') {
        setCustomers(prev => prev.map(c => c.id === editingId ? { 
          ...c, 
          name: nameField.trim(), 
          address: addressField.trim(), 
          phone: phoneField.trim() 
        } : c));
      } else if (activeSub === 'baohanh') {
        setWarrantyReasons(prev => prev.map(w => w.id === editingId ? { ...w, name: nameField.trim() } : w));
      }
    } else {
      // Add
      const newId = `item_${Date.now()}`;
      if (activeSub === 'sanpham') {
        setProducts(prev => [...prev, { id: newId, name: nameField.trim() }]);
      } else if (activeSub === 'donvitinh') {
        setUnits(prev => [...prev, { id: newId, name: nameField.trim() }]);
      } else if (activeSub === 'khachhang') {
        setCustomers(prev => [...prev, { 
          id: newId, 
          name: nameField.trim(), 
          address: addressField.trim() || 'N/A', 
          phone: phoneField.trim() || 'N/A' 
        }]);
      } else if (activeSub === 'baohanh') {
        setWarrantyReasons(prev => [...prev, { id: newId, name: nameField.trim() }]);
      }
    }

    setIsModalOpen(false);
    setNameField('');
    setAddressField('');
    setPhoneField('');
    setEditingId(null);
  };

  const handleImportContact = () => {
    onOpenPhonebook((contact) => {
      setNameField(contact.name);
      setPhoneField(contact.phone);
      if (contact.address) {
        setAddressField(contact.address);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs nav */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-zinc-800/80 rounded-xl">
        <button
          onClick={() => setActiveSub('sanpham')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSub === 'sanpham'
              ? 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Mặt Hàng
        </button>
        <button
          onClick={() => setActiveSub('donvitinh')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSub === 'donvitinh'
              ? 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <ListCollapse className="w-3.5 h-3.5" />
          Đơn Vị Tính
        </button>
        <button
          onClick={() => setActiveSub('khachhang')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSub === 'khachhang'
              ? 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Khách Hàng
        </button>
        <button
          onClick={() => setActiveSub('baohanh')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSub === 'baohanh'
              ? 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          Lý Do Bảo Hành
        </button>
      </div>

      {/* Main lists */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/30">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {activeSub === 'sanpham' && 'Danh sách Tên hàng hóa'}
            {activeSub === 'donvitinh' && 'Danh sách Đơn vị tính'}
            {activeSub === 'khachhang' && 'Danh mục Khách hàng'}
            {activeSub === 'baohanh' && 'Danh mục lỗi bảo hành'}
          </h3>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 dark:bg-cyan-500 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 dark:hover:bg-cyan-600 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm mới
          </button>
        </div>

        <div className="divide-y divide-gray-150/60 dark:divide-zinc-800/80 max-h-[380px] overflow-y-auto">
          {activeSub === 'sanpham' && (
            products.length > 0 ? (
              products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{p.name}</span>
                  <div className="flex gap-2.5">
                    <button onClick={() => handleEdit(p.id)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">Chưa có sản phẩm nào. Click Thêm mới để tạo!</div>
            )
          )}

          {activeSub === 'donvitinh' && (
            units.length > 0 ? (
              units.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                  <div className="flex gap-2.5">
                    <button onClick={() => handleEdit(u.id)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">Chưa có đơn vị tính nào.</div>
            )
          )}

          {activeSub === 'khachhang' && (
            customers.length > 0 ? (
              customers.map((c) => (
                <div key={c.id} className="flex items-start justify-between p-3.5 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{c.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">SĐT: {c.phone}</div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">ĐC: {c.address}</div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => handleEdit(c.id)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">Chưa có khách hàng nào.</div>
            )
          )}

          {activeSub === 'baohanh' && (
            warrantyReasons.length > 0 ? (
              warrantyReasons.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{w.name}</span>
                  <div className="flex gap-2.5">
                    <button onClick={() => handleEdit(w.id)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">Chưa có lý do bảo hành nào được cấu hình.</div>
            )
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-sm p-5 shadow-2xl animate-in scale-in-95 duration-150">
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-150 mb-3 border-b pb-2 dark:border-zinc-800">
              {editingId ? 'Chỉnh sửa thông tin' : 'Thêm danh mục mới'}
            </h4>
            
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  {activeSub === 'sanpham' ? 'Tên Hàng Hóa' : activeSub === 'donvitinh' ? 'Đơn Vị Tính' : activeSub === 'khachhang' ? 'Tên Khách Hàng' : 'Lý Do Bảo Hành'}
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    required
                    value={nameField}
                    onChange={(e) => setNameField(e.target.value)}
                    placeholder={activeSub === 'sanpham' ? 'Ví dụ: RAM Kingmax 8GB' : activeSub === 'donvitinh' ? 'Cái, chiếc, bộ...' : activeSub === 'khachhang' ? 'Nguyễn Phương' : 'Lỗi quạt gió'}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200"
                  />
                  {activeSub === 'khachhang' && (
                    <button
                      type="button"
                      onClick={handleImportContact}
                      className="p-1.5 border border-indigo-200 hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-indigo-600 dark:text-cyan-400 rounded-lg transition"
                      title="Nhập từ danh bạ điện thoại"
                    >
                      <Contact className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {activeSub === 'khachhang' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      required
                      value={phoneField}
                      onChange={(e) => setPhoneField(e.target.value)}
                      placeholder="Số điện thoại di động"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      required
                      value={addressField}
                      onChange={(e) => setAddressField(e.target.value)}
                      placeholder="Số nhà, Tên đường, Tỉnh thành"
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-500 dark:border-zinc-800 dark:text-gray-400 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 dark:bg-cyan-500 hover:bg-indigo-700 dark:hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold transition"
                >
                  Lưu Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
