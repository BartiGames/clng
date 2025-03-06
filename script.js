/*
 * File: script.js
 * Description: Manages global project data, save/load functionality, and WinBox utilities.
 * Version: 1.0.0
 * Comments: Contains shared functions and initialization for the conlang project.
 * MD5 Sum: [INSERT_MD5_HASH_HERE]
 */
/***************************************************************
 * 1) THEME & TITLE BAR COLORS ON LOAD (Shared)
 ***************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = sessionStorage.getItem("theme") || "light";
  const savedLightTitle = sessionStorage.getItem("lightTitle");
  const savedDarkTitle = sessionStorage.getItem("darkTitle");

  // Set initial theme
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.add("light-theme");
  }

  // Validate color
  function isValidHex(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }
  // Apply saved title bar colors
  if (savedLightTitle && isValidHex(savedLightTitle)) {
    document.documentElement.style.setProperty("--light-title", savedLightTitle);
  }
  if (savedDarkTitle && isValidHex(savedDarkTitle)) {
    document.documentElement.style.setProperty("--dark-title", savedDarkTitle);
  }
});

/***************************************************************
 * 2) GLOBAL PROJECT DATA & UNIVERSAL SAVE/LOAD
 ***************************************************************/
const projectData = {
  culture: {
    folklore: [],
    historical: [],
    socio: [],
    myth: [],
    ritual: [],
    names: [],
    taboos: [],
    artlit: []
  },
  phonology: {},
  grammar: {},
  vocabulary: {},
  notes: {},
  settings: {}
};

function saveProject(filename) {
  const xmlContent = jsonToXml(projectData);
  const blob = new Blob([xmlContent], { type: "application/xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename || "myConlang.clng";
  link.click();
}

function loadProject(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const xmlText = e.target.result;
    const data = xmlToJson(xmlText);
    Object.assign(projectData, data);
    alert("Loaded from " + file.name);
  };
  reader.readAsText(file);
}

function jsonToXml(obj) {
  const lines = [];
  lines.push("<conlang>");
  for (let key in obj) {
    lines.push(`  <${key}>${JSON.stringify(obj[key])}</${key}>`);
  }
  lines.push("</conlang>");
  return lines.join("\n");
}

function xmlToJson(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "application/xml");
  let result = {};
  doc.documentElement.childNodes.forEach((node) => {
    if (node.nodeType === 1) {
      result[node.nodeName] = JSON.parse(node.textContent || "{}");
    }
  });
  return result;
}

/***************************************************************
 * 3) CREATE WINBOX UTILITY (Shared)
 ***************************************************************/

function createWinBox(title, htmlContent, onCreateCallback) {
  const container = document.createElement("div");
  container.classList.add("winbox-content");
  container.innerHTML = htmlContent;

  singleWinBox = new WinBox({
    title: title,
    width: "80%",
    height: "80%",
    x: "center",
    y: "center",
    mount: container,
    oncreate() {
      if (typeof onCreateCallback === "function") {
        onCreateCallback(container, this);
      }
    },
    onclose() {
      singleWinBox = null;
    }
  });
}

function showModal(title, message, onClose) {
  // Create the modal content container
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";

  // Create an icon
  const iconSpan = document.createElement("span");
  iconSpan.className = "iconify";
  iconSpan.dataset.icon = "mdi:information-outline";
  iconSpan.style.fontSize = "48px";
  iconSpan.style.marginBottom = "10px";
  modalContent.appendChild(iconSpan);

  // Create a paragraph for the message
  const msgP = document.createElement("p");
  msgP.textContent = message;
  msgP.style.margin = "10px 0";
  modalContent.appendChild(msgP);

  // Create an OK button
  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.style.padding = "8px 16px";
  okBtn.style.border = "none";
  okBtn.style.backgroundColor = "#007bff";
  okBtn.style.color = "white";
  okBtn.style.borderRadius = "4px";
  okBtn.style.cursor = "pointer";

  okBtn.onclick = function() {
    modal.close();
    if (typeof onClose === "function") onClose();
  };

  // Create a container for the button
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "buttonContainer";
  buttonContainer.appendChild(okBtn);

  // Append the container to the modal content
  modalContent.appendChild(buttonContainer);

  // Play the modal.mp3 audio
  const audio = new Audio('modal.mp3');
  audio.play();

  // Create the WinBox modal
  const modal = new WinBox({
    title: title,
    modal: true,
    width: "40%",
    height: "20%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function () {
      this.setBackground("#444");
    }
  });
}


/***************************************************************
 * 4) Debugger
 ***************************************************************/
// New function to run AI test and update debug box
async function runAITest() {
  
  // Append an AI Test Result placeholder if it doesn't exist
  let aiDiv = document.getElementById("aiTestResult");
  if (!aiDiv) {
    const dumpArea = document.getElementById("dumpText");
    if (dumpArea) {
      aiDiv = document.createElement("div");
      aiDiv.id = "aiTestResult";
      aiDiv.innerText = "AI Test Result: Running...";
      dumpArea.parentElement.appendChild(aiDiv);
    }
  }

  // Get settings from sessionStorage
  const selectedLlm = sessionStorage.getItem("llmType") || "manual";
  const apiKey = sessionStorage.getItem("llmApiKey") || "";
  const promptMsg = `Respond with "OK Ready, here is test response:"   ${document.getElementById("dumpArea").innerText} - list all errors and warnings and summarize them in a few sentences.`;
  console.log(promptMsg);

  if (selectedLlm === "manual" || !apiKey) {
    updateAITestResult("AI Test Result: Manual LLM selected or API key empty. No API call made.");
    return;
  }

  try {
    let responseText = "";
    if (selectedLlm === "openai") {
      const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: promptMsg }],
          max_tokens: 50,
          temperature: 0.7
        })
      });
      if (!openAiRes.ok) {
        const errData = await openAiRes.json();
        throw new Error(errData.error?.message || `HTTP ${openAiRes.status}`);
      }
      const openAiData = await openAiRes.json();
      responseText = openAiData?.choices?.[0]?.message?.content || "No content returned.";
    } else if (selectedLlm === "google") {
      const googleModel = sessionStorage.getItem("googleModel") || "gemini-1.5-flash";
      const googleRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + googleModel + ":generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptMsg }] }]
        })
      });
      if (!googleRes.ok) {
        const errData = await googleRes.json();
        throw new Error(errData.error?.message || `HTTP ${googleRes.status}`);
      }
      const googleData = await googleRes.json();
      const candidate = googleData?.candidates?.[0];
      if (candidate) {
        if (typeof candidate.output === "string") {
          responseText = candidate.output;
        } else if (candidate.content) {
          if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
            responseText = candidate.content.parts.map(p => typeof p === "object" ? (p.text || "") : p).join("");
          } else if (typeof candidate.content === "string") {
            responseText = candidate.content;
          } else {
            responseText = JSON.stringify(candidate.content);
          }
        } else {
          responseText = "No output returned from Google LLM.";
        }
      } else {
        responseText = "No output returned from Google LLM.";
      }
    }
    updateAITestResult("AI Test Result: " + responseText.trim());
  } catch (error) {
    updateAITestResult("AI Test Result: Error - " + (error.message || error));
  }
}

function updateAITestResult(text) {
  const aiDiv = document.getElementById("aiTestResult");
  if (aiDiv) {
    aiDiv.innerText = text;
  }
}

// Colorize dump text
function colorizeDumpText(text) {
  // Escape HTML special characters
  text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Color keys at start of lines (e.g., "phonologyMain:")
  text = text.replace(/^(\s*[\w-]+:)/gm, '<span style="color: #0077aa;">$1</span>');
  // Color content within square brackets
  text = text.replace(/\[([^\]]+)\]/g, '<span style="color: #00aa00;">[$1]</span>');
  // Color JSON keys in objects (inside quotes)
  text = text.replace(/"([^"]+)":/g, '<span style="color: #aa00aa;">"$1"</span>:');
  // Color numbers (after a colon)
  text = text.replace(/: (\d+)/g, ': <span style="color: #aa5500;">$1</span>');
  // Color boolean values (true/false)
  text = text.replace(/: (true|false)/g, ': <span style="color: #aa0000;">$1</span>');
  // Color text inside parentheses (e.g., (Enabled))
  text = text.replace(/\(([^)]+)\)/g, '(<span style="color: #5555ff;">$1</span>)');
  return '<pre>' + text + '</pre>';
}
 
// Helper: determine if a URL is external relative to the current host
function isExternal(url) {
  try {
    const linkUrl = new URL(url, window.location.href);
    return linkUrl.host !== window.location.host;
  } catch (e) {
    return false;
  }
}
 
// Helper: check if a URL is from GitHub or related CDNs
function isGithub(url) {
  return url.includes("github.com") ||
         url.includes("raw.githubusercontent.com") ||
         url.includes("githack.com");
}
 
// Global array to store loaded file info
window.loadedFiles = [];
 
// List loaded files (stylesheets & scripts) and record their info
function listLoadedFiles() {
  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => sheet.href)
    .filter(href => href);
  const scripts = Array.from(document.getElementsByTagName("script"))
    .map(script => script.src)
    .filter(src => src);
 
  let html = '<div style="margin-top: 10px;">';
  html += '<h3>Loaded Stylesheets:</h3>';
  if (stylesheets.length) {
    stylesheets.forEach(url => {
      // Record file info globally
      window.loadedFiles.push({ url: url, isExternal: isExternal(url) });
      html += `<div class="file-line">`;
      html += `<a href="${url}" target="_blank" style="color: #ff8800; text-decoration: none;">${url}</a>`;
      if (!isExternal(url) || isGithub(url)) {
        html += ' - <span class="file-header-info" data-url="' + url + '">Loading header...</span>';
      } else {
        html += ' (external)';
      }
      html += `</div>`;
    });
  } else {
    html += 'None found<br>';
  }
 
  html += '<h3>Loaded JavaScript Files:</h3>';
  if (scripts.length) {
    scripts.forEach(url => {
      window.loadedFiles.push({ url: url, isExternal: isExternal(url) });
      html += `<div class="file-line">`;
      html += `<a href="${url}" target="_blank" style="color: #ff8800; text-decoration: none;">${url}</a>`;
      if (!isExternal(url) || isGithub(url)) {
        html += ' - <span class="file-header-info" data-url="' + url + '">Loading header...</span>';
      } else {
        html += ' (external)';
      }
      html += `</div>`;
    });
  } else {
    html += 'None found<br>';
  }
  html += '</div>';
  return html;
}
 
// Fetch and display header info for non-local files
async function fetchAndDisplayFileHeaders() {
  const headerElements = document.querySelectorAll('.file-header-info');
  for (const elem of headerElements) {
    const url = elem.getAttribute('data-url');
    try {
      const linkUrl = new URL(url, window.location.href);
      // For local files, skip fetching (header info is reported via healthcheck)
      if (linkUrl.protocol === "file:") {
        elem.textContent = 'Local file header not available';
        continue;
      }
      const response = await fetch(url);
      if (!response.ok) {
        elem.textContent = 'Error loading header';
        continue;
      }
      const text = await response.text();
      // Parse header info (Version and MD5 Sum)
      const versionMatch = text.match(/Version:\s*([^\n*]+)/);
      const md5Match = text.match(/MD5 Sum:\s*\[?([^\]\n]+)\]?/);
      if (isGithub(url) && !versionMatch && !md5Match) {
        elem.textContent = '(external)';
      } else {
        const version = versionMatch ? versionMatch[1].trim() : 'N/A';
        const md5 = md5Match ? md5Match[1].trim() : 'N/A';
        elem.textContent = `Version: ${version}, MD5: ${md5}`;
      }
    } catch (error) {
      elem.textContent = 'Error fetching header';
    }
  }
}
 
// Global object to hold local file healthcheck results
window.healthcheckResults = {};
 
// Function for local files to report their health status at the end of their code
// Example: registerHealthcheckResult(window.location.href, true, 'File loaded successfully');
function registerHealthcheckResult(url, result, message) {
  window.healthcheckResults[url] = { result: result, message: message || '' };
}
 
// Healthcheck: verify that all files defined in the page exist and are readable
async function healthcheckFiles() {
  let results = [];
  for (let file of window.loadedFiles) {
    // Only check JavaScript files (e.g. URLs ending in ".js")
    if (!file.url.toLowerCase().endsWith('.js')) continue;
    
    if (file.isExternal) {
      try {
        let response = await fetch(file.url, { method: 'HEAD' });
        if (response.ok) {
          results.push({ url: file.url, status: "OK", color: "green" });
        } else {
          results.push({ url: file.url, status: "Error: " + response.status, color: "red" });
        }
      } catch (e) {
        results.push({ url: file.url, status: "Fetch error", color: "red" });
      }
    } else {
      if (window.healthcheckResults[file.url]) {
        let res = window.healthcheckResults[file.url];
        if (res.result) {
          results.push({ url: file.url, status: "OK", color: "green" });
        } else {
          results.push({ url: file.url, status: "Error", message: res.message, color: "red" });
        }
      } else {
        results.push({ url: file.url, status: "Local file healthcheck not reported", color: "red" });
      }
    }
  }
  let html = "<h3>Healthcheck Results (JS Files Only):</h3>";
  results.forEach(r => {
    html += `<div style="color: ${r.color};">${r.url}: ${r.status}` + (r.message ? " (" + r.message + ")" : "") + "</div>";
  });
  const container = document.getElementById("healthcheckResults");
  if (container) {
    container.innerHTML = html;
  }
}

// Dump session data, list files, and automatically run healthcheck when debug menu is opened
function dumpAndColorizeSessionData() {
  const filename = window.location.pathname.split('/').pop();
  const locationData = window.location.href;
  const documentTitle = document.title;
  const referrer = document.referrer;
  const browserInfo = navigator.userAgent;
  const systemInfo = navigator.platform;
  const screenInfo = `${screen.width}x${screen.height} (avail: ${screen.availWidth}x${screen.availHeight})`;
  const devicePixelRatio = window.devicePixelRatio;
  const language = navigator.language;
  const hardwareConcurrency = navigator.hardwareConcurrency;
  const windowData = `Width: ${window.innerWidth}, Height: ${window.innerHeight}`;
  const timestamp = new Date().toLocaleString();
 
  let dumpText =
    `filename: ${filename}\n` +
    `location: ${locationData}\n` +
    `document title: ${documentTitle}\n` +
    `referrer: ${referrer}\n` +
    `browser: ${browserInfo}\n` +
    `system: ${systemInfo}\n` +
    `screen: ${screenInfo}\n` +
    `devicePixelRatio: ${devicePixelRatio}\n` +
    `language: ${language}\n` +
    `hardwareConcurrency: ${hardwareConcurrency}\n` +
    `windowData: ${windowData}\n` +
    `timestamp: ${timestamp}\n\n`;
 
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
 
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
 
  // Append loaded files HTML and add a container for healthcheck results
  const loadedFilesHtml = listLoadedFiles() +
    '<div id="healthcheckResults" style="margin-top: 10px;"></div>';
 
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' +
    coloredHtml + loadedFilesHtml + '</div>';
    const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button> ' +
    '<button id="reloadButton">Reload</button>' +
    '</div>';
 
  const finalHtml = scrollableHtml + buttonHtml;
 
  // Open the debug window using createWinBox (assumed to be defined)
  createWinBox("debug", finalHtml, function(container, winbox) {
   const copyButton = container.querySelector("#copyButton");
if (copyButton) {
  copyButton.addEventListener("click", function() {
    // Gather text from dump area and healthcheck results
    const dumpText = container.querySelector("#dumpArea").innerText;
    const healthcheckText = container.querySelector("#healthcheckResults") ? container.querySelector("#healthcheckResults").innerText : "";
    const combinedText = dumpText + "\n" + healthcheckText;
    navigator.clipboard.writeText(combinedText)
      .then(() => alert("Text copied to clipboard!"))
      .catch(err => console.error("Failed to copy text: ", err));
  });
}

    
    const wrapButton = container.querySelector("#wrapButton");
    if (wrapButton) {
      wrapButton.addEventListener("click", function() {
      const dumpTextEl = container.querySelector("#dumpText");
      if (dumpTextEl) {
        dumpTextEl.style.whiteSpace = dumpTextEl.style.whiteSpace === "pre-wrap" ? "pre" : "pre-wrap";
      }
      });
    }
    const reloadButton = container.querySelector("#reloadButton");
    if (reloadButton) {
      reloadButton.addEventListener("click", function() {
      window.location.reload();
      });
    }
 
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
 
    // Automatically run the healthcheck and fetch file headers when the debug menu is opened
    
    healthcheckFiles();
    fetchAndDisplayFileHeaders();
    runAITest();
    let dumpArea = document.getElementById("dumpArea");
if (dumpArea) {
  let aiLogElem = dumpArea.querySelector("#AIlog");
  if (!aiLogElem) {
    aiLogElem = document.createElement("div");
    aiLogElem.id = "AIlog";
    // Optionally add some styling or classes here
    dumpArea.appendChild(aiLogElem);
  }
  aiLogElem.innerHTML = ""; // Clear previous content
  aiLogElem.innerHTML = `AI CALL Cont: \`${context}\` Prompt: \`${prompt}\` RL: \`${responseLength}\` FM: \`${formatting}\` END`;
} else {
  console.warn('Element with id "dumpArea" not found.');
}



  });
}
 
// Initialize debug dump on triple tilde key press
function initTildeDump() {
  let pressCount = 0;
  let lastPressTime = 0;
  document.addEventListener("keydown", function (e) {
    if (e.code === "Backquote") {
      const now = Date.now();
      if (now - lastPressTime > 1000) {
        pressCount = 0;
      }
      pressCount++;
      lastPressTime = now;
      if (pressCount === 3) {
        dumpAndColorizeSessionData();
        pressCount = 0;
      }
    }
  });
}

 
initTildeDump();
document.addEventListener("DOMContentLoaded", function () {
  let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let enteredKeys = [];
  
  document.addEventListener("keydown", function (event) {
      enteredKeys.push(event.keyCode);
      if (enteredKeys.toString().indexOf(konamiCode.toString()) >= 0) {
          enteredKeys = [];
          activateKonamiEffect();
      }
  });
  
  function activateKonamiEffect() {
   
        document.querySelectorAll("button").forEach(button => {
          button.style.transition = "transform 1s ease-in-out";
          button.style.transform = "rotate(360deg)";
          setTimeout(() => {
              button.style.transform = "rotate(0deg)";
          }, 1000);
      });

      const konami = new Audio('modal.mp3');
      konami.play();
     
      let funnyTexts = [
        "¿Por qué el código nunca se aburre? ¡Porque siempre da vueltas en bucles infinitos de risas!",
        "Почему программист бросил свой компьютер? Он не мог удержаться от смеха над багами!",
        "なぜプログラマーはラーメンが大好き？コードが『麺』と絡むから！",
        "Varför skrattade JavaScript-utvecklaren? Han var fast i en evig callback-loop!",
        "Pourquoi le développeur a-t-il apporté une échelle ? Pour monter en niveau dans son code hilarant!",
        "Dlaczego programista śmiał się do łez? Bo każdy bug był żartem losu!",
        "I told my computer a joke so funny it restarted—talk about a viral bug!",
        "Warum war der Computer ein Komiker? Weil sein Code ständig über eigene Bits stolperte!",
        "Perché il programmatore non poté smettere di ridere? Il suo codice era un vero scherzo!",
        "لماذا ضحك الكمبيوتر؟ لأنه وجد في الكود نكتة لا تُقاوم!",
        "为什么程序员笑得停不下来？因为他们的代码充满了搞笑bug！",
        "प्रोग्रामर इतना हँसता रहा, क्योंकि उसके कोड में हर बग पर मज़ाक था!",
        "Por que o programador levou o laptop para o circo? Porque queria ver o código fazendo acrobacias!",
        "Waarom lachte de computer zo hard? Omdat zijn code de grappigste bugs had!",
        "왜 컴퓨터가 웃음을 멈추지 못했을까요? 코드가 너무 유머러스해서요!"
      ];
      


      new WinBox("KoNaMi AcTiVatEd", {
        html: `<center><h1 style="padding;20px;">${funnyTexts[Math.floor(Math.random() * funnyTexts.length)]}</h1></center>`,
        x: "center",
        y: "center",
        width: "80%",
        height: "10%",
        modal: true,


    });
  }
});



/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  if (typeof window.registerHealthcheckResult === 'function') {
    window.registerHealthcheckResult(myURL, true, 'File loaded successfully');
    console.log('Healthcheck registered for main script of: ' + myURL);
  } else {
    console.warn('registerHealthcheckResult not available for main: ' + myURL);
  }
})();

