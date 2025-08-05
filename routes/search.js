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

    // Group results by product and show best chunks
    const groupedResults = {};
    relevantMatches.forEach(match => {
      const productName = match.metadata?.name || 'Unknown';
      if (!groupedResults[productName] || match.score > groupedResults[productName].score) {
        groupedResults[productName] = {
          id: match.id,
          score: match.score,
          name: match.metadata?.name || 'Unknown',
          description: match.metadata?.description || '',
          chunkIndex: match.metadata?.chunkIndex,
          totalChunks: match.metadata?.totalChunks,
          contentLength: match.metadata?.contentLength || 0,
          hasTranscript: match.metadata?.hasTranscript || false,
          isFullDocument: match.metadata?.isFullDocument || false
        };
      }
    });

    const matches = Object.values(groupedResults).sort((a, b) => b.score - a.score);

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
