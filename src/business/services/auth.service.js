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
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
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
        } else {
            reject(new Error('Authentication failed. Token was malformed'));
        }
    }),
    register: (username, name, email, password) => new Promise((resolve, reject) => {
        if (!username || !name || !email || !password) {
            reject(new Error('All fields including username, name, email and password are required'));
        } else {
            UserRepository.get({ username }).then((auser) => {
                if (auser) {
                    reject(new Error('Username is already taken'));
                } else {
                    const user = new User();
    
                    user.username = username;
                    user.name = name;
                    user.email = email;
                    user.setPassword(password);
    
                    user.save()
                        .then(() => user.generateJwt())
                        .then((tokenObj) => {
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
        }
    })
};

export default AuthService;
