const User = require('../../../models/user');
const jwt = require('jsonwebtoken');
const { use } = require('passport');
const env = require('../../../config/environment');

module.exports.createSession = async function(request, response) {
    try {
        let user = await User.findOne({email: request.body.email});

        if (!user || user.password != request.body.password) {
            return response.json(422, {
                message: 'Invalid username or password!'
            });
        } 

        return response.json(200, {
            message: 'Sign in successfull, here is your token, please keep it safe!',
            data: {
                token: jwt.sign(user.toJSON(), env.jwt_secret, {expiresIn: '100000'})
            }
        })
    } catch (error) {
        console.log("******* ", error);
        return response.json(500, {
            message: "Internal Server Error"
        });
    }
    
}