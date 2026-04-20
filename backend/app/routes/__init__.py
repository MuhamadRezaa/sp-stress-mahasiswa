# ROLES
from .roles.admin.admin import admin_bp

from .roles.pa.pa import pa_bp

from .roles.student.student import student_bp
from .roles.student.student_digital import student_digital_bp
from .roles.student.student_physio import student_physio_bp
from .roles.student.student_pss10 import student_pss10_bp

from .health import health_bp