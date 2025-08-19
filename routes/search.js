const express = require('express');
const router = express.Router();
const getEmbedding = require('../embedding');
const index = require('../pinecone');

router.get('/', async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log(`Searching for: "${query}"`);
    
    const vector = await getEmbedding(query, 'search_query');
    const result = await index.query({
      vector,
      topK: 10,
      includeMetadata: true,
    });

    console.log('Pinecone query result:', {
      totalMatches: result.matches ? result.matches.length : 0,
      matches: result.matches ? result.matches.map(m => ({ 
        id: m.id, 
        score: m.score, 
        name: m.metadata?.name 
      })) : []
    });

    // Check if we have any matches at all
    if (!result.matches || result.matches.length === 0) {
      return res.json({ 
        message: 'No matches found in index', 
        query: query,
        results: [] 
      });
    }

    // Filter results by semantic relevance (higher threshold now that we have chunks)
    const RELEVANCE_THRESHOLD = 0.3; // Higher threshold for better precision with chunks
    const relevantMatches = result.matches.filter(match => match.score >= RELEVANCE_THRESHOLD);

    console.log(`Filtered to ${relevantMatches.length} relevant matches (threshold: ${RELEVANCE_THRESHOLD})`);

    if (relevantMatches.length === 0) {
      return res.json({ 
        message: 'No semantically relevant results found', 
        query: query,
        highestScore: Math.max(...result.matches.map(m => m.score)),
        threshold: RELEVANCE_THRESHOLD,
        results: [] 
      });
    }

    // Group results by product and content type, show best chunks
    const groupedResults = {};
    relevantMatches.forEach(match => {
      const productName = match.metadata?.name || 'Unknown';
      const contentType = match.metadata?.type || 'text';
      const key = `${productName}-${contentType}`;
      
      if (!groupedResults[key] || match.score > groupedResults[key].score) {
        groupedResults[key] = {
          id: match.id,
          score: match.score,
          name: match.metadata?.name || 'Unknown',
          description: match.metadata?.description || '',
          type: contentType,
          chunkIndex: match.metadata?.chunkIndex,
          totalChunks: match.metadata?.totalChunks,
          contentLength: match.metadata?.contentLength || 0,
          hasTranscript: match.metadata?.hasTranscript || false,
          isFullDocument: match.metadata?.isFullDocument || false,
          imageStyle: match.metadata?.imageStyle,
          image: match.metadata?.image
        };
      }
    });

    // Group by product for final output
    const productGroups = {};
    Object.values(groupedResults).forEach(result => {
      const productName = result.name;
      if (!productGroups[productName]) {
        productGroups[productName] = {
          name: productName,
          description: result.description,
          maxScore: result.score,
          matches: []
        };
      }
      productGroups[productName].matches.push(result);
      productGroups[productName].maxScore = Math.max(productGroups[productName].maxScore, result.score);
    });

    const matches = Object.values(productGroups)
      .sort((a, b) => b.maxScore - a.maxScore)
      .map(group => ({
        ...group,
        matches: group.matches.sort((a, b) => b.score - a.score)
      }));

    res.json({
      query: query,
      found: matches.length,
      results: matches
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', message: error.message });
  }
});

module.exports = router;
