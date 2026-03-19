import { usePowerShell, $, minimist, spinner, glob } from "zx";
import kebabCase from "lodash.kebabcase";
import stripColor from "strip-color";
import { rimraf } from "rimraf";

usePowerShell();

const argv = minimist(process.argv.slice(2), {});
const assignmentId = argv.assignment;

await $`gh extension install github/gh-classroom`;

let jplagPath = await getJPlagPath();

if (!jplagPath) {
  await spinner(
    "JPlag release not downloaded, downloading...",
    () => $`gh release download "v6.2.0" -R "jplag/JPlag" --dir data/jplag`,
  );

  jplagPath = await getJPlagPath();
}

const assignmentDescription =
  await $`gh classroom assignment -a ${assignmentId}`;

let language = argv.language;

if (!language) {
  language = await detectLanguageOrExit(assignmentDescription.text());
}

const assignmentName = kebabCase(
  getAssignmentFieldValue(assignmentDescription.text(), "Title").toLowerCase(),
);

await spinner("Downloading assignment repositories...", async () => {
  await rimraf([
    `data/assignment-repos/${assignmentName}-submissions`,
    `data/starter-repos/${assignmentName}`,
  ]);

  await Promise.all([
    $`gh classroom clone student-repos -a ${assignmentId} --directory data/assignment-repos`,
    $`gh classroom clone starter-repo -a ${assignmentId} --directory data/starter-repos`,
  ]);
});

await spinner(
  "Generating plagiation report...",
  () =>
    $`java -jar ${jplagPath} data/assignment-repos/${assignmentName}-submissions -bc data/starter-repos/${assignmentName} --language ${language} --overwrite`,
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
