from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity

from app.utils.guards import roles_required
from app.models.digital_activity import DigitalActivity
from app.models.physiological_data import PhysiologicalData
from app.models.pss10_response import PSS10Response

student_bp = Blueprint("student", __name__, url_prefix="/student")


@student_bp.get("/ping")
@roles_required("student")
def ping_student():
    return jsonify({"success": True, "message": "pong (student)"})


@student_bp.get("/daily-status")
@roles_required("student")
def daily_status():
    """
    Cek apakah student sudah mengisi data untuk tanggal tertentu (default: hari ini).
    Query param: ?date=YYYY-MM-DD
    """
    user_id = int(get_jwt_identity())

    date_str = request.args.get("date")
    if date_str:
        try:
            from datetime import datetime
            check_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"success": False, "message": "Format tanggal tidak valid (YYYY-MM-DD)"}), 400
    else:
        check_date = date.today()

    has_digital = DigitalActivity.query.filter_by(
        user_id=user_id, activity_date=check_date
    ).first() is not None

    has_physio = PhysiologicalData.query.filter_by(
        user_id=user_id, activity_date=check_date
    ).first() is not None

    has_pss10 = PSS10Response.query.filter_by(
        user_id=user_id, activity_date=check_date
    ).first() is not None

    all_complete = has_digital and has_physio and has_pss10

    return jsonify({
        "success": True,
        "date": check_date.isoformat(),
        "status": {
            "digital_activity": has_digital,
            "physiological": has_physio,
            "pss10": has_pss10,
            "all_complete": all_complete,
        }
    }), 200
