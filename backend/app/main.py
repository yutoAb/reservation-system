from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import auth, reservations, time_slots

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reservation System API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(reservations.router)
app.include_router(time_slots.router)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
