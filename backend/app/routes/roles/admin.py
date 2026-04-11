from flask import Blueprint, jsonify
from app.utils.guards import roles_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

@admin_bp.get("/ping")
@roles_required("admin")
def ping_admin():
    return jsonify({"success": True, "message": "pong (admin)"})
