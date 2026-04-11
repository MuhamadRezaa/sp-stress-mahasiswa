from flask import Blueprint, jsonify
from app.utils.guards import roles_required

student_bp = Blueprint("student", __name__, url_prefix="/student")

@student_bp.get("/ping")
@roles_required("student")
def ping_student():
    return jsonify({"success": True, "message": "pong (student)"})
