from flask import Flask, Blueprint, request, jsonify, make_response
from flask_cors import CORS
from db import query_db, execute_db  # Подключаем универсальные функции
import logging

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    user = query_db(query, one=True)

    if user:
        resp = make_response({"message": "Login successful"}, 200)
        cookie_value = f"user={username}; Path=/; SameSite=Lax"
        resp.headers.add('Set-Cookie', cookie_value)
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@api.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Вы успешно вышли из системы"}))
    response.set_cookie('user', '', expires=0)
    response.headers.add('Access-Control-Allow-Origin', '*')

    logger.info("User logged out and cookie cleared")
    return response

@api.route('/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '')

    query = "SELECT * FROM products WHERE 1=1"
    if category:
        query += f" AND category = '{category}'"

    products = query_db(query)
    return jsonify([
        {"id": p['id'], "name": p['name'], "description": p['description'], "price": p['price'], "category": p['category']}
        for p in products
    ])

@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    query = f"SELECT * FROM products WHERE id = {product_id}"
    product = query_db(query, one=True)
    if product:
        return jsonify({
            "id": product['id'],
            "name": product['name'],
            "description": product['description'],
            "price": product['price'],
            "category": product['category']
        })
    else:
        return jsonify({"message": "Product not found"}), 404

@api.route('/orders', methods=['POST'])
def orders():
    auth_header = request.headers.get('Authorization')
    if not auth_header or ' ' not in auth_header:
        return jsonify({"message": "Unauthorized"}), 401

    username = auth_header.split(' ')[1]
    if not username:
        return jsonify({"message": "Invalid username"}), 400

    data = request.json
    if not data or 'orders' not in data:
        return jsonify({"message": "Invalid data"}), 400

    orders = data['orders']
    try:
        for order in orders:
            if not order.get('name') or not order.get('price'):
                return jsonify({"message": "Invalid order data"}), 400

            query = f"INSERT INTO orders (username, order_name, price) VALUES ('{username}', '{order['name']}', {order['price']})"
            execute_db(query)

        return jsonify({"message": "Orders placed successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/reviews', methods=['GET', 'POST'])
def reviews():
    username = request.headers.get('Authorization').split(' ')[1]
    if request.method == 'GET':
        query = f"SELECT review_text FROM reviews WHERE username = '{username}'"
        reviews = query_db(query)
        return jsonify([{"text": r['review_text']} for r in reviews])

    elif request.method == 'POST':
        data = request.json
        review_text = data.get('review')
        query = f"INSERT INTO reviews (username, review_text) VALUES ('{username}', '{review_text}')"
        try:
            execute_db(query)
            return jsonify({"message": "Review added successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api.route('/products/<int:product_id>/reviews', methods=['POST'])
def add_product_review(product_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    username = auth_header.split(" ")[1]
    data = request.json
    review_text = data.get('review')

    if not review_text:
        return jsonify({"error": "Review text is required"}), 400

    # SQL-инъекция уязвимая запись отзыва
    query = f"""
        INSERT INTO reviews (product_id, username, review_text)
        VALUES ({product_id}, '{username}', '{review_text}')
    """

    try:
        execute_db(query)
        return jsonify({"message": "Review added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/products/<int:product_id>/reviews', methods=['GET'])
def product_reviews(product_id):
    query = f"SELECT username, review_text FROM reviews WHERE product_id = {product_id}"
    try:
        reviews = query_db(query)
        # Преобразуем строки в JSON-совместимый формат
        reviews_list = [{"username": row["username"], "review_text": row["review_text"]} for row in reviews]
        return jsonify(reviews_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/profile', methods=['GET', 'POST'])
def profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized"}), 401

    username = auth_header.split(" ")[1]

    if request.method == 'GET':
        query_user = f"SELECT username, description FROM users WHERE username = '{username}'"
        user = query_db(query_user, one=True)

        query_orders = f"SELECT order_name, price FROM orders WHERE username = '{username}'"
        orders = query_db(query_orders)

        query_reviews = f"SELECT review_text FROM reviews WHERE username = '{username}'"
        reviews = query_db(query_reviews)

        if user:
            return jsonify({
                "username": user['username'],
                "description": user['description'],
                "orders": [{"name": order['order_name'], "price": order['price']} for order in orders],
                "reviews": [{"text": review['review_text']} for review in reviews]
            })
        else:
            return jsonify({"message": "User not found"}), 404

    elif request.method == 'POST':
        new_description = request.json.get('description', '')
        query_update = f"UPDATE users SET description = '{new_description}' WHERE username = '{username}'"
        try:
            execute_db(query_update)
            return jsonify({"message": "Profile updated successfully"})
        except Exception as e:
            return jsonify({"message": f"Database error: {e}"}), 500


app.register_blueprint(api)

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
