from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Dataset, User
from app.schemas import DatasetCreate, DatasetResponse
from app.auth import get_current_admin

router = APIRouter(tags=["Datasets"])

@router.get("/datasets", response_model=list[DatasetResponse])
def get_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).all()

@router.post("/datasets", status_code=status.HTTP_201_CREATED, response_model=DatasetResponse)
def add_dataset(
    dataset: DatasetCreate, 
    db: Session = Depends(get_db), 
    admin_user: User = Depends(get_current_admin)
):
    new_dataset = Dataset(
        name=dataset.name, 
        description=dataset.description, 
        price=dataset.price
    )
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    return new_dataset

def seed_default_datasets(db: Session):
    """Seed the database with the default datasets if none currently exist."""
    if db.query(Dataset).first() is not None:
        return  # Database already has data, do not seed

    default_datasets = [
        Dataset(
            name="Equity Data",
            description="Universe: 1900+ Stocks, Data Type: OHLCV Data, Time Frame: 1 Minute, Coverage Period: April 2015 - May 2026, Duration: 11 Years, Data Size: 61.3 GB, Update Frequency: Monthly, Includes: Open/High/Low/Close/Volume",
            price=1000
        ),
        Dataset(
            name="Stock Fundamentals Data",
            description="Universe: 1750+ Stocks, Coverage Period: 2017 - 2026 (10 Years), Time Frames: Quarterly & Yearly, Update Frequency: Quarterly, Includes: Balance Sheet Data, Cash Flow Statements, Profit & Loss Statements, Quarterly Results, Historical Financial Ratios, Share Holding Pattern",
            price=2500
        ),
        Dataset(
            name="Implied Volatility (IV) Data",
            description="Universe: 200+ Stocks, Coverage Period: July 2017 - May 2026, Duration: 8 Years & 11 Months, Time Frame: Daily, Update Frequency: Monthly",
            price=1000
        ),
        Dataset(
            name="Stock Options Data",
            description="Universe: 2000+ Stocks, Data Type: OHLCV + OI Data, Time Frame: 1 Minute, Coverage Period: Oct 2024 - May 2026, Duration: 20 Months, Expired Contracts: 254,527, Data Size: 73.3 GB, Update Frequency: Monthly, Includes: OHLCV Data, Open Interest (OI) Data",
            price=2500
        ),
        Dataset(
            name="Index Options Data",
            description="Underlying Indices: NIFTY & SENSEX, Data Type: OHLCV + OI Data, Time Frame: 1 Minute, Coverage Period: Jan 2014 - May 2026, Duration: 12 Years & 5 Months, Expired Contracts: 146,714, Data Size: 16.42 GB, Update Frequency: Monthly, Includes: OHLCV Data, Open Interest (OI) Data",
            price=5000
        ),
    ]

    db.add_all(default_datasets)
    db.commit()
    print("Database successfully seeded with default datasets.")
