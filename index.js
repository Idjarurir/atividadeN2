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

var client = new Client({
  connectionString: conString,
  ssl: {
    rejectUnauthorized: false
  }
});

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
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});

app.get("/usuarios/:email", (req, res) => {
  console.log("Rota: usuarios/" + req.params.email);
  const start = Date.now();

  client.query("SELECT * FROM Usuarios WHERE email = $1", [req.params.email], (err, result) => {
    const duration = Date.now() - start;
    console.log("Query executada em:", duration, "ms");

    if (err) {
      console.error("Erro ao executar a query de SELECT email", err);
      res.status(500).send("Erro no servidor");
    } else {
      res.send(result.rows);
    }
  });
});

app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;
