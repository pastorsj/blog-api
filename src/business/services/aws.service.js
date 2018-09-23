import gm from 'gm';
import log from '../../log';
import { BUCKET, S3, IMAGE_SIZES } from '../../config/aws.config';

const AWSService = {
    deleteImage: src => new Promise((resolve, reject) => {
        try {
            if (!src) {
                resolve();
            }
            const parts = src.split('/');
            const key = parts.slice(Math.max(parts.length - 2, 1)).join('/');

            const params = {
                Bucket: BUCKET,
                Delete: {
                    Objects: [{
                        Key: key
                    }]
                }
            };
            S3.deleteObjects(params, (err, data) => {
                if (err) {
                    log.error('Error when delete image', err);
                    reject(new Error(`Error when deleting image: ${err}`));
                } else {
                    resolve(data);
                }
            });
        } catch (e) {
            log.error('Error when deleting image (catch)', e);
            reject(new Error(`Error when deleting image (catch): ${e}`));
        }
    }),
    postImage: (key, file, mimeType) => new Promise((resolve, reject) => {
        try {
            Promise.all(IMAGE_SIZES.map(size => AWSService.resizeAndUploadImage(size, key, file, mimeType)))
                .then(resolve)
                .catch(reject);
        } catch (e) {
            log.error('Error when posting image (catch)', e);
            reject(new Error(`Error when posting image (catch): ${e}`));
        }
    }),
    resizeAndUploadImage: (size, key, file, mimeType) => new Promise((resolve, reject) => {
        const width = size;
        const height = size;
        gm(file)
            .resize(width, height)
            .toBuffer((error, stdout) => {
                const keyParts = key.split('.');
                keyParts.splice(keyParts.length - 1, 0, `-${size}`);
                const updatedFileName = `${keyParts.slice(0, keyParts.length - 1).join('')}.${keyParts[keyParts.length - 1]}`;

                const params = {
                    Bucket: BUCKET,
                    Key: updatedFileName,
                    Body: stdout,
                    ACL: 'public-read',
                    ContentType: mimeType
                };
                S3.upload(params, (err, data) => {
                    if (err) {
                        log.error('Error when posting image', err);
                        reject(new Error(`Error when posting image: ${err}`));
                    } else {
                        resolve({
                            url: `https://s3.amazonaws.com/${BUCKET}/${updatedFileName}`,
                            data
                        });
                    }
                });
            })
    })
};

export default AWSService;
