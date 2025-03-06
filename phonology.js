/*
 * File: phonology.js
 * Description: Manages the phonology agent including data initialization, modal creation,
 *              glyph editor functionality, and phoneme inventory handling.
 * Version: 1.0.0
 * Comments: Initial release; implements core functionalities for phonological processing.
 * MD5 Sum: [INSERT_MD5_HASH_HERE]
 */

// ----- PHONOLOGY AGENT DATA & TAB SWITCHING -----
if (!window.projectData) window.projectData = {};
if (!projectData.phonology) {
  projectData.phonology = {
    inventory: [],
    syllables: [],
    phonotactics: [],
    script: []
  };
}

// ----- HELPER FUNCTIONS -----
// Create a modal using WinBox
function createModal(title, content, width, height, isModal = true) {
  return new WinBox({
    title: title,
    modal: isModal,
    width: width,
    height: height,
    x: "center",
    y: "center",
    mount: content,
    onfocus: function () { this.setBackground("#444"); }
  });
}

// Create a styled button element
function createButton({ text, title, innerHTML, styles, onClick }) {
  const btn = document.createElement("button");
  if (innerHTML) {
    btn.innerHTML = innerHTML;
  } else {
    btn.textContent = text;
  }
  if (title) btn.title = title;
  if (styles) {
    for (let prop in styles) {
      btn.style[prop] = styles[prop];
    }
  }
  btn.onclick = onClick;
  return btn;
}

// Helper for initializing a GlyphEditor for displaying glyphs (read-only)
function initializeGlyphEditor(containerId, glyph, tdGlyph) {
  setTimeout(() => {
    try {
      const glyphEditor = new GlyphEditor(containerId, {
        resolution: 64,
        editable: false,
        outputVisible: false,
        onChange: () => {}
      });
      glyphEditor.grid.style.gap = "0";
      glyphEditor.grid.style.border = "1px solid #ccc";
      glyphEditor.grid.style.margin = "0";
      glyphEditor.cells.forEach(cell => {
        cell.style.border = "none";
      });
      glyphEditor.loadGlyph(glyph, false);
    } catch (e) {
      console.error("Glyph load error:", e);
      tdGlyph.textContent = "Error loading glyph";
    }
  }, 0);
}

// Ensure that phonology data exists and is properly set
function ensurePhonologyInitialized() {
  if (!projectData.phonology || typeof projectData.phonology !== "object") {
    projectData.phonology = {};
  }
  projectData.phonology.inventory = projectData.phonology.inventory || [];
  projectData.phonology.syllables = projectData.phonology.syllables || [];
  projectData.phonology.phonotactics = projectData.phonology.phonotactics || [];
  projectData.phonology.script = projectData.phonology.script || [];
}

// ----- SCRIPT PRESET INITIALIZATION -----
function initializeScriptPreset(presetName) {
  ensurePhonologyInitialized();
  if (!realWorldScripts[presetName]) {
    showModal("Error", "Preset not found.");
    return;
  }

  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.textAlign = "center";

  // Add icon above the buttons
  const iconContainer = document.createElement("div");
  iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--mdi" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="mdi:information-outline" style="font-size: 48px; margin-bottom: 10px;"><path fill="currentColor" d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2z"></path></svg>`;
  modalContent.appendChild(iconContainer);

  const message = document.createElement("p");
  message.textContent = `Are you sure you want to initialize with the ${presetName} preset? This will overwrite your existing script characters.`;
  modalContent.appendChild(message);

  const audio = new Audio("modal.mp3");
  audio.play();
  
    btnContainer = document.createElement("div");
    btnContainer.id = "buttonContainer";

  const confirmBtn = createButton({
    text: "Yes, load preset",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#28a745",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      modal.close();
      projectData.phonology.script = JSON.parse(JSON.stringify(realWorldScripts[presetName]));
      updatePhonologyMain();
      // Update the script list in the customize alphabet container
      const scriptListElem = document.getElementById("scriptList");
      if (scriptListElem) {
        scriptListElem.innerHTML = "";
        projectData.phonology.script.forEach(item => {
          const tr = createScriptCharacterRow(item);
          scriptListElem.appendChild(tr);
        });
      }
    }
  });

  const cancelBtn = createButton({
    text: "Cancel",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () { modal.close(); }
  });

  btnContainer.appendChild(confirmBtn);
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);
  

  const modal = createModal("Confirm Preset Initialization", modalContent, "40%", "25%");
}


function initializeSelectedPreset() {
  const selectElem = document.getElementById("scriptPresetSelect");
  const presetName = selectElem.value;
  if (presetName) {
    initializeScriptPreset(presetName);
  } else {
    showModal("Preset Error", "Please select a preset.");
  }
}

// ----- TAB SWITCHING & UPDATE -----
function selectPhonologyTab(tabKey) {
  document.querySelectorAll(".phonology-tab").forEach(div => {
    div.style.display = "none";
  });
  const target = document.getElementById(`phonTab-${tabKey}`);
  if (target) target.style.display = "block";
  document.querySelectorAll(".phonology-tab-btn").forEach(btn => {
    btn.style.fontWeight = "normal";
    btn.style.textDecoration = "none";
  });
  const activeBtn = document.querySelector(`.phonology-tab-btn[data-tab="${tabKey}"]`);
  if (activeBtn) {
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.textDecoration = "underline";
  }
  const defaultMsg = document.getElementById("phonologyDefault");
  if (defaultMsg) defaultMsg.style.display = "none";
}

function updatePhonologyMain() {
  let summaryLines = [];
  summaryLines.push("Phoneme Inventory:");
  projectData.phonology.inventory.forEach((p, idx) => {
    summaryLines.push(` ${idx + 1}. Symbol: ${p.symbol}, IPA: ${p.ipa}`);
    summaryLines.push(`    Description: ${p.description}`);
    summaryLines.push(`    Category: ${p.category}`);
    summaryLines.push(`    Features: ${Array.isArray(p.features) ? p.features.join(", ") : p.features}`);
    summaryLines.push(`    Romanization: ${p.romanization}`);
    
  });
  summaryLines.push("\nSyllable Patterns:");
  projectData.phonology.syllables.forEach((s, idx) => {
    summaryLines.push(` ${idx + 1}. Pattern: ${s.pattern}${s.usage ? " (" + s.usage + ")" : ""}`);
  });
  summaryLines.push("\nPhonotactic Rules:");
  projectData.phonology.phonotactics.forEach((r, idx) => {
    summaryLines.push(` ${idx + 1}. ${r.name} [${r.type}] - ${r.details} (${r.enabled ? "Enabled" : "Disabled"})`);
  });
  summaryLines.push("\nScript Characters:");
  projectData.phonology.script.forEach((c, idx) => {
    if (c.method === "custom") {
      summaryLines.push(` ${idx + 1}. Character: ${c.character} [Custom Glyph Code: ${c.glyph}]`);
    } else {
      summaryLines.push(` ${idx + 1}. Character: ${c.character} [Glyph: ${c.glyph}]`);
    }
  });
  const ta = document.getElementById("phonologyMain");
  if (ta) {
    ta.value = summaryLines.join("\n");
    sessionStorage.setItem("phonologyMain", ta.value);
    sessionStorage.setItem("phonologyProjectData", JSON.stringify(projectData.phonology));
  }
}

// ----- PHONEME INVENTORY FUNCTIONS -----
function promptForPhoneme(callback, options = {}) {
  const isEdit = options.isEdit === true;
  const data = options.data || { symbol: "", ipa: "", description: "", category: "", features: [], romanization: "" };

  // Wrap modal content in a container with a unique class for scoping
  const modalRoot = document.createElement("div");
  modalRoot.className = "phoneme-modal";
  modalRoot.style.padding = "10px";
  modalRoot.style.display = "flex";
  modalRoot.style.flexDirection = "column";
  modalRoot.style.alignItems = "center";
  modalRoot.style.gap = "8px";

  const modalHeader = document.createElement("h2");
  modalHeader.textContent = isEdit ? "Edit Phoneme" : "Add New Phoneme";
  modalHeader.style.marginBottom = "10px";
  modalRoot.appendChild(modalHeader);

  // Core Fields Container
  const coreContainer = document.createElement("div");
  coreContainer.style.width = "80%";
  coreContainer.style.border = "1px solid #ccc";
  coreContainer.style.padding = "10px";
  coreContainer.style.marginBottom = "10px";
  coreContainer.style.display = "flex";
  coreContainer.style.flexDirection = "column";
  coreContainer.style.gap = "8px";

  // Symbol Field
  const symLabel = document.createElement("div");
  symLabel.innerHTML = "<strong>Symbol:</strong>";
  symLabel.title = "Enter the conlang’s native script character that represents this phoneme. If you have a custom glyph, select 'Other' to enter it manually.";
  coreContainer.appendChild(symLabel);

  const symSelect = document.createElement("select");
  symSelect.style.width = "100%";
  (projectData.phonology.script || []).forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.character;
    opt.textContent = item.character;
    if (data.symbol === item.character) {
      opt.selected = true;
    }
    symSelect.appendChild(opt);
  });
  const otherOpt = document.createElement("option");
  otherOpt.value = "other";
  otherOpt.textContent = "Other (Enter manually)";
  if (data.symbol && !projectData.phonology.script.some(item => item.character === data.symbol)) {
    otherOpt.selected = true;
  }
  symSelect.appendChild(otherOpt);
  coreContainer.appendChild(symSelect);

  const customSymInput = document.createElement("input");
  customSymInput.type = "text";
  customSymInput.placeholder = "Enter custom symbol (Unicode allowed)";
  customSymInput.style.width = "100%";
  customSymInput.style.display = symSelect.value === "other" ? "block" : "none";
  customSymInput.value = (symSelect.value === "other") ? data.symbol : "";
  coreContainer.appendChild(customSymInput);

  symSelect.addEventListener("change", function() {
    if (symSelect.value === "other") {
      customSymInput.style.display = "block";
    } else {
      customSymInput.style.display = "none";
    }
  });

  // IPA Field
  const ipaLabel = document.createElement("div");
  ipaLabel.innerHTML = "<strong>IPA:</strong>";
  ipaLabel.title = "Select or enter the IPA symbol that represents the sound (e.g., [k]).";
  coreContainer.appendChild(ipaLabel);

  const ipaSelect = document.createElement("select");
  ipaSelect.style.width = "100%";
  
  const ipaPlaceholder = document.createElement("option");
  ipaPlaceholder.value = "";
  ipaPlaceholder.textContent = "Select IPA symbol";
  ipaPlaceholder.disabled = true;
  ipaPlaceholder.selected = data.ipa === "" ? true : false;
  ipaSelect.appendChild(ipaPlaceholder);

  const ipaOptions = [
    // Pulmonic consonants
    "p", "b", "t", "d", "ʈ", "ɖ", "c", "ɟ", "k", "g", "q", "ɢ", "ʡ", "ʔ",
    "m", "ɱ", "n", "ɳ", "ɲ", "ŋ", "ɴ",
    "ʙ", "r", "ʀ", "ɾ", "ɽ",
    "ɸ", "β", "f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ", "ʂ", "ʐ",
    "ç", "ʝ", "x", "ɣ", "χ", "ʁ", "ħ", "ʕ", "h", "ɦ",
    "ɬ", "ɮ", "ʋ", "ɹ", "ɻ", "j", "ɥ", "ɰ",
    
    // Non-pulmonic consonants (implosives and clicks)
    "ɓ", "ɗ", "ʄ", "ɠ", "ʛ",
    "ʘ", "ǀ", "ǃ", "ǂ", "ǁ",
    
    // Vowels
    "i", "y", "ɨ", "ʉ", "ɯ", "u",
    "ɪ", "ʏ", "ʊ",
    "e", "ø", "ɘ", "ɵ", "ɤ", "o",
    "ɛ", "œ", "ɜ", "ɞ", "ʌ", "ɔ",
    "æ", "ɐ",
    "a", "ɶ", "ɑ", "ɒ",
    
    // Diacritics and suprasegmentals
    "ˈ", "ˌ", "ː", "ˑ", "̃", "̥", "̬", "ʰ", "ʷ", "ʲ", "ˠ", "ˤ",
    "̩", "̯", "͡", "‿",
    
    // Tone letters
    "˥", "˦", "˧", "˨", "˩"
  ];
  
  ipaOptions.forEach(optText => {
    const opt = document.createElement("option");
    opt.value = optText;
    opt.textContent = optText;
    if (data.ipa === optText) {
      opt.selected = true;
    }
    ipaSelect.appendChild(opt);
  });

  const ipaOther = document.createElement("option");
  ipaOther.value = "Other";
  ipaOther.textContent = "Other (Enter manually)";
  if (data.ipa && !ipaOptions.includes(data.ipa)) {
    ipaOther.selected = true;
  }
  ipaSelect.appendChild(ipaOther);
  coreContainer.appendChild(ipaSelect);

  ipaSelect.addEventListener("change", function() {
    if (ipaSelect.value === "Other") {
      ipaOverride.style.display = "block";
    } else {
      ipaOverride.style.display = "none";
    }
    SelectedIPA();
  });

  const ipaOverride = document.createElement("input");
  ipaOverride.type = "text";
  ipaOverride.placeholder = "Enter custom IPA symbol";
  ipaOverride.style.width = "100%";
  ipaOverride.style.display = ipaSelect.value === "Other" ? "block" : "none";
  ipaOverride.value = (data.ipa && !ipaOptions.includes(data.ipa)) ? data.ipa : "";
  coreContainer.appendChild(ipaOverride);

  const verifyContainer = document.createElement("div");
  verifyContainer.style.display = "flex";
  verifyContainer.style.alignItems = "center";
  verifyContainer.style.gap = "5px";
  
  const verifyIPACheck = document.createElement("input");
  verifyIPACheck.type = "checkbox";
  verifyIPACheck.setAttribute("id", "verifyIPA");
  verifyIPACheck.setAttribute("name", "ipaAction");
  verifyIPACheck.value = "verify";
  verifyIPACheck.onclick = function() {
    if (this.checked) {
      SelectedIPA();
    }
  };
  
  verifyContainer.appendChild(verifyIPACheck);

  const verifyLabel = document.createElement("label");
  verifyLabel.setAttribute("for", "verifyIPA");
  verifyLabel.textContent = "Verify IPA";
  verifyContainer.appendChild(verifyLabel);

  coreContainer.appendChild(verifyContainer);

  ipaSelect.addEventListener("change", function() {
    if (ipaSelect.value === "Other") {
      ipaOverride.style.display = "block";
    } else {
      ipaOverride.style.display = "none";
    }
  });

  // Romanization Field
  const romanLabel = document.createElement("div");
  romanLabel.innerHTML = "<strong>Romanization:</strong>";
  romanLabel.title = "Enter the romanized (Latin) form for easy reference (e.g., 'ch' for [tʃ]).";
  coreContainer.appendChild(romanLabel);

  const romanInput = document.createElement("input");
  romanInput.type = "text";
  romanInput.placeholder = "Enter romanization";
  romanInput.style.width = "100%";
  romanInput.value = data.romanization;
  coreContainer.appendChild(romanInput);

  // Category Field
  const categoryLabel = document.createElement("div");
  categoryLabel.innerHTML = "<strong>Category:</strong>";
  categoryLabel.title = "Select the broad phonetic category (Consonant, Vowel, Tone, Other).";
  coreContainer.appendChild(categoryLabel);

  const categorySelect = document.createElement("select");
  categorySelect.style.width = "100%";
  // NEW: add title attribute so tests can locate this selector
  categorySelect.setAttribute("title", "Select the broad phonetic category (Consonant, Vowel, Tone, Other).");
  const catPlaceholder = document.createElement("option");
  catPlaceholder.value = "";
  catPlaceholder.textContent = "Select category";
  catPlaceholder.disabled = true;
  catPlaceholder.selected = data.category === "" ? true : false;
  categorySelect.appendChild(catPlaceholder);
  ["Consonant","Vowel","Tone","Other"].forEach(optText => {
    const opt = document.createElement("option");
    opt.value = optText;
    opt.textContent = optText;
    if (data.category === optText) {
      opt.selected = true;
    }
    categorySelect.appendChild(opt);
  });
  coreContainer.appendChild(categorySelect);

  modalRoot.appendChild(coreContainer);

  // --- Show Advanced Toggle ---
  const advancedToggle = document.createElement("button");
  advancedToggle.innerText = "Show Advanced";
  advancedToggle.onclick = () => {
    if (facePhonoWrap.style.display === "none") {
      facePhonoWrap.style.display = "flex";
      advancedToggle.innerText = "Hide Advanced";
    } else {
      facePhonoWrap.style.display = "none";
      advancedToggle.innerText = "Show Advanced";
    }
  };
  modalRoot.appendChild(advancedToggle);

  // Container for face + phonological features (hidden by default)
  const facePhonoWrap = document.createElement("div");
  facePhonoWrap.style.width = "80%";
  facePhonoWrap.style.border = "1px solid #ccc";
  facePhonoWrap.style.borderRadius = "6px";
  facePhonoWrap.style.padding = "10px";
  facePhonoWrap.style.marginBottom = "10px";
  facePhonoWrap.style.display = "none"; 
  facePhonoWrap.style.flexDirection = "column";
  facePhonoWrap.style.alignItems = "center";
  facePhonoWrap.style.justifyContent = "center";
  // Face container
  const facecontainer = document.createElement("div");
  facecontainer.id = "face-container";
  facePhonoWrap.appendChild(facecontainer);

  // Features label
  const featuresLabel = document.createElement("div");
  featuresLabel.innerHTML = "<strong>Phonological Features:</strong>";
  featuresLabel.title = "Select features that describe how this phoneme is articulated.";
  featuresLabel.style.alignSelf = "flex-start";
  facePhonoWrap.appendChild(featuresLabel);

  // Features container
  const featuresContainer = document.createElement("div");
  featuresContainer.style.border = "1px solid #ccc";
  featuresContainer.style.padding = "30px";
  featuresContainer.style.width = "80%";
  featuresContainer.style.display = "flex";
  featuresContainer.style.flexWrap = "wrap";
  featuresContainer.style.gap = "10px";
  facePhonoWrap.appendChild(featuresContainer);

  modalRoot.appendChild(facePhonoWrap);

  // Build out the feature checkboxes
  const featureOptions = [
    { value: "Voiced",    label: "Voiced",    title: "Vocal cords vibrate" },
    { value: "Voiceless", label: "Voiceless", title: "No vocal cord vibration" },
    { value: "Nasal",     label: "Nasal",     title: "Air flows through the nose" },
    { value: "Stop",      label: "Stop",      title: "Complete closure" },
    { value: "Fricative", label: "Fricative", title: "Turbulent airflow" },
    { value: "Affricate", label: "Affricate", title: "Stop then fricative" },
    { value: "High",      label: "High",      title: "High vowel" },
    { value: "Mid",       label: "Mid",       title: "Mid vowel" },
    { value: "Low",       label: "Low",       title: "Low vowel" },
    { value: "Front",     label: "Front",     title: "Front vowel" },
    { value: "Central",   label: "Central",   title: "Central vowel" },
    { value: "Back",      label: "Back",      title: "Back vowel" },
    { value: "Rounded",   label: "Rounded",   title: "Rounded lips" },
    { value: "Unrounded", label: "Unrounded", title: "Not rounded" },
    { value: "Aspirated", label: "Aspirated", title: "Aspirated sound" },
    { value: "Lateral",   label: "Lateral",   title: "Lateral articulation" },
    { value: "Approximant", label: "Approximant", title: "Approximant quality" },
    { value: "Flap",      label: "Flap",      title: "Flap sound" },
    { value: "Trill",     label: "Trill",     title: "Trilled sound" },
    { value: "Glottal",   label: "Glottal",   title: "Glottal sound" },
    { value: "Tense",     label: "Tense",     title: "Tense articulation" }
  ];

  const opposites = {
    "Voiced": "Voiceless",
    "Voiceless": "Voiced",
    "High": "Low",
    "Low": "High",
    "Front": "Back",
    "Back": "Front",
    "Rounded": "Unrounded",
    "Unrounded": "Rounded"
  };

  featureOptions.forEach(opt => {
    const checkboxLabel = document.createElement("label");
    checkboxLabel.style.flex = "0 0 45%";
    checkboxLabel.title = opt.title;

    // Use "FcE_" prefix so the face code can find them
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = opt.value;
    checkbox.tooltip = opt.title;
    checkbox.id = "FcE_" + opt.value.toLowerCase();
    if (data.features && data.features.includes(opt.value)) {
      checkbox.checked = true;
    }
    if (opposites[opt.value]) {
      checkbox.setAttribute(
        "onclick",
        "if(this.checked){ var opp = document.getElementById('FcE_" + opposites[opt.value].toLowerCase() + "'); if(opp){ opp.checked = false; } }"
      );
    }
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(document.createTextNode(" " + opt.label));
    featuresContainer.appendChild(checkboxLabel);
  });

  requestAnimationFrame(() => {
    sanityCheckFeatures();
  });

  // Description/Usage Field
  const descLabel = document.createElement("div");
  descLabel.innerHTML = "<strong>Description/Usage:</strong>";
  descLabel.title = "Provide notes on how this phoneme is used (e.g., word positions, dialect-specific).";
  descLabel.style.alignSelf = "flex-start";
  modalRoot.appendChild(descLabel);

  const descInput = document.createElement("textarea");
  descInput.placeholder = "Enter description/usage";
  descInput.style.width = "80%";
  descInput.style.height = "60px";
  descInput.value = data.description;
  modalRoot.appendChild(descInput);

  const descError = document.createElement("div");
  descError.style.color = "red";
  descError.style.fontSize = "0.8em";
  descError.style.display = "none";
  modalRoot.appendChild(descError);

  descInput.addEventListener("input", function () {
    if (descInput.value.trim() === "") {
      descError.textContent = "Description is required.";
      descError.style.display = "block";
    } else {
      descError.textContent = "";
      descError.style.display = "none";
    }
  });
  // Independent Buttons Container
  const btnDiv = document.createElement("div");
  btnDiv.style.display = "flex";
  btnDiv.style.padding = "0";
  btnDiv.style.margin = "0";
  btnDiv.style.width = "100%";
  btnDiv.style.justifyContent = "flex-end";
  btnDiv.style.gap = "10px";
  btnDiv.style.padding = "20px";
  btnDiv.style.boxSizing = "border-box";
  btnDiv.style.borderTop = "1px solid var(--button-border)";
  btnDiv.style.marginTop = "10px";

  const clearBtn = createButton({
    text: "Clear",
    title: "Clear all fields",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      // Reset dropdowns and inputs to default values
      symSelect.selectedIndex = 0;
      customSymInput.value = "";
      customSymInput.style.display = symSelect.value === "other" ? "block" : "none";
      ipaSelect.selectedIndex = 0;
      ipaOverride.value = "";
      romanInput.value = "";
      descInput.value = "";
            
      descError.textContent = "";
      descError.style.display = "none";
      // Uncheck all feature checkboxes
      featuresContainer.querySelectorAll("input[type='checkbox']").forEach(cb => {
        cb.checked = false;
      });
    }
  });
  btnDiv.appendChild(clearBtn);

  const okBtn = createButton({
    text: isEdit ? "Save Changes" : "Add Phoneme",
    title: isEdit ? "Save changes to this phoneme" : "Add new phoneme",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      const symbol = (symSelect.value === "other") ? customSymInput.value.trim() : symSelect.value;
      let ipa = ipaSelect.value;
      if (ipa === "Other") {
        ipa = ipaOverride.value.trim();
      }
      const description = descInput.value.trim();
      const category = categorySelect.value;
      const features = [];
      featuresContainer.querySelectorAll("input[type='checkbox']").forEach(cb => {
        if (cb.checked) features.push(cb.value);
      });
      const romanization = romanInput.value.trim();
   
      if (!ipa) {
        showModal("Error", "IPA is required.");
        return;
      }
      if (!description) {
        showModal("Error", "Description is required.");
        return;
      }
      if (!category) {
        showModal("Error", "Category is required.");
        return;
      }
      modal.close();
      callback({ symbol, ipa, description, category, features, romanization });
    }
  });
  btnDiv.appendChild(okBtn);

  const cancelBtn = createButton({
    text: "Discard changes",
    title: "Discard changes",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      modal.close();
    }
  });
  btnDiv.appendChild(cancelBtn);

  modalRoot.appendChild(btnDiv);

  const modal = createModal(
    isEdit ? "Edit Phoneme" : "Add New Phoneme",
    modalRoot,
    "35%",
    "800px"
  );




  // Delay adding face event listeners until after modal content is rendered
  requestAnimationFrame(() => {});

  // ---- Functions for feature-check and face drawing ----

  function sanityCheckFeatures() {
    const features = [
      "voiced", "voiceless", "nasal", "stop", "fricative", "affricate",
      "high", "mid", "low", "front", "central", "back", "rounded",
      "unrounded", "aspirated", "lateral", "approximant", "flap",
      "trill", "glottal", "tense"
    ];
    let allExist = true;
    features.forEach(feature => {
      const element = document.getElementById(`FcE_${feature}`);
      if (!element) {
        allExist = false;
      }
    });
    if (allExist) {
      FCe_loadFace();
    }
  }

  function FCe_loadFace() {
    // Helper: Get current options from checkboxes
    function getOptionsFromCheckboxes() {
      return {
        voiced: document.getElementById("FcE_voiced").checked,
        voiceless: document.getElementById("FcE_voiceless").checked,
        nasal: document.getElementById("FcE_nasal").checked,
        stop: document.getElementById("FcE_stop").checked,
        fricative: document.getElementById("FcE_fricative").checked,
        affricate: document.getElementById("FcE_affricate").checked,
        high: document.getElementById("FcE_high").checked,
        mid: document.getElementById("FcE_mid").checked,
        low: document.getElementById("FcE_low").checked,
        front: document.getElementById("FcE_front").checked,
        central: document.getElementById("FcE_central").checked,
        back: document.getElementById("FcE_back").checked,
        rounded: document.getElementById("FcE_rounded").checked,
        unrounded: document.getElementById("FcE_unrounded").checked,
        aspirated: document.getElementById("FcE_aspirated").checked,
        lateral: document.getElementById("FcE_lateral").checked,
        approximant: document.getElementById("FcE_approximant").checked,
        flap: document.getElementById("FcE_flap").checked,
        trill: document.getElementById("FcE_trill").checked,
        glottal: document.getElementById("FcE_glottal").checked,
        tense: document.getElementById("FcE_tense").checked
      };
    }

    // Initialize the face drawing using the FaceDrawer class from FaceAPI
    let faceDrawer = new FaceAPI.FaceDrawer("face-container", getOptionsFromCheckboxes());

    // Add event listeners to update the face when checkboxes change.
    const checkboxIds = [
      "FcE_voiced", "FcE_voiceless", "FcE_nasal", "FcE_stop", "FcE_fricative",
      "FcE_affricate", "FcE_high", "FcE_mid", "FcE_low", "FcE_front",
      "FcE_central", "FcE_back", "FcE_rounded", "FcE_unrounded",
      "FcE_aspirated", "FcE_lateral", "FcE_approximant", "FcE_flap",
      "FcE_trill", "FcE_glottal", "FcE_tense"
    ];

    checkboxIds.forEach(id => {
      document.getElementById(id).addEventListener("change", () => {
        // Enforce exclusivity rules:
        // Voiced vs Voiceless
        if (id === "FcE_voiced" && document.getElementById("FcE_voiced").checked) {
          document.getElementById("FcE_voiceless").checked = false;
        }
        if (id === "FcE_voiceless" && document.getElementById("FcE_voiceless").checked) {
          document.getElementById("FcE_voiced").checked = false;
        }
        // High/Mid/Low exclusivity
        if (["FcE_high", "FcE_mid", "FcE_low"].includes(id) && document.getElementById(id).checked) {
          ["FcE_high", "FcE_mid", "FcE_low"].forEach(otherId => {
            if(otherId !== id) document.getElementById(otherId).checked = false;
          });
        }
        // Front/Central/Back exclusivity
        if (["FcE_front", "FcE_central", "FcE_back"].includes(id) && document.getElementById(id).checked) {
          ["FcE_front", "FcE_central", "FcE_back"].forEach(otherId => {
            if(otherId !== id) document.getElementById(otherId).checked = false;
          });
        }
        // Rounded vs Unrounded exclusivity
        if (id === "FcE_rounded" && document.getElementById("FcE_rounded").checked) {
          document.getElementById("FcE_unrounded").checked = false;
        }
        if (id === "FcE_unrounded" && document.getElementById("FcE_unrounded").checked) {
          document.getElementById("FcE_rounded").checked = false;
        }
        // Update the face drawing
        faceDrawer.update(getOptionsFromCheckboxes());
        // Run SelectedIPA() whenever a checkbox is modified
        SelectedIPA();
      });
    });
  }

  function SelectedIPA() {
    if (document.getElementById("verifyIPA").checked) {
      const selectedIPA = (ipaSelect.value === "Other")
        ? ipaOverride.value.trim()
        : ipaSelect.value;

      if (ipaSelect.value === "") {
        return;
      }
      if (ipaSelect.value !== "Other") {
        const currentIPA = ipaSelect.value;
        const matchingSymbols = setIPAproperties();
        if (matchingSymbols === null) {
          return;
        }
        if (!matchingSymbols.includes(currentIPA)) {
          let suggestions;
          if (matchingSymbols.length > 10) {
            suggestions = matchingSymbols.slice(0, 10).join(", ") + "  and more...";
          } else {
            suggestions = matchingSymbols.length > 0 ? matchingSymbols.join(", ") : "None found.";
          }
          const message = `There is an IPA mismatch for selected IPA: ${currentIPA}.
    Suggested IPA: ${suggestions}.`;
          showModal("IPA Mismatch", message);
        } else {
          return;
        }
      }
    }
  }

  function setIPAproperties() {
    // Full feature set for each IPA symbol.
    // For diacritics, suprasegmentals, and tone letters, all features are set to false.
    const ipaFeatures = {
      // Pulmonic consonants
      "p": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "b": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "t": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trott:false,glottal:false,tense:false},
      "d": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʈ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɖ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "c": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɟ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "k": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "g": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "q": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɢ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʡ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʔ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:true,tense:false},

      // Nasals
      "m": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɱ": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "n": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɳ": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɲ": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ŋ": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɴ": {voiced:true,voiceless:false,nasal:true,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      // Trills
      "ʙ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:true,glottal:false,tense:false},
      "r": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:true,glottal:false,tense:false},
      "ʀ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:true,glottal:false,tense:false},

      // Taps/Flaps
      "ɾ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:true,trill:false,glottal:false,tense:false},
      "ɽ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:true,trill:false,glottal:false,tense:false},

      // Fricatives
      "ɸ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "β": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "f": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "v": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "θ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ð": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "s": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "z": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʃ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʒ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʂ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʐ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ç": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʝ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "x": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɣ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "χ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʁ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ħ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʕ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "h": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:true,tense:false},
      "ɦ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:true,tense:false},

      // Lateral fricatives
      "ɬ": {voiced:false,voiceless:true,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:true,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɮ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:true,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:true,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      // Approximants
      "ʋ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},
      "ɹ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},
      "ɻ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},
      "j": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:true,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},
      "ɥ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},
      "ɰ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:true,flap:false,trill:false,glottal:false,tense:false},

      // Non-pulmonic consonants (implosives)
      "ɓ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɗ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʄ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɠ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʛ": {voiced:true,voiceless:false,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      // Clicks
      "ʘ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ǀ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ǃ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ǂ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:true,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ǁ": {voiced:false,voiceless:true,nasal:false,stop:true,fricative:false,affricate:false,high:false,mid:false,low:false,front:false,central:false,back:false,rounded:false,unrounded:false,aspirated:false,lateral:true,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      // Vowels
      "i": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "y": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɨ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:false,central:true,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʉ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:false,central:true,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɯ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:false,central:false,back:true,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "u": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      "ɪ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʏ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʊ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:true,mid:false,low:false,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      "e": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ø": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɘ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:true,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɵ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:true,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɤ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:false,back:true,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "o": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      "ɛ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "œ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɜ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:true,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɞ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:true,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ʌ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:false,back:true,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɔ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:true,low:false,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      "æ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɐ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:false,central:true,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},

      "a": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:true,central:false,back:false,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɶ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:true,central:false,back:false,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɑ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:false,central:false,back:true,rounded:false,unrounded:true,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
      "ɒ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false}
    };

    const features = {
      voiced: document.getElementById("FcE_voiced").checked,
      voiceless: document.getElementById("FcE_voiceless").checked,
      nasal: document.getElementById("FcE_nasal").checked,
      stop: document.getElementById("FcE_stop").checked,
      fricative: document.getElementById("FcE_fricative").checked,
      affricate: document.getElementById("FcE_affricate").checked,
      high: document.getElementById("FcE_high").checked,
      mid: document.getElementById("FcE_mid").checked,
      low: document.getElementById("FcE_low").checked,
      front: document.getElementById("FcE_front").checked,
      central: document.getElementById("FcE_central").checked,
      back: document.getElementById("FcE_back").checked,
      rounded: document.getElementById("FcE_rounded").checked,
      unrounded: document.getElementById("FcE_unrounded").checked,
      aspirated: document.getElementById("FcE_aspirated").checked,
      lateral: document.getElementById("FcE_lateral").checked,
      approximant: document.getElementById("FcE_approximant").checked,
      flap: document.getElementById("FcE_flap").checked,
      trill: document.getElementById("FcE_trill").checked,
      glottal: document.getElementById("FcE_glottal").checked,
      tense: document.getElementById("FcE_tense").checked
    };

    // If no feature is selected, update checkboxes using the selected IPA character if available,
    // otherwise break out by returning null.
    if (!Object.values(features).includes(true)) {
      try {
        if (ipaSelect.value && ipaFeatures[ipaSelect.value]) {
          const selectedFeatures = ipaFeatures[ipaSelect.value];
          for (const feature in selectedFeatures) {
            const checkbox = document.getElementById("FcE_" + feature);
            if (checkbox) {
              checkbox.checked = selectedFeatures[feature];
              // flash the checkbox to indicate the feature is selected
              checkbox.style.transition = "background-color 2s ease-out";
              checkbox.style.backgroundColor = "white";
              setTimeout(() => {
                checkbox.style.backgroundColor = "";
              }, 1000);
            }
          }
        } else {
          return null;
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    }

    const totalFeatures = Object.keys(features).length;
    let exactMatches = [];
    let bestMatches = [];
    let bestScore = -1;

    for (let symbol in ipaFeatures) {
      let score = 0;
      for (let prop in features) {
        if (ipaFeatures[symbol][prop] === features[prop]) {
          score++;
        }
      }
      if (score === totalFeatures) {
        exactMatches.push(symbol);
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatches = [symbol];
      } else if (score === bestScore) {
        bestMatches.push(symbol);
      }
    }

    // Return exact matches if found; otherwise, return the best matches.
    if (exactMatches.length > 0) {
      console.log("Exact Matching IPA symbols:", exactMatches);
      return exactMatches;
    } else {
      console.log("Best Matching IPA symbols:", bestMatches);
      return bestMatches;
    }
  }
}

function createPhonemeRow(item) {
  const tr = document.createElement("tr");
  tr.style.borderBottom = "1px solid #ccc";
  tr.style.cursor = "pointer";
  tr.onclick = function () {
    tr.style.backgroundColor = "#eef";
  };

  const tdSymbol = document.createElement("td");
  tdSymbol.textContent = item.symbol;
  tdSymbol.style.padding = "5px";

  const tdIPA = document.createElement("td");
  tdIPA.textContent = item.ipa;
  tdIPA.style.padding = "5px";

  const tdDesc = document.createElement("td");
  tdDesc.textContent = item.description;
  tdDesc.style.padding = "5px";

  const tdCategory = document.createElement("td");
  tdCategory.textContent = item.category;
  tdCategory.style.padding = "5px";

  const tdFeatures = document.createElement("td");
  tdFeatures.textContent = Array.isArray(item.features) ? item.features.join(", ") : item.features;
  tdFeatures.style.padding = "5px";

  const tdRoman = document.createElement("td");
  tdRoman.textContent = item.romanization;
  tdRoman.style.padding = "5px";

  const tdSpace = document.createElement("td");
  
  tdSpace.style.padding = "5px";

  const tdActions = document.createElement("td");
  tdActions.style.padding = "5px";
  tdActions.style.textAlign = "right";
  tdActions.style.display = "flex";
  tdActions.style.alignItems = "center";
  tdActions.style.justifyContent = "flex-end";
  tdActions.style.gap = "5px";

  const editBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:pencil-outline'></span>",
    title: "Edit this phoneme",
    styles: {
      marginRight: "5px",
      border: "none",
      backgroundColor: "#ffc107",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function (e) {
      e.stopPropagation();
      promptForPhoneme(function (newData) {
        Object.assign(item, newData);
        const newRow = createPhonemeRow(item);
        tr.parentNode.replaceChild(newRow, tr);
        updatePhonologyMain();
      }, { isEdit: true, data: item });
    }
  });

  const deleteBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:trash-can-outline'></span>",
    title: "Delete this phoneme",
    styles: {
      border: "none",
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function (e) {
      e.stopPropagation();
      showModal("Confirm Delete", `Delete phoneme "${item.symbol}"?`, function () {
        const idx = projectData.phonology.inventory.indexOf(item);
        if (idx !== -1) projectData.phonology.inventory.splice(idx, 1);
        tr.remove();
        updatePhonologyMain();
      });
    }
  });

  tdActions.appendChild(editBtn);
  tdActions.appendChild(deleteBtn);

  tr.appendChild(tdSymbol);
  tr.appendChild(tdIPA);
  tr.appendChild(tdDesc);
  tr.appendChild(tdCategory);
  tr.appendChild(tdFeatures);
  tr.appendChild(tdRoman);
  tr.appendChild(tdSpace);
  tr.appendChild(tdActions);

  return tr;
}

function addPhoneme() {
  ensurePhonologyInitialized();
  promptForPhoneme(function (data) {
    projectData.phonology.inventory.push(data);
    const tr = createPhonemeRow(data);
    document.getElementById("inventoryList").appendChild(tr);
    updatePhonologyMain();
  });
}

// ----- SYLLABLE PATTERN FUNCTIONS -----
function promptForSyllablePattern(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  // Modal Title & Description
  const title = document.createElement("h2");
  title.textContent = "Add Syllable Pattern";
  modalContent.appendChild(title);

  const heading = document.createElement("div");
  heading.innerHTML = "<strong>Select Pattern:</strong> Choose a common syllable pattern or define a custom one.";
  heading.title = "A syllable pattern describes which parts (consonants and vowels) are allowed and in what order. For example, 'CV' means one consonant followed by one vowel.";
  modalContent.appendChild(heading);

  // Radio Group for Common Patterns
  const patterns = ["CV", "CVC", "CCV", "V", "Custom"];
  const radioDiv = document.createElement("div");
  radioDiv.style.display = "flex";
  radioDiv.style.flexWrap = "wrap";
  radioDiv.style.gap = "10px";
  patterns.forEach(pat => {
    const radioLabel = document.createElement("label");
    radioLabel.title = (pat === "CV") ? "Consonant + Vowel"
                       : (pat === "CVC") ? "Consonant + Vowel + Consonant"
                       : (pat === "CCV") ? "Consonant Cluster + Vowel"
                       : (pat === "V")   ? "Vowel only"
                       : (pat === "Custom") ? "Define a custom syllable pattern"
                       : "";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "syllablePattern";
    radio.value = pat;
    if (pat === "CV") radio.checked = true;
    radioLabel.appendChild(radio);
    radioLabel.appendChild(document.createTextNode(" " + pat));
    radioDiv.appendChild(radioLabel);
  });
  modalContent.appendChild(radioDiv);

  // Container for Custom Options (visible only if "Custom" is selected)
  const customContainer = document.createElement("div");
  customContainer.style.display = "none";
  customContainer.style.width = "80%";
  customContainer.style.border = "1px solid #ccc";
  customContainer.style.padding = "10px";
  customContainer.style.flexDirection = "column";
  customContainer.style.gap = "8px";

  // Checkboxes for Onset, Nucleus, Coda
  const onsetLabel = document.createElement("label");
  onsetLabel.title = "The onset is the consonant(s) at the beginning of the syllable.";
  const onsetChk = document.createElement("input");
  onsetChk.type = "checkbox";
  onsetChk.checked = true;
  onsetLabel.appendChild(onsetChk);
  onsetLabel.appendChild(document.createTextNode(" Include Onset"));
  customContainer.appendChild(onsetLabel);

  const nucleusLabel = document.createElement("label");
  nucleusLabel.title = "The nucleus is the core (usually a vowel) of the syllable.";
  const nucleusChk = document.createElement("input");
  nucleusChk.type = "checkbox";
  nucleusChk.checked = true;
  nucleusLabel.appendChild(nucleusChk);
  nucleusLabel.appendChild(document.createTextNode(" Include Nucleus"));
  customContainer.appendChild(nucleusLabel);

  const codaLabel = document.createElement("label");
  codaLabel.title = "The coda is the consonant(s) at the end of the syllable.";
  const codaChk = document.createElement("input");
  codaChk.type = "checkbox";
  codaChk.checked = false;
  codaLabel.appendChild(codaChk);
  codaLabel.appendChild(document.createTextNode(" Include Coda"));
  customContainer.appendChild(codaLabel);

  // Custom Pattern Field
  const customPatternLabel = document.createElement("div");
  customPatternLabel.innerHTML = "<strong>Custom Pattern:</strong>";
  customPatternLabel.title = "Specify your own combination using 'C' for consonant and 'V' for vowel (e.g., CCVC, CVN).";
  customContainer.appendChild(customPatternLabel);

  const customPatternInput = document.createElement("input");
  customPatternInput.type = "text";
  customPatternInput.placeholder = "e.g., CCVC";
  customPatternInput.style.width = "100%";
  customContainer.appendChild(customPatternInput);

  // Optional Description/Usage for this pattern
  const patternDescLabel = document.createElement("div");
  patternDescLabel.innerHTML = "<strong>Description/Usage:</strong>";
  patternDescLabel.title = "Explain any special rules for this syllable pattern.";
  customContainer.appendChild(patternDescLabel);

  const patternDescInput = document.createElement("textarea");
  patternDescInput.placeholder = "Enter description/usage for this syllable pattern";
  patternDescInput.style.width = "100%";
  patternDescInput.style.height = "60px";
  customContainer.appendChild(patternDescInput);

  modalContent.appendChild(customContainer);

  // Show customContainer if "Custom" is selected
  radioDiv.addEventListener("change", function() {
    const selected = modalContent.querySelector('input[name="syllablePattern"]:checked').value;
    customContainer.style.display = selected === "Custom" ? "flex" : "none";
  });

  // Buttons Container at Bottom Right
  const btnDiv = document.createElement("div");
  btnDiv.style.width = "80%";
  btnDiv.style.display = "flex";
  btnDiv.style.justifyContent = "flex-end";
  btnDiv.style.gap = "10px";
  btnDiv.style.marginTop = "10px";

  const okBtn = createButton({
    text: "OK",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function() {
      let selectedPattern = modalContent.querySelector('input[name="syllablePattern"]:checked').value;
      if (selectedPattern === "Custom") {
        const customPattern = customPatternInput.value.trim();
        if (customPattern !== "") {
          selectedPattern = customPattern;
        } else {
          let parts = [];
          if (onsetChk.checked)   parts.push("Onset");
          if (nucleusChk.checked) parts.push("Nucleus");
          if (codaChk.checked)    parts.push("Coda");
          if (parts.length === 0) {
            showModal("Error", "Select at least one component or provide a custom pattern.");
            return;
          }
          selectedPattern = "Custom: " + parts.join(" ");
        }
      }
      const usageNotes = patternDescInput.value.trim();
      modal.close();
      callback({ pattern: selectedPattern, usage: usageNotes });
    }
  });
  btnDiv.appendChild(okBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function() { modal.close(); }
  });
  btnDiv.appendChild(cancelBtn);
  modalContent.appendChild(btnDiv);

  const modal = createModal("Add Syllable Pattern", modalContent, "35%", "50%");
}

function createSyllablePatternRow(item) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.padding = "5px 0";

  const leftDiv = document.createElement("div");
  leftDiv.textContent = "Pattern: " + item.pattern;
  li.appendChild(leftDiv);

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";

  const editBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:pencil-outline'></span>",
    title: "Edit pattern",
    styles: {
      border: "none",
      backgroundColor: "#ffc107",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      promptForSyllablePattern(function (newData) {
        item.pattern = newData.pattern;
        leftDiv.textContent = "Pattern: " + item.pattern;
        updatePhonologyMain();
      });
    }
  });
  btnContainer.appendChild(editBtn);

  const deleteBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:trash-can-outline'></span>",
    title: "Delete pattern",
    styles: {
      border: "none",
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      showModal("Confirm Delete", `Delete pattern "${item.pattern}"?`, function () {
        const idx = projectData.phonology.syllables.indexOf(item);
        if (idx !== -1) projectData.phonology.syllables.splice(idx, 1);
        li.remove();
        updatePhonologyMain();
      });
    }
  });
  btnContainer.appendChild(deleteBtn);

  li.appendChild(btnContainer);
  return li;
}

function addSyllablePattern() {
  ensurePhonologyInitialized();
  promptForSyllablePattern(function (data) {
    projectData.phonology.syllables.push(data);
    const li = createSyllablePatternRow(data);
    document.getElementById("syllableList").appendChild(li);
    updatePhonologyMain();
  });
}

// ----- PHONOTACTIC RULE FUNCTIONS -----
// This section includes functions for creating, editing, and deleting phonotactic rules.

// 1. Rule Type Selector – creates a fieldset UI for selecting a rule type.
// Global function to update highlights on all rule items.
function updateHighlight() {
  const isLightTheme = document.documentElement.classList.contains("light-theme");
  const selectedColor = isLightTheme ? "blue" : "yellow";
  document.querySelectorAll("input[name='ruleType']").forEach(function(radio) {
    const assocLabel = document.querySelector("label[for='" + radio.id + "']");
    assocLabel.style.borderColor = radio.checked ? selectedColor : "var(--button-border)";
    const iconElem = assocLabel.querySelector(".rule-icon");
    if (iconElem) {
      iconElem.style.color = radio.checked ? selectedColor : "var(--button-border)";
    }
  });
}

function createRuleTypeSelector() {
  // Create a container with a 2-column grid layout and scrollability.
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr";
  container.style.gap = "10px";
  container.style.height = "300px"; // adjust as needed.
  container.style.overflowY = "auto";

  const ruleTypes = [
    { name: "Phoneme Frequencies", description: "Adjusts the distribution and occurrence rates of phonemes." },
    { name: "Illegal Combinations", description: "Specifies forbidden sequences of phonemes." },
    { name: "Vowel Probabilities", description: "Determines how likely each vowel is to appear." },
    { name: "Vowel Tones", description: "Assigns tonal variations to vowels in different contexts." },
    { name: "Stress Pattern", description: "Sets rules for where stress falls in words." },
    { name: "Consonant Cluster Constraints", description: "Restricts certain combinations of consonants." },
    { name: "Vowel/Consonant Harmony", description: "Ensures vowels and consonants harmonize within words." },
    { name: "Syllable Boundary / Sonority Hierarchy", description: "Controls acceptable syllable structures based on sonority." },
    { name: "Allophonic Rules", description: "Defines context-dependent pronunciation variations." },
    { name: "Tone Sandhi", description: "Adjusts tonal changes that occur in connected speech." }
  ];

  // Mapping rule names to Iconify icon names.
  const iconMapping = {
    "Phoneme Frequencies": "mdi:chart-line",
    "Illegal Combinations": "mdi:alert-circle-outline",
    "Vowel Probabilities": "mdi:percent",
    "Vowel Tones": "mdi:music-note",
    "Stress Pattern": "mdi:format-letter-case",
    "Consonant Cluster Constraints": "mdi:format-list-bulleted",
    "Vowel/Consonant Harmony": "mdi:yin-yang",
    "Syllable Boundary / Sonority Hierarchy": "mdi:vector-arrange-above",
    "Allophonic Rules": "mdi:voice",
    "Tone Sandhi": "mdi:swap-horizontal-bold"
  };

  const isLightTheme = document.documentElement.classList.contains("light-theme");
  const selectedColor = isLightTheme ? "blue" : "yellow";

  ruleTypes.forEach(function(rule, index) {
    // Create a wrapper for each rule item.
    const ruleItem = document.createElement("div");
    ruleItem.style.position = "relative";
    ruleItem.style.margin = "2px";

    // Create the radio input.
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "ruleType";
    radio.value = rule.name;
    const radioId = "ruleType_" + index;
    radio.id = radioId;
    // Visually hide the radio while keeping it accessible.
    radio.style.position = "absolute";
    radio.style.width = "1px";
    radio.style.height = "1px";
    radio.style.margin = "-1px";
    radio.style.border = "0";
    radio.style.padding = "0";
    radio.style.clip = "rect(0, 0, 0, 0)";
    radio.style.overflow = "hidden";

    // Inline onchange to trigger the highlight update when selected.
    radio.setAttribute("onchange", "updateHighlight()");

    // Create a label that fills the rule item.
    const label = document.createElement("label");
    label.htmlFor = radioId;
    label.style.display = "flex";
    label.style.flexDirection = "column";
    label.style.padding = "5px";
    label.style.gap = "2px";
    // Use CSS variables so that the label adapts to the chosen theme.
    label.style.border = "3px solid var(--button-border)";
    label.style.borderRadius = "5px";
    label.style.backgroundColor = "var(--button-bg)";
    label.style.color = "inherit"; // Inherit font color from theme.
    label.style.cursor = "pointer";

    // Inline mouseover/out to add a yellow/blue shadow on hover.
    label.setAttribute("onmouseover", "this.style.boxShadow='0 0 10px blue, 0 0 10px yellow'");
    label.setAttribute("onmouseout", "this.style.boxShadow='none'");

    // Create an icon element using Iconify.
    const icon = document.createElement("span");
    icon.className = "iconify rule-icon";
    icon.setAttribute("data-icon", iconMapping[rule.name] || "mdi:bookmark");
    icon.setAttribute("data-inline", "false");
    // Initial icon color: selectedColor for the first item, else theme variable.
    icon.style.color = (index === 0) ? selectedColor : "var(--button-border)";
    // Adjust icon size and spacing.
    icon.style.fontSize = "24px";
    icon.style.marginBottom = "5px";

    // Set default visual selection for the first item.
    if (index === 0) {
      radio.checked = true;
      label.style.borderColor = selectedColor;
    }

    // Text content for title and description.
    const title = document.createElement("div");
    title.textContent = rule.name;
    title.style.fontWeight = "bold";

    const description = document.createElement("p");
    description.textContent = rule.description;
    description.style.fontSize = "0.8em";
    description.style.margin = "0";

    // Append the icon, title, and description to the label.
    label.appendChild(icon);
    label.appendChild(title);
    label.appendChild(description);
    ruleItem.appendChild(radio);
    ruleItem.appendChild(label);
    container.appendChild(ruleItem);
  });

  return container;
}


// 2. Mapping rule types to their dedicated definition functions (showing two inputs).
const ruleDefinitionFunctions = {
  "Phoneme Frequencies": promptForPhonemeFrequencies,
  "Illegal Combinations": promptForIllegalCombinations,
  "Vowel Probabilities": promptForVowelProbabilities,
  "Vowel Tones": promptForVowelTones,
  "Stress Pattern": promptForStressPattern,
  "Consonant Cluster Constraints": promptForConsonantClusterConstraints,
  "Vowel/Consonant Harmony": promptForVowelConsonantHarmony,
  "Syllable Boundary / Sonority Hierarchy": promptForSyllableBoundary,
  "Allophonic Rules": promptForAllophonicRules,
  "Tone Sandhi": promptForToneSandhi
};

// 3. Dedicated definition functions for each rule type,
// now replaced with simple placeholders: "Rule" and "Additional details".

function promptForPhonemeFrequencies(callback) {
  let phonemesArray = [];

  // Create main container
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  // Title
  const title = document.createElement("h2");
  title.textContent = "Define: Phoneme Frequencies";
  modalContent.appendChild(title);

  // ========== Phoneme Selection ==========
  const phonemeFieldset = document.createElement("fieldset");
  phonemeFieldset.style.width = "80%";
  phonemeFieldset.style.display = "flex";
  phonemeFieldset.style.flexDirection = "column";
  phonemeFieldset.style.gap = "10px";

  // Added iconify icon to legend
  const phonemeLegend = document.createElement("legend");
  phonemeLegend.innerHTML = '<span class="iconify" data-icon="mdi:microphone"></span> Phoneme Selection';
  phonemeFieldset.appendChild(phonemeLegend);

  // Row for select + Add + Clear
  const phonemeRow = document.createElement("div");
  phonemeRow.style.display = "flex";
  phonemeRow.style.alignItems = "center";
  phonemeRow.style.gap = "8px";

  // Phoneme select
  const phonemeSelect = document.createElement("select");
  phonemeSelect.id = "phonemeSelect";
  phonemeSelect.style.width = "120px"; // narrower width

  // Attempt to parse session data
  let phonemeOptions = [];
  try {
    const sessionData = sessionStorage.getItem("phonologyProjectData");
    if (sessionData) {
      const projectPhonology = JSON.parse(sessionData);
      if (projectPhonology && projectPhonology.inventory) {
        phonemeOptions = projectPhonology.inventory.map(item => item.symbol);
      }
    }
  } catch (e) {
    console.error("Error parsing session data", e);
  }

  // If none found, lock the input and set to "define phoneme"
  if (!phonemeOptions.length) {
    const defineOpt = document.createElement("option");
    defineOpt.value = "definePhoneme";
    defineOpt.textContent = "Define phoneme";
    phonemeSelect.appendChild(defineOpt);
    phonemeSelect.value = "definePhoneme";
    phonemeSelect.disabled = true;
  } else {
    // Populate select without adding a custom option
    phonemeOptions.forEach(value => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      phonemeSelect.appendChild(opt);
    });
  }

  // Remove custom phoneme input listener as custom option is no longer available.
  // (Also the custom phoneme label/input remain in the DOM if needed for other purposes.)
  
  // Add Phoneme button (with icon)
  const addPhonemeBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:plus"></span> Add',
    onClick: function() {
      // If locked, do nothing
      if (phonemeSelect.disabled) return;

      let phoneme = phonemeSelect.value;
      // Since no custom option, no need to check for custom
      if (!phonemesArray.includes(phoneme)) {
        phonemesArray.push(phoneme);
        updatePhonemeList();
      }
    }
  });
  addPhonemeBtn.style.padding = "4px 8px";
  addPhonemeBtn.style.fontSize = "0.9em";
  addPhonemeBtn.style.width = "auto";

  // Clear button (red, with icon)
  const clearPhonemeBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:delete-forever"></span> Clear',
    onClick: function() {
      phonemesArray = [];
      updatePhonemeList();
    }
  });
  clearPhonemeBtn.style.padding = "4px 8px";
  clearPhonemeBtn.style.fontSize = "0.9em";
  clearPhonemeBtn.style.width = "auto";
  clearPhonemeBtn.style.backgroundColor = "red";
  clearPhonemeBtn.style.color = "#fff";

  phonemeRow.appendChild(phonemeSelect);
  phonemeRow.appendChild(addPhonemeBtn);
  phonemeRow.appendChild(clearPhonemeBtn);
  phonemeFieldset.appendChild(phonemeRow);

  // Custom phoneme input (hidden by default; retained in case it’s needed elsewhere)
  const customPhonemeLabel = document.createElement("label");
  customPhonemeLabel.style.display = "none";
  customPhonemeLabel.textContent = " Custom Phoneme: ";
  const customPhonemeInput = document.createElement("input");
  customPhonemeInput.type = "text";
  customPhonemeInput.id = "customPhonemeInput";
  customPhonemeInput.placeholder = "Enter phoneme";
  customPhonemeLabel.appendChild(customPhonemeInput);
  phonemeFieldset.appendChild(customPhonemeLabel);

  // Container to display added phonemes
  const phonemeList = document.createElement("div");
  phonemeList.id = "phonemeList";
  phonemeList.style.marginTop = "5px";
  phonemeList.style.padding = "5px";
  phonemeList.style.border = "1px dashed #ccc";
  phonemeList.style.minHeight = "30px";
  phonemeFieldset.appendChild(phonemeList);

  modalContent.appendChild(phonemeFieldset);

  // ========== Frequency Adjustment ==========
  const freqFieldset = document.createElement("fieldset");
  freqFieldset.style.width = "80%";
  freqFieldset.style.display = "flex";
  freqFieldset.style.flexDirection = "column";
  freqFieldset.style.gap = "10px";

  const freqLegend = document.createElement("legend");
  freqLegend.innerHTML = '<span class="iconify" data-icon="mdi:chart-line"></span> Frequency Adjustment';
  freqFieldset.appendChild(freqLegend);

  const frequencyValue = document.createElement("input");
  frequencyValue.type = "number";
  frequencyValue.placeholder = "Enter frequency adjustment (%)";
  frequencyValue.min = "0";
  freqFieldset.appendChild(frequencyValue);

  modalContent.appendChild(freqFieldset);

  // ========== Condition ==========
  const condFieldset = document.createElement("fieldset");
  condFieldset.style.width = "80%";
  condFieldset.style.display = "flex";
  condFieldset.style.flexDirection = "column";
  condFieldset.style.gap = "10px";

  const condLegend = document.createElement("legend");
  condLegend.innerHTML = '<span class="iconify" data-icon="mdi:filter"></span> Condition';
  condFieldset.appendChild(condLegend);

  const frequencyCondition = document.createElement("select");
  frequencyCondition.id = "frequencyCondition";
  ["", "in stressed syllables", "at word boundaries", "in rapid speech", "custom"].forEach(value => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value === "" ? "None" : value;
    frequencyCondition.appendChild(opt);
  });
  condFieldset.appendChild(frequencyCondition);

  const customFreqConditionInput = document.createElement("input");
  customFreqConditionInput.type = "text";
  customFreqConditionInput.placeholder = "Enter custom condition";
  customFreqConditionInput.style.display = "none";
  condFieldset.appendChild(customFreqConditionInput);

  modalContent.appendChild(condFieldset);

  // ========== Exceptions ==========
  const excFieldset = document.createElement("fieldset");
  excFieldset.style.width = "80%";
  excFieldset.style.display = "flex";
  excFieldset.style.flexDirection = "column";
  excFieldset.style.gap = "10px";

  const excLegend = document.createElement("legend");
  excLegend.innerHTML = '<span class="iconify" data-icon="mdi:alert-octagon"></span> Exceptions';
  excFieldset.appendChild(excLegend);

  const exceptionsSelect = document.createElement("select");
  exceptionsSelect.id = "exceptionsSelect";
  ["", "excluding loanwords", "excluding proper names", "custom"].forEach(value => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value === "" ? "None" : value;
    exceptionsSelect.appendChild(opt);
  });
  excFieldset.appendChild(exceptionsSelect);

  const customExceptionInput = document.createElement("input");
  customExceptionInput.type = "text";
  customExceptionInput.placeholder = "Enter custom exception";
  customExceptionInput.style.display = "none";
  excFieldset.appendChild(customExceptionInput);

  modalContent.appendChild(excFieldset);

  // ========== Additional Details ==========
  const notesFieldset = document.createElement("fieldset");
  notesFieldset.style.width = "80%";
  notesFieldset.style.display = "flex";
  notesFieldset.style.flexDirection = "column";
  notesFieldset.style.gap = "10px";

  const notesLegend = document.createElement("legend");
  notesLegend.innerHTML = '<span class="iconify" data-icon="mdi:note-text"></span> Additional Details';
  notesFieldset.appendChild(notesLegend);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "100%";
  detailsInput.style.height = "60px";
  detailsInput.style.resize = "none";
  detailsInput.style.boxSizing = "border-box";
  notesFieldset.appendChild(detailsInput);

  modalContent.appendChild(notesFieldset);

  // ========== Constructed Rule (read-only) ==========
  const ruleFieldset = document.createElement("fieldset");
  ruleFieldset.style.width = "80%";
  ruleFieldset.style.display = "flex";
  const ruleLegend = document.createElement("legend");
  ruleLegend.innerHTML = '<span class="iconify" data-icon="mdi:clipboard-text"></span> Rule';
  ruleFieldset.appendChild(ruleLegend);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Your rule will appear here";
  ruleInput.readOnly = true;
  ruleInput.style.width = "90%";
  ruleInput.style.boxSizing = "border-box"; 
  ruleFieldset.appendChild(ruleInput);

  // Construct Rule button goes below the rule input
  const constructRuleBtn = createButton({
    text: "Construct Rule",
    onClick: function() {
      if (!phonemesArray.length) {
        showModal("Error", "Please add at least one phoneme.");
        return;
      }
      const freqVal = frequencyValue.value.trim();
      if (!freqVal) {
        showModal("Error", "Please enter a frequency adjustment value.");
        return;
      }
      let rule = "Adjust frequency of [" + phonemesArray.join(", ") + "] to " + freqVal + "%";

      const conditionVal = frequencyCondition.value;
      if (conditionVal === "custom") {
        const customCond = customFreqConditionInput.value.trim();
        if (!customCond) {
          showModal("Error", "Please enter your custom condition.");
          return;
        }
        rule += " when " + customCond;
      } else if (conditionVal) {
        rule += " " + conditionVal;
      }

      const exceptionVal = exceptionsSelect.value;
      if (exceptionVal === "custom") {
        const customExc = customExceptionInput.value.trim();
        if (!customExc) {
          showModal("Error", "Please enter your custom exception.");
          return;
        }
        rule += " [Exception: " + customExc + "]";
      } else if (exceptionVal) {
        rule += " [Exception: " + exceptionVal + "]";
      }

      ruleInput.value = rule;
    }
  });
  constructRuleBtn.style.marginLeft = "10px";
  constructRuleBtn.style.width = "auto";
  ruleFieldset.appendChild(constructRuleBtn);

  modalContent.appendChild(ruleFieldset);

  // ========== Save / Cancel Buttons ==========
  const btnContainer = document.createElement("div");
  btnContainer.id = "buttonContainer";
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    onClick: function() {
      if (!ruleInput.value.trim()) {
        showModal("Error", "Please construct a rule before saving.");
        return;
      }
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    onClick: function() {
      modal.close();
    }
  });
  btnContainer.appendChild(cancelBtn);

  modalContent.appendChild(btnContainer);

  // Create modal
  const modal = createModal("Define: Phoneme Frequencies", modalContent, "80%", "80%");

  // ===== Helpers =====
  function updatePhonemeList() {
    phonemeList.innerHTML = "";
    phonemesArray.forEach(p => {
      const span = document.createElement("span");
      span.textContent = p;
      span.style.display = "inline-block";
      span.style.marginRight = "5px";
      span.style.padding = "2px 5px";
      span.style.background = "#eaeaea";
      span.style.borderRadius = "3px";
      span.style.color = "#000";
      phonemeList.appendChild(span);
    });
  }

  // Toggle custom inputs for frequency condition and exceptions
  frequencyCondition.addEventListener("change", function() {
    customFreqConditionInput.style.display = (this.value === "custom") ? "block" : "none";
  });
  exceptionsSelect.addEventListener("change", function() {
    customExceptionInput.style.display = (this.value === "custom") ? "block" : "none";
  });
}


function promptForIllegalCombinations(callback) {
  ensurePhonologyInitialized();

  // Main container
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  // Title
  const title = document.createElement("h2");
  title.innerHTML = '<span class="iconify" data-icon="mdi:close-circle-outline"></span> Define: Illegal Combinations';
  modalContent.appendChild(title);

  /* ==============================
   * 1) ILLEGAL SEQUENCE FIELDSET
   * ============================== */
  const seqFieldset = document.createElement("fieldset");
  seqFieldset.style.width = "80%";
  seqFieldset.style.display = "flex";
  seqFieldset.style.flexDirection = "column";
  seqFieldset.style.gap = "10px";

  const seqLegend = document.createElement("legend");
  seqLegend.innerHTML = '<span class="iconify" data-icon="mdi:block-helper"></span> Illegal Sequence';
  seqFieldset.appendChild(seqLegend);

  // We'll store multiple final sequences in an array
  let illegalSequences = [];

  // Row #1: Phoneme selector + "Add Phoneme" button
  const phonemeRow = document.createElement("div");
  phonemeRow.style.display = "flex";
  phonemeRow.style.alignItems = "center";
  phonemeRow.style.gap = "8px";

  // Pull phoneme data from session
  let phonemeOptions = [];
  try {
    const sessionData = sessionStorage.getItem("phonologyProjectData");
    if (sessionData) {
      const projectPhonology = JSON.parse(sessionData);
      if (projectPhonology && projectPhonology.inventory) {
        phonemeOptions = projectPhonology.inventory.map(item => item.symbol);
      }
    }
  } catch (e) {
    console.error("Error parsing session data for illegal combos", e);
  }

  const phonemeSelect = document.createElement("select");
  if (!phonemeOptions.length) {
    // No phonemes in inventory => lock input
    const defineOpt = document.createElement("option");
    defineOpt.value = "definePhoneme";
    defineOpt.textContent = "Define phoneme";
    phonemeSelect.appendChild(defineOpt);
    phonemeSelect.value = "definePhoneme";
    phonemeSelect.disabled = true;
  } else {
    // Fill with inventory
    phonemeOptions.forEach(value => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      phonemeSelect.appendChild(opt);
    });
  }
  phonemeRow.appendChild(phonemeSelect);

  // "Add Phoneme" button to append the selected phoneme to sequenceInput
  const addPhonemeBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:plus"></span> Add Phoneme',
    onClick: () => {
      if (phonemeSelect.disabled) {
        showModal("Error", "No phonemes in inventory. Define a phoneme first.");
        return;
      }
      const selectedPhoneme = phonemeSelect.value;
      if (!selectedPhoneme) return;
      if (sequenceInput.value.trim()) {
        // If already has something, add a space to separate
        sequenceInput.value += " " + selectedPhoneme;
      } else {
        // Otherwise just set the first phoneme
        sequenceInput.value = selectedPhoneme;
      }
    }
  });
  addPhonemeBtn.style.padding = "4px 8px";
  addPhonemeBtn.style.fontSize = "0.9em";
  addPhonemeBtn.style.width = "auto";
  phonemeRow.appendChild(addPhonemeBtn);

  seqFieldset.appendChild(phonemeRow);

  // Row #2: Text input that collects multiple phonemes
  const sequenceInput = document.createElement("input");
  sequenceInput.type = "text";
  sequenceInput.placeholder = "Your phonemes will appear here (space-separated)";
  sequenceInput.style.width = "100%";
  seqFieldset.appendChild(sequenceInput);

  // Row #3: Buttons for "Add Sequence" + "Clear All Sequences"
  const sequenceBtnRow = document.createElement("div");
  sequenceBtnRow.style.display = "flex";
  sequenceBtnRow.style.gap = "8px";

  const addSequenceBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:plus-box"></span> Add Sequence',
    onClick: () => {
      const seqVal = sequenceInput.value.trim();
      if (!seqVal) {
        showModal("Error", "Please add at least one phoneme to the input before adding a sequence.");
        return;
      }
      illegalSequences.push(seqVal);
      updateSequenceDisplay();
      sequenceInput.value = "";
    }
  });
  addSequenceBtn.style.padding = "4px 8px";
  addSequenceBtn.style.fontSize = "0.9em";
  addSequenceBtn.style.width = "auto";
  sequenceBtnRow.appendChild(addSequenceBtn);

  const clearSequencesBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:delete-forever"></span> Clear All Sequences',
    onClick: () => {
      illegalSequences = [];
      updateSequenceDisplay();
    }
  });
  clearSequencesBtn.style.padding = "4px 8px";
  clearSequencesBtn.style.fontSize = "0.9em";
  clearSequencesBtn.style.width = "auto";
  clearSequencesBtn.style.backgroundColor = "red";
  clearSequencesBtn.style.color = "#fff";
  sequenceBtnRow.appendChild(clearSequencesBtn);

  seqFieldset.appendChild(sequenceBtnRow);

  // Row #4: A dashed div to show all sequences
  const sequenceDisplay = document.createElement("div");
  sequenceDisplay.style.marginTop = "5px";
  sequenceDisplay.style.padding = "5px";
  sequenceDisplay.style.border = "1px dashed #ccc";
  sequenceDisplay.style.minHeight = "30px";
  seqFieldset.appendChild(sequenceDisplay);

  function updateSequenceDisplay() {
    sequenceDisplay.innerHTML = "";
    illegalSequences.forEach(seq => {
      const span = document.createElement("span");
      span.textContent = seq;
      span.style.marginRight = "5px";
      span.style.padding = "2px 4px";
      span.style.background = "#eaeaea";
      span.style.borderRadius = "3px";
      span.style.color = "#000";
      sequenceDisplay.appendChild(span);
    });
  }

  modalContent.appendChild(seqFieldset);

  /* ==============================
   * 2) CONDITION FIELDSET
   * ============================== */
  const condFieldset = document.createElement("fieldset");
  condFieldset.style.width = "80%";
  condFieldset.style.display = "flex";
  condFieldset.style.flexDirection = "column";
  condFieldset.style.gap = "10px";

  const condLegend = document.createElement("legend");
  condLegend.innerHTML = '<span class="iconify" data-icon="mdi:filter-outline"></span> Condition';
  condFieldset.appendChild(condLegend);

  const conditionSelect = document.createElement("select");
  ["", "at word boundaries", "in initial clusters", "in final clusters", "custom"].forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val || "None";
    conditionSelect.appendChild(opt);
  });
  condFieldset.appendChild(conditionSelect);

  // Custom condition input (type="text" for styling)
  const customCondInput = document.createElement("input");
  customCondInput.type = "text";
  customCondInput.placeholder = "Enter custom condition";
  customCondInput.style.display = "none";
  condFieldset.appendChild(customCondInput);

  conditionSelect.addEventListener("change", function() {
    if (this.value === "custom") {
      customCondInput.style.display = "block";
    } else {
      customCondInput.style.display = "none";
      customCondInput.value = "";
    }
  });

  modalContent.appendChild(condFieldset);

  /* ==============================
   * 3) EXCEPTIONS FIELDSET
   * ============================== */
  const excFieldset = document.createElement("fieldset");
  excFieldset.style.width = "80%";
  excFieldset.style.display = "flex";
  excFieldset.style.flexDirection = "column";
  excFieldset.style.gap = "10px";

  const excLegend = document.createElement("legend");
  excLegend.innerHTML = '<span class="iconify" data-icon="mdi:alert-octagon-outline"></span> Exceptions';
  excFieldset.appendChild(excLegend);

  const exceptionSelect = document.createElement("select");
  ["", "not before sonorants", "not following a pause", "custom"].forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val || "None";
    exceptionSelect.appendChild(opt);
  });
  excFieldset.appendChild(exceptionSelect);

  // Custom exception input (type="text")
  const customExcInput = document.createElement("input");
  customExcInput.type = "text";
  customExcInput.placeholder = "Enter custom exception";
  customExcInput.style.display = "none";
  excFieldset.appendChild(customExcInput);

  exceptionSelect.addEventListener("change", function() {
    if (this.value === "custom") {
      customExcInput.style.display = "block";
    } else {
      customExcInput.style.display = "none";
      customExcInput.value = "";
    }
  });

  modalContent.appendChild(excFieldset);

  /* ==============================
   * 4) ADDITIONAL DETAILS FIELDSET
   * ============================== */
  const notesFieldset = document.createElement("fieldset");
  notesFieldset.style.width = "80%";
  notesFieldset.style.display = "flex";
  notesFieldset.style.flexDirection = "column";
  notesFieldset.style.gap = "10px";

  const notesLegend = document.createElement("legend");
  notesLegend.innerHTML = '<span class="iconify" data-icon="mdi:note-multiple-outline"></span> Additional Details';
  notesFieldset.appendChild(notesLegend);

  const notesInput = document.createElement("textarea");
  notesInput.style.width = "100%";
  notesInput.style.height = "60px";
  notesInput.style.resize = "none";
  notesFieldset.appendChild(notesInput);

  modalContent.appendChild(notesFieldset);

  /* ==============================
   * 5) RULE + CONSTRUCT BUTTON
   * ============================== */
  const ruleFieldset = document.createElement("fieldset");
  ruleFieldset.style.width = "80%";
  ruleFieldset.style.display = "flex";
  ruleFieldset.style.flexDirection = "row";
  ruleFieldset.style.alignItems = "center";
  ruleFieldset.style.gap = "10px";

  const ruleLegend = document.createElement("legend");
  ruleLegend.innerHTML = '<span class="iconify" data-icon="mdi:clipboard-text-outline"></span> Rule';
  ruleFieldset.appendChild(ruleLegend);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.readOnly = true;
  ruleInput.style.flex = "1";
  ruleFieldset.appendChild(ruleInput);

  const constructRuleBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:hammer-wrench"></span> Construct Rule',
    onClick: () => {
      // Must have at least 1 sequence in the dashed box
      if (!illegalSequences.length) {
        showModal("Error", "Please add at least one sequence before constructing the rule.");
        return;
      }
      // Build the rule from all sequences
      let rule = illegalSequences.join(", ");

      // Condition
      if (conditionSelect.value === "custom") {
        const condVal = customCondInput.value.trim();
        if (!condVal) {
          showModal("Error", "Please specify your custom condition.");
          return;
        }
        rule += " when " + condVal;
      } else if (conditionSelect.value) {
        rule += " " + conditionSelect.value;
      }

      // Exception
      if (exceptionSelect.value === "custom") {
        const excVal = customExcInput.value.trim();
        if (!excVal) {
          showModal("Error", "Please specify your custom exception.");
          return;
        }
        rule += " [Exception: " + excVal + "]";
      } else if (exceptionSelect.value) {
        rule += " [Exception: " + exceptionSelect.value + "]";
      }

      // (No additional details appended to the rule)
      ruleInput.value = rule;
    }
  });
  constructRuleBtn.style.padding = "4px 8px";
  constructRuleBtn.style.fontSize = "0.9em";
  constructRuleBtn.style.width = "auto";
  ruleFieldset.appendChild(constructRuleBtn);

  modalContent.appendChild(ruleFieldset);

  /* ==============================
   * 6) SAVE / CANCEL
   * ============================== */
  const btnContainer = document.createElement("div");
  btnContainer.id = "buttonContainer";
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:content-save-check"></span> Save',
    onClick: () => {
      if (!ruleInput.value.trim()) {
        showModal("Error", "Please construct a rule before saving.");
        return;
      }
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        // Additional details are returned separately, not appended to rule
        additionalDetails: notesInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    innerHTML: '<span class="iconify" data-icon="mdi:close-circle"></span> Cancel',
    onClick: () => {
      modal.close();
    }
  });
  btnContainer.appendChild(cancelBtn);

  modalContent.appendChild(btnContainer);

  // Create and display the modal
  const modal = createModal("Define: Illegal Combinations", modalContent, "70%", "80%");
}


function promptForVowelProbabilities(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Vowel Probabilities";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Vowel Probabilities", modalContent, "40%", "40%");
}

function promptForVowelTones(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Vowel Tones";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Vowel Tones", modalContent, "40%", "40%");
}

function promptForStressPattern(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Stress Pattern";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Stress Pattern", modalContent, "40%", "40%");
}

function promptForConsonantClusterConstraints(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Consonant Cluster Constraints";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Consonant Cluster Constraints", modalContent, "40%", "40%");
}

function promptForVowelConsonantHarmony(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Vowel/Consonant Harmony";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Vowel/Consonant Harmony", modalContent, "40%", "40%");
}

function promptForSyllableBoundary(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Syllable Boundary / Sonority Hierarchy";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Syllable Boundary / Sonority Hierarchy", modalContent, "40%", "40%");
}

function promptForAllophonicRules(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Allophonic Rules";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Allophonic Rules", modalContent, "40%", "40%");
}

function promptForToneSandhi(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";

  const title = document.createElement("h3");
  title.textContent = "Define: Tone Sandhi";
  modalContent.appendChild(title);

  // "Rule" input
  const ruleLabel = document.createElement("label");
  ruleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(ruleLabel);

  const ruleInput = document.createElement("input");
  ruleInput.type = "text";
  ruleInput.placeholder = "Enter rule text";
  ruleInput.style.width = "80%";
  modalContent.appendChild(ruleInput);

  // "Additional details"
  const detailsLabel = document.createElement("label");
  detailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(detailsLabel);

  const detailsInput = document.createElement("textarea");
  detailsInput.placeholder = "Enter additional details for this rule";
  detailsInput.style.width = "80%";
  detailsInput.style.height = "60px";
  modalContent.appendChild(detailsInput);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "10px";

  const saveBtn = createButton({
    text: "Save",
    title: "Save rule data",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function() {
      modal.close();
      callback({
        rule: ruleInput.value.trim(),
        additionalDetails: detailsInput.value.trim()
      });
    }
  });
  btnContainer.appendChild(saveBtn);

  const cancelBtn = createButton({
    text: "Cancel",
    title: "Cancel",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#6c757d", color: "white", borderRadius: "4px" },
    onClick: function() { modal.close(); }
  });
  btnContainer.appendChild(cancelBtn);
  modalContent.appendChild(btnContainer);

  const modal = createModal("Define: Tone Sandhi", modalContent, "40%", "40%");
}

// 4. Main function for adding a new rule (New Rule modal with "Next" button)
function promptForPhonotacticRule(callback) {
  // Create the main container for modal content
  const modalContent = document.createElement("div");
  Object.assign(modalContent.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "6px",
    padding: "10px"
  });

  // === FIELDSET: RULE NAME ===
  const fsName = document.createElement("fieldset");
  Object.assign(fsName.style, { margin: "1em 0", padding: "1em" });
  const legendName = document.createElement("legend");
  legendName.textContent = "Rule Name";
  fsName.appendChild(legendName);

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  Object.assign(nameInput.style, {
    width: "80%",
    marginTop: "4px"
  });
  fsName.appendChild(nameInput);
  modalContent.appendChild(fsName);

  // === FIELDSET: RULE TYPE (Radio buttons in 3-column grid) ===
  const fsType = document.createElement("fieldset");
  Object.assign(fsType.style, { margin: "1em 0", padding: "1em" });
  const legendType = document.createElement("legend");
  legendType.textContent = "Rule Type";
  fsType.appendChild(legendType);

  // Container for rule type radios in a 3-column grid
  const ruleTypeContainer = document.createElement("div");
  Object.assign(ruleTypeContainer.style, {
    display: "grid",
    padding: "4px",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    marginTop: "4px"
  });

  // Get the rule type elements from the existing function
  const ruleTypeSelector = createRuleTypeSelector();
  Array.from(ruleTypeSelector.children).forEach(child => {
    ruleTypeContainer.appendChild(child);
  });

  fsType.appendChild(ruleTypeContainer);
  modalContent.appendChild(fsType);

  // === FIELDSET: GENERAL DETAILS + ENABLE RULE (Additional info removed) ===
  const fsDetails = document.createElement("fieldset");
  Object.assign(fsDetails.style, { margin: "1em 0", padding: "1em" });
  const legendDetails = document.createElement("legend");
  legendDetails.textContent = "General Details";
  fsDetails.appendChild(legendDetails);

  const enableDiv = document.createElement("div");
  Object.assign(enableDiv.style, {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px"
  });
  const enableChk = document.createElement("input");
  enableChk.type = "checkbox";
  enableChk.checked = true;
  enableDiv.appendChild(enableChk);
  enableDiv.appendChild(document.createTextNode("Enable rule"));
  fsDetails.appendChild(enableDiv);

  modalContent.appendChild(fsDetails);

  // === BOTTOM BUTTONS ===
  const btnDiv = document.createElement("div");
  Object.assign(btnDiv.style, {
    display: "flex",
    justifyContent: "flex-end",
    width: "calc(100% + 20px)",
    marginLeft: "-10px",
    marginRight: "-10px",
    gap: "10px",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: "var(--button-bg)",
    borderTop: "1px solid var(--button-border)"
  });
  btnDiv.style.setProperty("margin-bottom", "-10px", "important");

  const nextBtn = createButton({
    text: "Next",
    title: "Proceed to define rule details",
    styles: {
      padding: "6px 16px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      const name = nameInput.value.trim();
      const ruleTypeRadio = modalContent.querySelector('input[name="ruleType"]:checked');
      const type = ruleTypeRadio ? ruleTypeRadio.value : "";
      // "position" remains just in case
      const position = modalContent.querySelector('input[name="position"]:checked')?.value || "";
      const enabled = enableChk.checked;

      if (!name) {
        showModal("Error", "Rule name is required.");
        return;
      }
      modal.close();

      if (ruleDefinitionFunctions[type]) {
        ruleDefinitionFunctions[type](function (ruleSpecificDetails) {
          // Build final rule data
          const ruleData = {
            name,
            type,
            position,
            enabled,
            details: JSON.stringify(ruleSpecificDetails || {})
          };
          callback(ruleData);
        });
      } else {
        // Fallback if no rule type function found
        const ruleData = {
          name,
          type,
          position,
          enabled,
          details: JSON.stringify({})
        };
        callback(ruleData);
      }
    }
  });

  const cancelBtn = createButton({
    text: "Back",
    title: "Discard changes",
    styles: {
      padding: "6px 16px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      modal.close();
    }
  });

  btnDiv.appendChild(nextBtn);
  btnDiv.appendChild(cancelBtn);
  modalContent.appendChild(btnDiv);

  const modal = createModal("New Phonotactic Rule", modalContent, "80%", "70%");
}


// 5. Function for editing a rule (opens a dedicated detail modal with prefilled values)
function promptForPhonotacticRuleDetails(ruleType, existingData) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";
  
  const header = document.createElement("h2");
  header.textContent = "Define: " + ruleType;
  modalContent.appendChild(header);
  
  // Attempt to parse existing details
  let existingDetails = {};
  try {
    if (existingData.details) {
      existingDetails = JSON.parse(existingData.details);
    }
  } catch (e) {
    existingDetails = {};
  }

  // "Rule Name" field
  const ruleNameLabel = document.createElement("div");
  ruleNameLabel.innerHTML = "<strong>Rule Name:</strong>";
  ruleNameLabel.title = "Enter a custom name for this rule";
  modalContent.appendChild(ruleNameLabel);

  const ruleNameInput = document.createElement("input");
  ruleNameInput.type = "text";
  ruleNameInput.placeholder = "Enter rule name";
  ruleNameInput.style.width = "80%";
  ruleNameInput.value = existingData.name || ruleType;
  modalContent.appendChild(ruleNameInput);

  // "Rule" input
  const mainRuleLabel = document.createElement("div");
  mainRuleLabel.innerHTML = "<strong>Rule:</strong>";
  modalContent.appendChild(mainRuleLabel);

  const mainRuleInput = document.createElement("input");
  mainRuleInput.type = "text";
  mainRuleInput.placeholder = "Enter rule text";
  mainRuleInput.style.width = "80%";
  mainRuleInput.value = existingDetails.rule || "";
  modalContent.appendChild(mainRuleInput);

  // "Additional details"
  const moreDetailsLabel = document.createElement("div");
  moreDetailsLabel.innerHTML = "<strong>Additional details:</strong>";
  modalContent.appendChild(moreDetailsLabel);

  const moreDetailsInput = document.createElement("textarea");
  moreDetailsInput.placeholder = "Enter additional details";
  moreDetailsInput.style.width = "80%";
  moreDetailsInput.style.height = "60px";
  moreDetailsInput.value = existingDetails.additionalDetails || "";
  modalContent.appendChild(moreDetailsInput);

  // Confirm button
  const confirmBtn = createButton({
    text: "Confirm",
    title: "Confirm rule details",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#28a745", color: "white", borderRadius: "4px" },
    onClick: function() {
      const updatedData = {
        rule: mainRuleInput.value.trim(),
        additionalDetails: moreDetailsInput.value.trim()
      };
      existingData.name = ruleNameInput.value.trim() || ruleType;
      existingData.type = ruleType;
      existingData.details = JSON.stringify(updatedData);
      
      modal.close();
      updatePhonologyMain(); // re-render, re-save, etc.
    }
  });
  modalContent.appendChild(confirmBtn);

  const modal = createModal("Define: " + ruleType, modalContent, "40%", "50%");
}

// 6. Add rule directly (used by new rule creation)
function addPhonotacticRuleDirect(dataObj) {
  ensurePhonologyInitialized();
  let ruleName = dataObj.name || dataObj.type;
  const exists = projectData.phonology.phonotactics.find(rule => rule.name === ruleName);
  if (exists) {
    showModal("Duplicate Rule", `Rule "${ruleName}" already exists. New rule will be named "${ruleName} (additional)".`);
    ruleName += " (additional)";
  }
  const newRule = {
    name: ruleName,
    type: dataObj.type,
    details: dataObj.details || "{}",
    enabled: true
  };
  projectData.phonology.phonotactics.push(newRule);
  updatePhonologyMain();
  const listElem = document.getElementById("phonotacticList");
  if (listElem) {
    const row = createPhonotacticRuleRow(newRule);
    listElem.appendChild(row);
  }
}

// 7. Edit rule – opens the detail modal prefilled with existing rule data.
function editPhonotacticRuleDetails(rule) {  
  promptForPhonotacticRuleDetails(rule.type, rule);  
}

// 8. Create a rule row in the UI.
function createPhonotacticRuleRow(item) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.padding = "5px 0";

  const leftDiv = document.createElement("div");
  let detailsStr = "";
  try {
    const detailsObj = JSON.parse(item.details);
    delete detailsObj.name;
    delete detailsObj.type;
    for (const key in detailsObj) {
      if (detailsObj.hasOwnProperty(key)) {
        detailsStr += `<strong>${key}:</strong> ${detailsObj[key]}<br>`;
      }
    }
  } catch (e) {
    detailsStr = item.details;
  }
  leftDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})<br><br>${detailsStr} ${item.enabled ? "" : "(Disabled)"}`;
  li.appendChild(leftDiv);

  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";

  const editBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:pencil-outline'></span>",
    title: "Edit rule",
    styles: { border: "none", backgroundColor: "#ffc107", color: "white", borderRadius: "4px" },
    onClick: function () { editPhonotacticRuleDetails(item); }
  });
  btnContainer.appendChild(editBtn);

  const toggleBtn = createButton({
    text: item.enabled ? "Disable" : "Enable",
    title: "Toggle rule enable/disable",
    styles: { border: "none", backgroundColor: "#17a2b8", color: "white", borderRadius: "4px", padding: "4px 8px" },
    onClick: function () {
      item.enabled = !item.enabled;
      toggleBtn.textContent = item.enabled ? "Disable" : "Enable";

      let newDetailsStr = "";
      try {
        const detailsObj = JSON.parse(item.details);
        delete detailsObj.name;
        delete detailsObj.type;
        for (const key in detailsObj) {
          if (detailsObj.hasOwnProperty(key)) {
            newDetailsStr += `<strong>${key}:</strong> ${detailsObj[key]}<br>`;
          }
        }
      } catch (e) {
        newDetailsStr = item.details;
      }
      leftDiv.innerHTML = `<strong>${item.name}</strong> (${item.type})<br><br>${newDetailsStr} ${item.enabled ? "" : "(Disabled)"}`;
      updatePhonologyMain();
    }
  });
  btnContainer.appendChild(toggleBtn);

  const deleteBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:trash-can-outline'></span>",
    title: "Delete rule",
    styles: { border: "none", backgroundColor: "#dc3545", color: "white", borderRadius: "4px" },
    onClick: function () {
      showModal("Confirm Delete", `Delete rule "${item.name}"?`, function () {
        const idx = projectData.phonology.phonotactics.indexOf(item);
        if (idx !== -1) {
          projectData.phonology.phonotactics.splice(idx, 1);
          li.remove();
          updatePhonologyMain();
        }
      });
    }
  });
  btnContainer.appendChild(deleteBtn);

  li.appendChild(btnContainer);
  return li;
}

// 9. Function to add a new rule (calls promptForPhonotacticRule)
function addPhonotacticRule() {
  ensurePhonologyInitialized();
  promptForPhonotacticRule(function (data) {
    const existing = projectData.phonology.phonotactics.find(rule => rule.name === data.name);
    if (existing) {
      showModal("Rule Already Exists", `"${data.name}" is already defined. This new one will be named "${data.name} (additional)".`);
      data.name += " (additional)";
      updatePhonologyMain();
    }
    projectData.phonology.phonotactics.push(data);
    const li = createPhonotacticRuleRow(data);
    document.getElementById("phonotacticList").appendChild(li);
    updatePhonologyMain();
  });
}

// ----- SCRIPT (WRITING SYSTEM) FUNCTIONS -----
// This prompt includes a better toolbar for the Glyph Editor
// Function to verify if the character already exists in the script list.
// If it exists, it shows a WinBox modal alert and clears the input field.
function validateUniqueCharacter(inputElement) {
  const charValue = inputElement.value.trim();
  if (!charValue) return; // Do nothing if empty

  // Check if the character already exists in the projectData.phonology.script array
  const exists = projectData.phonology.script.some(item => item.character === charValue);
  if (exists) {
    showModal("Duplicate Character", "This character already exists in the script.");
    inputElement.value = ""; // Clear the field
  }
}

// Function to ensure that the keyboard input contains only one character.
// If more than one character is entered, it shows a WinBox modal alert and clears the input.
function validateSingleCharacter(inputElement) {
  const value = inputElement.value;
  if (value.length > 1) {
    showModal("Invalid Input", "Only a single character is allowed for keyboard input.");
    inputElement.value = ""; // Clear the field
  }
}
function promptForScriptCharacter(callback, options = {}) {
  const isEdit = options.isEdit === true;
  const data = options.data || { character: "", method: "keyboard" };

  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "8px";

  // Fieldset for character name
  const nameFieldset = document.createElement("fieldset");
  nameFieldset.style.width = "90%";
  nameFieldset.style.marginBottom = "15px";

  // Legend with icon for Character Name
  const nameLegend = document.createElement("legend");
  nameLegend.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--mdi" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="mdi:alphabetical"><path fill="currentColor" d="M6 11a2 2 0 0 1 2 2v4H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zm-2 2v2h2v-2zm16 0v2h2v2h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2v2zm-8-6v4h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7zm0 8h2v-2h-2z"></path></svg> Character Name`;
  nameFieldset.appendChild(nameLegend);

  // Small description for the character name field
  const nameDescription = document.createElement("p");
  nameDescription.textContent = "Name your character. This will be used to identify them in your script.";
  nameDescription.style.margin = "5px 0 10px 0";
  nameFieldset.appendChild(nameDescription);

// Character name input
const charNameInput = document.createElement("input");
charNameInput.type = "text";
charNameInput.placeholder = "Enter character name";
charNameInput.style.paddingTop = "10px";
charNameInput.style.width = "80%";
charNameInput.style.marginBottom = "10px";
charNameInput.value = data.character || "";
// Auto-capitalize as the user types
charNameInput.oninput = function() {
  this.value = this.value.toUpperCase();
};
charNameInput.onchange = function() {
  validateUniqueCharacter(this);
};
nameFieldset.appendChild(charNameInput);


  // Fieldset for glyph section
  const glyphFieldset = document.createElement("fieldset");
  glyphFieldset.style.width = "90%";
  glyphFieldset.style.marginBottom = "15px";

  // Legend with icon for Glyph Section
  const glyphLegend = document.createElement("legend");
  glyphLegend.innerHTML = `<span class="iconify" data-icon="mdi:gesture" style="vertical-align: middle;"></span> Glyph Section`;
  glyphFieldset.appendChild(glyphLegend);

  // Small description for glyph field
  const glyphDescription = document.createElement("p");
  glyphDescription.textContent = "Define the glyph your character will use. Choose keyboard input or draw a custom glyph.";
  glyphDescription.style.margin = "5px 0 10px 0";
  glyphFieldset.appendChild(glyphDescription);

  // Input method label
  const methodLabel = document.createElement("div");
  methodLabel.textContent = "Select an input method for your glyph:";
  methodLabel.style.marginBottom = "6px";
  glyphFieldset.appendChild(methodLabel);

  // Radio buttons for input method
  const methodDiv = document.createElement("div");
  methodDiv.style.display = "flex";
  methodDiv.style.gap = "10px";
  methodDiv.style.marginBottom = "10px";

  const keyboardRadio = document.createElement("input");
  keyboardRadio.type = "radio";
  keyboardRadio.name = "glyphMethod";
  keyboardRadio.value = "keyboard";
  keyboardRadio.checked = data.method === "keyboard";

  const keyboardLabel = document.createElement("label");
  keyboardLabel.textContent = "Keyboard (type your glyph)";

  const customRadio = document.createElement("input");
  customRadio.type = "radio";
  customRadio.name = "glyphMethod";
  customRadio.value = "custom";
  customRadio.checked = data.method === "custom";

  const customLabel = document.createElement("label");
  customLabel.textContent = "Custom (draw your glyph)";

  methodDiv.appendChild(keyboardRadio);
  methodDiv.appendChild(keyboardLabel);
  methodDiv.appendChild(customRadio);
  methodDiv.appendChild(customLabel);
  glyphFieldset.appendChild(methodDiv);

// Keyboard container
const keyboardContainer = document.createElement("div");
keyboardContainer.style.width = "80%";
keyboardContainer.style.marginBottom = "15px";

const kbInputLabel = document.createElement("div");
kbInputLabel.textContent = "Glyph (Keyboard):";
kbInputLabel.style.marginBottom = "4px";
keyboardContainer.appendChild(kbInputLabel);

const kbInput = document.createElement("input");
kbInput.type = "text";
kbInput.placeholder = "Enter glyph from keyboard";
kbInput.style.padding = "5px";
kbInput.style.marginTop = "16px";
kbInput.style.width = "100%";
kbInput.value = data.method === "keyboard" ? (data.glyph || "") : "";
kbInput.oninput = function() {
  this.value = this.value.toUpperCase();
};
kbInput.onchange = function() {
  validateSingleCharacter(this);
};

keyboardContainer.appendChild(kbInput);

glyphFieldset.appendChild(keyboardContainer);

// Custom glyph container
const customContainer = document.createElement("div");
customContainer.style.width = "80%";
customContainer.style.marginBottom = "15px";
customContainer.style.display = data.method === "custom" ? "block" : "none";

const drawGlyphLabel = document.createElement("div");
drawGlyphLabel.textContent = "Draw Glyph:";
drawGlyphLabel.style.marginBottom = "4px";
customContainer.appendChild(drawGlyphLabel);


const drawGlyphButton = document.createElement("button");
drawGlyphButton.textContent = (isEdit && data.glyph) ? "Edit Glyph" : "Open Glyph Editor";
drawGlyphButton.style.padding = "6px 12px";
drawGlyphButton.style.marginBottom = "10px";


const drawGlyphIcon = document.createElement("span");
drawGlyphIcon.classList.add("iconify");
drawGlyphIcon.dataset.icon = "mdi:brush"; 
drawGlyphIcon.style.verticalAlign = "middle";
drawGlyphIcon.style.marginRight = "5px";
drawGlyphButton.prepend(drawGlyphIcon);

customContainer.appendChild(drawGlyphButton);

const glyphOutput = document.createElement("div");
glyphOutput.style.fontFamily = "monospace";
glyphOutput.style.wordBreak = "break-all";
glyphOutput.style.marginTop = "5px";
glyphOutput.textContent = data.glyph ? data.glyph : "";
customContainer.appendChild(glyphOutput);

glyphFieldset.appendChild(customContainer);

// Append fieldsets to modal content

  modalContent.appendChild(nameFieldset);
  modalContent.appendChild(glyphFieldset);

  // Switch between keyboard & custom containers
  keyboardRadio.addEventListener("change", function () {
    if (keyboardRadio.checked) {
      keyboardContainer.style.display = "block";
      customContainer.style.display = "none";
    }
  });
  customRadio.addEventListener("change", function () {
    if (customRadio.checked) {
      keyboardContainer.style.display = "none";
      customContainer.style.display = "block";
    }
  });

  // Launch glyph editor
  drawGlyphButton.addEventListener("click", function () {
    const glyphModalContent = document.createElement("div");
    glyphModalContent.style.display = "flex";
    glyphModalContent.style.flexDirection = "column";
    glyphModalContent.style.alignItems = "center";
    glyphModalContent.style.justifyContent = "flex-start";
    glyphModalContent.style.height = "100%";
    glyphModalContent.style.width = "100%";
    glyphModalContent.style.padding = "10px";
    glyphModalContent.style.boxSizing = "border-box";

    const toolbar = document.createElement("div");
    toolbar.id = "buttonContainer";  
    toolbar.style.display = "flex";
    toolbar.style.gap = "10px";
    toolbar.style.marginBottom = "10px";
    toolbar.style.justifyContent = "center";
    glyphModalContent.appendChild(toolbar);

    const glyphEditorDiv = document.createElement("div");
    glyphEditorDiv.id = "glyphEditorContainer_" + Math.random().toString(36).substr(2, 9);
    glyphEditorDiv.style.width = "100%";
    glyphEditorDiv.style.height = "=100%";
    glyphEditorDiv.style.background = "#fff";
    glyphModalContent.appendChild(glyphEditorDiv);

    const glyphModal = new WinBox({
      title: "Glyph Editor",
      modal: false,
      width: "900px",
      height: "900px",
      x: "center",
      y: "center",
      mount: glyphModalContent,
      onfocus: function () { this.setBackground("#444"); }
    });

    const glyphEditor = new GlyphEditor(glyphEditorDiv.id, {
      resolution: 64,
      editable: true,
      outputVisible: false,
      hideControls: true,
      onChange: function (compressed) {}
    });

    if (isEdit && data.glyph) {
      try {
        glyphEditor.loadGlyph(data.glyph, true);
      } catch (e) {
        console.error("Error loading glyph:", e);
      }
    }

    setTimeout(() => {
      const autoControls = document.querySelector('[id^="GlpHcontrols_"]');
      if (autoControls) autoControls.remove();
    }, 0);

    const clearBtn = createButton({
      text: "Clear",
      styles: { padding: "6px 12px" },
      onClick: () => glyphEditor.clear()
    });
    toolbar.appendChild(clearBtn);

    const undoBtn = createButton({
      text: "Undo",
      styles: { padding: "6px 12px" },
      onClick: () => glyphEditor.undo()
    });
    toolbar.appendChild(undoBtn);

    const redoBtn = createButton({
      text: "Redo",
      styles: { padding: "6px 12px" },
      onClick: () => glyphEditor.redo()
    });
    toolbar.appendChild(redoBtn);

    const saveGlyphBtn = createButton({
      text: "Save Glyph",
      styles: { padding: "6px 12px" },
      onClick: function () {
        glyphOutput.textContent = glyphEditor.getCompressed();
        glyphModal.close();
      }
    });
    toolbar.appendChild(saveGlyphBtn);
  });

  // Buttons at bottom
  const btnDivScript = document.createElement("div");
  btnDivScript.id = "buttonContainer";
  btnDivScript.style.alignSelf = "flex-end";
  btnDivScript.style.display = "flex";
  btnDivScript.style.gap = "10px";
  btnDivScript.style.marginTop = "10px";

  // Confirm Character button with icon
  const okBtnScript = createButton({
    text: " Confirm Character", // space for icon padding
    title: "Confirm new character",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#007bff",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      const inputMethod = document.querySelector('input[name="glyphMethod"]:checked').value;
      const character = (inputMethod === "keyboard") ? kbInput.value.trim() : glyphOutput.textContent.trim();

      if (!charNameInput.value.trim()) {
        showModal("Error", "Character name is required.");
        return;
      }
      if (!character) {
        showModal("Error", "Glyph input is required.");
        return;
      }
      modal.close();
      callback({ character: charNameInput.value.trim(), glyph: character, method: inputMethod });
    }
  });

  // Add iconify icon for the confirm button
  const okIcon = document.createElement("span");
  okIcon.classList.add("iconify");
  okIcon.dataset.icon = "mdi:check-circle";
  okIcon.style.verticalAlign = "middle";
  okIcon.style.marginRight = "5px";
  okBtnScript.prepend(okIcon);

  btnDivScript.appendChild(okBtnScript);

  // Discard changes button with icon
  const cancelBtnScript = createButton({
    text: " Discard changes",
    title: "Discard changes",
    styles: {
      padding: "8px 16px",
      border: "none",
      backgroundColor: "#6c757d",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () { modal.close(); }
  });

  // Add iconify icon for the discard button
  const cancelIcon = document.createElement("span");
  cancelIcon.classList.add("iconify");
  cancelIcon.dataset.icon = "mdi:cancel";
  cancelIcon.style.verticalAlign = "middle";
  cancelIcon.style.marginRight = "5px";
  cancelBtnScript.prepend(cancelIcon);

  btnDivScript.appendChild(cancelBtnScript);

  modalContent.appendChild(btnDivScript);

  const modal = createModal("Add Script Character", modalContent, "35%", "45%");
}
function createScriptCharacterRow(item) {
  const tr = document.createElement("tr");
  tr.style.borderBottom = "1px solid #ccc";

  const tdChar = document.createElement("td");
  tdChar.style.padding = "5px";
  const charSpan = document.createElement("span");
  charSpan.textContent = item.character;
  tdChar.appendChild(charSpan);
  tr.appendChild(tdChar);

  const tdGlyph = document.createElement("td");
  tdGlyph.style.padding = "5px";
  tdGlyph.style.fontFamily = "monospace";

  if (item.method !== "keyboard") {
    // Show small preview
    const glyphWrapper = document.createElement("div");
    glyphWrapper.style.height = "90px";
    glyphWrapper.style.width = "auto";
    glyphWrapper.style.overflow = "hidden";
    tdGlyph.appendChild(glyphWrapper);

    const glyphContainer = document.createElement("div");
    const containerId = "glyphContainer-" + Math.random().toString(36).substr(2, 9);
    glyphContainer.id = containerId;
    glyphContainer.style.transform = "scale(0.125)";
    glyphContainer.style.transformOrigin = "top left";
    glyphContainer.style.width = "640px";
    glyphContainer.style.height = "640px";
    glyphWrapper.appendChild(glyphContainer);

    initializeGlyphEditor(containerId, item.glyph, tdGlyph);
  } else {
    tdGlyph.textContent = item.glyph || "";
    tdGlyph.style.fontSize = "50px";
    tdGlyph.style.fontWeight = "bold";
  }

  tr.appendChild(tdGlyph);

  const tdActions = document.createElement("td");
  tdActions.style.padding = "5px";
  tdActions.style.textAlign = "right";
  tdActions.style.position = "relative"; // make container relative

  const editBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:pencil-outline'></span>",
    title: "Edit character",
    styles: {
      border: "none",
      backgroundColor: "#ffc107",
      color: "white",
      borderRadius: "4px",
      position: "absolute",
      right: "55px",
      top: "10px"
    },
    onClick: function () {
      promptForScriptCharacter(function (newData) {
        newData.character = newData.character || item.character;
        newData.glyph = newData.glyph || item.glyph;
        newData.method = newData.method || item.method;
        Object.assign(item, newData);
        charSpan.textContent = item.character;
        if (item.method !== "keyboard") {
          tdGlyph.innerHTML = "";
          const glyphWrapper = document.createElement("div");
          glyphWrapper.style.height = "90px";
          glyphWrapper.style.width = "auto";
          glyphWrapper.style.overflow = "hidden";
          tdGlyph.appendChild(glyphWrapper);
          const glyphContainer = document.createElement("div");
          const containerId = "glyphContainer-" + Math.random().toString(36).substr(2, 9);
          glyphContainer.id = containerId;
          glyphContainer.style.transform = "scale(0.125)";
          glyphContainer.style.transformOrigin = "top left";
          glyphContainer.style.width = "640px";
          glyphContainer.style.height = "640px";
          glyphWrapper.appendChild(glyphContainer);
          initializeGlyphEditor(containerId, item.glyph, tdGlyph);
        } else {
          tdGlyph.style.fontSize = "50px";
          tdGlyph.style.fontWeight = "bold";
          tdGlyph.textContent = item.glyph || "";
        }
        updatePhonologyMain();
      }, { isEdit: true, data: item });
    }
  });

  const deleteBtn = createButton({
    innerHTML: "<span class='iconify' data-icon='mdi:trash-can-outline'></span>",
    title: "Delete character",
    styles: {
      border: "none",
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "4px",
      position: "absolute",
      right: "5px",
      top: "10px"
    },
    onClick: function () {
      showModal("Confirm Delete", `Delete character "${item.character}"?`, function () {
        const idx = projectData.phonology.script.indexOf(item);
        if (idx !== -1) projectData.phonology.script.splice(idx, 1);
        tr.remove();
        updatePhonologyMain();
      });
    }
  });

  tdActions.appendChild(editBtn);
  tdActions.appendChild(deleteBtn);
  tr.appendChild(tdActions);

  return tr;
}

function addScriptCharacter() {
  ensurePhonologyInitialized();
  promptForScriptCharacter(function (data) {
    projectData.phonology.script.push(data);
    const tr = createScriptCharacterRow(data);
    document.getElementById("scriptList").appendChild(tr);
    updatePhonologyMain();
  });
}

// ----- NEW: Customize Alphabet Modal -----
// Opens a separate spinner modal until the Customize Alphabet container is fully loaded.
function openCustomizeAlphabetModal() {
  const container = document.getElementById("customizeAlphabetContainer");
  if (!container) return;
  
  // Create a spinner modal
  const spinnerContent = document.createElement("div");
  spinnerContent.style.display = "flex";
  spinnerContent.style.alignItems = "center";
  spinnerContent.style.justifyContent = "center";
  spinnerContent.style.height = "100%";
spinnerContent.innerHTML = `
  <div class="spinner-container">
    <div class="spinner"></div>
    <div class="spinner-text">Please wait...</div>
  </div>
`;
  const spinnerModal = createModal("Loading", spinnerContent, "200px", "200px", true);
  
  // Detach the container from its parent and show it
  container.parentNode.removeChild(container);
  container.style.display = "block";
  
  // Asynchronously load the script rows into the container
  setTimeout(() => {
    const scriptList = container.querySelector("#scriptList");
    if (scriptList) {
      scriptList.innerHTML = "";
      projectData.phonology.script.forEach(item => {
        const tr = createScriptCharacterRow(item);
        scriptList.appendChild(tr);
      });
    }
    // Close the spinner modal and then open the Customize Alphabet modal
    spinnerModal.close();
    const modal = createModal("Customize Alphabet", container, "70%", "80%");
    modal.onclose = function() {
      container.style.display = "none";
      document.body.appendChild(container);
    };
  }, 1000);
}

// ----- PHONOLOGY AGENT HTML & OPEN FUNCTION -----
const phonologyHTML = `
<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; padding: 10px;">
  <div id="phonologyTabBar" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1rem; padding: 10px;">
    ${
      [
        { tab: "inventory",   label: "Phoneme Inventory", icon: "mdi:format-list-bulleted", tooltip: "Manage your conlang’s individual phonemes." },
        { tab: "syllables",   label: "Syllable Structure", icon: "mdi:alpha-c-circle-outline", tooltip: "Design and arrange syllable patterns (onset, nucleus, coda)." },
        { tab: "phonotactics",label: "Phonotactic Rules",  icon: "mdi:account-cog-outline",    tooltip: "Set constraints and rules for sound combinations." },
        { tab: "script",      label: "Script",             icon: "mdi:alphabetical",           tooltip: "Design your conlang’s writing system (letters/symbols)." },
        { tab: "all",         label: "All Phonology",      icon: "mdi:script-text-outline",    tooltip: "Review the complete phonological data." }
      ]
      .map(({ tab, label, icon, tooltip }) => `
        <button type="button" class="phonology-tab-btn" data-tab="${tab}"
          style="padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; text-decoration: underline;"
          title="${tooltip}"
        >
          <span class="iconify" data-icon="${icon}"></span> ${label}
        </button>
      `)
      .join('')
    }
  </div>
  <div id="phonologyContentContainer" style="border: 1px solid #ccc; padding: 1.2rem; border-radius: 6px; position: relative; flex:1; overflow-y:auto; overflow-x:hidden;">
    <div id="phonologyDefault" style="position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); text-align: center; color: #888;">
      <span class="iconify" data-icon="mdi:information-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></span>
      Click on a tab to modify
    </div>
    <!-- Phoneme Inventory Tab -->
    <div class="phonology-tab" id="phonTab-inventory" style="display:none;">
      <h3>Phoneme Inventory</h3>
      <div style="margin-bottom:10px;">
        <button type="button" onclick="addPhoneme()" style="padding: 6px 12px; border: none; border-radius:4px; background:#007bff; color:white; cursor:pointer;" title="Click to add a new phoneme.">Add Phoneme</button>
      </div>
      <input type="text" id="phonemeSearch" oninput="filterPhonemes()" placeholder="Search phonemes..." style="margin-bottom:10px; padding: 6px; width: 100%; box-sizing: border-box;">
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Symbol</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">IPA</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Description</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Category</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Features</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Romanization</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">&nbsp;</th>
            <th style="border-bottom:1px solid #ccc; text-align:right; padding:5px;">Actions</th>
          </tr>
        </thead>
        <tbody id="inventoryList"></tbody>
      </table>
    </div>
    <!-- Syllable Structure Tab -->
    <div class="phonology-tab" id="phonTab-syllables" style="display:none;">
      <h3>Syllable Structure</h3>
      <div style="margin-bottom:10px;">
        <button type="button" onclick="addSyllablePattern()" style="padding: 6px 12px; border: none; border-radius:4px; background:#007bff; color:white; cursor:pointer;" title="Click to add a new syllable pattern.">Add Syllable Pattern</button>
      </div>
      <ul id="syllableList" style="list-style:none; padding:0;"></ul>
    </div>
    <!-- Phonotactic Rules Tab -->
    <div class="phonology-tab" id="phonTab-phonotactics" style="display:none;">
      <h3>Phonotactic Rules</h3>
      <div style="margin-bottom:10px;">
        <button type="button" onclick="addPhonotacticRule()" style="padding: 6px 12px; border: none; border-radius:4px; background:#007bff; color:white; cursor:pointer;" title="Click to add a new phonotactic rule.">Add Phonotactic Rule</button>
       
        </div>
      <ul id="phonotacticList" style="list-style:none; padding:0;"></ul>
    </div>
    <!-- Script Tab -->
    <div class="phonology-tab" id="phonTab-script" style="display:none;">
      <h3>Script Characters</h3>
      <div style="margin-top:20px; padding:10px; border: 1px solid #ccc; border-radius:6px;">
        <label for="scriptPresetSelect">Initialize with a preset writing system:</label>
        <select id="scriptPresetSelect" style="margin-left:10px;">
          <option value="">-- Select a Preset --</option>
          <option value="Latin">Latin</option>
          <option value="Greek">Greek</option>
          <option value="Cyrillic">Cyrillic</option>
          <option value="Hebrew">Hebrew</option>
          <option value="Arabic">Arabic</option>
          <option value="Devanagari">Devanagari</option>
          <option value="Hangul">Hangul</option>
          <option value="Armenian">Armenian</option>
          <option value="Georgian">Georgian</option>
          <option value="Hiragana">Hiragana</option>
          <option value="Katakana">Katakana</option>
        </select>
        <button onclick="initializeSelectedPreset()" style="margin-left:10px; padding: 4px 8px;">Load Preset</button>
      </div>
      <div style="margin-bottom:10px; padding-top:20px; display: flex; gap: 10px;">
        <button type="button" onclick="addScriptCharacter()" style="padding: 6px 12px; border: none; border-radius:4px; background:#007bff; color:white; cursor:pointer;" title="Click to add a new script character.">Add Character</button>
        <button type="button" onclick="openCustomizeAlphabetModal()" style="padding: 6px 12px; border: none; border-radius:4px; background:#28a745; color:white; cursor:pointer;" title="Customize Alphabet">Customize Alphabet</button>
      </div>
    </div>
    <!-- All Phonology Tab -->
    <div class="phonology-tab" id="phonTab-all" style="display:none;">
      <h3>All Phonology</h3>
      <textarea id="phonologyMain" readonly style="height:300px; width:100%; overflow-y:auto; white-space:pre-wrap; padding:10px; border:1px solid #ccc; border-radius:6px; box-sizing:border-box; margin:0; resize:vertical;" placeholder="All phonological data will appear here..."></textarea>
    </div>
  </div>
<!-- Footer: Save, Load, Copy, Clear Buttons -->
<div id="buttonContainer" style="margin-top:10px;">
  <button type="button" onclick="savePhonologyData()" title="Save session" style="padding: 8px 14px; border: none; border-radius:4px; background:#007bff; color:white;">
    Save
  </button>
  <button type="button" onclick="loadPhonologyData()" title="Load session" style="padding: 8px 14px; border: none; border-radius:4px; background:#007bff; color:white;">
    Load
  </button>
  <button type="button" onclick="copyPhonologyData()" title="Copy session data" style="padding: 8px 14px; border: none; border-radius:4px; background:#28a745; color:white;">
    Copy
  </button>
  <button type="button" onclick="clearPhonologyData()" title="Clear all data" style="padding: 8px 14px; border: none; border-radius:4px; background:#dc3545; color:white;">
    Clear
  </button>
</div>
</div>
`;

/**
 * Open the main Phonology Agent window.
 */
function openPhonologyAgent() {
  // Create the hidden container for the Customize Alphabet modal if it doesn't exist
  if (!document.getElementById("customizeAlphabetContainer")) {
    const custContainer = document.createElement("div");
    custContainer.id = "customizeAlphabetContainer";
    custContainer.style.display = "none";
    custContainer.innerHTML = `
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Character</th>
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Glyph</th>
            <th style="border-bottom:1px solid #ccc; text-align:right; padding:5px;">Actions</th>
          </tr>
        </thead>
        <tbody id="scriptList"></tbody>
      </table>
    `;
    document.body.appendChild(custContainer);
  }

  // Create a new WinBox with a 50% width/height and centered position
  createWinBox(
    "Phonology Agent",
    phonologyHTML,
    function (container) {
      container.querySelectorAll(".phonology-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectPhonologyTab(btn.dataset.tab);
        });
      });
      const storedData = sessionStorage.getItem("phonologyProjectData");
      if (storedData) {
        try {
          projectData.phonology = JSON.parse(storedData);
          projectData.phonology.inventory    = projectData.phonology.inventory    || [];
          projectData.phonology.syllables    = projectData.phonology.syllables    || [];
          projectData.phonology.phonotactics = projectData.phonology.phonotactics || [];
          projectData.phonology.script       = projectData.phonology.script       || [];

          projectData.phonology.inventory.forEach(item => {
            const tr = createPhonemeRow(item);
            container.querySelector("#inventoryList").appendChild(tr);
          });
          projectData.phonology.syllables.forEach(item => {
            const li = createSyllablePatternRow(item);
            container.querySelector("#syllableList").appendChild(li);
          });
          projectData.phonology.phonotactics.forEach(item => {
            const li = createPhonotacticRuleRow(item);
            container.querySelector("#phonotacticList").appendChild(li);
          });
          // Update the hidden customize alphabet container for script characters
          projectData.phonology.script.forEach(item => {
            const tr = createScriptCharacterRow(item);
            document.getElementById("scriptList").appendChild(tr);
          });
        } catch (e) {
          console.warn("Could not parse phonology session data:", e);
        }
      }
      const storedText = sessionStorage.getItem("phonologyMain");
      if (storedText) {
        const ta = container.querySelector("#phonologyMain");
        if (ta) ta.value = storedText;
      }
    }
  );
}
  /* Save the phonology data as an XML file */
  function savePhonologyData() {
    let conlangName = sessionStorage.getItem("clng_name");
    if (!conlangName || conlangName.trim() === "") {
      conlangName = "untitled";
    }
    const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <phonology>${JSON.stringify(projectData.phonology)}</phonology>
</conlang>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const filename = conlangName + "_phonology.clng";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  /* Load phonology data from an XML file */
  function loadPhonologyData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".clng";
    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
          const phonologyText = xmlDoc.getElementsByTagName("phonology")[0].textContent;
          projectData.phonology = JSON.parse(phonologyText);
          updatePhonologyMain();
        } catch (err) {
          showModal("Error", "Failed to load phonology data.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /* Copy the current phonology summary to clipboard */
  function copyPhonologyData() {
    const ta = document.getElementById("phonologyMain");
    if (!ta) return;
    navigator.clipboard.writeText(ta.value).then(() => {
      showModal("Success", "Phonology data copied to clipboard!");
    }, () => {
      showModal("Error", "Failed to copy phonology data!");
    });
  }

  /* Clear all phonology data after confirmation */
  function clearPhonologyData() {
    const modalContent = document.createElement("div");
    modalContent.style.padding = "10px";
    modalContent.style.display = "flex";
    modalContent.style.flexDirection = "column";
    modalContent.style.alignItems = "center";
    modalContent.style.justifyContent = "center";
    modalContent.style.textAlign = "center";
  
    const iconSpan = document.createElement("span");
    iconSpan.className = "iconify";
    iconSpan.dataset.icon = "mdi:alert-circle-outline";
    iconSpan.style.fontSize = "48px";
    iconSpan.style.marginBottom = "10px";
    modalContent.appendChild(iconSpan);
  
    const message = document.createElement("p");
    message.textContent = "Are you sure you want to clear all phonology data?";
    message.style.margin = "10px 0";
    modalContent.appendChild(message);
  
    const buttonsDiv = document.createElement("div");
    buttonsDiv.style.marginTop = "10px";
    buttonsDiv.style.display = "flex";
    buttonsDiv.style.justifyContent = "center";
    buttonsDiv.style.gap = "10px";
  
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Yes, Clear";
    confirmBtn.style.padding = "8px 16px";
    confirmBtn.style.border = "none";
    confirmBtn.style.backgroundColor = "#dc3545";
    confirmBtn.style.color = "white";
    confirmBtn.style.borderRadius = "4px";
    confirmBtn.onclick = function () {
      // Clear all phonology data in projectData
      projectData.phonology.inventory = [];
      projectData.phonology.syllables = [];
      projectData.phonology.phonotactics = [];
      projectData.phonology.script = [];
  
      // Clear DOM lists
      document.getElementById("inventoryList").innerHTML = "";
      document.getElementById("syllableList").innerHTML = "";
      document.getElementById("phonotacticList").innerHTML = "";
      const scriptListElem = document.getElementById("scriptList");
      if (scriptListElem) {
        scriptListElem.innerHTML = "";
      }
  
      // Update the summary text area
      updatePhonologyMain();
  
      // Close the confirmation modal
      modal.close();
    };
    buttonsDiv.appendChild(confirmBtn);
  
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.padding = "8px 16px";
    cancelBtn.style.border = "none";
    cancelBtn.style.backgroundColor = "#6c757d";
    cancelBtn.style.color = "white";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.onclick = function () {
      modal.close();
    };
    buttonsDiv.appendChild(cancelBtn);
  
    modalContent.appendChild(buttonsDiv);
  
    const modal = createModal("Confirm Clear", modalContent, "300px", "200px", true);
  }

function onClick() {
  // Ensure toneMappingInput is defined and accessible in this scope
  var toneMappingInput = document.getElementById("toneMapping"); // Or however you get the input

  if (!toneMappingInput) {
    console.error("toneMappingInput is not found!");
    return;
  }

  let mapping = toneMappingInput.value;
  let rules = parseToneSandhiRules(mapping);
  if (rules) {
    currentRules = rules;
    displayToneSandhiRules();
  } else {
    alert("Invalid tone sandhi rules.");
  }
}
function reloadPhonologyFromSession() {
  // 1. Grab stored data
  const stored = sessionStorage.getItem("phonologyProjectData");
  if (!stored) {
    console.warn("No phonology data found in sessionStorage.");
    return;
  }

  // 2. Parse and assign to projectData
  try {
    const loadedPhonology = JSON.parse(stored);
    projectData.phonology = loadedPhonology;
  } catch (err) {
    console.error("Failed to parse stored phonology data:", err);
    return;
  }

  // 3. Call updatePhonologyMain to rebuild “All Phonology” text area and re-sync session
  updatePhonologyMain();

  // 4. If you also maintain any separate lists/tables in the DOM 
  //    (e.g., a rule list or a script list), refresh those too:
  const phonotacticListElem = document.getElementById("phonotacticList");
  if (phonotacticListElem) {
    phonotacticListElem.innerHTML = "";
    projectData.phonology.phonotactics.forEach(rule => {
      // add code to create UI rows (if you have a function like createPhonotacticRuleRow, call it here)
      // e.g. phonotacticListElem.appendChild(createPhonotacticRuleRow(rule));
    });
  }
}
/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();



