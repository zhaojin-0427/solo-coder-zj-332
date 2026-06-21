import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class ThemesService {
  findAll() {
    const db = getDb();
    const themes = db.prepare('SELECT * FROM themes ORDER BY created_at DESC').all();
    return toCamelCase(themes.map((t: any) => ({
      ...t,
      stamp_count: db.prepare('SELECT COUNT(*) as cnt FROM theme_stamps WHERE theme_id = ?').get(t.id)?.cnt || 0,
    })));
  }

  findOne(id: number) {
    const db = getDb();
    const theme = db.prepare('SELECT * FROM themes WHERE id = ?').get(id);
    if (!theme) return null;
    const stamps = db.prepare(
      `SELECT s.* FROM stamps s INNER JOIN theme_stamps ts ON s.id = ts.stamp_id WHERE ts.theme_id = ?`
    ).all(id);
    return toCamelCase({ ...theme, stamps });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare('INSERT INTO themes (name, category, description) VALUES (?, ?, ?)').run(
      data.name,
      data.category,
      data.description || ''
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['name', 'category', 'description'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    params.push(id);
    db.prepare(`UPDATE themes SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM themes WHERE id = ?').run(id);
    return { deleted: true };
  }

  addStamp(themeId: number, stampId: number) {
    const db = getDb();
    db.prepare('INSERT OR IGNORE INTO theme_stamps (theme_id, stamp_id) VALUES (?, ?)').run(themeId, stampId);
    return this.findOne(themeId);
  }

  removeStamp(themeId: number, stampId: number) {
    const db = getDb();
    db.prepare('DELETE FROM theme_stamps WHERE theme_id = ? AND stamp_id = ?').run(themeId, stampId);
    return this.findOne(themeId);
  }
}
