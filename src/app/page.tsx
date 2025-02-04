import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <div className="flex items-center justify-center gap-2">
            <Link href="/login">
              <Button>Entrar</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-6xl font-bold text-center mb-8">
          Bem-vindo ao Financasia
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Controle Financeiro
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Gerencie suas receitas e despesas de forma simples e intuitiva.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Análise Inteligente
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Insights e recomendações personalizadas com IA.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Metas e Orçamentos
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Estabeleça metas e acompanhe seu progresso financeiro.
          </p>
        </div>
      </div>
    </main>
  )
} 