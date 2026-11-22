import { useState, useEffect } from 'react';
import type { ActiveTab, User, Task, UserRole, AppNotification, TaskStatus, ExecutiveAuthority } from './types';
import { EXECUTIVE_LIST } from './types';
import { TaskStore } from './services/store';
import { isNameMatch, isSameDepartment } from './utils/followUp';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TaskListView } from './components/TaskListView';
import { KanbanView } from './components/KanbanView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFormModal } from './components/TaskFormModal';
import { CalendarView } from './components/CalendarView';
import { ReportView } from './components/ReportView';
import { AuditHistoryView } from './components/AuditHistoryView';
import { ApprovalView } from './components/ApprovalView';
import { SettingsView } from './components/SettingsView';
import { PinLoginModal } from './components/PinLoginModal';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('work_tracking_auth') === 'true';
  });
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => {
    return sessionStorage.getItem('work_tracking_is_admin_session') === 'true';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(TaskStore.getCurrentUser());
  const [tasks, setTasks] = useState<Task[]>(TaskStore.getTasks());
  const [notifications, setNotifications] = useState<AppNotification[]>(TaskStore.getNotifications());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [taskFilter, setTaskFilter] = useState<{
    executive: 'all' | ExecutiveAuthority;
    status: string;
    timeline: string;
    title: string;
  }>({
    executive: 'all',
    status: 'all',
    timeline: 'all',
    title: 'รายการงานทั้งหมดในระบบ',
  });

  const refreshState = () => {
    setTasks(TaskStore.getTasks());
    setNotifications(TaskStore.getNotifications());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    const newUser = TaskStore.switchRole(role);
    setCurrentUser(newUser);
    if (role === 'secretary' && ['dept_tasks', 'kanban', 'calendar', 'approvals', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
    refreshState();
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    TaskStore.setCurrentUser(user.id);
    setIsAuthenticated(true);
    sessionStorage.setItem('work_tracking_auth', 'true');
    const isAdmin = user.role === 'admin' || user.id === 'USR-001' || user.id === 'USR-ADM-02';
    setIsAdminSession(isAdmin);
    sessionStorage.setItem('work_tracking_is_admin_session', isAdmin ? 'true' : 'false');
    refreshState();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('work_tracking_auth');
    sessionStorage.removeItem('work_tracking_is_admin_session');
    setIsAdminSession(false);
    setIsAuthenticated(false);
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'all_tasks') {
      setTaskFilter({
        executive: 'all',
        status: 'all',
        timeline: 'all',
        title: 'รายการงานทั้งหมดในระบบ',
      });
    }
    setActiveTab(tab);
  };

  const handleViewAllTasks = (executiveId?: ExecutiveAuthority, statusKey?: string) => {
    let title = 'รายการงานทั้งหมดในระบบ';
    let exec: 'all' | ExecutiveAuthority = 'all';
    let status = 'all';
    let timeline = 'all';

    if (executiveId) {
      exec = executiveId;
      const execObj = EXECUTIVE_LIST.find((e) => e.id === executiveId);
      title = `รายการงานตามสายงาน: ${execObj?.roleTitle || executiveId} (${executiveId})`;
    } else if (statusKey) {
      if (statusKey === 'ใกล้ครบกำหนด') {
        timeline = 'ใกล้ครบกำหนด';
        title = 'รายการงานที่ใกล้ครบกำหนดส่ง (เหลือ ≤ 3 วัน)';
      } else if (statusKey === 'เกินกำหนด') {
        timeline = 'เกินกำหนด';
        title = 'รายการงานที่เกินกำหนดส่ง (ต้องเร่งด่วน)';
      } else if (statusKey !== 'all') {
        status = statusKey;
        title = `รายการงานสถานะ: ${statusKey}`;
      }
    }

    setTaskFilter({ executive: exec, status, timeline, title });
    setActiveTab('all_tasks');
  };

  const handleNotificationClick = (taskId: string, notifId: string) => {
    TaskStore.markNotificationRead(notifId);
    setSelectedTaskId(taskId);
    refreshState();
  };

  const handleMarkAllRead = () => {
    TaskStore.markAllNotificationsRead();
    refreshState();
  };

  const handleKanbanStatusChange = (taskId: string, newStatus: TaskStatus) => {
    TaskStore.updateTaskStatus(taskId, newStatus);
    refreshState();
  };

  const pendingApprovalsCount = TaskStore.getProblemRequests().filter(r => r.status === 'pending').length;
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;

  const getDisplayTasks = () => {
    if (activeTab === 'my_tasks') {
      return tasks.filter(t => {
        // 1. Is user the assigned person? (Flexible match: e.g. "กันยาวีย์" matches "นางสาวกันยาวีย์ ลิ้มอมรสวัสดิ์")
        if (isNameMatch(t.assignee, currentUser.name)) return true;

        // 2. Assignee email matches
        if (t.assigneeEmail && currentUser.email && t.assigneeEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;

        // 3. Directive recorded by current user (เลขาผู้บันทึกข้อสั่งการ)
        if (t.assignor && (t.assignor.includes(currentUser.name) || isNameMatch(t.assignor, currentUser.name))) return true;

        // 4. If secretary: task assigned to secretary's office (สำนักงานเลขานุการผู้อำนวยการ สลข.ผอ.)
        if (currentUser.role === 'secretary' && isSameDepartment(t.department, currentUser.department)) return true;

        // 5. If dept head: tasks in user's department
        if (currentUser.role === 'dept_head' && isSameDepartment(t.department, currentUser.department)) return true;

        return false;
      });
    }
    if (activeTab === 'dept_tasks') {
      return tasks.filter(t => isSameDepartment(t.department, currentUser.department));
    }
    return tasks;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans">
      
      <Navbar
        currentUser={currentUser}
        isAdminSession={isAdminSession}
        onRoleChange={handleRoleChange}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onMarkAllRead={handleMarkAllRead}
        onSelectTask={(id) => setSelectedTaskId(id)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentUser={currentUser}
          pendingApprovalsCount={pendingApprovalsCount}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              currentUser={currentUser}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
              onViewAllTasks={handleViewAllTasks}
            />
          )}

          {activeTab === 'all_tasks' && (
            <TaskListView
              tasks={tasks}
              currentUser={currentUser}
              title={taskFilter.title}
              initialExecutive={taskFilter.executive}
              initialStatus={taskFilter.status}
              initialTimeline={taskFilter.timeline}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
              canCreate={['admin', 'executive', 'dept_head', 'secretary', 'officer'].includes(currentUser.role)}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'my_tasks' && (
            <TaskListView
              tasks={getDisplayTasks()}
              currentUser={currentUser}
              title={`งานของฉัน (${currentUser.name})`}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
              canCreate={['admin', 'executive', 'dept_head', 'secretary', 'officer'].includes(currentUser.role)}
            />
          )}

          {activeTab === 'dept_tasks' && (
            <TaskListView
              tasks={getDisplayTasks()}
              currentUser={currentUser}
              title={`งานประจำหน่วยงาน (${currentUser.department})`}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
              canCreate={['admin', 'executive', 'dept_head', 'secretary', 'officer'].includes(currentUser.role)}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView
              tasks={tasks}
              currentUser={currentUser}
              onStatusChange={handleKanbanStatusChange}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onOpenCreateTask={() => setIsCreateModalOpen(true)}
              canCreate={['admin', 'executive', 'dept_head', 'secretary', 'officer'].includes(currentUser.role)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportView
              tasks={tasks}
            />
          )}

          {activeTab === 'audit_history' && (
            <AuditHistoryView
              tasks={tasks}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalView
              currentUser={currentUser}
              onRefresh={refreshState}
              onSelectTask={(id) => setSelectedTaskId(id)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

        </main>

      </div>

      {/* Footer / Copyright */}
      <footer className="mt-auto bg-white border-t border-slate-200/90 py-4 px-4 shrink-0 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-1.5 text-xs">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>ระบบติดตามงานภายในหน่วยงาน • Internal Work Tracking System</span>
          </div>
          <div className="text-slate-600 font-medium flex flex-wrap items-center justify-center gap-2">
            <span>Copyright © {new Date().getFullYear()} สำนักงานเทคโนโลยีสารสนเทศ ฝ่ายบริหารและพัฒนาองค์กร</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/70">
              หน่วยงานใช้งานหลัก : สำนักงานเลขานุการผู้อำนวยการ
            </span>
          </div>
        </div>
      </footer>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          currentUser={currentUser}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={refreshState}
        />
      )}

      {isCreateModalOpen && (
        <TaskFormModal
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={refreshState}
        />
      )}

      {/* หน้าต่างเข้าสู่ระบบด้วย PIN */}
      {!isAuthenticated && (
        <PinLoginModal onSuccess={handleLoginSuccess} />
      )}

    </div>
  );
}

export default App;
