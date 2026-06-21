import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useStore, { ExhibitionStamp } from '@/store/useStore'

interface ExhibitionStampFormProps {
  open: boolean
  onClose: () => void
  exhibitionId: string
  stamp?: ExhibitionStamp | null
  mode?: 'edit' | 'add'
  availableStamps?: { id: string; name: string }[]
}

export default function ExhibitionStampForm({ open, onClose, exhibitionId, stamp, mode = 'edit', availableStamps }: ExhibitionStampFormProps) {
  const { addExhibitionStamp, updateExhibitionStamp } = useStore()
  const [formData, setFormData] = useState({
    stampId: '',
    displayRole: '主展品',
    displayNote: '',
    expectedBorrowDate: '',
    expectedReturnDate: '',
    keeper: '',
    status: '候选',
    displayNarration: '',
    memorialMeaning: '',
  })

  useEffect(() => {
    if (stamp && mode === 'edit') {
      setFormData({
        stampId: stamp.stampId || '',
        displayRole: stamp.displayRole || '主展品',
        displayNote: stamp.displayNote || '',
        expectedBorrowDate: stamp.expectedBorrowDate || '',
        expectedReturnDate: stamp.expectedReturnDate || '',
        keeper: stamp.keeper || '',
        status: stamp.status || '候选',
        displayNarration: stamp.displayNarration || '',
        memorialMeaning: stamp.memorialMeaning || '',
      })
    } else {
      setFormData({
        stampId: '',
        displayRole: '主展品',
        displayNote: '',
        expectedBorrowDate: '',
        expectedReturnDate: '',
        keeper: '',
        status: '候选',
        displayNarration: '',
        memorialMeaning: '',
      })
    }
  }, [stamp, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.keeper || (mode === 'add' && !formData.stampId)) return

    if (mode === 'edit' && stamp) {
      await updateExhibitionStamp(exhibitionId, stamp.stampId, formData)
    } else {
      await addExhibitionStamp(exhibitionId, formData)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
      <div className="rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
            {mode === 'edit' ? '编辑展陈邮品' : '添加候选邮品'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
            <X size={18} style={{ color: 'var(--color-brown-light)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>选择邮品 *</label>
              <select
                value={formData.stampId}
                onChange={(e) => setFormData({ ...formData, stampId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="">请选择邮品</option>
                {availableStamps?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>展陈角色</label>
              <select
                value={formData.displayRole}
                onChange={(e) => setFormData({ ...formData, displayRole: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="主展品">主展品</option>
                <option value="辅助展品">辅助展品</option>
                <option value="装饰展品">装饰展品</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              >
                <option value="候选">候选</option>
                <option value="待确认">待确认</option>
                <option value="已确认">已确认</option>
                <option value="暂缓">暂缓</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>展示备注</label>
            <textarea
              value={formData.displayNote}
              onChange={(e) => setFormData({ ...formData, displayNote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={2}
              placeholder="如：放置位置、展示说明等"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>预计借出日期</label>
              <input
                type="date"
                value={formData.expectedBorrowDate}
                onChange={(e) => setFormData({ ...formData, expectedBorrowDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>预计归还日期</label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>保管责任人 *</label>
            <input
              type="text"
              value={formData.keeper}
              onChange={(e) => setFormData({ ...formData, keeper: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              placeholder="请输入保管责任人姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>展陈讲述词（老人补充）</label>
            <textarea
              value={formData.displayNarration}
              onChange={(e) => setFormData({ ...formData, displayNarration: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={3}
              placeholder="老人可以在这里补充这枚邮品在展示时的讲述内容..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-brown)' }}>纪念意义（老人补充）</label>
            <textarea
              value={formData.memorialMeaning}
              onChange={(e) => setFormData({ ...formData, memorialMeaning: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
              rows={2}
              placeholder="这枚邮品背后的纪念意义..."
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
              disabled={!formData.keeper || (mode === 'add' && !formData.stampId)}
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
