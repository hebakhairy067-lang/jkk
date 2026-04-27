import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");
  const level = searchParams.get("level");

  try {
    let schedules;
    if (role === "student") {
      schedules = await sql`
        SELECT s.*, c.name as course_name, c.level, r.name as room_name, u.name as doctor_name
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN rooms r ON s.room_id = r.id
        JOIN users u ON c.doctor_id = u.id
        WHERE c.level = ${level}
        ORDER BY s.day_of_week, s.lecture_number
      `;
    } else if (role === "doctor") {
      schedules = await sql`
        SELECT s.*, c.name as course_name, c.level, r.name as room_name, r.location as room_location
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN rooms r ON s.room_id = r.id
        WHERE c.doctor_id = ${userId}
        ORDER BY s.day_of_week, s.lecture_number
      `;
    } else {
      // manager or admin see all
      schedules = await sql`
        SELECT s.*, c.name as course_name, c.level, r.name as room_name, u.name as doctor_name, r.location as room_location
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        JOIN rooms r ON s.room_id = r.id
        JOIN users u ON c.doctor_id = u.id
        ORDER BY s.day_of_week, s.lecture_number
      `;
    }

    return new Response(JSON.stringify(schedules), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      course_id,
      room_id,
      day_of_week,
      start_time,
      end_time,
      lecture_number,
    } = body;

    if (!course_id || !room_id || !day_of_week || !start_time || !end_time) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Validate time order
    const toMins = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMins(start_time) >= toMins(end_time)) {
      return Response.json(
        { error: "وقت البدء يجب أن يكون قبل وقت النهاية" },
        { status: 400 },
      );
    }

    // Check for conflicts before inserting
    const course =
      await sql`SELECT doctor_id FROM courses WHERE id = ${course_id}`;
    if (!course.length)
      return Response.json({ error: "المادة غير موجودة" }, { status: 400 });
    const doctor_id = course[0].doctor_id;

    // Get all schedules on the same day
    const sameDaySchedules = await sql`
      SELECT s.id, s.room_id, s.start_time, s.end_time, c.doctor_id,
             c.name as course_name, r.name as room_name, u.name as doctor_name
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON c.doctor_id = u.id
      WHERE s.day_of_week = ${day_of_week}
    `;

    const conflicts = [];
    const s1_start = toMins(start_time);
    const s1_end = toMins(end_time);

    for (const existing of sameDaySchedules) {
      const s2_start = toMins(existing.start_time);
      const s2_end = toMins(existing.end_time);
      const overlaps = s1_start < s2_end && s2_start < s1_end;

      if (overlaps) {
        if (Number(existing.room_id) === Number(room_id)) {
          conflicts.push({
            type: "تعارض_قاعة",
            description: `القاعة '${existing.room_name}' محجوزة من ${existing.start_time} إلى ${existing.end_time}`,
          });
        }
        if (Number(existing.doctor_id) === Number(doctor_id)) {
          conflicts.push({
            type: "تعارض_دكتور",
            description: `الدكتور '${existing.doctor_name}' لديه محاضرة من ${existing.start_time} إلى ${existing.end_time}`,
          });
        }
      }
    }

    if (conflicts.length > 0) {
      return Response.json(
        {
          error: "تم اكتشاف تعارضات — المحاضرة لم تُضف",
          conflicts,
        },
        { status: 409 },
      );
    }

    const [newSchedule] = await sql`
      INSERT INTO schedules (course_id, room_id, day_of_week, start_time, end_time, lecture_number)
      VALUES (${course_id}, ${room_id}, ${day_of_week}, ${start_time}, ${end_time}, ${lecture_number || 1})
      RETURNING *
    `;

    return Response.json(newSchedule, { status: 201 });
  } catch (error) {
    console.error("POST /api/schedules error:", error);
    return Response.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
