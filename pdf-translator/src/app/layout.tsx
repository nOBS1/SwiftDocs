import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF翻译工具',
  description: '一个基于Next.js的PDF文档翻译工具，支持多种翻译服务和语言',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="m10 13-2 2 2 2" />
                    <path d="m14 17 2-2-2-2" />
                  </svg>
                  <span className="text-xl font-bold">PDF翻译工具</span>
                </div>
                <nav>
                  <ul className="flex items-center gap-4">
                    <li>
                      <a href="/" className="hover:text-primary transition-colors">
                        首页
                      </a>
                    </li>
                    <li>
                      <a href="/history" className="hover:text-primary transition-colors">
                        历史记录
                      </a>
                    </li>
                    <li>
                      <a href="/settings" className="hover:text-primary transition-colors">
                        API设置
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6">
              <div className="container text-center text-sm text-muted-foreground">
                <p>PDF翻译工具 &copy; {new Date().getFullYear()} - 基于Next.js和多种翻译API构建</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 