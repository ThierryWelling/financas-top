"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { categoriasService, type Categoria } from "@/services/categorias"
import * as Icons from "lucide-react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"

type IconType = keyof typeof Icons

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [novaCategoria, setNovaCategoria] = useState<Partial<Categoria>>({
    nome: "",
    descricao: "",
    icone: "Folder",
    cor: "#7C3AED",
    tipo: "despesa",
  })
  const [editando, setEditando] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      const data = await categoriasService.listar()
      setCategorias(data)
      setLoading(false)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      toast.error("Erro ao carregar categorias")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editando) {
        await categoriasService.atualizar(editando, novaCategoria)
        toast.success("Categoria atualizada com sucesso!")
        setEditando(null)
      } else {
        await categoriasService.criar({
          ...novaCategoria as Categoria,
          ordem: categorias.length
        })
        toast.success("Categoria criada com sucesso!")
      }
      setNovaCategoria({
        nome: "",
        descricao: "",
        icone: "Folder",
        cor: "#7C3AED",
        tipo: "despesa"
      })
      carregarCategorias()
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      toast.error("Erro ao salvar categoria")
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setNovaCategoria(categoria)
    setEditando(categoria.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    try {
      await categoriasService.excluir(id)
      toast.success("Categoria excluída com sucesso!")
      carregarCategorias()
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      toast.error("Erro ao excluir categoria")
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(categorias)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const atualizadas = items.map((item, index) => ({
      ...item,
      ordem: index
    }))

    setCategorias(atualizadas)

    try {
      await categoriasService.reordenar(
        atualizadas.map(({ id, ordem }) => ({ id, ordem }))
      )
    } catch (error) {
      console.error("Erro ao reordenar categorias:", error)
      toast.error("Erro ao reordenar categorias")
      carregarCategorias()
    }
  }

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.Folder className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>
      </div>

      {/* Formulário */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={novaCategoria.nome}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({ ...prev, nome: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={novaCategoria.tipo}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({
                    ...prev,
                    tipo: e.target.value as "receita" | "despesa" | "ambos",
                  }))
                }
                required
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icone">Ícone</Label>
              <select
                id="icone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={novaCategoria.icone}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({ ...prev, icone: e.target.value }))
                }
                required
              >
                {Object.keys(Icons).map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                type="color"
                value={novaCategoria.cor}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({ ...prev, cor: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={novaCategoria.descricao}
                onChange={(e) =>
                  setNovaCategoria((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editando && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNovaCategoria({
                    nome: "",
                    descricao: "",
                    icone: "Folder",
                    cor: "#7C3AED",
                    tipo: "despesa",
                  })
                  setEditando(null)
                }}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {editando ? "Atualizar" : "Criar"} Categoria
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de Categorias */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categorias">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {categorias.map((categoria, index) => (
                <Draggable
                  key={categoria.id}
                  draggableId={categoria.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        "p-4 rounded-lg border border-gray-800 bg-gray-900/50",
                        snapshot.isDragging && "opacity-50"
                      )}
                      style={{
                        ...provided.draggableProps.style,
                        borderLeftWidth: "4px",
                        borderLeftColor: categoria.cor
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {renderIcon(categoria.icone)}
                          <div>
                            <h3 className="font-medium">{categoria.nome}</h3>
                            {categoria.descricao && (
                              <p className="text-sm text-gray-400">{categoria.descricao}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(categoria)}
                          >
                            <Icons.Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(categoria.id)}
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
} 