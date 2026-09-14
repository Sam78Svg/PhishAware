-- FishApp: PostgreSQL/JWT migration additions.
-- Run after your base tables (admins, users, templates, campaigns, links, tracking, reports) exist.

ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS admin_id INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'campaigns_admin_id_fkey'
    ) THEN
        ALTER TABLE campaigns
            ADD CONSTRAINT campaigns_admin_id_fkey
            FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Recommended relational table for explicit campaign recipients.
CREATE TABLE IF NOT EXISTS campaign_employees (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    employee_id INTEGER NOT NULL REFERENCES users(employee_id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    UNIQUE (campaign_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_employees_campaign
    ON campaign_employees(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_employees_employee
    ON campaign_employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_tracking_username
    ON tracking(username);
CREATE INDEX IF NOT EXISTS idx_tracking_campaign_name
    ON tracking(campaign_name);
