const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64Decode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');

  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of normalized) {
    if (char === '=') break;
    const index = BASE64_CHARS.indexOf(char);
    if (index === -1) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

/**
 * Hermes has no built-in `atob`, so JWT payloads (base64url-encoded) are
 * decoded manually here instead of relying on a browser global.
 */
export function decodeJwtPayload<T = any>(token: string): T {
  const base64Url = token.split('.')[1];
  if (!base64Url) {
    throw new Error('Invalid token');
  }
  return JSON.parse(base64Decode(base64Url));
}
