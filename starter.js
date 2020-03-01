require("@babel/register")({
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          esmodules: true
        }
      }
    ]
  ]
});

// Import the rest of our application.
module.exports = require("./app.js");
