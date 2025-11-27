# Dockerfile to build Linux installers/artifacts for the Electron app
# This image installs dependencies and runs `npm ci` + `npm run make`.
# Outputs (artifact folder) will be under /workspace/out inside the container; mount a volume to retrieve.

FROM node:20-bullseye

# optional: install libgtk and other libs required by electron packaging
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgtk-3-0 \
    libnotify4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    ca-certificates \
    git \
    make \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy package manifests first to leverage layer caching
COPY package.json package-lock.json* ./
COPY forge.config.ts ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy the rest of the project
COPY . .

# Create an output directory
RUN mkdir -p /workspace/out

# Build production bundle and make Linux artifacts
# Note: this will create Linux artifacts only. Windows/macOS packaging requires additional toolchains.
RUN npm run make:linux || true

# Copy artifacts to /workspace/out (electron-forge writes to out/make)
RUN cp -R out/make /workspace/out || true

# Default command prints available artifacts
CMD ["/bin/bash","-lc","echo 'Artifacts (if any) are in /workspace/out'; ls -la /workspace/out || true"]
