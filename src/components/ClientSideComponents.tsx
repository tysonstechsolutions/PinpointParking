'use client';

import dynamic from 'next/dynamic';

// Lazy load non-critical client-side components to improve initial page load
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { ssr: false }
);

const PWAInstallPrompt = dynamic(() => import('@/components/PWAInstallPrompt'), {
  ssr: false,
});

/**
 * Client-side components wrapper
 * Bundles all non-critical client components that don't need SSR
 * This allows lazy loading while keeping the root layout as a Server Component
 */
export default function ClientSideComponents() {
  return (
    <>
      <ChatWidget />
      <ServiceWorkerRegistration />
      <PWAInstallPrompt />
    </>
  );
}
