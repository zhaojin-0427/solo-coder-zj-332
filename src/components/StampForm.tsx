import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { Stamp } from '@/store/useStore'

const CONDITIONS = ['完好', '轻微损伤', '明显损伤', '严重损伤']

interface StampFormProps {
  open: boolean
  onClose: () => void
  stamp?: Stamp | null
}

export default function StampForm({ open, onClose, stamp }: StampFormProps) {
  const { themes, createStamp, updateStamp } = useStore()
  const [form, setForm] = useState({
    name: '',
    issueYear: new Date().getFullYear(),
    theme: '',
    condition: '完好',
    source: '',
    albumPage: '',
    setId: '',
  })

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
    } else {
      setForm({ name: '', issueYear: new Date().getFullYear(), theme: '', condition: '完好', source: '', albumPage: '', setId: '' })
    }
  }, [stamp, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stamp) {
      await updateStamp(stamp.id, form)
    } else {
      await createStamp(form)
    }
    onClose()
  }

  const albumPages = [...new Set(useStore.getState().stamps.map((s) => s.albumPage).filter(Boolean))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>主题</label>
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                <option value="">选择主题</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>套组</label>
              <select
                value={form.setId}
                onChange={(e) => setForm({ ...form, setId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                <option value="">选择套组</option>
                {albumPages.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
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
