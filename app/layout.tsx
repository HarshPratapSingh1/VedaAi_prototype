import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AssessAI — Question & Answer Mapper",
  description:
    "Upload a question paper and a student's answer sheet to extract, map, and grade answers automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
