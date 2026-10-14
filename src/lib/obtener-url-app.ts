/**
 * Resuelve la URL base pública de la app según el entorno de ejecución.
 *
 * Prioridad:
 * - Preview (Vercel): la URL del deployment que originó la solicitud
 *   (`VERCEL_URL`). Si falta, falla de forma controlada: nunca cae a
 *   `NEXT_PUBLIC_APP_URL`, que en Preview apuntaría a producción.
 * - Producción (Vercel): `NEXT_PUBLIC_APP_URL`, validada como URL HTTPS.
 * - Desarrollo local (no desplegado o `vercel dev`): `NEXT_PUBLIC_APP_URL`
 *   o `http://localhost:3000`.
 *
 * Nunca usa `localhost` ni una URL de Preview como fallback en un entorno
 * desplegado. El mensaje de error no incluye secretos, tokens ni enlaces.
 */

const URL_LOCAL = "http://localhost:3000";

function normalizarUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function esUrlHttpsValida(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function obtenerUrlApp(): string {
  // production | preview | development (inyectada por Vercel)
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ? normalizarUrl(process.env.NEXT_PUBLIC_APP_URL)
    : undefined;
  const desplegado = Boolean(process.env.VERCEL);

  if (vercelEnv === "preview") {
    if (!vercelUrl) {
      throw new Error(
        "No se pudo resolver la URL base en Preview: VERCEL_URL no está disponible.",
      );
    }
    return `https://${vercelUrl}`;
  }

  if (vercelEnv === "production") {
    if (!appUrl || !esUrlHttpsValida(appUrl)) {
      throw new Error(
        "No se pudo resolver la URL base en Producción: NEXT_PUBLIC_APP_URL debe ser una URL HTTPS válida.",
      );
    }
    return appUrl;
  }

  const esEntornoLocal = vercelEnv === "development" || !desplegado;
  if (esEntornoLocal) {
    return appUrl ?? URL_LOCAL;
  }

  // Desplegado sin `VERCEL_ENV` reconocido: exigir una URL HTTPS válida.
  if (!appUrl || !esUrlHttpsValida(appUrl)) {
    throw new Error(
      "No se pudo resolver la URL base desplegada: definí NEXT_PUBLIC_APP_URL como URL HTTPS válida.",
    );
  }
  return appUrl;
}
