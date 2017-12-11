

import gistify from 'node-gist-html';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};
/**
 * ROUTE: gist/
 */

const GistController = {
    post: (req, res) => {
        if (req.body && req.body.link) {
            const { link } = req.body;
            gistify(link, { removeFooter: true })
                .then((html) => {
                    sendJSONResponse(res, 200, {
                        data: html
                    });
                })
                .catch((err) => {
                    sendJSONResponse(res, 400, {
                        message: err
                    });
                });
        } else {
            sendJSONResponse(res, 400, {
                message: `
                The body of the request must be in the form of json
                with a key value pair with link as the key
                `
            });
        }
    }
};

export default GistController;
