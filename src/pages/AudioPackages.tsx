import { useState, useEffect, useMemo } from 'react'
import { Plus, X, Edit, Trash2, Search, User, BookOpen, Mic, MessageSquare, Clock, Check, AlertCircle, Star } from 'lucide-react'
import useStore, { AudioPackage, AudioPackageItem, PackageFeedback, PackageFollowUp } from '@/store/useStore'
import AudioPackageForm from '@/components/AudioPackageForm'
import AudioPackageItemForm from '@/components/AudioPackageItemForm'
import PackageFeedbackForm from '@/components/PackageFeedbackForm'
import PackageFollowUpForm from '@/components/PackageFollowUpForm'

const packageStatusColors: Record<string, string> = {
  '草稿': 'bg-gray-100 text-gray-800',
  '制作中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
  '已归档': 'bg-purple-100 text-purple-800',
}

const itemStatusColors: Record<string, string> = {
  '待讲解': 'bg-amber-100 text-amber-800',
  '讲解中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
  '需重录': 'bg-red-100 text-red-800',
}

const themeTypeColors: Record<string, string> = {
  '家庭回忆': 'bg-pink-100 text-pink-800',
  '节日庆典': 'bg-orange-100 text-orange-800',
  '长辈故事': 'bg-cyan-100 text-cyan-800',
  '邮品讲解': 'bg-green-100 text-green-800',
  '其他': 'bg-gray-100 text-gray-800',
}

const feedbackTypeColors: Record<string, string> = {
  '喜欢': 'bg-green-100 text-green-800',
  '听不懂': 'bg-amber-100 text-amber-800',
  '想再听': 'bg-blue-100 text-blue-800',
  '有补充': 'bg-purple-100 text-purple-800',
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

export default function AudioPackages() {
  const {
    audioPackages,
    currentAudioPackage,
    packageItems,
    packageFeedback,
    packageFollowUps,
    stamps,
    fetchAudioPackages,
    fetchAudioPackage,
    fetchPackageItems,
    fetchPackageFeedback,
    fetchPackageFollowUps,
    fetchStamps,
    createAudioPackage,
    updateAudioPackage,
    deleteAudioPackage,
    addPackageItem,
    updatePackageItem,
    updatePackageItemStatus,
    removePackageItem,
    addPackageFeedback,
    removePackageFeedback,
    addPackageFollowUp,
    updatePackageFollowUp,
    updatePackageFollowUpStatus,
    removePackageFollowUp,
    setCurrentAudioPackage,
  } = useStore()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterThemeType, setFilterThemeType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editPackage, setEditPackage] = useState<AudioPackage | null>(null)
  const [viewDetail, setViewDetail] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editItem, setEditItem] = useState<AudioPackageItem | null>(null)
  const [itemFormMode, setItemFormMode] = useState<'edit' | 'add'>('add')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [editFollowUp, setEditFollowUp] = useState<PackageFollowUp | null>(null)
  const [followUpFormMode, setFollowUpFormMode] = useState<'edit' | 'add'>('add')
  const [activeTab, setActiveTab] = useState<'items' | 'feedback' | 'followups'>('items')
  const [filterItemStatus, setFilterItemStatus] = useState('')

  useEffect(() => {
    fetchAudioPackages()
    fetchStamps()
  }, [fetchAudioPackages, fetchStamps])

  const filtered = useMemo(() => {
    return audioPackages.filter((p) => {
      if (search && !p.name.includes(search) && !p.description?.includes(search)) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterThemeType && p.themeType !== filterThemeType) return false
      return true
    })
  }, [audioPackages, search, filterStatus, filterThemeType])

  const filteredItems = useMemo(() => {
    if (!filterItemStatus) return packageItems
    return packageItems.filter((item) => item.status === filterItemStatus)
  }, [packageItems, filterItemStatus])

  const availableStamps = useMemo(() => {
    return stamps.map((s) => ({ id: s.id, name: s.name }))
  }, [stamps])

  const packageItemOptions = useMemo(() => {
    return packageItems.map((item) => ({ id: item.id, title: item.title }))
  }, [packageItems])

  const handleOpenDetail = async (pkg: AudioPackage) => {
    await fetchAudioPackage(pkg.id)
    await fetchPackageItems(pkg.id)
    await fetchPackageFeedback(pkg.id)
    await fetchPackageFollowUps(pkg.id)
    setViewDetail(true)
    setActiveTab('items')
    setFilterItemStatus('')
  }

  const handleCloseDetail = () => {
    setViewDetail(false)
    setCurrentAudioPackage(null)
    setFilterItemStatus('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个回听资料包吗？')) {
      await deleteAudioPackage(id)
    }
  }

  const handleDeleteItem = async (packageId: string, itemId: string) => {
    if (confirm('确定要删除这个条目吗？')) {
      await removePackageItem(packageId, itemId)
    }
  }

  const handleDeleteFeedback = async (packageId: string, feedbackId: string) => {
    if (confirm('确定要删除这条反馈吗？')) {
      await removePackageFeedback(packageId, feedbackId)
    }
  }

  const handleDeleteFollowUp = async (packageId: string, followUpId: string) => {
    if (confirm('确定要删除这条待跟进吗？')) {
      await removePackageFollowUp(packageId, followUpId)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '未录制'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? '#D97706' : 'none'}
        color={i < rating ? '#D97706' : 'var(--color-beige-dark)'}
      />
    ))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>回听资料包</h2>
        <button
          onClick={() => { setEditPackage(null); setShowForm(true) }}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建资料包
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索资料包名称..."
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
          <option value="制作中">制作中</option>
          <option value="已完成">已完成</option>
          <option value="已归档">已归档</option>
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
      </div>

      <div className="space-y-4">
        {filtered.map((pkg) => (
          <div
            key={pkg.id}
            className="p-5 rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
            onClick={() => handleOpenDetail(pkg)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-brown)' }}>{pkg.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[pkg.themeType]}`}>
                    {pkg.themeType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${packageStatusColors[pkg.status]}`}>
                    {pkg.status}
                  </span>
                </div>
                {pkg.description && (
                  <p className="text-sm mb-3" style={{ color: 'var(--color-brown-light)' }}>{pkg.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    目标：{pkg.targetElderly}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    创建人：{pkg.createdBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {pkg.itemCount || 0} 个条目
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic size={12} />
                    {pkg.pendingItemCount || 0} 个待讲解
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setEditPackage(pkg); setShowForm(true) }}
                  className="p-2 rounded-lg hover:bg-[#F5E6C8] transition-colors"
                  title="编辑"
                >
                  <Edit size={16} style={{ color: 'var(--color-brown-light)' }} />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
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
          <p>暂无回听资料包</p>
        </div>
      )}

      <AudioPackageForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditPackage(null) }}
        audioPackage={editPackage}
      />

      {viewDetail && currentAudioPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                  {currentAudioPackage.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${themeTypeColors[currentAudioPackage.themeType]}`}>
                    {currentAudioPackage.themeType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${packageStatusColors[currentAudioPackage.status]}`}>
                    {currentAudioPackage.status}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                    目标：{currentAudioPackage.targetElderly} · 创建人：{currentAudioPackage.createdBy}
                  </span>
                </div>
              </div>
              <button onClick={handleCloseDetail} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>

            {currentAudioPackage.description && (
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{currentAudioPackage.description}</p>
              </div>
            )}

            <div className="border-b" style={{ borderColor: 'var(--color-beige-dark)' }}>
              <div className="flex">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'items' ? 'border-b-2' : ''}`}
                  style={{
                    color: activeTab === 'items' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                    borderColor: activeTab === 'items' ? 'var(--color-amber)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Mic size={14} />
                    条目 ({packageItems.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'feedback' ? 'border-b-2' : ''}`}
                  style={{
                    color: activeTab === 'feedback' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                    borderColor: activeTab === 'feedback' ? 'var(--color-amber)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} />
                    反馈 ({packageFeedback.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('followups')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'followups' ? 'border-b-2' : ''}`}
                  style={{
                    color: activeTab === 'followups' ? 'var(--color-amber)' : 'var(--color-brown-light)',
                    borderColor: activeTab === 'followups' ? 'var(--color-amber)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    待跟进 ({packageFollowUps.length})
                  </div>
                </button>
              </div>
            </div>

            {activeTab === 'items' && (
              <>
                <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--color-beige-dark)' }}>
                  <select
                    value={filterItemStatus}
                    onChange={(e) => setFilterItemStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border text-xs"
                    style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                  >
                    <option value="">全部状态</option>
                    <option value="待讲解">待讲解</option>
                    <option value="讲解中">讲解中</option>
                    <option value="已完成">已完成</option>
                    <option value="需重录">需重录</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowFeedbackForm(true) }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-[#F5E6C8]"
                      style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                    >
                      <MessageSquare size={12} /> 添加反馈
                    </button>
                    <button
                      onClick={() => { setShowFollowUpForm(true) }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors hover:bg-[#F5E6C8]"
                      style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                    >
                      <Clock size={12} /> 添加待跟进
                    </button>
                    <button
                      onClick={() => { setEditItem(null); setItemFormMode('add'); setShowItemForm(true) }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                      style={{ background: 'var(--color-amber)' }}
                    >
                      <Plus size={12} /> 添加条目
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {filteredItems.length > 0 ? (
                    <div className="space-y-3">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg border"
                          style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-medium" style={{ color: 'var(--color-brown)' }}>{item.title}</h4>
                                {item.stampName && (
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige)', color: 'var(--color-brown)' }}>
                                    邮品：{item.stampName}
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded-full ${itemStatusColors[item.status]}`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-sm mb-3" style={{ color: 'var(--color-brown-light)' }}>{item.content}</p>
                              <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--color-brown-light)' }}>
                                <span>时长：{formatDuration(item.duration)}</span>
                                {item.narrator && <span>讲解人：{item.narrator}</span>}
                                {item.displayOrder > 0 && <span>顺序：第{item.displayOrder}条</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              {item.status === '待讲解' && (
                                <button
                                  onClick={() => updatePackageItemStatus(currentAudioPackage.id, item.id, '讲解中')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#3b82f6' }}
                                  title="开始讲解"
                                >
                                  <Mic size={12} /> 开始
                                </button>
                              )}
                              {item.status === '讲解中' && (
                                <button
                                  onClick={() => updatePackageItemStatus(currentAudioPackage.id, item.id, '已完成')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#22c55e' }}
                                  title="完成讲解"
                                >
                                  <Check size={12} /> 完成
                                </button>
                              )}
                              {item.status === '讲解中' && (
                                <button
                                  onClick={() => updatePackageItemStatus(currentAudioPackage.id, item.id, '需重录')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#ef4444' }}
                                  title="需重录"
                                >
                                  <AlertCircle size={12} /> 重录
                                </button>
                              )}
                              {item.status === '需重录' && (
                                <button
                                  onClick={() => updatePackageItemStatus(currentAudioPackage.id, item.id, '讲解中')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#3b82f6' }}
                                  title="重新开始"
                                >
                                  <Mic size={12} /> 重讲
                                </button>
                              )}
                              <button
                                onClick={() => { setEditItem(item); setItemFormMode('edit'); setShowItemForm(true) }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[#F5E6C8]"
                                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                                title="编辑"
                              >
                                <Edit size={12} /> 编辑
                              </button>
                              <button
                                onClick={() => handleDeleteItem(currentAudioPackage.id, item.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#ef4444' }}
                                title="删除"
                              >
                                <Trash2 size={12} /> 删除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                      <Mic size={40} className="mx-auto mb-4 opacity-30" />
                      <p>暂无条目</p>
                      <p className="text-xs mt-1">点击"添加条目"开始创建</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'feedback' && (
              <>
                <div className="px-6 py-4 border-b flex justify-end" style={{ borderColor: 'var(--color-beige-dark)' }}>
                  <button
                    onClick={() => { setShowFeedbackForm(true) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                    style={{ background: 'var(--color-amber)' }}
                  >
                    <Plus size={12} /> 添加反馈
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {packageFeedback.length > 0 ? (
                    <div className="space-y-3">
                      {packageFeedback.map((fb) => (
                        <div
                          key={fb.id}
                          className="p-4 rounded-lg border"
                          style={{ borderColor: 'var(--color-beige-dark)', background: '#fff' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium" style={{ color: 'var(--color-brown)' }}>{fb.elderlyPerson}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${feedbackTypeColors[fb.feedbackType]}`}>
                                  {fb.feedbackType}
                                </span>
                                {fb.itemTitle && (
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige)', color: 'var(--color-brown)' }}>
                                    {fb.itemTitle}
                                  </span>
                                )}
                                <div className="flex">{renderStars(fb.rating)}</div>
                              </div>
                              {fb.content && (
                                <p className="text-sm" style={{ color: 'var(--color-brown-light)' }}>{fb.content}</p>
                              )}
                              <p className="text-xs mt-2" style={{ color: 'var(--color-brown-light)' }}>
                                {new Date(fb.createdAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteFeedback(currentAudioPackage.id, fb.id)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="删除"
                            >
                              <Trash2 size={14} style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                      <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
                      <p>暂无反馈</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'followups' && (
              <>
                <div className="px-6 py-4 border-b flex justify-end" style={{ borderColor: 'var(--color-beige-dark)' }}>
                  <button
                    onClick={() => { setEditFollowUp(null); setFollowUpFormMode('add'); setShowFollowUpForm(true) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white shadow transition-colors hover:opacity-90"
                    style={{ background: 'var(--color-amber)' }}
                  >
                    <Plus size={12} /> 添加待跟进
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {packageFollowUps.length > 0 ? (
                    <div className="space-y-3">
                      {packageFollowUps.map((fu) => (
                        <div
                          key={fu.id}
                          className="p-4 rounded-lg border"
                          style={{ borderColor: 'var(--color-beige-dark)', background: fu.status === '已完成' ? '#f0fdf4' : '#fff' }}
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
                                {fu.itemTitle && (
                                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige)', color: 'var(--color-brown)' }}>
                                    {fu.itemTitle}
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
                                  onClick={() => updatePackageFollowUpStatus(currentAudioPackage.id, fu.id, '处理中')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#3b82f6' }}
                                  title="开始处理"
                                >
                                  <Clock size={12} /> 处理
                                </button>
                              )}
                              {fu.status === '处理中' && (
                                <button
                                  onClick={() => updatePackageFollowUpStatus(currentAudioPackage.id, fu.id, '已完成')}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                  style={{ background: '#22c55e' }}
                                  title="完成"
                                >
                                  <Check size={12} /> 完成
                                </button>
                              )}
                              <button
                                onClick={() => { setEditFollowUp(fu); setFollowUpFormMode('edit'); setShowFollowUpForm(true) }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors hover:bg-[#F5E6C8]"
                                style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                                title="编辑"
                              >
                                <Edit size={12} /> 编辑
                              </button>
                              <button
                                onClick={() => handleDeleteFollowUp(currentAudioPackage.id, fu.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white hover:opacity-90 transition-colors"
                                style={{ background: '#ef4444' }}
                                title="删除"
                              >
                                <Trash2 size={12} /> 删除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16" style={{ color: 'var(--color-brown-light)' }}>
                      <Clock size={40} className="mx-auto mb-4 opacity-30" />
                      <p>暂无待跟进事项</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <AudioPackageItemForm
        open={showItemForm}
        onClose={() => { setShowItemForm(false); setEditItem(null) }}
        packageId={currentAudioPackage?.id || ''}
        item={editItem}
        mode={itemFormMode}
        availableStamps={availableStamps}
      />

      <PackageFeedbackForm
        open={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        packageId={currentAudioPackage?.id || ''}
        packageItems={packageItemOptions}
      />

      <PackageFollowUpForm
        open={showFollowUpForm}
        onClose={() => { setShowFollowUpForm(false); setEditFollowUp(null) }}
        packageId={currentAudioPackage?.id || ''}
        item={editFollowUp}
        mode={followUpFormMode}
        packageItems={packageItemOptions}
      />
    </div>
  )
}
