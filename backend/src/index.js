const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME     || 'taskflow_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
};

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      console.log('Connected to MySQL successfully');
      return pool;
    } catch (err) {
      console.log(`MySQL not ready, retrying ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Could not connect to MySQL after retries');
}

async function initDB(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      done       BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized');
}

let db;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '3.1.0', db: db ? 'connected' : 'disconnected' });
});

app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const [result] = await db.execute(
      'INSERT INTO tasks (title) VALUES (?)', [title]
    );
    const [rows] = await db.execute(
      'SELECT * FROM tasks WHERE id = ?', [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const { title, done } = req.body;
    await db.execute(
      'UPDATE tasks SET title = COALESCE(?, title), done = COALESCE(?, done) WHERE id = ?',
      [title ?? null, done ?? null, req.params.id]
    );
    const [rows] = await db.execute(
      'SELECT * FROM tasks WHERE id = ?', [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

(async () => {
  db = await connectWithRetry();
  await initDB(db);
  app.listen(PORT, () => {
    console.log(`TaskFlow API v3.1.0 running on port ${PORT}`);
  });
})();