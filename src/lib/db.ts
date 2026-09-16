import Dexie, { type Table } from 'dexie';
import { Agency, Client, Project, Transaction, Setting } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class MoneyTrackerDB extends Dexie {
  agencies!: Table<Agency, string>;
  clients!: Table<Client, string>;
  projects!: Table<Project, string>;
  transactions!: Table<Transaction, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MoneyTrackerDB');
    this.version(2).stores({
      agencies: 'id, name',
      clients: 'id, agency_id, name',
      projects: 'id, client_id, name',
      transactions: 'id, project_id, type, transaction_date',
      settings: 'id, key'
    });
  }
}

export const db = new MoneyTrackerDB();

// Helper to seed initial agencies if they don't exist
export async function initializeDb() {
  const count = await db.agencies.count();
  if (count === 0) {
    const now = new Date().toISOString();
    await db.agencies.bulkAdd([
      { id: uuidv4(), name: 'Development', created_at: now },
      { id: uuidv4(), name: 'Marketing', created_at: now }
    ]);
  }
}

// Ensure the db is initialized
if (typeof window !== 'undefined') {
  initializeDb();
}
