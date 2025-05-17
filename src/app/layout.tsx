import Script from "next/script";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Orcward</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              Object.defineProperty(document, 'title', {
                set: function () {
                  console.warn('document.title edit');
                },
                get: function () {
                  return 'Orcward';
                },
                configurable: true
              });
            `,
          }}
        />
        <Script
          src="/index.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
