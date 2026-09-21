const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { MongoClient } = require("mongodb");

for (const f of [".env.local", ".env"]) {
  const p = path.resolve(process.cwd(), f);
  if (fs.existsSync(p)) require("dotenv").config({ path: p });
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "Layla";
const pepper = process.env.CODE_PEPPER || "layla-pepper";

if (!uri) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const lookup = process.argv[2];
if (!lookup) {
  console.error("usage: node scripts/reset-code.js <siteId | origin | userId>");
  process.exit(1);
}

function generateCode() {
  const digits = Array.from(crypto.randomBytes(16))
    .map((b) => (b % 10).toString())
    .join("");
  return digits.match(/.{4}/g).join("-");
}

function hashCode(code) {
  const digits = code.replace(/\D/g, "").slice(0, 16);
  return crypto.createHash("sha256").update(digits + ":" + pepper).digest("hex");
}

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  let user = await db.collection("users").findOne({ userId: lookup });
  if (!user) {
    const site = await db.collection("sites").findOne({
      $or: [{ siteId: lookup }, { origin: lookup }],
    });
    if (site) user = await db.collection("users").findOne({ userId: site.userId });
  }

  if (!user) {
    console.error("no user found for:", lookup);
    await client.close();
    process.exit(1);
  }

  const newCode = generateCode();
  const newHash = hashCode(newCode);

  await db.collection("users").updateOne(
    { userId: user.userId },
    { $set: { codeHash: newHash, codeResetAt: new Date() } },
  );

  console.log("");
  console.log("  userId:  " + user.userId);
  console.log("  newCode: " + newCode);
  console.log("");
  console.log("Send this to the user OUT OF BAND. Do not log or paste elsewhere.");

  await client.close();
})();
