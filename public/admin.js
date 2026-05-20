const rolUtilizator = localStorage.getItem('userRol');
const token = localStorage.getItem('token');

if (rolUtilizator !== 'admin' || !token) {
    alert('Acces interzis! Aceasta pagina este rezervata administratorilor.');
    window.location.href = 'index.html';
}

let editModeId = null;

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function curataFormular() {
    editModeId = null;
    document.getElementById('btn-salveaza').innerText = 'Salveaza';
    document.getElementById('btn-salveaza').classList.remove('bg-blue-600', 'text-white');
    document.querySelectorAll('input, textarea').forEach(el => el.value = '');
}

async function incarcaCafenele() {
    try {
        const response = await fetch('/api/cafenele');
        const cafenele = await response.json();

        const listaUl = document.querySelector('.soft-card ul');
        listaUl.innerHTML = '';

        cafenele.forEach(cafe => {
            const li = document.createElement('li');
            li.className = 'py-3 flex justify-between items-center gap-4';
            li.innerHTML = `
                <span>${cafe.nume}</span>
                <div class="shrink-0">
                    <button onclick="pregatesteEditare('${cafe._id}')" class="text-blue-600 text-sm mr-3 hover:underline">Editeaza</button>
                    <button onclick="stergeCafenea('${cafe._id}')" class="text-red-600 text-sm hover:underline">Sterge</button>
                </div>
            `;
            listaUl.appendChild(li);
        });
    } catch (error) {
        console.error('Eroare la incarcarea listei:', error);
    }
}

document.getElementById('btn-salveaza').addEventListener('click', async () => {
    const cafeData = {
        nume: document.getElementById('cafe-nume').value,
        adresa: document.getElementById('cafe-adresa').value,
        latitudine: parseFloat(document.getElementById('cafe-lat').value),
        longitudine: parseFloat(document.getElementById('cafe-long').value),
        descriere: document.getElementById('cafe-descriere').value,
        imagine: document.getElementById('cafe-imagine').value,
        orar: document.getElementById('cafe-orar').value
    };

    if (!cafeData.nume || !cafeData.adresa || Number.isNaN(cafeData.latitudine) || Number.isNaN(cafeData.longitudine)) {
        alert('Completeaza numele, adresa, latitudinea si longitudinea.');
        return;
    }

    try {
        const url = editModeId ? `/api/cafenele/${editModeId}` : '/api/cafenele';
        const metoda = editModeId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: metoda,
            headers: authHeaders(),
            body: JSON.stringify(cafeData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(editModeId ? 'Cafenea actualizata!' : 'Cafenea adaugata!');
            curataFormular();
            incarcaCafenele();
        } else {
            alert(data.mesaj || data.eroare || 'Nu am putut salva cafeneaua.');
        }
    } catch (error) {
        console.error('Eroare la salvare:', error);
    }
});

window.stergeCafenea = async function(id) {
    if (!confirm('Esti sigur ca vrei sa stergi aceasta cafenea?')) return;

    try {
        const response = await fetch(`/api/cafenele/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const data = await response.json();

        if (response.ok) {
            alert('Cafenea stearsa!');
            incarcaCafenele();
            incarcaRecenziiAdmin();
        } else {
            alert(data.mesaj || data.eroare || 'Nu am putut sterge cafeneaua.');
        }
    } catch (error) {
        console.error('Eroare la stergere:', error);
    }
};

window.pregatesteEditare = async function(id) {
    try {
        const response = await fetch('/api/cafenele');
        const cafenele = await response.json();
        const cafe = cafenele.find(c => c._id === id);

        if (cafe) {
            document.getElementById('cafe-nume').value = cafe.nume || '';
            document.getElementById('cafe-adresa').value = cafe.adresa || '';
            document.getElementById('cafe-lat').value = cafe.latitudine || '';
            document.getElementById('cafe-long').value = cafe.longitudine || '';
            document.getElementById('cafe-descriere').value = cafe.descriere || '';
            document.getElementById('cafe-imagine').value = cafe.imagine || '';
            document.getElementById('cafe-orar').value = cafe.orar || '';

            editModeId = id;
            document.getElementById('btn-salveaza').innerText = 'Actualizeaza Cafenea';
            document.getElementById('btn-salveaza').classList.add('bg-blue-600', 'text-white');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Eroare la pregatirea editarii:', error);
    }
};

async function incarcaRecenziiAdmin() {
    const container = document.getElementById('lista-recenzii-admin');

    try {
        const response = await fetch('/api/cafenele/admin/recenzii', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const recenzii = await response.json();

        if (!response.ok) {
            container.innerHTML = `<p class="text-sm text-red-500">${recenzii.mesaj || recenzii.eroare}</p>`;
            return;
        }

        if (recenzii.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">Nu exista recenzii de moderat.</p>';
            return;
        }

        container.innerHTML = recenzii.map((r) => `
            <div class="border border-orange-100 p-3 rounded bg-orange-50/60">
                <div class="flex justify-between gap-3 mb-2">
                    <p class="text-sm font-bold">${r.utilizator} -> ${r.cafeNume}</p>
                    <span class="text-xs ${r.aprobata ? 'text-green-600' : 'text-orange-600'}">${r.aprobata ? 'Aprobata' : 'Neaprobata'}</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <label class="text-xs text-gray-500">Rating</label>
                    <select id="rating-${r.recenzieId}" class="p-1 border border-orange-100 rounded text-sm">
                        ${[1, 2, 3, 4, 5].map(val => `<option value="${val}" ${val === r.rating ? 'selected' : ''}>${val}</option>`).join('')}
                    </select>
                </div>
                <textarea id="comentariu-${r.recenzieId}" class="w-full p-2 border border-orange-100 rounded text-sm mb-2">${r.comentariu}</textarea>
                <div class="flex flex-wrap gap-2">
                    <button onclick="aprobaRecenzie('${r.cafeId}', '${r.recenzieId}')" class="text-green-700 text-xs font-bold border border-green-600 px-2 py-1 rounded">Aproba</button>
                    <button onclick="editeazaRecenzie('${r.cafeId}', '${r.recenzieId}')" class="text-blue-700 text-xs font-bold border border-blue-600 px-2 py-1 rounded">Salveaza editarea</button>
                    <button onclick="stergeRecenzie('${r.cafeId}', '${r.recenzieId}')" class="text-red-700 text-xs font-bold border border-red-600 px-2 py-1 rounded">Sterge</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Eroare la incarcarea recenziilor:', error);
        container.innerHTML = '<p class="text-sm text-red-500">Nu am putut incarca recenziile.</p>';
    }
}

window.aprobaRecenzie = async function(cafeId, recenzieId) {
    const response = await fetch(`/api/cafenele/${cafeId}/recenzii/${recenzieId}/aproba`, {
        method: 'PATCH',
        headers: authHeaders()
    });
    const data = await response.json();
    alert(data.mesaj || data.eroare);
    incarcaRecenziiAdmin();
};

window.editeazaRecenzie = async function(cafeId, recenzieId) {
    const rating = document.getElementById(`rating-${recenzieId}`).value;
    const comentariu = document.getElementById(`comentariu-${recenzieId}`).value;

    const response = await fetch(`/api/cafenele/${cafeId}/recenzii/${recenzieId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ rating: Number(rating), comentariu, aprobata: true })
    });
    const data = await response.json();
    alert(data.mesaj || data.eroare || data.mesaj);
    incarcaRecenziiAdmin();
};

window.stergeRecenzie = async function(cafeId, recenzieId) {
    if (!confirm('Stergi aceasta recenzie?')) return;

    const response = await fetch(`/api/cafenele/${cafeId}/recenzii/${recenzieId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    const data = await response.json();
    alert(data.mesaj || data.eroare);
    incarcaRecenziiAdmin();
};

incarcaCafenele();
incarcaRecenziiAdmin();
