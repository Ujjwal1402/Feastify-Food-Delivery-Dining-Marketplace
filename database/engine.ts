import fs from 'fs';
import path from 'path';
import { DatabaseSchema } from './schema';
import { INITIAL_SEED_DATA } from './seed';

const STORAGE_DIR = path.resolve(process.cwd(), 'database', 'storage');
const DB_FILE_PATH = path.join(STORAGE_DIR, 'feastify_db.json');

class DatabaseEngine {
  private state: DatabaseSchema;

  constructor() {
    this.state = this.initializeStorage();
  }

  private initializeStorage(): DatabaseSchema {
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.restaurants) && parsed.restaurants.length > 0) {
          return parsed;
        }
      }
      const initial = structuredClone(INITIAL_SEED_DATA);
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    } catch {
      return structuredClone(INITIAL_SEED_DATA);
    }
  }

  public read(): DatabaseSchema {
    return this.state;
  }

  public commit(): void {
    try {
      if (!fs.existsSync(STORAGE_DIR)) {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Database write warning:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.state = structuredClone(INITIAL_SEED_DATA);
    this.commit();
    return this.state;
  }
}

export const dbEngine = new DatabaseEngine();
