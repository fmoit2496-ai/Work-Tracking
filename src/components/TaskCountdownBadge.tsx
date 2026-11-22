import React, { useState } from 'react';
import type { Task, User } from '../types';
import { getTaskCountdownInfo, copyTaskFollowUpMessage, getDaysDifference, canUserEditTask } from '../utils/followUp';
import { TaskStore } from '../services/store';
import { Clock, AlertTriangle, CheckCircle2, Copy, Check, Lock } from 'lucide-react';

export function getTaskBlinkingStatus(task: Task, refDate?: Date) {
  if (task.status === 'เสร็จสิ้น') {
    return {
      color: 'green' as const,
      isBlinking: false,
      tooltip: 'สีเขียว: ปิดงานเสร็จสิ้น',
    };
  }

  const diffDays = getDaysDifference(task.deadline, refDate);
  const followUpCount = task.followUpCount || 0;

  // สีแดง (กระพริบ)=เหลือเวลากำหนดอีก 3 วันเป็นต้นไปจนเลยระยะเวลา
  if (diffDays <= 3 || task.timelineStatus === 'เกินกำหนด' || followUpCount >= 3) {
    let reason = 'เหลือเวลากำหนด ≤ 3 วัน';
    if (diffDays < 0 || task.timelineStatus === 'เกินกำหนด') {
      reason = `เกินกำหนดส่ง (${Math.abs(diffDays)} วัน)`;
    } else if (diffDays === 0) {
      reason = 'ครบกำหนดส่งวันนี้';
    } else if (followUpCount >= 3) {
      reason = `ติดตามงานแล้ว ${followUpCount} ครั้ง (ต้องเร่งรัด)`;
    }
    return {
      color: 'red' as const,
      isBlinking: true,
      tooltip: `สีแดง (กระพริบ): ${reason}`,
    };
  }

  // สีเหลือง (กระพริบ)=กำลังดำเนินการ จำนวนครั้งที่ติดตามไม่เกิน 3 ครั้ง
  return {
    color: 'yellow' as const,
    isBlinking: true,
    tooltip: `สีเหลือง (กระพริบ): กำลังดำเนินการ (ติดตาม ${followUpCount}/3 ครั้ง)`,
  };
}

/**
 * ไอคอนจุดแสดงสถานะหน้าเลขที่งาน (TASK-XXXX)
 * - สีแดง (กระพริบ) = เหลือเวลากำหนดอีก 3 วันเป็นต้นไปจนเลยระยะเวลา
 * - สีเหลือง (กระพริบ) = กำลังดำเนินการ จำนวนครั้งที่ติดตามไม่เกิน 3 ครั้ง
 * - สีเขียว = ปิดงานเสร็จสิ้น
 */
export const TaskStatusDot: React.FC<{ task: Task; size?: 'sm' | 'md' }> = ({ task, size = 'sm' }) => {
  const status = getTaskBlinkingStatus(task);
  const sizeClasses = size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5';

  if (status.color === 'green') {
    return (
      <span className={`relative inline-flex ${sizeClasses} shrink-0`} title={status.tooltip}>
        <span className={`inline-flex rounded-full ${sizeClasses} bg-emerald-500 ring-2 ring-emerald-200`} />
      </span>
    );
  }

  if (status.color === 'red') {
    return (
      <span className={`relative flex ${sizeClasses} shrink-0`} title={status.tooltip}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
        <span className={`relative inline-flex rounded-full ${sizeClasses} bg-red-600 ring-2 ring-red-200 shadow-xs shadow-red-500/50`} />
      </span>
    );
  }

  // Yellow
  return (
    <span className={`relative flex ${sizeClasses} shrink-0`} title={status.tooltip}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
      <span className={`relative inline-flex rounded-full ${sizeClasses} bg-amber-500 ring-2 ring-amber-200 shadow-xs shadow-amber-400/50`} />
    </span>
  );
};

/**
 * ป้ายแสดงสถานะครั้งที่ติดตามงาน (1, 2, 3...)
 */
export const FollowUpBadge: React.FC<{ count?: number; className?: string }> = ({ count = 0, className = '' }) => {
  if (!count || count === 0) {
    return (
      <span 
        className={`inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200 shrink-0 ${className}`}
        title="ยังไม่เคยติดตามงาน"
      >
        <span>ยังไม่ติดตาม</span>
      </span>
    );
  }

  if (count === 1) {
    return (
      <span 
        className={`inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200 shrink-0 ${className}`}
        title="ติดตามงานแล้ว 1 ครั้ง"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <span>ติดตามครั้งที่ 1</span>
      </span>
    );
  }

  if (count === 2) {
    return (
      <span 
        className={`inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300 shrink-0 ${className}`}
        title="ติดตามงานแล้ว 2 ครั้ง"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>ติดตามครั้งที่ 2</span>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-black px-2 py-0.5 rounded-full border border-red-300 shrink-0 animate-pulse ${className}`}
      title={`ติดตามงานแล้ว ${count} ครั้ง (เร่งรัด)`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
      <span>ติดตามครั้งที่ {count} (เร่งรัด)</span>
    </span>
  );
};

interface TaskCountdownBadgeProps {
  task: Task;
  compact?: boolean;
}

export const TaskCountdownBadge: React.FC<TaskCountdownBadgeProps> = ({ task, compact = false }) => {
  const info = getTaskCountdownInfo(task);

  if (info.isClosed) {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[11px] shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>ปิดงานแล้ว</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black transition-all ${info.badgeClass} ${info.pulseClass}`}
      title={`นับถอยหลังกำหนดส่ง: ${info.text} (กระพริบเตือนจนกว่าจะปิดงาน)`}
    >
      {/* Blinking radar beacon dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-80 ${info.dotColor}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${info.dotColor}`} />
      </span>

      {info.isOverdue ? (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <Clock className="w-3.5 h-3.5 shrink-0" />
      )}

      <span>{compact ? info.text : `นับถอยหลัง: ${info.text}`}</span>
    </span>
  );
};

interface CopyFollowUpButtonProps {
  task: Task;
  variant?: 'default' | 'compact' | 'button-only';
  className?: string;
  onFollowUpRecorded?: () => void;
  disabled?: boolean;
  currentUser?: User;
}

export const CopyFollowUpButton: React.FC<CopyFollowUpButtonProps> = ({
  task,
  variant = 'default',
  className = '',
  onFollowUpRecorded,
  disabled,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [lastRound, setLastRound] = useState<number | null>(null);

  const activeUser = currentUser || TaskStore.getCurrentUser();
  const isForbidden = disabled !== undefined ? disabled : !canUserEditTask(activeUser, task);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isForbidden) return;

    // Record follow-up count in TaskStore
    const res = TaskStore.recordTaskFollowUp(task.id);
    const round = res ? res.newCount : ((task.followUpCount || 0) + 1);
    setLastRound(round);

    const success = await copyTaskFollowUpMessage(res ? res.task : { ...task, followUpCount: round });
    if (success) {
      setCopied(true);
      if (onFollowUpRecorded) onFollowUpRecorded();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isForbidden) {
    if (variant === 'button-only') {
      return (
        <button
          type="button"
          disabled
          title="🔒 สิทธิ์ดูอย่างเดียว (ไม่มีสิทธิ์คัดลอกข้อความติดตามงาน)"
          className={`p-1.5 rounded-lg bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-40 shadow-none ${className}`}
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <span
          title="🔒 สิทธิ์ดูอย่างเดียว (ไม่มีสิทธิ์คัดลอกข้อความติดตามงาน)"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 select-none ${className}`}
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span>ดูอย่างเดียว (ห้ามคัดลอก)</span>
        </span>
      );
    }

    return (
      <span
        title="🔒 สิทธิ์ดูอย่างเดียว (ไม่มีสิทธิ์คัดลอกข้อความติดตามงาน)"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50 select-none ${className}`}
      >
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        <span>สิทธิ์ดูอย่างเดียว</span>
      </span>
    );
  }

  if (variant === 'button-only') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? `คัดลอกครั้งที่ ${lastRound} เรียบร้อยแล้ว!` : `คัดลอกข้อความติดตามงาน ครั้งที่ ${(task.followUpCount || 0) + 1}`}
        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
          copied
            ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105'
            : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200'
        } ${className}`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={`คัดลอกข้อความติดตามงาน ครั้งที่ ${(task.followUpCount || 0) + 1}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
          copied
            ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span>คัดลอกครั้งที่ {lastRound} แล้ว!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>คัดลอกติดตาม (ครั้งที่ {(task.followUpCount || 0) + 1})</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
        copied
          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-102'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>คัดลอกติดตามงาน ครั้งที่ {lastRound} แล้ว!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>คัดลอกติดตามงาน (ครั้งที่ {(task.followUpCount || 0) + 1})</span>
        </>
      )}
    </button>
  );
};
