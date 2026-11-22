import React, { useState } from 'react';
import type { Task, TaskStatus, ExecutiveAuthority, User as UserType } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { TaskCountdownBadge, CopyFollowUpButton, TaskStatusDot, FollowUpBadge } from './TaskCountdownBadge';
import { TaskCompletionModal } from './TaskCompletionModal';
import { TaskStore } from '../services/store';
import { canUserEditTask } from '../utils/followUp';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  User, 
  Calendar
} from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  currentUser?: UserType;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  canCreate: boolean;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  currentUser,
  onStatusChange,
  onSelectTask,
  onOpenCreateTask,
  canCreate,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [selectedExecutive, setSelectedExecutive] = useState<'all' | ExecutiveAuthority>('all');
  const [pendingCompletionTask, setPendingCompletionTask] = useState<Task | null>(null);

  const activeUser = currentUser || TaskStore.getCurrentUser();

  const columns: { id: TaskStatus; title: string; color: string; border: string; bg: string; icon: any }[] = [
    {
      id: 'รอดำเนินการ',
      title: 'รอดำเนินการ (Pending)',
      color: 'text-slate-700',
      border: 'border-slate-300',
      bg: 'bg-slate-100/70',
      icon: AlertCircle,
    },
    {
      id: 'กำลังดำเนินการ',
      title: 'กำลังดำเนินการ (In Progress)',
      color: 'text-blue-700',
      border: 'border-blue-400',
      bg: 'bg-blue-50/70',
      icon: Clock,
    },
    {
      id: 'ติดปัญหา',
      title: 'ติดปัญหา (Stuck)',
      color: 'text-amber-800',
      border: 'border-amber-400',
      bg: 'bg-amber-50/70',
      icon: AlertTriangle,
    },
    {
      id: 'เสร็จสิ้น',
      title: 'เสร็จสิ้น (Completed)',
      color: 'text-emerald-700',
      border: 'border-emerald-400',
      bg: 'bg-emerald-50/70',
      icon: CheckCircle2,
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      const found = tasks.find(t => t.id === taskId);
      if (found && currentUser && !canUserEditTask(currentUser, found)) {
        setDraggedTaskId(null);
        return;
      }
      if (targetStatus === 'เสร็จสิ้น') {
        if (found && found.status !== 'เสร็จสิ้น') {
          setPendingCompletionTask(found);
          setDraggedTaskId(null);
          return;
        }
      }
      onStatusChange(taskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  const handleConfirmCompletion = (completionDetail: string, completionDate: string) => {
    if (!pendingCompletionTask) return;
    TaskStore.updateTaskStatus(pendingCompletionTask.id, 'เสร็จสิ้น', completionDetail, completionDate);
    onStatusChange(pendingCompletionTask.id, 'เสร็จสิ้น');
    setPendingCompletionTask(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kanban Board (บอร์ดบริหารงาน)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ลากและวาง (Drag & Drop) การ์ดงานเพื่ออัปเดตสถานะการทำงาน ระบบบันทึกประวัติตรวจสอบให้อัตโนมัติ
          </p>
        </div>
        {canCreate && (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกข้อสั่งการ / สร้างงานใหม่</span>
          </button>
        )}
      </div>

      {/* Executive Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-700 pl-2 pr-1 shrink-0">
          🏛️ สายงานข้อสั่งการ:
        </span>
        <button
          onClick={() => setSelectedExecutive('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedExecutive === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedExecutive === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
          }`}>
            {tasks.length}
          </span>
        </button>

        {EXECUTIVE_LIST.map((exec) => {
          const isSelected = selectedExecutive === exec.id;
          const count = tasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id).length;
          return (
            <button
              key={exec.id}
              onClick={() => setSelectedExecutive(exec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? `${exec.badgeBg} text-white shadow-sm ring-2 ring-blue-500/30`
                  : `${exec.lightBg} hover:opacity-90`
              }`}
            >
              <span>{exec.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/30 text-white' : 'bg-white text-slate-800'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
        {columns.map((col) => {
          const ColumnIcon = col.icon;
          const colTasks = tasks.filter((t) => 
            t.status === col.id && 
            (selectedExecutive === 'all' || (t.executiveAuthority || 'ผอ.') === selectedExecutive)
          );

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border-2 ${col.border} ${col.bg} p-3 min-h-[500px] flex flex-col shadow-xs transition-all`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <ColumnIcon className={`w-4 h-4 ${col.color}`} />
                  <h3 className={`font-bold text-xs sm:text-sm ${col.color}`}>
                    {col.title}
                  </h3>
                </div>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-extrabold shadow-xs text-slate-700">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    ลากงานมาวางที่นี่
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isPermitted = canUserEditTask(currentUser, task);
                    return (
                    <div
                      key={task.id}
                      draggable={isPermitted}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onSelectTask(task.id)}
                      className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition space-y-3 ${
                        isPermitted ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TaskStatusDot task={task} />
                          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {task.id}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            (task.executiveAuthority || 'ผอ.') === 'ผอ.' ? 'bg-blue-600 text-white' :
                            task.executiveAuthority === 'รผอ.บร.' ? 'bg-purple-600 text-white' :
                            task.executiveAuthority === 'รผอ.พกป.' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {task.executiveAuthority || 'ผอ.'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.priority === 'เร่งด่วนมาก' ? 'bg-red-100 text-red-700' :
                            task.priority === 'เร่งด่วน' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700">{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>ส่ง: {task.deadline}</span>
                          </div>
                          <div className="ml-auto flex items-center gap-1 flex-wrap">
                            <TaskCountdownBadge task={task} compact={true} />
                            <FollowUpBadge count={task.followUpCount} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>ความคืบหน้า</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <CopyFollowUpButton task={task} variant="button-only" />
                          {isPermitted ? (
                            <select
                              value={task.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newSt = e.target.value as TaskStatus;
                                if (newSt === 'เสร็จสิ้น' && task.status !== 'เสร็จสิ้น') {
                                  setPendingCompletionTask(task);
                                  return;
                                }
                                onStatusChange(task.id, newSt);
                              }}
                              className="text-[10px] bg-slate-100 border-0 rounded px-1.5 py-1 text-slate-700 font-semibold cursor-pointer outline-hidden"
                            >
                              <option value="รอดำเนินการ">รอดำเนินการ</option>
                              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                              <option value="ติดปัญหา">ติดปัญหา</option>
                              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                            </select>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-1 rounded border border-slate-200">
                              🔒 {task.status}
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal กรอกรายละเอียดก่อนปิดงานเสร็จสิ้น */}
      {pendingCompletionTask && (
        <TaskCompletionModal
          task={pendingCompletionTask}
          currentUser={activeUser}
          onClose={() => setPendingCompletionTask(null)}
          onConfirm={handleConfirmCompletion}
        />
      )}

    </div>
  );
};
