import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { ExplanationFeedback } from '@/store/useStore'

interface ExplanationFeedbackFormProps {
  open: boolean
  onClose: () => void
  explanationId: string
  feedback?: ExplanationFeedback | null
}

export default function ExplanationFeedbackForm({ open, onClose, explanationId, feedback }: ExplanationFeedbackFormProps) {
  const { addExplanationFeedback, convertFeedbackToFollowUp, appendFeedbackToStory } = useStore()
  const [formData, setFormData] = useState({
    elderlyPerson: '',
    feedbackType: '听懂了',
    content: '',
  })
  const [showConvert, setShowConvert] = useState(false)
  const [convertData, setConvertData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: '中',
    dueDate: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        elderlyPerson: feedback?.elderlyPerson || '',
        feedbackType: feedback?.feedbackType || '听懂了',
        content: feedback?.content || '',
      })
      setShowConvert(false)
      setConvertData({
        title: '',
        description: '',
        assignee: '',
        priority: '中',
        dueDate: '',
      })
    }
  }, [feedback, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.elderlyPerson) return

    if (!feedback) {
      await addExplanationFeedback(explanationId, formData)
    }
    onClose()
  }

  const handleConvertToFollowUp = async () => {
    if (!feedback || !convertData.title || !convertData.assignee) return
    await convertFeedbackToFollowUp(explanationId, feedback.id, convertData)
    onClose()
  }

  const handleAppendToStory = async () => {
    if (!feedback) return
    if (confirm('确定将此反馈补充到来源故事吗？')) {
      await appendFeedbackToStory(explanationId, feedback.id)
      alert('已成功补充到来源故事！')
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {feedback ? '老人反馈详情' : '提交老人反馈'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>

        {!feedback ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <div className="grid grid-cols-2 gap-2">
                {['听懂了', '还想补充', '需要再次讲解', '其他'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, feedbackType: type })}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formData.feedbackType === type
                        ? 'text-white shadow'
                        : 'hover:bg-[#F5E6C8]'
                    }`}
                    style={{
                      background: formData.feedbackType === type ? 'var(--color-amber)' : '#fff',
                      borderColor: 'var(--color-beige-dark)',
                      color: formData.feedbackType === type ? '#fff' : 'var(--color-brown)',
                    }}
                  >
                    {type}
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
                rows={4}
                placeholder="请输入反馈内容或补充说明"
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
        ) : (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--color-beige-dark)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium" style={{ color: 'var(--color-brown)' }}>{feedback.elderlyPerson}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: feedback.feedbackType === '听懂了' ? '#DCFCE7' : feedback.feedbackType === '还想补充' ? '#E0E7FF' : feedback.feedbackType === '需要再次讲解' ? '#FEF3C7' : '#F3F4F6',
                    color: feedback.feedbackType === '听懂了' ? '#166534' : feedback.feedbackType === '还想补充' ? '#3730A3' : feedback.feedbackType === '需要再次讲解' ? '#92400E' : '#374151',
                  }}
                >
                  {feedback.feedbackType}
                </span>
              </div>
              {feedback.content && (
                <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>{feedback.content}</p>
              )}
              <p className="text-xs mt-3" style={{ color: 'var(--color-brown-light)' }}>
                {new Date(feedback.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>

            {!showConvert ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold" style={{ color: 'var(--color-brown)' }}>家属操作</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowConvert(true)}
                    className="p-3 rounded-lg border text-sm transition-colors hover:bg-[#F5E6C8]"
                    style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                  >
                    转为待跟进事项
                  </button>
                  <button
                    onClick={handleAppendToStory}
                    className="p-3 rounded-lg border text-sm transition-colors hover:bg-[#F5E6C8]"
                    style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                  >
                    补充到来源故事
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg space-y-3" style={{ background: '#FFF8E6', border: '1px solid var(--color-beige-dark)' }}>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--color-brown)' }}>转换为待跟进事项</h4>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>事项标题 *</label>
                  <input
                    type="text"
                    value={convertData.title}
                    onChange={(e) => setConvertData({ ...convertData, title: e.target.value })}
                    placeholder={`跟进：${feedback.feedbackType}`}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>描述</label>
                  <textarea
                    value={convertData.description}
                    onChange={(e) => setConvertData({ ...convertData, description: e.target.value })}
                    rows={2}
                    placeholder={feedback.content || '跟进事项描述'}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>责任人 *</label>
                    <input
                      type="text"
                      value={convertData.assignee}
                      onChange={(e) => setConvertData({ ...convertData, assignee: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>优先级</label>
                    <select
                      value={convertData.priority}
                      onChange={(e) => setConvertData({ ...convertData, priority: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                    >
                      <option value="高">高</option>
                      <option value="中">中</option>
                      <option value="低">低</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>截止日期</label>
                  <input
                    type="date"
                    value={convertData.dueDate}
                    onChange={(e) => setConvertData({ ...convertData, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowConvert(false)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-[#F5E6C8]"
                    style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConvertToFollowUp}
                    disabled={!convertData.title || !convertData.assignee}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--color-amber)' }}
                  >
                    确认转换
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
