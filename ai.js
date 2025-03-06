/*
 * File: ai.js
 * Description: Implements the AI toolkit using the new chat-style design.
 * Version: 2.0.8 Modified for context agents.
 */

const aiHTML = `
  <div class="ai-container">
    <div class="sidebar">
      <div class="sidebar-section">
        <h3 onclick="toggleSection(this)">AI Settings <span>▼</span></h3>
        <div class="sidebar-content">
          <label>Response length 
            <input type="text" /> sentences
          </label>
          <!-- Added id for the Think & Analyze checkbox -->
          <label><input type="checkbox" id="thinkAnalyzeCheckbox" /> Think &amp; Analyze</label>
          <label><input type="checkbox" /> Allow Live Mods</label>
          <label><input type="checkbox" /> Detailed Explanation</label>
          <label><input type="checkbox" /> Explain Terminology</label>
          <label><input type="checkbox" /> Guard Agent</label>
        </div>
      </div>
      <div class="sidebar-section">
        <h3 onclick="toggleSection(this)">Context Settings <span>▼</span></h3>
        <div class="sidebar-content">
          <label><input type="checkbox" id="phonologyCheckbox" /> Phonology Agent</label>
          <label><input type="checkbox" id="culturalCheckbox" /> Cultural Agent</label>
        </div>
      </div>
      <div class="sidebar-section">
        <h3 onclick="toggleSection(this)">Tool Options <span>▼</span></h3>
        <div class="sidebar-content">
          <p>Additional tool settings can go here.</p>
        </div>
      </div>
    </div>
    <div class="chat-area">
      <!-- The .messages container starts empty -->
      <div class="messages"></div>
      <div class="input-row">
        <input type="text" placeholder="Type your message..." />
        <button>&gt;</button>
      </div>
    </div>
  </div>
`;

/**
 * Opens the AI Toolkit in a WinBox window.
 * The onCreate callback attaches the chat listeners once the DOM is in place.
 */
function openAIToolkit() {
  createWinBox("AI-Assisted Language Tools", aiHTML, attachChatListeners);

}

function toggleSection(header) {
  const content = header.nextElementSibling;
  const indicator = header.querySelector("span");
  if (!content.style.display || content.style.display === "block") {
    content.style.display = "none";
    indicator.innerHTML = "►";
  } else {
    content.style.display = "block";
    indicator.innerHTML = "▼";
  }
}

/* Healthcheck registration */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();

/**
 * Global function to toggle the thinking container.
 * Called by the expand/collapse icon.
 */
function toggleThinkingSection(icon) {
  const thinkingContainer = icon.previousElementSibling;
  if (!thinkingContainer) return;
  if (thinkingContainer.style.display === "none" || thinkingContainer.style.display === "") {
    thinkingContainer.style.display = "block";
    thinkingContainer.style.overflowY = "scroll";
    thinkingContainer.style.backgroundColor = "null"; 
    thinker.style.transform = "translateX(-30px)";
  } else {
    thinkingContainer.style.display = "none";
  }
}

/**
 * Attaches chat listeners to the newly created WinBox container.
 * Implements the "Think & Analyze" flow if selected, then adds an expand icon for the thinking section.
 */
function attachChatListeners(container) {
  // Locate DOM elements within the container
  const chatInput = container.querySelector(".chat-area .input-row input");
  const chatButton = container.querySelector(".chat-area .input-row button");
  const messagesContainer = container.querySelector(".chat-area .messages");

  if (!chatInput || !chatButton || !messagesContainer) {
    console.error("Chat elements not found. Cannot attach listeners.");
    return;
  }

  function colorizeThinkingText(text) {
    // Wrap anything inside square brackets in a span with class "bracket"
    text = text.replace(/\[(.*?)\]/g, '<span class="bracket">[$1]</span>');
    // Wrap anything inside double quotes in a span with class "quote"
    text = text.replace(/"(.*?)"/g, '<span class="quote">"$1"</span>');
    return text;
  }
  
  // Keep track of user messages for context
  let chatUserMessages = [];
  let aiBubbles;
  let LastFinalaiResponse = "";

  // Helper: Scroll messages to bottom
  function scrollMessages() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Sends the user's message along with the Think & Analyze flow if selected.
  async function sendUserMessage() {
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Create and append a user bubble
    const userBubble = document.createElement("div");
    userBubble.className = "user-bubble";
    userBubble.innerHTML = `
      <p>${userText}</p>
      <div class="bubble-arrow user-arrow"></div>
      <span class="timestamp">${new Date().toLocaleTimeString()}</span>
    `;
    messagesContainer.appendChild(userBubble);
    chatUserMessages.push(userText);
    chatInput.value = "";
    scrollMessages();

    // Use the last 3 user messages as context
    const contextMessages = chatUserMessages.slice(-3).join("\n");

    // Create an AI bubble with a thinking section
    const aiBubble = document.createElement("div");
    aiBubble.className = "ai-bubble";
    aiBubble.style.width = "80%";
    aiBubble.innerHTML = `
      <div class="thinking-container">
        <div class="thinking-spinner"></div>
        <div class="thinking-scroll">
          <p></p>
        </div>
      </div>
      <p></p>
      <div class="bubble-arrow ai-arrow"></div>
      <span class="timestamp">${new Date().toLocaleTimeString()}</span>
    `;
    const buble = new Audio('notif.mp3');
    buble.play();
    messagesContainer.appendChild(aiBubble);
    scrollMessages();

    // Locate the thinking paragraph to append partial results
    const thinkingParagraph = aiBubble.querySelector(".thinking-scroll p");
    let thinkingContent = "";

    // Check if "Think & Analyze" is selected
    const thinkAnalyzeCheckbox = container.querySelector("#thinkAnalyzeCheckbox");
    if (thinkAnalyzeCheckbox && thinkAnalyzeCheckbox.checked) {
      // Helper function to call aiIntegrator and get a response
      async function callAI(context, prompt, responseLength, formatting) {
        const integrator = new aiIntegrator(context, prompt, responseLength, formatting);
        const resp = await integrator.getResponse();
        return resp || "";
      }
      try {
        // Step 1: Summarize the task from the user's prompt in one sentence.
        const step1 = await callAI(
          "",
          "Summarize`:" + userText + "` what seems to be task or question in this sentence? Do not answer it just summarize. (ignore missing context) (do not suggest anything) (do not quote)",
          100,
          "One Sentence Short summary (do not quote orginal question) Respond by: `The task or question is` do not say `unknown due to missing context` or `unspecified task`"
        );
        thinkingContent += "[Task] " + step1 + "\n";
        thinkingParagraph.textContent = thinkingContent;
       
        // Step 2: Summarize the intent using the user's prompt plus the previous result.
        const step2 = await callAI(
          "In sentence:" + userText,
          "What seems to be an intention of this sentece ? (ignore missing context) (do not suggest anything) (do not quote)",
          100,
          "One Sentence Short summary (do not quote) do not say `unknown due to missing context` or `unspecified task` "
        );
        thinkingContent += "[Intent] " + step2 + "\n";
        thinkingParagraph.textContent = thinkingContent;
        
        if (aiBubbles && aiBubbles.length > 0) {
          const lastAIBubble = aiBubbles[aiBubbles.length - 1];
          const finalResponseElem = lastAIBubble.querySelector("p:not(.thinking-scroll p)");
          if (finalResponseElem) {
            LastFinalaiResponse = finalResponseElem.innerText;
          }
        }
   
        // Step 3: If the last final AI message exists, summarize it and append to the thinking section.
        if (LastFinalaiResponse.trim() !== "") {
          const step3 = await callAI(
            "Final message: " + LastFinalaiResponse,
            "Summarize the above AI response in one short sentence (ignore missing context) (do not suggest anything) (do not quote)",
            500,
            "(do not quote) Respond by: `Summary:`"
          );
          thinkingContent += "[Summary] " + step3 + "\n";
          thinkingParagraph.innerHTML = colorizeThinkingText(thinkingContent);
          thinkingParagraph.textContent = thinkingContent;
        }
      } catch (e) {
        console.error("Error in Think & Analyze steps: " + e.message);
      }
    }

    // Append context from sessionStorage if context agents are selected
    let prefix = "";
    if (document.getElementById("phonologyCheckbox") && document.getElementById("phonologyCheckbox").checked) {
      const phonData = sessionStorage.getItem("phonologyMain") || "";
      thinkingContent += "[Conlang Phonology Context] " + phonData + "\n";
      prefix += "[Conlang Phonology Context] ";
      thinkingParagraph.textContent = thinkingContent;
    }
    if (document.getElementById("culturalCheckbox") && document.getElementById("culturalCheckbox").checked) {
      const culturalData = sessionStorage.getItem("culturalMain") || "";
      thinkingContent += "[Cultural Agent Context] " + culturalData + "\n";
      prefix += "[Cultural Agent Context] ";
      thinkingParagraph.textContent = thinkingContent;
    }

    const ContextSumarize = new aiIntegrator(contextMessages, "What this conversation is about? do not quote just summarize the topic", 100, "Short summary (do not quote)");
    const ContextSummary = await ContextSumarize.getResponse();

  
    // Final step: Call the normal AI integration function using context that includes the thinking content.
    const finalContext = ContextSummary + (thinkingContent ? "\n" + thinkingContent : "");
    const finalUserText = prefix + userText;
    try {
      const finalIntegrator = new aiIntegrator("You are a conlang creation Agent, Respond to question or task:" + finalUserText, finalContext, null, "Ensure the question & response is aligned with language creation scope - If its not respond: `This is not in my scope`. Do not quote question or task just respond");
      const finalResponse = await finalIntegrator.getResponse();
      
      const finalTextElem = aiBubble.querySelector("p:not(.thinking-scroll p)");
      
      if (finalTextElem) {
        const formatHTMLPrompt = "Format the following text into valid HTML : wrap the entire content inside a <p> tag and replace newline characters with <br> tags. replace **Some Text** with <b> (include only if nessesary), and `-` or `*`  with proper lists <li> (include only if nessesary) Return only the formatted HTML. Text: ";
        const htmlIntegrator = new aiIntegrator(finalResponse, formatHTMLPrompt, null, null);
        const formattedResponse = await htmlIntegrator.getResponse();
        finalTextElem.innerHTML = formattedResponse || "No response.";
        aiBubbles = document.querySelectorAll('.ai-bubble');
      }
    } catch (e) {
      console.error("Error in final AI integration: " + e.message);
      const finalTextElem = aiBubble.querySelector("p:not(.thinking-scroll p)");
      if (finalTextElem) {
        finalTextElem.textContent = "AI Response FAIL";
      }
    }

    // Once the final response is delivered, remove auto-scrolling and blur
    const thinkingScroll = aiBubble.querySelector(".thinking-scroll");
    if (thinkingScroll) {
      thinkingScroll.style.animation = "none";
      thinkingScroll.style.transform = "translateX(-2.1rem)";
      thinkingScroll.style.filter = "none";
      thinkingScroll.style.overflowY = "auto"; // Allow manual scrolling
      
    }
    const thinkingSpinner = aiBubble.querySelector(".thinking-spinner");
    if (thinkingSpinner) {
      thinkingSpinner.style.display = "none";
      
    }

    // Add expand/collapse icon if there is thinking content
    const thinkingContainer = aiBubble.querySelector(".thinking-container");
    if (thinkingContainer) {
      if (thinkingContent.trim() !== "") {
        const expandIcon = document.createElement("span");
        expandIcon.innerHTML = "🤖";
        if (ContextSummary !== null && document.getElementById("expandIcon") !== null) {
          expandIcon.innerHTML += ContextSummary;
       }
        expandIcon.id = "expandIcon";
        expandIcon.style.cursor = "pointer";
        expandIcon.style.marginLeft = "10px";
        expandIcon.style.fontSize = "20px";
        expandIcon.setAttribute("onclick", "toggleThinkingSection(this)");
        thinkingContainer.parentElement.insertBefore(expandIcon, thinkingContainer.nextSibling);
        // Hide the thinking container by default
        thinkingContainer.style.display = "none";
      } else {
        thinkingContainer.style.display = "none";
        
      }
    }

    // Update the timestamp
    const timestampSpan = aiBubble.querySelector(".timestamp");
    if (timestampSpan) {
      timestampSpan.textContent = new Date().toLocaleTimeString();
    }
    scrollMessages();
    
  }

  // Send user message on button click or when Enter is pressed
  chatButton.addEventListener("click", sendUserMessage);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendUserMessage();
    }
  });
}

/* healthcheck */
(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  window.registerHealthCheck(myURL);
})();
