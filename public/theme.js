function aplicaTema(tema) {
    const esteDark = tema === 'dark';
    document.body.classList.toggle('dark-theme', esteDark);
    localStorage.setItem('temaCafeSpot', tema);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.checked = esteDark;
        toggle.setAttribute('aria-label', esteDark ? 'Dezactiveaza tema inchisa' : 'Activeaza tema inchisa');
    }
}

function initTema() {
    const temaSalvata = localStorage.getItem('temaCafeSpot') || 'light';

    const control = document.createElement('label');
    control.className = 'theme-switch';
    control.title = 'Schimba tema';
    control.innerHTML = `
        <input id="theme-toggle" type="checkbox" aria-label="Activeaza tema inchisa">
        <span class="theme-slider">
            <span class="theme-icon theme-sun">☀</span>
            <span class="theme-icon theme-moon">●</span>
        </span>
    `;

    document.body.appendChild(control);
    aplicaTema(temaSalvata);

    document.getElementById('theme-toggle').addEventListener('change', (event) => {
        aplicaTema(event.target.checked ? 'dark' : 'light');
    });
}

document.addEventListener('DOMContentLoaded', initTema);
