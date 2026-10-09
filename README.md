# Git Repository Plagiarism Checker

Command-line tool for checking plagiarism in Git repositories using [JPlag](https://github.com/jplag/JPlag).

## Requirements and setup

The tool requires Java version >= 21 and [Bun](https://bun.sh/) version >= 1.4.2.

The setup is done as follows:

1. Install [GitHub CLI](https://cli.github.com/) and authenticate it using the `gh auth login` command.
2. Run `bun install` to install the dependencies.

## Usage

Create a `config.json` file in the `plagiarism-check` folder:

```json
{
  "template": "https://github.com/hh-programming-2-exercises/warming-up.git",
  "repositories": ["https://github.com/Kaltsoon/programming-2-warming-up.git"]
}
```

The `template` is the repository URL for the template and `repositories` contains an array of repositories to check.

Then, clone the repositories by running `bun run clone`. You can also pass the directory with `--dir "warming-up"`. If omitted, the name of the template repository will be used.

Finally, run `bun run check` to check plagiarism against the configured repositories. You can also pass the directory with `--dir "warming-up"`. If omitted, the name of the template repository will be used. The `--language` flag determines the programming language used in the assignment. If omitted, the template repository's default language will be used. After installing the assignment repositories, a JPlag report should open in the browser.

## License

[MIT](./LICENSE)
