import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { Theme } from '@/store/useStore'

const CATEGORIES = ['人物', '节日', '城市', '历史事件', '其他']

interface ThemeFormProps {
  open: boolean
  onClose: () => void
  theme?: Theme | null
}

export default function ThemeForm({ open, onClose, theme }: ThemeFormProps) {
  const { createTheme, updateTheme } = useStore()
  const [form, setForm] = useState({
    name: '',
    category: '其他',
    description: '',
  })

  useEffect(() => {
    if (theme) {
      setForm({ name: theme.name, category: theme.category, description: theme.description })
    } else {
      setForm({ name: '', category: '其他', description: '' })
    }
  }, [theme, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (theme) {
      await updateTheme(theme.id, form)
    } else {
      await createTheme(form)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-md mx-4" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {theme ? '编辑主题' : '新建主题'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>主题名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>分类</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            />
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
              {theme ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
