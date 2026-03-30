import { prisma } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';

const problems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'EASY',
    tags: ['Array', 'Hash Table'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    hints: 'Try using a hash map to store seen numbers.',
    editorial: 'Use a hash map. For each number, check if (target - number) exists in the map.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6',     output: '[1,2]', explanation: 'nums[1] + nums[2] == 6' },
    ],
    testCases: [
      { input: { nums: [2,7,11,15], target: 9 }, output: [0,1] },
      { input: { nums: [3,2,4],     target: 6 }, output: [1,2] },
      { input: { nums: [3,3],       target: 6 }, output: [0,1] },
    ],
    codeSnippets: {
      javascript: `function twoSum(nums, target) {\n  // your code here\n};`,
      python:     `def twoSum(self, nums, target):\n    # your code here`,
      java:       `public int[] twoSum(int[] nums, int target) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
};`,
    },
  },
  {
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same forward and backward.',
    difficulty: 'EASY',
    tags: ['Math'],
    constraints: '-2^31 <= x <= 2^31 - 1',
    hints: 'Negative numbers are never palindromes. Try converting to string.',
    editorial: 'Convert the number to a string and check if it equals its reverse.',
    examples: [
      { input: 'x = 121',  output: 'true',  explanation: '121 reads the same forward and backward.' },
      { input: 'x = -121', output: 'false', explanation: 'Reads -121 forward but 121- backward.' },
    ],
    testCases: [
      { input: { x: 121  }, output: true  },
      { input: { x: -121 }, output: false },
      { input: { x: 10   }, output: false },
    ],
    codeSnippets: {
      javascript: `function isPalindrome(x) {\n  // your code here\n};`,
      python:     `def isPalindrome(self, x):\n    # your code here`,
      java:       `public boolean isPalindrome(int x) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function isPalindrome(x) {
  if (x < 0) return false;
  const s = String(x);
  return s === s.split('').reverse().join('');
};`,
    },
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'MEDIUM',
    tags: ['String', 'Hash Table'],
    constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    hints: 'Use a sliding window approach with a set to track characters.',
    editorial: 'Use two pointers (left, right) and a set. Expand right, shrink left when duplicate found.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"',    output: '1', explanation: 'The answer is "b", with length 1.' },
    ],
    testCases: [
      { input: { s: 'abcabcbb' }, output: 3 },
      { input: { s: 'bbbbb'    }, output: 1 },
      { input: { s: 'pwwkew'   }, output: 3 },
    ],
    codeSnippets: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // your code here\n};`,
      python:     `def lengthOfLongestSubstring(self, s):\n    # your code here`,
      java:       `public int lengthOfLongestSubstring(String s) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) { set.delete(s[left]); left++; }
    set.add(s[right]);
    max = Math.max(max, right - left + 1);
  }
  return max;
};`,
    },
  },
  {
    title: 'Valid Parentheses',
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Open brackets must be closed by the same type of brackets, and in the correct order.",
    difficulty: 'EASY',
    tags: ['String'],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only.',
    hints: 'Use a stack. Push open brackets, pop and match on close brackets.',
    editorial: 'Use a stack. For every closing bracket, check if the top of stack is the matching opener.',
    examples: [
      { input: 's = "()"',    output: 'true',  explanation: 'Brackets match.' },
      { input: 's = "(]"',    output: 'false', explanation: 'Mismatched brackets.' },
    ],
    testCases: [
      { input: { s: '()'     }, output: true  },
      { input: { s: '()[]{}'  }, output: true  },
      { input: { s: '(]'     }, output: false },
    ],
    codeSnippets: {
      javascript: `function isValid(s) {\n  // your code here\n};`,
      python:     `def isValid(self, s):\n    # your code here`,
      java:       `public boolean isValid(String s) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('({['.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
};`,
    },
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    difficulty: 'MEDIUM',
    tags: ['Array', 'Dynamic Programming'],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    hints: "Think about Kadane's algorithm.",
    editorial: "Use Kadane's algorithm: track current sum and reset to 0 when it goes negative.",
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6.' },
      { input: 'nums = [1]',                       output: '1', explanation: 'Only one element.' },
    ],
    testCases: [
      { input: { nums: [-2,1,-3,4,-1,2,1,-5,4] }, output: 6  },
      { input: { nums: [1]                       }, output: 1  },
      { input: { nums: [5,4,-1,7,8]              }, output: 23 },
    ],
    codeSnippets: {
      javascript: `function maxSubArray(nums) {\n  // your code here\n};`,
      python:     `def maxSubArray(self, nums):\n    # your code here`,
      java:       `public int maxSubArray(int[] nums) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function maxSubArray(nums) {
  let max = nums[0], curr = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]);
    max = Math.max(max, curr);
  }
  return max;
};`,
    },
  },
  {
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
    difficulty: 'HARD',
    tags: ['Array', 'Sorting'],
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m, n <= 1000\n1 <= m + n <= 2000',
    hints: 'Use binary search on the smaller array.',
    editorial: 'Binary search on the partition point of the smaller array.',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]',   output: '2.00000', explanation: 'Merged: [1,2,3], median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'Merged: [1,2,3,4], median is 2.5.' },
    ],
    testCases: [
      { input: { nums1: [1,3], nums2: [2]   }, output: 2.0  },
      { input: { nums1: [1,2], nums2: [3,4] }, output: 2.5  },
    ],
    codeSnippets: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {\n  // your code here\n};`,
      python:     `def findMedianSortedArrays(self, nums1, nums2):\n    # your code here`,
      java:       `public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n    // your code here\n}`,
    },
    referenceSolutions: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  const merged = [...nums1, ...nums2].sort((a, b) => a - b);
  const mid = Math.floor(merged.length / 2);
  return merged.length % 2 !== 0 ? merged[mid] : (merged[mid-1] + merged[mid]) / 2;
};`,
    },
  },
];

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create or find an admin user to own the problems
  const adminEmail = 'admin@leetcode.com'
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where:  { email: adminEmail },
    update: {},
    create: {
      email:    adminEmail,
      name:     'Admin',
      password: hashedPassword,
      role:     'ADMIN',
    },
  })
  console.log(`  ✓ Admin user ready: ${admin.email}`)

  // 2. Clear existing problems
  await prisma.problem.deleteMany()
  console.log('  ✓ Cleared existing problems')

  // 3. Seed problems
  for (const problem of problems) {
    await prisma.problem.create({
      data: {
        ...problem,
        userId: admin.id,
      }
    })
    console.log(`  ✓ Created: ${problem.title}`)
  }

  console.log(`\n✅ Done! Seeded ${problems.length} problems.`)
  console.log(`   Admin login → email: ${adminEmail}  password: admin123`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())