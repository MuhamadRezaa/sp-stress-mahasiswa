from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User

def main():
    app = create_app()
    with app.app_context():
        email = "admin@example.com"
        password = "admin12345"

        existing = User.query.filter_by(email=email).first()
        if existing:
            print("Admin already exists:", email)
            return

        admin = User(
            name="Admin",
            email=email,
            password_hash=generate_password_hash(password),  # <-- ini
            role="admin",
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin created:")
        print("  email:", email)
        print("  password:", password)

if __name__ == "__main__":
    main()
