import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.core.database import Base, engine
from app.models.user import User  # noqa: F401

app = FastAPI(
    title="Project 0 Backend",
    version="1.0.0",
)

origins = [
    "http://localhost",
    "http://localhost:5500",
    "http://127.0.0.1",
    "http://127.0.0.1:5500",
    "https://portal-beige-eight.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    max_retries = 10
    retry_delay = 2

    for attempt in range(1, max_retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            print("Database connected and tables created.")
            break
        except OperationalError:
            if attempt == max_retries:
                raise
            print(f"Database not ready, retrying {attempt}/{max_retries}...")
            time.sleep(retry_delay)

app.include_router(health_router, prefix="/api/v1", tags=["health"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])