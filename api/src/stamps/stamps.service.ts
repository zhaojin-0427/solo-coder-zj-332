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
      conditions.push('(s.name LIKE ? OR s.source LIKE ?)');
      const like = `%${query.keyword}%`;
      params.push(like, like);
    }
    if (query.theme) {
      conditions.push(`s.id IN (SELECT ts.stamp_id FROM theme_stamps ts INNER JOIN themes t ON t.id = ts.theme_id WHERE t.name = ?)`);
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
    const stamps = db.prepare(sql).all(...params);
    
    const stampIds = stamps.map((s: any) => s.id);
    let themesMap: Record<number, any[]> = {};
    if (stampIds.length > 0) {
      const placeholders = stampIds.map(() => '?').join(',');
      const themes = db.prepare(
        `SELECT ts.stamp_id, t.* FROM themes t 
         INNER JOIN theme_stamps ts ON t.id = ts.theme_id 
         WHERE ts.stamp_id IN (${placeholders})
         ORDER BY t.created_at DESC`
      ).all(...stampIds);
      for (const th of themes) {
        if (!themesMap[th.stamp_id]) themesMap[th.stamp_id] = [];
        themesMap[th.stamp_id].push({ id: th.id, name: th.name, category: th.category, description: th.description, createdAt: th.created_at });
      }
    }
    
    return toCamelCase(stamps.map((s: any) => ({
      ...s,
      themes: themesMap[s.id] || [],
    })));
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
    const stamps = db.prepare(`SELECT s.*, st.name as set_name FROM stamps s LEFT JOIN sets st ON s.set_id = st.id WHERE s.id IN (${placeholders})`).all(...stampIds);
    
    const ids = stamps.map((s: any) => s.id);
    let themesMap: Record<number, any[]> = {};
    if (ids.length > 0) {
      const ph = ids.map(() => '?').join(',');
      const themes = db.prepare(
        `SELECT ts.stamp_id, t.* FROM themes t 
         INNER JOIN theme_stamps ts ON t.id = ts.theme_id 
         WHERE ts.stamp_id IN (${ph})
         ORDER BY t.created_at DESC`
      ).all(...ids);
      for (const th of themes) {
        if (!themesMap[th.stamp_id]) themesMap[th.stamp_id] = [];
        themesMap[th.stamp_id].push({ id: th.id, name: th.name, category: th.category, description: th.description, createdAt: th.created_at });
      }
    }
    
    return toCamelCase(stamps.map((s: any) => ({
      ...s,
      themes: themesMap[s.id] || [],
    })));
  }

  addTheme(stampId: number, themeId: number) {
    const db = getDb();
    db.prepare('INSERT OR IGNORE INTO theme_stamps (stamp_id, theme_id) VALUES (?, ?)').run(stampId, themeId);
    return this.findOne(stampId);
  }

  removeTheme(stampId: number, themeId: number) {
    const db = getDb();
    db.prepare('DELETE FROM theme_stamps WHERE stamp_id = ? AND theme_id = ?').run(stampId, themeId);
    return this.findOne(stampId);
  }

  setThemes(stampId: number, themeIds: number[]) {
    const db = getDb();
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM theme_stamps WHERE stamp_id = ?').run(stampId);
      const stmt = db.prepare('INSERT OR IGNORE INTO theme_stamps (stamp_id, theme_id) VALUES (?, ?)');
      for (const themeId of themeIds) {
        stmt.run(stampId, themeId);
      }
    });
    transaction();
    return this.findOne(stampId);
  }
}
