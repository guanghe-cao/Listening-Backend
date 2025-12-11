"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express server entry point
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const tts_1 = __importDefault(require("./routes/tts"));
const logger_1 = require("./middleware/logger");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.requestLogger);
// Routes
console.log("🔧 Mounting auth routes");
app.use(authRoutes_1.default);
console.log("🔧 Mounting article routes");
app.use('/articles', articleRoutes_1.default);
console.log("🔧 Mounting TTS routes");
app.use('/tts', tts_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
//# sourceMappingURL=server.js.map