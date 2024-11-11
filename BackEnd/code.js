// Импорт на зависимостите
const express = require("express");
const mysql = require("mysql");
const path = require("path");

// Инициализация на Express приложението
const app = express();

// Настройки за статични файлове и JSON
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Свързване към MySQL
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", 
    database: "shorturls"
});

con.connect(error => {
    if (error) {
        console.error("Неуспешно свързване към базата данни:", error);
        return;
    }
    console.log("Успешно свързване към MySQL.");
});

// Рут за началната страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API за създаване на кратък URL
app.post("/api/create-short-url", (req, res) => {
    const { longurl, length, maxUses } = req.body;

    const uniqueID = Math.random().toString(36).substr(2, length);
    const sql = `INSERT INTO links (longurl, shorturlid, max_uses) VALUES (?, ?, ?)`;

    con.query(sql, [longurl, uniqueID, maxUses || 5], (error, result) => {
        if (error) {
            console.error("Грешка при запис в базата данни:", error);
            return res.status(500).json({ status: "notok", message: "Възникна грешка" });
        }
        res.json({ status: "ok", shorturlid: uniqueID });
    });
});

// API за получаване на всички URL адреси
app.get("/api/get-all-short-urls", (req, res) => {
    const sql = "SELECT * FROM links";
    con.query(sql, (error, results) => {
        if (error) {
            console.error("Грешка при получаване на данни от базата данни:", error);
            return res.status(500).json({ status: "notok", message: "Възникна грешка" });
        }
        res.json(results);
    });
});

// Пренасочване към дългия URL при достъп до кратък URL
app.get("/:shorturlid", (req, res) => {
    const shorturlid = req.params.shorturlid;
    const sql = `SELECT * FROM links WHERE shorturlid = ? LIMIT 1`;

    con.query(sql, [shorturlid], (error, results) => {
        if (error || results.length === 0) {
            return res.status(404).json({ status: "notok", message: "URL не е намерен" });
        }
        
        const { longurl, count, max_uses } = results[0];
        
        // Проверка за валидност на URL (използвания или срок)
        if (count >= max_uses) {
            return res.status(403).json({ status: "expired", message: "URL е изчерпан" });
        }
        
        // Пренасочване към дългия URL
        con.query(`UPDATE links SET count = count + 1 WHERE shorturlid = ?`, [shorturlid]);
        res.redirect(longurl);
    });
});

// Стартиране на сървъра
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сървърът е стартиран на порт ${PORT}`));



