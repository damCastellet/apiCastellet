# API CASTELLET – Documentació

## Índex
* [Descripció general](#descripcio-general)
* [Iniciar API en node.js](#iniciar-api-en-nodejs)
* [Home](#home)
* [Obtenir tots els jugadors](#obtenir-tots-els-jugadors)
* [Afegir un nou jugador](#afegir-un-nou-jugador)
* [Actualitzar un jugador](#actualitzar-un-jugador)
* [Crear nova partida](#crear-nova-partida)
* [Esborrar jugadors antics](#esborrar-jugadors-antics)

---
## Descripció general

Aquesta API permet gestionar els grups d’una partida, emmagatzemats en una base de dades MySQL.
Ofereix endpoints per consultar, afegir i actualitzar la informació de cada jugador.
També un endpoint per a crear una nova partida i un endpoint per esborrar jugadors de partides anteriors

Recursos: Tot s’organitza com a recursos (per exemple: jugadors, partides). Cada recurs té una URL única.

Aquesta API-REST utilitza verbs HTTP per interactuar amb els recursos:

| Verb HTTP | Operació              | Exemple                             |
|-----------|----------------------|-------------------------------------|
| GET       | Llegir dades          | `/jugadors` → retorna tots els jugadors |
| POST      | Crear un nou recurs   | `/jugadors` → afegeix un jugador        |
| PUT       | Actualitzar un recurs | `/jugadors/2` → actualitza el jugador amb id 2 |
| DELETE    | Esborrar un recurs    | `/jugadors/antics` → esborra jugadors antics |

Base URL: `http://localhost:3000`

Base de dades:
```sql
CREATE TABLE jugadors (
  idGrup INT AUTO_INCREMENT PRIMARY KEY,
  numeroPartida INT DEFAULT 0,
  nomGrup VARCHAR(50) NOT NULL,
  numeroClaus INT DEFAULT 0,
  guanyador INT DEFAULT 0,
  dataPartida DATETIME,
  darreraConnexio DATETIME,
  darreraPosicioX DOUBLE DEFAULT 0,
  darreraPosicioY DOUBLE DEFAULT 0
);

CREATE TABLE codiPartida (
    numero INT NOT NULL
);
```
## Iniciar API en node.js

Per a iniciar la API ens cal un arxiu .env a l'arrel del directori amb els valors:
```txt
DB_HOST=exemple.com
DB_USER=unusuari_usercastellet
DB_PASS=password1234
DB_NAME=basededades_pcastellet
PORT=3306
```

Per a iniciar la API en node.js ens calen les següents comandes:
```bash
npm install
npm install cors
node server.js
```

## Home

**Endpoint:** `GET /`
**Descripció:** Comprova que l’API està activa.

**Resposta:**

```json
{ "message": "API CASTELLET connexió OK!" }
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## Obtenir tots els jugadors

**Endpoint:** `GET /jugadors`
**Descripció:** Retorna tots els jugadors de la base de dades.

**Resposta exemple:**

```json
[
  {
    "idGrup": 1,
    "numeroPartida": 1,
    "nomGrup": "Equip1",
    "numeroClaus": 3,
    "guanyador": 0,
    "dataPartida": "2025-10-18",
    "darreraConnexio": "2025-10-18T10:00:00",
    "darreraPosicioX": 0,
    "darreraPosicioY": 0
  }
]
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/jugadors")
  .then(res => res.json())
  .then(jugadors => console.log(jugadors))
  .catch(err => console.error(err));
```

---

## Afegir un nou jugador

**Endpoint:** `POST /jugadors`
**Descripció:** Crea un nou jugador.

**Body exemple:**

```json
{
  "numeroPartida": 1,
  "nomGrup": "Equip2",
  "numeroClaus": 0,
  "guanyador": 0,
  "dataPartida": "2025-10-18",
  "darreraConnexio": "2025-10-18T10:00:00",
  "darreraPosicioX": 0,
  "darreraPosicioY": 0
}
```

**Resposta exemple:**

```json
{
  "message": "Jugador afegit correctament!",
  "idGrup": 2,
  "numeroPartida": 1,
  "nomGrup": "Equip2"
}
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/jugadors", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    numeroPartida: 1,
    nomGrup: "Equip2",
    numeroClaus: 0,
    guanyador: 0,
    dataPartida: "2025-10-18",
    darreraConnexio: "2025-10-18T10:00:00",
    darreraPosicioX: 0,
    darreraPosicioY: 0
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## Actualitzar un jugador

**Endpoint:** `PUT /jugadors/:idGrup`
**Descripció:** Actualitza dades d’un jugador.
**Paràmetre URL:** `idGrup` → ID del jugador a actualitzar

**Body exemple (actualitzar claus i guanyador):**

```json
{
  "numeroClaus": 5,
  "guanyador": 1
}
```

**Resposta exemple:**

```json
{ "message": "Jugador actualitzat correctament!" }
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/jugadors/2", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ numeroClaus: 5, guanyador: 1 })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## Crear nova partida

**Endpoint:** `GET /novapartida`
**Descripció:** Retorna un nou número de partida incrementant el codi actual.

**Resposta exemple:**

```json
{ "codiPartida": 2 }
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/novapartida")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

## Esborrar jugadors antics

**Endpoint:** `DELETE /jugadors/antics`
**Descripció:** Esborra jugadors amb `dataPartida` anterior a la data indicada.
**Body (opcional, si no es passa s’utilitza la data d’avui):**

```json
{ "data": "2025-10-01" }
```

**Resposta exemple:**

```json
{
  "message": "Jugadors antics eliminats correctament.",
  "dataLimit": "2025-10-01",
  "eliminats": 3
}
```

**Exemple en JavaScript:**

```javascript
fetch("http://localhost:3000/jugadors/antics", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "2025-10-01" })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```
