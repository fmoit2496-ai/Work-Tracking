import React, { useState } from 'react';
import type { Task, ExecutiveAuthority } from '../types';
import { EXECUTIVE_LIST } from '../types';
import { DEPARTMENTS } from '../services/mockData';
import { getTaskCountdownInfo, isSameDepartment, getFormattedDate, getThaiDateString } from '../utils/followUp';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  X, 
  Calendar, 
  Building2, 
  Download, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Crown
} from 'lucide-react';

interface ExportExcelModalProps {
  tasks: Task[];
  onClose: () => void;
  defaultExecutive?: 'all' | ExecutiveAuthority;
}

export const ExportExcelModal: React.FC<ExportExcelModalProps> = ({
  tasks,
  onClose,
  defaultExecutive = 'all',
}) => {
  const [dateField, setDateField] = useState<'deadline' | 'dateReceived'>('deadline');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedExecutive, setSelectedExecutive] = useState<'all' | ExecutiveAuthority>(defaultExecutive);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTimeline, setSelectedTimeline] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [splitByExecutive, setSplitByExecutive] = useState<boolean>(true);
  const [includeSummarySheet, setIncludeSummarySheet] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Quick preset helper
  const applyPreset = (preset: 'all' | 'this_month' | 'next_month' | 'this_quarter' | 'fy2569') => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      setStartDate(getFormattedDate(firstDay));
      setEndDate(getFormattedDate(lastDay));
    } else if (preset === 'next_month') {
      const firstDay = new Date(y, m + 1, 1);
      const lastDay = new Date(y, m + 2, 0);
      setStartDate(getFormattedDate(firstDay));
      setEndDate(getFormattedDate(lastDay));
    } else if (preset === 'this_quarter') {
      const qStartMonth = Math.floor(m / 3) * 3;
      const firstDay = new Date(y, qStartMonth, 1);
      const lastDay = new Date(y, qStartMonth + 3, 0);
      setStartDate(getFormattedDate(firstDay));
      setEndDate(getFormattedDate(lastDay));
    } else if (preset === 'fy2569') {
      // Fiscal year 2569 (1 Oct 2025 to 30 Sep 2026 or current 2026)
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Filter tasks based on selected criteria
  const filteredTasks = tasks.filter((t) => {
    // 1. Executive filter
    if (selectedExecutive !== 'all' && (t.executiveAuthority || 'ผอ.') !== selectedExecutive) {
      return false;
    }

    // 2. Department filter
    if (selectedDept !== 'all' && !isSameDepartment(t.department, selectedDept)) {
      return false;
    }

    // 3. Status filter
    if (selectedStatus !== 'all' && t.status !== selectedStatus) {
      return false;
    }

    // 4. Timeline status filter
    if (selectedTimeline !== 'all' && t.timelineStatus !== selectedTimeline) {
      return false;
    }

    // 5. Date range filter
    const taskDateStr = dateField === 'deadline' ? t.deadline : (t.dateReceived || '');
    if (startDate && taskDateStr && taskDateStr < startDate) {
      return false;
    }
    if (endDate && taskDateStr && taskDateStr > endDate) {
      return false;
    }

    return true;
  });

  const handleExport = () => {
    setIsExporting(true);

    try {
      const wb = XLSX.utils.book_new();

      const headers = [
        'ลำดับ',
        'รหัสงาน',
        'สายงานข้อสั่งการ',
        'ชื่องาน / รายละเอียดข้อสั่งการ',
        'เลขที่อ้างอิง',
        'ประเภทข้อสั่งการ',
        'หน่วยงานผู้รับผิดชอบ',
        'ชื่อผู้รับผิดชอบ',
        'ผู้มอบหมาย / สั่งการ',
        'วันที่รับงาน / สั่งการ',
        'กำหนดส่ง (Deadline)',
        'สถานะกำหนดเวลา',
        'นับถอยหลัง / วันที่เหลือ',
        'ความคืบหน้า (%)',
        'สถานะงาน',
        'จำนวนครั้งที่ติดตามงาน',
        'รายละเอียดการปิดงาน / ความคืบหน้าล่าสุด',
      ];

      const colWidths = [
        { wch: 6 },  // ลำดับ
        { wch: 15 }, // รหัสงาน
        { wch: 14 }, // สายงาน
        { wch: 42 }, // ชื่องาน
        { wch: 28 }, // เลขที่อ้างอิง
        { wch: 20 }, // ประเภท
        { wch: 34 }, // หน่วยงาน
        { wch: 24 }, // ผู้รับผิดชอบ
        { wch: 28 }, // ผู้มอบหมาย
        { wch: 15 }, // วันที่รับงาน
        { wch: 15 }, // กำหนดส่ง
        { wch: 15 }, // สถานะกำหนดเวลา
        { wch: 18 }, // นับถอยหลัง
        { wch: 14 }, // ความคืบหน้า
        { wch: 15 }, // สถานะงาน
        { wch: 15 }, // ครั้งที่ติดตาม
        { wch: 45 }, // รายละเอียด
      ];

      const makeRows = (items: Task[]) => {
        return items.map((t, index) => {
          const cdInfo = getTaskCountdownInfo(t);
          let noteDetail = '-';
          if (t.progressNotes && t.progressNotes.length > 0) {
            noteDetail = t.progressNotes[0].detail;
          } else if (t.description) {
            noteDetail = t.description;
          }

          return [
            index + 1,
            t.id,
            t.executiveAuthority || 'ผอ.',
            t.title,
            t.directiveRef || '-',
            t.directiveType || 'คำสั่งการ ผอ.',
            t.department,
            t.assignee,
            t.assignor,
            t.dateReceived || '-',
            t.deadline,
            t.timelineStatus || 'ปกติ',
            cdInfo.text,
            `${t.progress}%`,
            t.status,
            t.followUpCount && t.followUpCount > 0 ? `ติดตามครั้งที่ ${t.followUpCount}` : 'ยังไม่ติดตาม',
            noteDetail,
          ];
        });
      };

      // Sheet 1: Summary Sheet (if enabled)
      if (includeSummarySheet) {
        const summaryHeaders = [
          'สายงานผู้บริหาร',
          'ตำแหน่ง',
          'งานทั้งหมด (รายการ)',
          'เสร็จสิ้น',
          'กำลังดำเนินการ',
          'รอดำเนินการ',
          'ติดปัญหา',
          'เกินกำหนด',
          'อัตราความสำเร็จ (%)',
        ];

        const summaryRows = EXECUTIVE_LIST.map((exec) => {
          const execTasks = filteredTasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id);
          const total = execTasks.length;
          const completed = execTasks.filter(t => t.status === 'เสร็จสิ้น').length;
          const inProgress = execTasks.filter(t => t.status === 'กำลังดำเนินการ').length;
          const pending = execTasks.filter(t => t.status === 'รอดำเนินการ').length;
          const stuck = execTasks.filter(t => t.status === 'ติดปัญหา').length;
          const overdue = execTasks.filter(t => t.timelineStatus === 'เกินกำหนด' && t.status !== 'เสร็จสิ้น').length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

          return [
            exec.label,
            exec.roleTitle,
            total,
            completed,
            inProgress,
            pending,
            stuck,
            overdue,
            `${rate}%`,
          ];
        });

        // Add overall total row
        const totalAll = filteredTasks.length;
        const compAll = filteredTasks.filter(t => t.status === 'เสร็จสิ้น').length;
        const rateAll = totalAll > 0 ? Math.round((compAll / totalAll) * 100) : 0;
        summaryRows.push([
          'รวมทุกสายงาน',
          'ภาพรวมทั้งหมด',
          totalAll,
          compAll,
          filteredTasks.filter(t => t.status === 'กำลังดำเนินการ').length,
          filteredTasks.filter(t => t.status === 'รอดำเนินการ').length,
          filteredTasks.filter(t => t.status === 'ติดปัญหา').length,
          filteredTasks.filter(t => t.timelineStatus === 'เกินกำหนด' && t.status !== 'เสร็จสิ้น').length,
          `${rateAll}%`,
        ]);

        const summaryData = [
          [`รายงานสรุปผลการดำเนินงานตามข้อสั่งการผู้บริหาร ประจำวันที่ ${getThaiDateString()}`],
          [`เงื่อนไขการออกรายงาน: สายงาน [${selectedExecutive === 'all' ? 'ทุกสายงาน' : selectedExecutive}] • หน่วยงาน [${selectedDept === 'all' ? 'ทุกหน่วยงาน' : selectedDept}] • สถานะ [${selectedStatus === 'all' ? 'ทุกสถานะ' : selectedStatus}]`],
          [],
          summaryHeaders,
          ...summaryRows,
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        summaryWs['!cols'] = [
          { wch: 18 },
          { wch: 32 },
          { wch: 18 },
          { wch: 12 },
          { wch: 16 },
          { wch: 14 },
          { wch: 12 },
          { wch: 14 },
          { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'สรุปภาพรวมผู้บริหาร');
      }

      // Main Sheet: All filtered tasks
      const allRows = makeRows(filteredTasks);
      const mainWs = XLSX.utils.aoa_to_sheet([headers, ...allRows]);
      mainWs['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, mainWs, 'รายการงานทั้งหมด');

      // Separate Sheets per Executive line (if enabled)
      if (splitByExecutive) {
        for (const exec of EXECUTIVE_LIST) {
          const execTasks = filteredTasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id);
          if (execTasks.length > 0) {
            const execRows = makeRows(execTasks);
            const execWs = XLSX.utils.aoa_to_sheet([headers, ...execRows]);
            execWs['!cols'] = colWidths;
            const sheetName = exec.id.replace(/\./g, '');
            XLSX.utils.book_append_sheet(wb, execWs, `สายงาน_${sheetName}`);
          }
        }
      }

      // Generate filename
      const execSuffix = selectedExecutive === 'all' ? 'ทุกสายงาน' : selectedExecutive.replace(/\./g, '');
      const dateSuffix = getFormattedDate();
      const fileName = `รายงานติดตามข้อสั่งการ_${execSuffix}_${dateSuffix}.xlsx`;

      // Trigger download
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-5 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight">
                ออกรายงานไฟล์ Excel (.xlsx)
              </h2>
              <p className="text-emerald-100 text-xs mt-0.5">
                กำหนดเงื่อนไขช่วงเวลา สายงานผู้บริหาร และหน่วยงาน เพื่อสร้างไฟล์ Excel สรุปผล
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Date Range Filter */}
          <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>เลือกช่วงเวลาวันที่ออกรายงาน</span>
              </label>

              {/* Toggle Date Type */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDateField('deadline')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    dateField === 'deadline' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  กำหนดส่ง (Deadline)
                </button>
                <button
                  type="button"
                  onClick={() => setDateField('dateReceived')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                    dateField === 'dateReceived' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  วันที่รับงาน/สั่งการ
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">ช่วงเวลาด่วน:</span>
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => applyPreset('this_month')}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                เดือนนี้
              </button>
              <button
                type="button"
                onClick={() => applyPreset('next_month')}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                เดือนหน้า
              </button>
              <button
                type="button"
                onClick={() => applyPreset('this_quarter')}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                ไตรมาสนี้
              </button>
              <button
                type="button"
                onClick={() => applyPreset('fy2569')}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
              >
                ปี 2569
              </button>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ตั้งแต่วันที่
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ถึงวันที่
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Executive Line Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>สายงานข้อสั่งการผู้บริหาร</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedExecutive('all')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                  selectedExecutive === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ทุกสายงาน ({tasks.length})
              </button>
              {EXECUTIVE_LIST.map((exec) => {
                const isSelected = selectedExecutive === exec.id;
                const count = tasks.filter(t => (t.executiveAuthority || 'ผอ.') === exec.id).length;
                return (
                  <button
                    key={exec.id}
                    type="button"
                    onClick={() => setSelectedExecutive(exec.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                      isSelected
                        ? `${exec.badgeBg} ${exec.badgeText} border-transparent ring-2 ring-emerald-500/30 shadow-2xs`
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{exec.label}</div>
                    <div className="text-[10px] font-normal opacity-80">({count} งาน)</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Status & Timeline Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>สถานะการดำเนินงาน</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">ทุกสถานะการดำเนินงาน</option>
                <option value="รอดำเนินการ">รอดำเนินการ</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="ติดปัญหา">ติดปัญหา</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>สถานะกำหนดเวลา</span>
              </label>
              <select
                value={selectedTimeline}
                onChange={(e) => setSelectedTimeline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">ทุกสถานะกำหนดเวลา</option>
                <option value="ปกติ">ปกติ (ยังไม่ถึงเกณฑ์เร่งรัด)</option>
                <option value="ใกล้ครบกำหนด">ใกล้ครบกำหนด (เหลือ ≤ 3 วัน)</option>
                <option value="เกินกำหนด">เกินกำหนดส่งแล้ว</option>
              </select>
            </div>
          </div>

          {/* 4. Department Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>หน่วยงานผู้รับผิดชอบ (51 สำนัก/กอง)</span>
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="all">ทุกหน่วยงาน (51 สำนัก/กอง)</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Excel Sheet Options */}
          <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
            <span className="font-bold text-emerald-900 block">
              ตัวเลือกการจัดโครงสร้างไฟล์ Excel (.xlsx)
            </span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={splitByExecutive}
                  onChange={(e) => setSplitByExecutive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium">
                  แยกชีต (Sheet) ตามแต่ละสายงานผู้บริหาร (ผอ., รผอ.บร., รผอ.พกป., รผอ.สปทร.)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSummarySheet}
                  onChange={(e) => setIncludeSummarySheet(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium">
                  สร้างชีตสรุปภาพรวมผู้บริหาร (KPIs Summary) ไว้ที่ชีตแรก
                </span>
              </label>
            </div>
          </div>

          {/* Real-time Match Count Badge */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>ข้อมูลที่ตรงกับเงื่อนไขการออกรายงาน:</span>
            </span>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
              {filteredTasks.length} รายการ (จาก {tasks.length})
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer text-xs"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || filteredTasks.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'กำลังสร้างไฟล์...' : `ดาวน์โหลดไฟล์ Excel (.xlsx) [${filteredTasks.length} งาน]`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
