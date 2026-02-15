const { execSync } = require('child_process');
const prompt = require('readline-sync').question;
const { runRelease } = require('@tunein/web-utils/scripts');
const packageJson = require('../package.json');

runRelease(execSync, prompt, packageJson.version);
