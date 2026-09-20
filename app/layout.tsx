import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GEOBRAS • Sistema Integral de Gestión de Obras',
  description: 'Seguimiento de obras en zona geográfica, visitas con GPS, timeline documental, exportador en .md y PDF y permisos por rol',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-100 min-h-screen text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
