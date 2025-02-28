/***************************************************************
 * VOCABULARY AGENT (Refined to mirror Cultural Agent's style)
 ***************************************************************/

function showVocabModal(title, message, onClose) {
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

function promptForVocabEntry(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";

  const label = document.createElement("div");
  label.innerHTML = "<strong>Word/Entry:</strong>";
  modalContent.appendChild(label);

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.style.width = "80%";
  titleInput.style.padding = "6px";
  titleInput.style.margin = "10px 0";
  modalContent.appendChild(titleInput);

  const contentLabel = document.createElement("div");
  contentLabel.innerHTML = "<strong>Definition/Notes:</strong>";
  modalContent.appendChild(contentLabel);

  const contentInput = document.createElement("textarea");
  contentInput.style.width = "80%";
  contentInput.style.height = "60px";
  contentInput.style.padding = "6px";
  contentInput.style.margin = "10px 0";
  contentInput.style.resize = "vertical";
  modalContent.appendChild(contentInput);

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
    const enteredTitle = titleInput.value.trim();
    const enteredContent = contentInput.value.trim();
    if (!enteredTitle || !enteredContent) {
      showVocabModal("Error", "Both fields must be filled.");
      return;
    }
    modal.close();
    callback({ title: enteredTitle, content: enteredContent });
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
    title: "Add Vocabulary Entry",
    modal: true,
    width: "40%",
    height: "40%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

function confirmVocabDelete(categoryKey, item, liElem) {
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
  message.textContent = `Delete "${item.title}"?`;
  message.style.margin = "10px 0";
  modalContent.appendChild(message);

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.marginTop = "10px";
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.justifyContent = "center";
  buttonsDiv.style.gap = "10px";

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Yes, Delete";
  confirmBtn.style.padding = "8px 16px";
  confirmBtn.style.border = "none";
  confirmBtn.style.backgroundColor = "#dc3545";
  confirmBtn.style.color = "white";
  confirmBtn.style.borderRadius = "4px";
  confirmBtn.style.cursor = "pointer";
  confirmBtn.onclick = function() {
    doVocabDelete(categoryKey, item, liElem);
    modal.close();
  };
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
  buttonsDiv.appendChild(confirmBtn);
  buttonsDiv.appendChild(cancelBtn);
  modalContent.appendChild(buttonsDiv);

  const modal = new WinBox({
    title: "Confirm Delete",
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

function doVocabDelete(categoryKey, item, liElem) {
  if (!projectData.vocabulary[categoryKey]) return;
  projectData.vocabulary[categoryKey] = projectData.vocabulary[categoryKey].filter(
    (obj) => !(obj.title === item.title && obj.content === item.content)
  );
  liElem.remove();
  updateVocabularyAspectsMain();
}

function createVocabularyRow(categoryKey, item) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  li.style.marginBottom = "5px";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.paddingBottom = "5px";

  const leftDiv = document.createElement("div");
  leftDiv.style.display = "flex";
  leftDiv.style.flexDirection = "column";

  const titleDiv = document.createElement("div");
  titleDiv.innerHTML = "<strong>Word:</strong> " + item.title;
  leftDiv.appendChild(titleDiv);

  const contentDiv = document.createElement("div");
  contentDiv.textContent = item.content;
  leftDiv.appendChild(contentDiv);

  li.appendChild(leftDiv);

  // Button container
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";

  const editBtn = document.createElement("button");
  editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
  editBtn.title = "Edit this vocabulary entry";
  editBtn.style.padding = "4px 8px";
  editBtn.style.cursor = "pointer";
  editBtn.style.border = "none";
  editBtn.style.backgroundColor = "#ffc107";
  editBtn.style.color = "white";
  editBtn.style.borderRadius = "4px";

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "<span class='iconify' data-icon='mdi:trash-can-outline'></span>";
  removeBtn.title = "Delete this vocabulary entry";
  removeBtn.style.padding = "4px 8px";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.border = "none";
  removeBtn.style.backgroundColor = "#dc3545";
  removeBtn.style.color = "white";
  removeBtn.style.borderRadius = "4px";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(removeBtn);
  li.appendChild(btnContainer);

  removeBtn.onclick = () => confirmVocabDelete(categoryKey, item, li);

  function enableEdit() {
    if (li.querySelector("input.editTitle")) return;
    leftDiv.style.display = "none";

    const editContainer = document.createElement("div");
    editContainer.style.display = "flex";
    editContainer.style.flexDirection = "column";
    editContainer.style.gap = "5px";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = item.title;
    titleInput.className = "editTitle";
    titleInput.style.width = "100%";
    titleInput.style.padding = "4px";
    titleInput.style.border = "1px solid #ccc";
    titleInput.style.borderRadius = "4px";
    editContainer.appendChild(titleInput);

    const contentInput = document.createElement("textarea");
    contentInput.value = item.content;
    contentInput.className = "editContent";
    contentInput.style.width = "100%";
    contentInput.style.resize = "vertical";
    contentInput.style.padding = "4px";
    contentInput.style.border = "1px solid #ccc";
    contentInput.style.borderRadius = "4px";
    editContainer.appendChild(contentInput);

    li.insertBefore(editContainer, btnContainer);

    editBtn.innerHTML = "<span class='iconify' data-icon='mdi:content-save-outline'></span>";
    editBtn.title = "Save changes";

    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = "<span class='iconify' data-icon='mdi:cancel'></span>";
    cancelBtn.title = "Cancel editing";
    cancelBtn.style.padding = "4px 8px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.border = "none";
    cancelBtn.style.backgroundColor = "#6c757d";
    cancelBtn.style.color = "white";
    cancelBtn.style.borderRadius = "4px";
    btnContainer.appendChild(cancelBtn);

    editBtn.onclick = function saveEdit() {
      const newTitle = titleInput.value.trim();
      const newContent = contentInput.value.trim();
      if (!newTitle || !newContent) {
        showVocabModal("Error", "All fields must be filled.");
        return;
      }
      const arr = projectData.vocabulary[categoryKey];
      const idx = arr.findIndex(
        (obj) =>
          obj.title === item.title &&
          obj.content === item.content
      );
      if (idx !== -1) {
        arr[idx].title = newTitle;
        arr[idx].content = newContent;
      }
      item.title = newTitle;
      item.content = newContent;
      titleDiv.innerHTML = "<strong>Word:</strong> " + newTitle;
      contentDiv.textContent = newContent;
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      btnContainer.removeChild(cancelBtn);
      editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
      editBtn.title = "Edit this vocabulary entry";
      editBtn.onclick = enableEdit;
      updateVocabularyAspectsMain();
    };

    cancelBtn.onclick = function() {
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
      editBtn.title = "Edit this vocabulary entry";
      editBtn.onclick = enableEdit;
      btnContainer.removeChild(cancelBtn);
    };
  }

  editBtn.onclick = enableEdit;

  return li;
}

function addVocabularyDetail(categoryKey) {
  promptForVocabEntry(function(data) {
    // Check duplicates
    if (!projectData.vocabulary[categoryKey]) {
      projectData.vocabulary[categoryKey] = [];
    }
    const exists = projectData.vocabulary[categoryKey].some(
      (obj) => obj.title === data.title && obj.content === data.content
    );
    if (exists) {
      showVocabModal("Warning", "This vocabulary entry already exists!");
      return;
    }
    const newItem = { title: data.title, content: data.content };
    projectData.vocabulary[categoryKey].push(newItem);
    const list = document.getElementById(categoryKey + "List");
    if (!list) return;
    const li = createVocabularyRow(categoryKey, newItem);
    list.appendChild(li);
    updateVocabularyAspectsMain();
  });
}

function updateVocabularyAspectsMain() {
  const lines = [];
  for (const [cat, arr] of Object.entries(projectData.vocabulary)) {
    if (arr.length > 0) {
      lines.push(cat.charAt(0).toUpperCase() + cat.slice(1) + ":");
      arr.forEach((obj) => {
        lines.push("  Word: " + obj.title);
        lines.push("  " + obj.content);
      });
      lines.push("");
    }
  }
  const ta = document.getElementById("vocabularyAspectsMain");
  if (ta) {
    ta.value = lines.join("\n");
    sessionStorage.setItem("vocabularyAspectsMain", ta.value);
    sessionStorage.setItem("vocabularyProjectData", JSON.stringify(projectData.vocabulary));
  }
}

function repopulateVocabularyTabs() {
  const categories = ["lexicon","prefixes","loanwords","numbers","semantics"];
  categories.forEach((cat) => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
    (projectData.vocabulary[cat] || []).forEach((obj) => {
      const li = createVocabularyRow(cat, obj);
      list.appendChild(li);
    });
  });
}

function clearVocabulary() {
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
  message.textContent = "Are you sure you want to clear all vocabulary data?";
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
    doClearVocabulary();
    modal.close();
  };

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

  buttonsDiv.appendChild(confirmBtn);
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

function doClearVocabulary() {
  projectData.vocabulary = {};
  const categories = ["lexicon","prefixes","loanwords","numbers","semantics"];
  categories.forEach((cat) => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
  });
  updateVocabularyAspectsMain();
  sessionStorage.removeItem("vocabularyAspectsMain");
  sessionStorage.removeItem("vocabularyProjectData");
}

function saveVocabularyData() {
  let conlangName = sessionStorage.getItem("clng_name") || "untitled";
  const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <vocabulary>${JSON.stringify(projectData.vocabulary)}</vocabulary>
</conlang>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const filename = conlangName + "_vocabulary.clng";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function loadVocabularyData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => {
    loadProject(input.files[0]);
    setTimeout(() => {
      repopulateVocabularyTabs();
      updateVocabularyAspectsMain();
    }, 300);
  };
  input.click();
}

function copyVocabularyAspects() {
  const ta = document.getElementById("vocabularyAspectsMain");
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => {
    showVocabModal("Success", "Vocabulary copied to clipboard!");
  }, () => {
    showVocabModal("Error", "Failed to copy!");
  });
}

/** Final HTML template **/
const refinedVocabHTML = `
<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; padding: 10px;">
  <h2 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
    <span><span class="iconify" data-icon="mdi:book-plus-outline"></span> Vocabulary Agent</span>
  </h2>
  <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1rem; padding: 10px; border-radius: 6px;">
    ${
      [
        { tab: "lexicon", icon: "mdi:book", tooltip: "Add general words here." },
        { tab: "prefixes", icon: "mdi:format-letter-case-upper", tooltip: "Prefixes/suffixes." },
        { tab: "loanwords", icon: "mdi:earth", tooltip: "Loanwords from other languages." },
        // We replace the original "numbers" add button with a new external window
        { tab: "numbers", icon: "mdi:numeric", tooltip: "Open separate Numbers agent." },
        { tab: "semantics", icon: "mdi:comment-text-outline", tooltip: "Semantic fields." }
      ].map(({ tab, icon, tooltip }) => `
        <button
          type="button"
          class="vocab-tab-btn"
          data-tab="${tab}"
          style="padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold; text-decoration: underline;"
          title="${tooltip}"
        >
          <span class="iconify" data-icon="${icon}"></span> ${tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      `).join('')
    }
  </div>
  <div style="border: 1px solid; padding: 1.2rem; min-height: 140px; border-radius: 6px; position: relative; margin-bottom: 10px;">
    <div id="vocabDefault" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #888;">
      <span class="iconify" data-icon="mdi:information-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></span>
      Select a tab to add entries
    </div>
    ${
      // Replacing the "numbers" content with a button that opens a separate window
      ["lexicon","prefixes","loanwords","numbers","semantics"]
        .map(cat => {
          if (cat === "numbers") {
            // We'll display a button to open a separate window
            return `
              <div class="vocab-tab" id="tab-numbers" style="display: none;">
                <h3 style="margin-top:0;">Numbers</h3>
                <p>Here you can open your separate Numbers Agent.</p>
                <button
                  type="button"
                  onclick="openNumbersAgent()" 
                  style="padding: 6px 12px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;"
                  title="Open the separate Numbers window"
                >
                  Open Numbers Window
                </button>
                <!-- We won't have an internal list or add button here,
                     because the user will manage numbers in the separate agent. -->
              </div>
            `;
          } else {
            return `
              <div class="vocab-tab" id="tab-${cat}" style="display: none;">
                <h3 style="margin-top:0;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                <button
                  type="button"
                  onclick="addVocabularyDetail('${cat}')"
                  style="padding: 6px 12px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;"
                  title="Add a new entry to this category."
                >
                  Add ${cat}
                </button>
                <ul id="${cat}List" style="list-style: none; margin-top: 0.75rem; padding-left: 0;"></ul>
              </div>
            `;
          }
        }).join('')
    }
  </div>
  <div style="position: relative; flex:1; box-sizing: border-box; padding-bottom:70px;">
    <h3 style="margin: 0 0 5px 0; cursor: pointer;" onclick="toggleVocabSummary()">
      <span class="iconify" data-icon="mdi:script-text-outline"></span>
      All Vocabulary <small style="font-size:0.8em; color:#888;">(click to expand/collapse)</small>
    </h3>
    <div id="vocabSummary" style="display: none;">
      <textarea
        id="vocabularyAspectsMain"
        readonly
        style="height: 400px; width: 100%; overflow-y: auto; white-space: pre-wrap; padding: 10px; border: 1px solid; border-radius: 6px; box-sizing: border-box; margin: 0; resize: vertical;"
      ></textarea>
    </div>
  </div>
  <div style="width: 100%; display: flex; justify-content: flex-end; gap: 10px; padding: 10px; box-sizing: border-box;">
    <button type="button" onclick="saveVocabularyData()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;" title="Save">Save</button>
    <button type="button" onclick="loadVocabularyData()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;" title="Load">Load</button>
    <button type="button" onclick="copyVocabularyAspects()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #28a745; color: white; border: none;" title="Copy">Copy</button>
    <button type="button" onclick="clearVocabulary()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #dc3545; color: white; border: none;" title="Clear">Clear</button>
  </div>
</div>
`;

function toggleVocabSummary() {
  const summary = document.getElementById("vocabSummary");
  if (!summary) return;
  summary.style.display = summary.style.display === "none" ? "block" : "none";
}

function selectVocabTab(tabKey) {
  document.querySelectorAll(".vocab-tab").forEach(div => {
    div.style.display = "none";
  });
  const target = document.getElementById(`tab-${tabKey}`);
  if (target) target.style.display = "block";

  document.querySelectorAll(".vocab-tab-btn").forEach(btn => {
    btn.style.fontWeight = "normal";
    btn.style.textDecoration = "none";
  });
  const activeBtn = document.querySelector(`.vocab-tab-btn[data-tab="${tabKey}"]`);
  if (activeBtn) {
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.textDecoration = "underline";
  }

  const defaultMsg = document.getElementById("vocabDefault");
  if (defaultMsg) defaultMsg.style.display = "none";
}

function openVocabularyAgent() {
  if (!projectData.vocabulary) {
    projectData.vocabulary = {};
  }
  createWinBox("Vocabulary Agent", refinedVocabHTML, function(container) {
    container.querySelectorAll(".vocab-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectVocabTab(btn.dataset.tab);
      });
    });
    const storedData = sessionStorage.getItem("vocabularyProjectData");
    if (storedData) {
      try {
        projectData.vocabulary = JSON.parse(storedData);
        repopulateVocabularyTabs();
      } catch(e) {
        console.warn("Could not parse session storage vocabulary data:", e);
      }
    }
    const storedText = sessionStorage.getItem("vocabularyAspectsMain");
    if (storedText) {
      const ta = container.querySelector("#vocabularyAspectsMain");
      if (ta) ta.value = storedText;
    }
  });
}
