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
        const linkedCampaignId = Number(link.match(/\/feedback\/(\d+)(?:\/|$)/)?.[1]);
        if (!Number.isInteger(linkedCampaignId) || linkedCampaignId < 1) {
            return res.status(400).json({ message: 'Link must belong to a saved campaign.' });
        }
        const campaign = await db.query(
            `SELECT id FROM campaigns
             WHERE id = $1 AND company_name = (
                 SELECT company_name FROM admins WHERE admin_id = $2
             )`,
            [linkedCampaignId, req.auth.userId]
        );
        if (!campaign.rows.length) return res.status(404).json({ message: 'Campaign not found for this company.' });

        const allowedRecipients = await db.query(
            `SELECT email FROM employees
             WHERE company_name = (SELECT company_name FROM admins WHERE admin_id = $1)
               AND email = ANY($2::text[])`,
            [req.auth.userId, recipients]
        );
        const authorizedEmails = allowedRecipients.rows.map(row => row.email);
        if (!authorizedEmails.length) return res.status(400).json({ message: 'No recipients belong to this company.' });

        if (mode === 'sms') await sendSMS(authorizedEmails, link);
        else if (mode === 'email') await sendEmail(authorizedEmails, link);
        else return res.status(400).json({ message: 'Unsupported send mode.' });

        res.json({ message: 'Campaign link sent successfully.' });
    } catch (err) {
        console.error('Send campaign error:', err);
        res.status(500).json({ message: 'Failed to send campaign link.' });
    }
});

router.get('/recipients', ...adminOnly, async (req, res) => {
    let { group, page, limit = 20 } = req.query;
    page = Number.parseInt(page) || 1;
    limit = Number.parseInt(limit);

    if (!group) return res.status(400).json({ message: 'Group is required' });
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ message: 'Invalid pagination values' });
    }

    try {
        const count = await db.query(
            `SELECT COUNT(*)::int AS total FROM employees
             WHERE department = $1
               AND company_name = (SELECT company_name FROM admins WHERE admin_id = $2)`,
            [group, req.auth.userId]
        );

        const data = await db.query(
            `SELECT employee_id, name, email, department, company_name
             FROM employees
             WHERE department = $1
               AND company_name = (SELECT company_name FROM admins WHERE admin_id = $2)
             ORDER BY employee_id
             LIMIT $3 OFFSET $4`,
            [group, req.auth.userId, limit, (page - 1) * limit]
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
             WHERE (
                 LOWER(t.email) = LOWER((SELECT email FROM employees WHERE employee_id = $1))
                 OR LOWER(t.username) = LOWER((
                 SELECT name FROM employees WHERE employee_id = $1
                 ))
             )
               AND t.company_name = (SELECT company_name FROM employees WHERE employee_id = $1)`,
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
             WHERE target_group = $1 AND company_name = $2
             ORDER BY created_at DESC`,
            [user.department, user.company_name]
        );

        const mails = [];
        const senderEmail = process.env.SENDER_EMAIL || 'admin@COMPANY.COM';

        for (const campaign of campaigns.rows) {
            const templateData = await db.query(
                `SELECT content FROM templates
                 WHERE name = $1 AND company_name = $2
                 LIMIT 1`,
                [campaign.template_type, user.company_name]
            );
            if (!templateData.rows.length) continue;

            const linkData = await db.query(
                `SELECT * FROM links
                 WHERE target_group = $1 AND template_type = $2 AND company_name = $3
                 ORDER BY link_id DESC LIMIT 1`,
                [user.department, campaign.template_type, user.company_name]
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
