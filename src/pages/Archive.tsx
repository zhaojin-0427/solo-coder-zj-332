import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Merge, X, BookOpen, ArrowLeftRight, BookHeart, Tag, XCircle, Grid3X3 } from 'lucide-react'
import useStore, { Stamp } from '@/store/useStore'
import StampCard from '@/components/StampCard'
import StampForm from '@/components/StampForm'

const statusColors: Record<string, string> = {
  '候选': 'bg-gray-100 text-gray-800',
  '待确认': 'bg-amber-100 text-amber-800',
  '已确认': 'bg-green-100 text-green-800',
  '暂缓': 'bg-yellow-100 text-yellow-800',
  '已替换': 'bg-purple-100 text-purple-800',
  '已移出': 'bg-red-100 text-red-800',
}

export default function Archive() {
  const { stamps, sets, themes, stories, circulations, stampExhibitions, fetchStamps, fetchSets, fetchThemes, fetchStories, fetchCirculations, fetchStampExhibitions, updateStamp, mergeStamps, addStampTheme, removeStampTheme } = useStore()
  const [search, setSearch] = useState('')
  const [filterTheme, setFilterTheme] = useState('')
  const [filterCondition, setFilterCondition] = useState('')
  const [filterAlbumPage, setFilterAlbumPage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editStamp, setEditStamp] = useState<Stamp | null>(null)
  const [detailStamp, setDetailStamp] = useState<Stamp | null>(null)
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mergeTarget, setMergeTarget] = useState('')
  const [mergeSetId, setMergeSetId] = useState('')
  const [showThemePicker, setShowThemePicker] = useState(false)

  useEffect(() => {
    fetchStamps()
    fetchSets()
    fetchThemes()
    fetchStories()
    fetchCirculations()
  }, [fetchStamps, fetchSets, fetchThemes, fetchStories, fetchCirculations])

  const albumPages = useMemo(() => [...new Set(stamps.map((s) => s.albumPage).filter(Boolean))], [stamps])

  const filtered = useMemo(() => {
    return stamps.filter((s) => {
      if (search && !s.name.includes(search)) return false
      if (filterTheme && !s.themes?.some((t) => t.name === filterTheme)) return false
      if (filterCondition && s.condition !== filterCondition) return false
      if (filterAlbumPage && s.albumPage !== filterAlbumPage) return false
      return true
    })
  }, [stamps, search, filterTheme, filterCondition, filterAlbumPage])

  const stampStories = useMemo(() => {
    if (!detailStamp) return []
    return stories.filter((s) => s.stampId === detailStamp.id)
  }, [detailStamp, stories])

  const stampCirculations = useMemo(() => {
    if (!detailStamp) return []
    return circulations.filter((c) => c.stampId === detailStamp.id)
  }, [detailStamp, circulations])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleOpenDetail = async (stamp: Stamp) => {
    setDetailStamp(stamp)
    await fetchStampExhibitions(stamp.id)
  }

  const handleMerge = async () => {
    if (!mergeTarget || selectedIds.length < 2) return
    const setIdNum = mergeSetId ? Number(mergeSetId) : undefined
    await mergeStamps(selectedIds, mergeTarget, setIdNum as any)
    setSelectedIds([])
    setMergeMode(false)
    setMergeTarget('')
    setMergeSetId('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>邮品档案</h2>
        <div className="flex gap-2">
          {mergeMode ? (
            <>
              <select
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                <option value="">选择目标册页</option>
                {albumPages.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={mergeSetId}
                onChange={(e) => setMergeSetId(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--color-beige-dark)' }}
              >
                <option value="">不设置套组</option>
                {sets.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={handleMerge}
                disabled={!mergeTarget || selectedIds.length < 2}
                className="px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-amber)' }}
              >
                确认归并 ({selectedIds.length})
              </button>
              <button
                onClick={() => { setMergeMode(false); setSelectedIds([]); setMergeSetId('') }}
                className="px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
              >
                取消
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setMergeMode(true)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-[#F5E6C8]"
                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
              >
                <Merge size={14} /> 关联归并
              </button>
              <button
                onClick={() => { setEditStamp(null); setShowForm(true) }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
                style={{ background: 'var(--color-amber)' }}
              >
                <Plus size={14} /> 新建邮品
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索邮品名称..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
          />
        </div>
        <select
          value={filterTheme}
          onChange={(e) => setFilterTheme(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部主题</option>
          {themes.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部品相</option>
          <option value="完好">完好</option>
          <option value="轻微损伤">轻微损伤</option>
          <option value="明显损伤">明显损伤</option>
          <option value="严重损伤">严重损伤</option>
        </select>
        <select
          value={filterAlbumPage}
          onChange={(e) => setFilterAlbumPage(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部册页</option>
          {albumPages.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((stamp) => (
          <StampCard
            key={stamp.id}
            stamp={stamp}
            onClick={(s) => { if (!mergeMode) handleOpenDetail(s) }}
            selectable={mergeMode}
            selected={selectedIds.includes(stamp.id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无邮品记录</p>
        </div>
      )}

      <StampForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditStamp(null) }}
        stamp={editStamp}
      />

      {detailStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                {detailStamp.name}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDetailStamp(null); setEditStamp(detailStamp); setShowForm(true) }}
                  className="px-3 py-1.5 rounded-lg text-xs border transition-colors hover:bg-[#F5E6C8]"
                  style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                >
                  编辑
                </button>
                <button onClick={() => setDetailStamp(null)} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                  <X size={18} style={{ color: 'var(--color-brown-light)' }} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="h-48 flex items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #E8D5A8, #D4B978)' }}
              >
                <BookOpen size={60} style={{ color: 'var(--color-brown-light)', opacity: 0.4 }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>发行年份</span>
                  <p className="font-medium" style={{ color: 'var(--color-brown)' }}>{detailStamp.issueYear}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>品相</span>
                  <p className="font-medium" style={{ color: 'var(--color-brown)' }}>{detailStamp.condition}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>主题</span>
                    <button
                      onClick={() => setShowThemePicker(true)}
                      className="text-xs px-2 py-0.5 rounded border transition-colors hover:bg-[#F5E6C8]"
                      style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                    >
                      管理
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {detailStamp.themes && detailStamp.themes.length > 0 ? (
                      detailStamp.themes.map((theme) => (
                        <span
                          key={theme.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-amber)', color: '#fff' }}
                        >
                          {theme.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--color-brown-light)' }}>未分类</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>册页</span>
                  <p className="font-medium" style={{ color: 'var(--color-brown)' }}>{detailStamp.albumPage || '未归册'}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>来源</span>
                  <p className="font-medium" style={{ color: 'var(--color-brown)' }}>{detailStamp.source || '未知'}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>套组</span>
                  <p className="font-medium" style={{ color: 'var(--color-brown)' }}>{detailStamp.setName || '无'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-brown)' }}>
                  <BookHeart size={16} /> 关联故事
                </h4>
                {stampStories.length > 0 ? (
                  <div className="space-y-2">
                    {stampStories.map((story) => (
                      <div key={story.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFF8EC' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-amber)', color: '#fff' }}>
                            {story.storyType}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>{story.author}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{story.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无关联故事</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-brown)' }}>
                  <ArrowLeftRight size={16} /> 流转记录
                </h4>
                {stampCirculations.length > 0 ? (
                  <div className="space-y-2">
                    {stampCirculations.map((circ) => (
                      <div key={circ.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFF8EC' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            circ.type === '借出' ? 'bg-blue-100 text-blue-800' :
                            circ.type === '归还' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {circ.type}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                            {circ.fromPerson} → {circ.toPerson}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            circ.status === '已完成' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {circ.status}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{circ.purpose}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无流转记录</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-brown)' }}>
                  <Grid3X3 size={16} /> 展陈参与记录
                </h4>
                {stampExhibitions.length > 0 ? (
                  <div className="space-y-2">
                    {stampExhibitions.map((ex) => (
                      <div key={ex.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFF8EC' }}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>{ex.exhibitionName}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ex.status]}`}>
                            {ex.status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}>
                            {ex.displayRole}
                          </span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                          保管人：{ex.keeper}
                          {ex.expectedBorrowDate && ` · 借出：${ex.expectedBorrowDate}`}
                          {ex.expectedReturnDate && ` · 归还：${ex.expectedReturnDate}`}
                        </div>
                        {ex.displayNote && (
                          <p className="text-xs mt-1" style={{ color: 'var(--color-brown-light)' }}>
                            备注：{ex.displayNote}
                          </p>
                        )}
                        {ex.displayNarration && (
                          <div className="mt-2 p-2 rounded" style={{ background: 'var(--color-beige)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>展陈讲述词：</p>
                            <p className="text-xs" style={{ color: 'var(--color-brown)' }}>{ex.displayNarration}</p>
                          </div>
                        )}
                        {ex.memorialMeaning && (
                          <div className="mt-2 p-2 rounded" style={{ background: '#FEF3C7' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-brown)' }}>纪念意义：</p>
                            <p className="text-xs" style={{ color: 'var(--color-brown)' }}>{ex.memorialMeaning}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无展陈参与记录</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showThemePicker && detailStamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>管理主题</h3>
              <button onClick={() => setShowThemePicker(false)} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {themes.map((theme) => {
                const hasTheme = detailStamp.themes?.some((t) => t.id === theme.id)
                return (
                  <div
                    key={theme.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border"
                    style={{ borderColor: 'var(--color-beige-dark)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Tag size={14} style={{ color: 'var(--color-amber)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-brown)' }}>{theme.name}</span>
                    </div>
                    {hasTheme ? (
                      <button
                        onClick={() => removeStampTheme(detailStamp.id, theme.id)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        移除
                      </button>
                    ) : (
                      <button
                        onClick={() => addStampTheme(detailStamp.id, theme.id)}
                        className="text-xs px-2 py-1 rounded text-white"
                        style={{ background: 'var(--color-amber)' }}
                      >
                        添加
                      </button>
                    )}
                  </div>
                )
              })}
              {themes.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--color-brown-light)' }}>暂无主题，请先创建主题</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
