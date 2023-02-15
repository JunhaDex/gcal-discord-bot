require('dotenv').config();
const fs = require('fs');
const path = require('path');
const secret = process.env.DSC_ACCESS_KEYFILE;
fs.writeFileSync(
  path.join(process.cwd(), 'secret/auth-key.json'),
  JSON.parse(secret)
);
console.log('keyfile created');
