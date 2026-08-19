import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db
from backend.app.schemas.gem import ApiResponse, GemResponse, TrustEvidence
from backend.app.services import gem_service
from backend.app.services.trust_evidence_service import calculate_trust_evidence
from backend.app.utils.storage import upload_file_to_supabase
from backend.app.services.ai_service import ai_detector
from backend.app.models.review import Review
from backend.app.models.user import User


router = APIRouter(prefix="/gems", tags=["Gems"])

def _enrich_gem_with_trust(gem, reviews: List[Review]) -> dict:
    """Converts a Gem ORM object to a dict with a computed trust_evidence field."""
    seller_is_complete = False
    seller_created_at = None
    
    if gem.seller:
        seller_is_complete = gem.seller.is_complete
        seller_created_at = gem.seller.created_at
    
    trust = calculate_trust_evidence(
        gem=gem,
        seller_is_complete=seller_is_complete,
        seller_created_at=seller_created_at,
        reviews=reviews,
    )
    
    # Pydantic from_attributes will auto-convert the ORM object,
    # but we need to inject trust_evidence as an extra field.
    gem_dict = GemResponse.model_validate(gem).model_dump()
    gem_dict["trust_evidence"] = trust.model_dump()
    return gem_dict


@router.get("", response_model=ApiResponse[List[GemResponse]])
def get_gems(
    db: Session = Depends(get_db),
    type: Optional[str] = None,
    category: Optional[str] = None,
    cut_style: Optional[str] = None,
    treatment: Optional[str] = None,
    shape: Optional[str] = None,
    color: Optional[str] = None,
    intensity: Optional[str] = None,
    clarity: Optional[str] = None,
    month: Optional[str] = None,
    origin: Optional[str] = None,
    minCarat: Optional[float] = None,
    maxCarat: Optional[float] = None,
    length: Optional[float] = None,
    width: Optional[float] = None,
    height: Optional[float] = None,
    search: Optional[str] = None
):
    gems = gem_service.get_filtered_gems(
        db=db,
        type_filter=type,
        category_filter=category,
        cut_filter=cut_style,
        treatment_filter=treatment,
        shape_filter=shape,
        color_filter=color,
        intensity_filter=intensity,
        clarity_filter=clarity,
        month_filter=month,
        origin_filter=origin,
        min_carat=minCarat,
        max_carat=maxCarat,
        length_filter=length,
        width_filter=width,
        height_filter=height,
        search=search
    )
    
    # Bulk fetch reviews to avoid N+1 query
    seller_ids = list(set(g.seller_id for g in gems if g.seller_id))
    reviews_by_seller = {}
    if seller_ids:
        all_reviews = db.query(Review).filter(
            Review.target_user_id.in_(seller_ids),
            Review.review_type == "BUYER_REVIEWING_SELLER"
        ).all()
        for r in all_reviews:
            reviews_by_seller.setdefault(r.target_user_id, []).append(r)
            
    enriched = [_enrich_gem_with_trust(g, reviews_by_seller.get(g.seller_id, [])) for g in gems]
    return ApiResponse(success=True, data=enriched)

@router.get("/{gem_id}", response_model=ApiResponse[GemResponse])
def get_gem(gem_id: int, db: Session = Depends(get_db)):
    gem = gem_service.get_gem_by_id(db, gem_id)
    reviews = []
    if gem.seller_id:
        reviews = db.query(Review).filter(
            Review.target_user_id == gem.seller_id,
            Review.review_type == "BUYER_REVIEWING_SELLER"
        ).all()
        
    enriched = _enrich_gem_with_trust(gem, reviews)
    return ApiResponse(success=True, data=enriched)

@router.get("/seller/{seller_id}", response_model=ApiResponse[List[GemResponse]])
def get_seller_gems(seller_id: int, db: Session = Depends(get_db)):
    gems = gem_service.get_seller_gems(db, seller_id)
    reviews = db.query(Review).filter(
        Review.target_user_id == seller_id,
        Review.review_type == "BUYER_REVIEWING_SELLER"
    ).all()
    enriched = [_enrich_gem_with_trust(g, reviews) for g in gems]
    return ApiResponse(success=True, data=enriched)

# The endpoint for validating images using the AI model. This is used for immediate feedback in the frontend dropzone.
@router.post("/validate-image", response_model=dict)
async def validate_image(file: UploadFile = File(...)):
    """
    Validates if an uploaded image is a gemstone using the AI model.
    Used for immediate feedback in the frontend dropzone.
    """
    if not file.content_type.startswith("image/"):
        # Pass non-images (videos, docs) silently with a mock response
        return {
            "is_gemstone": True,
            "confidence": 100.0,
            "explanation": "Not an image file. Skipped AI verification.",
            "heatmap_base64": None
        }
        
    try:
        file_bytes = await file.read()
        ai_feedback = ai_detector.verify_image(file_bytes)
        return ai_feedback
    except Exception as e:
        # If processing fails (corrupt image, model down), return error safely
        raise HTTPException(status_code=400, detail="Invalid image format or processing error.")

@router.post("", response_model=ApiResponse[GemResponse], status_code=status.HTTP_201_CREATED)
async def create_gem(
    gemstoneType: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    cutStyle: Optional[str] = Form(None),
    treatment: Optional[str] = Form(None),
    shape: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    clarity: Optional[str] = Form(None),
    month: Optional[str] = Form(None),
    origin: Optional[str] = Form(None),
    intensity: Optional[str] = Form(None),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    carat: Optional[float] = Form(None),
    price: Optional[float] = Form(None),
    mined: Optional[str] = Form(None),
    cutBy: Optional[str] = Form(None),
    cutLocation: Optional[str] = Form(None),
    certifiedBy: Optional[str] = Form(None),
    certifiedLocation: Optional[str] = Form(None),
    aiConfidence: Optional[float] = Form(None),
    aiExplanation: Optional[str] = Form(None),
    sellerId: Optional[int] = Form(None),
    sunlightImage: Optional[UploadFile] = File(None),
    studioImage: Optional[UploadFile] = File(None),
    extraMedia: Optional[List[UploadFile]] = File(None),
    certificate: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    sunlight_url = None
    if sunlightImage:
        sunlight_bytes = await sunlightImage.read()
        if not ai_detector.verify_image(sunlight_bytes):
            raise HTTPException(status_code=400, detail="The sunlight image does not appear to be a gemstone. Please upload a valid photo.")
        sunlight_url = upload_file_to_supabase("gems", sunlight_bytes, sunlightImage.filename, sunlightImage.content_type)
        
    studio_url = None
    if studioImage:
        studio_bytes = await studioImage.read()
        if not ai_detector.verify_image(studio_bytes):
            raise HTTPException(status_code=400, detail="The studio image does not appear to be a gemstone. Please upload a valid photo.")
        studio_url = upload_file_to_supabase("gems", studio_bytes, studioImage.filename, studioImage.content_type)
        
    extra_urls = []
    if extraMedia:
        files_list = extraMedia if isinstance(extraMedia, list) else [extraMedia]
        for f in files_list:
            if f and f.filename:
                url = upload_file_to_supabase("gems", await f.read(), f.filename, f.content_type)
                extra_urls.append(url)
    extra_url = json.dumps(extra_urls) if extra_urls else None
        
    cert_url = None
    if certificate:
        cert_url = upload_file_to_supabase("gems", await certificate.read(), certificate.filename, certificate.content_type)

    gem_data = {
        "name": f"{color or ''} {gemstoneType or 'Gemstone'}".strip(),
        "gemstone_type": gemstoneType,
        "category": category,
        "cut_style": cutStyle,
        "treatment": treatment,
        "shape": shape,
        "color": color,
        "clarity": clarity,
        "month": month,
        "origin": origin,
        "intensity": intensity,
        "length": length,
        "width": width,
        "height": height,
        "weight_carat": carat,
        "price_usd": price,
        "mined": mined,
        "cut_by": cutBy,
        "cut_location": cutLocation,
        "certified_by": certifiedBy,
        "certified_location": certifiedLocation,
        "seller_id": sellerId,
        "sunlight_image_url": sunlight_url,
        "studio_image_url": studio_url,
        "extra_media_url": extra_url,
        "certificate_url": cert_url,
        "ai_confidence": aiConfidence,
        "ai_explanation": aiExplanation
    }

    db_gem = gem_service.create_gem_listing(db, gem_data)
    enriched = _enrich_gem_with_trust(db_gem, db)
    return ApiResponse(success=True, data=enriched)

@router.delete("/{gem_id}", response_model=ApiResponse[bool])
def delete_gem(gem_id: int, seller_id: int, db: Session = Depends(get_db)):
    result = gem_service.delete_gem_listing(db, gem_id, seller_id)
    return ApiResponse(success=True, data=result)

@router.put("/{gem_id}", response_model=ApiResponse[GemResponse])
async def update_gem(
    gem_id: int,
    sellerId: int = Form(...),
    gemstoneType: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    cutStyle: Optional[str] = Form(None),
    treatment: Optional[str] = Form(None),
    shape: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    clarity: Optional[str] = Form(None),
    month: Optional[str] = Form(None),
    origin: Optional[str] = Form(None),
    intensity: Optional[str] = Form(None),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    carat: Optional[float] = Form(None),
    price: Optional[float] = Form(None),
    isAvailable: Optional[bool] = Form(None),
    mined: Optional[str] = Form(None),
    cutBy: Optional[str] = Form(None),
    cutLocation: Optional[str] = Form(None),
    certifiedBy: Optional[str] = Form(None),
    certifiedLocation: Optional[str] = Form(None),
    sunlightImage: Optional[UploadFile] = File(None),
    studioImage: Optional[UploadFile] = File(None),
    extraMedia: Optional[List[UploadFile]] = File(None),
    existingExtraUrls: Optional[str] = Form(None),
    certificate: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    update_fields = {}
    if sunlightImage:
        update_fields["sunlight_image_url"] = upload_file_to_supabase("gems", await sunlightImage.read(), sunlightImage.filename, sunlightImage.content_type)
    if studioImage:
        update_fields["studio_image_url"] = upload_file_to_supabase("gems", await studioImage.read(), studioImage.filename, studioImage.content_type)
        
    final_extra_urls = None
    if existingExtraUrls is not None:
        try:
            parsed = json.loads(existingExtraUrls)
            if isinstance(parsed, list):
                final_extra_urls = parsed
        except Exception:
            pass
            
    if extraMedia:
        if final_extra_urls is None:
            final_extra_urls = []
        files_list = extraMedia if isinstance(extraMedia, list) else [extraMedia]
        for f in files_list:
            if f and f.filename:
                url = upload_file_to_supabase("gems", await f.read(), f.filename, f.content_type)
                final_extra_urls.append(url)

    if final_extra_urls is not None:
        update_fields["extra_media_url"] = json.dumps(final_extra_urls) if final_extra_urls else None

    if certificate:
        update_fields["certificate_url"] = upload_file_to_supabase("gems", await certificate.read(), certificate.filename, certificate.content_type)

    if gemstoneType is not None: update_fields["gemstone_type"] = gemstoneType
    if category is not None: update_fields["category"] = category
    if cutStyle is not None: update_fields["cut_style"] = cutStyle
    if treatment is not None: update_fields["treatment"] = treatment
    if shape is not None: update_fields["shape"] = shape
    if color is not None: update_fields["color"] = color
    if clarity is not None: update_fields["clarity"] = clarity
    if month is not None: update_fields["month"] = month
    if origin is not None: update_fields["origin"] = origin
    if intensity is not None: update_fields["intensity"] = intensity
    if length is not None: update_fields["length"] = length
    if width is not None: update_fields["width"] = width
    if height is not None: update_fields["height"] = height
    if carat is not None: update_fields["weight_carat"] = carat
    if price is not None: update_fields["price_usd"] = price
    if isAvailable is not None: update_fields["is_available"] = isAvailable
    if mined is not None: update_fields["mined"] = mined
    if cutBy is not None: update_fields["cut_by"] = cutBy
    if cutLocation is not None: update_fields["cut_location"] = cutLocation
    if certifiedBy is not None: update_fields["certified_by"] = certifiedBy
    if certifiedLocation is not None: update_fields["certified_location"] = certifiedLocation

    gem = gem_service.update_gem_listing(db, gem_id, sellerId, update_fields)
    return ApiResponse(success=True, data=gem)
