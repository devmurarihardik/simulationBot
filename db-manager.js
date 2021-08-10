/* eslint-disable import/order */
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const { config } = require('./conf/configModified');

const db = require('data-api-client')({
  secretArn: config.database.secretArn,
  resourceArn: config.database.resourceArn,
  database: config.database.database,
});

exports.query = async (query, params = {}) => db.query(query, params);

