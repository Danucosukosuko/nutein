const { execSync } = require('child_process');
const prompt = require('readline-sync').question;
const { mergeNTag } = require('@tunein/web-utils/scripts');

mergeNTag(execSync, prompt);
