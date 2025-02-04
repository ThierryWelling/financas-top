import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { Sidebar } from "@/components/sidebar"
import { ChatIA } from "@/components/chat-ia"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "T-LowCode - Gestão Financeira Inteligente",
  description: "Gerencie suas finanças de forma inteligente e automatizada",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-950 text-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
          <ChatIA />
        </div>
      </body>
    </html>
  )
} 