-- SQL para crear las tablas de rutinas personalizadas en SQLite
-- Ejecuta esto en tu base de datos SQLite

CREATE TABLE IF NOT EXISTS routines_nezuroutine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL DEFAULT 'Play',
    color VARCHAR(20) NOT NULL DEFAULT 'blue',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routines_routineaction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (routine_id) REFERENCES routines_nezuroutine(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS routines_routineaction_routine_id ON routines_routineaction(routine_id);
