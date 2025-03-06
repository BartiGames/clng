/*
 * File: glyphAPI.js
 * Description: Provides the GlyphEditor class for editing and compressing glyph representations on a grid.
 * Version: 1.0.0
 * Comments: Features drawing controls, undo/redo functionality, and output compression.
 * MD5 Sum: [INSERT_MD5_HASH_HERE]
 */
class GlyphEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error("Container not found: " + containerId);
    this.resolution = options.resolution || 64;
    this.editable = options.editable !== undefined ? options.editable : true;
    // outputVisible controls whether the live compressed output is shown.
    this.outputVisible = options.outputVisible !== undefined ? options.outputVisible : false;
    this.onChange = options.onChange || function (compressed) {};
    this.cells = [];
    this.history = [];
    this.historyIndex = -1;
    this.isDrawing = false;
    this._init();
  }

  _init() {
    // Clear container
    this.container.innerHTML = "";

    // Create grid container
    this.grid = document.createElement("div");
    this.grid.id = "GlpHgrid_" + Math.random().toString(36).substr(2, 9);
    this.grid.style.display = "grid";
    this.grid.style.gridTemplateColumns = `repeat(${this.resolution}, 10px)`;
    this.grid.style.gridTemplateRows = `repeat(${this.resolution}, 10px)`;
    this.grid.style.gap = this.editable ? "1px" : "0"; // no gap for non-editable glyphs
    this.grid.style.margin = "20px auto";
    this.grid.style.width = "fit-content";
    this.container.appendChild(this.grid);

    // Create cells
    for (let i = 0; i < this.resolution * this.resolution; i++) {
      const cell = document.createElement("div");
      cell.classList.add("GlpHcell");
      // Set initial style
      cell.style.width = "10px";
      cell.style.height = "10px";
      cell.style.background = "#fff";
      cell.style.border = this.editable ? "1px solid #ddd" : "none";
      cell.style.cursor = this.editable ? "pointer" : "default";
      if (this.editable) {
        cell.addEventListener("mousedown", () => {
          cell.classList.add("active");
          cell.style.background = "#000";
        });
        cell.addEventListener("mouseenter", () => {
          if (this.isDrawing) {
            cell.classList.add("active");
            cell.style.background = "#000";
          }
        });
      }
      this.grid.appendChild(cell);
      this.cells.push(cell);
    }

    // If editable, add event listeners and controls.
    if (this.editable) {
      this.grid.addEventListener("mousedown", () => {
        this.isDrawing = true;
      });
      window.addEventListener("mouseup", () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this._captureState();
        }
      });

      // Create control buttons.
      this.controls = document.createElement("div");
      this.controls.id = "GlpHcontrols_" + Math.random().toString(36).substr(2, 9);
      this.controls.style.textAlign = "center";
      this.controls.style.marginBottom = "10px";

      const clearBtn = document.createElement("button");
      clearBtn.id = "GlpHclearBtn_" + Math.random().toString(36).substr(2, 9);
      clearBtn.textContent = "Clear";
      clearBtn.addEventListener("click", () => {
        this.clear();
      });
      this.controls.appendChild(clearBtn);

      const undoBtn = document.createElement("button");
      undoBtn.id = "GlpHundoBtn_" + Math.random().toString(36).substr(2, 9);
      undoBtn.textContent = "Undo";
      undoBtn.style.marginLeft = "5px";
      undoBtn.addEventListener("click", () => {
        this.undo();
      });
      this.controls.appendChild(undoBtn);

      const redoBtn = document.createElement("button");
      redoBtn.id = "GlpHredoBtn_" + Math.random().toString(36).substr(2, 9);
      redoBtn.textContent = "Redo";
      redoBtn.style.marginLeft = "5px";
      redoBtn.addEventListener("click", () => {
        this.redo();
      });
      this.controls.appendChild(redoBtn);

      // Insert controls above the grid.
      this.container.insertBefore(this.controls, this.grid);
    }

    // Create output area for live compressed text.
    this.outputDiv = document.createElement("div");
    this.outputDiv.id = "GlpHoutput_" + Math.random().toString(36).substr(2, 9);
    this.outputDiv.style.textAlign = "center";
    this.outputDiv.style.fontFamily = "monospace";
    this.outputDiv.style.marginTop = "10px";
    this.outputDiv.style.wordBreak = "break-all";
    this.outputDiv.style.display = this.outputVisible ? "block" : "none";
    this.container.appendChild(this.outputDiv);

    // Initialize history with an empty grid.
    this._captureState();
  }

  // Method to toggle the output visibility.
  toggleOutput() {
    if (this.outputDiv.style.display === "none") {
      this.outputDiv.style.display = "block";
      this.outputVisible = true;
    } else {
      this.outputDiv.style.display = "none";
      this.outputVisible = false;
    }
  }

  // --- Compression Functions (Optimized for Straight Lines) ---
  _encodeRow(rowArr) {
    if (rowArr.every((bit) => !bit)) return "W";
    if (rowArr.every((bit) => bit)) return "B";
    const bin = rowArr.map((bit) => (bit ? "1" : "0")).join("");
    let hex = BigInt("0b" + bin).toString(16).padStart(16, "0");
    return "H" + hex;
  }

  _runLengthEncode(tokens) {
    let encoded = [];
    let count = 1;
    for (let i = 1; i <= tokens.length; i++) {
      if (tokens[i] === tokens[i - 1]) {
        count++;
      } else {
        encoded.push(count > 1 ? count + "*" + tokens[i - 1] : tokens[i - 1]);
        count = 1;
      }
    }
    return encoded.join(",");
  }

  _compressState(arr) {
    let tokens = [];
    for (let r = 0; r < this.resolution; r++) {
      const start = r * this.resolution;
      const row = arr.slice(start, start + this.resolution);
      tokens.push(this._encodeRow(row));
    }
    const rle = this._runLengthEncode(tokens);
    return LZString.compressToEncodedURIComponent(rle);
  }

  _runLengthDecode(str) {
    let tokens = [];
    const parts = str.split(",");
    for (let part of parts) {
      if (part.includes("*")) {
        const [count, token] = part.split("*");
        for (let i = 0; i < parseInt(count, 10); i++) {
          tokens.push(token);
        }
      } else {
        tokens.push(part);
      }
    }
    return tokens;
  }

  _decodeRow(token) {
    if (token === "W") return Array(this.resolution).fill(false);
    if (token === "B") return Array(this.resolution).fill(true);
    if (token[0] === "H") {
      let hex = token.slice(1);
      let bin = BigInt("0x" + hex).toString(2).padStart(this.resolution, "0");
      return Array.from(bin).map((ch) => ch === "1");
    }
    throw new Error("Invalid row token: " + token);
  }

  _decompressState(compressed) {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    const tokens = this._runLengthDecode(decompressed);
    let arr = [];
    for (let token of tokens) {
      arr = arr.concat(this._decodeRow(token));
    }
    return arr;
  }

  // --- History and Output ---
  _updateOutput() {
    const stateArr = this.cells.map((cell) => cell.classList.contains("active"));
    const compressed = this._compressState(stateArr);
    this.outputDiv.textContent = compressed;
    this.onChange(compressed);
  }

  _captureState() {
    if (this.historyIndex < this.history.length - 1)
      this.history = this.history.slice(0, this.historyIndex + 1);
    const state = this.cells.map((cell) => cell.classList.contains("active"));
    this.history.push(state);
    this.historyIndex++;
    this._updateOutput();
  }

  _applyState(state) {
    this.cells.forEach((cell, i) => {
      if (state[i]) {
        cell.classList.add("active");
        cell.style.background = "#000";
      } else {
        cell.classList.remove("active");
        cell.style.background = "#fff";
      }
    });
    this._updateOutput();
  }

  getCompressed() {
    const stateArr = this.cells.map((cell) => cell.classList.contains("active"));
    return this._compressState(stateArr);
  }

  // loadGlyph: always set black for true bits regardless of editable mode.
  // In non-editable mode, borders and grid gaps are removed so only the glyph remains.
  loadGlyph(compressed, editable = this.editable) {
    const stateArr = this._decompressState(compressed);
    if (stateArr.length !== this.cells.length)
      throw new Error("Invalid glyph size.");
    this.cells.forEach((cell, i) => {
      if (stateArr[i]) {
        cell.classList.add("active");
        cell.style.background = "#000";
      } else {
        cell.classList.remove("active");
        cell.style.background = "#fff";
      }
      // If non-editable, remove borders.
      if (!editable) {
        cell.style.border = "none";
      } else {
        cell.style.border = "1px solid #ddd";
      }
    });
    // Adjust grid gap for non-editable mode.
    this.grid.style.gap = editable ? "1px" : "0";
    if (editable !== this.editable) {
      this.setEditable(editable);
    }
    // FIX: Ensure drawing is stopped when loading a glyph for editing.
    this.isDrawing = false;
    this._captureState();
  }

  clear() {
    this.cells.forEach((cell) => {
      cell.classList.remove("active");
      cell.style.background = "#fff";
    });
    this._captureState();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this._applyState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this._applyState(this.history[this.historyIndex]);
    }
  }

  setEditable(isEditable) {
    this.editable = isEditable;
    // Replace each cell with a clone to remove or add listeners.
    this.cells.forEach((cell) => {
      cell.style.cursor = isEditable ? "pointer" : "default";
      const newCell = cell.cloneNode(true);
      newCell.className = cell.className;
      this.grid.replaceChild(newCell, cell);
    });
    this.cells = Array.from(this.grid.children);
    if (isEditable) {
      this.cells.forEach((cell) => {
        cell.style.cursor = "pointer";
        cell.style.border = "1px solid #ddd";
        cell.addEventListener("mousedown", () => {
          cell.classList.add("active");
          cell.style.background = "#000";
        });
        cell.addEventListener("mouseenter", () => {
          if (this.isDrawing) {
            cell.classList.add("active");
            cell.style.background = "#000";
          }
        });
      });
      this.grid.addEventListener("mousedown", () => {
        this.isDrawing = true;
      });
      window.addEventListener("mouseup", () => {
        if (this.isDrawing) {
          this.isDrawing = false;
          this._captureState();
        }
      });
      if (this.controls) this.controls.style.display = "block";
      this.grid.style.gap = "1px";
    } else {
      if (this.controls) this.controls.style.display = "none";
      this.grid.style.gap = "0";
      this.cells.forEach((cell) => {
        cell.style.cursor = "default";
        cell.style.border = "none";
      });
    }
    this._updateOutput();
  }
}

// Export if using a module system
if (typeof module !== "undefined" && module.exports) {
  module.exports = GlyphEditor;
}
