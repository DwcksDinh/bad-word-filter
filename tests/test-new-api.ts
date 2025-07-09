import { NodeBadWordFilter } from '../src/node';
import { BrowserBadWordFilter } from '../src/browser';
import { BadWordFilterOptions } from '../src/interfaces';

interface TestCase {
  description: string;
  input: string;
  expectedHasBadWord: boolean;
  expectedWordsFound: string[];
  expectedFiltered: string;
}

async function runNodeTests() {
  console.log('🔧 Testing NodeBadWordFilter...');
  console.log('===================================');

  // Test constructor-based approach
  const filter = new NodeBadWordFilter();
  await filter.loadBadWords();

  const tests: TestCase[] = [
    {
      description: 'Vietnamese bad word (địt)',
      input: 'Bình luận có từ địt không?',
      expectedHasBadWord: true,
      expectedWordsFound: ['địt'],
      expectedFiltered: 'Bình luận có từ *** không?',
    },
    {
      description: 'English bad words (fuck, shit)',
      input: 'This contains fuck and shit.',
      expectedHasBadWord: true,
      expectedWordsFound: ['fuck', 'shit'],
      expectedFiltered: 'This contains **** and ****.',
    },
    {
      description: 'No bad words',
      input: 'Clean text here.',
      expectedHasBadWord: false,
      expectedWordsFound: [],
      expectedFiltered: 'Clean text here.',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const [index, test] of tests.entries()) {
    console.log(`\n--- Test ${index + 1}: ${test.description} ---`);
    
    const hasBadWord = filter.hasBadWord(test.input);
    const wordsFound = filter.getBadWordsFound(test.input);
    const filteredText = filter.filter(test.input);
    const analysis = filter.analyze(test.input);

    console.log(`Input: ${test.input}`);
    console.log(`Has bad word: ${hasBadWord} (Expected: ${test.expectedHasBadWord}) - ${hasBadWord === test.expectedHasBadWord ? 'PASS' : 'FAIL'}`);
    console.log(`Words found: [${wordsFound.join(', ')}] (Expected: [${test.expectedWordsFound.join(', ')}]) - ${JSON.stringify(wordsFound) === JSON.stringify(test.expectedWordsFound) ? 'PASS' : 'FAIL'}`);
    console.log(`Filtered: ${filteredText} (Expected: ${test.expectedFiltered}) - ${filteredText === test.expectedFiltered ? 'PASS' : 'FAIL'}`);
    console.log(`Analysis matches: ${analysis.hasBadWords === hasBadWord && JSON.stringify(analysis.wordsFound) === JSON.stringify(wordsFound) && analysis.filteredText === filteredText ? 'PASS' : 'FAIL'}`);

    const testPassed = hasBadWord === test.expectedHasBadWord && 
                      JSON.stringify(wordsFound) === JSON.stringify(test.expectedWordsFound) &&
                      filteredText === test.expectedFiltered &&
                      analysis.hasBadWords === hasBadWord;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Node Tests Summary:`);
  console.log(`Total: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(2)}%`);

  return { passed, failed, total: tests.length };
}

async function runBrowserTests() {
  console.log('\n\n🌐 Testing BrowserBadWordFilter...');
  console.log('====================================');

  // Test with custom words
  const customWords = ['test', 'example', 'demo'];
  const filter = new BrowserBadWordFilter({
    customBadWords: customWords,
    replaceChar: '#'
  });
  await filter.loadBadWords();

  const tests: TestCase[] = [
    {
      description: 'Custom bad words',
      input: 'This is a test example.',
      expectedHasBadWord: true,
      expectedWordsFound: ['test', 'example'],
      expectedFiltered: 'This is a #### #######.',
    },
    {
      description: 'No custom bad words',
      input: 'Clean text without bad words.',
      expectedHasBadWord: false,
      expectedWordsFound: [],
      expectedFiltered: 'Clean text without bad words.',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const [index, test] of tests.entries()) {
    console.log(`\n--- Test ${index + 1}: ${test.description} ---`);
    
    const hasBadWord = filter.hasBadWord(test.input);
    const wordsFound = filter.getBadWordsFound(test.input);
    const filteredText = filter.filter(test.input);

    console.log(`Input: ${test.input}`);
    console.log(`Has bad word: ${hasBadWord} (Expected: ${test.expectedHasBadWord}) - ${hasBadWord === test.expectedHasBadWord ? 'PASS' : 'FAIL'}`);
    console.log(`Words found: [${wordsFound.join(', ')}] (Expected: [${test.expectedWordsFound.join(', ')}]) - ${JSON.stringify(wordsFound) === JSON.stringify(test.expectedWordsFound) ? 'PASS' : 'FAIL'}`);
    console.log(`Filtered: ${filteredText} (Expected: ${test.expectedFiltered}) - ${filteredText === test.expectedFiltered ? 'PASS' : 'FAIL'}`);

    const testPassed = hasBadWord === test.expectedHasBadWord && 
                      JSON.stringify(wordsFound) === JSON.stringify(test.expectedWordsFound) &&
                      filteredText === test.expectedFiltered;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Browser Tests Summary:`);
  console.log(`Total: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(2)}%`);

  return { passed, failed, total: tests.length };
}

async function runBackwardCompatibilityTests() {
  console.log('\n\n⬅️  Testing Backward Compatibility...');
  console.log('======================================');

  // Test the factory method approach (legacy)
  const { BadWordFilter } = await import('../src/BadWordFilter');
  const filter = await BadWordFilter.create(['test', 'bad']);

  const input = 'This is a test with bad words.';
  const hasBadWord = filter.hasBadWord(input);
  const filteredText = filter.filter(input);

  console.log(`Input: ${input}`);
  console.log(`Has bad word: ${hasBadWord} (Expected: true) - ${hasBadWord === true ? 'PASS' : 'FAIL'}`);
  console.log(`Filtered: ${filteredText} (Expected contains ***) - ${filteredText.includes('***') ? 'PASS' : 'FAIL'}`);

  const passed = hasBadWord === true && filteredText.includes('***') ? 1 : 0;
  const failed = passed === 1 ? 0 : 1;

  console.log(`\n📊 Backward Compatibility Summary:`);
  console.log(`Total: 1`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  return { passed, failed, total: 1 };
}

async function runAllTests() {
  console.log('🚀 Running New API Tests');
  console.log('========================\n');

  try {
    const nodeResults = await runNodeTests();
    const browserResults = await runBrowserTests();
    const compatResults = await runBackwardCompatibilityTests();

    const totalPassed = nodeResults.passed + browserResults.passed + compatResults.passed;
    const totalFailed = nodeResults.failed + browserResults.failed + compatResults.failed;
    const totalTests = nodeResults.total + browserResults.total + compatResults.total;

    console.log('\n\n🎯 Overall Test Results');
    console.log('=======================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);

    if (totalFailed === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed.');
      process.exit(1);
    }

  } catch (error) {
    console.error(`❌ Error running tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

runAllTests();