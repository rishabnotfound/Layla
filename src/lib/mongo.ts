import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

const dbName = process.env.MONGODB_DB || "Layla";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoIndexed: boolean | undefined;
}

const client = global._mongoClient ?? new MongoClient(uri);
if (!global._mongoClient) global._mongoClient = client;

let dbPromise: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = client.connect().then(async (c) => {
      const db = c.db(dbName);
      if (!global._mongoIndexed) {
        await Promise.all([
          db.collection("users").createIndex({ codeHash: 1 }, { unique: true }),
          db.collection("sites").createIndex({ userId: 1 }),
          db.collection("sites").createIndex({ siteId: 1 }, { unique: true }),
          db.collection("subscribers").createIndex({ siteId: 1 }),
          db.collection("subscribers").createIndex(
            { siteId: 1, endpoint: 1 },
            { unique: true }
          ),
          db.collection("notifications").createIndex({ siteId: 1, sentAt: -1 }),
          db.collection("login_attempts").createIndex({ ip: 1 }),
          db.collection("login_attempts").createIndex(
            { at: 1 },
            { expireAfterSeconds: 900 }
          ),
          db.collection("rate_hits").createIndex({ key: 1, at: 1 }),
          db.collection("rate_hits").createIndex(
            { at: 1 },
            { expireAfterSeconds: 3600 }
          ),
        ]);
        global._mongoIndexed = true;
      }
      return db;
    });
  }
  return dbPromise;
}
