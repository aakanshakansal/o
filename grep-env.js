#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.argv[2] || ".");
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "coverage"
]);

const FILE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs"
]);

const patterns = [
  /process\.env\.([A-Z0-9_]+)/g,
  /process\.env\[['"]([A-Z0-9_]+)['"]\]/g,
  /import\.meta\.env\.([A-Z0-9_]+)/g,
  /import\.meta\.env\[['"]([A-Z0-9_]+)['"]\]/g,
  /Deno\.env\.get\(['"]([A-Z0-9_]+)['"]\)/g
];

const results = new Map(); // VAR_NAME -> Set(files)

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }

    if (!FILE_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];
        if (!results.has(varName)) {
          results.set(varName, new Set());
        }
        results.get(varName).add(fullPath);
      }
    }
  }
}

walk(ROOT);

// Output
const sorted = [...results.keys()].sort();

console.log("\nEnvironment variables found:\n");

for (const key of sorted) {
  console.log(`- ${key}`);
}

console.log(`\nTotal: ${sorted.length}\n`);

// Uncomment if you want file-level detail
/*
for (const [key, files] of results.entries()) {
  console.log(`\n${key}`);
  for (const file of files) {
    console.log(`  ${file}`);
  }
}
*/
