import "./globals.css";

export const metadata = {
  title: "Ultimate Brain – Control Center",
  description: "Suite nativa para Notion (UB)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
