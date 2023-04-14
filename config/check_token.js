const User = require('../models/user');
const jwt = require('jsonwebtoken');

module.exports.checkToken = function (request, response, next) {
    let token = request.headers.authorization.split(' ')[1];
    if (token == null) {
        return response.sendStatus(401);
    }
    jwt.verify(token, 'codeial', function (error, decoded) {
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