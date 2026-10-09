import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-658",
    lectures: [
      lec(
        "l1",
        "Indicators and linearity",
        [
          "You analyze a randomized algorithm by turning events into numbers. An indicator is 1 when its event happens and 0 otherwise, and the expectation of that indicator equals the probability of the event. Toss 8 fair coins. The number of heads is the sum of 8 indicators, each with expectation 1/2, so the expected number of heads is 4. Dependence among the coins does not break the sum.",
          "You apply the same sum to records in a random permutation of 4 distinct keys. Let X_i be 1 when position i is larger than every key before it. Position 1 is always a record, so its expectation is 1. At position k the largest among the first k keys is equally likely to sit in any of those k places, so the expectation is 1/k. Adding 1 + 1/2 + 1/3 + 1/4 gives 25/12.",
        ],
        {
          kind: "pipeline",
          caption: "From an event to a sum of expectations.",
          stages: [
            "Name the event",
            "Write a 0-1 indicator",
            "Take its expectation",
            "Add across events",
          ],
        },
        "Records among 4 keys",
        [
          "The permutation is 2, 4, 1, 3. Position 1 holds 2, a record. Position 2 holds 4, larger than 2, a record.",
          "Position 3 holds 1, smaller than 4, so it is not a record. Position 4 holds 3, also smaller than 4.",
          "This one permutation has 2 records. The expectation over all 24 permutations is 25/12, not the count on this sample.",
        ],
        [
          {
            prompt: "A random permutation of 3 distinct keys. What is the expected number of left-to-right records?",
            answer: "Linearity gives 1 + 1/2 + 1/3 = 11/6. Averaging the 6 permutations by hand gives the same 11/6.",
          },
          {
            prompt: "One fair coin. Let X be 1 on heads and Y be 1 on that same heads. What is E[X+Y]?",
            answer: "Each expectation is 1/2. Linearity ignores the dependence, so E[X+Y] = 1. The outcomes are 2 and 0, and their average is 1.",
          },
        ],
      ),
      lec(
        "l2",
        "Markov and Chebyshev tails",
        [
          "You reach for Markov when a random variable is nonnegative and you know only its mean. If the mean is m, the probability that the variable is at least t is at most m/t. Take a running time whose expectation is 10. Markov says the chance it runs for 40 or more is at most 10/40, which equals 1/4. The bound can be loose. It is available before you know a variance.",
          "You tighten the tail once a variance is in hand. Chebyshev says the probability of landing at least k standard deviations from the mean is at most 1/k squared. Suppose the mean is 20 and the variance is 16, so one standard deviation is 4. A deviation of 12 is 3 standard deviations, and the probability of such a deviation is at most 1/9. You paid for that bound by computing a second moment.",
        ],
        {
          kind: "pair",
          caption: "Two tail bounds, and what each one spends.",
          leftTitle: "Markov",
          rightTitle: "Chebyshev",
          left: [
            "Needs a nonnegative variable",
            "Uses only the mean",
            "Mean 10 at 40 is 1/4",
          ],
          right: [
            "Needs a variance",
            "Counts standard deviations",
            "3 deviations: at most 1/9",
          ],
        },
        "A running time with mean 10",
        [
          "You know only that T is nonnegative and E[T] = 10. Markov at threshold 50 gives probability at most 10/50 = 1/5.",
          "You then learn the variance is 25, so the standard deviation is 5. The distance from 10 to 50 is 40, which is 8 standard deviations.",
          "Chebyshev bounds that event by 1/8 squared = 1/64. The Markov number was 1/5. The variance is what improved the bound.",
        ],
        [
          {
            prompt: "Nonnegative X has expectation 6. Use Markov to bound the probability that X is at least 24.",
            answer: "At most 6/24 = 1/4.",
          },
          {
            prompt: "The mean is 10 and the variance is 4. Bound the probability that X is at least 6 away from the mean.",
            answer: "The standard deviation is 2, so a distance of 6 is 3 standard deviations. Chebyshev gives at most 1/9.",
          },
        ],
      ),
      lec(
        "l3",
        "Chernoff bounds for coin sums",
        [
          "You get a sharper tail when a sum is made of independent coin flips. A Chernoff bound builds the moment generating function of each flip, multiplies those functions, and applies Markov to the exponential. Take 100 flips of a fair coin, so the mean is 50. The chance of 75 or more heads, using the form exp(-m d squared / 3) with d = 1/2, is at most exp(-25/6), about 0.0155. Check independence before you quote it.",
          "You size a repetition with that same bound. One trial of a test errs with probability 1/3, and you want a majority of independent trials to err with probability under 1/100. The error count has mean n/3. A threshold at half the trials is a relative excess of 1/2. At mean m = 60, hence n = 180, the bound exp(-m / 12) equals exp(-5), about 0.00674, under 1/100. Repetition, not a new test, is the mechanism.",
        ],
        {
          kind: "flow",
          caption: "How a Chernoff bound is assembled.",
          steps: [
            "Start from each flip",
            "Multiply the transforms",
            "Apply Markov",
            "Read the tail",
          ],
        },
        "100 fair coins",
        [
          "The mean is 50. You ask for the probability of at least 75 heads, a relative excess d = 1/2.",
          "The bound exp(-m * d * d / 3) becomes exp(-50 * 0.25 / 3) = exp(-25/6), about 0.0155.",
          "Chebyshev, with variance 25, only limits a deviation of 25 by 25/625 = 1/25. Chernoff is the tighter number here.",
        ],
        [
          {
            prompt: "200 fair coins. Use exp(-m d squared / 3) to bound the probability of at least 150 heads.",
            answer: "The mean m is 100 and the relative excess d is 1/2. The bound is exp(-100 * 0.25 / 3) = exp(-25/3), about 0.000240.",
          },
          {
            prompt: "A test errs with probability 1/3. You run 180 independent trials and take a majority. Is the Chernoff failure bound under 1/100?",
            answer: "Yes. The error count has mean 60. Crossing half the trials is a relative excess of 1/2, and exp(-60 / 12) = exp(-5), about 0.00674, which is under 1/100.",
          },
        ],
      ),
      lec(
        "l4",
        "Las Vegas and Monte Carlo",
        [
          "You classify an algorithm by what the coins may spoil. A Las Vegas algorithm always returns a correct answer, and the running time is the random piece. Randomized quicksort on 8 distinct keys is Las Vegas: every pivot sequence sorts the array, while the usual bound 2 n ln n is about 33 comparisons. A Monte Carlo algorithm stops on a fixed budget and may return a wrong answer. Name the class before you discuss speed.",
          "You shrink one-sided Monte Carlo error by repeating the test. Suppose a yes instance is accepted with probability at least 1/2, and a no instance is always rejected. Run the test 5 times and accept if any run accepts. A yes instance is missed on every run with probability at most 1/32. A no instance is never accepted. The time cost is a factor of 5, and the error on yes instances fell from 1/2 to 1/32.",
        ],
        {
          kind: "pair",
          caption: "What the coins are allowed to affect.",
          leftTitle: "Las Vegas",
          rightTitle: "Monte Carlo",
          left: [
            "Answer is always correct",
            "Time is the random part",
            "Quicksort on 8 keys",
          ],
          right: [
            "Time budget is fixed",
            "Answer may be wrong",
            "Repeat to shrink error",
          ],
        },
        "Five-fold one-sided amplification",
        [
          "One run accepts a yes instance with probability at least 1/2 and never accepts a no instance.",
          "You run the test 5 times and accept if any run accepts. A no instance produces 5 rejections.",
          "A yes instance misses every run with probability at most (1/2)^5 = 1/32. The time factor is 5.",
        ],
        [
          {
            prompt: "Same one-sided test, repeated 7 times, accept if any run accepts. What is the miss probability on a yes instance?",
            answer: "(1/2)^7 = 1/128.",
          },
          {
            prompt: "Is randomized quicksort on 8 keys Las Vegas or Monte Carlo, and what do the coins control?",
            answer: "Las Vegas. Every seed returns the sorted array. The coins choose pivots and affect the comparison count, whose usual bound is about 33, not the correctness.",
          },
        ],
      ),
      lec(
        "l5",
        "Universal hashing and chain length",
        [
          "You hash 4 keys into a table of 16 slots using a random function from a universal family. For any two fixed keys the probability they land in the same slot is at most 1/16. There are 6 unordered pairs, so the expected number of colliding pairs is at most 6/16, which is 3/8. Each pair contributes an indicator. Universality is the only property you used, and linearity sums the indicators even though pairs share keys.",
          "You compare that pair count with chain length under a fully random hash. Each of 4 keys picks one of 16 slots uniformly and independently. The expected number of keys in one fixed slot is 4/16, which is 1/4. A search for a stored key scans that one chain. Pair counts and chain lengths summarize the same throws differently. You charge the summary that matches the operation you are timing.",
        ],
        {
          kind: "layers",
          caption: "Two summaries of 4 keys hashed into 16 slots.",
          rows: [
            "4 keys into 16 slots",
            "6 pairs, at most 3/8 collisions",
            "One slot expects load 1/4",
          ],
        },
        "Pairs versus chains",
        [
          "A universal family puts any fixed pair in one slot with probability at most 1/16. Six pairs give expected collisions at most 6/16 = 3/8.",
          "A fully random hash puts each key in a uniform slot. One fixed slot then has expected load 4/16 = 1/4.",
          "One unlucky sample can still place 2 of the 4 keys together. The expectations do not forbid that sample.",
        ],
        [
          {
            prompt: "8 keys are hashed into 32 slots by a universal family. Upper-bound the expected number of colliding pairs.",
            answer: "There are 8*7/2 = 28 pairs. Each collides with probability at most 1/32, so the expectation is at most 28/32 = 7/8.",
          },
          {
            prompt: "Fully random hashing of those same 8 keys into 32 slots. What is the expected load of one fixed slot?",
            answer: "8/32 = 1/4.",
          },
        ],
      ),
      lec(
        "l6",
        "Contracting random edges for a min-cut",
        [
          "You search for a global min-cut by contracting random edges. While more than 2 vertices remain, you pick an edge uniformly, merge its endpoints, drop self-loops, and keep parallel edges. On n vertices the chance that one run preserves a fixed min-cut is at least 2/(n(n-1)). For n = 4 that lower bound is 2/12, which equals 1/6. A single run can destroy the cut. The quantity you compute is that failure probability.",
          "You amplify the weak run by independent repetition. For n = 4 the failure probability of one run is at most 5/6. Two independent runs both fail with probability at most 25/36, and you keep the smaller cut you found. In general, C(n,2) times ln n runs push the failure probability under 1/n, because (1 - 1/C(n,2)) raised to that power is at most 1/n. The mechanism is repetition of a Monte Carlo procedure.",
        ],
        {
          kind: "flow",
          caption: "One contraction run, then a repetition.",
          steps: [
            "Pick a uniform edge",
            "Merge the endpoints",
            "Stop at 2 vertices",
            "Keep the smaller cut",
          ],
        },
        "Two runs on 4 vertices",
        [
          "For n = 4 one run succeeds with probability at least 2/(4*3) = 1/6, so failure is at most 5/6.",
          "Two independent runs both fail with probability at most (5/6)^2 = 25/36.",
          "You keep the smaller cut. The chance at least one run succeeded is at least 1 - 25/36 = 11/36.",
        ],
        [
          {
            prompt: "n = 5. Lower-bound the success probability of one contraction run on a fixed min-cut.",
            answer: "2/(5*4) = 1/10.",
          },
          {
            prompt: "n = 4 and three independent runs, each failing with probability at most 5/6. Upper-bound the probability that all three fail.",
            answer: "(5/6)^3 = 125/216.",
          },
        ],
      ),
      lec(
        "l7",
        "Random cuts and conditional expectation",
        [
          "You cut a graph by placing each vertex on one side with a fair coin, independently. Any fixed edge crosses the cut with probability 1/2, because the second endpoint disagrees with the first half the time. On a graph with 10 edges, linearity makes the expected cut size 5. The optimum is at most 10, so this expectation is at least half the optimum. The coins are the whole algorithm. You do not list the partitions.",
          "You remove the coins with the method of conditional expectation. Fix vertices one by one. When you place vertex 3, compute the expected cut with that vertex on side A and on side B, leaving later vertices random. The two numbers average to the expectation you already hold, so one of them is at least 5 on the 10-edge graph. Keep that side. The final cut is deterministic and at least 5.",
        ],
        {
          kind: "pipeline",
          caption: "Conditional expectation removes one vertex of coins at a time.",
          stages: [
            "Compute both sides",
            "Keep the larger mean",
            "Fix the next vertex",
            "Finish at 5 or more",
          ],
        },
        "Derandomize a triangle",
        [
          "A triangle has 3 edges, so a fair random cut has expectation 3/2.",
          "Fix A on the left. If B is left, AB is uncut and random C contributes expected cut 1, total 1. If B is right, AB is cut and C still contributes 1, total 2. Keep B on the right.",
          "Either side for C then yields cut size 2, which is at least 3/2. The all-left assignment has cut 0 and is refused because the conditional expectation would drop.",
        ],
        [
          {
            prompt: "A graph has 20 edges. What is the expected cut under fair independent side assignments, relative to the optimum?",
            answer: "The expected size is 10. The optimum is at most 20, so 10 is at least half the optimum.",
          },
          {
            prompt: "The two conditional expectations for the next vertex are 7 and 5, and the current value is 6. What do you carry forward?",
            answer: "The options average to (7+5)/2 = 6, matching the current value. You keep the side with conditional expectation 7.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now prove about the coins",
        [
          "You can now pick a paradigm and finish the calculation. For a sum of indicators you write the expectation by linearity, even when the events share coins, as with records in 4 keys and with 10 cut edges. For a tail you choose Markov, Chebyshev, or Chernoff from what you know: a mean, a variance, or independent bits. For a Monte Carlo run that succeeds with probability only 1/6, you turn to repetition and multiply the failure bound.",
          "You can also say what the coins are allowed to spoil. Quicksort on 8 keys returns a sorted array on every seed, so it is Las Vegas and the bound near 33 is a time bound. One random cut of a 10-edge graph can miss the optimum, while the expectation 5 is a guarantee about the average sample. Your last distinction is the promise attached to the number: correctness every time, an expectation, or a tail.",
        ],
        {
          kind: "layers",
          caption: "The toolkit, from the coins to the promise.",
          rows: [
            "Indicators and linearity",
            "Markov, Chebyshev, or Chernoff",
            "Las Vegas or Monte Carlo",
            "Repeat a weak success probability",
          ],
        },
        "Repeat a 4-vertex min-cut run",
        [
          "On 4 vertices one contraction fails with probability at most 5/6.",
          "Two independent runs therefore fail together with probability at most 25/36. That product is the amplification step.",
          "The repeated procedure succeeds with probability at least 11/36. You multiplied failure bounds rather than re-deriving the contraction.",
        ],
        [
          {
            prompt: "Combine the min-cut success bound with amplification. One run on 4 vertices succeeds with probability at least 1/6. What is an upper bound on both of 2 independent runs failing?",
            answer: "Failure on one run is at most 5/6. Independence lets you multiply, so both fail with probability at most 25/36. At least one success then has probability at least 11/36.",
          },
          {
            prompt: "Combine the random cut with Markov. A fair cut of 10 edges has expected size 5. Let Y = 10 minus the cut size. Upper-bound the probability that the cut is empty.",
            answer: "Y is nonnegative and E[Y] = 5. An empty cut means Y = 10. Markov gives P(Y >= 10) at most 5/10 = 1/2.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-668",
    lectures: [
      lec(
        "l1",
        "Message passing, memory, and faults",
        [
          "You name the model before you name the algorithm. In the message-passing model, n processes exchange messages and hold no common variables. In the shared-memory model they read and write registers. A synchronous round lets every process send, receive, and update once. An asynchronous schedule may delay any message by any finite amount. With n = 5 and at most 1 crash, a proof written for one model does not transfer to the other.",
          "You also name the failure type, because the same five processes behave differently under it. A crash stops a process and leaves its last messages intact. A Byzantine process can send different contents to different neighbors. Fairness of the scheduler is a separate knob: you may assume every non-crashed process takes infinitely many steps, or you may allow a process to be postponed for 100 steps. Write those three choices at the top of the argument.",
        ],
        {
          kind: "layers",
          caption: "Write these choices before the protocol.",
          rows: [
            "Message passing or shared memory",
            "Synchronous or asynchronous steps",
            "Crash or Byzantine faults",
            "5 processes, at most 1 crash",
          ],
        },
        "Five processes, one crash",
        [
          "You set n = 5, message passing, asynchronous delivery, and at most 1 crash.",
          "A proof that assumes every message arrives in the same round does not apply, because the schedule may delay a message.",
          "A proof that allows forged Byzantine sends also does not apply. A crash does not invent messages. The model line is part of the claim.",
        ],
        [
          {
            prompt: "You have 5 processes and at most 1 crash, but the proof you found is about messages. Does it transfer to shared memory?",
            answer: "No. Shared memory uses registers, not in-flight messages. Matching n and the crash bound is not enough. You redo the argument in the memory model.",
          },
          {
            prompt: "A process stops, and every message it already sent stays as sent. What failure is that, and how many does the small model allow?",
            answer: "A crash, not a Byzantine fault. The small model allows at most 1 crash among 5 processes.",
          },
        ],
      ),
      lec(
        "l2",
        "Leader election on a ring",
        [
          "You elect a leader on a unidirectional ring of n processes with distinct numeric identifiers. Each process sends its identifier clockwise. A process that sees a smaller identifier swallows it. A process that sees a larger identifier forwards it. The largest identifier travels all the way around the ring and becomes the leader. In the worst order of identifiers the message count is n(n+1)/2. For n = 4 that count is 10.",
          "You can see those 10 messages when identifiers 1, 2, 3, and 4 are placed in the worst order. Identifier 4 travels 4 hops and returns to its owner, which is how that owner learns it is the leader. The smaller identifiers still contribute 1 + 2 + 3 hops before a larger identifier swallows them. No process has a global view. The ring edges and the numeric identifiers are the whole mechanism.",
        ],
        {
          kind: "flow",
          caption: "Election on a directed ring.",
          steps: [
            "Send your identifier",
            "Swallow a smaller one",
            "Forward a larger one",
            "Largest id returns home",
          ],
        },
        "Worst-case messages for n = 4",
        [
          "Identifiers are 1, 2, 3, and 4. The worst-case message total is 4*5/2 = 10.",
          "Identifier 4 travels 4 hops and returns. Its owner then knows it is the leader.",
          "The other identifiers contribute 1 + 2 + 3 = 6 hops before they are swallowed. Added to the 4 hops, the total is 10.",
        ],
        [
          {
            prompt: "A unidirectional ring has n = 6 processes with distinct identifiers. How many messages does the worst case send?",
            answer: "6*7/2 = 21.",
          },
          {
            prompt: "Identifier 9 is the largest on a ring of 4. How many hops does it travel before its owner knows?",
            answer: "It travels once around the ring, which is 4 hops, and the returning copy tells the owner it is the leader.",
          },
        ],
      ),
      lec(
        "l3",
        "Mutual exclusion for two processes",
        [
          "You implement mutual exclusion for 2 processes with Peterson's three shared variables: a flag for each process and one turn variable. A process raises its flag, sets turn to the other process, and waits while the other flag is raised and the turn still names the other process. Then it enters the critical section and lowers its flag on exit. The turn variable breaks the tie when both flags are raised. At most one process is inside.",
          "You check progress and bounded waiting on the same 2-process protocol. If both processes are waiting, the process not named by turn stops waiting, so one of them enters. After a process sets turn to the other, that other process enters at most once before the turn moves back. Those are the progress and waiting claims. Exclusion, progress, and waiting are three separate sentences, all carried by the same three registers.",
        ],
        {
          kind: "pair",
          caption: "Peterson's protocol for two processes.",
          leftTitle: "Shared variables",
          rightTitle: "Requirements",
          left: [
            "Two flags and one turn",
            "Wait while the other is favored",
            "Lower your flag on exit",
          ],
          right: [
            "At most one process inside",
            "Someone enters if both wait",
            "Overtake at most once",
          ],
        },
        "Both processes try at once",
        [
          "Process 0 and process 1 both raise flags. Process 0 writes turn = 1, then process 1 writes turn = 0.",
          "Process 0 waits only while turn names process 1. Turn is 0, so process 0 enters even though both flags are up.",
          "Process 1 waits while flag 0 is up and turn is 0. Exclusion holds. After process 0 lowers its flag, process 1 can enter.",
        ],
        [
          {
            prompt: "How many shared variables does this 2-process protocol use, and what are they?",
            answer: "Three: one flag for each process and one turn variable.",
          },
          {
            prompt: "Both flags are raised and turn names process 1. Which process may enter?",
            answer: "Process 1 may enter. Process 0 waits, because its wait condition is that the other flag is raised and turn names process 1.",
          },
        ],
      ),
      lec(
        "l4",
        "Logical clocks and happens-before",
        [
          "You order events with a logical clock when physical time is unavailable. Each process keeps an integer, starting at 0. A local step sets the clock to its current value plus 1. A send carries the sender clock. On receipt the receiver sets its clock to 1 plus the maximum of its own clock and the value in the message. If event a happens before event b, the clock of a is strictly smaller. The converse can fail.",
          "You can watch the rule on two processes and three events. Process P takes a step at clock 1, a second step at clock 2, and sends 2. Process Q is already at clock 5. On receipt Q sets its clock to max(5, 2) + 1, which equals 6. The clocks along this happens-before chain are 1, then 2, then 6. Equal clocks on different processes do not, by themselves, order those two events.",
        ],
        {
          kind: "pipeline",
          caption: "Lamport clock update on one message.",
          stages: [
            "Local step adds 1",
            "Send the clock value",
            "Receiver takes the max",
            "Then add 1",
          ],
        },
        "Clocks 1, 2, and 6",
        [
          "Process P steps from 0 to 1, then from 1 to 2, and sends the value 2.",
          "Process Q is already at 5. On receipt it computes max(5, 2) + 1 = 6.",
          "The chain of clocks is 1, then 2, then 6. Each event happens before the next. An equal clock on another process would not force an order.",
        ],
        [
          {
            prompt: "A receiver's clock is 4 and the message carries 4. What clock does the receive event get?",
            answer: "max(4, 4) + 1 = 5.",
          },
          {
            prompt: "Event a has clock 2, event b has clock 9, and a happens before b. Is that allowed, and does a larger clock prove happens-before?",
            answer: "It is allowed, because happens-before forces a strictly smaller clock. The converse fails: a larger clock does not by itself prove happens-before.",
          },
        ],
      ),
      lec(
        "l5",
        "Consistent snapshots",
        [
          "You record a global state with a snapshot that does not freeze the processes. Each process records its local state once and sends a marker on every outgoing channel. Channels are FIFO. If a process receives a marker on a channel and has not recorded yet, it records immediately, then sends its own markers. The recorded state plus the in-flight messages form the snapshot. For 3 processes each process emits 2 markers if the network is complete.",
          "You accept the snapshot only when the cut is consistent. If the cut contains a receive, it must contain the matching send. On a FIFO channel the marker separates those messages: anything sent before the marker belongs in the channel state, and anything sent after it does not. A cut that holds 1 receive and omits its send is illegal. A cut that holds the send and not yet the receive is allowed.",
        ],
        {
          kind: "flow",
          caption: "Marker rule on one FIFO channel.",
          steps: [
            "Record local state",
            "Send a marker",
            "Record the channel state",
            "Reject an illegal cut",
          ],
        },
        "One data message still in flight",
        [
          "Process P records its state and sends a marker. One earlier data message has not yet arrived at Q.",
          "Q receives the marker, records its local state, and records that data message as the channel contents.",
          "The cut contains the send and not the receive, which is allowed. A cut with the receive and without the send would be rejected.",
        ],
        [
          {
            prompt: "A cut contains 1 receive and omits the matching send. Is the snapshot consistent?",
            answer: "No. If the receive is in the cut, the matching send must be in the cut.",
          },
          {
            prompt: "How many markers does one process send in a complete network of 3 processes?",
            answer: "Each process has degree 2, so it sends 2 markers, one on each outgoing channel.",
          },
        ],
      ),
      lec(
        "l6",
        "Consensus under crash faults",
        [
          "You state consensus with three properties and one failure bound. Agreement says every non-faulty process that decides picks the same value. Validity says that if every process proposes the same bit, the decision is that bit. Termination says every non-faulty process decides. In a synchronous network with at most f crash faults, f + 1 rounds suffice. For f = 1 you run 2 rounds, because after a crash-free round the remaining views have met.",
          "You do not keep that round count when the network is asynchronous. With even 1 possible crash, no deterministic protocol gives agreement, validity, and termination on every schedule. The obstruction is a bivalent configuration: a state from which both decisions are still reachable. An adversary keeps the protocol inside bivalent states by delaying one process. Randomization or partial synchrony is how you leave that impossibility. Deterministic async consensus is not available.",
        ],
        {
          kind: "pair",
          caption: "Crash consensus in two timing models.",
          leftTitle: "Synchronous, f = 1",
          rightTitle: "Asynchronous, 1 crash",
          left: [
            "Decide in 2 rounds",
            "Flood the proposals",
            "Agreement and validity",
          ],
          right: [
            "Deterministic protocols fail",
            "Bivalent states remain",
            "Delay one process",
          ],
        },
        "Why 2 rounds when f = 1",
        [
          "In round 1 every process sends its proposal. One process may crash in that round, so some of its messages never arrive.",
          "Round 2 repeats the exchange. The bound f = 1 forbids a second crash, so this round lets the surviving views meet.",
          "Every non-faulty process then decides the same value. If every proposal was the bit 1, validity forces the decision 1.",
        ],
        [
          {
            prompt: "At most f = 3 crash faults in a synchronous network. How many rounds suffice?",
            answer: "f + 1 = 4 rounds.",
          },
          {
            prompt: "Why can a deterministic asynchronous protocol not guarantee all three consensus properties if 1 crash is possible?",
            answer: "An adversary can hold the execution in a bivalent state by delaying one process, so the protocol cannot decide without risking disagreement or an invalid bit.",
          },
        ],
      ),
      lec(
        "l7",
        "Byzantine counts and quorums",
        [
          "You count processes before you promise Byzantine agreement. With oral messages and at most f traitors, you need at least 3f + 1 processes. For f = 1 that number is 4. With only 3 processes a traitor can show one honest process a command to attack and the other a command to retreat, and the honest processes cannot tell who lied. Crash faults are cheaper: a majority is enough to pick a value already proposed, because two majorities intersect.",
          "You store that intersection with quorums in shared memory. For n = 5 a majority quorum has size 3, because floor(5/2) + 1 = 3. Any two quorums share at least one process, since 3 + 3 - 5 = 1. A writer deposits a value and a timestamp at one quorum. A reader queries a quorum and keeps the largest timestamp. That intersection of 1 is why the reader cannot miss the latest completed write.",
        ],
        {
          kind: "layers",
          caption: "Headcount depends on the fault you named.",
          rows: [
            "Byzantine f = 1 needs 4",
            "Three processes can be fooled",
            "Majority of 5 is 3",
            "Two quorums share 1 process",
          ],
        },
        "A write and a read on 5 processes",
        [
          "A writer stores a value with timestamp 8 at a quorum of 3 processes.",
          "A reader contacts another quorum of 3. The two sets intersect in at least 3 + 3 - 5 = 1 process.",
          "That shared process still holds timestamp 8, so the reader returns the value stamped 8 rather than an older write.",
        ],
        [
          {
            prompt: "At most f = 2 Byzantine traitors, oral messages. What is the smallest n the bound allows?",
            answer: "3*2 + 1 = 7.",
          },
          {
            prompt: "n = 5. What is the majority quorum size, and what is the least intersection of two such quorums?",
            answer: "The quorum size is floor(5/2) + 1 = 3. Two quorums intersect in at least 3 + 3 - 5 = 1 process.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now check on a small system",
        [
          "You can now match a problem to a model and finish a small proof. On a ring of 4 processes you can count leader-election messages up to the worst case of 10. For 2 processes you can check exclusion, progress, and bounded waiting on three shared variables. You can assign Lamport clocks, reject an inconsistent cut, and separate the synchronous crash bound of f + 1 rounds from the asynchronous impossibility with 1 crash.",
          "You can also move between failures and memory. A Byzantine bound of 4 processes for 1 traitor is a different budget from a crash quorum of 3 out of 5. The skill is to write the assumptions in one line, run the mechanism on a tiny system, and say which property holds: a unique leader, a consistent snapshot, or a decision that honest processes share. Larger systems use the same invariants with a bigger n.",
        ],
        {
          kind: "flow",
          caption: "From the model line to a property you can check.",
          steps: [
            "State n and the faults",
            "Run the small mechanism",
            "Check the invariant",
            "Name the property",
          ],
        },
        "Clocks witness a bad snapshot",
        [
          "A send has Lamport clock 4 and its receive has clock 7, so the send happens before the receive.",
          "A proposed cut includes the receive and omits the send.",
          "The snapshot rule forbids that cut. The clocks 4 and 7 witness that the missing send is ordered before the included receive.",
        ],
        [
          {
            prompt: "Combine logical clocks with snapshot consistency. A send is stamped 4 and its receive is stamped 7. The cut includes the receive and omits the send. Why is the cut illegal?",
            answer: "The clocks 4 then 7 witness happens-before along the message, so the send is ordered before the receive. A consistent cut that contains the receive must also contain that send. This cut fails the rule.",
          },
          {
            prompt: "Combine the synchronous crash bound with the Byzantine headcount. For f = 1, how many synchronous crash rounds suffice, and how many processes do oral-message Byzantine agreement need?",
            answer: "Crash faults in synchrony take f + 1 = 2 rounds. Byzantine oral messages need 3*1 + 1 = 4 processes. The round count is not a substitute for the headcount.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-669",
    lectures: [
      lec(
        "l1",
        "Polyhedra and linear objectives",
        [
          "You treat a combinatorial search as a linear program on a polyhedron. The feasible set is every vector x with A x <= b. A vertex is a point where enough inequalities are equalities to pin the coordinates. Maximize x + y subject to x + y <= 3, x <= 2, y <= 2, and both variables at least 0. The optimum value is 3, and every optimal point lies on the edge where x + y = 3.",
          "You do not need every point of that edge. A linear objective on a nonempty bounded polyhedron attains its optimum at a vertex, so you can restrict attention to vertices. Here the vertices include (0,0), (2,0), (0,2), and the objective values are 0, 2, and 2. The edge from (1,2) to (2,1) is optimal, and both of those corners give value 3. The mechanism is the vertex claim, which lets you stop searching the interior.",
        ],
        {
          kind: "layers",
          caption: "A linear program is a polyhedron plus an objective.",
          rows: [
            "Inequalities A x <= b",
            "Vertices pin coordinates",
            "Objective x + y",
            "Optimum value is 3",
          ],
        },
        "Maximize x + y",
        [
          "Constraints: x + y <= 3, x <= 2, y <= 2, and both variables at least 0.",
          "The point (2, 1) is feasible and scores 3. The point (2, 2) scores 4 but violates x + y <= 3.",
          "Every optimal point lies on x + y = 3 between (1, 2) and (2, 1). Both of those corners score 3.",
        ],
        [
          {
            prompt: "Is (0, 3) feasible for x + y <= 3, x <= 2, y <= 2, x and y at least 0? What value does (2, 1) have?",
            answer: "(0, 3) violates y <= 2, so it is not feasible. (2, 1) meets every inequality and scores 2 + 1 = 3.",
          },
          {
            prompt: "Why may you look only at vertices for a linear objective on a nonempty bounded polyhedron?",
            answer: "The optimum is attained at a vertex, so no interior point beats every vertex.",
          },
        ],
      ),
      lec(
        "l2",
        "Flows, cuts, and three augmentations",
        [
          "You move flow on edges that have capacities. A feasible flow stays between 0 and the capacity on each edge and balances at every vertex except the source and the sink. An augmenting path still has spare capacity on every edge. If the source has two outgoing edges of capacities 3 and 2, no flow exceeds 5. A cut of capacity 5 matching a flow of 5 proves optimality, because the max flow equals the min cut.",
          "You reach that value 5 by three pushes. Use edges source to u of capacity 3, source to v of capacity 2, u to sink of capacity 2, v to sink of capacity 3, and u to v of capacity 1. Push 2 on source, u, sink. Push 2 on source, v, sink. Push 1 on source, u, v, sink. The cut around the source has capacity 3 + 2 = 5. Flow and cut match, so 5 is optimal.",
        ],
        {
          kind: "pipeline",
          caption: "Augment until the flow matches a cut.",
          stages: [
            "Push 2 through u",
            "Push 2 through v",
            "Push 1 through u, v",
            "Match the source cut",
          ],
        },
        "Three pushes, value 5",
        [
          "Push 2 on source, u, sink. Push 2 on source, v, sink. Push 1 on source, u, v, sink.",
          "The shipped value is 2 + 2 + 1 = 5.",
          "The source cut has capacity 3 + 2 = 5. Equal numbers mean the flow is maximum and the cut is minimum.",
        ],
        [
          {
            prompt: "After the first push of 2 along source, u, sink, what residual capacity remains on source to u, and on u to sink?",
            answer: "Source to u started at 3, so 1 remains. u to sink started at 2, so 0 remains.",
          },
          {
            prompt: "Why does a feasible cut of capacity 5 prove that a feasible flow of value 5 is optimal?",
            answer: "No flow can exceed a cut, and the maximum flow equals the minimum cut. Matching numbers leave a gap of 0.",
          },
        ],
      ),
      lec(
        "l3",
        "Bipartite matching and Konig",
        [
          "You model an assignment as a matching in a bipartite graph. A matching is a set of edges that share no vertex. An augmenting path starts and ends at a free vertex and alternates between unused and used edges. Replacing used edges by unused edges along that path raises the matching size by 1. With 4 vertices on each side, a perfect matching has size 4, so you need 4 successful augmentations from the empty matching.",
          "You stop when no augmenting path remains. In a bipartite graph, Konig's theorem says the maximum matching size equals the minimum vertex cover size. Take left vertices A and B and right vertices 1, 2, and 3, with edges A-1, A-2, B-2, and B-3. The matching A-1 together with B-3 has size 2. The set {A, B} is a cover of size 2. Equal numbers mean both answers are optimal.",
        ],
        {
          kind: "flow",
          caption: "Grow a matching along one alternating path.",
          steps: [
            "Start at a free vertex",
            "Alternate unused and used",
            "Flip along the path",
            "Size grows by 1",
          ],
        },
        "A matching and a cover of size 2",
        [
          "Edges are A-1, A-2, B-2, and B-3. Start from the empty matching.",
          "Add A-1. Then B and 3 are free, so add B-3. The matching has size 2.",
          "The cover {A, B} also has size 2. Konig's theorem says the matching is maximum.",
        ],
        [
          {
            prompt: "On the same graph, is {A-2, B-3} a matching, and what is its size?",
            answer: "Yes. A-2 and B-3 share no vertex, so the size is 2, equal to the minimum cover.",
          },
          {
            prompt: "You have a matching of size 3 in a bipartite graph with 4 vertices on each side. How many further augmentations produce a perfect matching?",
            answer: "A perfect matching has size 4, so you need 4 - 3 = 1 more successful augmentation.",
          },
        ],
      ),
      lec(
        "l4",
        "Matroids and greedy choice",
        [
          "You call a family of sets a matroid when two rules hold. Every subset of an independent set is independent. If one independent set is larger than another, some element of the larger one can be added to the smaller one without leaving the family. Forests in a graph form a graphic matroid. A forest on 6 vertices has at most 5 edges, and you may add any edge that does not close a cycle.",
          "You optimize linear weights by sorting and adding. Order elements by weight, high to low, and add one when the set stays independent. On a uniform matroid of rank 2 with weights 6, 4, and 1, you take 6, then 4, and you reject 1. The total is 10. No independent set scores higher. The same exchange rule is Kruskal's algorithm when the independent sets are the forests of a graph.",
        ],
        {
          kind: "pair",
          caption: "Exchange is why greedy can commit.",
          leftTitle: "Uniform rank 2",
          rightTitle: "Greedy takes",
          left: [
            "Weights 6, 4, and 1",
            "At most 2 elements",
            "Best total is 10",
          ],
          right: [
            "Sort high to low",
            "Take 6, then 4",
            "Reject 1",
          ],
        },
        "Greedy on weights 6, 4, and 1",
        [
          "Rank 2 forbids every set of size 3. Sort the weights as 6, then 4, then 1.",
          "Add 6. Add 4. The set of those two weights is independent and full.",
          "Reject 1. The total is 10. The rival pair of weights 6 and 1 totals 7, and 4 and 1 totals 5.",
        ],
        [
          {
            prompt: "Same uniform matroid of rank 2, with weights 9, 8, and 7. What does greedy return?",
            answer: "It takes 9 and 8, rejects 7, and the total is 17. That is the best pair.",
          },
          {
            prompt: "A forest on 6 vertices already has 5 edges. May you add another edge and stay in the graphic matroid?",
            answer: "No. A forest on 6 vertices has at most 5 edges. One more edge closes a cycle.",
          },
        ],
      ),
      lec(
        "l5",
        "Integral vertices",
        [
          "You get integer optima from a linear program when the polyhedron is integral. A matrix is totally unimodular when every square submatrix has determinant 0, 1, or -1. If A is totally unimodular and b is integer, the vertices of the polyhedron defined by A x <= b and x >= 0 are integer. The vertex-edge incidence matrix of a bipartite graph has this property. That is why the bipartite matching linear program returns a 0-1 vector at a vertex.",
          "You can see an integral vertex on a one-constraint program. Maximize x + y subject to x + y <= 1, with x and y at least 0. The vertices are (0,0), (1,0), and (0,1), and the optimum value is 1. The point (1/2, 1/2) is feasible and also has value 1, but it is not a vertex. An integral polyhedron may contain fractional points. The promise is that some optimum is a vertex, and that vertex has integer coordinates.",
        ],
        {
          kind: "layers",
          caption: "Integrality is a promise about vertices.",
          rows: [
            "Totally unimodular matrix",
            "Integer right-hand side",
            "An integer optimum vertex",
            "Fractional points may remain",
          ],
        },
        "Vertices of x + y <= 1",
        [
          "Maximize x + y subject to x + y <= 1, with x and y at least 0.",
          "The vertices are (0,0), (1,0), and (0,1). Each is integer, and the best value is 1.",
          "The midpoint (1/2, 1/2) is feasible and also scores 1, but it is not a vertex. Integrality does not ban that midpoint.",
        ],
        [
          {
            prompt: "List the vertices of x + y <= 1 with x and y at least 0, and give the maximum of x + y.",
            answer: "The vertices are (0,0), (1,0), and (0,1). The maximum is 1.",
          },
          {
            prompt: "Why does total unimodularity of the bipartite incidence matrix matter for matching?",
            answer: "With an integer right-hand side, every vertex is integer, so a vertex solution of the matching linear program is a 0-1 matching.",
          },
        ],
      ),
      lec(
        "l6",
        "Rounding a cover",
        [
          "You approximate vertex cover by rounding a linear program. For each edge the endpoint variables sum to at least 1, each variable lies between 0 and 1, and you minimize their sum. Set a variable to 1 when its value is at least 1/2, and to 0 otherwise. Every edge then has a selected endpoint, so the result is a cover. Each selected 1 is at most twice the fractional value it replaces, which is a factor of 2.",
          "You watch that factor on a triangle. The linear program sets each of the 3 variables to 1/2 and scores 3/2. Rounding at 1/2 selects all 3 vertices. An integral optimum has size 2, since one vertex leaves an edge uncovered. Against the linear-program value the ratio is 3 divided by 3/2, which equals 2. Against the integral optimum the ratio on this graph is 3/2. The guarantee you prove for every graph is still 2.",
        ],
        {
          kind: "pipeline",
          caption: "Round a fractional cover up to an integral cover.",
          stages: [
            "Solve the cover LP",
            "Threshold at 1/2",
            "Keep those vertices",
            "Factor at most 2",
          ],
        },
        "Triangle, LP value 3/2",
        [
          "Each edge forces two variables to sum to at least 1. Setting each of the 3 variables to 1/2 scores 3/2.",
          "Rounding at 1/2 selects all 3 vertices.",
          "An integral optimum has size 2. The returned cover has size 3. The general argument still claims only a factor of 2.",
        ],
        [
          {
            prompt: "The fractional optimum is 3/2 and rounding returns 3 vertices. What is the ratio to the fractional value?",
            answer: "3 / (3/2) = 2.",
          },
          {
            prompt: "An edge has fractional endpoints 0.7 and 0.3. Which endpoint does the 1/2 rule select, and is the edge covered?",
            answer: "It selects 0.7 and drops 0.3. The edge is covered because 0.7 is at least 1/2.",
          },
        ],
      ),
      lec(
        "l7",
        "Dual certificates",
        [
          "You certify optimality with a dual program. If the primal maximizes a linear function over A x <= b and x >= 0, the dual minimizes a linear function of nonnegative multipliers on those inequalities. Weak duality says every dual-feasible value is at least every primal-feasible value. Maximize 2x subject to x <= 4 and x >= 0. The primal optimum is 8. The dual minimizes 4y subject to y >= 2, and its optimum is also 8.",
          "You treat a gap as unfinished work. A primal value of 6 and a dual value of 8 only pin the optimum to the interval from 6 to 8. Equal numbers are the certificate. On the program that maximizes 2x with x <= 4, the point x = 4 scores 8 and the dual point y = 2 scores 8. Both are optimal. The mechanism is one feasible dual solution, not a second search through primal vertices.",
        ],
        {
          kind: "pair",
          caption: "Equal primal and dual values close the gap.",
          leftTitle: "Primal",
          rightTitle: "Dual",
          left: ["Maximize 2x", "Constraint x <= 4", "Best value 8"],
          right: ["Minimize 4y", "Constraint y >= 2", "Best value 8"],
        },
        "Close the gap at 8",
        [
          "The primal point x = 4 is feasible and scores 2*4 = 8.",
          "The dual point y = 2 is feasible and scores 4*2 = 8.",
          "Weak duality says no primal value exceeds a dual value. Since both equal 8, both are optimal.",
        ],
        [
          {
            prompt: "You hold a primal value of 6 and a dual value of 8. What do you know about the optimum?",
            answer: "It lies between 6 and 8. The gap is 8 - 6 = 2, so you cannot yet call either number optimal.",
          },
          {
            prompt: "For maximize 2x subject to x <= 4, which primal and dual points certify optimality, and at what common value?",
            answer: "x = 4 and y = 2. Both score 8, so the optimum is 8.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now certify",
        [
          "You can now cast a combinatorial question as a polyhedron and say what that buys. A flow of 5 matched by a cut of 5 is optimal. A bipartite matching of size 2 matched by a cover of size 2 is optimal. A matroid greedy total of 10 is optimal by exchange. A totally unimodular matrix lets you trust an integer vertex. Without that property, rounding still yields a proved factor, such as 2 for vertex cover.",
          "You can also stop a solver with a dual certificate. A primal value and a dual value that both equal 8 leave no gap. A primal value of 6 against a dual value of 8 leaves a gap of 2, so you do not claim optimality yet. The practice is to write the inequalities, name the algorithm that walks them, and attach either an exact identity, such as max flow equals min cut, or an explicit approximation factor.",
        ],
        {
          kind: "flow",
          caption: "What you can now attach to a feasible solution.",
          steps: [
            "Write the inequalities",
            "Run the algorithm",
            "Match a cut or a dual",
            "Or state the factor",
          ],
        },
        "A matching cut beside a rounded cover",
        [
          "A feasible flow has value 5 and the source cut has capacity 5, so the flow is optimal.",
          "On the triangle, the cover linear program scores 3/2 and rounding returns 3 vertices.",
          "The ratio of 3 to 3/2 is 2. You use a matching cut when you have one, and the factor when the vertex you want is not integral.",
        ],
        [
          {
            prompt: "Combine max flow with weak duality. A flow of value 5 is feasible and a cut has capacity 7. Can you call the flow optimal, and what cut capacity would finish the proof?",
            answer: "No. Capacity 7 only shows the optimum is at most 7, the same way a dual value of 8 only upper-bounds a primal 6. A cut of capacity 5, equal to the flow, would prove optimality.",
          },
          {
            prompt: "Combine Konig with rounding. A bipartite matching of size 2 gives a cover of size 2. On a triangle, rounding returns 3 vertices against integral optimum 2. What is that ratio, and why did Konig not apply?",
            answer: "The ratio is 3/2. Konig requires a bipartite graph. A triangle is not bipartite, so you use the factor-2 rounding bound instead.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-717",
    lectures: [
      lec(
        "l1",
        "Pure equilibrium and dominance",
        [
          "You describe a finite game by players, actions, and payoffs. In a 2-player game each cell holds two numbers, one payoff for the row player and one for the column player. A pure Nash equilibrium is a cell where neither player gains by switching alone. With cooperation paying 2 and mutual defection paying 1, defection is still the only equilibrium when a lone defector scores 3 and the cooperator scores 0.",
          "You find that cell by dominance. If both cooperate, each scores 2. If you alone defect, you score 3 and the other scores 0. If both defect, each scores 1. Defection raises your score from 2 to 3 against cooperation and from 0 to 1 against defection. The unique pure equilibrium is mutual defection, payoff 1 each, even though both players prefer the pair where each scores 2.",
        ],
        {
          kind: "pair",
          caption: "Dominance picks the dilemma cell.",
          leftTitle: "Both cooperate",
          rightTitle: "Both defect",
          left: ["Each scores 2", "A loner can reach 3", "Not an equilibrium"],
          right: ["Each scores 1", "A switch scores 0", "Pure equilibrium"],
        },
        "Payoff when you alone defect",
        [
          "Both cooperate: each gets 2. You switch to defection: you get 3 and the other gets 0.",
          "Both already defect: each gets 1. If you alone cooperate, your score falls from 1 to 0.",
          "Defection is better against either action of the other player. The equilibrium pays 1 each, below the 2 each would earn by cooperating.",
        ],
        [
          {
            prompt: "Both players cooperate and score 2. You defect and score 3. What is your gain, and what does it show?",
            answer: "The gain is 3 - 2 = 1. A one-step gain shows that mutual cooperation is not a pure Nash equilibrium.",
          },
          {
            prompt: "Is mutual defection, payoff 1 each, a pure Nash equilibrium in this table?",
            answer: "Yes. A player who switches alone moves from 1 to 0, so neither gains by deviating.",
          },
        ],
      ),
      lec(
        "l2",
        "Mixed strategies",
        [
          "You allow a mixed strategy when no pure cell is stable. A mixed strategy assigns a probability to each of your actions. In matching pennies each player calls heads or tails. Matching pennies pays the row player 1 when the calls agree and -1 when they differ. The column player receives the opposite number. Every pure cell has a one-step gain for somebody, so no pure equilibrium exists. A distribution over calls is required.",
          "You solve the mixture by making the opponent indifferent. Let the row player call heads with probability p. The column player then scores 1 - 2p by calling heads and 2p - 1 by calling tails. Set those payoffs equal and you obtain p = 1/2. The symmetric calculation forces the column player to use probability 1/2 as well. Each player expects payoff 0 at this equilibrium, and neither can rise above 0 by a unilateral change.",
        ],
        {
          kind: "flow",
          caption: "Indifference fixes the mixture.",
          steps: [
            "Let row play heads at p",
            "Equate the column payoffs",
            "Solve and get p = 1/2",
            "Expected payoff is 0",
          ],
        },
        "Matching pennies at 1/2",
        [
          "If row plays heads with probability p, column scores 1 - 2p by calling heads and 2p - 1 by calling tails.",
          "Set 1 - 2p equal to 2p - 1. Then 2 = 4p, so p = 1/2.",
          "Column also plays 1/2. Each player expects 0, and any pure call against 1/2 still expects 0.",
        ],
        [
          {
            prompt: "Row plays heads with probability 1/2. What does column expect from calling heads, and from calling tails?",
            answer: "Heads scores 1 - 2*(1/2) = 0. Tails scores 2*(1/2) - 1 = 0.",
          },
          {
            prompt: "Why is the cell where both players call heads not a pure equilibrium?",
            answer: "The calls match, so column receives -1 and can switch to tails to receive +1. That deviation gains 2.",
          },
        ],
      ),
      lec(
        "l3",
        "Price of anarchy on two roads",
        [
          "You measure inefficiency by the price of anarchy. Send one unit of traffic through Pigou's two-road network. One road has latency 1 no matter the load. The other has latency equal to its load x. Selfish drivers all choose the second road, since its latency stays below 1 until the load hits 1. At that equilibrium every driver has latency 1, so total cost is 1. No driver gains by switching onto the constant road.",
          "You compare that cost with an optimal split of the same unit. Put 1/2 of the traffic on each road. The constant road contributes cost 1/2. The load-dependent road has latency 1/2 and carries 1/2, contributing (1/2)*(1/2) = 1/4. Total optimal cost is 3/4. The price of anarchy is equilibrium cost over optimal cost, 1 divided by 3/4, which equals 4/3. This two-road network meets that ratio.",
        ],
        {
          kind: "layers",
          caption: "Price of anarchy on one unit of traffic.",
          rows: [
            "One unit of traffic",
            "Equilibrium cost is 1",
            "Optimal cost is 3/4",
            "Ratio is 4/3",
          ],
        },
        "Split the unit in half",
        [
          "At equilibrium all traffic uses the road of latency x. The load is 1 and the cost is 1.",
          "Send 1/2 on the constant road, contribution 1/2, and 1/2 on the other road, contribution (1/2)*(1/2) = 1/4.",
          "Optimal cost is 1/2 + 1/4 = 3/4. Divide 1 by 3/4 to get the price of anarchy 4/3.",
        ],
        [
          {
            prompt: "Equilibrium cost is 1 and optimal cost is 3/4. What is the price of anarchy?",
            answer: "1 / (3/4) = 4/3.",
          },
          {
            prompt: "If you send the whole unit on the constant road, what is the total cost, and how does it compare with the optimum 3/4?",
            answer: "The latency is 1 on the whole unit, so the cost is 1. That is worse than 3/4 by 1 - 3/4 = 1/4.",
          },
        ],
      ),
      lec(
        "l4",
        "A voting cycle",
        [
          "You test a social choice rule on 3 candidates. A Condorcet winner would beat every other candidate by a head-to-head majority. Three voters can stop that from happening. Voter 1 ranks A over B over C. Voter 2 ranks B over C over A. Voter 3 ranks C over A over B. A majority prefers A to B, B to C, and C to A, each by 2 votes to 1. The pairwise tournament is a cycle of length 3.",
          "You should not expect one rule to kill every cycle and still meet the usual axioms. Arrow's theorem says that once there are 3 or more candidates, a rule defined on every ranking profile, respecting unanimous pairwise wins, and ignoring irrelevant alternatives, must be a dictatorship. The 3-voter cycle is the obstruction you can write by hand. Exhibiting that cycle comes before any attempt to reconstruct the full proof.",
        ],
        {
          kind: "flow",
          caption: "Three majority votes, and no winner.",
          steps: [
            "A beats B by 2 to 1",
            "B beats C by 2 to 1",
            "C beats A by 2 to 1",
            "No Condorcet winner",
          ],
        },
        "Count the three majorities",
        [
          "A over B: voters 1 and 3 against voter 2, so 2 to 1.",
          "B over C: voters 1 and 2 against voter 3, so 2 to 1.",
          "C over A: voters 2 and 3 against voter 1, so 2 to 1. Each candidate loses one contest.",
        ],
        [
          {
            prompt: "How many of these 3 voters prefer A to B, and how many prefer B to A?",
            answer: "Voters 1 and 3 prefer A to B, so 2. Voter 2 prefers B to A, so 1.",
          },
          {
            prompt: "For 3 or more candidates, what does Arrow's theorem conclude about a rule that meets the axioms named in the lecture?",
            answer: "The rule must be a dictatorship. The 3-voter cycle is the pairwise obstruction you can check by hand.",
          },
        ],
      ),
      lec(
        "l5",
        "The second-price auction",
        [
          "You sell one indivisible item with a second-price auction. Each bidder submits one number. The highest bidder wins and pays the second-highest bid. With bids 9 and 5, the winner pays 5. If 9 is that winner's true value, utility is 9 - 5 = 4, while losing pays utility 0. The payment rule is the mechanism. It, rather than a request to be honest, makes the true value a dominant strategy.",
          "You check the claim by testing a lie when your value is 9. Against a competing bid of 5, bidding 4 loses and your utility drops from 4 to 0. Bidding 12 still wins and still pays 5, so utility stays 4. Against a competing bid of 10, truthful bidding loses and scores 0. A bid of 12 wins, pays 10, and scores 9 - 10 = -1. The true bid avoids that negative utility. The other bidder may lie.",
        ],
        {
          kind: "pipeline",
          caption: "Second price charges the runner-up bid.",
          stages: [
            "Collect the two bids",
            "Highest bid wins",
            "Charge the second bid",
            "Utility is value minus 5",
          ],
        },
        "Bids 9 and 5",
        [
          "The high bidder wins and pays 5, not 9.",
          "If 9 is the true value, utility is 9 - 5 = 4. Losing would score 0.",
          "Bidding 4 against the competing bid 5 loses, so utility falls from 4 to 0. Bidding the true 9 was better.",
        ],
        [
          {
            prompt: "Your value is 9 and the other bid is 10. What is your utility if you bid 9, and if you bid 12?",
            answer: "Bidding 9 loses, utility 0. Bidding 12 wins and pays 10, utility 9 - 10 = -1. The truthful bid is better.",
          },
          {
            prompt: "Bids are 9 and 5, and 9 is the true value. What does the winner pay, and what is the utility?",
            answer: "The winner pays the second price, 5. Utility is 9 - 5 = 4.",
          },
        ],
      ),
      lec(
        "l6",
        "A Vickrey-Clarke-Groves charge",
        [
          "You price bundles with the Vickrey-Clarke-Groves mechanism. Choose an allocation of maximum reported value, then charge each agent the harm imposed on the others. There are 2 items and 3 bidders. Bidder 1 values the pair at 15 and either single item at 0. Bidder 2 values item A at 6. Bidder 3 values item B at 6. Awarding both items to bidder 1 scores 15. Splitting the items scores 12, so the pair goes to bidder 1.",
          "You read bidder 1's payment off that comparison. Without bidder 1 the best reported value is 12. Inside the chosen allocation the other bidders receive value 0. The Clarke charge is 12 - 0 = 12, and bidder 1's utility is 15 - 12 = 3. Bidders 2 and 3 get no item and pay 0. Removing either of them leaves the efficient award unchanged, so their charge stays 0. Truthful reporting of 15 is a dominant strategy.",
        ],
        {
          kind: "layers",
          caption: "Clarke payment for the bundle winner.",
          rows: [
            "Pair value 15 beats 12",
            "Others would score 12",
            "Charge is 12",
            "Utility is 3",
          ],
        },
        "Charge the bundle winner 12",
        [
          "Award both items to bidder 1 because 15 beats the split value 12.",
          "Without bidder 1 the others score 12. In the chosen award they score 0. The payment is 12 - 0 = 12.",
          "Utility is 15 - 12 = 3. Bidders 2 and 3 pay 0.",
        ],
        [
          {
            prompt: "The chosen bundle scores 15 and the best allocation without bidder 1 scores 12. What are bidder 1's payment and utility?",
            answer: "Payment is 12 - 0 = 12. Utility is 15 - 12 = 3.",
          },
          {
            prompt: "Why do bidders 2 and 3 pay 0 in this example?",
            answer: "Removing either one still awards both items to bidder 1, so each imposes harm 0 and the Clarke charge is 0.",
          },
        ],
      ),
      lec(
        "l7",
        "Existence versus search",
        [
          "You should not treat equilibrium existence as a cheap algorithm. Finding a mixed Nash equilibrium of a finite game is PPAD-complete. Solutions exist, because a continuous map from the mixed-strategy simplex to itself has a fixed point, and a fixed point is an equilibrium. Completeness means a polynomial algorithm for every such search would solve the rest of that class. The 2-player case stays PPAD-complete.",
          "You can still finish a tiny game by listing supports. A support is the set of actions used with positive probability. Two players with 3 actions each have 7 nonempty supports per player and therefore 49 support pairs. For one pair you solve a linear system: the opponent is indifferent inside the support and does not prefer to leave it. Matching pennies, with 2 actions, needs only a few systems. The step from 2 actions to 3 produces 49 pairs.",
        ],
        {
          kind: "pair",
          caption: "Existence and search are different claims.",
          leftTitle: "Why one exists",
          rightTitle: "Why listing is costly",
          left: [
            "A map on the simplex",
            "Some fixed point",
            "That point is equilibrium",
          ],
          right: [
            "2 players stay PPAD-complete",
            "7 supports at 3 actions",
            "49 support pairs",
          ],
        },
        "Count the support pairs",
        [
          "Each player has 3 actions, so 2^3 - 1 = 7 nonempty supports.",
          "Two players give 7 * 7 = 49 support pairs.",
          "Each pair is one linear system. Matching pennies has 2 actions per player and far fewer systems.",
        ],
        [
          {
            prompt: "Two players have 3 actions each. How many nonempty supports does one player have, and how many pairs is that?",
            answer: "One player has 2^3 - 1 = 7 nonempty supports. The number of pairs is 7*7 = 49.",
          },
          {
            prompt: "Does PPAD-completeness for 2-player Nash mean an equilibrium might fail to exist?",
            answer: "No. A fixed point of the mixed-strategy map still gives an equilibrium. Completeness is about the difficulty of the search.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now claim with a number",
        [
          "You can now start from a payoff table and finish with a number. You can name the dilemma equilibrium in which each player scores 1, and the matching-pennies equilibrium in which each player uses probability 1/2 and expects 0. You can compute the price of anarchy 4/3 for one unit of traffic on the two-road network. You can write the 3-voter cycle that blocks a Condorcet winner, and you can settle a one-item auction.",
          "You can also separate a mechanism from a bare equilibrium. With bids 9 and 5, the second-price winner pays 5 and truthful bidding is dominant. In the two-item Vickrey-Clarke-Groves game the bundle winner pays 12 and keeps utility 3. You also know that 3 actions per player already give 49 support pairs, so a proof that an equilibrium exists is not the same object as a cheap procedure that returns one.",
        ],
        {
          kind: "layers",
          caption: "Numbers you can now defend.",
          rows: [
            "Equilibrium payoffs 1 and 0",
            "Road ratio 4/3",
            "Payments 5 and 12",
            "49 pairs are not an algorithm",
          ],
        },
        "A cycle beside a payment",
        [
          "The 3 voters make A beat B, B beat C, and C beat A, each by 2 to 1, so there is no Condorcet winner.",
          "The second-price auction with bids 9 and 5 does name a winner, and that winner pays 5.",
          "Pairwise majority can cycle. A payment rule can still select one bidder. You keep those conclusions separate.",
        ],
        [
          {
            prompt: "Combine the two-road ratio with the auction payment. Costs 1 and 3/4 give price of anarchy 4/3, and bids 9 and 5 charge 5. Which number is a ratio of travel costs, and which is a payment?",
            answer: "4/3 is 1 divided by 3/4, a ratio of travel costs. The charge 5 is the second bid. You do not fold the payment into the road ratio.",
          },
          {
            prompt: "Combine the voting cycle with the bundle mechanism. The 3-voter profile has no Condorcet winner, but the bundle auction selects value 15 and charges 12. Why can the mechanism name a winner?",
            answer: "It maximizes a number, and 15 beats 12, then charges the harm 12. The majority tournament only stores pairwise votes of 2 to 1, and those votes cycle, so they name nobody.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-727",
    lectures: [
      lec(
        "l1",
        "One pass and a majority counter",
        [
          "You process a stream when the data will not fit in working memory. Items arrive once, in order, and you may store only a small summary. A counter of the length uses a logarithmic number of bits and, after 1000 items, holds 1000. The interesting summaries answer a harder question with fewer bits than the raw list. Before you design one, write the pass limit, here 1 pass, and the memory bound you are willing to spend.",
          "You find a majority item with one counter and one candidate, the Boyer-Moore procedure. Start empty. On each item, if the counter is 0, adopt that item and set the counter to 1. If the item matches the candidate, add 1. Otherwise subtract 1. On the stream a, b, a, c, a, b, a of length 7, the candidate ends as a. A second look, or a promise, confirms that a occurs 4 times, which is more than 7/2.",
        ],
        {
          kind: "flow",
          caption: "One counter hunts a majority item.",
          steps: [
            "At 0, adopt the item",
            "A match adds 1",
            "A mismatch subtracts 1",
            "Check the survivor",
          ],
        },
        "A stream of 7 symbols",
        [
          "Stream a, b, a, c, a, b, a. Three mismatches return the counter to 0, and the last symbol sets the candidate to a with count 1.",
          "In the raw stream, a occurs 4 times.",
          "Half of 7 is 3.5, and 4 is larger, so a is a strict majority. The counter did not store b or c.",
        ],
        [
          {
            prompt: "On this stream of length 7, how many times does a occur, and is that a strict majority?",
            answer: "a occurs 4 times. Half of 7 is 3.5, and 4 > 3.5, so yes.",
          },
          {
            prompt: "After 1000 arrivals, what does a length counter hold, and does that alone name a majority item?",
            answer: "It holds 1000. No. The majority procedure also keeps a candidate, updated by adding 1 or subtracting 1.",
          },
        ],
      ),
      lec(
        "l2",
        "A count-min sketch",
        [
          "You estimate frequencies with a count-min sketch of 2 rows and 4 columns. Each row hashes items into its own 4 cells. An arrival adds 1 to one cell in each row. The estimate is the minimum of the cells the item touches. That minimum cannot fall below the true count, because each of the item's arrivals was added, and other items only increase a cell. Width 4 is the memory per row.",
          "You recover exact counts on a short stream when one row separates the items. The stream a, a, b, a has true counts 3 and 1. Row 1 hashes both items to column 0, so that cell holds 4. Row 2 hashes a to column 1, holding 3, and b to column 2, holding 1. The estimate for a is min(4, 3) = 3. The estimate for b is min(4, 1) = 1. The min operation discarded the collision.",
        ],
        {
          kind: "pipeline",
          caption: "Count-min keeps the smaller cell.",
          stages: [
            "Hash into each row",
            "Add 1 on each row",
            "Take the minimum",
            "Stay at or above truth",
          ],
        },
        "Stream a, a, b, a",
        [
          "True counts are 3 for a and 1 for b. Row 1 collides and stores 4 in one cell.",
          "Row 2 stores 3 under a and 1 under b.",
          "The estimates are min(4, 3) = 3 for a and min(4, 1) = 1 for b. Both match the truth on this stream.",
        ],
        [
          {
            prompt: "The two row cells for item a hold 6 and 4. What does count-min report, and can the true count be 5?",
            answer: "It reports min(6, 4) = 4. The true count cannot be 5, because every reported value is at least the true count.",
          },
          {
            prompt: "In the worked stream, what did the colliding row store for a, and what estimate survived?",
            answer: "The colliding row stored 4. The other row stored 3, and the minimum kept 3.",
          },
        ],
      ),
      lec(
        "l3",
        "Trailing zeros and distinct items",
        [
          "You estimate distinct items without storing the set. Hash each item to bits and keep the largest number of trailing zeros seen so far. A hash ends with at least r trailing zeros with probability about 1 over 2 to the r, so an observed r suggests about 2 to the r distinct items. If your maximum is 3, the estimate is 8. One hash is a coarse sketch of that rare event.",
          "You steady the estimate by keeping several independent hashes and combining them. Suppose 4 hashes report maximum trailing-zero counts 2, 3, 2, and 1. The corresponding raw estimates are 4, 8, 4, and 2. Their average is 18/4 = 4.5. The median of those four numbers is 4, which is less sensitive to the single 8. The mechanism is still the rare trailing-zero event. Averaging 4 sketches only reduces the noise around it.",
        ],
        {
          kind: "layers",
          caption: "Trailing zeros become a distinct-count estimate.",
          rows: [
            "Keep the max trailing zeros",
            "A max of 3 estimates 8",
            "Raw estimates 4, 8, 4, 2",
            "Average of the four is 4.5",
          ],
        },
        "Combine four raw estimates",
        [
          "Trailing-zero records 2, 3, 2, and 1 become raw estimates 4, 8, 4, and 2.",
          "The average is (4 + 8 + 4 + 2) / 4 = 18/4 = 4.5.",
          "Sorted, the two central values are 4 and 4, so the median is 4. The lone 8 moves the average only.",
        ],
        [
          {
            prompt: "The maximum number of trailing zeros is 4. What distinct-count estimate does the power-of-two rule give?",
            answer: "2 to the power 4 equals 16.",
          },
          {
            prompt: "Raw estimates are 4, 8, 4, and 2. What is their average?",
            answer: "(4 + 8 + 4 + 2) / 4 = 18/4 = 4.5.",
          },
        ],
      ),
      lec(
        "l4",
        "A reservoir of size 1",
        [
          "You sample a stream of unknown length with a reservoir of size 1. Store the first item. When item t arrives, replace the stored item with probability 1/t. After 5 items, each item remains with probability 1/5. The first item survives step 2 with probability 1/2, step 3 with probability 2/3, step 4 with probability 3/4, and step 5 with probability 4/5. That product equals 1/5.",
          "You can check the three-item case by enumerating the replacement coins. Items arrive as 10, then 20, then 30. You always store 10 at step 1. Item 20 enters with probability 1/2. Item 30 enters with probability 1/3, regardless of what is stored. The probability that 10 is still stored at the end is (1/2)*(2/3) = 1/3. The probability that 20 remains is (1/2)*(2/3) = 1/3. Item 30 is stored with probability 1/3.",
        ],
        {
          kind: "flow",
          caption: "Reservoir of size 1, one arrival at a time.",
          steps: [
            "Store the first item",
            "At step t, replace with 1/t",
            "After 5 items each has chance 1/5",
          ],
        },
        "Items 10, 20, and 30",
        [
          "Item 20 replaces 10 with probability 1/2. Item 30 replaces the stored item with probability 1/3.",
          "The probability that 10 survives both later steps is (1/2)*(2/3) = 1/3.",
          "The probability that 20 is chosen and then kept is also (1/2)*(2/3) = 1/3, and 30 is stored with probability 1/3.",
        ],
        [
          {
            prompt: "After 5 items, what is the probability that a reservoir of size 1 holds the third item?",
            answer: "1/5. Each of the 5 items has the same survival probability.",
          },
          {
            prompt: "Write the product that leaves the first of 5 items stored, and its value.",
            answer: "(1/2)*(2/3)*(3/4)*(4/5) = 1/5.",
          },
        ],
      ),
      lec(
        "l5",
        "A sublinear density test",
        [
          "You test a huge array with a sample whose size ignores the length. The bits are either all zeros or at least 1/4 ones. Draw 8 indices. If you see a one, reject the all-zero claim. When a quarter of the bits are ones, one draw misses with probability 3/4, so eight draws all miss with probability (3/4) to the 8. That equals 6561/65536, about 0.100. You catch the dense case about 9 times in 10.",
          "You spend 8 probes rather than a full scan. One probe is a weak test: if only 1/4 of the bits are ones, it returns zero with probability 3/4. Moving from 1 probe to 8 drops the miss probability from 3/4 to about 0.100. The procedure can still accept a dense array, so it is Monte Carlo. A second independent batch of 8 probes is how you cut that error again.",
        ],
        {
          kind: "pair",
          caption: "Eight probes against an array that is one quarter ones.",
          leftTitle: "One probe",
          rightTitle: "Eight probes",
          left: ["Miss probability 3/4", "Too weak as a test"],
          right: ["Miss probability about 0.100", "Detects about 9 in 10"],
        },
        "Compute (3/4) to the 8",
        [
          "Each probe misses a 1/4-dense array with probability 3/4.",
          "Eight independent misses have probability 3^8 / 4^8 = 6561/65536.",
          "That is about 0.100, so the detection probability is about 0.900.",
        ],
        [
          {
            prompt: "What is (3/4)^8 as an integer ratio, and about what decimal is it?",
            answer: "6561/65536, about 0.100.",
          },
          {
            prompt: "The array is all zeros and your 8 probes are all zeros. Do you reject the all-zero claim?",
            answer: "No. You reject only when a probe sees a one. Eight zeros are what an all-zero array always returns.",
          },
        ],
      ),
      lec(
        "l6",
        "One round of map and reduce",
        [
          "You aggregate by one round of map and reduce. A mapper emits key-value pairs from a local shard. A reducer receives every pair that shares its key and combines them. Take 6 tokens: cat, dog, cat, cat, dog, bird. Each token emits a pair such as (cat, 1). The cat reducer sums three 1s and emits 3. Dog emits 2 and bird emits 1. The shuffle moves exactly those 6 pairs.",
          "You count rounds, because a second round is a new algorithm. Word count finished in 1 round: after the shuffle, each reducer already holds every pair for its key. Asking for the maximum among the three counts 3, 2, and 1 needs another round, and that round returns 3. The mechanism is the keyed shuffle. The resource you write down is the round count, 1 for the counts and 2 if you also want their maximum.",
        ],
        {
          kind: "pipeline",
          caption: "One shuffle produces the three counts.",
          stages: [
            "Map tokens to pairs",
            "Shuffle by the key",
            "Sum the ones",
            "Emit 3, 2, and 1",
          ],
        },
        "Six tokens, three keys",
        [
          "The tokens cat, dog, cat, cat, dog, and bird emit 6 pairs.",
          "Cat sums three 1s and emits 3. Dog emits 2. Bird emits 1.",
          "That used 1 round. Taking the max of 3, 2, and 1 needs a second round and returns 3.",
        ],
        [
          {
            prompt: "How many pairs move in the shuffle of these 6 tokens, and what count does cat get?",
            answer: "Six pairs move. Cat gets 3.",
          },
          {
            prompt: "Counts 3, 2, and 1 already sit on three reducers. How many extra rounds produce their maximum, and what is it?",
            answer: "One extra round. The maximum of 3, 2, and 1 is 3.",
          },
        ],
      ),
      lec(
        "l7",
        "A second-moment sketch",
        [
          "You estimate the second frequency moment with random signs. Assign each distinct item a sign of plus 1 or minus 1, and keep the weighted sum Z of the arrivals. The square of Z is an unbiased estimate of F2, the sum of squared frequencies. Frequencies 2, 1, and 1 give F2 = 4 + 1 + 1 = 6. A single sign pattern can return a square other than 6. The expectation over the signs equals 6.",
          "You average copies when one square is unlucky. Four sketches of the same frequencies return 4, 6, 10, and 4. Their average is (4 + 6 + 10 + 4) / 4 = 6, matching F2. The sketch that returned 10 was off by 4 on its own. You store each copy as one integer and a seed that rebuilds the signs. Four integers stand in for the frequency table of the whole stream.",
        ],
        {
          kind: "layers",
          caption: "Random signs, then an average of squares.",
          rows: [
            "Frequencies 2, 1, and 1",
            "Second moment equals 6",
            "Squares 4, 6, 10, and 4",
            "Their average equals 6",
          ],
        },
        "Average four sketches",
        [
          "The true second moment is 4 + 1 + 1 = 6.",
          "Four independent squares return 4, 6, 10, and 4.",
          "Their average is (4 + 6 + 10 + 4) / 4 = 24/4 = 6. The copy that returned 10 was off by 4 before the average.",
        ],
        [
          {
            prompt: "Frequencies are 3 and 1. What is F2?",
            answer: "3 squared plus 1 squared is 9 + 1 = 10.",
          },
          {
            prompt: "Four sketches return 4, 6, 10, and 4 on a stream whose F2 is 6. What is the average, and how far off was the 10?",
            answer: "The average is 24/4 = 6. The sketch that returned 10 was off by 10 - 6 = 4.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now compute from a summary",
        [
          "You can now answer from a summary that fits in memory. In one pass you track a majority candidate on a stream of length 7, estimate counts in a sketch of 2 by 4 cells, and turn a trailing-zero record of 3 into a distinct-count estimate of 8. A reservoir of size 1 keeps each of 5 items with probability 1/5. Eight probes catch an array that is 1/4 ones, missing with probability about 0.100.",
          "You can also place the same habit in parallel and in a second-moment sketch. Six tokens collapse to counts 3, 2, and 1 in one shuffle. Four random-sign sketches that return 4, 6, 10, and 4 average to the true second moment 6. The skill is to name the resource you spend, passes or probes or integers, and to attach the number the summary is allowed to get wrong, or to prove that on this instance it did not.",
        ],
        {
          kind: "flow",
          caption: "Name the resource, then the number you return.",
          steps: [
            "Pick the summary",
            "Spend probes or cells",
            "Compute the estimate",
            "State the allowed error",
          ],
        },
        "A sample probability beside a distinct estimate",
        [
          "A reservoir of size 1 over 5 items holds the third item with probability 1/5.",
          "A trailing-zero maximum of 2 estimates 2 to the power 2 distinct items, which is 4.",
          "One number is a sampling probability. The other is a distinct-count estimate. Both can be updated in the same pass.",
        ],
        [
          {
            prompt: "Combine the reservoir with the trailing-zero rule. On 5 items the reservoir has size 1, and the sketch reports maximum trailing zeros 2. What is the probability it holds the third item, and what distinct-count estimate do you report?",
            answer: "The third item is stored with probability 1/5. The distinct-count estimate is 2 to the power 2, which is 4.",
          },
          {
            prompt: "Combine count-min with the majority test. Count-min reports 4 for an item, and the stream has length 7. Can you conclude the item is a strict majority?",
            answer: "No. The report 4 is at least the true count, so the truth is at most 4 and might be smaller. A strict majority of 7 needs more than 3.5 occurrences, which an inflated 4 does not prove.",
          },
        ],
      ),
    ],
  },
];
