import ImageService from '../../business/services/image.service';
import Response from './response';

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
                Response.json(res, result.status, result.data);
            })
            .catch((err) => {
                Response.error(res, 400, err);
            });
    }
};

export default ImagesController;
