from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3
import logging
app = Flask(__name__)
# Настройка CORS
CORS(app, supports_credentials=True, origins="http://localhost:3000")

logging.basicConfig(level=logging.INFO)  # Устанавливаем уровень логирования
logger = logging.getLogger(__name__)  # Логгер для текущего приложения

DATABASE = 'pharmacy.db'

def query_db(query, args=(), one=False):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(query, args)
    rv = cursor.fetchall()
    conn.close()
    return (rv[0] if rv else None) if one else rv


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Выполняем проверку пользователя в базе данных
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    user = query_db(query, (username, password), one=True)

    if user:
        resp = make_response({"message": "Login successful"}, 200)

        cookie_value = f"user={username}; Path=/; SameSite=Lax"
        resp.headers.add('Set-Cookie', cookie_value)

        return resp
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Вы успешно вышли из системы"}))
    response.set_cookie('user', '', expires=0)  # Удаление куки
    logger.info("User logged out and cookie cleared")
    return response



# Уязвимость 2: SQL-инъекция в фильтрах товаров
@app.route('/products', methods=['GET'])

def get_products():
    category = request.args.get('category', '')

    query = "SELECT * FROM products WHERE 1=1"
    if category:
        query += f" AND category = '{category}'"

    products = query_db(query)
    return jsonify([
        {"id": p[0], "name": p[1], "description": p[2], "price": p[3], "category": p[4]}
        for p in products
    ])

@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    query = "SELECT * FROM products WHERE id = ?"
    product = query_db(query, (product_id,), one=True)
    if product:
        return jsonify({
            "id": product[0],
            "name": product[1],
            "description": product[2],
            "price": product[3],
            "category": product[4]
        })
    else:
        return jsonify({"message": "Product not found"}), 404


@app.route('/orders', methods=['POST'])
def orders():
    auth_header = request.headers.get('Authorization')
    if not auth_header or ' ' not in auth_header:
        return jsonify({"message": "Unauthorized"}), 401

    username = auth_header.split(' ')[1]  # Получаем имя пользователя
    if not username:
        return jsonify({"message": "Invalid username"}), 400

    data = request.json
    if not data or 'orders' not in data:
        return jsonify({"message": "Invalid data"}), 400

    orders = data['orders']

    try:
        conn = sqlite3.connect('pharmacy.db')
        cursor = conn.cursor()

        # Добавляем все заказы
        for order in orders:
            if not order.get('name') or not order.get('price'):
                return jsonify({"message": "Invalid order data"}), 400

            query = "INSERT INTO orders (username, order_name, price) VALUES (?, ?, ?)"
            cursor.execute(query, (username, order['name'], order['price']))

        conn.commit()
        conn.close()
        return jsonify({"message": "Orders placed successfully"}), 201
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reviews', methods=['GET', 'POST'])
def reviews():
    username = request.headers.get('Authorization').split(' ')[1]
    if request.method == 'GET':
        query = f"SELECT review_text FROM reviews WHERE username = '{username}'"
        reviews = query_db(query)
        return jsonify(reviews)

    elif request.method == 'POST':
        data = request.json
        review_text = data.get('review')
        query = f"INSERT INTO reviews (username, review_text) VALUES ('{username}', '{review_text}')"
        try:
            conn = sqlite3.connect('pharmacy.db')
            cursor = conn.cursor()
            cursor.execute(query)
            conn.commit()
            return jsonify({"message": "Review added successfully"}), 201
        except sqlite3.Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            conn.close()


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    # Получаем username из заголовка Authorization
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    username = auth_header.split(" ")[1]  # Извлекаем "user1" из "Bearer user1"

    logger.info(f"Extracted username from Authorization header: {username}")

    if request.method == 'GET':
        query_user = f"SELECT username, description FROM users WHERE username = '{username}'"
        logger.info(f"Executing query: {query_user}")
        user = query_db(query_user, one=True)

        query_orders = f"SELECT order_name, price FROM orders WHERE username = '{username}'"
        orders = query_db(query_orders)

        query_reviews = f"SELECT review_text FROM reviews WHERE username = '{username}'"
        reviews = query_db(query_reviews)

        if user:
            return jsonify({
                "username": user[0],
                "description": user[1],
                "orders": [{"name": order[0], "price": order[1]} for order in orders],
                "reviews": [{"text": review[0]} for review in reviews]
            })
        else:
            logger.warning(f"User not found: {username}")
            return jsonify({"message": "User not found"}), 404

    elif request.method == 'POST':
        new_description = request.json.get('description', '')
        query_update = f"UPDATE users SET description = '{new_description}' WHERE username = '{username}'"
        logger.info(f"Executing query: {query_update}")
        try:
            conn = sqlite3.connect('pharmacy.db')
            cursor = conn.cursor()
            cursor.execute(query_update)
            conn.commit()
            logger.info(f"Description updated for user: {username}")
            return jsonify({"message": "Profile updated successfully"})
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            return jsonify({"message": f"Database error: {e}"}), 500
        finally:
            conn.close()



@app.route('/profile', methods=['POST'])
def update_profile():
    # Получаем username из cookie
    session = request.cookies.get('session')
    if not session:
        return jsonify({"message": "Unauthorized"}), 401

    username = session.split('=')[1]
    description = request.json.get('description')

    # Обновляем описание пользователя
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET description = ? WHERE username = ?", (description, username))
    conn.commit()
    conn.close()

    return jsonify({"message": "Profile updated successfully"})


if __name__ == '__main__':
    app.run(debug=True)
