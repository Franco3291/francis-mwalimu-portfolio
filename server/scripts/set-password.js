'use strict';
/* Set or change the admin panel credentials.
   Usage: node server/scripts/set-password.js [username] [password]
   (If omitted, you will be prompted.)  */
const readline = require('readline');
const { setCredentials } = require('../users');

function prompt(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  let username = process.argv[2];
  let password = process.argv[3];
  if (!username) username = await prompt('Admin username: ');
  if (!password) password = await prompt('Admin password (min 8 chars): ');

  if (!username || !password) {
    console.error('Username and password are required.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  setCredentials(username, password);
  console.log('Admin credentials saved to server/config.json');
  console.log('IMPORTANT: server/config.json is git-ignored and must not be committed.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
