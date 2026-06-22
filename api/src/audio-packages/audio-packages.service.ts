import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class AudioPackagesService {
  findAll(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.status) {
      conditions.push('status = ?');
      params.push(query.status);
    }
    if (query.themeType) {
      conditions.push('theme_type = ?');
      params.push(query.themeType);
    }
    if (query.targetElderly) {
      conditions.push('target_elderly = ?');
      params.push(query.targetElderly);
    }
    if (query.createdBy) {
      conditions.push('created_by = ?');
      params.push(query.createdBy);
    }
    if (query.keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const like = `%${query.keyword}%`;
      params.push(like, like);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT * FROM audio_packages ${where} ORDER BY created_at DESC`;
    const packages = db.prepare(sql).all(...params);

    const packageIds = packages.map((p: any) => p.id);
    let itemCounts: Record<number, number> = {};
    let pendingCounts: Record<number, number> = {};
    if (packageIds.length > 0) {
      const placeholders = packageIds.map(() => '?').join(',');
      const counts = db.prepare(
        `SELECT package_id, COUNT(*) as count FROM audio_package_items 
         WHERE package_id IN (${placeholders})
         GROUP BY package_id`
      ).all(...packageIds);
      for (const c of counts) {
        itemCounts[c.package_id] = c.count;
      }

      const pending = db.prepare(
        `SELECT package_id, COUNT(*) as count FROM audio_package_items 
         WHERE package_id IN (${placeholders}) AND status IN ('待讲解','讲解中','需重录')
         GROUP BY package_id`
      ).all(...packageIds);
      for (const p of pending) {
        pendingCounts[p.package_id] = p.count;
      }
    }

    return toCamelCase(packages.map((p: any) => ({
      ...p,
      itemCount: itemCounts[p.id] || 0,
      pendingItemCount: pendingCounts[p.id] || 0,
    })));
  }

  findOne(id: number) {
    const db = getDb();
    const pkg = db.prepare('SELECT * FROM audio_packages WHERE id = ?').get(id);
    if (!pkg) return null;

    const items = db.prepare(
      `SELECT api.*, s.name as stamp_name, s.issue_year, s.condition, s.theme as stamp_theme
       FROM audio_package_items api
       LEFT JOIN stamps s ON api.stamp_id = s.id
       WHERE api.package_id = ?
       ORDER BY api.display_order, api.created_at ASC`
    ).all(id);

    const feedback = db.prepare(
      `SELECT pf.*, api.title as item_title
       FROM package_feedback pf
       LEFT JOIN audio_package_items api ON pf.item_id = api.id
       WHERE pf.package_id = ?
       ORDER BY pf.created_at DESC`
    ).all(id);

    const followUps = db.prepare(
      `SELECT pfu.*, api.title as item_title
       FROM package_follow_ups pfu
       LEFT JOIN audio_package_items api ON pfu.item_id = api.id
       WHERE pfu.package_id = ?
       ORDER BY pfu.priority DESC, pfu.due_date ASC`
    ).all(id);

    return toCamelCase({ ...pkg, items, feedback, followUps });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO audio_packages (name, theme_type, description, target_elderly, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      data.name,
      data.theme_type,
      data.description || '',
      data.target_elderly,
      data.status || '草稿',
      data.created_by
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['name', 'theme_type', 'description', 'target_elderly', 'status', 'created_by'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    if (fields.length > 0) {
      db.prepare(`UPDATE audio_packages SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    }
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM audio_packages WHERE id = ?').run(id);
    return result.changes > 0;
  }

  findItems(packageId: number) {
    const db = getDb();
    const items = db.prepare(
      `SELECT api.*, s.name as stamp_name, s.issue_year, s.condition, s.theme as stamp_theme
       FROM audio_package_items api
       LEFT JOIN stamps s ON api.stamp_id = s.id
       WHERE api.package_id = ?
       ORDER BY api.display_order, api.created_at ASC`
    ).all(packageId);
    return toCamelCase(items);
  }

  addItem(packageId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO audio_package_items (package_id, stamp_id, title, content, audio_url, duration, narrator, display_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      packageId,
      data.stamp_id || null,
      data.title,
      data.content,
      data.audio_url || '',
      data.duration || 0,
      data.narrator || '',
      data.display_order || 0,
      data.status || '待讲解'
    );
    return this.findOne(packageId);
  }

  updateItem(packageId: number, itemId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['stamp_id', 'title', 'content', 'audio_url', 'duration', 'narrator', 'display_order', 'status'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(packageId, itemId);

    if (fields.length > 0) {
      db.prepare(`UPDATE audio_package_items SET ${fields.join(', ')} WHERE package_id = ? AND id = ?`).run(...params);
    }
    return this.findOne(packageId);
  }

  updateItemStatus(packageId: number, itemId: number, status: string) {
    const db = getDb();
    db.prepare(
      `UPDATE audio_package_items SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE package_id = ? AND id = ?`
    ).run(status, packageId, itemId);
    return this.findOne(packageId);
  }

  removeItem(packageId: number, itemId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM audio_package_items WHERE package_id = ? AND id = ?').run(packageId, itemId);
    return result.changes > 0;
  }

  findFeedback(packageId: number) {
    const db = getDb();
    const feedback = db.prepare(
      `SELECT pf.*, api.title as item_title
       FROM package_feedback pf
       LEFT JOIN audio_package_items api ON pf.item_id = api.id
       WHERE pf.package_id = ?
       ORDER BY pf.created_at DESC`
    ).all(packageId);
    return toCamelCase(feedback);
  }

  addFeedback(packageId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO package_feedback (package_id, item_id, elderly_person, feedback_type, rating, content)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      packageId,
      data.item_id || null,
      data.elderly_person,
      data.feedback_type,
      data.rating || 5,
      data.content || ''
    );
    return this.findOne(packageId);
  }

  removeFeedback(packageId: number, feedbackId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM package_feedback WHERE package_id = ? AND id = ?').run(packageId, feedbackId);
    return result.changes > 0;
  }

  findFollowUps(packageId: number) {
    const db = getDb();
    const followUps = db.prepare(
      `SELECT pfu.*, api.title as item_title
       FROM package_follow_ups pfu
       LEFT JOIN audio_package_items api ON pfu.item_id = api.id
       WHERE pfu.package_id = ?
       ORDER BY pfu.priority DESC, pfu.due_date ASC`
    ).all(packageId);
    return toCamelCase(followUps);
  }

  addFollowUp(packageId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT INTO package_follow_ups (package_id, item_id, title, description, assignee, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      packageId,
      data.item_id || null,
      data.title,
      data.description || '',
      data.assignee,
      data.priority || '中',
      data.status || '待处理',
      data.due_date || null
    );
    return this.findOne(packageId);
  }

  updateFollowUp(packageId: number, followUpId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['item_id', 'title', 'description', 'assignee', 'priority', 'status', 'due_date'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(packageId, followUpId);

    if (fields.length > 0) {
      db.prepare(`UPDATE package_follow_ups SET ${fields.join(', ')} WHERE package_id = ? AND id = ?`).run(...params);
    }
    return this.findOne(packageId);
  }

  updateFollowUpStatus(packageId: number, followUpId: number, status: string) {
    const db = getDb();
    db.prepare(
      `UPDATE package_follow_ups SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE package_id = ? AND id = ?`
    ).run(status, packageId, followUpId);
    return this.findOne(packageId);
  }

  removeFollowUp(packageId: number, followUpId: number) {
    const db = getDb();
    const result = db.prepare('DELETE FROM package_follow_ups WHERE package_id = ? AND id = ?').run(packageId, followUpId);
    return result.changes > 0;
  }

  findStampAudioPackages(stampId: number) {
    const db = getDb();
    const items = db.prepare(
      `SELECT api.*, ap.name as package_name, ap.theme_type, ap.status as package_status, ap.target_elderly
       FROM audio_package_items api
       INNER JOIN audio_packages ap ON api.package_id = ap.id
       WHERE api.stamp_id = ?
       ORDER BY ap.created_at DESC`
    ).all(stampId);
    return toCamelCase(items);
  }
}
