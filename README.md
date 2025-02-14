# GitHub Activity

A simple command line interface (CLI) utility to fetch and display the recent activities of a GitHub user using [GitHub API](https://docs.github.com/en/rest).

## Installation

```sh
npm install [-g] @essamonline/github-activity
```

## Usage

```sh
Usage: gh-act [OPTION]... USER
Use GitHub API to fetch GitHub user activities and display it in the terminal.

  -b  --table        tabular output
  -j  --json         output JSON data
  -c  --csv          output comma separated values
  -v  --verbose      verbose output (default)
  -d  --debug        show request and response headers
  -t  --type[=TYPE]  filter user activities by event type
      --user         output user information and exit
      --nocache      remove the cache directory and exit
      --list         list GitHub event types and exit
      --help         display this help and exit
      --version      output version information and exit

Writing your GitHub authentication token to the file '.auth-token' located in the
package root directory is recommended for normal operation and required for testing.
```

## Testing


## Documentation

Source code documentation along with a test coverage report are both included under [Documentation](https://essamatefelsherif.github.io/roadmap.sh.github-activity/ "Documentation").

## Node version support

**gh-act** supports all currently maintained Node versions. See the [Node Release Schedule](https://github.com/nodejs/Release#release-schedule).

## License

This software is licensed under the MIT license, see the [LICENSE](./LICENSE "LICENSE") file.
