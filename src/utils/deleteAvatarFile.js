import fs from "node:fs/promises";

const deleteAvatarFile = async (path) => {
  try {
    await fs.unlink(path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

export default deleteAvatarFile;
