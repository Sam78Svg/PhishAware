import express from 'express';
import db from '../db.js';
import { sendEmail, sendSMS } from '../utils/messaging.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [requireAuth, requireRole('admin')];
const employeeOnly = [requireAuth, requireRole('employee')];

router.post('/send_campaign', ...adminOnly, async (req, res) => {
    const { mode, recipients, link } = req.body;

    if (!mode || !Array.isArray(recipients) || recipients.length === 0 || !link) {
        return res.status(400).json({ message: 'Mode, recipients, and link are required.' });
    }

    try {
        if (mode === 'sms') await sendSMS(recipients, link);
        else if (mode === 'email') await sendEmail(recipients, link);
        else return res.status(400).json({ message: 'Unsupported send mode.' });

        res.json({ message: 'Campaign link sent successfully.' });
    } catch (err) {
        console.error('Send campaign error:', err);
        res.status(500).json({ message: 'Failed to send campaign link.' });
    }
});

router.get('/recipients', ...adminOnly, async (req, res) => {
    let { group, company, page, limit = 20 } = req.query;
    page = Number.parseInt(page) || 1;
    limit = Number.parseInt(limit);

    if (!group) return res.status(400).json({ message: 'Group is required' });
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ message: 'Invalid pagination values' });
    }

    try {
        const count = await db.query(
            `SELECT COUNT(*)::int AS total FROM employees
             WHERE department = $1 AND company_name = $2`,
            [group, company || '']
        );

        const data = await db.query(
            `SELECT employee_id, name, email, department, company_name
             FROM employees
             WHERE department = $1 AND company_name = $2
             ORDER BY employee_id
             LIMIT $3 OFFSET $4`,
            [group, company || '', limit, (page - 1) * limit]
        );

        res.json({ data: data.rows, total: count.rows[0].total });
    } catch (err) {
        console.error('DB ERROR:', err);
        res.status(500).json({ message: 'Failed to fetch recipients' });
    }
});

router.post('/capturedUser', ...employeeOnly, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT COUNT(*)::int AS count
             FROM tracking t
             WHERE LOWER(t.email) = LOWER((
                 SELECT email FROM employees WHERE employee_id = $1
             ))
                OR LOWER(t.username) = LOWER((
                 SELECT name FROM employees WHERE employee_id = $1
             ))`,
            [req.auth.userId]
        );
        res.json({ userCount: result.rows[0].count });
    } catch (err) {
        console.error('capturedUser error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.post('/fetchEmail', ...employeeOnly, async (req, res) => {
    try {
        const userResult = await db.query(
            `SELECT employee_id, name, email, department, company_name
             FROM employees WHERE employee_id = $1 LIMIT 1`,
            [req.auth.userId]
        );

        if (!userResult.rows.length) return res.json({ mails: [] });
        const user = userResult.rows[0];

        const campaigns = await db.query(
            `SELECT * FROM campaigns
             WHERE target_group = $1
             ORDER BY created_at DESC`,
            [user.department]
        );

        const mails = [];
        const senderEmail = process.env.SENDER_EMAIL || 'admin@COMPANY.COM';

        for (const campaign of campaigns.rows) {
            const templateData = await db.query(
                'SELECT content FROM templates WHERE name = $1 LIMIT 1',
                [campaign.template_type]
            );
            if (!templateData.rows.length) continue;

            const linkData = await db.query(
                `SELECT * FROM links
                 WHERE target_group = $1 AND template_type = $2
                 ORDER BY link_id DESC LIMIT 1`,
                [user.department, campaign.template_type]
            );

            const template = templateData.rows[0].content || '';
            const linkDesc = linkData.rows[0]?.link_desc || '#';
            const convertedLink = `<a href="${linkDesc}">${linkDesc}</a>`;

            const finalMessage = template
                .replace(/{{sender}}/g, senderEmail)
                .replace(/{{name}}/g, user.name)
                .replace(/{{email}}/g, user.email)
                .replace(/{{targetGroup}}/g, user.department || '')
                .replace(/{{link}}/g, convertedLink);

            mails.push({
                subject: campaign.name,
                message: finalMessage,
                received_at: campaign.created_at,
                senderMail: senderEmail,
            });
        }

        res.json({ mails });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching emails' });
    }
});

export default router;
