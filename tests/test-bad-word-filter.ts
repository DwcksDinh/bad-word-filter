import { BadWordFilter } from '../src/BadWordFilter';

async function runTests() {
  let filter: BadWordFilter;

  // Khởi tạo filter
  try {
    // Đọc từ bad-words.txt ở thư mục gốc
    filter = await BadWordFilter.create();
    console.log('Khởi tạo BadWordFilter thành công từ bad-words.txt');
  } catch (error) {
    console.error('Lỗi khi khởi tạo BadWordFilter:', error instanceof Error ? error.message : 'Unknown error');
    // Fallback: sử dụng danh sách từ xấu mẫu
    console.log('Thử sử dụng danh sách từ xấu mẫu...');
    try {
      const sampleBadWords = ['địt', 'ngu', 'fuck', 'shit', 'idiot'];
      filter = await BadWordFilter.create(sampleBadWords);
      console.log('Khởi tạo BadWordFilter thành công từ danh sách mẫu');
    } catch (fallbackError) {
      console.error('Lỗi khi khởi tạo với danh sách mẫu:', fallbackError instanceof Error ? fallbackError.message : 'Unknown error');
      return;
    }
  }

  // Các test case
  const testCases = [
    {
      input: 'Bình luận có từ địt không?',
      expectedHasBadWord: true,
      expectedFiltered: 'Bình luận có từ *** không?',
      description: 'Kiểm tra từ xấu tiếng Việt (địt)'
    },
    {
      input: 'This comment contains fuck and shit.',
      expectedHasBadWord: true,
      expectedFiltered: 'This comment contains **** and ****.',
      description: 'Kiểm tra nhiều từ xấu tiếng Anh (fuck, shit)'
    },
    {
      input: 'Không có từ xấu ở đây.',
      expectedHasBadWord: false,
      expectedFiltered: 'Không có từ xấu ở đây.',
      description: 'Kiểm tra bình luận không có từ xấu (tiếng Việt)'
    },
    {
      input: 'You are a nice person.',
      expectedHasBadWord: false,
      expectedFiltered: 'You are a nice person.',
      description: 'Kiểm tra bình luận không có từ xấu (tiếng Anh)'
    },
    {
      input: 'Đây là một thằng ngu.',
      expectedHasBadWord: true,
      expectedFiltered: 'Đây là một thằng ***.',
      description: 'Kiểm tra từ xấu tiếng Việt (ngu)'
    },
    {
      input: 'You are an idiot.',
      expectedHasBadWord: true,
      expectedFiltered: 'You are an *****.',
      description: 'Kiểm tra từ xấu tiếng Anh (idiot)'
    },
    {
      input: 'Edge case: f***k and IDIOT!',
      expectedHasBadWord: true,
      expectedFiltered: 'Edge case: **** and *****!',
      description: 'Kiểm tra từ xấu với ký tự đặc biệt và in hoa'
    },
    {
      input: '',
      expectedHasBadWord: false,
      expectedFiltered: '',
      description: 'Kiểm tra chuỗi rỗng'
    }
  ];

  // Chạy các test case
  let passed = 0;
  let failed = 0;

  for (const [index, test] of testCases.entries()) {
    console.log(`Test ${index + 1}: ${test.description}`);
    console.log(`Input: ${test.input}`);

    // Kiểm tra hasBadWord
    const hasBadWordResult = filter.hasBadWord(test.input);
    const hasBadWordPass = hasBadWordResult === test.expectedHasBadWord;
    console.log(`Has bad word: ${hasBadWordResult} (Expected: ${test.expectedHasBadWord}) - ${hasBadWordPass ? 'PASS' : 'FAIL'}`);

    // Kiểm tra filter
    const filteredResult = filter.filter(test.input);
    const filterPass = filteredResult === test.expectedFiltered;
    console.log(`Filtered: ${filteredResult} (Expected: ${test.expectedFiltered}) - ${filterPass ? 'PASS' : 'FAIL'}`);

    // Cập nhật kết quả
    if (hasBadWordPass && filterPass) {
      passed++;
    } else {
      failed++;
    }
    console.log('---');
  }

  // In tóm tắt kết quả
  console.log(`Tổng số test: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Tỷ lệ pass: ${((passed / testCases.length) * 100).toFixed(2)}%`);
}

// Chạy test
(async () => {
  try {
    await runTests();
  } catch (error) {
    console.error('Lỗi khi chạy test:', error instanceof Error ? error.message : 'Unknown error');
  }
})();