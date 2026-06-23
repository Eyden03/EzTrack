import { CONFIG } from '@/config'

let SQL = null
let _db = null

function createTables() {
  _db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, avatar TEXT,
      biz_name TEXT, biz_type TEXT, biz_city TEXT,
      lang TEXT DEFAULT 'taglish', tier TEXT DEFAULT 'simula'
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER, type TEXT, desc TEXT,
      amt REAL, date TEXT, cat TEXT DEFAULT '', time TEXT
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER, name TEXT, qty INTEGER,
      unit TEXT, min_threshold INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER, name TEXT, contact TEXT
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER, name TEXT, target_amt REAL, deadline TEXT
    );
  `)
}

function seed() {
  const profiles = _db.exec("SELECT COUNT(*) as c FROM profiles")
  if (profiles[0]?.values[0]?.[0] > 0) return

  _db.run(`INSERT INTO profiles VALUES
    (1,'Maria Anning','maria@email.com','MA','Anning Sari-Sari Store','sari','Quezon City','taglish','${CONFIG.TIERS.SIMULA}'),
    (2,'Juan Dela Cruz','juan@email.com','JD','JC Online Shop','online','Manila','taglish','${CONFIG.TIERS.SIGLA}'),
    (3,'Rosa Magsaysay','rosa@email.com','RM','RM Retail Hub','retail','Makati','taglish','${CONFIG.TIERS.UNLAD}')
  `)

  const seedTx = (pId, data) => {
    _db.run(
      'INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES (?,?,?,?,?,?,?)',
      [pId, data.type, data.desc, data.amt, data.date, data.cat, data.time]
    )
  }

  const TX_SEED = [
    { type:'inc', desc:'Sari-sari store sales', amt:4500, date:'2026-06-15', cat:'', time:'5:30 PM' },
    { type:'inc', desc:'Online order #1024', amt:1520, date:'2026-06-16', cat:'', time:'10:15 AM' },
    { type:'exp', desc:'Supplies restock', amt:820, date:'2026-06-14', cat:'Supplies', time:'2:00 PM' },
    { type:'inc', desc:'Weekly payout', amt:18000, date:'2026-06-17', cat:'', time:'9:00 AM' },
    { type:'exp', desc:'Electric bill', amt:380, date:'2026-06-13', cat:'Utilities', time:'11:30 AM' },
    { type:'inc', desc:'Referral fee', amt:500, date:'2026-06-12', cat:'', time:'3:45 PM' },
    { type:'exp', desc:'Transportation', amt:200, date:'2026-06-11', cat:'Transportation', time:'7:20 AM' },
  ]

  for (const pid of [1, 2, 3]) {
    for (const d of TX_SEED) seedTx(pid, d)
  }

  _db.run(`INSERT INTO inventory VALUES
    (1,1,'Cooking Oil (1L)',12,'bottle',5),
    (2,1,'Instant Noodles',24,'pcs',10),
    (3,1,'Canned Sardines',8,'pcs',10),
    (4,1,'Coffee 3in1 (50pk)',3,'box',2),
    (5,1,'Candies (jar)',1,'pack',1),
    (6,2,'Tote Bag',5,'pcs',2),
    (7,2,'Phone Case',12,'pcs',5),
    (8,2,'Keychain',30,'pcs',10),
    (9,3,'T-Shirt (Bulk)',20,'pcs',10),
    (10,3,'Denim Jeans',8,'pcs',5),
    (11,3,'Sneakers (Pair)',6,'pair',3),
    (12,3,'Cap',15,'pcs',5)
  `)
}

function saveBlob() {
  const data = _db.export()
  const buf = new Uint8Array(data)
  let binary = ''
  for (let i = 0; i < buf.byteLength; i++) binary += String.fromCharCode(buf[i])
  localStorage.setItem(CONFIG.STORAGE_KEY, btoa(binary))
}

function loadBlob() {
  const blob = localStorage.getItem(CONFIG.STORAGE_KEY)
  if (!blob) return null
  const binary = atob(blob)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf
}

export async function initDB() {
  if (_db) return
  const initSqlJs = window.initSqlJs
  if (!initSqlJs) throw new Error('sql.js not loaded. Ensure sql-wasm.js CDN script is present in index.html.')
  SQL = await initSqlJs({ locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/' + f })
  const existing = loadBlob()
  _db = existing ? new SQL.Database(existing) : new SQL.Database()
  createTables()
  seed()
  saveBlob()
}

export function getProfiles() {
  const result = _db.exec('SELECT * FROM profiles ORDER BY id')
  return result[0]?.values.map(row => ({
    id: row[0], name: row[1], email: row[2], avatar: row[3],
    biz_name: row[4], biz_type: row[5], biz_city: row[6], lang: row[7], tier: row[8],
  })) || []
}

export function createProfile(data) {
  _db.run(
    'INSERT INTO profiles (name,email,avatar,biz_name,biz_type,biz_city,lang,tier) VALUES (?,?,?,?,?,?,?,?)',
    [data.name, data.email, data.avatar, data.biz_name || '', data.biz_type || '', data.biz_city || '', data.lang || 'taglish', data.tier || 'simula']
  )
  saveBlob()
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0]
}

export function updateProfile(id, data) {
  const keys = Object.keys(data)
  if (!keys.length) return
  const setClause = keys.map(k => `${k}=?`).join(',')
  _db.run(`UPDATE profiles SET ${setClause} WHERE id=?`, [...keys.map(k => data[k]), id])
  saveBlob()
}

export function getTransactions(profileId) {
  const result = _db.exec(
    'SELECT id,profile_id,type,desc,amt,date,cat,time FROM transactions WHERE profile_id=? ORDER BY id DESC',
    [profileId]
  )
  return result[0]?.values.map(row => ({
    id: row[0], profile_id: row[1], type: row[2], desc: row[3],
    amt: row[4], date: row[5], cat: row[6], time: row[7],
  })) || []
}

export function addTransaction(tx) {
  _db.run(
    'INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES (?,?,?,?,?,?,?)',
    [tx.profile_id, tx.type, tx.desc, tx.amt, tx.date, tx.cat || '', tx.time]
  )
  saveBlob()
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0]
}

export function deleteTransaction(id) {
  _db.run('DELETE FROM transactions WHERE id=?', [id])
  saveBlob()
}

export function getInventory(profileId) {
  const result = _db.exec(
    'SELECT id,profile_id,name,qty,unit,min_threshold FROM inventory WHERE profile_id=? ORDER BY name',
    [profileId]
  )
  return result[0]?.values.map(row => ({
    id: row[0], profile_id: row[1], name: row[2], qty: row[3], unit: row[4], min_threshold: row[5],
  })) || []
}

export function addInventoryItem(item) {
  _db.run(
    'INSERT INTO inventory (profile_id,name,qty,unit,min_threshold) VALUES (?,?,?,?,?)',
    [item.profile_id, item.name, item.qty, item.unit, item.min_threshold ?? 0]
  )
  saveBlob()
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0]
}

export function getCustomers(profileId) {
  const result = _db.exec(
    'SELECT id,profile_id,name,contact FROM customers WHERE profile_id=? ORDER BY name',
    [profileId]
  )
  return result[0]?.values.map(row => ({
    id: row[0], profile_id: row[1], name: row[2], contact: row[3],
  })) || []
}

export function addCustomer(data) {
  _db.run(
    'INSERT INTO customers (profile_id,name,contact) VALUES (?,?,?)',
    [data.profile_id, data.name, data.contact]
  )
  saveBlob()
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0]
}

export function getGoals(profileId) {
  const result = _db.exec(
    'SELECT id,profile_id,name,target_amt,deadline FROM goals WHERE profile_id=? ORDER BY id',
    [profileId]
  )
  return result[0]?.values.map(row => ({
    id: row[0], profile_id: row[1], name: row[2], target_amt: row[3], deadline: row[4],
  })) || []
}

export function addGoal(data) {
  _db.run(
    'INSERT INTO goals (profile_id,name,target_amt,deadline) VALUES (?,?,?,?)',
    [data.profile_id, data.name, data.target_amt, data.deadline]
  )
  saveBlob()
  return _db.exec('SELECT last_insert_rowid()')[0].values[0][0]
}

export function loadState(profileId) {
  const profiles = _db.exec('SELECT * FROM profiles WHERE id = ?', [profileId])
  if (!profiles[0]?.values.length) return null
  const p = profiles[0].values[0]
  const profile = {
    id: p[0], name: p[1], email: p[2], avatar: p[3],
    biz_name: p[4], biz_type: p[5], biz_city: p[6], lang: p[7], tier: p[8],
  }
  const transactions = getTransactions(profileId)
  const ids = transactions.map(t => t.id)
  return {
    profileId: profile.id,
    user: { name: profile.name, email: profile.email, avatar: profile.avatar },
    business: { name: profile.biz_name, type: profile.biz_type, city: profile.biz_city, lang: profile.lang },
    tier: profile.tier,
    transactions,
    nextTransactionId: ids.length ? Math.max(...ids) + 1 : 1,
    inventory: getInventory(profileId),
    customers: getCustomers(profileId),
    goals: getGoals(profileId),
    simulaQueriesRemaining: CONFIG.AI_QUERY_LIMIT,
  }
}
