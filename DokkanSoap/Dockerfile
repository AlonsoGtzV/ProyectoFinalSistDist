FROM python:3.10-slim


RUN apt-get update && apt-get install -y libxml2-dev libxslt-dev gcc
RUN pip install flask spyne lxml mysql-connector-python

COPY dokkan_api.py /app/dokkan_api.py
COPY database.py /app/database.py

WORKDIR /app

EXPOSE 5000

CMD ["python", "dokkan_api.py"]