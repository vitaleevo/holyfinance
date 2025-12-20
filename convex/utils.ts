import { v } from "convex/values";

/**
 * Encrypts a string using a simple approach for Convex environment.
 * In a real-world production app, use standard AES-256-GCM with a key from environment variables.
 * For this implementation, we use a consistent method suitable for the platform.
 */
const SECRET_KEY = process.env.ENCRYPTION_KEY || "holy-finance-super-secret-key-2025";

export function encrypt(text: string): string {
    const key = SECRET_KEY;
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += charCode.toString(16).padStart(2, '0');
    }
    return result;
}

export function decrypt(hex: string): string {
    const key = SECRET_KEY;
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        const charCode = parseInt(hex.substring(i, i + 2), 16) ^ key.charCodeAt((i / 2) % key.length);
        result += String.fromCharCode(charCode);
    }
    return result;
}
