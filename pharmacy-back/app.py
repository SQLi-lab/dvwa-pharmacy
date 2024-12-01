from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
# Настройка CORS
CORS(app, supports_credentials=True, origins="http://localhost:3000")


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

        # Устанавливаем куки вручную с Partitioned
        cookie_value = f"user={username}; Path=/; SameSite=None; Secure; Partitioned"
        resp.headers.add('Set-Cookie', cookie_value)

        return resp
    else:
        return jsonify({"message": "Invalid credentials"}), 401


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

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    session = request.cookies.get('session')
    if not session:
        return jsonify({"message": "Unauthorized"}), 401

    # Извлекаем имя пользователя из куки
    username = session.split('=')[1]
    print(username)
    if request.method == 'GET':
        # Уязвимый SQL-запрос для получения профиля
        query = f"SELECT username, description FROM users WHERE username = '{username}'"
        user = query_db(query, one=True)
        print(query)
        if user:
            return jsonify({"username": user[0], "description": user[1]})
        else:
            return jsonify({"message": "User not found"}), 404

    elif request.method == 'POST':
        # Уязвимый SQL-запрос для обновления описания
        new_description = request.json.get('description', '')
        query = f"UPDATE users SET description = '{new_description}' WHERE username = '{username}'"
        try:
            conn = sqlite3.connect('pharmacy.db')  # Подключение к базе данных
            cursor = conn.cursor()
            cursor.execute(query)  # Выполнение уязвимого запроса
            conn.commit()
            return jsonify({"message": "Profile updated successfully"})
        except sqlite3.Error as e:
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
