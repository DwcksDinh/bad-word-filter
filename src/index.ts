// Export interfaces and base class
export * from './interfaces';
export { BaseBadWordFilter } from './base';

// Export implementations
export { NodeBadWordFilter } from './node';
export { BrowserBadWordFilter } from './browser';

// Export legacy BadWordFilter for backward compatibility
export { BadWordFilter } from './BadWordFilter';

// Default export for different environments
export { NodeBadWordFilter as default } from './node';