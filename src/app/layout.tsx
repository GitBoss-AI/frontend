import "@/styles/globals.css";
import { Geist } from "next/font/google";
import { UserProvider } from "@/contexts/UserContext";

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
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}