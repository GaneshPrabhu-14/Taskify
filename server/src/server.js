import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const port = Number(process.env.PORT) || 5000;

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error("MONGODB_URI and JWT_SECRET must be set in server/.env.");
  process.exit(1);
}

try {
  await connectDatabase();
  app.listen(port, () => console.log(`Taskify API listening on http://localhost:${port}`));
} catch (error) {
  console.error("Unable to start Taskify API:", error);
  process.exit(1);
}
