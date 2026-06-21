import { useState, useEffect, useMemo } from 'react'
import { Plus, Tags, X } from 'lucide-react'
import useStore from '@/store/useStore'
import StampCard from '@/components/StampCard'
import ThemeForm from '@/components/ThemeForm'

const CATEGORIES = ['人物', '节日', '城市', '历史事件', '其他']

export default function Themes() {
  const { themes, stamps, fetchThemes, fetchStamps, updateStamp } = useStore()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddStamp, setShowAddStamp] = useState(false)

  useEffect(() => {
    fetchThemes()
    fetchStamps()
  }, [fetchThemes, fetchStamps])

  const filteredThemes = useMemo(() => {
    if (!selectedCategory) return themes
    return themes.filter((t) => t.category === selectedCategory)
  }, [themes, selectedCategory])

  const groupedThemes = useMemo(() => {
    const groups: Record<string, typeof themes> = {}
    for (const theme of filteredThemes) {
      if (!groups[theme.category]) groups[theme.category] = []
      groups[theme.category].push(theme)
    }
    return groups
  }, [filteredThemes])

  const themeStamps = useMemo(() => {
    if (!selectedTheme) return []
    const theme = themes.find((t) => t.id === selectedTheme)
    if (!theme) return []
    return stamps.filter((s) => s.theme === theme.name)
  }, [selectedTheme, themes, stamps])

  const unassignedStamps = useMemo(() => {
    return stamps.filter((s) => !s.theme)
  }, [stamps])

  const handleAddStampToTheme = async (stampId: string) => {
    const theme = themes.find((t) => t.id === selectedTheme)
    if (!theme) return
    await updateStamp(stampId, { theme: theme.name })
    setShowAddStamp(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>主题整理</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建主题
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            !selectedCategory ? 'text-white' : 'border hover:bg-[#F5E6C8]'
          }`}
          style={{
            background: !selectedCategory ? 'var(--color-amber)' : '#FFFBF0',
            borderColor: selectedCategory ? 'var(--color-beige-dark)' : undefined,
            color: !selectedCategory ? '#fff' : 'var(--color-brown)',
          }}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === cat ? 'text-white' : 'border hover:bg-[#F5E6C8]'
            }`}
            style={{
              background: selectedCategory === cat ? 'var(--color-amber)' : '#FFFBF0',
              borderColor: selectedCategory !== cat ? 'var(--color-beige-dark)' : undefined,
              color: selectedCategory === cat ? '#fff' : 'var(--color-brown)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0 space-y-4">
          {Object.entries(groupedThemes).map(([category, categoryThemes]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-brown-light)' }}>
                {category}
              </h3>
              <div className="space-y-1">
                {categoryThemes.map((theme) => {
                  const count = stamps.filter((s) => s.theme === theme.name).length
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id === selectedTheme ? null : theme.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedTheme === theme.id ? 'text-white' : 'hover:bg-[#F5E6C8]'
                      }`}
                      style={{
                        background: selectedTheme === theme.id ? 'var(--color-amber)' : 'transparent',
                        color: selectedTheme === theme.id ? '#fff' : 'var(--color-brown)',
                      }}
                    >
                      <span>{theme.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedTheme === theme.id ? 'bg-white/20' : 'bg-[#F5E6C8]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {themes.length === 0 && (
            <div className="text-center py-10" style={{ color: 'var(--color-brown-light)' }}>
              <Tags size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无主题，点击右上角创建</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          {selectedTheme ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                  {themes.find((t) => t.id === selectedTheme)?.name}
                </h3>
                <button
                  onClick={() => setShowAddStamp(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
                  style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                >
                  <Plus size={14} /> 添加邮品
                </button>
              </div>
              {themeStamps.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {themeStamps.map((stamp) => (
                    <StampCard key={stamp.id} stamp={stamp} onClick={() => {}} />
                  ))}
                </div>
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-brown-light)' }}>
                  该主题下暂无邮品
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
              <Tags size={48} className="mx-auto mb-4 opacity-30" />
              <p>请从左侧选择一个主题查看</p>
            </div>
          )}
        </div>
      </div>

      <ThemeForm open={showForm} onClose={() => setShowForm(false)} />

      {showAddStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>添加邮品</h3>
              <button onClick={() => setShowAddStamp(false)} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {unassignedStamps.length > 0 ? (
                unassignedStamps.map((stamp) => (
                  <button
                    key={stamp.id}
                    onClick={() => handleAddStampToTheme(stamp.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors hover:bg-[#F5E6C8]"
                    style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                  >
                    {stamp.name} ({stamp.issueYear})
                  </button>
                ))
              ) : (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-brown-light)' }}>所有邮品已归属主题</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
