import { UserProvider } from '../src/UserContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>

      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Forum&family=Mukta:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="UJustBe" />
        <title>UJustBe Unniverse</title>
      </Head>

      {/* Render the main component */}
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
