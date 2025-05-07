from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///munch_express.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'secret_key'  # Used for user sessions (JWT or Flask session)

db = SQLAlchemy(app)

# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    user = db.relationship('User', backref=db.backref('carts', lazy=True))
    product = db.relationship('Product', backref=db.backref('carts', lazy=True))

# Create database tables
with app.app_context():
    db.create_all()


@app.route('/home')
def index():
    return "welcome to food delivery app"

# Register a new user
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, email=email, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully!"}), 201

# Login user
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": f"Welcome back, {user.username}!"}), 200

# Get all products
@app.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify({"products": [product.serialize() for product in products]})

# Add a product (admin-only for simplicity)
@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')

    new_product = Product(name=name, description=description, price=price)
    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Product added successfully!"}), 201

# Add product to cart
@app.route('/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    user = User.query.get(user_id)
    product = Product.query.get(product_id)

    if not user or not product:
        return jsonify({"message": "User or Product not found"}), 404

    cart_item = Cart(user_id=user.id, product_id=product.id, quantity=quantity)

    db.session.add(cart_item)
    db.session.commit()

    return jsonify({"message": "Product added to cart successfully!"}), 201

# View user's cart
@app.route('/cart/<int:user_id>', methods=['GET'])
def view_cart(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    cart_items = Cart.query.filter_by(user_id=user.id).all()
    cart_details = [
        {
            "product_name": item.product.name,
            "quantity": item.quantity,
            "total_price": item.quantity * item.product.price
        }
        for item in cart_items
    ]

    return jsonify({"cart": cart_details})

# Checkout - User can clear the cart (simulated)
@app.route('/checkout/<int:user_id>', methods=['POST'])
def checkout(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    cart_items = Cart.query.filter_by(user_id=user.id).all()

    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400

    total_amount = sum(item.quantity * item.product.price for item in cart_items)
    
    # Simulate payment (clearing the cart)
    for item in cart_items:
        db.session.delete(item)
    db.session.commit()

    return jsonify({"message": f"Checkout successful! Total: ${total_amount:.2f}"}), 200

# Error handling for 404
@app.errorhandler(404)
def not_found_error(error):
    return make_response(jsonify({"message": "Resource not found"}), 404)

# Error handling for 500
@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return make_response(jsonify({"message": "Internal server error"}), 500)

# Helper function to serialize Product objects
def serialize_product(self):
    return {
        "id": self.id,
        "name": self.name,
        "description": self.description,
        "price": self.price,
        "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }

Product.serialize = serialize_product

# Running the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5555)