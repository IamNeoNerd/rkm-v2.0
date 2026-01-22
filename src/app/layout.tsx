import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "RK Institute 3.0",
  description: "Next-Generation Tuition Management ERP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased font-sans min-h-screen bg-background relative selection:bg-primary/20 selection:text-primary`}>
        {/* Modern Background Accents */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cta/10 rounded-full blur-[120px]" />
        </div>

        <Providers>
          <Toaster position="top-right" richColors />
          {children}
        </Providers>
      </body>
    </html>
  );
}
