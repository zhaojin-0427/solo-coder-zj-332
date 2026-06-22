import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore from '@/store/useStore'

interface RestorationOrderFormProps {
  open: boolean
  onClose: () => void
  assessmentId: string
  stampId: string
  assessmentRiskType?: string
}

export default function RestorationOrderForm({ open, onClose, assessmentId, stampId, assessmentRiskType }: RestorationOrderFormProps) {
  const createRestorationOrder = useStore((s) => s.createRestorationOrder)
  const [form, setForm] = useState({
    handler: '',
    beforePhotos: '',
    note: '',
  })

  useEffect(() => {
    if (open) {
      setForm({ handler: '', beforePhotos: '', note: '' })
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRestorationOrder({
      assessmentId,
      stampId,
      handler: form.handler,
      beforePhotos: form.beforePhotos,
      note: form.note,
      status: '待确认',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            生成养护工单
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {assessmentRiskType && (
            <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#F5E6C8', color: 'var(--color-brown)' }}>
              风险类型: {assessmentRiskType}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>负责人</label>
            <input
              type="text"
              value={form.handler}
              onChange={(e) => setForm({ ...form, handler: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>处理前照片描述</label>
            <input
              type="text"
              value={form.beforePhotos}
              onChange={(e) => setForm({ ...form, beforePhotos: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>备注</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
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
              创建工单
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
