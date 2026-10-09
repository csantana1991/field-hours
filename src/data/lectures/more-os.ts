import type { CoursePack, Figure, Lecture } from "./types";

function week(
  id: string,
  title: string,
  paragraphs: string[],
  figure: Figure,
  exampleTitle: string,
  steps: string[],
  problems: { prompt: string; answer: string }[],
): Lecture {
  return { id, title, minutes: 180, paragraphs, figure, example: { title: exampleTitle, steps }, problems };
}

export const moreOs: CoursePack[] = [
  {
    slug: "csce-611",
    lectures: [
      week(
        "l6",
        "Address spaces",
        [
          "A process is an address space plus a kernel structure that holds its registers, its open files, and its page table. The address space is a lie the kernel maintains: each process sees a private range of virtual addresses. The kernel switches the page table on a context switch. If it forgets, the next process runs on the previous process's memory.",
          "Fork duplicates the address space. Exec replaces it. A shell that forks and execs is the ordinary creation path. Copy-on-write makes the fork cheap until a write. The child and the parent share pages marked read-only, and a write faults, copies, and continues. A program that writes every page after fork pays the copy anyway.",
          "The kernel boundary is a trap. A system call puts arguments in registers or on the user stack, executes a trap instruction, and lands in a handler that checks the arguments before using them. The check is the security of the call. A pointer passed by the user must be verified to point at user memory. The kernel must not trust it.",
          "A context switch saves registers, switches the page table, and restores the next process's registers. It is not free. A design that switches on every short critical section will spend the machine on saves and TLB refills. Threads in one address space switch cheaper because the page table stays.",
        ],
        { kind: "pipeline", caption: "Fork, then exec.", stages: ["Fork duplicates the control block", "Pages are shared copy-on-write", "Exec drops those pages", "The new image is mapped"] },
        "A shell command",
        [
          "The shell forks. The child still runs shell code, in a shared address space, until it does something that writes or until it execs.",
          "The child execs the program. The shell's pages are unmapped in the child. The parent's pages stay.",
          "If exec fails, the child is still a shell and should exit. If it returns to the prompt loop, you have two shells reading the terminal.",
        ],
        [
          {
            prompt: "Why must the kernel check a user pointer before it copies bytes to it?",
            answer: "The pointer may be null, unmapped, or aimed at kernel memory. Copying to it without a check crashes the kernel or overwrites kernel state. The check is the difference between a system call and a hole.",
          },
          {
            prompt: "Two threads in one process switch. Why is that cheaper than two processes switching?",
            answer: "They share the page table, so the kernel does not switch address spaces and the TLB need not be flushed for that reason. The register save remains. The expensive part of a process switch is the address space, not the registers alone.",
          },
        ],
      ),
      week(
        "l7",
        "Scheduling in more detail",
        [
          "The earlier lecture compared FIFO and round robin on three jobs. This week adds the goals. Response time matters for interactive jobs. Turnaround matters for batch jobs. Fairness matters when one user can starve another. No single policy wins all three. Say which one you are optimizing.",
          "Multi-level feedback queues approximate shortest-job-first without being told the length. A new job starts in a high-priority queue with a short quantum. If it uses the quantum, it sinks. Interactive jobs that block stay high. CPU-bound jobs sink and get longer quanta. The policy can starve a job that always uses its quantum if you never boost it. Aging, a periodic boost, is the fix.",
          "Priority inversion is a low-priority job holding a lock that a high-priority job needs, while a medium job runs and the low job never gets the CPU to release the lock. Priority inheritance raises the holder's priority to the waiter's for the duration of the hold. It is a patch on locks, not a reason to ignore them.",
          "On a multiprocessor, a scheduler also chooses a core. Migrating a process drops its cache warmth. Leaving it forever on a busy core ignores an idle one. Affinity has a time limit. Measure the migration cost before you pin everything.",
        ],
        { kind: "layers", caption: "Feedback queues.", rows: ["New jobs enter at the top", "Using a quantum moves you down", "Blocking early keeps you up", "Aging pulls a stuck job back up"] },
        "Three jobs, feedback",
        [
          "Jobs of 1, 10, and 10 time units arrive together. Quantum at the top queue is 1.",
          "The short job runs its 1 and finishes in the top queue. The two long jobs use their quantum and sink.",
          "The short job's turnaround is 1. Under FIFO behind a long job it would have been 11 if a long job had been first. Feedback did not need to be told the length.",
        ],
        [
          {
            prompt: "A low-priority thread holds a lock, a high-priority thread waits for it, and a medium thread spins on the CPU. What is the inversion, and what does inheritance change?",
            answer: "The high-priority thread is effectively waiting behind the medium thread, because the lock holder cannot run. Inheritance raises the holder to high priority so it runs, releases, and drops back. The medium thread no longer sits between the lock and the release.",
          },
          {
            prompt: "Why can a strict priority scheduler starve a low-priority job even if every job eventually blocks?",
            answer: "If higher-priority work is always ready, the low job never runs. Blocking elsewhere does not help this job. You need aging or a share of the CPU reserved for it. 'It will block' is a hope about other jobs, not a fairness proof.",
          },
        ],
      ),
      week(
        "l8",
        "More concurrency",
        [
          "A lock gives mutual exclusion. A condition variable lets a thread wait for a predicate without spinning. The pattern is: hold the lock, while the predicate is false wait on the condition, which atomically releases the lock and sleeps, then recheck the predicate. The recheck is required because the wakeup may be stale, and because another thread may have taken the resource.",
          "A semaphore counts. It is a lower-level tool. You can build a lock and a condition from it, and you can also hide the predicate inside the count and then be unable to say what you are waiting for. Prefer a lock and a condition when the predicate is a data structure. Use a semaphore when the count itself is the resource, such as slots in a buffer.",
          "Deadlock needs four conditions: mutual exclusion, hold and wait, no preemption, and a cycle. Break one. The usual engineering break is a lock order: every thread acquires locks in the same global order, so a cycle cannot form. Timeouts are a recovery, not a prevention. They can leave the data structure half-updated if you are not careful about what the timeout aborts.",
          "A race is a missing lock, not a deadlock. The symptom is a rare wrong answer. Adding locks until it goes away can add a deadlock. Name the invariant the lock protects before you add it.",
        ],
        { kind: "flow", caption: "Wait for a predicate.", steps: ["Acquire the lock", "While the predicate is false, wait", "The wait releases the lock", "On wake, recheck under the lock"] },
        "A one-slot buffer",
        [
          "The predicate for the consumer is 'the slot is full.' The producer waits on 'the slot is empty.'",
          "The consumer takes the item, marks the slot empty, and signals the producer. If the signal happens before the producer waits, a condition variable without a predicate check loses the wakeup. The while-loop recheck, together with holding the lock across the test, closes that hole. The lock is why the signal cannot sneak between the test and the wait.",
          "Two consumers without the while can both pass a single if, and the second reads an empty slot. The while is the second consumer's protection.",
        ],
        [
          {
            prompt: "Thread A locks X then Y. Thread B locks Y then X. How do you remove the deadlock without removing either critical section?",
            answer: "Impose an order. Both threads lock X before Y. A cycle needs opposing orders. Timeouts are the alternative and they complicate the failure path. The order is the prevention.",
          },
          {
            prompt: "You replace the while around a condition wait with a single if. Describe a wakeup that breaks the code.",
            answer: "A thread is signaled, another thread runs first and falsifies the predicate, and the woken thread proceeds without rechecking. Or two threads are woken for one resource. The if assumes the predicate is still true. It is not, once more than one waiter exists or a signal can be stolen.",
          },
        ],
      ),
      week(
        "l9",
        "Replacement and thrashing",
        [
          "A page fault on an unmapped page is how demand paging fills memory. Replacement chooses the victim. The optimal policy evicts the page used farthest in the future. You cannot implement it without the future, and you can use it as a yardstick on a trace.",
          "LRU evicts the least recently used page. It works when the recent past matches the near future, which is the locality assumption. It fails on a scan larger than memory: the scan evicts everything useful and never reuses the pages it just brought in. Clock approximates LRU with a reference bit and a sweeping hand, and it has the same scan failure.",
          "Thrashing is the state where the system spends its time faulting because the multiprogramming level is too high. Each process's working set is reasonable and the sum is not. The fix is to run fewer processes, or to refuse admission, not to tweak the clock hand. A process whose working set exceeds RAM will thrash alone. No replacement policy saves it.",
          "The working set of a window is the set of pages referenced in that window. If you size the window and admit a process only when its working set fits in the free frames, you are doing the admission control thrashing requires. Counting faults after the fact is how you notice you did not.",
        ],
        { kind: "layers", caption: "Clock on four frames.", rows: ["Hand points at a frame", "Reference bit 1 becomes 0, hand moves", "Reference bit 0 is the victim", "A scan sets every bit and then evicts everything"] },
        "A loop over five pages, four frames",
        [
          "Pages 1, 2, 3, 4, 5, then repeat. Four frames.",
          "After the first four faults the frames hold 1 through 4. Touching 5 evicts 1 under FIFO or LRU. Touching 1 evicts 2. Every access faults.",
          "This is Belady's classic small example of a working set that does not fit. A smarter policy among these four frames still faults every time around the loop. You need a fifth frame or a different access pattern.",
        ],
        [
          {
            prompt: "Optimal replacement on a trace faults 10 times and LRU faults 12. What do you conclude about LRU on this trace?",
            answer: "It is close to the yardstick. Two extra faults are not a reason to invent a new policy. If LRU had faulted 100 times, the trace lacks the locality LRU assumes, and you look at the access pattern.",
          },
          {
            prompt: "Each of eight processes has a working set of half of RAM. They are all runnable. What happens, and what is the control?",
            answer: "The sum of working sets is four times RAM, so the machine thrashes. Admission control should keep the sum of working sets under RAM, which means running one or two of these processes, not eight. Replacement policy is the wrong knob.",
          },
        ],
      ),
      week(
        "l10",
        "File systems",
        [
          "A file is a name, metadata, and data blocks. A directory maps names to inode numbers. An inode holds the size, the permissions, and the block pointers. Separating the name from the inode is why a file can have two names, and why deleting a name does not free the blocks until the last name and the last open handle are gone.",
          "A crash can leave a metadata update half done: the inode points at a block that was never marked allocated, or a directory entry points at an inode that was freed. Fsck walks the structures and repairs what it can, slowly. A journal writes the intended metadata update to a log, and recovery replays or discards the log. The data blocks may still be stale unless the journal includes them or the file system orders the writes.",
          "The inode and the bitmap must agree. The usual order writes the bitmap first or logs both. A crash between the two writes is the case you must be able to describe. 'The file system is journaled' is not a description of that order.",
          "Performance comes from locality of the data blocks and from a cache of inodes and directories. A workload that creates a million tiny files stresses the metadata path, not the sequential bandwidth. Measure the workload you have.",
        ],
        { kind: "flow", caption: "Create a file, then crash.", steps: ["Allocate an inode", "Allocate a block", "Point the inode at the block", "Add the directory entry", "A crash can sit between any two"] },
        "Crash after the directory entry",
        [
          "The directory entry is on disk, the inode is on disk, and the data block was never written. The file exists and reads as zeros or as old block contents.",
          "A journal of the metadata can make the create atomic with respect to the directory. It does not by itself contain the user's bytes.",
          "If the application needs the bytes durable, it fsyncs the file and then the directory, in that order, or it uses a file system mode that journals data. The call is part of the contract.",
        ],
        [
          {
            prompt: "Two names point at one inode. You unlink one name. When are the blocks freed?",
            answer: "When the link count hits zero and no process still has the file open. The other name still owns the inode. Unlink removes a name, not necessarily the bytes.",
          },
          {
            prompt: "The bitmap says a block is free and an inode still points at it. Which repair is safe?",
            answer: "Trust a defined order, or mark the block allocated if the inode is live. Marking it free while the inode points at it will hand the same block to a new file. Fsck's job is to pick the rule and apply it. A journal avoids reaching this state.",
          },
        ],
      ),
      week(
        "l11",
        "Disks and the page cache",
        [
          "A rotating disk pays a seek and a rotational delay, milliseconds, before a transfer that is fast. Random 4-kilobyte reads are seek-bound. Sequential reads are transfer-bound. A flash device does not seek, and it still punishes small random writes because of erase blocks. The lesson is not 'disks are slow.' It is that the access pattern dominates the device.",
          "The page cache holds file pages in memory and writes them back later. A write that returned from write() is not durable. It is durable after a flush that the device has acknowledged. Applications that need a crash to preserve the write must flush, and they must know what the flush covers.",
          "Read-ahead helps sequential scans and hurts random reads if it evicts a useful page for a page nobody will touch. The cache does not know the future. A hint, or a detected sequential run, is how it guesses.",
          "RAID and a single device differ in the failure story. Striping without redundancy increases bandwidth and the chance that one disk kills the volume. Mirroring trades capacity for survival of one disk. The file system journal does not replace a mirror. They handle different failures.",
        ],
        { kind: "pair", caption: "Two access patterns.", leftTitle: "Sequential", rightTitle: "Random 4 KB", left: ["One seek, then a long transfer", "Read-ahead pays", "Bandwidth limited"], right: ["A seek per read", "Read-ahead wastes the cache", "IOPS limited"] },
        "One hundred random reads",
        [
          "A disk with a 5-millisecond average seek does 100 random reads in about half a second, plus transfer, which is noise next to the seeks.",
          "The same bytes sequential are one seek plus a short transfer, tens of milliseconds.",
          "An algorithm that 'just reads the file' can be either, depending on whether the layout is sequential. The file system allocator is why create-order often matches read-order, and why it stops matching after fragmentation.",
        ],
        [
          {
            prompt: "write() returned and the power failed before a flush. What can the application assume is on disk?",
            answer: "Nothing about that write. The page cache may have held it. Durability starts at the flush acknowledgement, and only for what that flush covered.",
          },
          {
            prompt: "Why can a flash device be fast at random reads and still slow at small random writes?",
            answer: "Reads do not erase. A small write may force an erase of a much larger block and a copy of the surviving pages. The read path and the write path are different machines inside the same package.",
          },
        ],
      ),
      week(
        "l12",
        "The kernel as a protector",
        [
          "The kernel mediates every resource. A bug in that mediation is a privilege bug. Time-of-check to time-of-use is the pattern: the kernel checks a file's permissions, the user replaces the file with a link, and the kernel then opens the wrong object. The fix is to bind the check to the object, not to the name, and to refuse to follow a swap in between.",
          "Capabilities and access-control lists are two ways to store the permission. An ACL asks, for this object, who may act. A capability is an unforgeable reference that confers the right. The kernel must be able to forge-proof the reference, which is why a capability is not a filename the user typed.",
          "A buffer overrun in the kernel is a full compromise, because the kernel's address space is the machine. User memory corruption is a compromise of that user. The same bug class, and a different boundary. The checks on system-call arguments are the ordinary way the boundary holds.",
          "Least privilege for a process means it holds only the handles it needs. A daemon that opens a privileged port and then drops its credentials is following that rule. One that keeps the credentials because restarting was annoying is not.",
        ],
        { kind: "flow", caption: "A check that is not a use.", steps: ["Look up the name", "Check the permissions", "The user changes the name", "The use acts on a different object"] },
        "A directory and a symlink",
        [
          "A privileged program checks that a path is owned by root, then opens it.",
          "Between the check and the open, another process replaces a component with a symlink to a file the program should not write.",
          "The open follows the symlink and writes the wrong file. Opening with a flag that does not follow the last component, or using a file handle from the check, closes the window. Two separate lookups do not.",
        ],
        [
          {
            prompt: "Why is a filename an insufficient capability?",
            answer: "Any process that can guess or read the name can present it, and the name can be rebound to a different inode. A capability must be unforgeable and bound to the object. The kernel issues it. The user does not type it.",
          },
          {
            prompt: "A system call copies a path from user memory without checking the pointer. What can the caller make the kernel do?",
            answer: "Read or write kernel memory, fault on an unmapped address and take down the machine, or supply a path the caller should not have been able to construct. Validate the range before the copy.",
          },
        ],
      ),
      week(
        "l13",
        "A small kernel, traced",
        [
          "Take one system call and walk it. Read is enough. The user puts a file descriptor, a buffer, and a length in the agreed registers and traps. The handler checks the descriptor, checks the buffer, and calls the file's read operation. The file system copies data into the page cache if needed and then into the user buffer. The handler returns the count or an error. Every step can fail, and the failures are part of the interface.",
          "A context switch in the middle is normal if the read must wait for the disk. The process sleeps, another runs, and the interrupt wakes the sleeper. The invariant is that the kernel lock or the sleep is arranged so the wakeup is not lost. You already saw that pattern on condition variables. The disk interrupt is the signal.",
          "Draw the user memory, the kernel stack, the inode, and the page cache as four boxes and show which code may write which box. If user code can write the inode, the picture is wrong.",
          "This walk is the review for the course. Scheduling, memory, files, and concurrency are all in one read that blocks. If you can narrate it, you can narrate the others.",
        ],
        { kind: "pipeline", caption: "A blocking read.", stages: ["Trap", "Check the descriptor and the buffer", "Miss the cache and sleep", "Interrupt wakes the process", "Copy out and return"] },
        "Read of 100 bytes, cold cache",
        [
          "The page is not cached. The process marks itself sleeping and the scheduler runs someone else. The read has not returned.",
          "The disk interrupt arrives. The driver copies the sector into the page cache and wakes the sleeper.",
          "The sleeper runs, copies 100 bytes to the user buffer, and returns 100. If the user buffer was invalid, the copy fails and the system call returns an error without having changed the file.",
        ],
        [
          {
            prompt: "The disk interrupt wakes the process before the process has finished going to sleep. What must the sleep implementation do?",
            answer: "The same thing a condition variable does. The wakeup must not be lost. The process checks a flag under the same exclusion that the interrupt sets, or it uses a sleep primitive with that guarantee. A bare flag tested before the sleep, with the wake in between, loses the event and sleeps forever.",
          },
          {
            prompt: "Name two checks that happen before any byte is copied to the user.",
            answer: "The descriptor refers to an open file that allows read, and the user buffer is a writable range in the user's address space of the requested length. Either failure returns an error and copies nothing.",
          },
        ],
      ),
      week(
        "l14",
        "What you can now explain",
        [
          "You should be able to explain a process switch, a lock and a condition, a page fault, a journaled create, and a system-call check. Those are the course. The hours are the explanations written out on a blank page, plus the problems, not a second reading.",
          "Pick one bug from each week and say which invariant it breaks. A lost wakeup breaks the condition. A missing user-pointer check breaks the kernel boundary. A working set larger than memory breaks admission. Naming the invariant is the skill.",
          "The capstone later will ask you to show a crash and a recovery. The file-system week and the read walk are the material. A crash that you cannot place between two specific writes is a story, not a test.",
          "This is original teaching of the standard mechanisms. It is not a commentary on any one teaching operating system. If you implement a small kernel, the invariants above are the ones to test.",
        ],
        { kind: "layers", caption: "Five invariants.", rows: ["The page table switches with the process", "Wait rechecks its predicate", "The working set must fit", "Metadata updates survive a crash", "User pointers are checked"] },
        "One bug, one invariant",
        [
          "A test fails rarely: two threads took the same ticket from a counter.",
          "The increment was not atomic and there was no lock. The invariant was mutual exclusion on the counter. This is a race, not a deadlock and not a scheduling bug.",
          "The fix is a lock around the increment, or an atomic increment. Adding a sleep will make the bug less frequent and not gone.",
        ],
        [
          {
            prompt: "A process uses far more CPU after you add print statements in the scheduler. What did you probably change?",
            answer: "The cost and perhaps the frequency of context switches, or you serialized on the console lock. The program's algorithm did not change. Measure switch counts before you rewrite the scheduler.",
          },
          {
            prompt: "Which week answers a lost wakeup, and what is the one-line fix in the waiting code?",
            answer: "The concurrency week. Wait in a loop that rechecks the predicate while holding the lock, so a signal cannot be lost between the check and the sleep, and a stolen wakeup cannot be acted on.",
          },
        ],
      ),
    ],
  },
];
