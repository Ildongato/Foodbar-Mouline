/** Server routes only. Never import this module from client components. */
export async function serverEnv() {
  try {
    const { env } = await import('cloudflare:workers');
    return env as unknown as Record<string, string | undefined>;
  } catch {
    return process.env;
  }
}
