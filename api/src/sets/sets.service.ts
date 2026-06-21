import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase } from '../utils/case';

@Injectable()
export class SetsService {
  findAll() {
    const db = getDb();
    const sets = db.prepare('SELECT * FROM sets ORDER BY created_at DESC').all();
    return toCamelCase(sets.map((s: any) => ({
      ...s,
      stamp_count: db.prepare('SELECT COUNT(*) as cnt FROM stamps WHERE set_id = ?').get(s.id)?.cnt || 0,
    })));
  }

  findOne(id: number) {
    const db = getDb();
    const set = db.prepare('SELECT * FROM sets WHERE id = ?').get(id);
    if (!set) return null;
    const stamps = db.prepare('SELECT * FROM stamps WHERE set_id = ? ORDER BY created_at DESC').all(id);
    return toCamelCase({ ...set, stamps });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const result = db.prepare('INSERT INTO sets (name, description) VALUES (?, ?)').run(
      body.name,
      body.description || ''
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['name', 'description'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(body[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    params.push(id);
    db.prepare(`UPDATE sets SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM sets WHERE id = ?').run(id);
    return { deleted: true };
  }
}
