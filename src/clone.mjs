import { $, minimist, spinner, usePowerShell } from "zx";
import path from "node:path";
import fs from "node:fs/promises";
import { rimraf } from "rimraf";

import config from "../data/config.json" with { type: "json" };
import pMap from "p-map";

usePowerShell();

const argv = minimist(process.argv.slice(2), {
  string: ["dir"],
});

const targetDir = argv.dir;

if (!targetDir) {
  throw new Error("Missing required --dir argument.");
}

if (!config?.template || !Array.isArray(config?.repositories)) {
  throw new Error(
    "Invalid data/config.json. Expected { template, repositories[] }.",
  );
}

const assignmentPath = path.resolve(
  import.meta.dirname,
  "..",
  "data",
  targetDir,
);
const templatePath = path.join(assignmentPath, "template");
const repositoriesPath = path.join(assignmentPath, "repositories");

await spinner("Preparing directories...", async () => {
  await rimraf([templatePath, repositoriesPath]);
  await fs.mkdir(templatePath, { recursive: true });
  await fs.mkdir(repositoriesPath, { recursive: true });
});

await spinner("Cloning template repository...", async () => {
  await $`git clone ${config.template} ${templatePath}`.quiet();
});

await spinner("Cloning assignment repositories...", async () => {
  const nameCounts = new Map();

  await pMap(
    config.repositories,
    async (repositoryUrl) => {
      const repositoryName = getOwnerRepoFolderName(repositoryUrl);
      const destinationPath = path.join(repositoriesPath, repositoryName);

      await $`git clone ${repositoryUrl} ${destinationPath}`.quiet();
    },
    { concurrency: 5 },
  );
});

function getRandomString() {
    return Math.round(Math.random() * 100000).toString(36)
}

function getOwnerRepoFolderName(repositoryUrl) {
  const normalized = repositoryUrl.replace(/\/+$/, "");
  const segments = normalized.split("/");
  const owner = segments.at(-2) || "owner";
  const repo = (segments.at(-1) || "repository").replace(/\.git$/, "");

  return `${owner}-${repo}-${getRandomString()}`;
}
