const express = require("express");
const crypto = require("crypto");
const cors = require("cors"); // 🟢 Importa o CORS

const app = express();
app.use(express.json());
app.use(cors()); // 🟢 Habilita CORS para todas as origens

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = crypto.createHash("sha256").update("C@mp1nas3i6805").digest();
const IV_LENGTH = 16;

// 🔐 Função para Criptografar
function encryptAES(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, "utf-8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
}

// 🔓 Função para Descriptografar
function decryptAES(encryptedText) {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(iv, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;
}

// 🔹 Endpoint para Criptografar
app.post("/encrypt", (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ error: "O campo 'text' é obrigatório!" });
    }
    const encryptedText = encryptAES(req.body.text);
    res.json({ encrypted: encryptedText });
});

// 🔹 Endpoint para Descriptografar
app.post("/decrypt", (req, res) => {
    if (!req.body.encrypted) {
        return res.status(400).json({ error: "O campo 'encrypted' é obrigatório!" });
    }
    try {
        const decryptedText = decryptAES(req.body.encrypted);
        res.json({ decrypted: decryptedText });
    } catch (error) {
        res.status(400).json({ error: "Falha na descriptografia!" });
    }
});

// 🔥 Iniciar Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

