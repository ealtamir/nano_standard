import { createClient } from 'redis';

const redisClient = createClient({
  url: "redis://localhost:6379"
});

async function testConnection() {
  try {
    await redisClient.connect();
    console.log("Successfully connected to Redis!");
    
    // Test basic operations
    await redisClient.set('test-key', 'hello world');
    const value = await redisClient.get('test-key');
    console.log('Test value retrieved:', value);
    
    await redisClient.quit();
  } catch (error) {
    console.error("Redis connection failed:", error);
  }
}

testConnection(); 