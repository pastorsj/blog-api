'use strict';

import mongoose from 'mongoose';

const sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * ROUTE: articles/:username
 */

const ArticlesController = {
    get: (req, res) => {
        const username = req.params.username;
        mongoose.model('BlogPost').find({author: username}, (err, articles) => {
            if (err) {
                sendJSONresponse(res, 500, {
                    error: err || 'Articles Not Found'
                });
            } else {
                sendJSONresponse(res, 200, {
                    data: articles
                });
            }
        });
    }
};

export default ArticlesController;
