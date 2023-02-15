require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { mkdirp } = require('mkdirp');
const secret = process.env.DSC_ACCESS_KEYFILE;

// debugger
// console.log(
//   JSON.parse(JSON.stringify(secret.replace(/\\"/g, '"'))).replace(/\n/g, '\\n')
// );
// how to gen
// const path = require('path');
// const secret = require(path.join(
//   __dirname,
//   'secret/gcloud-svc-dev-secret-fb52124767a5.json'
// ));
// console.log(JSON.stringify(secret).replace(/"/g, '\\"'));
mkdirp.sync(path.join(process.cwd(), 'secret'));
fs.writeFileSync(
  path.join(process.cwd(), 'secret/auth-key.json'),
  JSON.parse(JSON.stringify(secret.replace(/\\"/g, '"'))).replace(/\n/g, '\\n')
);
console.log('keyfile created');
