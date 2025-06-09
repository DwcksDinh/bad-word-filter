# Bộ Lọc Từ Xấu

Thư viện TypeScript để phát hiện và lọc các từ ngữ xúc phạm trong văn bản, hỗ trợ tiếng Việt và tiếng Anh, bao gồm các từ phân biệt vùng miền. Từ xấu được lưu trong file `bad-words.txt` hoặc cung cấp trực tiếp qua mảng.

## Tính năng
- Phát hiện từ/cụm từ xúc phạm (không phân biệt hoa/thường).
- Thay thế từ xấu bằng ký tự che mờ (mặc định: `*`).
- Hỗ trợ từ xấu tiếng Việt (ví dụ: `địt`, `đồ Bắc Kỳ`) và tiếng Anh (ví dụ: `fuck`, `shit`).
- Tương thích với Node.js, Next.js (server-side), và các môi trường khác.
- Xử lý lỗi khi đọc file từ xấu.

## Cài đặt
```bash
npm install @dwcks/bad-word-filter-vi-en
```

Đảm bảo file `bad-words.txt` tồn tại trong thư mục gốc của dự án hoặc cung cấp danh sách từ xấu trực tiếp.

## Sử dụng
### Trong Node.js
```typescript
import { BadWordFilter } from '@dwcks/bad-word-filter-vi-en';

(async () => {
  const filter = await BadWordFilter.create(); // Đọc từ bad-words.txt
  console.log(filter.hasBadWord('Bình luận có từ địt không?')); // true
  console.log(filter.filter('Bình luận có từ địt không?')); // Bình luận có từ *** không?
})();
```

### Trong Next.js (API Route)
Tạo file `pages/api/filter.ts`:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { BadWordFilter } from '@dwcks/bad-word-filter-vi-en';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Văn bản không hợp lệ' });
      }
      const filter = await BadWordFilter.create(['địt', 'ngu']); // Hoặc đọc từ file
      const hasBadWord = filter.hasBadWord(text);
      const filteredText = filter.filter(text);
      res.status(200).json({ hasBadWord, filteredText });
    } catch (error) {
      res.status(500).json({ error: `Lỗi khi lọc: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }
}
```

Gọi API từ client:
```typescript
const response = await fetch('/api/filter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Bình luận có từ địt không?' }),
});
const result = await response.json();
console.log(result); // { hasBadWord: true, filteredText: 'Bình luận có từ *** không?' }
```

## Cấu trúc dự án
```
/bad-word-filter
├── bad-words.txt        # Danh sách từ xấu (UTF-8)
├── dist                 # Code đã biên dịch
├── src
│   ├── BadWordFilter.ts # Lớp lọc chính
│   ├── index.ts         # Xuất module
├── tests
│   ├── test-bad-word-filter.ts # Script kiểm tra
├── README.md
├── LICENSE
```

## Kiểm tra
```bash
npm run test
```

## Lưu ý
- **Mã hóa**: File `bad-words.txt` phải được lưu ở định dạng UTF-8.
- **Cụm từ**: Regex hiện hỗ trợ cụm từ (ví dụ: `đồ Bắc Kỳ`). Kiểm tra cẩn thận để tránh khớp sai.
- **Next.js Serverless**: Nếu triển khai trên Vercel, đảm bảo cung cấp `bad-words.txt` trong thư mục gốc hoặc dùng mảng từ xấu.
- **Nhạy cảm văn hóa**: Các từ như `Bắc Kỳ`, `Nam Kỳ` rất nhạy cảm, sử dụng đúng ngữ cảnh (kiểm duyệt).

## Giấy phép
MIT License