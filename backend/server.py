from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "user"
    uniform_required: str = "Standard Scout Uniform"

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    events_joined_count: int = 0
    achievements: List[str] = []

class UserWithToken(User):
    token: str

class EventBase(BaseModel):
    event_name: str
    date: str
    description: str

class Event(EventBase):
    model_config = ConfigDict(extra="ignore")
    created_by: str
    admins_joined: List[str] = []
    users_assigned: List[str] = []

class AchievementAdd(BaseModel):
    achievement: str

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"email": email}, {"_id": 0, "password_hash": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@api_router.post("/auth/register", response_model=UserWithToken)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    password = user_dict.pop("password")
    user_dict["password_hash"] = hash_password(password)
    user_dict["events_joined_count"] = 0
    user_dict["achievements"] = []
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user_data.email})
    user = User(**{k: v for k, v in user_dict.items() if k != "password_hash"})
    return UserWithToken(**user.model_dump(), token=token)

@api_router.post("/auth/login", response_model=UserWithToken)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": credentials.email})
    user_data = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    user_obj = User(**user_data)
    return UserWithToken(**user_obj.model_dump(), token=token)

@api_router.get("/users/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/users", response_model=List[User])
async def get_all_users(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [User(**u) for u in users]

@api_router.post("/users/{user_email}/achievements")
async def add_achievement(user_email: str, achievement_data: AchievementAdd, admin: User = Depends(require_admin)):
    user = await db.users.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"email": user_email},
        {"$addToSet": {"achievements": achievement_data.achievement}}
    )
    return {"message": "Achievement added successfully"}

@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventBase, admin: User = Depends(require_admin)):
    event_dict = event_data.model_dump()
    event_dict["created_by"] = admin.email
    event_dict["admins_joined"] = []
    event_dict["users_assigned"] = []
    
    await db.events.insert_one(event_dict)
    return Event(**event_dict)

@api_router.get("/events", response_model=List[Event])
async def get_events(current_user: User = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    return [Event(**e) for e in events]

@api_router.post("/events/{event_name}/assign-user")
async def assign_user_to_event(event_name: str, user_email: str, admin: User = Depends(require_admin)):
    event = await db.events.find_one({"event_name": event_name})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if user_email in event.get("users_assigned", []):
        raise HTTPException(status_code=400, detail="User already assigned to this event")
    
    user = await db.users.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.events.update_one(
        {"event_name": event_name},
        {"$addToSet": {"users_assigned": user_email}}
    )
    
    await db.users.update_one(
        {"email": user_email},
        {"$inc": {"events_joined_count": 1}}
    )
    
    return {"message": "User assigned to event successfully"}

@api_router.post("/events/{event_name}/join")
async def join_event_as_admin(event_name: str, admin: User = Depends(require_admin)):
    event = await db.events.find_one({"event_name": event_name})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if admin.email in event.get("admins_joined", []):
        raise HTTPException(status_code=400, detail="Already joined this event")
    
    await db.events.update_one(
        {"event_name": event_name},
        {"$addToSet": {"admins_joined": admin.email}}
    )
    
    return {"message": "Joined event successfully"}

@api_router.get("/stats")
async def get_stats(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({"role": "user"})
    total_events = await db.events.count_documents({})
    total_admins = await db.users.count_documents({"role": "admin"})
    
    return {
        "total_users": total_users,
        "total_events": total_events,
        "total_admins": total_admins
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()