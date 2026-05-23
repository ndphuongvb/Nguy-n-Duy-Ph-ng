/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { mockPhoneContacts } from '../data/mockContacts';
import { PhoneContact } from '../types';
import { Search, Contact, X, UserCheck, ShieldAlert } from 'lucide-react';

interface PhonebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contact: PhoneContact) => void;
  permissionGranted: boolean;
  onRequestPermission: () => void;
}

export function PhonebookModal({
  isOpen,
  onClose,
  onSelect,
  permissionGranted,
  onRequestPermission
}: PhonebookModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = mockPhoneContacts.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Contact className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-150">
              Danh bạ Điện thoại
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Guard */}
        {!permissionGranted ? (
          <div className="p-6 text-center flex flex-col items-center justify-center gap-4 flex-1">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                Yêu cầu cấp quyền quy cập Danh bạ
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] mx-auto">
                Vui lòng cho phép ứng dụng truy cập danh bạ điện thoại để chọn trực tiếp số điện thoại và địa chỉ khách hàng.
              </p>
            </div>
            <button
              onClick={onRequestPermission}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold transition shadow-md"
            >
              Cấp quyền ngay
            </button>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-cyan-400 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filtered.length > 0 ? (
                filtered.map((contact, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelect(contact);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/60 flex items-center justify-between transition group border border-transparent hover:border-gray-100 dark:hover:border-zinc-800"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition truncate">
                        {contact.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        {contact.phone}
                      </div>
                      {contact.address && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[280px]">
                          {contact.address}
                        </div>
                      )}
                    </div>
                    <UserCheck className="w-4 h-4 text-gray-300 dark:text-zinc-700 group-hover:text-indigo-500 dark:group-hover:text-cyan-400 transition shrink-0" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                  Không tìm thấy liên hệ nào trùng khớp
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
