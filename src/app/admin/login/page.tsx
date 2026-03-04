'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Redirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const expired = searchParams.get('expired');
    router.replace(expired ? '/login?expired=1' : '/login');
  }, [router, searchParams]);

  return null;
}

export default function AdminLoginRedirect() {
  return (
    <Suspense fallback={null}>
      <Redirector />
    </Suspense>
  );
}