import express from 'express';
import db from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];

router.post('/save_campaign', ...adminOnly, async (req, res) => {
    const { campaign_name, email_template, target_group, company_name } = req.body;

    if (!campaign_name || !email_template || !target_group || !company_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const countResult = await db.query(
            'SELECT COUNT(*)::int AS count FROM employees WHERE department = $1 AND company_name = $2',
            [target_group, company_name]
        );

        const result = await db.query(
            `INSERT INTO campaigns
             (name, template_type, target_group, email_sent, created_at, company_name)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
             RETURNING id, name, created_at`,
            [campaign_name, email_template, target_group, countResult.rows[0].count, company_name]
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
            'INSERT INTO templates (name, content) VALUES ($1, $2) RETURNING *',
            [name, content]
        );
        res.status(201).json({ success: true, template: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.get('/templates', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM templates ORDER BY created_at DESC');
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
            'UPDATE templates SET name = $1, content = $2 WHERE id = $3',
            [name, content, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'DB error' });
    }
});

router.delete('/templates/:id', ...adminOnly, async (req, res) => {
    try {
        await db.query('DELETE FROM templates WHERE id = $1', [req.params.id]);
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
             WHERE department IS NOT NULL AND department <> ''
             ORDER BY department`
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
            `INSERT INTO links (link_desc, link_status, target_group, template_type)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [link_desc, link_status, target_group, template_type]
        );
        res.status(201).json({ message: 'Link saved successfully', link: result.rows[0] });
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.get('/links', ...adminOnly, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM links ORDER BY link_id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

export default router;
