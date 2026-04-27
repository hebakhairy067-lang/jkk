import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM schedules WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return Response.json({ error: "الجدول غير موجود" }, { status: 404 });
    }
    return Response.json({ success: true, message: "تم حذف الجدول بنجاح" });
  } catch (error) {
    console.error("DELETE /api/schedules/[id] error:", error);
    return Response.json({ error: "فشل في حذف الجدول" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      course_id,
      room_id,
      day_of_week,
      start_time,
      end_time,
      lecture_number,
    } = body;

    const setClauses = [];
    const values = [];
    let idx = 1;

    if (course_id) {
      setClauses.push(`course_id = $${idx++}`);
      values.push(course_id);
    }
    if (room_id) {
      setClauses.push(`room_id = $${idx++}`);
      values.push(room_id);
    }
    if (day_of_week) {
      setClauses.push(`day_of_week = $${idx++}`);
      values.push(day_of_week);
    }
    if (start_time) {
      setClauses.push(`start_time = $${idx++}`);
      values.push(start_time);
    }
    if (end_time) {
      setClauses.push(`end_time = $${idx++}`);
      values.push(end_time);
    }
    if (lecture_number) {
      setClauses.push(`lecture_number = $${idx++}`);
      values.push(lecture_number);
    }

    if (setClauses.length === 0) {
      return Response.json(
        { error: "لا توجد بيانات للتحديث" },
        { status: 400 },
      );
    }

    values.push(id);
    const query = `UPDATE schedules SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`;
    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: "الجدول غير موجود" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("PUT /api/schedules/[id] error:", error);
    return Response.json({ error: "فشل في تحديث الجدول" }, { status: 500 });
  }
}
