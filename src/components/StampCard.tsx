import { Stamp } from '@/store/useStore'
import { Mail } from 'lucide-react'

const conditionColors: Record<string, string> = {
  完好: 'bg-green-100 text-green-800',
  轻微损伤: 'bg-yellow-100 text-yellow-800',
  明显损伤: 'bg-orange-100 text-orange-800',
  严重损伤: 'bg-red-100 text-red-800',
}

interface StampCardProps {
  stamp: Stamp
  onClick: (stamp: Stamp) => void
  selected?: boolean
  onSelect?: (id: string) => void
  selectable?: boolean
}

export default function StampCard({ stamp, onClick, selected, onSelect, selectable }: StampCardProps) {
  return (
    <div
      className={`rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
        selected ? 'ring-2 ring-offset-1' : ''
      }`}
      style={{
        background: '#FFFBF0',
        borderColor: selected ? 'var(--color-amber)' : 'var(--color-beige-dark)',
      }}
    >
      <div
        className="h-36 flex items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #E8D5A8, #D4B978)' }}
        onClick={() => onClick(stamp)}
      >
        {selectable && (
          <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect?.(stamp.id)}
              className="w-4 h-4 rounded accent-[#B8860B]"
            />
          </div>
        )}
        <Mail size={40} style={{ color: 'var(--color-brown-light)', opacity: 0.5 }} />
        <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--color-amber)', color: '#fff' }}
        >
          {stamp.issueYear}
        </span>
      </div>
      <div className="p-3" onClick={() => onClick(stamp)}>
        <h3 className="text-sm font-semibold truncate mb-2" style={{ color: 'var(--color-brown)' }}>
          {stamp.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${conditionColors[stamp.condition] || 'bg-gray-100 text-gray-800'}`}>
            {stamp.condition}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-beige-dark)', color: 'var(--color-brown-light)' }}>
            {stamp.albumPage || '未归册'}
          </span>
        </div>
      </div>
    </div>
  )
}
