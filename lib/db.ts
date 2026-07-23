import { createClient, type Client, type InValue, type Row } from '@libsql/client';

type AnyRecord = Record<string, any>;
type Operator = Record<string, any>;

const DATABASE_URL = process.env.TURSO_DATABASE_URL;
const DATABASE_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client: Client | null = null;
let schemaPromise: Promise<void> | null = null;

function getClient() {
  if (!DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not set in environment variables');
  if (!DATABASE_TOKEN) throw new Error('TURSO_AUTH_TOKEN is not set in environment variables');
  if (!client) client = createClient({ url: DATABASE_URL, authToken: DATABASE_TOKEN });
  return client;
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, profile_picture TEXT NOT NULL DEFAULT 'avatar1',
    balance REAL NOT NULL DEFAULT 0, referral_code TEXT NOT NULL UNIQUE,
    referred_by TEXT, referral_earnings REAL NOT NULL DEFAULT 0, total_earnings REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1, is_admin INTEGER NOT NULL DEFAULT 0,
    profile_completed INTEGER NOT NULL DEFAULT 0, date_of_birth TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '', nin TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS packages (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL, daily_return_pct REAL NOT NULL,
    duration_days INTEGER NOT NULL, total_roi REAL NOT NULL, tier TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS investments (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, package_id TEXT NOT NULL, package_name TEXT NOT NULL,
    amount REAL NOT NULL, daily_return_pct REAL NOT NULL, duration_days INTEGER NOT NULL,
    total_earned REAL NOT NULL DEFAULT 0, days_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', start_date TEXT NOT NULL, end_date TEXT,
    created_at TEXT NOT NULL, last_return_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL,
    description TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'completed', failure_reason TEXT,
    paystack_ref TEXT, reference TEXT, metadata TEXT, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'system',
    title TEXT NOT NULL, message TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, investment_id TEXT, type TEXT NOT NULL,
    amount REAL NOT NULL, description TEXT, created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read)`,
];

export async function connectDB() {
  const db = getClient();
  if (!schemaPromise) {
    schemaPromise = Promise.all(schemaStatements.map((sql) => db.execute(sql))).then(() => undefined);
  }
  await schemaPromise;
  return db;
}

export function newId() {
  return globalThis.crypto?.randomUUID() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function valueForSql(value: any): InValue {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return value as InValue;
}

function dbValue(value: any) {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapRow(row: Row): AnyRecord {
  const result: AnyRecord = { ...row };
  result._id = String(result.id);
  delete result.id;
  for (const key of ['is_active', 'is_admin', 'profile_completed', 'read']) {
    if (key in result) result[key] = Boolean(result[key]);
  }
  if ('metadata' in result && typeof result.metadata === 'string' && result.metadata) {
    try { result.metadata = JSON.parse(result.metadata); } catch { /* preserve malformed metadata */ }
  }
  return result;
}

function matches(record: AnyRecord, query: AnyRecord): boolean {
  return Object.entries(query).every(([key, expected]) => {
    if (key === '$or') return expected.some((item: AnyRecord) => matches(record, item));
    const actual = record[key];
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      return Object.entries(expected as Operator).every(([operator, value]) => {
        if (operator === '$in') return value.includes(actual);
        if (operator === '$nin') return !value.includes(actual);
        if (operator === '$regex') return new RegExp(value, expected.$options || '').test(String(actual ?? ''));
        if (operator === '$options') return true;
        const normalizedValue = valueForSql(value) as any;
        const comparableActual = typeof actual === 'boolean' && (normalizedValue === 0 || normalizedValue === 1)
          ? (actual ? 1 : 0)
          : actual;
        if (operator === '$ne') return comparableActual !== normalizedValue;
        if (operator === '$gt') return comparableActual > normalizedValue;
        if (operator === '$gte') return comparableActual >= normalizedValue;
        if (operator === '$lt') return comparableActual < normalizedValue;
        if (operator === '$lte') return comparableActual <= normalizedValue;
        return comparableActual === normalizedValue;
      });
    }
    const normalizedExpected = valueForSql(expected) as any;
    const comparableActual = typeof actual === 'boolean' && (normalizedExpected === 0 || normalizedExpected === 1)
      ? (actual ? 1 : 0)
      : actual;
    return comparableActual === normalizedExpected;
  });
}

function sortRecords(records: AnyRecord[], sort: AnyRecord) {
  const entries = Object.entries(sort);
  return records.sort((a, b) => {
    for (const [key, direction] of entries) {
      const left = a[key] instanceof Date ? a[key].getTime() : a[key];
      const right = b[key] instanceof Date ? b[key].getTime() : b[key];
      if (left === right) continue;
      return (left > right ? 1 : -1) * Number(direction);
    }
    return 0;
  });
}

function applyProjection(record: AnyRecord, projection: string | undefined) {
  if (!projection) return record;
  const fields = projection.split(/\s+/).filter(Boolean);
  const exclusions = fields.filter((field) => field.startsWith('-')).map((field) => field.slice(1));
  if (exclusions.length) {
    const output = { ...record };
    exclusions.forEach((field) => delete output[field]);
    return output;
  }
  const output: AnyRecord = { _id: record._id };
  fields.forEach((field) => { if (field in record) output[field] = record[field]; });
  return output;
}

function getPath(value: any, path: string) {
  return path.split('.').reduce((current, part) => current?.[part], value);
}

function evaluateExpression(value: any, record: AnyRecord): any {
  if (typeof value === 'string' && value.startsWith('$')) return getPath(record, value.slice(1));
  if (Array.isArray(value)) return value.map((item) => evaluateExpression(item, record));
  if (value && typeof value === 'object') {
    if ('$year' in value) return new Date(evaluateExpression(value.$year, record)).getUTCFullYear();
    if ('$month' in value) return new Date(evaluateExpression(value.$month, record)).getUTCMonth() + 1;
    if ('$dayOfMonth' in value) return new Date(evaluateExpression(value.$dayOfMonth, record)).getUTCDate();
    if ('$cond' in value) {
      const [condition, whenTrue, whenFalse] = value.$cond;
      return evaluateExpression(evaluateCondition(condition, record) ? whenTrue : whenFalse, record);
    }
    if ('$in' in value) {
      const [left, right] = value.$in.map((item: any) => evaluateExpression(item, record));
      return right.includes(left);
    }
    if ('$eq' in value) return evaluateCondition(value, record);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, evaluateExpression(item, record)]));
  }
  return value;
}

function evaluateCondition(condition: any, record: AnyRecord) {
  if (condition?.$eq) {
    const [left, right] = condition.$eq.map((item: any) => evaluateExpression(item, record));
    return left === right;
  }
  if (condition?.$in) {
    const [left, right] = condition.$in.map((item: any) => evaluateExpression(item, record));
    return right.includes(left);
  }
  return Boolean(condition);
}

function aggregateSum(expression: any, records: AnyRecord[]) {
  return records.reduce((total, record) => {
    if (expression?.$cond) {
      const [condition, whenTrue, whenFalse] = expression.$cond;
      return total + Number(evaluateExpression(evaluateCondition(condition, record) ? whenTrue : whenFalse, record) || 0);
    }
    return total + Number(evaluateExpression(expression, record) || 0);
  }, 0);
}

async function rawRows(table: string) {
  const result = await getClient().execute(`SELECT * FROM ${table}`);
  return result.rows.map(mapRow);
}

function sqlFilter(table: string, filter: AnyRecord) {
  const entries = Object.entries(filter).filter(([, value]) => (
    value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  ));
  if (entries.length !== Object.keys(filter).length || entries.some(([key]) => key === '$or')) {
    return { sql: `SELECT * FROM ${table}`, args: [] as InValue[], needsMemoryFilter: true };
  }
  const clauses = entries.map(([key, value]) => `${key === '_id' ? 'id' : key} ${value === null ? 'IS NULL' : '= ?'}`);
  const args = entries.filter(([, value]) => value !== null).map(([, value]) => valueForSql(value));
  return {
    sql: `SELECT * FROM ${table}${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''}`,
    args,
    needsMemoryFilter: false,
  };
}

export class Query<T extends AnyRecord = AnyRecord> implements PromiseLike<T[]> {
  private projection?: string;
  private sortSpec: AnyRecord = {};
  private offset = 0;
  private max?: number;
  private populateSpec?: string;
  private populateProjection?: string;

  constructor(private readonly table: string, private readonly filter: AnyRecord) {}
  select(projection: string) { this.projection = projection; return this; }
  sort(spec: AnyRecord) { this.sortSpec = spec; return this; }
  skip(value: number) { this.offset = value; return this; }
  limit(value: number) { this.max = value; return this; }
  populate(path: string, projection?: string) {
    this.populateSpec = path;
    this.populateProjection = projection;
    return this;
  }
  lean() { return this; }
  async exec(): Promise<T[]> { return this.execute(); }
  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
  private async execute(): Promise<T[]> {
    const query = sqlFilter(this.table, this.filter);
    let records = (await getClient().execute({ sql: query.sql, args: query.args })).rows.map(mapRow);
    if (query.needsMemoryFilter) {
      records = records.filter((record) => matches(record, this.filter));
    }
    if (this.sortSpec) sortRecords(records, this.sortSpec);
    records = records.slice(this.offset, this.max === undefined ? undefined : this.offset + this.max);
    records = records.map((record) => applyProjection(record, this.projection));
    if (this.populateSpec) {
      const foreignTable = this.populateSpec === 'user_id' ? 'users' : 'packages';
      const foreignRows = await rawRows(foreignTable);
      records = records.map((record) => ({
        ...record,
        [this.populateSpec!]: applyProjection(
          foreignRows.find((foreign) => foreign._id === record[this.populateSpec!]) ?? { _id: record[this.populateSpec!] },
          this.populateProjection,
        ),
      }));
    }
    return records.map((record) => hydrateRecord(this.table, record)) as T[];
  }
}

export class SingleQuery<T extends AnyRecord = AnyRecord> implements PromiseLike<T | undefined> {
  private projection?: string;
  constructor(private readonly loader: () => Promise<T | undefined>) {}
  select(projection: string) { this.projection = projection; return this; }
  async exec() { return this.execute(); }
  then<TResult1 = T | undefined, TResult2 = never>(
    onfulfilled?: ((value: T | undefined) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
  private async execute() {
    const record = await this.loader();
    return record ? applyProjection(record, this.projection) as T : undefined;
  }
}

function updateValues(update: AnyRecord) {
  const values: AnyRecord = { ...update.$set, ...update };
  delete values.$set;
  delete values.$inc;
  if (update.$inc) {
    for (const [key, amount] of Object.entries(update.$inc)) values[key] = { $increment: amount };
  }
  return values;
}

export class Model<T extends AnyRecord = AnyRecord> {
  constructor(public readonly table: string) {}
  find(filter: AnyRecord = {}) { return new Query<T>(this.table, filter); }
  async findOne(filter: AnyRecord = {}) { return (await this.find(filter).limit(1))[0] as T | undefined; }
  findById(id: string) {
    return new SingleQuery<T>(() => this.find({ _id: id }).limit(1).then((rows) => rows[0] as T | undefined));
  }
  async countDocuments(filter: AnyRecord = {}) { return (await this.find(filter)).length; }
  async create(data: AnyRecord) {
    const now = new Date().toISOString();
    const record: AnyRecord = { ...data, _id: data._id ?? newId(), created_at: data.created_at ?? now };
    if (this.table === 'users') record.updated_at ??= now;
    if (this.table === 'investments') {
      record.start_date ??= now;
      record.total_earned ??= 0; record.days_completed ??= 0; record.status ??= 'active';
    }
    if (this.table === 'packages') record.is_active ??= true;
    if (this.table === 'transactions') record.status ??= 'completed';
    if (this.table === 'notifications') { record.type ??= 'system'; record.read ??= false; }
    const columns = Object.keys(record).filter((key) => key !== '_id');
    const names = ['id', ...columns];
    const args = [record._id, ...columns.map((key) => valueForSql(record[key] === undefined ? null : record[key]))];
    const placeholders = names.map(() => '?').join(', ');
    await getClient().execute({ sql: `INSERT INTO ${this.table} (${names.join(', ')}) VALUES (${placeholders})`, args });
    return recordForModel(record) as T;
  }
  async insertMany(items: AnyRecord[]) { return Promise.all(items.map((item) => this.create(item))); }
  async updateOne(filter: AnyRecord, update: AnyRecord) {
    const record = await this.findOne(filter);
    if (!record) return { matchedCount: 0, modifiedCount: 0 };
    await this.saveUpdated(record, update);
    return { matchedCount: 1, modifiedCount: 1 };
  }
  async updateMany(filter: AnyRecord, update: AnyRecord) {
    const records = await this.find(filter);
    await Promise.all(records.map((record) => this.saveUpdated(record, update)));
    return { matchedCount: records.length, modifiedCount: records.length };
  }
  findByIdAndUpdate(id: string, update: AnyRecord, options: AnyRecord = {}) {
    return new SingleQuery<T>(async () => {
      const record = await this.findById(id);
      if (!record) return undefined;
      await this.saveUpdated(record, update);
      return options.new === false ? record : await this.findById(id);
    });
  }
  async findByIdAndDelete(id: string) {
    const record = await this.findById(id);
    if (record) await getClient().execute({ sql: `DELETE FROM ${this.table} WHERE id = ?`, args: [id] });
    return record;
  }
  async aggregate(pipeline: AnyRecord[]) {
    let records = await rawRows(this.table);
    for (const stage of pipeline) {
      if (stage.$match) records = records.filter((record) => matches(record, normalizeFilter(stage.$match)));
      if (stage.$group) {
        const groups = new Map<string, AnyRecord>();
        for (const record of records) {
          const groupSpec = stage.$group as AnyRecord;
          const idValue = groupSpec._id === null ? null : Object.fromEntries(
            Object.entries(groupSpec._id as AnyRecord).map(([key, expression]) => [
              key,
              evaluateExpression(expression, record),
            ])
          );
          const key = JSON.stringify(idValue);
          const group = groups.get(key) ?? { _id: idValue };
          for (const [field, expression] of Object.entries(groupSpec)) {
            if (field === '_id') continue;
            const aggregate = expression as AnyRecord;
            if (aggregate.$sum !== undefined) group[field] = (group[field] ?? 0) + aggregateSum(aggregate.$sum, [record]);
            if (aggregate.$first !== undefined && group[field] === undefined) group[field] = evaluateExpression(aggregate.$first, record);
          }
          groups.set(key, group);
        }
        records = [...groups.values()];
      }
      if (stage.$sort) sortRecords(records, stage.$sort);
    }
    return records;
  }
  private async saveUpdated(record: AnyRecord, update: AnyRecord) {
    const values = updateValues(update);
    const setParts: string[] = [];
    const args: InValue[] = [];
    for (const [key, value] of Object.entries(values)) {
      if (value && typeof value === 'object' && '$increment' in value) {
        setParts.push(`${key} = COALESCE(${key}, 0) + ?`);
        args.push(valueForSql(value.$increment));
      } else {
        setParts.push(`${key} = ?`);
        args.push(valueForSql(value));
      }
    }
    if (this.table === 'users' && !('updated_at' in values)) {
      setParts.push('updated_at = ?'); args.push(new Date().toISOString());
    }
    if (!setParts.length) return;
    args.push(record._id);
    await getClient().execute({ sql: `UPDATE ${this.table} SET ${setParts.join(', ')} WHERE id = ?`, args });
  }
}

function normalizeFilter(filter: AnyRecord) {
  if (filter._id !== undefined) return { ...filter, id: filter._id };
  return filter;
}

function recordForModel(record: AnyRecord) {
  const output = { ...record };
  delete output.id;
  return output;
}

function hydrateRecord(table: string, record: AnyRecord) {
  const output = { ...record };
  Object.defineProperty(output, 'save', {
    enumerable: false,
    value: async () => {
      const values = Object.fromEntries(Object.entries(output).filter(([key]) => key !== '_id' && key !== 'save'));
      const columns = Object.keys(values);
      await getClient().execute({
        sql: `UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
        args: [...columns.map((column) => valueForSql(values[column])), output._id],
      });
      return output;
    },
  });
  return output;
}

export function createModel<T extends AnyRecord = AnyRecord>(table: string) {
  return new Model<T>(table);
}