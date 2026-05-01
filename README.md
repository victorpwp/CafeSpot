# CafeSpot

CafeSpot este o aplicatie web statica pentru descoperirea cafenelelor, gandita ca un prototip rapid pentru listare, vizualizare pe harta, autentificare si administrare.

## Ce include

- Pagina principala cu lista de cafenele si harta interactiva.
- Integrare Leaflet cu tile-uri OpenStreetMap.
- Pagina de detalii pentru o cafenea, cu recenzii si optiune de favorite.
- Pagini pentru autentificare si inregistrare.
- Panou de administrator pentru adaugare, gestionare cafenele si moderare recenzii.
- Interfata responsive construita cu Tailwind CSS prin CDN.

## Structura proiectului

```text
CafeSpot/
+-- index.html      # Pagina principala si harta cafenelelor
+-- detalii.html    # Detalii cafenea, recenzii si favorite
+-- login.html      # Formular de autentificare
+-- register.html   # Formular de inregistrare
+-- admin.html      # Panou administrator
+-- README.md
```

## Tehnologii

- HTML5
- Tailwind CSS CDN
- Leaflet
- OpenStreetMap

## Rulare locala

Proiectul nu necesita build sau instalare de dependinte. Deschide direct fisierul `index.html` in browser.

Pentru o experienta mai apropiata de productie, poti porni un server local simplu:

```bash
python -m http.server 8000
```

Apoi acceseaza:

```text
http://localhost:8000
```

## Pagini disponibile

| Pagina | Descriere |
| --- | --- |
| `index.html` | Cautare, lista cafenele si harta interactiva |
| `detalii.html` | Informatii despre cafenea si recenzii |
| `login.html` | Autentificare utilizator |
| `register.html` | Creare cont utilizator |
| `admin.html` | Administrare cafenele si moderare |

## Directii de dezvoltare

- Conectarea formularelor la un backend.
- Salvarea cafenelelor si recenziilor intr-o baza de date.
- Cautare functionala dupa nume si locatie.
- Autentificare reala pentru utilizatori si administratori.
- Incarcare imagini pentru cafenele.
- Filtrare dupa rating, program si facilitati.

## Autor

Proiect realizat pentru tema CafeSpot.
