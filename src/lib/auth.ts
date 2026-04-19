const SECRET_KEY = process.env.JWT_SECRET || 'pitchvision-secret-key-2025';

export async function hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SECRET_KEY);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verify(password: string, hashedPassword: string): Promise<boolean> {
  const passwordHash = await hash(password);
  return passwordHash === hashedPassword;
}

export function createToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  const signature = btoa(
    JSON.stringify({ v: Buffer.from(`${header}.${body}.${SECRET_KEY}`).toString('hex') })
  );
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}
