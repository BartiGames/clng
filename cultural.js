function promptForTitle(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";
  const label = document.createElement("div");
  label.innerHTML = "<strong>Title:</strong>";
  modalContent.appendChild(label);
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.style.width = "80%";
  titleInput.style.padding = "6px";
  titleInput.style.margin = "10px 0";
  modalContent.appendChild(titleInput);
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
    if (enteredTitle === "") {
      showModal("Error", "Title cannot be empty.");
      return;
    }
    modal.close();
    callback(enteredTitle);
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
    title: "Enter Title",
    modal: true,
    width: "35%",
    height: "20%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

function promptForHistoricalTitle(callback) {
  const modalContent = document.createElement("div");
  modalContent.style.padding = "10px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";
  modalContent.style.alignItems = "center";
  modalContent.style.justifyContent = "center";
  modalContent.style.textAlign = "center";
  const titleLabel = document.createElement("div");
  titleLabel.innerHTML = "<strong>Event Title:</strong>";
  modalContent.appendChild(titleLabel);
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.style.width = "80%";
  titleInput.style.padding = "6px";
  titleInput.style.margin = "5px 0 10px 0";
  modalContent.appendChild(titleInput);
  const dateLabel = document.createElement("div");
  dateLabel.innerHTML = "<strong>Date:</strong>";
  modalContent.appendChild(dateLabel);
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.style.width = "80%";
  dateInput.style.padding = "6px";
  dateInput.style.margin = "5px 0 10px 0";
  modalContent.appendChild(dateInput);
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
    const enteredDate = dateInput.value.trim();
    if (enteredTitle === "" || enteredDate === "") {
      showModal("Error", "Both title and date must be provided.");
      return;
    }
    modal.close();
    callback({ title: enteredTitle, date: enteredDate });
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
    title: "Enter Event Title and Date",
    modal: true,
    width: "35%",
    height: "25%",
    x: "center",
    y: "center",
    mount: modalContent,
    onfocus: function() {
      this.setBackground("#444");
    }
  });
}

function toggleSummaryVisibility() {
  const summaryContent = document.getElementById("summaryContent");
  const summaryHeader = document.getElementById("summaryHeader");
  const smallText = summaryHeader.querySelector("small");
  if (summaryContent.style.display === "none" || summaryContent.style.display === "") {
    summaryContent.style.display = "block";
    if (smallText) smallText.textContent = "(click to collapse)";
  } else {
    summaryContent.style.display = "none";
    if (smallText) smallText.textContent = "(click to expand)";
  }
}

function selectCulturalTab(tabKey) {
  document.querySelectorAll(".cultural-tab").forEach(div => {
    div.style.display = "none";
  });
  const target = document.getElementById(`tab-${tabKey}`);
  if (target) {
    target.style.display = "block";
  }
  document.querySelectorAll(".cultural-tab-btn").forEach(btn => {
    btn.style.fontWeight = "normal";
    btn.style.textDecoration = "none";
  });
  const activeBtn = document.querySelector(`.cultural-tab-btn[data-tab="${tabKey}"]`);
  if (activeBtn) {
    activeBtn.style.fontWeight = "bold";
    activeBtn.style.textDecoration = "underline";
  }
  const defaultMsg = document.getElementById("culturalDefault");
  if (defaultMsg) {
    defaultMsg.style.display = "none";
  }
}

function createCulturalRow(categoryKey, item) {
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
  if (categoryKey === "historical") {
    titleDiv.innerHTML = "<strong>Title:</strong> " + item.title + " <em>(Date: " + item.date + ")</em>";
  } else {
    titleDiv.innerHTML = "<strong>Title:</strong> " + item.title;
  }
  leftDiv.appendChild(titleDiv);
  const contentDiv = document.createElement("div");
  contentDiv.textContent = item.content;
  leftDiv.appendChild(contentDiv);
  li.appendChild(leftDiv);
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.gap = "5px";
  const editBtn = document.createElement("button");
  editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
  editBtn.title = "Edit this cultural aspect";
  editBtn.style.padding = "4px 8px";
  editBtn.style.cursor = "pointer";
  editBtn.style.border = "none";
  editBtn.style.backgroundColor = "#ffc107";
  editBtn.style.color = "white";
  editBtn.style.borderRadius = "4px";
  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = "<span class='iconify' data-icon='mdi:trash-can-outline'></span>";
  removeBtn.title = "Remove this cultural aspect";
  removeBtn.style.padding = "4px 8px";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.border = "none";
  removeBtn.style.backgroundColor = "#dc3545";
  removeBtn.style.color = "white";
  removeBtn.style.borderRadius = "4px";
  btnContainer.appendChild(editBtn);
  btnContainer.appendChild(removeBtn);
  li.appendChild(btnContainer);
  removeBtn.onclick = () => confirmDelete(categoryKey, item, li);
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
    let dateInput;
    if (categoryKey === "historical") {
      dateInput = document.createElement("input");
      dateInput.type = "date";
      dateInput.value = item.date;
      dateInput.className = "editDate";
      dateInput.style.width = "100%";
      dateInput.style.padding = "4px";
      dateInput.style.border = "1px solid #ccc";
      dateInput.style.borderRadius = "4px";
      editContainer.appendChild(dateInput);
    }
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
      let newDate = "";
      if (categoryKey === "historical") {
        newDate = dateInput.value.trim();
      }
      if (newTitle === "" || newContent === "" || (categoryKey === "historical" && newDate === "")) {
        showModal("Error", "All fields must be filled.");
        return;
      }
      const arr = projectData.culture[categoryKey];
      const idx = arr.findIndex(obj =>
        obj.title === item.title &&
        obj.content === item.content &&
        (categoryKey !== "historical" || obj.date === item.date)
      );
      if (idx !== -1) {
        arr[idx].title = newTitle;
        arr[idx].content = newContent;
        if (categoryKey === "historical") {
          arr[idx].date = newDate;
        }
      }
      item.title = newTitle;
      item.content = newContent;
      if (categoryKey === "historical") {
        item.date = newDate;
        titleDiv.innerHTML = "<strong>Title:</strong> " + newTitle + " <em>(Date: " + newDate + ")</em>";
      } else {
        titleDiv.innerHTML = "<strong>Title:</strong> " + newTitle;
      }
      contentDiv.textContent = newContent;
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      btnContainer.removeChild(cancelBtn);
      editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
      editBtn.title = "Edit this cultural aspect";
      editBtn.onclick = enableEdit;
      updateCulturalAspectsMain();
    };
    cancelBtn.onclick = function() {
      li.removeChild(editContainer);
      leftDiv.style.display = "flex";
      editBtn.innerHTML = "<span class='iconify' data-icon='mdi:pencil-outline'></span>";
      editBtn.title = "Edit this cultural aspect";
      editBtn.onclick = enableEdit;
      btnContainer.removeChild(cancelBtn);
    };
  }
  editBtn.onclick = enableEdit;
  return li;
}

function addCulturalDetail(categoryKey) {
  const input = document.getElementById(`${categoryKey}Input`);
  const list = document.getElementById(`${categoryKey}List`);
  if (!input || !list) return;
  const content = input.value.trim();
  if (!content) return;
  input.value = "";
  if (categoryKey === "historical") {
    promptForHistoricalTitle(function(data) {
      if (projectData.culture[categoryKey] && projectData.culture[categoryKey].some(obj =>
        obj.title === data.title && obj.date === data.date && obj.content === content
      )) {
        showModal("Warning", "This historical event already exists!");
        return;
      }
      if (!projectData.culture[categoryKey]) {
        projectData.culture[categoryKey] = [];
      }
      const newItem = { title: data.title, date: data.date, content: content };
      projectData.culture[categoryKey].push(newItem);
      const li = createCulturalRow(categoryKey, newItem);
      list.appendChild(li);
      updateCulturalAspectsMain();
    });
  } else {
    promptForTitle(function(title) {
      if (projectData.culture[categoryKey] && projectData.culture[categoryKey].some(obj =>
        obj.title === title && obj.content === content
      )) {
        showModal("Warning", "This cultural aspect already exists!");
        return;
      }
      if (!projectData.culture[categoryKey]) {
        projectData.culture[categoryKey] = [];
      }
      const newItem = { title: title, content: content };
      projectData.culture[categoryKey].push(newItem);
      const li = createCulturalRow(categoryKey, newItem);
      list.appendChild(li);
      updateCulturalAspectsMain();
    });
  }
}

function confirmDelete(categoryKey, item, liElem) {
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
  message.textContent = `Are you sure you want to delete "${item.title}"?`;
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
    doDelete(categoryKey, item, liElem);
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

function doDelete(categoryKey, item, liElem) {
  if (!projectData.culture[categoryKey]) return;
  projectData.culture[categoryKey] = projectData.culture[categoryKey].filter(
    obj => !(
      obj.title === item.title &&
      obj.content === item.content &&
      (categoryKey !== "historical" || obj.date === item.date)
    )
  );
  liElem.remove();
  updateCulturalAspectsMain();
}

function updateCulturalAspectsMain() {
  let lines = [];
  for (let [cat, arr] of Object.entries(projectData.culture)) {
    if (arr.length > 0) {
      lines.push(cat.charAt(0).toUpperCase() + cat.slice(1) + ":");
      arr.forEach(obj => {
        if (cat === "historical") {
          lines.push("  Title: " + obj.title + " (Date: " + obj.date + ")");
        } else {
          lines.push("  Title: " + obj.title);
        }
        lines.push("  " + obj.content);
      });
      lines.push("");
    }
  }
  const ta = document.getElementById("culturalAspectsMain");
  if (ta) {
    ta.value = lines.join("\n");
    sessionStorage.setItem("culturalAspectsMain", ta.value);
    sessionStorage.setItem("culturalProjectData", JSON.stringify(projectData.culture));
  }
}

function saveCulture() {
  let conlangName = sessionStorage.getItem("clng_name");
  if (!conlangName || conlangName.trim() === "") {
    conlangName = "untitled";
  }
  const xml = `<conlang>
  <name>${JSON.stringify(conlangName)}</name>
  <culture>${JSON.stringify(projectData.culture)}</culture>
</conlang>`;
  const blob = new Blob([xml], { type: "application/xml" });
  const filename = conlangName + "_culture.clng";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function loadCulture() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => {
    loadProject(input.files[0]);
    setTimeout(() => {
      repopulateCulturalTabs();
      updateCulturalAspectsMain();
    }, 300);
  };
  input.click();
}

function repopulateCulturalTabs() {
  const categories = ["folklore","historical","socio","myth","ritual","names","taboos","artlit"];
  categories.forEach(cat => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
    (projectData.culture[cat] || []).forEach(obj => {
      const li = createCulturalRow(cat, obj);
      list.appendChild(li);
    });
  });
}

function copyCulturalAspects() {
  const ta = document.getElementById("culturalAspectsMain");
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => {
    showModal("Success", "Cultural aspects copied to clipboard!");
  }, () => {
    showModal("Error", "Failed to copy!");
  });
}

function clearCulture() {
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
  message.textContent = "Are you sure you want to clear all cultural aspects?";
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
    doClearCulture();
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

function doClearCulture() {
  projectData.culture = {};
  const categories = ["folklore","historical","socio","myth","ritual","names","taboos","artlit"];
  categories.forEach(cat => {
    const list = document.getElementById(cat + "List");
    if (list) list.innerHTML = "";
  });
  updateCulturalAspectsMain();
  sessionStorage.removeItem("culturalAspectsMain");
  sessionStorage.removeItem("culturalProjectData");
}

function addCulturalAspect() {
  showModal("Notice", "Add Cultural Aspect (placeholder).");
}
function editCulturalAspect() {
  showModal("Notice", "Edit Cultural Aspect (placeholder).");
}
function removeCulturalAspect() {
  showModal("Notice", "Remove selected Cultural Aspect (placeholder).");
}

const culturalHTML = `
<div style="display: flex; flex-direction: column; height: 100%; box-sizing: border-box; padding: 10px;">
  <h2 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
    <span><span class="iconify" data-icon="mdi:account-group-outline"></span> Cultural Agent</span>
  </h2>
  <div id="culturalTabBar" style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1rem; padding: 10px; border-radius: 6px;">
    ${
      [
        { tab: "folklore", icon: "mdi:book-open-page-variant-outline", tooltip: "Click to add folklore-related cultural aspects." },
        { tab: "historical", icon: "mdi:bank-outline", tooltip: "Click to describe historical influences on the language." },
        { tab: "socio", icon: "mdi:account-voice", tooltip: "Click to define sociolinguistic features of the culture." },
        { tab: "myth", icon: "mdi:castle", tooltip: "Click to add mythology and legendary stories." },
        { tab: "ritual", icon: "mdi:theater", tooltip: "Click to document rituals and traditions." },
        { tab: "names", icon: "mdi:format-title", tooltip: "Click to define naming conventions and honorifics." },
        { tab: "taboos", icon: "mdi:alert-octagon-outline", tooltip: "Click to specify cultural taboos and restricted speech." },
        { tab: "artlit", icon: "mdi:palette", tooltip: "Click to describe artistic and literary traditions." }
      ].map(({ tab, icon, tooltip }) =>
        `<button type="button" class="cultural-tab-btn" data-tab="${tab}"
          style="padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: bold; text-decoration: underline;"
          title="${tooltip}">
          <span class="iconify" data-icon="${icon}"></span> ${tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>`
      ).join('')
    }
  </div>
<div id="culturalContentContainer" style="border: 1px solid; padding: 1.2rem; height: 30vh; overflow: auto; border-radius: 6px; position: relative; margin-bottom: 10px;">
    <div id="culturalDefault" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #888;">
      <span class="iconify" data-icon="mdi:information-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></span>
      Click on a tab to modify
    </div>
    ${
      ["folklore","historical","socio","myth","ritual","names","taboos","artlit"]
        .map(tab => `
          <div class="cultural-tab" id="tab-${tab}" style="display: none;">
            <h3 style="margin-top: 0;">${tab.charAt(0).toUpperCase() + tab.slice(1)}</h3>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="text" id="${tab}Input" placeholder="${tab === 'historical' ? 'Specify event' : 'Enter details...'}"
                     style="flex-grow: 1; padding: 8px; border: 1px solid; border-radius: 4px;"
                     title="${tab === 'historical' ? 'Enter event description' : 'Enter details about this cultural aspect and click Add.'}" />
              <button type="button" onclick="addCulturalDetail('${tab}')"
                      style="padding: 6px 12px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;"
                      title="Click to add this aspect to the list below.">
                Add
              </button>
            </div>
            <ul id="${tab}List" style="list-style: none; margin-top: 0.75rem; padding-left: 0;"></ul>
          </div>
        `).join('')
    }
  </div>
  <div id="summaryContainer" style="position: relative; flex: 1; box-sizing: border-box; padding-bottom: 70px;">
    <h3 id="summaryHeader" onclick="toggleSummaryVisibility()" style="margin: 0 0 5px 0; cursor: pointer;"
        title="This section lists all cultural aspects added from different categories.">
      <span class="iconify" data-icon="mdi:script-text-outline"></span>
      All Cultural Aspects <small style="font-size:0.8em; color:#888;">(click to expand)</small>
    </h3>
    <div id="summaryContent" style="display: none;">
      <textarea id="culturalAspectsMain" readonly
                style="height: 20vh; width: 100%; overflow-y: auto; white-space: pre-wrap; padding: 10px; border: 1px solid; border-radius: 6px; box-sizing: border-box; margin: 0; resize: vertical;">
      </textarea>
    </div>
  </div>
  </div>
<div id="buttonContainer">
    <button type="button" onclick="saveCulture()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;" title="Save">Save</button>
    <button type="button" onclick="loadCulture()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #007bff; color: white; border: none;" title="Load">Load</button>
    <button type="button" onclick="copyCulturalAspects()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #28a745; color: white; border: none;" title="Copy">Copy</button>
    <button type="button" onclick="clearCulture()" style="padding: 8px 14px; cursor: pointer; border-radius: 4px; background: #dc3545; color: white; border: none;" title="Clear">Clear</button>
  </div>
`;

function openCulturalAgent() {
  createWinBox("Cultural Agent", culturalHTML, function(container) {
    const tabButtons = container.querySelectorAll(".cultural-tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tabKey = btn.dataset.tab;
        selectCulturalTab(tabKey);
      });
    });
    const storedData = sessionStorage.getItem("culturalProjectData");
    if (storedData) {
      try {
        projectData.culture = JSON.parse(storedData);
        repopulateCulturalTabs();
      } catch(e) {
        console.warn("Could not parse session storage project data:", e);
      }
    }
    const storedText = sessionStorage.getItem("culturalAspectsMain");
    console.log("Session stored value for culturalAspectsMain:", storedText);
    if (storedText) {
      const ta = container.querySelector("#culturalAspectsMain");
      if (ta) ta.value = storedText;
    }
  
  });
}
/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();
