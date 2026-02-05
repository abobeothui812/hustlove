import TextEmbeddingMatcher from './TextEmbeddingMatcher.js';

class MatchingService {
  constructor() {
    this.matcher = new TextEmbeddingMatcher();
    this.isReady = false;
  }

  async initialize() {
    if (this.isReady) return;
    
    try {
      await this.matcher.initialize();
      this.isReady = true;
      console.log('✅ Matching Service is ready!');
    } catch (error) {
      console.error('❌ Failed to initialize Matching Service:', error);
      throw error;
    }
  }

  async calculateCompatibility(user1, user2) {
    if (!this.isReady) {
      throw new Error('Matching Service is not initialized');
    }

    return await this.matcher.calculateOverallCompatibility(user1, user2);
  }

  async findMatches(currentUser, candidates, limit = 10) {
    if (!this.isReady) {
      throw new Error('Matching Service is not initialized');
    }

    return await this.matcher.findBestMatches(currentUser, candidates, limit);
  }

  getStats() {
    return {
      ready: this.isReady,
      cache: this.matcher.getCacheStats()
    };
  }
}

// Singleton instance
const matchingService = new MatchingService();

export default matchingService;