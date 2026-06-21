import { useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, BookHeart, ArrowLeftRight } from 'lucide-react'
import useStore from '@/store/useStore'

const PIE_COLORS = ['#B8860B', '#5C3A1E', '#2D5016', '#D4A843', '#7A5233', '#8B6508', '#3D6B1E']

export default function Stats() {
  const { stamps, themes, stories, circulations, stats, fetchStamps, fetchThemes, fetchStories, fetchCirculations, fetchStats } = useStore()

  useEffect(() => {
    fetchStamps()
    fetchThemes()
    fetchStories()
    fetchCirculations()
    fetchStats()
  }, [fetchStamps, fetchThemes, fetchStories, fetchCirculations, fetchStats])

  const themeDistribution = useMemo(() => {
    if (stats?.themeDistribution?.length) return stats.themeDistribution
    const map: Record<string, number> = {}
    stamps.forEach((s) => {
      const key = s.theme || '未分类'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [stamps, stats])

  const unsortedAlbumPages = useMemo(() => {
    if (stats?.unsortedAlbumPages?.length) return stats.unsortedAlbumPages
    const map: Record<string, number> = {}
    stamps.filter((s) => !s.theme).forEach((s) => {
      const key = s.albumPage || '未归册'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, count]) => ({ name, count }))
  }, [stamps, stats])

  const topThemes = useMemo(() => {
    if (stats?.topThemes?.length) return stats.topThemes
    const map: Record<string, number> = {}
    stamps.forEach((s) => {
      if (s.theme) map[s.theme] = (map[s.theme] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [stamps, stats])

  const circulationDistribution = useMemo(() => {
    if (stats?.circulationDistribution?.length) return stats.circulationDistribution
    const map: Record<string, number> = {}
    circulations.forEach((c) => {
      map[c.toPerson] = (map[c.toPerson] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [circulations, stats])

  const totalStamps = stats?.totalStamps ?? stamps.length
  const totalStories = stats?.totalStories ?? stories.length
  const activeCirculations = stats?.activeCirculations ?? circulations.filter((c) => c.status === '进行中').length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>统计</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,134,11,0.15)' }}>
              <BookOpen size={20} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{totalStamps}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>邮品总数</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,134,11,0.15)' }}>
              <BookHeart size={20} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{totalStories}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>故事总数</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,134,11,0.15)' }}>
              <ArrowLeftRight size={20} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{activeCirculations}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>进行中流转</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>题材占比</h3>
          {themeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={themeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {themeDistribution.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>

        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>待整理册页</h3>
          {unsortedAlbumPages.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={unsortedAlbumPages}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#B8860B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>

        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>高频纪念主题</h3>
          {topThemes.length > 0 ? (
            <div className="space-y-3">
              {topThemes.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm" style={{ color: 'var(--color-brown)' }}>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full" style={{ width: `${Math.max(item.count * 20, 10)}%`, background: PIE_COLORS[index % PIE_COLORS.length], maxWidth: '120px' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-brown)' }}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>

        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>保管分布</h3>
          {circulationDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={circulationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {circulationDistribution.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}
