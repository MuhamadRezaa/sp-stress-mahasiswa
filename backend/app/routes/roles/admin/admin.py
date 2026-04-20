import csv
import io
from datetime import date, datetime, timedelta

from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash

from app.utils.guards import roles_required
from app.extensions import db
from app.models.user import User
from app.models.digital_activity import DigitalActivity
from app.models.physiological_data import PhysiologicalData
from app.models.pss10_response import PSS10Response

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


# ─── PING ────────────────────────────────────────────────────────────────────

@admin_bp.get("/ping")
@roles_required("admin")
def ping_admin():
    return jsonify({"success": True, "message": "pong (admin)"})


# ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

@admin_bp.get("/users")
@roles_required("admin")
def list_users():
    """List semua user, bisa filter by role."""
    role_filter = request.args.get("role")  # student | pa | admin | None

    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"success": True, "data": [_user_summary(u) for u in users]}), 200


@admin_bp.post("/users")
@roles_required("admin")
def create_user():
    """Buat user baru (student atau pa)."""
    data = request.get_json(silent=True) or {}
    required = ["name", "email", "password", "role"]
    for f in required:
        if not data.get(f):
            return jsonify({"success": False, "message": f"{f} wajib diisi"}), 400

    if data["role"] not in ("student", "pa", "admin"):
        return jsonify({"success": False, "message": "Role tidak valid"}), 400

    if User.query.filter_by(email=data["email"].strip().lower()).first():
        return jsonify({"success": False, "message": "Email sudah digunakan"}), 409

    user = User(
        name=data["name"].strip(),
        email=data["email"].strip().lower(),
        password_hash=generate_password_hash(data["password"]),
        role=data["role"],
        university=data.get("university"),
        major=data.get("major"),
        semester=data.get("semester"),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User berhasil dibuat", "data": _user_summary(user)}), 201


@admin_bp.patch("/users/<int:user_id>")
@roles_required("admin")
def update_user(user_id):
    """Update data user tertentu."""
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}

    # PROTEKSI: Admin tidak boleh mengubah data/role user yang rolenya 'admin'
    # Ini untuk mencegah admin mengubah admin lain atau dirinya sendiri menjadi role lain
    if user.role == "admin" and "role" in data and data["role"] != "admin":
        return jsonify({
            "success": False, 
            "message": "Role Admin tidak dapat diubah ke role lain demi keamanan"
        }), 403

    allowed = ["name", "gender", "age", "phone", "university", "major", "semester",
               "residential_status", "role", "pa_id"]
    for field in allowed:
        if field in data:
            # Validasi tambahan jika ingin mengubah ke role admin
            if field == "role" and data["role"] not in ("student", "pa", "admin"):
                continue
            setattr(user, field, data[field])

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

    return jsonify({"success": True, "message": "User diperbarui", "data": _user_summary(user)}), 200


@admin_bp.delete("/users/<int:user_id>")
@roles_required("admin")
def delete_user(user_id):
    """Hapus user."""
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User dihapus"}), 200


# ─── PA ASSIGNMENT ───────────────────────────────────────────────────────────

@admin_bp.post("/assign-pa")
@roles_required("admin")
def assign_pa():
    """
    Assign satu atau lebih student ke PA.
    Body: { "student_ids": [1, 2, ...], "pa_id": 5 }
    """
    data = request.get_json(silent=True) or {}
    student_ids = data.get("student_ids", [])
    pa_id = data.get("pa_id")  # None = unassign

    if not student_ids:
        return jsonify({"success": False, "message": "student_ids wajib diisi"}), 400

    if pa_id is not None:
        pa = User.query.filter_by(id=pa_id, role="pa").first()
        if not pa:
            return jsonify({"success": False, "message": "Dosen PA tidak ditemukan"}), 404

    updated = 0
    for sid in student_ids:
        student = User.query.filter_by(id=sid, role="student").first()
        if student:
            student.pa_id = pa_id
            updated += 1

    db.session.commit()
    return jsonify({"success": True, "message": f"{updated} mahasiswa berhasil di-assign"}), 200


# ─── ANALYTICS ───────────────────────────────────────────────────────────────

@admin_bp.get("/stats/stress-trend")
@roles_required("admin")
def stress_trend():
    """
    Rata-rata skor PSS-10 per hari untuk 30 hari terakhir.
    """
    from sqlalchemy import func
    thirty_days_ago = date.today() - timedelta(days=30)

    rows = (
        db.session.query(
            PSS10Response.activity_date,
            func.avg(PSS10Response.total_score).label("avg_score"),
            func.count(PSS10Response.id).label("count"),
        )
        .filter(PSS10Response.activity_date >= thirty_days_ago)
        .group_by(PSS10Response.activity_date)
        .order_by(PSS10Response.activity_date.asc())
        .all()
    )

    return jsonify({
        "success": True,
        "data": [
            {
                "date": r.activity_date.isoformat(),
                "avg_score": round(float(r.avg_score), 2),
                "count": r.count,
            }
            for r in rows
        ]
    }), 200


@admin_bp.get("/stats/stress-distribution")
@roles_required("admin")
def stress_distribution():
    """
    Distribusi low/medium/high berdasarkan skor PSS-10 terakhir setiap mahasiswa.
    """
    students = User.query.filter_by(role="student").all()
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

    total_students = len(students)
    return jsonify({
        "success": True,
        "total_students": total_students,
        "data": counts,
    }), 200


# ─── EXPORT CSV ──────────────────────────────────────────────────────────────

@admin_bp.get("/export")
@roles_required("admin")
def export_data():
    """
    Export data riset dalam format CSV (flattened).
    Query params:
      - start_date: YYYY-MM-DD (optional)
      - end_date:   YYYY-MM-DD (optional)
      - format:     csv (default) | json
    """
    start_str = request.args.get("start_date")
    end_str = request.args.get("end_date")
    fmt = request.args.get("format", "csv")

    start_date = None
    end_date = None
    try:
        if start_str:
            start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
        if end_str:
            end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"success": False, "message": "Format tanggal tidak valid (YYYY-MM-DD)"}), 400

    # Ambil semua student
    students = User.query.filter_by(role="student").all()
    student_map = {s.id: s for s in students}

    # Ambil PSS10 records (filter date)
    pss10_q = PSS10Response.query.filter(PSS10Response.user_id.in_(student_map.keys()))
    if start_date:
        pss10_q = pss10_q.filter(PSS10Response.activity_date >= start_date)
    if end_date:
        pss10_q = pss10_q.filter(PSS10Response.activity_date <= end_date)
    pss10_records = {(r.user_id, r.activity_date): r for r in pss10_q.all()}

    # Ambil Digital Activity records
    digital_q = DigitalActivity.query.filter(DigitalActivity.user_id.in_(student_map.keys()))
    if start_date:
        digital_q = digital_q.filter(DigitalActivity.activity_date >= start_date)
    if end_date:
        digital_q = digital_q.filter(DigitalActivity.activity_date <= end_date)
    digital_records = {(r.user_id, r.activity_date): r for r in digital_q.all()}

    # Ambil Physio records
    physio_q = PhysiologicalData.query.filter(PhysiologicalData.user_id.in_(student_map.keys()))
    if start_date:
        physio_q = physio_q.filter(PhysiologicalData.activity_date >= start_date)
    if end_date:
        physio_q = physio_q.filter(PhysiologicalData.activity_date <= end_date)
    physio_records = {(r.user_id, r.activity_date): r for r in physio_q.all()}

    # Himpunan semua tanggal yang ada data
    all_keys = set(pss10_records.keys()) | set(digital_records.keys()) | set(physio_records.keys())

    rows = []
    for (user_id, act_date) in sorted(all_keys, key=lambda x: (x[0], x[1])):
        student = student_map.get(user_id)
        if not student:
            continue
        pss10 = pss10_records.get((user_id, act_date))
        digital = digital_records.get((user_id, act_date))
        physio = physio_records.get((user_id, act_date))

        # Cari nama PA
        pa_name = student.pa.name if student.pa else None

        row = {
            # Identitas
            "student_id": student.id,
            "student_name": student.name,
            "student_email": student.email,
            "university": student.university or "",
            "major": student.major or "",
            "semester": student.semester or "",
            "gender": student.gender or "",
            "age": student.age or "",
            "residential_status": student.residential_status or "",
            "pa_name": pa_name or "",
            # Tanggal
            "activity_date": act_date.isoformat(),
            "day_type": digital.day_type if digital else "",
            # PSS-10
            "pss10_q1": pss10.q1 if pss10 else "",
            "pss10_q2": pss10.q2 if pss10 else "",
            "pss10_q3": pss10.q3 if pss10 else "",
            "pss10_q4": pss10.q4 if pss10 else "",
            "pss10_q5": pss10.q5 if pss10 else "",
            "pss10_q6": pss10.q6 if pss10 else "",
            "pss10_q7": pss10.q7 if pss10 else "",
            "pss10_q8": pss10.q8 if pss10 else "",
            "pss10_q9": pss10.q9 if pss10 else "",
            "pss10_q10": pss10.q10 if pss10 else "",
            "pss10_total_score": pss10.total_score if pss10 else "",
            "pss10_stress_level": pss10.stress_level if pss10 else "",
            # Physiological
            "heart_rate_avg": physio.heart_rate_avg if physio else "",
            "heart_rate_min": physio.heart_rate_min if physio else "",
            "heart_rate_max": physio.heart_rate_max if physio else "",
            "step_count": physio.step_count if physio else "",
            "sleep_duration_hours": physio.sleep_duration_hours if physio else "",
            # Digital Activity
            "smartphone_duration_hours": digital.smartphone_duration_hours if digital else "",
            "social_media_access_count": digital.social_media_access_count if digital else "",
            "social_media_duration_hours": digital.social_media_duration_hours if digital else "",
            "course_count": digital.course_count if digital else "",
            "task_count": digital.task_count if digital else "",
        }
        rows.append(row)

    if fmt == "json":
        return jsonify({"success": True, "count": len(rows), "data": rows}), 200

    # CSV output
    if not rows:
        return jsonify({"success": True, "message": "Tidak ada data untuk diekspor"}), 200

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)
    csv_data = output.getvalue()

    filename = f"stress_export_{date.today().isoformat()}.csv"
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ─── HELPER ──────────────────────────────────────────────────────────────────

def _user_summary(user: User) -> dict:
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
        "pa_id": user.pa_id,
        "pa_name": user.pa.name if user.pa else None,
        "created_at": user.created_at.isoformat(),
    }
