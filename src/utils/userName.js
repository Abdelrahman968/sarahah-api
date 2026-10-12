export const generateUsernameBase = (firstName, lastName) => {
  return `${firstName}${lastName}`.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
};
