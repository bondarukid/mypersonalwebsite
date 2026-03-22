import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64 || !/^[0-9a-fA-F]+$/.test(key)) {
    throw new Error(
      "ENCRYPTION_KEY must be 32 bytes (64 hex chars). Generate: openssl rand -hex 32"
    )
  }
  return Buffer.from(key, "hex")
}

export function encryptCredentials(plaintext: string): string {
  if (!plaintext) return ""
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decryptCredentials(encrypted: string): string {
  if (!encrypted) return ""
  const key = getEncryptionKey()
  const data = Buffer.from(encrypted, "base64")
  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted credentials format")
  }
  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })
  decipher.setAuthTag(authTag)
  return decipher.update(ciphertext) + decipher.final("utf8")
}
