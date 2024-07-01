const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  connectionString: config.urlConnection,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect(err => {
  if (err) {
    return console.error('Não foi possível conectar ao banco.', err);
  }
  console.log('Conectado ao banco de dados.');
});

// Rota de verificação
app.get("/", (req, res) => {
  res.send("Ok – Servidor disponível.");
});

// Listar todos os usuários
app.get("/usuarios", (req, res) => {
  client.query("SELECT * FROM Usuarios", (err, result) => {
    if (err) {
      console.error("Erro ao executar a query de SELECT", err);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }
    res.json(result.rows);
  });
});

// Obter um usuário por ID
app.get("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  client.query("SELECT * FROM Usuarios WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("Erro ao executar a query de SELECT por ID", err);
      return res.status(500).json({ error: "Erro ao buscar usuário" });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(result.rows[0]);
  });
});

// Adicionar um novo usuário
app.post("/usuarios", (req, res) => {
  const { name, email, phone } = req.body;
  client.query(
    "INSERT INTO Usuarios (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
    [name, email, phone],
    (err, result) => {
      if (err) {
        console.error("Erro ao executar a query de INSERT", err);
        return res.status(500).json({ error: "Erro ao adicionar usuário" });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

// Atualizar um usuário
app.put("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  const { name, email, phone } = req.body;
  client.query(
    "UPDATE Usuarios SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *",
    [name, email, phone, id],
    (err, result) => {
      if (err) {
        console.error("Erro ao executar a query de UPDATE", err);
        return res.status(500).json({ error: "Erro ao atualizar usuário" });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json(result.rows[0]);
    }
  );
});

// Excluir um usuário
app.delete("/usuarios/:id", (req, res) => {
  const id = req.params.id;
  client.query("DELETE FROM Usuarios WHERE id = $1 RETURNING *", [id], (err, result) => {
    if (err) {
      console.error("Erro ao executar a query de DELETE", err);
      return res.status(500).json({ error: "Erro ao excluir usuário" });
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(200).json({ message: `Usuário com ID ${id} excluído com sucesso.` });
  });
});

app.listen(config.port, () => {
  console.log(`Servidor funcionando na porta ${config.port}`);
});

module.exports = app;
