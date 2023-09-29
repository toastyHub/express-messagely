/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    // Step 1: Extract the JWT token from the request body
    const tokenFromBody = req.body._token;
    // Step 2: Verify the JWT token's authenticity using the provided SECRET_KEY
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    // Step 3: Assign the payload (user information) to the 'req.user' property
    req.user = payload; // create a current user
    // Step 4: Continue processing the request by calling the 'next' middleware
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  // Step 1: Check if a user is authenticated (i.e., 'req.user' exists)
  if (!req.user) {
    // Step 2: If not authenticated, return a 401 Unauthorized error
    return next({ status: 401, message: "Unauthorized" });
  } else {
    // Step 3: If authenticated, continue processing the request
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    // Step 1: Check if the current user's username matches the requested username
    if (req.user.username === req.params.username) {
      // Step 2: If they match, continue processing the request
      return next();
    } else {
      // Step 3: If they don't match, return a 401 Unauthorized error
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // Step 4: Handle any errors that occur (e.g., if 'req.user' is undefined)
    // This can happen if the request is made without authentication
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
