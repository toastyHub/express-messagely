const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");


// Route for user login (POST /login)
router.post("/login", async (req, res, next) => {
    try {
        // Step 1: Extract the username and password by destructuring the request body
        let {username, password} = req.body;
        // Step 2: Check if the provided username and password are valid
        let isAuthenticated = await User.authenticate(username, password)

        if (isAuthenticated) {
            // Step 3: If authentication is successful, create a JSON Web Token (JWT)
            let token = jwt.sign({username}, SECRET_KEY);
            // Step 4: Update the user's last login timestamp
            User.updateLoginTimestamp(username);
            // Step 5: Return a JSON response with the JWT token
            return res.json({token});
        } else {
            // Step 6: If authentication fails, throw an error
            throw new ExpressError("Invalid username or password", 400);
        }
    } catch (err) {
        // Step 7: Handle any errors that occur during login
        return next(err); // Pass the error to the Express error handling middleware
    }
});

// Route for user registration (POST /register)
router.post("/register", async (req, res, next) => {
    try {
        // Step 1: Register a new user using the User model's "register" method
        let {username} = await User.register(req.body);
        // Step 2: Create a JSON Web Token (JWT) containing the username
        let token = jwt.sign({username}, SECRET_KEY);
        // Step 3: Update the user's last login timestamp
        User.updateLoginTimestamp(username);
        // Step 4: Return a JSON response with the JWT token
        return res.json({token})
    } catch (err) {
        // Step 5: Handle any errors that occur during registration
        return next(err) // Pass the error to the Express error handling middleware
    }
})

module.exports = router;