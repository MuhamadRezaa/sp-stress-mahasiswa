from werkzeug.security import generate_password_hash
from app import create_app
from app.extensions import db
from app.models.user import User

def main():
    app = create_app()
    with app.app_context():
        email = "student@example.com"
        password = "student12345"

        existing = User.query.filter_by(email=email).first()
        if existing:
            print("Student already exists:", email)
            return

        student = User(
            name="Student",
            email=email,
            password_hash=generate_password_hash(password),  # <-- ini
            role="student",
            gender="L",
            age=20,
            university="Universitas Kebangsaan",
            major="Teknik Informatika",
            semester=4,
            residential_status="Kos"
        )
        db.session.add(student)
        db.session.commit()
        print("Admin created:")
        print("  email:", email)
        print("  password:", password)

if __name__ == "__main__":
    main()
