"""
Trust Evidence Score Service
----------------------------
Calculates a Trust Evidence Score (out of 100) for a gemstone listing,
broken down into four categories (each out of 25):

  1. Certificate  (25 pts) — presence of certificate file, certifier name, certifier location
  2. Provenance   (25 pts) — mined location, origin, cut_by, cut_location
  3. AI Evidence   (25 pts) — stored AI confidence from verification at listing time
  4. Seller        (25 pts) — profile completeness, account tenure, review average & count

This score measures the *amount and quality of available evidence*, not a guarantee
of authenticity. The naming ("Trust Evidence") is intentional and transparent.
"""

from datetime import datetime, timezone
from typing import Optional, List
from backend.app.schemas.gem import TrustEvidence


def _calculate_certificate_score(
    certificate_url: Optional[str],
    certified_by: Optional[str],
    certified_location: Optional[str],
) -> float:
    """Out of 25 points."""
    score = 0.0
    # Having a certificate file is the most important (12 pts)
    if certificate_url:
        score += 12.0
    # Having the certifying authority name (7 pts)
    if certified_by:
        score += 7.0
    # Having the certifying location (6 pts)
    if certified_location:
        score += 6.0
    return score


def _calculate_provenance_score(
    mined: Optional[str],
    origin: Optional[str],
    cut_by: Optional[str],
    cut_location: Optional[str],
) -> float:
    """Out of 25 points."""
    score = 0.0
    if origin:
        score += 8.0
    if mined:
        score += 7.0
    if cut_by:
        score += 5.0
    if cut_location:
        score += 5.0
    return score


def _calculate_ai_score(ai_confidence: Optional[float]) -> float:
    """
    Out of 25 points.
    ai_confidence is stored as a percentage (0-100) where higher = more confident it IS a gem.
    If no AI verification was done, score is 0.
    """
    if ai_confidence is None:
        return 0.0
    # Scale: 90-100% confidence → 25 pts, 70-89% → 18 pts, 50-69% → 12 pts, <50% → 5 pts
    if ai_confidence >= 90:
        return 25.0
    elif ai_confidence >= 70:
        return 18.0
    elif ai_confidence >= 50:
        return 12.0
    else:
        return 5.0


def _calculate_seller_score(
    seller_is_complete: bool,
    seller_created_at: Optional[datetime],
    reviews: Optional[List] = None,
) -> float:
    """
    Out of 25 points.
    - Profile completeness: 8 pts
    - Account tenure: up to 7 pts (1pt per 30 days, max 7)
    - Review average: up to 5 pts (avg_rating mapped to 0-5)
    - Review count: up to 5 pts (1pt per review, max 5)
    """
    score = 0.0

    # Profile completeness (8 pts)
    if seller_is_complete:
        score += 8.0

    # Account age (up to 7 pts, 1 pt per 30 days)
    if seller_created_at:
        now = datetime.now(timezone.utc)
        # Make seller_created_at timezone-aware if it isn't
        if seller_created_at.tzinfo is None:
            seller_created_at = seller_created_at.replace(tzinfo=timezone.utc)
        days_active = (now - seller_created_at).days
        tenure_pts = min(days_active / 30.0, 7.0)
        score += tenure_pts

    # Reviews
    if reviews and len(reviews) > 0:
        # Average rating (up to 5 pts) — rating is 1-5, so map directly
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        score += min(avg_rating, 5.0)

        # Review count (up to 5 pts, 1 pt each)
        score += min(len(reviews), 5)

    return min(score, 25.0)


def calculate_trust_evidence(
    gem,
    seller_is_complete: bool = False,
    seller_created_at: Optional[datetime] = None,
    reviews: Optional[List] = None,
) -> TrustEvidence:
    """
    Main entry point. Takes a Gem ORM object and seller metadata,
    returns a TrustEvidence breakdown.
    """
    cert = _calculate_certificate_score(
        certificate_url=gem.certificate_url,
        certified_by=gem.certified_by,
        certified_location=gem.certified_location,
    )
    prov = _calculate_provenance_score(
        mined=gem.mined,
        origin=gem.origin,
        cut_by=gem.cut_by,
        cut_location=gem.cut_location,
    )
    ai = _calculate_ai_score(gem.ai_confidence)
    seller = _calculate_seller_score(
        seller_is_complete=seller_is_complete,
        seller_created_at=seller_created_at,
        reviews=reviews,
    )

    return TrustEvidence(
        certificate_score=round(cert, 1),
        provenance_score=round(prov, 1),
        ai_score=round(ai, 1),
        seller_score=round(seller, 1),
        total_score=round(cert + prov + ai + seller, 1),
    )
