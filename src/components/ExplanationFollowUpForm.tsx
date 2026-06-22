import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { ExplanationFollowUp, ExplanationFeedback } from '@/store/useStore'

interface ExplanationFollowUpFormProps {
  open: boolean
  onClose: () => void
  explanationId: string
  item?: ExplanationFollowUp | null
  mode?: 'edit' | 'add'
  feedback?: ExplanationFeedback | null
}

export default function ExplanationFollowUpForm({ open, onClose, explanationId, item, mode = 'add', feedback }: ExplanationFollowUpFormProps) {
  const { addExplanationFollowUp, updateExplanationFollowUp } = useStore()
  const [formData, setFormData] = useState({
    feedbackId: '',
    title: '',
    description: '',
    assignee: '',
    priority: '中',
    status: '待处理',
    dueDate: '',
  })

  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        feedbackId: item.feedbackId || '',
        title: item.title || '',
        description: item.description || '',
        assignee: item.assignee || '',
        priority: item.priority || '中',
        status: item.status || '待处理',
        dueDate: item.dueDate || '',
      })
    } else if (feedback) {
      setFormData({
        feedbackId: feedback.id,
        title: `跟进：${feedback.feedbackType}`,
        description: feedback.content || '',
        assignee: '',
        priority: '中',
        status: '待处理',
        dueDate: '',
      })
    } else {
      setFormData({
        feedbackId: '',
        title: '',
        description: '',
        assignee: '',
        priority: '中',
        status: '待处理',
        dueDate: '',
      })
    }
  }, [item, mode, feedback, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.assignee) return

    if (mode === 'edit' && item) {
      await updateExplanationFollowUp(explanationId, item.id, formData)
    } else {
      await addExplanationFollowUp(explanationId, formData)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {mode === 'edit' ? '编辑待跟进' : '添加待跟进事项'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>事项标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入待跟进事项标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>事项描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="请输入事项描述"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>责任人 *</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="请输入责任人"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
          </div>
          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="待处理">待处理</option>
                <option value="处理中">处理中</option>
                <option value="已完成">已完成</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>截止日期</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
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
              disabled={!formData.title || !formData.assignee}
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
