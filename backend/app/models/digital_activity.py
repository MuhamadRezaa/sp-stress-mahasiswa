from app.extensions import db

class DigitalActivity(db.Model):
    __tablename__ = "digital_activities"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    activity_date = db.Column(db.Date, nullable=False)

    day_type = db.Column(db.String(50), nullable=False, default="perkuliahan")
    smartphone_duration_hours = db.Column(db.String(50), nullable=False)
    social_media_access_count = db.Column(db.String(50), nullable=False)
    social_media_duration_hours = db.Column(db.String(50), nullable=False)
    course_count = db.Column(db.String(50), nullable=False)
    task_count = db.Column(db.String(50), nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now(),
        nullable=False
    )

    __table_args__ = (
        db.UniqueConstraint("user_id", "activity_date", name="uq_user_activity_date"),
    )
