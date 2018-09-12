const execa = require('execa')
const debug = require('debug')('incremental-release-tags')

function exec(...args) {
  if (!args[0]) {
    throw new Error('No command ' + JSON.stringify(args))
  }
  debug('executing', args)
  return execa.stdout(...args)
}

async function gitFetch() {
  await exec('git', ['fetch'])
}

async function gitTags() {
  return (await exec('git', ['tag'])).split('\n')
}

async function gitTag(name, annotation) {
  await exec('git', ['tag', name, '-m', annotation])
}

async function currentSha() {
  return exec('git', ['rev-parse', '--short', 'HEAD'])
}

async function gitLog(from, to) {
  if (!from || !to) {
    throw new Error('Need a from and to')
  }
  return exec('git', ['log', `${from}..${to}`, '--oneline', '--no-decorate'])
}

async function ensureMaster() {
  const branch = await exec('git', ['symbolic-ref', '--short', 'HEAD'])
  if (branch !== 'master') {
    throw new Error('Not on `master` branch. We\'ll add this eventually.')
  }
}

async function ensureCleanTree() {
  const status = await exec('git', ['status', '--porcelain'])
  if (status !== '') {
    throw new Error('Unclean working tree. Commit or stash changes first.')
  }
}

async function ensureGitHistoryMatch() {
  const result = await exec('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD'])
  if (result !== '0') {
    throw new Error('Remote history differs. Please pull changes.')
  }
}

async function latestVersion(prefix) {
  const tags = await gitTags()
  const latestVersion = tags.filter(tag => tag.startsWith(prefix)).map(tag => tag.substring(prefix.length)).map(Number).sort().pop() || null
  const tag = latestVersion ? `${prefix}${latestVersion}` : null
  return { version: latestVersion, tag }
}

async function gitPushTags() {
  await exec('git', ['push', '--tags'])
}


// git@github.com:reconbot/incremental-release-tags.git
// https://github.com/reconbot/incremental-release-tags.git
async function compareUrl(tag, nextTag) {
  const gitUrl = await exec('git', ['config', 'remote.origin.url'])
  const parts = gitUrl.match(/.+github.com[:/]([\w-]+)\/([\w-]+)\.git/)
  if (!parts) {
    return null
  }
  const owner = parts[1]
  const repo = parts[2]
  return `https://github.com/${owner}/${repo}/compare/${tag}...${nextTag}`
}

async function releaseUrl(tag) {
  const gitUrl = await exec('git', ['config', 'remote.origin.url'])
  const parts = gitUrl.match(/.+github.com[:/]([\w-]+)\/([\w-]+)\.git/)
  if (!parts) {
    return null
  }
  const owner = parts[1]
  const repo = parts[2]
  return `https://github.com/${owner}/${repo}/releases/tag/${tag}`
}

module.exports = {
  currentSha,
  ensureCleanTree,
  ensureGitHistoryMatch,
  ensureMaster,
  latestVersion,
  gitFetch,
  gitLog,
  gitPushTags,
  gitTags,
  gitTag,
  compareUrl,
  releaseUrl
}
