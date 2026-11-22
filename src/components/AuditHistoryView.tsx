import React, { useState } from 'react';
import type { Task, AuditLog } from '../types';
import { History, Search, Clock, ShieldCheck } from 'lucide-react';

interface AuditHistoryViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ tasks, onSelectTask }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const allLogs: (AuditLog & { taskId: string; taskTitle: string })[] = [];
  tasks.forEach((task) => {
    task.auditLogs.forEach((log) => {
      allLogs.push({
        ...log,
        taskId: task.id,
        taskTitle: task.title,
      });
    });
  });

  allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredLogs = allLogs.filter((log) => {
    const matchSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = selectedAction === 'all' || log.action.includes(selectedAction);

    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            ประวัติการดำเนินงานทั้งระบบ (System Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกการทำรายการทุกขั้นตอน เพื่อตรวจสอบย้อนหลังว่าใครมอบหมาย ใครรับงาน ใครแก้ไข เมื่อไร
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อผู้ดำเนินการ / ชื่องาน / เลขที่งาน..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium cursor-pointer"
        >
          <option value="all">ทุกประเภทการดำเนินงาน</option>
          <option value="มอบหมาย">การมอบหมายงาน</option>
          <option value="เปลี่ยนสถานะ">การเปลี่ยนสถานะ</option>
          <option value="อัปเดตความคืบหน้า">การอัปเดตความคืบหน้า</option>
          <option value="เปลี่ยนผู้รับผิดชอบ">การขอ/อนุมัติเปลี่ยนผู้รับผิดชอบ</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">ไม่พบประวัติการดำเนินงานที่ตรงกับเงื่อนไข</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => onSelectTask(log.taskId)}
              className="p-4 hover:bg-slate-50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-blue-600">{log.taskId}</span>
                    <span className="font-bold text-slate-900">{log.actor}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 font-medium">{log.details}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5 truncate max-w-md">งาน: {log.taskTitle}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1 self-end sm:self-center">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
