/***************************************************************
 * numbers.js — A "Numbers Agent" with base selection & suffixes
 * Matches the style/structure of cultural.js
 ***************************************************************/

/** 1) Ensure projectData.numbers exists **/
if (!projectData.numbers) {
  projectData.numbers = {
    suffixes: [] // We'll store suffix objects like {suffix:"-teen", meaning:"10+X"}
  };
}

/** 2) Global function to show an info modal (like showModal in cultural.js) **/
function showNumbersModal(title, message, onClose) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";

  const iconSpan = document.createElement("span");
  iconSpan.className = "iconify";
  iconSpan.dataset.icon = "mdi:information-outline";
  iconSpan.style.fontSize = "48px";
  iconSpan.style.marginBottom = "10px";
  modalContent.appendChild(iconSpan);

  const msgP = document.createElement("p");
  msgP.textContent = message;
  msgP.style.margin = "10px 0";
  modalContent.appendChild(msgP);

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.style.padding = "8px 16px";
  okBtn.style.border = "none";
  okBtn.style.backgroundColor = "#007bff";
  okBtn.style.color = "white";
  okBtn.style.borderRadius = "4px";
  okBtn.style.cursor = "pointer";
  okBtn.style.margin = "10px auto";
  okBtn.onclick = function() {
    modal.close();
    if (typeof onClose === "function") onClose();
  };
  modalContent.appendChild(okBtn);

  const modal = new WinBox({
    title: title,
    modal: true,
    width: "40%",
    height: "20%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

/** 3) Prompt for adding a single suffix (like promptForTitle in cultural.js) **/
function promptForNumberSuffix(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";
  modalContent.style.gap = "10px";

  const titleLabel = document.createElement("div");
  titleLabel.innerHTML = "<strong>Suffix:</strong>";
  modalContent.appendChild(titleLabel);

  const suffixInput = document.createElement("input");
  suffixInput.type = "text";
  suffixInput.style.width = "80%";
  suffixInput.style.padding = "6px";
  suffixInput.style.margin = "5px 0";
  modalContent.appendChild(suffixInput);

  const meaningLabel = document.createElement("div");
  meaningLabel.innerHTML = "<strong>Meaning or Notes:</strong>";
  modalContent.appendChild(meaningLabel);

  const meaningInput = document.createElement("input");
  meaningInput.type = "text";
  meaningInput.style.width = "80%";
  meaningInput.style.padding = "6px";
  meaningInput.style.margin = "5px 0";
  modalContent.appendChild(meaningInput);

  // Buttons row
  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.gap = "10px";

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.style.padding = "8px 16px";
  okBtn.style.border = "none";
  okBtn.style.backgroundColor = "#007bff";
  okBtn.style.color = "white";
  okBtn.style.borderRadius = "4px";
  okBtn.style.cursor = "pointer";
  okBtn.onclick = function() {
    const suf = suffixInput.value.trim();
    const mean = meaningInput.value.trim();
    if (!suf) {
      showNumbersModal("Error", "Suffix cannot be empty!");
      return;
    }
    modal.close();
    callback({ suffix: suf, meaning: mean });
  };
  buttonsDiv.appendChild(okBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "8px 16px";
  cancelBtn.style.border = "none";
  cancelBtn.style.backgroundColor = "#6c757d";
  cancelBtn.style.color = "white";
  cancelBtn.style.borderRadius = "4px";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = function() {
    modal.close();
  };
  buttonsDiv.appendChild(cancelBtn);
  modalContent.appendChild(buttonsDiv);

  const modal = new WinBox({
    title: "Add Number Suffix",
    modal: true,
    width: "40%",
    height: "auto",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

/** 4) Helper to remove a suffix with a confirm modal **/
function confirmRemoveNumberSuffix(item, index, listElem) {
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
  message.textContent = `Are you sure you want to remove the suffix "${item.suffix}"?`;
  message.style.margin = "10px 0";
  modalContent.appendChild(message);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.justifyContent = "center";
  buttonsDiv.style.gap = "10px";

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Yes, Remove";
  confirmBtn.style.padding = "8px 16px";
  confirmBtn.style.border = "none";
  confirmBtn.style.backgroundColor = "#dc3545";
  confirmBtn.style.color = "white";
  confirmBtn.style.borderRadius = "4px";
  confirmBtn.style.cursor = "pointer";
  confirmBtn.onclick = function() {
    projectData.numbers.suffixes.splice(index, 1);
    listElem.remove();
    modal.close();
    updateNumbersSummary();
  };
  buttonsDiv.appendChild(confirmBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "8px 16px";
  cancelBtn.style.border = "none";
  cancelBtn.style.backgroundColor = "#6c757d";
  cancelBtn.style.color = "white";
  cancelBtn.style.borderRadius = "4px";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = function() {
    modal.close();
  };
  buttonsDiv.appendChild(cancelBtn);

  modalContent.appendChild(buttonsDiv);

  const modal = new WinBox({
    title: "Confirm Remove",
    modal: true,
    width: "40%",
    height: "20%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

/** 5) Row creation for each suffix in the list **/
function createSuffixRow(item, index) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  li.style.marginBottom = "5px";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.paddingBottom = "5px";

  const leftDiv = document.createElement("div");
  leftDiv.textContent = `${item.suffix} (${item.meaning || "no info"})`;
  li.appendChild(leftDiv);

  const rmvBtn = document.createElement("button");
  rmvBtn.innerHTML = "<span class='iconify' data-icon='mdi:trash-can-outline'></span>";
  rmvBtn.title = "Remove suffix";
  rmvBtn.style.padding = "4px 8px";
  rmvBtn.style.cursor = "pointer";
  rmvBtn.style.border = "none";
  rmvBtn.style.backgroundColor = "#dc3545";
  rmvBtn.style.color = "white";
  rmvBtn.style.borderRadius = "4px";
  rmvBtn.onclick = function() {
    confirmRemoveNumberSuffix(item, index, li);
  };
  li.appendChild(rmvBtn);

  return li;
}

/** 6) The main UI structure for the agent **/
const numbersHTML = `
<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; padding: 10px;">
  <h2 style="margin-bottom:1rem; display:flex; align-items:center; gap:8px;">
    <span><span class="iconify" data-icon="mdi:numeric"></span> Numbers Agent</span>
  </h2>

  <!-- Controls for base selection -->
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
    <label style="font-weight:bold;">Base:</label>
    <select id="numberBaseSelect" style="padding:4px; border-radius:4px; border:1px solid #ccc;">
      <!-- We'll populate in openNumbersAgent with existing or default value -->
    </select>
    <button id="saveBaseBtn" style="padding:6px 10px; border:none; border-radius:4px; background:#007bff; color:white; cursor:pointer;">
      Save Base
    </button>
  </div>

  <!-- Suffixes area -->
  <div style="border: 1px solid; padding:1.2rem; min-height:140px; border-radius:6px; position:relative; margin-bottom:10px;">
    <h3 style="margin-top:0;">Number Suffixes</h3>
    <button type="button" id="addSuffixBtn" style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none; margin-bottom:8px;"
      title="Add a new suffix for the number system.">
      Add Suffix
    </button>
    <ul id="suffixList" style="list-style:none; margin-top:0; padding-left:0;"></ul>
  </div>

  <!-- Summary area -->
  <div style="position:relative; flex:1; box-sizing:border-box; padding-bottom:70px;">
    <h3 id="numbersSummaryHeader" style="margin:0 0 5px 0; cursor:pointer;" onclick="toggleNumbersSummary()">
      <span class="iconify" data-icon="mdi:script-text-outline"></span>
      Number System Details <small style="font-size:0.8em; color:#888;">(click to expand/collapse)</small>
    </h3>
    <div id="numbersSummary" style="display:none;">
      <textarea id="numbersAspectsMain" readonly
        style="height:400px; width:100%; overflow-y:auto; white-space:pre-wrap; padding:10px; border:1px solid; border-radius:6px; box-sizing:border-box; margin:0; resize:vertical;"
      ></textarea>
    </div>
  </div>

  <!-- Buttons at bottom -->
  <div style="width:100%; display:flex; justify-content:flex-end; gap:10px; padding:10px; box-sizing:border-box;">
    <button type="button" onclick="saveNumbers()" style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;" title="Save">
      Save
    </button>
    <button type="button" onclick="loadNumbers()" style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;" title="Load">
      Load
    </button>
    <button type="button" onclick="copyNumbers()" style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#28a745; color:white; border:none;" title="Copy">
      Copy
    </button>
    <button type="button" onclick="clearNumbers()" style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#dc3545; color:white; border:none;" title="Clear">
      Clear
    </button>
  </div>
</div>
`;

/** 7) Show/hide the summary area, like toggleSummaryVisibility in cultural.js **/
function toggleNumbersSummary() {
  const sum = document.getElementById("numbersSummary");
  if (!sum) return;
  sum.style.display = (sum.style.display === "none") ? "block" : "none";
}

/** 8) Render suffixes in the <ul> and update the summary text area **/
function renderSuffixList() {
  const list = document.getElementById("suffixList");
  if (!list) return;
  list.innerHTML = "";
  projectData.numbers.suffixes.forEach((item, idx) => {
    const li = createSuffixRow(item, idx);
    list.appendChild(li);
  });
}

function updateNumbersSummary() {
  // We'll list the base from sessionStorage, plus suffix data from projectData
  const lines = [];
  const storedBase = sessionStorage.getItem("clng_numberSystem") || "(none)";
  lines.push("Base: " + storedBase);
  lines.push("");

  if (projectData.numbers.suffixes && projectData.numbers.suffixes.length > 0) {
    lines.push("Suffixes:");
    projectData.numbers.suffixes.forEach(suf => {
      lines.push("  " + suf.suffix + " -> " + (suf.meaning || "no info"));
    });
  } else {
    lines.push("No suffixes defined.");
  }

  const ta = document.getElementById("numbersAspectsMain");
  if (ta) {
    ta.value = lines.join("\n");
  }
}

/** 9) "Clear" the entire number system data **/
function clearNumbers() {
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
  message.textContent = "Are you sure you want to clear all number system data?";
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
  confirmBtn.style.cursor = "pointer";
  confirmBtn.onclick = function() {
    doClearNumbers();
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
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = function() {
    modal.close();
  };
  buttonsDiv.appendChild(cancelBtn);

  modalContent.appendChild(buttonsDiv);

  const modal = new WinBox({
    title: "Confirm Clear",
    modal: true,
    width: "50%",
    height: "15%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function () {
      this.setBackground("#444");
    }
  });
}

function doClearNumbers() {
  // Reset the data
  projectData.numbers = { suffixes: [] };
  // Remove base from session storage
  sessionStorage.removeItem("clng_numberSystem");
  // Re-render
  renderSuffixList();
  updateNumbersSummary();
}

/** 10) Save to a .clng file (similar to saveCulture) **/
function saveNumbers() {
  let conlangName = sessionStorage.getItem("clng_name") || "untitled";
  const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <numbers>${JSON.stringify(projectData.numbers)}</numbers>
</conlang>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const filename = conlangName + "_numbers.clng";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/** 11) Load from .clng file (similar to loadCulture) **/
function loadNumbers() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => {
    loadProject(input.files[0]); // reuses the global loadProject from script.js
    // Wait a moment to parse
    setTimeout(() => {
      renderSuffixList();
      updateNumbersSummary();
    }, 300);
  };
  input.click();
}

/** 12) Copy summary to clipboard (like copyCulturalAspects) **/
function copyNumbers() {
  const ta = document.getElementById("numbersAspectsMain");
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => {
    showNumbersModal("Success", "Number system copied to clipboard!");
  }, () => {
    showNumbersModal("Error", "Failed to copy!");
  });
}

/** 13) The main function to open the agent in a WinBox **/
function openNumbersAgent() {
  createWinBox("Numbers Agent", numbersHTML, function(container) {
    // 1) Fill the base select
    const select = container.querySelector("#numberBaseSelect");
    if (select) {
      // Provide some typical bases
      const typicalBases = ["10","12","20","8","16"];
      // Clear existing
      select.innerHTML = "";
      typicalBases.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        select.appendChild(opt);
      });
      // Attempt to read from sessionStorage
      const storedBase = sessionStorage.getItem("clng_numberSystem") || "10";
      select.value = storedBase;
    }

    // 2) Hook up "Save Base" button
    const saveBaseBtn = container.querySelector("#saveBaseBtn");
    if (saveBaseBtn && select) {
      saveBaseBtn.addEventListener("click", () => {
        sessionStorage.setItem("clng_numberSystem", select.value);
        showNumbersModal("Saved", `Base set to ${select.value}`);
        updateNumbersSummary();
      });
    }

    // 3) Hook up "Add Suffix" button
    const addSuffixBtn = container.querySelector("#addSuffixBtn");
    if (addSuffixBtn) {
      addSuffixBtn.addEventListener("click", () => {
        promptForNumberSuffix(function(suffixData) {
          projectData.numbers.suffixes.push(suffixData);
          renderSuffixList();
          updateNumbersSummary();
        });
      });
    }

    // 4) Render existing data (if any loaded from projectData)
    renderSuffixList();
    updateNumbersSummary();
  });
}
