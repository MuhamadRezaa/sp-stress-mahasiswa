from app.extensions import db

class PhysiologicalData(db.Model):
    __tablename__ = "physiological_data"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    activity_date = db.Column(db.Date, nullable=False)

    heart_rate_avg = db.Column(db.Integer, nullable=False)
    heart_rate_min = db.Column(db.Integer, nullable=False)
    heart_rate_max = db.Column(db.Integer, nullable=False)

    step_count = db.Column(db.Integer, nullable=False)
    sleep_duration_hours = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now(), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "activity_date", name="uq_user_physio_date"),
    )
