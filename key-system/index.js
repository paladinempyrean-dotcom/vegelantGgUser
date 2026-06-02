const express = require("express");
const app = express();

app.use(express.json());

// temporary storage (resets if server restarts)
let keys = {};

// =====================
// 🔑 KEY GENERATOR
// =====================
function generateKey() {
  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${part()}-${part()}-${part()}`;
}

// =====================
// 🌐 ADMIN PANEL
// =====================
app.get("/admin", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Admin Panel</title>
      </head>

      <body style="font-family: Arial; text-align:center; margin-top:50px;">
        <h2>🔑 Key Admin Panel</h2>

        <input id="expiry" placeholder="YYYY-MM-DD (expiry date)" />

        <br><br>

        <button onclick="generateKey()">Generate Key</button>

        <h3 id="result"></h3>

        <script>
          async function generateKey() {
            const expiry = document.getElementById('expiry').value;

            const res = await fetch('/generate-key', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ expires: expiry || null })
            });

            const data = await res.json();

            document.getElementById('result').innerText =
              "KEY: " + data.key;
          }
        </script>

      </body>
    </html>
  `);
});

// =====================
// 🔑 GENERATE KEY API
// =====================
app.post("/generate-key", (req, res) => {
  const key = generateKey();

  keys[key] = {
    expires: req.body.expires || null
  };

  res.json({
    success: true,
    key: key
  });
});

// =====================
// 🔍 CHECK KEY API (WITH EXPIRY)
// =====================
app.post("/check-key", (req, res) => {
  const { key } = req.body;

  const data = keys[key];

  if (!data) {
    return res.json({
      valid: false,
      message: "Invalid key"
    });
  }

  // expiry check
  if (data.expires) {
    const now = new Date();
    const exp = new Date(data.expires);

    if (now > exp) {
      return res.json({
        valid: false,
        message: "Key expired"
      });
    }
  }

  res.json({
    valid: true,
    message: "Access granted"
  });
});

// =====================
// 🚀 START SERVER
// =====================
app.listen(3000, () => {
  console.log("Key system running on port 3000");
});
