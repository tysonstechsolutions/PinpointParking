import type { Metadata, Viewport } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientSideComponents from "@/components/ClientSideComponents";

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
    default: "Veteran-Owned Asphalt Paving Mount Vernon IL | Local Crew, Not a Middleman | Pinpoint Parking",
    template: "%s | Pinpoint Parking",
  },
  description: "🎖️ Disabled Army Veteran Owned. Local Mount Vernon crew—we do the work ourselves, no subcontractors. Meet the person paving your driveway. FREE quotes in 24hrs. Call (618) 214-7656",
  keywords: [
    "veteran owned asphalt paving Mount Vernon IL",
    "local paving contractor Southern Illinois",
    "sealcoating Southern Illinois",
    "parking lot striping",
    "crack filling",
    "pothole repair",
    "driveway paving Mount Vernon",
    "asphalt contractor Carbondale",
    "parking lot paving Marion IL",
    "asphalt repair Centralia",
    "commercial paving Southern Illinois",
    "veteran owned business Mount Vernon",
    "local asphalt company Southern IL"
  ],
  authors: [{ name: "Pinpoint Parking", url: "https://pinpointparking.net" }],
  creator: "Pinpoint Parking",
  publisher: "Pinpoint Parking",
  verification: {
    google: "eLdwuihfM48rnvIYtHCf1zR54Os4u0qUvR2kW_CVuM0",
  },
  openGraph: {
    title: "🎖️ Veteran-Owned Local Paving | Mount Vernon IL | We Do the Work Ourselves",
    description: "Disabled Army Veteran owned & operated. No middlemen, no subcontractors—our own local crew does your job. Meet the team paving your driveway. FREE quotes. Call (618) 214-7656",
    type: "website",
    url: "https://pinpointparking.net",
    siteName: "Pinpoint Parking",
    locale: "en_US",
    images: [
      {
        url: "/media/parking-lot-aerial.jpg",
        width: 1200,
        height: 630,
        alt: "Pinpoint Parking - Veteran-Owned Local Asphalt Paving in Southern Illinois",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎖️ Veteran-Owned Asphalt Paving Mount Vernon IL | Local Crew",
    description: "Disabled Army Veteran owned. We do the work ourselves—no middlemen. Meet your local paving crew in person. FREE quotes in 24hrs. Call (618) 214-7656",
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
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-48x48.svg', sizes: '48x48', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
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
  // Allow users to zoom for accessibility (WCAG 1.4.4)
  maximumScale: 5,
  userScalable: true,
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://pinpointparking.net/#organization",
  "name": "Pinpoint Parking",
  "description": "Disabled Army Veteran owned asphalt paving company in Mount Vernon, IL. We're a local crew that does the work ourselves—no middlemen, no subcontractors. Meet the person paving your driveway.",
  "url": "https://pinpointparking.net",
  "telephone": "+1-618-214-7656",
  "email": "pinpointparkingco@gmail.com",
  "image": "https://pinpointparking.net/media/parking-lot-aerial.jpg",
  "logo": "https://pinpointparking.net/favicon.svg",
  "founder": {
    "@type": "Person",
    "name": "Tyson",
    "jobTitle": "Disabled Army Veteran & Owner",
    "description": "Founder of Pinpoint Parking with hands-on experience in asphalt paving, sealcoating, and pavement maintenance throughout Southern Illinois."
  },
  "knowsAbout": ["Asphalt Paving", "Sealcoating", "Line Striping", "Crack Filling", "Pothole Repair"],
  "slogan": "Your Local Crew. Not a Middleman.",
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
      "datePublished": "2024-11-15",
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
      "datePublished": "2024-10-22",
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
      "datePublished": "2024-09-18",
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
    "https://www.facebook.com/pinpointparking"
  ]
};

// FAQ Schema - Shows expandable Q&As in Google search results (rich snippets)
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Pinpoint Parking a local company or a broker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We are 100% local. Pinpoint Parking is a disabled Army veteran owned company based in Mount Vernon, IL. We do ALL the work ourselves with our own crew—no subcontractors, no middlemen. When you hire us, you meet the actual people who will pave your driveway."
      }
    },
    {
      "@type": "Question",
      "name": "Is Pinpoint Parking veteran owned?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Pinpoint Parking is proudly owned and operated by a disabled Army veteran. We bring military discipline, attention to detail, and integrity to every paving project in Southern Illinois."
      }
    },
    {
      "@type": "Question",
      "name": "How much does asphalt paving cost in Mount Vernon IL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Asphalt paving in Mount Vernon and Southern Illinois typically costs $3-$7 per square foot for residential driveways. Because we do the work ourselves without middlemen, we can offer competitive pricing. Call (618) 214-7656 for a free quote."
      }
    },
    {
      "@type": "Question",
      "name": "Do you use subcontractors for paving work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Never. Our own trained local crew handles every project from start to finish. You'll meet the same people who give you the quote, do the work, and stand behind it. No surprises, no hand-offs to strangers."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer free estimates for paving projects?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We offer 100% free estimates with no obligation. We can provide quotes within 24 hours using satellite imagery or meet you in person for an on-site assessment. Call (618) 214-7656 or visit our website."
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
    "name": "Pinpoint Parking",
    "@id": "https://pinpointparking.net/#organization"
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
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "3",
    "highPrice": "7",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "3-7",
      "priceCurrency": "USD",
      "unitText": "per square foot"
    },
    "description": "Asphalt paving from $3-$7 per square foot. Free estimates within 24 hours."
  }
};

// HowTo Schema - For the process section
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Get Your Driveway or Parking Lot Paved",
  "description": "Simple 4-step process to get professional asphalt paving from Pinpoint Parking in Southern Illinois.",
  "totalTime": "P7D",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "2500-6000"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Free Consultation",
      "text": "Call us or fill out our form. We'll discuss your project and schedule a free on-site assessment.",
      "url": "https://pinpointparking.net/book"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Detailed Quote",
      "text": "We'll provide a comprehensive, transparent quote with all costs clearly explained.",
      "url": "https://pinpointparking.net/book"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Professional Installation",
      "text": "No subcontractors—our own trained team completes your project on schedule using quality materials.",
      "url": "https://pinpointparking.net/services/asphalt-paving"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Final Walkthrough",
      "text": "We review the completed work with you to ensure your complete satisfaction.",
      "url": "https://pinpointparking.net/contact"
    }
  ]
};

// Video Schema - For hero video (helps with video search results)
const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Pinpoint Parking - Professional Asphalt Paving in Southern Illinois",
  "description": "See our veteran-owned local crew in action. Pinpoint Parking provides professional asphalt paving, sealcoating, and line striping services throughout Southern Illinois.",
  "thumbnailUrl": "https://pinpointparking.net/media/parking-lot-aerial-2.jpg",
  "uploadDate": "2024-01-01",
  "contentUrl": "https://pinpointparking.net/media/hero-video.mp4",
  "embedUrl": "https://pinpointparking.net",
  "duration": "PT30S",
  "publisher": {
    "@type": "Organization",
    "name": "Pinpoint Parking",
    "logo": {
      "@type": "ImageObject",
      "url": "https://pinpointparking.net/favicon.svg"
    }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${oswald.variable} ${sourceSans.variable}`} style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>
        <Header />
        <main id="main-content" role="main" style={{ position: 'relative', overflow: 'hidden' }}>{children}</main>
        <Footer />
        <ClientSideComponents />
      </body>
    </html>
  );
}
