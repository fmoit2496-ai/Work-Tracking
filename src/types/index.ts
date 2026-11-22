export type UserRole = 'admin' | 'executive' | 'dept_head' | 'officer' | 'secretary';

export type ExecutiveAuthority = 'ผอ.' | 'รผอ.บร.' | 'รผอ.พกป.' | 'รผอ.สปทร.';

export interface ExecutiveInfo {
  id: ExecutiveAuthority;
  label: string;
  roleTitle: string;
  shortDesc: string;
  badgeBg: string;
  badgeText: string;
  lightBg: string;
  border: string;
  colorHex: string;
}

export const EXECUTIVE_LIST: ExecutiveInfo[] = [
  {
    id: 'ผอ.',
    label: 'ผอ.',
    roleTitle: 'ผู้อำนวยการ',
    shortDesc: 'ผู้อำนวยการองค์การสะพานปลา',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    lightBg: 'bg-blue-50 text-blue-800 border-blue-200',
    border: 'border-blue-500',
    colorHex: '#2563eb',
  },
  {
    id: 'รผอ.บร.',
    label: 'รผอ.บร.',
    roleTitle: 'รอง ผอ. ฝ่ายบริหาร',
    shortDesc: 'รองผู้อำนวยการฝ่ายบริหาร',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    lightBg: 'bg-purple-50 text-purple-800 border-purple-200',
    border: 'border-purple-500',
    colorHex: '#9333ea',
  },
  {
    id: 'รผอ.พกป.',
    label: 'รผอ.พกป.',
    roleTitle: 'รอง ผอ. ฝ่ายพัฒนากิจการประมง',
    shortDesc: 'รองผู้อำนวยการฝ่ายพัฒนากิจการประมง',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: 'border-emerald-500',
    colorHex: '#059669',
  },
  {
    id: 'รผอ.สปทร.',
    label: 'รผอ.สปทร.',
    roleTitle: 'รอง ผอ. ฝ่ายสะพานปลาและท่าเทียบเรือประมง',
    shortDesc: 'รองผู้อำนวยการฝ่ายสะพานปลาและท่าเทียบเรือประมง',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    lightBg: 'bg-amber-50 text-amber-900 border-amber-200',
    border: 'border-amber-500',
    colorHex: '#d97706',
  },
];

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  avatar?: string;
  position: string;
  email?: string;
  pin?: string;
  allowedExecutives?: ExecutiveAuthority[];
}

export type TaskStatus = 'รอดำเนินการ' | 'กำลังดำเนินการ' | 'ติดปัญหา' | 'เสร็จสิ้น';
export type TaskPriority = 'ปกติ' | 'เร่งด่วน' | 'เร่งด่วนมาก';
export type TimelineStatus = 'ปกติ' | 'ใกล้ครบกำหนด' | 'เกินกำหนด';
export type DirectiveType = 'คำสั่งการ ผอ.' | 'ข้อสั่งการที่ประชุมบริหาร' | 'หนังสือสั่งการราชการ' | 'งานตามภารกิจประจำ';

export interface ProgressNote {
  id: string;
  date: string;
  detail: string;
  author: string;
  percentage: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: 'xlsx' | 'pdf' | 'docx' | 'png' | 'zip' | 'other';
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  isEmailSent?: boolean;
  emailRecipient?: string;
}

export interface ProblemRequest {
  id: string;
  taskId: string;
  taskTitle: string;
  reason: string;
  requestedAssignee: string;
  currentAssignee: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  reviewComment?: string;
}

export interface Task {
  id: string; // e.g. TASK-2026-001
  title: string;
  description: string;
  department: string;
  assignee: string; // e.g. 'รอหัวหน้าหน่วยงานมอบหมาย' or Officer Name
  assigneeEmail?: string;
  assignor: string; // ผอ. หรือผู้สั่งการ
  directiveRef: string; // เลขที่คำสั่งการ / ข้อสั่งการ ผอ.
  directiveType: DirectiveType; // ประเภทคำสั่งการ
  executiveAuthority: ExecutiveAuthority; // 'ผอ.' | 'รผอ.บร.' | 'รผอ.พกป.' | 'รผอ.สปทร.'
  directiveFile?: string; // แนบบันทึกสั่งการ PDF/Doc
  dateReceived: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  status: TaskStatus;
  progress: number; // 0 - 100
  priority: TaskPriority;
  timelineStatus: TimelineStatus;
  progressNotes: ProgressNote[];
  attachments: Attachment[];
  auditLogs: AuditLog[];
  hasProblemRequest?: boolean;
  isEmailNotified?: boolean;
  followUpCount?: number; // ครั้งที่ติดตามงาน (1, 2, 3...)
  lastFollowedUpAt?: string; // วันที่ติดตามล่าสุด
  lastFollowedUpBy?: string; // ผู้ติดตามล่าสุด
}

export type NotificationType = 
  | 'new_assigned'      // 🔵 รับมอบหมายงานใหม่
  | 'deadline_3days'     // 🟡 เหลือ 3 วันถึงกำหนด
  | 'deadline_1day'      // 🟠 เหลือ 1 วันถึงกำหนด
  | 'overdue'            // 🔴 เกินกำหนด
  | 'completed'          // 🟢 งานเสร็จสิ้น
  | 'problem_reported';  // ⚠️ ผู้รับผิดชอบแจ้ง “ติดปัญหา”

export interface AppNotification {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  isEmailSent?: boolean;
  recipientEmail?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'all_tasks' 
  | 'my_tasks' 
  | 'dept_tasks' 
  | 'kanban' 
  | 'calendar' 
  | 'reports' 
  | 'audit_history' 
  | 'approvals' 
  | 'settings';
