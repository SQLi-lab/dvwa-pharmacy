from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DATABASE = 'pharmacy.db'

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/products', methods=['GET'])
def get_products():
    """Эндпоинт для получения продуктов"""
    search = request.args.get('search', '')
    category = request.args.get('category', '')

    query = "SELECT * FROM products WHERE 1=1"
    args = []

    if search:
        query += " AND name LIKE ?"
        args.append(f"%{search}%")
    if category:
        query += " AND category = ?"
        args.append(category)

    products = query_db(query, args)
    return jsonify([
        {"id": p[0], "name": p[1], "description": p[2], "price": p[3], "category": p[4]}
        for p in products
    ])

if __name__ == '__main__':
    app.run(debug=True)
