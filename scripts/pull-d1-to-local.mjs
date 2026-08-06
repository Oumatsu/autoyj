import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const localStateDir = resolve(projectRoot, ".wrangler", "local-d1");
const snapshotFile = join(tmpdir(), `autoyj-portal-${Date.now()}.sql`);
const bun = process.platform === "win32" ? "bun.exe" : "bun";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "f236185f93c49e07d4a6d364cf82c165";

function runWrangler(args) {
  execFileSync(bun, ["x", "wrangler", ...args], {
    cwd: projectRoot,
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId },
    stdio: "inherit",
  });
}

function assertInsideProject(path) {
  const pathFromRoot = relative(projectRoot, path);
  if (!pathFromRoot || pathFromRoot.startsWith("..") || pathFromRoot.includes(":")) {
    throw new Error(`Refusing to replace a path outside this project: ${path}`);
  }
}

try {
  console.log(`Pulling D1 from Cloudflare account ${accountId}.`);
  // Export before resetting the local state so a failed remote read preserves the prior snapshot.
  runWrangler(["d1", "export", "autoyj-portal", "--remote", `--output=${snapshotFile}`]);

  assertInsideProject(localStateDir);
  if (existsSync(localStateDir)) rmSync(localStateDir, { recursive: true, force: true });

  runWrangler([
    "d1",
    "execute",
    "PORTAL_DB",
    "--local",
    `--persist-to=${localStateDir}`,
    `--file=${snapshotFile}`,
  ]);
  runWrangler([
    "d1",
    "execute",
    "PORTAL_DB",
    "--local",
    `--persist-to=${localStateDir}`,
    "--command=SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name;",
  ]);

  console.log(`\nLocal D1 snapshot is ready at ${localStateDir}`);
  console.log("Start Miniflare with: bun run dev:worker");
} finally {
  if (existsSync(snapshotFile)) rmSync(snapshotFile, { force: true });
}
