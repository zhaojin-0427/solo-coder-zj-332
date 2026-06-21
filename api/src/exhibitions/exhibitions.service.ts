import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class ExhibitionsService {
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
    const sql = `SELECT * FROM exhibitions ${where} ORDER BY created_at DESC`;
    const exhibitions = db.prepare(sql).all(...params);

    const exhibitionIds = exhibitions.map((e: any) => e.id);
    let stampCounts: Record<number, number> = {};
    if (exhibitionIds.length > 0) {
      const placeholders = exhibitionIds.map(() => '?').join(',');
      const counts = db.prepare(
        `SELECT exhibition_id, COUNT(*) as count FROM exhibition_stamps 
         WHERE exhibition_id IN (${placeholders}) AND status != '已移出'
         GROUP BY exhibition_id`
      ).all(...exhibitionIds);
      for (const c of counts) {
        stampCounts[c.exhibition_id] = c.count;
      }
    }

    return toCamelCase(exhibitions.map((e: any) => ({
      ...e,
      stampCount: stampCounts[e.id] || 0,
    })));
  }

  findOne(id: number) {
    const db = getDb();
    const exhibition = db.prepare('SELECT * FROM exhibitions WHERE id = ?').get(id);
    if (!exhibition) return null;

    const stamps = db.prepare(
      `SELECT es.*, s.name as stamp_name, s.issue_year, s.condition, s.album_page
       FROM exhibition_stamps es
       INNER JOIN stamps s ON es.stamp_id = s.id
       WHERE es.exhibition_id = ?
       ORDER BY es.created_at DESC`
    ).all(id);

    return toCamelCase({ ...exhibition, stamps });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO exhibitions (name, theme_type, description, start_date, end_date, location, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.name,
      data.theme_type,
      data.description || '',
      data.start_date || null,
      data.end_date || null,
      data.location || '',
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

    const allowedFields = ['name', 'theme_type', 'description', 'start_date', 'end_date', 'location', 'status', 'created_by'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE exhibitions SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM exhibitions WHERE id = ?').run(id);
    return { deleted: true };
  }

  findExhibitionStamps(exhibitionId: number) {
    const db = getDb();
    const stamps = db.prepare(
      `SELECT es.*, s.name as stamp_name, s.issue_year, s.condition, s.album_page, s.theme, s.source, s.image_url
       FROM exhibition_stamps es
       INNER JOIN stamps s ON es.stamp_id = s.id
       WHERE es.exhibition_id = ?
       ORDER BY es.created_at DESC`
    ).all(exhibitionId);
    return toCamelCase(stamps);
  }

  addStamp(exhibitionId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    db.prepare(
      `INSERT OR IGNORE INTO exhibition_stamps 
       (exhibition_id, stamp_id, display_role, display_note, expected_borrow_date, expected_return_date, keeper, status, display_narration, memorial_meaning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      exhibitionId,
      data.stamp_id,
      data.display_role || '主展品',
      data.display_note || '',
      data.expected_borrow_date || null,
      data.expected_return_date || null,
      data.keeper,
      data.status || '候选',
      data.display_narration || '',
      data.memorial_meaning || ''
    );
    return this.findExhibitionStamps(exhibitionId);
  }

  updateStamp(exhibitionId: number, stampId: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['display_role', 'display_note', 'expected_borrow_date', 'expected_return_date', 'keeper', 'status', 'display_narration', 'memorial_meaning'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findExhibitionStamps(exhibitionId);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(exhibitionId, stampId);

    db.prepare(
      `UPDATE exhibition_stamps SET ${fields.join(', ')} 
       WHERE exhibition_id = ? AND stamp_id = ?`
    ).run(...params);
    return this.findExhibitionStamps(exhibitionId);
  }

  removeStamp(exhibitionId: number, stampId: number) {
    const db = getDb();
    db.prepare('DELETE FROM exhibition_stamps WHERE exhibition_id = ? AND stamp_id = ?').run(exhibitionId, stampId);
    return { deleted: true };
  }

  updateStampStatus(exhibitionId: number, stampId: number, status: string) {
    const db = getDb();
    db.prepare(
      `UPDATE exhibition_stamps SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE exhibition_id = ? AND stamp_id = ?`
    ).run(status, exhibitionId, stampId);
    return this.findExhibitionStamps(exhibitionId);
  }

  replaceStamp(exhibitionId: number, oldStampId: number, body: { newStampId: number; displayRole?: string; keeper?: string }) {
    const db = getDb();
    const transaction = db.transaction(() => {
      db.prepare(
        `UPDATE exhibition_stamps SET status = '已替换', updated_at = CURRENT_TIMESTAMP 
         WHERE exhibition_id = ? AND stamp_id = ?`
      ).run(exhibitionId, oldStampId);

      db.prepare(
        `INSERT OR IGNORE INTO exhibition_stamps 
         (exhibition_id, stamp_id, display_role, keeper, status)
         VALUES (?, ?, ?, ?, '候选')`
      ).run(
        exhibitionId,
        body.newStampId,
        body.displayRole || '主展品',
        body.keeper || ''
      );
    });
    transaction();
    return this.findExhibitionStamps(exhibitionId);
  }

  findStampExhibitions(stampId: number) {
    const db = getDb();
    const exhibitions = db.prepare(
      `SELECT es.*, e.name as exhibition_name, e.theme_type, e.status as exhibition_status,
              e.start_date, e.end_date, e.location
       FROM exhibition_stamps es
       INNER JOIN exhibitions e ON es.exhibition_id = e.id
       WHERE es.stamp_id = ?
       ORDER BY e.created_at DESC`
    ).all(stampId);
    return toCamelCase(exhibitions);
  }
}
