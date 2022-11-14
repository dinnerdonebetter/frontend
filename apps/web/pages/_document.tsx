import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(): JSX.Element {
  return (
    <Html lang="en">
      <Head>
        {/* eslint-disable react/no-string-refs */}
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" ref="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap"
          ref="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" ref="stylesheet" />
        <meta name="description" content="The best dang lil' cookin' website on the internet!" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
