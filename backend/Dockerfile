# backend/Dockerfile
# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# # Expose the port the app runs on
# EXPOSE 8000

# Run the Django backend using the dev server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# Render uses port 10000
ENV PORT=10000
EXPOSE 10000

CMD ["python", "manage.py", "runserver", "0.0.0.0:10000"]