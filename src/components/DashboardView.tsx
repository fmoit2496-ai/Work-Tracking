import React, { useState } from 'react';
import type { Task, User, ExecutiveAuthority } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { TaskCountdownBadge, CopyFollowUpButton, TaskStatusDot, FollowUpBadge } from './TaskCountdownBadge';
import { getThaiDateString, isNameMatch, isSameDepartment } from '../utils/followUp';
import { ExecutiveTaskListModal } from './ExecutiveTaskListModal';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Layers, 
  ChevronRight,
  CalendarCheck,
  Plus,
  Crown
} from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  currentUser: User;
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  onViewAllTasks: (executiveId?: ExecutiveAuthority, statusKey?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  currentUser,
  onSelectTask,
  onOpenCreateTask,
  onViewAllTasks,
}) => {
  const [modalExecutive, setModalExecutive] = useState<ExecutiveAuthority | null>(null);
  const [modalStatusKey, setModalStatusKey] = useState<string | null>(null);
  const [modalStatusTitle, setModalStatusTitle] = useState<string | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const openExecutiveModal = (execId: ExecutiveAuthority) => {
    setModalExecutive(execId);
    setModalStatusKey(null);
    setModalStatusTitle(null);
    setIsListModalOpen(true);
  };

  const openStatusModal = (statusKey: string, title: string) => {
    setModalExecutive(null);
    setModalStatusKey(statusKey);
    setModalStatusTitle(title);
    setIsListModalOpen(true);
  };

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'กำลังดำเนินการ').length;
  const pendingTasks = tasks.filter(t => t.status === 'รอดำเนินการ').length;
  const completedTasks = tasks.filter(t => t.status === 'เสร็จสิ้น').length;

  const approachingTasks = tasks.filter(t => t.timelineStatus === 'ใกล้ครบกำหนด' && t.status !== 'เสร็จสิ้น').length;
  const overdueTasks = tasks.filter(t => t.timelineStatus === 'เกินกำหนด' && t.status !== 'เสร็จสิ้น').length;

  const todayTasks = tasks.filter(t => {
    if (t.status === 'เสร็จสิ้น') return false;
    if (currentUser.role === 'officer') {
      return isNameMatch(t.assignee, currentUser.name);
    }
    if (currentUser.role === 'dept_head') {
      return isSameDepartment(t.department, currentUser.department);
    }
    if (currentUser.role === 'secretary') {
      return isNameMatch(t.assignee, currentUser.name) || isSameDepartment(t.department, currentUser.department) || (t.assignor && t.assignor.includes(currentUser.name));
    }
    return true;
  }).slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ส่วนหัวสรุปภาพรวมแบบกระชับ (แทนแบนเนอร์เดิม) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ภาพรวมการติดตามงานตามข้อสั่งการ
          </h2>
          <p className="text-xs text-slate-500">
            ประจำวันที่ {getThaiDateString()} • องค์การสะพานปลา
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onOpenCreateTask}
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างงานใหม่</span>
          </button>
          <button
            onClick={() => onViewAllTasks()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
          >
            <span>ดูตารางงานทั้งหมด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div 
          onClick={() => openStatusModal('all', 'รายการงานทั้งหมดในระบบ')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานทั้งหมด"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">งานทั้งหมด</span>
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-blue-50 transition">
              <Layers className="w-4 h-4 text-slate-700 group-hover:text-blue-600 transition" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>รายการสะสม</span>
            <span className="text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => openStatusModal('กำลังดำเนินการ', 'รายการงานที่กำลังดำเนินการ')}
          className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานที่กำลังดำเนินการ"
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold">กำลังดำเนินการ</span>
            <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">{inProgressTasks}</div>
          <div className="text-[11px] text-blue-500 mt-1 flex items-center justify-between">
            <span>อยู่ระหว่างทำงาน</span>
            <span className="text-blue-700 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => openStatusModal('รอดำเนินการ', 'รายการงานที่รอดำเนินการ')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานที่รอดำเนินการ"
        >
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold">รอดำเนินการ</span>
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition">
              <AlertCircle className="w-4 h-4 text-slate-500" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-700 mt-2">{pendingTasks}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>รอเริ่มดำเนินการ</span>
            <span className="text-slate-700 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => openStatusModal('ใกล้ครบกำหนด', 'รายการงานที่ใกล้ครบกำหนดส่ง (เหลือ ≤ 3 วัน)')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานที่ใกล้ครบกำหนด"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold">ใกล้ครบกำหนด</span>
            <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{approachingTasks}</div>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center justify-between">
            <span>เหลือ ≤ 3 วัน</span>
            <span className="text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => openStatusModal('เกินกำหนด', 'รายการงานที่เกินกำหนดส่ง (ต้องเร่งด่วน)')}
          className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs hover:border-red-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานที่เกินกำหนด"
        >
          <div className="flex items-center justify-between text-red-600">
            <span className="text-xs font-semibold">เกินกำหนด</span>
            <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{overdueTasks}</div>
          <div className="text-[11px] text-red-500 mt-1 flex items-center justify-between">
            <span>ต้องเร่งด่วน</span>
            <span className="text-red-700 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div 
          onClick={() => openStatusModal('เสร็จสิ้น', 'รายการงานที่เสร็จสิ้นสมบูรณ์')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 group"
          title="คลิกเพื่อดูรายการงานที่เสร็จสิ้น"
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">เสร็จสิ้น</span>
            <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{completedTasks}</div>
          <div className="text-[11px] text-emerald-500 mt-1 flex items-center justify-between">
            <span>เสร็จสมบูรณ์</span>
            <span className="text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5">
              <span>ดู</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* สรุปงานแยกตาม 4 สายงานผู้บริหาร (ผอ. / รผอ.บร. / รผอ.พกป. / รผอ.สปทร.) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              สรุปงานตามสายงานข้อสั่งการผู้บริหาร (ผอ. & รอง ผอ.)
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              แยกติดตามสถานะงานตาม 4 สายงาน: ผอ. / รผอ.บร. / รผอ.พกป. / รผอ.สปทร.
            </p>
          </div>
          <button
            onClick={() => onViewAllTasks()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            ดูรายละเอียดทั้งหมด <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXECUTIVE_LIST.map((exec) => {
            const execTasks = tasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id);
            const inProg = execTasks.filter(t => t.status === 'กำลังดำเนินการ').length;
            const stuck = execTasks.filter(t => t.status === 'ติดปัญหา').length;
            const completed = execTasks.filter(t => t.status === 'เสร็จสิ้น').length;
            const overdue = execTasks.filter(t => t.timelineStatus === 'เกินกำหนด' && t.status !== 'เสร็จสิ้น').length;
            const avgProgress = execTasks.length > 0 
              ? Math.round(execTasks.reduce((acc, t) => acc + t.progress, 0) / execTasks.length)
              : 0;

            return (
              <div
                key={exec.id}
                onClick={() => openExecutiveModal(exec.id)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-white to-slate-50/50 space-y-3 transform hover:-translate-y-1 group"
                title={`คลิกเพื่อดูรายการงานทั้งหมดของ ${exec.roleTitle} (${exec.label})`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${exec.badgeBg} ${exec.badgeText} shadow-xs`}>
                    {exec.label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-blue-100 group-hover:text-blue-800 transition">
                    {execTasks.length} รายการ
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition">
                    {exec.roleTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exec.shortDesc}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>ความคืบหน้ารวม</span>
                    <span className="font-bold text-slate-900">{avgProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        exec.id === 'ผอ.' ? 'bg-blue-600' :
                        exec.id === 'รผอ.บร.' ? 'bg-purple-600' :
                        exec.id === 'รผอ.พกป.' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-blue-50/60 p-1.5 rounded-lg">
                    <div className="text-[10px] text-blue-600 font-semibold">กำลังทำ</div>
                    <div className="text-xs font-extrabold text-blue-700">{inProg}</div>
                  </div>
                  <div className="bg-emerald-50/60 p-1.5 rounded-lg">
                    <div className="text-[10px] text-emerald-600 font-semibold">เสร็จ</div>
                    <div className="text-xs font-extrabold text-emerald-700">{completed}</div>
                  </div>
                  <div className={`p-1.5 rounded-lg ${overdue > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
                    <div className="text-[10px] font-semibold">{overdue > 0 ? 'เกินกำหนด' : 'ติดปัญหา'}</div>
                    <div className="text-xs font-extrabold">{overdue > 0 ? overdue : stuck}</div>
                  </div>
                </div>

                {/* Click to view indicator */}
                <div className="pt-1 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:text-blue-800 transition">
                  <span>คลิกดูรายการทั้งหมด ({execTasks.length})</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              รายการ “งานที่ต้องดำเนินการวันนี้”
            </h3>
            <p className="text-slate-500 text-xs">งานสำคัญที่มีความเร่งด่วน หรือใกล้ถึงกำหนดส่ง</p>
          </div>
          <button
            onClick={() => onViewAllTasks()}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            ดูทั้งหมด <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 px-3 rounded-2xl transition cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                  task.priority === 'เร่งด่วนมาก' ? 'bg-red-500 animate-ping' :
                  task.priority === 'เร่งด่วน' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TaskStatusDot task={task} />
                    <span className="text-xs font-bold text-blue-600">{task.id}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      (task.executiveAuthority || 'ผอ.') === 'ผอ.' ? 'bg-blue-600 text-white' :
                      task.executiveAuthority === 'รผอ.บร.' ? 'bg-purple-600 text-white' :
                      task.executiveAuthority === 'รผอ.พกป.' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {task.executiveAuthority || 'ผอ.'}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{task.title}</span>
                    
                    {/* Blinking countdown badge until closed */}
                    <TaskCountdownBadge task={task} />

                    {/* สถานะครั้งที่ติดตามงาน */}
                    <FollowUpBadge count={task.followUpCount} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                    <span>🏢 {task.department}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {task.assignee.charAt(0)}
                      </span>
                      <span>ผู้รับผิดชอบ: {task.assignee}</span>
                    </span>
                    <span>📅 กำหนดส่ง: {task.deadline}</span>
                    {task.directiveRef && (
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        📜 {task.directiveRef}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center flex-wrap sm:flex-nowrap">
                <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-8 text-right">
                  {task.progress}%
                </span>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  task.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'ติดปัญหา' ? 'bg-amber-100 text-amber-700' :
                  task.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {task.status}
                </span>

                {/* ปุ่มคัดลอกข้อความเพื่อติดตามงาน */}
                <CopyFollowUpButton task={task} variant="compact" currentUser={currentUser} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal แสดงรายการงานตามผู้บริหาร / สถานะที่เลือกคลิก */}
      {isListModalOpen && (
        <ExecutiveTaskListModal
          executiveId={modalExecutive}
          statusFilterKey={modalStatusKey}
          statusFilterTitle={modalStatusTitle}
          tasks={tasks}
          currentUser={currentUser}
          onClose={() => setIsListModalOpen(false)}
          onSelectTask={(id) => onSelectTask(id)}
          onViewInFullTable={(execId, statusKey) => {
            setIsListModalOpen(false);
            onViewAllTasks(execId, statusKey);
          }}
        />
      )}

    </div>
  );
};
