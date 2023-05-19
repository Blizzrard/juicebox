function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }

  next();
}

function requireActiveUser(req, res, next) {
  if (!req.user.active) {
    next({
      name: "Inactive account",
      message: "Please activate your account to make changes",
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};
