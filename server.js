import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";  

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); 

// Connexió MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error de connexió:", err);
  } else {
    console.log("OK Connectat a MySQL!");
  }
});

// Endpoint simple
app.get("/", (req, res) => {
  res.json({ message: "API CASTELLET connexió OK!" });
});

//  obtenir tots els jugadors
app.get("/jugadors", (req, res) => {
  db.query("SELECT * FROM jugadors", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});



// Afegir un nou jugador (grup)
app.post("/jugadors", (req, res) => {
  const {
    numeroPartida = 0,
    nomGrup,
    numeroClaus = 0,
    guanyador = 0,
    dataPartida,
    darreraConnexio,
    darreraPosicioX = 0,
    darreraPosicioY = 0,
  } = req.body;

  // Validem que tingui almenys el nom del grup
  if (!nomGrup) {
    return res.status(400).json({ error: "Falta el camp 'nomGrup'" });
  }

  //  1. Comprovem si ja existeix un jugador amb el mateix nom dins la mateixa partida
  const checkSql = `SELECT idGrup FROM jugadors WHERE numeroPartida = ? AND nomGrup = ?`;
  db.query(checkSql, [numeroPartida, nomGrup], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      // Si ja existeix, retornem error
      return res.status(400).json({
        error: "Ja existeix un jugador amb aquest nom en aquesta partida.",
        idGrup: result[0].idGrup,
      });
    }

    // 2. Si no existeix, el podem inserir
    const insertSql = `
      INSERT INTO jugadors (
        numeroPartida, nomGrup, numeroClaus, guanyador,
        dataPartida, darreraConnexio, darreraPosicioX, darreraPosicioY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        numeroPartida,
        nomGrup,
        numeroClaus,
        guanyador,
        dataPartida,
        darreraConnexio,
        darreraPosicioX,
        darreraPosicioY,
      ],
      (err2, result2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        // Retornem informació completa del nou jugador
        res.status(201).json({
          message: "Jugador afegit correctament!",
          idGrup: result2.insertId,
          numeroPartida,
          nomGrup,
        });
      }
    );
  });
});

// Actualitzar dades d'un jugador (per exemple, numeroClaus)
app.put("/jugadors/:idGrup", (req, res) => {
  const { idGrup } = req.params;
  const { numeroClaus, guanyador, darreraConnexio, darreraPosicioX, darreraPosicioY } = req.body;

  // Comprovem que hi ha algun camp per modificar
  if (
    numeroClaus === undefined &&
    guanyador === undefined &&
    darreraConnexio === undefined &&
    darreraPosicioX === undefined &&
    darreraPosicioY === undefined
  ) {
    return res.status(400).json({ error: "No hi ha cap camp per actualitzar" });
  }

  // Construïm la consulta dinàmicament segons els camps rebuts
  const camps = [];
  const valors = [];

  if (numeroClaus !== undefined) {
    camps.push("numeroClaus = ?");
    valors.push(numeroClaus);
  }
  if (guanyador !== undefined) {
    camps.push("guanyador = ?");
    valors.push(guanyador);
  }
  if (darreraConnexio !== undefined) {
    camps.push("darreraConnexio = ?");
    valors.push(darreraConnexio);
  }
  if (darreraPosicioX !== undefined) {
    camps.push("darreraPosicioX = ?");
    valors.push(darreraPosicioX);
  }
  if (darreraPosicioY !== undefined) {
    camps.push("darreraPosicioY = ?");
    valors.push(darreraPosicioY);
  }

  const sql = `UPDATE jugadors SET ${camps.join(", ")} WHERE idGrup = ?`;
  valors.push(idGrup);

  db.query(sql, valors, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Jugador no trobat" });
    res.json({ message: "Jugador actualitzat correctament!" });
  });
});


// Endpoint per crear una nova partida
app.get("/novapartida", (req, res) => {
  // 1. Consultem el número actual
  db.query("SELECT numero FROM codiPartida LIMIT 1", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(500).json({ error: "No s'ha trobat cap registre a numerodepartida" });
    }

    const numeroActual = result[0].numero;
    const nouNumero = numeroActual + 1;

    // 2. Actualitzem el valor a la base de dades
    db.query("UPDATE codiPartida SET numero = ?", [nouNumero], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // 3. Retornem el nou número
      res.json({ codiPartida: nouNumero });
    });
  });
});

// Esborra tots els jugadors amb dataPartida anterior a una data donada
app.delete("/jugadors/antics", (req, res) => {
  // Pots passar una data al body o usar avui per defecte
  const { data } = req.body;
  const dataLimit = data || new Date().toISOString().slice(0, 10); // format YYYY-MM-DD

  const sql = `DELETE FROM jugadors WHERE DATE(dataPartida) < ?`;

  db.query(sql, [dataLimit], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      message: "Jugadors antics eliminats correctament.",
      dataLimit,
      eliminats: result.affectedRows
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escoltant al port ${PORT}`));