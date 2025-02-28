/*******************************/
/** Style objects (no global CSS) **/
const langStyles = {
  container:
    "position: relative; " +
    "padding: 1rem; " +
    "font-family: sans-serif; " +
    "display: flex; flex-direction: column; gap: 1rem;",

  label:
    "display: block; " +
    "margin: 0.5rem 0 0.25rem 0; " +
    "font-weight: bold; ",

  labelRed:
    "display: block; " +
    "margin: 0.5rem 0 0.25rem 0; " +
    "font-weight: bold; ",

  input:
    "width: 100%; " +
    "padding: 6px; " +
    "margin-bottom: 0.75rem; " +
    "border: 1px solid; " +
    "border-radius: 4px; ",

  textarea:
    "width: 100%; " +
    "height: 60px; " +
    "padding: 6px; " +
    "margin-bottom: 0.75rem; " +
    "border: 1px solid; " +
    "border-radius: 4px; ",

  select:
    "width: 100%; " +
    "padding: 6px; " +
    "margin-bottom: 0.25rem; " +
    "border: 1px solid; " +
    "border-radius: 4px; ",

  smallRed:
    "font-size: 0.85rem; ",

  smallNote:
    "font-size: 0.9rem; " +
    "display: block; " +
    "margin-top: 0.25rem; ",

  edited:
    "font-size: 0.9rem; " +
    "color: #ff4444; " + 
    "font-weight: bold; " +
    "margin-left: 5px; " +
    "display: none;",

  buttonRow:
    "display: flex; " +
    "justify-content: flex-end; " +
    "gap: 10px; " +
    "margin-top: 1rem;",

  btnBase:
    "padding: 8px 16px; " +
    "border: none; " +
    "border-radius: 4px; " +
    "cursor: pointer; " +
    "color: white; ",
  btnSave:  "background-color: #007bff;",
  btnClear: "background-color: #dc3545;",
};

/*******************************/
/** Global name used elsewhere **/
let conlangName = sessionStorage.getItem("clng_name") || "untitled";

/*******************************/
/** Build Language Settings HTML **/
const langSettingsHTML = `
  <div style="${langStyles.container}">
    <form>
      <label for="langName" style="${langStyles.label}">Language Name</label>
      <input type="text" id="langName" style="${langStyles.input}" placeholder="Language Name">
      <span id="langNameEdited" style="${langStyles.edited}">(edited)</span>

      <label for="langDesc" style="${langStyles.labelRed}">Language Description</label>
      <textarea id="langDesc" style="${langStyles.textarea}" placeholder="Short description"></textarea>
      <span id="langDescEdited" style="${langStyles.edited}">(edited)</span>

      <h3 style="margin-top: 1rem;">Writing System</h3>
      <select id="writingSystemSelect" style="${langStyles.select}">
        <option value="roman">Roman</option>
        <option value="cyrillic">Cyrillic</option>
        <option value="greek">Greek</option>
        <option value="arabic">Arabic</option>
        <option value="hangul">Hangul</option>
        <option value="custom">Custom</option>
      </select>
      <small style="${langStyles.smallNote}">
        If custom, define consonant-vowel mapping for syllabaries/abugidas below.
      </small>
      <textarea id="customMapping" style="${langStyles.textarea}" placeholder="Mapping for custom scripts..."></textarea>
      <span id="customMappingEdited" style="${langStyles.edited}">(edited)</span>

      <h3 style="margin-top: 1rem;">Number System</h3>
      <select id="numberSystemSelect" style="${langStyles.select}">
        <option value="base2">Base 2 (binary)</option>
        <option value="base8">Base 8 (octal)</option>
        <option value="base10" selected>Base 10 (decimal)</option>
        <option value="base12">Base 12 (duodecimal)</option>
        <option value="base16">Base 16 (hexadecimal)</option>
      </select>
      <span id="numberSystemEdited" style="${langStyles.edited}">(edited)</span>
    </form>

    <div style="${langStyles.buttonRow}">
      <button id="btnSave" style="${langStyles.btnBase} ${langStyles.btnSave}">
        <span class="iconify" data-icon="mdi:content-save"></span> Save
      </button>
      <button id="btnClear" style="${langStyles.btnBase} ${langStyles.btnClear}">
        <span class="iconify" data-icon="mdi:delete"></span> Clear
      </button>
    </div>
  </div>
`;

/*******************************/
/** Create WinBox and attach logic **/
function openLanguageSettings() {
  createWinBox("Language Settings", langSettingsHTML, function (container) {
    // References
    const langNameInput     = container.querySelector("#langName");
    const langDescInput     = container.querySelector("#langDesc");
    const writingSelect     = container.querySelector("#writingSystemSelect");
    const customMapping     = container.querySelector("#customMapping");
    const numberSystemSelect= container.querySelector("#numberSystemSelect");

    const editedNameSpan    = container.querySelector("#langNameEdited");
    const editedDescSpan    = container.querySelector("#langDescEdited");
    const editedMapSpan     = container.querySelector("#customMappingEdited");
    const editedNumberSpan  = container.querySelector("#numberSystemEdited");

    const btnSave           = container.querySelector("#btnSave");
    const btnClear          = container.querySelector("#btnClear");

    // Load session values
    langNameInput.value         = conlangName;
    langDescInput.value         = sessionStorage.getItem("clng_desc") || "";
    writingSelect.value         = sessionStorage.getItem("clng_writingsystem") || "roman";
    customMapping.value         = sessionStorage.getItem("clng_custommapping") || "";
    numberSystemSelect.value    = sessionStorage.getItem("clng_numberSystem") || "base10";

    // Edited markers
    langNameInput.addEventListener("input", () => {
      editedNameSpan.style.display = "inline";
    });
    langDescInput.addEventListener("input", () => {
      editedDescSpan.style.display = "inline";
    });
    writingSelect.addEventListener("change", () => {
      editedMapSpan.style.display = "inline";
    });
    customMapping.addEventListener("input", () => {
      editedMapSpan.style.display = "inline";
    });
    numberSystemSelect.addEventListener("change", () => {
      editedNumberSpan.style.display = "inline";
    });

    // Save
    btnSave.addEventListener("click", (e) => {
      e.preventDefault();
      if (!langNameInput.value.trim()) {
        showModal("Error", "Language name cannot be empty.");
        return;
      }
      sessionStorage.setItem("clng_name", langNameInput.value);
      sessionStorage.setItem("clng_desc", langDescInput.value);
      sessionStorage.setItem("clng_writingsystem", writingSelect.value);
      sessionStorage.setItem("clng_custommapping", customMapping.value);
      sessionStorage.setItem("clng_numberSystem", numberSystemSelect.value);

      conlangName = langNameInput.value;
      editedNameSpan.style.display    = "none";
      editedDescSpan.style.display    = "none";
      editedMapSpan.style.display     = "none";
      editedNumberSpan.style.display  = "none";

      showModal("Saved", "Settings saved to sessionStorage.");
    });

    // Clear button with confirmation
    btnClear.addEventListener("click", (e) => {
      e.preventDefault();
      confirmClearFields();
    });

    function confirmClearFields() {
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

      const msg = document.createElement("p");
      msg.textContent = "Are you sure you want to clear all fields?";
      msg.style.margin = "10px 0";
      modalContent.appendChild(msg);

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
        doClearFields();
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

    function doClearFields() {
      langNameInput.value      = "";
      langDescInput.value      = "";
      writingSelect.value      = "roman";
      customMapping.value      = "";
      numberSystemSelect.value = "base10";

      editedNameSpan.style.display    = "none";
      editedDescSpan.style.display    = "none";
      editedMapSpan.style.display     = "none";
      editedNumberSpan.style.display  = "none";
    }
  });
}

