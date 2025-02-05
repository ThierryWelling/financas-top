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
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
} 