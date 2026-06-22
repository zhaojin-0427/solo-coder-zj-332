import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { AudioPackageItem } from '@/store/useStore'

interface AudioPackageItemFormProps {
  open: boolean
  onClose: () => void
  packageId: string
  item?: AudioPackageItem | null
  mode?: 'edit' | 'add'
  availableStamps?: { id: string; name: string }[]
}

export default function AudioPackageItemForm({ open, onClose, packageId, item, mode = 'edit', availableStamps }: AudioPackageItemFormProps) {
  const { addPackageItem, updatePackageItem } = useStore()
  const [formData, setFormData] = useState({
    stampId: '',
    title: '',
    content: '',
    audioUrl: '',
    duration: 0,
    narrator: '',
    displayOrder: 0,
    status: '待讲解',
  })

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        stampId: item.stampId || '',
        title: item.title || '',
        content: item.content || '',
        audioUrl: item.audioUrl || '',
        duration: item.duration || 0,
        narrator: item.narrator || '',
        displayOrder: item.displayOrder || 0,
        status: item.status || '待讲解',
      })
    } else {
      setFormData({
        stampId: '',
        title: '',
        content: '',
        audioUrl: '',
        duration: 0,
        narrator: '',
        displayOrder: 0,
        status: '待讲解',
      })
    }
  }, [item, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    if (mode === 'edit' && item) {
      await updatePackageItem(packageId, item.id, formData)
    } else {
      await addPackageItem(packageId, formData)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {mode === 'edit' ? '编辑资料条目' : '添加资料条目'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>关联邮品</label>
              <select
                value={formData.stampId}
                onChange={(e) => setFormData({ ...formData, stampId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="">可选：选择关联邮品</option>
                {availableStamps?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>条目标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入条目标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={4}
              placeholder="请输入回听内容"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>讲解人</label>
              <input
                type="text"
                value={formData.narrator}
                onChange={(e) => setFormData({ ...formData, narrator: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="请输入讲解人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>时长（秒）</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>音频链接</label>
            <input
              type="text"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入音频URL"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>显示顺序</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="待讲解">待讲解</option>
                <option value="讲解中">讲解中</option>
                <option value="已完成">已完成</option>
                <option value="需重录">需重录</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
              style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!formData.title || !formData.content}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              {mode === 'edit' ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
