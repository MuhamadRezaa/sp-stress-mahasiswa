from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.utils.guards import roles_required
from app.extensions import db
from app.models.digital_activity import DigitalActivity

student_digital_bp = Blueprint(
    "student_digital",
    __name__,
    url_prefix="/student/digital"
)

# CREATE / UPDATE (UPSERT)
@student_digital_bp.post("")
@roles_required("student")
def upsert_digital_activity():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    required = [
        "activity_date",
        "smartphone_duration_hours",
        "social_media_access_count",
        "social_media_duration_hours",
        "course_count",
        "task_count",
    ]
    for field in required:
        if field not in data:
            return jsonify({
                "success": False,
                "message": f"{field} wajib diisi"
            }), 400

    try:
        activity_date = datetime.strptime(
            data["activity_date"], "%Y-%m-%d"
        ).date()

        payload = {
            "smartphone_duration_hours": float(data["smartphone_duration_hours"]),
            "social_media_access_count": int(data["social_media_access_count"]),
            "social_media_duration_hours": float(data["social_media_duration_hours"]),
            "course_count": int(data["course_count"]),
            "task_count": int(data["task_count"]),
        }
    except Exception:
        return jsonify({
            "success": False,
            "message": "Format data tidak valid"
        }), 400

    record = DigitalActivity.query.filter_by(
        user_id=user_id,
        activity_date=activity_date
    ).first()

    if record:
        for k, v in payload.items():
            setattr(record, k, v)
        message = "Digital activity updated"
    else:
        record = DigitalActivity(
            user_id=user_id,
            activity_date=activity_date,
            **payload
        )
        db.session.add(record)
        message = "Digital activity created"

    db.session.commit()

    return jsonify({
        "success": True,
        "message": message
    }), 200


# READ (HISTORY)
@student_digital_bp.get("/history")
@roles_required("student")
def digital_activity_history():
    user_id = int(get_jwt_identity())

    records = (
        DigitalActivity.query
        .filter_by(user_id=user_id)
        .order_by(DigitalActivity.activity_date.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "data": [
            {
                "activity_date": r.activity_date.isoformat(),
                "smartphone_duration_hours": r.smartphone_duration_hours,
                "social_media_access_count": r.social_media_access_count,
                "social_media_duration_hours": r.social_media_duration_hours,
                "course_count": r.course_count,
                "task_count": r.task_count,
            }
            for r in records
        ]
    }), 200
