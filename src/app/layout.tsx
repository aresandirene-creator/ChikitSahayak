import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChikitsaHayak — AI-powered clinical intake",
  description: "ChikitsaHayak collects, organises and summarises a patient's medical history before they meet the doctor — using AI conversational history taking, multilingual document digitisation, AI-generated clinical summaries and ABDM/HIS integration.",
  keywords: ["ChikitsaHayak", "clinical intake", "AI healthcare", "ABDM", "ABHA", "FHIR", "Indian healthcare", "AYUSH", "electronic medical records"],
  authors: [{ name: "ChikitsaHayak" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ChikitsaHayak — AI-powered clinical intake",
    description: "Pre-consultation AI intake: history-taking, document digitisation, clinical summary, ABDM integration.",
    siteName: "ChikitsaHayak",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChikitsaHayak",
    description: "AI-powered patient-facing clinical intake software",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <SonnerToaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
