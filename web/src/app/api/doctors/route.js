import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const doctors = await sql`
      SELECT id, name, email, department
      FROM users
      WHERE role = 'doctor'
      ORDER BY name
    `;
    return Response.json(doctors);
  } catch (error) {
    console.error("GET /api/doctors error:", error);
    return Response.json(
      { error: "فشل في جلب أعضاء التدريس" },
      { status: 500 },
    );
  }
}
