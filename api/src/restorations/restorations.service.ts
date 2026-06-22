import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class RestorationsService {
  findAllAssessments(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.stampId) {
      conditions.push('ra.stamp_id = ?');
      params.push(Number(query.stampId));
    }
    if (query.riskType) {
      conditions.push('ra.risk_type = ?');
      params.push(query.riskType);
    }
    if (query.severity) {
      conditions.push('ra.severity = ?');
      params.push(query.severity);
    }
    if (query.status) {
      conditions.push('ra.status = ?');
      params.push(query.status);
    }
    if (query.responsibleFamily) {
      conditions.push('ra.responsible_family = ?');
      params.push(query.responsibleFamily);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT ra.*, s.name as stamp_name, s.issue_year as stamp_issue_year, s.theme as stamp_theme, s.condition as stamp_condition
      FROM restoration_assessments ra
      LEFT JOIN stamps s ON ra.stamp_id = s.id
      ${where} ORDER BY ra.created_at DESC`;
    return toCamelCase(db.prepare(sql).all(...params));
  }

  findOneAssessment(id: number) {
    const db = getDb();
    const assessment = db.prepare(
      `SELECT ra.*, s.name as stamp_name, s.issue_year as stamp_issue_year, s.theme as stamp_theme, s.condition as stamp_condition
       FROM restoration_assessments ra
       LEFT JOIN stamps s ON ra.stamp_id = s.id
       WHERE ra.id = ?`
    ).get(id);
    return toCamelCase(assessment);
  }

  createAssessment(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO restoration_assessments (stamp_id, risk_type, severity, discovered_at, storage_environment, suggested_method, estimated_cost, responsible_family, deadline, status, note, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.stamp_id,
      data.risk_type,
      data.severity,
      data.discovered_at,
      data.storage_environment || '',
      data.suggested_method || '',
      data.estimated_cost || 0,
      data.responsible_family,
      data.deadline,
      data.status || '待评估',
      data.note || '',
      data.created_by
    );
    return this.findOneAssessment(Number(result.lastInsertRowid));
  }

  updateAssessment(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['stamp_id', 'risk_type', 'severity', 'discovered_at', 'storage_environment', 'suggested_method', 'estimated_cost', 'responsible_family', 'deadline', 'status', 'note'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOneAssessment(id);

    params.push(id);
    db.prepare(`UPDATE restoration_assessments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    return this.findOneAssessment(id);
  }

  deleteAssessment(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM restoration_assessments WHERE id = ?').run(id);
    return { deleted: true };
  }

  findAllOrders(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.assessmentId) {
      conditions.push('ro.assessment_id = ?');
      params.push(Number(query.assessmentId));
    }
    if (query.stampId) {
      conditions.push('ro.stamp_id = ?');
      params.push(Number(query.stampId));
    }
    if (query.status) {
      conditions.push('ro.status = ?');
      params.push(query.status);
    }
    if (query.handler) {
      conditions.push('ro.handler = ?');
      params.push(query.handler);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT ro.*, s.name as stamp_name, ra.risk_type as assessment_risk_type, ra.severity as assessment_severity
      FROM restoration_orders ro
      LEFT JOIN stamps s ON ro.stamp_id = s.id
      LEFT JOIN restoration_assessments ra ON ro.assessment_id = ra.id
      ${where} ORDER BY ro.created_at DESC`;
    return toCamelCase(db.prepare(sql).all(...params));
  }

  findOneOrder(id: number) {
    const db = getDb();
    const order = db.prepare(
      `SELECT ro.*, s.name as stamp_name, ra.risk_type as assessment_risk_type, ra.severity as assessment_severity
       FROM restoration_orders ro
       LEFT JOIN stamps s ON ro.stamp_id = s.id
       LEFT JOIN restoration_assessments ra ON ro.assessment_id = ra.id
       WHERE ro.id = ?`
    ).get(id);
    return toCamelCase(order);
  }

  createOrder(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);

    if (data.assessment_id) {
      db.prepare(
        `UPDATE restoration_assessments SET status = '已转工单', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).run(data.assessment_id);
    }

    const result = db.prepare(
      `INSERT INTO restoration_orders (assessment_id, stamp_id, status, before_photos, after_photos, process_record, elderly_opinion, family_confirmation, handler, started_at, completed_at, actual_cost, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.assessment_id,
      data.stamp_id,
      data.status || '待确认',
      data.before_photos || '',
      data.after_photos || '',
      data.process_record || '',
      data.elderly_opinion || '',
      data.family_confirmation || '',
      data.handler,
      data.started_at || null,
      data.completed_at || null,
      data.actual_cost || 0,
      data.note || ''
    );
    return this.findOneOrder(Number(result.lastInsertRowid));
  }

  updateOrder(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['status', 'before_photos', 'after_photos', 'process_record', 'elderly_opinion', 'family_confirmation', 'handler', 'started_at', 'completed_at', 'actual_cost', 'note'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOneOrder(id);

    params.push(id);
    db.prepare(`UPDATE restoration_orders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    return this.findOneOrder(id);
  }

  updateOrderStatus(id: number, status: string) {
    const db = getDb();
    const order: any = db.prepare('SELECT * FROM restoration_orders WHERE id = ?').get(id);
    if (!order) return null;

    const updates: string[] = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [status];

    if (status === '处理中' && !order.started_at) {
      updates.push('started_at = CURRENT_DATE');
    }
    if (status === '已完成' && !order.completed_at) {
      updates.push('completed_at = CURRENT_DATE');
    }

    params.push(id);
    db.prepare(`UPDATE restoration_orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    return this.findOneOrder(id);
  }

  deleteOrder(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM restoration_orders WHERE id = ?').run(id);
    return { deleted: true };
  }

  getStampAssessments(stampId: number) {
    const db = getDb();
    return toCamelCase(db.prepare(
      `SELECT * FROM restoration_assessments WHERE stamp_id = ? ORDER BY created_at DESC`
    ).all(stampId));
  }

  getStampOrders(stampId: number) {
    const db = getDb();
    return toCamelCase(db.prepare(
      `SELECT ro.*, ra.risk_type as assessment_risk_type, ra.severity as assessment_severity
       FROM restoration_orders ro
       LEFT JOIN restoration_assessments ra ON ro.assessment_id = ra.id
       WHERE ro.stamp_id = ? ORDER BY ro.created_at DESC`
    ).all(stampId));
  }

  getRestorationStats() {
    const db = getDb();

    const riskStampCount = (db.prepare(
      `SELECT COUNT(DISTINCT stamp_id) as cnt FROM restoration_assessments WHERE status NOT IN ('已转工单') OR id IN (SELECT assessment_id FROM restoration_orders WHERE status != '已完成')`
    ).get() as any).cnt;

    const riskTypeDistributionRaw = db.prepare(
      `SELECT risk_type, COUNT(*) as count FROM restoration_assessments GROUP BY risk_type ORDER BY count DESC`
    ).all();
    const riskTypeDistribution = riskTypeDistributionRaw.map((r: any) => ({
      name: r.risk_type,
      value: r.count,
    }));

    const pendingOrderCount = (db.prepare(
      `SELECT COUNT(*) as cnt FROM restoration_orders WHERE status IN ('待确认','处理中')`
    ).get() as any).cnt;

    const overdueOrderCount = (db.prepare(
      `SELECT COUNT(*) as cnt FROM restoration_orders ro
       INNER JOIN restoration_assessments ra ON ro.assessment_id = ra.id
       WHERE ro.status IN ('待确认','处理中') AND ra.deadline < DATE('now')`
    ).get() as any).cnt;

    const totalOrders = (db.prepare('SELECT COUNT(*) as cnt FROM restoration_orders').get() as any).cnt;
    const completedOrders = (db.prepare(
      "SELECT COUNT(*) as cnt FROM restoration_orders WHERE status = '已完成'"
    ).get() as any).cnt;
    const restorationCompletionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const handlerDistributionRaw = db.prepare(
      `SELECT handler, COUNT(*) as count FROM restoration_orders GROUP BY handler ORDER BY count DESC`
    ).all();
    const handlerDistribution = handlerDistributionRaw.map((h: any) => ({
      name: h.handler,
      value: h.count,
    }));

    const severityDistributionRaw = db.prepare(
      `SELECT severity, COUNT(*) as count FROM restoration_assessments GROUP BY severity ORDER BY count DESC`
    ).all();
    const severityDistribution = severityDistributionRaw.map((s: any) => ({
      name: s.severity,
      value: s.count,
    }));

    const orderStatusDistributionRaw = db.prepare(
      `SELECT status, COUNT(*) as count FROM restoration_orders GROUP BY status ORDER BY count DESC`
    ).all();
    const orderStatusDistribution = orderStatusDistributionRaw.map((s: any) => ({
      name: s.status,
      value: s.count,
    }));

    const totalAssessments = (db.prepare('SELECT COUNT(*) as cnt FROM restoration_assessments').get() as any).cnt;
    const totalEstimatedCost = (db.prepare(
      'SELECT COALESCE(SUM(estimated_cost), 0) as total FROM restoration_assessments'
    ).get() as any).total;
    const totalActualCost = (db.prepare(
      "SELECT COALESCE(SUM(actual_cost), 0) as total FROM restoration_orders WHERE status = '已完成'"
    ).get() as any).total;

    return toCamelCase({
      riskStampCount,
      riskTypeDistribution,
      pendingOrderCount,
      overdueOrderCount,
      restorationCompletionRate,
      handlerDistribution,
      severityDistribution,
      orderStatusDistribution,
      totalAssessments,
      totalOrders,
      totalEstimatedCost,
      totalActualCost,
    });
  }
}
