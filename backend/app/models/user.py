from datetime import datetime
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("student", "pa", "admin", name="user_role"), nullable=False, default="student")

    # PA assignment (for students: FK to their Dosen PA)
    pa_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    pa = db.relationship("User", remote_side="User.id", foreign_keys=[pa_id], backref="students")

    # Profile information
    gender = db.Column(db.Enum("L", "P", name="gender_enum"), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    university = db.Column(db.String(255), nullable=True)
    major = db.Column(db.String(255), nullable=True)
    semester = db.Column(db.Integer, nullable=True)
    residential_status = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
