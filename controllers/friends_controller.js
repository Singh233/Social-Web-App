const User = require('../models/user');
const Friendship = require('../models/friendship');


module.exports.add = async function(req, res) {
    try {


        let user1 = await User.findById(req.query.from);


        let user2 = await User.findById(req.query.to);


        console.log(user1);
        console.log(user2);


        let friendship = await Friendship.create({
            from_user: user1,
            to_user: user2
        });

        console.log(friendship);

        user1.friendships.push(friendship);
        user1.save();

        return res.redirect('back');
        
    } catch (error) {
        return res.send(500, {
            message: error
        });
    }
}

module.exports.remove = async function(req, res) {
    try {
        console.log(req.query.from);

        let friendship = await Friendship.findOneAndDelete({from_user: req.query.from});

        console.log(friendship);
            
        let user = await User.findById(req.query.from);

        console.log(user.friendships);

        
        const index = user.friendships.indexOf(req.query.from);
        if (index > -1) { // only splice array when item is found
            user.friendships.splice(index, 1); // 2nd parameter means remove one item only
        }


        user.save();
        
        return res.redirect('back');
        

        
        
        
    } catch (error) {
        return res.send(500, {
            message: error
        });
    }
}