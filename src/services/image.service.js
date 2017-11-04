import FroalaEditor from 'wysiwyg-editor-node-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

import { BUCKET, REGION, KEY_START } from '../config/aws.config';
import log from '../log';
import AWSService from './aws.service';

const ImagesService = {
    deleteImage: src => AWSService.deleteImage(src),
    getImage: () => {
        const configs = {
            bucket: BUCKET,
            // S3 region. If you are using the default us-east-1, it this can be ignored.
            region: REGION,
            // The folder where to upload the images.
            keyStart: KEY_START,
            // File access.
            acl: 'public-read',
            // AWS keys.
            accessKey: process.env.AWS_ACCESS_KEY,
            secretKey: process.env.AWS_SECRET_KEY
        };

        return FroalaEditor.S3.getHash(configs);
    },
    postImage: (picture, serverPath) => new Promise((resolve, reject) => {
        try {
            const filepath = path.join(__dirname, '../../', picture.path);
            const file = fs.readFileSync(filepath);
            const extension = mime.getExtension(picture.mimetype);
            const mimeType = picture.mimetype;

            fs.unlinkSync(filepath);
            AWSService.postImage(`${serverPath}.${extension}`, file, mimeType)
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    log.critical('Error when posting image', err);
                    reject(new Error(`Error when posting image: ${err}`));
                });
        } catch (e) {
            log.critical('Error while getting image off of server (catch)', e);
            reject(new Error(`Error while getting image off of server (catch) ${e})`));
        }
    })
};

export default ImagesService;
