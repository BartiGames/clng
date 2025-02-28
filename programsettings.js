/** PROGRAM SETTINGS HTML **/
const programSettingsHTML = `
  <h2>Program Settings</h2>
  <p style="margin-top: 0; font-size: 0.9rem; color: #999;">
    Customize interface theme & title bars (6-digit hex).
  </p>
  <form>
    <fieldset>
      <legend>General</legend>
      <div class="form-group">
        <label for="themeSelect">Interface Theme</label>
        <select id="themeSelect">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <small style="font-size:0.8rem; color:#666;">
          Switch between Light or Dark UI mode
        </small>
      </div>
    </fieldset>

    <fieldset id="lightTitleFieldset" style="display:none;">
      <legend>Light Mode Title Bar</legend>
      <div class="form-group">
        <small style="font-size:0.8rem; color:#666;">
          6-digit hex color for window title bars in Light mode
        </small>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button type="button" id="lightTitleButton">Pick Color</button>
          <input type="color" id="lightTitle" value="#cccccc" style="display:none;">
        </div>
      </div>
    </fieldset>

    <fieldset id="darkTitleFieldset" style="display:none;">
      <legend>Dark Mode Title Bar</legend>
      <div class="form-group">
        <small style="font-size:0.8rem; color:#666;">
          6-digit hex color for window title bars in Dark mode
        </small>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button type="button" id="darkTitleButton">Pick Color</button>
          <input type="color" id="darkTitle" value="#3a3a3a" style="display:none;">
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>LLM Settings</legend>
      <div class="form-group">
        <label>LLM Type:</label>
        <div style="display: flex; flex-direction: column; gap: 0.3rem; margin: 0.3rem 0;">
          <label><input type="radio" name="llmType" value="manual"> Manual LLM</label>
          <label><input type="radio" name="llmType" value="openai"> OpenAI LLM</label>
          <label><input type="radio" name="llmType" value="google"> Google LLM</label>
        </div>
        <small style="font-size:0.8rem; color:#666;">
          Choose which LLM integration you want to use
        </small>
      </div>
      <!-- New: Google Model selection -->
      <div class="form-group" style="margin-top:1rem;">
        <label for="googleModel">Google Model:</label>
        <input type="text" id="googleModel" style="width: 100%;" value="gemini-1.5-flash">
      </div>
      <div class="form-group" style="margin-top:1rem;">
        <label for="apiKey">LLM API key:</label>
        <input type="text" id="apiKey" style="width: 100%;" placeholder="Enter your LLM API key here">
      </div>

      <div class="form-group" style="margin-top:1rem;">
        <button type="button" id="testApiBtn">Test API</button>
      </div>

      <div class="form-group" style="margin-top:1rem;">
        <label for="apiReturn">API Return:</label>
        <textarea id="apiReturn" style="width: 100%; height: 4rem;" readonly></textarea>
      </div>
    </fieldset>
  </form>
`;

/** Open Program Settings WinBox **/
function openProgramSettings() {
  // We pass an oncreate callback that receives (container, winboxInstance).
  createWinBox("Program Settings", programSettingsHTML, function (container) {
    initSettingsUI(container);
  });
}

/** Init UI logic for color/theme and LLM settings **/
function initSettingsUI(container) {
  // Utility to check valid 6-digit hex
  function isValidHex(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  const themeSelect = container.querySelector("#themeSelect");
  const isDark = document.documentElement.classList.contains("dark-theme");
  themeSelect.value = isDark ? "dark" : "light";

  const lightFS = container.querySelector("#lightTitleFieldset");
  const darkFS  = container.querySelector("#darkTitleFieldset");

  // Show/hide color pickers based on current theme
  if (isDark) {
    darkFS.style.display  = "";
    lightFS.style.display = "none";
  } else {
    darkFS.style.display  = "none";
    lightFS.style.display = "";
  }

  // Toggle theme
  themeSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "dark") {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark-theme");
      sessionStorage.setItem("theme", "dark");
      darkFS.style.display  = "";
      lightFS.style.display = "none";
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.classList.add("light-theme");
      sessionStorage.setItem("theme", "light");
      darkFS.style.display  = "none";
      lightFS.style.display = "";
    }
  });

  // Light color
  const lightInput  = container.querySelector("#lightTitle");
  const lightButton = container.querySelector("#lightTitleButton");
  const savedLight  = sessionStorage.getItem("lightTitle");
  if (savedLight && isValidHex(savedLight)) {
    lightInput.value = savedLight;
    document.documentElement.style.setProperty("--light-title", savedLight);
  }
  lightButton.addEventListener("click", () => lightInput.click());
  lightInput.addEventListener("input", (ev) => {
    const color = ev.target.value;
    if (isValidHex(color)) {
      document.documentElement.style.setProperty("--light-title", color);
      sessionStorage.setItem("lightTitle", color);
    }
  });

  // Dark color
  const darkInput  = container.querySelector("#darkTitle");
  const darkButton = container.querySelector("#darkTitleButton");
  const savedDark  = sessionStorage.getItem("darkTitle");
  if (savedDark && isValidHex(savedDark)) {
    darkInput.value = savedDark;
    document.documentElement.style.setProperty("--dark-title", savedDark);
  }
  darkButton.addEventListener("click", () => darkInput.click());
  darkInput.addEventListener("input", (ev) => {
    const color = ev.target.value;
    if (isValidHex(color)) {
      document.documentElement.style.setProperty("--dark-title", color);
      sessionStorage.setItem("darkTitle", color);
    }
  });

  // --- LLM Settings ---
  const radioButtons = container.querySelectorAll('input[name="llmType"]');
  const apiKeyInput  = container.querySelector("#apiKey");
  const testApiBtn   = container.querySelector("#testApiBtn");
  const apiReturn    = container.querySelector("#apiReturn");
  // New: Google model input
  const googleModelInput = container.querySelector("#googleModel");
  const storedGoogleModel = sessionStorage.getItem("googleModel");
  if (storedGoogleModel) {
    googleModelInput.value = storedGoogleModel;
  }
  googleModelInput.addEventListener("input", () => {
    sessionStorage.setItem("googleModel", googleModelInput.value.trim());
  });

  // Load from sessionStorage if present
  const storedLlmType = sessionStorage.getItem("llmType");
  const storedApiKey  = sessionStorage.getItem("llmApiKey");

  // Set initial radio button selection
  if (storedLlmType) {
    radioButtons.forEach(rb => {
      rb.checked = (rb.value === storedLlmType);
    });
  }

  // Set initial API key
  if (storedApiKey) {
    apiKeyInput.value = storedApiKey;
  }

  // Radio change -> store
  radioButtons.forEach(rb => {
    rb.addEventListener("change", () => {
      sessionStorage.setItem("llmType", rb.value);
    });
  });

  // API key change -> store
  apiKeyInput.addEventListener("input", () => {
    sessionStorage.setItem("llmApiKey", apiKeyInput.value.trim());
  });

  // Test API
  testApiBtn.addEventListener("click", async () => {
    console.log("Test API triggered at:", new Date());
    const selectedLlm = sessionStorage.getItem("llmType") || "manual";
    const apiKey      = sessionStorage.getItem("llmApiKey") || "";

    // Example prompt
    const promptMsg = `Hello, the user just added your API key to conlang tool respond "OK Ready" if you are ready to assist the user else state an error in one sentence.`;

    apiReturn.value = ""; // clear old result

    // If user chose manual, no fetch
    if (selectedLlm === "manual") {
      apiReturn.value = "Manual LLM selected. No API call was made.";
      return;
    }

    if (!apiKey) {
      apiReturn.value = "Error: API key is empty. Please enter a key.";
      return;
    }

    try {
      let responseText = "";

      if (selectedLlm === "openai") {
        // --- OpenAI Chat Completion ---
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "user", content: promptMsg }
            ],
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
      }
      else if (selectedLlm === "google") {
        // --- Google Gemini API (Gemini 1.5 Flash) ---
        const googleModel = googleModelInput.value.trim() || "gemini-1.5-flash";
        const googleRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + googleModel + ":generateContent?key=" + apiKey, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: promptMsg }]
            }]
          })
        });
        if (!googleRes.ok) {
          const errData = await googleRes.json();
          throw new Error(errData.error?.message || `HTTP ${googleRes.status}`);
        }
        const googleData = await googleRes.json();
        console.debug("Google LLM response:", googleData);
        // Changed code: extract response text from candidate content if needed.
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

      apiReturn.value = responseText.trim();
    } catch (error) {
      apiReturn.value = `Error: ${error.message || error}`;
    }
  });
}

/** OPTIONAL: set theme from prior session if it exists **/
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = sessionStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.add("light-theme");
  }
  const lightTitle = sessionStorage.getItem("lightTitle");
  if (lightTitle && /^#[0-9A-Fa-f]{6}$/.test(lightTitle)) {
    document.documentElement.style.setProperty("--light-title", lightTitle);
  }
  const darkTitle = sessionStorage.getItem("darkTitle");
  if (darkTitle && /^#[0-9A-Fa-f]{6}$/.test(darkTitle)) {
    document.documentElement.style.setProperty("--dark-title", darkTitle);
  }
});
