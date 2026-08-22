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
                  var origErr = console.error;
                  console.error = function() {
                    var str = '';
                    for (var i = 0; i < arguments.length; i++) {
                      str += ' ' + arguments[i];
                    }
                    if (
                      str.indexOf('bis_skin_checked') !== -1 ||
                      str.indexOf('__processed_') !== -1 ||
                      str.indexOf('bis_register') !== -1
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
