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

        // flash message
        req.flash('success', 'Following new friend!');

        return res.redirect('back');
        
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
        console.log(req.query.from);

        let friendship = await Friendship.findOneAndDelete({from_user: req.query.from});

        console.log(friendship);
            
        let user = await User.findById(req.query.from);


        
        const index = user.friendships.indexOf(req.query.from);
        if (index > -1) { // only splice array when item is found
            user.friendships.splice(index, 1); // 2nd parameter means remove one item only
        }


        user.save();

        // flash message
        req.flash('success', 'Unfollowed friend!');
        
        return res.redirect('back');
        

        
        
        
    } catch (error) {
        // flash message
        req.flash('error', 'Error in unfollowing friend!');
        return res.send(500, {
            message: error
        });
    }
}