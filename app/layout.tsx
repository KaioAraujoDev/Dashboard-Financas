import './globals.css';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
    >
      <body>
        <header className="text-[2rem]">
          <a href="/">Início</a>
        </header>
        {children}
      </body>
    </html>
  );
}
