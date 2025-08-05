# Vector Product Search API

A Node.js application that implements semantic search capabilities using vector embeddings, Pinecone vector database, and Cohere embeddings API. This project enables intelligent document search and retrieval for business content like guides, transcripts, and educational materials.

## 🚀 Features

- **Semantic Search**: Advanced text search using vector embeddings for contextual understanding
- **Document Chunking**: Intelligent text splitting with overlap for optimal search results
- **Vector Database**: Pinecone integration for scalable vector storage and retrieval
- **Batch Processing**: Efficient bulk document indexing with batch uploads
- **RESTful API**: Clean HTTP endpoints for uploading and searching content
- **Relevance Filtering**: Configurable similarity thresholds for precise results

## 🏗️ Architecture

The application consists of several key components:

- **Express Server** (`index.js`): Main application entry point
- **Embedding Service** (`embedding.js`): Cohere API integration for text embeddings
- **Chunking Engine** (`chunking.js`): Smart text segmentation with context preservation
- **Vector Store** (`pinecone.js`): Pinecone database connection and configuration
- **API Routes**:
  - `routes/upload.js`: Document indexing endpoint
  - `routes/search.js`: Semantic search endpoint

## 🛠️ Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Pinecone**: Vector database for similarity search
- **Cohere**: Embedding model (embed-english-v3.0)
- **Axios**: HTTP client for API requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vector-db
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   COHERE_API_KEY=your_cohere_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_pinecone_index_name
   ```

4. **Prepare your data**
   - Add your documents to the `data/` directory
   - Update `data/products.json` with metadata for your documents

## 🚀 Usage

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### API Endpoints

#### 1. Upload Documents
**POST** `/upload`

Indexes all documents specified in `data/products.json` into the vector database.

```bash
curl -X POST http://localhost:3000/upload
```

**Response:**
```json
{
  "message": "Products indexed in Pinecone with chunking",
  "totalProcessed": 3,
  "totalChunks": 15,
  "indexedCount": 15
}
```

#### 2. Search Documents
**GET** `/search?q=<query>`

Performs semantic search across indexed documents.

```bash
curl "http://localhost:3000/search?q=fundraising strategies"
```

**Response:**
```json
{
  "query": "fundraising strategies",
  "found": 2,
  "results": [
    {
      "id": "prod-1-chunk-0",
      "score": 0.85,
      "name": "Key Mistakes to Avoid When Fundraising",
      "description": "Insights from Tessa Clarke on common pitfalls in fundraising.",
      "chunkIndex": 0,
      "totalChunks": 5,
      "hasTranscript": true
    }
  ]
}
```

#### 3. Index Statistics
**GET** `/upload/stats`

Returns Pinecone index statistics and vector count.

## 📁 Project Structure

```
vector-db/
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── embedding.js             # Cohere embedding service
├── chunking.js              # Text chunking utilities
├── pinecone.js              # Pinecone configuration
├── routes/
│   ├── upload.js            # Document indexing endpoint
│   └── search.js            # Search endpoint
└── data/
    ├── products.json        # Document metadata
    ├── mastering-your-messaging.txt
    ├── key-mistakes-to-avoid-when-fundraising-tess-clarke.txt
    └── unlocking-pmf.txt
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COHERE_API_KEY` | API key for Cohere embeddings | Yes |
| `PINECONE_API_KEY` | API key for Pinecone vector database | Yes |
| `PINECONE_INDEX` | Name of your Pinecone index | Yes |

### Chunking Parameters

The chunking system supports several configurable parameters:

- **Chunk Size**: Default 1000 characters
- **Overlap**: Default 200 characters for context preservation
- **Smart Breaking**: Finds natural sentence boundaries

### Search Configuration

- **Relevance Threshold**: 0.3 (adjustable in `routes/search.js`)
- **Top-K Results**: 10 matches per query
- **Result Grouping**: Best chunks per product

## 🔧 Customization

### Adding New Documents

1. Place your text files in the `data/` directory
2. Update `data/products.json` with document metadata:
   ```json
   {
     "name": "Your Document Title",
     "description": "Document description",
     "transcript": "/data/your-document.txt"
   }
   ```
3. Re-run the upload process

### Adjusting Search Sensitivity

Modify the `RELEVANCE_THRESHOLD` in `routes/search.js`:
- Lower values (0.1-0.3): More permissive, returns more results
- Higher values (0.5-0.8): More strict, returns only highly relevant results

### Custom Chunking Strategies

The chunking engine supports different strategies. Modify `chunking.js` to:
- Adjust chunk sizes based on document type
- Implement custom breaking logic
- Add metadata extraction

## 📊 Performance Considerations

- **Batch Size**: Upload limited to 100 vectors per batch
- **Rate Limiting**: Cohere API calls are sequential to avoid rate limits
- **Memory Usage**: Large documents are processed in chunks
- **Indexing Time**: Depends on document count and Cohere API response times

## 🐛 Troubleshooting

### Common Issues

1. **"No matches found"**: Check if documents are properly indexed
2. **Rate limit errors**: Reduce batch size or add delays between requests
3. **Memory issues**: Reduce chunk size for large documents
4. **Connection errors**: Verify API keys and network connectivity

### Debug Mode

Enable detailed logging by checking console outputs during upload and search operations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Documentation

- [Cohere Embed API](https://docs.cohere.com/reference/embed)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Express.js Guide](https://expressjs.com/)
