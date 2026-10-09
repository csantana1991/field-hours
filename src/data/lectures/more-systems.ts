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

export const moreSystems: CoursePack[] = [
  {
    slug: "csce-614",
    lectures: [
      week(
        "l6",
        "Instruction-level parallelism",
        [
          "A pipeline overlaps instructions. Instruction-level parallelism is how many of those instructions are actually independent. A program with a chain of dependent adds has almost none, no matter how wide the machine is. A program with independent adds has as much as the window can see.",
          "A scoreboard issues an instruction when its functional unit is free and its source registers are ready, and it stalls on write conflicts. Tomasulo's algorithm adds reservation stations and register renaming, so a write to a register does not wait for an earlier write to the same name. The name was the conflict. The values were not.",
          "Speculation executes past a branch before the branch resolves, using a prediction. If the prediction is wrong, the machine squashes the speculative results and must not have written them into the architectural state. Reorder buffers exist so that results commit in program order even if they finished out of order.",
          "Width is not throughput. If the branch is mispredicted every five instructions and the penalty is 15 cycles, the machine spends more time refilling than executing. Compute that before you buy a wider core.",
        ],
        { kind: "pipeline", caption: "Issue, execute, commit.", stages: ["Rename the destination", "Wait in a reservation station", "Execute when inputs arrive", "Commit in program order"] },
        "Two adds that share a name",
        [
          "Instructions: R1 = R2 + R3, then R1 = R4 + R5, then R6 = R1 + R7. The second write to R1 does not depend on the first. The third instruction depends on the second.",
          "Without renaming, the second add waits so it does not overwrite R1 before a hypothetical reader of the first result. There is no such reader here, but the name collides.",
          "With renaming, the first R1 and the second R1 are different physical registers. The second add issues immediately. The third waits only for the second.",
        ],
        [
          {
            prompt: "A chain of 20 dependent integer adds runs on a 4-wide machine. What is the best throughput you should expect, in adds per cycle?",
            answer: "About one add per cycle, plus pipeline fill, because each add needs the previous result. Width 4 does not create independence. The extra issue slots stay empty.",
          },
          {
            prompt: "Speculation writes a store into the data cache before the branch resolves, and the branch was wrong. What must the machine be able to do?",
            answer: "Undo the store, or not have made it visible yet. A reorder buffer that commits stores only when the branch is known prevents the visible write. A machine that cannot undo or delay the store has corrupted architectural state.",
          },
        ],
      ),
      week(
        "l7",
        "Branches",
        [
          "A conditional branch is a data dependence from the condition to every instruction after it. The pipeline either stalls until the condition is known or guesses. A stall of the full pipeline depth on every branch is intolerable, because branches are common. Guessing is the design.",
          "A bimodal predictor stores a two-bit counter per branch address. Taken and not-taken increment and decrement the counter, and the prediction is the high bit. Two bits tolerate one stray outcome without flipping the prediction. A one-bit counter flips on every loop exit and then mispredicts the next entry.",
          "A branch target buffer caches the destination. Predicting taken is useless if you do not know where. Indirect branches, including returns, need a structure that can hold more than one target. A return-address stack predicts returns by the call nesting, which a flat table does poorly.",
          "Measure the misprediction rate before you optimize a branchy program. If the rate is already under one percent, the branch is not your bottleneck. If a two-bit counter fails on a pattern that alternates in a regular way, a local-history predictor is the next tool, not a wider core.",
        ],
        { kind: "layers", caption: "A two-bit counter saturates.", rows: ["00 strongly not taken", "01 weakly not taken", "10 weakly taken", "11 strongly taken"] },
        "A loop that exits",
        [
          "A loop is taken 100 times and then not taken once. A one-bit predictor mispredicts the exit and then mispredicts the first taken branch of the next run.",
          "A two-bit counter that sat at 11 goes to 10 on the exit and still predicts taken next time. One stray outcome does not flip it.",
          "The exit itself is still a misprediction. The counter does not foresee the trip count unless a different predictor stores that history.",
        ],
        [
          {
            prompt: "Why does a one-bit predictor mispredict twice per loop, while a saturated two-bit counter mispredicts once?",
            answer: "The exit flips the one-bit predictor to not-taken, so the next iteration's first branch, which is taken, misses as well. The two-bit counter moves from strongly taken to weakly taken and still predicts taken. Only the exit misses.",
          },
          {
            prompt: "You correctly predict that a branch is taken and then spend 12 cycles computing its target. Did the predictor remove the bubble?",
            answer: "No. The direction was ready and the target was not. You need the target in a buffer, or you still stall. Direction and target are separate predictions.",
          },
        ],
      ),
      week(
        "l8",
        "Coherence",
        [
          "Two cores with private caches can hold two different values for one address if nothing stops them. Coherence is the protocol that stops them. The single-writer, multiple-reader invariant says that at any moment either one core may write, or several may read, but not both. MESI names the states: Modified, Exclusive, Shared, Invalid.",
          "A core that wants to write an address that another core holds must invalidate the other copies first. A core that wants to read an address another core has modified must get the new value and the writer's copy becomes shared or invalid. The bus or the directory is how those messages travel. Without a protocol, the program's stores are suggestions.",
          "False sharing is coherence traffic on a line that holds two unrelated variables. Two cores increment two counters that happen to sit on the same 64-byte line, and every increment invalidates the other core. The program is race-free and still slow. Pad the counters onto separate lines if the profile shows it.",
          "Coherence is not consistency. Coherence talks about one address. Consistency talks about the order of accesses to different addresses as other cores see them. A program can be coherent and still surprise you if you expected sequential consistency and the machine reordered stores.",
        ],
        { kind: "pair", caption: "One line, two questions.", leftTitle: "Coherence", rightTitle: "Consistency", left: ["One address", "MESI states", "Invalidations"], right: ["Several addresses", "What order another core sees", "Fences when the language requires them"] },
        "False sharing on 64 bytes",
        [
          "Counter A and counter B sit 8 bytes apart, on one cache line. Core 0 increments A. Core 1 increments B.",
          "Each increment is a write. The protocol grants the line to one writer and invalidates the other. The line bounces.",
          "Move B to the next line. The invalidations stop. The increments were never a data race. The line size was the coupling.",
        ],
        [
          {
            prompt: "Core 0 holds a line in Modified and Core 1 wants to read it. What must happen before Core 1's load returns?",
            answer: "The modified value must reach Core 1, and Core 0's copy must stop being the unique dirty copy. In MESI, Core 0 supplies the data and both end in Shared, or the writer's line is written back and then shared. Core 1 must not read a stale copy.",
          },
          {
            prompt: "You add a lock around both counters and the line still bounces. Why?",
            answer: "The lock serializes the updates and does not move the counters onto different lines. Coherence traffic follows the writes, even when the writes are ordered. False sharing is a layout problem. The lock answers a different problem, a race.",
          },
        ],
      ),
      week(
        "l9",
        "A memory system you can measure",
        [
          "A cache is defined by capacity, line size, and associativity. The earlier lecture placed one address. This week stacks the misses. A compulsory miss is the first touch of a line. A capacity miss is a line that was evicted because the working set does not fit. A conflict miss is a line evicted because too many hot lines mapped to the same set, even though the cache as a whole had room.",
          "Changing associativity separates conflict from capacity. If a direct-mapped cache misses and a fully associative cache of the same size does not, the misses were conflicts. If both miss, you need a bigger cache or a smaller working set. Buying associativity will not fix a working set that does not fit.",
          "Prefetching hides latency when the next address is predictable, and it pollutes the cache when it is not. A prefetcher that pulls the next line helps a scan and hurts a pointer chase whose next address is a loaded value. Profile the two patterns separately.",
          "Write the miss rate next to the access count. A 1 percent miss rate on a memory-bound kernel can still dominate if the miss penalty is hundreds of cycles. The rate without the penalty is not a time.",
        ],
        { kind: "layers", caption: "Misses, separated.", rows: ["Compulsory: first touch", "Capacity: working set exceeds the cache", "Conflict: the set was too small", "The penalty in cycles, not just the rate"] },
        "Where address 44 sits, again, with a neighbor",
        [
          "Line size 16 bytes, 4 sets, direct-mapped. Address 44 and address 44 + 64 map to the same set if 64 is a multiple of the set stride. 16 times 4 is 64, so they alias.",
          "Touching them alternately on a direct-mapped cache misses every time after the first fill of each, if only one line fits in the set.",
          "A 2-way cache of the same capacity holds both. The misses were conflicts. Capacity was not the cause.",
        ],
        [
          {
            prompt: "The working set is twice the cache and accesses are sequential. Will raising associativity from 1 to 8 remove most misses?",
            answer: "No. Those are capacity misses. Associativity changes which line you evict inside a set. It does not make the cache larger. You need fewer live lines or a larger cache.",
          },
          {
            prompt: "A prefetch of the next line drops misses on a scan and raises them on a hash-table probe. Why is that one mechanism doing both?",
            answer: "The scan's next address is the next line, so the prefetch is used. The probe's next address is not the next line, so the prefetched line evicts something you needed. The mechanism has no knowledge of which pattern you are in unless you tell it or it detects the stride.",
          },
        ],
      ),
      week(
        "l10",
        "Multiprocessors",
        [
          "A multicore chip is a set of cores, private caches, and a shared last-level cache or memory controller. The earlier coherence lecture is the contract. This week is the cost. A lock that bounces between cores costs the coherence round trip, not the cost of the increment. Spinning on a lock that another core holds burns issue slots and the interconnect.",
          "A scalable lock backs off, or waits in a queue, so that not every core invalidates the same line on every release. Test-and-test-and-set spins on a local read and only tries the atomic write occasionally. It is still unfair and still noisy. A ticket lock or an MCS queue keeps the handoff on a line the next waiter owns.",
          "The interconnect is a bus only while the core count is small. A crossbar or a mesh has a different bandwidth and a different worst-case hop count. An algorithm that assumes a broadcast invalidate is cheap will not survive a directory protocol where the directory must list the sharers.",
          "Parallel speedup is limited by the serial fraction and by the contention you added. Amdahl's law is the serial fraction. The coherence traffic is the term people forget to put in the model. Measure both.",
        ],
        { kind: "layers", caption: "Where time goes when eight cores share one counter.", rows: ["The increment itself", "The atomic instruction", "The line bouncing between cores", "The serial fraction you did not parallelize"] },
        "Amdahl with a lock",
        [
          "A job is 10 seconds, of which 1 second is serial. Eight cores, perfect scaling of the rest: time is 1 + 9/8 = 2.125 seconds. Speedup is about 4.7, not 8.",
          "Add a lock that costs 0.5 seconds of contention you did not have in the serial run. Time becomes 2.625 seconds. Speedup falls further.",
          "The model is crude and it stops you from expecting 8. The measurement on the machine is the number you keep. The model is what you compare it to.",
        ],
        [
          {
            prompt: "Eight cores spin on one test-and-set lock. Why does throughput of the critical section fall as you add cores past a point?",
            answer: "Each failed atomic write invalidates the line. More cores mean more invalidations per successful acquire. The lock line spends its time moving. A queued lock hands off to one waiter and the others spin locally, or sleep.",
          },
          {
            prompt: "The serial fraction is 0 and the speedup from 1 to 8 cores is 2. What does Amdahl's law not explain, and where do you look?",
            answer: "Amdahl with a zero serial fraction predicts speedup 8. The missing factor is overhead: contention, false sharing, load imbalance, or a bandwidth limit. Profile the lock and the cache line, not the serial section you already measured as empty.",
          },
        ],
      ),
      week(
        "l11",
        "Vectors and SIMT",
        [
          "SIMD applies one instruction to several lanes of data. The hardware is simple and the programming model is strict: lanes that do not agree on control flow are masked off and the instruction still takes time. A vectorized loop with a divergent branch runs both sides, each with some lanes idle.",
          "A GPU's SIMT model looks like many threads and executes as warps of lockstep lanes. Divergence inside a warp is the same masking. Coalesced memory access means consecutive lanes touch consecutive addresses, so the hardware serves them as one transaction. A warp that gathers one address per lane from all over memory issues many transactions and the arithmetic units wait.",
          "Occupancy is how many warps are in flight to hide memory latency. It is limited by registers and shared memory per thread. Using every register to gain a little arithmetic can drop occupancy and lose the latency hiding. The trade is empirical. The model tells you which knob you turned.",
          "Do not move a branchy, pointer-chasing algorithm onto a GPU and expect the peak FLOP number. That number assumes the lanes agree and the accesses coalesce. A matrix multiply can approach it. A tree walk will not.",
        ],
        { kind: "pair", caption: "The same work, two machines.", leftTitle: "SIMD loop", rightTitle: "Gather", left: ["Consecutive lanes, consecutive addresses", "One vector load", "A branch masks lanes"], right: ["Each lane holds a pointer", "Many transactions", "Arithmetic waits on memory"] },
        "Four lanes, one branch",
        [
          "Lanes hold 1, 2, 3, 4. The branch keeps even values.",
          "The even path runs with two lanes active. The odd path runs with the other two. Wall time is both paths, not the longer one alone, on a lockstep warp.",
          "If you split the data so a warp is all even, the odd path is a different warp and the masking inside the even warp disappears. Layout changed the divergence.",
        ],
        [
          {
            prompt: "A warp of 32 lanes loads 32 addresses that are 128 bytes apart. How many cache lines do you touch compared with 32 consecutive floats?",
            answer: "Thirty-two lines if each address falls in a different line, against one or two lines for consecutive floats. The arithmetic intensity collapses. Coalesce, or accept a memory-bound kernel.",
          },
          {
            prompt: "You double the registers per thread and occupancy falls by half, and the kernel slows. What was hiding the latency before?",
            answer: "Other warps. With fewer warps in flight, a memory stall has nothing else to issue. The extra registers may have removed a few instructions and still lost, because the machine was latency-bound, not arithmetic-bound.",
          },
        ],
      ),
      week(
        "l12",
        "Virtual memory at the system level",
        [
          "The earlier lecture computed a page number. This week is the mechanism around it. A page fault on a resident set that is too small thrashes: the pages you need are evicted to bring in the pages you need next, and the disk or the flash becomes the processor. The working set is the pages referenced in a recent window. If it does not fit, add memory or touch less.",
          "A translation lookaside buffer caches page-table entries. A miss costs a walk of the page table, which is itself cached. Huge pages reduce TLB pressure by covering more address with one entry, and they waste memory and increase fragmentation. Use them when the TLB is the measured problem.",
          "Copy-on-write lets a fork share pages until a write. The first write faults, copies the page, and reprotects it. A program that forks and then writes every page pays the copy and gains nothing. A program that forks and execs can share the brief window. The policy matches the use.",
          "The address space is a protection domain. A bit in the page table is the difference between a bug and a stop. Do not turn the bit off to make a debugger convenient and then ship that configuration.",
        ],
        { kind: "layers", caption: "From a virtual address to a stall.", rows: ["TLB", "Page-table walk", "Fault if the page is absent", "Disk, if the working set does not fit"] },
        "Page size 4096, address 20480",
        [
          "20480 / 4096 = 5, so this is page 5, offset 0. That part you already did.",
          "If the TLB holds page 5, the translation is one cycle away. If not, the walker reads the page-table entry.",
          "If the entry is absent because you have 4 frames and you just touched 5 new pages, the fault evicts one. Touch them in a loop and every access faults. That is thrashing, and the page math did not warn you. The working-set size did.",
        ],
        [
          {
            prompt: "A program sequentially scans an array twice the size of RAM. Will a better replacement policy make the scan run at memory speed?",
            answer: "No. The working set is the array, and it does not fit. Every policy faults. You need more memory, a smaller scan, or an algorithm that reuses a block before it is evicted.",
          },
          {
            prompt: "Fork uses copy-on-write, and the child immediately writes every page. How many page copies do you perform relative to copying everything at the fork?",
            answer: "The same number, one per written page, plus the fault overhead. Copy-on-write saved nothing on this pattern. It pays when the child writes little, or exits, or replaces its address space.",
          },
        ],
      ),
      week(
        "l13",
        "A performance argument",
        [
          "The last architecture weeks are a method. Pick a kernel you can time. State the peak you could imagine: arithmetic peak or memory peak, whichever the kernel should hit. Measure the kernel. The ratio is the efficiency. Then name the stall that explains the gap, with a counter or a microbenchmark, not with a guess.",
          "A CPI stack splits cycles into retiring instructions, bad speculation, front-end stalls, and back-end stalls. You do not need a vendor tool to start. A back-of-the-envelope roofline compares arithmetic intensity to the machine's balance point. If the kernel does one add per eight bytes from DRAM, it is memory-bound on any machine you can buy, and optimizing the add is wasted time.",
          "Change one thing. Associativity, a padding of one line, a prefetch, a different page size. If you change four things, you do not know which one moved the number.",
          "Write the number with the machine and the input size. A speedup on a 4-kilobyte input that fits in L1 does not transfer to a 4-gigabyte input. The course is the habit of tying the number to the level of the machine that produced it.",
        ],
        { kind: "layers", caption: "The argument, top to bottom.", rows: ["Peak for this kernel", "Measured time", "The stall that explains the gap", "One change, then measure again"] },
        "One add per eight bytes",
        [
          "A kernel loads two doubles and adds them, streaming. Arithmetic intensity is one add per 16 bytes, or half an add per eight bytes if you count the store. Use the count you can defend.",
          "If DRAM delivers 40 GB/s and a double is 8 bytes, the load stream tops out near 5 billion doubles per second, hence that many adds, regardless of a 64-wide vector unit that could do more arithmetic.",
          "A vectorized version that does not change the bytes moved will not exceed that ceiling. The stall is memory. The next change is fewer loads, not a wider add.",
        ],
        [
          {
            prompt: "You optimize the inner arithmetic and the runtime does not change. The roofline says the kernel is under the memory ceiling and far from the arithmetic peak. Where do you look next?",
            answer: "At the loads and stores: extra copies, a poor layout, or a cache that is not actually holding the reused data. More arithmetic throughput cannot move a kernel that is waiting on bytes.",
          },
          {
            prompt: "The kernel is fast on 32 KB and slow on 32 MB, and both sizes are far under RAM. What level of the machine changed?",
            answer: "The cache. 32 KB may fit in L1 and 32 MB may not fit in the last-level cache, so the slow run is a memory or LLC problem. Report both sizes. One of them is not 'the' runtime.",
          },
        ],
      ),
      week(
        "l14",
        "The machine, end to end",
        [
          "A program runs on a pipeline, fed by a cache, translated by a TLB, on a core that shares lines with other cores. The course split these so each had an invariant. The machine runs them at once. When a number is bad, walk the stack: speculation, then the cache, then the TLB, then coherence, then the memory controller. Stop at the first level that explains the cycles.",
          "You should be able to compute, by hand, a cache index, a page number, a pipeline stall on a load-use, and a speedup bound from a serial fraction. Those four calculations are the literacy. The rest of the course is knowing which one a profile is pointing at.",
          "The hours for this course are those calculations on your own examples, not a reread of these notes. Pick an address and a machine configuration and write the steps. If you cannot finish without looking, you are not done with that week.",
          "Nothing here is a specific vendor's manual. The names MESI, Tomasulo, and TLB are the standard names for the mechanisms. Your measurements belong to the machine you actually timed.",
        ],
        { kind: "flow", caption: "Where to look, in order.", steps: ["Is the pipeline fed?", "Does the working set fit?", "Is the TLB the walker?", "Is a line bouncing?", "Only then blame the algorithm"] },
        "One load, four questions",
        [
          "A load feeds an add in the next instruction. On a five-stage pipeline with no bypass around the load's memory stage, the add stalls one cycle. That is the pipeline question.",
          "The load misses L1 and hits the last-level cache. The stall is tens of cycles, not one. The pipeline diagram was the wrong scale.",
          "If the line is in another core's Modified state, add the coherence round trip. Ask the questions in order or you will 'fix' the bypass and change nothing.",
        ],
        [
          {
            prompt: "Name the calculation that tells you a width-4 core will not speed a dependent chain.",
            answer: "The length of the dependence chain, in cycles, versus the independent work available in the window. If the chain is longer than the independent work, issue width sits idle. The earlier worked example of twenty dependent adds is this calculation.",
          },
          {
            prompt: "You have one afternoon. The program is five times slower than the roofline. What do you measure first?",
            answer: "Whether it is memory-bound or losing time to mispredicted branches or coherence. A hardware counter or a simple on-and-off of the suspected prefetch or padding tells you which lecture applies. Do not start by rewriting the algorithm.",
          },
        ],
      ),
    ],
  },
];
