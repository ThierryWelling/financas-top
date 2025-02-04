"use client"

import { useEffect, useState } from 'react'
import { supabase, Receita, Despesa, Sonho } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { BarChart, DollarSign, PiggyBank, Target } from 'lucide-react'

export default function DashboardPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [sonhos, setSonhos] = useState<Sonho[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: receitasData } = await supabase
          .from('receitas')
          .select('*')
          .order('data', { ascending: false })
        
        const { data: despesasData } = await supabase
          .from('despesas')
          .select('*')
          .order('data', { ascending: false })
        
        const { data: sonhosData } = await supabase
          .from('sonhos')
          .select('*')
          .order('created_at', { ascending: false })

        if (receitasData) setReceitas(receitasData)
        if (despesasData) setDespesas(despesasData)
        if (sonhosData) setSonhos(sonhosData)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0)
  const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0)
  const saldo = totalReceitas - totalDespesas
  const totalSonhos = sonhos.reduce((total, sonho) => total + sonho.valor_meta, 0)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card de Receitas */}
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Receitas</p>
              <h2 className="text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</h2>
            </div>
          </div>
        </Card>

        {/* Card de Despesas */}
        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-full">
              <BarChart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Despesas</p>
              <h2 className="text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</h2>
            </div>
          </div>
        </Card>

        {/* Card de Saldo */}
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <PiggyBank className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saldo Atual</p>
              <h2 className="text-2xl font-bold">R$ {saldo.toFixed(2)}</h2>
            </div>
          </div>
        </Card>

        {/* Card de Objetivos */}
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total em Objetivos</p>
              <h2 className="text-2xl font-bold">R$ {totalSonhos.toFixed(2)}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Últimas Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Últimas Receitas</h3>
          <div className="space-y-4">
            {receitas.slice(0, 5).map((receita) => (
              <div key={receita.id} className="flex justify-between items-center p-3 bg-green-500/5 rounded-lg">
                <div>
                  <p className="font-medium">{receita.descricao}</p>
                  <p className="text-sm text-gray-400">{new Date(receita.data).toLocaleDateString()}</p>
                </div>
                <p className="text-green-500 font-semibold">R$ {receita.valor.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Últimas Despesas</h3>
          <div className="space-y-4">
            {despesas.slice(0, 5).map((despesa) => (
              <div key={despesa.id} className="flex justify-between items-center p-3 bg-red-500/5 rounded-lg">
                <div>
                  <p className="font-medium">{despesa.descricao}</p>
                  <p className="text-sm text-gray-400">{new Date(despesa.data).toLocaleDateString()}</p>
                </div>
                <p className="text-red-500 font-semibold">R$ {despesa.valor.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
} 