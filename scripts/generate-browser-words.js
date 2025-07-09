const fs = require('fs');
const path = require('path');

/**
 * Convert bad-words.txt to TypeScript array for browser builds
 */
function generateBrowserWords() {
  const badWordsFile = path.join(__dirname, '..', 'src', 'bad-words.txt');
  const outputFile = path.join(__dirname, '..', 'src', 'browser-words.ts');
  
  try {
    // Read the bad words file
    const content = fs.readFileSync(badWordsFile, 'utf-8');
    const words = content
      .split('\n')
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    console.log(`Processing ${words.length} bad words...`);
    
    // Generate TypeScript file content
    const tsContent = `/**
 * Auto-generated bad words data for browser builds
 * Generated from bad-words.txt with ${words.length} words
 * DO NOT EDIT MANUALLY - Run 'npm run generate:browser-words' to regenerate
 */
export const DEFAULT_BAD_WORDS: string[] = ${JSON.stringify(words, null, 2)};

export const BAD_WORDS_COUNT = ${words.length};
export const BAD_WORDS_GENERATED_AT = '${new Date().toISOString()}';
`;
    
    // Write the TypeScript file
    fs.writeFileSync(outputFile, tsContent, 'utf-8');
    
    console.log(`✅ Generated ${outputFile} with ${words.length} words`);
    console.log(`📊 File size: ${Math.round(tsContent.length / 1024)}KB`);
    
  } catch (error) {
    console.error('❌ Error generating browser words:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateBrowserWords();