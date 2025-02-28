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

function dumpAndColorizeSessionData() {
  // Create debug info text with additional data
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

  const debugInfoText =
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

  // Append sessionStorage dump data
  let dumpText = debugInfoText;
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
  
  // Colorize the dump text and assign an id for toggling wrap
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
  
  // Create a scrollable container for the dump
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' + coloredHtml + '</div>';
  
  // Add copy and toggle wrap buttons
  const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button>' +
    '</div>';
  
  const finalHtml = scrollableHtml + buttonHtml;
  
  // Open a WinBox window titled "debug" with the final HTML
  createWinBox("debug", finalHtml, function(container, winbox) {
    const copyButton = container.querySelector("#copyButton");
    if (copyButton) {
      copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(dumpText)
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
    
    // Adjust dumpArea height on winbox resize
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
  });
}
function colorizeDumpText(text) {
  // Escape HTML special characters for debug text only
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
    html += '<ul>';
    stylesheets.forEach(url => {
       html += `<li><a href="${url}" target="_blank">${url}</a></li>`;
    });
    html += '</ul>';
  } else {
    html += '<p>None found</p>';
  }
  
  html += '<h3>Loaded JavaScript Files:</h3>';
  if (scripts.length) {
    html += '<ul>';
    scripts.forEach(url => {
       html += `<li><a href="${url}" target="_blank">${url}</a></li>`;
    });
    html += '</ul>';
  } else {
    html += '<p>None found</p>';
  }
  html += '</div>';
  return html;
}

function dumpAndColorizeSessionData() {
  // Create debug info text with additional data
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

  // Append sessionStorage dump data
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
  
  // Colorize the debug text (this will be HTML escaped)
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
  
  // Get clickable links for loaded files (as raw HTML)
  const loadedFilesHtml = listLoadedFiles();
  
  // Combine both parts in a scrollable container
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' + coloredHtml + loadedFilesHtml + '</div>';
  
  // Add copy and toggle wrap buttons
  const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button>' +
    '</div>';
  
  const finalHtml = scrollableHtml + buttonHtml;
  
  // Open a WinBox window titled "debug" with the final HTML
  createWinBox("debug", finalHtml, function(container, winbox) {
    const copyButton = container.querySelector("#copyButton");
    if (copyButton) {
      copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(dumpText)
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
    
    // Adjust dumpArea height on winbox resize
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
  });
}

function colorizeDumpText(text) {
  // Escape HTML special characters for debug text only
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
      html += `<a href="${url}" target="_blank" style="color: #000000; text-decoration: none;">${url}</a> (external)<br>`;
    });
  } else {
    html += 'None found<br>';
  }
  
  html += '<h3>Loaded JavaScript Files:</h3>';
  if (scripts.length) {
    scripts.forEach(url => {
      html += `<a href="${url}" target="_blank" style="color: #000000; text-decoration: none;">${url}</a> (external)<br>`;
    });
  } else {
    html += 'None found<br>';
  }
  html += '</div>';
  return html;
}

function dumpAndColorizeSessionData() {
  // Create debug info text with additional data
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

  // Append sessionStorage dump data
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
  
  // Colorize the debug text (this will be HTML escaped)
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
  
  // Get clickable links for loaded files (as raw HTML)
  const loadedFilesHtml = listLoadedFiles();
  
  // Combine both parts in a scrollable container
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' + coloredHtml + loadedFilesHtml + '</div>';
  
  // Add copy and toggle wrap buttons
  const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button>' +
    '</div>';
  
  const finalHtml = scrollableHtml + buttonHtml;
  
  // Open a WinBox window titled "debug" with the final HTML
  createWinBox("debug", finalHtml, function(container, winbox) {
    const copyButton = container.querySelector("#copyButton");
    if (copyButton) {
      copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(dumpText)
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
    
    // Adjust dumpArea height on winbox resize
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
  });
}

function colorizeDumpText(text) {
  // Escape HTML special characters for debug text only
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
      html += `<a href="${url}" target="_blank" style="color: #000000; text-decoration: none;">${url}</a> (external)<br>`;
    });
  } else {
    html += 'None found<br>';
  }
  
  html += '<h3>Loaded JavaScript Files:</h3>';
  if (scripts.length) {
    scripts.forEach(url => {
      html += `<a href="${url}" target="_blank" style="color: #000000; text-decoration: none;">${url}</a> (external)<br>`;
    });
  } else {
    html += 'None found<br>';
  }
  html += '</div>';
  return html;
}

function dumpAndColorizeSessionData() {
  // Create debug info text with additional data
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

  // Append sessionStorage dump data
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
  
  // Colorize the debug text (this will be HTML escaped)
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
  
  // Get clickable links for loaded files (as raw HTML)
  const loadedFilesHtml = listLoadedFiles();
  
  // Combine both parts in a scrollable container
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' + coloredHtml + loadedFilesHtml + '</div>';
  
  // Add copy and toggle wrap buttons
  const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button>' +
    '</div>';
  
  const finalHtml = scrollableHtml + buttonHtml;
  
  // Open a WinBox window titled "debug" with the final HTML
  createWinBox("debug", finalHtml, function(container, winbox) {
    const copyButton = container.querySelector("#copyButton");
    if (copyButton) {
      copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(dumpText)
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
    
    // Adjust dumpArea height on winbox resize
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
  });
}
function colorizeDumpText(text) {
  // Escape HTML special characters for debug text only
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

function listLoadedFiles() {
  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => sheet.href)
    .filter(href => href);
  const scripts = Array.from(document.getElementsByTagName("script"))
    .map(script => script.src)
    .filter(src => src);
  
  // Helper: determine if URL is external relative to current host
  function isExternal(url) {
    try {
      const linkUrl = new URL(url, window.location.href);
      return linkUrl.host !== window.location.host;
    } catch (e) {
      return false;
    }
  }
  
  let html = '<div style="margin-top: 10px;">';
  html += '<h3>Loaded Stylesheets:</h3>';
  if (stylesheets.length) {
    stylesheets.forEach(url => {
      html += `<div class="file-line">`;
      html += `<a href="${url}" target="_blank" style="color: #ff8800; text-decoration: none;">${url}</a>`;
      if (isExternal(url)) {
        html += ' (external)';
      } else {
        html += ' - <span class="file-header-info" data-url="' + url + '">Loading header...</span>';
      }
      html += `</div>`;
    });
  } else {
    html += 'None found<br>';
  }
  
  html += '<h3>Loaded JavaScript Files:</h3>';
  if (scripts.length) {
    scripts.forEach(url => {
      html += `<div class="file-line">`;
      html += `<a href="${url}" target="_blank" style="color: #ff8800; text-decoration: none;">${url}</a>`;
      if (isExternal(url)) {
        html += ' (external)';
      } else {
        html += ' - <span class="file-header-info" data-url="' + url + '">Loading header...</span>';
      }
      html += `</div>`;
    });
  } else {
    html += 'None found<br>';
  }
  html += '</div>';
  return html;
}

async function fetchAndDisplayFileHeaders() {
  const headerElements = document.querySelectorAll('.file-header-info');
  for (const elem of headerElements) {
    const url = elem.getAttribute('data-url');
    try {
      // Check if URL is local (file://); if so, skip fetching header info
      const linkUrl = new URL(url, window.location.href);
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
      // Parse header info: look for Version and MD5 Sum in the file header comment
      const versionMatch = text.match(/Version:\s*([^\n*]+)/);
      const md5Match = text.match(/MD5 Sum:\s*\[?([^\]\n]+)\]?/);
      const version = versionMatch ? versionMatch[1].trim() : 'N/A';
      const md5 = md5Match ? md5Match[1].trim() : 'N/A';
      elem.textContent = `Version: ${version}, MD5: ${md5}`;
    } catch (error) {
      elem.textContent = 'Error fetching header';
    }
  }
}

function dumpAndColorizeSessionData() {
  // Create debug info text with additional data
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

  // Append sessionStorage dump data
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    dumpText += `${key}: ${value}\n`;
  }
  
  // Colorize the debug text (HTML escaped)
  let coloredHtml = colorizeDumpText(dumpText);
  coloredHtml = coloredHtml.replace("<pre>", '<pre id="dumpText">');
  
  // Get clickable links for loaded files with header info placeholders
  const loadedFilesHtml = listLoadedFiles();
  
  // Combine both parts in a scrollable container
  const scrollableHtml = '<div id="dumpArea" style="overflow: auto; height: 900px">' + coloredHtml + loadedFilesHtml + '</div>';
  
  // Add copy and toggle wrap buttons
  const buttonHtml = '<div id="buttonContainer">' +
    '<button id="copyButton">Copy Text</button> ' +
    '<button id="wrapButton">Toggle Wrap</button>' +
    '</div>';
  
  const finalHtml = scrollableHtml + buttonHtml;
  
  // Open a WinBox window titled "debug" with the final HTML
  createWinBox("debug", finalHtml, function(container, winbox) {
    const copyButton = container.querySelector("#copyButton");
    if (copyButton) {
      copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(dumpText)
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
    
    // Adjust dumpArea height on winbox resize
    winbox.onresize = function() {
      const dumpArea = container.querySelector("#dumpArea");
      const buttonContainer = container.querySelector("#buttonContainer");
      if (dumpArea) {
        const newHeight = winbox.body.getBoundingClientRect().height -
                          (buttonContainer ? buttonContainer.offsetHeight : 0) - 20;
        dumpArea.style.height = newHeight + "px";
      }
    };
    // After rendering, fetch and display file header info for local files
    fetchAndDisplayFileHeaders();
  });
}

function initTildeDump() {
  let pressCount = 0;
  let lastPressTime = 0;
  
  document.addEventListener("keydown", function (e) {
    // Use e.code "Backquote" (key producing "~" when shifted)
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
