import Dexie, { type Table } from 'dexie';
import { 
  Agency, Client, Project, Setting,
  ProjectPayment, Developer, ProjectDeveloper, DeveloperPayment,
  PersonalExpense, Loan, LoanPayment, User, MarketingPayment
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class MoneyTrackerDB extends Dexie {
  agencies!: Table<Agency, string>;
  clients!: Table<Client, string>;
  marketing_payments!: Table<MarketingPayment, string>;
  projects!: Table<Project, string>;
  project_payments!: Table<ProjectPayment, string>;
  developers!: Table<Developer, string>;
  project_developers!: Table<ProjectDeveloper, string>;
  developer_payments!: Table<DeveloperPayment, string>;
  personal_expenses!: Table<PersonalExpense, string>;
  loans!: Table<Loan, string>;
  loan_payments!: Table<LoanPayment, string>;
  users!: Table<User, string>;
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

    this.version(3).stores({
      agencies: 'id, name',
      clients: 'id, agency_id, name',
      projects: 'id, client_id, name, charity_enabled',
      project_payments: 'id, project_id, payment_date',
      transactions: 'id, project_id, type, transaction_date',
      developers: 'id, name, status',
      project_developers: 'id, project_id, developer_id',
      developer_payments: 'id, developer_id, project_id, payment_date',
      personal_expenses: 'id, category, expense_date',
      loans: 'id, person_name, status, expected_return_date',
      loan_payments: 'id, loan_id, payment_date',
      charity_payments: 'id, project_id, payment_date',
      users: 'id, username',
      settings: 'id, key'
    });

    this.version(4).stores({
      agencies: 'id, name',
      clients: 'id, agency_id, name',
      marketing_payments: 'id, client_id, month_year',
      projects: 'id, client_id, name',
      project_payments: 'id, project_id, payment_date',
      developers: 'id, name, status',
      project_developers: 'id, project_id, developer_id',
      developer_payments: 'id, developer_id, project_id, payment_date',
      personal_expenses: 'id, category, expense_date',
      loans: 'id, person_name, status, expected_return_date',
      loan_payments: 'id, loan_id, payment_date',
      users: 'id, username',
      settings: 'id, key'
    }).upgrade(tx => {
      // safe upgrade
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
