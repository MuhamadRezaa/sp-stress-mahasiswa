from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.utils.guards import roles_required
from app.extensions import db
from app.models.pss10_response import PSS10Response

student_pss10_bp = Blueprint("student_pss10", __name__, url_prefix="/student/pss10")


def compute_pss10_score(answers: dict) -> int:
    """
    answers: {"q1":0..4, ..., "q10":0..4}
    Q1-Q6: normal scoring (0-4)
    Q7-Q10: reverse scoring (4-0)
    """
    reverse_items = {"q7", "q8", "q9", "q10"}
    total = 0
    for i in range(1, 11):
        key = f"q{i}"
        v = int(answers[key])
        if key in reverse_items:
            v = 4 - v
        total += v
    return total


def to_level(total_score: int) -> str:
    # rendah 0–13, sedang 14–26, tinggi 27–40
    if 0 <= total_score <= 13:
        return "low"
    if 14 <= total_score <= 26:
        return "medium"
    return "high"


@student_pss10_bp.post("")
@roles_required("student")
def upsert_pss10():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    # validasi field wajib
    required = ["activity_date"] + [f"q{i}" for i in range(1, 11)]
    for k in required:
        if k not in data:
            return jsonify({"success": False, "message": f"{k} wajib diisi"}), 400

    # parse & validasi nilai 0-4
    try:
        activity_date = datetime.strptime(data["activity_date"], "%Y-%m-%d").date()
        answers = {}
        for i in range(1, 11):
            key = f"q{i}"
            v = int(data[key])
            if v < 0 or v > 4:
                return jsonify({"success": False, "message": f"{key} harus 0-4"}), 400
            answers[key] = v
    except Exception:
        return jsonify({"success": False, "message": "Format data tidak valid"}), 400

    total_score = compute_pss10_score(answers)
    stress_level = to_level(total_score)

    record = PSS10Response.query.filter_by(user_id=user_id, activity_date=activity_date).first()

    if record:
        # update jawaban + skor
        for k, v in answers.items():
            setattr(record, k, v)
        record.total_score = total_score
        record.stress_level = stress_level
        msg = "PSS-10 updated"
    else:
        record = PSS10Response(
            user_id=user_id,
            activity_date=activity_date,
            **answers,
            total_score=total_score,
            stress_level=stress_level,
        )
        db.session.add(record)
        msg = "PSS-10 created"

    db.session.commit()
    return jsonify({
        "success": True,
        "message": msg,
        "total_score": total_score,
        "stress_level": stress_level
    }), 200


@student_pss10_bp.get("/history")
@roles_required("student")
def history_pss10():
    user_id = int(get_jwt_identity())

    records = (
        PSS10Response.query
        .filter_by(user_id=user_id)
        .order_by(PSS10Response.activity_date.desc())
        .all()
    )

    return jsonify({
        "success": True,
        "data": [
            {
                "activity_date": r.activity_date.isoformat(),
                "total_score": r.total_score,
                "stress_level": r.stress_level,
                "answers": {f"q{i}": getattr(r, f"q{i}") for i in range(1, 11)},
            }
            for r in records
        ]
    }), 200
