const User = require('../models/user');
const Friendship = require('../models/friendship');


module.exports.add = async function(req, res) {
    try {


        let user1 = await User.findById(req.query.from);
        let user2 = await User.findById(req.query.to);


        let friendship = await Friendship.create({
            from_user: user1,
            to_user: user2
        });


        user1.friendships.push(friendship);
        user1.save();

        // find the to user name
        let toUserName = await User.findById(req.query.to);
        
        return res.status(200).json({
            message: "Request successful",
            success: true,
            data: {
                toUserName: toUserName.name,
            }
            
        });
        
    } catch (error) {
        // flash message
        req.flash('error', 'Error in following friend!');
        return res.send(500, {
            message: error
        });
    }
}

module.exports.remove = async function(req, res) {
    try {

        let friendship = await Friendship.findOneAndDelete({
            from_user: req.query.from,
            to_user: req.query.to
        });

            
        let user = await User.findById(req.query.from);


        if (friendship) {
            const index = user.friendships.indexOf(friendship._id);
            if (index > -1) { // only splice array when item is found
                user.friendships.splice(index, 1); // 2nd parameter means remove one item only
                console.log('friendship removed')
            }
        }


        user.save();

        // find the to user name
        let toUserName = await User.findById(req.query.to);
        
        return res.status(200).json({
            message: "Request successful",
            success: true,
            data: {
                toUserName: toUserName.name,
            }
            
        });
    } catch (error) {
        // flash message
        req.flash('error', 'Error in unfollowing friend!');
        return res.send(500, {
            message: error
        });
    }
}