/*
 * File: ai_integrator.js
 * Description: Provides an interface to get AI responses using selected LLM APIs.
 */

function aiIntegrator(context, prompt, responseLength, formatting) {
    // Validate prompt (cannot be null or empty)
//debugging: log the AI call
    const aiLogElem = document.getElementById("AIlog");
    if (aiLogElem) {
      aiLogElem.innerHTML += `AI CALL Cont: \`${context}\` Prompt: \`${prompt}\` RL: \`${responseLength}\` FM: \`${formatting}\` END <br>`;
    }


if (!prompt || prompt.trim() === "") {
      console.error("Prompt cannot be null or empty.");
      return "AI Response FAIL";
    }
    this.context = context;
    this.prompt = prompt;
    this.responseLength = responseLength ? parseInt(responseLength, 10) : null; // in characters
    this.formatting = formatting;
  }
    
  // Utility function to wait for a given number of milliseconds.
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
  aiIntegrator.prototype.getResponse = async function() {
    // Initial delay to help prevent too many requests
    await wait(500);
// Throttle check: count calls within the past 30 seconds.
const now = Date.now();
if (!window.__aiIntegratorCallTimestamps) {
  window.__aiIntegratorCallTimestamps = [];
}
window.__aiIntegratorCallTimestamps.push(now);
// Keep only timestamps within the last 30 seconds.
window.__aiIntegratorCallTimestamps = window.__aiIntegratorCallTimestamps.filter(ts => now - ts < 50000);
if (window.__aiIntegratorCallTimestamps.length > 50) {
  if (typeof showModal === "function" && !window.__aiModalOpen) {
    window.__aiModalOpen = true; // flag to ensure only one modal is open at a time
    showModal("Too Many Requests", "You are making requests too frequently. Please wait a moment before trying again.");
  }
  return "AI Response FAIL";
}

    
    const llmType = sessionStorage.getItem("llmType") || "manual";
    const apiKey = sessionStorage.getItem("llmApiKey") || "";
      
    if (llmType === "manual") {
      return "This Function is not available";
    }
      
    // Compose the base prompt using the appended text, context, prompt, and formatting.
    let cngName = sessionStorage.getItem("clng_name");
if (!cngName || cngName.trim() === "") {
  cngName = "untitled";
}

let basePrompt = `
   Respond in English and in a professional manner.
   Use plaintext only, no code or special characters.
- 
  `;

    
    if (this.context) {
      basePrompt += this.context + "\n";
    }
    basePrompt += this.prompt;
    if (this.formatting) {
      basePrompt += "\nFormatting: " + this.formatting;
    }
      
    // Append instruction regarding maximum allowed characters if specified.
    if (this.responseLength) {
      basePrompt += "\nNote: Your response must not exceed " + this.responseLength + " characters.";
    }
      
    // Helper function to call the API using a given prompt string with error 429 handling.
    const callApi = async (promptContent) => {
      let retries = 0;
      while (retries < 3) {
        try {
          if (llmType === "openai") {
            let res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptContent }],
                max_tokens: 150
              })
            });
            if (res.status === 429) {
              console.error("OpenAI API error 429: Too Many Requests. Retrying...");
              await wait(1000);
              retries++;
              continue;
            }
            if (!res.ok) {
              console.error("OpenAI API error: " + res.status);
              return "";
            }
            let data = await res.json();
            return data?.choices?.[0]?.message?.content?.trim() || "";
              
          } else if (llmType === "google") {
            let googleModel = sessionStorage.getItem("googleModel") || "gemini-1.5-flash";
            let res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + googleModel + ":generateContent?key=" + apiKey, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptContent }] }]
              })
            });
            if (res.status === 429) {
              console.error("Google API error 429: Too Many Requests. Retrying...");
              await wait(1000);
              retries++;
              continue;
            }
            if (!res.ok) {
              console.error("Google API error: " + res.status);
              return "";
            }
            let data = await res.json();
            let candidate = data?.candidates?.[0];
            if (candidate) {
              if (typeof candidate.output === "string") {
                return candidate.output.trim();
              } else if (candidate.content) {
                if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
                  return candidate.content.parts.map(p => typeof p === "object" ? (p.text || "") : p).join("").trim();
                } else if (typeof candidate.content === "string") {
                  return candidate.content.trim();
                }
              }
            }
            return "";
          }
        } catch (error) {
          console.error("Error in callApi: " + error.message);
          return "";
        }
      }
      return "";
    };
    
    // Retry logic for summarization if response is too long.
    let currentPrompt = basePrompt;
    let attempts = 0;
    let responseText = "";
      
    while (attempts < 3) {
      responseText = await callApi(currentPrompt);
      if (!responseText) {
        console.error("Empty AI response");
        return "AI Response FAIL";
      }
        
      // If a maximum response length is set, check if the AI's answer exceeds it.
      if (this.responseLength && responseText.length > this.responseLength) {
        console.error("AI response is longer than specified length. Attempt " + (attempts + 1));
        currentPrompt = "The previous response was: " + responseText +
          "\nIt exceeds the allowed " + this.responseLength + " characters. Please summarize it to within " + this.responseLength + " characters.";
        attempts++;
        continue;
      }
      // Response is acceptable—return it.
      return responseText;
    }
      
    console.error("AI response is too long after 3 attempts");
    return "AI Response FAIL";
  };
  