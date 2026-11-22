import React from 'react';
import type { ActiveTab, User } from '../types';
import { 
  LayoutDashboard, 
  ClipboardList,
  CheckSquare, 
  Building2, 
  Kanban, 
  Calendar, 
  BarChart3, 
  History, 
  Settings,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: User;
  pendingApprovalsCount: number;
  onOpenCreateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  pendingApprovalsCount,
  onOpenCreateModal,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'ภาพรวม (Dashboard)',
      icon: LayoutDashboard,
      roles: ['admin', 'executive', 'dept_head', 'officer', 'secretary'],
    },
    {
      id: 'all_tasks' as ActiveTab,
      label: 'รายการงานทั้งหมด',
      icon: ClipboardList,
      roles: ['admin', 'executive', 'dept_head', 'officer', 'secretary'],
    },
    {
      id: 'my_tasks' as ActiveTab,
      label: 'งานของฉัน (My Tasks)',
      icon: CheckSquare,
      roles: ['admin', 'executive', 'dept_head', 'officer', 'secretary'],
    },
    {
      id: 'dept_tasks' as ActiveTab,
      label: 'งานของหน่วยงาน',
      icon: Building2,
      roles: ['admin', 'executive', 'dept_head', 'officer'],
    },
    {
      id: 'kanban' as ActiveTab,
      label: 'Kanban Board',
      icon: Kanban,
      roles: ['admin', 'executive', 'dept_head', 'officer'],
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'ปฏิทินกำหนดส่ง',
      icon: Calendar,
      roles: ['admin', 'executive', 'dept_head', 'officer'],
    },
    {
      id: 'approvals' as ActiveTab,
      label: 'พิจารณาคำขอเปลี่ยนผู้รับผิดชอบ',
      icon: AlertTriangle,
      badge: pendingApprovalsCount,
      roles: ['admin', 'executive', 'dept_head'],
    },
    {
      id: 'reports' as ActiveTab,
      label: 'รายงานสรุป',
      icon: BarChart3,
      roles: ['admin', 'executive', 'dept_head', 'secretary'],
    },
    {
      id: 'audit_history' as ActiveTab,
      label: 'ประวัติการดำเนินงาน',
      icon: History,
      roles: ['admin', 'executive', 'dept_head', 'officer', 'secretary'],
    },
    {
      id: 'settings' as ActiveTab,
      label: 'ตั้งค่าระบบ',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const canCreateTask = ['admin', 'executive', 'dept_head', 'secretary', 'officer'].includes(currentUser.role);

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-4">
        {canCreateTask && (
          <button
            onClick={onOpenCreateModal}
            className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-2 rounded-xl shadow-md hover:shadow-lg transition-all text-[11px] sm:text-xs tracking-tight whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>บันทึกข้อสั่งการ / สร้างงานใหม่</span>
          </button>
        )}

        <nav className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 text-left">
            เมนูหลัก
          </div>
          {menuItems.map((item) => {
            if (!item.roles.includes(currentUser.role)) return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 text-left flex-1 min-w-0 pr-1">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.id === 'approvals' ? (
                    <div className="text-left leading-tight min-w-0 flex-1">
                      <div className="text-xs sm:text-[13px] text-left">พิจารณาคำขอ</div>
                      <div className="text-[11px] sm:text-xs text-left opacity-80">เปลี่ยนผู้รับผิดชอบ</div>
                    </div>
                  ) : (
                    <span className="text-left leading-tight break-words flex-1">{item.label}</span>
                  )}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-6 text-left">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-left">
          <div className="text-xs font-bold text-slate-700 text-left">{currentUser.department}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 text-left">
            สถานะ: <span className="text-emerald-600 font-semibold">ออนไลน์</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
