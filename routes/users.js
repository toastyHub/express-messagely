const Router = require("express").Router;
const User = require("../models/user");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");

const router = new Router();


router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        // Step 1: Retrieve a list of all users with basic information using User.all
        allUsers = await User.all();
        // Step 2: Return a JSON response with the list of all users
        return res.json({allUsers});
    } catch (err) {
        // Step 3: Handle any errors that occur during user list retrieval or authorization
        return next(err); // Pass the error to the Express error handling middleware
    }
});


router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        // Step 1: Retrieve detailed information about the specified user using User.get
        let user = await User.get(req.params.username);
        // Step 2: Return a JSON response with the detailed information about the user
        return res.json({user});
    } catch (err) {
        // Step 3: Handle any errors that occur during user information retrieval or authorization
        return next(err) // Pass the error to the Express error handling middleware
    }
});


router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try {
        // Step 1: Extract the username from the route parameter
        let user = req.params.username
        // Step 2: Retrieve messages sent to the specified user using User.messagesTo
        let messages = await User.messagesTo(user);
        // Step 3: Return a JSON response with the array of messages sent to the specified user
        return res.json({messages});
    } catch (err) {
        // Step 4: Handle any errors that occur during message retrieval or authorization
        return next(err) // Step 4: Handle any errors that occur during message retrieval or authorization
    }
});


router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
    try {
        // Step 1: Extract the username from the route parameter
        let user = req.params.username
        // Step 2: Retrieve messages sent from the specified user using User.messagesFrom
        let messages = await User.messagesFrom(user);
        // Step 3: Return a JSON response with the array of messages sent from the specified user
        return res.json({messages});
    } catch (err) {
        // Step 4: Handle any errors that occur during message retrieval or authorization
        return next(err) // Pass the error to the Express error handling middleware
    }
});


module.exports = router;