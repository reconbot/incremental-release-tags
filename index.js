const execa = require('execa')

async function gitFetch() {
  await execa.stdout('git', ['fetch'])
}

async function gitTags() {
  return (await execa.stdout('git', ['tag'])).split()
}

async function gitLog(from = 'HEAD~4', to = 'HEAD') {
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

module.exports = {
  gitFetch,
  gitLog,
  gitTags,
  ensureMaster,
  ensureCleanTree,
  ensureGitHistoryMatch
}
