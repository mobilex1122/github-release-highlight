




const archKeywords = {
    "Arch:": false,
    "amd64": ["amd64", "x86_64"],
    "arm64": ["arm64"],
    "OS:": false,
    "Android": ["android",".apk"],
    "Windows": ["windows",".exe",".msi"],
    "Linux": ["linux", ".tar.gz",".deb",".rpm",".pacman"],
    "----": false,
    "Custom (No Preset)": [],
}


async function getPresets() {
    const presetsRaw = await fetch('/data/presets.json')
    const presets = await presetsRaw.json();
    presets["None"] = [];
    return presets;
}

console.log("Ready")

// Send tip to content script via messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getKeywords') {

        const fetchKeywords = async () => {
            const data = await chrome.storage.local.get('presetName')
            const data2 = await chrome.storage.local.get('customKeys')


            const presets = await getPresets();

            var presetName = data.presetName || "None";
            var ckeys = data2.customKeys || "";

        

            console.log(ckeys);

            var keywords= [...presets[presetName]];
            ckeys.split(",").forEach(key => {
                const k = key.trim();
                if (k != "") {
                    keywords.push(k);
                }
            })

            console.log(keywords)

            sendResponse({keywords});
            
        }

        fetchKeywords();
        return true;
    }

    if (message.type === 'getSettings') {

        const fetchSettings = async () => {
            const preset = await chrome.storage.local.get('presetName');
            const keys = await chrome.storage.local.get('customKeys');

            const presets = await getPresets();

            var settings= {
                preset: preset.presetName || "None",
                keys: keys.customKeys || "",
                possibePresets: presets,
            }
            sendResponse({settings});
        }
        
        fetchSettings();
        
        return true;
    }

    if (message.type === 'setSettings') {
        console.log("Saving")
        const fetchSettings = async () => {
            await chrome.storage.local.set({
                presetName:message.data.preset,
                customKeys: message.data.keys
            });
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, {type:"updateKeywords"});
                });
            });
            sendResponse({done:true});
        }
        
        fetchSettings();
        
        return true;
    }
});