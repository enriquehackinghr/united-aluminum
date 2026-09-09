import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const port = process.env.PORT || "3000";

const server = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", "0.0.0.0", "--port", String(port)],
  { stdio: "inherit", cwd: root },
);

server.on("exit", (code) => {
  process.exit(code ?? 1);
});
