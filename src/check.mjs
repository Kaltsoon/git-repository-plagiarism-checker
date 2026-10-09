import { usePowerShell, $, minimist, spinner, glob } from "zx";
import path from "node:path";
import { getPlagiarismCheckDir, getTargetDir } from "./utils.mjs";

usePowerShell();

const plagiarismCheckDir = getPlagiarismCheckDir();
const argv = minimist(process.argv.slice(2), {});
const targetDir = await getTargetDir(argv);
const templateRepositoryPath = path.join(plagiarismCheckDir, targetDir, "template");
const language = argv.language ?? (await detectLanguageOrExit());

if (!targetDir) {
  throw new Error("Missing required --dir argument.");
}

let jplagPath = await getJPlagPath();

if (!jplagPath) {
  await spinner(
    "JPlag release not downloaded, downloading...",
    () =>
      $`gh release download "v6.3.0" -R "jplag/JPlag" --dir ${path.join(plagiarismCheckDir, "jplag")}`,
  );

  jplagPath = await getJPlagPath();
}

await spinner(
  "Generating plagiation report...",
  () =>
    $`java --enable-native-access=ALL-UNNAMED -jar ${jplagPath} ${path.join(plagiarismCheckDir, targetDir, "repositories")} -bc ${templateRepositoryPath} --language ${language} --overwrite`,
);

async function getJPlagPath() {
  const jars = await glob("*.jar", {
    cwd: path.join(plagiarismCheckDir, "jplag"),
    absolute: true,
  });

  return jars[0];
}

async function detectLanguageOrExit() {
  const detectedLanguage = await getRepoPrimaryLanguage(
    await getTemplateRepositoryUrl(),
  );

  if (!detectedLanguage) {
    console.error(
      "Failed to detect the assigment language. Use the --language flag to provide the language.",
    );
    process.exit(1);
  }

  console.log(
    `Detected language "${detectedLanguage}" from the starter code repo. Use the --language flag to explicitly determine the language`,
  );

  return detectedLanguage.toLowerCase();
}

async function getRepoPrimaryLanguage(repoUrl) {
  const repoJson = await $`gh repo view ${repoUrl} --json "primaryLanguage"`;

  try {
    const parsed = JSON.parse(repoJson.text());
    return parsed?.primaryLanguage.name ?? null;
  } catch (error) {
    return null;
  }
}

async function getTemplateRepositoryUrl() {
  const remote = await $`git -C ${templateRepositoryPath} remote get-url origin`;

  return remote.text().trim();
}