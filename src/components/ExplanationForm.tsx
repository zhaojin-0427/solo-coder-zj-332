import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import useStore, { Explanation, Stamp } from '@/store/useStore'

interface StampItem {
  stampId: string
  stampExcerpt: string
  storyExcerpt: string
  audioExcerpt: string
}

interface ExplanationFormProps {
  open: boolean
  onClose: () => void
  explanation?: Explanation | null
}

export default function ExplanationForm({ open, onClose, explanation }: ExplanationFormProps) {
  const { createExplanation, updateExplanation, stamps, fetchStamps } = useStore()
  const [formData, setFormData] = useState({
    title: '',
    themeType: '家庭回忆',
    participants: '',
    targetElderly: '',
    planDate: '',
    keyPoints: '',
    familyReminder: '',
    status: '待讲解',
    createdBy: '',
  })
  const [stampItems, setStampItems] = useState<StampItem[]>([])

  useEffect(() => {
    fetchStamps()
  }, [fetchStamps])

  useEffect(() => {
    if (explanation) {
      setFormData({
        title: explanation.title || '',
        themeType: explanation.themeType || '家庭回忆',
        participants: explanation.participants || '',
        targetElderly: explanation.targetElderly || '',
        planDate: explanation.planDate || '',
        keyPoints: explanation.keyPoints || '',
        familyReminder: explanation.familyReminder || '',
        status: explanation.status || '待讲解',
        createdBy: explanation.createdBy || '',
      })
      setStampItems(
        explanation.stamps?.map((s) => ({
          stampId: s.stampId || '',
          stampExcerpt: s.stampExcerpt || '',
          storyExcerpt: s.storyExcerpt || '',
          audioExcerpt: s.audioExcerpt || '',
        })) || []
      )
    } else {
      setFormData({
        title: '',
        themeType: '家庭回忆',
        participants: '',
        targetElderly: '',
        planDate: new Date().toISOString().split('T')[0],
        keyPoints: '',
        familyReminder: '',
        status: '待讲解',
        createdBy: '',
      })
      setStampItems([])
    }
  }, [explanation, open])

  const addStampItem = () => {
    setStampItems([...stampItems, { stampId: '', stampExcerpt: '', storyExcerpt: '', audioExcerpt: '' }])
  }

  const removeStampItem = (index: number) => {
    setStampItems(stampItems.filter((_, i) => i !== index))
  }

  const updateStampItem = (index: number, field: keyof StampItem, value: string) => {
    const updated = [...stampItems]
    updated[index] = { ...updated[index], [field]: value }
    setStampItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.targetElderly || !formData.planDate || !formData.createdBy) return

    const payload = {
      ...formData,
      stamps: stampItems.filter((s) => s.stampId || s.stampExcerpt || s.storyExcerpt) as any[],
    }

    if (explanation) {
      await updateExplanation(explanation.id, formData)
    } else {
      await createExplanation(payload)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {explanation ? '编辑讲解计划' : '创建讲解计划'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>讲解主题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入讲解主题"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>主题类型</label>
              <select
                value={formData.themeType}
                onChange={(e) => setFormData({ ...formData, themeType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="家庭回忆">家庭回忆</option>
                <option value="节日庆典">节日庆典</option>
                <option value="长辈故事">长辈故事</option>
                <option value="邮品讲解">邮品讲解</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>计划时间 *</label>
              <input
                type="date"
                value={formData.planDate}
                onChange={(e) => setFormData({ ...formData, planDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>讲解对象 *</label>
              <input
                type="text"
                value={formData.targetElderly}
                onChange={(e) => setFormData({ ...formData, targetElderly: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="请输入讲解对象姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>创建人 *</label>
              <input
                type="text"
                value={formData.createdBy}
                onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                placeholder="请输入创建人姓名"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>参与家属</label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="多个家属用逗号分隔"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>讲解重点</label>
            <textarea
              value={formData.keyPoints}
              onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="请输入讲解重点内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>家属提醒</label>
            <textarea
              value={formData.familyReminder}
              onChange={(e) => setFormData({ ...formData, familyReminder: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={2}
              placeholder="讲解时的注意事项、准备物品等"
            />
          </div>
          {explanation && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="待讲解">待讲解</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
                <option value="待回访">待回访</option>
                <option value="已回访">已回访</option>
              </select>
            </div>
          )}

          <div className="border-t pt-5" style={{ borderColor: 'var(--color-beige-dark)' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold" style={{ color: 'var(--color-brown)' }}>关联邮品 / 摘录</h4>
              <button
                type="button"
                onClick={addStampItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-[#F5E6C8]"
                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
              >
                <Plus size={12} /> 添加邮品
              </button>
            </div>
            <div className="space-y-4">
              {stampItems.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>选择邮品</label>
                      <select
                        value={item.stampId}
                        onChange={(e) => updateStampItem(index, 'stampId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                      >
                        <option value="">可选：关联到已建档邮品</option>
                        {stamps.map((s: Stamp) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.issueYear}年)</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStampItem(index)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors mt-5"
                    >
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown-light)' }}>邮品主题摘录</label>
                      <input
                        type="text"
                        value={item.stampExcerpt}
                        onChange={(e) => updateStampItem(index, 'stampExcerpt', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
                        placeholder="关于此邮品的简要描述"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown-light)' }}>来源故事摘要</label>
                      <input
                        type="text"
                        value={item.storyExcerpt}
                        onChange={(e) => updateStampItem(index, 'storyExcerpt', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
                        placeholder="故事的关键内容摘要"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-brown-light)' }}>资料包摘录</label>
                      <input
                        type="text"
                        value={item.audioExcerpt}
                        onChange={(e) => updateStampItem(index, 'audioExcerpt', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2"
                        style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
                        placeholder="关联的回听资料包条目"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {stampItems.length === 0 && (
                <div className="text-center py-8 rounded-lg border-2 border-dashed" style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown-light)' }}>
                  <p className="text-sm">暂无关联邮品</p>
                  <p className="text-xs mt-1">点击上方"添加邮品"按钮添加</p>
                </div>
              )}
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
              disabled={!formData.title || !formData.targetElderly || !formData.planDate || !formData.createdBy}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              {explanation ? '保存修改' : '创建计划'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
