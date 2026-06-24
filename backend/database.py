import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "eztrack.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
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
    """)
    count = c.execute("SELECT COUNT(*) FROM profiles").fetchone()[0]
    if count == 0:
        _seed(c)
        conn.commit()
    conn.close()

def _seed(c):
    c.executescript("""
        INSERT INTO profiles VALUES
            (1,'Maria Anning','maria@email.com','MA','Anning Sari-Sari Store','sari','Quezon City','english','simula'),
            (2,'Juan Dela Cruz','juan@email.com','JD','JC Online Shop','online','Manila','english','sigla'),
            (3,'Rosa Magsaysay','rosa@email.com','RM','RM Retail Hub','retail','Makati','english','unlad');

        INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES
            (1,'inc','Store sales — morning rush',620,'2026-06-24','Sales','7:30 AM'),
            (1,'exp','Meralco bill',380,'2026-06-24','Utilities','10:00 AM'),
            (1,'inc','Store sales',480,'2026-06-22','Sales','6:00 PM'),
            (1,'exp','Jeepney fare — market run',55,'2026-06-21','Transportation','8:00 AM'),
            (1,'inc','Store sales',710,'2026-06-20','Sales','5:30 PM'),
            (1,'exp','Supplies restock — SM Hypermarket',1240,'2026-06-18','Supplies','2:00 PM'),
            (1,'inc','Store sales',530,'2026-06-17','Sales','7:00 PM'),
            (1,'inc','Store sales — weekend',890,'2026-06-14','Sales','5:00 PM'),
            (1,'exp','LPG tank refill',680,'2026-06-12','Utilities','11:00 AM'),
            (1,'inc','Store sales',445,'2026-06-10','Sales','6:30 PM'),
            (1,'exp','Supplies restock — Puregold',975,'2026-06-07','Supplies','1:00 PM'),
            (1,'inc','Store sales',390,'2026-06-05','Sales','5:00 PM'),

            (2,'inc','Shopee payout — batch #42',3870,'2026-06-24','Sales','3:00 PM'),
            (2,'exp','Packaging materials — tape, bubble wrap',340,'2026-06-23','Supplies','10:00 AM'),
            (2,'inc','TikTok Shop payout',2150,'2026-06-22','Sales','4:00 PM'),
            (2,'exp','J&T Express shipping top-up',185,'2026-06-21','Shipping','9:00 AM'),
            (2,'inc','COD remittance — LBC',1640,'2026-06-20','Sales','2:00 PM'),
            (2,'exp','Facebook Ads — product boost',500,'2026-06-19','Marketing','8:00 AM'),
            (2,'inc','Shopee payout — batch #41',4210,'2026-06-17','Sales','3:00 PM'),
            (2,'exp','Packaging materials restock',290,'2026-06-15','Supplies','11:00 AM'),
            (2,'inc','TikTok Shop payout',1880,'2026-06-14','Sales','5:00 PM'),
            (2,'exp','Electric bill — home office',420,'2026-06-12','Utilities','9:00 AM'),
            (2,'inc','Shopee payout — batch #40',3550,'2026-06-11','Sales','3:00 PM'),
            (2,'exp','Facebook Ads',500,'2026-06-10','Marketing','8:00 AM'),
            (2,'inc','COD remittance — LBC',1220,'2026-06-08','Sales','2:00 PM'),
            (2,'exp','Inventory restock — phone cases',1850,'2026-06-07','Supplies','1:00 PM'),
            (2,'inc','Shopee payout — batch #39',2970,'2026-06-05','Sales','3:00 PM'),
            (2,'exp','J&T Express top-up',210,'2026-06-03','Shipping','9:00 AM'),
            (2,'inc','TikTok Shop payout',1430,'2026-06-01','Sales','5:00 PM'),
            (2,'exp','Inventory restock — tote bags, keychains',1120,'2026-05-30','Supplies','1:00 PM'),

            (3,'inc','Walk-in sales — weekday',4350,'2026-06-24','Sales','6:00 PM'),
            (3,'exp','Staff salary — part-time (2 staff)',3200,'2026-06-23','Payroll','5:00 PM'),
            (3,'inc','Walk-in sales',3870,'2026-06-22','Sales','7:00 PM'),
            (3,'exp','Supplier payment — denim jeans restock',5600,'2026-06-21','Supplies','2:00 PM'),
            (3,'inc','Walk-in sales — weekend',7140,'2026-06-20','Sales','6:00 PM'),
            (3,'inc','Walk-in sales — weekend',6480,'2026-06-19','Sales','5:00 PM'),
            (3,'exp','Electric bill — store',1840,'2026-06-18','Utilities','10:00 AM'),
            (3,'inc','Walk-in sales',3210,'2026-06-17','Sales','6:30 PM'),
            (3,'exp','Supplier payment — sneakers restock',8400,'2026-06-15','Supplies','3:00 PM'),
            (3,'inc','Walk-in sales — weekend',5920,'2026-06-14','Sales','5:00 PM'),
            (3,'inc','Walk-in sales — weekend',4750,'2026-06-13','Sales','4:00 PM'),
            (3,'exp','BIR percentage tax — May 2026',1250,'2026-06-12','Tax','9:00 AM'),
            (3,'exp','Staff salary — part-time (2 staff)',3200,'2026-06-11','Payroll','5:00 PM'),
            (3,'inc','Walk-in sales',2980,'2026-06-10','Sales','6:00 PM'),
            (3,'exp','Supplier payment — t-shirts bulk',3750,'2026-06-08','Supplies','2:00 PM'),
            (3,'inc','Walk-in sales — weekend',6310,'2026-06-07','Sales','4:00 PM'),
            (3,'inc','Walk-in sales — weekend',5640,'2026-06-06','Sales','5:30 PM'),
            (3,'exp','Store rent — June',12000,'2026-06-05','Rent','8:00 AM'),
            (3,'inc','Walk-in sales',2870,'2026-06-03','Sales','6:00 PM'),
            (3,'exp','Staff salary — part-time (2 staff)',3200,'2026-06-01','Payroll','5:00 PM'),
            (3,'inc','Walk-in sales — month-end',4120,'2026-05-31','Sales','6:00 PM'),
            (3,'exp','Supplier payment — caps restock',2100,'2026-05-30','Supplies','1:00 PM');

        INSERT INTO inventory VALUES
            (1,1,'Cooking Oil (1L)',7,'bottle',5),
            (2,1,'Instant Noodles',24,'pcs',10),
            (3,1,'Sardines (canned)',18,'can',12),
            (4,1,'Coffee 3-in-1 (50pk)',3,'box',2),
            (5,1,'Candies (jar)',1,'jar',2),
            (6,2,'Tote Bag',4,'pcs',5),
            (7,2,'Phone Case (assorted)',9,'pcs',5),
            (8,2,'Keychain',28,'pcs',10),
            (9,2,'Laptop Sleeve',6,'pcs',3),
            (10,3,'T-Shirt (bulk)',17,'pcs',10),
            (11,3,'Denim Jeans',5,'pcs',5),
            (12,3,'Sneakers (pair)',4,'pair',3),
            (13,3,'Cap (assorted)',12,'pcs',5),
            (14,3,'Polo Shirt',8,'pcs',5);

        INSERT INTO customers VALUES
            (1,2,'Crisanta Reyes','09171234567'),
            (2,2,'Mark Villanueva','09281234567'),
            (3,2,'Lovely Santos','09391234567'),
            (4,3,'Alyssa Fernandez','09171239876'),
            (5,3,'Rodrigo Tan','09281239876'),
            (6,3,'Patricia Cruz','09391239876');

        INSERT INTO goals VALUES
            (1,3,'Monthly net income',15000,'2026-06-30'),
            (2,3,'Reduce supplier costs',18000,'2026-06-30');
    """)

# ── Profile CRUD ──

def get_profiles(conn):
    return [dict(r) for r in conn.execute("SELECT * FROM profiles ORDER BY id").fetchall()]

def get_profile(conn, profile_id):
    r = conn.execute("SELECT * FROM profiles WHERE id=?", (profile_id,)).fetchone()
    return dict(r) if r else None

def create_profile(conn, data):
    c = conn.execute(
        "INSERT INTO profiles (name,email,avatar,biz_name,biz_type,biz_city,lang,tier) VALUES (?,?,?,?,?,?,?,?)",
        (data["name"], data["email"], data.get("avatar",""), data.get("biz_name",""), data.get("biz_type",""), data.get("biz_city",""), data.get("lang","taglish"), data.get("tier","simula"))
    )
    conn.commit()
    return c.lastrowid

PROFILE_ALLOWED_KEYS = {"name", "email", "avatar", "biz_name", "biz_type", "biz_city", "lang", "tier"}

def update_profile(conn, profile_id, data):
    keys = [k for k in data if data[k] is not None and k in PROFILE_ALLOWED_KEYS]
    if not keys:
        return
    set_clause = ", ".join(f"{k}=?" for k in keys)
    values = [data[k] for k in keys] + [profile_id]
    conn.execute(f"UPDATE profiles SET {set_clause} WHERE id=?", values)
    conn.commit()

# ── Transaction CRUD ──

def get_transactions(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM transactions WHERE profile_id=? ORDER BY id DESC", (profile_id,)
    ).fetchall()]

def add_transaction(conn, tx):
    c = conn.execute(
        "INSERT INTO transactions (profile_id,type,desc,amt,date,cat,time) VALUES (?,?,?,?,?,?,?)",
        (tx["profile_id"], tx["type"], tx["desc"], tx["amt"], tx["date"], tx.get("cat",""), tx.get("time",""))
    )
    conn.commit()
    return c.lastrowid

def delete_transaction(conn, tx_id):
    conn.execute("DELETE FROM transactions WHERE id=?", (tx_id,))
    conn.commit()

# ── Inventory CRUD ──

def get_inventory(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM inventory WHERE profile_id=? ORDER BY name", (profile_id,)
    ).fetchall()]

def add_inventory_item(conn, item):
    c = conn.execute(
        "INSERT INTO inventory (profile_id,name,qty,unit,min_threshold) VALUES (?,?,?,?,?)",
        (item["profile_id"], item["name"], item["qty"], item["unit"], item.get("min_threshold", 0))
    )
    conn.commit()
    return c.lastrowid

def set_stock_threshold(conn, item_id, min_threshold):
    conn.execute("UPDATE inventory SET min_threshold=? WHERE id=?", (min_threshold, item_id))
    conn.commit()

INVENTORY_ALLOWED_KEYS = {"name", "qty", "unit", "min_threshold"}

def update_inventory_item(conn, item_id, data):
    keys = [k for k in data if data[k] is not None and k in INVENTORY_ALLOWED_KEYS]
    if not keys:
        return
    set_clause = ", ".join(f"{k}=?" for k in keys)
    values = [data[k] for k in keys] + [item_id]
    conn.execute(f"UPDATE inventory SET {set_clause} WHERE id=?", values)
    conn.commit()

def delete_inventory_item(conn, item_id):
    conn.execute("DELETE FROM inventory WHERE id=?", (item_id,))
    conn.commit()

# ── Customer CRUD ──

def get_customers(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM customers WHERE profile_id=? ORDER BY name", (profile_id,)
    ).fetchall()]

def add_customer(conn, data):
    c = conn.execute(
        "INSERT INTO customers (profile_id,name,contact) VALUES (?,?,?)",
        (data["profile_id"], data["name"], data["contact"])
    )
    conn.commit()
    return c.lastrowid

# ── Goal CRUD ──

def get_goals(conn, profile_id):
    return [dict(r) for r in conn.execute(
        "SELECT * FROM goals WHERE profile_id=? ORDER BY id", (profile_id,)
    ).fetchall()]

def add_goal(conn, data):
    c = conn.execute(
        "INSERT INTO goals (profile_id,name,target_amt,deadline) VALUES (?,?,?,?)",
        (data["profile_id"], data["name"], data["target_amt"], data["deadline"])
    )
    conn.commit()
    return c.lastrowid

# ── Load full state for a profile (used on login) ──

def load_state(conn, profile_id):
    profile = get_profile(conn, profile_id)
    if not profile:
        return None
    transactions = get_transactions(conn, profile_id)
    ids = [t["id"] for t in transactions]
    return {
        "profileId": profile["id"],
        "user": {"name": profile["name"], "email": profile["email"], "avatar": profile["avatar"]},
        "business": {"name": profile["biz_name"], "type": profile["biz_type"], "city": profile["biz_city"], "lang": profile["lang"]},
        "tier": profile["tier"],
        "transactions": transactions,
        "nextTransactionId": max(ids) + 1 if ids else 1,
        "inventory": get_inventory(conn, profile_id),
        "customers": get_customers(conn, profile_id),
        "goals": get_goals(conn, profile_id),
        "simulaQueriesRemaining": 10,
    }
