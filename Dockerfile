# Use an official Nginx runtime as a parent image
FROM nginx:1.25-alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration file.
# The source file is named nginx.conf.txt, but we place it as default.conf in the container.
COPY nginx.conf.txt /etc/nginx/conf.d/default.conf

# Copy all the static application files from the project
# into the Nginx web root directory.
COPY . /usr/share/nginx/html

# Make the entrypoint script executable
RUN chmod +x /usr/share/nginx/html/entrypoint.sh.txt

# Expose port 80 to allow traffic to the web server
EXPOSE 80

# Set the entrypoint to our custom script
ENTRYPOINT ["/bin/sh", "/usr/share/nginx/html/entrypoint.sh.txt"]