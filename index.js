// Adiciona a dependência express-validator para validações
const { body, validationResult } = require('express-validator');

// Rota para verificar se o usuário está ativo
app.get("/usuarios/verify", (req, res) => {
  const email = req.query.email;
  client.query("SELECT * FROM Usuarios WHERE email = $1", [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar usuário' });
    }
    if (result.rows.length > 0) {
      res.json({ status: 'ativo' });
    } else {
      res.json({ status: 'inativo' });
    }
  });
});

// Rota para cadastrar novo usuário com validação
app.post("/usuarios", [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nome, email, telefone } = req.body;
  client.query(
    "INSERT INTO Usuarios (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *",
    [nome, email, telefone],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
      }
      res.status(201).json(result.rows[0]);
    }
  );
});

// Rota para editar usuário
app.put("/usuarios/:id", [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nome, email, telefone } = req.body;
  client.query(
    "UPDATE Usuarios SET nome=$1, email=$2, telefone=$3 WHERE id=$4 RETURNING *",
    [nome, email, telefone, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
      }
      res.status(200).json(result.rows[0]);
    }
  );
});

// Rota para excluir usuário
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  client.query("DELETE FROM Usuarios WHERE id=$1 RETURNING *", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Usuário não encontrado' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  });
});
