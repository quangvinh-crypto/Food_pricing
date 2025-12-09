const express = require("express");
const app = express();
const PORT = 5000;

// Middleware để parse JSON
app.use(express.json());

// Route test
app.get("/", (req, res) => {
    res.json({ message: "Backend running 🚀" });
});

// Ví dụ API test
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from API" });
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});