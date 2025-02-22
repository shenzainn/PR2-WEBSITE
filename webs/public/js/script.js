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
document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('active');
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

