# Git Repository Plagiarism Checker

Command-line tool for checking plagiarism in Git repositories using [JPlag](https://github.com/jplag/JPlag).

## Requirements and setup

The tool requires Java version >= 21 and Node.js version >= 22.

The setup is done as follows:

1. Install [GitHub CLI](https://cli.github.com/) and authenticate it using the `gh auth login` command.
2. Run `npm install` to install the dependencies.

## Usage

Create a `config.json` file to the `data` folder:

```json
{
  "template": "https://github.com/hh-programming-2-exercises/warming-up.git",
  "repositories": ["https://github.com/Kaltsoon/programming-2-warming-up.git"]
}
```

The `template` is the repository URL for the template and `repositories` contains an array of repositories to check.

Then, clone the repositories by running the command `npx zx src/clone.mjs --dir "warming-up"`. The optional `--dir` flag determines the folder where the repositories are cloned in the `data` folder. By default, the name of the template repository will be used.

Finally, run the `npx zx src/check.mjs --dir "warming-up" --language "java"` to check plagiarism agains the configured repositories. The `--dir` flag determines the folder where the repositories have been cloned using the `npx zx src/clone.mjs` command. The `--language` flag determines the programming language used in the assignment (defaults to "java"). After installing the assignment repositories, a JPlag report should open in the browser.

## License

[MIT](./LICENSE)
