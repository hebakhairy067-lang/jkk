import sql from "@/app/api/utils/sql";

// Convert HH:MM to minutes since midnight
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Check if two time ranges overlap
function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

export async function GET() {
  try {
    // Fetch all schedules with full details
    const sessions = await sql`
      SELECT s.id, s.course_id, s.room_id, s.day_of_week,
             s.start_time, s.end_time, s.lecture_number,
             c.name as course_name, c.level, c.doctor_id,
             r.name as room_name,
             u.name as doctor_name
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN rooms r ON s.room_id = r.id
      JOIN users u ON c.doctor_id = u.id
      ORDER BY s.day_of_week, s.start_time
    `;

    const conflicts = [];

    // O(n²) conflict detection — same as Flask implementation
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const s1 = sessions[i];
        const s2 = sessions[j];

        // Must be same day to conflict
        if (s1.day_of_week !== s2.day_of_week) continue;

        // Must overlap in time
        if (
          !timesOverlap(s1.start_time, s1.end_time, s2.start_time, s2.end_time)
        )
          continue;

        // Hall conflict
        if (s1.room_id === s2.room_id) {
          conflicts.push({
            type: "تعارض_قاعة",
            severity: "high",
            session1_id: s1.id,
            session2_id: s2.id,
            session1_info: `${s1.course_name} (${s1.start_time}-${s1.end_time})`,
            session2_info: `${s2.course_name} (${s2.start_time}-${s2.end_time})`,
            day: s1.day_of_week,
            description: `القاعة '${s1.room_name}' محجوزة مرتين في ${s1.day_of_week}: جلسة ${s1.id} (${s1.start_time}-${s1.end_time}) وجلسة ${s2.id} (${s2.start_time}-${s2.end_time})`,
          });
        }

        // Doctor conflict
        if (s1.doctor_id === s2.doctor_id) {
          conflicts.push({
            type: "تعارض_دكتور",
            severity: "high",
            session1_id: s1.id,
            session2_id: s2.id,
            session1_info: `${s1.course_name} (${s1.start_time}-${s1.end_time})`,
            session2_info: `${s2.course_name} (${s2.start_time}-${s2.end_time})`,
            day: s1.day_of_week,
            description: `الدكتور '${s1.doctor_name}' لديه جلستان في نفس الوقت يوم ${s1.day_of_week}: جلسة ${s1.id} وجلسة ${s2.id}`,
          });
        }

        // Course conflict (same course scheduled twice at same time)
        if (s1.course_id === s2.course_id) {
          conflicts.push({
            type: "تعارض_مادة",
            severity: "medium",
            session1_id: s1.id,
            session2_id: s2.id,
            session1_info: `${s1.course_name} (${s1.start_time}-${s1.end_time})`,
            session2_info: `${s2.course_name} (${s2.start_time}-${s2.end_time})`,
            day: s1.day_of_week,
            description: `المادة '${s1.course_name}' مجدولة مرتين في نفس اليوم ${s1.day_of_week}`,
          });
        }
      }
    }

    return Response.json({
      conflict_count: conflicts.length,
      conflicts,
      status: conflicts.length === 0 ? "clean" : "has_conflicts",
    });
  } catch (error) {
    console.error("GET /api/conflicts error:", error);
    return Response.json({ error: "فشل في فحص التعارضات" }, { status: 500 });
  }
}
