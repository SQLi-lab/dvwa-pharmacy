import sqlite3

def create_database():
    conn = sqlite3.connect('pharmacy.db')
    c = conn.cursor()

    # Создаём таблицу продуктов
    c.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL,
            category TEXT
        )
    ''')

    # Добавляем данные
    c.executemany('''
        INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)
    ''', [
        ('Aspirin', 'Pain relief medication.', 5.99, 'Pain Relief'),
        ('Vitamin C', 'Boosts immunity.', 10.99, 'Vitamins'),
        ('Ibuprofen', 'Anti-inflammatory drug.', 7.49, 'Pain Relief'),
        ('Paracetamol', 'Fever reducer.', 4.99, 'Fever Relief'),
        ('Omega-3', 'Supports heart health.', 15.99, 'Supplements'),
    ])

    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_database()
