import GistService from '../../business/services/gist.service';
import Response from './response';

/**
 * ROUTE: gist/
 */

const GistController = {
    post: (req, res) => {
        if (req.body && req.body.link) {
            const { link } = req.body;
            GistService.convert(link).then((html) => {
                Response.json(res, 200, html);
            }).catch((err) => {
                Response.error(res, 400, err);
            });
        } else {
            Response.error(res, 400, 'The body of the request must be in the form of json with a key value pair with link as the key');
        }
    }
};

export default GistController;
