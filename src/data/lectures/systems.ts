import type { CoursePack } from "./types";

export const packs: CoursePack[] = [
  {
    slug: "csce-614",
    lectures: [
      {
        id: "l1",
        title: "The machine and its bottleneck",
        minutes: 40,
        paragraphs: [
          "A stored-program computer keeps instructions and data in the same memory. The processor fetches an instruction, decodes it, executes it, and writes a result. That loop is the von Neumann design, and the bottleneck is the path to memory: the processor can issue work faster than memory can supply operands. Architecture after that design is a set of attempts to keep the processor busy anyway. Pipelines, caches, vectors, and multiple processors are those attempts. They do not repeal the bottleneck. They hide it.",
          "Performance is instructions times cycles per instruction times the clock period. Change one factor and say which one you changed. A shorter clock does nothing for a program that now takes more cycles because the pipeline stalls. A smaller instruction count does nothing if each instruction waits on memory. Report time, not a clock speed.",
          "Instruction sets are the contract. A reduced set makes the pipeline simpler and shifts complexity into the compiler and the instruction count. A richer set can do more per instruction and can be harder to pipeline. This course does not pick a side as fashion. It asks, for a workload, which term in the product moved.",
          "Dataflow is the contrasting picture. An instruction runs when its operands are ready, not when a program counter arrives. A von Neumann core pretends the program is a line. A dataflow view admits it is a graph. Superscalar hardware is a limited dataflow engine wearing a program-counter costume: it finds ready instructions inside a window and runs them together.",
        ],
        figure: {
          kind: "pipeline",
          caption: "Time is the product of three terms. Name the term a change actually moves.",
          stages: ["How many", "Cycles each", "Seconds / cycle", "Seconds"],
        },
        example: {
          title: "Two billion instructions",
          steps: [
            "The program executes 2 billion instructions. CPI is 1.5. The clock is 2 billion cycles per second.",
            "Cycles required: 2 billion times 1.5 = 3 billion. Time: 3 billion / 2 billion = 1.5 seconds.",
            "A redesign with CPI 1.0 and the same clock takes 1.0 second. Speedup is 1.5, which is the old time over the new time.",
          ],
        },
        problems: [
          {
            prompt: "The clock doubles and the CPI also doubles, instruction count unchanged. What is the speedup?",
            answer: "Time is proportional to CPI over clock frequency. Both double, so the ratio is unchanged. Speedup is 1. The machine is not faster.",
          },
          {
            prompt: "A program is 50 percent memory waits that a cache removes, and the other 50 percent is unchanged. What speedup does Amdahl's law give?",
            answer: "The cached fraction takes essentially no time in the idealization where those waits drop to zero. New time is 0.5 of the old time. Speedup is 2. You cannot get more than 2 by perfecting half the program.",
          },
        ],
        narration:
          "A stored-program computer keeps instructions and data in one memory. The processor fetches, decodes, executes, and writes back. That loop is old, and the limit is still the path to memory. The processor can ask for work faster than memory answers. Pipelines, caches, vector units, and extra cores are ways to hide that wait. They do not remove it. Performance is a product: how many instructions, how many cycles each instruction takes, and how long a cycle is. Two billion instructions, one point five cycles each, at two billion cycles per second, takes one point five seconds. Cut the cycles per instruction to one, and the same program takes one second. The speedup is one point five. If you double the clock and also double the cycles per instruction, the time does not change. Say which term moved. A richer instruction set and a simpler one are not moral positions. They move different terms. Dataflow is the other picture: an instruction runs when its inputs are ready, not when a counter points at it. Modern cores already do a little of that inside a window. Read the numeric example, then do both problems. The pipeline lecture assumes you can compute a time.",
      },
      {
        id: "l2",
        title: "Pipelines and hazards",
        minutes: 45,
        paragraphs: [
          "A five-stage pipeline overlaps fetch, decode, execute, memory, and writeback. In the ideal case one instruction finishes every cycle after the pipe fills, so the speedup over a single-cycle design approaches the number of stages. The ideal is a diagram. Hazards are the reasons a real pipe stalls. A structural hazard is two stages wanting the same piece of hardware. A data hazard is an instruction that needs a result still in flight. A control hazard is a branch whose target is not known in time to fetch the next instruction.",
          "Forwarding sends a result from a later stage back to execute so the next instruction does not wait for writeback. It does not fix a load-use hazard. A load produces its value at the end of the memory stage. The very next instruction wants that value at the start of execute. The data is one cycle late even with forwarding, so the pipe inserts one stall. A compiler, or a careful human, puts an independent instruction in that slot.",
          "A branch decided in execute has already fetched two instructions that may be wrong, in a pipe where the branch condition is known that late. Those fetches are bubbles if the branch is taken and the prediction was not. A predicted-not-taken policy is simple and wrong about half the time on loop branches, which are usually taken. A one-bit or two-bit predictor at the branch address is the ordinary repair. The misprediction penalty is the number of stages between fetch and the decision.",
          "Deepening the pipe raises the ideal throughput and raises the misprediction penalty. That trade is the content of the lecture. A twenty-stage pipe that mispredicts often can lose to a shorter pipe. Count stalls before you celebrate the clock.",
        ],
        figure: {
          kind: "pipeline",
          caption: "Five stages. A load followed at once by a use needs a stall even if results are forwarded.",
          stages: ["Fetch", "Decode", "Execute", "Memory", "Writeback"],
        },
        example: {
          title: "A load and the add that needs it",
          steps: [
            "Instruction one loads a register from memory. Instruction two adds that register to another.",
            "Forwarding can supply an add's result to the next add. It cannot supply the load's result before the memory stage finishes.",
            "The schedule inserts one bubble between them. The add executes one cycle later than the ideal back-to-back pair.",
          ],
        },
        problems: [
          {
            prompt: "A program is 20 percent branches. The predictor is wrong 10 percent of the time. The penalty is 2 stall cycles. How many extra cycles per instruction is that?",
            answer: "Mispredict rate per instruction is 0.20 times 0.10 = 0.02. Times a penalty of 2 is 0.04 extra cycles per instruction. A base CPI of 1 becomes 1.04 from branches alone, before other stalls.",
          },
          {
            prompt: "Two independent adds in a row, with forwarding. How many stalls?",
            answer: "Zero. The first add's result can be forwarded from execute to the second add. A stall is for a dependence the forward cannot cover, not for every pair of instructions.",
          },
        ],
      },
      {
        id: "l3",
        title: "Caches",
        minutes: 45,
        paragraphs: [
          "A cache holds a small copy of memory close to the processor. A hit is served from that copy. A miss goes to the next level and pays. The three numbers that describe a cache are capacity, block size, and associativity. Capacity is how much data. Block size is how many neighboring bytes move together. Associativity is how many places a given block is allowed to sit. Direct-mapped means one place. Fully associative means any place.",
          "An address splits into offset, index, and tag. The offset picks the byte inside the block. The index picks the set. The tag checks that the block in that set is the one you asked for, not another block that happens to share the index. A hit is a tag match and a valid bit. Forget the valid bit and an empty line looks like address zero.",
          "Misses have causes. A compulsory miss is the first touch of a block. A capacity miss is a block that was evicted because the cache cannot hold the working set. A conflict miss is a block evicted because too many live blocks wanted the same set, even though the cache had room elsewhere. Raising associativity attacks conflicts and does not attack capacity. Bigger blocks attack compulsory misses when the program uses neighbors, and they can raise conflict misses when it does not.",
          "Writes are the awkward half. A write-through cache updates memory on every store and is simple. A write-back cache updates memory when the block is evicted and must remember a dirty bit. A write-allocate policy brings the block in on a write miss. A no-allocate policy writes around the cache. The policy is part of the machine, not a detail for later.",
        ],
        figure: {
          kind: "layers",
          caption: "Address 44, block size 16 bytes, 4 direct-mapped lines. The fields are this split.",
          rows: ["Tag 0", "Index 2, so line 2", "Offset 12, the byte in the block"],
        },
        example: {
          title: "Where address 44 sits",
          steps: [
            "Block size is 16 bytes, so the offset is 44 mod 16 = 12.",
            "The block number is floor of 44 / 16 = 2. Four lines, so the index is 2 mod 4 = 2.",
            "The tag is floor of 2 / 4 = 0. A hit on line 2 requires valid and tag 0.",
          ],
        },
        problems: [
          {
            prompt: "Same cache. Does address 44 and address 108 land in the same line?",
            answer: "108 divided by 16 is 6.75, so the block number is 6. Index is 6 mod 4 = 2. Yes, the same line. The tags differ: floor of 6 / 4 is 1, not 0. They conflict.",
          },
          {
            prompt: "A loop touches 8-byte records that are 64 bytes apart, on a cache with 16-byte blocks. Why do bigger blocks not help much?",
            answer: "Each block brings 16 bytes and the program uses 8 of them, then jumps 64 bytes. The extra bytes in the block are not the next record. You pay to move neighbors you do not read. This is not spatial locality.",
          },
        ],
      },
      {
        id: "l4",
        title: "Virtual memory and the TLB",
        minutes: 40,
        paragraphs: [
          "Virtual memory gives each program a private address space and lets that space be larger than physical memory. The hardware translates a virtual page number to a physical frame on every load and store. The page table, in memory, holds the map. If the translation itself required a memory read every time, you would have doubled the cost of every load. The translation lookaside buffer is a cache of page-table entries, and a TLB hit is what makes the scheme tolerable.",
          "A page fault is a miss in the page table's valid bits: the page is on disk, or it has never been used. The processor traps to the operating system. The operating system picks a frame, reads the page, updates the table, and restarts the instruction. The architectural fact is the trap and the restart. Which page to evict is a policy, and it belongs to the operating system lecture as much as to this one.",
          "Page size is a compromise you can compute. A larger page wastes space when a program uses only part of it, and it shortens the page table and raises the chance a TLB entry covers useful data. A 4-kilobyte page on a 32-bit address uses 12 offset bits and 20 bits of virtual page number. A flat table of that size is large, which is why real machines use multi-level tables. The TLB hides the levels when the working set of pages is small.",
          "Caches can be indexed before translation or after. A virtually indexed cache is fast and must be careful when two virtual addresses in different processes map to the same physical frame, or when the same virtual address means different frames. The bug is called a synonym or a homonym depending on which way the confusion runs. The lecture's demand is that you can say which address, virtual or physical, is in the tag.",
        ],
        figure: {
          kind: "flow",
          caption: "A load, when the TLB holds the translation. A miss in the TLB is not yet a page fault.",
          steps: ["Split the virtual address", "Look up the TLB", "On a hit, form the physical address", "Then consult the cache"],
        },
        example: {
          title: "Page size 4096, address 20480",
          steps: [
            "4096 times 5 is 20480, so the virtual page number is 5 and the offset is 0.",
            "Suppose the page table says page 5 lives in frame 9. The physical address is 9 times 4096, plus 0, which is 36864.",
            "A TLB that already maps 5 to 9 does not read the page table. A TLB miss does, and then fills the TLB. The page is still present. That is not a fault.",
          ],
        },
        problems: [
          {
            prompt: "Address 20481 with the same page size. What are the page number and offset?",
            answer: "Page 5, offset 1. Only the byte inside the page changed. The translation is the same frame.",
          },
          {
            prompt: "A TLB miss occurs and the page-table entry is valid. Is this a page fault?",
            answer: "No. A page fault is an invalid or not-present translation. A TLB miss with a valid entry is a refill. The program should not enter the fault handler.",
          },
        ],
      },
      {
        id: "l5",
        title: "Vectors, multiprocessors, and dataflow",
        minutes: 40,
        paragraphs: [
          "A vector or SIMD instruction applies one operation to several lanes of data. It attacks the instruction-count term: one fetch drives many adds. It helps when the lanes do the same thing. A branch that takes different directions in different lanes turns into a mask, and the unused lanes still occupy the hardware. Vector code that is 10 percent taken-branches can run at a small fraction of the peak you quoted from the brochure.",
          "A multiprocessor puts several von Neumann cores next to a memory. If they share that memory, coherence is the problem: two caches can hold the same line, and a write in one must not leave the other holding a stale word. A coherence protocol marks lines modified, shared, or invalid. The protocol is correctness. The performance question is how often two cores write the same line. False sharing is two cores writing different words that happen to sit in one line, so the protocol bounces the line anyway.",
          "A graphics processor pushes the same idea further: many simple lanes, a memory system that wants long sequential transfers, and a programming model that assumes you have thousands of independent elements. It is a bad machine for a chain of dependent scalar decisions. It is a good machine for a map over an array. Calling it a faster CPU is how people write slow programs on expensive hardware.",
          "Dataflow ties the lecture back to the first one. A dependence graph with wide parallel ranks runs well on SIMD and on many cores. A long chain of dependences runs at the speed of one lane, no matter how many you bought. Draw the graph of the loop before you pick the machine. The bottleneck you hide is the one the graph actually has.",
        ],
        figure: {
          kind: "pair",
          caption: "Same operation, two machines. The graph of the work decides which one is real.",
          leftTitle: "Wide and independent",
          rightTitle: "A long chain",
          left: ["Many lanes stay busy", "SIMD and GPUs fit", "The bottleneck was fetch"],
          right: ["One lane does the work", "Extra lanes wait", "The bottleneck is dependence"],
        },
        example: {
          title: "False sharing on a 64-byte line",
          steps: [
            "Core A writes a counter at byte 0. Core B writes a different counter at byte 32.",
            "Both bytes live in one cache line. Coherence treats the line as one unit.",
            "Each write invalidates the other core's copy. The line crosses the interconnect on every update even though the words are independent.",
          ],
        },
        problems: [
          {
            prompt: "You pad the two counters into separate 64-byte lines. What changes?",
            answer: "The writes hit different lines, so coherence traffic for those writes stops. The program did not become more parallel in its real data. You removed a false conflict.",
          },
          {
            prompt: "A loop body is x = f(x) with no other inputs, repeated n times. Why does a 32-lane SIMD unit not approach 32 times speedup?",
            answer: "Each iteration depends on the previous x. The lanes cannot compute step k+1 until step k finishes. The extra lanes have nothing independent to do. The chain is the bottleneck.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-611",
    lectures: [
      {
        id: "l1",
        title: "Processes and the kernel boundary",
        minutes: 40,
        paragraphs: [
          "A process is a program in execution: an address space, open files, and a saved set of registers. The kernel is the program that owns the machine and lends it out. A system call is the legal crossing. The user program puts a number in a register and traps. The hardware switches to kernel mode and a kernel stack. The kernel checks the arguments, does the work, and returns. A jump into the kernel's memory is not a system call. It is a bug the hardware should refuse.",
          "The address space is the protection boundary you can draw. Each process has its own page table. A load in process A cannot name a frame that belongs to process B unless the kernel mapped it on purpose, for a shared page. That mapping is a decision, not a leak. The history of kernels is a history of where this boundary sat: in a library, in a monolithic kernel, or in a small kernel with servers in user mode.",
          "A monolithic kernel runs file systems, drivers, and scheduling in one address space. A call from one subsystem to another is a function call, which is fast, and a fault in a driver can take the machine down. A microkernel keeps the mechanism, such as address spaces and interprocess messages, in the kernel, and puts services in processes. A call becomes a message. The case study is the trade, not a brand: fewer bugs that kill the machine, more crossings of the boundary.",
          "Resource allocation starts here. The kernel, not the process, decides who runs, which frames exist, and which file blocks are real. A process that appears to own the processor owns a time slice the scheduler can take back. The rest of the course is the policy behind that revocation: scheduling, memory, locks, and the disk.",
        ],
        figure: {
          kind: "layers",
          caption: "The trap is the only door. Below it, the kernel can see every process. Above it, a process cannot.",
          rows: ["User process", "Trap, with a call number", "Kernel, checking arguments", "The device or the disk"],
        },
        example: {
          title: "A read system call",
          steps: [
            "The process puts the file handle, the buffer pointer, and the length in the agreed registers and traps.",
            "The kernel checks that the handle is open and that the buffer is inside the process's address space.",
            "It copies bytes into that buffer, or arranges for them to arrive, and returns a count. The process does not touch the disk controller.",
          ],
        },
        problems: [
          {
            prompt: "A user program writes directly to the physical address of the disk's command register. What should happen on a machine with user and kernel mode?",
            answer: "The access should fault. That address is not mapped into the user page table. If it is mapped writable, the kernel's protection is already broken.",
          },
          {
            prompt: "Name one reason a microkernel message is slower than a monolithic function call, and one failure it contains.",
            answer: "The message crosses address spaces: a trap, a copy or a map, and a scheduling decision. A fault in the file-server process does not automatically overwrite the scheduler's memory. The cost is the crossing. The containment is the separate address space.",
          },
        ],
        narration:
          "A process is a program that is running. It has an address space, open files, and registers the kernel can save. The kernel owns the machine. A system call is how the process asks for something it is not allowed to do itself. It puts a number in a register and traps. The hardware enters kernel mode. The kernel checks the arguments and does the work. A jump into kernel memory is not a request. It is something the hardware should refuse. Each process has its own page table, so one program cannot name another's memory unless the kernel maps a shared page on purpose. Kernels differ in where they put the boundary. A monolithic kernel runs drivers and file systems in one space. Calls are fast, and a bad driver can stop the machine. A microkernel keeps the core mechanism and puts services in processes. Calls become messages. They cost more, and a fault stays in one service. Either way, the process does not own the processor. It owns a slice the scheduler can take back. The read example in the notes is the pattern for every call: check, do, return a count. Do both problems before the scheduling lecture.",
      },
      {
        id: "l2",
        title: "Threads and scheduling",
        minutes: 45,
        paragraphs: [
          "A thread is a register state and a stack that shares an address space with other threads. Two threads in one process can corrupt each other's data without a trap, because the hardware does not see the sharing as a crossing. The kernel may or may not know about the threads. A kernel thread is scheduled by the kernel. A user thread that the kernel cannot see blocks the whole process when one of them waits for disk. That distinction is the practical content of 'lightweight'.",
          "First-come first-served runs each job to completion. It is simple and it is cruel to a short job stuck behind a long one. Round robin gives each ready thread a quantum and moves it to the tail. A short quantum feels responsive and spends more of the machine on context switches. A long quantum turns into first-come. The switch saves registers and changes the page table. That cost is real time, not a diagram.",
          "Turnaround is finish time minus arrival. Response is the time until the job first runs. They are different objectives. Round robin often improves response and can worsen turnaround, because every job stretches by waiting its turn. A scheduler that optimizes the number you did not care about is not a bug in the implementation. It is the wrong policy.",
          "Priority and multi-level feedback are the same idea with memory. A job that uses its whole quantum is suspected of being long and is demoted. A job that blocks for input is suspected of being interactive and is kept high. The suspicion can be wrong, and a priority policy without a bound on starvation can leave a low queue waiting forever. Aging, or a periodic boost, is the repair you should be able to name.",
        ],
        figure: {
          kind: "pair",
          caption: "Two jobs, four units each, arriving together. The quantum is one.",
          leftTitle: "First come",
          rightTitle: "Round robin",
          left: ["A finishes at 4", "B finishes at 8", "Average turnaround 6"],
          right: ["A finishes at 7", "B finishes at 8", "Average turnaround 7.5"],
        },
        example: {
          title: "Why round robin stretched the average",
          steps: [
            "First-come runs A for four units, then B for four. Finish times 4 and 8. Average 6.",
            "Round robin alternates A, B, A, B, A, B, A, B. A's fourth unit is the seventh slot. B's fourth unit is the eighth.",
            "Finish times 7 and 8. Average 7.5. Both jobs ran early. Both finished later than the better of the two first-come finishes, and the average got worse.",
          ],
        },
        problems: [
          {
            prompt: "Job A is 100 units, job B is 1 unit, B arrives just after A starts, quantum is 100. What are the finish times if A started at time 0?",
            answer: "The quantum is long enough that A runs to completion. A finishes at 100. B finishes at 101. This round robin behaved as first-come. The quantum, not the name of the policy, did that.",
          },
          {
            prompt: "A user-level thread blocks in a page fault and the kernel only scheduled the process. What happens to the other user threads?",
            answer: "They stop. The kernel descheduled the only entity it knows about. A kernel-visible thread would let the others run. That is the operational difference.",
          },
        ],
      },
      {
        id: "l3",
        title: "Locks, condition variables, and deadlock",
        minutes: 45,
        paragraphs: [
          "Shared mutable state needs a lock if two threads can touch it. A lock's contract is mutual exclusion: one holder. The implementation on a single processor can disable interrupts for a few instructions. On several processors you need an atomic instruction, such as compare-and-swap or a test-and-set, so two cores cannot both observe a free lock and both take it. A lock that is wrong under two cores and right under one is not a lock. It is a coincidence.",
          "A condition variable lets a thread wait for a state without spinning. The pattern is: hold the lock, while the condition is false wait on the variable (which releases the lock and reacquires it), then act, then signal. The while, not an if, is required. A signal is a hint. The condition may be false again by the time you run, because another thread woke first. An if-wait loses that race.",
          "Deadlock is a cycle of threads each holding a resource the next one wants. Four conditions are usually named: mutual exclusion, hold and wait, no preemption, and circular wait. Break any one and this particular deadlock cannot form. The ordinary engineering break is an order: every thread acquires the locks in the same global order, so a cycle cannot close. The order has to be written down. Two correct locks in opposite orders are a deadlock.",
          "A case you should be able to draw: thread 1 holds lock A and wants B, thread 2 holds B and wants A. Neither can proceed. Detection builds a waits-for graph and looks for a cycle. Prevention refuses the allocation that would create one, or uses the lock order so the cycle is unreachable. Killing a thread is a recovery, and it is a poor API.",
        ],
        figure: {
          kind: "flow",
          caption: "The wait pattern. The while is the part people delete, and then the bug is rare.",
          steps: ["Acquire the lock", "While the state is wrong, wait", "Use the state", "Unlock, and signal if you changed it"],
        },
        example: {
          title: "Two locks, two threads",
          steps: [
            "Thread 1 locks A, then tries B. Thread 2 locks B, then tries A.",
            "Each holds what the other wants. The cycle is A to thread 1 to B to thread 2 to A.",
            "If both threads lock A before B, the second thread waits at A and the first can finish and release B. No cycle.",
          ],
        },
        problems: [
          {
            prompt: "A thread checks a queue, sees it empty, then waits. Another thread enqueues and signals between the check and the wait. What is wrong, and what is the repair?",
            answer: "The signal is lost if it happens before the wait is registered, and the waiting thread sleeps forever. The check and the decision to wait must hold the same lock the signaler holds. Use the while-wait pattern under that lock.",
          },
          {
            prompt: "Three threads lock pairs among locks A, B, and C, each in increasing letter order. Can they deadlock on these locks?",
            answer: "No. A global order means any waiter holds a higher lock and wants a lower one only if someone broke the order. With everyone taking lower letters first, the waits-for edges point the same way and cannot cycle.",
          },
        ],
      },
      {
        id: "l4",
        title: "Page faults and frames",
        minutes: 40,
        paragraphs: [
          "The architecture lecture gave you the trap. This lecture is the policy after the trap. The kernel picks a frame, writes the old page out if it is dirty, reads the new page, updates the page table, and returns to the instruction. The instruction restarts. It does not resume in the middle of a partially completed store. That restart rule is why the hardware and the kernel have to agree on precise faults.",
          "Replacement is which frame to take. Least recently used is a good policy and an awkward one to implement exactly, because touching a page on every load is expensive. A clock approximates it: a hand sweeps frames, a reference bit is set by hardware when the page is used, and the hand clears the bit and skips a page that was used. A page the hand finds with a clear bit is the victim. It is not least recently used. It is cheap and usually close.",
          "Thrashing is the failure mode. The working set of pages that are in active use is larger than the frames you have, so every reference faults, and the disk does nothing but replace pages that will be needed immediately. Adding a process can reduce the useful work, because every process gets fewer frames. The repair is to run fewer processes, or to give the busy one more frames, not to schedule harder.",
          "Allocation across processes is the same shortage. A global replacement pool lets one greedy process steal frames from a careful one. A local pool gives each process a budget and lets it thrash alone. Working-set policies try to measure the set and refuse to run a process whose set does not fit. You should be able to say which pool a fault charges.",
        ],
        figure: {
          kind: "flow",
          caption: "A fault on a present instruction. The instruction runs again after the map is fixed.",
          steps: ["Trap on the missing page", "Choose a frame", "Write back if dirty, then read", "Update the table and restart"],
        },
        example: {
          title: "Clock on four frames",
          steps: [
            "Reference bits are 1, 1, 0, 1, and the hand is on the first frame.",
            "The hand clears the first bit, clears the second, and finds the third already 0. Frame 3 is the victim.",
            "A true least-recently-used choice might differ. The clock did one pass and no per-load timestamp.",
          ],
        },
        problems: [
          {
            prompt: "A page is clean and chosen as victim. Do you write it to disk?",
            answer: "No. A clean page matches disk already. You may reuse the frame. A dirty page must be written first or the changes disappear.",
          },
          {
            prompt: "CPU utilization falls as you add the fifth process, and the disk is busy with page traffic. What is the name, and what do you do?",
            answer: "Thrashing. Reduce the number of runnable processes or increase frames for the working set. Raising the scheduler's quantum does not create memory.",
          },
        ],
      },
      {
        id: "l5",
        title: "Files, crashes, and a case study",
        minutes: 45,
        paragraphs: [
          "A file is a named sequence of bytes with an owner and a length. The inode, or its equivalent, holds the metadata and the map from logical block to physical block. Directory entries are names pointing at inodes. Two names for one inode are a link, and the inode's link count is what keeps the bytes alive. Deleting a name is not deleting the bytes if another name, or an open file, remains.",
          "A crash in the middle of a rename or a file extension can leave the map and the bitmap disagreeing: a block marked free and also reachable, or a block marked used and reachable from nowhere. File-system check walks every inode and rebuilds the bitmap. It can run for a long time, and it can only keep the structures consistent. It cannot know which of two versions of a user-level record you wanted.",
          "A journal is a specialized repair. The system writes a note describing the metadata change, then does the change, then marks the note done. After a crash, the kernel replays finished notes and drops unfinished ones. Ordered and data-journaling modes differ on whether the file's bytes are in the note or only the map is. The promise is about the metadata unless you paid for the bytes.",
          "Put the case studies side by side. A monolithic kernel's file system is a set of functions that share the disk driver and can lock the same buffers. A microkernel's file system is a process that receives read and write messages and answers them. The on-disk inode can be identical. The crash story is about the disk, and it does not care which address space built the journal record. The concurrency story does care: the locks are either inside one kernel or they are messages that cannot race inside one address space in the same way.",
        ],
        figure: {
          kind: "layers",
          caption: "Names and bytes are different objects. The link count is what joins them.",
          rows: ["Directory entry, a name", "Inode, metadata and block map", "Data blocks", "Bitmap of free blocks"],
        },
        example: {
          title: "Create a file, then crash",
          steps: [
            "The kernel allocates an inode and a data block, then writes the directory entry.",
            "A crash after the allocation and before the directory entry leaks the inode and the block: used, and unnamed.",
            "A checker, or a journal replay that never committed the allocate, returns them to the free set. The user's file is gone either way if the name never landed. Consistency is not durability of the name.",
          ],
        },
        problems: [
          {
            prompt: "An inode has link count 2. You unlink one name. Is the data freed?",
            answer: "No. The count drops to 1. The bytes stay reachable through the other name. They are freed when the count hits 0 and no process has the file open.",
          },
          {
            prompt: "The journal says a metadata update committed, and the crash happened before the data blocks were written, in a mode that journals metadata only. What can a reader observe?",
            answer: "The file length or the block map can claim bytes that were never written, so the reader can see old disk contents in a file that looks new. Metadata-only journaling did what it promised. It did not promise the data.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-612",
    lectures: [
      {
        id: "l1",
        title: "Delay, bandwidth, and layers",
        minutes: 40,
        paragraphs: [
          "A network moves packets, not files. A packet has a header the switches understand and a payload they usually do not. The time to get one packet from one machine to the next is four pieces added together: processing in the node, queueing behind other packets, transmission as the bits go onto the link, and propagation as the signal crosses the distance. People mix up transmission and propagation. Transmission depends on packet size and link rate. Propagation depends on distance and the speed of the signal, which is not the link rate.",
          "Bandwidth is how many bits per second the link can accept. Delay is how long one bit, or one packet, takes. A long fat link can have huge bandwidth and still take milliseconds for the first bit to arrive. A protocol that waits for an acknowledgement before sending the next small packet will not fill that link. The later lecture on windows is the repair. This lecture is the measurement that shows the repair is needed.",
          "Layers are a design rule. The link layer moves a frame across one hop and worries about that hop's errors. The network layer names hosts and forwards packets across hops. The transport layer recovers an end-to-end byte stream or a message, on top of a network that drops things. The application speaks to the transport. A layer that reaches into another layer's header for a shortcut will break when that header changes. The rule is not purity. It is a place to put each failure.",
          "Protocol analysis starts with a failure, not a feature list. Ask which layer is allowed to drop, reorder, or duplicate, and which layer must hide that. If the network may duplicate packets, the transport must tolerate a replay or you will apply a write twice. Write that sentence into the design before you write code.",
        ],
        figure: {
          kind: "layers",
          caption: "Each layer adds a header and a promise. The promise is the only part the layer above may rely on.",
          rows: ["Application: a request", "Transport: an end-to-end stream", "Network: a hop-by-hop packet", "Link: one hop's frame"],
        },
        example: {
          title: "One packet, one link",
          steps: [
            "The packet is 1000 bytes, which is 8000 bits. The link is 10 million bits per second. Transmission is 8000 / 10 million = 0.8 milliseconds.",
            "The link is 200 kilometers of fiber. The signal is about 200,000 kilometers per second. Propagation is 200 / 200,000 seconds = 1 millisecond.",
            "Ignore queueing and processing and the packet's last bit arrives about 1.8 milliseconds after transmission starts. A smaller packet does not shrink the 1 millisecond.",
          ],
        },
        problems: [
          {
            prompt: "The same fiber, and a 100-byte packet. What are transmission and propagation?",
            answer: "100 bytes is 800 bits. Transmission is 800 / 10 million = 0.08 milliseconds. Propagation stays 1 millisecond. The packet is now almost pure propagation delay.",
          },
          {
            prompt: "A link-layer protocol promises no losses on one hop. The path has three hops. May the transport assume the packet arrives?",
            answer: "No. Each hop can deliver to the next and the next router can still drop the packet for lack of queue space. End-to-end arrival is a transport problem unless every hop, and every queue, made a promise you actually have.",
          },
        ],
        narration:
          "A network moves packets. The time for one packet to cross one link is four pieces: processing, queueing, transmission, and propagation. Transmission is the time to clock the bits onto the wire. It depends on the size of the packet and the rate of the link. Propagation is the time for the signal to cross the distance. It does not care how fast the link is in bits per second. A thousand-byte packet on a ten-megabit link takes eight tenths of a millisecond to transmit. Two hundred kilometers of fiber takes about one millisecond to cross. The packet is late by both. Making the packet smaller only shrinks the first number. Layers are where you put each kind of failure. The link worries about one hop. The network forwards across hops and may drop a packet. The transport hides that from the application, or it does not, and then the application must. A promise on one hop is not a promise on a path of three hops. Read the numeric example. Then compute the hundred-byte variant. The window lecture later exists because waiting for an acknowledgement on a long fat link wastes the bandwidth you just measured.",
      },
      {
        id: "l2",
        title: "Forwarding",
        minutes: 40,
        paragraphs: [
          "A link delivers a frame to the other end of one wire or one wireless hop. A switch learns which port a link-layer address lives on by watching source addresses, and it forwards a frame out that port. If it has not learned the address, it floods. Flooding is correct and expensive. A switch does not understand network-layer addresses. Two switches can also loop if someone plugs a cycle, and then a flooded frame can circulate forever. Spanning-tree style blocking of ports is how Ethernet-style networks refuse the cycle. You should be able to say why a loop is fatal for a flood.",
          "The network layer gives hosts addresses that do not change when the packet crosses a link. A router looks at the destination address and picks a next hop from a forwarding table. The longest matching prefix wins, so a specific route can override a general one. Forwarding is local and fast. Routing, the next lecture, is how the table gets built.",
          "A packet's time to live, or hop limit, is decremented at each router. At zero the packet is dropped. That is the repair for a routing loop, which would otherwise circulate until the links melted. A traceroute is a deliberate use of that death: send packets with increasing limits and collect the ICMP-style notices from the routers that dropped them. The path you see is the path those packets took, not a promise about the next packet.",
          "Programming this layer means reading and writing headers without assuming the payload is text. Checksums cover the header so a corrupted address is not forwarded into someone else's machine. A checksum that excludes the field you are about to change, such as the hop limit, has to be recomputed or adjusted. Forget that and honest packets look corrupt two hops later.",
        ],
        figure: {
          kind: "flow",
          caption: "Longest prefix, not first match. A more specific route beats a shorter one.",
          steps: ["Read the destination", "Find every matching prefix", "Keep the longest", "Send to that next hop"],
        },
        example: {
          title: "Two routes",
          steps: [
            "The table says 10.0.0.0/8 goes to port A, and 10.1.0.0/16 goes to port B.",
            "Destination 10.1.2.3 matches both. The 16-bit prefix is longer, so the packet goes to port B.",
            "Destination 10.2.2.3 matches only the 8-bit prefix and goes to port A.",
          ],
        },
        problems: [
          {
            prompt: "A switch has never seen the destination link address. What does it do, and why is a cycle of switches dangerous?",
            answer: "It floods the frame out every other port. In a cycle the flooded copy returns and is flooded again. Without a lifetime or a blocked port, the frame multiplies. That is why the topology that floods must be a tree, or the frame must die.",
          },
          {
            prompt: "A router decrements the hop limit and forwards. The header checksum still covers the old hop limit. What does the next router do?",
            answer: "It treats the header as corrupt and drops the packet. The sender of a changed header field must fix the checksum. The drop is correct behavior, not a flaky link.",
          },
        ],
      },
      {
        id: "l3",
        title: "Routing",
        minutes: 40,
        paragraphs: [
          "Routing builds the forwarding table. Distance-vector routing has each router advertise the cost to each destination to its neighbors. A router sets its cost to the minimum, over neighbors, of that neighbor's cost plus the link cost. The information is only a distance, not a path, so a router cannot see a loop in the advertisement. When a link dies, a router can count to infinity: it believes a neighbor's route that actually runs back through itself. A split horizon, or a hold-down, is a patch. The failure mode is the lesson.",
          "Link-state routing floods the map of links, not the distances. Every router computes shortest paths on the same map, usually by Dijkstra. A loop in the forwarding tables is less natural, because everyone has the topology, and it is still possible while the flood is incomplete. The cost is the flood and the computation. The gain is that a dead link is a fact in the map, not a rumor about a distance.",
          "Work a four-router example by hand for both algorithms or you will confuse the advertisements. Distance vector sends a vector. Link state sends each router's own links. The forwarding table at the end can match. The messages on the wire do not.",
          "Policy is why the public Internet is not one Dijkstra. A network may refuse to carry a neighbor's route, or prefer a longer route that stays inside a contract. Policy is not a shortest path. If your design assumes every router minimizes delay, a real internetwork will violate the assumption on purpose.",
        ],
        figure: {
          kind: "pair",
          caption: "Same goal, a next hop. The message each algorithm is willing to send is different.",
          leftTitle: "Distance vector",
          rightTitle: "Link state",
          left: ["Advertise a distance", "No map of the path", "Count-to-infinity risk"],
          right: ["Flood each link", "Everyone runs Dijkstra", "Cost is the flood"],
        },
        example: {
          title: "Three routers in a line",
          steps: [
            "Routers A-B-C. Each link costs 1. A advertises destination A at cost 0.",
            "B sets A at cost 1 and tells C. C sets A at cost 2. Forwarding: C sends to B, B sends to A.",
            "If the A-B link dies and B still hears C advertise A at cost 2, B may set A at cost 3 via C, and C will then set cost 4 via B. That is counting up, and the route is a loop.",
          ],
        },
        problems: [
          {
            prompt: "In that failure, what does split horizon stop B from doing?",
            answer: "C learned A from B, so split horizon says C should not advertise A back to B. B then does not hear a fake route to A through C. The count does not start. Split horizon does not solve every topology. It solves this echo.",
          },
          {
            prompt: "Link state has already flooded the dead A-B link to B and C. What next hop does C choose for A?",
            answer: "None. The map no longer contains a path. C withdraws the route. It does not keep a stale distance, because the input was the link, not a rumor.",
          },
        ],
      },
      {
        id: "l4",
        title: "Reliable transport",
        minutes: 45,
        paragraphs: [
          "The network drops, reorders, and duplicates. A reliable transport delivers each byte once, in order, to the application. Sequence numbers are how a receiver notices a duplicate and how it knows there is a hole. An acknowledgement says which bytes have arrived. A retransmission timer fires when an acknowledgement does not. Set the timer below the round trip and you will retransmit data that was merely slow. Set it far above and a loss sits there. Measuring the round trip, and adding a margin for variation, is the design.",
          "Stop-and-wait sends one packet and waits. On a link with a 100-millisecond round trip and a 1-millisecond transmission, the sender is idle 99 percent of the time. A sliding window lets the sender have many unacknowledged packets in flight, up to the window. The amount of data in flight should be about the bandwidth times the round trip if you want a full link. That product is the number you compute before you pick a window size.",
          "Cumulative acknowledgements are simple and stall when one packet in the middle is lost: the sender may retransmit everything after the hole, or, with a better design, only the hole. Selective acknowledgements name the holes. The programming exercise is a state machine, not a loop. States are the next sequence to send, the next sequence expected, and the buffer of out-of-order data. A packet that arrives twice must not be delivered twice.",
          "Flow control is a different window, advertised by the receiver because its buffer is finite. Congestion control, next lecture, shrinks the window because the path is finite. Mixing them up means you will open the window into a full receiver or into a full router and call it the other bug.",
        ],
        figure: {
          kind: "pipeline",
          caption: "A window of four. The sender may fill these sequence numbers before the first acknowledgement returns.",
          stages: ["Seq 1", "Seq 2", "Seq 3", "Seq 4"],
        },
        example: {
          title: "How much data should be in flight",
          steps: [
            "The path is 10 million bits per second. The round trip is 100 milliseconds, which is 0.1 seconds.",
            "Bandwidth times delay is 10 million times 0.1 = 1 million bits, or 125 kilobytes.",
            "Stop-and-wait with a 1000-byte packet keeps 8000 bits in flight, far under a million. The window needs on the order of 125 such packets to fill the path.",
          ],
        },
        problems: [
          {
            prompt: "A duplicate of sequence 5 arrives after 5 was already delivered. What does the receiver do?",
            answer: "It discards the payload and does not deliver it again. It may repeat the acknowledgement so the sender can move on. Delivering twice is a broken reliability layer.",
          },
          {
            prompt: "Round trip doubles and the window in bytes stays fixed. What happens to throughput?",
            answer: "The path can now hold twice as much data, and the sender still fills only the old amount. Throughput falls to about half, because the sender goes idle waiting for acknowledgements. The window has to track the bandwidth-delay product.",
          },
        ],
      },
      {
        id: "l5",
        title: "Congestion, and what the application may assume",
        minutes: 40,
        paragraphs: [
          "Congestion is routers whose queues overflow. The honest signals are loss and delay. A sender that treats every loss as a reason to try harder will fill the queue again. Additive increase and multiplicative decrease is the classic response: grow the window slowly while nothing is lost, and cut it sharply on a loss. The cut is what saves the path. The slow growth is what searches for the new rate. A sender that only increases is a bug.",
          "Fairness is not automatic. Two senders on one link, both using the same increase and decrease, tend toward equal rates because the one with the larger window loses more often and cuts more. A sender that does not cut can take the link from the ones that do. That is why a congestion algorithm is a social rule as much as a throughput rule. Your transport either participates or it is the load everyone else backs off from.",
          "The application may assume what the transport promised and no more. A reliable ordered byte stream does not mean a message boundary. A write of 100 bytes and a write of 100 bytes can arrive as one read of 200, or as several smaller reads. If you needed records, you must frame them. A datagram transport may drop and reorder, and the application that wanted a file has to do lecture four itself or pick a different transport.",
          "Distributed processing sits on these promises. A remote call that retries after a timeout can run twice if the first attempt was slow rather than lost. Make the operation safe to repeat, or give it an identifier the server remembers. The network will not do that for you. The application protocol is part of the course, and the retry rule is the part that corrupts data when it is wrong.",
        ],
        figure: {
          kind: "flow",
          caption: "One loss. The window is cut, then it creeps back. Skipping the cut is how you stay congested.",
          steps: ["Window grows by a little", "A loss or a mark", "Window is cut", "Growth starts again"],
        },
        example: {
          title: "Two senders, one link",
          steps: [
            "The link holds about 20 packets. Sender A has a window of 16, sender B a window of 4.",
            "A loss hits. Both cut in half: A to 8, B to 2.",
            "They increase one packet at a time. A is still larger, and it will be the one to cause the next loss more often, so the cuts pull them toward each other. This is a story, not a proof, and it fails if A refuses to cut.",
          ],
        },
        problems: [
          {
            prompt: "Your application writes two 50-byte messages on a byte stream and the peer reads 100 bytes. Is the transport broken?",
            answer: "No. A byte stream does not preserve write boundaries. The reader must know the framing, for example a length prefix, to recover the two messages.",
          },
          {
            prompt: "A remote debit times out and the client sends it again. The server applied it once and the response was lost. What balance do you get if the debit is not idempotent?",
            answer: "The account is charged twice. The repair is a unique request id stored at the server so the retry returns the first result and does not apply the debit again.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-608",
    lectures: [
      {
        id: "l1",
        title: "Relations and a query",
        minutes: 45,
        paragraphs: [
          "A relation is a set of tuples over a fixed set of attributes. Sets do not have duplicate rows and do not have an order. SQL bags and SQL's unordered results are the practical version, and the difference matters when you count. A key is a set of attributes that identifies a tuple. A foreign key is an attribute whose values are required to be keys in another relation. The requirement is a constraint, checked by the system, not a comment in a diagram.",
          "Relational algebra is the theory under the query language. Selection keeps rows. Projection keeps columns. Join matches rows on a predicate, usually equality of a key and a foreign key. You can write the same question as a join or as a nested lookup. The algebra lets you rewrite one into the other and know the answer does not change. Query optimization is those rewrites plus a cost.",
          "Use a schema small enough to compute by hand. Clerks have an id and a name. Jobs have an id, a clerk id, and a title. Pay has a job id and an hourly rate. The question 'what does this clerk earn on each job' is a join of all three, then a projection. If a clerk has no job, an inner join drops them. An outer join keeps them with an empty job. Pick the one the question asked for.",
          "Normalization is what you do when a fact is stored twice and the two copies can disagree. If the rate lives on both the job and a separate pay table, an update can change one. Third normal form is the usual target: every non-key fact depends on the key, the whole key, and nothing but the key. A table that violates it is not illegal. It is a bug you have scheduled.",
        ],
        figure: {
          kind: "layers",
          caption: "Three relations. The arrows are foreign keys, not a drawing of the disks.",
          rows: ["Pay.job_id points at jobs", "Jobs.clerk_id points at clerks", "Clerks.id is the key"],
        },
        example: {
          title: "One join, computed by hand",
          steps: [
            "Clerks: (1, Ana), (2, Bo). Jobs: (10, 1, 'doors'), (11, 1, 'roof'). Pay: (10, 20), (11, 25).",
            "Join jobs to pay on job id, then to clerks on clerk id. Two result rows, both for Ana.",
            "Bo disappears in an inner join. He has no job. If the question was 'list every clerk', this query is the wrong query.",
          ],
        },
        problems: [
          {
            prompt: "Add a second pay row for job 10 with rate 30, and no unique constraint. What does the join return for that job?",
            answer: "Two rows for job 10, rates 20 and 30, both joined to Ana and doors. The bag of answers doubled because the fact was stored twice and the schema allowed it. A primary key on pay.job_id would have refused the second row.",
          },
          {
            prompt: "Why is 'the result came back sorted by name' not a property you may code against?",
            answer: "A relation has no order. The engine sorted because it was convenient, often because of an index, and it can stop. If you need an order, the query must say so.",
          },
        ],
        narration:
          "A database in this course is not a place to put files. A relation is a set of tuples with a fixed shape. A key identifies a tuple. A foreign key is a promise that a value is a key somewhere else. The promise is enforced, or it is not a key. Queries are selection, projection, and join. Selection keeps rows, projection keeps columns, and a join matches rows. Consider three tables. Clerks have names. Jobs point at a clerk. Pay points at a job and stores an hourly rate. Asking what Ana earns is a join of all three. Bo, who has no job, will vanish from an inner join. If you needed every clerk, you asked the wrong question, and the engine was right to drop him. If the same fact is stored in two places, the copies can disagree. Normal form is the discipline that stops that. A result that happens to arrive sorted is not ordered. Relations have no order. Say the order in the query if you need it. Work the join by hand, including the case with two pay rows for one job. That case is what a missing key looks like.",
      },
      {
        id: "l2",
        title: "Pages and buffers",
        minutes: 40,
        paragraphs: [
          "The disk and the memory do not trade rows. They trade pages, fixed-size blocks, often a few kilobytes. A heap file is a pile of pages of tuples. A slotted page puts a header at the front or a slot directory at the end, and the slots point at tuples inside the page. Variable-length tuples move around inside the page. The slot stays put, so an outside identifier, page id plus slot number, does not dangle when you compact the free space.",
          "A buffer pool is a cache of pages, and it is the same idea as the architecture lecture with a different eviction cost. A hit avoids a disk read. A miss evicts some page. If the page is dirty, it must be written first. Pinning a page means a thread is using it and the eviction code must skip it. Forgetting a pin leaks a page that can be reused under your feet. Forgetting an unpin sticks the page in memory forever.",
          "Replacement can be least recently used, or clock, as in an operating system. A database has a nasty sequential scan: it touches every page once, and a pure least-recently-used policy will evict the page you will need again in the inner loop of a join, in favor of a page you will never need. A policy that knows the scan is sequential can avoid caching those pages. The buffer manager is part of the query engine, not a generic cache you bolt on.",
          "Physical layout decides the cost model. A table scan reads every page. An index, next lecture, reads a few. Until the index exists, every query plan you write is a scan plus a filter, and the cost is the number of pages, not the number of rows that pass the filter. A selective predicate on an unindexed column still reads the file.",
        ],
        figure: {
          kind: "layers",
          caption: "A slotted page. Outside the page, the address is a page id and a slot, not a byte offset.",
          rows: ["Slot directory", "Free space", "Tuple bytes", "Page header"],
        },
        example: {
          title: "A pin leak",
          steps: [
            "A scan pins page 1, reads it, and returns without unpinning.",
            "The pool is full of pinned pages. The next miss has no victim.",
            "The statement waits or fails. The data are fine. The bug is the missing unpin on the error path as well as the success path.",
          ],
        },
        problems: [
          {
            prompt: "A tuple grows and moves inside the page. Why does page id plus slot still find it?",
            answer: "The slot directory is updated to the tuple's new offset. Callers hold the slot number, not the offset. A caller that cached the byte offset is now wrong, and that is why the interface does not hand out byte offsets.",
          },
          {
            prompt: "A join's inner side is a one-page table reused for every outer row. The buffer uses least recently used, and a big scan shares the pool. What goes wrong?",
            answer: "The scan's pages look newer than the one-page table, so the inner page is evicted and read back on every outer row. The pool should pin that inner page for the life of the join, or refuse to cache the scan.",
          },
        ],
      },
      {
        id: "l3",
        title: "B+ trees",
        minutes: 45,
        paragraphs: [
          "A B+ tree is a balanced search tree whose leaves hold the keys in order, usually with the row identifiers next to them. Internal nodes hold separator keys and child pointers. Every leaf is at the same depth, so a lookup is a short root-to-leaf walk, logarithmic in the number of keys for a large branching factor. The branching factor is what makes the tree short. A binary tree of a million keys is about twenty deep and pointer-chases through memory. A B+ tree of a few hundred keys per node is three or four deep and matches a page to a node.",
          "Insert walks to the leaf. If the leaf has room, the key goes in order. If not, the leaf splits, the smallest key of the right sibling is copied up as a separator, and the parent gains a child. A parent that is full splits the same way. The root split is the only split that makes the tree taller. That is why the tree stays balanced without a rotation lecture.",
          "Delete is the reverse and is easier to get wrong. A leaf that falls under a minimum occupancy merges with a sibling or borrows a key. Forgetting the parent separator leaves a key in the index that is not in the leaves, and the next range scan lies. Range scans are the reason for the leaf chain: once you are at the first key, you follow sibling pointers rather than walking the tree again.",
          "A clustered index stores the rows in leaf order. A range becomes a sequential read. A secondary index stores identifiers, and each match may be a random page. The optimizer's choice between a scan and an index is this cost, not a belief that indexes are faster. An index on a column you never select is a write cost on every insert, because the tree must be updated inside the same transaction as the row.",
        ],
        figure: {
          kind: "flow",
          caption: "A leaf split. The separator is copied up. The keys themselves stay in the leaves.",
          steps: ["Leaf is full", "Split into two leaves", "Copy the middle key up", "Parent points at both"],
        },
        example: {
          title: "Leaves that hold two keys",
          steps: [
            "Insert 10, then 20. They share a leaf: 10, 20.",
            "Insert 30. The leaf splits. Left leaf holds 10. Right leaf holds 20, 30. The parent stores separator 20 and points at both.",
            "A search for 30 starts at the parent, sees 30 is not less than 20, and walks to the right leaf.",
          ],
        },
        problems: [
          {
            prompt: "After that split, which keys live in the parent, and which live only in leaves?",
            answer: "The parent holds the separator 20 and two child pointers. The keys 10, 20, and 30 all live in leaves. 20 is copied up, not moved. A B+ tree search always ends at a leaf.",
          },
          {
            prompt: "You range-scan from 10 to 30 and the right leaf was not linked to the left. What do you miss, and where should the link be?",
            answer: "You can find 10 by a tree walk and then have no way to the leaf that holds 20 and 30 without another search. Leaves must point at their right sibling. The parent is not a substitute for that chain.",
          },
        ],
      },
      {
        id: "l4",
        title: "Joins and their cost",
        minutes: 45,
        paragraphs: [
          "A nested-loop join reads each outer row and finds matches in the inner table. With no index that is a scan of the inner table per outer row. One thousand outer rows and five thousand inner rows is five million comparisons, and more importantly it is one thousand scans of the inner file. An index on the inner join key turns each outer row into a few page reads. The plan changed because the access path changed, not because the join condition changed.",
          "A hash join builds a table on the smaller input and probes it with the larger. The cost is about one pass over each input, plus memory. If the hash table does not fit in memory, the join partitions both inputs and recurses. A graceful partition is a bit more than one pass. A hash table that thrashes the buffer pool is a nested loop in disguise. Know which one you wrote.",
          "A sort-merge join sorts both inputs on the join key and walks them like a merge. It is attractive when the inputs are already ordered by an index, because then the sort is free. It also produces ordered output, which a later order-by or a merge join above it can use. The optimizer's job is to add these costs, including the output order as a credit, and pick the cheapest tree of operators.",
          "Estimates come from statistics: how many rows, how many distinct keys, how the values spread. A stale statistic produces a confident wrong plan. A thousand-row estimate that is actually a million rows will pick a nested loop and then run for an hour. The lecture's demand is that you can compute the cost of two plans on the same numbers and see which assumption did the work.",
        ],
        figure: {
          kind: "pair",
          caption: "Same join, two plans. The winner depends on memory and on whether an index exists.",
          leftTitle: "Nested loop",
          rightTitle: "Hash join",
          left: ["Outer row, then inner", "Fine with an index", "Scans multiply without one"],
          right: ["Build, then probe", "About one pass each", "Spills if memory is short"],
        },
        example: {
          title: "One thousand outer rows, five thousand inner rows, no index",
          steps: [
            "Nested loop compares about 1000 times 5000 = 5 million pairs, and it rereads the inner file.",
            "Hash join builds on the smaller side, 1000 keys, and probes 5000 times. Comparisons are on the order of 6000 hash operations if nothing spills.",
            "If the 1000-key table does not fit in the buffer pool, the hash join's cost jumps toward a partitioned join or a thrashing loop. The formula changed because memory changed.",
          ],
        },
        problems: [
          {
            prompt: "The inner table has an index on the join key, and each lookup is 3 page reads. Outer table is 1000 rows. Roughly how many index page reads?",
            answer: "About 3000, plus the pages of the outer scan. Far under a repeated full scan of a large inner file. This is why the index exists.",
          },
          {
            prompt: "Both inputs are already sorted on the join key. Which algorithm gets a free pass, and why?",
            answer: "Sort-merge. The sort steps cost nothing because the order is already there. You still pay the merge walk. A hash join would ignore the order and rebuild a table.",
          },
        ],
      },
      {
        id: "l5",
        title: "Transactions, recovery, and two machines",
        minutes: 45,
        paragraphs: [
          "A transaction is a sequence of reads and writes that should appear indivisible. The properties people recite are atomicity, consistency, isolation, and durability. Atomicity is the one recovery must provide: commit everything or keep nothing. Isolation is the one locking must provide: concurrent transactions should not observe each other's half-finished work. A system can offer a weaker isolation on purpose. Call it by its name. Do not call a dirty read serializable.",
          "Two-phase locking acquires all the locks a transaction needs in a growing phase and releases them only in a shrinking phase. Strict two-phase locking holds the write locks until commit, which makes recovery simpler because you do not undo a write that another transaction already read. A deadlock is possible, as in the operating system lecture, and the database will abort one transaction. An abort is a legal outcome. The application must be able to retry.",
          "Recovery uses a log. Each update is recorded before the data page is allowed to reach disk, so a crash can redo a committed change whose page never landed, and undo an uncommitted change whose page did. The log is the truth. A checkpoint limits how far you walk backward. This is the idea of write-ahead logging without a worksheet copied from a textbook: the log record hits stable storage first.",
          "Two machines add a new failure. Two-phase commit asks each machine to prepare, then to commit. If the coordinator dies after every machine has prepared and before anyone hears the decision, the machines cannot commit and cannot abort. They are in doubt. Distributed data has failure modes a single log does not. A design that says the network is reliable has not done this lecture. The application-level retry rule from the networks course is the same bug seen from the other side.",
        ],
        figure: {
          kind: "flow",
          caption: "Write-ahead log. The data page is not allowed to get ahead of the record that describes it.",
          steps: ["Change the page in memory", "Append a log record", "Force the log", "Only then write the page"],
        },
        example: {
          title: "A crash after a commit",
          steps: [
            "The transaction commits. The commit record is on the log. The data page is dirty in memory and not on disk.",
            "The machine loses power. Memory is gone. The log remains.",
            "Recovery redoes the committed update onto the page. Without the log record, the commit would have been a lie.",
          ],
        },
        problems: [
          {
            prompt: "Transaction A writes a row and releases the lock before it commits. Transaction B reads the row, and then A aborts. What did B read?",
            answer: "A value that does not exist. That is a dirty read. Strict locking holds A's write lock until A commits or aborts, so B cannot read the row in time to see it.",
          },
          {
            prompt: "Both participants in two-phase commit have answered 'prepared', and the coordinator's decision message is lost. Why can they not simply abort?",
            answer: "The coordinator may already have told the other participant to commit, or it may have decided to commit and the log says so. Aborting a prepared transaction that the other machine committed splits the outcome. They must wait to learn the decision. That wait is the cost of the protocol.",
          },
        ],
      },
    ],
  },
];

