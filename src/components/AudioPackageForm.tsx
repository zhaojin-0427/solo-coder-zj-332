import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { AudioPackage } from '@/store/useStore'

interface AudioPackageFormProps {
  open: boolean
  onClose: () => void
  audioPackage?: AudioPackage | null
}

export default function AudioPackageForm({ open, onClose, audioPackage }: AudioPackageFormProps) {
  const { createAudioPackage, updateAudioPackage } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    themeType: '家庭回忆',
    description: '',
    targetElderly: '',
    status: '草稿',
    createdBy: '',
  })

  useEffect(() => {
    if (audioPackage) {
      setFormData({
        name: audioPackage.name || '',
        themeType: audioPackage.themeType || '家庭回忆',
        description: audioPackage.description || '',
        targetElderly: audioPackage.targetElderly || '',
        status: audioPackage.status || '草稿',
        createdBy: audioPackage.createdBy || '',
      })
    } else {
      setFormData({
        name: '',
        themeType: '家庭回忆',
        description: '',
        targetElderly: '',
        status: '草稿',
        createdBy: '',
      })
    }
  }, [audioPackage, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.targetElderly || !formData.createdBy) return

    if (audioPackage) {
      await updateAudioPackage(audioPackage.id, formData)
    } else {
      await createAudioPackage(formData)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {audioPackage ? '编辑回听资料包' : '创建回听资料包'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>资料包名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入资料包名称"
            />
          </div>
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
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>资料包描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="请输入资料包描述"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>目标老人 *</label>
            <input
              type="text"
              value={formData.targetElderly}
              onChange={(e) => setFormData({ ...formData, targetElderly: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入目标老人姓名"
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
              <option value="草稿">草稿</option>
              <option value="制作中">制作中</option>
              <option value="已完成">已完成</option>
              <option value="已归档">已归档</option>
            </select>
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
              disabled={!formData.name || !formData.targetElderly || !formData.createdBy}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--color-amber)' }}
            >
              {audioPackage ? '保存修改' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
