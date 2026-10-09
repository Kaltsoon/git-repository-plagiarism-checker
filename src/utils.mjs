import path from "node:path";
import fs from "node:fs/promises";

export async function getConfig() {
  const configPath = path.join(getPlagiarismCheckDir(), "config.json");

  return JSON.parse(await fs.readFile(configPath, "utf8"));
}

export function getPlagiarismCheckDir() {
  return path.resolve(import.meta.dirname, "..", "plagiarism-check");
}

export async function getTargetDir(argv) {
  if (argv.dir) {
    return argv.dir;
  }

  const { template } = await getConfig();

  return template.split("/").at(-1).split(".").at(0);
}
