from flask import Blueprint, jsonify
from app.utils.guards import roles_required

pa_bp = Blueprint("pa", __name__, url_prefix="/pa")

@pa_bp.get("/ping")
@roles_required("pa")
def ping_pa():
    return jsonify({"success": True, "message": "pong (pa)"})
