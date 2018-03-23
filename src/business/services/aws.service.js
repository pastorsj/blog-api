import log from '../../log';
import { BUCKET, S3 } from '../../config/aws.config';

const AWSService = {
    deleteImage: src => new Promise((resolve, reject) => {
        try {
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
                    log.critical('Error when delete image', err);
                    reject(new Error(`Error when deleting image: ${err}`));
                } else {
                    resolve(data);
                }
            });
        } catch (e) {
            log.critical('Error when deleting image (catch)', e);
            reject(new Error(`Error when deleting image (catch): ${e}`));
        }
    }),
    postImage: (key, file, mimeType) => new Promise((resolve, reject) => {
        try {
            const params = {
                Bucket: BUCKET,
                Key: key,
                Body: file,
                ACL: 'public-read',
                ContentType: mimeType
            };
            log.info('aws', BUCKET);
            S3.putObject(params, (err, data) => {
                if (err) {
                    log.critical('Error when posting image', err);
                    reject(new Error(`Error when posting image: ${err}`));
                } else {
                    resolve({
                        url: `https://s3.amazonaws.com/${BUCKET}/${key}`,
                        data
                    });
                }
            });
        } catch (e) {
            log.critical('Error when posting image (catch)', e);
            reject(new Error(`Error when posting image (catch): ${e}`));
        }
    })
};

export default AWSService;
