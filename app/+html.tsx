import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const SITE_NAME = "Esquel Ahorra";
const DEFAULT_DESCRIPTION =
  "Esquel Ahorra: compará precios en comercios de Esquel y encontrá las mejores ofertas.";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
        <ScrollViewStyleReset />
        <title>{SITE_NAME}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
