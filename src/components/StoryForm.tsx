import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore from '@/store/useStore'

const STORY_TYPES = ['购买背景', '交换经历', '纪念意义', '其他']

interface StoryFormProps {
  open: boolean
  onClose: () => void
  defaultStampId?: string
}

export default function StoryForm({ open, onClose, defaultStampId }: StoryFormProps) {
  const { stamps, createStory } = useStore()
  const [form, setForm] = useState({
    stampId: '',
    author: '',
    storyType: '购买背景',
    content: '',
  })

  useEffect(() => {
    if (defaultStampId) {
      setForm((prev) => ({ ...prev, stampId: defaultStampId }))
    }
  }, [defaultStampId, open])

  useEffect(() => {
    if (open && !defaultStampId) {
      setForm({ stampId: '', author: '', storyType: '购买背景', content: '' })
    }
  }, [open, defaultStampId])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createStory(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-md mx-4" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            补充故事
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>关联邮品</label>
            <select
              value={form.stampId}
              onChange={(e) => setForm({ ...form, stampId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            >
              <option value="">选择邮品</option>
              {stamps.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>讲述者</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>故事类型</label>
              <select
                value={form.storyType}
                onChange={(e) => setForm({ ...form, storyType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                {STORY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>故事内容</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              required
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
              提交故事
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
