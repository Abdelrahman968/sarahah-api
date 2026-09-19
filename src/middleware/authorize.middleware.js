export const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(
        new Error("Authentication required", {
          cause: { status: 401 },
        }),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new Error(`You are not authorized to perform this action`, {
          cause: { status: 403 },
        }),
      );
    }

    next();
  };
};
