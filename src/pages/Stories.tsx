import { useState, useEffect, useMemo } from 'react'
import { Plus, BookHeart, ShoppingBag, Repeat, Heart, MoreHorizontal } from 'lucide-react'
import useStore from '@/store/useStore'
import StoryForm from '@/components/StoryForm'

const STORY_TYPE_CONFIG: Record<string, { icon: typeof ShoppingBag; color: string; label: string }> = {
  购买背景: { icon: ShoppingBag, color: 'bg-blue-100 text-blue-800', label: '购买背景' },
  交换经历: { icon: Repeat, color: 'bg-purple-100 text-purple-800', label: '交换经历' },
  纪念意义: { icon: Heart, color: 'bg-pink-100 text-pink-800', label: '纪念意义' },
  其他: { icon: MoreHorizontal, color: 'bg-gray-100 text-gray-800', label: '其他' },
}

export default function Stories() {
  const { stories, stamps, fetchStories, fetchStamps } = useStore()
  const [filterType, setFilterType] = useState('')
  const [filterStamp, setFilterStamp] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
    fetchStamps()
  }, [fetchStories, fetchStamps])

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      if (filterType && s.storyType !== filterType) return false
      if (filterStamp && s.stampId !== filterStamp) return false
      return true
    })
  }, [stories, filterType, filterStamp])

  const getStampName = (stampId: string) => {
    return stamps.find((s) => s.id === stampId)?.name || '未知邮品'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>来源故事</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 补充故事
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部类型</option>
          {Object.entries(STORY_TYPE_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={filterStamp}
          onChange={(e) => setFilterStamp(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部邮品</option>
          {stamps.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: 'var(--color-beige-dark)' }} />

        <div className="space-y-6">
          {filtered.map((story) => {
            const config = STORY_TYPE_CONFIG[story.storyType] || STORY_TYPE_CONFIG['其他']
            const Icon = config.icon
            const isExpanded = expandedId === story.id

            return (
              <div key={story.id} className="relative">
                <div className="absolute -left-5 top-3 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: 'var(--color-amber)', background: '#FFFBF0' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-amber)' }} />
                </div>
                <div
                  className="ml-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.color}`}>
                      <Icon size={12} /> {config.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>{story.author}</span>
                    <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>
                      {story.createdAt ? new Date(story.createdAt).toLocaleDateString('zh-CN') : ''}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`} style={{ color: 'var(--color-brown)' }}>
                    {story.content}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--color-amber)' }}>
                    <BookHeart size={12} />
                    <span>{getStampName(story.stampId)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
            <BookHeart size={48} className="mx-auto mb-4 opacity-30" />
            <p>暂无故事记录</p>
          </div>
        )}
      </div>

      <StoryForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
