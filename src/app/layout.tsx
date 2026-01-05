import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  title: {
    default: "Pinpoint Parking | Asphalt Paving & Sealcoating in Mount Vernon, IL | Southern Illinois",
    template: "%s | Pinpoint Parking",
  },
  description: "Pinpoint Parking provides professional asphalt paving, sealcoating, line striping, crack filling, and pothole repair in Mount Vernon, IL and throughout Southern Illinois. Free estimates! Call 618-214-7656.",
  keywords: "asphalt paving Mount Vernon IL, sealcoating Southern Illinois, parking lot striping, crack filling, pothole repair, driveway paving",
  authors: [{ name: "Pinpoint Parking" }],
  verification: {
    google: "eLdwuihfM48rnvIYtHCf1zR54Os4u0qUvR2kW_CVuM0",
  },
  openGraph: {
    title: "Pinpoint Parking | Asphalt Paving & Sealcoating in Southern Illinois",
    description: "Professional asphalt paving, sealcoating, and pavement maintenance serving Mount Vernon and a 45-mile radius in Southern Illinois.",
    type: "website",
    url: "https://pinpointparking.net",
    siteName: "Pinpoint Parking",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${sourceSans.variable}`} style={{ fontFamily: 'var(--font-source-sans), sans-serif' }}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
