"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const prisma_1 = require("../lib/prisma");
async function login(req, res) {
    console.log("🔥 LOGIN FUNCTION CALLED!");
    console.log("🔥 Request method:", req.method);
    console.log("🔥 Request path:", req.path);
    console.log("🔥 Request body:", req.body);
    try {
        console.log("=== LOGIN REQUEST START ===");
        console.log("Request body:", JSON.stringify(req.body));
        console.log("Request body type:", typeof req.body);
        const { username, password } = req.body;
        console.log("Extracted username:", username, "type:", typeof username);
        console.log("Extracted password:", password, "type:", typeof password);
        if (!username || !password) {
            console.log("Missing username or password");
            return res.status(400).json({ error: "Username and password are required" });
        }
        // Find user by username - ensure username is a string
        console.log("Querying database for username:", username);
        const user = await prisma_1.prisma.user.findUnique({
            where: { username: String(username).trim() },
        });
        console.log("Database query result:", user ? "FOUND" : "NOT FOUND");
        if (user) {
            console.log("User details:", {
                id: user.id,
                username: user.username,
                passwordHash: user.passwordHash,
                passwordHashType: typeof user.passwordHash,
                passwordHashLength: user.passwordHash?.length,
                providedPassword: password,
                providedPasswordType: typeof password,
                providedPasswordLength: password?.length,
            });
            // Convert both to strings and trim to avoid type/whitespace issues
            const storedPassword = String(user.passwordHash || "").trim();
            const providedPassword = String(password || "").trim();
            console.log("Comparison details:", {
                storedPassword: JSON.stringify(storedPassword),
                providedPassword: JSON.stringify(providedPassword),
                strictEqual: storedPassword === providedPassword,
                looseEqual: storedPassword == providedPassword,
                storedCharCodes: storedPassword.split("").map(c => c.charCodeAt(0)),
                providedCharCodes: providedPassword.split("").map(c => c.charCodeAt(0)),
            });
        }
        if (!user) {
            console.log("User not found in database");
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // PLAIN TEXT comparison: passwordHash field stores the raw password for now
        // Convert both to strings and trim to ensure type consistency and remove whitespace
        const storedPassword = String(user.passwordHash || "").trim();
        const providedPassword = String(password || "").trim();
        if (storedPassword !== providedPassword) {
            console.log("Password mismatch!");
            console.log("Stored:", JSON.stringify(storedPassword));
            console.log("Provided:", JSON.stringify(providedPassword));
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Success: return user info and a demo token
        console.log("=== LOGIN SUCCESS ===");
        return res.json({
            userId: user.id,
            username: user.username,
            token: "DEMO_TOKEN",
        });
    }
    catch (error) {
        console.error("=== LOGIN ERROR ===");
        console.error("Error details:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
        return res.status(500).json({ error: "Internal server error" });
    }
}
//# sourceMappingURL=authController.js.map