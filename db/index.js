const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client({
  user: "postgres",
  password: "postgres",
  database: "juicebox_dev",
});

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
      FROM users;
    `
  );

  return rows;
}

async function createUser({ username, password }) {
  try {
    const result = await client.query(
      `
        INSERT INTO users(username, password) 
        VALUES($1, $2) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `,
      [username, password]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

// and export them
module.exports = {
  client,
  getAllUsers,
  createUser,
};
