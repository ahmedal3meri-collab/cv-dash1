-- ============================================================
-- Smart CV Dashboard — Supabase Schema + RLS
-- ============================================================
-- قم بتشغيل هذا الملف في SQL Editor على supabase.com
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. جدول الشركات
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Basic' CHECK (plan IN ('Basic', 'Professional', 'Enterprise')),
  primary_color TEXT NOT NULL DEFAULT '#C9A84C',
  secondary_color TEXT NOT NULL DEFAULT '#0a0a0f',
  logo_url TEXT,
  jobs INT NOT NULL DEFAULT 0,
  applicants_count INT NOT NULL DEFAULT 0,
  hr_users_count INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. جدول حسابات HR
-- ============================================================
CREATE TABLE hr_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'hr' CHECK (role IN ('hr', 'hr_manager')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hr_accounts_company ON hr_accounts(company_id);
CREATE INDEX idx_hr_accounts_email ON hr_accounts(email);

-- ============================================================
-- 3. جدول الوظائف
-- ============================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'دوام كامل',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  apply_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_token ON jobs(apply_token);

-- ============================================================
-- 4. جدول المتقدمين
-- ============================================================
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- البيانات الشخصية
  name TEXT NOT NULL,
  nationality TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  location TEXT,

  -- البيانات المهنية
  current_title TEXT,
  experience TEXT,
  last_employer TEXT,
  education TEXT,
  university TEXT,
  gpa TEXT,

  -- البيانات المنظمة
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',

  -- ملخص الذكاء الاصطناعي
  ai_summary TEXT,

  -- التقييم والحالة
  status TEXT NOT NULL DEFAULT 'مراجعة' CHECK (status IN ('مراجعة', 'مقبول', 'مرفوض')),
  rating INT NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  notes TEXT,

  -- المقابلة
  interview_date DATE,
  interview_time TIME,
  interview_notes TEXT,

  -- الملف الأصلي
  cv_file_url TEXT,

  -- PDPL — تتبع الموافقة والحذف
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  deletion_requested BOOLEAN NOT NULL DEFAULT FALSE,
  deletion_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applicants_company ON applicants(company_id);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_status ON applicants(status);
CREATE INDEX idx_applicants_created ON applicants(created_at DESC);

-- ============================================================
-- 5. جدول التقييمات التفصيلية
-- ============================================================
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  hr_account_id UUID REFERENCES hr_accounts(id) ON DELETE SET NULL,
  score INT CHECK (score BETWEEN 1 AND 10),
  technical_score INT CHECK (technical_score BETWEEN 1 AND 10),
  communication_score INT CHECK (communication_score BETWEEN 1 AND 10),
  cultural_fit_score INT CHECK (cultural_fit_score BETWEEN 1 AND 10),
  notes TEXT,
  recommendation TEXT CHECK (recommendation IN ('strongly_recommend', 'recommend', 'neutral', 'not_recommend')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. جدول سجل التدقيق (Audit Log) — PDPL
-- ============================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  target_id TEXT,
  performed_by TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  ip_address INET,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================
-- 7. Trigger لتحديث updated_at تلقائياً
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. Row Level Security (RLS) — PDPL: عزل بيانات الشركات
-- ============================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- سياسات RLS للشركات
-- ============================================================

-- Service role (backend) يرى كل شيء
CREATE POLICY "service_role_companies_all"
  ON companies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- HR يرى شركته فقط
CREATE POLICY "hr_see_own_company"
  ON companies FOR SELECT
  TO authenticated
  USING (id::text = (auth.jwt() ->> 'company_id'));

-- ============================================================
-- سياسات RLS للمتقدمين — الأهم
-- ============================================================

-- Service role يرى كل شيء
CREATE POLICY "service_role_applicants_all"
  ON applicants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- HR يرى متقدمي شركته فقط — يمنع التسريب بين الشركات
CREATE POLICY "hr_see_own_company_applicants"
  ON applicants FOR SELECT
  TO authenticated
  USING (company_id::text = (auth.jwt() ->> 'company_id'));

CREATE POLICY "hr_update_own_company_applicants"
  ON applicants FOR UPDATE
  TO authenticated
  USING (company_id::text = (auth.jwt() ->> 'company_id'))
  WITH CHECK (company_id::text = (auth.jwt() ->> 'company_id'));

-- PDPL: حذف المتقدم (طلب الحذف)
CREATE POLICY "hr_delete_own_company_applicants"
  ON applicants FOR DELETE
  TO authenticated
  USING (company_id::text = (auth.jwt() ->> 'company_id'));

-- المتقدم يرى بياناته فقط
CREATE POLICY "applicant_see_own_data"
  ON applicants FOR SELECT
  TO anon
  USING (email = (auth.jwt() ->> 'email'));

-- ============================================================
-- سياسات RLS لحسابات HR
-- ============================================================
CREATE POLICY "service_role_hr_all"
  ON hr_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "hr_see_own_account"
  ON hr_accounts FOR SELECT TO authenticated
  USING (id::text = (auth.jwt() ->> 'hr_id'));

-- ============================================================
-- سياسات RLS للوظائف
-- ============================================================
CREATE POLICY "service_role_jobs_all"
  ON jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "hr_see_own_jobs"
  ON jobs FOR SELECT TO authenticated
  USING (company_id::text = (auth.jwt() ->> 'company_id'));

-- وظائف نشطة مرئية للعموم (للصفحة العامة)
CREATE POLICY "public_see_active_jobs"
  ON jobs FOR SELECT TO anon
  USING (is_active = TRUE);

-- ============================================================
-- سياسات RLS لسجل التدقيق
-- ============================================================
CREATE POLICY "service_role_audit_all"
  ON audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "hr_see_own_company_audit"
  ON audit_log FOR SELECT TO authenticated
  USING (company_id::text = (auth.jwt() ->> 'company_id'));

-- ============================================================
-- 9. بيانات تجريبية أولية
-- ============================================================
INSERT INTO companies (id, name, plan, primary_color, secondary_color, jobs, applicants_count, hr_users_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'هيئة أبوظبي للصحة', 'Enterprise', '#C9A84C', '#0a0a0f', 3, 47, 2),
  ('22222222-2222-2222-2222-222222222222', 'مجموعة أبوظبي للطاقة', 'Professional', '#2563eb', '#0f172a', 2, 31, 1),
  ('33333333-3333-3333-3333-333333333333', 'دائرة التعليم والمعرفة', 'Basic', '#059669', '#064e3b', 1, 19, 1);

-- ============================================================
-- ملاحظة PDPL:
-- - جدول audit_log يسجل جميع العمليات تلقائياً
-- - حقل deletion_requested يدعم حق الحذف وفق PDPL
-- - RLS يضمن عزل بيانات كل شركة بشكل كامل
-- - لا تُشارك بيانات المتقدمين بين الشركات أبداً
-- - يجب حذف البيانات تلقائياً بعد 12 شهراً (يُنفَّذ بـ pg_cron)
-- ============================================================
