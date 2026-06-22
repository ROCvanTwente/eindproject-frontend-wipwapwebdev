export interface JwtClaims {
  PasswordChanged?: string;
  RequiresAccountSetup?: string;
  UserName?: string;
  email?: string;
  sub?: string;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length < 3) {
      throw new Error('Token is malformed. Expected header.payload.signature.');
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT payload.', error);
    return null;
  }
}

export function getPasswordChangeRequirement(token: string): boolean {
  const decoded = decodeJwt(token);
  return String(decoded?.PasswordChanged).toLowerCase() === 'false';
}
