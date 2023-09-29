/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */

class User {

  static async register({username, password, first_name, last_name, phone}) {
    // Hash the user's password using bcrypt for security.
    let hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // Define the SQL query for inserting a new user into the 'users' table.
    const sqlQuery = `
    INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
    VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
    RETURNING username, password, first_name, last_name, phone`;

    // Execute the SQL query with the provided user data.
    const result = await db.query(sqlQuery, [username, hashedPw, first_name, last_name, phone]);

    // Return the newly created user's information.
    const newUser = result.rows[0];
    return newUser;
  }

  static async authenticate(username, password) {
    // Define the SQL query to retrieve the password hash for the given username
    const sqlQuery = `
    SELECT password FROM users
    WHERE username = $1`

    // Execute the SQL query with the provided username as a parameter
    const result = await db.query(sqlQuery, [username]);

    // Retrieve the user's password hash from the query result
    let user = result.rows[0];

    // Check if a user with the provided username exists and if the password matches
    // (using bcrypt's compare function)
    return user && await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    // Define the SQL query to update the last login timestamp for the user
    const sqlQuery = `
    UPDATE users
    SET last_login_at = current_timestamp
    WHERE username = $1
    RETURNING username`

    // Execute the SQL query with the provided username as a parameter
    const result = await db.query(sqlQuery, [username]);

    // Check if a user with the provided username was found and updated
    if (!result.rows[0]) {
      // If no user was found, throw a 404 Not Found error
      throw new ExpressError(`No user of ${username} found`, 404);
    }

  }

  static async all() {

    // Define the SQL query to select basic user information for all users, ordered by username
    const sqlQuery = `
    SELECT username, first_name, last_name, phone
    FROM users
    ORDER BY username`

    // Execute the SQL query to retrieve the user data
    const result = await db.query(sqlQuery);

    // Return an array of user objects with basic information
    return result.rows;
  }

  static async get(username) {

    // Define the SQL query to select detailed user information for a specific user by their username
    const sqlQuery = `
    SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username = $1`

    // Execute the SQL query with the provided username as a parameter
    const result = await db.query(sqlQuery,[username]);

    // Check if a user with the provided username was found
    if(!result.rows[0]) {
      // If no user was found, throw a 404 Not Found error
      throw new ExpressError(`No user of ${username} found`, 404);
    }
    // Return the user object with detailed information
    return result.rows[0];
  }

  static async messagesFrom(username) {

    // Define the SQL query to select messages sent from a specific user by their username
    const sqlQuery = `
    SELECT m.id, m.to_username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
    FROM messages AS m
    JOIN users AS u ON m.to_username = u.username
    WHERE from_username = $1`

    // Execute the SQL query with the provided username as a parameter
    const result = await db.query(sqlQuery,[username]);

    // Check if any messages were sent by the user
    if(!result.rows[0]) {
      // If no messages were found, throw a 404 Not Found error
      throw new ExpressError('No messages found', 404)
    }

    // Transform the query result into an array of message objects with specific properties
    return result.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }

  static async messagesTo(username) {

    // Define the SQL query to select messages sent to a specific user by their username
    const sqlQuery = `
    SELECT m.id, m.from_username, u.first_name, u.last_name, u.phone, m.body, m.sent_at, m.read_at
    FROM messages AS m
    JOIN users AS u ON m.from_username = u.username
    WHERE to_username = $1`

    // Execute the SQL query with the provided username as a parameter
    const result = await db.query(sqlQuery,[username]);

    // Check if any messages were sent to the user
    if(!result.rows[0]) {
      // If no messages were found, throw a 404 Not Found error
    throw new ExpressError('No messages found', 404);
      throw new ExpressError('No messages found', 404)
    }

    // Transform the query result into an array of message objects with specific properties
    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }
}


module.exports = User;