document.getElementById('btn-register').addEventListener('click', async () => {
    const nume = document.getElementById('reg-nume').value;
    const email = document.getElementById('reg-email').value;
    const parola = document.getElementById('reg-parola').value;

    if (!nume || !email || !parola) {
        alert("Te rugăm să completezi toate câmpurile!");
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nume, email, parola })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Cont creat cu succes! Acum te poți autentifica.");
            window.location.href = 'login.html'; 
        } else {
            alert("Eroare: " + data.mesaj);
        }
    } catch (error) {
        console.error("Eroare la înregistrare:", error);
        alert("A apărut o eroare la conexiunea cu serverul.");
    }
});