# incremental release tags

I needed a small cli to help create the next version of release tags using an incremting number

# Usage

```bash
$ incremental-release-tags --prefix 'v'
# running `git fetch`
# detected previous tag v42
# next tag v43
# pushed sha #123abc to tag v43
  9370b7b0 Use SSM for all secrets, and move non-secret configs to .js files (#1919)
  5637b910 TZR Migration (#1793)
  18e3b904 Remove luxon (#1895)
  cc1adb9f add skip async event flag on delete clip for es (#1917)
# published release https://github.com/bustle/foobar/releases/tag/v43
```
