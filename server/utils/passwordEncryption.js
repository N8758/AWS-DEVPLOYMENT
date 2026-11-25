const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

// Get encryption key from environment variable
const getKey = () => {
  if (!process.env.PASSWORD_ENCRYPTION_KEY) {
    throw new Error("PASSWORD_ENCRYPTION_KEY is not configured");
  }

  // Convert the environment secret into a fixed 32-byte key
  return crypto
    .createHash("sha256")
    .update(process.env.PASSWORD_ENCRYPTION_KEY)
    .digest();
};

// Encrypt plain password
const encryptPassword = (password) => {
  if (!password) {
    throw new Error("Password is required for encryption");
  }

  const iv = crypto.randomBytes(12);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Store: IV : AuthTag : EncryptedPassword
  return `${iv.toString("hex")}:${authTag.toString(
    "hex"
  )}:${encrypted}`;
};

// Decrypt encrypted password
const decryptPassword = (encryptedPassword) => {
  if (!encryptedPassword) {
    throw new Error("Encrypted password is required");
  }

  const parts = encryptedPassword.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted password format");
  }

  const [ivHex, authTagHex, encrypted] = parts;

  const key = getKey();

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(
    encrypted,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = {
  encryptPassword,
  decryptPassword,
};