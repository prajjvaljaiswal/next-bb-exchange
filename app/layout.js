import { Geist, Geist_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import DevBanner from "@/components/ui/DevBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  variable: "--font-dm-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Bloodexchange.in — India's Paperless Blood Exchange Network",
  description: "Connect blood banks, donors, and patients across India with our digital blood exchange platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} antialiased`}>
        <DevBanner />
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
