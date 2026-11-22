import React, { useState } from 'react';
import type { Task, User, TaskStatus, Attachment } from '../types';
import { TaskStore } from '../services/store';
import { TaskCountdownBadge, CopyFollowUpButton, TaskStatusDot, FollowUpBadge } from './TaskCountdownBadge';
import { TaskCompletionModal } from './TaskCompletionModal';
import { canUserEditTask } from '../utils/followUp';
import { 
  X, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Paperclip, 
  Upload, 
  History, 
  FileText,
  AlertCircle,
  Send,
  Mail,
  CheckCircle2,
  FileCheck,
  UserCheck,
  Building2
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  currentUser,
  onClose,
  onTaskUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'attachments' | 'audit'>('details');
  const [progressVal, setProgressVal] = useState<number>(task.progress);
  const [progressNote, setProgressNote] = useState<string>('');
  const [showProblemForm, setShowProblemForm] = useState<boolean>(false);
  const [problemReason, setProblemReason] = useState<string>('');
  const [requestedAssignee, setRequestedAssignee] = useState<string>('');
  const [fileInput, setFileInput] = useState<string>('');
  const [fileType, setFileType] = useState<Attachment['fileType']>('pdf');
  const [emailNoticeSent, setEmailNoticeSent] = useState<boolean>(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);

  // Dept Head assignment state
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [headNotes, setHeadNotes] = useState<string>('');
  const [showHeadAssignForm, setShowHeadAssignForm] = useState<boolean>(task.assignee === 'รอหัวหน้าหน่วยงานมอบหมาย');

  const users = TaskStore.getUsers();
  const canEdit = canUserEditTask(currentUser, task);

  const handleSaveProgress = () => {
    if (progressVal === 100 && task.status !== 'เสร็จสิ้น') {
      setIsCompletionModalOpen(true);
      return;
    }
    TaskStore.updateTaskProgress(task.id, progressVal, progressNote);
    setProgressNote('');
    onTaskUpdated();
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === 'เสร็จสิ้น') {
      setIsCompletionModalOpen(true);
      return;
    }
    TaskStore.updateTaskStatus(task.id, newStatus);
    onTaskUpdated();
  };

  const handleConfirmCompletion = (completionDetail: string, completionDate: string) => {
    TaskStore.updateTaskStatus(task.id, 'เสร็จสิ้น', completionDetail, completionDate);
    setIsCompletionModalOpen(false);
    setProgressVal(100);
    onTaskUpdated();
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInput.trim()) return;
    TaskStore.addAttachment(task.id, fileInput, '1.5 MB', fileType);
    setFileInput('');
    onTaskUpdated();
  };

  const handleProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemReason.trim() || !requestedAssignee) return;

    TaskStore.submitProblemRequest(task.id, problemReason, requestedAssignee);
    setShowProblemForm(false);
    onTaskUpdated();
  };

  const handleResendEmail = () => {
    TaskStore.resendEmailNotification(task.id);
    setEmailNoticeSent(true);
    setTimeout(() => setEmailNoticeSent(false), 4000);
    onTaskUpdated();
  };

  const handleDeptHeadAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;

    TaskStore.assignOfficerByDeptHead(task.id, selectedOfficer, headNotes);
    setShowHeadAssignForm(false);
    onTaskUpdated();
  };

  const isPendingDeptHeadAssignment = task.assignee === 'รอหัวหน้าหน่วยงานมอบหมาย';
  const canAssignOfficer = ['admin', 'executive', 'dept_head'].includes(currentUser.role);
  const deptOfficers = users.filter((u) => u.department === task.department);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Container with strict max-h-[90vh] & flex flex-col to prevent overflow */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Sticky Top Header */}
        <div className="bg-slate-900 text-white p-5 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TaskStatusDot task={task} size="md" />
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
              {task.id}
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-md text-white shadow-xs ${
              (task.executiveAuthority || 'ผอ.') === 'ผอ.' ? 'bg-blue-600' :
              task.executiveAuthority === 'รผอ.บร.' ? 'bg-purple-600' :
              task.executiveAuthority === 'รผอ.พกป.' ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              สายงาน: {task.executiveAuthority || 'ผอ.'}
            </span>
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              {task.directiveType || 'คำสั่งการ ผอ.'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
              task.priority === 'เร่งด่วนมาก' ? 'bg-red-500 text-white' :
              task.priority === 'เร่งด่วน' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {task.priority}
            </span>
            <TaskCountdownBadge task={task} />
            <FollowUpBadge count={task.followUpCount} />
          </div>

          <h2 className="text-xl font-bold tracking-tight leading-snug">{task.title}</h2>
          <p className="text-blue-300 text-xs mt-1 font-semibold">
            📜 อ้างอิง: {task.directiveRef || 'คำสั่งการ ผอ.'}
          </p>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Executive Directive Banner */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900 flex-wrap gap-2">
            <div className="flex items-center gap-2 font-medium truncate">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                สายงานข้อสั่งการ: <strong className="text-blue-900 font-bold">{task.executiveAuthority || 'ผอ.'}</strong> • ผู้สั่งการ: <strong>{task.assignor}</strong> • หน่วยงาน: <strong>{task.department}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <CopyFollowUpButton task={task} variant="compact" currentUser={currentUser} disabled={!canEdit} />
              {canEdit && (
                <button
                  onClick={handleResendEmail}
                  className="text-[11px] font-bold bg-white text-blue-700 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>ส่งอีเมลแจ้งเตือนซ้ำ</span>
                </button>
              )}
            </div>
          </div>

          {emailNoticeSent && (
            <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-bold animate-in fade-in">
              ✓ ส่งอีเมลแจ้งเตือนงานติดตามไปยัง {task.assigneeEmail || 'ผู้รับผิดชอบ'} เรียบร้อยแล้ว!
            </div>
          )}

          {/* Banner if View Only */}
          {!canEdit && (
            <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-2xs">
              <span className="text-xl shrink-0">🔒</span>
              <div className="leading-relaxed">
                <span className="font-bold text-amber-950">โหมดดูอย่างเดียว (View Only):</span> งานข้อสั่งการนี้อยู่ในสายงาน <strong>{task.executiveAuthority || 'ผู้บริหาร'}</strong> คุณสามารถตรวจสอบข้อมูลได้อย่างเดียว ไม่สามารถเปลี่ยนสถานะหรือแก้ไขความคืบหน้าได้
              </div>
            </div>
          )}

          {/* Main Details Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">ผู้รับผิดชอบงาน</div>
              <div className={`text-sm font-bold flex items-center gap-1.5 ${
                isPendingDeptHeadAssignment ? 'text-amber-700 font-extrabold animate-pulse' : 'text-slate-800'
              }`}>
                <UserIcon className="w-4 h-4 text-blue-600" />
                {task.assignee}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">ผู้สั่งการ / ผู้มอบหมาย</div>
              <div className="text-sm font-semibold text-slate-700">{task.assignor}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">กำหนดส่ง (Deadline)</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                {task.deadline}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">สถานะปัจจุบัน</div>
              {canEdit ? (
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="bg-white border border-slate-300 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-hidden w-full"
                >
                  <option value="รอดำเนินการ">รอดำเนินการ</option>
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="ติดปัญหา">ติดปัญหา</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                </select>
              ) : (
                <div className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TaskStatusDot task={task} />
                    <span>{task.status}</span>
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded font-bold">🔒 วิวเท่านั้น</span>
                </div>
              )}
            </div>
          </div>

          {/* Dept Head Assignment Action Box */}
          {(isPendingDeptHeadAssignment || showHeadAssignForm) && canAssignOfficer && (
            <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border-b border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>การมอบหมายงานภายในหน่วยงาน ({task.department})</span>
                </div>
                {!isPendingDeptHeadAssignment && (
                  <button
                    type="button"
                    onClick={() => setShowHeadAssignForm(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    ปิดฟอร์ม
                  </button>
                )}
              </div>

              <form onSubmit={handleDeptHeadAssign} className="space-y-3">
                <p className="text-xs text-indigo-700">
                  คำสั่งการนี้ส่งมาถึง <strong>{task.department}</strong> กรุณาระบุเจ้าหน้าที่ผู้ปฏิบัติงานที่จะรับผิดชอบดำเนินการ:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      เลือกผู้ปฏิบัติงานประจำ {task.department} <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedOfficer}
                      onChange={(e) => setSelectedOfficer(e.target.value)}
                      className="w-full p-2.5 bg-white border border-indigo-300 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-medium cursor-pointer"
                    >
                      <option value="">-- เลือกผู้ปฏิบัติงาน --</option>
                      {deptOfficers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.position})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ข้อสั่งการเพิ่มเติมของหัวหน้ากอง (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={headNotes}
                      onChange={(e) => setHeadNotes(e.target.value)}
                      placeholder="เช่น กำหนดให้สรุปรายงานย่อยภายในวันที่ 5..."
                      className="w-full p-2.5 bg-white border border-indigo-300 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden font-normal"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>มอบหมายผู้ปฏิบัติงาน & ส่งอีเมลแจ้งเตือน</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Progress Slider Widget */}
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">ความคืบหน้าภาพรวม</span>
              <span className="text-sm font-extrabold text-blue-600">{task.progress}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  task.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>

            {canEdit ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full sm:w-48 accent-blue-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  placeholder="รายละเอียดการอัปเดตงานย่อย..."
                  className="w-full flex-1 px-3 py-1.5 bg-white border border-slate-200 text-xs rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveProgress}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-2 rounded-lg transition cursor-pointer shrink-0"
                >
                  บันทึกความคืบหน้า
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>🔒</span>
                  <span>สิทธิ์การปรับปรุงสถานะและความคืบหน้าถูกล็อก (เฉพาะผู้ดูแลสายงาน {task.executiveAuthority || 'ผู้บริหาร'})</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">โหมดวิวเท่านั้น</span>
              </div>
            )}
          </div>

          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
            {[
              { id: 'details', label: 'รายละเอียดงาน', icon: FileText },
              { id: 'progress', label: `ความคืบหน้า (${task.progressNotes.length})`, icon: Clock },
              { id: 'attachments', label: `เอกสารแนบ (${task.attachments.length})`, icon: Paperclip },
              { id: 'audit', label: `ประวัติการดำเนินงาน (${task.auditLogs.length})`, icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">รายละเอียดงานตามข้อสั่งการ</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {task.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                  </p>
                </div>

                {!isPendingDeptHeadAssignment && canAssignOfficer && (
                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setShowHeadAssignForm(!showHeadAssignForm)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>หัวหน้าหน่วยงาน: มอบหมาย/เปลี่ยนผู้ปฏิบัติงานประจำกอง</span>
                    </button>
                  </div>
                )}

                {canEdit && (
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      กรณีผู้รับผิดชอบติดปัญหา หรือต้องการส่งให้ ผอ./ผู้บริหาร พิจารณาเปลี่ยนผู้รับผิดชอบ
                    </div>

                    <button
                      onClick={() => setShowProblemForm(!showProblemForm)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>แจ้งติดปัญหา / ขอเปลี่ยนผู้รับผิดชอบ</span>
                    </button>
                  </div>
                )}

                {showProblemForm && (
                  <form onSubmit={handleProblemSubmit} className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3 mt-3 animate-in fade-in">
                    <h4 className="font-bold text-amber-900 text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      แจ้งติดปัญหาและขอเปลี่ยนผู้รับผิดชอบงาน (ID: {task.id})
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        ระบุเหตุผลที่ติดปัญหา / ไม่สามารถดำเนินการได้
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={problemReason}
                        onChange={(e) => setProblemReason(e.target.value)}
                        placeholder="อธิบายรายละเอียดสาเหตุที่ติดปัญหา..."
                        className="w-full p-2.5 bg-white border border-amber-300 text-xs rounded-xl focus:ring-2 focus:ring-amber-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        เสนอผู้รับผิดชอบคนใหม่
                      </label>
                      <select
                        required
                        value={requestedAssignee}
                        onChange={(e) => setRequestedAssignee(e.target.value)}
                        className="w-full p-2.5 bg-white border border-amber-300 text-xs rounded-xl focus:ring-2 focus:ring-amber-500 outline-hidden font-medium cursor-pointer"
                      >
                        <option value="">-- เลือกผู้รับผิดชอบคนใหม่ --</option>
                        {users.filter(u => u.name !== task.assignee).map((u) => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.department} - {u.position})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowProblemForm(false)}
                        className="px-3 py-1.5 bg-white text-slate-600 font-semibold text-xs rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        ส่งเรื่องให้ ผอ./ผู้บริหาร พิจารณา (ส่งอีเมลอัตโนมัติ)
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">บันทึกความคืบหน้าย่อย</h4>
                {task.progressNotes.length === 0 ? (
                  <div className="text-center text-slate-400 py-6 text-xs">ยังไม่มีการบันทึกความคืบหน้าย่อย</div>
                ) : (
                  <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pl-4">
                    {task.progressNotes.map((note) => (
                      <div key={note.id} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                            <span>{note.date} • {note.author}</span>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                              {note.percentage}%
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{note.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-4">
                {canEdit ? (
                  <form onSubmit={handleAddAttachment} className="flex gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={fileInput}
                      onChange={(e) => setFileInput(e.target.value)}
                      placeholder="ชื่อไฟล์เอกสารแนบ..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 text-xs rounded-lg outline-hidden"
                    />
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value as any)}
                      className="px-2 py-1.5 bg-white border border-slate-200 text-xs rounded-lg cursor-pointer"
                    >
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="xlsx">Excel (.xlsx)</option>
                      <option value="docx">Word (.docx)</option>
                      <option value="png">Image (.png)</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> แนบไฟล์
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                    <span>🔒 การอัปโหลดแนบไฟล์เอกสารสงวนสิทธิ์เฉพาะผู้รับผิดชอบสายงาน {task.executiveAuthority}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">โหมดวิวเท่านั้น</span>
                  </div>
                )}

                <div className="space-y-2">
                  {task.attachments.length === 0 ? (
                    <div className="text-center text-slate-400 py-6 text-xs">ไม่มีไฟล์เอกสารแนบ</div>
                  ) : (
                    task.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600 font-bold text-xs uppercase">
                            📎 {att.fileType}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-800">{att.fileName}</div>
                            <div className="text-[10px] text-slate-400">
                              ขนาด: {att.fileSize} • อัปโหลดโดย: {att.uploadedBy} ({att.uploadedAt})
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`ดาวน์โหลดไฟล์ ${att.fileName} เรียบร้อย`)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          ดาวน์โหลด
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ประวัติการดำเนินงานย้อนหลัง (Audit Log & Email Dispatches)</h4>
                <div className="divide-y divide-slate-100">
                  {task.auditLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            {log.actor} • {log.action}
                            {log.isEmailSent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                <Mail className="w-3 h-3" /> ส่งอีเมลแล้ว
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 shrink-0 flex justify-between items-center">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ระบบบันทึกประวัติย้อนหลังทุกการกระทำตามคำสั่งการ ผอ.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>

      {/* Modal กรอกรายละเอียดก่อนปิดงานเสร็จสิ้น */}
      {isCompletionModalOpen && (
        <TaskCompletionModal
          task={task}
          currentUser={currentUser}
          onClose={() => setIsCompletionModalOpen(false)}
          onConfirm={handleConfirmCompletion}
        />
      )}
    </div>
  );
};
