'use strict';
/* Rebuild server/data/content.json from js/data.js.
   Usage: node server/scripts/init-data.js [--force]  */
const { initDatabase } = require('../db');

const force = process.argv.includes('--force');
try {
  initDatabase({ force });
  console.log('Done. Content database ready at server/data/content.json');
} catch (e) {
  console.error('Failed to initialize content database:', e.message);
  process.exit(1);
}
