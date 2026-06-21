import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class StoriesService {
  findAll(stampId?: number) {
    const db = getDb();
    if (stampId) {
      return toCamelCase(db.prepare('SELECT * FROM stories WHERE stamp_id = ? ORDER BY created_at DESC').all(stampId));
    }
    return toCamelCase(db.prepare('SELECT * FROM stories ORDER BY created_at DESC').all());
  }

  findOne(id: number) {
    const db = getDb();
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(id);
    if (!story) return null;
    const stamp = db.prepare('SELECT * FROM stamps WHERE id = ?').get((story as any).stamp_id);
    return toCamelCase({ ...story, stamp });
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      'INSERT INTO stories (stamp_id, author, story_type, content) VALUES (?, ?, ?, ?)'
    ).run(data.stamp_id, data.author, data.story_type, data.content);
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['stamp_id', 'author', 'story_type', 'content'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    params.push(id);
    db.prepare(`UPDATE stories SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM stories WHERE id = ?').run(id);
    return { deleted: true };
  }
}
