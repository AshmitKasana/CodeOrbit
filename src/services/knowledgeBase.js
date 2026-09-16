import { slugify } from '../utils/helpers'

// ---------------------------------------------------------------------------
// This file is the mock "AI" knowledge base used by aiService.js when no real
// backend is connected (see src/services/aiService.js). Each entry follows
// the exact schema documented in aiService.js so that swapping in a real LLM
// response later requires no changes to any component.
// ---------------------------------------------------------------------------

const pointers = {
  keys: ['pointer', 'pointers', 'reference', 'references'],
  build: (language) => ({
    title: 'Pointers & References',
    summary:
      'A pointer (or reference) is a value that stores the location of other data in memory, letting code reach and modify that data indirectly.',
    overview: {
      beginner:
        "Imagine a locker room where every locker has a number. A **pointer** is just that number written on a sticky note — it doesn't hold your belongings itself, it tells you *which locker* holds them. In programming, a pointer/reference holds the *address* of a value in memory instead of the value itself, so multiple parts of a program can find and share the same piece of data.",
      intermediate:
        'A pointer is a variable whose value is a memory address. Dereferencing a pointer follows that address to read or write the data stored there. Languages differ in how much of this machinery they expose: some (C, C++) give you the raw address and let you do arithmetic on it; others (Java, Python, JavaScript, Go) expose only safe *references* — you can follow them to an object, but you cannot see, forge, or offset the underlying address.',
      advanced:
        'Conceptually a pointer is a first-class value in the address space: `sizeof(T*)` bytes containing a location that the CPU/MMU translates through page tables to a physical frame. Indirection through a pointer costs a memory load; pointer arithmetic is scaled by `sizeof(T)`. Managed-reference languages replace this with an opaque handle — often literally a pointer under the hood in the runtime — but the language spec forbids arithmetic on it, forbids reading it as an integer, and ties its validity to the garbage collector so it can be relocated (e.g. by a compacting GC) without breaking your program.',
      interview:
        "Be precise about the distinction: a pointer is an address you can inspect and manipulate; a reference (Java/Python/JS/Go/C#) is an opaque handle to an object that you can only follow, reassign, or compare — never offset. Interviewers often use \"pointers in Java\" as a trap question to see whether you conflate the two.",
    },
    coreConcept: {
      beginner:
        'Pointers/references exist so that programs can **share and update the same data** without copying it everywhere, and so data structures (linked lists, trees, graphs) can literally point to their neighbors.',
      intermediate:
        'They exist to enable: (1) pass-by-reference-like semantics for large objects without copying, (2) dynamic data structures whose size and shape are only known at runtime, (3) manual or automatic memory management, and (4) building block-level primitives like arrays and strings on top of a flat address space.',
      advanced:
        'At the machine level, every non-trivial data structure is a graph of memory cells connected by addresses. Pointers are how a linked list node "knows" the next node, how a virtual method table is dispatched, how a heap-allocated object is found from a stack frame, and how the runtime\'s garbage collector walks live objects. Managed languages keep this power internally (in the JIT/interpreter) while denying it to user code for safety.',
      interview:
        'Key terminology to use fluently: address, dereference, indirection, aliasing, pointer arithmetic, null pointer, dangling pointer, pass-by-value vs pass-by-reference, and (for managed languages) garbage collection and reachability.',
    },
    syntax: {
      C: ['int x = 10;', 'int *p = &x;      // p holds the address of x', '*p = 20;          // dereference: writes 20 into x', 'p++;              // pointer arithmetic: advances by sizeof(int) bytes'],
      'C++': ['int x = 10;', 'int *p = &x;      // raw pointer', 'int &r = x;       // reference: an alias, cannot be reseated', '*p = 20;          // dereference', 'std::unique_ptr<int> sp = std::make_unique<int>(5); // smart pointer (RAII)'],
      Java: ['Point p = new Point(1, 2); // p is a reference to the object', 'Point q = p;                // q refers to the SAME object, not a copy', 'q.x = 99;                    // p.x is also 99 now (aliasing)', '// there is no "Point *p" and no pointer arithmetic in Java'],
      Python: ['p = [1, 2, 3]     # p is a name bound to a list object', 'q = p             # q refers to the SAME list', 'q.append(4)       # p also sees the change (aliasing)', 'r = p[:]          # a real copy — new object, no aliasing'],
      JavaScript: ['let obj = { x: 1 };', 'let other = obj;      // other references the same object', 'other.x = 99;         // obj.x is also 99', 'const clone = { ...obj }; // shallow copy breaks the aliasing'],
      TypeScript: ['let obj: { x: number } = { x: 1 };', 'let other = obj;      // same reference semantics as JavaScript', 'other.x = 99;         // obj.x === 99'],
      'C#': ['int x = 10;', 'ref int r = ref x;   // explicit reference to a variable', 'r = 20;              // x is now 20', 'object o = new Point(1,2); // reference type on the heap'],
      Go: ['x := 10', 'p := &x        // p is *int, holds the address of x', '*p = 20        // dereference and assign', '// Go pointers cannot do arithmetic (p++ is illegal)'],
      Rust: ['let x = 10;', 'let r = &x;        // immutable borrow (a safe reference)', 'let mut y = 10;', 'let m = &mut y;    // mutable borrow, checked at compile time', '*m += 1;'],
      Kotlin: ['val p = Point(1, 2) // p references the object', 'val q = p            // aliasing, same object', 'q.x = 99              // p.x is also 99'],
      Swift: ['class Point { var x = 0 }', 'let p = Point()', 'let q = p        // reference semantics (class = reference type)', 'q.x = 99          // p.x is also 99', 'struct Vector { var x = 0 } // structs are VALUE types — copied, not aliased'],
    },
    howItWorks:
      'When you write `int *p = &x;` in C, the compiler stores the numeric address of `x` inside `p`. Dereferencing (`*p`) tells the CPU to load/store at that address. In a managed language like Java, `Point p = new Point()` allocates the object on the heap and binds `p` to an internal reference the JVM controls — you can copy that reference, pass it, compare it with `==` (identity), or null it out, but you can never see the numeric address, offset it, or free the memory yourself. The JVM/CLR/interpreter is still using pointers internally; the *language* just refuses to expose them.',
    memoryConcept:
      'Every running program has a **stack** (fast, fixed-size frames for local variables and return addresses, automatically reclaimed when a function returns) and a **heap** (a larger pool for dynamically-sized, longer-lived data). A pointer/reference variable itself usually lives on the stack, while the object it points to typically lives on the heap. In C/C++, you must free heap memory yourself (or use RAII/smart pointers); in Java, Python, JavaScript, Go, C#, Kotlin, and Swift (for classes), a garbage collector or reference counter reclaims heap objects once nothing references them anymore.',
    examples: [
      {
        title: 'Swapping two values',
        language: 'C',
        code: 'void swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 1, y = 2;\n    swap(&x, &y);\n    // x == 2, y == 1\n    return 0;\n}',
        explanation: 'Passing the addresses of x and y lets swap() modify the caller\'s variables directly — this is impossible with pass-by-value alone.',
      },
      {
        title: 'Reference aliasing (the Java equivalent)',
        language: 'Java',
        code: 'class Box { int value; }\n\nclass Demo {\n    static void mutate(Box b) {\n        b.value = 99; // follows the reference, mutates the SAME object\n    }\n    public static void main(String[] args) {\n        Box box = new Box();\n        box.value = 1;\n        mutate(box);\n        System.out.println(box.value); // 99\n    }\n}',
        explanation: 'Java passes the reference *by value* — the method gets a copy of the reference, but that copy still points at the same object, so mutations are visible to the caller. Reassigning the parameter itself (b = new Box()) would NOT affect the caller\'s variable.',
      },
      {
        title: 'Aliasing in Python',
        language: 'Python',
        code: 'def mutate(box):\n    box["value"] = 99  # follows the reference\n\nbox = {"value": 1}\nmutate(box)\nprint(box["value"])  # 99',
        explanation: 'Python variables are names bound to objects; passing a mutable object shares that same object, so in-place mutation is visible to the caller — exactly analogous to Java references.',
      },
    ],
    visual: { type: 'pointer-diagram' },
    complexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
      space: 'O(1)',
      explanation:
        'Dereferencing a pointer/reference is a single memory access, and following it is independent of how much data the structure holds — that\'s precisely why linked structures use pointers instead of copying data around.',
    },
    languageComparison: {
      columns: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
      rows: [
        { concept: 'Raw pointers (visible address)', values: ['Yes', 'Yes', 'No', 'No', 'No'] },
        { concept: 'Pointer arithmetic', values: ['Yes', 'Yes', 'No', 'No', 'No'] },
        { concept: 'Object references', values: ['Limited (via pointers)', 'Yes', 'Yes (all objects)', 'Yes (all objects)', 'Yes (all objects)'] },
        { concept: 'Manual memory management', values: ['Yes (malloc/free)', 'Yes (new/delete, RAII)', 'No (GC)', 'No (GC/refcount)', 'No (GC)'] },
        { concept: 'Null safety', values: ['No (NULL is a valid address)', 'No (nullptr)', 'NullPointerException at runtime', 'None value, explicit check', 'null/undefined, explicit check'] },
      ],
    },
    commonMistakes: [
      { mistake: 'Assuming Java/Python/JS have C-style pointers', explanation: 'Writing `int *p;` style code or expecting pointer arithmetic in Java is a fundamental misunderstanding — these languages only expose managed references.' },
      { mistake: 'Dangling pointers', explanation: 'Using a pointer after the memory it points to has been freed (C/C++) is undefined behavior — a classic source of crashes and security bugs.' },
      { mistake: 'Confusing reference reassignment with mutation', explanation: 'In Java/Python/JS, reassigning a parameter inside a function does not affect the caller\'s variable — only mutating the object it points to does.' },
      { mistake: 'Null/uninitialized pointer dereference', explanation: 'Dereferencing a null pointer/reference crashes the program (segfault in C/C++, NullPointerException in Java, TypeError in JS).' },
    ],
    interviewQuestions: [
      {
        question: 'Does Java have pointers?',
        shortAnswer: 'No, not exposed to the programmer — Java uses managed references instead.',
        detailedAnswer: 'Internally the JVM uses addresses to implement object references, but the language forbids reading them as numbers, performing arithmetic on them, or forging them — you can only create, copy, compare, and follow references, which is a safer subset of what a C pointer can do.',
        tip: 'Say this explicitly rather than just "no" — it shows you understand *why* the distinction matters, not just the trivia answer.',
      },
      {
        question: 'What is the difference between a pointer and a reference?',
        shortAnswer: 'A pointer exposes and allows arithmetic on a raw address; a reference is an opaque, safe handle that can only be followed.',
        detailedAnswer: 'In C++ specifically, a reference is also a compile-time alias (cannot be reseated, cannot be null in valid code), whereas in Java/Python/JS a "reference" is a runtime handle that CAN be reassigned or set to null, but still never exposes an address or supports arithmetic.',
        tip: 'If asked about C++ references specifically, mention they must be initialized and cannot be reseated — that\'s the detail that separates a strong answer.',
      },
      {
        question: 'Why does Java avoid direct pointer manipulation?',
        shortAnswer: 'Safety, portability, and enabling garbage collection.',
        detailedAnswer: 'Exposing raw addresses would let buggy or malicious code corrupt arbitrary memory, would tie the language to a specific memory layout, and would make it impossible for the JVM to move objects during garbage collection (a compacting collector must be free to relocate objects).',
        tip: 'Connect this answer to garbage collection — interviewers are usually probing whether you understand the tradeoff, not just the rule.',
      },
      {
        question: 'What is a dangling pointer and how do you avoid it?',
        shortAnswer: 'A pointer that still refers to memory that has already been freed.',
        detailedAnswer: 'In C/C++ this happens after free()/delete on the target; dereferencing it is undefined behavior. Avoid it with RAII/smart pointers (unique_ptr/shared_ptr), setting pointers to null after freeing, and tools like AddressSanitizer/Valgrind for detection.',
        tip: 'Mention smart pointers proactively — it signals modern C++ knowledge.',
      },
    ],
    practiceProblems: buildGenericPractice('pointers and references'),
    relatedTopics: ['References', 'Stack vs Heap', 'Objects', 'Garbage Collection', 'Arrays', 'Memory Management', 'C/C++ Pointers', 'Pass by Value', 'Pass by Reference'],
    languageNote: (language) =>
      language === 'Java'
        ? 'Java does not expose traditional C/C++-style pointers to application code — it uses managed references instead, which is why "int *ptr;" style syntax never appears in valid Java.'
        : null,
  }),
}

const arrays = {
  keys: ['array', 'arrays'],
  build: () => ({
    title: 'Arrays',
    summary: 'A fixed-size, contiguous block of memory holding elements of the same type, accessed in O(1) time by index.',
    overview: {
      beginner: 'Think of an array as a row of numbered boxes sitting right next to each other. Because they sit side by side, if you know the row\'s starting point and a box\'s number (its **index**), you can jump straight to it instantly — no need to open every box before it.',
      intermediate: 'An array stores elements of the same type in contiguous memory. Element `i` sits at `base_address + i * sizeof(element)`, which is why indexing is O(1): the address is computed directly, not searched for.',
      advanced: 'Contiguity is what enables O(1) random access and cache-friendly sequential scans (spatial locality), but it also means insertion/deletion in the middle requires shifting O(n) elements, and growing beyond the allocated capacity requires a full reallocation and copy (amortized O(1) for languages with dynamic arrays like ArrayList/Vector/list).',
      interview: 'Be ready to discuss the static-array vs dynamic-array (ArrayList/Vector/list) distinction, amortized doubling, and cache locality as the reason arrays often outperform linked lists in practice despite equal Big-O for some operations.',
    },
    coreConcept: {
      beginner: 'Arrays exist to store an ordered collection of the same kind of item so you can access any one of them instantly by position.',
      intermediate: 'Arrays are the simplest way to achieve O(1) random access. Static arrays (C, Java `int[]`) have a fixed size decided at creation; dynamic arrays (`ArrayList`, `std::vector`, Python `list`, JS `Array`) resize automatically by allocating a larger backing array (usually 1.5x–2x) and copying elements when full.',
      advanced: 'The doubling strategy for dynamic arrays gives amortized O(1) append: most appends are O(1), but occasionally one costs O(n) to reallocate — averaged (amortized) across n appends, the cost per append is still O(1).',
      interview: 'Know the difference between a language\'s "array" (often fixed-size, e.g. Java int[]) and its "list" type (dynamic, e.g. ArrayList) — interviewers frequently test this distinction.',
    },
    syntax: {
      Java: ['int[] arr = {10, 20, 30};', 'int first = arr[0];', 'arr[1] = 99;', 'int len = arr.length; // property, not a method'],
      'C++': ['int arr[3] = {10, 20, 30};', 'std::vector<int> v = {10, 20, 30}; // dynamic array', 'v.push_back(40);'],
      Python: ['arr = [10, 20, 30]  # Python "lists" are dynamic arrays', 'arr.append(40)', 'first = arr[0]'],
      JavaScript: ['const arr = [10, 20, 30];', 'arr.push(40);', 'const first = arr[0];'],
      C: ['int arr[3] = {10, 20, 30};', 'int first = arr[0]; // arr decays to a pointer to arr[0]'],
    },
    howItWorks: 'Indexing computes `base_address + index * element_size` directly — no traversal needed. Inserting/removing at the front or middle requires shifting every subsequent element by one slot, which is O(n).',
    memoryConcept: 'A static array is one contiguous block on the stack (local) or heap (allocated). A dynamic array is a heap-allocated backing array plus a small header tracking length/capacity; when capacity is exceeded, a new (usually larger) block is allocated and old elements are copied over.',
    examples: [
      { title: 'Basic array access', language: 'Java', code: 'int[] arr = {10, 20, 30};\nSystem.out.println(arr[0]); // 10', explanation: 'Direct O(1) index access.' },
      { title: 'Dynamic array growth', language: 'Python', code: 'arr = []\nfor i in range(5):\n    arr.append(i)\nprint(arr)  # [0, 1, 2, 3, 4]', explanation: 'append() is amortized O(1) even though the list occasionally reallocates internally.' },
    ],
    visual: { type: 'array', data: { values: [10, 20, 30, 40] } },
    complexity: {
      best: 'O(1) — access/append',
      average: 'O(1) access, O(n) insert/delete at arbitrary index',
      worst: 'O(n) — insert/delete at the front, or a reallocation on append',
      space: 'O(n)',
      explanation: 'Access is always O(1) due to direct address computation. Insertion/deletion cost comes from shifting elements to keep the array contiguous.',
    },
    languageComparison: {
      columns: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
      rows: [
        { concept: 'Fixed-size array type', values: ['Yes (T[])', 'Yes (T[])', 'Yes (T[])', 'No (lists are dynamic)', 'No (arrays are dynamic)'] },
        { concept: 'Built-in dynamic array', values: ['No (manual realloc)', 'std::vector', 'ArrayList<T>', 'list', 'Array'] },
        { concept: 'Bounds checking', values: ['No', 'No (vector.at() does)', 'Yes (throws)', 'Yes (raises)', 'No (returns undefined)'] },
      ],
    },
    commonMistakes: [
      { mistake: 'Off-by-one errors', explanation: 'Looping with `<=` instead of `<` against length is the single most common array bug.' },
      { mistake: 'Assuming insert/delete is O(1)', explanation: 'Only append/removal at the end is O(1) amortized; anywhere else requires shifting elements.' },
      { mistake: 'Out-of-bounds access', explanation: 'C/C++ silently read/write adjacent memory (undefined behavior); other languages throw at runtime.' },
    ],
    interviewQuestions: [
      { question: 'Why is array access O(1)?', shortAnswer: 'The address of any element is computed directly from the index.', detailedAnswer: 'address = base + index * elementSize — no traversal required, unlike a linked list.', tip: 'Mention the formula explicitly.' },
      { question: 'How does a dynamic array grow?', shortAnswer: 'It allocates a larger backing array and copies elements over.', detailedAnswer: 'Most implementations double capacity when full, giving amortized O(1) append despite occasional O(n) copies.', tip: 'Use the word "amortized" — it signals rigor.' },
    ],
    practiceProblems: buildGenericPractice('arrays'),
    relatedTopics: ['Strings', 'Dynamic Array', 'Two Pointers', 'Sliding Window', 'Sorting', 'Hash Table'],
  }),
}

const linkedList = {
  keys: ['linked list', 'linkedlist', 'linked-list'],
  build: () => ({
    title: 'Linked List',
    summary: 'A linear data structure where each element (node) stores a value and a pointer/reference to the next node, allowing O(1) insertion without shifting elements.',
    overview: {
      beginner: 'Instead of sitting in numbered boxes next to each other like an array, a linked list is a chain of separate boxes scattered anywhere in memory — each box just holds a note telling you where the next box is.',
      intermediate: 'A singly linked list node holds a value and a reference to the next node; a doubly linked list also keeps a reference to the previous node, allowing traversal in both directions at the cost of extra memory per node.',
      advanced: 'Because nodes are not contiguous, linked lists trade cache locality for O(1) insertion/deletion once you have a reference to the relevant node — no shifting is required, unlike an array. This makes them ideal as the backing structure for queues, LRU caches (with a hash map), and adjacency lists.',
      interview: 'Be fluent in reversing a list in-place, detecting a cycle (Floyd\'s tortoise and hare), and finding the middle node with slow/fast pointers — these are the three most common linked-list interview patterns.',
    },
    coreConcept: {
      beginner: 'Linked lists exist so you can insert and remove items efficiently without moving every other item, which is expensive in an array.',
      intermediate: 'Each node is an independent heap allocation; the list itself is just a reference to the head (and often tail) node. Insertion/deletion at a known position is O(1); finding that position by index is O(n) since there is no random access.',
      advanced: 'Variants: singly linked (one direction), doubly linked (both directions), circular (tail points back to head). Trade-offs vs arrays: no random access, extra memory per node for pointers, poor cache locality — but O(1) splice/insert/delete given a node reference.',
      interview: 'Contrast with arrays clearly: arrays give O(1) random access but O(n) insert/delete; linked lists give O(n) access but O(1) insert/delete at a known position.',
    },
    syntax: {
      Java: ['class Node {\n    int val;\n    Node next;\n    Node(int val) { this.val = val; }\n}'],
      Python: ['class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None'],
      'C++': ['struct Node {\n    int val;\n    Node* next;\n    Node(int v) : val(v), next(nullptr) {}\n};'],
      JavaScript: ['class Node {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}'],
    },
    howItWorks: 'Traversal starts at the head and follows `next` references until reaching a null pointer/reference at the tail. Insertion at a known node is O(1): create a new node and relink two pointers; no shifting.',
    memoryConcept: 'Each node is a separate heap allocation, so nodes can be scattered anywhere in memory. This means iterating a linked list touches many non-contiguous memory pages — much less cache-friendly than scanning an array of the same size.',
    examples: [
      { title: 'Reverse a singly linked list', language: 'Java', code: 'Node reverse(Node head) {\n    Node prev = null;\n    while (head != null) {\n        Node next = head.next;\n        head.next = prev;\n        prev = head;\n        head = next;\n    }\n    return prev;\n}', explanation: 'Classic O(n) time, O(1) space in-place reversal by walking pointers.' },
      { title: 'Detect a cycle (Floyd\'s algorithm)', language: 'Python', code: 'def has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False', explanation: 'The fast pointer moves 2x speed; if there is a cycle they must eventually meet.' },
    ],
    visual: { type: 'linked-list', data: { values: [10, 20, 30] } },
    complexity: {
      best: 'O(1) — insert/delete at head',
      average: 'O(n) — search',
      worst: 'O(n) — search/insert/delete at tail without a tail pointer',
      space: 'O(n)',
      explanation: 'Insertion/deletion is O(1) once you have a reference to the relevant node, but reaching that node (search by value or index) requires an O(n) traversal since there is no random access.',
    },
    languageComparison: {
      columns: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
      rows: [
        { concept: 'Built-in linked list', values: ['No (manual structs)', 'std::list / std::forward_list', 'LinkedList<T>', 'No (use collections.deque)', 'No (implement manually)'] },
        { concept: 'Manual pointer management', values: ['Yes', 'Optional (smart pointers)', 'No (GC)', 'No (GC)', 'No (GC)'] },
      ],
    },
    commonMistakes: [
      { mistake: 'Losing the head reference', explanation: 'Advancing the head pointer directly during traversal makes the list unreachable — always use a separate cursor variable.' },
      { mistake: 'Off-by-one when relinking', explanation: 'Forgetting to update `next` on the previous node before moving on creates broken chains or lost nodes.' },
      { mistake: 'Not handling empty list / single node edge cases', explanation: 'Reversal and deletion logic often breaks silently on 0 or 1-node lists if not explicitly tested.' },
    ],
    interviewQuestions: [
      { question: 'Array vs linked list — when would you pick each?', shortAnswer: 'Array for random access and cache performance; linked list for frequent insert/delete at known positions.', detailedAnswer: 'Arrays win when you need O(1) indexed access or iterate sequentially (cache locality); linked lists win when you frequently insert/remove in the middle and already hold a node reference (e.g., LRU cache, adjacency list).', tip: 'Always mention cache locality — it is the subtlety most candidates miss.' },
      { question: 'How do you detect a cycle in a linked list?', shortAnswer: "Floyd's tortoise and hare (slow/fast pointers).", detailedAnswer: 'Move one pointer one step and another two steps per iteration; if they meet, a cycle exists. O(n) time, O(1) space, superior to a hash-set approach which needs O(n) space.', tip: 'Mention the O(1) space advantage over the hash-set approach.' },
    ],
    practiceProblems: buildGenericPractice('linked lists'),
    relatedTopics: ['Arrays', 'Stack', 'Queue', 'Doubly Linked List', 'Cycle Detection', 'Pointers', 'Recursion'],
  }),
}

function buildGenericPractice(topicLabel) {
  const mk = (n, difficulty) => ({
    title: `${difficulty} Problem ${n}: ${topicLabel}`,
    statement: `Given the concepts of ${topicLabel}, solve a representative ${difficulty.toLowerCase()}-difficulty problem (see hint for direction).`,
    input: 'Described per-problem in a real dataset/array/string input.',
    output: 'The expected transformed value, boolean, or computed result.',
    constraints: '1 <= n <= 10^5 (typical competitive-programming bound)',
    example: 'Input: [example input]\nOutput: [example output]',
    hint: `Think about the core property of ${topicLabel} that makes an efficient solution possible.`,
    solution: `// A worked solution would apply the standard ${topicLabel} technique here.`,
    explanation: `The efficient approach leverages the defining trait of ${topicLabel} instead of a brute-force scan.`,
    complexity: difficulty === 'Easy' ? 'O(n)' : difficulty === 'Medium' ? 'O(n log n)' : 'O(n^2) or better with optimization',
  })
  return {
    easy: [1, 2, 3, 4, 5].map((n) => mk(n, 'Easy')),
    medium: [1, 2, 3, 4, 5].map((n) => mk(n, 'Medium')),
    hard: [1, 2, 3, 4, 5].map((n) => mk(n, 'Hard')),
  }
}

const ENTRIES = [pointers, arrays, linkedList]

export function findEntry(topic) {
  const t = topic.toLowerCase()
  for (const entry of ENTRIES) {
    if (entry.keys.some((k) => t.includes(k))) return entry
  }
  return null
}

export { buildGenericPractice }
