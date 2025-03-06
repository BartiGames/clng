/***************************************************************
 * USAGE AGENT (with speaking functionality, styled similarly to Cultural Agent)
 ***************************************************************/

/** Data structure initialization (if needed) **/
if (!projectData.usage) {
  projectData.usage = {
    conversation: [],
    speaking: [],
    grammarCheck: []
  };
}

/** Create an entry row for usage items **/
function createUsageRow(categoryKey, item) {
  const li = document.createElement("li");
  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.justifyContent = "space-between";
  li.style.marginBottom = "5px";
  li.style.borderBottom = "1px dotted #ccc";
  li.style.paddingBottom = "5px";

  // Left container
  const leftDiv = document.createElement("div");
  leftDiv.style.display = "flex";
  leftDiv.style.flexDirection = "column";

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.innerHTML = `<strong>Title:</strong> ${item.title}`;
  leftDiv.appendChild(titleDiv);

  // Content
  const contentDiv = document.createElement("div");
  contentDiv.textContent = item.content;
  leftDiv.appendChild(contentDiv);

  li.appendChild(leftDiv);

  // Button container
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.style.padding = "4px 8px";
  editBtn.style.cursor = "pointer";
  editBtn.style.border = "none";
  editBtn.style.borderRadius = "4px";
  editBtn.style.backgroundColor = "#ffc107";
  editBtn.style.color = "white";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete";
  removeBtn.style.padding = "4px 8px";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.border = "none";
  removeBtn.style.borderRadius = "4px";
  removeBtn.style.backgroundColor = "#dc3545";
  removeBtn.style.color = "white";

  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(removeBtn);
  li.appendChild(btnContainer);

  // Delete logic
  removeBtn.onclick = () => {
    projectData.usage[categoryKey] = projectData.usage[categoryKey].filter(
      (x) => x.title !== item.title || x.content !== item.content
    );
    li.remove();
    updateUsageMain();
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
      titleDiv.innerHTML = `<strong>Title:</strong> ${newTitle}`;
      contentDiv.textContent = newContent;
      // Restore layout
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      editBtn.textContent = "Edit";
      editBtn.onclick = originalOnClick;
      btnContainer.removeChild(cancelBtn);
      updateUsageMain();
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

/** Add a usage detail **/
function addUsageDetail(categoryKey) {
  const input = document.getElementById(categoryKey + "Input");
  const list = document.getElementById(categoryKey + "List");
  if (!input || !list) return;

  const content = input.value.trim();
  if (!content) return;
  input.value = "";

  const title = prompt("Enter title/label:");
  if (!title) return;

  // Check duplicates
  if (
    projectData.usage[categoryKey].some(
      (x) => x.title === title && x.content === content
    )
  ) {
    alert("This entry already exists!");
    return;
  }

  const newItem = { title: title, content: content };
  projectData.usage[categoryKey].push(newItem);
  const li = createUsageRow(categoryKey, newItem);
  list.appendChild(li);
  updateUsageMain();
}

/** Update the main usage summary text area **/
function updateUsageMain() {
  const lines = [];
  for (const [cat, arr] of Object.entries(projectData.usage)) {
    if (arr.length > 0) {
      lines.push(cat.toUpperCase() + ":");
      arr.forEach((obj) => {
        lines.push("  Title: " + obj.title);
        lines.push("  " + obj.content);
      });
      lines.push("");
    }
  }
  const ta = document.getElementById("usageAspectsMain");
  if (ta) {
    ta.value = lines.join("\n");
    sessionStorage.setItem("usageAspectsMain", ta.value);
    sessionStorage.setItem("usageProjectData", JSON.stringify(projectData.usage));
  }
}

/** Repopulate each tab from stored data **/
function repopulateUsageTabs() {
  const categories = ["conversation", "speaking", "grammarCheck"];
  categories.forEach((cat) => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
    (projectData.usage[cat] || []).forEach((obj) => {
      const li = createUsageRow(cat, obj);
      list.appendChild(li);
    });
  });
}

/** Clear usage data **/
function clearUsage() {
  if (!confirm("Clear all usage data?")) return;
  projectData.usage = { conversation: [], speaking: [], grammarCheck: [] };
  repopulateUsageTabs();
  updateUsageMain();
  sessionStorage.removeItem("usageAspectsMain");
  sessionStorage.removeItem("usageProjectData");
}

/** Save to file **/
function saveUsageData() {
  let conlangName = sessionStorage.getItem("clng_name") || "untitled";
  const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <usage>${JSON.stringify(projectData.usage)}</usage>
</conlang>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const filename = conlangName + "_usage.clng";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/** Load from file **/
function loadUsageData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => {
    loadProject(input.files[0]);
    setTimeout(() => {
      repopulateUsageTabs();
      updateUsageMain();
    }, 300);
  };
  input.click();
}

/** Copy usage summary **/
function copyUsageAspects() {
  const ta = document.getElementById("usageAspectsMain");
  if (!ta) return;
  navigator.clipboard
    .writeText(ta.value)
    .then(() => alert("Usage details copied!"))
    .catch(() => alert("Copy failed"));
}

/** Text-to-speech demo function **/
function speakUsageText() {
  const text = document.getElementById("ttsInputField")?.value || "";
  if (!text.trim()) {
    alert("Please enter some text to speak.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

/** Toggle usage summary section **/
function toggleUsageSummary() {
  const sum = document.getElementById("usageSummary");
  if (!sum) return;
  sum.style.display = sum.style.display === "none" ? "block" : "none";
}

/** Switch between usage tabs **/
function selectUsageTab(tabKey) {
  document.querySelectorAll(".usage-tab").forEach((div) => {
    div.style.display = "none";
  });
  const target = document.getElementById(`tab-${tabKey}`);
  if (target) target.style.display = "block";

  // Un-style the other buttons
  document.querySelectorAll(".usage-tab-btn").forEach((btn) => {
    btn.style.fontWeight = "normal";
    btn.style.textDecoration = "none";
  });
  const activeBtn = document.querySelector(`.usage-tab-btn[data-tab="${tabKey}"]`);
  if (activeBtn) {
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.textDecoration = "underline";
  }

  const def = document.getElementById("usageDefault");
  if (def) def.style.display = "none";
}

/** Build the usage agent HTML **/
const usageHTML = `
<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; padding: 10px;">
  <h2 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
    <span><span class="iconify" data-icon="mdi:play-circle-outline"></span> Usage Agent</span>
  </h2>
  <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1rem; padding: 10px; border-radius: 6px;">
    ${
      [
        { tab: "conversation", icon: "mdi:chat-processing-outline", label: "Conversation" },
        { tab: "speaking", icon: "mdi:volume-high", label: "Speaking" },
        { tab: "grammarCheck", icon: "mdi:book-check-outline", label: "Grammar" }
      ].map(({ tab, icon, label }) => `
        <button
          type="button"
          class="usage-tab-btn"
          data-tab="${tab}"
          style="padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold; text-decoration: underline;"
          title="Open ${label} tab."
        >
          <span class="iconify" data-icon="${icon}"></span> ${label}
        </button>
      `).join('')
    }
  </div>
  <div style="border: 1px solid; padding: 1.2rem; min-height: 140px; border-radius: 6px; position: relative; margin-bottom: 10px;">
    <div id="usageDefault" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #888;">
      <span class="iconify" data-icon="mdi:information-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></span>
      Select a tab to simulate usage
    </div>
    <!-- Conversation TAB -->
    <div class="usage-tab" id="tab-conversation" style="display: none;">
      <h3 style="margin-top: 0;">Conversation Simulation</h3>
      <div style="display:flex; align-items:center; gap:6px;">
        <input
          type="text"
          id="conversationInput"
          placeholder="Enter conversation scenario..."
          style="flex:1; padding:8px; border:1px solid; border-radius:4px;"
        />
        <button
          type="button"
          onclick="addUsageDetail('conversation')"
          style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;"
        >
          Add
        </button>
      </div>
      <ul id="conversationList" style="list-style:none; margin-top:0.75rem; padding-left:0;"></ul>
    </div>

    <!-- Speaking TAB -->
    <div class="usage-tab" id="tab-speaking" style="display: none;">
      <h3 style="margin-top: 0;">Text to Speech</h3>
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
        <input
          type="text"
          id="speakingInput"
          placeholder="Enter speaking scenario or notes..."
          style="flex:1; padding:8px; border:1px solid; border-radius:4px;"
        />
        <button
          type="button"
          onclick="addUsageDetail('speaking')"
          style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;"
        >
          Add
        </button>
      </div>
      <ul id="speakingList" style="list-style:none; margin-top:0.75rem; padding-left:0;"></ul>
      <!-- Actual TTS input and button -->
      <div style="margin-top:1rem; display:flex; flex-direction:column; gap:6px;">
        <label for="ttsInputField"><strong>Enter text to speak:</strong></label>
        <textarea
          id="ttsInputField"
          style="width:100%; height:80px; resize:vertical; padding:8px; border:1px solid; border-radius:4px;"
        ></textarea>
        <button
          type="button"
          onclick="speakUsageText()"
          style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#28a745; color:white; border:none;"
        >
          Speak
        </button>
      </div>
    </div>

    <!-- Grammar TAB -->
    <div class="usage-tab" id="tab-grammarCheck" style="display: none;">
      <h3 style="margin-top: 0;">Grammar Check</h3>
      <div style="display:flex; align-items:center; gap:6px;">
        <input
          type="text"
          id="grammarCheckInput"
          placeholder="Enter text to check..."
          style="flex:1; padding:8px; border:1px solid; border-radius:4px;"
        />
        <button
          type="button"
          onclick="addUsageDetail('grammarCheck')"
          style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;"
        >
          Add
        </button>
      </div>
      <ul id="grammarCheckList" style="list-style:none; margin-top:0.75rem; padding-left:0;"></ul>
      <!-- Placeholder grammar check button -->
      <div style="margin-top:1rem;">
        <button
          type="button"
          onclick="alert('Performing AI grammar check (placeholder)...')"
          style="padding:6px 12px; cursor:pointer; border-radius:4px; background:#28a745; color:white; border:none;"
        >
          Check Grammar
        </button>
      </div>
    </div>
  </div>

  <div style="position: relative; flex:1; box-sizing: border-box; padding-bottom:70px;">
    <h3 style="margin:0 0 5px 0; cursor:pointer;" onclick="toggleUsageSummary()">
      <span class="iconify" data-icon="mdi:script-text-outline"></span>
      All Usage <small style="font-size:0.8em; color:#888;">(click to expand/collapse)</small>
    </h3>
    <div id="usageSummary" style="display:none;">
      <textarea
        id="usageAspectsMain"
        readonly
        style="height:400px; width:100%; overflow-y:auto; white-space:pre-wrap; padding:10px; border:1px solid; border-radius:6px; box-sizing:border-box; margin:0; resize:vertical;"
      ></textarea>
    </div>
  </div>

  <div style="width:100%; display:flex; justify-content:flex-end; gap:10px; padding:10px; box-sizing:border-box;">
    <button
      type="button"
      onclick="saveUsageData()"
      style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;"
      title="Save"
    >
      Save
    </button>
    <button
      type="button"
      onclick="loadUsageData()"
      style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#007bff; color:white; border:none;"
      title="Load"
    >
      Load
    </button>
    <button
      type="button"
      onclick="copyUsageAspects()"
      style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#28a745; color:white; border:none;"
      title="Copy"
    >
      Copy
    </button>
    <button
      type="button"
      onclick="clearUsage()"
      style="padding:8px 14px; cursor:pointer; border-radius:4px; background:#dc3545; color:white; border:none;"
      title="Clear"
    >
      Clear
    </button>
  </div>
</div>
`;

/** Create the WinBox for the Usage Agent **/
function openUsageSimulator() {
  createWinBox("Usage Agent", usageHTML, function (container) {
    // Hook up tab buttons
    container.querySelectorAll(".usage-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectUsageTab(btn.dataset.tab));
    });

    // Load from session if available
    const storedData = sessionStorage.getItem("usageProjectData");
    if (storedData) {
      try {
        projectData.usage = JSON.parse(storedData);
      } catch (e) {
        console.warn("Error parsing usage data from storage:", e);
      }
      repopulateUsageTabs();
    }
    const storedText = sessionStorage.getItem("usageAspectsMain");
    if (storedText) {
      const ta = container.querySelector("#usageAspectsMain");
      if (ta) ta.value = storedText;
    }
  });
}
/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();