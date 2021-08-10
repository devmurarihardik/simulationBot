/* eslint-disable no-console */
const fs = require('fs');
const AWS = require('aws-sdk');

const client = new AWS.SecretsManager({
  region: 'us-east-1',
});
const env = process.env.ENV || 'uat';

const downloadCreds = () => {
  client.getSecretValue({ SecretId: env }, (err, data) => {
    if (err) {
      console.log('=> DOWNLOAD CONFIG: NOT OK');
    }
    console.log('=> DOWNLOAD CONFIG: OK');

    const writeConfig = `const config=${data.SecretString}; module.exports={config}`;

    fs.writeFile('./conf/config.js', writeConfig, (error) => {
      if (error) {
        console.log('=> SAVE CONFIG: NOT OK');
      }
      console.log('=> SAVE CONFIG: OK');
    });
  });
};

downloadCreds();
