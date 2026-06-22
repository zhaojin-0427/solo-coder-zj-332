import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Wrench, Shield, AlertTriangle, X } from 'lucide-react'
import useStore, { RestorationAssessment, RestorationOrder } from '@/store/useStore'
import RestorationAssessmentForm from '@/components/RestorationAssessmentForm'
import RestorationOrderForm from '@/components/RestorationOrderForm'

const RISK_COLORS: Record<string, string> = {
  '折痕': 'bg-blue-100 text-blue-800',
  '霉斑': 'bg-green-100 text-green-800',
  '褪色': 'bg-yellow-100 text-yellow-800',
  '齿孔破损': 'bg-red-100 text-red-800',
  '封片开胶': 'bg-purple-100 text-purple-800',
  '其他': 'bg-gray-100 text-gray-800',
}

const SEVERITY_COLORS: Record<string, string> = {
  '轻微': 'bg-green-100 text-green-800',
  '中度': 'bg-yellow-100 text-yellow-800',
  '严重': 'bg-orange-100 text-orange-800',
  '极严重': 'bg-red-100 text-red-800',
}

const ASSESSMENT_STATUS_COLORS: Record<string, string> = {
  '待评估': 'bg-gray-100 text-gray-800',
  '评估中': 'bg-blue-100 text-blue-800',
  '已评估': 'bg-yellow-100 text-yellow-800',
  '已转工单': 'bg-green-100 text-green-800',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  '待确认': 'bg-amber-100 text-amber-800',
  '处理中': 'bg-blue-100 text-blue-800',
  '已完成': 'bg-green-100 text-green-800',
  '暂缓处理': 'bg-gray-100 text-gray-800',
}

type TabType = 'assessments' | 'orders'

export default function Restorations() {
  const {
    restorationAssessments, restorationOrders,
    fetchRestorationAssessments, fetchRestorationOrders,
    updateRestorationAssessment, deleteRestorationAssessment,
    updateRestorationOrderStatus, updateRestorationOrder, deleteRestorationOrder,
  } = useStore()

  const [tab, setTab] = useState<TabType>('assessments')
  const [search, setSearch] = useState('')
  const [filterRiskType, setFilterRiskType] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<RestorationAssessment | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<RestorationOrder | null>(null)

  useEffect(() => {
    fetchRestorationAssessments()
    fetchRestorationOrders()
  }, [fetchRestorationAssessments, fetchRestorationOrders])

  const filteredAssessments = useMemo(() => {
    return restorationAssessments.filter((a) => {
      if (search && !a.stampName?.includes(search) && !a.riskType.includes(search) && !a.responsibleFamily.includes(search)) return false
      if (filterRiskType && a.riskType !== filterRiskType) return false
      if (filterSeverity && a.severity !== filterSeverity) return false
      if (filterStatus && a.status !== filterStatus) return false
      return true
    })
  }, [restorationAssessments, search, filterRiskType, filterSeverity, filterStatus])

  const filteredOrders = useMemo(() => {
    return restorationOrders.filter((o) => {
      if (search && !o.stampName?.includes(search) && !o.handler.includes(search) && !o.assessmentRiskType?.includes(search)) return false
      if (filterStatus && o.status !== filterStatus) return false
      return true
    })
  }, [restorationOrders, search, filterStatus])

  const handleCreateOrder = (assessment: RestorationAssessment) => {
    setSelectedAssessment(assessment)
    setShowOrderForm(true)
  }

  const handleDeleteAssessment = async (id: string) => {
    await deleteRestorationAssessment(id)
    if (selectedAssessment?.id === id) setSelectedAssessment(null)
  }

  const handleDeleteOrder = async (id: string) => {
    await deleteRestorationOrder(id)
    if (selectedOrder?.id === id) setSelectedOrder(null)
  }

  const isOverdue = (deadline: string, status: string) => {
    if (status === '已完成' || status === '暂缓处理') return false
    return new Date(deadline) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>修复评估与养护工单</h2>
        <button
          onClick={() => setShowAssessmentForm(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
          style={{ background: 'var(--color-amber)' }}
        >
          <Plus size={14} /> 新建评估
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('assessments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'assessments' ? 'text-white' : ''}`}
          style={{
            background: tab === 'assessments' ? 'var(--color-amber)' : 'transparent',
            color: tab === 'assessments' ? '#fff' : 'var(--color-brown)',
            border: tab !== 'assessments' ? '1px solid var(--color-beige-dark)' : 'none',
          }}
        >
          <span className="flex items-center gap-1"><Shield size={14} /> 修复评估 ({restorationAssessments.length})</span>
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'orders' ? 'text-white' : ''}`}
          style={{
            background: tab === 'orders' ? 'var(--color-amber)' : 'transparent',
            color: tab === 'orders' ? '#fff' : 'var(--color-brown)',
            border: tab !== 'orders' ? '1px solid var(--color-beige-dark)' : 'none',
          }}
        >
          <span className="flex items-center gap-1"><Wrench size={14} /> 养护工单 ({restorationOrders.length})</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brown-light)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'assessments' ? '搜索邮品名称、风险类型、负责人...' : '搜索邮品名称、处理人、风险类型...'}
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
          />
        </div>
        {tab === 'assessments' && (
          <>
            <select
              value={filterRiskType}
              onChange={(e) => setFilterRiskType(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
            >
              <option value="">全部风险类型</option>
              <option value="折痕">折痕</option>
              <option value="霉斑">霉斑</option>
              <option value="褪色">褪色</option>
              <option value="齿孔破损">齿孔破损</option>
              <option value="封片开胶">封片开胶</option>
              <option value="其他">其他</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
            >
              <option value="">全部严重程度</option>
              <option value="轻微">轻微</option>
              <option value="中度">中度</option>
              <option value="严重">严重</option>
              <option value="极严重">极严重</option>
            </select>
          </>
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
        >
          <option value="">全部状态</option>
          {tab === 'assessments' ? (
            <>
              <option value="待评估">待评估</option>
              <option value="评估中">评估中</option>
              <option value="已评估">已评估</option>
              <option value="已转工单">已转工单</option>
            </>
          ) : (
            <>
              <option value="待确认">待确认</option>
              <option value="处理中">处理中</option>
              <option value="已完成">已完成</option>
              <option value="暂缓处理">暂缓处理</option>
            </>
          )}
        </select>
      </div>

      {tab === 'assessments' && (
        <div className="space-y-3">
          {filteredAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-[#FFF8EC]"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
              onClick={() => setSelectedAssessment(assessment)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                    {assessment.stampName || `邮品#${assessment.stampId}`}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[assessment.riskType]}`}>
                    {assessment.riskType}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[assessment.severity]}`}>
                    {assessment.severity}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ASSESSMENT_STATUS_COLORS[assessment.status]}`}>
                    {assessment.status}
                  </span>
                  {isOverdue(assessment.deadline, assessment.status) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle size={10} /> 逾期
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {assessment.status === '已评估' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCreateOrder(assessment) }}
                      className="text-xs px-3 py-1 rounded-lg text-white"
                      style={{ background: 'var(--color-amber)' }}
                    >
                      生成工单
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment.id) }}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="text-xs flex flex-wrap gap-x-4" style={{ color: 'var(--color-brown-light)' }}>
                <span>发现时间：{assessment.discoveredAt}</span>
                <span>负责人：{assessment.responsibleFamily}</span>
                <span>截止日期：{assessment.deadline}</span>
                <span>预计费用：¥{assessment.estimatedCost}</span>
              </div>
              {assessment.suggestedMethod && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-brown-light)' }}>
                  建议处理：{assessment.suggestedMethod}
                </p>
              )}
            </div>
          ))}
          {filteredAssessments.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
              <Shield size={48} className="mx-auto mb-4 opacity-30" />
              <p>暂无修复评估记录</p>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-[#FFF8EC]"
              style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                    {order.stampName || `邮品#${order.stampId}`}
                  </span>
                  {order.assessmentRiskType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[order.assessmentRiskType]}`}>
                      {order.assessmentRiskType}
                    </span>
                  )}
                  {order.assessmentSeverity && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[order.assessmentSeverity]}`}>
                      {order.assessmentSeverity}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {order.status === '待确认' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateRestorationOrderStatus(order.id, '处理中') }}
                      className="text-xs px-3 py-1 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                    >
                      开始处理
                    </button>
                  )}
                  {order.status === '处理中' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateRestorationOrderStatus(order.id, '已完成') }}
                      className="text-xs px-3 py-1 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      完成处理
                    </button>
                  )}
                  {(order.status === '待确认' || order.status === '处理中') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateRestorationOrderStatus(order.id, '暂缓处理') }}
                      className="text-xs px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50"
                      style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                    >
                      暂缓
                    </button>
                  )}
                  {order.status === '暂缓处理' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateRestorationOrderStatus(order.id, '待确认') }}
                      className="text-xs px-3 py-1 rounded-lg text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                    >
                      恢复
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id) }}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="text-xs flex flex-wrap gap-x-4" style={{ color: 'var(--color-brown-light)' }}>
                <span>处理人：{order.handler}</span>
                {order.startedAt && <span>开始：{order.startedAt}</span>}
                {order.completedAt && <span>完成：{order.completedAt}</span>}
                <span>实际费用：¥{order.actualCost}</span>
              </div>
              {order.processRecord && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-brown-light)' }}>
                  处理记录：{order.processRecord}
                </p>
              )}
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--color-brown-light)' }}>
              <Wrench size={48} className="mx-auto mb-4 opacity-30" />
              <p>暂无养护工单记录</p>
            </div>
          )}
        </div>
      )}

      <RestorationAssessmentForm open={showAssessmentForm} onClose={() => setShowAssessmentForm(false)} />

      {selectedAssessment && (
        <RestorationOrderForm
          open={showOrderForm}
          onClose={() => { setShowOrderForm(false); setSelectedAssessment(null) }}
          assessmentId={selectedAssessment.id}
          stampId={selectedAssessment.stampId}
          assessmentRiskType={selectedAssessment.riskType}
        />
      )}

      {selectedAssessment && !showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                修复评估详情
              </h3>
              <button onClick={() => setSelectedAssessment(null)} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                  {selectedAssessment.stampName || `邮品#${selectedAssessment.stampId}`}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[selectedAssessment.riskType]}`}>
                  {selectedAssessment.riskType}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[selectedAssessment.severity]}`}>
                  {selectedAssessment.severity}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ASSESSMENT_STATUS_COLORS[selectedAssessment.status]}`}>
                  {selectedAssessment.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>发现时间</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedAssessment.discoveredAt}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>存放环境</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedAssessment.storageEnvironment || '未记录'}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>建议处理方式</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedAssessment.suggestedMethod || '未记录'}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>预计费用</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>¥{selectedAssessment.estimatedCost}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>负责家属</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedAssessment.responsibleFamily}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>处理期限</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>
                    {selectedAssessment.deadline}
                    {isOverdue(selectedAssessment.deadline, selectedAssessment.status) && (
                      <span className="ml-2 text-red-500 flex items-center gap-1 inline-flex"><AlertTriangle size={12} /> 逾期</span>
                    )}
                  </p>
                </div>
              </div>
              {selectedAssessment.note && (
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>备注</span>
                  <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedAssessment.note}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {selectedAssessment.status !== '已转工单' && (
                  <>
                    <select
                      value={selectedAssessment.status}
                      onChange={(e) => {
                        updateRestorationAssessment(selectedAssessment.id, { status: e.target.value })
                        setSelectedAssessment({ ...selectedAssessment, status: e.target.value })
                      }}
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--color-beige-dark)' }}
                    >
                      <option value="待评估">待评估</option>
                      <option value="评估中">评估中</option>
                      <option value="已评估">已评估</option>
                    </select>
                    {selectedAssessment.status === '已评估' && (
                      <button
                        onClick={() => handleCreateOrder(selectedAssessment)}
                        className="px-4 py-2 rounded-lg text-sm text-white shadow transition-colors hover:opacity-90"
                        style={{ background: 'var(--color-amber)' }}
                      >
                        生成养护工单
                      </button>
                    )}
                  </>
                )}
                {selectedAssessment.status === '已转工单' && (
                  <span className="text-sm px-3 py-2" style={{ color: 'var(--color-brown-light)' }}>已生成养护工单</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(92,58,30,0.4)' }}>
          <div className="rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" style={{ background: '#FFFBF0' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ borderColor: 'var(--color-beige-dark)', background: '#FFFBF0' }}>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-brown)' }}>
                养护工单详情
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded hover:bg-[#F5E6C8] transition-colors">
                <X size={18} style={{ color: 'var(--color-brown-light)' }} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium" style={{ color: 'var(--color-brown)' }}>
                  {selectedOrder.stampName || `邮品#${selectedOrder.stampId}`}
                </span>
                {selectedOrder.assessmentRiskType && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[selectedOrder.assessmentRiskType]}`}>
                    {selectedOrder.assessmentRiskType}
                  </span>
                )}
                {selectedOrder.assessmentSeverity && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[selectedOrder.assessmentSeverity]}`}>
                    {selectedOrder.assessmentSeverity}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>处理人</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.handler}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>实际费用</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>¥{selectedOrder.actualCost}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>开始时间</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.startedAt || '未开始'}</p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>完成时间</span>
                  <p className="font-medium text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.completedAt || '未完成'}</p>
                </div>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>处理前照片说明</span>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.beforePhotos || '无'}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>处理后照片说明</span>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.afterPhotos || '无'}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>修复过程记录</span>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.processRecord || '无'}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>老人意见</span>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.elderlyOpinion || '无'}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>家属确认结果</span>
                <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.familyConfirmation || '无'}</p>
              </div>
              {selectedOrder.note && (
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-brown-light)' }}>备注</span>
                  <p className="text-sm" style={{ color: 'var(--color-brown)' }}>{selectedOrder.note}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {(selectedOrder.status === '待确认' || selectedOrder.status === '处理中') && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="修复过程记录"
                      className="px-3 py-2 rounded-lg border text-sm flex-1 min-w-[200px]"
                      style={{ borderColor: 'var(--color-beige-dark)' }}
                      id={`process-${selectedOrder.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`process-${selectedOrder.id}`) as HTMLInputElement
                        if (input?.value) {
                          const newRecord = selectedOrder.processRecord
                            ? `${selectedOrder.processRecord}\n${input.value}`
                            : input.value
                          updateRestorationOrder(selectedOrder.id, { processRecord: newRecord })
                          setSelectedOrder({ ...selectedOrder, processRecord: newRecord })
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'var(--color-amber)' }}
                    >
                      添加记录
                    </button>
                  </div>
                )}
                {selectedOrder.status === '处理中' && (
                  <>
                    <input
                      type="text"
                      placeholder="老人意见"
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--color-beige-dark)' }}
                      id={`elderly-${selectedOrder.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`elderly-${selectedOrder.id}`) as HTMLInputElement
                        if (input?.value) {
                          updateRestorationOrder(selectedOrder.id, { elderlyOpinion: input.value })
                          setSelectedOrder({ ...selectedOrder, elderlyOpinion: input.value })
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm border transition-colors"
                      style={{ borderColor: 'var(--color-beige-dark)', color: 'var(--color-brown)' }}
                    >
                      记录意见
                    </button>
                  </>
                )}
                {selectedOrder.status === '已完成' && !selectedOrder.familyConfirmation && (
                  <>
                    <input
                      type="text"
                      placeholder="家属确认结果"
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--color-beige-dark)' }}
                      id={`family-${selectedOrder.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`family-${selectedOrder.id}`) as HTMLInputElement
                        if (input?.value) {
                          updateRestorationOrder(selectedOrder.id, { familyConfirmation: input.value })
                          setSelectedOrder({ ...selectedOrder, familyConfirmation: input.value })
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 rounded-lg text-sm text-white bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      家属确认
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
