/* eslint-disable no-param-reassign */
const fs = require("fs");
const path = require("path");

const env = require("./environment");

module.exports = (app) => {
  app.locals.assetPath = function (filePath) {
    if (env.name === "development") {
      return `/${filePath}`;
    }
    return `/${
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../public/assets/rev-manifest.json")
        )
      )[filePath]
    }`;
  };
};
