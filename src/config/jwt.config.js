import jwt from 'express-jwt';
import mongoose from 'mongoose';

export const SECRET = 'blogtokenizer';

export const auth = jwt({ //eslint-disable-line
    secret: SECRET,
    /* req.payload contains the payload of the decoded token */
    userProperty: 'payload'
});

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

export const isAccessible = (req, res, next) => {
    const { payload, params: { username } } = req;
    if (payload.username === username) {
        next();
    } else {
        sendJSONResponse(res, 401, {
            error: `Unable to access ${username}'s articles`
        });
    }
};

export const canUpdate = (req, res, next) => {
    const { payload, params: { id } } = req;
    mongoose.model('BlogPost').findOne({
        _id: id
    }).then((blog) => {
        if (payload.username === blog.author) {
            next();
        } else {
            sendJSONResponse(res, 401, {
                error: 'Unable to update this article'
            });
        }
    }).catch((err) => {
        sendJSONResponse(res, 404, {
            error: err || 'Blog Post Not Found'
        });
    });
};

export const canPost = (req, res, next) => {
    const { payload, body: { author } } = req;
    if (payload.username === author) {
        next();
    } else {
        sendJSONResponse(res, 401, {
            error: `Unable to create this article under this username: ${author}`
        });
    }
};
