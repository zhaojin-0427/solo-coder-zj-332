import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore from '@/store/useStore'

interface ExplanationVisitFormProps {
  open: boolean
  onClose: () => void
  explanationId: string
}

export default function ExplanationVisitForm({ open, onClose, explanationId }: ExplanationVisitFormProps) {
  const { addExplanationVisit } = useStore()
  const [formData, setFormData] = useState({
    visitor: '',
    visitDate: '',
    visitNote: '',
    elderlyResponse: '',
    nextPlan: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        visitor: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitNote: '',
        elderlyResponse: '',
        nextPlan: '',
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.visitor || !formData.visitDate) return

    await addExplanationVisit(explanationId, formData)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            记录讲解回访
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>回访人 *</label>
              <input
                type="text"
                value={formData.visitor}
                onChange={(e) => setFormData({ ...formData, visitor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="请输入回访人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>回访日期 *</label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>回访记录</label>
            <textarea
              value={formData.visitNote}
              onChange={(e) => setFormData({ ...formData, visitNote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="请记录本次回访的详细内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>老人反应 / 回应</label>
            <textarea
              value={formData.elderlyResponse}
              onChange={(e) => setFormData({ ...formData, elderlyResponse: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={2}
              placeholder="记录老人的反应和回应内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>后续计划</label>
            <textarea
              value={formData.nextPlan}
              onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={2}
              placeholder="记录下一步的安排和计划"
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
              disabled={!formData.visitor || !formData.visitDate}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              提交回访记录
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
