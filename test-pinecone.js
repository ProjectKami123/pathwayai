// test-pinecone.js
// Simple script to test Pinecone connection

const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testPineconeConnection() {
  try {
    console.log('🔄 Initializing Pinecone client...');
    
    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log('✅ Pinecone client initialized successfully');

    // Get index name from environment variable
    const indexName = process.env.PINECONE_INDEX;
    
    if (!indexName) {
      throw new Error('PINECONE_INDEX environment variable is not set');
    }

    console.log(`🔄 Testing connection to index: ${indexName}`);

    // Get index instance
    const index = pc.index(indexName);

    // Test basic connection by getting index stats
    const stats = await index.describeIndexStats();
    
    console.log('✅ Successfully connected to Pinecone!');
    console.log('📊 Index Statistics:');
    console.log(`   - Total vectors: ${stats.totalVectorCount || 0}`);
    console.log(`   - Index fullness: ${stats.indexFullness || 0}`);
    console.log(`   - Dimension: ${stats.dimension || 'N/A'}`);
    
    if (stats.namespaces) {
      console.log('   - Namespaces:', Object.keys(stats.namespaces));
      
      // Check specifically for the "default" namespace (and empty string which represents default)
      if (stats.namespaces['default']) {
        console.log('📍 "default" namespace found:');
        console.log(`   - Vectors in "default": ${stats.namespaces['default'].vectorCount}`);
      } else if (stats.namespaces['']) {
        console.log('📍 Default namespace (empty string) found:');
        console.log(`   - Vectors in default namespace: ${stats.namespaces[''].vectorCount}`);
      } else {
        console.log('⚠️  Default namespace not found in stats');
      }
    }

    // Test a simple query (this will work even with an empty index)
    console.log('🔄 Testing query functionality...');
    
    // For the default namespace, we can either use index.namespace('') or just query without namespace
    const queryResponse = await index.query({
      vector: new Array(stats.dimension || 1536).fill(0.1), // Create a dummy vector
      topK: 5, // Get top 5 matches to see some actual data
      includeMetadata: true,
    });

    console.log('✅ Query test successful!');
    console.log(`   - Returned ${queryResponse.matches?.length || 0} matches from default namespace`);
    
    // Show some sample results if available
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log('📄 Sample matches:');
      queryResponse.matches.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ID: ${match.id}, Score: ${match.score?.toFixed(4)}`);
        if (match.metadata && Object.keys(match.metadata).length > 0) {
          console.log(`      Metadata keys: ${Object.keys(match.metadata).join(', ')}`);
        }
      });
    }

    // Also test specifically querying the default namespace using the namespace method
    console.log('🔄 Testing namespace-specific query...');
    const namespaceIndex = index.namespace('');
    const nsQueryResponse = await namespaceIndex.query({
      vector: new Array(stats.dimension || 1536).fill(0.1),
      topK: 3,
      includeMetadata: true,
    });

    console.log('✅ Namespace query test successful!');
    console.log(`   - Returned ${nsQueryResponse.matches?.length || 0} matches using namespace method`);

    return true;

  } catch (error) {
    console.error('❌ Error testing Pinecone connection:');
    console.error(`   ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('UNAUTHENTICATED')) {
      console.error('   💡 Check your PINECONE_API_KEY in .env file');
    } else if (error.message.includes('NOT_FOUND')) {
      console.error('   💡 Check your PINECONE_INDEX name in .env file');
    } else if (error.message.includes('INVALID_ARGUMENT')) {
      console.error('   💡 Check your index configuration and region settings');
    }
    
    return false;
  }
}

// Run the test
console.log('🚀 Starting Pinecone connection test...\n');

testPineconeConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All tests passed! Your Pinecone connection is working correctly.');
    } else {
      console.log('\n💥 Connection test failed. Please check your configuration.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });