# Bộ Lọc Từ Xấu

Thư viện TypeScript để phát hiện và lọc các từ ngữ xúc phạm trong văn bản, hỗ trợ tiếng Việt và tiếng Anh, bao gồm các từ phân biệt vùng miền. **Hiện tại hỗ trợ cả Node.js và Browser (bao gồm NextJS)**.

## ✨ Tính năng

- 🔍 Phát hiện từ/cụm từ xúc phạm (không phân biệt hoa/thường)
- 🎭 Thay thế từ xấu bằng ký tự che mờ (mặc định: `*`)
- 🌐 Hỗ trợ từ xấu tiếng Việt (`địt`, `đồ Bắc Kỳ`) và tiếng Anh (`fuck`, `shit`)
- 🚀 Tương thích với **Node.js**, **Browser**, và **Next.js**
- 📦 Nhiều định dạng build: CommonJS, ES Modules, UMD
- 🎯 API mới với nhiều tính năng: `getBadWordsFound()`, `analyze()`
- ⚡ Browser version với dữ liệu từ xấu được nhúng sẵn (không cần file external)
- 🔧 Cấu hình linh hoạt: custom words, case sensitivity, replace character

## 📦 Cài đặt

```bash
npm install @dwcks/bad-word-filter-vi-en
```

## 🚀 Sử dụng

### Node.js Environment

#### Cách mới (khuyến nghị - Constructor-based)
```typescript
import { NodeBadWordFilter } from '@dwcks/bad-word-filter-vi-en';

// Sử dụng file bad-words.txt mặc định
const filter = new NodeBadWordFilter();
await filter.loadBadWords();

console.log(filter.hasBadWord('Bình luận có từ địt không?')); // true
console.log(filter.filter('Bình luận có từ địt không?')); // Bình luận có từ *** không?
console.log(filter.getBadWordsFound('Có fuck và shit')); // ['fuck', 'shit']

// Phân tích chi tiết
const analysis = filter.analyze('Text có từ xấu');
console.log(analysis);
// {
//   hasBadWords: true,
//   wordsFound: ['địt'],
//   filteredText: 'Text có từ ***'
// }
```

#### Với tùy chọn tùy chỉnh
```typescript
const filter = new NodeBadWordFilter('/path/to/custom-words.txt', {
  replaceChar: '#',
  caseSensitive: false,
  additionalBadWords: ['custom', 'word'],
  customBadWords: ['override', 'list'] // Ghi đè danh sách mặc định
});
await filter.loadBadWords();
```

#### Cách cũ (vẫn hỗ trợ - Factory method)
```typescript
import { BadWordFilter } from '@dwcks/bad-word-filter-vi-en';

const filter = await BadWordFilter.create(); // Đọc từ bad-words.txt
// hoặc
const filter = await BadWordFilter.create(['địt', 'ngu']); // Từ mảng
```

### Browser Environment

#### ES Modules
```typescript
import { BrowserBadWordFilter } from '@dwcks/bad-word-filter-vi-en/browser';

// Sử dụng danh sách từ xấu có sẵn (4000+ từ được nhúng sẵn)
const filter = new BrowserBadWordFilter();
await filter.loadBadWords();

console.log(filter.filter('Some text with bad words'));
```

#### Với từ xấu tùy chỉnh
```typescript
const filter = new BrowserBadWordFilter({
  customBadWords: ['custom', 'bad', 'words'],
  replaceChar: '#'
});
await filter.loadBadWords();
```

#### Tải từ URL
```typescript
const filter = new BrowserBadWordFilter({
  badWordsUrl: 'https://your-domain.com/bad-words.txt'
});
await filter.loadBadWords();
```

#### UMD Build trong HTML
```html
<script src="./node_modules/@dwcks/bad-word-filter-vi-en/dist/browser/bad-word-filter.min.js"></script>
<script>
  const filter = new BadWordFilter.BrowserBadWordFilter();
  filter.loadBadWords().then(() => {
    console.log(filter.filter('Text với từ xấu'));
  });
</script>
```

### NextJS Support

#### API Route (pages/api/filter.ts hoặc app/api/filter/route.ts)
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
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Văn bản không hợp lệ' });
      }
      
      const filter = await getFilter();
      const analysis = filter.analyze(text);
      
      res.status(200).json(analysis);
    } catch (error) {
      res.status(500).json({ error: `Lỗi khi lọc: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }
}
```

#### Client-side Component (React/NextJS)
```typescript
'use client';
import { BrowserBadWordFilter } from '@dwcks/bad-word-filter-vi-en/browser';
import { useState, useEffect } from 'react';

export default function FilterComponent() {
  const [filter, setFilter] = useState<BrowserBadWordFilter | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  
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
      setResult(analysis);
    }
  };
  
  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập text cần lọc..."
      />
      <button onClick={handleFilter}>Lọc từ xấu</button>
      {result && (
        <div>
          <p>Có từ xấu: {result.hasBadWords ? 'Có' : 'Không'}</p>
          <p>Từ xấu tìm thấy: [{result.wordsFound.join(', ')}]</p>
          <p>Text đã lọc: {result.filteredText}</p>
        </div>
      )}
    </div>
  );
}
```

## 📋 API Reference

### Các phương thức chính
- `hasBadWord(text: string): boolean` - Kiểm tra có từ xấu không
- `filter(text: string, mask?: string): string` - Lọc từ xấu với ký tự che
- `getBadWordsFound(text: string): string[]` - Lấy danh sách từ xấu tìm thấy
- `loadBadWords(): Promise<void>` - Tải danh sách từ xấu (async)
- `analyze(text: string): BadWordDetectionResult` - Phân tích chi tiết

### Tùy chọn cấu hình
```typescript
interface BadWordFilterOptions {
  replaceChar?: string;        // Mặc định: '*'
  caseSensitive?: boolean;     // Mặc định: false
  customBadWords?: string[];   // Danh sách từ xấu tùy chỉnh
  additionalBadWords?: string[]; // Thêm từ vào danh sách mặc định
  badWordsUrl?: string;        // URL tải từ xấu (chỉ browser)
}
```

### Kết quả phân tích
```typescript
interface BadWordDetectionResult {
  hasBadWords: boolean;     // Có từ xấu không
  wordsFound: string[];     // Danh sách từ xấu tìm thấy
  filteredText: string;     // Text đã được lọc
}
```

## 📂 Cấu trúc Build

```
dist/
├── node/           # CommonJS build cho Node.js
├── esm/            # ES Modules build
├── browser/        # Browser builds
│   ├── bad-word-filter.min.js  # UMD build (60KB)
│   └── bad-word-filter.esm.js  # ES Module build (59KB)
└── bad-words.txt   # File từ xấu gốc
```

## 📊 Kích thước
- **Node.js build**: ~5KB (không bao gồm file từ xấu)
- **Browser UMD**: ~60KB (bao gồm 4000+ từ)
- **Browser ESM**: ~59KB (bao gồm 4000+ từ)

## 📁 Cấu trúc dự án

```
bad-word-filter/
├── src/
│   ├── index.ts              # Main exports
│   ├── interfaces.ts         # TypeScript interfaces
│   ├── base.ts              # Abstract base class
│   ├── node.ts              # Node.js implementation
│   ├── browser.ts           # Browser implementation
│   ├── browser-words.ts     # Auto-generated word data
│   ├── BadWordFilter.ts     # Legacy compatibility wrapper
│   └── bad-words.txt        # Word list file (4000+ words)
├── scripts/
│   └── generate-browser-words.js  # Build script
├── tests/
│   ├── test-bad-word-filter.ts    # Legacy tests
│   └── test-new-api.ts           # New API tests
├── dist/                    # Build output
├── webpack.config.js        # Browser build config
├── tsconfig*.json          # TypeScript configs
└── package.json            # Package configuration
```

## 🧪 Kiểm tra

```bash
# Chạy test legacy
npm run test

# Chạy test API mới
npm run test:new

# Build toàn bộ
npm run build

# Build riêng biệt
npm run build:node      # Node.js build
npm run build:browser   # Browser build
npm run build:esm       # ES Modules build
```

## 🔄 Migration từ v1.x

### Cách cũ (vẫn hoạt động):
```typescript
import { BadWordFilter } from '@dwcks/bad-word-filter-vi-en';
const filter = await BadWordFilter.create();
```

### Cách mới (khuyến nghị):
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

## 🎯 Performance

- **Node.js**: Khởi động nhanh, đọc từ file theo yêu cầu
- **Browser**: Tải lần đầu chậm hơn (60KB), nhưng filter rất nhanh
- **Memory**: Browser version sử dụng nhiều memory hơn do data được nhúng
- **Network**: Browser version không cần request thêm (trừ khi dùng URL option)

## 📦 Package Exports

Package hỗ trợ conditional exports để tự động chọn build phù hợp:

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

## ⚠️ Lưu ý quan trọng

- **Mã hóa**: File `bad-words.txt` phải được lưu ở định dạng UTF-8
- **Word boundaries**: Regex sử dụng Unicode word boundaries để khớp chính xác
- **Cụm từ**: Hỗ trợ cụm từ như `đồ Bắc Kỳ`, `thằng ngu` - được ưu tiên theo độ dài
- **Browser compatibility**: Yêu cầu modern browsers hỗ trợ ES2015+
- **NextJS deployment**: 
  - Serverless: Sử dụng `customBadWords` thay vì file
  - Server-side: Đảm bảo `bad-words.txt` có trong build
- **Nhạy cảm văn hóa**: Một số từ như `Bắc Kỳ`, `Nam Kỳ` có thể nhạy cảm - sử dụng cẩn thận

## 📚 Tài liệu bổ sung

- [BROWSER_SUPPORT.md](./BROWSER_SUPPORT.md) - Hướng dẫn chi tiết về browser support
- [Webpack config](./webpack.config.js) - Cấu hình build browser
- [TypeScript configs](./tsconfig*.json) - Cấu hình builds

## 🤝 Đóng góp

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 Giấy phép

MIT License - xem [LICENSE](./LICENSE) để biết chi tiết.