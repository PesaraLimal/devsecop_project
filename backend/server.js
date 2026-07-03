const express = require("express");
const app = express();

app.use(express.json());

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

// Secure Portal Login API endpoint
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "1234") {
        res.status(200).json({ 
            success: true, 
            message: "Login successful! (Authenticated via Express Container API)" 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: "Access Denied: Invalid credentials in Express." 
        });
    }
});

// Contact Us Inquiry API endpoint
app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;
    
    console.log("\n=======================================================");
    console.log("📬 NEW EXPRESS CONTAINER INQUIRY RECEIVED:");
    console.log(`Name:    ${name}`);
    console.log(`Email:   ${email}`);
    console.log(`Message: ${message}`);
    console.log("=======================================================\n");

    res.status(200).json({ 
        success: true, 
        message: `Thank you, ${name}! Your inquiry has been logged on the Node.js backend.` 
    });
});

app.listen(3000, () => {
    console.log("Backend running on port 3000");
});
