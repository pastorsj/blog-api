'use strict';

import mongoose from 'mongoose';

/**
 * ROUTE: articles/:username
 */

const ArticlesController = {
    get: (req, res) => {
        const username = req.params.username;
        mongoose.model('BlogPost').find({author: username}, (err, articles) => {
            if (err) {
                res.status(500);
                res.format({
                    json: () => {
                        res.json({
                            error: err || 'Articles Not Found'
                        });
                    }
                });
            } else {
                res.status(200);
                res.format({
                    json: () => {
                        res.json({
                            data: articles
                        });
                    }
                });
            }
        });
    }
};

export default ArticlesController;
