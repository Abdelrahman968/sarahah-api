import {
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../../../config/env.config.js";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export const getGithubAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: "read:user user:email",
  });

  return `${GITHUB_AUTH_URL}?${params}`;
};

export const getGithubUser = async (code) => {
  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: GITHUB_CALLBACK_URL,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error("Failed to get GitHub access token", {
      cause: {
        status: 401,
      },
    });
  }

  const userResponse = await fetch(GITHUB_USER_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const user = await userResponse.json();

  if (!userResponse.ok) {
    throw new Error("Failed to get GitHub user", {
      cause: {
        status: 401,
      },
    });
  }

  const emailsResponse = await fetch(GITHUB_EMAILS_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const emails = await emailsResponse.json();

  if (!emailsResponse.ok) {
    throw new Error("Failed to get GitHub emails", {
      cause: {
        status: 401,
      },
    });
  }

  const primaryEmail = emails.find((email) => email.primary && email.verified);

  if (!primaryEmail) {
    throw new Error("No verified primary GitHub email found", {
      cause: {
        status: 400,
      },
    });
  }

  return {
    providerAccountId: user.id.toString(),
    email: primaryEmail.email,
    emailVerified: primaryEmail.verified,
    userName: user.login,
    name: user.name,
    avatar: user.avatar_url,
  };
};
