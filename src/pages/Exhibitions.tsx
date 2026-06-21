import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Edit, Trash2, Search, Check, Clock, RefreshCw, XCircle, Calendar, MapPin, User, BookOpen, Eye, EyeOff } from 'lucide-react'
import useStore, { Exhibition, ExhibitionStamp } from '@/store/useStore'
import ExhibitionForm from '@/components/ExhibitionForm'
import ExhibitionStampForm from '@/components/ExhibitionStampForm'
import StampSelector from '@/components/StampSelector'
import StampReplacer from '@/components/StampReplacer'

const statusColors: Record<string, string> = {
  '候选': 'bg-gray-100 text-gray-800',
  '待确认': 'bg-amber-100 text-amber-800',
  '已确认': 'bg-green-100 text-green-800',
  '暂缓': 'bg-yellow-100 text-yellow-800',
  '已替换': 'bg-purple-100 text-purple-800',
  '已移出': 'bg-red-100 text-red-800',
}

const exhibitionStatusColors: Record<string, string> = {
  '草稿': 'bg-gray-100 text-gray-800',
  '进行中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
}

const themeTypeColors: Record<string, string> = {
  '社区展览': 'bg-cyan-100 text-cyan-800',
  '家庭纪念日': 'bg-pink-100 text-pink-800',
  '节日主题': 'bg-orange-100 text-orange-800',
  '其他': 'bg-gray-100 text-gray-800',
}

export default function Exhibitions() {
  const {
    exhibitions,
    exhibitionStamps,
    currentExhibition,
    stamps,
    fetchExhibitions,
    fetchExhibition,
    fetchExhibitionStamps,
    fetchStamps,
    fetchThemes,
    deleteExhibition,
    setCurrentExhibition,
    addExhibitionStamp,
    confirmExhibitionStamp,
    deferExhibitionStamp,
    replaceExhibitionStamp,
    removeExhibitionStamp,
  } = useStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterThemeType, setFilterThemeType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editExhibition, setEditExhibition] = useState<Exhibition | null>(null)
  const [viewDetail, setViewDetail] = useState(false)
  const [showStampForm, setShowStampForm] = useState(false)
  const [editStamp, setEditStamp] = useState<ExhibitionStamp | null>(null)
  const [stampFormMode, setStampFormMode] = useState<'edit' | 'add'>('add')
  const [showStampSelector, setShowStampSelector] = useState(false)
  const [showReplacer, setShowReplacer] = useState(false)
  const [replacingStamp, setReplacingStamp] = useState<ExhibitionStamp | null>(null)
  const [filterStampStatus, setFilterStampStatus] = useState('')
  const [showRemoved, setShowRemoved] = useState(false)

  useEffect(() => {
    fetchExhibitions()
    fetchStamps()
    fetchThemes()
  }, [fetchExhibitions, fetchStamps, fetchThemes])

  const filtered = useMemo(() => {
    return exhibitions.filter((e) => {
      if (search && !e.name.includes(search) && !e.description?.includes(search)) return false
      if (filterStatus && e.status !== filterStatus) return false
      if (filterThemeType && e.themeType !== filterThemeType) return false
      return true
    })
  }, [exhibitions, search, filterStatus, filterThemeType])

  const activeExhibitionStamps = useMemo(() => {
    return exhibitionStamps.filter((s) => showRemoved ? true : s.status !== '已移出' && s.status !== '已替换')
  }, [exhibitionStamps, showRemoved])

  const filteredExhibitionStamps = useMemo(() => {
    if (!filterStampStatus) return activeExhibitionStamps
    return activeExhibitionStamps.filter((s) => s.status === filterStampStatus)
  }, [activeExhibitionStamps, filterStampStatus])

  const selectedStampIds = useMemo(() => {
    return exhibitionStamps
      .filter((s) => s.status !== '已移出' && s.status !== '已替换')
      .map((s) => s.stampId)
  }, [exhibitionStamps])

  const handleOpenDetail = async (exhibition: Exhibition) => {
    await fetchExhibition(exhibition.id)
    await fetchExhibitionStamps(exhibition.id)
    setViewDetail(true)
  }

  const handleCloseDetail = () => {
    setViewDetail(false)
    setCurrentExhibition(null)
    setFilterStampStatus('')
    setShowRemoved(false)
  }

  const handleAddStamp = async (stampIds: string[]) => {
    if (!currentExhibition) return
    for (const stampId of stampIds) {
      await addExhibitionStamp(currentExhibition.id, {
        stampId,
        displayRole: '主展品',
        keeper: currentExhibition.createdBy || '',
        status: '候选',
      })
    }
  }

  const handleReplaceStamp = async (newStampId: string) => {
    if (!currentExhibition || !replacingStamp) return
    const keeperInput = (document.querySelector('input[placeholder="保管责任人"]') as HTMLInputElement)?.value || replacingStamp.keeper
    const roleSelect = (document.querySelector('select') as HTMLSelectElement)?.value || '主展品'
    await replaceExhibitionStamp(currentExhibition.id, replacingStamp.stampId, newStampId, roleSelect, keeperInput)
    setReplacingStamp(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个展陈计划吗？')) {
      await deleteExhibition(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>展陈策划</h2>
        <button
          onClick={() => { setEditExhibition(null); setShowForm(true) }}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建展陈
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索展陈名称..."
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
          <option value="草稿">草稿</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
        </select>
        <select
          value={filterThemeType}
          onChange={(e) => setFilterThemeType(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部类型</option>
          <option value="社区展览">社区展览</option>
          <option value="家庭纪念日">家庭纪念日</option>
          <option value="节日主题">节日主题</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((exhibition) => (
          <div
            key={exhibition.id}
            className="p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
            onClick={() => handleOpenDetail(exhibition)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-brown)' }}>{exhibition.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[exhibition.themeType]}`}>
                    {exhibition.themeType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${exhibitionStatusColors[exhibition.status]}`}>
                    {exhibition.status}
                  </span>
                </div>
                {exhibition.description && (
                  <p className="text-sm mb-3" style={{ color: 'var(--color-brown-light)' }}>{exhibition.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                  {exhibition.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {exhibition.startDate} ~ {exhibition.endDate || '待定'}
                    </span>
                  )}
                  {exhibition.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {exhibition.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {exhibition.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {exhibition.stampCount || 0} 枚候选邮品
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditExhibition(exhibition); setShowForm(true) }}
                  className="p-2 rounded-lg hover:bg-[#F5E6C8] transition-colors"
                  title="编辑"
                >
                  <Edit size={16} style={{ color: 'var(--color-brown-light)' }} />
                </button>
                <button
                  onClick={() => handleDelete(exhibition.id)}
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
          <p>暂无展陈计划</p>
        </div>
      )}

      <ExhibitionForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditExhibition(null) }}
        exhibition={editExhibition}
      />

      {viewDetail && currentExhibition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                  {currentExhibition.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[currentExhibition.themeType]}`}>
                    {currentExhibition.themeType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${exhibitionStatusColors[currentExhibition.status]}`}>
                    {currentExhibition.status}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                    创建人: {currentExhibition.createdBy}
                  </span>
                </div>
              </div>
              <button onClick={handleCloseDetail} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>

            {currentExhibition.description && (
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{currentExhibition.description}</p>
              </div>
            )}

            <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--color-beige-dark)' }}>
              <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                {currentExhibition.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {currentExhibition.startDate} ~ {currentExhibition.endDate || '待定'}
                  </span>
                )}
                {currentExhibition.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {currentExhibition.location}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStampStatus}
                  onChange={(e) => setFilterStampStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border text-xs"
                  style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                >
                  <option value="">全部状态</option>
                  <option value="候选">候选</option>
                  <option value="待确认">待确认</option>
                  <option value="已确认">已确认</option>
                  <option value="暂缓">暂缓</option>
                </select>
                <button
                  onClick={() => setShowRemoved(!showRemoved)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-[#F5E6C8]"
                  style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                >
                  {showRemoved ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showRemoved ? '隐藏' : '显示'}已移出
                </button>
                <button
                  onClick={() => setShowStampSelector(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                  style={{ background: 'var(--color-amber)' }}
                >
                  <Plus size={12} /> 添加邮品
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {filteredExhibitionStamps.length > 0 ? (
                <div className="space-y-3">
                  {filteredExhibitionStamps.map((es) => (
                    <div
                      key={es.id}
                      className="p-4 rounded-lg border"
                      style={{
                        borderColor: 'var(--color-beige-dark)',
                        background: es.status === '已移出' || es.status === '已替换' ? '#f3f4f6' : '#fff',
                        opacity: es.status === '已移出' || es.status === '已替换' ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-medium truncate" style={{ color: 'var(--color-brown)' }}>{es.stampName}</h4>
                            <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                              {es.issueYear}年 · {es.condition} · {es.albumPage || '未归册'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[es.status]}`}>
                              {es.status}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}>
                              {es.displayRole}
                            </span>
                          </div>
                          {es.displayNote && (
                            <p className="text-sm mb-2" style={{ color: 'var(--color-brown-light)' }}>
                              <span className="font-medium">展示备注：</span>{es.displayNote}
                            </p>
                          )}
                          {es.displayNarration && (
                            <div className="mb-2 p-2 rounded" style={{ background: 'var(--color-beige)' }}>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>展陈讲述词：</p>
                              <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{es.displayNarration}</p>
                            </div>
                          )}
                          {es.memorialMeaning && (
                            <div className="mb-2 p-2 rounded" style={{ background: '#FEF3C7' }}>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>纪念意义：</p>
                              <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{es.memorialMeaning}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                            <span>保管人：{es.keeper}</span>
                            {es.expectedBorrowDate && <span>预计借出：{es.expectedBorrowDate}</span>}
                            {es.expectedReturnDate && <span>预计归还：{es.expectedReturnDate}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {es.status !== '已移出' && es.status !== '已替换' && (
                            <>
                              <button
                                onClick={() => confirmExhibitionStamp(currentExhibition.id, es.stampId)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#22c55e' }}
                                title="确认"
                              >
                                <Check size={12} /> 确认
                              </button>
                              <button
                                onClick={() => deferExhibitionStamp(currentExhibition.id, es.stampId)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#eab308' }}
                                title="暂缓"
                              >
                                <Clock size={12} /> 暂缓
                              </button>
                              <button
                                onClick={() => { setReplacingStamp(es); setShowReplacer(true) }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#8b5cf6' }}
                                title="替换"
                              >
                                <RefreshCw size={12} /> 替换
                              </button>
                              <button
                                onClick={() => removeExhibitionStamp(currentExhibition.id, es.stampId)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#ef4444' }}
                                title="移出"
                              >
                                <XCircle size={12} /> 移出
                              </button>
                              <button
                                onClick={() => { setEditStamp(es); setStampFormMode('edit'); setShowStampForm(true) }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[#F5E6C8]"
                                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                                title="编辑"
                              >
                                <Edit size={12} /> 编辑
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                  <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
                  <p>暂无候选邮品</p>
                  <p className="text-xs mt-1">点击"添加邮品"开始筛选</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ExhibitionStampForm
        open={showStampForm}
        onClose={() => { setShowStampForm(false); setEditStamp(null) }}
        exhibitionId={currentExhibition?.id || ''}
        stamp={editStamp}
        mode={stampFormMode}
      />

      <StampSelector
        open={showStampSelector}
        onClose={() => setShowStampSelector(false)}
        onConfirm={handleAddStamp}
        selectedStampIds={selectedStampIds}
      />

      <StampReplacer
        open={showReplacer}
        onClose={() => { setShowReplacer(false); setReplacingStamp(null) }}
        onConfirm={handleReplaceStamp}
        currentStampId={replacingStamp?.stampId}
        exhibitionId={currentExhibition?.id || ''}
        exhibitionStamps={exhibitionStamps}
      />
    </div>
  )
}
