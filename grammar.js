/*
 * File: grammar.js
 * Description: Handles grammar agent functionalities such as rule creation, editing, deletion, and display.
 * Version: 1.0.0
 * Comments: Adapted to manage grammar rules similarly to the vocabulary agent.
 * MD5 Sum: [INSERT_MD5_HASH_HERE]
 */
/***************************************************************
 * GRAMMAR AGENT (Adapted to similar structure as Vocabulary Agent)
 ***************************************************************/
function createGrammarRow(categoryKey, item) {
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

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.innerHTML = "<strong>Rule:</strong> " + item.title;
  leftDiv.appendChild(titleDiv);

  // Description
  const descDiv = document.createElement("div");
  descDiv.textContent = item.content;
  leftDiv.appendChild(descDiv);

  li.appendChild(leftDiv);

  // Buttons
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.style.backgroundColor = "#ffc107";
  editBtn.style.color = "white";
  editBtn.style.border = "none";
  editBtn.style.borderRadius = "4px";
  editBtn.style.padding = "4px 8px";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete";
  removeBtn.style.backgroundColor = "#dc3545";
  removeBtn.style.color = "white";
  removeBtn.style.border = "none";
  removeBtn.style.borderRadius = "4px";
  removeBtn.style.padding = "4px 8px";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(removeBtn);
  li.appendChild(btnContainer);

  // Delete logic
  removeBtn.onclick = () => {
    projectData.grammar[categoryKey] = projectData.grammar[categoryKey].filter(
      (x) => x.title !== item.title || x.content !== item.content
    );
    li.remove();
    updateGrammarMain();
  };

  // Edit logic
  editBtn.onclick = () => {
    if (li.querySelector("input.editTitle")) return; // already editing

    leftDiv.style.display = "none";
    const editContainer = document.createElement("div");
    editContainer.style.display = "flex";
    editContainer.style.flexDirection = "column";
    editContainer.style.gap = "4px";

    const titleInput = document.createElement("input");
    titleInput.value = item.title;
    titleInput.classList.add("editTitle");
    editContainer.appendChild(titleInput);

    const contentInput = document.createElement("textarea");
    contentInput.value = item.content;
    contentInput.classList.add("editContent");
    contentInput.style.resize = "vertical";
    editContainer.appendChild(contentInput);

    li.insertBefore(editContainer, btnContainer);

    editBtn.textContent = "Save";
    const originalOnClick = editBtn.onclick;
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.backgroundColor = "#6c757d";
    cancelBtn.style.color = "white";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.padding = "4px 8px";
    btnContainer.appendChild(cancelBtn);

    editBtn.onclick = () => {
      const newTitle = titleInput.value.trim();
      const newContent = contentInput.value.trim();
      if (!newTitle || !newContent) {
        alert("All fields must be filled.");
        return;
      }
      // Update data
      item.title = newTitle;
      item.content = newContent;
      // Reflect changes
      titleDiv.innerHTML = "<strong>Rule:</strong> " + newTitle;
      descDiv.textContent = newContent;
      // Restore layout
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      editBtn.textContent = "Edit";
      editBtn.onclick = originalOnClick;
      btnContainer.removeChild(cancelBtn);
      updateGrammarMain();
    };

    cancelBtn.onclick = () => {
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      editBtn.textContent = "Edit";
      editBtn.onclick = originalOnClick;
      btnContainer.removeChild(cancelBtn);
    };
  };

  return li;
}

function addGrammarDetail(categoryKey) {
  const input = document.getElementById(categoryKey + "Input");
  const list = document.getElementById(categoryKey + "List");
  if (!input || !list) return;

  const content = input.value.trim();
  if (!content) return;
  input.value = "";

  const title = prompt("Enter rule/title:");
  if (!title) return;

  // Check duplicates
  if (
    projectData.grammar[categoryKey].some(
      (x) => x.title === title && x.content === content
    )
  ) {
    alert("This rule already exists!");
    return;
  }

  const newItem = { title: title, content: content };
  projectData.grammar[categoryKey].push(newItem);
  const li = createGrammarRow(categoryKey, newItem);
  list.appendChild(li);
  updateGrammarMain();
}

function updateGrammarMain() {
  const lines = [];
  for (const [cat, arr] of Object.entries(projectData.grammar)) {
    if (arr.length > 0) {
      lines.push(cat.toUpperCase() + ":");
      arr.forEach((obj) => {
        lines.push("  Rule: " + obj.title);
        lines.push("  " + obj.content);
      });
      lines.push("");
    }
  }
  const ta = document.getElementById("grammarAspectsMain");
  if (ta) {
    ta.value = lines.join("\n");
    sessionStorage.setItem("grammarAspectsMain", ta.value);
    sessionStorage.setItem("grammarProjectData", JSON.stringify(projectData.grammar));
  }
}

function repopulateGrammarTabs() {
  const categories = ["syntax", "morphology", "advanced"];
  categories.forEach((cat) => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
    (projectData.grammar[cat] || []).forEach((obj) => {
      const li = createGrammarRow(cat, obj);
      list.appendChild(li);
    });
  });
}

function clearGrammar() {
  if (!confirm("Clear all grammar data?")) return;
  projectData.grammar = { syntax: [], morphology: [], advanced: [] };
  repopulateGrammarTabs();
  updateGrammarMain();
  sessionStorage.removeItem("grammarAspectsMain");
  sessionStorage.removeItem("grammarProjectData");
}

// Save/Load specialized
function saveGrammarData() {
  let conlangName = sessionStorage.getItem("clng_name") || "untitled";
  const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <grammar>${JSON.stringify(projectData.grammar)}</grammar>
</conlang>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const filename = conlangName + "_grammar.clng";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function loadGrammarData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => {
    loadProject(input.files[0]);
    setTimeout(() => {
      repopulateGrammarTabs();
      updateGrammarMain();
    }, 300);
  };
  input.click();
}

// Copy text
function copyGrammarAspects() {
  const ta = document.getElementById("grammarAspectsMain");
  if (!ta) return;
  navigator.clipboard
    .writeText(ta.value)
    .then(() => alert("Grammar rules copied!"))
    .catch(() => alert("Copy failed"));
}

// Build the HTML for the grammar agent window
const grammarHTML = `
<div style="display:flex; flex-direction:column; height:100%; padding:10px; box-sizing:border-box;">
  <h2>Grammar Agent</h2>
  <div style="display:flex; gap:10px; margin-bottom:10px;">
    <button class="grammar-tab-btn" data-tab="syntax">Syntax</button>
    <button class="grammar-tab-btn" data-tab="morphology">Morphology</button>
    <button class="grammar-tab-btn" data-tab="advanced">Advanced</button>
  </div>
  <div style="border:1px solid #ccc; padding:10px; border-radius:6px; min-height:120px; position:relative; margin-bottom:10px;">
    <div id="grammarDefault" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#888;">Select a tab</div>
    <div id="tab-syntax" class="grammar-tab" style="display:none;">
      <h3>Syntax</h3>
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" id="syntaxInput" placeholder="Add syntax rule..." style="flex:1;" />
        <button onclick="addGrammarDetail('syntax')">Add</button>
      </div>
      <ul id="syntaxList" style="list-style:none; margin-top:8px; padding-left:0;"></ul>
    </div>
    <div id="tab-morphology" class="grammar-tab" style="display:none;">
      <h3>Morphology</h3>
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" id="morphologyInput" placeholder="Add morphology rule..." style="flex:1;" />
        <button onclick="addGrammarDetail('morphology')">Add</button>
      </div>
      <ul id="morphologyList" style="list-style:none; margin-top:8px; padding-left:0;"></ul>
    </div>
    <div id="tab-advanced" class="grammar-tab" style="display:none;">
      <h3>Advanced Grammar</h3>
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="text" id="advancedInput" placeholder="Add advanced rule..." style="flex:1;" />
        <button onclick="addGrammarDetail('advanced')">Add</button>
      </div>
      <ul id="advancedList" style="list-style:none; margin-top:8px; padding-left:0;"></ul>
    </div>
  </div>
  <h3 style="margin:0 0 5px 0; cursor:pointer;" onclick="toggleGrammarSummary()">
    All Grammar <small>(click to expand/collapse)</small>
  </h3>
  <div id="grammarSummary" style="display:none;">
    <textarea id="grammarAspectsMain"
      style="width:100%; height:200px; resize:vertical; white-space:pre-wrap;"></textarea>
  </div>
  <div style="margin-top:10px; display:flex; gap:8px; justify-content:flex-end;">
    <button onclick="saveGrammarData()">Save</button>
    <button onclick="loadGrammarData()">Load</button>
    <button onclick="copyGrammarAspects()">Copy</button>
    <button onclick="clearGrammar()">Clear</button>
  </div>
</div>
`;

// Show/hide summary
function toggleGrammarSummary() {
  const sum = document.getElementById("grammarSummary");
  if (!sum) return;
  sum.style.display = sum.style.display === "none" ? "block" : "none";
}

// Tab switching
function selectGrammarTab(tabKey) {
  document.querySelectorAll(".grammar-tab").forEach((div) => {
    div.style.display = "none";
  });
  const target = document.getElementById(`tab-${tabKey}`);
  if (target) target.style.display = "block";

  // Un-bold the others
  document.querySelectorAll(".grammar-tab-btn").forEach((btn) => {
    btn.style.fontWeight = "normal";
    btn.style.textDecoration = "none";
  });
  const activeBtn = document.querySelector(`.grammar-tab-btn[data-tab="${tabKey}"]`);
  if (activeBtn) {
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.textDecoration = "underline";
  }

  const def = document.getElementById("grammarDefault");
  if (def) def.style.display = "none";
}

// WinBox creation
function openGrammarAgent() {
  // Initialize grammar if needed
  if (!projectData.grammar) {
    projectData.grammar = {
      syntax: [],
      morphology: [],
      advanced: []
    };
  }

  createWinBox("Grammar Agent", grammarHTML, function (container) {
    // Set up tab buttons
    container.querySelectorAll(".grammar-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectGrammarTab(btn.dataset.tab));
    });

    // Load from session if available
    const storedData = sessionStorage.getItem("grammarProjectData");
    if (storedData) {
      try {
        projectData.grammar = JSON.parse(storedData);
      } catch (e) {
        console.warn("Error parsing grammar data from storage:", e);
      }
      repopulateGrammarTabs();
    }
    const storedText = sessionStorage.getItem("grammarAspectsMain");
    if (storedText) {
      const ta = container.querySelector("#grammarAspectsMain");
      if (ta) ta.value = storedText;
    }
  });
}
/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();