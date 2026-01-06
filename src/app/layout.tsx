import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PavingChatbot from "@/components/PavingChatbot";

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
    default: "Pinpoint Parking | Asphalt Paving & Sealcoating in Mount Vernon, IL | Southern Illinois",
    template: "%s | Pinpoint Parking",
  },
  description: "Pinpoint Parking provides professional asphalt paving, sealcoating, line striping, crack filling, and pothole repair in Mount Vernon, IL and throughout Southern Illinois. Free estimates! Call 618-214-7656.",
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
    title: "Pinpoint Parking | Asphalt Paving & Sealcoating in Southern Illinois",
    description: "Professional asphalt paving, sealcoating, and pavement maintenance serving Mount Vernon and a 45-mile radius in Southern Illinois. Free estimates!",
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
    title: "Pinpoint Parking | Asphalt Paving & Sealcoating",
    description: "Professional asphalt paving, sealcoating, and pavement maintenance in Mount Vernon, IL and Southern Illinois. Free estimates!",
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
      </head>
      <body className={`${oswald.variable} ${sourceSans.variable}`} style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>
        <Header />
        <main>{children}</main>
        <Footer />
        <PavingChatbot />
      </body>
    </html>
  );
}
