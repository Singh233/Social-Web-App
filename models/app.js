const mongoose = require("mongoose");

const { Schema } = mongoose;

const appSchema = new Schema({
  totalUsers: {
    type: Number,
    default: 0,
  },
});

const App = mongoose.model("App", appSchema);
module.exports = App;
