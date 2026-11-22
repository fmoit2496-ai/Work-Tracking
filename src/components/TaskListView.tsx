import React, { useState, useEffect } from 'react';
import type { Task, TaskStatus, TaskPriority, ExecutiveAuthority, User } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { DEPARTMENTS } from '../services/mockData';
import { TaskCountdownBadge, CopyFollowUpButton, TaskStatusDot, FollowUpBadge } from './TaskCountdownBadge';
import { isSameDepartment, canUserEditTask } from '../utils/followUp';
import { 
  Search, 
  Plus, 
  Eye, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2,
  ArrowLeft,
  Lock
} from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  currentUser?: User;
  title?: string;
  initialExecutive?: 'all' | ExecutiveAuthority;
  initialStatus?: string;
  initialTimeline?: string;
  onSelectTask: (taskId: string) => void;
  onOpenCreateTask: () => void;
  canCreate: boolean;
  onBackToDashboard?: () => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  currentUser,
  title = 'รายการงานทั้งหมด',
  initialExecutive = 'all',
  initialStatus = 'all',
  initialTimeline = 'all',
  onSelectTask,
  onOpenCreateTask,
  canCreate,
  onBackToDashboard,
}) => {
  const [search, setSearch] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState<'all' | ExecutiveAuthority>(initialExecutive);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTimeline, setSelectedTimeline] = useState<string>(initialTimeline);
  const [sortField, setSortField] = useState<'deadline' | 'progress' | 'id'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (initialExecutive !== undefined) setSelectedExecutive(initialExecutive);
  }, [initialExecutive]);

  useEffect(() => {
    if (initialStatus !== undefined) setSelectedStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (initialTimeline !== undefined) setSelectedTimeline(initialTimeline);
  }, [initialTimeline]);

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase()) ||
      t.directiveRef?.toLowerCase().includes(search.toLowerCase());

    const matchExecutive = selectedExecutive === 'all' || (t.executiveAuthority || 'ผอ.') === selectedExecutive;
    const matchDept = selectedDept === 'all' || isSameDepartment(t.department, selectedDept);
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchTimeline = selectedTimeline === 'all' || t.timelineStatus === selectedTimeline;

    return matchSearch && matchExecutive && matchDept && matchStatus && matchPriority && matchTimeline;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let compA = a[sortField];
    let compB = b[sortField];

    if (sortField === 'deadline') {
      compA = new Date(a.deadline).getTime();
      compB = new Date(b.deadline).getTime();
    }

    if (compA < compB) return sortOrder === 'asc' ? -1 : 1;
    if (compA > compB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'กำลังดำเนินการ':
        return <span className="bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full text-xs">กำลังดำเนินการ</span>;
      case 'ติดปัญหา':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> ติดปัญหา</span>;
      case 'เสร็จสิ้น':
        return <span className="bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> เสร็จสิ้น</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full text-xs">รอดำเนินการ</span>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'เร่งด่วนมาก':
        return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">เร่งด่วนมาก</span>;
      case 'เร่งด่วน':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">เร่งด่วน</span>;
      default:
        return <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">ปกติ</span>;
    }
  };

  const getExecutiveBadge = (exec: ExecutiveAuthority) => {
    switch (exec) {
      case 'ผอ.':
        return <span className="bg-blue-600 text-white font-black px-2 py-0.5 rounded-md text-[11px] shadow-xs">ผอ.</span>;
      case 'รผอ.บร.':
        return <span className="bg-purple-600 text-white font-black px-2 py-0.5 rounded-md text-[11px] shadow-xs">รผอ.บร.</span>;
      case 'รผอ.พกป.':
        return <span className="bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md text-[11px] shadow-xs">รผอ.พกป.</span>;
      case 'รผอ.สปทร.':
        return <span className="bg-amber-600 text-white font-black px-2 py-0.5 rounded-md text-[11px] shadow-xs">รผอ.สปทร.</span>;
      default:
        return <span className="bg-slate-600 text-white font-black px-2 py-0.5 rounded-md text-[11px]">ผอ.</span>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {onBackToDashboard && (
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>← กลับสู่หน้าภาพรวม (Dashboard)</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            พบทั้งหมด {sortedTasks.length} รายการ (จากทั้งหมด {tasks.length} รายการ)
          </p>
        </div>
        {canCreate && (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกข้อสั่งการ / สร้างงานใหม่</span>
          </button>
        )}
      </div>

      {/* Executive Filter Bar (ผอ. / รผอ.บร. / รผอ.พกป. / รผอ.สปทร.) */}
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

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา ชื่องาน / รหัส / ผู้รับผิดชอบ..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="all">ทุกหน่วยงาน</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="รอดำเนินการ">รอดำเนินการ</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
            <option value="ติดปัญหา">ติดปัญหา</option>
            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="all">ทุกระดับความเร่งด่วน</option>
            <option value="ปกติ">ปกติ</option>
            <option value="เร่งด่วน">เร่งด่วน</option>
            <option value="เร่งด่วนมาก">เร่งด่วนมาก</option>
          </select>

          <select
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
          >
            <option value="all">ทุกสถานะกำหนดเวลา</option>
            <option value="ปกติ">ปกติ</option>
            <option value="ใกล้ครบกำหนด">ใกล้ครบกำหนด</option>
            <option value="เกินกำหนด">เกินกำหนด</option>
          </select>

        </div>
      </div>

      {/* คำอธิบายสถานะไอคอนกระพริบหน้าเลขที่งาน */}
      <div className="flex items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex-wrap">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <span>ไอคอนหน้าเลขที่งาน:</span>
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 ring-2 ring-red-200" />
            </span>
            <span className="font-bold text-red-700">สีแดง (กระพริบ)</span>
            <span className="text-slate-500">= เหลือเวลา ≤ 3 วัน จนเลยกำหนด</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-amber-200" />
            </span>
            <span className="font-bold text-amber-700">สีเหลือง (กระพริบ)</span>
            <span className="text-slate-500">= กำลังดำเนินการ (ติดตาม ≤ 3 ครั้ง)</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-emerald-200" />
            </span>
            <span className="font-bold text-emerald-700">สีเขียว</span>
            <span className="text-slate-500">= ปิดงานเสร็จสิ้น</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">เลขที่งาน</th>
                <th className="py-3 px-3">สายงาน</th>
                <th className="py-3 px-4 min-w-[200px]">ชื่องาน</th>
                <th className="py-3 px-3">หน่วยงาน</th>
                <th className="py-3 px-3">ผู้รับผิดชอบ</th>
                <th className="py-3 px-3">ผู้มอบหมาย</th>
                <th className="py-3 px-3">รับงาน</th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setSortField('deadline');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>กำหนดส่ง</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">สถานะ</th>
                <th className="py-3 px-3 min-w-[120px]">ความคืบหน้า</th>
                <th className="py-3 px-3">ความเร่งด่วน</th>
                <th className="py-3 px-3 min-w-[150px]">นับถอยหลังกำหนดส่ง</th>
                <th className="py-3 px-3 min-w-[120px]">สถานะติดตาม</th>
                <th className="py-3 px-3 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400">
                    ไม่พบรายการงานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                sortedTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onSelectTask(t.id)}
                    className="hover:bg-blue-50/50 transition cursor-pointer"
                  >
                    <td className="py-3 px-3 font-bold text-blue-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TaskStatusDot task={t} />
                        <span>{t.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getExecutiveBadge(t.executiveAuthority || 'ผอ.')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="line-clamp-2">{t.title}</div>
                      {t.hasProblemRequest && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200 mt-1 inline-block">
                          ⚠️ มีคำขอเปลี่ยนผู้รับผิดชอบ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {t.department}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                          {t.assignee.charAt(0)}
                        </span>
                        <span>{t.assignee}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {t.assignor}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {t.dateReceived}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                      {t.deadline}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(t.status)}
                        {!canUserEditTask(currentUser, t) && (
                          <span 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200"
                            title="สิทธิ์ดูอย่างเดียว ไม่สามารถแก้ไขสถานะหรือความคืบหน้าได้"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            <span>วิว</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              t.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 w-8">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getPriorityBadge(t.priority)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <TaskCountdownBadge task={t} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <FollowUpBadge count={t.followUpCount} />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <CopyFollowUpButton task={t} variant="button-only" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t.id);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
