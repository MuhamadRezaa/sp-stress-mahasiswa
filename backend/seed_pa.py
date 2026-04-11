from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User

def main():
    app = create_app()
    with app.app_context():
        email = "pa@example.com"
        password = "pa12345"

        existing = User.query.filter_by(email=email).first()
        if existing:
            print("PA already exists:", email)
            return

        pa = User(
            name="PA",
            email=email,
            password_hash=generate_password_hash(password),  # <-- ini
            role="pa",
            gender="P",
            university="Universitas Kebangsaan"
        )
        db.session.add(pa)
        db.session.commit()
        print("PA created:")
        print("  email:", email)
        print("  password:", password)

if __name__ == "__main__":
    main()
