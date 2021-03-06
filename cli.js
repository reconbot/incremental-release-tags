#!/usr/bin/env node
/* eslint-disable no-console */

const args = require('args')
const promptly = require('promptly')
const {
  currentSha,
  ensureCleanTree,
  ensureGitHistoryMatch,
  ensureMaster,
  gitFetch,
  gitLog,
  gitPushTags,
  gitTag,
  latestVersion,
  compareUrl,
  releaseUrl
} = require('./index')

args.option('prefix', 'prefix of the tag to look for', 'v')
args.option('skip-confirmation', 'skip prompt to deploy to production', false)

const { prefix: tagPrefix, skipConfirmation } = args.parse(process.argv)

const confirmDeploy = async () => {
  if (!skipConfirmation) {
    const deploy = await promptly.confirm('# Deploy Production? (y/n)')
    if (!deploy) {
      console.error('Not deploying')
      process.exit(0)
    }
  }
}

async function run() {
  process.stdout.write('# running git fetch.... ')
  await gitFetch()
  console.log('done.')
  await ensureMaster()
  await ensureGitHistoryMatch()
  await ensureCleanTree()
  const { tag, version } = await latestVersion(tagPrefix)
  if (version) {
    console.log(`# detected previous tag ${tag}`)
    const nextTag = `${tagPrefix}${version+1}`
    const log = await gitLog(tag, 'HEAD')
    const lineWithFormatting = log.split('\n').map(line => `- ${line}`).join('\n')
    console.log(`# ${nextTag} Changelog:`)
    console.log(lineWithFormatting)
    await confirmDeploy()
    await gitTag(nextTag, `${nextTag}${log ? '\n\n' + lineWithFormatting : ''}`)
    await gitPushTags()
    console.log(`# pushed sha #${await currentSha()} to tag ${nextTag}`)
    console.log(`# Release: ${await releaseUrl(nextTag)}`)
    console.log(`# Compare: ${await compareUrl(tag, nextTag)}`)
  } else {
    const nextTag = `${tagPrefix}1`
    console.log(`# next tag ${nextTag}`)
    await confirmDeploy()
    await gitTag(nextTag, nextTag)
    await gitPushTags()
    console.log(`# pushed sha #${await currentSha()} to tag ${nextTag}`)
    console.log(`# Release: ${await releaseUrl(nextTag)}`)
  }
}

run().then(
  () => process.exit(0),
  err => {
    console.log(err.stack)
    process.exit(1)
  }
)
