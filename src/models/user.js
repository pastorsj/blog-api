

import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { SECRET } from '../config/jwt.config';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    joinedDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    salt: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    }
});

function getAccessToken() {
    let expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + 1);
    expiresIn = parseInt(expiresIn.getTime() / 1000, 10);

    const accessToken = jwt.sign({
        _id: this._id,
        username: this.username,
        name: this.name,
        exp: expiresIn
    }, SECRET);

    return {
        accessToken,
        expiresIn
    };
}

function getRefreshToken() {
    const refreshToken = jwt.sign({
        _id: this._id
    }, SECRET);
    return refreshToken;
}

// These functions cannot be converted to arrow functions since the 'this' environment matters
userSchema.methods.setPassword = function setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function validPassword(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function generateJwt() {
    const { accessToken, expiresIn } = getAccessToken().bind(this);
    const refreshToken = getRefreshToken().bind(this);
    return {
        accessToken,
        expiresIn,
        refreshToken
    };
};

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
