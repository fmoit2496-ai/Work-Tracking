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
    const { results } = await DB.prepare('SELECT * FROM users').all();

    const users = (results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: row.department,
      position: row.position,
      email: row.email,
      pin: row.pin,
      allowedExecutives: row.allowed_executives ? JSON.parse(row.allowed_executives) : undefined,
      avatar: row.avatar || undefined
    }));

    return new Response(JSON.stringify({ success: true, users }), {
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
    const userList = Array.isArray(body) ? body : [body];

    for (const u of userList) {
      await DB.prepare(
        `INSERT OR REPLACE INTO users (id, name, role, department, position, email, pin, allowed_executives, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        u.id,
        u.name,
        u.role,
        u.department,
        u.position,
        u.email || null,
        u.pin || null,
        u.allowedExecutives ? JSON.stringify(u.allowedExecutives) : null,
        u.avatar || null
      ).run();
    }

    return new Response(JSON.stringify({ success: true, count: userList.length }), {
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
