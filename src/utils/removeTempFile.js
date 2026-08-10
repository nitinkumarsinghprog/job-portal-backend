const fs = require("fs/promises");

const removeTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // A missing file is expected when it was already removed after upload.
    if (error.code !== "ENOENT") {
      console.error("Unable to remove temporary upload:", error.message);
    }
  }
};

module.exports = removeTempFile;
