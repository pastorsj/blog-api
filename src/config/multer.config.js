
import multer from 'multer';
import crypto from 'crypto';
import mime from 'mime';
import log from '../log';

const MAX_SIZE = 500000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        crypto.pseudoRandomBytes(16, (err, raw) => {
            if (err) {
                log.critical('Error encrypting filename', err);
            } else {
                cb(null, `${raw.toString('hex') + Date.now()}.${mime.getExtension(file.mimetype)}`);
            }
        });
    },
    limits: { fileSize: MAX_SIZE }
});

export const upload = multer({ storage }); // eslint-disable-line
