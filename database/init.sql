-- 健康管理系统数据库初始化脚本
-- 适用于 Supabase PostgreSQL

-- ============================================
-- 启用必要的扩展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  openid VARCHAR(100) UNIQUE,
  nickname VARCHAR(50),
  avatar_url TEXT,
  gender VARCHAR(10),
  birth_date DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- 健康数据表 (health_data)
-- ============================================
CREATE TABLE IF NOT EXISTS health_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_type VARCHAR(50) NOT NULL,
  data_value DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'device')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_health_data_user_id ON health_data(user_id);
CREATE INDEX idx_health_data_type ON health_data(data_type);
CREATE INDEX idx_health_data_recorded_at ON health_data(recorded_at);
CREATE INDEX idx_health_data_user_type_date ON health_data(user_id, data_type, recorded_at);

-- ============================================
-- 运动数据表 (exercise_data)
-- ============================================
CREATE TABLE IF NOT EXISTS exercise_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steps INTEGER DEFAULT 0 CHECK (steps >= 0),
  distance DECIMAL(10,2) DEFAULT 0 CHECK (distance >= 0),
  calories INTEGER DEFAULT 0 CHECK (calories >= 0),
  duration INTEGER DEFAULT 0 CHECK (duration >= 0),
  exercise_date DATE NOT NULL,
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_exercise_data_user_id ON exercise_data(user_id);
CREATE INDEX idx_exercise_data_date ON exercise_data(exercise_date);
CREATE INDEX idx_exercise_data_user_date ON exercise_data(user_id, exercise_date);

-- ============================================
-- 睡眠数据表 (sleep_data)
-- ============================================
CREATE TABLE IF NOT EXISTS sleep_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sleep_date DATE NOT NULL,
  sleep_duration INTEGER DEFAULT 0 CHECK (sleep_duration >= 0),
  deep_sleep_duration INTEGER DEFAULT 0 CHECK (deep_sleep_duration >= 0),
  light_sleep_duration INTEGER DEFAULT 0 CHECK (light_sleep_duration >= 0),
  rem_sleep_duration INTEGER DEFAULT 0 CHECK (rem_sleep_duration >= 0),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_cycles INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_sleep_data_user_id ON sleep_data(user_id);
CREATE INDEX idx_sleep_data_date ON sleep_data(sleep_date);
CREATE INDEX idx_sleep_data_user_date ON sleep_data(user_id, sleep_date);

-- ============================================
-- 饮食记录表 (diet_data)
-- ============================================
CREATE TABLE IF NOT EXISTS diet_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name VARCHAR(100) NOT NULL,
  calories DECIMAL(10,2),
  protein DECIMAL(10,2),
  fat DECIMAL(10,2),
  carbohydrate DECIMAL(10,2),
  fiber DECIMAL(10,2),
  meal_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_diet_data_user_id ON diet_data(user_id);
CREATE INDEX idx_diet_data_meal_time ON diet_data(meal_time);
CREATE INDEX idx_diet_data_user_meal_time ON diet_data(user_id, meal_time);

-- ============================================
-- 健康报告表 (health_reports)
-- ============================================
CREATE TABLE IF NOT EXISTS health_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  report_period VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  content JSONB,
  file_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_health_reports_user_id ON health_reports(user_id);
CREATE INDEX idx_health_reports_type ON health_reports(report_type);
CREATE INDEX idx_health_reports_generated_at ON health_reports(generated_at);
CREATE INDEX idx_health_reports_user_generated ON health_reports(user_id, generated_at);

-- ============================================
-- 系统日志表 (system_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_status ON system_logs(status);
CREATE INDEX idx_system_logs_user_created ON system_logs(user_id, created_at);
CREATE INDEX idx_system_logs_action_created ON system_logs(action, created_at);

-- ============================================
-- 启用行级安全策略 (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 创建RLS策略
-- ============================================

-- 用户表策略
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 健康数据策略
DROP POLICY IF EXISTS "Admins can view all health_data" ON health_data;
CREATE POLICY "Admins can view all health_data"
ON health_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own health_data" ON health_data;
CREATE POLICY "Users can view own health_data"
ON health_data FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health_data" ON health_data;
CREATE POLICY "Users can insert own health_data"
ON health_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 运动数据策略
DROP POLICY IF EXISTS "Admins can view all exercise_data" ON exercise_data;
CREATE POLICY "Admins can view all exercise_data"
ON exercise_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own exercise_data" ON exercise_data;
CREATE POLICY "Users can view own exercise_data"
ON exercise_data FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exercise_data" ON exercise_data;
CREATE POLICY "Users can insert own exercise_data"
ON exercise_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 睡眠数据策略
DROP POLICY IF EXISTS "Admins can view all sleep_data" ON sleep_data;
CREATE POLICY "Admins can view all sleep_data"
ON sleep_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own sleep_data" ON sleep_data;
CREATE POLICY "Users can view own sleep_data"
ON sleep_data FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep_data" ON sleep_data;
CREATE POLICY "Users can insert own sleep_data"
ON sleep_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 饮食数据策略
DROP POLICY IF EXISTS "Admins can view all diet_data" ON diet_data;
CREATE POLICY "Admins can view all diet_data"
ON diet_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own diet_data" ON diet_data;
CREATE POLICY "Users can view own diet_data"
ON diet_data FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own diet_data" ON diet_data;
CREATE POLICY "Users can insert own diet_data"
ON diet_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 健康报告策略
DROP POLICY IF EXISTS "Admins can view all health_reports" ON health_reports;
CREATE POLICY "Admins can view all health_reports"
ON health_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own health_reports" ON health_reports;
CREATE POLICY "Users can view own health_reports"
ON health_reports FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own health_reports" ON health_reports;
CREATE POLICY "Users can insert own health_reports"
ON health_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 系统日志策略
DROP POLICY IF EXISTS "Admins can view all system_logs" ON system_logs;
CREATE POLICY "Admins can view all system_logs"
ON system_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view own system_logs" ON system_logs;
CREATE POLICY "Users can view own system_logs"
ON system_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert logs" ON system_logs;
CREATE POLICY "System can insert logs"
ON system_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- 创建视图 - 用户统计
-- ============================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id,
  u.phone,
  u.nickname,
  u.created_at AS register_date,
  (SELECT COUNT(*) FROM health_data hd WHERE hd.user_id = u.id) AS health_data_count,
  (SELECT COUNT(*) FROM exercise_data ed WHERE ed.user_id = u.id) AS exercise_days,
  (SELECT COUNT(*) FROM sleep_data sd WHERE sd.user_id = u.id) AS sleep_records,
  (SELECT COUNT(*) FROM diet_data dd WHERE dd.user_id = u.id) AS diet_records
FROM users u
WHERE u.status = 'active';

-- ============================================
-- 插入测试管理员用户
-- ============================================
-- 注意：实际使用时需要通过 Supabase Auth 创建用户
-- 这里只是示例，实际密码哈希需要使用 Supabase Auth

-- ============================================
-- 创建更新时间戳触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 users 表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完成
-- ============================================
-- 数据库初始化完成
-- 请记得在 Supabase 控制台中配置环境变量和 API 密钥
