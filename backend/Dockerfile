FROM python:3.10-alpine

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apk update && \
    apk add --no-cache \
        gcc \
        musl-dev \
        libffi-dev \
        openssl-dev \
        curl && \
    rm -rf /var/cache/apk/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# CMD ["sh", "-c", \
#      "python manage.py runserver 0.0.0.0:8000"]
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "task_track.wsgi"]
ENTRYPOINT [ "sh", "entrypoint.sh"]