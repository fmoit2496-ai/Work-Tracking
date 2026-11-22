import React from 'react';
import type { UserRole } from '../types';
import { TaskStore } from '../services/store';
import { getAvatarByPrefix } from '../utils/avatars';
import { Settings, Shield, Users, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const users = TaskStore.getUsers();

  const roleDescriptions: Record<UserRole, { title: string; desc: string; badge: string }> = {
    admin: {
      title: 'ผู้ดูแลระบบ (Admin)',
      desc: 'สามารถจัดการผู้ใช้, หน่วยงาน, สิทธิ์การใช้งานทุกส่วน และตั้งค่าระบบ',
      badge: 'bg-purple-100 text-purple-800',
    },
    executive: {
      title: 'ผู้บริหาร (Executive)',
      desc: 'ดูภาพรวม Dashboard, ดูผลงานทุกหน่วยงาน, มอบหมายงาน และพิจารณาอนุมัติคำขอ',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    dept_head: {
      title: 'หัวหน้าหน่วยงาน (Dept Head)',
      desc: 'มอบหมายงานในกอง/สำนัก, ติดตามความคืบหน้าของทีมงาน, ตรวจรับงาน และพิจารณาอนุมัติคำขอ',
      badge: 'bg-blue-100 text-blue-800',
    },
    officer: {
      title: 'ผู้ปฏิบัติงาน (Officer)',
      desc: 'ดูงานของตนเอง, อัปเดต % ความคืบหน้า, แนบไฟล์เอกสาร และแจ้งติดปัญหาขอเปลี่ยนผู้รับผิดชอบ',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    secretary: {
      title: 'เลขาหน้าห้อง ผอ./รองผอ. (Secretary)',
      desc: 'บันทึกข้อสั่งการของ ผอ. และ รอง ผอ. ทุกสายงาน (ผอ., รผอ.บร., รผอ.พกป., รผอ.สปทร.) มอบหมายงานไปยังหน่วยงานต่างๆ',
      badge: 'bg-rose-100 text-rose-800',
    },
  };

  const resetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลระบบกลับสู่ค่าเริ่มต้น seed data ภาษาไทย หรือไม่?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            ตั้งค่าระบบติดตามงาน (System Settings)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            จัดการข้อมูลผู้ใช้งาน หน่วยงาน สิทธิ์การเข้าถึง และการแจ้งเตือน
          </p>
        </div>

        <button
          onClick={resetData}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-red-200 transition cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>รีเซ็ตข้อมูลตัวอย่าง</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          โครงสร้างสิทธิ์การใช้งาน 4 ระดับ (Role-Based Access Control)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(roleDescriptions) as UserRole[]).map((r) => {
            const roleInfo = roleDescriptions[r];
            return (
              <div key={r} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${roleInfo.badge}`}>
                    {roleInfo.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{roleInfo.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            รายชื่อผู้ใช้งานในระบบ ({users.length} คน)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <th className="py-3 px-4">ผู้ใช้งาน</th>
                <th className="py-3 px-3">ตำแหน่ง</th>
                <th className="py-3 px-3">หน่วยงาน</th>
                <th className="py-3 px-3 text-right">สิทธิ์การใช้งาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <img src={u.avatar || getAvatarByPrefix(u.name, u.role, u.position)} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.position}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{u.department}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      roleDescriptions[u.role].badge
                    }`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
