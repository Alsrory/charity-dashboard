import type { Metadata } from "next";
import "./globals.css";

// استيراد الخطوط محليًا
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import '@fontsource/geist/400.css';
import '@fontsource/geist/700.css';

// استيراد Toaster
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Charity Dashboard",
  description: "A dashboard for managing charity activities",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: `'Cairo', sans-serif`, // الخط العربي
        }}
      >
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '16px',
              padding: '16px',
              borderRadius: '12px',
            },
            success: {
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
