"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, DollarSign, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClientComponentClient()
      
      console.log('Tentando fazer login com:', { email })
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Erro no login:', signInError)
        throw signInError
      }

      if (data?.user) {
        console.log('Login bem sucedido:', data.user)
        router.push('/dashboard')
        router.refresh()
      } else {
        console.error('Login falhou: Nenhum usuário retornado')
        throw new Error('Falha na autenticação')
      }
    } catch (error: any) {
      console.error('Erro completo:', error)
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado Esquerdo - Apresentação */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 p-8 md:p-12 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">Financasia</span>
        </div>
        
        <div className="my-auto max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gerencie suas finanças de forma inteligente
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Controle suas receitas, despesas e alcance seus objetivos financeiros com uma plataforma moderna e intuitiva.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
              <span>Controle financeiro completo</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/10 rounded-lg">
                <ArrowRight className="h-5 w-5" />
              </div>
              <span>Análises e insights personalizados</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/60">
          © 2024 Financasia. Todos os direitos reservados.
        </p>
      </div>

      {/* Lado Direito - Login */}
      <div className="w-full md:w-1/2 bg-background p-8 md:p-12 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 space-y-6 border-none shadow-2xl bg-gray-950/50">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
            <p className="text-gray-400">Faça login para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-800 bg-gray-900" />
                <span className="text-sm text-gray-400">Lembrar-me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-purple-500 hover:text-purple-400">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-purple-500 hover:text-purple-400">
                Criar conta
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
} 