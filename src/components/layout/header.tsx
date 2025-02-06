import React from 'react'
import { Menu, Search } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800">
      <div className="flex items-center justify-between h-full px-4">
        {/* Menu e Pesquisa */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full lg:w-[300px] h-10 pl-9 pr-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </header>
  )
} 