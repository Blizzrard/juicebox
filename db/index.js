const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client({
  user: "postgres",
  password: "postgres",
  database: "juicebox_dev",
});

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active 
      FROM users;
    `
  );

  return rows;
}

async function createUser({ username, password, name, location }) {
  try {
    const result = await client.query(
      `
        INSERT INTO users(username, password, name, location) 
        VALUES($1, $2, $3, $4) 
        ON CONFLICT (username) DO NOTHING 
        RETURNING *;
      `,
      [username, password, name, location]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"= $${index + 1}`)
    .join(", ");
  if (setString.length === 0) {
    return;
  }
  console.log(setString);
  try {
    const result = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    return result;
  } catch (error) {}
}

async function createPost({ authorId, title, content }) {
  try {
    const result = await client.query(
      `
              INSERT INTO posts("authorId", title, content) 
              VALUES($1, $2, $3, $4) 
              ON CONFLICT (username) DO NOTHING 
              RETURNING *;
            `,
      [username, password, name, location]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"= $${index + 1}`)
    .join(", ");
  if (setString.length === 0) {
    return;
  }
  console.log(setString);
  try {
    const result = await client.query(
      `
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    return result;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `SELECT authorId, title, content
          FROM users;
        `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
        SELECT * FROM posts
        WHERE "authorId"=${userId};
      `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
    try {
        
} catch (error) {
        
    }
}

// and export them
module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
};
