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

function cafeVisualMarkup(cafe) {
    if (cafe.imagine) {
        return `
            <div class="h-40 cafe-visual cafe-photo" style="background-image: url('${cafe.imagine.replace(/'/g, '%27')}')"></div>
        `;
    }

    return `
        <div class="h-40 cafe-visual">
            <div class="cafe-scene" aria-hidden="true">
                <span class="cafe-window"></span>
                <span class="cafe-steam"></span>
                <span class="cafe-cup"></span>
                <span class="cafe-counter"></span>
            </div>
        </div>
    `;
}


async function incarcaFavorite() {
    const token = localStorage.getItem('token');
    const grila = document.getElementById('grid-favorite');

    try {
        const response = await fetch('/api/favorite', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const cafenele = await response.json();

        if (response.ok) {
            grila.innerHTML = ''; 

            if (cafenele.length === 0) {
                grila.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <p class="text-xl text-gray-500 font-medium">Nu ai nicio cafenea salvată la favorite! ❤️❌</p>
                        <a href="index.html" class="text-teal-600 font-semibold hover:underline mt-2 inline-block">Mergi la listă și adaugă una</a>
                    </div>
                `;
                return;
            }

            cafenele.forEach(cafe => {
                const card = document.createElement('div');
                card.className = "soft-card rounded-xl border overflow-hidden hover:shadow-md transition bg-white shadow-sm";
                card.innerHTML = `
                    ${cafeVisualMarkup(cafe)}
                    <div class="p-5">
                        <h2 class="text-lg font-bold text-gray-900">${cafe.nume}</h2>
                        <p class="text-xs text-teal-700 mb-3">📍 ${cafe.adresa}</p>
                        <p class="text-sm text-gray-600 line-clamp-2 mb-4">${cafe.descriere || 'O cafenea primitoare.'}</p>
                        <div class="flex justify-between items-center border-t pt-4">
                            <span class="text-sm"><span class="text-yellow-500">★</span> ${cafe.ratingMediu || 'Nou'}</span>
                            <a href="detalii.html?id=${cafe._id}" class="text-sm font-semibold text-teal-600 hover:underline">Vezi detalii</a>
                            
                            <button onclick="eliminaDinFavorite('${cafe._id}')" class="text-sm font-semibold text-red-500 hover:text-red-700 hover:underline">💔 Elimină</button>
                        </div>
                    </div>
                `;
                grila.appendChild(card);
            });
        } else {
            grila.innerHTML = `<p class="col-span-full text-center text-red-500">Eroare: ${cafenele.mesaj}</p>`;
        }
    } catch (error) {
        console.error("Eroare la încărcarea favoritelor:", error);
        grila.innerHTML = `<p class="col-span-full text-center text-red-500">A apărut o eroare la conectarea cu serverul.</p>`;
    }
}

window.eliminaDinFavorite = async function(cafeId) {
    const token = localStorage.getItem('token');
    
    if (!confirm("Ești sigură că vrei să elimini această cafenea de la favorite?")) {
        return;
    }

    try {
        const response = await fetch(`/api/favorite/${cafeId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.mesaj);
            incarcaFavorite();
        } else {
            alert("Eroare: " + data.mesaj);
        }
    } catch (error) {
        console.error("Eroare la ștergerea de la favorite:", error);
        alert("Nu s-a putut efectua ștergerea.");
    }
}

gestioneazaNavigatia();
incarcaFavorite();
