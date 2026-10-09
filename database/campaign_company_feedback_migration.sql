-- Adds the tenant and feedback-page fields used by the API.
-- Safe to run on existing installations; rows without a company stay inaccessible
-- to company-scoped admin queries until their company is assigned.

ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS feedback_page_type TEXT NOT NULL DEFAULT 'generic';

ALTER TABLE templates
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

ALTER TABLE links
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

ALTER TABLE tracking
    ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'admin_id'
    ) THEN
        EXECUTE 'UPDATE campaigns c SET company_name = a.company_name
                 FROM admins a
                 WHERE c.company_name IS NULL AND c.admin_id = a.admin_id';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.campaigns'::regclass
          AND pg_get_constraintdef(oid) ILIKE '%feedback_page_type%'
    ) THEN
        ALTER TABLE campaigns
            ADD CONSTRAINT campaign_feedback_page_type_check
            CHECK (feedback_page_type IN ('generic', 'google', 'microsoft'));
    END IF;
END $$;

UPDATE tracking t
SET campaign_id = c.id,
    company_name = COALESCE(t.company_name, c.company_name)
FROM campaigns c
WHERE t.campaign_id IS NULL
  AND t.campaign_name = c.name
  AND (
      t.company_name = c.company_name
      OR (t.company_name IS NULL AND (
          SELECT COUNT(*) FROM campaigns matching WHERE matching.name = t.campaign_name
      ) = 1)
  );

UPDATE templates t
SET company_name = source.company_name
FROM (
    SELECT template_type, MIN(company_name) AS company_name
    FROM campaigns
    WHERE company_name IS NOT NULL
    GROUP BY template_type
    HAVING COUNT(DISTINCT company_name) = 1
) source
WHERE t.company_name IS NULL
  AND t.name = source.template_type;

UPDATE links l
SET company_name = c.company_name
FROM campaigns c
WHERE l.company_name IS NULL
  AND l.link_desc ~ '/feedback/[0-9]+'
  AND substring(l.link_desc from '/feedback/([0-9]+)')::INTEGER = c.id;

UPDATE links l
SET company_name = source.company_name
FROM (
    SELECT target_group, template_type, MIN(company_name) AS company_name
    FROM campaigns
    WHERE company_name IS NOT NULL
    GROUP BY target_group, template_type
    HAVING COUNT(DISTINCT company_name) = 1
) source
WHERE l.company_name IS NULL
  AND l.target_group = source.target_group
  AND l.template_type = source.template_type;

CREATE INDEX IF NOT EXISTS idx_campaigns_company_created
    ON campaigns(company_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_campaign_company
    ON tracking(campaign_id, company_name);
CREATE INDEX IF NOT EXISTS idx_employees_company_department
    ON employees(company_name, department);
