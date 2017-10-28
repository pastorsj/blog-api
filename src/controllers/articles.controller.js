

import mongoose from 'mongoose';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * ROUTE: articles/:username
 */

const ArticlesController = {
    get: (req, res) => {
        const { username } = req.params;
        mongoose.model('BlogPost').find({ author: username }, (err, articles) => {
            if (err) {
                sendJSONResponse(res, 500, {
                    error: err || 'Articles Not Found'
                });
            } else {
                sendJSONResponse(res, 200, {
                    data: articles
                });
            }
        });
    }
};

export default ArticlesController;
