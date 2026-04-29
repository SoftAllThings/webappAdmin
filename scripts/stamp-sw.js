// Replace the __BUILD_ID__ placeholder in build/service-worker.js with a
// unique per-deploy id so the service worker's CACHE_NAME changes on every
// build. The activate handler then deletes the previous cache and the new
// network-first index.html strategy takes over from there.

const fs = require("fs");
const path = require("path");

const swPath = path.join(__dirname, "..", "build", "service-worker.js");

if (!fs.existsSync(swPath)) {
  console.warn("[stamp-sw] build/service-worker.js not found — skipping");
  process.exit(0);
}

const buildId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const sw = fs.readFileSync(swPath, "utf8");

if (!sw.includes("__BUILD_ID__")) {
  console.warn(
    "[stamp-sw] no __BUILD_ID__ placeholder found — service worker may not invalidate correctly across deploys"
  );
  process.exit(0);
}

fs.writeFileSync(swPath, sw.replace(/__BUILD_ID__/g, buildId));
console.log(`[stamp-sw] CACHE_NAME stamped with build id: ${buildId}`);
