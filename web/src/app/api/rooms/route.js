import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const rooms = await sql`SELECT * FROM rooms ORDER BY name`;
    return new Response(JSON.stringify(rooms), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const { name, location, capacity } = await request.json();
    const [room] = await sql`
      INSERT INTO rooms (name, location, capacity)
      VALUES (${name}, ${location}, ${capacity})
      RETURNING *
    `;
    return new Response(JSON.stringify(room), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
