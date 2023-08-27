/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
const User = require("../models/user");
const Friendships = require("../models/friendship");
const Post = require("../models/post");
const { deleteFile, uploadImage } = require("../helper/imageUpload");
const ChatRoom = require("../models/chatRoom");
const App = require("../models/app");

module.exports.profile = async function (request, response) {
  const user = await User.findById(request.params.id);

  if (!user) {
    request.flash("error", "User not found");
    return response.redirect("back");
  }

  const followers = await Friendships.find({ to_user: user._id });
  const following = await Friendships.find({ from_user: user._id });
  const posts = await Post.find({ user: user._id }).sort("-createdAt");
  const savedPosts = [];
  // check if the user is same as the logged in user
  if (request.user.id === user.id) {
    await Promise.all(
      user.savedPosts.map(async (savedPost) => {
        const post = await Post.findById(savedPost);
        if (post) {
          savedPosts.push(post);
        }
      })
    );

    // sort the posts in descending order of time
    savedPosts.sort((a, b) => b.createdAt - a.createdAt);
  }

  const followersCount = followers.reduce(
    (acc, follower) => (follower.status === "accepted" ? acc + 1 : acc),
    0
  );
  const followingCount = following.reduce(
    (acc, follower) => (follower.status === "accepted" ? acc + 1 : acc),
    0
  );

  return response.render("user_profile.ejs", {
    title: "Profile",
    profile_user: user,
    followers: followers,
    following: following,
    user_posts: posts,
    friends: followers,
    followersCount: followersCount,
    followingCount: followingCount,
    savedPosts,
  });
};

module.exports.editProfile = async function (request, response) {
  const user = await User.findById(request.params.id);

  if (!user) {
    request.flash("error", "User not found");
    return response.redirect("back");
  }

  const friends = Friendships.find({ to_user: user._id });

  if (!friends) {
    request.flash("error", "Error finding friends");
    return response.redirect("back");
  }

  return response.render("user_edit_profile.ejs", {
    title: "Profile",
    profile_user: user,
    friends: friends,
  });
};

module.exports.update = async function (request, response) {
  try {
    if (request.user.id !== request.params.id) {
      request.flash("error", "Unauthorized");
      return response.redirect("back");
    }

    const { file } = request;
    const user = await User.findById(request.params.id);

    user.name = request.body.name;
    user.email = request.body.email;

    let imageUrl = null;
    try {
      imageUrl = await uploadImage("sanam_users_avatar", file);
      // check and delete the previous avatar of user
      if (user.avatar) {
        await deleteFile("sanam_users_avatar", user.avatar);
      }
    } catch (error) {
      console.log(error);
    }

    if (imageUrl) {
      // this is saving the path of the uploaded file into the field in the user
      user.avatar = imageUrl;
    }
    user.save();

    request.flash("success", "Successfully updated profile!");
    return response.redirect("back");
  } catch (error) {
    request.flash("error", "Something went wrong!");
    return response.status(401).send("Unauthorized");
  }
};

// render sign up page
module.exports.signUp = function (request, response) {
  if (request.isAuthenticated()) {
    return response.redirect("/");
  }
  return response.render("user_sign_up.ejs", {
    title: "SanamSocial | Sign Up",
  });
};

// render sign in page
module.exports.signIn = function (request, response) {
  if (request.isAuthenticated()) {
    return response.redirect("/home");
  }
  return response.render("home.ejs", {
    title: "SanamSocial | Sign In",
  });
};

// get the sign up data
module.exports.create = async function (request, response) {
  if (request.body.password !== request.body.confirm_password) {
    request.flash("error", "Passwords do not match!");
    return response.redirect("back");
  }

  const user = await User.findOne({ email: request.body.email });
  const appData = await App.find({});
  appData[0].totalUsers += 1;
  await appData[0].save();

  if (!user) {
    const newUser = await User.create({
      ...request.body,
      platformRank: appData[0].totalUsers,
    });

    if (!newUser) {
      request.flash("error", "Error creating user!");
      return response.redirect("back");
    }
    // flash message
    request.flash("success", "Account created successfully!");
    return response.redirect("/");
  }

  // flash message
  request.flash("error", "User already exists!");
  return response.redirect("back");
};

// get the sign in data

module.exports.createSession = function (request, response) {
  request.flash("success", "Logged in Successfully");

  return response.redirect("/home");
};

module.exports.destroySession = function (request, response) {
  request.logout(function (error) {
    if (error) {
      request.flash("error", "Error logging out!");
    }
  });

  request.flash("success", "You have logged out!");
  return response.redirect("/users/sign-in-up");
};

module.exports.search = async function (request, response) {
  const { search } = request.query;

  if (!search || typeof search !== "string") {
    return response.status(400).send("Invalid search query");
  }

  const regex = new RegExp(search, "i"); // i is for case insensitive search
  const users = await User.find({ name: regex });

  return response.status(200).json({
    message: "List of users",
    users,
  });
};
