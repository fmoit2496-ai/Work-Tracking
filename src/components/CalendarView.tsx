import React, { useState } from 'react';
import type { Task } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getFormattedDate } from '../utils/followUp';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const formatDateStr = (dayNum: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              ปฏิทินกำหนดส่งงาน (Deadline Calendar)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {monthNames[currentMonth]} {currentYear + 543}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            {monthNames[currentMonth]} {currentYear + 543}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
        <span className="font-bold text-slate-700">คำอธิบายสี:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> เสร็จสิ้น</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> ปกติ (กำลังดำเนินการ)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ใกล้ครบกำหนด</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> เกินกำหนด</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center font-bold text-xs text-slate-600 py-3">
          <div className="text-red-600">อาทิตย์</div>
          <div>จันทร์</div>
          <div>อังคาร</div>
          <div>พุธ</div>
          <div>พฤหัสบดี</div>
          <div>ศุกร์</div>
          <div className="text-blue-600">เสาร์</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-50/20">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[100px]" />;
            }

            const dateStr = formatDateStr(dayNum);
            const dayTasks = tasks.filter((t) => t.deadline === dateStr);
            const isToday = dateStr === getFormattedDate();

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 bg-white transition hover:bg-slate-50 flex flex-col justify-between ${
                  isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}>
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {dayTasks.length} งาน
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mt-2 flex-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t.id)}
                      className={`p-1.5 rounded-lg text-[11px] font-semibold truncate cursor-pointer transition shadow-2xs border ${
                        t.status === 'เสร็จสิ้น'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : t.timelineStatus === 'เกินกำหนด'
                          ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 font-bold'
                          : t.timelineStatus === 'ใกล้ครบกำหนด'
                          ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 font-bold'
                          : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                      }`}
                      title={`${t.id}: ${t.title} (${t.assignee})`}
                    >
                      <div className="truncate font-bold">{t.id}</div>
                      <div className="truncate text-[10px] font-normal">{t.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
