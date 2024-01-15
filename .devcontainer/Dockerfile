FROM electronuserland/builder:wine-mono

RUN apt-get update && apt-get install -y \
    build-essential \
    fonts-ipaexfont \
    fonts-noto-cjk \
    git

RUN apt-get install -y \
    libasound2 \
    libxss1 \
    libgtk-3-0 \
    libnss3 \
    libdrm2 \
    libgbm1 \
    libgl1-mesa-glx \
    libx11-xcb1 \
    dbus-x11

RUN apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    patchelf \
    ccache

RUN apt-get clean && rm -rf /var/lib/apt/lists/*