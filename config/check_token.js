const User = require('../models/user');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');

module.exports.checkToken = function (request, response, next) {
    let token = request.headers.authorization.split(' ')[1];
    if (token == null) {
        return response.sendStatus(401);
    }
    jwt.verify(token, env.jwt_secret, function (error, decoded) {
        if (error) {
            return response.sendStatus(403);
        }
        User.findById(decoded._id, function (error, user) {
            if (error) {
                return response.sendStatus(403);
            }
            request.user = user;
            next();
        }
        );
    });
    

}