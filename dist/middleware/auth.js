"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUserId = requireUserId;
function requireUserId(req, res, next) {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        res.status(400).json({ error: 'Missing x-user-id' });
        return;
    }
    req.userId = userId;
    next();
}
//# sourceMappingURL=auth.js.map