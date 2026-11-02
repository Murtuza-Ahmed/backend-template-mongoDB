import fs from "node:fs";
import logger from "#src/utils/logger.js";

// ── Dynamic router ───────────────────────────────────
// Every folder inside src/modules/ that contains a `*.routes.js` file
// is mounted automatically at /api/<folder-name>.
//
//   src/modules/auth/auth.routes.js   →  /api/auth/*
//   src/modules/users/users.routes.js →  /api/users/*
//
// Adding a new module = create the folder + one routes file.
// No manual router wiring, ever.
export async function registerRoutes(app) {
  const modulesUrl = new URL("../modules/", import.meta.url);
  const entries = fs.readdirSync(modulesUrl, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const dirUrl = new URL(`./${entry.name}/`, modulesUrl);
    const files = fs.readdirSync(dirUrl);
    const routeFile = files.find((f) => f.endsWith(".routes.js"));
    if (!routeFile) {
      logger.warn(`[routes] ${entry.name}/ has no *.routes.js — skipped`);
      continue;
    }

    const mod = await import(new URL(routeFile, dirUrl).href);
    if (!mod.default) {
      logger.warn(`[routes] ${routeFile} has no default export — skipped`);
      continue;
    }

    const mountPath = `/api/${entry.name}`;
    app.use(mountPath, mod.default);
    logger.info(`[routes] ${mountPath} ← ${entry.name}/${routeFile}`);
  }
}
