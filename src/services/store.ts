import type { Task, User, ProblemRequest, AppNotification, UserRole, TaskStatus, AuditLog, ProgressNote, Attachment, DirectiveType, TaskPriority, ExecutiveAuthority } from '../types';
import { INITIAL_USERS, INITIAL_TASKS, INITIAL_PROBLEM_REQUESTS, INITIAL_NOTIFICATIONS } from './mockData';
import { getDaysDifference, isNameMatch, isSameDepartment } from '../utils/followUp';

const STORAGE_KEYS = {
  USERS: 'work_tracking_users',
  TASKS: 'work_tracking_tasks',
  PROBLEM_REQUESTS: 'work_tracking_problem_requests',
  NOTIFICATIONS: 'work_tracking_notifications',
  CURRENT_USER_ID: 'work_tracking_current_user_id',
};

function getFromStorage<T>(key: string, initialData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from LocalStorage`, error);
    return initialData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to LocalStorage`, error);
  }
}

export function computeTimelineStatus(deadlineStr: string, status: TaskStatus, refDate?: Date): 'ปกติ' | 'ใกล้ครบกำหนด' | 'เกินกำหนด' {
  if (status === 'เสร็จสิ้น') return 'ปกติ';

  const diffDays = getDaysDifference(deadlineStr, refDate);

  if (diffDays < 0) {
    return 'เกินกำหนด';
  } else if (diffDays <= 3) {
    return 'ใกล้ครบกำหนด';
  }
  return 'ปกติ';
}

export class TaskStore {
  static getUsers(): User[] {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    let changed = false;

    // Ensure all users in INITIAL_USERS exist in users array with updated info & pin
    INITIAL_USERS.forEach(initUser => {
      const existingIndex = users.findIndex(u => u.id === initUser.id);
      if (existingIndex === -1) {
        users.push(initUser);
        changed = true;
      } else {
        if (
          users[existingIndex].pin !== initUser.pin || 
          users[existingIndex].department !== initUser.department || 
          users[existingIndex].role !== initUser.role ||
          users[existingIndex].name !== initUser.name ||
          users[existingIndex].avatar !== initUser.avatar ||
          JSON.stringify(users[existingIndex].allowedExecutives) !== JSON.stringify(initUser.allowedExecutives) ||
          !users[existingIndex].avatar?.startsWith('data:image/svg+xml')
        ) {
          users[existingIndex] = { ...users[existingIndex], ...initUser };
          changed = true;
        }
      }
    });

    if (changed) {
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
    return users;
  }

  static verifyPin(pin: string, userId?: string): { success: boolean; user?: User; message?: string } {
    const users = this.getUsers();

    // 1. If userId is provided, check if pin matches selected user
    if (userId) {
      const selected = users.find(u => u.id === userId);
      if (selected && selected.pin === pin) {
        return { success: true, user: selected };
      }
    }

    // 2. Direct lookup by user's specific PIN
    const matched = users.find(u => u.pin === pin);
    if (matched) {
      return { success: true, user: matched };
    }

    // 3. Fallbacks for specific known PINs:
    // Admin PINs: 21212496 (Ranida.c) and 21211953 (Natanong.s)
    if (pin === '21212496' || pin === '21211953') {
      const admin = (pin === '21211953')
        ? (users.find(u => u.name.includes('Natanong')) || users.find(u => u.role === 'admin'))
        : (users.find(u => u.name.includes('Ranida')) || users.find(u => u.role === 'admin'));
      return { success: true, user: admin || users[0] };
    }

    // Executive PINs:
    if (pin === '1111111') { // ผอ. นายปรีดา ยังสุขสถาพร
      const exec = users.find(u => u.name.includes('ปรีดา')) || users.find(u => u.role === 'executive');
      return { success: true, user: exec || users[0] };
    }
    if (pin === '07170184') { // รผอ.บร. นายศุภชาติ ชาสมบัติ
      const exec = users.find(u => u.name.includes('ศุภชาติ')) || users.find(u => u.role === 'executive');
      return { success: true, user: exec || users[0] };
    }
    if (pin === '07170185') { // รผอ.พกป. นางนิติกร ขาวดี
      const exec = users.find(u => u.name.includes('นิติกร')) || users.find(u => u.role === 'executive');
      return { success: true, user: exec || users[0] };
    }
    if (pin === '07170006') { // รผอ.สป.ทร. นางสาวปิยวรรณ แก้วกล้า
      const exec = users.find(u => u.name.includes('ปิยวรรณ')) || users.find(u => u.role === 'executive');
      return { success: true, user: exec || users[0] };
    }

    // Secretariat Office individual PINs
    if (pin === '07170176') { // น.ส.กนกกร ศิลา
      const u = users.find(x => x.name.includes('กนกกร'));
      if (u) return { success: true, user: u };
    }
    if (pin === '07170088') { // นางสาวกันยาวีร์ ลิ้มอมรสวัสดิ์
      const u = users.find(x => x.name.includes('กันยาวี'));
      if (u) return { success: true, user: u };
    }
    if (pin === '07170169') { // น.ส.ทิพาพร พลสยม
      const u = users.find(x => x.name.includes('ทิพาพร'));
      if (u) return { success: true, user: u };
    }
    if (pin === '07170171') { // น.ส.ภาณุมาศ สุขจันทร์
      const u = users.find(x => x.name.includes('ภาณุมาศ'));
      if (u) return { success: true, user: u };
    }
    if (pin === '07170212') { // นายเจษฎา ศรีเทพ
      const u = users.find(x => x.name.includes('เจษฎา'));
      if (u) return { success: true, user: u };
    }

    return { success: false, message: 'รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = users.find(u => u.id === currentId);
    return found || users[0];
  }

  static setCurrentUser(userId: string): User {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    return user;
  }

  static switchRole(role: UserRole): User {
    const users = this.getUsers();
    const userWithRole = users.find(u => u.role === role) || users[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userWithRole.id);
    return userWithRole;
  }

  static getTasks(): Task[] {
    const rawTasks = getFromStorage<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    let changed = false;
    
    // Ensure all tasks have executiveAuthority
    const mappedTasks: Task[] = rawTasks.map(task => {
      let execAuth = task.executiveAuthority;
      if (!execAuth) {
        changed = true;
        if (task.directiveRef?.includes('รผอ.บร') || task.title?.includes('แม่ข่าย') || task.title?.includes('งบประมาณ')) {
          execAuth = 'รผอ.บร.';
        } else if (task.directiveRef?.includes('รผอ.พกป') || task.title?.includes('สุขอนามัย') || task.title?.includes('ทักษะ')) {
          execAuth = 'รผอ.พกป.';
        } else if (task.directiveRef?.includes('รผอ.สปทร') || task.title?.includes('เทียบเรือ') || task.title?.includes('คอมพิวเตอร์')) {
          execAuth = 'รผอ.สปทร.';
        } else {
          execAuth = 'ผอ.';
        }
      }
      let count = task.followUpCount;
      if (count === undefined) {
        changed = true;
        const init = INITIAL_TASKS.find(it => it.id === task.id);
        count = init?.followUpCount !== undefined ? init.followUpCount : 1;
      }

      const newTimelineStatus = computeTimelineStatus(task.deadline, task.status);
      if (task.timelineStatus !== newTimelineStatus) {
        changed = true;
      }

      let taskDept = task.department;
      if (taskDept === 'สำนักงานเลขาผู้อำนวยการ (สลข.ผอ.)') {
        taskDept = 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)';
        changed = true;
      }

      return {
        ...task,
        department: taskDept,
        executiveAuthority: execAuth,
        followUpCount: count,
        timelineStatus: newTimelineStatus
      };
    });

    // Check if new initial tasks (007, 008) should be merged
    INITIAL_TASKS.forEach(initTask => {
      if (!mappedTasks.some(t => t.id === initTask.id)) {
        mappedTasks.push({
          ...initTask,
          followUpCount: initTask.followUpCount ?? 0,
          executiveAuthority: initTask.executiveAuthority || 'ผอ.',
        });
        changed = true;
      }
    });

    if (changed) {
      this.saveTasks(mappedTasks);
    }
    return mappedTasks;
  }

  static saveTasks(tasks: Task[]): void {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }

  // Create Directives for single or multiple departments (All / Selected Departments)
  static createDirectivesForDepartments(params: {
    targetDepartments: string[];
    title: string;
    description: string;
    directiveRef: string;
    directiveType: DirectiveType;
    executiveAuthority: ExecutiveAuthority;
    directiveFileName?: string;
    assigneeName?: string;
    dateReceived: string;
    deadline: string;
    priority: TaskPriority;
    sendEmailAlert: boolean;
  }): Task[] {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    const newTasksCreated: Task[] = [];
    let currentTaskCount = tasks.length;
    const execAuthority = params.executiveAuthority || 'ผอ.';

    const executiveFullTitles: Record<ExecutiveAuthority, string> = {
      'ผอ.': 'นายปรีดา ยังสุขสถาพร (ผอ.)',
      'รผอ.บร.': 'นายศุภชาติ ชาสมบัติ (รผอ.บร.)',
      'รผอ.พกป.': 'นางนิติกร ขาวดี (รผอ.พกป.)',
      'รผอ.สปทร.': 'นางสาวปิยวรรณ แก้วกล้า (รผอ.สปทร.)',
    };

    const assignorText = currentUser.role === 'secretary' || currentUser.name.includes('เลขา')
      ? `${executiveFullTitles[execAuthority]} (บันทึกโดย ${currentUser.name})`
      : (currentUser.role === 'executive' ? (currentUser.name || `${executiveFullTitles[execAuthority]}`) : `${executiveFullTitles[execAuthority]}`);

    const designatedAssignee = (params.assigneeName && params.assigneeName.trim()) 
      ? params.assigneeName.trim() 
      : 'รอหัวหน้าหน่วยงานมอบหมาย';

    params.targetDepartments.forEach((dept) => {
      currentTaskCount++;
      const nextId = `TASK-2026-${String(currentTaskCount).padStart(3, '0')}`;

      // Find Dept Head email & matching Assignee
      const deptHeadUser = users.find(u => isSameDepartment(u.department, dept) && (u.role === 'dept_head' || u.role === 'admin'));
      const deptEmail = deptHeadUser?.email || `head.${dept.toLowerCase().replace(/\s+/g, '')}@organization.go.th`;
      
      let assigneeEmail = deptEmail;
      if (designatedAssignee !== 'รอหัวหน้าหน่วยงานมอบหมาย') {
        const matchedUser = users.find(u => isNameMatch(u.name, designatedAssignee));
        if (matchedUser && matchedUser.email) {
          assigneeEmail = matchedUser.email;
        }
      }

      const attachments: Attachment[] = [];
      if (params.directiveFileName && params.directiveFileName.trim() !== '') {
        attachments.push({
          id: `ATT-DIR-${Date.now()}-${currentTaskCount}`,
          fileName: `บันทึกสั่งการ_${params.directiveFileName}`,
          fileSize: '1.2 MB',
          fileType: 'pdf',
          uploadedAt: timestamp,
          uploadedBy: currentUser.name,
        });
      }

      const initialAudit: AuditLog = {
        id: `LOG-${Date.now()}-${currentTaskCount}`,
        timestamp,
        actor: currentUser.name,
        action: `ออกบันทึกข้อสั่งการ (${execAuthority}) ส่งถึงหน่วยงาน`,
        details: `บันทึกงานตาม "${params.directiveRef}" มอบหมายให้ ${dept} (${designatedAssignee !== 'รอหัวหน้าหน่วยงานมอบหมาย' ? `ผู้รับผิดชอบ: ${designatedAssignee}` : 'รอหัวหน้าหน่วยงานมอบหมายผู้ปฏิบัติงาน'}) [ส่งอีเมลถึง ${deptEmail}]`,
        isEmailSent: params.sendEmailAlert,
        emailRecipient: deptEmail,
      };

      const newTask: Task = {
        id: nextId,
        title: params.title,
        description: params.description,
        department: dept,
        assignee: designatedAssignee,
        assigneeEmail: assigneeEmail,
        assignor: assignorText,
        directiveRef: params.directiveRef,
        directiveType: params.directiveType,
        executiveAuthority: execAuthority,
        directiveFile: params.directiveFileName,
        dateReceived: params.dateReceived,
        deadline: params.deadline,
        status: 'รอดำเนินการ',
        progress: 0,
        priority: params.priority,
        timelineStatus: computeTimelineStatus(params.deadline, 'รอดำเนินการ'),
        followUpCount: 0,
        progressNotes: [],
        attachments,
        auditLogs: [initialAudit],
        isEmailNotified: params.sendEmailAlert,
      };

      newTasksCreated.push(newTask);

      // System & Email Notification to Dept Head
      this.addNotification({
        taskId: newTask.id,
        title: `🔵 คำสั่งการ ${execAuthority} ใหม่ถึง ${dept}`,
        message: `มีข้อสั่งการ ${execAuthority} เรื่อง "${newTask.title}" ตาม ${newTask.directiveRef} ส่งถึง ${dept} (${designatedAssignee !== 'รอหัวหน้าหน่วยงานมอบหมาย' ? `ผู้รับผิดชอบ: ${designatedAssignee}` : 'รอหัวหน้าหน่วยงานระบุผู้รับผิดชอบ'})`,
        type: 'new_assigned',
        isEmailSent: params.sendEmailAlert,
        recipientEmail: deptEmail,
      });
    });

    const updatedTasks = [...newTasksCreated, ...tasks];
    this.saveTasks(updatedTasks);
    return newTasksCreated;
  }

  // Dept Head assigns an officer to the task
  static assignOfficerByDeptHead(taskId: string, officerName: string, headNotes?: string): Task | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const officerUser = users.find(u => u.name === officerName);
    const officerEmail = officerUser?.email || `${officerName.toLowerCase().replace(/\s+/g, '.')}@organization.go.th`;
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: 'หัวหน้าหน่วยงานมอบหมายผู้ปฏิบัติงาน',
      details: `หัวหน้า ${task.department} มอบหมายงานให้ "${officerName}" ดำเนินการ${headNotes ? ` (บันทึกสั่งการ: ${headNotes})` : ''} [ส่งอีเมลแจ้งเตือนถึง ${officerEmail}]`,
      isEmailSent: true,
      emailRecipient: officerEmail,
    };

    const updatedTask: Task = {
      ...task,
      assignee: officerName,
      assigneeEmail: officerEmail,
      status: 'กำลังดำเนินการ',
      progress: task.progress === 0 ? 10 : task.progress,
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    // Notify Officer
    this.addNotification({
      taskId: task.id,
      title: '🔵 หัวหน้าหน่วยงานมอบหมายงานให้คุณ',
      message: `${currentUser.name} (หัวหน้า ${task.department}) มอบหมายงานตาม "${task.directiveRef}": "${task.title}" ให้คุณรับผิดชอบ (ส่งอีเมลถึง ${officerEmail})`,
      type: 'new_assigned',
      isEmailSent: true,
      recipientEmail: officerEmail,
    });

    return updatedTask;
  }

  static updateTaskStatus(
    taskId: string, 
    newStatus: TaskStatus, 
    completionDetail?: string,
    completionDate?: string
  ): Task | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const oldStatus = task.status;
    if (oldStatus === newStatus && !completionDetail) return task;

    let newProgress = task.progress;
    if (newStatus === 'เสร็จสิ้น') {
      newProgress = 100;
    } else if (newStatus === 'รอดำเนินการ' && oldStatus === 'เสร็จสิ้น') {
      newProgress = 0;
    }

    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    const todayISO = completionDate || new Date().toISOString().split('T')[0];

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: newStatus === 'เสร็จสิ้น' ? 'บันทึกปิดงานเสร็จสิ้น' : 'เปลี่ยนสถานะงาน',
      details: newStatus === 'เสร็จสิ้น' && completionDetail
        ? `ปิดงานเสร็จสิ้น (100%) - รายละเอียด: "${completionDetail}"`
        : `เปลี่ยนสถานะจาก "${oldStatus}" เป็น "${newStatus}" (${newProgress}%)`,
    };

    let updatedProgressNotes = [...task.progressNotes];
    if (newStatus === 'เสร็จสิ้น' && completionDetail?.trim()) {
      const newNote: ProgressNote = {
        id: `PN-${Date.now()}`,
        date: todayISO,
        detail: completionDetail.trim(),
        author: currentUser.name,
        percentage: 100,
      };
      updatedProgressNotes = [newNote, ...updatedProgressNotes];
    }

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      progress: newProgress,
      timelineStatus: computeTimelineStatus(task.deadline, newStatus),
      progressNotes: updatedProgressNotes,
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    if (newStatus === 'เสร็จสิ้น') {
      this.addNotification({
        taskId: task.id,
        title: '🟢 งานเสร็จสิ้นแล้ว',
        message: `งานตาม "${task.directiveRef}" ได้รับการบันทึกปิดงานเสร็จสิ้นแล้วโดย ${currentUser.name}${completionDetail ? ` (รายละเอียด: ${completionDetail})` : ''}`,
        type: 'completed',
        isEmailSent: true,
        recipientEmail: 'director.somsri@organization.go.th',
      });
    }

    return updatedTask;
  }

  static recordTaskFollowUp(taskId: string, actorName?: string): { task: Task; newCount: number } | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const currentCount = task.followUpCount || 0;
    const newCount = currentCount + 1;
    const actor = actorName || currentUser.name;
    const now = new Date();
    const timestampStr = now.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    const dateOnlyStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: timestampStr,
      actor,
      action: `ติดตามงาน ครั้งที่ ${newCount}`,
      details: `ติดตามงาน ครั้งที่ ${newCount} ส่งข้อความแจ้งเตือนผู้รับผิดชอบ (${task.assignee}) ประจำหน่วยงาน ${task.department}`,
    };

    const updatedTask: Task = {
      ...task,
      followUpCount: newCount,
      lastFollowedUpAt: dateOnlyStr,
      lastFollowedUpBy: actor,
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return { task: updatedTask, newCount };
  }

  static updateTaskProgress(taskId: string, newProgress: number, noteDetail?: string): Task | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    const todayStr = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });

    let newStatus = task.status;
    if (newProgress === 100) {
      newStatus = 'เสร็จสิ้น';
    } else if (newProgress > 0 && task.status === 'รอดำเนินการ') {
      newStatus = 'กำลังดำเนินการ';
    }

    const updatedNotes: ProgressNote[] = [...task.progressNotes];
    if (noteDetail && noteDetail.trim() !== '') {
      updatedNotes.unshift({
        id: `PN-${Date.now()}`,
        date: todayStr,
        detail: noteDetail,
        author: currentUser.name,
        percentage: newProgress,
      });
    }

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: 'อัปเดตความคืบหน้า',
      details: `ปรับความคืบหน้าเป็น ${newProgress}%${noteDetail ? ` (บันทึก: ${noteDetail})` : ''}`,
    };

    const updatedTask: Task = {
      ...task,
      progress: newProgress,
      status: newStatus,
      progressNotes: updatedNotes,
      timelineStatus: computeTimelineStatus(task.deadline, newStatus),
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  static addAttachment(taskId: string, fileName: string, fileSize: string, fileType: Attachment['fileType']): Task | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    const newAttachment: Attachment = {
      id: `ATT-${Date.now()}`,
      fileName,
      fileSize,
      fileType,
      uploadedAt: timestamp,
      uploadedBy: currentUser.name,
    };

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: 'แนบเอกสาร',
      details: `แนบไฟล์เอกสาร "${fileName}" (${fileSize})`,
    };

    const updatedTask: Task = {
      ...task,
      attachments: [newAttachment, ...task.attachments],
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  static resendEmailNotification(taskId: string): boolean {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return false;

    const task = tasks[index];
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    const recipient = task.assigneeEmail || 'officer@organization.go.th';

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: 'ส่งอีเมลแจ้งเตือนซ้ำ',
      details: `ส่งอีเมลแจ้งเตือนงานตาม "${task.directiveRef}" ไปยัง ${recipient} เรียบร้อยแล้ว`,
      isEmailSent: true,
      emailRecipient: recipient,
    };

    tasks[index] = {
      ...task,
      auditLogs: [audit, ...task.auditLogs],
    };
    this.saveTasks(tasks);

    this.addNotification({
      taskId: task.id,
      title: '📧 ส่งอีเมลแจ้งเตือนสำเร็จ',
      message: `ส่งอีเมลแจ้งเตือนติดตามงานถึง ${recipient} สำหรับงาน "${task.title}"`,
      type: 'new_assigned',
      isEmailSent: true,
      recipientEmail: recipient,
    });

    return true;
  }

  static submitProblemRequest(taskId: string, reason: string, requestedAssignee: string): ProblemRequest | null {
    const tasks = this.getTasks();
    const currentUser = this.getCurrentUser();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    const problemRequests = this.getProblemRequests();
    const newReq: ProblemRequest = {
      id: `REQ-${Date.now()}`,
      taskId: task.id,
      taskTitle: task.title,
      reason,
      requestedAssignee,
      currentAssignee: task.assignee,
      department: task.department,
      status: 'pending',
      requestedAt: timestamp,
    };
    saveToStorage(STORAGE_KEYS.PROBLEM_REQUESTS, [newReq, ...problemRequests]);

    const audit: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp,
      actor: currentUser.name,
      action: 'แจ้งติดปัญหา / ขอเปลี่ยนผู้รับผิดชอบ',
      details: `ระบุเหตุผล: "${reason}" เสนอเปลี่ยนผู้รับผิดชอบเป็น ${requestedAssignee} (ส่งอีเมลแจ้งเตือนถึง ผอ. director.somsri@organization.go.th)`,
      isEmailSent: true,
      emailRecipient: 'director.somsri@organization.go.th',
    };

    const updatedTask: Task = {
      ...task,
      status: 'ติดปัญหา',
      hasProblemRequest: true,
      auditLogs: [audit, ...task.auditLogs],
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);

    this.addNotification({
      taskId: task.id,
      title: '⚠️ แจ้งเตือนติดปัญหา (ส่งอีเมลถึง ผอ. แล้ว)',
      message: `${currentUser.name} แจ้งติดปัญหาในงานตามคำสั่งการ ผอ. "${task.title}" (ส่งอีเมลเตือนไปยัง director.somsri@organization.go.th)`,
      type: 'problem_reported',
      isEmailSent: true,
      recipientEmail: 'director.somsri@organization.go.th',
    });

    return newReq;
  }

  static getProblemRequests(): ProblemRequest[] {
    return getFromStorage<ProblemRequest[]>(STORAGE_KEYS.PROBLEM_REQUESTS, INITIAL_PROBLEM_REQUESTS);
  }

  static approveProblemRequest(requestId: string, reviewerComment?: string): boolean {
    const requests = this.getProblemRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;

    const req = requests[reqIndex];
    const currentUser = this.getCurrentUser();
    const users = this.getUsers();
    const newAssigneeUser = users.find(u => u.name === req.requestedAssignee);
    const newEmail = newAssigneeUser?.email || `${req.requestedAssignee.toLowerCase().replace(/\s+/g, '.')}@organization.go.th`;

    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    requests[reqIndex] = {
      ...req,
      status: 'approved',
      reviewedAt: timestamp,
      reviewer: currentUser.name,
      reviewComment: reviewerComment,
    };
    saveToStorage(STORAGE_KEYS.PROBLEM_REQUESTS, requests);

    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      const audit: AuditLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actor: currentUser.name,
        action: 'ผอ./ผู้บริหาร อนุมัติเปลี่ยนผู้รับผิดชอบ',
        details: `อนุมัติเปลี่ยนผู้รับผิดชอบจาก "${req.currentAssignee}" เป็น "${req.requestedAssignee}" (ส่งอีเมลแจ้งเตือนผู้รับผิดชอบใหม่ที่ ${newEmail})`,
        isEmailSent: true,
        emailRecipient: newEmail,
      };

      tasks[taskIndex] = {
        ...task,
        assignee: req.requestedAssignee,
        assigneeEmail: newEmail,
        status: 'กำลังดำเนินการ',
        hasProblemRequest: false,
        auditLogs: [audit, ...task.auditLogs],
      };
      this.saveTasks(tasks);

      this.addNotification({
        taskId: task.id,
        title: '🔵 รับมอบหมายงานใหม่ (โอนย้ายตามอนุมัติ ผอ.)',
        message: `คุณได้รับการโอนย้ายงานตามคำสั่งการ ผอ.: "${task.title}" (ระบบส่งอีเมลแจ้งเตือนถึง ${newEmail} เรียบร้อย)`,
        type: 'new_assigned',
        isEmailSent: true,
        recipientEmail: newEmail,
      });
    }

    return true;
  }

  static rejectProblemRequest(requestId: string, reviewerComment?: string): boolean {
    const requests = this.getProblemRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return false;

    const req = requests[reqIndex];
    const currentUser = this.getCurrentUser();
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    requests[reqIndex] = {
      ...req,
      status: 'rejected',
      reviewedAt: timestamp,
      reviewer: currentUser.name,
      reviewComment: reviewerComment,
    };
    saveToStorage(STORAGE_KEYS.PROBLEM_REQUESTS, requests);

    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      const audit: AuditLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        actor: currentUser.name,
        action: 'ไม่อนุมัติคำขอเปลี่ยนผู้รับผิดชอบ',
        details: `ปฏิเสธคำขอเปลี่ยนผู้รับผิดชอบ (${reviewerComment ? `เหตุผล: ${reviewerComment}` : 'คงผู้รับผิดชอบเดิม'})`,
      };

      tasks[taskIndex] = {
        ...task,
        hasProblemRequest: false,
        auditLogs: [audit, ...task.auditLogs],
      };
      this.saveTasks(tasks);
    }

    return true;
  }

  static getNotifications(): AppNotification[] {
    return getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static addNotification(notifData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): AppNotification {
    const notifications = this.getNotifications();
    const timestamp = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    const newNotif: AppNotification = {
      ...notifData,
      id: `NOTIF-${Date.now()}`,
      timestamp,
      isRead: false,
    };
    const updated = [newNotif, ...notifications];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    return newNotif;
  }

  static markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  static markAllNotificationsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }
}
