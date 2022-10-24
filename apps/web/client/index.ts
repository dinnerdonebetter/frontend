import router from 'next/router';

import PrixFixeAPIClient from 'api-client';

const x = new PrixFixeAPIClient(process.env.NEXT_PUBLIC_ANALYTICS_ID || '');

x.configureRouterRejectionInterceptor(() => {
  // const destParam = new URLSearchParams(loc.search).get('dest');

  // router.push( '/login'
    // query: { dest: destParam ? destParam : encodeURIComponent(`${loc.pathname}${loc.search}`) },
  // );
});

export default x;