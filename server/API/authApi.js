import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { clearAuthCookie, requireAuth, setAuthCookie, signAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { type } = req.body;
    console.log('[auth] signup request', { type, email: req.body.email });

    if (type !== 'employee') {
        console.warn('[auth] signup rejected: invalid type', { type });
        return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    const { name, department, designation, email, joining_date, password, company_name } = req.body;

    if (!name || !email || !password || !company_name) {
        console.warn('[auth] signup rejected: missing required fields', { email });
        return res.status(400).json({ success: false, message: 'Name, email, password and company are required' });
    }

    try {
        console.log('[auth] checking existing employee', { email });
        const existing = await db.query(
            'SELECT employee_id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
            [email]
        );

        if (existing.rows.length) {
            console.warn('[auth] signup rejected: employee already exists', { email });
            return res.status(409).json({ success: false, message: 'Employee already exists' });
        }

        const hashed = await bcrypt.hash(password, 12);
        console.log('[auth] creating employee', { email, company_name });

        await db.query(
            `INSERT INTO users
             (name, department, designation, email, joining_date, password, company_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [name, department || null, designation || null, email, joining_date || null, hashed, company_name]
        );

        console.log('[auth] signup completed', { email });
        return res.status(201).json({ success: true, message: 'Employee created successfully' });
    } catch (err) {
        console.error('[auth] signup error', { email, error: err });
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('[auth] login request', { username });

    if (!username || !password) {
        console.warn('[auth] login rejected: missing required fields', { username });
        return res.status(400).json({ success: false, message: 'All fields required' });
    }

    try {
        console.log('[auth] checking admin credentials', { username });
        const adminResult = await db.query(
            'SELECT * FROM admins WHERE LOWER(username) = LOWER($1) LIMIT 1',
            [username]
        );

        if (adminResult.rows.length) {
            const admin = adminResult.rows[0];
            const valid = await bcrypt.compare(password, admin.password);

            if (!valid) {
                console.warn('[auth] admin login rejected: invalid password', { username });
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = signAuthToken({
                type: 'admin',
                userId: admin.admin_id,
            });

            setAuthCookie(res, token);
            console.log('[auth] admin login completed', { userId: admin.admin_id, username: admin.username });

            return res.json({
                success: true,
                type: 'admin',
                username: admin.username,
                role: admin.role,
                company_name: admin.company_name,
            });
        }

        console.log('[auth] admin not found, checking employee credentials', { username });
        const employeeResult = await db.query(
            'SELECT * FROM employees WHERE LOWER(name) = LOWER($1) LIMIT 1',
            [username]
        );

        if (!employeeResult.rows.length) {
            console.warn('[auth] employee login rejected: user not found', { username });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const employee = employeeResult.rows[0];
        const valid = await bcrypt.compare(password, employee.password);

        if (!valid) {
            console.warn('[auth] employee login rejected: invalid password', { username });
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signAuthToken({
            type: 'employee',
            userId: employee.employee_id,
        });

        setAuthCookie(res, token);
        console.log('[auth] employee login completed', { userId: employee.employee_id, username: employee.name });

        return res.json({
            success: true,
            type: 'employee',
            name: employee.name,
            email: employee.email,
            department: employee.department,
            designation: employee.designation,
            company_name: employee.company_name,
        });
    } catch (err) {
        console.error('[auth] login error', { username, error: err });
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    console.log('[auth] profile request', { type: req.auth.type, userId: req.auth.userId });
    try {
        if (req.auth.type === 'admin') {
            const result = await db.query(
                `SELECT admin_id, username, role, company_name, email
                 FROM admins WHERE admin_id = $1 LIMIT 1`,
                [req.auth.userId]
            );

            if (!result.rows.length) {
                console.warn('[auth] admin profile not found', { userId: req.auth.userId });
                return res.status(401).json({ success: false, message: 'User no longer exists' });
            }

            console.log('[auth] admin profile loaded', { userId: req.auth.userId });
            return res.json({ success: true, type: 'admin', user: result.rows[0] });
        }

        const result = await db.query(
            `SELECT employee_id, name, email, department, designation, joining_date, company_name
             FROM employees WHERE employee_id = $1 LIMIT 1`,
            [req.auth.userId]
        );

        if (!result.rows.length) {
            console.warn('[auth] employee profile not found', { userId: req.auth.userId });
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        console.log('[auth] employee profile loaded', { userId: req.auth.userId });
        return res.json({ success: true, type: 'employee', user: result.rows[0] });
    } catch (err) {
        console.error('[auth] profile error', { userId: req.auth?.userId, error: err });
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

router.post('/logout', (req, res) => {
    console.log('[auth] logout request');
    clearAuthCookie(res);
    console.log('[auth] logout completed');
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
