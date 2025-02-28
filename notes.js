/** NOTES MODULE HTML **/
const notesHTML = `
  <h2>Notes Module</h2>
  <form>
    <label for="notesArea">Add / Edit Note:</label>
    <textarea id="notesArea" style="width:100%;height:120px;overflow:auto;"></textarea>
    <button type="button" onclick="saveNote()">Save Note</button>

    <h3>Remove Note</h3>
    <label><input type="checkbox" id="removeNoteConfirm"> Confirm removal</label>

    <div style="margin-top:1rem;">
      <button type="button" onclick="saveNotes()">Save (conlangname_notes.clng)</button>
      <button type="button" onclick="loadNotes()">Load</button>
    </div>
  </form>
`;

/** Open Notes WinBox **/
function openNotesModule() {
  createWinBox("Notes Module", notesHTML);
}

/** Placeholders **/
function saveNote() {
  alert("Save the currently edited note (placeholder).");
}

function saveNotes() {
  saveProject("conlangname_notes.clng");
}

function loadNotes() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".clng";
  input.onchange = () => loadProject(input.files[0]);
  input.click();
}
