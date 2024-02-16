import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env'});
const config = {
    region: 'us-east-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};
AWS.config.update(config);
let docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10', convertEmptyValues: true});
let S3 = new AWS.S3({apiVersion: '2006-03-01'})

export { docClient, S3 };