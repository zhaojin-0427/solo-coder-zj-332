import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class StampsService {
  findAll(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.keyword) {
      conditions.push('(s.name LIKE ? OR s.theme LIKE ? OR s.source LIKE ?)');
      const like = `%${query.keyword}%`;
      params.push(like, like, like);
    }
    if (query.theme) {
      conditions.push('s.theme = ?');
      params.push(query.theme);
    }
    if (query.issueYear) {
      conditions.push('s.issue_year = ?');
      params.push(Number(query.issueYear));
    }
    if (query.condition) {
      conditions.push('s.condition = ?');
      params.push(query.condition);
    }
    if (query.albumPage) {
      conditions.push('s.album_page = ?');
      params.push(query.albumPage);
    }
    if (query.setId) {
      conditions.push('s.set_id = ?');
      params.push(Number(query.setId));
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT s.*, st.name as set_name FROM stamps s LEFT JOIN sets st ON s.set_id = st.id ${where} ORDER BY s.created_at DESC`;
    return toCamelCase(db.prepare(sql).all(...params));
  }

  findOne(id: number) {
    const db = getDb();
    const stamp = db.prepare(`SELECT s.*, st.name as set_name FROM stamps s LEFT JOIN sets st ON s.set_id = st.id WHERE s.id = ?`).get(id);
    if (!stamp) return null;
    const themes = db.prepare(`SELECT t.* FROM themes t INNER JOIN theme_stamps ts ON t.id = ts.theme_id WHERE ts.stamp_id = ?`).all(id);
    return toCamelCase({ ...stamp, themes });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO stamps (name, issue_year, theme, condition, source, album_page, set_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.name,
      data.issue_year,
      data.theme || '',
      data.condition,
      data.source || '',
      data.album_page || '',
      data.set_id || null,
      data.image_url || null
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['name', 'issue_year', 'theme', 'condition', 'source', 'album_page', 'set_id', 'image_url'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE stamps SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM stamps WHERE id = ?').run(id);
    return { deleted: true };
  }

  merge(stampIds: number[], targetAlbumPage: string, setId?: number) {
    const db = getDb();
    const transaction = db.transaction(() => {
      let stmt: any;
      if (setId !== undefined && setId !== null) {
        stmt = db.prepare('UPDATE stamps SET album_page = ?, set_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        for (const id of stampIds) {
          stmt.run(targetAlbumPage, setId, id);
        }
      } else {
        stmt = db.prepare('UPDATE stamps SET album_page = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        for (const id of stampIds) {
          stmt.run(targetAlbumPage, id);
        }
      }
    });
    transaction();
    const placeholders = stampIds.map(() => '?').join(',');
    return toCamelCase(db.prepare(`SELECT s.*, st.name as set_name FROM stamps s LEFT JOIN sets st ON s.set_id = st.id WHERE s.id IN (${placeholders})`).all(...stampIds));
  }
}
