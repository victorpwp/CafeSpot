# CafeSpot

CafeSpot este o aplicatie web full-stack pentru descoperirea cafenelelor din Bucuresti. Utilizatorii pot cauta cafenele, le pot vedea pe harta, pot citi detalii si recenzii, pot lasa propriile opinii dupa autentificare si pot salva locurile preferate. Administratorul poate gestiona cafenelele si poate modera recenziile direct dintr-un panou dedicat.

Proiectul este containerizat cu Docker, astfel incat aplicatia, baza de date MongoDB si interfata Mongo Express pornesc impreuna, fara instalari suplimentare de Node.js sau MongoDB pe sistemul gazda.

## Functionalitati principale

| Rol | Functionalitati |
|---|---|
| Vizitator | Vizualizare cafenele, harta interactiva, cautare dupa nume sau locatie, detalii cafenea, recenzii publice |
| Utilizator autentificat | Adaugare recenzie cu rating, salvare cafenea la favorite, vizualizare si eliminare favorite |
| Administrator | Adaugare, editare si stergere cafenele, setare URL fotografie, moderare recenzii prin aprobare, editare sau stergere |

## Use case-uri acoperite

| Use case | Status | Implementare |
|---|---|---|
| UC1 - Inregistrare utilizator | Implementat | Formular + API `/api/register` |
| UC2 - Autentificare utilizator | Implementat | Formular + JWT prin `/api/login` |
| UC3 - Cautare cafenea | Implementat | Cautare prin API cu `?search=`, lista si harta Leaflet |
| UC4 - Lasare recenzie | Implementat | Doar utilizatori autentificati, rating 1-5 si comentariu |
| UC5 - Vizualizare detalii cafenea | Implementat | Pagina detalii cu locatie, program, descriere, rating mediu si recenzii |
| UC6 - Favorite | Implementat | Salvare, listare si eliminare favorite cu token JWT |
| UC7 - Adaugare cafenea | Implementat | Panou admin + ruta protejata |
| UC8 - Editare cafenea | Implementat | Panou admin + ruta protejata |
| UC9 - Stergere cafenea | Implementat | Confirmare in UI + ruta protejata |
| UC10 - Moderare recenzii | Implementat | Lista recenzii reale, aprobare, editare si stergere |

## Tehnologii

| Zona | Tehnologii |
|---|---|
| Frontend | HTML5, CSS3, JavaScript vanilla, Tailwind CDN, Leaflet |
| Backend | Node.js, Express.js |
| Baza de date | MongoDB, Mongoose |
| Autentificare | JWT, bcryptjs |
| Infrastructura | Docker, Docker Compose |

## Arhitectura

```text
CafeSpot
├── models
│   ├── Cafe.js          # Schema cafenele + recenzii
│   └── User.js          # Schema utilizatori + favorite
├── middleware
│   └── authMiddleware.js # JWT si verificare rol admin
├── routes
│   ├── authRoutes.js    # Register, login, favorite
│   └── cafeRoutes.js    # Cafenele, cautare, recenzii, moderare
├── public
│   ├── index.html       # Homepage, lista cafenele, harta
│   ├── detalii.html     # Detalii si recenzii
│   ├── favorite.html    # Favorite utilizator
│   ├── admin.html       # Administrare cafenele si recenzii
│   ├── styles.css       # Tema, dark mode, layout
│   ├── theme.js         # Slider light/dark mode
│   └── favicon.svg      # Iconita browser
├── server.js
├── Dockerfile
└── docker-compose.yml
```

## Pornire rapida

### Cerinte

- Docker Desktop pornit
- Git, pentru clonare si versionare

### Rulare cu Docker

Din radacina proiectului:

```bash
docker compose up --build
```

Aplicatia va fi disponibila la:

- Aplicatie: [http://localhost:5000](http://localhost:5000)
- Mongo Express: [http://localhost:8081](http://localhost:8081)

Pentru oprire:

```bash
docker compose down
```

## Baza de date si conturi

Datele sunt persistate intr-un volum Docker numit `mongo-data`.

Pentru administrarea bazei de date se poate folosi Mongo Express:

```text
URL: http://localhost:8081
Username: admin
Password: pass
```

Pentru a transforma un utilizator in administrator:

1. Creeaza cont din aplicatie.
2. Deschide Mongo Express.
3. Intra in baza `cafespot`, colectia `users`.
4. Editeaza documentul utilizatorului.
5. Schimba campul `rol` din `utilizator` in `admin`.
6. Delogheaza-te si autentifica-te din nou in aplicatie.

## Fluxuri de testare recomandate

### Vizitator

1. Deschide homepage-ul.
2. Cauta o cafenea dupa nume, de exemplu `Miez`.
3. Verifica markerul de pe harta.
4. Apasa pe `Vezi detalii`.
5. Verifica descrierea, programul, preturile, ratingul mediu si recenziile.

### Utilizator autentificat

1. Creeaza cont.
2. Autentifica-te.
3. Deschide o cafenea.
4. Lasa o recenzie cu rating.
5. Salveaza cafeneaua la favorite.
6. Intra in pagina Favorite si elimina cafeneaua.

### Administrator

1. Seteaza rolul utilizatorului la `admin` in Mongo Express.
2. Autentifica-te din nou.
3. Deschide panoul Admin.
4. Adauga o cafenea noua cu nume, adresa, coordonate, descriere, program si optional URL fotografie.
5. Editeaza o cafenea existenta.
6. Sterge o cafenea de test.
7. In sectiunea Moderare Recenzii, editeaza sau sterge o recenzie.

## API principal

| Metoda | Endpoint | Rol | Descriere |
|---|---|---|---|
| POST | `/api/register` | Public | Creeaza cont |
| POST | `/api/login` | Public | Autentifica utilizator si returneaza JWT |
| GET | `/api/cafenele` | Public | Listeaza cafenele |
| GET | `/api/cafenele?search=text` | Public | Cauta cafenele dupa nume sau adresa |
| GET | `/api/cafenele/:id` | Public | Detalii cafenea |
| POST | `/api/cafenele/:id/recenzii` | Utilizator | Adauga recenzie |
| POST | `/api/favorite` | Utilizator | Adauga cafenea la favorite |
| GET | `/api/favorite` | Utilizator | Listeaza favorite |
| DELETE | `/api/favorite/:cafeId` | Utilizator | Elimina favorite |
| POST | `/api/cafenele` | Admin | Adauga cafenea |
| PUT | `/api/cafenele/:id` | Admin | Editeaza cafenea |
| DELETE | `/api/cafenele/:id` | Admin | Sterge cafenea |
| GET | `/api/cafenele/admin/recenzii` | Admin | Listeaza recenzii pentru moderare |
| PATCH | `/api/cafenele/:cafeId/recenzii/:recenzieId/aproba` | Admin | Aproba recenzie |
| PUT | `/api/cafenele/:cafeId/recenzii/:recenzieId` | Admin | Editeaza recenzie |
| DELETE | `/api/cafenele/:cafeId/recenzii/:recenzieId` | Admin | Sterge recenzie |

## Design si experienta

- Tema light/dark cu slider persistent in `localStorage`.
- Favicon personalizat pentru tab-ul browserului.
- Harta interactiva cu marker-e Leaflet.
- Carduri cu ilustratie CSS sau fotografie prin URL.
- Decor minimalist pe marginile paginii.
- Rating mediu calculat automat din recenziile aprobate.

## Observatii pentru prezentare

Aplicatia demonstreaza un flux complet pentru trei tipuri de utilizatori: vizitator, utilizator autentificat si administrator. Functionalitatile importante din documentatia de cerinte sunt implementate in cod si pot fi demonstrate local prin Docker.

Pentru un demo curat, recomand sa existe deja cateva cafenele si recenzii in baza de date inainte de prezentare.
