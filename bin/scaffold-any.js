#!/usr/bin/env node
/* eslint-disable no-console */
const {
  cyan,
  green,
  yellow,
  magenta,
} = require('colors');
const jsonfile = require('jsonfile');
const path = require('path');
const replace = require('replace');
const shell = require('shelljs');

const program = require('commander');

program
  .option('-i, --id <id>', 'Skeleton id to clone')
  .parse(process.argv);

const REPOS = {
  nea: {
    repo: 'https://github.com/paolo-chiabrera/nea.git',
    placeholder: 'nea',
  },
  nm: {
    repo: 'https://github.com/paolo-chiabrera/nm-skeleton.git',
    placeholder: 'nm-skeleton',
  },
};

const CONFIG = REPOS[program.id];

if (!CONFIG) {
  console.log(yellow('no valid skeleton id provided'));
  program.help();
}

const REPO = CONFIG.repo;

const ROOT = process.cwd();
const TMP = path.resolve(ROOT, '_tmp_');
const JSON_PATH = path.resolve(ROOT, './package.json');

shell.rm('-rf', path.resolve(ROOT, './*'));

shell.exec(`git clone ${REPO} ${TMP}`, { silent: true });

console.log(`Cloned from: ${magenta(REPO)}`);

shell.rm('-rf', path.resolve(TMP, '.git'));

shell.cp('-r', path.resolve(TMP, './*'), ROOT);

shell.cp('-r', path.resolve(TMP, './.*'), ROOT);

shell.rm('-rf', TMP);

const remote = shell.exec('git remote get-url origin', { silent: true });

const name = path.basename(ROOT);

if (parseInt(remote.code, 10) === 0) {
  const repository = remote.stdout.replace(/\n$/, '');
  const repositoryName = path.parse(repository).name;

  console.log(`Found repo: ${cyan(repository)}`);

  if (repositoryName !== name) {
    shell.rm('-rf', path.resolve(ROOT, '.git'));
  }
} else {
  console.log(yellow('No repo found'));
}

replace({
  regex: CONFIG.placeholder,
  replacement: name,
  paths: [ROOT],
  recursive: true,
  silent: true,
});

jsonfile.writeFileSync(JSON_PATH, Object.assign(
  {},
  jsonfile.readFileSync(JSON_PATH),
  { version: '1.0.0' },
), { spaces: 2, EOL: '\r\n' });

console.log(`Scaffolding of ${green(name)} done!`);

console.log(`Run ${yellow('yarn/npm install')} and enjoy it!`);

process.exit(0);
