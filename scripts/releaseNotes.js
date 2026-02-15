const { execSync } = require('child_process');
const prompt = require('readline-sync').question;
const { releaseNotes } = require('@tunein/web-utils/scripts');

const confluenceReleaseNotesLink
  = 'https://tunein.atlassian.net/wiki/spaces/ENG/pages/208175664/2019+Tunein.com+Desktop+Release+Notes';

releaseNotes(execSync, prompt, confluenceReleaseNotesLink);
