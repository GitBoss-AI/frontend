import "@/styles/globals.css";
import { Geist } from "next/font/google";

export const metadata = {
  title: "GitBoss Dev",
  description: "Frontend Dev Environment",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}

