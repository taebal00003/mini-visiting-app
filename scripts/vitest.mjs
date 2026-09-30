// Runs Vitest from a working directory with an uppercase drive letter.
// On Windows, a lowercase drive (`c:\`, as VS Code terminals often open) makes Node load
// Vitest twice under two path spellings, and every test file fails with
// "Vitest failed to find the runner". Usage: node scripts/vitest.mjs [vitest args]
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const vitest = join(cwd, "node_modules", "vitest", "vitest.mjs");
const { status } = spawnSync(process.execPath, [vitest, ...process.argv.slice(2)], { cwd, stdio: "inherit" });
process.exit(status ?? 1);
