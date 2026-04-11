from flask import Flask
from app.config import Config
from app.extensions import db, migrate, jwt, cors
from app.routes.health import health_bp
from app.routes.auth import auth_bp
from app.routes import admin_bp, student_bp, pa_bp
from app.routes import student_digital_bp, student_pss10_bp, student_physio_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    from app import models
    
    # register routes
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    # ADMIN
    app.register_blueprint(admin_bp)
    # STUDENT
    app.register_blueprint(student_bp)
    app.register_blueprint(student_digital_bp)
    app.register_blueprint(student_physio_bp)
    app.register_blueprint(student_pss10_bp)
    # PA
    app.register_blueprint(pa_bp)

    return app
