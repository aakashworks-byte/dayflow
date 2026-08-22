import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { HRMSProvider } from "@/context/hrms-context";
import { Toaster } from "@/components/ui/toaster";
import { ClientOnly } from "@/components/client-only";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dayflow HRMS — Every workday, perfectly aligned.",
  description: "Next-generation Human Resource Management System for modern high-performance organizations.",
  keywords: "HRMS, Human Resources, Attendance, Leaves, Payroll, Workforce Management, Dayflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Intercept uncaught errors from chrome extensions in capture phase
                  window.addEventListener('error', function(event) {
                    var isExtension = false;
                    if (event.filename && (event.filename.indexOf('chrome-extension://') !== -1 || event.filename.indexOf('moz-extension://') !== -1)) {
                      isExtension = true;
                    }
                    if (event.error && event.error.stack && (event.error.stack.indexOf('chrome-extension://') !== -1 || event.error.stack.indexOf('moz-extension://') !== -1)) {
                      isExtension = true;
                    }
                    if (event.message && (event.message.indexOf('M_ID') !== -1 || event.message.indexOf('bis_skin_checked') !== -1)) {
                      isExtension = true;
                    }
                    if (isExtension) {
                      event.stopImmediatePropagation();
                      event.preventDefault();
                      return true;
                    }
                  }, true);

                  // 2. Intercept unhandled promise rejections from chrome extensions
                  window.addEventListener('unhandledrejection', function(event) {
                    var reasonStr = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : '';
                    if (
                      reasonStr.indexOf('chrome-extension://') !== -1 ||
                      reasonStr.indexOf('moz-extension://') !== -1 ||
                      reasonStr.indexOf('M_ID') !== -1
                    ) {
                      event.stopImmediatePropagation();
                      event.preventDefault();
                    }
                  }, true);

                  // 3. Intercept console.error noise from extensions
                  var origErr = console.error;
                  console.error = function() {
                    var str = '';
                    for (var i = 0; i < arguments.length; i++) {
                      str += ' ' + arguments[i];
                    }
                    if (
                      str.indexOf('bis_skin_checked') !== -1 ||
                      str.indexOf('__processed_') !== -1 ||
                      str.indexOf('bis_register') !== -1 ||
                      str.indexOf('chrome-extension://') !== -1 ||
                      str.indexOf('M_ID') !== -1
                    ) {
                      return;
                    }
                    origErr.apply(console, arguments);
                  };
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-purple-500 selection:text-white"
      >
        <ThemeProvider defaultTheme="dark" storageKey="dayflow_theme">
          <ClientOnly>
            <AuthProvider>
              <HRMSProvider>
                {children}
                <Toaster />
              </HRMSProvider>
            </AuthProvider>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
