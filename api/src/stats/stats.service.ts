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

    const totalAudioPackages = (db.prepare('SELECT COUNT(*) as cnt FROM audio_packages').get() as any).cnt;
    const pendingItemsCount = (db.prepare(
      "SELECT COUNT(*) as cnt FROM audio_package_items WHERE status IN ('待讲解','讲解中','需重录')"
    ).get() as any).cnt;

    const packageThemeDistributionRaw = db.prepare(
      `SELECT theme_type, COUNT(*) as count 
       FROM audio_packages 
       GROUP BY theme_type
       ORDER BY count DESC`
    ).all();
    const packageThemeDistribution = packageThemeDistributionRaw.map((t: any) => ({
      name: t.theme_type,
      value: t.count,
    }));

    const itemThemeDistributionRaw = db.prepare(
      `SELECT s.theme, COUNT(*) as count 
       FROM audio_package_items api
       INNER JOIN stamps s ON api.stamp_id = s.id
       GROUP BY s.theme
       ORDER BY count DESC`
    ).all();
    const itemThemeDistribution = itemThemeDistributionRaw.map((t: any) => ({
      name: t.theme || '未分类',
      count: t.count,
    }));

    const feedbackTypeDistributionRaw = db.prepare(
      `SELECT feedback_type, COUNT(*) as count 
       FROM package_feedback 
       GROUP BY feedback_type
       ORDER BY count DESC`
    ).all();
    const feedbackTypeDistribution = feedbackTypeDistributionRaw.map((f: any) => ({
      name: f.feedback_type,
      value: f.count,
    }));

    const feedbackElderlyDistributionRaw = db.prepare(
      `SELECT elderly_person, COUNT(*) as count 
       FROM package_feedback 
       GROUP BY elderly_person
       ORDER BY count DESC`
    ).all();
    const feedbackElderlyDistribution = feedbackElderlyDistributionRaw.map((f: any) => ({
      name: f.elderly_person,
      value: f.count,
    }));

    const followUpStatusDistributionRaw = db.prepare(
      `SELECT status, COUNT(*) as count 
       FROM package_follow_ups 
       GROUP BY status
       ORDER BY count DESC`
    ).all();
    const followUpStatusDistribution = followUpStatusDistributionRaw.map((f: any) => ({
      name: f.status,
      value: f.count,
    }));

    const recentAudioPackages = db.prepare(
      'SELECT * FROM audio_packages ORDER BY created_at DESC LIMIT 5'
    ).all();

    const totalExplanations = (db.prepare('SELECT COUNT(*) as cnt FROM explanations').get() as any).cnt;
    const pendingVisitsCount = (db.prepare(
      "SELECT COUNT(*) as cnt FROM explanations WHERE status = '待回访'"
    ).get() as any).cnt;

    const explanationThemeDistributionRaw = db.prepare(
      `SELECT theme_type, COUNT(*) as count 
       FROM explanations 
       GROUP BY theme_type
       ORDER BY count DESC`
    ).all();
    const explanationThemeDistribution = explanationThemeDistributionRaw.map((t: any) => ({
      name: t.theme_type,
      value: t.count,
    }));

    const explanationFrequencyByThemeRaw = db.prepare(
      `SELECT theme_type, COUNT(*) as count 
       FROM explanations 
       GROUP BY theme_type
       ORDER BY count DESC`
    ).all();
    const explanationFrequencyByTheme = explanationFrequencyByThemeRaw.map((t: any) => ({
      name: t.theme_type,
      count: t.count,
    }));

    const explanationFeedbackDistributionRaw = db.prepare(
      `SELECT feedback_type, COUNT(*) as count 
       FROM explanation_feedback 
       GROUP BY feedback_type
       ORDER BY count DESC`
    ).all();
    const explanationFeedbackDistribution = explanationFeedbackDistributionRaw.map((f: any) => ({
      name: f.feedback_type,
      value: f.count,
    }));

    const explanationFollowUpCount = (db.prepare(
      `SELECT COUNT(*) as cnt FROM explanation_follow_ups WHERE source = '反馈转换'`
    ).get() as any).cnt;

    const recentExplanations = db.prepare(
      'SELECT * FROM explanations ORDER BY created_at DESC LIMIT 5'
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
      totalAudioPackages,
      pendingItemsCount,
      packageThemeDistribution,
      itemThemeDistribution,
      feedbackTypeDistribution,
      feedbackElderlyDistribution,
      followUpStatusDistribution,
      recentAudioPackages,
      totalExplanations,
      pendingVisitsCount,
      explanationThemeDistribution,
      explanationFrequencyByTheme,
      explanationFeedbackDistribution,
      explanationFollowUpCount,
      recentExplanations,
    });
  }
}
