FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libasound2 \
    libxss1 \
    libgtk-3-0 \
    libnss3 \
    libdrm2 \
    libgbm1 \
    libgl1-mesa-glx \
    libx11-xcb1 \
    dbus-x11 \
    python3.11 \
    python3-pip \
    python3.11-venv \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get update && apt-get install -y nodejs
