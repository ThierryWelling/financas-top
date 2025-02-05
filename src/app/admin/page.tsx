"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, UserX, UserCheck, AlertCircle } from "lucide-react"

interface Profile {
  id: string
  email: string
  nome: string
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [])

  const checkAdminAndLoadUsers = async () => {
    try {
      setLoading(true)
      
      // Verificar se o usuário atual é admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const { data: adminCheck, error: adminError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (adminError) throw adminError
      
      if (!adminCheck?.is_admin) {
        setError("Acesso negado. Apenas administradores podem acessar esta página.")
        setIsAdmin(false)
        return
      }

      setIsAdmin(true)

      // Carregar todos os usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (profilesError) throw profilesError
      setProfiles(profilesData)

    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId)

      if (error) throw error

      // Atualizar a lista localmente
      setProfiles(profiles.map(profile => 
        profile.id === userId 
          ? { ...profile, is_admin: !currentStatus }
          : profile
      ))

    } catch (error: any) {
      console.error("Erro ao atualizar status de admin:", error)
      setError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-6 w-6" />
          <h1 className="text-xl font-bold">Acesso Negado</h1>
        </div>
        <p className="text-gray-400 text-center">
          Apenas administradores têm acesso a esta página.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold">Administração de Usuários</h1>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-lg">
          <Shield className="h-5 w-5" />
          <span>{profiles.length} usuários registrados</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{profile.nome || profile.email}</h3>
                  {profile.is_admin && (
                    <span className="bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded text-xs">
                      Administrador
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{profile.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Registrado em: {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <Button
                onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                variant={profile.is_admin ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {profile.is_admin ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Remover Admin
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Tornar Admin
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 