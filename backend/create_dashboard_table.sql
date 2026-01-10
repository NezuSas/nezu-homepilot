CREATE TABLE IF NOT EXISTS users_dashboardlayout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    layout TEXT DEFAULT '[]',
    cards TEXT DEFAULT '[]',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE
);
