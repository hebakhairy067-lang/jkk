import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, level, doctor_id } = body;

    const setClauses = [];
    const values = [];
    let idx = 1;

    if (name) {
      setClauses.push(`name = $${idx++}`);
      values.push(name);
    }
    if (level) {
      setClauses.push(`level = $${idx++}`);
      values.push(level);
    }
    if (doctor_id) {
      setClauses.push(`doctor_id = $${idx++}`);
      values.push(doctor_id);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 },
      );
    }

    values.push(id);
    const query = `
      UPDATE courses SET ${setClauses.join(", ")}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await sql(query, values);
    if (result.length === 0) {
      return Response.json({ error: "المادة غير موجودة" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error);
    return Response.json({ error: "فشل في تحديث المادة" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // First check if course has schedules
    const schedules =
      await sql`SELECT id FROM schedules WHERE course_id = ${id}`;
    if (schedules.length > 0) {
      // Delete related schedules first
      await sql`DELETE FROM schedules WHERE course_id = ${id}`;
    }

    const result = await sql`DELETE FROM courses WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return Response.json({ error: "المادة غير موجودة" }, { status: 404 });
    }
    return Response.json({ success: true, message: "تم حذف المادة بنجاح" });
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return Response.json({ error: "فشل في حذف المادة" }, { status: 500 });
  }
}
