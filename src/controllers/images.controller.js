'use strict';

const FroalaEditor = require('wysiwyg-editor-node-sdk');
const AWS = require('aws-sdk');

const bucket = 'lighthouseblogimg';
const region = 'us-east-1';
const keyStart = 'uploads/';

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: region
});

AWS.config.update(config);

const s3 = new AWS.S3();
/**
 * ROUTE: articles/:username
 */

const ImagesController = {
    get: (req, res) => {
        var configs = {
            bucket,

            // S3 region. If you are using the default us-east-1, it this can be ignored.
            region,

            // The folder where to upload the images.
            keyStart,

            // File access.
            acl: 'public-read',

            // AWS keys.
            accessKey: process.env.AWS_ACCESS_KEY,
            secretKey: process.env.AWS_SECRET_KEY
        };

        var configsObj = FroalaEditor.S3.getHash(configs);

        res.send(configsObj);
    },
    postImage: (key, file, mimeType) => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: bucket,
                Key: key,
                Body: file,
                ACL: 'public-read',
                ContentType: mimeType
            };
            s3.putObject(params, (err, data) => {
                if (err) {
                    reject({
                        error: err
                    });
                } else {
                    resolve({
                        url: `https://s3.amazonaws.com/${bucket}/${key}`,
                        data
                    });
                }
            });
        });
    },
    delete: (req, res) => {
        const src = req.body.src;
        const key = keyStart + src.split('%2F')[1];

        const params = {
            Bucket: bucket,
            Delete: {
                Objects: [{
                    Key: key
                }]
            }
        };
        s3.deleteObjects(params, (err, data) => {
            if (err) {
                console.error(err, err.stack);
                res.send({
                    error: err
                });
            } else {
                res.send({
                    data
                });
            }
        });
    }
};

export default ImagesController;
