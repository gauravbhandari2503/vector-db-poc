const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const index = require('../pinecone');
const getEmbedding = require('../embedding');
const getImageEmbedding = require('../imageEmbedding');
const products = require('../data/products.json');

// Import chunking functions
const chunking = require('../chunking');
console.log('Chunking module:', chunking);
const { chunkWithContext } = chunking;

router.post('/', async (req, res) => {
  try {
    console.log('Starting upload process...');
    console.log('Total products to index:', products.length);
    
    const allVectors = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing ${product.name}...`);
      
      // Read the transcript file content
      let transcriptContent = '';
      try {
        const transcriptPath = path.join(__dirname, '..', product.transcript);
        transcriptContent = await fs.readFile(transcriptPath, 'utf8');
        console.log(`Read transcript file: ${product.transcript} (${transcriptContent.length} characters)`);
      } catch (fileError) {
        console.warn(`Failed to read transcript file ${product.transcript}:`, fileError.message);
        transcriptContent = '';
      }
      
      // Create chunks with context
      const chunks = chunkWithContext(
        product.name, 
        product.description, 
        transcriptContent,
        1000 // 1000 character chunks
      );
      
      console.log(`Created ${chunks.length} chunks for ${product.name}`);
      
      // Create embeddings for each chunk
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} (${chunk.text.length} chars)`);
        
        const embedding = await getEmbedding(chunk.text);
        
        allVectors.push({
          id: `prod-${i}-chunk-${chunkIndex}`,
          values: embedding,
          metadata: {
            ...product,
            type: 'text',
            chunkIndex: chunk.chunkIndex,
            totalChunks: chunk.totalChunks,
            isFullDocument: chunk.isFullDocument,
            contentLength: transcriptContent.length,
            chunkLength: chunk.text.length,
            hasTranscript: transcriptContent !== ''
          }
        });
      }
      
      // Create image embedding if image exists
      if (product.image) {
        try {
          console.log(`Processing image embedding for ${product.image}`);
          const imagePath = path.join(__dirname, '..', product.image);
          const imageEmbedding = await getImageEmbedding(imagePath);
          
          allVectors.push({
            id: `prod-${i}-image`,
            values: imageEmbedding,
            metadata: {
              ...product,
              type: 'image',
              contentType: 'image',
              hasTranscript: transcriptContent !== ''
            }
          });
          
          console.log(`✅ Image embedding created for ${product.name}`);
        } catch (imageError) {
          console.warn(`⚠️ Failed to create image embedding for ${product.image}:`, imageError.message);
          // Continue processing other products even if image embedding fails
        }
      }
    }
    
    console.log(`Total vectors to upload: ${allVectors.length}`);
    
    // Upload in batches to avoid timeouts
    const batchSize = 100;
    let totalUpserted = 0;
    
    for (let i = 0; i < allVectors.length; i += batchSize) {
      const batch = allVectors.slice(i, i + batchSize);
      console.log(`Uploading batch ${Math.floor(i/batchSize) + 1} (${batch.length} vectors)`);
      
      const upsertResponse = await index.upsert(batch);
      totalUpserted += batch.length;
    }
    
    res.json({ 
      message: 'Products indexed in Pinecone with chunking',
      totalProcessed: products.length,
      totalChunks: allVectors.length,
      indexedCount: totalUpserted
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

// Add a route to check index stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await index.describeIndexStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats', message: error.message });
  }
});

module.exports = router;
