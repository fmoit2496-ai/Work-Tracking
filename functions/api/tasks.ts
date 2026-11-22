interface Env {
  DB: any;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'DB binding not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await DB.prepare(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    ).all();

    const tasks = (results || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      department: row.department,
      assignee: row.assignee,
      assigneeEmail: row.assignee_email || undefined,
      assignor: row.assignor || '',
      directiveRef: row.directive_ref || '',
      directiveType: row.directive_type || 'คำสั่งการ ผอ.',
      executiveAuthority: row.executive_authority || 'ผอ.',
      directiveFile: row.directive_file || undefined,
      dateReceived: row.date_received || '',
      deadline: row.deadline,
      status: row.status,
      progress: Number(row.progress) || 0,
      priority: row.priority,
      timelineStatus: row.timeline_status || 'ปกติ',
      followUpCount: Number(row.follow_up_count) || 0,
      lastFollowedUpAt: row.last_followed_up_at || undefined,
      lastFollowedUpBy: row.last_followed_up_by || undefined,
      hasProblemRequest: Boolean(row.has_problem_request),
      isEmailNotified: Boolean(row.is_email_notified),
      progressNotes: row.progress_notes ? JSON.parse(row.progress_notes) : [],
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
      auditLogs: row.audit_logs ? JSON.parse(row.audit_logs) : []
    }));

    return new Response(JSON.stringify({ success: true, tasks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DB } = context.env;
  if (!DB) {
    return new Response(JSON.stringify({ error: 'DB binding not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json() as any;
    const taskList = Array.isArray(body) ? body : [body];

    for (const t of taskList) {
      await DB.prepare(
        `INSERT OR REPLACE INTO tasks (
          id, title, description, department, assignee, assignee_email, assignor,
          directive_ref, directive_type, executive_authority, directive_file,
          date_received, deadline, status, progress, priority, timeline_status,
          follow_up_count, last_followed_up_at, last_followed_up_by,
          has_problem_request, is_email_notified, progress_notes, attachments, audit_logs, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      ).bind(
        t.id,
        t.title,
        t.description || '',
        t.department,
        t.assignee,
        t.assigneeEmail || null,
        t.assignor || '',
        t.directiveRef || '',
        t.directiveType || 'คำสั่งการ ผอ.',
        t.executiveAuthority || 'ผอ.',
        t.directiveFile || null,
        t.dateReceived || '',
        t.deadline,
        t.status || 'รอดำเนินการ',
        t.progress || 0,
        t.priority || 'ปกติ',
        t.timelineStatus || 'ปกติ',
        t.followUpCount || 0,
        t.lastFollowedUpAt || null,
        t.lastFollowedUpBy || null,
        t.hasProblemRequest ? 1 : 0,
        t.isEmailNotified ? 1 : 0,
        JSON.stringify(t.progressNotes || []),
        JSON.stringify(t.attachments || []),
        JSON.stringify(t.auditLogs || [])
      ).run();
    }

    return new Response(JSON.stringify({ success: true, count: taskList.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  return onRequestPost(context);
};
