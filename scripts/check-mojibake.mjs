import fs from "node:fs";
import path from "node:path";

const roots = ["src"];

const extensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".md",
  ".css",
]);

const forbiddenCodePoints = [
  "\uFFFD",
  "\u250C",
  "\u2510",
  "\u2514",
  "\u2518",
  "\u2518",
  "\u2524",
  "\u251C",
  "\u2500",
  "\u2502",
  "\u2588",
  "\u256A",
  "\u2551",
  "\u2550",
];

const suspiciousSequences = [
  "Ã",
  "Â",
  "â€",
  "â€™",
  "â€œ",
  "â€",
];

function walk(directory) {
  const output = [];

  for (const entry of fs.readdirSync(
    directory,
    { withFileTypes: true },
  )) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      output.push(...walk(fullPath));
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      output.push(fullPath);
    }
  }

  return output;
}

const failures = [];

for (const root of roots) {
  for (const file of walk(root)) {
    const text = fs.readFileSync(file, "utf8");

    for (const token of forbiddenCodePoints) {
      if (text.includes(token)) {
        failures.push(
          `${file}: forbidden Unicode token ${JSON.stringify(token)}`,
        );
      }
    }

    for (const token of suspiciousSequences) {
      if (text.includes(token)) {
        failures.push(
          `${file}: suspicious mojibake sequence ${JSON.stringify(token)}`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Text integrity gate failed.");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log("Text integrity gate passed.");
