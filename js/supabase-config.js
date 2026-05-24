// Supabase 配置
// 免费注册：https://supabase.com (2分钟搞定)
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库表结构（在Supabase SQL编辑器中运行）：
/*
-- 组员表
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    assignee TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT NOT NULL
);

-- 启用实时订阅
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（简化版，生产环境需要更严格的策略）
CREATE POLICY "Allow all" ON members FOR ALL USING (true);
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);

-- 启用Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
*/
