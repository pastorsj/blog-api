import mongoose from 'mongoose';
var User = mongoose.model('User');

var sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

export function register(req, res) {
    if (!req.body.username || !req.body.firstName || !req.body.lastName ||
        !req.body.password) {
        sendJSONresponse(res, 400, {
            message: "All fields required"
        });
        return;
    }
    User.findOne({username: req.body.username}, (err, auser) => {
        if (auser) {
            sendJSONresponse(res, 409, {
                message: "Username is taken."
            });
            return;
        }
    });
    var user = new User();

    user.username = req.body.username;
    user.name.firstName = req.body.firstName;
    user.name.lastName = req.body.lastName;
    user.name.middleInitial = req.body.middleInitial || '';

    user.setPassword(req.body.password);

    user.save(err => {
        if (err) {
            sendJSONresponse(res, 404, err);
        } else {
            let token = user.generateJwt();
            sendJSONresponse(res, 200, {
                token: token
            });
        }
    });
}

export function login(req, res) {
    console.log('Authorization', req.headers.authorization);
    if (!req.headers.authorization || req.headers.authorization.split(':').length !== 2) {
        sendJSONresponse(res, 401, {
            message: 'Authentication failed. Makes sure that you insert your username and password in the Authorization header split by a colon'
        });
        return;
    }
    const usernamePassword = req.headers.authorization.split(':');
    const username = usernamePassword[0];
    const password = usernamePassword[1];
    
    User.findOne({
        username
    }, (err, user) => {
        if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }
        if (!user) {
            sendJSONresponse(res, 401, {
                message: 'Authentication failed. User not found.'
            });
            return;
        }
        if (!user.validPassword(password)) {
            sendJSONresponse(res, 401, {
                message: 'Authentication failed. Wrong password.'
            });
            return;
        }
        let token = user.generateJwt();
        sendJSONresponse(res, 200, {
            token: token
        });
    });
}
