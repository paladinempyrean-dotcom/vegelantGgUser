const express = require("express");
const app = express();

app.use(express.json());

let keys = {};

function generateKey() {
  const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${part()}-${part()}-${part()}`;
}

app.get("/", (req, res) => {
  res.send("Key System Online");
});

app.get("/admin", (req, res) => {
  res.send(`
    <html>
    <body style="font-family:Arial;text-align:center;margin-top:50px;">
      <h2>🔑 Key Admin Panel</h2>
      <input id="expiry" placeholder="YYYY-MM-DD (optional)" />
      <br><br>
      <button onclick="doGenerate()">Generate Key</button>
      <h3 id="result"></h3>
      <button id="copyBtn" style="display:none" onclick="copyKey()">📋 Copy Key</button>
      <hr/>
      <button onclick="listKeys()">List All Keys</button>
      <pre id="keyList"></pre>
      <script>
        let lastKey = "";
        async function doGenerate() {
          const expiry = document.getElementById("expiry").value.trim();
          const res = await fetch("/generate-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expires: expiry || null })
          });
          const data = await res.json();
          lastKey = data.key;
          document.getElementById("result").innerText = "KEY: " + data.key;
          document.getElementById("copyBtn").style.display = "inline";
        }
        function copyKey() {
          navigator.clipboard.writeText(lastKey);
          alert("Copied: " + lastKey);
        }
        async function listKeys() {
          const res = await fetch("/list-keys");
          const data = await res.json();
          document.getElementById("keyList").innerText = JSON.stringify(data, null, 2);
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/generate-key", (req, res) => {
  const key = generateKey();
  keys[key] = { expires: req.body.expires || null };
  console.log("Generated Key:", key);
  res.json({ success: true, key });
});

// ✅ Accepts both GET and POST
app.all("/check-key", (req, res) => {
  const key = ((req.body && req.body.key) || req.query.key || "").trim().toUpperCase();
  console.log("Checking Key:", key);

  const data = keys[key];

  if (!data) {
    return res.json({ valid: false, message: "Invalid key" });
  }

  if (data.expires) {
    const now = new Date();
    const exp = new Date(data.expires);
    if (now > exp) {
      return res.json({ valid: false, message: "Key expired" });
    }
  }

  res.json({ valid: true, message: "Access granted" });
});

app.get("/list-keys", (req, res) => {
  res.json(keys);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Key system running on port", PORT));
