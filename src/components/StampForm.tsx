import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import useStore, { Stamp } from '@/store/useStore'

const CONDITIONS = ['完好', '轻微损伤', '明显损伤', '严重损伤']

interface StampFormProps {
  open: boolean
  onClose: () => void
  stamp?: Stamp | null
}

export default function StampForm({ open, onClose, stamp }: StampFormProps) {
  const { themes, sets, createStamp, updateStamp, setStampThemes } = useStore()
  const [form, setForm] = useState({
    name: '',
    issueYear: new Date().getFullYear(),
    theme: '',
    condition: '完好',
    source: '',
    albumPage: '',
    setId: '',
  })
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([])

  useEffect(() => {
    if (stamp) {
      setForm({
        name: stamp.name,
        issueYear: stamp.issueYear,
        theme: stamp.theme,
        condition: stamp.condition,
        source: stamp.source,
        albumPage: stamp.albumPage,
        setId: stamp.setId,
      })
      setSelectedThemeIds(stamp.themes?.map((t) => t.id) || [])
    } else {
      setForm({ name: '', issueYear: new Date().getFullYear(), theme: '', condition: '完好', source: '', albumPage: '', setId: '' })
      setSelectedThemeIds([])
    }
  }, [stamp, open])

  if (!open) return null

  const toggleTheme = (themeId: string) => {
    setSelectedThemeIds((prev) =>
      prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: any = { ...form }
    if (!submitData.setId) {
      submitData.setId = null
    }
    
    if (stamp) {
      await updateStamp(stamp.id, submitData)
      await setStampThemes(stamp.id, selectedThemeIds)
    } else {
      const result: any = await createStamp(submitData)
      const newStamp = result?.data || result
      if (newStamp?.id && selectedThemeIds.length > 0) {
        await setStampThemes(newStamp.id, selectedThemeIds)
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {stamp ? '编辑邮品' : '新建邮品'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>发行年份</label>
              <input
                type="number"
                value={form.issueYear}
                onChange={(e) => setForm({ ...form, issueYear: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>品相</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-brown)' }}>
              主题 <span className="text-xs font-normal" style={{ color: 'var(--color-brown-light)' }}>(可多选)</span>
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)' }}>
              {themes.length > 0 ? (
                themes.map((theme) => {
                  const selected = selectedThemeIds.includes(theme.id)
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => toggleTheme(theme.id)}
                      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                        selected ? 'text-white' : 'border hover:bg-[#F5E6C8]'
                      }`}
                      style={{
                        background: selected ? 'var(--color-amber)' : 'transparent',
                        borderColor: selected ? 'var(--color-amber)' : 'var(--color-beige-dark)',
                        color: selected ? '#fff' : 'var(--color-brown)',
                      }}
                    >
                      {selected && <Check size={12} />}
                      {theme.name}
                    </button>
                  )
                })
              ) : (
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>暂无主题，请先在主题整理页创建</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>来源</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>册页</label>
              <input
                type="text"
                value={form.albumPage}
                onChange={(e) => setForm({ ...form, albumPage: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>套组</label>
            <select
              value={form.setId}
              onChange={(e) => setForm({ ...form, setId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            >
              <option value="">无套组</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
              style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
              style={{ background: 'var(--color-amber)' }}
            >
              {stamp ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
