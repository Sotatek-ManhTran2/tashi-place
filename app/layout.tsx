import "./global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Tashi Place</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
