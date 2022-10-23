import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" ref="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap"
          ref="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" ref="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}