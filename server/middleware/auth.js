import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'phishaware_token';

export function signAuthToken(payload) {
    if (!process.env.JWT_SECRET) {
        console.error('[auth] cannot sign token: JWT_SECRET is not configured');
        throw new Error('JWT_SECRET is not configured');
    }

    console.log('[auth] signing token', { type: payload.type, userId: payload.userId });
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        issuer: 'phishaware-api',
        audience: 'phishaware-client',
    });
}

export function setAuthCookie(res, token) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('[auth] setting auth cookie', { isProduction });

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 8 * 60 * 60 * 1000,
        path: '/',
    });
}

export function clearAuthCookie(res) {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('[auth] clearing auth cookie', { isProduction });

    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    });
}

export function requireAuth(req, res, next) {
    try {
        const cookieToken = req.cookies?.[COOKIE_NAME];
        const authorization = req.get('authorization') || '';
        const bearerToken = authorization.startsWith('Bearer ')
            ? authorization.slice('Bearer '.length)
            : '';
        const token = cookieToken || bearerToken;

        if (!token) {
            console.warn('[auth] request rejected: auth credentials missing', { method: req.method, path: req.path });
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        req.auth = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'phishaware-api',
            audience: 'phishaware-client',
        });

        next();
    } catch (err) {
        console.warn('[auth] request rejected: invalid or expired token', {
            method: req.method,
            path: req.path,
            error: err.message,
        });
        return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.auth || !roles.includes(req.auth.type)) {
            console.warn('[auth] request rejected: insufficient role', {
                path: req.path,
                actualRole: req.auth?.type,
                requiredRoles: roles,
            });
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        console.log('[auth] role authorized', { path: req.path, role: req.auth.type });
        next();
    };
}

export { COOKIE_NAME };
