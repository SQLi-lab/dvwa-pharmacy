import sqlite3
import psycopg2
import os
from psycopg2.extras import RealDictCursor

DATABASE_TYPE = 'sqlite'  # Измените на 'postgres', если используете PostgreSQL
DATABASE_CONFIG = {
    'sqlite': {
        'database': 'pharmacy.db'
    },
    'postgres': {
        'dbname': os.getenv('POSTGRES_DB'),
        'user': os.getenv('POSTGRES_USER'),
        'password': os.getenv('POSTGRES_PASS'),
        'host': os.getenv('POSTGRES_HOST'),
        'port': os.getenv('POSTGRES_PORT')
    }
}


def get_connection():
    if DATABASE_TYPE == 'sqlite':
        return sqlite3.connect(DATABASE_CONFIG['sqlite']['database'])
    elif DATABASE_TYPE == 'postgres':
        config = DATABASE_CONFIG['postgres']
        return psycopg2.connect(
            dbname=config['dbname'],
            user=config['user'],
            password=config['password'],
            host=config['host'],
            port=config['port']
        )

def query_db(query, args=(), one=False):
    conn = get_connection()
    if DATABASE_TYPE == 'sqlite':
        conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    if DATABASE_TYPE == 'postgres':
        return [dict(row) for row in rv] if not one else dict(rv[0]) if rv else None
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    conn.close()
