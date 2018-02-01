import UserService from '../../business/services/user.service';
import { upload } from '../../config/multer.config';
import Response from './response';

/**
 * ROUTE: user/:username
 */

const UserController = {
    get: (req, res) => {
        const { username } = req.params;
        UserService.getUser(username).then((user) => {
            Response.json(res, 200, user);
        }).catch((err) => {
            Response.error(res, 404, err || 'User Not Found');
        });
    },
    updateProfilePicture: (req, res) => {
        upload.single('profilePicture')(req, res, (fileError) => {
            if (fileError) {
                Response.error(res, 400, 'The file uploaded was larger than 1mb');
            } else {
                const { username } = req.params;
                UserService.updateProfilePicture(username, req.file).then((user) => {
                    Response.json(res, 200, user);
                }).catch((err) => {
                    Response.error(res, 400, err);
                });
            }
        });
    },
    put: (req, res) => {
        const { username } = req.params;
        UserService.updateUser(username, req.body).then((user) => {
            Response.json(res, 200, user);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    },
    delete: (req, res) => {
        const { username } = req.params;
        UserService.deleteUser(username).then((result) => {
            Response.json(res, 200, result);
        }).catch((err) => {
            Response.error(res, 404, err);
        });
    }
};

export default UserController;
