const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

const {
  getAllUsers,
  getUserByUsername,
  createUser,
  updateUser,
  getUserById,
  getPostsByUser,
  updatePost,
} = require("../db");

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign(
        { username: user.username, password: user.password, id: user.id },
        process.env.JWT_SECRET
      );
      res.send({ message: "you're logged in!", token: token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.delete("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    const posts = await getPostsByUser(req.user.id);

    if (user && user.id === req.user.id) {
      const updatedUser = await updateUser(user.id, { active: false });
      if (posts) {
        await posts.map((post) => updatePost(post.id, { active: false }));
      }

      res.send({ user: updatedUser });
    } else {
      next(
        user
          ? {
              name: "UnauthorizedUserError",
              message: "You cannot delete a user which is not yours",
            }
          : {
              name: "UserNotFoundError",
              message: "That user does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.patch("/:userId", requireUser, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    const updatedUser = await updateUser(user.id, { active: true });
    res.send({ user: updatedUser });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
