#!/usr/bin/env node
/* eslint-disable no-console */

const args = require('args')
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

const { prefix: tagPrefix } = args.parse(process.argv)

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
    console.log(`# next tag ${nextTag}`)
    const log = await gitLog(tag, 'HEAD')
    const lineWithFormatting = log.split('\n').map(line => `- ${line}`).join('\n')
    await gitTag(nextTag, `${nextTag}${log ? '\n\n' + lineWithFormatting : ''}`)
    await gitPushTags()
    console.log(`# pushed sha #${await currentSha()} to tag ${nextTag}`)
    console.log(`# Release: ${await releaseUrl(nextTag)}`)
    console.log(`\nChangelog: ${await compareUrl(tag, nextTag)}\n${lineWithFormatting}`)
  } else {
    const nextTag = `${tagPrefix}1`
    console.log(`# next tag ${nextTag}`)
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
