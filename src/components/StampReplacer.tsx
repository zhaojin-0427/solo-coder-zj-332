import { useState, useMemo } from 'react'
import { X, Search, RefreshCw } from 'lucide-react'
import useStore from '@/store/useStore'
import StampCard from '@/components/StampCard'

interface StampReplacerProps {
  open: boolean
  onClose: () => void
  onConfirm: (newStampId: string) => void
  currentStampId?: string
  exhibitionId: string
}

export default function StampReplacer({ open, onClose, onConfirm, currentStampId, exhibitionId, exhibitionStamps }: StampReplacerProps & { exhibitionStamps?: any[] }) {
  const { stamps, themes } = useStore()
  const [search, setSearch] = useState('')
  const [filterTheme, setFilterTheme] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [displayRole, setDisplayRole] = useState('主展品')
  const [keeper, setKeeper] = useState('')

  const existingStampIds = useMemo(() => {
    return (exhibitionStamps || [])
      .filter((s: any) => s.status !== '已移出' && s.status !== '已替换')
      .map((s: any) => s.stampId)
      .filter((id: string) => id !== currentStampId)
  }, [exhibitionStamps, currentStampId])

  const filtered = useMemo(() => {
    return stamps.filter((s) => {
      if (existingStampIds.includes(s.id) || s.id === currentStampId) return false
      if (search && !s.name.includes(search) && !s.source?.includes(search)) return false
      if (filterTheme && !s.themes?.some((t) => t.name === filterTheme)) return false
      if (filterCondition && s.condition !== filterCondition) return false
      return true
    })
  }, [stamps, search, filterTheme, filterCondition, existingStampIds, currentStampId])

  const handleConfirm = () => {
    if (selectedId) {
      onConfirm(selectedId)
      setSelectedId('')
      onClose()
    }
  }

  const handleClose = () => {
    setSelectedId('')
    setSearch('')
    setFilterTheme('')
    setFilterCondition('')
    setDisplayRole('主展品')
    setKeeper('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden flex flex-col" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            替换邮品
          </h3>
          <button onClick={handleClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <div className="px-6 py-4 border-b space-y-3" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <div className="relative">
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
              value={displayRole}
              onChange={(e) => setDisplayRole(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="主展品">主展品</option>
              <option value="辅助展品">辅助展品</option>
              <option value="装饰展品">装饰展品</option>
            </select>
            <input
              type="text"
              value={keeper}
              onChange={(e) => setKeeper(e.target.value)}
              placeholder="保管责任人"
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((stamp) => (
                <StampCard
                  key={stamp.id}
                  stamp={stamp}
                  onClick={() => setSelectedId(stamp.id)}
                  selectable={true}
                  selected={selectedId === stamp.id}
                  onSelect={() => setSelectedId(stamp.id)}
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
            {selectedId ? `已选择: ${stamps.find((s) => s.id === selectedId)?.name}` : '请选择替换邮品'}
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
              disabled={!selectedId || !keeper}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              <RefreshCw size={14} /> 确认替换
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
