#!/bin/bash

# Build frontend
cd frontend
npm install --production
npm run build
cd ..

# Install Python dependencies
pip install -r requirements.txt --no-cache-dir
