import React, { useState } from 'react';
import type { User } from '../types';
import { TaskStore } from '../services/store';
import { AlertTriangle, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

interface ApprovalViewProps {
  currentUser: User;
  onRefresh: () => void;
  onSelectTask: (taskId: string) => void;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({ onRefresh, onSelectTask }) => {
  const requests = TaskStore.getProblemRequests();
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  const handleApprove = (reqId: string) => {
    const comment = commentMap[reqId] || 'อนุมัติเปลี่ยนผู้รับผิดชอบงานเรียบร้อย';
    TaskStore.approveProblemRequest(reqId, comment);
    onRefresh();
  };

  const handleReject = (reqId: string) => {
    const comment = commentMap[reqId] || 'ไม่อนุมัติคำขอเปลี่ยนผู้รับผิดชอบ';
    TaskStore.rejectProblemRequest(reqId, comment);
    onRefresh();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            พิจารณาคำขอ “แจ้งติดปัญหา / ขอเปลี่ยนผู้รับผิดชอบ”
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สำหรับผู้มีอำนาจ (ผู้บริหาร / หัวหน้าหน่วยงาน) ในการอนุมัติโอนย้ายงานโดยคง ID เดิมไว้ตลอดอายุงาน
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            รอดำเนินการ ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === 'approved' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            อนุมัติแล้ว ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === 'rejected' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            ไม่อนุมัติ ({requests.filter(r => r.status === 'rejected').length})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            ทั้งหมด ({requests.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
            ไม่มีคำขอในสถานะนี้
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-600 text-xs bg-blue-50 px-2.5 py-1 rounded-lg">
                    {req.taskId}
                  </span>
                  <button
                    onClick={() => onSelectTask(req.taskId)}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 text-left cursor-pointer"
                  >
                    {req.taskTitle}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">ยื่นคำขอเมื่อ: {req.requestedAt}</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'pending' ? '⏳ รอดำเนินการ' : req.status === 'approved' ? '🟢 อนุมัติแล้ว' : '🔴 ไม่อนุมัติ'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-slate-400 font-bold mb-1">ผู้รับผิดชอบเดิม</div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    {req.currentAssignee} ({req.department})
                  </div>
                </div>

                <div>
                  <div className="text-amber-800 font-bold mb-1">ผู้รับผิดชอบคนใหม่ที่เสนอ</div>
                  <div className="font-bold text-blue-600 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    {req.requestedAssignee}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-slate-400 font-bold mb-1">เหตุผลที่แจ้งติดปัญหา</div>
                  <div className="text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                    "{req.reason}"
                  </div>
                </div>
              </div>

              {req.status === 'pending' ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={commentMap[req.id] || ''}
                    onChange={(e) => setCommentMap({ ...commentMap, [req.id]: e.target.value })}
                    placeholder="ความเห็นการพิจารณาอนุมัติ/ไม่อนุมัติ (ถ้ามี)..."
                    className="flex-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> ไม่อนุมัติ
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> อนุมัติเปลี่ยนผู้รับผิดชอบ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                  พิจารณาโดย: <span className="font-bold text-slate-700">{req.reviewer}</span> เมื่อ {req.reviewedAt}
                  {req.reviewComment && <span className="ml-2 italic">({req.reviewComment})</span>}
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
