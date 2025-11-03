from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil
from auth import get_password_hash, verify_password, create_access_token, decode_access_token
from email_service import send_order_confirmation_emails, send_contact_form_email


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    role: str = "user"  # "admin" or "user"
    approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    approved: bool
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# E-commerce Models
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    category_id: str
    images: List[str] = []
    stock: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    category_id: str
    images: List[str] = []
    stock: int = 0
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    category_id: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None

class Promotion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    discount_percent: float
    start_date: datetime
    end_date: datetime
    product_ids: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PromotionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    discount_percent: float
    start_date: datetime
    end_date: datetime
    product_ids: List[str] = []
    is_active: bool = True

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: Optional[str] = None
    city: Optional[str] = None
    items: List[OrderItem]
    subtotal: float
    shipping_cost: float = 0
    total: float
    payment_method: str = "cash"  # cash, bank_transfer, bit, credit_card
    status: str = "pending"  # pending, confirmed, shipped, delivered, cancelled
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: Optional[str] = None
    city: Optional[str] = None
    items: List[OrderItem]
    subtotal: float
    shipping_cost: float = 0
    total: float
    payment_method: str = "cash"
    notes: Optional[str] = None

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str
    subject: Optional[str] = None
    message: str

# Dependency to get current user from token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user_email = payload.get("sub")
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = await db.users.find_one({"email": user_email}, {"_id": 0})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

# Dependency to check if user is admin
async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Auth Routes
@api_router.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserSignup):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    password_hash = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        password_hash=password_hash,
        role="user",
        approved=False
    )
    
    # Save to database
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        approved=user.approved,
        created_at=user.created_at
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is approved (only for non-admin users)
    if user["role"] != "admin" and not user.get("approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending approval by an administrator"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["email"]})
    
    # Parse created_at if it's a string
    created_at = user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            approved=user["approved"],
            created_at=created_at
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    created_at = current_user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        role=current_user["role"],
        approved=current_user["approved"],
        created_at=created_at
    )

# Admin Routes
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    
    result = []
    for user in users:
        created_at = user['created_at']
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        result.append(UserResponse(
            id=user["id"],
            email=user["email"],
            role=user["role"],
            approved=user["approved"],
            created_at=created_at
        ))
    
    return result

@api_router.put("/admin/approve/{user_id}", response_model=UserResponse)
async def approve_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user approval status
    await db.users.update_one({"id": user_id}, {"$set": {"approved": True}})
    
    user["approved"] = True
    created_at = user['created_at']
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        role=user["role"],
        approved=user["approved"],
        created_at=created_at
    )

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deleted successfully"}

# ==================== CATEGORIES API ====================
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all categories - public endpoint"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/admin/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_admin: dict = Depends(get_current_admin)):
    """Create new category - admin only"""
    category = Category(**category_data.model_dump())
    cat_dict = category.model_dump()
    cat_dict['created_at'] = cat_dict['created_at'].isoformat()
    await db.categories.insert_one(cat_dict)
    return category

@api_router.put("/admin/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate, current_admin: dict = Depends(get_current_admin)):
    """Update category - admin only"""
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": category_data.model_dump(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(category.get('created_at'), str):
        category['created_at'] = datetime.fromisoformat(category['created_at'])
    return Category(**category)

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete category - admin only"""
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# ==================== PRODUCTS API ====================
@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None):
    """Get all active products - public endpoint"""
    query = {"is_active": True}
    if category_id:
        query["category_id"] = category_id
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/admin/products", response_model=List[Product])
async def get_all_products(current_admin: dict = Depends(get_current_admin)):
    """Get all products including inactive - admin only"""
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod.get('created_at'), str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product - public endpoint"""
    product = await db.products.find_one({"id": product_id, "is_active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

@api_router.post("/admin/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_admin: dict = Depends(get_current_admin)):
    """Create new product - admin only"""
    product = Product(**product_data.model_dump())
    prod_dict = product.model_dump()
    prod_dict['created_at'] = prod_dict['created_at'].isoformat()
    await db.products.insert_one(prod_dict)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate, current_admin: dict = Depends(get_current_admin)):
    """Update product - admin only"""
    update_data = product_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete product - admin only"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# ==================== PROMOTIONS API ====================
@api_router.get("/promotions", response_model=List[Promotion])
async def get_active_promotions():
    """Get active promotions - public endpoint"""
    now = datetime.now(timezone.utc)
    promotions = await db.promotions.find({
        "is_active": True,
        "start_date": {"$lte": now.isoformat()},
        "end_date": {"$gte": now.isoformat()}
    }, {"_id": 0}).to_list(1000)
    for promo in promotions:
        for field in ['created_at', 'start_date', 'end_date']:
            if isinstance(promo.get(field), str):
                promo[field] = datetime.fromisoformat(promo[field])
    return promotions

@api_router.get("/admin/promotions", response_model=List[Promotion])
async def get_all_promotions(current_admin: dict = Depends(get_current_admin)):
    """Get all promotions - admin only"""
    promotions = await db.promotions.find({}, {"_id": 0}).to_list(1000)
    for promo in promotions:
        for field in ['created_at', 'start_date', 'end_date']:
            if isinstance(promo.get(field), str):
                promo[field] = datetime.fromisoformat(promo[field])
    return promotions

@api_router.post("/admin/promotions", response_model=Promotion)
async def create_promotion(promo_data: PromotionCreate, current_admin: dict = Depends(get_current_admin)):
    """Create new promotion - admin only"""
    promotion = Promotion(**promo_data.model_dump())
    promo_dict = promotion.model_dump()
    promo_dict['created_at'] = promo_dict['created_at'].isoformat()
    promo_dict['start_date'] = promo_dict['start_date'].isoformat()
    promo_dict['end_date'] = promo_dict['end_date'].isoformat()
    await db.promotions.insert_one(promo_dict)
    return promotion

@api_router.put("/admin/promotions/{promo_id}", response_model=Promotion)
async def update_promotion(promo_id: str, promo_data: PromotionCreate, current_admin: dict = Depends(get_current_admin)):
    """Update promotion - admin only"""
    update_dict = promo_data.model_dump()
    update_dict['start_date'] = update_dict['start_date'].isoformat()
    update_dict['end_date'] = update_dict['end_date'].isoformat()
    
    result = await db.promotions.update_one(
        {"id": promo_id},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    promotion = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    for field in ['created_at', 'start_date', 'end_date']:
        if isinstance(promotion.get(field), str):
            promotion[field] = datetime.fromisoformat(promotion[field])
    return Promotion(**promotion)

@api_router.delete("/admin/promotions/{promo_id}")
async def delete_promotion(promo_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete promotion - admin only"""
    result = await db.promotions.delete_one({"id": promo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"message": "Promotion deleted successfully"}

# ==================== ORDERS API ====================
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """Create new order - public endpoint"""
    # Create order
    order = Order(**order_data.model_dump())
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    
    # Save to database first
    await db.orders.insert_one(order_dict)
    logger.info(f"Order {order.id} saved to database")
    
    # Send confirmation emails
    try:
        email_sent = await send_order_confirmation_emails(order_dict)
        if email_sent:
            logger.info(f"Order confirmation emails sent successfully for order {order.id}")
        else:
            logger.warning(f"Failed to send emails for order {order.id}, but order was saved")
    except Exception as e:
        logger.error(f"Error sending order emails for {order.id}: {str(e)}")
        # Order is still saved even if email fails
    
    return order

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(current_admin: dict = Depends(get_current_admin)):
    """Get all orders - admin only"""
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_admin: dict = Depends(get_current_admin)):
    """Update order status - admin only"""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated successfully"}

@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete order - admin only"""
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# ==================== FILE UPLOAD API ====================
@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), current_admin: dict = Depends(get_current_admin)):
    """Upload image - admin only"""
    # Create uploads directory if doesn't exist
    upload_dir = Path("/app/backend/uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url}

# ==================== CONTACT FORM API ====================
@api_router.post("/contact")
async def submit_contact_form(form_data: ContactForm):
    """Submit contact form - public endpoint"""
    # Save to database for admin to see
    contact_dict = form_data.model_dump()
    contact_dict['id'] = str(uuid.uuid4())
    contact_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    contact_dict['status'] = 'new'  # new, read, replied
    
    await db.contacts.insert_one(contact_dict)
    
    # Send email notification
    try:
        await send_contact_form_email(contact_dict)
    except Exception as e:
        logger.error(f"Failed to send contact form email: {str(e)}")
    
    return {"message": "Contact form submitted successfully", "id": contact_dict['id']}

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files
upload_dir = Path("/app/backend/uploads")
upload_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def create_admin_user():
    """Create initial admin user if it doesn't exist"""
    admin_email = "natour46@gmail.com"
    admin_password = "Amro8045@"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        logger.info(f"Creating initial admin user: {admin_email}")
        password_hash = get_password_hash(admin_password)
        admin_user = User(
            email=admin_email,
            password_hash=password_hash,
            role="admin",
            approved=True
        )
        
        admin_dict = admin_user.model_dump()
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        await db.users.insert_one(admin_dict)
        logger.info("Admin user created successfully")
    else:
        logger.info("Admin user already exists")