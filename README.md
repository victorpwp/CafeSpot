# ☕ CafeSpot

## Descrierea aplicației

**CafeSpot** este o aplicație web full-stack care permite utilizatorilor să descopere cafenele și să le salveze într-o listă de favorite. Aplicația include un sistem de autentificare securizat și un sistem de autorizare bazat pe roluri. Utilizatorii cu rol de **administrator** au acces la un panou dedicat prin care pot adăuga sau șterge locații din baza de date. Aplicația este complet containerizată pentru a asigura un mediu de rulare uniform pe orice mașină.

---

## Tehnologii folosite

| Categorie | Tehnologii |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Bază de date** | MongoDB (Mongoose ORM) |
| **Securitate** | JWT (JSON Web Tokens), bcryptjs |
| **Infrastructură** | Docker, Docker Compose |

---

## Configurare și Rulare

> **Notă:** Pentru a rula acest proiect nu este necesară instalarea Node.js sau MongoDB pe sistemul gazdă. Întregul mediu este gestionat prin Docker.

### 1. Instalare cerințe preliminare

Descărcați și instalați **Docker Desktop** de pe site-ul oficial:
 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Asigurați-vă că aplicația Docker Desktop este **pornită** înainte de a trece la pasul următor.

### 2. Pornirea aplicației

Deschideți un terminal în folderul rădăcină al proiectului și rulați:

```bash
docker-compose up --build
```

După finalizarea procesului de descărcare și construire a imaginilor, aplicația va fi disponibilă la:

 **[http://localhost:5000](http://localhost:5000)**

Pentru a opri aplicația, apăsați `Ctrl + C` în terminal, apoi rulați:

```bash
docker-compose down
```

### 3. Modificări de design (Frontend)

Fișierele de interfață (HTML, CSS, JavaScript pentru client) se află în folderul `/public`. Dacă doriți să faceți modificări de design, editați fișierele respective.

>  Deoarece codul este copiat în interiorul containerului la construire, pentru a vizualiza modificările va trebui să opriți aplicația și să rulați din nou `docker-compose up --build`.

---

##  Gestionarea Bazei de Date (Mongo-Express)

Proiectul include o interfață vizuală pentru administrarea bazei de date MongoDB — nu este necesară instalarea unor programe terțe precum MongoDB Compass.

1. Accesați în browser:  **[http://localhost:8081](http://localhost:8081)**
2. Introduceți credențialele implicite:
   - **Username:** `admin`
   - **Password:** `pass`
3. Pentru a acorda privilegii de **administrator** unui cont, navigați la:
   `cafespot` → colecția `users` → editați documentul utilizatorului → modificați câmpul `rol` în `"admin"`.

---

## Arhitectura containerelor

Aplicația rulează pe o arhitectură de tip microservicii, orchestrată prin `docker-compose.yml`, compusă din **3 containere distincte**:

### 1. `cafespot-app` — Containerul Node.js
- Folosește imaginea oficială `node:20` pentru compatibilitatea nativă a modulelor de securitate.
- Conține codul sursă al serverului Express și fișierele statice de frontend.
- Expune portul **5000** către host.
- Pornește doar după ce containerul de bază de date a trecut testul de sănătate (healthcheck).

### 2. `mongo-db` — Containerul MongoDB
- Folosește imaginea oficială `mongo:6.0`.
- Rulează izolat și reține datele în mod **persistent** folosind un volum Docker (`mongo-data`).
- Expune portul **27017** către host și rețeaua internă Docker.

### 3. `mongo-express` — Containerul Mongo-Express
- Oferă interfața grafică web de administrare a bazei de date.
- Se conectează la `mongo-db` prin rețeaua internă Docker.
- Expune portul **8081** către host.
