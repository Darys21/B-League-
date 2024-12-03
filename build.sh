#!/bin/bash

# Build frontend avec optimisation
cd frontend
npm ci --production --no-optional
npm run build
rm -rf node_modules/.cache

# Install Python dependencies avec optimisation
pip install --no-cache-dir -r requirements.txt --only-binary :all:
