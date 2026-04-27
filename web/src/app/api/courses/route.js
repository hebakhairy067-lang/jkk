import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const courses = await sql`
      SELECT c.id, c.name, c.level, c.doctor_id,
             u.name as doctor_name, u.department
      FROM courses c
      LEFT JOIN users u ON c.doctor_id = u.id
      ORDER BY c.id
    `;
    return Response.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return Response.json({ error: "فشل في جلب المواد" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, level, doctor_id } = body;

    if (!name || !level || !doctor_id) {
      return Response.json(
        { error: "اسم المادة والمستوى والدكتور مطلوبون" },
        { status: 400 },
      );
    }

    const [course] = await sql`
      INSERT INTO courses (name, level, doctor_id)
      VALUES (${name}, ${level}, ${doctor_id})
      RETURNING *
    `;

    const [full] = await sql`
      SELECT c.id, c.name, c.level, c.doctor_id, u.name as doctor_name
      FROM courses c
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.id = ${course.id}
    `;

    return Response.json(full, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return Response.json({ error: "فشل في إضافة المادة" }, { status: 500 });
  }
}
