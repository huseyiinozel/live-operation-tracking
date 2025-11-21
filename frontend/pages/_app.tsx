import '@/app/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const publicPaths = ['/login', '/register'];
      const user = getCurrentUser();

      if (!user && !publicPaths.includes(router.pathname)) {
        router.push('/login');
      }
    }
  }, [router.pathname]);

  return <Component {...pageProps} />;
}

