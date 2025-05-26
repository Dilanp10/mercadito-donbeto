const Database = require('better-sqlite3');
const db = new Database('./mercadito.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK(categoria IN ('gaseosas','alimentos','bazar','carniceria','limpieza')),
    precio REAL NOT NULL CHECK(precio > 0),
    stock INTEGER NOT NULL CHECK(stock >= 0),
    fecha_ingreso TEXT NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento TEXT NOT NULL,
    lote TEXT,
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total REAL NOT NULL,
    pago REAL NOT NULL,
    vuelto REAL NOT NULL,
    cliente TEXT,
    metodo_pago TEXT NOT NULL,
    items TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cuentas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id INTEGER NOT NULL,
    producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio REAL NOT NULL,
    fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE CASCADE
  );

  -- Tabla de ofertas actualizada
  CREATE TABLE IF NOT EXISTS ofertas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    cantidad_minima INTEGER NOT NULL CHECK(cantidad_minima > 0),
    precio_unitario REAL NOT NULL CHECK(precio_unitario > 0),
    precio_total REAL GENERATED ALWAYS AS (cantidad_minima * precio_unitario) STORED,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  );
`);

db.exec(`
  PRAGMA foreign_keys = ON;
  
  -- Añadir precio_total si no existe (para migraciones)
  BEGIN;
    CREATE TABLE IF NOT EXISTS temp_ofertas AS SELECT * FROM ofertas;
    DROP TABLE IF EXISTS ofertas;
    CREATE TABLE IF NOT EXISTS ofertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER NOT NULL,
      cantidad_minima INTEGER NOT NULL CHECK(cantidad_minima > 0),
      precio_unitario REAL NOT NULL CHECK(precio_unitario > 0),
      precio_total REAL GENERATED ALWAYS AS (cantidad_minima * precio_unitario) STORED,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );
    INSERT INTO ofertas (id, producto_id, cantidad_minima, precio_unitario, created_at)
      SELECT id, producto_id, cantidad_minima, precio_unitario, 
             COALESCE(created_at, CURRENT_TIMESTAMP) 
      FROM temp_ofertas;
    DROP TABLE IF EXISTS temp_ofertas;
  COMMIT;
`);

module.exports = db;