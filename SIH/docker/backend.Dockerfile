FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for build and geospatial libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend
COPY ml /app/ml

# Generate initial ML model if not already present
RUN PYTHONPATH=/app/backend python /app/ml/training/train_model.py

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
