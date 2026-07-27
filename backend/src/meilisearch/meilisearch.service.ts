import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Meilisearch } from 'meilisearch';

interface SearchOptions {
  limit?: number;
  filter?: string | string[];
}

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: Meilisearch | null = null;
  readonly isEnabled: boolean;

  constructor() {
    const host = process.env.MEILISEARCH_HOST;
    this.isEnabled = Boolean(host);
    if (this.isEnabled) {
      this.client = new Meilisearch({
        host: host as string,
        apiKey: process.env.MEILISEARCH_API_KEY,
      });
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.isEnabled || !this.client) {
      this.logger.warn(
        'MEILISEARCH_HOST not set - global search will fall back to database queries',
      );
      return;
    }
    try {
      await Promise.all([
        this.client
          .index('products')
          .updateSearchableAttributes(['name', 'brandName', 'categoryName', 'description']),
        this.client
          .index('products')
          .updateFilterableAttributes(['categoryName', 'brandName']),
        this.client
          .index('livestock')
          .updateSearchableAttributes(['breed', 'species', 'description', 'location']),
        this.client
          .index('livestock')
          .updateFilterableAttributes(['species', 'breed', 'isSold']),
        this.client
          .index('doctors')
          .updateSearchableAttributes(['name', 'specialty', 'bio']),
        this.client
          .index('doctors')
          .updateFilterableAttributes(['specialty', 'isVerified']),
        this.client
          .index('clinics')
          .updateSearchableAttributes(['name', 'location', 'description']),
        this.client
          .index('clinics')
          .updateFilterableAttributes(['isVerified']),
      ]);
    } catch (err) {
      this.logger.warn(`Failed to configure Meilisearch indexes: ${err}`);
    }
  }

  async indexDocument(
    indexName: string,
    document: Record<string, unknown>,
  ): Promise<void> {
    if (!this.isEnabled || !this.client) return;
    try {
      await this.client.index(indexName).addDocuments([document]);
    } catch (err) {
      this.logger.warn(`Failed to index document in ${indexName}: ${err}`);
    }
  }

  async indexDocuments(
    indexName: string,
    documents: Record<string, unknown>[],
  ): Promise<void> {
    if (!this.isEnabled || !this.client || documents.length === 0) return;
    try {
      await this.client.index(indexName).addDocuments(documents);
    } catch (err) {
      this.logger.warn(`Failed to bulk index ${indexName}: ${err}`);
    }
  }

  async deleteDocument(indexName: string, id: string | number): Promise<void> {
    if (!this.isEnabled || !this.client) return;
    try {
      await this.client.index(indexName).deleteDocument(id);
    } catch (err) {
      this.logger.warn(`Failed to delete document from ${indexName}: ${err}`);
    }
  }

  /** Returns null (not []) when search is unavailable, so callers can fall back to the database. */
  async search<T = unknown>(
    indexName: string,
    query: string,
    options?: SearchOptions,
  ): Promise<T[] | null> {
    if (!this.isEnabled || !this.client) return null;
    try {
      const result = await this.client.index(indexName).search(query, {
        limit: options?.limit ?? 10,
        filter: options?.filter,
      });
      return result.hits as T[];
    } catch (err) {
      this.logger.warn(`Meilisearch query failed for ${indexName}: ${err}`);
      return null;
    }
  }
}
