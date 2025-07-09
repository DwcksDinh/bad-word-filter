# Bad Word Filter - Browser and NextJS Support

This document explains the new browser and NextJS support features added to the bad-word-filter package.

## New Architecture

The package has been restructured to support both Node.js and browser environments:

### Core Classes

- **`BaseBadWordFilter`**: Abstract base class with common functionality
- **`NodeBadWordFilter`**: Node.js implementation (reads from file system)
- **`BrowserBadWordFilter`**: Browser implementation (uses inlined data or URL)
- **`BadWordFilter`**: Legacy wrapper for backward compatibility

### Build Outputs

- **`dist/node/`**: CommonJS build for Node.js
- **`dist/esm/`**: ES Modules build 
- **`dist/browser/`**: Browser builds (UMD and ESM)

## Usage Examples

### Node.js Environment

#### Constructor-based approach (recommended)
```typescript
import { NodeBadWordFilter } from '@dwcks/bad-word-filter-vi-en';

// Using default bad words file
const filter = new NodeBadWordFilter();
await filter.loadBadWords();

// Using custom file path
const filterCustom = new NodeBadWordFilter('/path/to/custom-words.txt');
await filterCustom.loadBadWords();

// Using custom options
const filterOptions = new NodeBadWordFilter(undefined, {
  replaceChar: '#',
  caseSensitive: false,
  additionalBadWords: ['custom', 'word']
});
await filterOptions.loadBadWords();
```

#### Factory method (legacy, still supported)
```typescript
import { NodeBadWordFilter } from '@dwcks/bad-word-filter-vi-en';

const filter = await NodeBadWordFilter.create(['bad', 'words']);
```

### Browser Environment

#### Using default inlined words
```typescript
import { BrowserBadWordFilter } from '@dwcks/bad-word-filter-vi-en/browser';

const filter = new BrowserBadWordFilter();
await filter.loadBadWords(); // Loads inlined word list
```

#### Using custom words
```typescript
const filter = new BrowserBadWordFilter({
  customBadWords: ['custom', 'bad', 'words'],
  replaceChar: '#'
});
await filter.loadBadWords();
```

#### Loading from URL
```typescript
const filter = new BrowserBadWordFilter({
  badWordsUrl: 'https://example.com/bad-words.txt'
});
await filter.loadBadWords();
```

#### Using UMD build in HTML
```html
<script src="./node_modules/@dwcks/bad-word-filter-vi-en/dist/browser/bad-word-filter.min.js"></script>
<script>
  const filter = new BadWordFilter.BrowserBadWordFilter();
  filter.loadBadWords().then(() => {
    console.log(filter.filter('Some text with bad words'));
  });
</script>
```

### NextJS Usage

#### API Route (pages/api/filter.ts)
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { NodeBadWordFilter } from '@dwcks/bad-word-filter-vi-en/node';

let filter: NodeBadWordFilter | null = null;

async function getFilter() {
  if (!filter) {
    filter = new NodeBadWordFilter();
    await filter.loadBadWords();
  }
  return filter;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      const filter = await getFilter();
      const analysis = filter.analyze(text);
      
      res.status(200).json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Filter error' });
    }
  }
}
```

#### Client-side component
```typescript
'use client';
import { BrowserBadWordFilter } from '@dwcks/bad-word-filter-vi-en/browser';
import { useState, useEffect } from 'react';

export default function FilterComponent() {
  const [filter, setFilter] = useState<BrowserBadWordFilter | null>(null);
  const [text, setText] = useState('');
  
  useEffect(() => {
    const initFilter = async () => {
      const f = new BrowserBadWordFilter();
      await f.loadBadWords();
      setFilter(f);
    };
    initFilter();
  }, []);
  
  const handleFilter = () => {
    if (filter) {
      const analysis = filter.analyze(text);
      console.log(analysis);
    }
  };
  
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleFilter}>Filter</button>
    </div>
  );
}
```

## New API Methods

All filter implementations now support these methods:

### Core Methods
- `hasBadWord(text: string): boolean` - Check if text contains bad words
- `filter(text: string, mask?: string): string` - Filter bad words with masking
- `getBadWordsFound(text: string): string[]` - Get array of bad words found
- `loadBadWords(): Promise<void>` - Load bad words (async)
- `analyze(text: string): BadWordDetectionResult` - Get detailed analysis

### Configuration Options
```typescript
interface BadWordFilterOptions {
  replaceChar?: string;        // Default: '*'
  caseSensitive?: boolean;     // Default: false
  customBadWords?: string[];   // Custom word list
  additionalBadWords?: string[]; // Additional words to default list
  badWordsUrl?: string;        // URL to load words (browser only)
}
```

### Analysis Result
```typescript
interface BadWordDetectionResult {
  hasBadWords: boolean;
  wordsFound: string[];
  filteredText: string;
}
```

## Package.json Exports

The package now supports conditional exports:

```json
{
  "exports": {
    ".": {
      "import": {
        "node": "./dist/esm/index.js",
        "browser": "./dist/browser/bad-word-filter.esm.js"
      },
      "require": "./dist/node/index.js",
      "browser": "./dist/browser/bad-word-filter.min.js"
    },
    "./node": "./dist/node/node.js",
    "./browser": "./dist/browser/browser.js"
  }
}
```

## Build Process

The build creates separate optimized versions:

1. **Node.js build**: Includes file system access, reads from `bad-words.txt`
2. **Browser build**: Inlines bad words data, no external dependencies
3. **Multiple formats**: CommonJS, ES Modules, UMD for maximum compatibility

### File sizes:
- Node.js build: ~5KB (excludes word data file)
- Browser UMD build: ~60KB (includes all 4000+ words inlined)
- Browser ESM build: ~59KB (includes all 4000+ words inlined)

## Migration Guide

### From v1.x to v2.x

#### Old way (still works):
```typescript
import { BadWordFilter } from '@dwcks/bad-word-filter-vi-en';
const filter = await BadWordFilter.create();
```

#### New recommended way:
```typescript
// Node.js
import { NodeBadWordFilter } from '@dwcks/bad-word-filter-vi-en';
const filter = new NodeBadWordFilter();
await filter.loadBadWords();

// Browser
import { BrowserBadWordFilter } from '@dwcks/bad-word-filter-vi-en/browser';
const filter = new BrowserBadWordFilter();
await filter.loadBadWords();
```

## Performance

- **Node.js**: Fast startup, reads words from file on demand
- **Browser**: Slower initial load (60KB), but instant filtering afterward
- **Memory**: Browser version uses more memory due to inlined data
- **Network**: Browser version has no additional network requests (unless using URL option)