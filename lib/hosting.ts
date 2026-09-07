/** Build-time settings shared by the server and GitHub Pages versions. */
export const staticHosting = process.env.NEXT_PUBLIC_STATIC_HOST === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function assetPath(path: string) {
  return `${basePath}${path}`;
}
