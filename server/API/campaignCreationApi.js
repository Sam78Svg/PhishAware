import express from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

router.post('/save_campaign', ...adminOnly, async (req, res) => {
    const { campaign_name, email_template, target_group, feedback_page_type = 'generic' } = req.body;
    const allowedFeedbackPages = ['generic', 'google', 'microsoft'];

    if (!campaign_name || !email_template || !target_group || !allowedFeedbackPages.includes(feedback_page_type)) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const adminResult = await db.query('SELECT company_name FROM admins WHERE admin_id = $1 LIMIT 1', [req.auth.userId]);
        const companyName = adminResult.rows[0]?.company_name;
        if (!companyName) return res.status(403).json({ message: 'Admin company is not configured' });
        const countResult = await db.query(
            'SELECT COUNT(*)::int AS count FROM employees WHERE department = $1 AND company_name = $2',
            [target_group, companyName]
        );

        const result = await db.query(
            `INSERT INTO campaigns
             (name, template_type, target_group, email_sent, created_at, company_name, feedback_page_type)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6)
             RETURNING id, name, created_at, feedback_page_type`,
            [campaign_name, email_template, target_group, countResult.rows[0].count, companyName, feedback_page_type]
        );

        res.status(201).json({ message: 'Campaign saved successfully', campaign: result.rows[0] });
    } catch (err) {
        console.error('Campaign creation error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.post('/templates', ...adminOnly, async (req, res) => {
    const { name, content } = req.body;
    if (!name || !content) return res.status(400).json({ success: false, message: 'All fields required' });

    try {
        const result = await db.query(
            `INSERT INTO templates (name, content, company_name)
             SELECT $1, $2, company_name FROM admins WHERE admin_id = $3 RETURNING *`,
            [name, content, req.auth.userId]
        );
        res.status(201).json({ success: true, template: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.get('/templates', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT t.* FROM templates t
             WHERE t.company_name = (SELECT company_name FROM admins WHERE admin_id = $1)
             ORDER BY t.created_at DESC`, [req.auth.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.put('/templates/:id', ...adminOnly, async (req, res) => {
    const { name, content } = req.body;
    const { id } = req.params;

    try {
        await db.query(
            `UPDATE templates SET name = $1, content = $2
             WHERE id = $3 AND company_name = (SELECT company_name FROM admins WHERE admin_id = $4)`,
            [name, content, id, req.auth.userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.delete('/templates/:id', ...adminOnly, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM templates WHERE id = $1
             AND company_name = (SELECT company_name FROM admins WHERE admin_id = $2)`,
            [req.params.id, req.auth.userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.get('/target-groups', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT DISTINCT department
             FROM employees
             WHERE company_name = (SELECT company_name FROM admins WHERE admin_id = $1)
               AND department IS NOT NULL AND department <> ''
             ORDER BY department`,
            [req.auth.userId]
        );
        res.json(result.rows.map(r => r.department));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
});

router.post('/saveLink', ...adminOnly, async (req, res) => {
    const { link_desc, link_status, target_group, template_type } = req.body;
    if (!link_desc || !link_status || !target_group || !template_type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO links (link_desc, link_status, target_group, template_type, company_name)
             SELECT $1, $2, $3, $4, company_name FROM admins WHERE admin_id = $5 RETURNING *`,
            [link_desc, link_status, target_group, template_type, req.auth.userId]
        );
        res.status(201).json({ message: 'Link saved successfully', link: result.rows[0] });
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.get('/links', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT l.* FROM links l
             WHERE l.company_name = (SELECT company_name FROM admins WHERE admin_id = $1)
             ORDER BY l.link_id DESC`, [req.auth.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

export default router;
