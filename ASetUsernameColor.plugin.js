/**
 * @name ASetUsernameColor
 * @author Mshl_Louis
 * @version 4.2.0.6.9
 * @description A plugin that allows users to change the color of multiple usernames via the settings panel and keeps the color persistent across channel switches and new messages.
 */

module.exports = class ASetUsernameColor {
    constructor() {
        this.defaultSettings = {
            usernames: []
        };
        this.settings = { ...this.defaultSettings };
        this.observer = null;
    }

    start() {
        this.loadSettings();
        this.applyUsernameColors();
        this.startObserving();
    }

    stop() {
        if (this.observer) this.observer.disconnect();
        this.resetUsernameColors();
    }

    applyUsernameColors() {
        if (!this.isInPrivateMessage()) return;

        const usernameSelector = `.username_de3235, .username_f9f2ca, .name_ec8679, .username_f3939d`;
        const usernameElements = document.querySelectorAll(usernameSelector);

        usernameElements.forEach(element => {
            this.settings.usernames.forEach(user => {
                if (element.textContent === user.name) {
                    element.style.color = user.color;
                }
            });
        });
    }

    resetUsernameColors() {
        const usernameSelector = `.username_de3235, .username_f9f2ca, .name_ec8679, .username_f3939d`;
        const usernameElements = document.querySelectorAll(usernameSelector);

        usernameElements.forEach(element => {
            this.settings.usernames.forEach(user => {
                if (element.textContent === user.name) {
                    element.style.color = '';
                }
            });
        });
    }

    startObserving() {
        const observeTarget = document.body;

        if (observeTarget) {
            this.observer = new MutationObserver(() => {
                this.applyUsernameColors();
            });

            this.observer.observe(observeTarget, { childList: true, subtree: true });
        }
    }

    isInPrivateMessage() {
        const dmContainer = document.querySelector('.privateChannels_f0963d');
        return dmContainer !== null;
    }

    loadSettings() {
        const savedSettings = BdApi.getData('ASetUsernameColor', 'settings');
        if (savedSettings) {
            this.settings = { ...this.defaultSettings, ...savedSettings };
        }
    }

    saveSettings() {
        BdApi.setData('ASetUsernameColor', 'settings', this.settings);
    }

    getSettingsPanel() {
        const panel = document.createElement('div');
        panel.style.padding = '10px';

        this.settings.usernames.forEach((user, index) => {
            this.createUsernameInput(panel, user.name, user.color, index);
        });

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Username';
        addButton.style.padding = '5px 10px';
        addButton.style.backgroundColor = '#7289da';
        addButton.style.color = 'white';
        addButton.style.border = 'none';
        addButton.style.cursor = 'pointer';
        addButton.style.marginTop = '10px';

        addButton.onclick = () => {
            this.settings.usernames.push({ name: '', color: 'rgba(255, 255, 255, 1)' });
            this.saveSettings();
            panel.appendChild(this.createUsernameInput(panel, '', 'rgba(255, 255, 255, 1)', this.settings.usernames.length - 1));
        };

        panel.appendChild(addButton);

        return panel;
    }

    createUsernameInput(panel, username, color, index) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const usernameLabel = document.createElement('label');
        usernameLabel.textContent = `Username ${index + 1}:`;
        usernameLabel.style.display = 'block';
        usernameLabel.style.marginBottom = '5px';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.value = username;
        usernameInput.style.width = '100%';
        usernameInput.style.marginBottom = '5px';

        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color (in rgba format):';
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '5px';

        const colorInput = document.createElement('input');
        colorInput.type = 'text';
        colorInput.value = color;
        colorInput.style.width = '100%';
        colorInput.style.marginBottom = '10px';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove';
        deleteButton.style.padding = '5px 10px';
        deleteButton.style.backgroundColor = '#f04747';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.marginBottom = '10px';

        deleteButton.onclick = () => {
            this.settings.usernames.splice(index, 1);
            this.saveSettings();
            panel.removeChild(container);
            BdApi.showToast('Username removed!', { type: 'success' });
        };

        usernameInput.oninput = () => {
            this.settings.usernames[index].name = usernameInput.value;
            this.saveSettings();
        };

        colorInput.oninput = () => {
            this.settings.usernames[index].color = colorInput.value;
            this.saveSettings();
        };

        container.appendChild(usernameLabel);
        container.appendChild(usernameInput);
        container.appendChild(colorLabel);
        container.appendChild(colorInput);
        container.appendChild(deleteButton);

        panel.appendChild(container);
    }
};
