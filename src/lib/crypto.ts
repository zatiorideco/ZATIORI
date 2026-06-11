import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM para el token de Instagram guardado en la DB.
// IG_TOKEN_ENCRYPTION_KEY: 32 bytes en hex (openssl rand -hex 32).

function clave() {
  const hex = process.env.IG_TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("IG_TOKEN_ENCRYPTION_KEY no configurada (32 bytes hex).");
  }
  return Buffer.from(hex, "hex");
}

/** Devuelve "iv.tag.cifrado" en base64. */
export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", clave(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, cifrado].map((b) => b.toString("base64")).join(".");
}

export function descifrar(payload: string): string {
  const [iv, tag, cifrado] = payload.split(".").map((s) => Buffer.from(s, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", clave(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(cifrado), decipher.final()]).toString("utf8");
}
