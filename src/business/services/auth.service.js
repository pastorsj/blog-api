import UserRepository from '../../dal/repositories/user.repository';
import log from '../../log';

const AuthService = {
    login: authorizationHeader => new Promise((resolve, reject) => {
        const usernamePassword = authorizationHeader.split(':');
        const username = usernamePassword[0];
        const password = usernamePassword[1];

        UserRepository.get({ username }).then((user) => {
            if (!user.validPassword(password)) {
                reject(new Error('Authentication failed. Wrong password.'));
            } else {
                user.generateJwt().then((tokenObj) => {
                    const { accessToken, refreshToken, expiresIn } = tokenObj;
                    resolve({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                        token_type: 'Bearer'
                    });
                });
            }
        }).catch((err) => {
            reject(err);
        });
    }),
    refreshAccessToken: token => new Promise((resolve, reject) => {
        UserRepository.get({ refreshToken: token }).then((user) => {
            user.generateJwt().then((tokenObj) => {
                const { accessToken, refreshToken, expiresIn } = tokenObj;
                resolve({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                    token_type: 'Bearer'
                });
            });
        }).catch((err) => {
            log.critical('Unable to refresh token:', err);
            reject(new Error('Authentication failed.'));
        });
    }),
    register: (username, name, email, password) => new Promise((resolve, reject) => {
        UserRepository.get({ username }).then((auser) => {
            if (auser) {
                reject(new Error('Username is already taken'));
            } else {
                UserRepository.createUser(username, name, email, password).then((tokenObj) => {
                    const { accessToken, refreshToken, expiresIn } = tokenObj;
                    resolve({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                        token_type: 'Bearer'
                    });
                });
            }
        }).catch((err) => {
            reject(new Error(`An error has occcured: ${err}`));
        });
    })
};

export default AuthService;
