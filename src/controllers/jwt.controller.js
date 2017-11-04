

import jwt from 'jsonwebtoken';
import { SECRET } from '../config/jwt.config';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * ROUTE: jwt/expired
 */

const JwtController = {
    post: (req, res) => {
        if (!req.headers.authorization) {
            sendJSONResponse(res, 401, {
                message: 'Authorization header not included'
            });
        } else {
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader.startsWith('Bearer ')) {
                const token = authorizationHeader.slice(7);
                jwt.verify(token, SECRET, (err) => {
                    if (err) {
                        sendJSONResponse(res, 401, {
                            message: 'JWT is expired'
                        });
                    } else {
                        sendJSONResponse(res, 204, {
                            message: 'JWT is not expired'
                        });
                    }
                });
            } else {
                sendJSONResponse(res, 500, {
                    message: 'Authorization header is malformed. It needs to start with Bearer '
                });
            }
        }
    }
};

export default JwtController;
