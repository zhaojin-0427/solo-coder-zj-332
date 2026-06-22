import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  db = new Database(path.join(__dirname, '..', 'philately.db'));

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      issue_year INTEGER NOT NULL,
      theme TEXT NOT NULL DEFAULT '',
      condition TEXT NOT NULL CHECK(condition IN ('完好','轻微损伤','明显损伤','严重损伤')),
      source TEXT DEFAULT '',
      album_page TEXT DEFAULT '',
      set_id INTEGER REFERENCES sets(id),
      image_url TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('人物','节日','城市','历史事件','其他')),
      description TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS theme_stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme_id INTEGER NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
      stamp_id INTEGER NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
      UNIQUE(theme_id, stamp_id)
    );

    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stamp_id INTEGER NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
      author TEXT NOT NULL,
      story_type TEXT NOT NULL CHECK(story_type IN ('购买背景','交换经历','纪念意义','其他')),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS circulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stamp_id INTEGER NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('借出','归还','转交')),
      from_person TEXT NOT NULL,
      to_person TEXT NOT NULL,
      purpose TEXT DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('进行中','已完成')),
      borrow_date DATE NOT NULL,
      return_date DATE DEFAULT NULL,
      note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_stamps_theme ON stamps(theme);
    CREATE INDEX IF NOT EXISTS idx_stamps_issue_year ON stamps(issue_year);
    CREATE INDEX IF NOT EXISTS idx_stamps_condition ON stamps(condition);
    CREATE INDEX IF NOT EXISTS idx_stamps_album_page ON stamps(album_page);
    CREATE INDEX IF NOT EXISTS idx_stamps_set_id ON stamps(set_id);
    CREATE INDEX IF NOT EXISTS idx_themes_category ON themes(category);
    CREATE INDEX IF NOT EXISTS idx_theme_stamps_theme_id ON theme_stamps(theme_id);
    CREATE INDEX IF NOT EXISTS idx_theme_stamps_stamp_id ON theme_stamps(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_stories_stamp_id ON stories(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_circulations_stamp_id ON circulations(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_circulations_status ON circulations(status);

    CREATE TABLE IF NOT EXISTS exhibitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      theme_type TEXT NOT NULL CHECK(theme_type IN ('社区展览','家庭纪念日','节日主题','其他')),
      description TEXT DEFAULT '',
      start_date DATE,
      end_date DATE,
      location TEXT DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('草稿','进行中','已完成')) DEFAULT '草稿',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exhibition_stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
      stamp_id INTEGER NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
      display_role TEXT NOT NULL CHECK(display_role IN ('主展品','辅助展品','装饰展品')) DEFAULT '主展品',
      display_note TEXT DEFAULT '',
      expected_borrow_date DATE,
      expected_return_date DATE,
      keeper TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('候选','待确认','已确认','暂缓','已替换','已移出')) DEFAULT '候选',
      display_narration TEXT DEFAULT '',
      memorial_meaning TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(exhibition_id, stamp_id)
    );

    CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
    CREATE INDEX IF NOT EXISTS idx_exhibitions_theme_type ON exhibitions(theme_type);
    CREATE INDEX IF NOT EXISTS idx_exhibition_stamps_exhibition_id ON exhibition_stamps(exhibition_id);
    CREATE INDEX IF NOT EXISTS idx_exhibition_stamps_stamp_id ON exhibition_stamps(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_exhibition_stamps_status ON exhibition_stamps(status);
    CREATE INDEX IF NOT EXISTS idx_exhibition_stamps_keeper ON exhibition_stamps(keeper);

    CREATE TABLE IF NOT EXISTS audio_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      theme_type TEXT NOT NULL CHECK(theme_type IN ('家庭回忆','节日庆典','长辈故事','邮品讲解','其他')),
      description TEXT DEFAULT '',
      target_elderly TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('草稿','制作中','已完成','已归档')) DEFAULT '草稿',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audio_package_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL REFERENCES audio_packages(id) ON DELETE CASCADE,
      stamp_id INTEGER REFERENCES stamps(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      audio_url TEXT DEFAULT '',
      duration INTEGER DEFAULT 0,
      narrator TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('待讲解','讲解中','已完成','需重录')) DEFAULT '待讲解',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL REFERENCES audio_packages(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES audio_package_items(id) ON DELETE SET NULL,
      elderly_person TEXT NOT NULL,
      feedback_type TEXT NOT NULL CHECK(feedback_type IN ('喜欢','听不懂','想再听','有补充','其他')),
      rating INTEGER CHECK(rating >= 1 AND rating <= 5) DEFAULT 5,
      content TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS package_follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER NOT NULL REFERENCES audio_packages(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES audio_package_items(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      assignee TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('高','中','低')) DEFAULT '中',
      status TEXT NOT NULL CHECK(status IN ('待处理','处理中','已完成')) DEFAULT '待处理',
      due_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audio_packages_status ON audio_packages(status);
    CREATE INDEX IF NOT EXISTS idx_audio_packages_theme_type ON audio_packages(theme_type);
    CREATE INDEX IF NOT EXISTS idx_audio_packages_target_elderly ON audio_packages(target_elderly);
    CREATE INDEX IF NOT EXISTS idx_audio_package_items_package_id ON audio_package_items(package_id);
    CREATE INDEX IF NOT EXISTS idx_audio_package_items_stamp_id ON audio_package_items(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_audio_package_items_status ON audio_package_items(status);
    CREATE INDEX IF NOT EXISTS idx_package_feedback_package_id ON package_feedback(package_id);
    CREATE INDEX IF NOT EXISTS idx_package_feedback_elderly_person ON package_feedback(elderly_person);
    CREATE INDEX IF NOT EXISTS idx_package_feedback_feedback_type ON package_feedback(feedback_type);
    CREATE INDEX IF NOT EXISTS idx_package_follow_ups_package_id ON package_follow_ups(package_id);
    CREATE INDEX IF NOT EXISTS idx_package_follow_ups_status ON package_follow_ups(status);
    CREATE INDEX IF NOT EXISTS idx_package_follow_ups_assignee ON package_follow_ups(assignee);

    CREATE TABLE IF NOT EXISTS explanations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      theme_type TEXT NOT NULL CHECK(theme_type IN ('家庭回忆','节日庆典','长辈故事','邮品讲解','其他')),
      participants TEXT NOT NULL DEFAULT '',
      target_elderly TEXT NOT NULL,
      plan_date DATE NOT NULL,
      key_points TEXT NOT NULL DEFAULT '',
      family_reminder TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL CHECK(status IN ('待讲解','进行中','已完成','待回访','已回访')) DEFAULT '待讲解',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS explanation_stamps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
      stamp_id INTEGER REFERENCES stamps(id) ON DELETE SET NULL,
      stamp_excerpt TEXT NOT NULL DEFAULT '',
      story_excerpt TEXT NOT NULL DEFAULT '',
      audio_excerpt TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS explanation_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
      elderly_person TEXT NOT NULL,
      feedback_type TEXT NOT NULL CHECK(feedback_type IN ('听懂了','还想补充','需要再次讲解','其他')),
      content TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS explanation_follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
      feedback_id INTEGER REFERENCES explanation_feedback(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      assignee TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('高','中','低')) DEFAULT '中',
      status TEXT NOT NULL CHECK(status IN ('待处理','处理中','已完成')) DEFAULT '待处理',
      due_date DATE,
      source TEXT NOT NULL CHECK(source IN ('讲解创建','反馈转换')) DEFAULT '讲解创建',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS explanation_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      explanation_id INTEGER NOT NULL REFERENCES explanations(id) ON DELETE CASCADE,
      visitor TEXT NOT NULL,
      visit_date DATE NOT NULL,
      visit_note TEXT NOT NULL DEFAULT '',
      elderly_response TEXT NOT NULL DEFAULT '',
      next_plan TEXT NOT NULL DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_explanations_status ON explanations(status);
    CREATE INDEX IF NOT EXISTS idx_explanations_theme_type ON explanations(theme_type);
    CREATE INDEX IF NOT EXISTS idx_explanations_target_elderly ON explanations(target_elderly);
    CREATE INDEX IF NOT EXISTS idx_explanations_plan_date ON explanations(plan_date);
    CREATE INDEX IF NOT EXISTS idx_explanation_stamps_explanation_id ON explanation_stamps(explanation_id);
    CREATE INDEX IF NOT EXISTS idx_explanation_stamps_stamp_id ON explanation_stamps(stamp_id);
    CREATE INDEX IF NOT EXISTS idx_explanation_feedback_explanation_id ON explanation_feedback(explanation_id);
    CREATE INDEX IF NOT EXISTS idx_explanation_feedback_feedback_type ON explanation_feedback(feedback_type);
    CREATE INDEX IF NOT EXISTS idx_explanation_follow_ups_explanation_id ON explanation_follow_ups(explanation_id);
    CREATE INDEX IF NOT EXISTS idx_explanation_follow_ups_status ON explanation_follow_ups(status);
    CREATE INDEX IF NOT EXISTS idx_explanation_follow_ups_assignee ON explanation_follow_ups(assignee);
    CREATE INDEX IF NOT EXISTS idx_explanation_visits_explanation_id ON explanation_visits(explanation_id);
  `);

  seedData(db);

  return db;
}

function seedData(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM stamps').get() as { cnt: number };
  if (count.cnt > 0) return;

  const insertSet = db.prepare('INSERT INTO sets (name, description) VALUES (?, ?)');
  const insertStamp = db.prepare(
    `INSERT INTO stamps (name, issue_year, theme, condition, source, album_page, set_id, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertTheme = db.prepare('INSERT INTO themes (name, category, description) VALUES (?, ?, ?)');
  const insertThemeStamp = db.prepare('INSERT INTO theme_stamps (theme_id, stamp_id) VALUES (?, ?)');
  const insertStory = db.prepare(
    `INSERT INTO stories (stamp_id, author, story_type, content) VALUES (?, ?, ?, ?)`
  );
  const insertCirculation = db.prepare(
    `INSERT INTO circulations (stamp_id, type, from_person, to_person, purpose, status, borrow_date, return_date, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertExhibition = db.prepare(
    `INSERT INTO exhibitions (name, theme_type, description, start_date, end_date, location, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertExhibitionStamp = db.prepare(
    `INSERT INTO exhibition_stamps (exhibition_id, stamp_id, display_role, display_note, expected_borrow_date, expected_return_date, keeper, status, display_narration, memorial_meaning)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertAudioPackage = db.prepare(
    `INSERT INTO audio_packages (name, theme_type, description, target_elderly, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertAudioPackageItem = db.prepare(
    `INSERT INTO audio_package_items (package_id, stamp_id, title, content, audio_url, duration, narrator, display_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertPackageFeedback = db.prepare(
    `INSERT INTO package_feedback (package_id, item_id, elderly_person, feedback_type, rating, content)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertPackageFollowUp = db.prepare(
    `INSERT INTO package_follow_ups (package_id, item_id, title, description, assignee, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const transaction = db.transaction(() => {
    const set1 = insertSet.run('庚辰年生肖龙票', '2000年发行的生肖龙年邮票全套');
    const set2 = insertSet.run('中国古代书法系列', '展示中国历代书法艺术的系列邮票');
    const set3 = insertSet.run('新中国成立纪念邮票', '纪念中华人民共和国成立的相关邮票');

    const s1 = insertStamp.run('庚辰年-龙', 2000, '生肖文化', '完好', '中国邮政', 'A-01', set1.lastInsertRowid, null);
    const s2 = insertStamp.run('辛巳年-蛇', 2001, '生肖文化', '完好', '中国邮政', 'A-01', set1.lastInsertRowid, null);
    const s3 = insertStamp.run('兰亭序', 2010, '书法艺术', '完好', '中国邮政', 'B-03', set2.lastInsertRowid, null);
    const s4 = insertStamp.run('多宝塔碑', 2010, '书法艺术', '轻微损伤', '中国邮政', 'B-03', set2.lastInsertRowid, null);
    const s5 = insertStamp.run('开国大典', 1999, '国庆纪念', '完好', '中国邮政', 'C-01', set3.lastInsertRowid, null);
    const s6 = insertStamp.run('天安门', 1959, '国庆纪念', '明显损伤', '中国邮政', 'C-01', set3.lastInsertRowid, null);
    const s7 = insertStamp.run('中秋节', 2002, '传统节日', '完好', '中国邮政', 'A-02', null, null);
    const s8 = insertStamp.run('端午节', 2001, '传统节日', '完好', '邮展交换', 'A-02', null, null);
    const s9 = insertStamp.run('孔子', 2000, '历史人物', '完好', '中国邮政', 'B-01', null, null);
    const s10 = insertStamp.run('孙中山', 2006, '历史人物', '轻微损伤', '继承', 'B-01', null, null);

    const t1 = insertTheme.run('生肖文化', '节日', '中国十二生肖主题邮票合集');
    const t2 = insertTheme.run('书法艺术', '其他', '中国历代书法名作邮票');
    const t3 = insertTheme.run('国庆纪念', '历史事件', '中华人民共和国成立纪念邮票');
    const t4 = insertTheme.run('传统节日', '节日', '中国传统节日主题邮票');
    const t5 = insertTheme.run('历史人物', '人物', '中国历史上的重要人物邮票');

    insertThemeStamp.run(t1.lastInsertRowid, s1.lastInsertRowid);
    insertThemeStamp.run(t1.lastInsertRowid, s2.lastInsertRowid);
    insertThemeStamp.run(t2.lastInsertRowid, s3.lastInsertRowid);
    insertThemeStamp.run(t2.lastInsertRowid, s4.lastInsertRowid);
    insertThemeStamp.run(t3.lastInsertRowid, s5.lastInsertRowid);
    insertThemeStamp.run(t3.lastInsertRowid, s6.lastInsertRowid);
    insertThemeStamp.run(t4.lastInsertRowid, s7.lastInsertRowid);
    insertThemeStamp.run(t4.lastInsertRowid, s8.lastInsertRowid);
    insertThemeStamp.run(t5.lastInsertRowid, s9.lastInsertRowid);
    insertThemeStamp.run(t5.lastInsertRowid, s10.lastInsertRowid);

    insertStory.run(s1.lastInsertRowid, '王大明', '购买背景', '2000年龙年邮票发行当天，我在北京西单邮局排了两个小时队购买，当时限量发售，非常珍贵。');
    insertStory.run(s3.lastInsertRowid, '李秀芳', '纪念意义', '这枚兰亭序邮票是为了纪念我父亲80岁寿辰特别购买的，父亲一生酷爱书法，尤其钟爱王羲之。');
    insertStory.run(s5.lastInsertRowid, '王大明', '购买背景', '1999年国庆50周年时购买，在邮局窗口排了一整天，买到后激动不已。');
    insertStory.run(s6.lastInsertRowid, '张建国', '交换经历', '这枚天安门邮票是与上海邮友交换得来，虽然品相不太好，但十分稀有珍贵。');
    insertStory.run(s7.lastInsertRowid, '李秀芳', '纪念意义', '中秋节邮票是女儿从杭州寄来的明信片上揭下来的，代表着家人团聚的美好愿望。');
    insertStory.run(s8.lastInsertRowid, '张建国', '交换经历', '在全国集邮展览上与一位武汉邮友交换得到，当时他用端午节邮票换了我多余的建国纪念票。');
    insertStory.run(s9.lastInsertRowid, '王大明', '购买背景', '孔子纪念邮票发行时我正在曲阜旅游，在孔庙旁的邮局购买，感觉特别有意义。');
    insertStory.run(s10.lastInsertRowid, '李秀芳', '纪念意义', '这是爷爷留下的珍贵邮票，爷爷是辛亥革命研究的学者，对孙中山先生有特殊的感情。');

    insertCirculation.run(s1.lastInsertRowid, '借出', '王大明', '张建国', '邮展参展', '进行中', '2025-05-01', null, '计划6月底归还');
    insertCirculation.run(s3.lastInsertRowid, '借出', '李秀芳', '王大明', '家庭聚会展示', '已完成', '2025-03-10', '2025-03-15', '已归还');
    insertCirculation.run(s5.lastInsertRowid, '转交', '王大明', '王小明', '传承给下一代', '已完成', '2025-01-20', '2025-01-20', '儿子收藏');
    insertCirculation.run(s7.lastInsertRowid, '借出', '李秀芳', '赵阿姨', '社区文化展', '进行中', '2025-06-01', null, '预计7月归还');
    insertCirculation.run(s6.lastInsertRowid, '归还', '张建国', '王大明', '参展结束归还', '已完成', '2025-04-15', '2025-04-20', '品相未变');

    const e1 = insertExhibition.run(
      '社区端午节邮品展',
      '节日主题',
      '社区文化中心端午节主题邮品展览，展示传统节日文化',
      '2025-06-10',
      '2025-06-20',
      '社区文化中心',
      '进行中',
      '王小明'
    );
    const e2 = insertExhibition.run(
      '爷爷诞辰100周年纪念展',
      '家庭纪念日',
      '纪念爷爷诞辰100周年家庭私人展，展示爷爷收藏的珍贵邮票',
      '2025-07-01',
      '2025-07-07',
      '家中客厅',
      '草稿',
      '李秀芳'
    );

    insertExhibitionStamp.run(
      e1.lastInsertRowid,
      s7.lastInsertRowid,
      '主展品',
      '放置在入口显眼位置',
      '2025-06-08',
      '2025-06-21',
      '王大明',
      '待确认',
      '这枚中秋节邮票是我女儿从杭州寄来的，上面的邮戳日期是2002年9月21日，正好是中秋节。当时女儿刚去杭州上大学，第一次离家过节，专门寄了这张邮票回来。',
      '代表着家人团聚的美好愿望，每次看到都想起女儿第一次在外过节的牵挂'
    );
    insertExhibitionStamp.run(
      e1.lastInsertRowid,
      s8.lastInsertRowid,
      '辅助展品',
      '与中秋节邮票相邻展示',
      '2025-06-08',
      '2025-06-21',
      '张建国',
      '已确认',
      '端午节邮票是在全国集邮展览上和武汉邮友交换来的，当时他一眼就看中了我那枚建国纪念票，商量了好久才同意交换。',
      '龙舟竞渡的图案生动展现了端午节的传统习俗'
    );
    insertExhibitionStamp.run(
      e1.lastInsertRowid,
      s1.lastInsertRowid,
      '装饰展品',
      '展柜角落装饰',
      '2025-06-08',
      '2025-06-21',
      '王大明',
      '候选',
      '',
      ''
    );
    insertExhibitionStamp.run(
      e2.lastInsertRowid,
      s10.lastInsertRowid,
      '主展品',
      '展柜中心位置',
      '2025-06-28',
      '2025-07-08',
      '李秀芳',
      '已确认',
      '爷爷是辛亥革命研究学者，一生致力于孙中山先生思想的研究。这枚邮票是他1956年在上海旧书摊淘到的，当时花了他半个月的工资。',
      '爷爷说每次看到这枚邮票，就想起孙中山先生"天下为公"的教诲，这是他一生的座右铭'
    );
    insertExhibitionStamp.run(
      e2.lastInsertRowid,
      s5.lastInsertRowid,
      '辅助展品',
      '主展品旁',
      '2025-06-28',
      '2025-07-08',
      '王小明',
      '暂缓',
      '',
      ''
    );

    const ap1 = insertAudioPackage.run(
      '爷爷的故事合集',
      '长辈故事',
      '整理爷爷讲述的生平故事，供家人回听',
      '爷爷',
      '制作中',
      '王小明'
    );
    const ap2 = insertAudioPackage.run(
      '2025年春节家庭回忆',
      '节日庆典',
      '2025年春节家庭聚会的珍贵录音和故事',
      '全家',
      '已完成',
      '李秀芳'
    );
    const ap3 = insertAudioPackage.run(
      '珍贵邮品讲解',
      '邮品讲解',
      '为老人讲解每枚邮票背后的故事',
      '奶奶',
      '草稿',
      '王大明'
    );

    insertAudioPackageItem.run(
      ap1.lastInsertRowid,
      s10.lastInsertRowid,
      '爷爷与孙中山邮票的故事',
      '爷爷是辛亥革命研究学者，一生致力于孙中山先生思想的研究。这枚邮票是他1956年在上海旧书摊淘到的，当时花了他半个月的工资。爷爷说每次看到这枚邮票，就想起孙中山先生天下为公的教诲，这是他一生的座右铭。',
      '/audio/grandpa-sun-yat-sen.mp3',
      180,
      '王小明',
      1,
      '已完成'
    );
    insertAudioPackageItem.run(
      ap1.lastInsertRowid,
      s5.lastInsertRowid,
      '开国大典邮票的记忆',
      '1999年国庆50周年时，我在北京西单邮局排了两个小时队购买这枚开国大典邮票，当时限量发售，买到后激动不已。那年正值建国50周年大庆，整个北京城都洋溢着喜庆的气氛。',
      '/audio/grandpa-founding.mp3',
      150,
      '王大明',
      2,
      '已完成'
    );
    insertAudioPackageItem.run(
      ap1.lastInsertRowid,
      s3.lastInsertRowid,
      '兰亭序与父亲的书法情',
      '这枚兰亭序邮票是为了纪念我父亲80岁寿辰特别购买的，父亲一生酷爱书法，尤其钟爱王羲之。记得小时候每次看父亲练字，他都会给我讲兰亭序的故事，说这是天下第一行书。',
      '',
      0,
      '',
      3,
      '待讲解'
    );
    insertAudioPackageItem.run(
      ap2.lastInsertRowid,
      s7.lastInsertRowid,
      '2025年春节的团圆饭',
      '2025年春节，全家人终于聚齐了。年夜饭上，爷爷讲起了他小时候过年的故事，那时候条件艰苦，但年味儿特别浓。奶奶还拿出了她珍藏多年的中秋节邮票，给孩子们讲邮票背后的故事。',
      '/audio/2025-spring-festival.mp3',
      240,
      '李秀芳',
      1,
      '已完成'
    );
    insertAudioPackageItem.run(
      ap2.lastInsertRowid,
      s8.lastInsertRowid,
      '端午节的龙舟记忆',
      '在全国集邮展览上与一位武汉邮友交换得到这枚端午节邮票，当时他用端午节邮票换了我多余的建国纪念票。今年春节家庭聚会时，我给孩子们讲了这个交换的故事，他们都听得津津有味。',
      '/audio/dragon-boat-story.mp3',
      120,
      '张建国',
      2,
      '已完成'
    );
    insertAudioPackageItem.run(
      ap3.lastInsertRowid,
      s1.lastInsertRowid,
      '龙年邮票的故事',
      '2000年龙年邮票发行当天，我在北京西单邮局排了两个小时队购买，当时限量发售，非常珍贵。那年正是千禧年，大家都说是龙年大吉，所以这枚邮票特别有纪念意义。',
      '',
      0,
      '',
      1,
      '待讲解'
    );
    insertAudioPackageItem.run(
      ap3.lastInsertRowid,
      s6.lastInsertRowid,
      '天安门邮票的回忆',
      '这枚天安门邮票是与上海邮友交换得来，虽然品相不太好，但十分稀有珍贵。1959年发行的这枚邮票，见证了新中国成立10周年的历史时刻。',
      '',
      0,
      '',
      2,
      '需重录'
    );

    insertPackageFeedback.run(
      ap1.lastInsertRowid,
      1,
      '爷爷',
      '喜欢',
      5,
      '讲得很好，听完想起了很多往事。'
    );
    insertPackageFeedback.run(
      ap1.lastInsertRowid,
      2,
      '爷爷',
      '想再听',
      5,
      '开国大典那段我想再听两遍，那年的记忆太深刻了。'
    );
    insertPackageFeedback.run(
      ap2.lastInsertRowid,
      4,
      '奶奶',
      '有补充',
      4,
      '春节那天还有包饺子的趣事，下次可以加上。'
    );
    insertPackageFeedback.run(
      ap2.lastInsertRowid,
      null,
      '爷爷',
      '喜欢',
      5,
      '整个资料包做得很好，听着很感动。'
    );

    insertPackageFollowUp.run(
      ap1.lastInsertRowid,
      3,
      '录制兰亭序讲解',
      '需要找父亲录制兰亭序邮票的讲解音频，他对这段历史最熟悉。',
      '王小明',
      '高',
      '待处理',
      '2025-07-15'
    );
    insertPackageFollowUp.run(
      ap3.lastInsertRowid,
      7,
      '重录天安门邮票讲解',
      '上次录音背景噪音太大，需要重新录制。最好找一个安静的环境。',
      '王大明',
      '中',
      '处理中',
      '2025-07-20'
    );
    insertPackageFollowUp.run(
      ap3.lastInsertRowid,
      6,
      '准备龙年邮票讲解稿',
      '需要提前准备讲解稿，可以结合2000年时的社会背景。',
      '李秀芳',
      '低',
      '已完成',
      '2025-07-10'
    );

    const insertExplanation = db.prepare(
      `INSERT INTO explanations (title, theme_type, participants, target_elderly, plan_date, key_points, family_reminder, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertExplanationStamp = db.prepare(
      `INSERT INTO explanation_stamps (explanation_id, stamp_id, stamp_excerpt, story_excerpt, audio_excerpt)
       VALUES (?, ?, ?, ?, ?)`
    );
    const insertExplanationFeedback = db.prepare(
      `INSERT INTO explanation_feedback (explanation_id, elderly_person, feedback_type, content)
       VALUES (?, ?, ?, ?)`
    );
    const insertExplanationFollowUp = db.prepare(
      `INSERT INTO explanation_follow_ups (explanation_id, feedback_id, title, description, assignee, priority, status, due_date, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertExplanationVisit = db.prepare(
      `INSERT INTO explanation_visits (explanation_id, visitor, visit_date, visit_note, elderly_response, next_plan)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const ex1 = insertExplanation.run(
      '爷爷的龙年邮票故事',
      '长辈故事',
      '王小明,李秀芳,王大明',
      '爷爷',
      '2025-06-25',
      '重点讲解龙年邮票的发行背景、千禧年的特殊意义、爷爷当年排队购买的经历',
      '提前准备好放大镜，让爷爷能看清邮票细节；准备好茶水和舒适的座椅',
      '待回访',
      '王小明'
    );
    const ex2 = insertExplanation.run(
      '端午节传统习俗讲解',
      '节日庆典',
      '张建国,李秀芳',
      '奶奶',
      '2025-06-28',
      '讲解端午节的由来、屈原的故事、赛龙舟和吃粽子的习俗',
      '可以准备一些粽子作为讲解时的小点心',
      '待讲解',
      '李秀芳'
    );
    const ex3 = insertExplanation.run(
      '开国大典邮票历史',
      '历史事件',
      '王小明,王大明',
      '爷爷',
      '2025-07-01',
      '结合建国50周年背景，讲述开国大典邮票的设计理念和历史价值',
      '准备好相关历史照片辅助讲解',
      '已完成',
      '王大明'
    );
    const ex4 = insertExplanation.run(
      '兰亭序书法艺术',
      '邮品讲解',
      '李秀芳',
      '父亲',
      '2025-07-05',
      '讲解王羲之与兰亭序的故事、书法艺术特点、邮票设计特色',
      '准备笔墨纸砚让父亲可以现场书写',
      '已回访',
      '王小明'
    );

    insertExplanationStamp.run(ex1.lastInsertRowid, s1.lastInsertRowid,
      '2000年庚辰年龙年邮票，生肖文化主题，品相完好',
      '2000年龙年邮票发行当天在北京西单邮局排队两小时购买，千禧年特别纪念',
      '回听资料包「珍贵邮品讲解」- 龙年邮票的故事'
    );
    insertExplanationStamp.run(ex2.lastInsertRowid, s8.lastInsertRowid,
      '2001年端午节邮票，传统节日主题，与武汉邮友交换获得',
      '在全国集邮展览上与武汉邮友交换得来，讲述交换的趣事',
      '回听资料包「2025年春节家庭回忆」- 端午节的龙舟记忆'
    );
    insertExplanationStamp.run(ex3.lastInsertRowid, s5.lastInsertRowid,
      '1999年开国大典邮票，国庆纪念主题',
      '1999年国庆50周年时在北京排队一整天购买，激动不已',
      '回听资料包「爷爷的故事合集」- 开国大典邮票的记忆'
    );
    insertExplanationStamp.run(ex4.lastInsertRowid, s3.lastInsertRowid,
      '2010年兰亭序邮票，书法艺术主题',
      '为纪念父亲80岁寿辰特别购买，父亲一生酷爱书法',
      '回听资料包「爷爷的故事合集」- 兰亭序与父亲的书法情'
    );

    insertExplanationFeedback.run(ex3.lastInsertRowid, '爷爷', '听懂了', '讲得很好，我想起了当年建国50周年的盛况。');
    insertExplanationFeedback.run(ex3.lastInsertRowid, '爷爷', '还想补充', '当年还有群众游行，我也在现场，改天详细讲给你们听。');
    insertExplanationFeedback.run(ex4.lastInsertRowid, '父亲', '听懂了', '兰亭序的故事讲得不错，我也想再看看那枚邮票。');
    insertExplanationFeedback.run(ex1.lastInsertRowid, '爷爷', '需要再次讲解', '有些地方没听清，下次再给我讲讲千禧年的事情。');

    insertExplanationFollowUp.run(ex1.lastInsertRowid, 4, '再次讲解龙年邮票千禧年部分', '爷爷没听清千禧年的社会背景，需要准备更详细的资料再次讲解。', '王小明', '高', '待处理', '2025-07-10', '反馈转换');
    insertExplanationFollowUp.run(ex3.lastInsertRowid, 2, '记录爷爷的群众游行经历', '爷爷说他当年也在开国大典游行现场，需要找时间详细记录下来。', '李秀芳', '中', '待处理', '2025-07-15', '反馈转换');
    insertExplanationFollowUp.run(ex2.lastInsertRowid, null, '准备讲解辅助材料', '需要打印端午节相关的历史图片和屈原的故事。', '张建国', '低', '已完成', '2025-06-27', '讲解创建');

    insertExplanationVisit.run(ex4.lastInsertRowid, '王小明', '2025-07-06',
      '回访了父亲，他对兰亭序的讲解很满意，还当场书写了"兰亭序"三个字。',
      '父亲说讲解唤起了他很多年轻时练字的回忆，非常开心。',
      '计划下个月再安排一次书法主题的讲解，并邀请父亲现场教学。'
    );
  });

  transaction();
}
