// ========================================================================
// SECURE CORP PORTAL - BACKEND SERVER (Node.js Built-in HTTP Server)
// ========================================================================

// We import Node.js's built-in core modules.
// Since these modules are built-in, you do NOT need to run "npm install". They work automatically!
const http = require('http'); // Used to create the web server and handle requests.
const fs = require('fs');     // Used to interact with the file system (read HTML, CSS, JS files).
const path = require('path'); // Used to manage folder paths safely across Windows/Mac/Linux.

const PORT = 5000;

// A simple mock user database (simulating a database table).
const mockDatabase = [
    { username: "admin", password: "1234", name: "Administrator" }
];

// Helper function to read the body of a POST request.
// Because network requests can be large, Node.js receives POST data in small chunks.
// We must collect these chunks and combine them into a single string.
function parseBody(request, callback) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString(); // Append each chunk of data as it arrives.
    });
    request.on('end', () => {
        try {
            // Once all data is received, parse it from JSON text back into a JS object.
            const parsedData = JSON.parse(body);
            callback(parsedData);
        } catch (error) {
            callback({});
        }
    });
}

// Create the server
const server = http.createServer((req, res) => {
    console.log(`${req.method} request received for: ${req.url}`);

    // ==========================================
    // 1. ROUTE HANDLER: POST /api/login
    // ==========================================
    if (req.method === 'POST' && req.url === '/api/login') {
        parseBody(req, (data) => {
            const { username, password } = data;

            // Set response header to return JSON data
            res.writeHead(200, { 'Content-Type': 'application/json' });

            // Validate inputs
            if (!username || !password) {
                return res.end(JSON.stringify({ 
                    success: false, 
                    message: "Username and password are required fields." 
                }));
            }

            // Find matching user inside our mock Database
            const foundUser = mockDatabase.find(user => user.username === username);

            if (foundUser && foundUser.password === password) {
                // Success! Credentials match.
                res.end(JSON.stringify({
                    success: true,
                    message: `Welcome back, ${foundUser.name}! Login Successful.`
                }));
            } else {
                // Failed credentials.
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: "Access Denied: Invalid username or password."
                }));
            }
        });
        return;
    }

    // ==========================================
    // 2. ROUTE HANDLER: POST /api/contact
    // ==========================================
    if (req.method === 'POST' && req.url === '/api/contact') {
        parseBody(req, (data) => {
            const { name, email, message } = data;

            // Log details on the server terminal (simulating saving logs or DB save)
            console.log(`\n📬 NEW CONTACT FORM SUBMISSION:`);
            console.log(`Name:    ${name}`);
            console.log(`Email:   ${email}`);
            console.log(`Message: ${message}\n`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: `Thank you, ${name}! Your inquiry has been logged on the server.`
            }));
        });
        return;
    }

    // ==========================================
    // 3. STATIC FILE SERVER (HTML, CSS, JS, Media)
    // Serve files stored in the local workspace directory.
    // ==========================================
    if (req.method === 'GET') {
        // If user visits "/", they want the home page (index.html)
        let filePath = req.url === '/' ? '/index.html' : req.url;
        
        // Resolve absolute filepath
        const resolvedPath = path.join(__dirname, filePath);
        
        // Check file extension to send correct header instructions to the browser
        const extname = path.extname(resolvedPath);
        let contentType = 'text/html';

        switch (extname) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpeg';
                break;
        }

        // Read the requested file from disk
        fs.readFile(resolvedPath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    // File not found (404 Error)
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Page Not Found</h1><p>The requested file does not exist on this server.</p>', 'utf-8');
                } else {
                    // Server internal error (500 Error)
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                // Success! Return file content with correct Content-Type header
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return;
    }

    // If request is neither POST nor GET static files, return 405 (Method Not Allowed)
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
});

// Run the server
server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Fullstack Company Portal Server running!`);
    console.log(`👉 Open: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
