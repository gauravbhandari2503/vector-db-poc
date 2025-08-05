// Text chunking utility for better embeddings

function chunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    
    // If we're not at the end of the text, try to find a good breaking point
    if (end < text.length) {
      // Look for sentence endings near the chunk boundary
      const sentenceEnd = text.lastIndexOf('.', end);
      const questionEnd = text.lastIndexOf('?', end);
      const exclamationEnd = text.lastIndexOf('!', end);
      
      const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
      
      // If we found a sentence ending within reasonable distance, use it
      if (bestEnd > start + chunkSize * 0.7) {
        end = bestEnd + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap
    start = end - overlap;
    
    // Ensure we don't go backwards
    if (start <= (chunks.length > 1 ? text.indexOf(chunks[chunks.length - 2]) : 0)) {
      start = end;
    }
  }

  return chunks;
}

function chunkWithContext(title, description, content, chunkSize = 1000) {
  const contextHeader = `Title: ${title}\nDescription: ${description}\n\n`;
  
  if (!content || content.length === 0) {
    return [{
      text: contextHeader.trim(),
      chunkIndex: 0,
      totalChunks: 1,
      isFullDocument: true
    }];
  }

  const chunks = chunkText(content, chunkSize - contextHeader.length);
  
  return chunks.map((chunk, index) => ({
    text: contextHeader + `Content: ${chunk}`,
    chunkIndex: index,
    totalChunks: chunks.length,
    isFullDocument: false
  }));
}

module.exports = {
  chunkText,
  chunkWithContext
};
