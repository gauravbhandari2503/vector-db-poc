# Vector Database Product Search

A semantic search application for products using vector embeddings and Pinecone vector database. This project demonstrates how to build an intelligent product search system that understands the meaning behind user queries, not just keyword matching.

## 🚀 Features

- **Semantic Search**: Find products using natural language queries
- **Vector Embeddings**: Powered by Cohere's advanced embedding models
- **Scalable Storage**: Uses Pinecone vector database for efficient similarity search
- **RESTful API**: Simple HTTP endpoints for uploading and searching products
- **Rich Product Dataset**: Pre-loaded with 63+ tech products

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Vector Database**: Pinecone
- **Embeddings**: Cohere API (embed-english-v3.0 model)
- **Data Format**: JSON product catalog

## 📁 Project Structure

```
vector-db/
├── index.js              # Main server entry point
├── embedding.js          # Text embedding service using Cohere
├── pinecone.js           # Pinecone vector database connection
├── data/
│   └── products.json     # Product dataset (63 tech products)
├── routes/
│   ├── upload.js         # Product upload and indexing endpoints
│   └── search.js         # Semantic search endpoint
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Cohere API account
- Pinecone account

### Installation

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
   COHERE_API_KEY=your_cohere_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX=product-index
   ```

4. **Create Pinecone Index**
   - Log into your Pinecone console
   - Create a new index named `product-index`
   - Set dimension to `1024` (Cohere's embedding dimension)
   - Choose cosine similarity metric

5. **Start the server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

## 📚 API Endpoints

### Upload Products
Index all products from the dataset into the vector database.

```http
POST /upload
```

**Response:**
```json
{
  "message": "Products uploaded successfully",
  "count": 63
}
```

### Get Index Statistics
Check the current state of your Pinecone index.

```http
GET /upload/stats
```

**Response:**
```json
{
  "namespaces": {
    "": {
      "vectorCount": 63
    }
  }
}
```

### Search Products
Perform semantic search using natural language queries.

```http
GET /search?q=wireless headphones
```

**Parameters:**
- `q` (string): Search query

**Response:**
```json
{
  "results": [
    {
      "id": "prod-25",
      "score": 0.85,
      "metadata": {
        "name": "Sony WH-1000XM5",
        "description": "Industry-leading noise canceling wireless headphones..."
      }
    }
  ]
}
```

## 🔍 Usage Examples

### 1. Upload Product Data
```bash
curl -X POST http://localhost:3000/upload
```

### 2. Search for Products
```bash
# Find wireless audio devices
curl "http://localhost:3000/search?q=wireless headphones"

# Find gaming equipment
curl "http://localhost:3000/search?q=gaming console"

# Find smart home devices
curl "http://localhost:3000/search?q=smart thermostat"
```

## 🧩 Key Components

### Embedding Service (`embedding.js`)
- Converts text to vector embeddings using Cohere API
- Uses `embed-english-v3.0` model optimized for search
- Handles API communication and error handling

### Vector Database (`pinecone.js`)
- Manages connection to Pinecone vector database
- Configures index for product storage and retrieval

### Upload Handler (`routes/upload.js`)
- Processes product dataset
- Generates embeddings for product descriptions
- Stores vectors with metadata in Pinecone

### Search Handler (`routes/search.js`)
- Converts user queries to embeddings
- Performs similarity search in vector space
- Returns ranked results with product metadata

## 🎯 How It Works

1. **Indexing Phase**:
   - Product descriptions are converted to vector embeddings
   - Vectors are stored in Pinecone with product metadata
   - Each product gets a unique ID for retrieval

2. **Search Phase**:
   - User query is converted to a vector embedding
   - Similarity search finds closest matching product vectors
   - Results are ranked by cosine similarity score

3. **Semantic Understanding**:
   - Searches work with natural language
   - No need for exact keyword matching
   - Understands context and meaning

## 📊 Sample Product Data

The dataset includes diverse tech products:
- **Mobile Devices**: iPhone 15, Samsung Galaxy S24, Google Pixel 8
- **Computers**: MacBook Air M2, Dell XPS 13, iPad Pro
- **Audio**: AirPods Pro, Sony WH-1000XM5, JBL speakers
- **Gaming**: PlayStation 5, Xbox Series X, Nintendo Switch
- **Smart Home**: Nest Thermostat, Ring Doorbell, Philips Hue

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Cohere API Documentation](https://docs.cohere.ai/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Vector Embeddings Guide](https://www.pinecone.io/learn/vector-embeddings/)

## ⚠️ Notes

- Ensure your Pinecone index dimension matches Cohere's embedding dimension (1024)
- API keys should be kept secure and not committed to version control
- The free tier of Pinecone has limitations on index size and queries