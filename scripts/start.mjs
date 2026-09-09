import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const port = process.env.PORT || "3000";

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: "inherit", cwd: root });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${args.join(" ")} exited with ${code ?? "unknown"}`));
    });
  });
}

if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.log("No production build found. Running next build...");
  await run([nextBin, "build"]);
}

const server = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", "0.0.0.0", "--port", String(port)],
  { stdio: "inherit", cwd: root },
);

server.on("exit", (code) => {
  process.exit(code ?? 1);
});
