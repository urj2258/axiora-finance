import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function hasUsers(): Promise<boolean> {
  const count = await db.users.count();
  return count > 0;
}

export async function createUser(username: string, password: string): Promise<void> {
  const hash = await hashPassword(password);
  await db.users.add({
    id: uuidv4(),
    username,
    password_hash: hash,
    created_at: new Date().toISOString()
  });
}

export async function verifyUser(password: string): Promise<boolean> {
  const hash = await hashPassword(password);
  const users = await db.users.toArray();
  // Simply check if any user matches this password hash for local single-user mode
  return users.some(u => u.password_hash === hash);
}

// Session management
export function setSessionActive() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('axiora_auth_token', 'active');
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('axiora_auth_token');
  }
}

export function isSessionActive(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('axiora_auth_token') === 'active';
  }
  return false;
}
