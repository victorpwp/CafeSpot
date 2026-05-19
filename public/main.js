var harta = L.map('harta-cafenele').setView([44.4268, 26.1025], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(harta);

let toateCafenelele = []; 
let markeri = L.layerGroup().addTo(harta); 

async function incarcaContinut() {
    try {
        const response = await fetch('/api/cafenele');
        toateCafenelele = await response.json();
        afiseazaCafenele(toateCafenelele); 
    } catch (error) {
        console.error('Eroare la încărcarea conținutului:', error);
    }
}

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

function afiseazaCafenele(lista) {
    // MODIFICARE AICI: Țintim direct containerul corect folosind ID-ul!
    const listaCarduri = document.getElementById('lista-cafenele');
    listaCarduri.innerHTML = ''; 
    markeri.clearLayers();

    if (lista.length === 0) {
        listaCarduri.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-xl text-gray-500 font-medium">Scuze, nu am găsit cafeneaua pe care o cauți! 😿</p>
                <p class="text-sm text-gray-400 mt-2">Încearcă un alt nume sau o altă locație.</p>
            </div>
        `;
        return; 
    }

    lista.forEach(cafe => {
        const marker = L.marker([cafe.latitudine, cafe.longitudine]);
        marker.bindPopup(`<b>${cafe.nume}</b><br>${cafe.adresa}`);
        markeri.addLayer(marker);

        const card = document.createElement('div');
        card.className = "soft-card rounded-xl border overflow-hidden hover:shadow-md transition";
        card.innerHTML = `
            <div class="h-40 cafe-visual" style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 40px;">☕</div>
            <div class="p-5">
                <h2 class="text-lg font-bold">${cafe.nume}</h2>
                <p class="text-xs text-teal-700 mb-3">📍 ${cafe.adresa}</p>
                <p class="text-sm text-gray-600 line-clamp-2 mb-4">${cafe.descriere || 'O cafenea primitoare.'}</p>
                <div class="flex justify-between items-center border-t pt-4">
                    <div class="text-sm"><span class="text-yellow-500">★</span> 5.0</div>
                    <a href="detalii.html?id=${cafe._id}" class="text-sm font-semibold link-accent hover:underline">Vezi detalii</a>
                </div>
            </div>
        `;
        listaCarduri.appendChild(card);
    });
}

// UC3 Cauta cafenele
const inputCautare = document.querySelector('input[placeholder*="Caută"]');

if (inputCautare) {
    inputCautare.addEventListener('input', (e) => {
        const textCautat = e.target.value.toLowerCase();
        
        const rezultateFiltrate = toateCafenelele.filter(cafe => {
            return cafe.nume.toLowerCase().includes(textCautat) || 
                   cafe.adresa.toLowerCase().includes(textCautat);
        });

        afiseazaCafenele(rezultateFiltrate);
    });
}

incarcaContinut();