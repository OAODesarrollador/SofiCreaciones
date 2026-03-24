import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function test() {
  try {
    const rs = await client.execute("SELECT 1 AS ok");
    console.log("SUCCESS! Base de datos conectada correctamente:", rs.rows);
  } catch (e) {
    console.error("ERROR 401 DETECTADO. EL PROBLEMA ESTÁ EN LA LLAVE DE TURSO:");
    console.error(e.message);
  }
}

test();
