import { useState, useEffect } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import useStore from '@/store/useStore'
import CirculationForm from '@/components/CirculationForm'

export default function Circulation() {
  const { circulations, stamps, fetchCirculations, fetchStamps, updateCirculation } = useStore()
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchCirculations()
    fetchStamps()
  }, [fetchCirculations, fetchStamps])

  const getStampName = (stampId: string) => {
    return stamps.find((s) => s.id === stampId)?.name || '未知邮品'
  }

  const filtered = circulations.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false
    return true
  })

  const handleReturn = async (id: string) => {
    await updateCirculation(id, { status: '已完成', returnDate: new Date().toISOString().split('T')[0] })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>借阅流转</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建流转
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部状态</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
        </select>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-beige-dark)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-beige-dark)' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>邮品名称</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>类型</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>借出人</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>借入人</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>用途</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>借出日期</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>归还日期</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>状态</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-brown)' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((circ) => (
              <tr key={circ.id} className="border-t transition-colors hover:bg-[#FFF8EC]" style={{ borderColor: 'var(--color-beige-dark)' }}>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown)' }}>{getStampName(circ.stampId)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    circ.type === '借出' ? 'bg-blue-100 text-blue-800' :
                    circ.type === '归还' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {circ.type}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown)' }}>{circ.fromPerson}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown)' }}>{circ.toPerson}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown)' }}>{circ.purpose}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown-light)' }}>{circ.borrowDate}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-brown-light)' }}>{circ.returnDate || '-'}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      circ.status === '已完成' ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-xs" style={{ color: 'var(--color-brown)' }}>{circ.status}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  {circ.status === '进行中' && (
                    <button
                      onClick={() => handleReturn(circ.id)}
                      className="text-xs px-3 py-1 rounded-lg border transition-colors hover:bg-green-50"
                      style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}
                    >
                      归还确认
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
            <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-30" />
            <p>暂无流转记录</p>
          </div>
        )}
      </div>

      <CirculationForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
