import { useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, BookHeart, ArrowLeftRight, Grid3X3, Clock, Mic, MessageSquare, AlertCircle } from 'lucide-react'
import useStore from '@/store/useStore'

const PIE_COLORS = ['#B8860B', '#5C3A1E', '#2D5016', '#D4A843', '#7A5233', '#8B6508', '#3D6B1E']
const AUDIO_COLORS = ['#9333EA', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#A855F7', '#C084FC']

export default function Stats() {
  const { stamps, themes, stories, circulations, exhibitions, audioPackages, stats, fetchStamps, fetchThemes, fetchStories, fetchCirculations, fetchExhibitions, fetchAudioPackages, fetchStats } = useStore()

  useEffect(() => {
    fetchStamps()
    fetchThemes()
    fetchStories()
    fetchCirculations()
    fetchExhibitions()
    fetchAudioPackages()
    fetchStats()
  }, [fetchStamps, fetchThemes, fetchStories, fetchCirculations, fetchExhibitions, fetchAudioPackages, fetchStats])

  const themeDistribution = useMemo(() => {
    if (stats?.themeDistribution?.length) return stats.themeDistribution
    const map: Record<string, number> = {}
    stamps.forEach((s) => {
      if (s.themes && s.themes.length > 0) {
        s.themes.forEach((t) => {
          map[t.name] = (map[t.name] || 0) + 1
        })
      } else {
        map['未分类'] = (map['未分类'] || 0) + 1
      }
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [stamps, stats])

  const unsortedAlbumPages = useMemo(() => {
    if (stats?.unsortedAlbumPages?.length) return stats.unsortedAlbumPages
    const map: Record<string, number> = {}
    stamps.filter((s) => !s.themes || s.themes.length === 0).forEach((s) => {
      const key = s.albumPage || '未归册'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, count]) => ({ name, count }))
  }, [stamps, stats])

  const topThemes = useMemo(() => {
    if (stats?.topThemes?.length) return stats.topThemes
    const map: Record<string, number> = {}
    stamps.forEach((s) => {
      if (s.themes && s.themes.length > 0) {
        s.themes.forEach((t) => {
          map[t.name] = (map[t.name] || 0) + 1
        })
      }
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

  const totalExhibitions = stats?.totalExhibitions ?? exhibitions.length
  const pendingExhibitionStamps = stats?.pendingExhibitionStamps ?? 0

  const exhibitionThemeDistribution = useMemo(() => {
    if (stats?.exhibitionThemeDistribution?.length) return stats.exhibitionThemeDistribution
    const map: Record<string, number> = {}
    exhibitions.forEach((e) => {
      map[e.themeType] = (map[e.themeType] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [exhibitions, stats])

  const exhibitionUsageByTheme = useMemo(() => {
    if (stats?.exhibitionUsageByTheme?.length) return stats.exhibitionUsageByTheme
    return []
  }, [stats])

  const keeperDistribution = useMemo(() => {
    if (stats?.keeperDistribution?.length) return stats.keeperDistribution
    return []
  }, [stats])

  const totalAudioPackages = stats?.totalAudioPackages ?? audioPackages.length
  const pendingItemsCount = stats?.pendingItemsCount ?? 0

  const packageThemeDistribution = useMemo(() => {
    if (stats?.packageThemeDistribution?.length) return stats.packageThemeDistribution
    const map: Record<string, number> = {}
    audioPackages.forEach((p) => {
      map[p.themeType] = (map[p.themeType] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [audioPackages, stats])

  const itemThemeDistribution = useMemo(() => {
    if (stats?.itemThemeDistribution?.length) return stats.itemThemeDistribution
    return []
  }, [stats])

  const feedbackTypeDistribution = useMemo(() => {
    if (stats?.feedbackTypeDistribution?.length) return stats.feedbackTypeDistribution
    return []
  }, [stats])

  const feedbackElderlyDistribution = useMemo(() => {
    if (stats?.feedbackElderlyDistribution?.length) return stats.feedbackElderlyDistribution
    return []
  }, [stats])

  const followUpStatusDistribution = useMemo(() => {
    if (stats?.followUpStatusDistribution?.length) return stats.followUpStatusDistribution
    return []
  }, [stats])

  const totalStamps = stats?.totalStamps ?? stamps.length
  const totalStories = stats?.totalStories ?? stories.length
  const activeCirculations = stats?.activeCirculations ?? circulations.filter((c) => c.status === '进行中').length

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>统计</h2>

      <div className="grid grid-cols-7 gap-4 mb-6">
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
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,134,11,0.15)' }}>
              <Grid3X3 size={20} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{totalExhibitions}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>展陈计划</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234,179,8,0.15)' }}>
              <Clock size={20} style={{ color: '#eab308' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{pendingExhibitionStamps}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>待确认邮品</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(147,51,234,0.15)' }}>
              <Mic size={20} style={{ color: '#9333EA' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{totalAudioPackages}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>资料包总数</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.15)' }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-brown)' }}>{pendingItemsCount}</p>
              <p className="text-xs" style={{ color: 'var(--color-brown-light)' }}>待讲解条目</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>展陈主题分布</h3>
          {exhibitionThemeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={exhibitionThemeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {exhibitionThemeDistribution.map((_, index) => (
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>展陈使用频次（按主题）</h3>
          {exhibitionUsageByTheme.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={exhibitionUsageByTheme}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#5C3A1E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>

        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>展陈保管责任人分布</h3>
          {keeperDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={keeperDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {keeperDistribution.map((_, index) => (
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>资料包主题分布</h3>
          {packageThemeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={packageThemeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {packageThemeDistribution.map((_, index) => (
                    <Cell key={index} fill={AUDIO_COLORS[index % AUDIO_COLORS.length]} />
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>条目主题分布（按邮品）</h3>
          {itemThemeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={itemThemeDistribution}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#9333EA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm" style={{ color: 'var(--color-brown-light)' }}>暂无数据</div>
          )}
        </div>

        <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>老人反馈分布</h3>
          {feedbackTypeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feedbackTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {feedbackTypeDistribution.map((_, index) => (
                    <Cell key={index} fill={AUDIO_COLORS[index % AUDIO_COLORS.length]} />
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>反馈老人分布</h3>
          {feedbackElderlyDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={feedbackElderlyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {feedbackElderlyDistribution.map((_, index) => (
                    <Cell key={index} fill={AUDIO_COLORS[index % AUDIO_COLORS.length]} />
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
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>待跟进状态分布</h3>
          {followUpStatusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={followUpStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {followUpStatusDistribution.map((_, index) => (
                    <Cell key={index} fill={AUDIO_COLORS[index % AUDIO_COLORS.length]} />
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
