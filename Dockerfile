# Specify the base Docker image. You can read more about
# the available images at https://crawlee.dev/docs/guides/docker-images
# You can also use any other image from Docker Hub.
FROM apify/actor-node-puppeteer-chrome:16 AS builder

# Copy just package.json and yarn.lock
# to speed up the build using Docker layer cache.
COPY --chown=myuser package.json yarn.lock ./

# Install all dependencies. Don't audit to speed up the installation.
RUN yarn --production=false

# Next, copy the source files using the user set
# in the base image.
COPY --chown=myuser . ./

# Install all dependencies and build the project.
# Don't audit to speed up the installation.
RUN yarn build

# Create final image
FROM apify/actor-node-puppeteer-chrome:16

# Copy only built JS files from builder image
COPY --from=builder --chown=myuser /home/myuser/dist ./dist

# Copy just package.json and yarn.lock
# to speed up the build using Docker layer cache.
COPY --chown=myuser package*.json yarn.lock ./

# Install NPM packages, skip optional and development dependencies to
# keep the image small. Avoid logging too much and print the dependency
# tree for debugging
RUN yarn --prod \
    && echo "Installed NPM packages:" \
    && (yarn list --depth 1 || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "Yarn version:" \
    && yarn --version

# Next, copy the remaining files and directories with the source code.
# Since we do this after NPM install, quick build will be really fast
# for most source file changes.
COPY --chown=myuser . ./


# Run the image. If you know you won't need headful browsers,
# you can remove the XVFB start script for a micro perf gain.
# CMD ./start_xvfb_and_run_cmd.sh && yarn start:prod --silent
CMD yarn start:prod --silent