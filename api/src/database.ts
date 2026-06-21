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
  });

  transaction();
}
