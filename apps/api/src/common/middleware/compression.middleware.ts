/**
 * Compression Middleware
 * Gzip/Brotli compression for responses
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// ============================================
// Configuration
// ============================================

const compressionOptions: compression.CompressionOptions = {
  // Compression level (0-9, where 9 is best compression, 6 is default balance)
  level: 6,

  // Only compress responses larger than this (bytes)
  threshold: 1024,

  // Filter function to determine if response should be compressed
  filter: (req: Request, res: Response): boolean => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress for old browsers
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('MSIE 6')) {
      return false;
    }

    // Don't compress already compressed content types
    const contentType = res.getHeader('Content-Type') as string;
    if (contentType) {
      const skipTypes = [
        'image/',
        'video/',
        'audio/',
        'application/zip',
        'application/gzip',
        'application/x-gzip',
        'application/pdf',
      ];

      for (const type of skipTypes) {
        if (contentType.includes(type)) {
          return false;
        }
      }
    }

    // Use default compression filter for everything else
    return compression.filter(req, res);
  },

  // Memory level (1-9, affects speed vs memory usage)
  memLevel: 8,

  // Window bits (8-15, affects compression ratio)
  windowBits: 15,
};

// ============================================
// Middleware
// ============================================

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compress = compression(compressionOptions);

  use(req: Request, res: Response, next: NextFunction): void {
    this.compress(req, res, next);
  }
}

// ============================================
// Factory function for module setup
// ============================================

export function createCompressionMiddleware(): any {
  return compression(compressionOptions);
}
