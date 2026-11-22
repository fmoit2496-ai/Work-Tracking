import React, { useState } from 'react';
import type { User, UserRole, AppNotification } from '../types';
import { TaskStore } from '../services/store';
import { getAvatarByPrefix } from '../utils/avatars';
import { 
  Bell, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText,
  X,
  AlertTriangle,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  isAdminSession?: boolean;
  onRoleChange: (role: UserRole) => void;
  notifications: AppNotification[];
  onNotificationClick: (taskId: string, notifId: string) => void;
  onMarkAllRead: () => void;
  onSelectTask: (taskId: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdminSession = false,
  onRoleChange,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onSelectTask,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; assignee: string }[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const allTasks = TaskStore.getTasks();
      const filtered = allTasks
        .filter(t => t.title.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5)
        .map(t => ({ id: t.id, title: t.title, assignee: t.assignee }));
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_assigned':
        return <UserCheck className="w-5 h-5 text-blue-500" />;
      case 'deadline_3days':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'deadline_1day':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'overdue':
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'problem_reported':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 max-w-7xl mx-auto">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            W
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              ระบบติดตามงานภายในหน่วยงาน
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Internal Work Tracking System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 md:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาชื่องาน / เลขที่งาน..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-sm rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTask(item.id);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 transition flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-semibold text-blue-600 mr-2">{item.id}</span>
                    <span className="truncate text-slate-700 flex-1 font-medium">{item.title}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({item.assignee})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAdminSession ? (
            <div className="flex items-center gap-2 bg-amber-50/80 p-1 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-xs font-bold text-amber-900 pl-2 hidden sm:inline flex items-center gap-1">
                <span>👑</span>
                <span>สิทธิ์ (Admin):</span>
              </span>
              <select
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-white border-0 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-800 shadow-xs focus:ring-2 focus:ring-amber-500 cursor-pointer outline-hidden"
              >
                <option value="admin">👑 ผู้ดูแลระบบ (Admin)</option>
                <option value="executive">💼 ผู้บริหาร (Executive)</option>
                <option value="secretary">📝 เลขาหน้าห้อง ผอ./รองผอ.</option>
                <option value="dept_head">🏢 หัวหน้าหน่วยงาน (Dept Head)</option>
                <option value="officer">👤 ผู้ปฏิบัติงาน (Officer)</option>
              </select>
            </div>
          ) : currentUser.role === 'executive' ? (
            <div className="flex items-center gap-1.5 bg-indigo-50/90 px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">สิทธิ์:</span>
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <span>💼</span>
                <span>ผู้บริหาร (Executive)</span>
              </span>
            </div>
          ) : currentUser.role === 'secretary' ? (
            <div className="flex items-center gap-1.5 bg-blue-50/90 px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">สิทธิ์:</span>
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span>📝</span>
                <span>เลขาหน้าห้อง ผอ./รองผอ.</span>
              </span>
            </div>
          ) : currentUser.role === 'dept_head' ? (
            <div className="flex items-center gap-1.5 bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">สิทธิ์:</span>
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>🏢</span>
                <span>หัวหน้าหน่วยงาน (Dept Head)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">สิทธิ์:</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>👤</span>
                <span>ผู้ปฏิบัติงาน (Officer)</span>
              </span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-800 text-sm">การแจ้งเตือนระบบ</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} ใหม่
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllRead}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      ไม่มีการแจ้งเตือนใหม่ในขณะนี้
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onNotificationClick(notif.taskId, notif.id);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                          !notif.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={currentUser.avatar || getAvatarByPrefix(currentUser.name, currentUser.role, currentUser.position)}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser.position}
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="ออกจากระบบ / สลับบัญชีด้วย PIN"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
