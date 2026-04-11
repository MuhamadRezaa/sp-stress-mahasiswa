from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email dan password wajib diisi"}), 400

    user = User.query.filter_by(email=email).first()
    if (not user) or (not check_password_hash(user.password_hash, password)):
        return jsonify({"success": False, "message": "Email atau password salah"}), 401

    # simpan user id di token (string biar aman cross-platform)
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()  # string dari token
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200
