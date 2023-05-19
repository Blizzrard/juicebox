const express = require("express");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});

const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.get("/", async (req, res) => {
  const users = await getAllTags();

  res.send({
    users,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  // read the tagname from the params
  console.log(req.params.tagName);
  try {
    const allPosts = await getPostsByTagName(req.params.tagName);
    console.log("hi mike");
    const posts = await allPosts.filter((post) => {
      return post.active || (req.user && post.author.id === req.user.id);
    });
    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;
