/* ========================================================================
   JAVASCRIPT FOR SECURE COMPANY PORTAL (MICROSERVICES DOCKER VERSION)
   ======================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    
    const loginForm = document.getElementById("login-form");
    const loginFeedback = document.getElementById("login-feedback");
    
    const contactForm = document.getElementById("contact-form");
    const contactFeedback = document.getElementById("contact-feedback");

    // ==========================================
    // 1. PORTAL LOGIN SYSTEM (FETCH TO EXPRESS API CONTAINER)
    // ==========================================
    if (loginForm) {
        
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const usernameInput = document.getElementById("username").value.trim();
            const passwordInput = document.getElementById("password").value;

            loginFeedback.textContent = "";
            loginFeedback.className = "feedback-message hidden";

            const requestData = {
                username: usernameInput,
                password: passwordInput
            };

            // Call the Express Backend service container running on port 3000
            fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                if (data.success) {
                    loginFeedback.classList.remove("hidden");
                    loginFeedback.classList.add("success");
                    loginFeedback.textContent = data.message;

                    document.getElementById("username").disabled = true;
                    document.getElementById("password").disabled = true;
                    loginForm.querySelector("button[type='submit']").disabled = true;

                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 2000);
                } else {
                    loginFeedback.classList.remove("hidden");
                    loginFeedback.classList.add("error");
                    loginFeedback.textContent = data.message;
                }
            })
            .catch(function (error) {
                loginFeedback.classList.remove("hidden");
                loginFeedback.classList.add("error");
                loginFeedback.textContent = "Server Connection Failed. Please ensure Express Backend is running on port 3000.";
                console.error("Fetch Error:", error);
            });
        });
    }

    // ==========================================
    // 2. CONTACT FORM (FETCH TO EXPRESS API CONTAINER)
    // ==========================================
    if (contactForm) {
        
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const nameInput = document.getElementById("contact-name").value.trim();
            const emailInput = document.getElementById("contact-email").value.trim();
            const messageInput = document.getElementById("contact-message").value.trim();

            contactFeedback.textContent = "";
            contactFeedback.className = "feedback-message hidden";

            if (nameInput.length < 3) {
                contactFeedback.classList.remove("hidden");
                contactFeedback.classList.add("error");
                contactFeedback.textContent = "Please enter your full name (minimum 3 characters).";
                return;
            }

            const inquiryData = {
                name: nameInput,
                email: emailInput,
                message: messageInput
            };

            // Call the Express Backend service container running on port 3000
            fetch("http://localhost:3000/api/contact", {
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
                contactFeedback.textContent = "Connection Error. Could not submit to Express Backend container.";
                console.error("Fetch Error:", error);
            });
        });
    }
});
