import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { initialSeedData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// --------------------------------------------------
// EMBEDDED DATABASE
// --------------------------------------------------

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class EmbeddedMongoStore {
  constructor() {
    this.data = {};
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.warn(
        '⚠️ Initializing embedded database with seed data:',
        err.message
      );

      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.data = JSON.parse(
      JSON.stringify(initialSeedData)
    );

    this.persist();
  }

  persist() {
    try {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(this.data, null, 2),
        'utf8'
      );
    } catch (err) {
      console.error(
        '❌ Failed to persist embedded database:',
        err.message
      );
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }

    return {
      find: (query = {}) => {
        let results = this.data[name].filter(
          item => this.matchQuery(item, query)
        );

        return {
          sort: (sortObj = {}) => {
            const key = Object.keys(sortObj)[0];

            if (key) {
              const order =
                sortObj[key] === -1 ? -1 : 1;

              results.sort((a, b) => {
                const valA = a[key];
                const valB = b[key];

                if (valA < valB) {
                  return -1 * order;
                }

                if (valA > valB) {
                  return 1 * order;
                }

                return 0;
              });
            }

            return results;
          },

          toArray: () => results,

          exec: () => results
        };
      },

      findOne: (query = {}) => {
        return (
          this.data[name].find(
            item => this.matchQuery(item, query)
          ) || null
        );
      },

      findById: id => {
        return (
          this.data[name].find(
            item =>
              item._id === id ||
              item.id === id
          ) || null
        );
      },

      create: doc => {
        const newDoc = {
          _id:
            doc._id ||
            'doc_' +
              Math.random()
                .toString(36)
                .substr(2, 9) +
              Date.now(),

          ...doc,

          createdAt:
            doc.createdAt ||
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString()
        };

        this.data[name].push(newDoc);

        this.persist();

        return newDoc;
      },

      insertOne: doc => {
        return this.getCollection(name).create(doc);
      },

      insertMany: docs => {
        return docs.map(doc =>
          this.getCollection(name).create(doc)
        );
      },

      findByIdAndUpdate: (
        id,
        update,
        options = { new: true }
      ) => {
        const index =
          this.data[name].findIndex(
            item =>
              item._id === id ||
              item.id === id
          );

        if (index === -1) {
          return null;
        }

        const current =
          this.data[name][index];

        const updateFields = update.$set
          ? { ...update.$set }
          : { ...update };

        delete updateFields.$set;

        const updated = {
          ...current,
          ...updateFields,
          updatedAt:
            new Date().toISOString()
        };

        this.data[name][index] = updated;

        this.persist();

        return updated;
      },

      updateOne: (query, update) => {
        const item =
          this.getCollection(name).findOne(query);

        if (!item) {
          return {
            matchedCount: 0,
            modifiedCount: 0
          };
        }

        this.getCollection(name)
          .findByIdAndUpdate(
            item._id,
            update
          );

        return {
          matchedCount: 1,
          modifiedCount: 1
        };
      },

      deleteOne: query => {
        const index =
          this.data[name].findIndex(
            item =>
              this.matchQuery(item, query)
          );

        if (index === -1) {
          return {
            deletedCount: 0
          };
        }

        this.data[name].splice(index, 1);

        this.persist();

        return {
          deletedCount: 1
        };
      },

      countDocuments: (query = {}) => {
        return this.data[name].filter(
          item =>
            this.matchQuery(item, query)
        ).length;
      }
    };
  }

  matchQuery(item, query) {
    if (
      !query ||
      Object.keys(query).length === 0
    ) {
      return true;
    }

    for (const key of Object.keys(query)) {
      const qVal = query[key];
      const iVal = item[key];

      if (
        qVal &&
        typeof qVal === 'object' &&
        !Array.isArray(qVal)
      ) {
        if ('$in' in qVal) {
          if (
            !Array.isArray(qVal.$in) ||
            !qVal.$in.includes(iVal)
          ) {
            return false;
          }
        }

        else if ('$ne' in qVal) {
          if (iVal === qVal.$ne) {
            return false;
          }
        }

        else if ('$regex' in qVal) {
          const regex = new RegExp(
            qVal.$regex,
            qVal.$options || 'i'
          );

          if (
            !regex.test(
              String(iVal || '')
            )
          ) {
            return false;
          }
        }
      }

      else {
        if (iVal !== qVal) {
          return false;
        }
      }
    }

    return true;
  }
}

// Create embedded store
export const embeddedDB =
  new EmbeddedMongoStore();


// --------------------------------------------------
// MONGODB ATLAS CONNECTION
// --------------------------------------------------

let isConnectedToRealMongo = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Check whether MongoDB URI exists
  if (!uri) {
    console.error('');
    console.error(
      '❌ MONGODB_URI is missing!'
    );
    console.error(
      '❌ Add MONGODB_URI to your .env file.'
    );
    console.error('');

    throw new Error(
      'MONGODB_URI is not defined'
    );
  }

  try {
    console.log(
      '🔄 Connecting to MongoDB Atlas...'
    );

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });

    isConnectedToRealMongo = true;

    console.log('');
    console.log(
      '✅ MongoDB Atlas connected successfully!'
    );

    console.log(
      `📦 Database: ${mongoose.connection.name}`
    );

    console.log(
      `🌐 Host: ${mongoose.connection.host}`
    );

    console.log('');
  }

  catch (error) {
    isConnectedToRealMongo = false;

    console.error('');
    console.error(
      '❌ MongoDB Atlas connection failed!'
    );

    console.error(
      'Reason:',
      error.message
    );

    console.error('');

    throw error;
  }
}


// --------------------------------------------------
// DATABASE HELPERS
// --------------------------------------------------

export function getDB() {
  return embeddedDB;
}

export function isRealMongo() {
  return isConnectedToRealMongo;
}