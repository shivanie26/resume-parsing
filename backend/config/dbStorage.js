const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Embedded fallback JSON storage location
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isMongoConnected = false;

const initDb = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_resume_db';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(' MongoDB connected successfully.');
  } catch (err) {
    isMongoConnected = false;
    console.warn('⚠️  MongoDB connection failed or unavailable. Falling back to High-Performance Embedded Datastore.');
  }
};

// Generic JSON file reader/writer for embedded mode
const getCollectionFile = (colName) => path.join(DATA_DIR, `${colName}.json`);

const readCollection = (colName) => {
  const filePath = getCollectionFile(colName);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
};

const writeCollection = (colName, data) => {
  const filePath = getCollectionFile(colName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const dbStorage = {
  isMongo: () => isMongoConnected,
  
  // Generic collection helper methods
  async find(collectionName, query = {}) {
    const items = readCollection(collectionName);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  async findOne(collectionName, query = {}) {
    const items = await this.find(collectionName, query);
    return items[0] || null;
  },

  async findById(collectionName, id) {
    const items = readCollection(collectionName);
    return items.find(item => item._id === id || item.id === id) || null;
  },

  async insert(collectionName, doc) {
    const items = readCollection(collectionName);
    const newDoc = {
      _id: doc._id || generateId(),
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString()
    };
    items.push(newDoc);
    writeCollection(collectionName, items);
    return newDoc;
  },

  async updateById(collectionName, id, updates) {
    const items = readCollection(collectionName);
    const index = items.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    writeCollection(collectionName, items);
    return items[index];
  },

  async deleteById(collectionName, id) {
    let items = readCollection(collectionName);
    const initialLen = items.length;
    items = items.filter(item => item._id !== id && item.id !== id);
    writeCollection(collectionName, items);
    return items.length < initialLen;
  },

  async clearCollection(collectionName) {
    writeCollection(collectionName, []);
  }
};

module.exports = { initDb, dbStorage };
