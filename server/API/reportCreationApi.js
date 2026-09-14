import express from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

router.post('/save_report', ...adminOnly, async (req, res) => {
    const { campaign_id, email, clicked = false, submitted = false } = req.body;

    try {
        await db.query(
            `INSERT INTO reports (campaign_id, email, clicked, submitted)
             VALUES ($1, $2, $3, $4)`,
            [campaign_id, email, Boolean(clicked), Boolean(submitted)]
        );
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
                SELECT campaign_name,
                       COUNT(*) FILTER (WHERE submitted = 1) AS submitted_count
                FROM tracking
                GROUP BY campaign_name
            ) stats ON stats.campaign_name = c.name
            JOIN admins a ON a.company_name = c.company_name
            WHERE a.company_name = (
                SELECT company_name
                FROM admins
                WHERE admin_id = $1
            )
            ORDER BY c.created_at DESC
        `, [req.auth.userId]);
        res.json({ data: result.rows });
    } catch (err) {
        console.error('Fetch reports error:', err);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
});

router.delete('/clear_reports', ...adminOnly, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM campaigns
             WHERE admin_id IN (
                 SELECT admin_id
                 FROM admins
                 WHERE company_name = (
                     SELECT company_name
                     FROM admins
                     WHERE admin_id = $1
                 )
             )`,
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
router.post('/capture', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username required' });
    }

    try {
        const userResult = await db.query(
            'SELECT employee_id, name, email, department FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [username]
        );

        if (!userResult.rows.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = userResult.rows[0];

        const campaignResult = await db.query(
            `SELECT * FROM campaigns
             WHERE target_group = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [user.department]
        );

        if (!campaignResult.rows.length) {
            return res.status(404).json({ success: false, message: 'No active campaign found' });
        }

        const campaign = campaignResult.rows[0];

        await db.query(
            'UPDATE campaigns SET clicked = COALESCE(clicked, 0) + 1 WHERE id = $1',
            [campaign.id]
        );

        await db.query(
            `INSERT INTO tracking
             (username, email, clicked, submitted, campaign_name)
             VALUES ($1, $2, TRUE, TRUE, $3)`,
            [user.name, user.email, campaign.name]
        );

        return res.json({ success: true, message: 'Event recorded' });
    } catch (err) {
        console.error('CAPTURE ERROR:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

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
