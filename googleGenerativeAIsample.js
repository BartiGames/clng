async function textGenTextOnlyPrompt() {
  // [START text_gen_text_only_prompt]
  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Write a story about a magic backpack.";
    const result = await model.generateContent(prompt);

    let responseText = "";
    // If response.text is a function, use it.
    if (typeof result.response.text === "function") {
      responseText = await result.response.text();
    } 
    // Otherwise, attempt to extract text from candidates.
    else if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      // If candidate.content.parts exists, join them.
      if (candidate.content && Array.isArray(candidate.content.parts)) {
        const parts = candidate.content.parts.map(p => typeof p === "object" ? (p.text || "") : p);
        responseText = parts.join("");
      } else {
        responseText = JSON.stringify(candidate);
      }
    } else {
      responseText = JSON.stringify(result.response);
    }

    // Force conversion to string
    responseText = String(responseText);

    if (typeof responseText === "string" && !responseText.trim()) {
      console.warn("Warning: Empty response received in textGenTextOnlyPrompt.");
    }
    console.log(responseText);
  }
  catch (error) {
    console.error("Error in textGenTextOnlyPrompt:", error);
  }
  // [END text_gen_text_only_prompt]
}
