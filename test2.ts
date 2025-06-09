import { BadWordFilter } from './src/BadWordFilter';

(async () => {
  const filter = await BadWordFilter.create(); // Đọc từ bad-words.txt
  console.log(filter.hasBadWord('Bình luận có từ địt không?')); // true
  console.log(filter.filter('Bình luận có từ lồn không?')); // Bình luận có từ *** không?
})();