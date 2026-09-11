/** Build-time settings shared by the server and GitHub Pages versions. */
export const staticHosting = process.env.NEXT_PUBLIC_STATIC_HOST === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// A static Pages build needs the URL of a separately hosted contact API.
// This is a public endpoint, never a mail-service API key.
export const contactEndpoint =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim() ||
  (staticHosting ? '' : '/api/contact');

export function assetPath(path: string) {
  return `${basePath}${path}`;
}
