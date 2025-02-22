document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const studentNumber = document.getElementById('StudentNumber').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentNumber, password })
    });

    const result = await response.json();

    if (result.success) {
        // Redirect to homepage on successful login
        window.location.href = '/students';
    } else {
        alert(result.message); // Show error message
    }
});
