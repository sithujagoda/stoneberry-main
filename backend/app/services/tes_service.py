from typing import Optional


def _completeness(values: list) -> float:
    """
    Returns the percentage of non-empty evidence fields.
    """
    if not values:
        return 0.0

    completed = sum(
        1 for value in values
        if value is not None and str(value).strip() != ""
    )

    return (completed / len(values)) * 100.0


def calculate_tes(gem, seller=None) -> dict:
    """
    Calculates the Trust Evidence Score (TES).

    TES measures the availability and completeness of
    supporting evidence associated with a gemstone listing.

    It is NOT an authenticity score and does NOT directly
    measure buyer trust.
    """

    # ---------------------------------------------------------
    # 1. STRUCTURED INFORMATION — 30%
    # ---------------------------------------------------------

    structured_fields = [
        gem.gemstone_type,
        gem.category,
        gem.cut_style,
        gem.treatment,
        gem.shape,
        gem.color,
        gem.clarity,
        gem.origin,
        gem.intensity,
        gem.length,
        gem.width,
        gem.height,
        gem.weight_carat,
    ]

    structured_score = _completeness(structured_fields)


    # ---------------------------------------------------------
    # 2. VISUAL EVIDENCE — 15%
    # ---------------------------------------------------------

    visual_fields = [
        gem.sunlight_image_url,
        gem.studio_image_url,
        gem.extra_media_url,
    ]

    visual_score = _completeness(visual_fields)


    # ---------------------------------------------------------
    # 3. CERTIFICATION EVIDENCE — 20%
    # ---------------------------------------------------------

    certification_fields = [
        gem.certificate_url,
        gem.certified_by,
        gem.certified_location,
    ]

    certification_score = _completeness(certification_fields)


    # ---------------------------------------------------------
    # 4. PROVENANCE — 20%
    # ---------------------------------------------------------

    provenance_fields = [
        gem.mined,
        gem.cut_by,
        gem.cut_location,
        gem.certified_by,
        gem.certified_location,
    ]

    provenance_score = _completeness(provenance_fields)


    # ---------------------------------------------------------
    # 5. SELLER EVIDENCE — 15%
    # ---------------------------------------------------------

    seller_score = 0.0

    if seller:
        seller_fields = [
            seller.firstname,
            seller.lastname,
            seller.mobilenumber,
            seller.seller_type,
            seller.business_name,
            seller.business_registration_number,
            seller.address,
            seller.province,
            seller.city,
            seller.profile_image_url,
        ]

        seller_score = _completeness(seller_fields)


    # ---------------------------------------------------------
    # FINAL TES
    # ---------------------------------------------------------

    tes = (
        (structured_score * 0.30)
        + (visual_score * 0.15)
        + (certification_score * 0.20)
        + (provenance_score * 0.20)
        + (seller_score * 0.15)
    )

    tes = round(tes, 2)


    # ---------------------------------------------------------
    # INTERPRETATION
    # ---------------------------------------------------------

    if tes >= 80:
        interpretation = "High evidence completeness"
    elif tes >= 60:
        interpretation = "Moderate evidence completeness"
    else:
        interpretation = "Limited evidence completeness"


    return {
        "score": tes,
        "interpretation": interpretation,
        "components": {
            "structured_information": round(structured_score, 2),
            "visual_evidence": round(visual_score, 2),
            "certification_evidence": round(certification_score, 2),
            "provenance": round(provenance_score, 2),
            "seller_evidence": round(seller_score, 2),
        }
    }