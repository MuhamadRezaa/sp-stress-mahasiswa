from datetime import date, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity

from app.utils.guards import roles_required
from app.models.user import User
from app.models.digital_activity import DigitalActivity
from app.models.physiological_data import PhysiologicalData
from app.models.pss10_response import PSS10Response

pa_bp = Blueprint("pa", __name__, url_prefix="/pa")


@pa_bp.get("/ping")
@roles_required("pa")
def ping_pa():
    return jsonify({"success": True, "message": "pong (pa)"})


@pa_bp.get("/students")
@roles_required("pa")
def list_students():
    """
    Daftar mahasiswa bimbingan PA yang sedang login,
    beserta status input hari ini dan skor PSS-10 terakhir.
    """
    pa_id = int(get_jwt_identity())
    today = date.today()

    students = User.query.filter_by(pa_id=pa_id, role="student").all()

    result = []
    for s in students:
        # Status hari ini
        has_digital = DigitalActivity.query.filter_by(user_id=s.id, activity_date=today).first() is not None
        has_physio = PhysiologicalData.query.filter_by(user_id=s.id, activity_date=today).first() is not None
        has_pss10 = PSS10Response.query.filter_by(user_id=s.id, activity_date=today).first() is not None

        # PSS-10 paling terakhir
        last_pss10 = (
            PSS10Response.query
            .filter_by(user_id=s.id)
            .order_by(PSS10Response.activity_date.desc())
            .first()
        )

        # Trend 30 hari terakhir
        thirty_days_ago = today - timedelta(days=30)
        trend = (
            PSS10Response.query
            .filter(PSS10Response.user_id == s.id,
                    PSS10Response.activity_date >= thirty_days_ago)
            .order_by(PSS10Response.activity_date.asc())
            .all()
        )

        result.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "university": s.university,
            "major": s.major,
            "semester": s.semester,
            "today_status": {
                "digital_activity": has_digital,
                "physiological": has_physio,
                "pss10": has_pss10,
                "all_complete": has_digital and has_physio and has_pss10,
            },
            "last_stress": {
                "date": last_pss10.activity_date.isoformat() if last_pss10 else None,
                "score": last_pss10.total_score if last_pss10 else None,
                "level": last_pss10.stress_level if last_pss10 else None,
            },
            "trend": [
                {
                    "date": r.activity_date.isoformat(),
                    "score": r.total_score,
                    "level": r.stress_level,
                }
                for r in trend
            ],
        })

    return jsonify({"success": True, "data": result}), 200


@pa_bp.get("/stats/stress-distribution")
@roles_required("pa")
def stress_distribution():
    """
    Distribusi low/medium/high untuk seluruh mahasiswa bimbingan PA.
    Berdasarkan skor PSS-10 terakhir masing-masing mahasiswa.
    """
    pa_id = int(get_jwt_identity())
    students = User.query.filter_by(pa_id=pa_id, role="student").all()

    counts = {"low": 0, "medium": 0, "high": 0, "no_data": 0}
    for s in students:
        last = (
            PSS10Response.query
            .filter_by(user_id=s.id)
            .order_by(PSS10Response.activity_date.desc())
            .first()
        )
        if last:
            counts[last.stress_level] += 1
        else:
            counts["no_data"] += 1

    return jsonify({"success": True, "data": counts}), 200
