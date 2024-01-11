FROM electronuserland/builder:wine-mono

RUN apt-get update && apt-get install -y \
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
    python3 \
    python3-pip \
    python3-venv \
    fonts-ipaexfont \
    fonts-noto-cjk \
    git \
    && rm -rf /var/lib/apt/lists/*
