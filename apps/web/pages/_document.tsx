import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

const apiServiceURL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.dinnerdonebetter.dev';

export default function Document(): JSX.Element {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="The best dang lil' cookin' website on the internet!" />

        <Script
          src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
          strategy="beforeInteractive"
          onLoad={() => console.log('mermaid.js loaded')}
        />
        <Script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `mermaid.initialize({startOnLoad: true});`,
          }}
          strategy="afterInteractive"
          onLoad={() => console.log('mermaid initiation code loaded')}
        />

        <Script
          src={`${apiServiceURL}/wasm/exec.js`}
          strategy="beforeInteractive"
          onLoad={() => console.log('exec.js loaded')}
        />
        <Script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              const go = new Go();
              WebAssembly.instantiateStreaming(fetch("${apiServiceURL}/wasm/helpers"), go.importObject).then((result) => {
                  go.run(result.instance);

                  window.renderRecipeToMermaid = renderRecipeToMermaid;
              });
          `,
          }}
          strategy="afterInteractive"
          onLoad={() => console.log('wasm code loaded')}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
