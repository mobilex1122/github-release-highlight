
const loading = document.getElementById("loading");
const presetSelect = document.getElementById("arch");
const keyWords = document.getElementById("keywords");
const saveBtn = document.getElementById("save");

function loadingHide() {loading.classList.add("hide")};
function loadingShow() {loading.classList.remove("hide")};

async function load() {
    const { settings } = await chrome.runtime.sendMessage({ type: 'getSettings' });

    presetSelect.innerHTML = "";

    Object.keys(settings.possibePresets).forEach((parch) => {
        const opt = document.createElement("option");
        if (settings.possibePresets[parch] !== false) {

            opt.innerText = parch;
            opt.value = parch;

            if (parch == settings.preset) {
                opt.selected = true
            }
        } else {
            opt.value = "";
            opt.innerText = parch;
            opt.classList.add("cat");
            opt.disabled  = true;
        }
        presetSelect.appendChild(opt)

    });

    keyWords.value = settings.keys;


    saveBtn.onclick = () => {
        loadingShow();
        chrome.runtime.sendMessage({ type: 'setSettings', data: {
            preset: presetSelect.value,
            keys: keyWords.value,
        }}).then(()=> {
            loadingHide();
        })
    }
    

    loadingHide();
}

addEventListener("DOMContentLoaded", load);
