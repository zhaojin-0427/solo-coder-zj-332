import { useState, useEffect, useMemo } from 'react'
import {
  Users, Clock, Calendar, BookOpen, Eye, AlertCircle, Check, MessageSquare, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useStore, { Explanation } from '@/store/useStore'
import ExplanationVisitForm from '@/components/ExplanationVisitForm'

const explanationStatusColors: Record<string, string> = {
  '待讲解': 'bg-amber-100 text-amber-800',
  '进行中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
  '待回访': 'bg-orange-100 text-orange-800',
  '已回访': 'bg-purple-100 text-purple-800',
}

const themeTypeColors: Record<string, string> = {
  '家庭回忆': 'bg-pink-100 text-pink-800',
  '节日庆典': 'bg-orange-100 text-orange-800',
  '长辈故事': 'bg-cyan-100 text-cyan-800',
  '邮品讲解': 'bg-green-100 text-green-800',
  '其他': 'bg-gray-100 text-gray-800',
}

export default function ExplanationVisits() {
  const navigate = useNavigate()
  const { explanations, pendingVisits, fetchExplanations, fetchPendingVisits, fetchExplanation,
    updateExplanationStatus, setCurrentExplanation } = useStore()

  const [view, setView] = useState<'pending' | 'all'>('pending')
  const [filterTarget, setFilterTarget] = useState('')
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [activeExplanationId, setActiveExplanationId] = useState('')

  useEffect(() => {
    fetchExplanations()
    fetchPendingVisits()
  }, [fetchExplanations, fetchPendingVisits])

  const displayList = useMemo(() => {
    let list = view === 'pending' ? pendingVisits : explanations
    if (filterTarget) {
      list = list.filter((e) => e.targetElderly === filterTarget)
    }
    return list
  }, [view, pendingVisits, explanations, filterTarget])

  const visitedList = useMemo(() => {
    return explanations.filter((e) => e.status === '已回访')
  }, [explanations])

  const elderlyList = useMemo(() => {
    const set = new Set<string>()
    explanations.forEach((e) => e.targetElderly && set.add(e.targetElderly))
    return Array.from(set)
  }, [explanations])

  const pendingCount = pendingVisits.length
  const completedCount = visitedList.length

  const handleOpenVisit = async (exp: Explanation) => {
    await fetchExplanation(exp.id)
    setActiveExplanationId(exp.id)
    setShowVisitForm(true)
  }

  const handleMarkComplete = async (id: string) => {
    await updateExplanationStatus(id, '已回访')
    fetchPendingVisits()
  }

  const handleViewDetail = async (exp: Explanation) => {
    setCurrentExplanation(exp)
    navigate('/explanations')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
          讲解回访管理
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.15)' }}>
              <AlertCircle size={20} style={{ color: '#f97316' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{pendingCount}</div>
              <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>待回访</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
              <Check size={20} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{completedCount}</div>
              <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>已回访</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <Users size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{elderlyList.length}</div>
              <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>涉及老人数</div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <BookOpen size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{explanations.length}</div>
              <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>讲解计划总数</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-beige-dark)' }}>
          <button
            onClick={() => setView('pending')}
            className={`px-5 py-2 text-sm transition-colors ${
              view === 'pending' ? 'text-white font-medium' : ''
            }`}
            style={{
              background: view === 'pending' ? 'var(--color-amber)' : '#fff',
              color: view === 'pending' ? '#fff' : 'var(--color-brown)',
            }}
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={14} />
              待回访列表 {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  {pendingCount}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setView('all')}
            className={`px-5 py-2 text-sm transition-colors ${
              view === 'all' ? 'text-white font-medium' : ''
            }`}
            style={{
              background: view === 'all' ? 'var(--color-amber)' : '#fff',
              color: view === 'all' ? '#fff' : 'var(--color-brown)',
            }}
          >
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              全部讲解计划
            </span>
          </button>
        </div>
        <select
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部老人</option>
          {elderlyList.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {view === 'pending' && pendingCount === 0 ? (
        <div className="text-center py-20 rounded-xl border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <Check size={48} className="mx-auto mb-4 opacity-30" style={{ color: '#22c55e' }} />
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-brown)' }}>所有讲解均已回访</p>
          <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>切换到「全部讲解计划」查看完整列表</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-xl border shadow-sm hover:shadow-md transition-all"
              style={{
                borderColor: exp.status === '待回访' ? '#f97316' : 'var(--color-beige-dark)',
                background: exp.status === '待回访' ? '#fff7ed' : '#FFFBF0',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-brown)' }}>{exp.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[exp.themeType]}`}>
                      {exp.themeType}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${explanationStatusColors[exp.status]}`}>
                      {exp.status}
                    </span>
                  </div>
                  {exp.keyPoints && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-brown-light)' }}>{exp.keyPoints}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      讲解对象：<strong style={{ color: 'var(--color-brown)' }}>{exp.targetElderly}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      计划时间：{exp.planDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {exp.stampCount || 0} 个关联邮品
                    </span>
                    {exp.feedbackCount ? (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {exp.feedbackCount} 条反馈
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewDetail(exp)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border transition-colors hover:bg-[#F5E6C8]"
                    style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                  >
                    <Eye size={14} /> 查看详情
                  </button>
                  {exp.status === '待回访' && (
                    <>
                      <button
                        onClick={() => handleOpenVisit(exp)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                        style={{ background: '#8b5cf6' }}
                      >
                        <Users size={14} /> 记录回访
                      </button>
                      <button
                        onClick={() => handleMarkComplete(exp.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs border transition-colors hover:bg-green-50"
                        style={{ borderColor: '#22c55e', color: '#22c55e' }}
                      >
                        <Check size={14} /> 标记已回访
                      </button>
                    </>
                  )}
                  <ChevronRight size={18} className="opacity-30" style={{ color: 'var(--color-brown)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExplanationVisitForm
        open={showVisitForm}
        onClose={() => setShowVisitForm(false)}
        explanationId={activeExplanationId}
      />
    </div>
  )
}
