const { contextBridge, ipcRenderer } = require('electron');
const fontkit = require('fontkit');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => {
            let validChannels = ['open-file-dialog-A', 'open-file-dialog-B', 'open-file-dialog-C']; // Valid channels list updated
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        on: (channel, func) => {
            let validChannels = ['selected-file-A', 'selected-file-B', 'selected-file-C', 'file-copied', 'file-copy-error'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        invoke: (channel, ...data) => {
            let validChannels = ['fusion-fonts', 'fusion-fonts-mock'];
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, ...data);
            }
        }
    }
})

contextBridge.exposeInMainWorld('electronFontKit', {
    open: (path) => {
        return new Promise((resolve, reject) => {
            fontkit.open(path, (error, font) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(font);
                }
            });
        });
    }
});