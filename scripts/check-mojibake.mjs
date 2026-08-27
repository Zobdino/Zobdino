import fs from "node:fs";
import path from "node:path";

const roots = ["src"];
const suspicious = [
  "╪",
  "┘",
  "┌",
  "█",
  "ظ",
  "ظ",
];

const allowed = new Set([".ts", ".tsx", ".js", ".mjs", ".md", ".json", ".css"]);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }

    if (allowed.has(path.extname(entry.name))) {
      out.push(full);
    }
  }

  return out;
}

const failures = [];

for (const root of roots) {
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, "utf8");

    for (const token of suspicious) {
      if (text.includes(token)) {
        failures.push(`${file}: suspicious token ${JSON.stringify(token)}`);
      }
    }
  }
}

if (failures.length) {
  console.error("Text integrity gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Text integrity gate passed.");
