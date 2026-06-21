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
      `SELECT t.name as theme_name, COUNT(ts.stamp_id) as count 
       FROM themes t 
       LEFT JOIN theme_stamps ts ON t.id = ts.theme_id 
       GROUP BY t.id 
       ORDER BY count DESC`
    ).all();
    const themeDistribution = themeDistributionRaw.map((t: any) => ({
      name: t.theme_name,
      value: t.count,
    }));
    const uncategorizedCount = (db.prepare(
      `SELECT COUNT(*) as cnt FROM stamps s 
       WHERE NOT EXISTS (SELECT 1 FROM theme_stamps ts WHERE ts.stamp_id = s.id)`
    ).get() as any).cnt;
    if (uncategorizedCount > 0) {
      themeDistribution.push({ name: '未分类', value: uncategorizedCount });
    }

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
      `SELECT s.album_page, COUNT(*) as count 
       FROM stamps s 
       WHERE NOT EXISTS (SELECT 1 FROM theme_stamps ts WHERE ts.stamp_id = s.id)
       GROUP BY s.album_page`
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

    const totalExhibitions = (db.prepare('SELECT COUNT(*) as cnt FROM exhibitions').get() as any).cnt;
    const pendingExhibitionStamps = (db.prepare(
      "SELECT COUNT(*) as cnt FROM exhibition_stamps WHERE status = '待确认'"
    ).get() as any).cnt;

    const exhibitionThemeDistributionRaw = db.prepare(
      `SELECT theme_type, COUNT(*) as count 
       FROM exhibitions 
       GROUP BY theme_type
       ORDER BY count DESC`
    ).all();
    const exhibitionThemeDistribution = exhibitionThemeDistributionRaw.map((t: any) => ({
      name: t.theme_type,
      value: t.count,
    }));

    const exhibitionUsageByThemeRaw = db.prepare(
      `SELECT t.name as theme_name, COUNT(DISTINCT es.exhibition_id) as use_count
       FROM exhibition_stamps es
       INNER JOIN stamps s ON es.stamp_id = s.id
       INNER JOIN theme_stamps ts ON s.id = ts.stamp_id
       INNER JOIN themes t ON ts.theme_id = t.id
       WHERE es.status != '已移出'
       GROUP BY t.id
       ORDER BY use_count DESC`
    ).all();
    const exhibitionUsageByTheme = exhibitionUsageByThemeRaw.map((t: any) => ({
      name: t.theme_name,
      count: t.use_count,
    }));

    const keeperDistributionRaw = db.prepare(
      `SELECT keeper, COUNT(*) as count 
       FROM exhibition_stamps 
       WHERE status != '已移出'
       GROUP BY keeper
       ORDER BY count DESC`
    ).all();
    const keeperDistribution = keeperDistributionRaw.map((k: any) => ({
      name: k.keeper,
      value: k.count,
    }));

    const recentExhibitions = db.prepare(
      'SELECT * FROM exhibitions ORDER BY created_at DESC LIMIT 5'
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
      totalExhibitions,
      pendingExhibitionStamps,
      exhibitionThemeDistribution,
      exhibitionUsageByTheme,
      keeperDistribution,
      recentExhibitions,
    });
  }
}
