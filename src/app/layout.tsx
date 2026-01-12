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
    default: "#1 Asphalt Paving Mount Vernon IL ★★★★★ FREE Quote Today | Pinpoint Parking",
    template: "%s | Pinpoint Parking",
  },
  description: "⭐ 5-Star Rated Asphalt Contractor in Mount Vernon IL. Get your FREE quote in 24hrs! Driveways from $3/sq ft. ✓ Licensed ✓ Insured ✓ 100% Satisfaction Guarantee. Call (618) 214-7656 Now!",
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
    "commercial paving Southern Illinois",
    "best asphalt company Mount Vernon",
    "cheap driveway paving Southern IL"
  ],
  authors: [{ name: "Pinpoint Parking", url: "https://pinpointparking.net" }],
  creator: "Pinpoint Parking",
  publisher: "Pinpoint Parking",
  verification: {
    google: "eLdwuihfM48rnvIYtHCf1zR54Os4u0qUvR2kW_CVuM0",
  },
  openGraph: {
    title: "🏆 #1 Rated Asphalt Paving in Mount Vernon IL - FREE Quotes in 24hrs",
    description: "⭐⭐⭐⭐⭐ Southern Illinois' Most Trusted Paving Contractor. Driveways from $3/sq ft. Licensed, Insured & 100% Satisfaction Guaranteed. Get Your FREE Quote Today!",
    type: "website",
    url: "https://pinpointparking.net",
    siteName: "Pinpoint Parking",
    locale: "en_US",
    images: [
      {
        url: "/media/parking-lot-aerial.jpg",
        width: 1200,
        height: 630,
        alt: "Pinpoint Parking - Professional Asphalt Paving in Southern Illinois",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🏆 #1 Asphalt Paving Mount Vernon IL - Get FREE Quote Now!",
    description: "⭐ 5-Star Rated! Driveways from $3/sq ft. Licensed & Insured. 100% Satisfaction Guaranteed. Same-Week Scheduling. Call (618) 214-7656",
    images: ["/media/parking-lot-aerial.jpg"],
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
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pinpoint Parking",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5C518",
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
  "image": "https://pinpointparking.net/media/parking-lot-aerial.jpg",
  "logo": "https://pinpointparking.net/favicon.svg",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Mount Vernon",
    "addressRegion": "IL",
    "postalCode": "62864",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.3173",
    "longitude": "-88.9031"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "47",
    "reviewCount": "47"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Mike T."
      },
      "datePublished": "2025-11-15",
      "reviewBody": "Excellent work on our parking lot. Professional crew, fair pricing, and they finished ahead of schedule. Highly recommend!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Sarah K."
      },
      "datePublished": "2025-10-22",
      "reviewBody": "Best driveway contractor in Southern Illinois. Got a quote within hours and they started the next week. Driveway looks amazing!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    },
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "Jim R."
      },
      "datePublished": "2025-09-18",
      "reviewBody": "Used them for sealcoating and line striping at my business. Very professional, great communication, and competitive prices.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }
  ],
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
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Asphalt Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Asphalt Paving",
          "description": "New driveways and parking lots"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Sealcoating",
          "description": "Protective asphalt sealing"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Line Striping",
          "description": "Parking lot striping and markings"
        }
      }
    ]
  },
  "priceRange": "$$",
  "paymentAccepted": "Cash, Credit Card, Check",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "07:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/pinpointparking",
    "https://www.google.com/maps?cid=YOUR_GOOGLE_CID"
  ]
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
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
