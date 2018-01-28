

import jwt from 'jsonwebtoken';
import { SECRET } from '../config/jwt.config';
import Response from '../config/response.config';

/**
 * ROUTE: jwt/expired
 */

const JwtController = {
    post: (req, res) => {
        if (!req.headers.authorization) {
            Response.error(res, 401, 'Authorization header not included');
        } else {
            const authorizationHeader = req.headers.authorization;
            if (authorizationHeader.startsWith('Bearer ')) {
                const token = authorizationHeader.slice(7);
                jwt.verify(token, SECRET, (err) => {
                    if (err) {
                        Response.error(res, 401, 'JWT is expired');
                    } else {
                        Response.message(res, 204, 'JWT is not expired');
                    }
                });
            } else {
                Response.message(res, 400, 'Authorization header is malformed. It needs to start with Bearer');
            }
        }
    }
};

export default JwtController;
