#!/bin/bash

# Fix volume permissions
sudo chown -R $USER: node_modules

# Install dependencies
npm install
npm run serve