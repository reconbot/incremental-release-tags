const execa = require('execa')

async function gitFetch() {
  await execa.stdout('git', ['fetch'])
}

async function gitTags() {
  return (await execa.stdout('git', ['tag'])).split('\n')
}

async function gitTag(name, annotation) {
  await execa.stdout('git', ['tag', 'name', '-m', annotation])
}

async function currentSha() {
  return execa.stdout('git', ['rev-parse', '--short', 'HEAD'])
}

async function gitLog(from, to) {
  if (!from || !to) { throw new TypeError('Need a from and to') }
  return execa.stdout('git' ['log', `${from}..${to}`, '--oneline', '--no-decorate'])
}

async function ensureMaster() {
  const branch = await execa.stdout('git', ['symbolic-ref', '--short', 'HEAD'])
  if (branch !== 'master') {
    throw new Error('Not on `master` branch. We\'ll add this eventually.')
  }
}

async function ensureCleanTree() {
  const status = await execa.stdout('git', ['status', '--porcelain'])
  if (status !== '') {
    throw new Error('Unclean working tree. Commit or stash changes first.')
  }
}

async function ensureGitHistoryMatch() {
  const result = await execa.stdout('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD'])
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
  await execa.stdout('git', ['push', '--tags'])
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
  gitTag
}
