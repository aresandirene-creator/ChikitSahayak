import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const standaloneRoot = join(".next", "standalone");
const copies = [
  [join(".next", "static"), join(standaloneRoot, ".next", "static")],
  ["public", join(standaloneRoot, "public")],
];

for (const [source, destination] of copies) {
  if (existsSync(source)) cpSync(source, destination, { recursive: true });
}
