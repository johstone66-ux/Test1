const express = require('express');
const { Pool } = require('pg');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
console.log('DATABASE_URL:', process.env.DATABASE_URL);


// Datenbankverbindung – Railway setzt DATABASE_URL automatisch
const pool = new Pool({
  connectionString: 'postgresql://postgres:fbZnjUXrXoPuMCjxtmimAymJmQfkuCRf@interchange.proxy.rlwy.net:43893/railway',
  ssl: { rejectUnauthorized: false }
});

// Tabelle erstellen falls sie noch nicht existiert
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS eintraege (
      id        SERIAL PRIMARY KEY,
      name      TEXT NOT NULL,
      email     TEXT NOT NULL,
      nachricht TEXT NOT NULL,
      erstellt  TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Datenbank bereit.');
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /absenden – Daten in DB speichern
app.post('/absenden', async (req, res) => {
  const { name, email, nachricht } = req.body;

  if (!name || !email || !nachricht) {
    return res.status(400).json({ fehler: 'Alle Felder sind erforderlich.' });
  }

  try {
    await pool.query(
      'INSERT INTO eintraege (name, email, nachricht) VALUES ($1, $2, $3)',
      [name, email, nachricht]
    );
    console.log(`Eintrag gespeichert: ${name} <${email}>`);
    res.json({ erfolg: true });
  } catch (err) {
    console.error('Datenbankfehler:', err);
    res.status(500).json({ fehler: 'Konnte nicht gespeichert werden.' });
  }
});

// GET /daten – alle Einträge abrufen (zum Kontrollieren)
app.get('/daten', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM eintraege ORDER BY erstellt DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ fehler: 'Datenbankfehler.' });
  }
});

// Server starten
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
});