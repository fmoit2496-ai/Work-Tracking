import React, { useState } from 'react';
import type { Task, ExecutiveAuthority, User } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { TaskCountdownBadge, CopyFollowUpButton, TaskStatusDot, FollowUpBadge } from './TaskCountdownBadge';
import { 
  X, 
  Search, 
  ExternalLink, 
  Building2, 
  Calendar, 
  Crown, 
  Layers, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface ExecutiveTaskListModalProps {
  executiveId: ExecutiveAuthority | null;
  statusFilterKey?: string | null; // e.g. 'กำลังดำเนินการ', 'เกินกำหนด', 'all', etc.
  statusFilterTitle?: string | null;
  tasks: Task[];
  currentUser?: User;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onViewInFullTable: (exec?: ExecutiveAuthority, status?: string) => void;
}

export const ExecutiveTaskListModal: React.FC<ExecutiveTaskListModalProps> = ({
  executiveId,
  statusFilterKey,
  statusFilterTitle,
  tasks,
  currentUser,
  onClose,
  onSelectTask,
  onViewInFullTable,
}) => {
  const [search, setSearch] = useState('');
  const [internalStatusFilter, setInternalStatusFilter] = useState<string>('all');

  const executiveInfo = executiveId ? EXECUTIVE_LIST.find((e) => e.id === executiveId) : null;

  // Filter tasks
  const matchedTasks = tasks.filter((t) => {
    // Executive filter
    if (executiveId) {
      if ((t.executiveAuthority || 'ผอ.') !== executiveId) return false;
    }

    // Status / Timeline filter from top cards
    if (statusFilterKey && statusFilterKey !== 'all') {
      if (statusFilterKey === 'ใกล้ครบกำหนด' || statusFilterKey === 'เกินกำหนด') {
        if (t.timelineStatus !== statusFilterKey) return false;
      } else {
        if (t.status !== statusFilterKey) return false;
      }
    }

    // Internal status tab filter
    if (internalStatusFilter !== 'all') {
      if (t.status !== internalStatusFilter) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchDept = t.department.toLowerCase().includes(q);
      const matchAssignee = t.assignee.toLowerCase().includes(q);
      const matchRef = t.directiveRef?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchDept && !matchAssignee && !matchRef) return false;
    }

    return true;
  });

  const modalTitle = executiveInfo
    ? `รายการงานทั้งหมดตามข้อสั่งการ: ${executiveInfo.roleTitle} (${executiveInfo.label})`
    : statusFilterTitle || 'รายการงานที่เลือก';

  const modalSubtitle = executiveInfo
    ? `${executiveInfo.shortDesc} • ทั้งหมด ${matchedTasks.length} รายการ`
    : `พบทั้งหมด ${matchedTasks.length} รายการ`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Sticky Header */}
        <div className={`p-5 shrink-0 relative text-white ${
          executiveInfo
            ? executiveInfo.id === 'ผอ.'
              ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900'
              : executiveInfo.id === 'รผอ.บร.'
              ? 'bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900'
              : executiveInfo.id === 'รผอ.พกป.'
              ? 'bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900'
              : 'bg-gradient-to-r from-amber-600 via-orange-700 to-slate-900'
            : 'bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900'
        }`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur rounded-2xl shrink-0">
              {executiveInfo ? <Crown className="w-6 h-6 text-white" /> : <Layers className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {executiveInfo && (
                  <span className="bg-white text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-md shadow-xs">
                    {executiveInfo.label}
                  </span>
                )}
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug">
                  {modalTitle}
                </h2>
              </div>
              <p className="text-white/80 text-xs mt-1 font-medium">
                {modalSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่องาน / รหัส / หน่วยงาน / ผู้รับผิดชอบ..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'กำลังดำเนินการ', label: 'กำลังดำเนินการ' },
              { id: 'รอดำเนินการ', label: 'รอดำเนินการ' },
              { id: 'ติดปัญหา', label: 'ติดปัญหา' },
              { id: 'เสร็จสิ้น', label: 'เสร็จสิ้น' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInternalStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  internalStatusFilter === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 space-y-3">
          {matchedTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold">ไม่พบรายการงานที่ตรงกับเงื่อนไข</div>
              <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหาหรือเลือกสถานะอื่น</p>
            </div>
          ) : (
            matchedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => {
                  onSelectTask(task.id);
                  onClose();
                }}
                className="pt-3 first:pt-0 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-blue-50/40 p-3 rounded-2xl transition cursor-pointer border border-transparent hover:border-blue-200"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TaskStatusDot task={task} />
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded text-white ${
                      (task.executiveAuthority || 'ผอ.') === 'ผอ.' ? 'bg-blue-600' :
                      task.executiveAuthority === 'รผอ.บร.' ? 'bg-purple-600' :
                      task.executiveAuthority === 'รผอ.พกป.' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}>
                      {task.executiveAuthority || 'ผอ.'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {task.title}
                    </h4>

                    {/* Blinking Countdown Alert Badge */}
                    <TaskCountdownBadge task={task} />

                    {/* Follow-up round badge */}
                    <FollowUpBadge count={task.followUpCount} />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {task.department}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {task.assignee.charAt(0)}
                      </span>
                      <span>{task.assignee}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      กำหนดส่ง: {task.deadline}
                    </span>
                    {task.directiveRef && (
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded text-[11px]">
                        📜 {task.directiveRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-8 text-right">
                    {task.progress}%
                  </span>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    task.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-700' :
                    task.status === 'ติดปัญหา' ? 'bg-amber-100 text-amber-700' :
                    task.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {task.status}
                  </span>

                  <CopyFollowUpButton task={task} variant="button-only" currentUser={currentUser} />

                  <span className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="คลิกดูรายละเอียด">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            คลิกที่รายการงานเพื่อดูรายละเอียด หรือกดดูในตารางเต็ม
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewInFullTable(executiveId || undefined, statusFilterKey || undefined);
              }}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดดูในตารางเต็ม</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
