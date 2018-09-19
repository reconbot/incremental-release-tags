# incremental release tags

I needed a small cli to help create the next version of release tags using an incremting number

# Usage
```
  Usage: incremental-release-tags [options] [command]

  Commands:
    help     Display help
    version  Display version

  Options:
    -h, --help               Output usage information
    -p, --prefix [value]     prefix of the tag to look for (defaults to "v")
    -s, --skip-confirmation  skip prompt to deploy to production (disabled by default)
    -v, --version            Output the version number
```


```bash
$ incremental-release-tags --prefix 'v'
# Deploy Production (y/n)
y
# running `git fetch`
# detected previous tag v42
# next tag v43
# pushed sha #123abc to tag v43
# Release: https://github.com/bustle/foobar/releases/tag/v43

Changelog: https://github.com/reconbot/incremental-release-tags/compare/v5...v6
- 9370b7b0 Use SSM for all secrets, and move non-secret configs to .js files (#1919)
- 5637b910 Report Migration (#1793)
- 18e3b904 Remove luxon (#1895)
- cc1adb9f add skip async event flag on delete clip for elasticsearch (#1917)
```
