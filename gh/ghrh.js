
var settings = {
    keywords: []
}


const mathUrl = /.*\/.*\/releases/


var repeat = null;


var itr = 0;
function highlightRelease() {
    if (!mathUrl.test(location.pathname)) {
        setStateHide();
        clearInterval(repeat);
        repeat = null;
        return;
    }

    try {



        var keywords = settings.keywords;

        const assetsElements = document.querySelectorAll("div.Box > div.Box-footer li div a.Truncate > span")


        const allLists = document.querySelectorAll("div.Box > div.Box-footer li")

        var foundIn = []

        keywords.forEach(key => {
            const regex = new RegExp(key);
            assetsElements.forEach((el)=> {
                
                    const content = el.innerHTML
                    if (regex.test(content)) {
                        foundIn.push(el);
                    }
                
                

            }) 
        });


        


        allLists.forEach(list => {
            list.classList.remove("ghrl_match")
            foundIn.forEach(el => {
                
                if (list.contains(el)) {
                    list.classList.add("ghrl_match")
                }
            })
            
        })

    } catch (error) {
        console.error(error);
        setStateError();
    }

}
function startHighlightRelease() {

    if (mathUrl.test(location.pathname)) {
        if (repeat == null) {
            repeat = setInterval(highlightRelease,500);
            highlightRelease();
            setStateDone();
        }
    }

    
}



// MARK:Setup
var state = document.createElement("div");


function setStateLoading() {
    state.classList.remove("ghrl_error");
    state.classList.add("ghrl_spinner");
    state.classList.remove("ghrl_done");
    state.classList.remove("ghrl_hide");
}

function setStateDone() {
    state.classList.remove("ghrl_error");
    state.classList.remove("ghrl_spinner");
    state.classList.add("ghrl_done");
    state.classList.remove("ghrl_hide");
}

function setStateError() {
    state.classList.add("ghrl_error");
    state.classList.remove("ghrl_spinner");
    state.classList.remove("ghrl_done");
    state.classList.remove("ghrl_hide");

}


function setStateHide() {
    state.classList.remove("ghrl_error");
    state.classList.remove("ghrl_spinner");
    state.classList.remove("ghrl_done");
    state.classList.add("ghrl_hide");
}


async function updateKeys() {
    console.log("Updating Keywords...")

    const { keywords } = await chrome.runtime.sendMessage({ type: 'getKeywords' });
    if (!keywords) {
        setStateError();
    }

    console.log(keywords)


    settings.keywords = keywords;

    console.log("Done")

}

async function init() {
    

    await updateKeys();

    
    addEventListener("scroll", startHighlightRelease);
    addEventListener("click", startHighlightRelease);
    window.addEventListener('popstate', startHighlightRelease);


    let oldHref = document.location.href;
    const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
        oldHref = document.location.href;
            startHighlightRelease();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    startHighlightRelease();
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "updateKeywords") {

        
        updateKeys().then(highlightRelease);

        setStateLoading()

        setTimeout(() => setStateDone(), 500);
    }
});





state.classList.add("ghrl_state");

state.classList.add("ghrl_hide");


state.title = "Releases Highlight"

init();

document.body.appendChild(state);



