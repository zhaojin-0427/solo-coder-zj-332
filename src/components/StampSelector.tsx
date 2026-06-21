import { useState, useMemo } from 'react'
import { X, Search, Plus } from 'lucide-react'
import useStore from '@/store/useStore'
import StampCard from '@/components/StampCard'

interface StampSelectorProps {
  open: boolean
  onClose: () => void
  onConfirm: (stampIds: string[]) => void
  selectedStampIds?: string[]
}

export default function StampSelector({ open, onClose, onConfirm, selectedStampIds = [] }: StampSelectorProps) {
  const { stamps, themes } = useStore()
  const [search, setSearch] = useState('')
  const [filterTheme, setFilterTheme] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterAlbumPage, setFilterAlbumPage] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const albumPages = useMemo(() => [...new Set(stamps.map((s) => s.albumPage).filter(Boolean))], [stamps])
  const years = useMemo(() => [...new Set(stamps.map((s) => s.issueYear).filter(Boolean))].sort(), [stamps])

  const filtered = useMemo(() => {
    return stamps.filter((s) => {
      if (selectedStampIds.includes(s.id)) return false
      if (search && !s.name.includes(search) && !s.source?.includes(search)) return false
      if (filterTheme && !s.themes?.some((t) => t.name === filterTheme)) return false
      if (filterCondition && s.condition !== filterCondition) return false
      if (filterAlbumPage && s.albumPage !== filterAlbumPage) return false
      if (filterYear && String(s.issueYear) !== filterYear) return false
      return true
    })
  }, [stamps, search, filterTheme, filterCondition, filterAlbumPage, filterYear, selectedStampIds])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onConfirm(selectedIds)
      setSelectedIds([])
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedIds([])
    setSearch('')
    setFilterTheme('')
    setFilterCondition('')
    setFilterAlbumPage('')
    setFilterYear('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[85vh] overflow-hidden flex flex-col" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            筛选并添加候选邮品
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <div className="px-6 py-4 border-b space-y-3" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索邮品名称或来源..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="">全部主题</option>
              {themes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="">全部年份</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>{y}年</option>
              ))}
            </select>
            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="">全部品相</option>
              <option value="完好">完好</option>
              <option value="轻微损伤">轻微损伤</option>
              <option value="明显损伤">明显损伤</option>
              <option value="严重损伤">严重损伤</option>
            </select>
            <select
              value={filterAlbumPage}
              onChange={(e) => setFilterAlbumPage(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="">全部册页</option>
              {albumPages.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((stamp) => (
                <StampCard
                  key={stamp.id}
                  stamp={stamp}
                  onClick={() => {}}
                  selectable={true}
                  selected={selectedIds.includes(stamp.id)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
              <p>暂无符合条件的邮品</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <span className="text-sm" style={{ color: 'var(--color-brown-light)' }}>
            已选择 {selectedIds.length} 枚邮品
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
              style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              <Plus size={14} /> 添加选中 ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
