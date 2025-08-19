const axios = require("axios");
require("dotenv").config();

async function getEmbedding(text, inputType='search_document') {
  const response = await axios.post(
    "https://api.cohere.ai/v1/embed",
    {
      texts: [text],
      model: "embed-multilingual-v3.0",
      input_type: inputType, // 'search_document' or 'search_query'
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.embeddings[0];
}

module.exports = getEmbedding;
