#!/bin/sh

# This script prepares and launches the application in the Docker container.

# 1. API Key Injection
# Find the root directory where the app is served.
ROOT_DIR=/usr/share/nginx/html
INDEX_FILE=$ROOT_DIR/index.html

# Check if the API_KEY environment variable is set.
if [ -z "$API_KEY" ]; then
  echo "Warning: API_KEY environment variable is not set. Using placeholder."
  API_KEY_VALUE="MISSING_API_KEY"
else
  echo "API_KEY is set. Injecting into index.html."
  API_KEY_VALUE=$API_KEY
fi

# Use sed to replace the placeholder in index.html with the actual API key.
# The use of a different delimiter (#) for sed avoids issues if the key contains slashes.
sed -i "s#__API_KEY__#$API_KEY_VALUE#g" $INDEX_FILE

echo "Key injection complete. index.html is ready."

# 2. Start the Nginx Server
# This command starts nginx in the foreground, which is standard practice for containers.
# The `nginx -g 'daemon off;'` ensures that the container keeps running.
echo "Starting Nginx server..."
nginx -g 'daemon off;'
