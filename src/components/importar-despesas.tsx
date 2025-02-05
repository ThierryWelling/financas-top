import { useState } from 'react'
import { Button } from './ui/button'
import { Upload, FileDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface DespesaImportada {
  descricao: string
  valor: number
  categoria: string
  data: string
  pago: boolean
}

export function ImportarDespesas() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const gerarExemploCSV = () => {
    const headers = ['descricao', 'valor', 'categoria', 'data', 'pago']
    const exemplos = [
      ['Aluguel', '1500.00', 'moradia', '2024-03-01', 'true'],
      ['Mercado', '800.00', 'alimentacao', '2024-03-05', 'false'],
      ['Internet', '150.00', 'servicos', '2024-03-10', 'false']
    ]

    const csvContent = [
      headers.join(','),
      ...exemplos.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao_despesas.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const processarArquivo = async (file: File) => {
    try {
      setIsLoading(true)
      const extensao = file.name.split('.').pop()?.toLowerCase()
      let despesas: DespesaImportada[] = []

      if (extensao === 'csv') {
        const texto = await file.text()
        const linhas = texto.split('\n')
        const headers = linhas[0].split(',')

        despesas = linhas.slice(1).map(linha => {
          const valores = linha.split(',')
          return {
            descricao: valores[0]?.trim().replace(/^"|"$/g, '') || '',
            valor: parseFloat(valores[1]?.trim() || '0'),
            categoria: valores[2]?.trim().replace(/^"|"$/g, '') || '',
            data: valores[3]?.trim().replace(/^"|"$/g, '') || '',
            pago: valores[4]?.trim().toLowerCase() === 'true'
          }
        })
      } else if (extensao === 'xlsx') {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const dados = XLSX.utils.sheet_to_json(worksheet)

        despesas = dados.map((row: any) => ({
          descricao: row.descricao || '',
          valor: parseFloat(row.valor) || 0,
          categoria: row.categoria || '',
          data: row.data || '',
          pago: row.pago === true || row.pago === 'true'
        }))
      }

      // Validar dados
      const despesasValidas = despesas.filter(d => 
        d.descricao && 
        d.valor > 0 && 
        d.categoria && 
        /^\d{4}-\d{2}-\d{2}$/.test(d.data)
      )

      if (despesasValidas.length === 0) {
        throw new Error('Nenhuma despesa válida encontrada no arquivo')
      }

      // Importar despesas
      const { error } = await supabase
        .from('despesas')
        .insert(despesasValidas)

      if (error) throw error

      toast({
        title: 'Despesas importadas com sucesso',
        description: `${despesasValidas.length} despesas foram importadas.`
      })

    } catch (error: any) {
      console.error('Erro ao importar despesas:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao importar despesas',
        description: error.message || 'Ocorreu um erro ao importar as despesas.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        onClick={gerarExemploCSV}
        className="flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        Baixar Modelo CSV
      </Button>

      <div className="relative">
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => e.target.files?.[0] && processarArquivo(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Upload className="w-4 h-4" />
          {isLoading ? 'Importando...' : 'Importar Despesas'}
        </Button>
      </div>
    </div>
  )
} 