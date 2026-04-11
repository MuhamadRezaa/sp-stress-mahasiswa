from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.utils.guards import roles_required
from app.extensions import db
from app.models.physiological_data import PhysiologicalData

student_physio_bp = Blueprint("student_physio", __name__, url_prefix="/student/physio")


@student_physio_bp.post("")
@roles_required("student")
def upsert_physio():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    required = [
        "activity_date",
        "heart_rate_avg",
        "heart_rate_min",
        "heart_rate_max",
        "step_count",
        "sleep_duration_hours",
    ]
    for field in required:
        if field not in data:
            return jsonify({"success": False, "message": f"{field} wajib diisi"}), 400

    try:
        activity_date = datetime.strptime(data["activity_date"], "%Y-%m-%d").date()
        payload = {
            "heart_rate_avg": int(data["heart_rate_avg"]),
            "heart_rate_min": int(data["heart_rate_min"]),
            "heart_rate_max": int(data["heart_rate_max"]),
            "step_count": int(data["step_count"]),
            "sleep_duration_hours": float(data["sleep_duration_hours"]),
        }
    except Exception:
        return jsonify({"success": False, "message": "Format data tidak valid"}), 400

    # validasi sederhana (opsional tapi bagus)
    if not (payload["heart_rate_min"] <= payload["heart_rate_avg"] <= payload["heart_rate_max"]):
        return jsonify({"success": False, "message": "heart_rate harus min <= avg <= max"}), 400
    if payload["sleep_duration_hours"] < 0 or payload["sleep_duration_hours"] > 24:
        return jsonify({"success": False, "message": "sleep_duration_hours harus 0-24"}), 400
    if payload["step_count"] < 0:
        return jsonify({"success": False, "message": "step_count tidak boleh negatif"}), 400

    record = PhysiologicalData.query.filter_by(user_id=user_id, activity_date=activity_date).first()

    if record:
        for k, v in payload.items():
            setattr(record, k, v)
        msg = "Physiological data updated"
    else:
        record = PhysiologicalData(user_id=user_id, activity_date=activity_date, **payload)
        db.session.add(record)
        msg = "Physiological data created"

    db.session.commit()
    return jsonify({"success": True, "message": msg}), 200


@student_physio_bp.get("/history")
@roles_required("student")
def history_physio():
    user_id = int(get_jwt_identity())

    records = (
        PhysiologicalData.query
        .filter_by(user_id=user_id)
        .order_by(PhysiologicalData.activity_date.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "data": [
            {
                "activity_date": r.activity_date.isoformat(),
                "heart_rate_avg": r.heart_rate_avg,
                "heart_rate_min": r.heart_rate_min,
                "heart_rate_max": r.heart_rate_max,
                "step_count": r.step_count,
                "sleep_duration_hours": r.sleep_duration_hours,
            }
            for r in records
        ]
    }), 200
