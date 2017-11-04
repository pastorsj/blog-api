

import ImageService from '../services/image.service';

const sendJSONResponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

/**
 * ROUTE: articles/:username
 */

const ImagesController = {
    get: (req, res) => {
        const imageHash = ImageService.getImage();
        res.send(imageHash);
    },
    delete: (req, res) => {
        const { src } = req.body;
        ImageService.deleteImage(src)
            .then((result) => {
                sendJSONResponse(res, result.status, {
                    data: result.data
                });
            })
            .catch((err) => {
                sendJSONResponse(res, 400, {
                    error: err
                });
            });
    }
};

export default ImagesController;
