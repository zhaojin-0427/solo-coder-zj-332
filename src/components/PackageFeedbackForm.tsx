import { useState, useEffect } from 'react'
import { X, Star } from 'lucide-react'
import useStore, { PackageFeedback } from '@/store/useStore'

interface PackageFeedbackFormProps {
  open: boolean
  onClose: () => void
  packageId: string
  packageItems?: { id: string; title: string }[]
}

export default function PackageFeedbackForm({ open, onClose, packageId, packageItems }: PackageFeedbackFormProps) {
  const { addPackageFeedback } = useStore()
  const [formData, setFormData] = useState({
    itemId: '',
    elderlyPerson: '',
    feedbackType: '喜欢',
    rating: 5,
    content: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        itemId: '',
        elderlyPerson: '',
        feedbackType: '喜欢',
        rating: 5,
        content: '',
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.elderlyPerson) return

    await addPackageFeedback(packageId, formData)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            添加老人反馈
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>关联条目</label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="">可选：关联到具体条目</option>
              {packageItems?.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>老人姓名 *</label>
            <input
              type="text"
              value={formData.elderlyPerson}
              onChange={(e) => setFormData({ ...formData, elderlyPerson: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入老人姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>反馈类型</label>
            <select
              value={formData.feedbackType}
              onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
            >
              <option value="喜欢">喜欢</option>
              <option value="听不懂">听不懂</option>
              <option value="想再听">想再听</option>
              <option value="有补充">有补充</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>评分</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    fill={star <= formData.rating ? '#D97706' : 'none'}
                    color={star <= formData.rating ? '#D97706' : 'var(--color-beige-dark)'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>反馈内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="请输入反馈内容"
            />
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
              disabled={!formData.elderlyPerson}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              提交反馈
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
