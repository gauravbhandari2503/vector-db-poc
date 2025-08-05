    const { Pinecone } = require('@pinecone-database/pinecone');
  require('dotenv').config();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pc.index(process.env.PINECONE_INDEX);

  module.exports = index;