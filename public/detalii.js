const urlParams = new URLSearchParams(window.location.search);
const cafeId = urlParams.get('id');

//UC5 vizionare detalii

function gestioneazaNavigatia() {
    const token = localStorage.getItem('token');
    const nume = localStorage.getItem('userNume');
    const rol = localStorage.getItem('userRol'); 

    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const numeDisplay = document.getElementById('nume-utilizator');
    const linkAdmin = document.getElementById('link-admin'); 

    if (token && nume) {
        authLinks.classList.add('hidden');
        userLinks.classList.remove('hidden'); 
        numeDisplay.innerText = `Salut, ${nume}!`;

        if (rol === 'admin' && linkAdmin) {
            linkAdmin.classList.remove('hidden');
        }
    }

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        localStorage.clear(); 
        window.location.href = 'index.html';
    });
}

gestioneazaNavigatia();

async function incarcaPagina() {
    if (!cafeId) return;

    try {
        const response = await fetch(`/api/cafenele/${cafeId}`);
        const cafe = await response.json();

        if (response.ok) {
            document.getElementById('detaliu-nume').innerText = cafe.nume;
            document.getElementById('detaliu-adresa').innerText = cafe.adresa;
            document.getElementById('detaliu-orar').innerText = cafe.orar || "Program nespecificat";
            document.getElementById('detaliu-descriere').innerText = cafe.descriere || "Fără descriere.";
            const titluRecenzii = document.getElementById('titlu-recenzii');
            if (titluRecenzii) {
                titluRecenzii.innerText = `Recenzii și Experiențe · ★ ${cafe.ratingMediu || 'Nou'}`;
            }
            
            afiseazaRecenzii(cafe.recenzii);
        }
    } catch (error) {
        console.error("Eroare la încărcare:", error);
    }
}

function afiseazaRecenzii(recenzii) {
    const listaElement = document.getElementById('lista-recenzii');
    
    if (!recenzii || recenzii.length === 0) {
        listaElement.innerHTML = '<p class="text-gray-400 italic">Nu există încă recenzii. Fii primul care lasă una!</p>';
        return;
    }

    listaElement.innerHTML = recenzii.map(r => `
        <div class="border-b border-gray-100 pb-4 last:border-0">
            <div class="flex justify-between mb-1">
                <span class="font-bold text-gray-800">${r.utilizator}</span>
                <span class="text-yellow-500">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
            </div>
            <p class="text-gray-600 text-sm">${r.comentariu}</p>
            <small class="text-gray-400">${new Date(r.data).toLocaleDateString('ro-RO')}</small>
        </div>
    `).join('');
}

// UC4 recenzie
document.getElementById('btn-trimite-recenzie').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const rating = document.getElementById('rating-nou').value;
    const comentariu = document.getElementById('text-recenzie').value;

    if (!token) {
        alert("Trebuie să fii logat pentru a lăsa o recenzie.");
        window.location.href = 'login.html';
        return;
    }

    if (!comentariu) {
        alert("Te rugăm să scrii un comentariu!");
        return;
    }

    try {
        const response = await fetch(`/api/cafenele/${cafeId}/recenzii`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rating: parseInt(rating),
                comentariu: comentariu
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Recenzie trimisă!");
            document.getElementById('text-recenzie').value = ''; 
            incarcaPagina(); 
        } else {
            alert(data.mesaj || data.eroare || "Nu am putut salva recenzia.");
        }
    } catch (error) {
        console.error("Eroare la trimiterea recenziei:", error);
    }
});

//UC6 Salvare la favorite
const btnFavorit = document.getElementById('btn-favorit');

if (btnFavorit) {
    btnFavorit.addEventListener('click', async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert("Trebuie să fii logat pentru a salva o cafenea la favorite!");
            return;
        }

        try {
            const response = await fetch('/api/favorite', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ cafeId: cafeId })
            });

            const data = await response.json();

            if (response.ok) {
                alert("❤️ " + data.mesaj);
            } else {
                alert("ℹ️ " + data.mesaj);
            }
        } catch (error) {
            console.error("Eroare la salvarea la favorite:", error);
            alert("A apărut o eroare de conexiune.");
        }
    });
}

incarcaPagina();
