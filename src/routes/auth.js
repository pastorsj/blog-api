import mongoose from 'mongoose';
var User = mongoose.model('User');

var sendJSONresponse = (res, status, content) => {
    res.status(status);
    res.json(content);
};

export function register(req, res) {
    if (!req.body.username || !req.body.name ||
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
    user.first = req.body.first;
    user.last = req.body.last;

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
    User.findOne({
        username: req.body.username
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
        if (!user.validPassword(req.body.password)) {
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
