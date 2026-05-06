from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from PIL import Image
from datetime import datetime

from app.extensions import db
from app.models.user import User
from app.extensions import limiter

# Library Google Auth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.post("/login")
@limiter.limit("5 per minute", error_message="Terlalu banyak percobaan login. Coba lagi dalam 1 menit.")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"success": False, "message": "Email dan password wajib diisi"}), 400

    user = User.query.filter_by(email=email).first()
    if (not user) or (not check_password_hash(user.password_hash, password)):
        return jsonify({"success": False, "message": "Email atau password salah"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "access_token": access_token,
        "user": user_to_dict(user)
    }), 200

@auth_bp.post("/google")
def google_login():
    """
    Login/Register via Google.
    Body: { "token": "id_token_from_google" }
    """
    data = request.get_json(silent=True) or {}
    token = data.get("token")

    if not token:
        return jsonify({"success": False, "message": "Token Google wajib disertakan"}), 400

    try:
        # 1. Verifikasi Token dari Google
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        email = None
        name = None
        google_id = None

        # Coba verifikasi sebagai ID Token (JWT) dulu
        try:
            id_info = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
            email = id_info.get("email").strip().lower()
            name = id_info.get("name")
            google_id = id_info.get("sub")
            picture = id_info.get("picture") # Ambil foto profil
        except Exception:
            # Jika gagal, coba verifikasi sebagai Access Token (untuk custom button)
            import requests as py_requests
            userinfo_res = py_requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}")
            if userinfo_res.status_code == 200:
                user_data = userinfo_res.json()
                email = user_data.get("email").strip().lower()
                name = user_data.get("name")
                google_id = user_data.get("sub")
                picture = user_data.get("picture") # Ambil foto profil
            else:
                return jsonify({"success": False, "message": "Token Google tidak valid"}), 401

        if not email:
            return jsonify({"success": False, "message": "Gagal mengambil data email dari Google"}), 400

        # 2. Cari user berdasarkan email
        user = User.query.filter_by(email=email).first()

        if user:
            # Skenario: User sudah ada (Manual atau Google)
            # Update google_id dan profile_picture jika belum ada
            if not user.google_id:
                user.google_id = google_id
            
            # Jika belum ada foto profil, gunakan foto dari Google
            if not user.profile_picture and picture:
                user.profile_picture = picture
                
            db.session.commit()
        else:
            # Skenario: User baru pertama kali daftar
            user = User(
                name=name,
                email=email,
                google_id=google_id,
                profile_picture=picture, # Simpan foto dari Google
                role="student" # Default role
            )
            db.session.add(user)
            db.session.commit()

        # 4. Generate JWT Token aplikasi kita
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "success": True,
            "message": "Login berhasil",
            "access_token": access_token,
            "user": user_to_dict(user)
        }), 200

    except ValueError:
        return jsonify({"success": False, "message": "Token Google tidak valid"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



@auth_bp.post("/register")
@limiter.limit("3 per minute", error_message="Terlalu banyak permintaan registrasi. Coba lagi dalam 1 menit.")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Nama, email, dan password wajib diisi"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email sudah terdaftar"}), 400

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role="student"
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "success": True,
        "message": "Registrasi berhasil",
        "access_token": access_token,
        "user": user_to_dict(user)
    }), 201


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    return jsonify({
        "success": True,
        "user": user_to_dict(user)
    }), 200


@auth_bp.patch("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    data = request.get_json(silent=True) or {}
    
    # List of allowed fields to update
    allowed_fields = [
        "name", "gender", "age", "phone"
    ]
    
    # Conditional fields based on role
    if user.role == "student":
        allowed_fields.extend(["university", "major", "semester", "residential_status"])
    elif user.role == "pa":
        allowed_fields.extend(["university", "major"])

    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    return jsonify({
        "success": True,
        "message": "Profil berhasil diperbarui",
        "user": user_to_dict(user)
    }), 200


@auth_bp.post("/profile-picture")
@jwt_required()
def upload_profile_picture():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))

    if not user:
        return jsonify({"success": False, "message": "User tidak ditemukan"}), 404

    if "file" not in request.files:
        return jsonify({"success": False, "message": "Tidak ada file yang diunggah"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "message": "Tidak ada file yang dipilih"}), 400

    # Validate file extension
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
    extension = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({"success": False, "message": "Format file tidak didukung. Harap unggah jpg, jpeg, png, atau webp."}), 400

    try:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        # Delete old profile picture if exists
        if user.profile_picture:
            old_filename = os.path.basename(user.profile_picture)
            old_filepath = os.path.join(upload_dir, old_filename)
            if os.path.exists(old_filepath):
                os.remove(old_filepath)

        # Secure filename and convert to WebP
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        clean_name = user.name.replace(" ", "_")
        filename = secure_filename(f"{clean_name}_{timestamp}")
        webp_filename = f"{filename}.webp"
        filepath = os.path.join(upload_dir, webp_filename)

        # Open image and convert to WebP
        image = Image.open(file)
        
        # Ensure image is in RGB mode for WebP conversion
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Resize if too large (e.g., max 500x500)
        image.thumbnail((500, 500))
        
        # Save as WebP with optimized quality
        image.save(filepath, "WEBP", quality=80)

        # Update user profile picture path
        user.profile_picture = f"/static/uploads/{webp_filename}"
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Foto profil berhasil diunggah",
            "profile_picture": user.profile_picture
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": f"Gagal mengunggah foto: {str(e)}"}), 500


def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "gender": user.gender,
        "age": user.age,
        "university": user.university,
        "major": user.major,
        "semester": user.semester,
        "residential_status": user.residential_status,
        "phone": user.phone,
        "profile_picture": user.profile_picture,
        "pa_id": user.pa_id,
        "pa_name": user.pa.name if user.pa else None,
    }
