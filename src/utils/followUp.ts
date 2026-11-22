import type { Task, User } from '../types';
import { TaskStore } from '../services/store';

export interface CountdownInfo {
  isClosed: boolean;
  isOverdue: boolean;
  isUrgent: boolean;
  daysRemaining: number;
  text: string;
  badgeClass: string;
  dotColor: string;
  pulseClass: string;
  iconType: 'check' | 'alert' | 'clock';
}

/**
 * คำนวณจำนวนวันที่เหลือจนถึงกำหนดส่ง (เทียบกับวันที่ปัจจุบัน)
 * คืนค่า:
 * > 0: เหลืออีก X วัน
 * = 0: ครบกำหนดวันนี้
 * < 0: เกินกำหนด X วัน
 */
export function getDaysDifference(deadlineStr: string, refDate?: Date): number {
  if (!deadlineStr) return 0;
  const now = refDate || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let deadline: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(deadlineStr)) {
    const [y, m, d] = deadlineStr.split('-').map(Number);
    deadline = new Date(y, m - 1, d);
  } else {
    deadline = new Date(deadlineStr);
  }
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * เปรียบเทียบชื่อบุคคลแบบยืดหยุ่น (รองรับการพิมพ์เฉพาะชื่อ, ไม่ใส่คำนำหน้า, หรือมี/ไม่มีนามสกุล)
 */
export function isNameMatch(personA?: string, personB?: string): boolean {
  if (!personA || !personB) return false;
  const pA = personA.trim();
  const pB = personB.trim();
  if (!pA || !pB) return false;
  if (pA === pB) return true;

  // มีข้อความของอีกคนซ่อนอยู่ เช่น "สมศรี วิเศษ (ผอ.) (บันทึกโดย นางสาวกันยาวีย์ ลิ้มอมรสวัสดิ์)"
  if (pA.includes(pB) || pB.includes(pA)) return true;

  const stripTitles = (s: string) =>
    s
      .replace(/^(นาย|นางสาว|นาง|ว่าที่\s*ร\.ต\.|ดร\.|อาจารย์|ผอ\.|รอง\s*ผอ\.)\s*/g, '')
      .replace(/\s+/g, '')
      .toLowerCase();

  const cleanA = stripTitles(pA);
  const cleanB = stripTitles(pB);

  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return true;

  // ตรวจสอบตามคำแยกย่อย (token) เช่น กันยาวีย์
  const extractTokens = (s: string) =>
    s
      .replace(/^(นาย|นางสาว|นาง|ว่าที่\s*ร\.ต\.|ดร\.|อาจารย์|ผอ\.|รอง\s*ผอ\.)\s*/g, '')
      .trim()
      .split(/\s+/)
      .filter(t => t.length >= 3);

  const tokensA = extractTokens(pA);
  const tokensB = extractTokens(pB);

  return tokensA.some(tA => tokensB.some(tB => tA === tB || tA.includes(tB) || tB.includes(tA)));
}

/**
 * เปรียบเทียบชื่อหน่วยงาน (รองรับทั้งชื่อย่อในวงเล็บ เช่น (สลข.ผอ.) และชื่อเต็ม)
 */
export function isSameDepartment(deptA?: string, deptB?: string): boolean {
  if (!deptA || !deptB) return false;
  const dA = deptA.trim();
  const dB = deptB.trim();
  if (dA === dB) return true;

  const codeA = dA.match(/\(([^)]+)\)/)?.[1]?.trim();
  const codeB = dB.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (codeA && codeB && codeA === codeB) return true;

  const norm = (s: string) => s.replace(/\s+/g, '').replace(/สำนักงานเลขา/, 'สำนักงานเลขานุการ');
  return norm(dA) === norm(dB);
}

export function getFormattedDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTaskCountdownInfo(task: Task, refDate?: Date): CountdownInfo {
  if (task.status === 'เสร็จสิ้น') {
    return {
      isClosed: true,
      isOverdue: false,
      isUrgent: false,
      daysRemaining: 0,
      text: 'ปิดงานเรียบร้อยแล้ว',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
      dotColor: 'bg-emerald-500',
      pulseClass: '', // ไม่กระพริบเมื่อปิดงาน
      iconType: 'check',
    };
  }

  const diffDays = getDaysDifference(task.deadline, refDate);

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      isClosed: false,
      isOverdue: true,
      isUrgent: true,
      daysRemaining: diffDays,
      text: `เกินกำหนด ${overdueDays} วัน`,
      badgeClass: 'bg-red-600 text-white font-black shadow-md border border-red-400',
      dotColor: 'bg-red-400',
      pulseClass: 'animate-blink',
      iconType: 'alert',
    };
  } else if (diffDays === 0) {
    return {
      isClosed: false,
      isOverdue: false,
      isUrgent: true,
      daysRemaining: 0,
      text: 'ครบกำหนดวันนี้!',
      badgeClass: 'bg-orange-500 text-white font-black shadow-md border border-orange-300',
      dotColor: 'bg-orange-300',
      pulseClass: 'animate-blink',
      iconType: 'alert',
    };
  } else if (diffDays <= 3) {
    return {
      isClosed: false,
      isOverdue: false,
      isUrgent: true,
      daysRemaining: diffDays,
      text: `เหลืออีก ${diffDays} วัน`,
      badgeClass: 'bg-amber-500 text-white font-black shadow-md border border-amber-300',
      dotColor: 'bg-amber-200',
      pulseClass: 'animate-blink',
      iconType: 'clock',
    };
  } else {
    return {
      isClosed: false,
      isOverdue: false,
      isUrgent: false,
      daysRemaining: diffDays,
      text: `เหลืออีก ${diffDays} วัน`,
      badgeClass: 'bg-blue-600 text-white font-black shadow-xs border border-blue-400',
      dotColor: 'bg-blue-300',
      pulseClass: 'animate-blink',
      iconType: 'clock',
    };
  }
}

export function getThaiDateString(date = new Date()): string {
  const day = date.getDate();
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export function generateFollowUpMessage(task: Task, user?: User, customRound?: number): string {
  const countdown = getTaskCountdownInfo(task);
  const currentUser = user || (typeof window !== 'undefined' ? TaskStore.getCurrentUser() : null);

  const round = customRound !== undefined 
    ? customRound 
    : (task.followUpCount && task.followUpCount > 0 ? task.followUpCount : 1);
  const dateStr = getThaiDateString();

  // ผู้ทำรายการ / ข้อมูลผู้ส่งข้อความติดตาม
  const actorName = currentUser ? currentUser.name : 'นางสาวกันยาวีร์ ลิ้มอมรสวัสดิ์';
  const actorDept = currentUser?.department || 'สำนักงานเลขาผู้อำนวยการ (สลข.ผอ.)';

  if (task.status === 'เสร็จสิ้น') {
    let completionDetail = 'ดำเนินงานเสร็จสิ้นตามข้อสั่งการเรียบร้อยแล้ว';
    if (task.progressNotes && task.progressNotes.length > 0) {
      completionDetail = task.progressNotes[0].detail;
    } else if (task.description) {
      completionDetail = task.description;
    }

    return `📋 [ข้อความติดตามงานข้อสั่งการ]
ครั้งที่ ${round}: ${dateStr}
--------------------------------
📌 เรื่อง:
${task.title}
🏷️ รหัสงาน: ${task.id}
🏛️ สายงานข้อสั่งการ: ${task.executiveAuthority || 'ผอ.'} (${task.assignor})
📜 เลขที่อ้างอิง: ${task.directiveRef || '-'}
🏢 หน่วยงานผู้รับผิดชอบ:
${task.department}
👤 ผู้รับผิดชอบ: ${task.assignee}
📅 กำหนดส่ง: ${task.deadline} (✅ ปิดงานแล้ว)
📊 สถานะ / ความคืบหน้า: ${task.progress}% (${task.status})
🎯 รายละเอียดการปิดงาน:
${completionDetail}
--------------------------------
✅ การรายงานเสร็จสิ้น ขอบคุณค่ะ

${actorName}
${actorDept}`;
  }

  // งานที่ยังอยู่ระหว่างดำเนินการ / รอดำเนินการ / ติดปัญหา / เกินกำหนด
  let deadlineStatusText = '';
  if (countdown.isOverdue) {
    deadlineStatusText = `🚨 ${countdown.text}`;
  } else if (countdown.daysRemaining === 0) {
    deadlineStatusText = `⚠️ ${countdown.text}`;
  } else {
    deadlineStatusText = `⏰ ${countdown.text}`;
  }

  return `📋 [ติดตามงานตามข้อสั่งการ]
ครั้งที่ ${round}: ${dateStr}
--------------------------------
📅 กำหนดส่ง: ${task.deadline} (${deadlineStatusText})
🏛️ สายงานข้อสั่งการ: ${task.executiveAuthority || 'ผอ.'} (${task.assignor})
🏢 หน่วยงานผู้รับผิดชอบ:
${task.department}
👤 ผู้รับผิดชอบ: ${task.assignee}
🏷️ รหัสงาน: ${task.id}
📌 เรื่อง:
${task.title}
📜 เลขที่อ้างอิง: ${task.directiveRef || '-'}
📊 สถานะ / ความคืบหน้า: ${task.progress}% (${task.status})
--------------------------------
⚠️ กรุณาดำเนินการและรายงานความคืบหน้า เพื่อรายงานผู้บริหารต่อไป
ขอบคุณค่ะ

${actorName}
${actorDept}`;
}

export async function copyTaskFollowUpMessage(task: Task, user?: User, customRound?: number): Promise<boolean> {
  const text = generateFollowUpMessage(task, user, customRound);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * ตรวจสอบสิทธิ์ว่าผู้ใช้งานสามารถแก้ไขหรือเปลี่ยนสถานะของงานนี้ได้หรือไม่
 * - Admin: แก้ไขได้ทุกงาน
 * - เลขา (Secretary): แก้ไขได้เฉพาะงานในสายงานผู้บริหารที่ตนได้รับมอบหมาย (allowedExecutives)
 *   ถ้าเป็นงานของ รผอ. ท่านอื่น -> วิวได้อย่างเดียว (View Only)
 * - ผู้บริหาร (Executive): แก้ไขงานของสายงานตนเอง
 * - หัวหน้าหน่วยงาน / เจ้าหน้าที่: ตามหน่วยงานหรือผู้รับผิดชอบ
 */
export function canUserEditTask(currentUser?: User, task?: Task): boolean {
  if (!currentUser || !task) return true;
  if (currentUser.role === 'admin') return true;

  // กฎสำหรับเลขานุการ (Secretary):
  if (currentUser.role === 'secretary') {
    if (currentUser.allowedExecutives && currentUser.allowedExecutives.length > 0) {
      const taskExec = task.executiveAuthority || 'ผอ.';
      return currentUser.allowedExecutives.includes(taskExec);
    }
    return true;
  }

  // กฎสำหรับผู้บริหาร (Executive):
  if (currentUser.role === 'executive') {
    if (currentUser.allowedExecutives && currentUser.allowedExecutives.length > 0) {
      const taskExec = task.executiveAuthority || 'ผอ.';
      return currentUser.allowedExecutives.includes(taskExec);
    }
    return true;
  }

  if (currentUser.role === 'dept_head') {
    return isSameDepartment(currentUser.department, task.department);
  }

  if (currentUser.role === 'officer') {
    return isNameMatch(currentUser.name, task.assignee) || isSameDepartment(currentUser.department, task.department);
  }

  return true;
}
