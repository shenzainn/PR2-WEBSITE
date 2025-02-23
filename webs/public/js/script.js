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


// Select theme buttons
const lightModeBtn = document.getElementById("light-mode");
const darkModeBtn = document.getElementById("dark-mode");

// Function to enable Dark Mode
function enableDarkMode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark"); // Save user preference
}

// Function to enable Light Mode
function enableLightMode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light"); // Save user preference
}

// Check for saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    enableDarkMode();
}

// Add event listeners
darkModeBtn.addEventListener("click", enableDarkMode);
lightModeBtn.addEventListener("click", enableLightMode);

