export const requireVerifiedEmail = (req, _res, next) => {
  try {
    if (req.user.isVerified !== true) {
      throw new Error(
        "Email not verified, activate your account and try again.",
        {
          cause: { status: 401 },
        },
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
