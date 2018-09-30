import AuthService from '../../business/services/auth.service';
import Response from '../controllers/response';

const AuthGuard = {
    canUpdate: (req, res, next) => {
        const { payload, params: { id } } = req;
        AuthService.canUpdate(payload, id)
            .then(() => next())
            .catch((error) => {
                Response.error(res, 401, error);
            });
    },
    canPost: (req, res, next) => {
        const { payload, body: { author } } = req;
        const isAccessible = AuthService.canAccess(payload, author);
        if (isAccessible) {
            next();
        } else {
            Response.error(res, 401, `Unable to create this article under this username: ${author})`);
        }
    },
    isAccessible: (req, res, next) => {
        const { payload, params: { username } } = req;
        const isAccessible = AuthService.canAccess(payload, username);
        if (isAccessible) {
            next();
        } else {
            Response.error(res, 401, `Unable to access ${username}'s articles`);
        }
    }
};

export default AuthGuard;
