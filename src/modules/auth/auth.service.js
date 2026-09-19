import { isEmailExist } from "../../utils/checkEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import Session from "../../db/models/session.model.js";
import {
  createSession,
  findActiveSession,
  revokeSession,
} from "../session/session.service.js";
import { welcomeEmailTemplate } from "../../services/email/templates/welcome.template.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import User from "../../db/models/user.model.js";
import { sendEmail } from "../../services/email/email.service.js";

export const RegisterUserService = async (body) => {
  const { firstName, lastName, email, password, gender, age } = body;

  await isEmailExist(email);

  const hashedPassword = await hashPassword(password);

  const data = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
    age,
  };

  let user;

  try {
    user = await User.create(data);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new Error("Email already exists", {
        cause: {
          status: 409,
        },
      });
    }

    throw error;
  }

  sendEmail({
    to: user.email,
    subject: "Welcome to Sarahah App",
    html: welcomeEmailTemplate({
      name: user.fullName,
      email: user.email,
    }),
  }).catch((error) => {
    console.error("Welcome email failed:", error);
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: getTokenExpiration(refreshToken),
  });

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      gender: user.gender,
      age: user.age,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const LoginUserService = async (body) => {
  const { email, password } = body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Email or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw new Error("Email or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: getTokenExpiration(refreshToken),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const RefreshTokenService = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const session = await findActiveSession(refreshToken, payload.sub);

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  await revokeSession(session);

  const accessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken: newRefreshToken,
    expiresAt: getTokenExpiration(newRefreshToken),
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const LogoutService = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await Session.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};
