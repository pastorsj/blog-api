'use strict';

import gistify from 'node-gist-html';

const sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};
/**
 * ROUTE: gist/
 */

const GistController = {
    post: (req, res) => {
        if (req.body && req.body.link) {
            const link = req.body.link;
            gistify(link)
                .then(html => {
                    sendJSONresponse(res, 200, {
                        data: html
                    });
                })
                .catch(err => {
                    sendJSONresponse(res, 400, {
                        message: err
                    });
                });
        } else {
            sendJSONresponse(res, 400, {
                message: `
                The body of the request must be in the form of json
                with a key value pair with link as the key
                `
            });
        }
    }
};

export default GistController;
