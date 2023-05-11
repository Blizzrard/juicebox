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
              VALUES($1, $2, $3)
              RETURNING *;
            `,
      [authorId, title, content]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function createTags(tagList) {
  if (tagList.length === 0) {
    return;
  }
  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  const rayray = tagList.map((tagName, index) => `${tagName}`);
  try {
    const result = await client.query(
      `
    INSERT INTO tags (name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING;
    `,
      rayray
    );
    const returned = await client.query(
      `
      SELECT * FROM tags
      WHERE name
      IN (${selectValues});
    `,
      rayray
    );
    return returned.rows;
  } catch (error) {}
}

async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `,
      [postId, tagId]
    );
  } catch (error) {
    throw error;
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    
    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
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
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts;
    `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    return posts;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id 
      FROM posts 
      WHERE "authorId"=${userId};
    `);

    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );

    return posts;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
  } catch (error) {}
}

// and export them
module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  addTagsToPost,
  createTags,
  getAllPosts,
  createPost,
};
