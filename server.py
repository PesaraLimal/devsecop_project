# ========================================================================
# SECURE CORP PORTAL - BACKEND SERVER (Python Built-in HTTP + SQLite DB)
# ========================================================================

# 1. WHAT IS SQLITE?
# - SQLite is a fully relational Database engine that stores data in a local file.
# - It is built directly into Python (no installation needed) and uses standard SQL commands.

import http.server  # Tool to run the web server
import socketserver # Tool to handle port listening
import json         # Tool to read and format JSON packages
import os           # Tool to work with local files
import sqlite3      # Core Python library to communicate with SQL Databases

PORT = 5000
DB_FILE = "portal.db"

# ==========================================
# 2. DATABASE INITIALIZATION (Creating tables)
# ==========================================
def init_db():
    # Connect to database file (creates "portal.db" in the folder if it doesn't exist)
    conn = sqlite3.connect(DB_FILE)
    
    # A cursor is like a text pointer that lets us execute SQL statements
    cursor = conn.cursor()

    # Create Users table (Stores authorized accounts)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            name TEXT
        )
    """)

    # Create Contacts table (Stores contact form submissions)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed initial admin data if the user table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        print("[DATABASE INITIALIZATION] Seeding default admin user...")
        cursor.execute(
            "INSERT INTO users (username, password, name) VALUES (?, ?, ?)",
            ("admin", "1234", "Administrator")
        )
        conn.commit() # Save changes to the file

    conn.close() # Close connection
    print("[DATABASE INITIALIZATION] SQLite Database is active and ready.")

# Initialize the database at startup
init_db()

# ==========================================
# 3. HTTP REQUEST HANDLER (API & Static files)
# ==========================================
class SecurePortalHandler(http.server.BaseHTTPRequestHandler):

    # Serve static HTML/CSS/JS files
    def do_GET(self):
        requested_file = self.path
        if requested_file == '/':
            requested_file = '/index.html'

        local_path = requested_file.lstrip('/')

        if os.path.exists(local_path) and os.path.isfile(local_path):
            _, ext = os.path.splitext(local_path)
            content_type = 'text/html'
            if ext == '.css':
                content_type = 'text/css'
            elif ext == '.js':
                content_type = 'application/javascript'
            elif ext == '.png':
                content_type = 'image/png'
            elif ext == '.jpg' or ext == '.jpeg':
                content_type = 'image/jpeg'

            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()

            with open(local_path, 'rb') as file:
                self.wfile.write(file.read())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write("<h1>404 Page Not Found</h1>".encode('utf-8'))

    # Handle form submissions and API calls
    def do_POST(self):
        
        # --- API Route: Login Validation ---
        if self.path == '/api/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(post_data)
            except json.JSONDecodeError:
                data = {}

            username = data.get('username', '').strip()
            password = data.get('password', '')

            # CONNECT TO DATABASE TO VERIFY USER
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            
            # Use safe SQL parameters (?) to prevent SQL Injection hacking!
            cursor.execute(
                "SELECT name FROM users WHERE username = ? AND password = ?",
                (username, password)
            )
            result = cursor.fetchone() # Fetch the matching record if it exists
            conn.close()

            if result:
                # User found!
                user_name = result[0]
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {
                    "success": True,
                    "message": f"Welcome back, {user_name}! Verified via SQLite Database."
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
            else:
                # User not found or wrong password
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {
                    "success": False,
                    "message": "Access Denied: Invalid credentials in SQLite."
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))

        # --- API Route: Save Contact Form Submission ---
        elif self.path == '/api/contact':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(post_data)
            except json.JSONDecodeError:
                data = {}

            name = data.get('name', '')
            email = data.get('email', '')
            message = data.get('message', '')

            # CONNECT TO DATABASE AND INSERT SUBMISSION
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
                (name, email, message)
            )
            conn.commit() # Save the new row permanently!
            conn.close()

            # Confirm insertion on the terminal logs
            print(f"\n[SQLITE DB LOG] Inserted new inquiry from {name} ({email})")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            response = {
                "success": True,
                "message": f"Thank you, {name}! Your message has been saved in the SQLite Database."
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()

# ==========================================
# 4. STARTING THE SERVER
# ==========================================
with socketserver.TCPServer(("", PORT), SecurePortalHandler) as httpd:
    print(f"=======================================================")
    print(f"Python-based Fullstack SQLite Server started!")
    print(f"Database active: {DB_FILE}")
    print(f"Access site at: http://localhost:{PORT}")
    print(f"=======================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python Server.")
