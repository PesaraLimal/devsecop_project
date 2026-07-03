/* ========================================================================
   JAVASCRIPT FOR SECURE COMPANY PORTAL (FULLSTACK VERSION)
   ======================================================================== */

// Wait for the HTML page to load completely before executing JavaScript.
document.addEventListener("DOMContentLoaded", function () {
    
    // Select elements from our DOM (Document Object Model)
    const loginForm = document.getElementById("login-form");
    const loginFeedback = document.getElementById("login-feedback");
    
    const contactForm = document.getElementById("contact-form");
    const contactFeedback = document.getElementById("contact-feedback");

    // ==========================================
    // 1. PORTAL LOGIN SYSTEM (FULLSTACK API CALL)
    // ==========================================
    if (loginForm) {
        
        loginForm.addEventListener("submit", function (event) {
            // Stop the form from submitting normally (prevent page reload)
            event.preventDefault();

            // Retrieve username and password values from inputs
            const usernameInput = document.getElementById("username").value.trim();
            const passwordInput = document.getElementById("password").value;

            // Reset login feedback message box
            loginFeedback.textContent = "";
            loginFeedback.className = "feedback-message hidden";

            // Prepare the payload (the data we want to send to the server)
            // We convert this data into an object.
            const requestData = {
                username: usernameInput,
                password: passwordInput
            };

            // 🎓 THE FETCH API (How the Frontend speaks to the Backend)
            // We tell the browser to call "/api/login" endpoint on our local server.
            fetch("/api/login", {
                method: "POST", // POST method is used for sending/creating resources securely.
                headers: {
                    "Content-Type": "application/json" // Tell backend we are sending raw JSON data.
                },
                body: JSON.stringify(requestData) // Convert the JS object into a JSON string of text.
            })
            // Step 1: Wait for server response and convert it from JSON string to a JS object.
            .then(function (response) {
                return response.json();
            })
            // Step 2: Handle the parsed server response data.
            .then(function (data) {
                if (data.success) {
                    // Success! Display positive message.
                    loginFeedback.classList.remove("hidden");
                    loginFeedback.classList.add("success");
                    loginFeedback.textContent = data.message;

                    // Disable inputs and button to prevent duplicate sign-ins
                    document.getElementById("username").disabled = true;
                    document.getElementById("password").disabled = true;
                    loginForm.querySelector("button[type='submit']").disabled = true;

                    // Redirect back to Home page after a 2-second delay
                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 2000);
                } else {
                    // Failure! Show error message returned by backend.
                    loginFeedback.classList.remove("hidden");
                    loginFeedback.classList.add("error");
                    loginFeedback.textContent = data.message;
                }
            })
            // Step 3: Handle unexpected network errors (e.g. server is offline).
            .catch(function (error) {
                loginFeedback.classList.remove("hidden");
                loginFeedback.classList.add("error");
                loginFeedback.textContent = "Server Connection Failed. Please ensure server.js is running.";
                console.error("Fetch Error:", error);
            });
        });
    }

    // ==========================================
    // 2. CONTACT FORM SUBMISSION (FULLSTACK API CALL)
    // ==========================================
    if (contactForm) {
        
        contactForm.addEventListener("submit", function (event) {
            // Stop page reload
            event.preventDefault();

            // Retrieve form values
            const nameInput = document.getElementById("contact-name").value.trim();
            const emailInput = document.getElementById("contact-email").value.trim();
            const messageInput = document.getElementById("contact-message").value.trim();

            // Reset feedback styles
            contactFeedback.textContent = "";
            contactFeedback.className = "feedback-message hidden";

            // Simple browser validations before calling the server
            if (nameInput.length < 3) {
                contactFeedback.classList.remove("hidden");
                contactFeedback.classList.add("error");
                contactFeedback.textContent = "Please enter your full name (minimum 3 characters).";
                return;
            }

            // Prepare inquiry data for the server
            const inquiryData = {
                name: nameInput,
                email: emailInput,
                message: messageInput
            };

            // Call backend API endpoint "/api/contact"
            fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inquiryData)
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    contactFeedback.classList.remove("hidden");
                    contactFeedback.classList.add("success");
                    contactFeedback.textContent = data.message;

                    // Clear fields upon success
                    contactForm.reset();
                } else {
                    contactFeedback.classList.remove("hidden");
                    contactFeedback.classList.add("error");
                    contactFeedback.textContent = data.message;
                }
            })
            .catch(function (error) {
                contactFeedback.classList.remove("hidden");
                contactFeedback.classList.add("error");
                contactFeedback.textContent = "Connection Error. Could not submit your message.";
                console.error("Fetch Error:", error);
            });
        });
    }
});
