#!/usr/bin/env node

const args = require('args')
const { gitFetch, ensureGitHistoryMatch, ensureCleanTree } = require('./index')

args
  .option('prefix', 'prefix of the tag to look for', 'v')
  .option('reload', 'Enable/disable livereloading')

const { prefix: tagPrefix } = args.parse(process.argv)

async function run() {
  process.stdout.write('Git Fetch.... ')
  await gitFetch()
  console.log('done.')
  await ensureMaster()
  await ensureGitHistoryMatch()
  await ensureCleanTree()

}

run().then(
  () => process.exit(0),
  err => {
    console.log(err.stack)
    process.exit(1)
  }
)
