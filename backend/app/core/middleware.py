import time
import logging
from fastapi import Request, Response

logger = logging.getLogger("gem-marketplace")

async def log_response_time(request: Request, call_next):
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    process_time = time.perf_counter() - start_time
    
    # Add time in milliseconds as header
    response.headers["X-Response-Time"] = f"{process_time * 1000:.2f}ms"
    
    # Log information
    logger.info(
        f"Method: {request.method} | Path: {request.url.path} | "
        f"Status: {response.status_code} | Duration: {process_time * 1000:.2f}ms"
    )
    return response
