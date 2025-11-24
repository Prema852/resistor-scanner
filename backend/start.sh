#!/bin/bash
# Install python deps
pip install --no-cache-dir -r requirements.txt

# Start Node server
node server.js
