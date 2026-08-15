import logging
from fastapi import Request, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("gem-marketplace")

async def http_exception_handler(request: Request, exc: HTTPException):
    resolution = "Verify the request parameters and URL path."
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        resolution = "Verify the ID or resource path requested. The gem or resource might have been deleted."
    elif exc.status_code == status.HTTP_401_UNAUTHORIZED or exc.status_code == status.HTTP_403_FORBIDDEN:
        resolution = "Check authentication tokens or API key configuration."
    elif exc.status_code == status.HTTP_400_BAD_REQUEST:
        resolution = "Ensure the request payload is structured correctly and satisfies validation constraints."

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "data": None,
            "resolution": resolution
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_messages = []
    for error in errors:
        loc = " -> ".join(str(l) for l in error.get("loc", []))
        msg = error.get("msg", "Validation error")
        error_messages.append(f"{loc}: {msg}")
    
    detail_str = " | ".join(error_messages)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": f"Schema Validation Error: {detail_str}",
            "data": None,
            "resolution": "Please correct the field types or provide the required fields in the request body."
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": f"Internal Server Error: {str(exc)}",
            "data": None,
            "resolution": "Please check database connection environment variables (e.g. Supabase connection settings) and server configuration."
        }
    )
