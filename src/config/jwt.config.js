import jwt from 'express-jwt';

export const SECRET = 'blogtokenizer';

export const auth = jwt({ //eslint-disable-line
    secret: SECRET,
    /* req.payload contains the payload of the decoded token */
    userProperty: 'payload'
});
