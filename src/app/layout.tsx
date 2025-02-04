import "./globals.css"
import { Inter } from "next/font/google"
import { RootLayout } from "@/components/layout/root-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "T-LowCode - Gestão Financeira Inteligente",
  description: "Gerencie suas finanças com inteligência artificial",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-950">
          {/* Grid de fundo decorativo */}
          <div className="fixed inset-0 grid-background" />
          
          {/* Gradiente de fundo */}
          <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
          
          {/* Círculos de luz */}
          <div className="fixed left-[10%] top-[20%] h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="fixed right-[15%] top-[15%] h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="fixed bottom-[15%] left-[15%] h-32 w-32 rounded-full bg-pink-500/20 blur-3xl" />
          
          {/* Conteúdo */}
          <div className="relative">
            <RootLayout>{children}</RootLayout>
          </div>
        </div>
      </body>
    </html>
  )
} 