-- 数据库迁移：添加 password_hash 字段
-- 在 Supabase SQL Editor 中执行此脚本

-- 添加 password_hash 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 添加索引（可选）
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash) WHERE password_hash IS NOT NULL;

-- 验证字段是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';
