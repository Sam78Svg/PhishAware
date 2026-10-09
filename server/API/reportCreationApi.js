import express from 'express';
import PDFDocument from 'pdfkit';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

router.post('/save_report', ...adminOnly, async (req, res) => {
    const { campaign_id, email, clicked = false, submitted = false } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO reports (campaign_id, email, clicked, submitted)
             SELECT c.id, $2, $3, $4 FROM campaigns c
             WHERE c.id = $1
               AND c.company_name = (SELECT company_name FROM admins WHERE admin_id = $5)
             RETURNING campaign_id`,
            [campaign_id, email, Boolean(clicked), Boolean(submitted), req.auth.userId]
        );
        if (!result.rows.length) return res.status(404).json({ message: 'Campaign not found for this company' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.get('/reports', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                c.id,
                c.name,
                c.template_type,
                c.target_group,
                c.created_at,
                c.email_sent,
                c.clicked,
                COALESCE(stats.submitted_count, 0)::int AS reported
            FROM campaigns c
            LEFT JOIN (
                SELECT campaign_id, campaign_name, company_name,
                       COUNT(*) FILTER (WHERE submitted::text IN ('1', 'true', 't')) AS submitted_count
                FROM tracking
                GROUP BY campaign_id, campaign_name, company_name
            ) stats ON (stats.campaign_id = c.id OR
                        (stats.campaign_id IS NULL AND stats.campaign_name = c.name))
                    AND stats.company_name = c.company_name
            WHERE c.company_name = (
                SELECT company_name FROM admins WHERE admin_id = $1
            )
            ORDER BY c.created_at DESC
        `, [req.auth.userId]);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('Fetch reports error:', err);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

router.get('/reports/:campaignId/pdf', ...adminOnly, async (req, res) => {
    const { campaignId } = req.params;

    try {
        const campaignResult = await db.query(
            `SELECT c.id, c.name, c.template_type, c.target_group, c.company_name, c.created_at,
                    c.email_sent, c.clicked,
                    COALESCE(stats.submitted_count, 0)::int AS reported
             FROM campaigns c
             LEFT JOIN (
                 SELECT campaign_id, campaign_name, company_name,
                        COUNT(*) FILTER (WHERE submitted::text IN ('1', 'true', 't')) AS submitted_count
                 FROM tracking
                 GROUP BY campaign_id, campaign_name, company_name
             ) stats ON (stats.campaign_id = c.id OR
                         (stats.campaign_id IS NULL AND stats.campaign_name = c.name))
                     AND stats.company_name = c.company_name
             WHERE c.id = $1
               AND c.company_name = (
                   SELECT company_name FROM admins WHERE admin_id = $2
               )
             LIMIT 1`,
            [campaignId, req.auth.userId]
        );

        if (!campaignResult.rows.length) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const campaign = campaignResult.rows[0];
        const recipientsResult = await db.query(
            `SELECT e.name, e.email, e.department,
                    COALESCE(BOOL_OR(t.clicked::text IN ('1', 'true', 't')), FALSE) AS clicked,
                    COALESCE(BOOL_OR(t.submitted::text IN ('1', 'true', 't')), FALSE) AS submitted
             FROM employees e
             LEFT JOIN tracking t
               ON LOWER(t.email) = LOWER(e.email)
              AND t.campaign_name = $1
             WHERE e.department = $2
               AND e.company_name = $3
             GROUP BY e.employee_id, e.name, e.email, e.department
             ORDER BY e.name`,
            [campaign.name, campaign.target_group, campaign.company_name]
        );

        const safeName = campaign.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'campaign-report';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);

        const document = new PDFDocument({ margin: 40 });
        document.pipe(res);
        document.fontSize(20).text('Campaign Report', { align: 'center' });
        document.moveDown();
        document.fontSize(11)
            .text(`Campaign: ${campaign.name}`)
            .text(`Template: ${campaign.template_type || 'N/A'}`)
            .text(`Target group: ${campaign.target_group || 'N/A'}`)
            .text(`Created: ${new Date(campaign.created_at).toLocaleString()}`)
            .text(`Emails sent: ${campaign.email_sent ?? 0}`)
            .text(`Clicked: ${campaign.clicked ?? 0}`)
            .text(`Submitted forms: ${campaign.reported ?? 0}`)
            .text(`Recipients: ${recipientsResult.rows.length}`);
        document.moveDown();
        document.fontSize(13).text('Recipients', { underline: true });
        document.moveDown(0.5);

        if (!recipientsResult.rows.length) {
            document.fontSize(11).text('No recipients found for this campaign.');
        } else {
            recipientsResult.rows.forEach((recipient, index) => {
                document.fontSize(10)
                    .text(`${index + 1}. ${recipient.name || 'Unknown'} | ${recipient.email || 'No email'}`)
                    .text(`   Department: ${recipient.department || 'N/A'} | Clicked: ${recipient.clicked ? 'Yes' : 'No'} | Submitted: ${recipient.submitted ? 'Yes' : 'No'}`)
                    .moveDown(0.35);
            });
        }

        document.end();
    } catch (err) {
        console.error('Generate report PDF error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to generate report PDF' });
        }
    }
});

router.delete('/clear_reports', ...adminOnly, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM campaigns
             WHERE company_name = (SELECT company_name FROM admins WHERE admin_id = $1)`,
            [req.auth.userId]
        );
        res.json({ message: 'All reports cleared successfully' });
    } catch (err) {
        console.error('Clear reports error:', err);
        res.status(500).json({ message: 'Failed to clear reports' });
    }
});

// Public by design: this endpoint represents the simulated phishing landing page.
// It records the event but NEVER stores the submitted password.
router.post('/capture/:campaignId', async (req, res) => {
    const { username } = req.body;
    const campaignId = Number.parseInt(req.params.campaignId, 10);

    if (!username || !Number.isInteger(campaignId) || campaignId < 1) {
        return res.status(400).json({ success: false, message: 'A valid campaign and username are required' });
    }

    try {
        const userResult = await db.query(
            `SELECT employee_id, name, email, department, company_name
             FROM employees
             WHERE LOWER(name) = LOWER($1)
               AND company_name = (SELECT company_name FROM campaigns WHERE id = $2)
             LIMIT 1`,
            [username, campaignId]
        );

        if (!userResult.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        const campaignResult = await db.query(
            `SELECT * FROM campaigns
             WHERE id = $1
               AND target_group = $2
               AND company_name = $3
             LIMIT 1`,
            [campaignId, user.department, user.company_name]
        );

        if (!campaignResult.rows.length) {
            return res.status(404).json({ success: false, message: 'No active campaign found' });
        }

        const campaign = campaignResult.rows[0];

        const columnTypes = await db.query(
            `SELECT table_name, column_name, data_type
             FROM information_schema.columns
             WHERE table_schema = 'public'
               AND ((table_name = 'campaigns' AND column_name = 'clicked')
                 OR (table_name = 'tracking' AND column_name IN ('clicked', 'submitted')))`
        );
        const types = Object.fromEntries(
            columnTypes.rows.map(column => [`${column.table_name}.${column.column_name}`, column.data_type])
        );
        const campaignClickedType = types['campaigns.clicked'];

        if (campaignClickedType === 'boolean') {
            await db.query('UPDATE campaigns SET clicked = TRUE WHERE id = $1', [campaign.id]);
        } else {
            await db.query(
                'UPDATE campaigns SET clicked = COALESCE(clicked, 0) + 1 WHERE id = $1',
                [campaign.id]
            );
        }

        const trackingClickedValue = types['tracking.clicked'] === 'boolean';
        const trackingSubmittedValue = types['tracking.submitted'] === 'boolean';

        await db.query(
            `INSERT INTO tracking
             (username, email, clicked, submitted, campaign_name, company_name, campaign_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                user.name,
                user.email,
                trackingClickedValue ? true : 1,
                trackingSubmittedValue ? true : 1,
                campaign.name,
                campaign.company_name,
                campaign.id,
            ]
        );

        return res.json({ success: true, message: 'Event recorded' });
    } catch (err) {
        console.error('CAPTURE ERROR:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Keep old feedback links from selecting a campaign by department alone.
router.post('/capture', (req, res) => res.status(400).json({
    success: false,
    message: 'This feedback link is incomplete. Please use the link from your campaign.',
}));

// Compatibility endpoint for existing frontend code. Authenticated only.
router.post('/userExist', requireAuth, async (req, res) => {
    try {
        if (req.auth.type === 'employee') {
            const result = await db.query(
                `SELECT employee_id, name, department, designation, email, joining_date, company_name
                 FROM employees WHERE employee_id = $1 LIMIT 1`,
                [req.auth.userId]
            );
            if (result.rows.length) return res.json({ success: true, user: result.rows[0] });
        }

        if (req.auth.type === 'admin') {
            const result = await db.query(
                `SELECT admin_id, username, role, company_name, email
                 FROM admins WHERE admin_id = $1 LIMIT 1`,
                [req.auth.userId]
            );
            if (result.rows.length) return res.json({ success: true, user: result.rows[0] });
        }

        return res.status(404).json({ success: false, message: 'User not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'db error' });
    }
});

export default router;
