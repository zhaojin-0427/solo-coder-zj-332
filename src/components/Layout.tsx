import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Tags, BookHeart, ArrowLeftRight, BarChart3, Grid3X3, Mic } from 'lucide-react'

const navItems = [
  { path: '/archive', label: '邮品档案', icon: BookOpen },
  { path: '/themes', label: '主题整理', icon: Tags },
  { path: '/stories', label: '来源故事', icon: BookHeart },
  { path: '/circulation', label: '借阅流转', icon: ArrowLeftRight },
  { path: '/exhibitions', label: '展陈策划', icon: Grid3X3 },
  { path: '/audio-packages', label: '回听资料包', icon: Mic },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-beige)' }}>
      <aside className="w-60 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--color-brown)', background: '#FAF0DC' }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-brown)' }}>
          <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-amber)' }}>
            集邮档案
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-brown-light)' }}>家庭集邮档案与主题整理协同平台</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'border-r-[3px]'
                    : 'hover:bg-[#F5E6C8]'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-amber)' : 'var(--color-brown)',
                borderRightColor: isActive ? 'var(--color-amber)' : 'transparent',
                background: isActive ? 'rgba(184,134,11,0.08)' : undefined,
              })}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t text-xs" style={{ borderColor: 'var(--color-brown)', color: 'var(--color-brown-light)' }}>
          家庭集邮档案管理
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
