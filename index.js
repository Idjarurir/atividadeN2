const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;

var client = new Client(conString);

client.connect((err) => {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err);
  }
  client.query('SELECT NOW()', (err, result) => {
    if (err) {
      return console.error('Erro ao executar a query.', err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  res.send("Ok – Servidor disponível.");
});

app.get("/usuarios", (req, res) => {
  client.query("SELECT * FROM Usuarios", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
  });
});

app.get("/usuarios/:email", (req, res) => {
  const email = req.params.email;
  client.query("SELECT * FROM Usuarios WHERE email = $1", [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows);
  });
});

app.post("/usuarios", (req, res) => {
  const { nome, email, telefone } = req.body;
  client.query("INSERT INTO Usuarios (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *", [nome, email, telefone], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(result.rows[0]);
  });
});

app.put("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  const { nome, email, telefone } = req.body;
  client.query("UPDATE Usuarios SET nome=$1, email=$2, telefone=$3 WHERE id=$4 RETURNING *", [nome, email, telefone, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result.rows[0]);
  });
});

app.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  client.query("DELETE FROM Usuarios WHERE id=$1 RETURNING *", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Registro não encontrado." });
    }
    res.json(result.rows[0]);
  });
});

app.listen(config.port, () => {
  console.log(`Servidor funcionando na porta ${config.port}`);
});

module.exports = app;
