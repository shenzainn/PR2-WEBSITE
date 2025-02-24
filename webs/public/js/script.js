const signUpButton = document.getElementById('signUpButton'); 
const signInButton = document.getElementById('signInButton'); 
const signInForm = document.getElementById('signIn'); 
const signUpForm = document.getElementById('signUp'); 

if (signUpButton && signInButton) {
    signUpButton.addEventListener('click', function () {
        signInForm.style.display = "none";
        signUpForm.style.display = "block";
    });

    signInButton.addEventListener('click', function () {
        signInForm.style.display = "block";
        signUpForm.style.display = "none";
    });
}

// Toggle Sidebar Menu
document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    // Function to check screen size and update sidebar state
    function updateSidebarState() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("active");
            sidebar.style.transform = "translateX(0)"; 
            menuToggle.style.display = "none";
        } else {
            menuToggle.style.display = "block"; 
            if (!sidebar.classList.contains("active")) {
                sidebar.style.transform = "translateX(-250px)";
            }
        }
    }

    // Toggle sidebar when clicking the menu button
    menuToggle.addEventListener("click", function () {
        if (sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
            sidebar.style.transform = "translateX(-250px)";
        } else {
            sidebar.classList.add("active");
            sidebar.style.transform = "translateX(0)";
        }
    });

    // Run on window resize
    window.addEventListener("resize", updateSidebarState);

    // Run on page load
    updateSidebarState();
});


/* how to reroute to other files to the ejs files:
1. ejs files are automatically loaded to search for the public folder 
2. always start with a slash ex. /css/ or /images/
*/


// Dark Mode Toggle
document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("dark-mode-toggle"); // Ensure you have an element with this ID
    const body = document.body;

    // Check if user has a saved preference for dark mode
    if (localStorage.getItem("darkMode") === "enabled") {
        body.classList.add("dark-mode");
        toggleSwitch.checked = true; // If using a switch input
    }

    // Toggle function
    toggleSwitch.addEventListener("change", function () {
        if (this.checked) {
            body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });
});


// Password Change (Mock function for UI only)
function changePassword() {
    let currentPass = document.getElementById("current-password").value;
    let newPass = document.getElementById("new-password").value;

    if (currentPass && newPass) {
        alert("Password updated successfully! (This is a UI demo)");
    } else {
        alert("Please fill in both password fields.");
    }
}
