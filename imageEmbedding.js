const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

/**
 * Generate embeddings for an image using Cohere's embed endpoint
 * @param {string} imagePathOrUrl - Local file path or remote URL of the image
 * @returns {Promise<number[]>} - The embedding vector
 */
async function getImageEmbedding(imagePathOrUrl) {
  try {
    let imageData;
    
    // Check if it's a URL or local file path
    const isUrl = /^https?:\/\//i.test(imagePathOrUrl);
    
    if (isUrl) {
      // For URLs, Cohere can fetch directly
      imageData = imagePathOrUrl;
    } else {
      // For local files, convert to base64
      const resolvedPath = path.isAbsolute(imagePathOrUrl) 
        ? imagePathOrUrl 
        : path.resolve(imagePathOrUrl);
        
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Image file not found: ${resolvedPath}`);
      }
      
      const imageBuffer = fs.readFileSync(resolvedPath);
      const ext = path.extname(resolvedPath).toLowerCase();
      
      // Determine MIME type based on file extension
      let mimeType = 'image/jpeg'; // default
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      
      imageData = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
    }

    const payload = {
      model: "embed-multilingual-v3.0",
      images: [imageData],
      input_type: "image"
    };

    const response = await axios.post(
      "https://api.cohere.ai/v1/embed",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data.embeddings || response.data.embeddings.length === 0) {
      throw new Error("No embeddings returned from Cohere API");
    }

    return response.data.embeddings[0];
  } catch (error) {
    console.error(`Failed to generate image embedding for ${imagePathOrUrl}:`, error.message);
    throw error;
  }
}

module.exports = getImageEmbedding;
