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

  const message = document.createElement("p");
  message.textContent = `Are you sure you want to initialize with the ${presetName} preset? This will overwrite your existing script characters.`;
  modalContent.appendChild(message);

  const btnDiv = document.createElement("div");
  btnDiv.style.marginTop = "10px";
  btnDiv.style.display = "flex";
  btnDiv.style.gap = "10px";

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

  btnDiv.appendChild(confirmBtn);
  btnDiv.appendChild(cancelBtn);
  modalContent.appendChild(btnDiv);

  const modal = createModal("Confirm Preset Initialization", modalContent, "40%", "25%");
}

function initializeSelectedPreset() {
  const selectElem = document.getElementById("scriptPresetSelect");
  const presetName = selectElem.value;
  if (presetName) {
    initializeScriptPreset(presetName);
  } else {
    alert("Please select a preset.");
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
    summaryLines.push(`    Audio: ${p.audio || "None"}`);
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
  const data = options.data || { symbol: "", ipa: "", description: "", category: "", features: [], romanization: "", audio: "" };

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

  modalRoot.appendChild(coreContainer);3


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
  "ɒ": {voiced:true,voiceless:false,nasal:false,stop:false,fricative:false,affricate:false,high:false,mid:false,low:true,front:false,central:false,back:true,rounded:true,unrounded:false,aspirated:false,lateral:false,approximant:false,flap:false,trill:false,glottal:false,tense:false},
}

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

  
function SelectedIPA() {
  if (document.getElementById("verifyIPA").checked) {
     const selectedIPA = (ipaSelect.value === "Other")
      ? ipaOverride.value.trim()
      : ipaSelect.value;
        
    if (ipaSelect.value === ""){
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

  //face helper function
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
    const checkboxIds = ["FcE_voiced", "FcE_voiceless", "FcE_nasal", "FcE_stop", "FcE_fricative", "FcE_affricate", "FcE_high", "FcE_mid", "FcE_low", "FcE_front", "FcE_central", "FcE_back", "FcE_rounded", "FcE_unrounded", "FcE_aspirated", "FcE_lateral", "FcE_approximant", "FcE_flap", "FcE_trill", "FcE_glottal", "FcE_tense"];
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
  
const facePhonoWrap = document.createElement("div");
facePhonoWrap.style.width = "80%";
facePhonoWrap.style.border = "1px solid #ccc";
facePhonoWrap.style.borderRadius = "6px";
facePhonoWrap.style.padding = "10px";
facePhonoWrap.style.marginBottom = "10px";

  const facecontainer = document.createElement("div");
  facecontainer.id = "face-container";
  
  modalRoot.appendChild(facecontainer);

  const featuresLabel = document.createElement("div");
  featuresLabel.innerHTML = "<strong>Phonological Features:</strong>";
  featuresLabel.title = "Select features that describe how this phoneme is articulated.";
  featuresLabel.style.alignSelf = "flex-start";
  modalRoot.appendChild(featuresLabel);

  const featuresContainer = document.createElement("div");
  featuresContainer.style.border = "1px solid #ccc";
  featuresContainer.style.padding = "30px";
  featuresContainer.style.width = "80%";
  featuresContainer.style.display = "flex";
  featuresContainer.style.flexWrap = "wrap";
  featuresContainer.style.gap = "10px";

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

    // Use "FcE_" prefix so the face code can find them (IDs in face.html use, e.g., FcE_voiced)
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = opt.value;
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


modalRoot.appendChild(featuresContainer);
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

  // Audio Sample Field
  const audioLabel = document.createElement("div");
  audioLabel.innerHTML = "<strong>Audio Sample:</strong>";
  audioLabel.title = "Optional audio sample for the phoneme";
  audioLabel.style.alignSelf = "flex-start";
  modalRoot.appendChild(audioLabel);

  const audioInput = document.createElement("input");
  audioInput.type = "file";
  audioInput.accept = "audio/*";
  audioInput.style.width = "80%";
  modalRoot.appendChild(audioInput);


  // Independent Buttons Container styled similar to style.css
  const btnDiv = document.createElement("div");
  btnDiv.style.display = "flex"; 
  btnDiv.style.padding = "0";          // Remove internal padding
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
      audioInput.value = "";
      // Reset error messages
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
      let audio = null;
      if (audioInput.files && audioInput.files[0]) {
        audio = audioInput.files[0].name;
      }

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
      callback({ symbol, ipa, description, category, features, romanization, audio });
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
    onClick: function () { modal.close(); }
  });
  btnDiv.appendChild(cancelBtn);

  modalRoot.appendChild(btnDiv);

  const modal = createModal(
    isEdit ? "Edit Phoneme" : "Add New Phoneme",
    modalRoot,
    "35%",
    "75%"
  );




  // Delay adding face event listeners until after modal content is rendered
  requestAnimationFrame(() => {
  });
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

  const tdAudio = document.createElement("td");
  tdAudio.textContent = item.audio || "None";
  tdAudio.style.padding = "5px";

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
  tr.appendChild(tdAudio);
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
function promptForPhonotacticRule(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "10px";
  
  const header = document.createElement("h2");
  header.textContent = "Select Rule Type";
  modalContent.appendChild(header);
  
  // Create a radio group for the five rule categories.
  const ruleTypes = [
    "Phoneme Frequencies",
    "Illegal Combinations",
    "Vowel Probabilities",
    "Vowel Tones",
    "Stress Pattern",
    "Consonant Cluster Constraints",
    "Vowel/Consonant Harmony",
    "Syllable Boundary / Sonority Hierarchy",
    "Allophonic Rules",
    "Tone Sandhi"
  ];
  const radioGroup = document.createElement("div");
  radioGroup.style.display = "flex";
  radioGroup.style.flexDirection = "column";
  ruleTypes.forEach(rt => {
    const label = document.createElement("label");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "ruleType";
    radio.value = rt;
    if(rt === ruleTypes[0]) radio.checked = true;
    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + rt));
    radioGroup.appendChild(label);
  });
  modalContent.appendChild(radioGroup);
  
  const nextBtn = createButton({
    text: "Next",
    title: "Next",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#007bff", color: "white", borderRadius: "4px" },
    onClick: function () {
      const selectedType = modalContent.querySelector('input[name="ruleType"]:checked').value;
      modal.close();
      promptForPhonotacticRuleDetails(selectedType);
    }
  });
  modalContent.appendChild(nextBtn);
  
  const modal = createModal("Select Rule Type", modalContent, "35%", "35%");
}

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
  
  // NEW: Rule Name Input; prefill if existingData provided, default to ruleType
  const ruleNameLabel = document.createElement("div");
  ruleNameLabel.innerHTML = "<strong>Rule Name:</strong>";
  ruleNameLabel.title = "Enter a custom name for this rule";
  modalContent.appendChild(ruleNameLabel);
  
  const ruleNameInput = document.createElement("input");
  ruleNameInput.type = "text";
  ruleNameInput.placeholder = "Enter rule name";
  ruleNameInput.style.width = "80%";
  // Set default name to ruleType if none provided
  if (existingData && existingData.name) {
    ruleNameInput.value = existingData.name;
  } else {
    ruleNameInput.value = ruleType;
  }
  modalContent.appendChild(ruleNameInput);
  
  let detailContainer = document.createElement("div");
  detailContainer.style.width = "100%";
  
  // Dynamically add UI fields based on ruleType.
  if (ruleType === "Phoneme Frequencies") {
    ["Fast Dropoff", "Medium Dropoff", "Equiprobable"].forEach(option => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "freqOption";
      radio.value = option;
      if (existingData && existingData.frequency === option) {
        radio.checked = true;
      } else if (!existingData && option === "Medium Dropoff") {
        radio.checked = true;
      }
      label.appendChild(radio);
      label.appendChild(document.createTextNode(" " + option));
      detailContainer.appendChild(label);
    });
  } else if (ruleType === "Illegal Combinations") {
  
    const textarea = document.createElement("textarea");
    textarea.placeholder = "Enter custom illegal sequences";
    textarea.style.width = "100%";
    textarea.style.height = "80px";
    if(existingData && existingData.illegalSequences) {
      textarea.value = existingData.illegalSequences;
    }
    detailContainer.appendChild(textarea);
    const banVowel = document.createElement("input");
    banVowel.type = "checkbox";
    if(existingData && existingData.banSameVowel) banVowel.checked = true;
    const banVowelLabel = document.createElement("label");
    banVowelLabel.appendChild(banVowel);
    banVowelLabel.appendChild(document.createTextNode(" Ban same vowel twice in a row"));
    detailContainer.appendChild(banVowelLabel);
    const banSyllable = document.createElement("input");
    banSyllable.type = "checkbox";
    if(existingData && existingData.banSameSyllable) banSyllable.checked = true;
    const banSyllableLabel = document.createElement("label");
    banSyllableLabel.appendChild(banSyllable);
    banSyllableLabel.appendChild(document.createTextNode(" Ban same syllable twice in a row"));
    detailContainer.appendChild(banSyllableLabel);
  } else if (ruleType === "Vowel Probabilities") {
    const startLabel = document.createElement("label");
    startLabel.textContent = "Vowel at start of word (%):";
    const startInput = document.createElement("input");
    startInput.type = "number";
    startInput.min = "0";
    startInput.max = "100";
    startInput.value = (existingData && existingData.vowelAtStart) || "50";
    detailContainer.appendChild(startLabel);
    detailContainer.appendChild(startInput);
    const endLabel = document.createElement("label");
    endLabel.textContent = "Vowel at end of word (%):";
    const endInput = document.createElement("input");
    endInput.type = "number";
    endInput.min = "0";
    endInput.max = "100";
    endInput.value = (existingData && existingData.vowelAtEnd) || "50";
    detailContainer.appendChild(endLabel);
    detailContainer.appendChild(endInput);
  } else if (ruleType === "Vowel Tones") {
    const toneOptions = ["Extra High", "High", "Mid", "Low", "Extra Low", "Rising", "Falling"];
    toneOptions.forEach(option => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = option;
      checkbox.id = "tone_" + option.replace(/\s+/g, "").toLowerCase();
      if(existingData && existingData.tones && existingData.tones.includes(option)) {
        checkbox.checked = true;
      }
      const label = document.createElement("label");
      label.htmlFor = checkbox.id;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + option));
      detailContainer.appendChild(label);
    });
  } else if (ruleType === "Stress Pattern") {
    const presets = ["Primary stress on first syllable", "Primary stress on last syllable", "Primary stress on penultimate syllable"];
    const presetContainer = document.createElement("div");
    presetContainer.style.display = "flex";
    presetContainer.style.flexDirection = "column";
    presets.forEach(option => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "stressPreset";
      radio.value = option;
      if(existingData && existingData.preset === option) {
        radio.checked = true;
      } else if(!existingData && option === presets[0]) {
        radio.checked = true;
      }
      label.appendChild(radio);
      label.appendChild(document.createTextNode(" " + option));
      presetContainer.appendChild(label);
    });
    detailContainer.appendChild(presetContainer);
    const customLabel = document.createElement("div");
    customLabel.textContent = "Or enter custom stress pattern:";
    detailContainer.appendChild(customLabel);
    const customStress = document.createElement("textarea");
    customStress.placeholder = "Custom stress pattern";
    customStress.style.width = "100%";
    customStress.style.height = "60px";
    if(existingData && existingData.customPattern) {
      customStress.value = existingData.customPattern;
    }
    detailContainer.appendChild(customStress);
  }

  else if (ruleType === "Consonant Cluster Constraints") {
    const modeLabel = document.createElement("div");
    modeLabel.innerHTML = "<strong>Mode Selector:</strong>";
    detailContainer.appendChild(modeLabel);
    
    const modeRadioOnset = document.createElement("input");
    modeRadioOnset.type = "radio";
    modeRadioOnset.name = "clusterMode";
    modeRadioOnset.value = "Onset";
    modeRadioOnset.checked = true;
    const modeOnsetLabel = document.createElement("label");
    modeOnsetLabel.appendChild(modeRadioOnset);
    modeOnsetLabel.appendChild(document.createTextNode(" Onset"));
    detailContainer.appendChild(modeOnsetLabel);
    
    const modeRadioCoda = document.createElement("input");
    modeRadioCoda.type = "radio";
    modeRadioCoda.name = "clusterMode";
    modeRadioCoda.value = "Coda";
    const modeCodaLabel = document.createElement("label");
    modeCodaLabel.appendChild(modeRadioCoda);
    modeCodaLabel.appendChild(document.createTextNode(" Coda"));
    detailContainer.appendChild(modeCodaLabel);
    
    const clusterRuleInput = document.createElement("input");
    clusterRuleInput.type = "text";
    clusterRuleInput.placeholder = "Enter allowed/forbidden cluster sequence";
    clusterRuleInput.style.width = "100%";
    detailContainer.appendChild(clusterRuleInput);
    
    const conflictWarning = document.createElement("div");
    conflictWarning.style.color = "red";
    conflictWarning.style.fontSize = "0.9em";
    conflictWarning.textContent = "Ensure there are no conflicting rules.";
    detailContainer.appendChild(conflictWarning);
  }
  else if (ruleType === "Vowel/Consonant Harmony") {
    const featureLabel = document.createElement("div");
    featureLabel.innerHTML = "<strong>Select Features:</strong>";
    detailContainer.appendChild(featureLabel);
    const features = ["Front", "Back", "High", "Low", "Rounded", "Unrounded", "Voiced", "Voiceless"];
    features.forEach(f => {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = f;
      cb.id = "harmony_" + f.toLowerCase();
      // Pre-check if existingData has harmonyFeatures array
      if(existingData && existingData.harmonyFeatures && existingData.harmonyFeatures.includes(f)){
          cb.checked = true;
      }
      detailContainer.appendChild(cb);
      const cbLabel = document.createElement("label");
      cbLabel.htmlFor = cb.id;
      cbLabel.appendChild(document.createTextNode(" " + f));
      detailContainer.appendChild(cbLabel);
    });
    const directionLabel = document.createElement("div");
    directionLabel.innerHTML = "<strong>Direction:</strong>";
    detailContainer.appendChild(directionLabel);
    const progressive = document.createElement("input");
    progressive.type = "radio"; 
    progressive.name = "harmonyDirection"; 
    progressive.value = "Progressive";
    if(existingData && existingData.harmonyDirection === "Regressive"){
      progressive.checked = false;
    } else {
      progressive.checked = true;
    }
    const progressiveLabel = document.createElement("label");
    progressiveLabel.appendChild(progressive);
    progressiveLabel.appendChild(document.createTextNode(" Progressive"));
    detailContainer.appendChild(progressiveLabel);
    const regressive = document.createElement("input");
    regressive.type = "radio"; 
    regressive.name = "harmonyDirection"; 
    regressive.value = "Regressive";
    if(existingData && existingData.harmonyDirection === "Regressive"){
      regressive.checked = true;
    }
    const regressiveLabel = document.createElement("label");
    regressiveLabel.appendChild(regressive);
    regressiveLabel.appendChild(document.createTextNode(" Regressive"));
    detailContainer.appendChild(regressiveLabel);
    const previewDiv = document.createElement("div");
    previewDiv.style.border = "1px dashed #aaa";
    previewDiv.style.padding = "5px";
    previewDiv.textContent = "Preview of harmony effect will appear here.";
    detailContainer.appendChild(previewDiv);
  }
  else if (ruleType === "Syllable Boundary / Sonority Hierarchy") {
    const sonorityLabel = document.createElement("div");
    sonorityLabel.innerHTML = "<strong>Sonority Ordering:</strong>";
    detailContainer.appendChild(sonorityLabel);
    const sonorityInput = document.createElement("textarea");
    sonorityInput.placeholder = "Enter sonority order (e.g., Stops, Fricatives, Nasals, Liquids, Glides, Vowels)";
    sonorityInput.style.width = "100%";
    sonorityInput.style.height = "60px";
    detailContainer.appendChild(sonorityInput);
    const constraintLabel = document.createElement("div");
    constraintLabel.innerHTML = "<strong>Constraints:</strong>";
    detailContainer.appendChild(constraintLabel);
    const minConsonants = document.createElement("input");
    minConsonants.type = "number";
    minConsonants.placeholder = "Min consonants per syllable";
    detailContainer.appendChild(minConsonants);
    const maxConsonants = document.createElement("input");
    maxConsonants.type = "number";
    maxConsonants.placeholder = "Max consonants per syllable";
    detailContainer.appendChild(maxConsonants);
    const graphDiv = document.createElement("div");
    graphDiv.style.border = "1px dashed #aaa";
    graphDiv.style.padding = "5px";
    graphDiv.textContent = "Syllable mapper visualization preview.";
    detailContainer.appendChild(graphDiv);
  }
  else if (ruleType === "Allophonic Rules") {
    const conditionLabel = document.createElement("div");
    conditionLabel.innerHTML = "<strong>Condition:</strong>";
    detailContainer.appendChild(conditionLabel);
    const conditionInput = document.createElement("input");
    conditionInput.type = "text";
    conditionInput.placeholder = "e.g., when /b/ is preceded by a nasal";
    conditionInput.style.width = "100%";
    detailContainer.appendChild(conditionInput);
    const resultLabel = document.createElement("div");
    resultLabel.innerHTML = "<strong>Result:</strong>";
    detailContainer.appendChild(resultLabel);
    const resultInput = document.createElement("input");
    resultInput.type = "text";
    resultInput.placeholder = "e.g., /b/ becomes [m]";
    resultInput.style.width = "100%";
    detailContainer.appendChild(resultInput);
    const dashboardDiv = document.createElement("div");
    dashboardDiv.style.border = "1px dashed #aaa";
    dashboardDiv.style.padding = "5px";
    dashboardDiv.textContent = "Manage allophonic rules here.";
    detailContainer.appendChild(dashboardDiv);
  }
  else if (ruleType === "Tone Sandhi") {
    const tableLabel = document.createElement("div");
    tableLabel.innerHTML = "<strong>Tonal Transformation Table:</strong>";
    detailContainer.appendChild(tableLabel);
    const toneMappingInput = document.createElement("textarea");
    toneMappingInput.placeholder = "Enter tone mappings, e.g., High+Low = Rising";
    toneMappingInput.style.width = "100%";
    toneMappingInput.style.height = "60px";
    if(existingData && existingData.toneMapping) toneMappingInput.value = existingData.toneMapping;
    detailContainer.appendChild(toneMappingInput);
    const toggleDiv = document.createElement("div");
    toggleDiv.innerHTML = "<strong>Activate Tone Sandhi:</strong>";
    detailContainer.appendChild(toggleDiv);
    const toggleCheckbox = document.createElement("input");
    toggleCheckbox.type = "checkbox";
    toggleCheckbox.checked = existingData ? existingData.toneSandhiActive : true;
    toggleDiv.appendChild(toggleCheckbox);
  }
  modalContent.appendChild(detailContainer);
  
  const confirmBtn = createButton({
    text: "Confirm",
    title: "Confirm rule details",
    styles: { padding: "8px 16px", border: "none", backgroundColor: "#28a745", color: "white", borderRadius: "4px" },
    onClick: function() {
      // Use user-provided rule name; if empty, default to ruleType.
      let ruleName = ruleNameInput.value.trim() || ruleType;
      let collectedData = { type: ruleType, name: ruleName };
      if (ruleType === "Phoneme Frequencies") {
        collectedData = Object.assign(collectedData, gatherPhonemeFreqData(detailContainer));
      } else if (ruleType === "Illegal Combinations") {
        collectedData = Object.assign(collectedData, gatherIllegalCombinationsData(detailContainer));
      } else if (ruleType === "Vowel Probabilities") {
        collectedData = Object.assign(collectedData, gatherVowelProbabilitiesData(detailContainer));
      } else if (ruleType === "Vowel Tones") {
        collectedData = Object.assign(collectedData, gatherVowelTonesData(detailContainer));
      } else if (ruleType === "Stress Pattern") {
        // Gather stress pattern: prefer preset if chosen or custom value otherwise.
        const preset = detailContainer.querySelector('input[name="stressPreset"]:checked');
        const custom = detailContainer.querySelector("textarea").value.trim();
        collectedData.stressPattern = (preset && preset.checked) ? preset.value : custom;
      }
      // --- Gather data for new rule types ---
      else if (ruleType === "Consonant Cluster Constraints") {
        collectedData.clusterMode = modalContent.querySelector('input[name="clusterMode"]:checked').value;
        collectedData.clusterSequence = clusterRuleInput.value.trim();
      }
      else if (ruleType === "Vowel/Consonant Harmony") {
        const harmonyFeatures = [];
        detailContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          if(cb.checked) harmonyFeatures.push(cb.value);
        });
        collectedData.harmonyFeatures = harmonyFeatures;
        collectedData.harmonyDirection = modalContent.querySelector('input[name="harmonyDirection"]:checked').value;
      }
      else if (ruleType === "Tone Sandhi") {
        collectedData.toneMapping = toneMappingInput.value.trim();
        collectedData.toneSandhiActive = toggleCheckbox.checked;
      }
      modal.close();
      if (existingData) {
        // Merge new data into existing rule
        Object.assign(existingData, collectedData);
        // Update the details property so the UI displays the new data
        existingData.details = JSON.stringify(collectedData);
        // If you also use a separate frequency property, update it explicitly:
        if (collectedData.frequency) {
          existingData.frequency = collectedData.frequency;
        }
        updatePhonologyMain();
        const phonList = document.getElementById("phonotacticList");
        if (phonList) {
          phonList.innerHTML = "";
          projectData.phonology.phonotactics.forEach(rule => {
            phonList.appendChild(createPhonotacticRuleRow(rule));
          });
        }
      } else {
        addPhonotacticRuleDirect(collectedData);
      }
    }
  });
  modalContent.appendChild(confirmBtn);
  
  const modal = createModal("Define: " + ruleType, modalContent, "40%", "50%");
}

// Helper functions to gather UI data

function gatherPhonemeFreqData(container) {
  const selected = container.querySelector('input[name="freqOption"]:checked');
  return { frequency: selected ? selected.value : null };
}

function gatherIllegalCombinationsData(container) {
  const textarea = container.querySelector("textarea");
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  return {
    illegalSequences: textarea.value.trim(),
    banSameVowel: checkboxes[0] ? checkboxes[0].checked : false,
    banSameSyllable: checkboxes[1] ? checkboxes[1].checked : false
  };
}

function gatherVowelProbabilitiesData(container) {
  const inputs = container.querySelectorAll('input[type="number"]');
  return {
    vowelAtStart: inputs[0] ? Number(inputs[0].value) : 0,
    vowelAtEnd: inputs[1] ? Number(inputs[1].value) : 0
  };
}
promptForPhonotacticRuleDetails
function gatherVowelTonesData(container) {
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const selectedTones = [];
  checkboxes.forEach(cb => { if(cb.checked) selectedTones.push(cb.value); });
  return { tones: selectedTones };
}

// Modify helper for Stress Pattern so only a single stressPattern is returned
function gatherStressPatternData(container) {
  const preset = container.querySelector('input[name="stressPreset"]:checked');
  const custom = container.querySelector("textarea").value.trim();
  return { stressPattern: preset && preset.checked ? preset.value : custom };
}

// Rename the direct add rule function to avoid duplicate naming.
function addPhonotacticRuleDirect(dataObj) {
  ensurePhonologyInitialized();
  let ruleName = dataObj.name || dataObj.type; // default to type if rule name not given
  const exists = projectData.phonology.phonotactics.find(rule => rule.name === ruleName);
  if (exists) {
    showModal("Duplicate Rule", `Rule "${ruleName}" already exists. New rule will be named "${ruleName} (additional)".`);
    ruleName += " (additional)";
  }
  const newRule = {
    name: ruleName,
    type: dataObj.type,
    details: JSON.stringify(dataObj),
    enabled: true
  };
  projectData.phonology.phonotactics.push(newRule);
  updatePhonologyMain();
  // Immediately update the phonotactic list so the new rule shows up
  const listElem = document.getElementById("phonotacticList");
  if (listElem) {
    const row = createPhonotacticRuleRow(newRule);
    listElem.appendChild(row);
  }
}

function editPhonotacticRuleDetails(rule) {  
     promptForPhonotacticRuleDetails(rule.type, rule);  
    }

function createPhonotacticRuleRow(item) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.padding = "5px 0";

  const leftDiv = document.createElement("div");

  // Parse details to remove duplicate name and type, then format neatly.
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
    styles: {
      border: "none",
      backgroundColor: "#ffc107",
      color: "white",
      borderRadius: "4px"
    },
    onClick: function () {
      editPhonotacticRuleDetails(item);
    }
  });
  btnContainer.appendChild(editBtn);

  const toggleBtn = createButton({
    text: item.enabled ? "Disable" : "Enable",
    title: "Toggle rule enable/disable",
    styles: {
      border: "none",
      backgroundColor: "#17a2b8",
      color: "white",
      borderRadius: "4px",
      padding: "4px 8px"
    },
    onClick: function () {
      item.enabled = !item.enabled;
      toggleBtn.textContent = item.enabled ? "Disable" : "Enable";

      // Rebuild detailsStr based on item.details
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
    styles: {
      border: "none",
      backgroundColor: "#dc3545",
      color: "white",
      borderRadius: "4px"
    },
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

function addPhonotacticRule() {
  ensurePhonologyInitialized();
  promptForPhonotacticRule(function (data) {
    // Check if a rule with the same name already exists
    const existing = projectData.phonology.phonotactics.find(rule => rule.name === data.name);
    if (existing) {
      showModal(
        "Rule Already Exists",
        `"${data.name}" is already defined. This new one will be named "${data.name} (additional)".`
      );
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
function promptForScriptCharacter(callback, options = {}) {
  const isEdit = options.isEdit === true;
  const data = options.data || { character: "", method: "keyboard" };

  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.gap = "8px";

  // Character Name Field
  const charNameLabel = document.createElement("div");
  charNameLabel.innerHTML = "<strong>Character Name:</strong>";
  charNameLabel.style.alignSelf = "flex-start";
  modalContent.appendChild(charNameLabel);

  const charNameInput = document.createElement("input");
  charNameInput.type = "text";
  charNameInput.placeholder = "Enter character name";
  charNameInput.style.width = "80%";
  charNameInput.value = data.character || "";
  modalContent.appendChild(charNameInput);

  // Glyph Section Header
  const glyphHeader = document.createElement("div");
  glyphHeader.innerHTML = "<hr><strong>Glyph Section</strong><hr>";
  glyphHeader.style.width = "80%";
  glyphHeader.style.textAlign = "center";
  modalContent.appendChild(glyphHeader);

  // Input Method Selector
  const methodLabel = document.createElement("div");
  methodLabel.innerHTML = "<strong>Input Method:</strong>";
  methodLabel.style.alignSelf = "flex-start";
  modalContent.appendChild(methodLabel);

  const methodDiv = document.createElement("div");
  methodDiv.style.display = "flex";
  methodDiv.style.gap = "10px";

  const keyboardRadio = document.createElement("input");
  keyboardRadio.type = "radio";
  keyboardRadio.name = "glyphMethod";
  keyboardRadio.value = "keyboard";
  keyboardRadio.checked = data.method === "keyboard";

  const keyboardLabel = document.createElement("label");
  keyboardLabel.textContent = "Keyboard";
  keyboardLabel.style.cursor = "pointer";

  const customRadio = document.createElement("input");
  customRadio.type = "radio";
  customRadio.name = "glyphMethod";
  customRadio.value = "custom";
  customRadio.checked = data.method === "custom";

  const customLabel = document.createElement("label");
  customLabel.textContent = "Custom (Draw Glyph)";
  customLabel.style.cursor = "pointer";

  methodDiv.appendChild(keyboardRadio);
  methodDiv.appendChild(keyboardLabel);
  methodDiv.appendChild(customRadio);
  methodDiv.appendChild(customLabel);
  modalContent.appendChild(methodDiv);

  // Keyboard input container
  const keyboardContainer = document.createElement("div");
  keyboardContainer.style.width = "80%";
  const kbInputLabel = document.createElement("div");
  kbInputLabel.innerHTML = "<strong>Glyph (Keyboard):</strong>";
  keyboardContainer.appendChild(kbInputLabel);

  const kbInput = document.createElement("input");
  kbInput.type = "text";
  kbInput.placeholder = "Enter glyph from keyboard";
  kbInput.style.width = "100%";
  kbInput.value = data.method === "keyboard" ? (data.glyph || "") : "";
  keyboardContainer.appendChild(kbInput);
  modalContent.appendChild(keyboardContainer);

  // Custom glyph container using Glyph Editor
  const customContainer = document.createElement("div");
  customContainer.style.width = "80%";
  customContainer.style.display = data.method === "custom" ? "block" : "none";

  const drawGlyphLabel = document.createElement("div");
  drawGlyphLabel.innerHTML = "<strong>Draw Glyph:</strong>";
  customContainer.appendChild(drawGlyphLabel);

  const drawGlyphButton = document.createElement("button");
  drawGlyphButton.textContent = (isEdit && data.glyph) ? "Edit Glyph" : "Open Glyph Editor";
  drawGlyphButton.style.padding = "6px 12px";
  drawGlyphButton.style.marginBottom = "10px";
  customContainer.appendChild(drawGlyphButton);

  const glyphOutput = document.createElement("div");
  glyphOutput.style.fontFamily = "monospace";
  glyphOutput.style.wordBreak = "break-all";
  glyphOutput.style.marginTop = "5px";
  glyphOutput.textContent = data.glyph ? data.glyph : "";
  customContainer.appendChild(glyphOutput);

  modalContent.appendChild(customContainer);

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

  // The button that opens the actual Glyph Editor
  drawGlyphButton.addEventListener("click", function () {
    // Create the entire glyph editor UI in a new modal
    const glyphModalContent = document.createElement("div");
    glyphModalContent.style.display = "flex";
    glyphModalContent.style.flexDirection = "column";
    glyphModalContent.style.alignItems = "center";
    glyphModalContent.style.justifyContent = "flex-start";
    glyphModalContent.style.height = "100%";
    glyphModalContent.style.width = "100%";
    glyphModalContent.style.padding = "10px";
    glyphModalContent.style.boxSizing = "border-box";

    // Create a toolbar div with id=buttonContainer
    const toolbar = document.createElement("div");
    toolbar.id = "buttonContainer";  
    toolbar.style.display = "flex";
    toolbar.style.gap = "10px";
    toolbar.style.marginBottom = "10px";
    toolbar.style.justifyContent = "center";
    glyphModalContent.appendChild(toolbar);

    // Editor container
    const glyphEditorDiv = document.createElement("div");
    glyphEditorDiv.id = "glyphEditorContainer_" + Math.random().toString(36).substr(2, 9);
    glyphEditorDiv.style.width = "480px";
    glyphEditorDiv.style.height = "480px";
    glyphEditorDiv.style.border = "1px solid #aaa";
    glyphEditorDiv.style.background = "#fff";
    glyphModalContent.appendChild(glyphEditorDiv);

    // Create the editor
    const glyphModal = new WinBox({
      title: "Glyph Editor",
      modal: false,
      width: "70%",
      height: "70%",
      x: "center",
      y: "center",
      mount: glyphModalContent,
      onfocus: function () { this.setBackground("#444"); }
    });

    const glyphEditor = new GlyphEditor(glyphEditorDiv.id, {
      resolution: 64,
      editable: true,
      outputVisible: false,
      onChange: function (compressed) {
        // optional live changes
      }
    });
    // If editing, load existing glyph
    if (isEdit && data.glyph) {
      try {
        glyphEditor.loadGlyph(data.glyph, true);
      } catch (e) {
        console.error("Error loading glyph:", e);
      }
    }

    // Add Clear, Undo, Redo, Save to the toolbar
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
        const compressedGlyph = glyphEditor.getCompressed();
        glyphOutput.textContent = compressedGlyph;
        glyphModal.close();
      }
    });
    toolbar.appendChild(saveGlyphBtn);
  });

  // Buttons at bottom of the main modal
  const btnDivScript = document.createElement("div");
  btnDivScript.id = "buttonContainer";
  btnDivScript.style.alignSelf = "flex-end";
  btnDivScript.style.display = "flex";
  btnDivScript.style.gap = "10px";
  btnDivScript.style.marginTop = "10px";

  const okBtnScript = createButton({
    text: "Confirm Character",
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
      let character = "";
      if (inputMethod === "keyboard") {
        character = kbInput.value.trim();
      } else {
        character = glyphOutput.textContent.trim();
      }
      if (!charNameInput.value.trim()) {
        showModal("Error", "Character name is required.");
        return;
      }
      const charName = charNameInput.value.trim();
      if (!character) {
        showModal("Error", "Glyph input is required.");
        return;
      }
      modal.close();
      callback({ character: charName, glyph: character, method: inputMethod });
    }
  });
  btnDivScript.appendChild(okBtnScript);

  const cancelBtnScript = createButton({
    text: "Discard changes",
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
            <th style="border-bottom:1px solid #ccc; text-align:left; padding:5px;">Audio</th>
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
