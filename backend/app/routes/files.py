import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
from datetime import datetime

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..utils.auth import get_current_active_user

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/", response_model=schemas.File)
async def upload_file(
    file: UploadFile = File(...),
    replace_existing: Optional[bool] = Form(False),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    print(f"Upload request received with replace_existing={replace_existing}")
    
    # Check if a file with the same name already exists for this user
    existing_file = db.query(models.File).filter(
        models.File.filename == file.filename,
        models.File.user_id == current_user.id
    ).first()
    
    # Handle duplicate filename
    if existing_file:
        if replace_existing:
            # If replace flag is set, delete the existing file
            try:
                existing_file_path = existing_file.file_path
                if existing_file_path and os.path.exists(existing_file_path):
                    os.remove(existing_file_path)
                db.delete(existing_file)
                db.commit()
                print(f"Existing file {file.filename} deleted for replacement")
            except Exception as e:
                print(f"Error deleting existing file: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error replacing existing file: {str(e)}"
                )
        else:
            # If no replace flag, return error as before
            raise HTTPException(
                status_code=400, 
                detail=f"A file with the name '{file.filename}' already exists. Please rename your file and try again."
            )
    
    # Determine file type
    file_extension = file.filename.split('.')[-1].lower()
    file_type = None
    if file_extension == 'pdf':
        file_type = models.FileType.PDF
    elif file_extension in ['xlsx', 'xls']:
        file_type = models.FileType.EXCEL
    elif file_extension == 'txt':
        file_type = models.FileType.TXT
    elif file_extension in ['doc', 'docx']:
        file_type = models.FileType.WORD
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{current_user.id}_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get current time for all date fields
    current_time = datetime.now()

    # Create database entry
    db_file = models.File(
        filename=file.filename,
        file_type=file_type,
        file_path=file_path,
        upload_date=datetime.now(),
        user_id=current_user.id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@router.get("/files/", response_model=List[schemas.File])
def list_files(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    files = db.query(models.File).filter(models.File.user_id == current_user.id).all()
    
    # Log the file data for debugging
    for file in files:
        print(f"File ID: {file.id}, Filename: {file.filename}, Upload Date: {file.upload_date}")
    
    return files

@router.get("/files/{file_id}/download")
def download_file(
    file_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == current_user.id
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file.file_path, filename=file.filename)

@router.delete("/files/{file_id}")
def delete_file(
    file_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == current_user.id
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete the file from the filesystem
    try:
        os.remove(file.file_path)
    except OSError:
        pass  # Ignore if file doesn't exist
    
    # Delete the database entry
    db.delete(file)
    db.commit()
    return {"message": "File deleted successfully"}

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get total files
    total_files = db.query(models.File).count()
    
    # Get file type breakdown
    file_type_breakdown = {}
    for file_type in models.FileType:
        count = db.query(models.File).filter(models.File.file_type == file_type).count()
        file_type_breakdown[file_type.value] = count
    
    # Get files per user
    files_per_user = {}
    users = db.query(models.User).all()
    for user in users:
        count = db.query(models.File).filter(models.File.user_id == user.id).count()
        files_per_user[user.username] = count
    
    return {
        "total_files": total_files,
        "file_type_breakdown": file_type_breakdown,
        "files_per_user": files_per_user
    } 