interface Env {
  DB: any;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT,
  email TEXT,
  pin TEXT,
  allowed_executives TEXT,
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  assignee TEXT NOT NULL,
  assignee_email TEXT,
  assignor TEXT,
  directive_ref TEXT,
  directive_type TEXT,
  executive_authority TEXT,
  directive_file TEXT,
  date_received TEXT,
  deadline TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  priority TEXT NOT NULL,
  timeline_status TEXT,
  follow_up_count INTEGER DEFAULT 0,
  last_followed_up_at TEXT,
  last_followed_up_by TEXT,
  has_problem_request INTEGER DEFAULT 0,
  is_email_notified INTEGER DEFAULT 0,
  progress_notes TEXT,
  attachments TEXT,
  audit_logs TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS problem_requests (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  task_title TEXT,
  reason TEXT,
  requested_assignee TEXT,
  current_assignee TEXT,
  department TEXT,
  status TEXT,
  requested_at TEXT,
  reviewed_at TEXT,
  reviewer TEXT,
  review_comment TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  timestamp TEXT,
  is_read INTEGER DEFAULT 0,
  is_email_sent INTEGER DEFAULT 0,
  recipient_email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;

  if (!DB) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'D1 database binding "DB" not found in context.env' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. Create tables if not exist
    await DB.exec(SCHEMA_SQL);

    // 2. Check if users table is populated
    const userCountRes = await DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const userCount = userCountRes?.count || 0;

    let usersSeeded = 0;
    if (userCount === 0) {
      // Seed default users
      const seedUsers = [
        {
          id: 'USR-002',
          name: 'นายปรีดา ยังสุขสถาพร',
          role: 'executive',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'ผู้อำนวยการองค์การสะพานปลา (ผอ.)',
          email: 'preeda.y@fishmarket.co.th',
          pin: '1111111',
          allowed_executives: JSON.stringify(['ผอ.', 'รผอ.บร.', 'รผอ.พกป.', 'รผอ.สปทร.'])
        },
        {
          id: 'USR-EXEC-02',
          name: 'นายศุภชาติ ชาสมบัติ',
          role: 'executive',
          department: 'ฝ่ายบริหารและพัฒนาองค์กร',
          position: 'รองผู้อำนวยการ ฝ่ายบริหารและพัฒนาองค์กร (รผอ.บร.)',
          email: 'suphachat.c@fishmarket.co.th',
          pin: '07170184',
          allowed_executives: JSON.stringify(['รผอ.บร.'])
        },
        {
          id: 'USR-EXEC-03',
          name: 'นางนิติกร ขาวดี',
          role: 'executive',
          department: 'ฝ่ายพัฒนากิจการประมง',
          position: 'รักษาการแทน รองผู้อำนวยการฝ่ายพัฒนากิจการประมง (รผอ.พกป.)',
          email: 'nitikorn.k@fishmarket.co.th',
          pin: '07170185',
          allowed_executives: JSON.stringify(['รผอ.พกป.'])
        },
        {
          id: 'USR-EXEC-04',
          name: 'นางสาวปิยวรรณ แก้วกล้า',
          role: 'executive',
          department: 'ฝ่ายสะพานปลาและท่าเทียบเรือประมง',
          position: 'รักษาการแทน รองผู้อำนวยการฝ่ายสะพานปลาและท่าเทียบเรือประมง (รผอ.สป.ทร.)',
          email: 'piyawan.k@fishmarket.co.th',
          pin: '07170006',
          allowed_executives: JSON.stringify(['รผอ.สปทร.'])
        },
        {
          id: 'USR-SEC-01',
          name: 'น.ส.กนกกร ศิลา',
          role: 'secretary',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'หัวหน้าสำนักงานเลขานุการผู้อำนวยการ',
          email: 'kanokkorn.s@fishmarket.co.th',
          pin: '07170176',
          allowed_executives: JSON.stringify(['ผอ.', 'รผอ.บร.', 'รผอ.พกป.', 'รผอ.สปทร.'])
        },
        {
          id: 'USR-010',
          name: 'นางสาวกันยาวีร์ ลิ้มอมรสวัสดิ์',
          role: 'secretary',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'เจ้าหน้าที่บริหารงานทั่วไป (เลขาหน้าห้อง ผอ.)',
          email: 'ganyawee.l@fishmarket.co.th',
          pin: '07170088',
          allowed_executives: JSON.stringify(['ผอ.', 'รผอ.บร.', 'รผอ.พกป.', 'รผอ.สปทร.'])
        },
        {
          id: 'USR-SEC-02',
          name: 'น.ส.ทิพาพร พลสยม',
          role: 'secretary',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'เจ้าหน้าที่บริหารงานทั่วไป (เลขา รผอ.บร.)',
          email: 'tipaporn.p@fishmarket.co.th',
          pin: '07170169',
          allowed_executives: JSON.stringify(['รผอ.บร.'])
        },
        {
          id: 'USR-SEC-03',
          name: 'น.ส.ภาณุมาศ สุขจันทร์',
          role: 'secretary',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'เจ้าหน้าที่บริหารงานทั่วไป (เลขา รผอ.พกป.)',
          email: 'panumas.s@fishmarket.co.th',
          pin: '07170171',
          allowed_executives: JSON.stringify(['รผอ.พกป.'])
        },
        {
          id: 'USR-SEC-04',
          name: 'นายเจษฎา ศรีเทพ',
          role: 'secretary',
          department: 'สำนักงานเลขานุการผู้อำนวยการ (สลข.ผอ.)',
          position: 'เจ้าหน้าที่บริหารงานทั่วไป (เลขา รผอ.พกป.)',
          email: 'jetsada.s@fishmarket.co.th',
          pin: '07170212',
          allowed_executives: JSON.stringify(['รผอ.พกป.'])
        },
        {
          id: 'USR-001',
          name: 'Ranida.c (ผู้ดูแลระบบ)',
          role: 'admin',
          department: 'สำนักงานเทคโนโลยีสารสนเทศ (สทส.)',
          position: 'ผู้ดูแลระบบ (Admin)',
          email: 'ranida.c@fishmarket.co.th',
          pin: '21212496',
          allowed_executives: JSON.stringify(['ผอ.', 'รผอ.บร.', 'รผอ.พกป.', 'รผอ.สปทร.'])
        },
        {
          id: 'USR-ADM-02',
          name: 'Natanong.s (ผู้ดูแลระบบ)',
          role: 'admin',
          department: 'สำนักงานเทคโนโลยีสารสนเทศ (สทส.)',
          position: 'ผู้ดูแลระบบ (Admin)',
          email: 'natanong.s@fishmarket.co.th',
          pin: '21211953',
          allowed_executives: JSON.stringify(['ผอ.', 'รผอ.บร.', 'รผอ.พกป.', 'รผอ.สปทร.'])
        }
      ];

      for (const u of seedUsers) {
        await DB.prepare(
          `INSERT INTO users (id, name, role, department, position, email, pin, allowed_executives)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(u.id, u.name, u.role, u.department, u.position, u.email, u.pin, u.allowed_executives).run();
        usersSeeded++;
      }
    }

    // 3. Check if tasks table is populated
    const taskCountRes = await DB.prepare('SELECT COUNT(*) as count FROM tasks').first();
    const taskCount = taskCountRes?.count || 0;

    let tasksSeeded = 0;
    if (taskCount === 0) {
      const initialTasks = [
        {
          id: 'TASK-2026-001',
          title: 'จัดทำรายงานสรุปผลการดำเนินงานประจำเดือนกันยายน 2569',
          description: 'สรุปผลการดำเนินโครงการและตัวชี้วัดความสำเร็จของทุกหน่วยงานเพื่อนำเสนอต่อคณะกรรมการบริหาร',
          department: 'สำนักงานอำนวยการ (สนอ.)',
          assignee: 'กมลรัตน์ มั่นคง',
          assignee_email: 'kamonrat.m@organization.go.th',
          assignor: 'นายปรีดา ยังสุขสถาพร',
          directive_ref: 'คำสั่งการ ผอ. ที่ 45/2569 เรื่อง รายงานผลงานประจำเดือน',
          directive_type: 'คำสั่งการ ผอ.',
          executive_authority: 'ผอ.',
          date_received: '2026-09-15',
          deadline: '2026-09-30',
          status: 'กำลังดำเนินการ',
          progress: 80,
          priority: 'เร่งด่วน',
          timeline_status: 'ใกล้ครบกำหนด',
          follow_up_count: 1,
          progress_notes: JSON.stringify([
            {
              id: 'PN-001',
              date: '2026-09-28',
              detail: 'จัดทำร่างสรุปข้อมูลและแผนภูมิสรุปผลสำเร็จแล้ว 80%',
              author: 'กมลรัตน์ มั่นคง',
              percentage: 80
            }
          ]),
          attachments: JSON.stringify([
            {
              id: 'ATT-001',
              fileName: 'ร่างรายงานประจำเดือน_กันยายน.xlsx',
              fileSize: '2.4 MB',
              fileType: 'xlsx',
              uploadedAt: '2026-09-28 14:30',
              uploadedBy: 'กมลรัตน์ มั่นคง'
            }
          ]),
          audit_logs: JSON.stringify([
            {
              id: 'LOG-001',
              timestamp: '2026-09-15 09:15:00',
              actor: 'นายปรีดา ยังสุขสถาพร',
              action: 'ออกคำสั่งการและมอบหมายงาน',
              details: 'บันทึกงานตาม คำสั่งการ ผอ. ที่ 45/2569 มอบหมายให้ กมลรัตน์ มั่นคง'
            }
          ])
        },
        {
          id: 'TASK-2026-002',
          title: 'พัฒนาระบบสำรองข้อมูลและปรับปรุงแม่ข่ายกองเทคโนโลยีสารสนเทศ',
          description: 'ติดตั้งระบบ Disaster Recovery Center และย้ายฐานข้อมูลหลักเพื่อรองรับการทำงานระบบใหม่',
          department: 'สำนักงานเทคโนโลยีสารสนเทศ (สทส.)',
          assignee: 'นภา สายชล',
          assignee_email: 'napa.s@organization.go.th',
          assignor: 'นายศุภชาติ ชาสมบัติ',
          directive_ref: 'ข้อสั่งการที่ประชุมบริหาร ครั้งที่ 9/2569 วาระความมั่นคงปลอดภัยสารสนเทศ',
          directive_type: 'ข้อสั่งการที่ประชุมบริหาร',
          executive_authority: 'รผอ.บร.',
          date_received: '2026-09-01',
          deadline: '2026-09-29',
          status: 'กำลังดำเนินการ',
          progress: 90,
          priority: 'เร่งด่วนมาก',
          timeline_status: 'เกินกำหนด',
          follow_up_count: 2,
          progress_notes: JSON.stringify([]),
          attachments: JSON.stringify([]),
          audit_logs: JSON.stringify([])
        },
        {
          id: 'TASK-2026-003',
          title: 'โครงการอบรมส่งเสริมสุขอนามัยและทักษะแรงงานสะพานปลา',
          description: 'จัดอบรมให้ความรู้ด้านมาตรฐานสุขอนามัยสัตว์น้ำและความปลอดภัยในการทำงานแก่ผู้ปฏิบัติงาน',
          department: 'สำนักงานพัฒนาธุรกิจ (สพธ.)',
          assignee: 'สุรชัย พรหมสิทธิ์',
          assignee_email: 'surachai.p@organization.go.th',
          assignor: 'นางนิติกร ขาวดี',
          directive_ref: 'คำสั่งการ รผอ.พกป. ที่ 12/2569 แผนยกระดับมาตรฐานสุขอนามัย',
          directive_type: 'คำสั่งการ ผอ.',
          executive_authority: 'รผอ.พกป.',
          date_received: '2026-08-10',
          deadline: '2026-10-15',
          status: 'กำลังดำเนินการ',
          progress: 50,
          priority: 'ปกติ',
          timeline_status: 'ปกติ',
          follow_up_count: 0,
          progress_notes: JSON.stringify([]),
          attachments: JSON.stringify([]),
          audit_logs: JSON.stringify([])
        },
        {
          id: 'TASK-2026-004',
          title: 'ปรับปรุงโครงสร้างท่าเทียบเรือและติดตั้งระบบชั่งน้ำหนักดิจิทัล',
          description: 'ซ่อมแซมท่าเทียบเรือหลักและติดตั้งเครื่องชั่งเชื่อมต่อระบบคลาวด์',
          department: 'สำนักงานสะพานปลาสมุทรปราการ (สป.สป.)',
          assignee: 'สมศักดิ์ นำชัย',
          assignee_email: 'somsak.n@organization.go.th',
          assignor: 'นางสาวปิยวรรณ แก้วกล้า',
          directive_ref: 'คำสั่งการ รผอ.สปทร. ที่ 08/2569 งานโครงสร้างพื้นฐาน',
          directive_type: 'คำสั่งการ ผอ.',
          executive_authority: 'รผอ.สปทร.',
          date_received: '2026-08-01',
          deadline: '2026-10-20',
          status: 'เสร็จสิ้น',
          progress: 100,
          priority: 'เร่งด่วนมาก',
          timeline_status: 'ปกติ',
          follow_up_count: 1,
          progress_notes: JSON.stringify([]),
          attachments: JSON.stringify([]),
          audit_logs: JSON.stringify([])
        }
      ];

      for (const t of initialTasks) {
        await DB.prepare(
          `INSERT INTO tasks (
            id, title, description, department, assignee, assignee_email, assignor,
            directive_ref, directive_type, executive_authority, date_received, deadline,
            status, progress, priority, timeline_status, follow_up_count,
            progress_notes, attachments, audit_logs
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          t.id, t.title, t.description, t.department, t.assignee, t.assignee_email, t.assignor,
          t.directive_ref, t.directive_type, t.executive_authority, t.date_received, t.deadline,
          t.status, t.progress, t.priority, t.timeline_status, t.follow_up_count,
          t.progress_notes, t.attachments, t.audit_logs
        ).run();
        tasksSeeded++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Cloudflare D1 tables initialized successfully',
      stats: {
        userCount: userCount || usersSeeded,
        taskCount: taskCount || tasksSeeded,
        usersSeeded,
        tasksSeeded
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message || String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
