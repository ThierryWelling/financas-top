import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Criar o cliente do Supabase
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Verificar a sessão
    const { data: { session }, error } = await supabase.auth.getSession()

    // Log para debug
    console.log('Middleware - URL atual:', request.nextUrl.pathname)
    console.log('Middleware - Sessão:', session ? 'Existe' : 'Não existe')

    // Rotas que não precisam de autenticação
    const publicRoutes = ['/login', '/register']
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

    // Se o usuário não estiver autenticado e tentar acessar uma rota protegida
    if (!session && !isPublicRoute) {
      console.log('Middleware - Redirecionando para login (não autenticado)')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Se o usuário estiver autenticado e tentar acessar uma rota pública
    if (session && isPublicRoute) {
      console.log('Middleware - Redirecionando para dashboard (já autenticado)')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Se o usuário acessar a raiz /
    if (request.nextUrl.pathname === '/') {
      if (session) {
        console.log('Middleware - Redirecionando raiz para dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        console.log('Middleware - Redirecionando raiz para login')
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware - Erro:', error)
    // Em caso de erro, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Configurar quais rotas o middleware deve interceptar
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 