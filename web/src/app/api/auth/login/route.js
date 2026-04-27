import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const [user] = await sql`
      SELECT id, email, name, role, department, level 
      FROM users 
      WHERE email = ${email} AND password = ${password}
    `;

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
