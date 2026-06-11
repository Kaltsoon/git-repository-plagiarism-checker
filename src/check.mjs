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
