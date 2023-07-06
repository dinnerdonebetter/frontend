import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document(): JSX.Element {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="The best dang lil' cookin' website on the internet!" />

        <Script
          id="mermaid-js"
          src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
          strategy="beforeInteractive"
          onLoad={() => console.log('mermaid.js loaded')}
        />
        <Script
          id="mermaid-js-init"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `mermaid.initialize({startOnLoad: true});`,
          }}
          strategy="afterInteractive"
          onLoad={() => console.log('mermaid initiation code loaded')}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
