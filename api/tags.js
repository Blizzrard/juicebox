const express = require("express");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

const { getAllTags, getPostsByTagName } = require("../db");

tagsRouter.get("/", async (req, res) => {
  const users = await getAllTags();

  res.send({
    users,
  });
});

tagsRouter.get("/:tagName/posts", async (req, res, next) => {
  try {
    const allPosts = await getPostsByTagName(req.params.tagName);
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
