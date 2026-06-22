import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class ExplanationsService {
  findAll(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.status) {
      conditions.push('e.status = ?');
      params.push(query.status);
    }
    if (query.themeType) {
      conditions.push('e.theme_type = ?');
      params.push(query.themeType);
    }
    if (query.targetElderly) {
      conditions.push('e.target_elderly = ?');
      params.push(query.targetElderly);
    }
    if (query.createdBy) {
      conditions.push('e.created_by = ?');
      params.push(query.createdBy);
    }
    if (query.keyword) {
      conditions.push('(e.title LIKE ? OR e.key_points LIKE ?)');
      const like = `%${query.keyword}%`;
      params.push(like, like);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT e.*, 
      (SELECT COUNT(*) FROM explanation_stamps es WHERE es.explanation_id = e.id) as stamp_count,
      (SELECT COUNT(*) FROM explanation_feedback ef WHERE ef.explanation_id = e.id) as feedback_count,
      (SELECT COUNT(*) FROM explanation_follow_ups efu WHERE efu.explanation_id = e.id AND efu.status != '已完成') as follow_up_count
      FROM explanations e ${where} ORDER BY e.plan_date DESC, e.created_at DESC`;
    const explanations = db.prepare(sql).all(...params);
    return toCamelCase(explanations);
  }

  findPendingVisits(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = ["e.status = '待回访'"];
    const params: any[] = [];

    if (query.targetElderly) {
      conditions.push('e.target_elderly = ?');
      params.push(query.targetElderly);
    }
    if (query.createdBy) {
      conditions.push('e.created_by = ?');
      params.push(query.createdBy);
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const sql = `SELECT e.*, 
      (SELECT COUNT(*) FROM explanation_stamps es WHERE es.explanation_id = e.id) as stamp_count,
      (SELECT COUNT(*) FROM explanation_feedback ef WHERE ef.explanation_id = e.id) as feedback_count,
      (SELECT COUNT(*) FROM explanation_follow_ups efu WHERE efu.explanation_id = e.id AND efu.status != '已完成') as follow_up_count
      FROM explanations e ${where} ORDER BY e.plan_date ASC`;
    const explanations = db.prepare(sql).all(...params);
    return toCamelCase(explanations);
  }

  findOne(id: number) {
    const db = getDb();
    const explanation = db.prepare('SELECT * FROM explanations WHERE id = ?').get(id);
    if (!explanation) return null;

    const stamps = db.prepare(
      `SELECT es.*, s.name as stamp_name, s.issue_year, s.theme as stamp_theme, s.condition as stamp_condition, s.source as stamp_source, s.album_page, s.image_url
       FROM explanation_stamps es
       LEFT JOIN stamps s ON es.stamp_id = s.id
       WHERE es.explanation_id = ?
       ORDER BY es.created_at ASC`
    ).all(id);

    const feedback = db.prepare(
      `SELECT * FROM explanation_feedback
       WHERE explanation_id = ?
       ORDER BY created_at DESC`
    ).all(id);

    const followUps = db.prepare(
      `SELECT efu.*, ef.elderly_person as feedback_elderly, ef.feedback_type as feedback_type_source
       FROM explanation_follow_ups efu
       LEFT JOIN explanation_feedback ef ON efu.feedback_id = ef.id
       WHERE efu.explanation_id = ?
       ORDER BY efu.priority DESC, efu.due_date ASC`
    ).all(id);

    const visits = db.prepare(
      `SELECT * FROM explanation_visits
       WHERE explanation_id = ?
       ORDER BY visit_date DESC, created_at DESC`
    ).all(id);

    return toCamelCase({ ...explanation, stamps, feedback, followUps, visits });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO explanations (title, theme_type, participants, target_elderly, plan_date, key_points, family_reminder, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.title,
      data.theme_type,
      data.participants || '',
      data.target_elderly,
      data.plan_date,
      data.key_points || '',
      data.family_reminder || '',
      data.status || '待讲解',
      data.created_by
    );
    const expId = Number(result.lastInsertRowid);

    if (body.stamps && Array.isArray(body.stamps)) {
      const insertStamp = db.prepare(
        `INSERT INTO explanation_stamps (explanation_id, stamp_id, stamp_excerpt, story_excerpt, audio_excerpt)
         VALUES (?, ?, ?, ?, ?)`
      );
      for (const s of body.stamps) {
        const sd = toSnakeCase(s);
        insertStamp.run(expId, sd.stamp_id || null, sd.stamp_excerpt || '', sd.story_excerpt || '', sd.audio_excerpt || '');
      }
    }

    return this.findOne(expId);
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['title', 'theme_type', 'participants', 'target_elderly', 'plan_date', 'key_points', 'family_reminder', 'status', 'created_by'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    if (fields.length > 0) {
      db.prepare(`UPDATE explanations SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM explanations WHERE id = ?').run(id);
    return result.changes > 0;
  }

  updateStatus(id: number, status: string) {
    const db = getDb();
    db.prepare(
      `UPDATE explanations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(status, id);
    return this.findOne(id);
  }

  findStamps(explanationId: number) {
    const db = getDb();
    const stamps = db.prepare(
      `SELECT es.*, s.name as stamp_name, s.issue_year, s.theme as stamp_theme, s.condition as stamp_condition, s.source as stamp_source, s.album_page
       FROM explanation_stamps es
       LEFT JOIN stamps s ON es.stamp_id = s.id
       WHERE es.explanation_id = ?
       ORDER BY es.created_at ASC`
    ).all(explanationId);
    return toCamelCase(stamps);
  }

  addStamp(explanationId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO explanation_stamps (explanation_id, stamp_id, stamp_excerpt, story_excerpt, audio_excerpt)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      explanationId,
      data.stamp_id || null,
      data.stamp_excerpt || '',
      data.story_excerpt || '',
      data.audio_excerpt || ''
    );
    return this.findOne(explanationId);
  }

  updateStamp(explanationId: number, stampId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['stamp_id', 'stamp_excerpt', 'story_excerpt', 'audio_excerpt'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    params.push(explanationId, stampId);

    if (fields.length > 0) {
      db.prepare(`UPDATE explanation_stamps SET ${fields.join(', ')} WHERE explanation_id = ? AND id = ?`).run(...params);
    }
    return this.findOne(explanationId);
  }

  removeStamp(explanationId: number, stampId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM explanation_stamps WHERE explanation_id = ? AND id = ?').run(explanationId, stampId);
    return result.changes > 0;
  }

  findFeedback(explanationId: number) {
    const db = getDb();
    const feedback = db.prepare(
      `SELECT * FROM explanation_feedback
       WHERE explanation_id = ?
       ORDER BY created_at DESC`
    ).all(explanationId);
    return toCamelCase(feedback);
  }

  addFeedback(explanationId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO explanation_feedback (explanation_id, elderly_person, feedback_type, content)
       VALUES (?, ?, ?, ?)`
    ).run(
      explanationId,
      data.elderly_person,
      data.feedback_type,
      data.content || ''
    );
    return this.findOne(explanationId);
  }

  removeFeedback(explanationId: number, feedbackId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM explanation_feedback WHERE explanation_id = ? AND id = ?').run(explanationId, feedbackId);
    return result.changes > 0;
  }

  convertFeedbackToFollowUp(explanationId: number, feedbackId: number, body: Record<string, any>) {
    const db = getDb();
    const feedback = db.prepare('SELECT * FROM explanation_feedback WHERE id = ? AND explanation_id = ?').get(feedbackId, explanationId);
    if (!feedback) return null;

    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO explanation_follow_ups (explanation_id, feedback_id, title, description, assignee, priority, status, due_date, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '反馈转换')`
    ).run(
      explanationId,
      feedbackId,
      data.title || `跟进：${feedback.feedback_type}`,
      data.description || feedback.content || '',
      data.assignee,
      data.priority || '中',
      data.status || '待处理',
      data.due_date || null
    );
    return this.findOne(explanationId);
  }

  appendFeedbackToStory(explanationId: number, feedbackId: number, body: Record<string, any>) {
    const db = getDb();
    const feedback = db.prepare('SELECT * FROM explanation_feedback WHERE id = ? AND explanation_id = ?').get(feedbackId, explanationId);
    if (!feedback) return null;

    const explanationStamps = db.prepare('SELECT stamp_id FROM explanation_stamps WHERE explanation_id = ? LIMIT 1').get(explanationId) as any;
    if (!explanationStamps || !explanationStamps.stamp_id) return null;

    db.prepare(
      `INSERT INTO stories (stamp_id, author, story_type, content)
       VALUES (?, ?, '其他', ?)`
    ).run(
      explanationStamps.stamp_id,
      feedback.elderly_person,
      `【讲解补充】${feedback.content || feedback.feedback_type}\n\n（来自讲解计划 #${explanationId} 的老人反馈补充）`
    );
    return this.findOne(explanationId);
  }

  findFollowUps(explanationId: number) {
    const db = getDb();
    const followUps = db.prepare(
      `SELECT efu.*, ef.elderly_person as feedback_elderly, ef.feedback_type as feedback_type_source
       FROM explanation_follow_ups efu
       LEFT JOIN explanation_feedback ef ON efu.feedback_id = ef.id
       WHERE efu.explanation_id = ?
       ORDER BY efu.priority DESC, efu.due_date ASC`
    ).all(explanationId);
    return toCamelCase(followUps);
  }

  addFollowUp(explanationId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO explanation_follow_ups (explanation_id, feedback_id, title, description, assignee, priority, status, due_date, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '讲解创建')`
    ).run(
      explanationId,
      data.feedback_id || null,
      data.title,
      data.description || '',
      data.assignee,
      data.priority || '中',
      data.status || '待处理',
      data.due_date || null
    );
    return this.findOne(explanationId);
  }

  updateFollowUp(explanationId: number, followUpId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['feedback_id', 'title', 'description', 'assignee', 'priority', 'status', 'due_date'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(explanationId, followUpId);

    if (fields.length > 0) {
      db.prepare(`UPDATE explanation_follow_ups SET ${fields.join(', ')} WHERE explanation_id = ? AND id = ?`).run(...params);
    }
    return this.findOne(explanationId);
  }

  updateFollowUpStatus(explanationId: number, followUpId: number, status: string) {
    const db = getDb();
    db.prepare(
      `UPDATE explanation_follow_ups SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE explanation_id = ? AND id = ?`
    ).run(status, explanationId, followUpId);
    return this.findOne(explanationId);
  }

  removeFollowUp(explanationId: number, followUpId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM explanation_follow_ups WHERE explanation_id = ? AND id = ?').run(explanationId, followUpId);
    return result.changes > 0;
  }

  findVisits(explanationId: number) {
    const db = getDb();
    const visits = db.prepare(
      `SELECT * FROM explanation_visits
       WHERE explanation_id = ?
       ORDER BY visit_date DESC, created_at DESC`
    ).all(explanationId);
    return toCamelCase(visits);
  }

  addVisit(explanationId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO explanation_visits (explanation_id, visitor, visit_date, visit_note, elderly_response, next_plan)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      explanationId,
      data.visitor,
      data.visit_date,
      data.visit_note || '',
      data.elderly_response || '',
      data.next_plan || ''
    );
    db.prepare(`UPDATE explanations SET status = '已回访', updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(explanationId);
    return this.findOne(explanationId);
  }

  findStampExplanations(stampId: number) {
    const db = getDb();
    const items = db.prepare(
      `SELECT e.*, es.stamp_excerpt, es.story_excerpt, es.audio_excerpt
       FROM explanation_stamps es
       INNER JOIN explanations e ON es.explanation_id = e.id
       WHERE es.stamp_id = ?
       ORDER BY e.created_at DESC`
    ).all(stampId);
    return toCamelCase(items);
  }
}
