import { AuthProvider } from "@/hooks/useAuth";
import { GoogleOAuthProvider } from '@react-oauth/google';
import dotenv from 'dotenv';
dotenv.config();

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({
  weight: ["400", "700"],
  style: ["normal"],
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "ToDoRocket",
  description: "Página focada em utilizar BD via Next.js",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID : ""}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
