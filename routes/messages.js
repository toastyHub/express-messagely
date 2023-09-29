const Router = require("express").Router;
const router = new Router();

const Message = require("../models/message");
const {ensureLoggedIn} = require("../middleware/auth");
const ExpressError = require("../expressError");


router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        // Step 1: Get the authenticated user's username from the request
        let username = req.user.username;
        // Step 2: Retrieve the message with the specified ID using Message.get
        let msg = await Message.get(req.params.id)
        // Step 3: Check if the authenticated user is authorized to access the message
        if (msg.to_user.username !== username && msg.from_user.username !== username) {
            // If the user is not authorized, throw a 401 Unauthorized error
            throw new ExpressError("Cannot read this message", 401);
        }
        // Step 4: Return a JSON response with the retrieved message
        return res.json({message: msg})
    } catch (err) {
        return next(err);
    }
})


router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
        // Step 1: Retrieve the sender's username from the authenticated user data
        let sender = req.user.username;
        // Step 2: Extract the recipient's username and message body from the request body
        let {to_username, body} = req.body;
        // Step 3: Create a new message using the Message.create method
        let msg = await Message.create({
        from_username: sender,
        to_username: to_username,
        body: body
    });
    // Step 4: Return a JSON response with the newly created message
    return res.json({message: msg});

    } catch (err) {
        // Step 5: Handle any errors that occur during message creation or authentication
        return next(err); // Pass the error to the Express error handling middleware
    }
});


router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    try {
        // Step 1: Get the authenticated user's username
        let username = req.user.username;
        // Step 2: Retrieve the message with the specified ID using Message.get
        let msg = await Message.get(req.params.id);
        // Step 3: Check if the authenticated user is authorized to mark the message as read
        if (msg.to_user.username !== username) {
            // If the user is not authorized, throw a 401 Unauthorized error
            throw new ExpressError("Cannot set this message to read", 401);
        }
        // Step 4: Mark the message as read using Message.markRead
        let message = await Message.markRead(req.params.id);
        // Step 5: Return a JSON response with the message that has been marked as read
        return res.json({message});
    } catch (err) {
        // Step 6: Handle any errors that occur during message marking or authorization
        return next(err); // Pass the error to the Express error handling middleware
    }
});

module.exports = router;