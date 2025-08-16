#!/bin/bash

echo "Starting Aptos Voting App Frontend..."
echo

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies"
        exit 1
    fi
    echo
fi

echo "Starting development server..."
echo "The app will open at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo

npm start 