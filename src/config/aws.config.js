'use strict';

import AWS from 'aws-sdk';

export const BUCKET = 'lighthouseblogimg';
export const REGION = 'us-east-1';
export const KEY_START = 'uploads/';

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: REGION
});

AWS.config.update(config);

export const S3 = new AWS.S3();
