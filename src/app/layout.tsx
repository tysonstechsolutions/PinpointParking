import type { Metadata, Viewport } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pinpointparking.net'),
  title: {
    default: "Asphalt Paving Mount Vernon IL | FREE Quotes in 24hrs | Pinpoint Parking",
    template: "%s | Pinpoint Parking",
  },
  description: "Get your FREE asphalt estimate in 24 hours! Professional paving, sealcoating & repairs in Mount Vernon & Southern IL. 100% satisfaction guaranteed. Same-week scheduling available. Call (618) 214-7656",
  keywords: [
    "asphalt paving Mount Vernon IL",
    "sealcoating Southern Illinois",
    "parking lot striping",
    "crack filling",
    "pothole repair",
    "driveway paving Mount Vernon",
    "asphalt contractor Carbondale",
    "parking lot paving Marion IL",
    "asphalt repair Centralia",
    "commercial paving Southern Illinois"
  ],
  authors: [{ name: "Pinpoint Parking", url: "https://pinpointparking.net" }],
  creator: "Pinpoint Parking",
  publisher: "Pinpoint Parking",
  verification: {
    google: "eLdwuihfM48rnvIYtHCf1zR54Os4u0qUvR2kW_CVuM0",
  },
  openGraph: {
    title: "FREE Asphalt Paving Quotes | Mount Vernon & Southern IL | Pinpoint Parking",
    description: "Transform your driveway or parking lot! Get a FREE quote in 24 hours. Professional asphalt paving, sealcoating & repairs. 100% satisfaction guaranteed.",
    type: "website",
    url: "https://pinpointparking.net",
    siteName: "Pinpoint Parking",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pinpoint Parking - Professional Asphalt Paving in Southern Illinois",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FREE Asphalt Quotes in 24hrs | Mount Vernon IL | Pinpoint Parking",
    description: "Get a FREE estimate for your paving project! Professional asphalt paving, sealcoating & repairs. 100% satisfaction guaranteed. Call (618) 214-7656",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://pinpointparking.net",
  },
  category: "Business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pinpoint Parking",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://pinpointparking.net",
  "name": "Pinpoint Parking",
  "description": "Professional asphalt paving, sealcoating, line striping, crack filling, and pothole repair serving Mount Vernon, IL and Southern Illinois.",
  "url": "https://pinpointparking.net",
  "telephone": "+1-618-214-7656",
  "email": "pinpointparkingco@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Mount Vernon",
    "addressRegion": "IL",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.3173",
    "longitude": "-88.9031"
  },
  "areaServed": [
    { "@type": "City", "name": "Mount Vernon", "addressRegion": "IL" },
    { "@type": "City", "name": "Carbondale", "addressRegion": "IL" },
    { "@type": "City", "name": "Marion", "addressRegion": "IL" },
    { "@type": "City", "name": "Centralia", "addressRegion": "IL" },
    { "@type": "City", "name": "Herrin", "addressRegion": "IL" },
    { "@type": "City", "name": "Salem", "addressRegion": "IL" },
    { "@type": "City", "name": "Benton", "addressRegion": "IL" },
    { "@type": "City", "name": "West Frankfort", "addressRegion": "IL" },
    { "@type": "City", "name": "Du Quoin", "addressRegion": "IL" },
    { "@type": "City", "name": "Effingham", "addressRegion": "IL" },
    { "@type": "City", "name": "Harrisburg", "addressRegion": "IL" },
    { "@type": "City", "name": "Murphysboro", "addressRegion": "IL" },
    { "@type": "City", "name": "Carterville", "addressRegion": "IL" },
    { "@type": "City", "name": "Nashville", "addressRegion": "IL" },
    { "@type": "City", "name": "Fairfield", "addressRegion": "IL" }
  ],
  "serviceType": [
    "Asphalt Paving",
    "Sealcoating",
    "Line Striping",
    "Crack Filling",
    "Pothole Repair",
    "Parking Lot Maintenance",
    "Driveway Paving"
  ],
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "07:00",
    "closes": "18:00"
  }
};

// FAQ Schema - Shows expandable Q&As in Google search results (rich snippets)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does asphalt paving cost in Mount Vernon IL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Asphalt paving in Mount Vernon and Southern Illinois typically costs $3-$7 per square foot for residential driveways. Commercial projects vary based on size and site preparation. Contact Pinpoint Parking at (618) 214-7656 for a free, accurate quote."
      }
    },
    {
      "@type": "Question",
      "name": "How long does sealcoating last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Quality sealcoating typically lasts 2-3 years depending on traffic and weather exposure. We recommend sealcoating every 2-3 years to maximize your asphalt's lifespan and appearance."
      }
    },
    {
      "@type": "Question",
      "name": "When is the best time to pave or sealcoat in Southern Illinois?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The ideal season is late spring through early fall when temperatures are consistently above 50°F. In Southern Illinois, this typically means May through September for optimal results."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer free estimates for paving projects?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Pinpoint Parking offers 100% free estimates with no obligation. We can provide quotes within 24 hours using satellite imagery or schedule an on-site assessment. Call (618) 214-7656 or visit our website."
      }
    }
  ]
};

// Service Schema - Helps Google understand your services
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Asphalt Paving",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Pinpoint Parking"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "38.3173",
      "longitude": "-88.9031"
    },
    "geoRadius": "72420"
  },
  "description": "Professional asphalt paving, sealcoating, line striping, and pavement repairs for residential and commercial properties.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free estimates within 24 hours"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${oswald.variable} ${sourceSans.variable}`} style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>
        <Header />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
        <ServiceWorkerRegistration />
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
