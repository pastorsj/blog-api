'use strict';

const FroalaEditor = require('wysiwyg-editor-node-sdk');
/**
 * ROUTE: articles/:username
 */

const ImagesController = {
    get: (req, res) => {
        var configs = {
            bucket: 'lighthouseblogimg',

            // S3 region. If you are using the default us-east-1, it this can be ignored.
            region: 'us-east-1',

            // The folder where to upload the images.
            keyStart: 'uploads/',

            // File access.
            acl: 'public-read',

            // AWS keys.
            accessKey: process.env.AWS_ACCESS_KEY,
            secretKey: process.env.AWS_SECRET_KEY
        };

        var configsObj = FroalaEditor.S3.getHash(configs);
        res.send(configsObj);
    }
};

export default ImagesController;
