from .logging_control import bp as logging_bp

def register_admin_routes(app):
    app.register_blueprint(logging_bp)
