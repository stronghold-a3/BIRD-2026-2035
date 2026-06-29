*
================================================================
BIRD Strategic Planning - Comprehensive Database Schema
================================================================
Purpose:
Comprehensive database schema for the BIRD AI-powered strategic 
planning PWA. Supports user authentication, strategic plans, 
SWOT analysis, strategy matrix, balanced scorecard, PAPs management, 
team collaboration, activity logging, plan templates, notifications, 
and admin functionality.

Security Enhancements Applied:
1. Immutable search_path set on all functions to prevent search_path hijacking.
2. SECURITY DEFINER converted to SECURITY INVOKER for trigger functions 
   (handle_new_user, log_activity) to run with caller's privileges.
3. EXECUTE privileges revoked from PUBLIC, anon, and authenticated roles 
   on all internal/trigger functions to prevent unauthorized RPC calls.
================================================================
*/

-- ============================================================
-- 1. TABLE DEFINITIONS
-- ============================================================

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    organization text,
    job_title text,
    phone text,
    role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    assigned_regions text[] DEFAULT '{}',
    notification_preferences jsonb DEFAULT '{"email": true, "kpi_alerts": true, "weekly_digest": true, "plan_reminders": true, "team_updates": true}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    last_seen_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    logo_url text,
    industry text,
    region text,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Organization members
CREATE TABLE IF NOT EXISTS organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'editor', 'admin')),
    joined_at timestamptz DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

-- Strategic plans
CREATE TABLE IF NOT EXISTS strategic_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    title text NOT NULL DEFAULT 'Untitled Strategic Plan',
    subtitle text,
    description text,
    industry text DEFAULT 'Investment',
    region text DEFAULT 'BARMM',
    start_year int DEFAULT 2026,
    end_year int DEFAULT 2035,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'completed')),
    budget_total numeric(15,2) DEFAULT 0,
    budget_allocated numeric(15,2) DEFAULT 0,
    progress_pct int DEFAULT 0,
    last_synced_at timestamptz DEFAULT now(),
    sync_status text DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'syncing', 'error', 'offline')),
    version int DEFAULT 1,
    is_template boolean DEFAULT false,
    template_id uuid REFERENCES strategic_plans(id) ON DELETE SET NULL,
    local_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Plan templates
CREATE TABLE IF NOT EXISTS plan_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    industry text NOT NULL,
    region text DEFAULT 'BARMM',
    template_data jsonb NOT NULL DEFAULT '{}',
    is_public boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Plan shares
CREATE TABLE IF NOT EXISTS plan_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    permission_level text NOT NULL DEFAULT 'viewer' CHECK (permission_level IN ('viewer', 'editor', 'admin')),
    shared_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    accepted boolean DEFAULT false,
    CHECK (shared_with_user_id IS NOT NULL OR shared_with_org_id IS NOT NULL)
);

-- SWOT items
CREATE TABLE IF NOT EXISTS swot_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    category text NOT NULL CHECK (category IN ('strength', 'weakness', 'opportunity', 'threat')),
    title text NOT NULL,
    description text,
    impact int DEFAULT 3 CHECK (impact BETWEEN 1 AND 5),
    likelihood int DEFAULT 3 CHECK (likelihood BETWEEN 1 AND 5),
    resilience_index numeric(4,2) DEFAULT 0,
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    ai_generated boolean DEFAULT false,
    ai_recommendation text,
    beie_cluster text DEFAULT 'foundations',
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Strategy matrix (TOWS)
CREATE TABLE IF NOT EXISTS strategy_matrix (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    quadrant text NOT NULL CHECK (quadrant IN ('SO', 'ST', 'WO', 'WT')),
    strategy text NOT NULL,
    description text,
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    ai_generated boolean DEFAULT false,
    linked_swot_items uuid[] DEFAULT '{}',
    beie_cluster text DEFAULT 'foundations',
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Balanced scorecards
CREATE TABLE IF NOT EXISTS balanced_scorecards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    perspective text NOT NULL CHECK (perspective IN ('financial', 'customer', 'internal_process', 'learning_growth')),
    description text,
    weight_pct int DEFAULT 25,
    created_at timestamptz DEFAULT now()
);

-- Scorecard objectives
CREATE TABLE IF NOT EXISTS scorecard_objectives (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id uuid NOT NULL REFERENCES balanced_scorecards(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    target_value text,
    current_value text,
    progress_pct int DEFAULT 0,
    priority text DEFAULT 'medium',
    ai_suggested boolean DEFAULT false,
    beie_cluster text DEFAULT 'foundations',
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Scorecard KPIs
CREATE TABLE IF NOT EXISTS scorecard_kpis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id uuid NOT NULL REFERENCES scorecard_objectives(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    target_value numeric(15,2) DEFAULT 0,
    current_value numeric(15,2) DEFAULT 0,
    unit text DEFAULT 'count',
    frequency text DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
    formula text,
    data_source text,
    status text DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'off_track', 'achieved')),
    ai_suggested boolean DEFAULT false,
    alert_threshold numeric(5,2) DEFAULT 80,
    baseline_value numeric(15,2) DEFAULT 0,
    target_year int DEFAULT 2026,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- PAPs (Programs, Activities, Projects)
CREATE TABLE IF NOT EXISTS paps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('program', 'activity', 'project')),
    code text,
    title text NOT NULL,
    description text,
    objective_id uuid REFERENCES scorecard_objectives(id) ON DELETE SET NULL,
    beie_cluster text DEFAULT 'foundations',
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
    budget_allocated numeric(15,2) DEFAULT 0,
    budget_spent numeric(15,2) DEFAULT 0,
    progress_pct int DEFAULT 0,
    start_date date,
    end_date date,
    due_quarter text DEFAULT 'Q1',
    lead_agency text,
    dependencies uuid[] DEFAULT '{}',
    ai_generated boolean DEFAULT false,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type text NOT NULL CHECK (action_type IN (
        'plan_created', 'plan_updated', 'plan_exported', 'plan_shared',
        'swot_added', 'swot_updated', 'swot_deleted',
        'strategy_added', 'strategy_updated', 'strategy_deleted',
        'objective_added', 'objective_updated', 'objective_deleted',
        'kpi_added', 'kpi_updated', 'kpi_deleted', 'kpi_value_updated',
        'pap_added', 'pap_updated', 'pap_deleted', 'pap_status_changed',
        'comment_added', 'comment_updated', 'comment_deleted',
        'member_joined', 'member_left', 'member_role_changed',
        'template_used', 'ai_suggestion_accepted', 'ai_suggestion_rejected',
        'sync_completed', 'sync_failed', 'sync_conflict_resolved'
    )),
    entity_type text NOT NULL CHECK (entity_type IN ('plan', 'swot', 'strategy', 'objective', 'kpi', 'pap', 'comment', 'member', 'template', 'sync')),
    entity_id uuid,
    details jsonb DEFAULT '{}',
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type text NOT NULL CHECK (entity_type IN ('swot', 'strategy', 'objective', 'kpi', 'pap', 'plan')),
    entity_id uuid NOT NULL,
    parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    content text NOT NULL,
    resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Plan collaboration presence
CREATE TABLE IF NOT EXISTS plan_collaboration (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name text,
    user_avatar text,
    section text NOT NULL CHECK (section IN ('overview', 'swot', 'strategy', 'scorecard', 'paps', 'systems', 'export')),
    action text DEFAULT 'viewing' CHECK (action IN ('viewing', 'editing')),
    cursor_position jsonb,
    last_seen_at timestamptz DEFAULT now(),
    UNIQUE (plan_id, user_id, section)
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN (
        'welcome', 'kpi_alert', 'weekly_digest', 'plan_reminder',
        'team_invite', 'team_update', 'comment_reply', 'sync_conflict',
        'system', 'ai_suggestion'
    )),
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false,
    is_email_sent boolean DEFAULT false,
    data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Plan comparison snapshots
CREATE TABLE IF NOT EXISTS plan_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    version int NOT NULL,
    snapshot_data jsonb NOT NULL,
    created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now()
);

-- Causal loop diagrams
CREATE TABLE IF NOT EXISTS causal_loops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    loop_type text NOT NULL CHECK (loop_type IN ('reinforcing', 'balancing')),
    variables jsonb NOT NULL DEFAULT '[]',
    connections jsonb NOT NULL DEFAULT '[]',
    leverage_points jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now()
);

-- Systems archetypes
CREATE TABLE IF NOT EXISTS systems_archetypes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES strategic_plans(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    archetype_type text NOT NULL CHECK (archetype_type IN (
        'limits_to_growth', 'shifting_the_burden', 'tragedy_of_commons',
        'success_to_the_successful', 'fixes_that_fail', 'erosion_of_goals',
        'escalation', 'growth_and_underinvestment'
    )),
    symptoms text,
    structural_causes text,
    interventions text,
    created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE balanced_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE paps ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_collaboration ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE causal_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems_archetypes ENABLE ROW LEVEL SECURITY;

-- Users Policies
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_select_admin" ON users;
CREATE POLICY "users_select_admin" ON users FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')));
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')));
DROP POLICY IF EXISTS "users_insert_self" ON users;
CREATE POLICY "users_insert_self" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Organizations Policies
DROP POLICY IF EXISTS "org_select_member" ON organizations;
CREATE POLICY "org_select_member" ON organizations FOR SELECT TO authenticated USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organizations.id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "org_insert_creator" ON organizations;
CREATE POLICY "org_insert_creator" ON organizations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "org_update_creator" ON organizations;
CREATE POLICY "org_update_creator" ON organizations FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Organization Members Policies
DROP POLICY IF EXISTS "org_members_select_member" ON organization_members;
CREATE POLICY "org_members_select_member" ON organization_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));
DROP POLICY IF EXISTS "org_members_insert_admin" ON organization_members;
CREATE POLICY "org_members_insert_admin" ON organization_members FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role = 'admin'));
DROP POLICY IF EXISTS "org_members_update_admin" ON organization_members;
CREATE POLICY "org_members_update_admin" ON organization_members FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role = 'admin'));
DROP POLICY IF EXISTS "org_members_delete_admin" ON organization_members;
CREATE POLICY "org_members_delete_admin" ON organization_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role = 'admin'));

-- Strategic Plans Policies
DROP POLICY IF EXISTS "plans_select_owner_or_shared" ON strategic_plans;
CREATE POLICY "plans_select_owner_or_shared" ON strategic_plans FOR SELECT TO authenticated USING (user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()) OR id IN (SELECT plan_id FROM plan_shares WHERE (shared_with_user_id = auth.uid() OR shared_with_org_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())) AND accepted = true));
DROP POLICY IF EXISTS "plans_insert_owner" ON strategic_plans;
CREATE POLICY "plans_insert_owner" ON strategic_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "plans_update_owner_or_editor" ON strategic_plans;
CREATE POLICY "plans_update_owner_or_editor" ON strategic_plans FOR UPDATE TO authenticated USING (user_id = auth.uid() OR id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')) OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')));
DROP POLICY IF EXISTS "plans_delete_owner" ON strategic_plans;
CREATE POLICY "plans_delete_owner" ON strategic_plans FOR DELETE TO authenticated USING (user_id = auth.uid());

-- SWOT Items Policies
DROP POLICY IF EXISTS "swot_select_plan_access" ON swot_items;
CREATE POLICY "swot_select_plan_access" ON swot_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = swot_items.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "swot_insert_plan_access" ON swot_items;
CREATE POLICY "swot_insert_plan_access" ON swot_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = swot_items.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "swot_update_plan_access" ON swot_items;
CREATE POLICY "swot_update_plan_access" ON swot_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = swot_items.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "swot_delete_plan_access" ON swot_items;
CREATE POLICY "swot_delete_plan_access" ON swot_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = swot_items.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Strategy Matrix Policies
DROP POLICY IF EXISTS "strategy_select_plan_access" ON strategy_matrix;
CREATE POLICY "strategy_select_plan_access" ON strategy_matrix FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = strategy_matrix.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "strategy_insert_plan_access" ON strategy_matrix;
CREATE POLICY "strategy_insert_plan_access" ON strategy_matrix FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = strategy_matrix.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "strategy_update_plan_access" ON strategy_matrix;
CREATE POLICY "strategy_update_plan_access" ON strategy_matrix FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = strategy_matrix.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "strategy_delete_plan_access" ON strategy_matrix;
CREATE POLICY "strategy_delete_plan_access" ON strategy_matrix FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = strategy_matrix.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Balanced Scorecards Policies
DROP POLICY IF EXISTS "bsc_select_plan_access" ON balanced_scorecards;
CREATE POLICY "bsc_select_plan_access" ON balanced_scorecards FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = balanced_scorecards.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "bsc_insert_plan_access" ON balanced_scorecards;
CREATE POLICY "bsc_insert_plan_access" ON balanced_scorecards FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = balanced_scorecards.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "bsc_update_plan_access" ON balanced_scorecards;
CREATE POLICY "bsc_update_plan_access" ON balanced_scorecards FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = balanced_scorecards.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "bsc_delete_plan_access" ON balanced_scorecards;
CREATE POLICY "bsc_delete_plan_access" ON balanced_scorecards FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = balanced_scorecards.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Scorecard Objectives Policies
DROP POLICY IF EXISTS "obj_select_plan_access" ON scorecard_objectives;
CREATE POLICY "obj_select_plan_access" ON scorecard_objectives FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_objectives.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "obj_insert_plan_access" ON scorecard_objectives;
CREATE POLICY "obj_insert_plan_access" ON scorecard_objectives FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_objectives.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "obj_update_plan_access" ON scorecard_objectives;
CREATE POLICY "obj_update_plan_access" ON scorecard_objectives FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_objectives.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "obj_delete_plan_access" ON scorecard_objectives;
CREATE POLICY "obj_delete_plan_access" ON scorecard_objectives FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_objectives.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Scorecard KPIs Policies
DROP POLICY IF EXISTS "kpi_select_plan_access" ON scorecard_kpis;
CREATE POLICY "kpi_select_plan_access" ON scorecard_kpis FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_kpis.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "kpi_insert_plan_access" ON scorecard_kpis;
CREATE POLICY "kpi_insert_plan_access" ON scorecard_kpis FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_kpis.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "kpi_update_plan_access" ON scorecard_kpis;
CREATE POLICY "kpi_update_plan_access" ON scorecard_kpis FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_kpis.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "kpi_delete_plan_access" ON scorecard_kpis;
CREATE POLICY "kpi_delete_plan_access" ON scorecard_kpis FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = scorecard_kpis.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- PAPs Policies
DROP POLICY IF EXISTS "paps_select_plan_access" ON paps;
CREATE POLICY "paps_select_plan_access" ON paps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = paps.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "paps_insert_plan_access" ON paps;
CREATE POLICY "paps_insert_plan_access" ON paps FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = paps.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "paps_update_plan_access" ON paps;
CREATE POLICY "paps_update_plan_access" ON paps FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = paps.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "paps_delete_plan_access" ON paps;
CREATE POLICY "paps_delete_plan_access" ON paps FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = paps.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Activity Logs Policies
DROP POLICY IF EXISTS "activity_select_plan_access" ON activity_logs;
CREATE POLICY "activity_select_plan_access" ON activity_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = activity_logs.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "activity_insert_plan_access" ON activity_logs;
CREATE POLICY "activity_insert_plan_access" ON activity_logs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = activity_logs.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));

-- Comments Policies
DROP POLICY IF EXISTS "comments_select_plan_access" ON comments;
CREATE POLICY "comments_select_plan_access" ON comments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = comments.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "comments_insert_plan_access" ON comments;
CREATE POLICY "comments_insert_plan_access" ON comments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = comments.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "comments_delete_own" ON comments;
CREATE POLICY "comments_delete_own" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Plan Collaboration Policies
DROP POLICY IF EXISTS "collab_select_plan_access" ON plan_collaboration;
CREATE POLICY "collab_select_plan_access" ON plan_collaboration FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_collaboration.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "collab_insert_plan_access" ON plan_collaboration;
CREATE POLICY "collab_insert_plan_access" ON plan_collaboration FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_collaboration.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "collab_update_own" ON plan_collaboration;
CREATE POLICY "collab_update_own" ON plan_collaboration FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "collab_delete_own" ON plan_collaboration;
CREATE POLICY "collab_delete_own" ON plan_collaboration FOR DELETE TO authenticated USING (user_id = auth.uid());

-- User Notifications Policies
DROP POLICY IF EXISTS "notifications_select_own" ON user_notifications;
CREATE POLICY "notifications_select_own" ON user_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON user_notifications;
CREATE POLICY "notifications_update_own" ON user_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_delete_own" ON user_notifications;
CREATE POLICY "notifications_delete_own" ON user_notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Plan Snapshots Policies
DROP POLICY IF EXISTS "snapshots_select_plan_access" ON plan_snapshots;
CREATE POLICY "snapshots_select_plan_access" ON plan_snapshots FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_snapshots.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "snapshots_insert_plan_access" ON plan_snapshots;
CREATE POLICY "snapshots_insert_plan_access" ON plan_snapshots FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_snapshots.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));

-- Plan Templates Policies
DROP POLICY IF EXISTS "templates_select_public" ON plan_templates;
CREATE POLICY "templates_select_public" ON plan_templates FOR SELECT TO authenticated USING (is_public = true OR created_by = auth.uid() OR organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "templates_insert_owner" ON plan_templates;
CREATE POLICY "templates_insert_owner" ON plan_templates FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "templates_update_owner" ON plan_templates;
CREATE POLICY "templates_update_owner" ON plan_templates FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "templates_delete_owner" ON plan_templates;
CREATE POLICY "templates_delete_owner" ON plan_templates FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Plan Shares Policies
DROP POLICY IF EXISTS "shares_select_plan_owner" ON plan_shares;
CREATE POLICY "shares_select_plan_owner" ON plan_shares FOR SELECT TO authenticated USING (shared_by = auth.uid() OR shared_with_user_id = auth.uid() OR EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_shares.plan_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "shares_insert_plan_owner" ON plan_shares;
CREATE POLICY "shares_insert_plan_owner" ON plan_shares FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_shares.plan_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "shares_update_plan_owner" ON plan_shares;
CREATE POLICY "shares_update_plan_owner" ON plan_shares FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_shares.plan_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "shares_delete_plan_owner" ON plan_shares;
CREATE POLICY "shares_delete_plan_owner" ON plan_shares FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = plan_shares.plan_id AND sp.user_id = auth.uid()));

-- Causal Loops Policies
DROP POLICY IF EXISTS "cld_select_plan_access" ON causal_loops;
CREATE POLICY "cld_select_plan_access" ON causal_loops FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = causal_loops.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "cld_insert_plan_access" ON causal_loops;
CREATE POLICY "cld_insert_plan_access" ON causal_loops FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = causal_loops.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "cld_update_plan_access" ON causal_loops;
CREATE POLICY "cld_update_plan_access" ON causal_loops FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = causal_loops.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "cld_delete_plan_access" ON causal_loops;
CREATE POLICY "cld_delete_plan_access" ON causal_loops FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = causal_loops.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- Systems Archetypes Policies
DROP POLICY IF EXISTS "archetype_select_plan_access" ON systems_archetypes;
CREATE POLICY "archetype_select_plan_access" ON systems_archetypes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = systems_archetypes.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND accepted = true))));
DROP POLICY IF EXISTS "archetype_insert_plan_access" ON systems_archetypes;
CREATE POLICY "archetype_insert_plan_access" ON systems_archetypes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = systems_archetypes.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "archetype_update_plan_access" ON systems_archetypes;
CREATE POLICY "archetype_update_plan_access" ON systems_archetypes FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = systems_archetypes.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level IN ('editor', 'admin')))));
DROP POLICY IF EXISTS "archetype_delete_plan_access" ON systems_archetypes;
CREATE POLICY "archetype_delete_plan_access" ON systems_archetypes FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM strategic_plans sp WHERE sp.id = systems_archetypes.plan_id AND (sp.user_id = auth.uid() OR sp.id IN (SELECT plan_id FROM plan_shares WHERE shared_with_user_id = auth.uid() AND permission_level = 'admin'))));

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization);
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_user ON strategic_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_org ON strategic_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_status ON strategic_plans(status);
CREATE INDEX IF NOT EXISTS idx_swot_plan ON swot_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_swot_category ON swot_items(category);
CREATE INDEX IF NOT EXISTS idx_strategy_plan ON strategy_matrix(plan_id);
CREATE INDEX IF NOT EXISTS idx_strategy_quadrant ON strategy_matrix(quadrant);
CREATE INDEX IF NOT EXISTS idx_bsc_plan ON balanced_scorecards(plan_id);
CREATE INDEX IF NOT EXISTS idx_obj_scorecard ON scorecard_objectives(scorecard_id);
CREATE INDEX IF NOT EXISTS idx_kpi_objective ON scorecard_kpis(objective_id);
CREATE INDEX IF NOT EXISTS idx_paps_plan ON paps(plan_id);
CREATE INDEX IF NOT EXISTS idx_paps_type ON paps(type);
CREATE INDEX IF NOT EXISTS idx_paps_status ON paps(status);
CREATE INDEX IF NOT EXISTS idx_activity_plan ON activity_logs(plan_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_plan ON comments(plan_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_id);
CREATE INDEX IF NOT EXISTS idx_collab_plan ON plan_collaboration(plan_id);
CREATE INDEX IF NOT EXISTS idx_collab_user ON plan_collaboration(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_shares_plan ON plan_shares(plan_id);
CREATE INDEX IF NOT EXISTS idx_shares_user ON plan_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_cld_plan ON causal_loops(plan_id);
CREATE INDEX IF NOT EXISTS idx_archetype_plan ON systems_archetypes(plan_id);

-- ============================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
SET search_path = '' 
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update triggers
DROP TRIGGER IF EXISTS tr_users_updated_at ON users;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_orgs_updated_at ON organizations;
CREATE TRIGGER tr_orgs_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_plans_updated_at ON strategic_plans;
CREATE TRIGGER tr_plans_updated_at BEFORE UPDATE ON strategic_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_swot_updated_at ON swot_items;
CREATE TRIGGER tr_swot_updated_at BEFORE UPDATE ON swot_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_strategy_updated_at ON strategy_matrix;
CREATE TRIGGER tr_strategy_updated_at BEFORE UPDATE ON strategy_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_obj_updated_at ON scorecard_objectives;
CREATE TRIGGER tr_obj_updated_at BEFORE UPDATE ON scorecard_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_kpi_updated_at ON scorecard_kpis;
CREATE TRIGGER tr_kpi_updated_at BEFORE UPDATE ON scorecard_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_paps_updated_at ON paps;
CREATE TRIGGER tr_paps_updated_at BEFORE UPDATE ON paps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS tr_comments_updated_at ON comments;
CREATE TRIGGER tr_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SWOT resilience index calculation
CREATE OR REPLACE FUNCTION calculate_swot_resilience()
RETURNS TRIGGER 
SET search_path = '' 
AS $$
BEGIN
    IF NEW.category IN ('strength', 'opportunity') THEN
        NEW.resilience_index = ROUND(SQRT(NEW.impact * NEW.likelihood)::numeric, 2);
    ELSE
        NEW.resilience_index = ROUND((NEW.impact * NEW.likelihood)::numeric, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_swot_resilience ON swot_items;
CREATE TRIGGER tr_swot_resilience BEFORE INSERT OR UPDATE ON swot_items FOR EACH ROW EXECUTE FUNCTION calculate_swot_resilience();

-- Activity log trigger (SECURITY INVOKER applied)
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER 
SECURITY INVOKER 
SET search_path = '' 
AS $$
DECLARE
    action_type_val text;
    entity_type_val text;
    plan_id_val uuid;
    details_val jsonb;
BEGIN
    IF TG_TABLE_NAME = 'swot_items' THEN
        action_type_val := CASE WHEN TG_OP = 'INSERT' THEN 'swot_added' WHEN TG_OP = 'UPDATE' THEN 'swot_updated' ELSE 'swot_deleted' END;
        entity_type_val := 'swot';
        plan_id_val := NEW.plan_id;
        details_val := jsonb_build_object('id', NEW.id, 'title', NEW.title, 'category', NEW.category);
    ELSIF TG_TABLE_NAME = 'strategy_matrix' THEN
        action_type_val := CASE WHEN TG_OP = 'INSERT' THEN 'strategy_added' WHEN TG_OP = 'UPDATE' THEN 'strategy_updated' ELSE 'strategy_deleted' END;
        entity_type_val := 'strategy';
        plan_id_val := NEW.plan_id;
        details_val := jsonb_build_object('id', NEW.id, 'strategy', NEW.strategy, 'quadrant', NEW.quadrant);
    ELSIF TG_TABLE_NAME = 'scorecard_objectives' THEN
        action_type_val := CASE WHEN TG_OP = 'INSERT' THEN 'objective_added' WHEN TG_OP = 'UPDATE' THEN 'objective_updated' ELSE 'objective_deleted' END;
        entity_type_val := 'objective';
        plan_id_val := NEW.plan_id;
        details_val := jsonb_build_object('id', NEW.id, 'title', NEW.title);
    ELSIF TG_TABLE_NAME = 'scorecard_kpis' THEN
        action_type_val := CASE WHEN TG_OP = 'INSERT' THEN 'kpi_added' WHEN TG_OP = 'UPDATE' THEN 'kpi_updated' ELSE 'kpi_deleted' END;
        entity_type_val := 'kpi';
        plan_id_val := NEW.plan_id;
        details_val := jsonb_build_object('id', NEW.id, 'name', NEW.name, 'value', NEW.current_value);
    ELSIF TG_TABLE_NAME = 'paps' THEN
        action_type_val := CASE WHEN TG_OP = 'INSERT' THEN 'pap_added' WHEN TG_OP = 'UPDATE' THEN 'pap_updated' ELSE 'pap_deleted' END;
        entity_type_val := 'pap';
        plan_id_val := NEW.plan_id;
        details_val := jsonb_build_object('id', NEW.id, 'title', NEW.title, 'type', NEW.type);
    ELSE
        RETURN NULL;
    END IF;

    INSERT INTO activity_logs (plan_id, user_id, action_type, entity_type, entity_id, details, created_at)
    VALUES (plan_id_val, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), action_type_val, entity_type_val, NEW.id, details_val, now());
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_swot_activity ON swot_items;
CREATE TRIGGER tr_swot_activity AFTER INSERT OR UPDATE OR DELETE ON swot_items FOR EACH ROW EXECUTE FUNCTION log_activity();
DROP TRIGGER IF EXISTS tr_strategy_activity ON strategy_matrix;
CREATE TRIGGER tr_strategy_activity AFTER INSERT OR UPDATE OR DELETE ON strategy_matrix FOR EACH ROW EXECUTE FUNCTION log_activity();
DROP TRIGGER IF EXISTS tr_obj_activity ON scorecard_objectives;
CREATE TRIGGER tr_obj_activity AFTER INSERT OR UPDATE OR DELETE ON scorecard_objectives FOR EACH ROW EXECUTE FUNCTION log_activity();
DROP TRIGGER IF EXISTS tr_kpi_activity ON scorecard_kpis;
CREATE TRIGGER tr_kpi_activity AFTER INSERT OR UPDATE OR DELETE ON scorecard_kpis FOR EACH ROW EXECUTE FUNCTION log_activity();
DROP TRIGGER IF EXISTS tr_paps_activity ON paps;
CREATE TRIGGER tr_paps_activity AFTER INSERT OR UPDATE OR DELETE ON paps FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Plan progress update function
CREATE OR REPLACE FUNCTION update_plan_progress()
RETURNS TRIGGER 
SET search_path = '' 
AS $$
DECLARE
    total_kpis int;
    on_track_kpis int;
    avg_progress numeric;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('on_track', 'achieved'))
    INTO total_kpis, on_track_kpis
    FROM scorecard_kpis WHERE plan_id = NEW.plan_id;
    
    SELECT COALESCE(AVG(progress_pct), 0)
    INTO avg_progress
    FROM paps WHERE plan_id = NEW.plan_id;
    
    UPDATE strategic_plans SET
        progress_pct = LEAST(GREATEST(ROUND((COALESCE(on_track_kpis::numeric / NULLIF(total_kpis, 0), 0) * 50 + COALESCE(avg_progress, 0) * 0.5))::int, 0), 100),
        updated_at = now()
    WHERE id = NEW.plan_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_plan_progress_kpi ON scorecard_kpis;
CREATE TRIGGER tr_plan_progress_kpi AFTER INSERT OR UPDATE ON scorecard_kpis FOR EACH ROW EXECUTE FUNCTION update_plan_progress();
DROP TRIGGER IF EXISTS tr_plan_progress_paps ON paps;
CREATE TRIGGER tr_plan_progress_paps AFTER INSERT OR UPDATE ON paps FOR EACH ROW EXECUTE FUNCTION update_plan_progress();

-- Handle new user signups (SECURITY INVOKER applied)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY INVOKER 
SET search_path = '' 
AS $$
BEGIN
    INSERT INTO users (id, email, full_name, created_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auth_users_insert ON auth.users;
CREATE TRIGGER tr_auth_users_insert AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 5. SECURITY HARDENING (Privilege Revocations)
-- ============================================================
-- Revoke execute permissions on internal/trigger functions from PUBLIC, anon, and authenticated 
-- to prevent unauthorized direct RPC calls.

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_swot_resilience() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_activity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_plan_progress() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
