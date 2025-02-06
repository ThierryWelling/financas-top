import "./globals.css"
import { Inter } from "next/font/google"
import ClientLayout from "@/components/layout/client-layout"
import { Toaster } from "sonner"
import type { Metadata } from "next"
import { iniciarVerificacaoNotificacoes } from "@/config/notificacoes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Financasia - Gestão Financeira Inteligente",
  description: "Gerencie suas finanças de forma inteligente e automatizada",
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Financasia"
  },
  formatDetection: {
    telephone: false
  }
}

// Iniciar verificação de notificações
if (typeof window !== "undefined") {
  iniciarVerificacaoNotificacoes()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Financasia" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
} 