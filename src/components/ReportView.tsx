import React, { useState } from 'react';
import type { Task, ExecutiveAuthority } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { TaskStatusDot, FollowUpBadge, CopyFollowUpButton } from './TaskCountdownBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileSpreadsheet, Award, Crown } from 'lucide-react';
import { ExportExcelModal } from './ExportExcelModal';

interface ReportViewProps {
  tasks: Task[];
}

export const ReportView: React.FC<ReportViewProps> = ({ tasks }) => {
  const [selectedExec, setSelectedExec] = useState<'all' | ExecutiveAuthority>('all');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);

  // Filter tasks based on selected executive line
  const filteredTasks = selectedExec === 'all'
    ? tasks
    : tasks.filter(t => (t.executiveAuthority || 'ผอ.') === selectedExec);

  // Stats for the 4 executive authorities
  const executiveStats = EXECUTIVE_LIST.map(exec => {
    const execTasks = tasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id);
    const total = execTasks.length;
    const completed = execTasks.filter(t => t.status === 'เสร็จสิ้น').length;
    const inProgress = execTasks.filter(t => t.status === 'กำลังดำเนินการ').length;
    const pending = execTasks.filter(t => t.status === 'รอดำเนินการ').length;
    const stuck = execTasks.filter(t => t.status === 'ติดปัญหา').length;
    const overdue = execTasks.filter(t => t.timelineStatus === 'เกินกำหนด' && t.status !== 'เสร็จสิ้น').length;
    const avgProgress = total > 0 ? Math.round(execTasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: exec.id,
      label: exec.label,
      roleTitle: exec.roleTitle,
      shortDesc: exec.shortDesc,
      badgeBg: exec.badgeBg,
      badgeText: exec.badgeText,
      total,
      completed,
      inProgress,
      pending,
      stuck,
      overdue,
      avgProgress,
      completionRate,
    };
  });

  // Overall summary for current selection
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.status === 'เสร็จสิ้น').length;
  const completionRateOverall = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Chart data: 4 executive lines with clear names
  const chartData = executiveStats.map(stat => ({
    name: stat.label,
    fullName: stat.roleTitle,
    completionRate: stat.completionRate,
    total: stat.total,
    completed: stat.completed,
    avgProgress: stat.avgProgress,
  }));

  const exportCSV = () => {
    const headers = [
      'รหัสงาน',
      'สายงานผู้บริหาร',
      'ชื่องาน / ข้อสั่งการ',
      'เลขที่อ้างอิง',
      'หน่วยงานผู้รับผิดชอบ',
      'ผู้รับผิดชอบ',
      'กำหนดส่ง',
      'สถานะ',
      'ความคืบหน้า (%)',
      'ครั้งที่ติดตามงาน',
    ];

    const rows = filteredTasks.map(t => [
      `"${t.id}"`,
      `"${t.executiveAuthority || 'ผอ.'}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.directiveRef || '-').replace(/"/g, '""')}"`,
      `"${(t.department || '').replace(/"/g, '""')}"`,
      `"${(t.assignee || '').replace(/"/g, '""')}"`,
      `"${t.deadline}"`,
      `"${t.status}"`,
      `"${t.progress}%"`,
      `"${t.followUpCount || 0}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileNameSuffix = selectedExec === 'all' ? 'ทุกสายงาน' : selectedExec.replace(/\./g, '');
    link.setAttribute('download', `รายงานติดตามข้อสั่งการ_${fileNameSuffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>รายงานสรุปผลการติดตามงานตามข้อสั่งการผู้บริหาร</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สำหรับเลขาหน้าห้องและผู้บริหาร ติดตามความคืบหน้าตาม 4 สายงาน (ผอ. / รผอ.บร. / รผอ.พกป. / รผอ.สปทร.)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            title="ออกรายงานในรูปแบบไฟล์ Excel (.xlsx) พร้อมตัวเลือกช่วงวันที่ สถานะ และหน่วยงาน"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>พิมพ์ / ออกรายงาน Excel</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3.5 rounded-xl transition cursor-pointer"
            title="ส่งออกข้อมูลดิบในรูปแบบ CSV"
          >
            <span>ส่งออก (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter by Executive Line */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setSelectedExec('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedExec === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ทุกสายงานผู้บริหาร ({tasks.length})
        </button>
        {EXECUTIVE_LIST.map((exec) => {
          const isSelected = selectedExec === exec.id;
          const count = tasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id).length;
          return (
            <button
              key={exec.id}
              onClick={() => setSelectedExec(exec.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? `${exec.badgeBg} ${exec.badgeText} ring-2 ring-blue-500/30 shadow-xs`
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{exec.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/40' : 'bg-slate-200 text-slate-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Executive KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveStats.map((stat) => {
          const isCurrentFilter = selectedExec === stat.id;
          return (
            <div
              key={stat.id}
              onClick={() => setSelectedExec(selectedExec === stat.id ? 'all' : stat.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white space-y-3 shadow-xs hover:shadow-md ${
                isCurrentFilter 
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${stat.badgeBg} ${stat.badgeText}`}>
                  {stat.label}
                </span>
                <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {stat.total} รายการ
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {stat.roleTitle}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stat.shortDesc}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>อัตราความสำเร็จ</span>
                  <span className="font-extrabold text-slate-900">{stat.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stat.id === 'ผอ.' ? 'bg-blue-600' :
                      stat.id === 'รผอ.บร.' ? 'bg-purple-600' :
                      stat.id === 'รผอ.พกป.' ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${stat.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Mini Stats Breakdown */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center">
                <div className="bg-blue-50/60 p-1.5 rounded-lg">
                  <div className="text-[10px] text-blue-600 font-semibold">กำลังทำ</div>
                  <div className="text-xs font-extrabold text-blue-700">{stat.inProgress}</div>
                </div>
                <div className="bg-emerald-50/60 p-1.5 rounded-lg">
                  <div className="text-[10px] text-emerald-600 font-semibold">เสร็จสิ้น</div>
                  <div className="text-xs font-extrabold text-emerald-700">{stat.completed}</div>
                </div>
                <div className={`p-1.5 rounded-lg ${stat.overdue > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-600'}`}>
                  <div className="text-[10px] font-semibold">{stat.overdue > 0 ? 'เกินกำหนด' : 'ติดปัญหา'}</div>
                  <div className="text-xs font-extrabold">{stat.overdue > 0 ? stat.overdue : stat.stuck}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Bar Chart - 4 Executive Lines (No Crowded Labels!) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>เปรียบเทียบอัตราความสำเร็จงาน (Completion Rate %) ตาม 4 สายงานผู้บริหาร</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              สรุปอัตราการปิดงานตามข้อสั่งการจำแนกตามสายงานผู้บริหารที่รับผิดชอบ
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            เฉลี่ยรวมทุกสายงาน: <strong className="text-blue-600">{completionRateOverall}%</strong> ({completedCount}/{totalCount} งาน)
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 13, fill: '#334155', fontWeight: 700 }}
                tickLine={false}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any, _name: any, item: any) => [
                  `${val}% (เสร็จ ${item.payload.completed}/${item.payload.total} งาน • ความคืบหน้าเฉลี่ย ${item.payload.avgProgress}%)`,
                  item.payload.fullName
                ]}
              />
              <Bar dataKey="completionRate" radius={[10, 10, 0, 0]} maxBarSize={60}>
                {chartData.map((_entry, index) => {
                  const colors = ['#2563eb', '#9333ea', '#059669', '#d97706'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executive Directives Detail Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>ตารางรายการงานตามข้อสั่งการผู้บริหาร</span>
              {selectedExec !== 'all' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                  {selectedExec}
                </span>
              )}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              แสดงรายละเอียดการติดตามงาน ความคืบหน้า และสถานะการติดตาม (ทั้งหมด {filteredTasks.length} รายการ)
            </p>
          </div>

          <div className="text-xs text-slate-500">
            แสดง {filteredTasks.length} รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3">เลขที่งาน</th>
                <th className="py-3.5 px-3">สายงาน</th>
                <th className="py-3.5 px-4 min-w-[220px]">ชื่องาน / ข้อสั่งการ</th>
                <th className="py-3.5 px-3">หน่วยงานผู้รับผิดชอบ</th>
                <th className="py-3.5 px-3">ผู้รับผิดชอบ</th>
                <th className="py-3.5 px-3">กำหนดส่ง</th>
                <th className="py-3.5 px-3 min-w-[120px]">ความคืบหน้า</th>
                <th className="py-3.5 px-3">สถานะ</th>
                <th className="py-3.5 px-3 min-w-[130px]">สถานะติดตาม</th>
                <th className="py-3.5 px-3 text-right">ติดตามงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    ไม่มีรายการงานตามสายงานที่เลือก
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const execConfig = EXECUTIVE_LIST.find(e => e.id === (t.executiveAuthority || 'ผอ.'));
                  return (
                    <tr key={t.id} className="hover:bg-blue-50/40 transition">
                      
                      {/* เลขที่งานพร้อมจุดกระพริบ */}
                      <td className="py-3.5 px-3 font-bold text-blue-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TaskStatusDot task={t} />
                          <span>{t.id}</span>
                        </div>
                      </td>

                      {/* สายงานผู้บริหาร badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${execConfig?.badgeBg || 'bg-blue-50'} ${execConfig?.badgeText || 'text-blue-700'}`}>
                          {t.executiveAuthority || 'ผอ.'}
                        </span>
                      </td>

                      {/* ชื่องาน */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="line-clamp-2">{t.title}</div>
                        {t.directiveRef && (
                          <div className="text-[11px] text-blue-700 font-normal mt-0.5">
                            📜 {t.directiveRef}
                          </div>
                        )}
                      </td>

                      {/* หน่วยงาน */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {t.department}
                      </td>

                      {/* ผู้รับผิดชอบ พร้อม Avatar */}
                      <td className="py-3.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                            {t.assignee.charAt(0)}
                          </span>
                          <span>{t.assignee}</span>
                        </div>
                      </td>

                      {/* กำหนดส่ง */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {t.deadline}
                      </td>

                      {/* ความคืบหน้า */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                t.status === 'เสร็จสิ้น' ? 'bg-emerald-500' :
                                t.status === 'ติดปัญหา' ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{t.progress}%</span>
                        </div>
                      </td>

                      {/* สถานะ */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-700' :
                          t.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-700' :
                          t.status === 'ติดปัญหา' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* สถานะครั้งที่ติดตาม */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <FollowUpBadge count={t.followUpCount} />
                      </td>

                      {/* ปุ่มคัดลอกข้อความติดตามงาน */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <CopyFollowUpButton task={t} variant="button-only" />
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ออกรายงานไฟล์ Excel (.xlsx) */}
      {isExcelModalOpen && (
        <ExportExcelModal
          tasks={tasks}
          defaultExecutive={selectedExec}
          onClose={() => setIsExcelModalOpen(false)}
        />
      )}

    </div>
  );
};
