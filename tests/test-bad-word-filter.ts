import { BadWordFilter } from '../src/BadWordFilter';

interface TestCase {
  description: string;
  input: string;
  expectedHasBadWord: boolean;
  expectedFiltered: string;
}

async function runTests() {
  const filter = await BadWordFilter.create();
  const tests: TestCase[] = [
    {
      description: 'Kiểm tra từ xấu tiếng Việt (địt)',
      input: 'Bình luận có từ địt không?',
      expectedHasBadWord: true,
      expectedFiltered: 'Bình luận có từ *** không?',
    },
    {
      description: 'Kiểm tra nhiều từ xấu tiếng Anh (fuck, shit)',
      input: 'This comment contains fuck and shit.',
      expectedHasBadWord: true,
      expectedFiltered: 'This comment contains **** and ****.',
    },
    {
      description: 'Kiểm tra bình luận không có từ xấu (tiếng Việt)',
      input: 'Không có từ xấu ở đây.',
      expectedHasBadWord: false,
      expectedFiltered: 'Không có từ xấu ở đây.',
    },
    {
      description: 'Kiểm tra bình luận không có từ xấu (tiếng Anh)',
      input: 'You are a nice person.',
      expectedHasBadWord: false,
      expectedFiltered: 'You are a nice person.',
    },
    {
      description: 'Kiểm tra từ xấu tiếng Việt (ngu)',
      input: 'Đây là một thằng ngu.',
      expectedHasBadWord: true,
      expectedFiltered: 'Đây là một thằng ***.',
    },
    {
      description: 'Kiểm tra từ xấu tiếng Anh (idiot)',
      input: 'You are an idiot.',
      expectedHasBadWord: true,
      expectedFiltered: 'You are an *****.',
    },
    {
      description: 'Kiểm tra từ xấu với ký tự đặc biệt và in hoa',
      input: 'Edge case: f***k and IDIOT!',
      expectedHasBadWord: true,
      expectedFiltered: 'Edge case: **** and *****',
    },
    {
      description: 'Kiểm tra chuỗi rỗng',
      input: '',
      expectedHasBadWord: false,
      expectedFiltered: '',
    },
    {
      description: 'Kiểm tra từ xấu tiếng Việt in hoa với dấu câu (NGU!!!)',
      input: 'Đây là một thằng NGU!!!',
      expectedHasBadWord: true,
      expectedFiltered: 'Đây là một thằng ***!!!',
    },
    {
      description: 'Kiểm tra cụm từ tiếng Việt với ký tự đặc biệt (ĐỒ_BẮC_KỲ)',
      input: 'Coi chừng ĐỒ_BẮC_KỲ kia!',
      expectedHasBadWord: true,
      expectedFiltered: 'Coi chừng ************ kia!',
    },
    {
      description: 'Kiểm tra từ xấu tiếng Anh với ký tự xen kẽ (f***k)',
      input: 'This is f***k bad!',
      expectedHasBadWord: true,
      expectedFiltered: 'This is **** bad!',
    },
    {
      description: 'Kiểm tra từ xấu tiếng Việt với dấu câu xen kẽ (n*g*u)',
      input: 'Đừng làm n*g*u thế!',
      expectedHasBadWord: true,
      expectedFiltered: 'Đừng làm *** thế!',
    },
  ];

  let passed = 0;
  let failed = 0;

  console.log('Bắt đầu kiểm tra BadWordFilter...');
  for (const [index, test] of tests.entries()) {
    console.log(`---\nTest ${index + 1}: ${test.description}`);
    console.log(`Input: ${test.input}`);

    const hasBadWord = filter.hasBadWord(test.input);
    const filtered = filter.filter(test.input);

    const hasBadWordPass = hasBadWord === test.expectedHasBadWord;
    console.log(
      `Has bad word: ${hasBadWord} (Expected: ${test.expectedHasBadWord}) - ${
        hasBadWordPass ? 'PASS' : 'FAIL'
      }`
    );

    const filteredPass = filtered === test.expectedFiltered;
    console.log(
      `Filtered: ${filtered} (Expected: ${test.expectedFiltered}) - ${
        filteredPass ? 'PASS' : 'FAIL'
      }`
    );

    if (hasBadWordPass && filteredPass) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('---');
  console.log(`Tổng số test: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Tỷ lệ pass: ${((passed / tests.length) * 100).toFixed(2)}%`);
}

runTests().catch((error) => console.error(`Lỗi khi chạy test: ${error.message}`));