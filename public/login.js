document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('log-email').value;
    const parola = document.getElementById('log-parola').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, parola })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userNume', data.user.nume);
            localStorage.setItem('userRol', data.user.rol); 

            alert(`Bine ai revenit, ${data.user.nume}!`);
            window.location.href = 'index.html'; 
        } else {
            alert(data.mesaj);
        }
    } catch (error) {
        console.error("Eroare la login:", error);
    }
});