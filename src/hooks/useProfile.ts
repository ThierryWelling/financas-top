"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  nome: string
  is_admin: boolean
  created_at: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Erro ao obter usuário:', userError)
        throw new Error('Erro ao obter usuário')
      }
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('Usuário encontrado:', user.id)

      // Verificar se o perfil existe
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Resultado da busca de perfil:', { existingProfile, profileError })

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, vamos criar
        console.log('Criando novo perfil para:', user.email)
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              nome: user.email?.split('@')[0] || 'Usuário',
            }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('Erro ao criar perfil:', insertError)
          throw new Error('Erro ao criar perfil')
        }

        console.log('Novo perfil criado:', newProfile)
        setProfile(newProfile)
        return
      }

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
        throw profileError
      }

      console.log('Perfil existente encontrado:', existingProfile)
      setProfile(existingProfile)

    } catch (error: any) {
      console.error('Erro no loadProfile:', error)
      setError(error.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)
      
      if (!profile?.id) {
        throw new Error('Perfil não carregado')
      }

      console.log('Atualizando perfil:', { profileId: profile.id, updates })

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        throw error
      }

      console.log('Perfil atualizado:', data)
      setProfile(data)
      return data
    } catch (error: any) {
      console.error('Erro no updateProfile:', error)
      setError(error.message)
      throw error
    }
  }

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    isAdmin: profile?.is_admin || false,
  }
} 