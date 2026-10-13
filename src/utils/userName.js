import userRepository from "../db/repository/user.repository.js";

export const generateUsernameBase = (firstName, lastName) => {
  return `${firstName}${lastName}`.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
};

export const generateUniqueUsername = async (firstName, lastName) => {
  const base = generateUsernameBase(firstName, lastName);

  let username = base;
  let counter = 1;

  while (
    await userRepository.findOne({
      userName: username,
    })
  ) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
};
