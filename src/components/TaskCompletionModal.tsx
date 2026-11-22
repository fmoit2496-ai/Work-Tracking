import React, { useState } from 'react';
import type { Task, User } from '../types';
import { getFormattedDate } from '../utils/followUp';
import { 
  CheckCircle2, 
  X, 
  Calendar, 
  Building2, 
  FileCheck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface TaskCompletionModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onConfirm: (completionDetail: string, completionDate: string) => void;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  task,
  currentUser,
  onClose,
  onConfirm,
}) => {
  const [detail, setDetail] = useState('');
  const [completionDate, setCompletionDate] = useState(getFormattedDate());
  const [error, setError] = useState('');

  const quickTemplates = [
    'ดำเนินการตามข้อสั่งการเรียบร้อยครบถ้วน',
    'จัดทำเอกสารและรายงานผลเสนอผู้บริหารเรียบร้อยแล้ว',
    'ส่งมอบงานและประสานงานหน่วยงานที่เกี่ยวข้องเสร็จสมบูรณ์',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) {
      setError('กรุณากรอกรายละเอียดผลการดำเนินงานก่อนบันทึกปิดงาน');
      return;
    }
    setError('');
    onConfirm(detail.trim(), completionDate);
  };

  const handleApplyTemplate = (text: string) => {
    setDetail(text);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                บันทึกปิดงาน / รายงานผลสำเร็จ
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                กรุณาระบุรายละเอียดก่อนปรับสถานะเป็น "เสร็จสิ้น"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {task.id}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
              (task.executiveAuthority || 'ผอ.') === 'ผอ.' ? 'bg-blue-600 text-white' :
              task.executiveAuthority === 'รผอ.บร.' ? 'bg-purple-600 text-white' :
              task.executiveAuthority === 'รผอ.พกป.' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {task.executiveAuthority || 'ผอ.'}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {task.department}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                {task.assignee.charAt(0)}
              </span>
              <span>ผู้รับผิดชอบ: {task.assignee}</span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>รายละเอียดการปิดงาน / สรุปผลสำเร็จ</span>
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>{tpl}</span>
                </button>
              ))}
            </div>

            <textarea
              required
              rows={4}
              value={detail}
              onChange={(e) => {
                setDetail(e.target.value);
                if (error) setError('');
              }}
              placeholder="ระบุรายละเอียดการปิดงาน เช่น ส่งพนักงานเข้าอบรมเรียบร้อยแล้ว เมื่อวันที่ 7 พ.ย. 2569 พร้อมแนบเอกสารสรุปผลโครงการ..."
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden transition resize-none font-medium leading-relaxed"
            />
            {error && (
              <p className="text-xs text-red-600 font-semibold mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่เสร็จสิ้นจริง
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ผู้บันทึกทำรายการ
              </label>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser.department}</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              เมื่อกดยืนยัน ระบบจะปรับความคืบหน้าเป็น <strong>100% (เสร็จสิ้น)</strong>, บันทึกลงในประวัติการดำเนินงาน และส่งการแจ้งเตือนในระบบทันที
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันปิดงาน (เสร็จสิ้น 100%)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
