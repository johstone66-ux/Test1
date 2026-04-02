const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATEI = path.join(__dirname, 'daten.txt');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// POST /absenden – Daten empfangen und in daten.txt speichern
app.post('/absenden', (req, res) => {
  const { name, email, nachricht } = req.body;

  if (!name || !email || !nachricht) {
    return res.status(400).json({ fehler: 'Alle Felder sind erforderlich.' });
  }

  const zeitstempel = new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich' });
  const eintrag = [
    '─'.repeat(40),
    `Zeitpunkt : ${zeitstempel}`,
    `Name      : ${name}`,
    `E-Mail    : ${email}`,
    `Nachricht : ${nachricht}`,
    '',
  ].join('\n');

  fs.appendFile(DATEI, eintrag, 'utf8', (err) => {
    if (err) {
      console.error('Fehler beim Schreiben:', err);
      return res.status(500).json({ fehler: 'Konnte nicht gespeichert werden.' });
    }
    console.log(`[${zeitstempel}] Eintrag gespeichert: ${name} <${email}>`);
    res.json({ erfolg: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
