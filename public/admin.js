// --- 1. PROTECȚIA PAGINII DE ADMIN ---
const rolUtilizator = localStorage.getItem('userRol');

if (rolUtilizator !== 'admin') {
    alert("⛔ Acces interzis! Această pagină este rezervată administratorilor.");
    window.location.href = 'index.html'; 
}
// --------------------------------------

let editModeId = null; 

async function incarcaCafenele() {
    try {
        const response = await fetch('/api/cafenele');
        const cafenele = await response.json();

        const listaUl = document.querySelector('.soft-card ul'); 
        listaUl.innerHTML = ''; 

        cafenele.forEach(cafe => {
            const li = document.createElement('li');
            li.className = "py-3 flex justify-between items-center";
            li.innerHTML = `
                <span>${cafe.nume}</span>
                <div>
                    <button onclick="pregatesteEditare('${cafe._id}')" class="text-blue-600 text-sm mr-3 hover:underline">Editează</button>
                    <button onclick="stergeCafenea('${cafe._id}')" class="text-red-600 text-sm hover:underline">Șterge</button>
                </div>
            `;
            listaUl.appendChild(li);
        });
    } catch (error) {
        console.error('Eroare la încărcarea listei:', error);
    }
}

document.getElementById('btn-salveaza').addEventListener('click', async () => {
    const cafeData = {
        nume: document.getElementById('cafe-nume').value,
        adresa: document.getElementById('cafe-adresa').value,
        latitudine: parseFloat(document.getElementById('cafe-lat').value),
        longitudine: parseFloat(document.getElementById('cafe-long').value),
        descriere: document.getElementById('cafe-descriere').value,
        orar: document.getElementById('cafe-orar').value
    };

    if (!cafeData.nume || !cafeData.adresa) {
        alert("Te rugăm să completezi câmpurile obligatorii!");
        return;
    }

    try {
        let url = '/api/cafenele';
        let metoda = 'POST';

        if (editModeId) {
            url = `/api/cafenele/${editModeId}`;
            metoda = 'PUT';
        }

        const response = await fetch(url, {
            method: metoda,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cafeData)
        });

        if (response.ok) {
            alert(editModeId ? '✅ Cafenea actualizată!' : '✅ Cafenea adăugată!');
            
            editModeId = null;
            document.getElementById('btn-salveaza').innerText = "Salvează";
            document.getElementById('btn-salveaza').classList.remove('bg-blue-600');
            document.querySelectorAll('input, textarea').forEach(el => el.value = '');
            
            incarcaCafenele();
        }
    } catch (error) {
        console.error('Eroare la salvare:', error);
    }
});

async function stergeCafenea(id) {
    if (confirm("Ești sigur că vrei să ștergi această cafenea?")) {
        try {
            const response = await fetch(`/api/cafenele/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("🗑️ Cafenea ștearsă!");
                incarcaCafenele();
            }
        } catch (error) {
            console.error('Eroare la ștergere:', error);
        }
    }
}

async function pregatesteEditare(id) {
    try {
        const response = await fetch('/api/cafenele');
        const cafenele = await response.json();
        const cafe = cafenele.find(c => c._id === id);

        if (cafe) {
            document.getElementById('cafe-nume').value = cafe.nume;
            document.getElementById('cafe-adresa').value = cafe.adresa;
            document.getElementById('cafe-lat').value = cafe.latitudine;
            document.getElementById('cafe-long').value = cafe.longitudine;
            document.getElementById('cafe-descriere').value = cafe.descriere;
            document.getElementById('cafe-orar').value = cafe.orar;

            editModeId = id;
            document.getElementById('btn-salveaza').innerText = "Actualizează Cafenea";
            document.getElementById('btn-salveaza').classList.add('bg-blue-600', 'text-white');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Eroare la pregătirea editării:', error);
    }
}

incarcaCafenele();