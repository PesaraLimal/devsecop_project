const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());

// Open the SQLite database connection
const db = new sqlite3.Database("portal.db", (err) => {
    if (err) {
        console.error("❌ Failed to open SQLite database:", err.message);
    } else {
        console.log("📂 Connected to SQLite database 'portal.db'");
    }
});

// Enable CORS if needed (Nginx handles routing, but this is a good safety practice)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Main test route as requested
app.get("/api", (req, res) => {
    res.json({ message: "Backend API Working" });
});

// Secure Portal Login API endpoint (Validates credentials against database)
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, row) => {
            if (err) {
                console.error("Database query error:", err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: "Database error. Failed to execute login query." 
                });
            }
            
            if (row) {
                res.status(200).json({ 
                    success: true, 
                    message: `Login successful! Welcome back, ${row.name}.` 
                });
            } else {
                res.status(401).json({ 
                    success: false, 
                    message: "Access Denied: Invalid credentials in Database." 
                });
            }
        }
    );
});

// Contact Us Inquiry API endpoint (Saves inquiry data to database)
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    
    db.run(
        "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
        [name, email, message],
        function (err) {
            if (err) {
                console.error("Database insert error:", err.message);
                return res.status(500).json({ 
                    success: false, 
                    message: "Database error. Failed to log inquiry." 
                });
            }
            
            console.log("\n=======================================================");
            console.log(`📬 NEW DATABASE INQUIRY RECEIVED (ID: ${this.lastID}):`);
            console.log(`Name:    ${name}`);
            console.log(`Email:   ${email}`);
            console.log(`Message: ${message}`);
            console.log("=======================================================\n");

            res.status(200).json({ 
                success: true, 
                message: `Thank you, ${name}! Your inquiry has been saved in the SQLite database.` 
            });
        }
    );
});

app.listen(3000, () => {
    console.log("Backend running on port 3000");
});
