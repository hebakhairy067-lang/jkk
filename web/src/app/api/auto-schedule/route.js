import sql from "@/app/api/utils/sql";

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// Greedy auto-scheduling algorithm — ported from Flask
async function autoSchedule() {
  const courses = await sql`
    SELECT c.id, c.name, c.level, c.doctor_id, u.name as doctor_name
    FROM courses c
    JOIN users u ON c.doctor_id = u.id
    ORDER BY c.id
  `;

  const rooms =
    await sql`SELECT id, name, capacity FROM rooms ORDER BY capacity DESC`;

  if (!courses.length || !rooms.length) {
    return {
      success: false,
      error: "البيانات الأساسية غير كافية (لا توجد مواد أو قاعات)",
    };
  }

  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const timeSlots = [
    ["08:00", "10:00"],
    ["10:00", "12:00"],
    ["12:00", "14:00"],
    ["14:00", "16:00"],
  ];

  const schedule = [];
  // Track used slots: key = `${day}_${start}_${roomId}` or `${day}_${start}_doctor_${doctorId}`
  const usedSlots = new Set();

  for (const course of courses) {
    let assigned = false;

    for (const day of days) {
      if (assigned) break;

      for (const [start, end] of timeSlots) {
        if (assigned) break;

        for (const room of rooms) {
          const hallKey = `${day}_${start}_room_${room.id}`;
          const doctorKey = `${day}_${start}_doctor_${course.doctor_id}`;

          if (!usedSlots.has(hallKey) && !usedSlots.has(doctorKey)) {
            schedule.push({
              course_id: course.id,
              course_name: course.name,
              course_level: course.level,
              doctor_id: course.doctor_id,
              doctor_name: course.doctor_name,
              room_id: room.id,
              room_name: room.name,
              room_capacity: room.capacity,
              day_of_week: day,
              start_time: start,
              end_time: end,
              lecture_number: 1,
            });

            usedSlots.add(hallKey);
            usedSlots.add(doctorKey);
            assigned = true;
            break;
          }
        }
      }
    }

    if (!assigned) {
      return {
        success: false,
        error: `تعذر جدولة المادة: ${course.name} — الموارد غير كافية (حاول إضافة قاعات أو أيام إضافية)`,
      };
    }
  }

  return { success: true, schedule };
}

// POST /api/auto-schedule — generate schedule without saving
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { apply = false } = body;

    const result = await autoSchedule();

    if (!result.success) {
      return Response.json(
        { status: "error", message: result.error },
        { status: 400 },
      );
    }

    // If apply=true, persist the schedule to DB
    if (apply) {
      await sql`DELETE FROM schedules`;

      for (const item of result.schedule) {
        await sql`
          INSERT INTO schedules (course_id, room_id, day_of_week, start_time, end_time, lecture_number)
          VALUES (${item.course_id}, ${item.room_id}, ${item.day_of_week}, ${item.start_time}, ${item.end_time}, ${item.lecture_number})
        `;
      }

      return Response.json({
        status: "success",
        message: `تم تطبيق الجدول بنجاح — ${result.schedule.length} جلسة`,
        sessions_added: result.schedule.length,
        schedule: result.schedule,
      });
    }

    return Response.json({
      status: "success",
      message: `تم توليد جدول خالٍ من التعارضات — ${result.schedule.length} جلسة`,
      schedule: result.schedule,
    });
  } catch (error) {
    console.error("POST /api/auto-schedule error:", error);
    return Response.json(
      { status: "error", message: "خطأ في الخادم" },
      { status: 500 },
    );
  }
}
