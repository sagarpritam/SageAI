import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const nextDir = path.join(rootDir, ".next");
const staticSrc = path.join(nextDir, "static");
const publicSrc = path.join(rootDir, "public");

const candidateServerPaths = [
  path.join(nextDir, "standalone", "sage-web", "server.js"),
  path.join(nextDir, "standalone", "server.js"),
];

const serverPath = candidateServerPaths.find((candidate) => fs.existsSync(candidate));

if (!serverPath) {
  console.error(
    "Missing Next.js standalone server bundle. Run `npm run build` inside sage-web before `npm run test:e2e`."
  );
  process.exit(1);
}

const standaloneAppDir = path.dirname(serverPath);

if (fs.existsSync(staticSrc)) {
  const staticDest = path.join(standaloneAppDir, ".next", "static");
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
}

if (fs.existsSync(publicSrc)) {
  const publicDest = path.join(standaloneAppDir, "public");
  fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
}

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneAppDir,
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT || "3000",
    HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
  },
});

const shutdown = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

