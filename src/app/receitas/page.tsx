"use client"

import { useState, useEffect } from "react"
import { PlusCircle, DollarSign, TrendingUp, Calculator } from "lucide-react"
import { receitasService } from "@/services/financas"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface Receita {
  id: string
  created_at?: string
  user_id?: string
  valor: number
  descricao: string
  categoria: string
  data: string
}

export default function ReceitasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [loading, setLoading] = useState(true)
  const [novaReceita, setNovaReceita] = useState({
    tipo: "fixo",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0]
  })

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Carregar receitas ao montar o componente
  useEffect(() => {
    if (user) {
      carregarReceitas()
    }
  }, [user])

  const carregarReceitas = async () => {
    try {
      const data = await receitasService.listar()
      setReceitas(data)
    } catch (error) {
      console.error('Erro ao carregar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularMediaMensal = () => {
    if (receitas.length === 0) return 0
    const somaTotal = receitas.reduce((acc, receita) => acc + receita.valor, 0)
    return somaTotal / receitas.length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const novoRegistro = {
        descricao: novaReceita.descricao,
        valor: Number(novaReceita.valor),
        data: novaReceita.data,
        categoria: novaReceita.tipo // Usando o tipo como categoria
      }
      
      await receitasService.criar(novoRegistro)
      await carregarReceitas() // Recarrega a lista após criar

      setNovaReceita({
        tipo: "fixo",
        descricao: "",
        valor: "",
        data: new Date().toISOString().split("T")[0]
      })
    } catch (error) {
      console.error('Erro ao salvar receita:', error)
      alert('Erro ao salvar receita. Por favor, tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Receitas</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4">
            <Calculator className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-green-500">Média Mensal</p>
              <p className="font-bold text-green-500">
                R$ {calcularMediaMensal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Nova Receita */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Registrar Nova Receita</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Tipo
              </label>
              <select
                value={novaReceita.tipo}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, tipo: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
              >
                <option value="fixo">Fixo</option>
                <option value="variavel">Variável</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Descrição
              </label>
              <input
                type="text"
                value={novaReceita.descricao}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, descricao: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                placeholder="Ex: Salário"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Valor
              </label>
              <input
                type="number"
                value={novaReceita.valor}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, valor: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">
                Data
              </label>
              <input
                type="date"
                value={novaReceita.data}
                onChange={(e) =>
                  setNovaReceita({ ...novaReceita, data: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Receita
          </button>
        </form>
      </div>

      {/* Lista de Receitas */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Receitas Registradas</h2>
          <div className="space-y-4">
            {receitas.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhuma receita registrada ainda.
              </p>
            ) : (
              receitas.map((receita) => (
                <div
                  key={receita.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    {receita.categoria === "fixo" ? (
                      <DollarSign className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingUp className="h-8 w-8 text-blue-500" />
                    )}
                    <div>
                      <h3 className="font-medium">{receita.descricao}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(receita.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-500">
                      R$ {receita.valor.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {receita.categoria === "fixo" ? "Receita Fixa" : "Receita Variável"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 