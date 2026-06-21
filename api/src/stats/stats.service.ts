import { Injectable } from '@nestjs/common';
import { getDb } from '../database';
import { toCamelCase } from '../utils/case';

@Injectable()
export class StatsService {
  getStats() {
    const db = getDb();

    const totalStamps = (db.prepare('SELECT COUNT(*) as cnt FROM stamps').get() as any).cnt;
    const totalThemes = (db.prepare('SELECT COUNT(*) as cnt FROM themes').get() as any).cnt;
    const totalStories = (db.prepare('SELECT COUNT(*) as cnt FROM stories').get() as any).cnt;
    const totalCirculations = (db.prepare('SELECT COUNT(*) as cnt FROM circulations').get() as any).cnt;
    const totalSets = (db.prepare('SELECT COUNT(*) as cnt FROM sets').get() as any).cnt;

    const conditionDistribution = db.prepare(
      "SELECT condition, COUNT(*) as count FROM stamps GROUP BY condition"
    ).all();

    const themeDistributionRaw = db.prepare(
      "SELECT theme, COUNT(*) as count FROM stamps GROUP BY theme ORDER BY count DESC"
    ).all();
    const themeDistribution = themeDistributionRaw.map((t: any) => ({
      name: t.theme || '未分类',
      value: t.count,
    }));

    const yearDistribution = db.prepare(
      "SELECT issue_year, COUNT(*) as count FROM stamps GROUP BY issue_year ORDER BY issue_year"
    ).all();

    const activeCirculations = (db.prepare(
      "SELECT COUNT(*) as cnt FROM circulations WHERE status = '进行中'"
    ).get() as any).cnt;

    const storyTypeDistribution = db.prepare(
      "SELECT story_type, COUNT(*) as count FROM stories GROUP BY story_type"
    ).all();

    const circulationTypeDistribution = db.prepare(
      "SELECT type, COUNT(*) as count FROM circulations GROUP BY type"
    ).all();

    const unsortedAlbumPagesRaw = db.prepare(
      "SELECT album_page, COUNT(*) as count FROM stamps WHERE theme IS NULL OR theme = '' GROUP BY album_page"
    ).all();
    const unsortedAlbumPages = unsortedAlbumPagesRaw.map((p: any) => ({
      name: p.album_page || '未归册',
      count: p.count,
    }));

    const topThemes = themeDistribution
      .filter((t: any) => t.name !== '未分类')
      .slice(0, 5)
      .map((t: any) => ({ name: t.name, count: t.value }));

    const circulationDistributionRaw = db.prepare(
      "SELECT to_person, COUNT(*) as count FROM circulations GROUP BY to_person"
    ).all();
    const circulationDistribution = circulationDistributionRaw.map((c: any) => ({
      name: c.to_person,
      value: c.count,
    }));

    const recentStamps = db.prepare(
      'SELECT * FROM stamps ORDER BY created_at DESC LIMIT 5'
    ).all();

    const recentCirculations = db.prepare(
      'SELECT c.*, s.name as stamp_name FROM circulations c LEFT JOIN stamps s ON c.stamp_id = s.id ORDER BY c.created_at DESC LIMIT 5'
    ).all();

    return toCamelCase({
      totalStamps,
      totalThemes,
      totalStories,
      totalCirculations,
      totalSets,
      activeCirculations,
      conditionDistribution,
      themeDistribution,
      yearDistribution,
      storyTypeDistribution,
      circulationTypeDistribution,
      unsortedAlbumPages,
      topThemes,
      circulationDistribution,
      recentStamps,
      recentCirculations,
    });
  }
}
