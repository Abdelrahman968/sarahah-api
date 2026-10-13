import { OAuth2Client } from "google-auth-library";
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../../../config/env.config.js";

const googleOAuthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

export const getGoogleAuthUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
};

export const getGoogleUser = async (code) => {
  const { tokens } = await googleOAuthClient.getToken(code);

  googleOAuthClient.setCredentials(tokens);

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    providerAccountId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    firstName: payload.given_name,
    lastName: payload.family_name,
    name: payload.name,
    avatar: payload.picture,
  };
};
