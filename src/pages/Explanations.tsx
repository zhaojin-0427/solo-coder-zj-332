import { useState, useEffect, useMemo } from 'react'
import {
  Plus, X, Edit, Trash2, Search, User, BookOpen, MessageSquare, Clock, Check,
  AlertCircle, Play, Eye, Heart, RefreshCw, MoreHorizontal, Calendar, Users
} from 'lucide-react'
import useStore, {
  Explanation, ExplanationStamp, ExplanationFeedback, ExplanationFollowUp
} from '@/store/useStore'
import ExplanationForm from '@/components/ExplanationForm'
import ExplanationFeedbackForm from '@/components/ExplanationFeedbackForm'
import ExplanationFollowUpForm from '@/components/ExplanationFollowUpForm'
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

const feedbackTypeColors: Record<string, string> = {
  '听懂了': 'bg-green-100 text-green-800',
  '还想补充': 'bg-blue-100 text-blue-800',
  '需要再次讲解': 'bg-amber-100 text-amber-800',
  '其他': 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<string, string> = {
  '高': 'bg-red-100 text-red-800',
  '中': 'bg-yellow-100 text-yellow-800',
  '低': 'bg-green-100 text-green-800',
}

const followUpStatusColors: Record<string, string> = {
  '待处理': 'bg-amber-100 text-amber-800',
  '处理中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
}

export default function Explanations() {
  const {
    explanations,
    currentExplanation,
    explanationStamps,
    explanationFeedback,
    explanationFollowUps,
    explanationVisits,
    fetchExplanations,
    fetchExplanation,
    createExplanation,
    updateExplanation,
    deleteExplanation,
    updateExplanationStatus,
    removeExplanationFeedback,
    removeExplanationFollowUp,
    updateExplanationFollowUpStatus,
    setCurrentExplanation,
  } = useStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterThemeType, setFilterThemeType] = useState('')
  const [filterTarget, setFilterTarget] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editExplanation, setEditExplanation] = useState<Explanation | null>(null)
  const [viewDetail, setViewDetail] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'stamps' | 'feedback' | 'followups' | 'visits'>('overview')
  const [viewMode, setViewMode] = useState<'family' | 'elderly'>('family')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [viewFeedback, setViewFeedback] = useState<ExplanationFeedback | null>(null)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [editFollowUp, setEditFollowUp] = useState<ExplanationFollowUp | null>(null)
  const [followUpFormMode, setFollowUpFormMode] = useState<'edit' | 'add'>('add')
  const [fromFeedback, setFromFeedback] = useState<ExplanationFeedback | null>(null)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [elderlyFeedbackType, setElderlyFeedbackType] = useState<string>('')

  useEffect(() => {
    fetchExplanations()
  }, [fetchExplanations])

  const filtered = useMemo(() => {
    return explanations.filter((e) => {
      if (search && !e.title.includes(search) && !e.keyPoints?.includes(search)) return false
      if (filterStatus && e.status !== filterStatus) return false
      if (filterThemeType && e.themeType !== filterThemeType) return false
      if (filterTarget && e.targetElderly !== filterTarget) return false
      return true
    })
  }, [explanations, search, filterStatus, filterThemeType, filterTarget])

  const elderlyList = useMemo(() => {
    const set = new Set<string>()
    explanations.forEach((e) => e.targetElderly && set.add(e.targetElderly))
    return Array.from(set)
  }, [explanations])

  const handleOpenDetail = async (exp: Explanation) => {
    await fetchExplanation(exp.id)
    setViewDetail(true)
    setActiveTab('overview')
    setViewMode('family')
  }

  const handleCloseDetail = () => {
    setViewDetail(false)
    setCurrentExplanation(null)
    setElderlyFeedbackType('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个讲解计划吗？')) {
      await deleteExplanation(id)
    }
  }

  const handleDeleteFeedback = async (explanationId: string, feedbackId: string) => {
    if (confirm('确定要删除这条反馈吗？')) {
      await removeExplanationFeedback(explanationId, feedbackId)
    }
  }

  const handleDeleteFollowUp = async (explanationId: string, followUpId: string) => {
    if (confirm('确定要删除这条待跟进吗？')) {
      await removeExplanationFollowUp(explanationId, followUpId)
    }
  }

  const handleViewFeedbackDetail = (fb: ExplanationFeedback) => {
    setViewFeedback(fb)
    setShowFeedbackForm(true)
  }

  const handleElderlySubmitFeedback = async () => {
    if (!elderlyFeedbackType || !currentExplanation) return
    const content = (document.getElementById('elderly-feedback-content') as HTMLTextAreaElement)?.value || ''
    const elderlyPerson = currentExplanation.targetElderly
    await useStore.getState().addExplanationFeedback(currentExplanation.id, {
      elderlyPerson,
      feedbackType: elderlyFeedbackType,
      content,
    })
    setElderlyFeedbackType('')
    alert('反馈已提交，感谢您的反馈！')
    await fetchExplanation(currentExplanation.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
          跨代讲解与回访
        </h2>
        <button
          onClick={() => { setEditExplanation(null); setShowForm(true) }}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建讲解计划
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索讲解主题..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部状态</option>
          <option value="待讲解">待讲解</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="待回访">待回访</option>
          <option value="已回访">已回访</option>
        </select>
        <select
          value={filterThemeType}
          onChange={(e) => setFilterThemeType(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部类型</option>
          <option value="家庭回忆">家庭回忆</option>
          <option value="节日庆典">节日庆典</option>
          <option value="长辈故事">长辈故事</option>
          <option value="邮品讲解">邮品讲解</option>
          <option value="其他">其他</option>
        </select>
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

      <div className="space-y-4">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            className="p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
            onClick={() => handleOpenDetail(exp)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
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
                    <User size={12} />
                    讲解对象：{exp.targetElderly}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    计划时间：{exp.planDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    参与家属：{exp.participants || '无'}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    创建人：{exp.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {exp.stampCount || 0} 个关联邮品
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {exp.feedbackCount || 0} 条反馈
                  </span>
                  {exp.followUpCount ? (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={12} />
                      {exp.followUpCount} 个待跟进
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditExplanation(exp); setShowForm(true) }}
                  className="p-2 rounded-lg hover:bg-[#F5E6C8] transition-colors"
                  title="编辑"
                >
                  <Edit size={16} style={{ color: 'var(--color-brown-light)' }} />
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无讲解计划</p>
          <p className="text-sm mt-2">点击右上角「新建讲解计划」开始创建</p>
        </div>
      )}

      <ExplanationForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditExplanation(null) }}
        explanation={editExplanation}
      />

      {viewDetail && currentExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                    {currentExplanation.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[currentExplanation.themeType]}`}>
                    {currentExplanation.themeType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${explanationStatusColors[currentExplanation.status]}`}>
                    {currentExplanation.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'var(--color-brown-light)' }}>
                  <span>讲解对象：<strong style={{ color: 'var(--color-brown)' }}>{currentExplanation.targetElderly}</strong></span>
                  <span>计划时间：{currentExplanation.planDate}</span>
                  <span>创建人：{currentExplanation.createdBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden border mr-2" style={{ borderColor: 'var(--color-beige-dark)' }}>
                  <button
                    onClick={() => setViewMode('family')}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      viewMode === 'family' ? 'text-white' : ''
                    }`}
                    style={{
                      background: viewMode === 'family' ? 'var(--color-amber)' : '#fff',
                      color: viewMode === 'family' ? '#fff' : 'var(--color-brown)',
                    }}
                  >
                    家属视图
                  </button>
                  <button
                    onClick={() => setViewMode('elderly')}
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      viewMode === 'elderly' ? 'text-white' : ''
                    }`}
                    style={{
                      background: viewMode === 'elderly' ? 'var(--color-amber)' : '#fff',
                      color: viewMode === 'elderly' ? '#fff' : 'var(--color-brown)',
                    }}
                  >
                    老人视图
                  </button>
                </div>
                <button onClick={handleCloseDetail} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                  <X size={18} style={{ color: 'var(--color-brown-light)' }} />
                </button>
              </div>
            </div>

            {viewMode === 'family' ? (
              <>
                <div className="border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2' : ''}`}
                      style={{
                        color: activeTab === 'overview' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                        borderColor: activeTab === 'overview' ? 'var(--color-amber)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} />
                        概述
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('stamps')}
                      className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'stamps' ? 'border-b-2' : ''}`}
                      style={{
                        color: activeTab === 'stamps' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                        borderColor: activeTab === 'stamps' ? 'var(--color-amber)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} />
                        关联邮品 ({explanationStamps.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('feedback')}
                      className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'feedback' ? 'border-b-2' : ''}`}
                      style={{
                        color: activeTab === 'feedback' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                        borderColor: activeTab === 'feedback' ? 'var(--color-amber)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} />
                        老人反馈 ({explanationFeedback.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('followups')}
                      className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'followups' ? 'border-b-2' : ''}`}
                      style={{
                        color: activeTab === 'followups' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                        borderColor: activeTab === 'followups' ? 'var(--color-amber)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} />
                        待跟进 ({explanationFollowUps.length})
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('visits')}
                      className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'visits' ? 'border-b-2' : ''}`}
                      style={{
                        color: activeTab === 'visits' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                        borderColor: activeTab === 'visits' ? 'var(--color-amber)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        回访记录 ({explanationVisits?.length || 0})
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-brown)' }}>讲解重点</h4>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-brown-light)' }}>
                            {currentExplanation.keyPoints || '暂无'}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-brown)' }}>家属提醒</h4>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-brown-light)' }}>
                            {currentExplanation.familyReminder || '暂无'}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-brown)' }}>参与家属</h4>
                        <div className="flex flex-wrap gap-2">
                          {(currentExplanation.participants || '').split(',').filter(Boolean).map((p, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--color-beige)', color: 'var(--color-brown)' }}>
                              {p.trim()}
                            </span>
                          ))}
                          {!currentExplanation.participants && (
                            <span className="text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                        <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-brown)' }}>状态流转</h4>
                        <div className="grid grid-cols-5 gap-2 mb-4">
                          {['待讲解', '进行中', '已完成', '待回访', '已回访'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateExplanationStatus(currentExplanation.id, status)}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                currentExplanation.status === status ? 'text-white shadow' : 'border hover:bg-[#F5E6C8]'
                              }`}
                              style={{
                                background: currentExplanation.status === status ? 'var(--color-amber)' : '#fff',
                                borderColor: currentExplanation.status === status ? 'var(--color-amber)' : 'var(--color-beige-dark)',
                                color: currentExplanation.status === status ? '#fff' : 'var(--color-brown)',
                              }}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentExplanation.status === '待讲解' && (
                            <button
                              onClick={() => updateExplanationStatus(currentExplanation.id, '进行中')}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-colors"
                              style={{ background: '#3b82f6' }}
                            >
                              <Play size={14} /> 开始讲解
                            </button>
                          )}
                          {currentExplanation.status === '进行中' && (
                            <button
                              onClick={() => updateExplanationStatus(currentExplanation.id, '已完成')}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-colors"
                              style={{ background: '#22c55e' }}
                            >
                              <Check size={14} /> 完成讲解
                            </button>
                          )}
                          {currentExplanation.status === '已完成' && (
                            <button
                              onClick={() => updateExplanationStatus(currentExplanation.id, '待回访')}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-colors"
                              style={{ background: '#f97316' }}
                            >
                              <RefreshCw size={14} /> 标记待回访
                            </button>
                          )}
                          {currentExplanation.status === '待回访' && (
                            <button
                              onClick={() => setShowVisitForm(true)}
                              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white hover:opacity-90 transition-colors"
                              style={{ background: '#8b5cf6' }}
                            >
                              <Users size={14} /> 记录回访
                            </button>
                          )}
                          <button
                            onClick={() => { setViewFeedback(null); setShowFeedbackForm(true) }}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
                            style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                          >
                            <MessageSquare size={14} /> 添加反馈
                          </button>
                          <button
                            onClick={() => { setEditFollowUp(null); setFromFeedback(null); setFollowUpFormMode('add'); setShowFollowUpForm(true) }}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
                            style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                          >
                            <AlertCircle size={14} /> 添加待跟进
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'stamps' && (
                    <div className="space-y-3">
                      {explanationStamps.length > 0 ? (
                        explanationStamps.map((stamp: ExplanationStamp) => (
                          <div key={stamp.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-beige)' }}>
                                <BookOpen size={20} style={{ color: 'var(--color-amber)' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-medium" style={{ color: 'var(--color-brown)' }}>
                                    {stamp.stampName || '关联邮品摘录'}
                                  </h4>
                                  {stamp.stampName && (
                                    <>
                                      {stamp.issueYear && (
                                        <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>{stamp.issueYear}年</span>
                                      )}
                                      {stamp.stampTheme && (
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige)', color: 'var(--color-brown)' }}>
                                          {stamp.stampTheme}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                {stamp.stampSource && (
                                  <p className="text-xs mb-1" style={{ color: 'var(--color-brown-light)' }}>
                                    来源：{stamp.stampSource} · 册页：{stamp.albumPage || '未归册'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {stamp.stampExcerpt && (
                                <div>
                                  <span className="text-xs font-medium" style={{ color: 'var(--color-amber)' }}>邮品主题：</span>
                                  <span style={{ color: 'var(--color-brown)' }}>{stamp.stampExcerpt}</span>
                                </div>
                              )}
                              {stamp.storyExcerpt && (
                                <div>
                                  <span className="text-xs font-medium" style={{ color: 'var(--color-amber)' }}>来源故事：</span>
                                  <span style={{ color: 'var(--color-brown)' }}>{stamp.storyExcerpt}</span>
                                </div>
                              )}
                              {stamp.audioExcerpt && (
                                <div>
                                  <span className="text-xs font-medium" style={{ color: 'var(--color-amber)' }}>资料包：</span>
                                  <span style={{ color: 'var(--color-brown)' }}>{stamp.audioExcerpt}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                          <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
                          <p>暂无关联邮品</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'feedback' && (
                    <div className="space-y-3">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => { setViewFeedback(null); setShowFeedbackForm(true) }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                          style={{ background: 'var(--color-amber)' }}
                        >
                          <Plus size={12} /> 添加反馈
                        </button>
                      </div>
                      {explanationFeedback.length > 0 ? (
                        explanationFeedback.map((fb: ExplanationFeedback) => (
                          <div
                            key={fb.id}
                            className="p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-all"
                            style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                            onClick={() => handleViewFeedbackDetail(fb)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="font-medium" style={{ color: 'var(--color-brown)' }}>{fb.elderlyPerson}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${feedbackTypeColors[fb.feedbackType]}`}>
                                    {fb.feedbackType}
                                  </span>
                                </div>
                                {fb.content && (
                                  <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>{fb.content}</p>
                                )}
                                <p className="text-xs mt-2" style={{ color: 'var(--color-brown-light)' }}>
                                  {new Date(fb.createdAt).toLocaleString('zh-CN')}
                                </p>
                              </div>
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setFromFeedback(fb)
                                    setEditFollowUp(null)
                                    setFollowUpFormMode('add')
                                    setShowFollowUpForm(true)
                                  }}
                                  className="p-1.5 rounded hover:bg-[#F5E6C8] transition-colors text-xs"
                                  title="转为待跟进"
                                >
                                  <AlertCircle size={14} style={{ color: 'var(--color-brown-light)' }} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeedback(currentExplanation.id, fb.id)}
                                  className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 size={14} style={{ color: '#ef4444' }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                          <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
                          <p>暂无反馈</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'followups' && (
                    <div className="space-y-3">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => { setEditFollowUp(null); setFromFeedback(null); setFollowUpFormMode('add'); setShowFollowUpForm(true) }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                          style={{ background: 'var(--color-amber)' }}
                        >
                          <Plus size={12} /> 添加待跟进
                        </button>
                      </div>
                      {explanationFollowUps.length > 0 ? (
                        explanationFollowUps.map((fu: ExplanationFollowUp) => (
                          <div
                            key={fu.id}
                            className="p-4 rounded-lg border"
                            style={{
                              borderColor: 'var(--color-beige-dark)',
                              background: fu.status === '已完成' ? '#f0fdf4' : '#fff',
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h4 className="font-medium" style={{ color: 'var(--color-brown)' }}>{fu.title}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[fu.priority]}`}>
                                    {fu.priority}优先级
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${followUpStatusColors[fu.status]}`}>
                                    {fu.status}
                                  </span>
                                  {fu.source === '反馈转换' && (
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#5B21B6' }}>
                                      反馈转换
                                    </span>
                                  )}
                                  {fu.feedbackElderly && (
                                    <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                                      来自 {fu.feedbackElderly} 的「{fu.feedbackTypeSource}」
                                    </span>
                                  )}
                                </div>
                                {fu.description && (
                                  <p className="text-sm mb-2" style={{ color: 'var(--color-brown-light)' }}>{fu.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                                  <span>责任人：{fu.assignee}</span>
                                  {fu.dueDate && <span>截止：{fu.dueDate}</span>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {fu.status === '待处理' && (
                                  <button
                                    onClick={() => updateExplanationFollowUpStatus(currentExplanation.id, fu.id, '处理中')}
                                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                    style={{ background: '#3b82f6' }}
                                  >
                                    <Clock size={12} /> 处理
                                  </button>
                                )}
                                {fu.status === '处理中' && (
                                  <button
                                    onClick={() => updateExplanationFollowUpStatus(currentExplanation.id, fu.id, '已完成')}
                                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                    style={{ background: '#22c55e' }}
                                  >
                                    <Check size={12} /> 完成
                                  </button>
                                )}
                                <button
                                  onClick={() => { setEditFollowUp(fu); setFromFeedback(null); setFollowUpFormMode('edit'); setShowFollowUpForm(true) }}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[#F5E6C8]"
                                  style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                                >
                                  <Edit size={12} /> 编辑
                                </button>
                                <button
                                  onClick={() => handleDeleteFollowUp(currentExplanation.id, fu.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#ef4444' }}
                                >
                                  <Trash2 size={12} /> 删除
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                          <AlertCircle size={40} className="mx-auto mb-4 opacity-30" />
                          <p>暂无待跟进事项</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'visits' && (
                    <div className="space-y-3">
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => setShowVisitForm(true)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                          style={{ background: 'var(--color-amber)' }}
                        >
                          <Plus size={12} /> 添加回访记录
                        </button>
                      </div>
                      {explanationVisits && explanationVisits.length > 0 ? (
                        explanationVisits.map((visit: any) => (
                          <div key={visit.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                <Users size={18} style={{ color: '#8b5cf6' }} />
                              </div>
                              <div>
                                <div className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{visit.visitor}</div>
                                <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>{visit.visitDate}</div>
                              </div>
                            </div>
                            {visit.visitNote && (
                              <div className="mb-2">
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-amber)' }}>回访记录</div>
                                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-brown)' }}>{visit.visitNote}</p>
                              </div>
                            )}
                            {visit.elderlyResponse && (
                              <div className="mb-2">
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-amber)' }}>老人反应</div>
                                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-brown)' }}>{visit.elderlyResponse}</p>
                              </div>
                            )}
                            {visit.nextPlan && (
                              <div>
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-amber)' }}>后续计划</div>
                                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-brown)' }}>{visit.nextPlan}</p>
                              </div>
                            )}
                            <p className="text-xs mt-3" style={{ color: 'var(--color-brown-light)' }}>
                              记录时间：{new Date(visit.createdAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                          <Users size={40} className="mx-auto mb-4 opacity-30" />
                          <p>暂无回访记录</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="text-center py-6 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-brown-light)' }}>为您准备的讲解内容</p>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                      {currentExplanation.title}
                    </h2>
                    <p className="text-sm mt-3" style={{ color: 'var(--color-brown-light)' }}>
                      讲解对象：<strong style={{ color: 'var(--color-amber)' }}>{currentExplanation.targetElderly}</strong>
                      &nbsp;·&nbsp; 计划时间：{currentExplanation.planDate}
                    </p>
                  </div>

                  {currentExplanation.familyReminder && (
                    <div className="p-4 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
                      <div className="flex items-start gap-3">
                        <Heart size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                        <div>
                          <div className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>家人的温馨提醒</div>
                          <p className="text-sm whitespace-pre-wrap" style={{ color: '#78350F' }}>{currentExplanation.familyReminder}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                      <BookOpen size={20} style={{ color: 'var(--color-amber)' }} />
                      关联邮品与故事
                    </h3>
                    <div className="space-y-4">
                      {explanationStamps.map((stamp: ExplanationStamp) => (
                        <div key={stamp.id} className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-beige)' }}>
                              <BookOpen size={24} style={{ color: 'var(--color-amber)' }} />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold" style={{ color: 'var(--color-brown)' }}>
                                {stamp.stampName || '邮品主题'}
                              </h4>
                              {stamp.issueYear && (
                                <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>{stamp.issueYear}年发行</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {stamp.stampExcerpt && (
                              <div className="p-3 rounded-lg" style={{ background: '#FFFBF0' }}>
                                <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-amber)' }}>📮 邮品主题</div>
                                <p className="text-base leading-relaxed" style={{ color: 'var(--color-brown)' }}>{stamp.stampExcerpt}</p>
                              </div>
                            )}
                            {stamp.storyExcerpt && (
                              <div className="p-3 rounded-lg" style={{ background: '#FEF3C7' }}>
                                <div className="text-xs font-medium mb-1" style={{ color: '#D97706' }}>📖 来源故事</div>
                                <p className="text-base leading-relaxed" style={{ color: '#78350F' }}>{stamp.storyExcerpt}</p>
                              </div>
                            )}
                            {stamp.audioExcerpt && (
                              <div className="p-3 rounded-lg" style={{ background: '#EDE9FE' }}>
                                <div className="text-xs font-medium mb-1" style={{ color: '#7C3AED' }}>🎧 回听资料</div>
                                <p className="text-base leading-relaxed" style={{ color: '#5B21B6' }}>{stamp.audioExcerpt}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t" style={{ borderColor: 'var(--color-beige-dark)' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                      <MessageSquare size={20} style={{ color: 'var(--color-amber)' }} />
                      请告诉我您的感受
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { type: '听懂了', icon: Check, color: '#22c55e', label: '我听懂了' },
                        { type: '还想补充', icon: MoreHorizontal, color: '#3b82f6', label: '我还想补充' },
                        { type: '需要再次讲解', icon: RefreshCw, color: '#f59e0b', label: '需要再讲一遍' },
                        { type: '其他', icon: Eye, color: '#6b7280', label: '其他想法' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => setElderlyFeedbackType(item.type)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            elderlyFeedbackType === item.type ? 'text-white shadow-lg scale-[1.02]' : 'hover:bg-[#F5E6C8]'
                          }`}
                          style={{
                            background: elderlyFeedbackType === item.type ? item.color : '#fff',
                            borderColor: elderlyFeedbackType === item.type ? item.color : 'var(--color-beige-dark)',
                            color: elderlyFeedbackType === item.type ? '#fff' : 'var(--color-brown)',
                          }}
                        >
                          <item.icon size={24} className="mx-auto mb-2" />
                          <div className="text-base font-medium">{item.label}</div>
                        </button>
                      ))}
                    </div>
                    <textarea
                      id="elderly-feedback-content"
                      rows={3}
                      placeholder="有什么想说的都可以写在这里..."
                      className="w-full px-4 py-3 rounded-xl border-2 text-base focus:outline-none focus:ring-2 resize-none"
                      style={{ borderColor: 'var(--color-beige-dark)', background: '#fff', color: 'var(--color-brown)' }}
                    />
                    <button
                      onClick={handleElderlySubmitFeedback}
                      disabled={!elderlyFeedbackType}
                      className="w-full mt-4 py-4 rounded-xl text-lg font-semibold text-white shadow-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'var(--color-amber)' }}
                    >
                      提交反馈
                    </button>
                  </div>

                  {explanationFeedback.length > 0 && (
                    <div className="pt-6 border-t" style={{ borderColor: 'var(--color-beige-dark)' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                        过往反馈
                      </h3>
                      <div className="space-y-3">
                        {explanationFeedback.slice(0, 3).map((fb: ExplanationFeedback) => (
                          <div key={fb.id} className="p-4 rounded-xl" style={{ background: '#fff', border: '1px solid var(--color-beige-dark)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${feedbackTypeColors[fb.feedbackType]}`}>
                                {fb.feedbackType}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                                {new Date(fb.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            {fb.content && (
                              <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{fb.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ExplanationFeedbackForm
        open={showFeedbackForm}
        onClose={() => { setShowFeedbackForm(false); setViewFeedback(null) }}
        explanationId={currentExplanation?.id || ''}
        feedback={viewFeedback}
      />

      <ExplanationFollowUpForm
        open={showFollowUpForm}
        onClose={() => { setShowFollowUpForm(false); setEditFollowUp(null); setFromFeedback(null) }}
        explanationId={currentExplanation?.id || ''}
        item={editFollowUp}
        mode={followUpFormMode}
        feedback={fromFeedback}
      />

      <ExplanationVisitForm
        open={showVisitForm}
        onClose={() => setShowVisitForm(false)}
        explanationId={currentExplanation?.id || ''}
      />
    </div>
  )
}
