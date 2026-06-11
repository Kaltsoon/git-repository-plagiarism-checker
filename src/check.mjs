import { usePowerShell, $, minimist, spinner, glob } from "zx";
import { rimraf } from "rimraf";

usePowerShell();

const argv = minimist(process.argv.slice(2), {});
const language = argv.language ?? "java";
const targetDir = argv.dir

if (!targetDir) {
  throw new Error("Missing required --dir argument.");
}

let jplagPath = await getJPlagPath();

if (!jplagPath) {
  await spinner(
    "JPlag release not downloaded, downloading...",
    () => $`gh release download "v6.3.0" -R "jplag/JPlag" --dir data/jplag`
  );

  jplagPath = await getJPlagPath();
}

await spinner(
  "Generating plagiation report...",
  () =>
    $`java --enable-native-access=ALL-UNNAMED -jar ${jplagPath} data/${targetDir}/repositories -bc data/${targetDir}/template --language ${language} --overwrite`
);

async function getJPlagPath() {
  const jars = await glob("data/jplag/*.jar");

  return jars[0];
}

function getAssignmentFieldValue(assignmentString, field) {
  return assignmentString
    .split("\n")
    .map((line) => stripColor(line.trim()))
    .find((line) => line.toString().startsWith(`${field}:`))
    .replace(`${field}:`, "")
    .trim();
}

async function detectLanguageOrExit(assignmentDescription) {
  const detectedLanguage = await getRepoPrimaryLanguage(
    getAssignmentFieldValue(assignmentDescription, "Starter Code Repo URL"),
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
