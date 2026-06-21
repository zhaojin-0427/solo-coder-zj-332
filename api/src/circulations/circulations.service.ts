import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase, toSnakeCase } from '../utils/case';

@Injectable()
export class CirculationsService {
  findAll(query: Record<string, string>) {
    const db = getDb();
    const conditions: string[] = [];
    const params: any[] = [];

    if (query.stampId) {
      conditions.push('c.stamp_id = ?');
      params.push(Number(query.stampId));
    }
    if (query.status) {
      conditions.push('c.status = ?');
      params.push(query.status);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT c.*, s.name as stamp_name FROM circulations c LEFT JOIN stamps s ON c.stamp_id = s.id ${where} ORDER BY c.created_at DESC`;
    return toCamelCase(db.prepare(sql).all(...params));
  }

  findOne(id: number) {
    const db = getDb();
    const circulation = db.prepare(
      `SELECT c.*, s.name as stamp_name FROM circulations c LEFT JOIN stamps s ON c.stamp_id = s.id WHERE c.id = ?`
    ).get(id);
    return toCamelCase(circulation);
  }

  create(body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const result = db.prepare(
      `INSERT INTO circulations (stamp_id, type, from_person, to_person, purpose, status, borrow_date, return_date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      data.stamp_id,
      data.type,
      data.from_person,
      data.to_person,
      data.purpose || '',
      data.status,
      data.borrow_date,
      data.return_date || null,
      data.note || ''
    );
    return this.findOne(Number(result.lastInsertRowid));
  }

  update(id: number, body: Record<string, any>) {
    const db = getDb();
    const data = toSnakeCase(body);
    const fields: string[] = [];
    const params: any[] = [];

    const allowedFields = ['stamp_id', 'type', 'from_person', 'to_person', 'purpose', 'status', 'borrow_date', 'return_date', 'note'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findOne(id);

    params.push(id);
    db.prepare(`UPDATE circulations SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = getDb();
    db.prepare('DELETE FROM circulations WHERE id = ?').run(id);
    return { deleted: true };
  }
}
