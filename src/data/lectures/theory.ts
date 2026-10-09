import type { CoursePack } from "./types";

export const packs: CoursePack[] = [
  {
    slug: "csce-629",
    lectures: [
      {
        id: "l1",
        title: "Models, recurrences, and divide-and-conquer",
        minutes: 45,
        paragraphs: [
          "An algorithm is a procedure plus a cost model. The model that this course uses counts comparisons, arithmetic, and pointer hops, and treats them as unit cost unless the problem is about bit operations. That model is wrong for a machine with a slow memory, and it is the right first model because it lets two designs be compared before anyone writes code. Always name the model. A bound with no model is a slogan.",
          "Divide-and-conquer splits the input, solves the pieces, and pays a combine cost. Merge sort on n items obeys T(n) = 2T(n/2) + n, with T(1) = 1, because each level of the recursion does n merge steps and there are log base 2 of n levels. The closed form is Theta of n log n. The same recurrence shows up whenever you split in half and do linear work to stitch the halves.",
          "The master theorem classifies T(n) = a T(n/b) + f(n). Let c be log base b of a. If f is polynomially smaller than n to the c, the leaves dominate and the bound is Theta of n to the c. If f is Theta of n to the c, the bound gains a log factor. If f is polynomially larger and a regularity condition holds, the root cost dominates. Apply it only when the split is equal and f is a simple polynomial.",
          "Probabilistic algorithms belong in the same toolkit. Randomized quicksort picks the pivot at random. The expected number of comparisons is about 1.4 n log n even though one unlucky pivot sequence is quadratic. The expectation is over the coins, not over a promise that the input is random. That distinction is the whole point of a probabilistic algorithm: the input can be hostile, the coins are yours.",
        ],
        figure: {
          kind: "layers",
          caption: "Where the cost of merge sort sits. Each band is one level and costs n.",
          rows: ["Level 1: one merge, cost n", "Level 2: two merges, cost n", "Level 3: four merges, cost n", "Leaves: n sorted singles"],
        },
        example: {
          title: "Merge sort on eight numbers",
          steps: [
            "Input 5, 1, 8, 3, 7, 2, 6, 4. The top merge costs 8 comparisons in the worst case.",
            "Two halves of four cost 4 each, and four pairs cost 2 each. Every level costs 8.",
            "There are 3 levels because log base 2 of 8 is 3. Total comparisons are at most 24, which is 8 times log base 2 of 8.",
          ],
        },
        problems: [
          {
            prompt: "Solve T(n) = 4 T(n/2) + n. Give the Theta bound and name the master-theorem case.",
            answer: "a = 4, b = 2, so log base b of a is 2. f(n) = n is O of n to the 2 minus epsilon, which is case 1. The bound is Theta of n squared.",
          },
          {
            prompt: "Randomized quicksort on n distinct keys uses expected comparisons under 2 n ln n. For n = 4, is a worst-case pivot sequence possible, and does that break the expectation claim?",
            answer: "Yes, a bad sequence exists: always pivot on the extreme key and the cost is quadratic on that path. The expectation averages over pivot coins, so a rare bad path does not cancel the claim. For n = 4 the bad paths are few and the average stays linearithmic.",
          },
        ],
        narration:
          "An algorithm is a procedure plus a cost model. In this course the model counts comparisons and pointer hops as one unit each. That is the wrong model for a cache, and it is the right model for deciding which idea is worth coding. Divide and conquer splits the input, solves the pieces, and pays to combine them. Merge sort on n items costs about n work at every level, and there are log base two of n levels, so the total is Theta of n log n. On eight items that is three levels, and each level costs eight, for twenty four comparisons. The master theorem is the shortcut. Compare the cost at the root with the cost at the leaves. If the leaves win, the bound follows the leaves. If they tie, multiply by a log. If the root wins, the bound is the root. The last idea in this lecture is probability. Randomized quicksort picks a pivot by flipping coins. A hostile input can still force a bad pivot, but only if the coins cooperate. The expected cost stays about one point four n log n. The expectation is over your coins, not over a kind universe. Read the worked merge on eight numbers, then do both problems before the graph lecture.",
      },
      {
        id: "l2",
        title: "Graphs: search, shortest paths, spanning trees",
        minutes: 45,
        paragraphs: [
          "A graph is vertices plus edges. Breadth-first search from a source visits each vertex and edge a constant number of times, so it is Theta of vertices plus edges. On an unweighted graph the first time you reach a vertex is a shortest path, measured in hops. Depth-first search is the same cost and answers a different question: finishing times, cycles, and the structure of the components.",
          "Dijkstra's algorithm is breadth-first search with a priority on distance, and it requires nonnegative edge weights. With a binary heap the cost is O of (vertices plus edges) times log vertices. The invariant is that every vertex taken out of the queue already has its final distance. A negative edge breaks the invariant, because a later path could come back cheaper. If you have negative edges and no negative cycle, use Bellman-Ford, which is O of vertices times edges.",
          "A minimum spanning tree connects every vertex at least total edge weight. Kruskal's algorithm sorts edges and adds one if it does not close a cycle. Prim's algorithm grows one tree, always adding the cheapest edge that leaves the tree. Both are correct because of the cut property: for any cut, the lightest edge across that cut is safe to include in some minimum tree. That one sentence is the proof you should be able to say out loud.",
          "Model the graph before you pick the algorithm. An adjacency matrix is the right structure when the graph is dense, because a scan of a row is cheap and simple. An adjacency list is the right structure when the graph is sparse, which is most networks. A shortest-path code that is Theta of vertices squared is fine for a few hundred vertices and absurd for a million.",
        ],
        figure: {
          kind: "flow",
          caption: "Dijkstra from A. Distances become final in this order.",
          steps: ["Start A at distance 0", "Settle B, distance 1", "Settle C via B, distance 3", "Settle D via C, distance 4"],
        },
        example: {
          title: "A four-vertex shortest path",
          steps: [
            "Edges: A to B weight 1, A to C weight 4, B to C weight 2, B to D weight 6, C to D weight 1.",
            "After settling A, the queue holds B at 1 and C at 4. Settle B next.",
            "Relaxing B improves C from 4 to 3 and offers D at 7. Settle C at 3.",
            "Relaxing C improves D from 7 to 4. The path is A, B, C, D and the distance is 4.",
          ],
        },
        problems: [
          {
            prompt: "Same graph, but change C to D into a weight of -2. Why must you not run Dijkstra, and what is the correct distance from A to D?",
            answer: "A negative edge can make a settled distance wrong later. The path A, B, C, D now costs 1 + 2 + (-2) = 1. Dijkstra may already have settled D at 7 via B and will not repair it. Bellman-Ford will, because it relaxes every edge once per vertex.",
          },
          {
            prompt: "Edges with weights: AB 3, AC 1, BC 1, CD 4, BD 5. Run the cut argument. What is a minimum spanning tree and its weight?",
            answer: "Lightest edge is AC at 1. Then BC at 1 is safe. Then AB would cycle, so skip it. CD at 4 is lighter than BD at 5. Tree A-C, C-B, C-D, total weight 6.",
          },
        ],
      },
      {
        id: "l3",
        title: "Greedy choice and exchange",
        minutes: 40,
        paragraphs: [
          "A greedy algorithm commits to a local choice and never reopens it. It is correct only when you can prove that some optimal solution makes that same choice. The proof is usually an exchange: take an optimal solution that disagrees with you, swap in your choice, and show the cost does not get worse. If you cannot write the exchange, you do not have a greedy algorithm. You have a guess.",
          "Interval scheduling is the clean example. Meetings have a start and a finish. Selecting the meeting that finishes first, then repeating on the rest, maximizes the number of meetings. The exchange is: an optimal schedule's first meeting finishes no earlier than yours, so you can replace it with yours and the rest of the schedule still fits. Earliest start time does not have this property. A long meeting that starts first can block three short ones.",
          "Huffman coding is greedy on frequencies. Repeatedly join the two lightest nodes. The exchange says the two rarest symbols can be siblings at the deepest level of some optimal tree. Prefix codes are not unique, so the tree you build is one optimal tree, not the only drawing. The weighted path length is what is optimal.",
          "Greedy fails in public on the knapsack problem when items cannot be split. Taking the highest value-per-weight item first can fill the sack with something that blocks two better items. That failure is useful. It tells you the problem wants dynamic programming, which is the next lecture. Do not force a greedy story onto a problem that has overlapping substructure and a capacity constraint.",
        ],
        figure: {
          kind: "pair",
          caption: "Same afternoon, two rules. Only one rule has an exchange proof.",
          leftTitle: "Earliest finish",
          rightTitle: "Earliest start",
          left: ["Take the 1 to 2 slot", "Then the 2 to 4 slot", "Three meetings fit"],
          right: ["Take the 1 to 6 slot", "It starts first", "One meeting fits"],
        },
        example: {
          title: "Four meetings",
          steps: [
            "Meetings: A 1-6, B 1-2, C 2-4, D 5-6. Times are hours on a clock.",
            "Earliest finish picks B, then C, then D. Three meetings.",
            "Earliest start picks A and stops. One meeting. The greedy rule is not 'be greedy'. It is the specific rule you can exchange.",
          ],
        },
        problems: [
          {
            prompt: "Meetings 0-3, 1-2, 2-5, 4-6, 5-8. Touching endpoints is allowed. How many does earliest-finish accept, and which ones?",
            answer: "Sort by finish time. The earliest finish is 1-2. Next is 2-5, which starts when 1-2 ends. Next is 5-8, which starts when 2-5 ends. 0-3 loses to 1-2, and 4-6 overlaps 2-5. Three meetings: 1-2, 2-5, and 5-8.",
          },
          {
            prompt: "Items for a 5-pound sack, no fractions: weight 4 value 6, weight 3 value 5, weight 2 value 3. Why does value-per-pound greedy fail?",
            answer: "Value per pound: 6/4 = 1.5, 5/3 about 1.67, 3/2 = 1.5. Greedy takes the 3-pound item first, then cannot take the 4-pound item, and may take nothing else. Value 5. Taking the 2-pound and the 3-pound items yields value 8. The local ratio was not safe.",
          },
        ],
      },
      {
        id: "l4",
        title: "Dynamic programming",
        minutes: 50,
        paragraphs: [
          "Dynamic programming is recursion plus a table, used when subproblems overlap and an optimal solution contains optimal solutions of its pieces. If the pieces do not overlap, divide-and-conquer is enough and the table is waste. If a local choice cannot be exchanged into an optimum, greedy is wrong and the table is the method. State the subproblem in one sentence before you write a loop. The sentence is the algorithm.",
          "For the zero-one knapsack, the sentence is: best value using the first i items with capacity w left. The recurrence looks at item i and either skips it, or takes it when w is at least its weight and adds its value to the smaller capacity. Each cell is a maximum of two already-computed cells. With n items and capacity W the table has n times W cells, so the cost is Theta of n W. That is polynomial in W, not in the number of bits of W. If W is huge, this is not a free lunch.",
          "Edit distance is the same shape on strings. The cell for prefixes of length i and j is the cheapest of three moves: delete a character, insert a character, or replace if the characters differ. Neighboring cells overlap so thoroughly that a recursive implementation without a table repeats the same prefix pair an exponential number of times. The table is n times m.",
          "Write the reconstruction, not only the number. Store a parent pointer or recompute the argmax when you walk backward from the last cell. A distance with no alignment, or a knapsack value with no list of items, fails the problem you were actually asked. The walk is linear in the table's side length.",
        ],
        figure: {
          kind: "pipeline",
          caption: "Each knapsack cell reads a skip or a take. Fill left to right, item by item.",
          stages: ["Skip item", "Or take it", "Write max", "Next weight"],
        },
        example: {
          title: "Knapsack, capacity 5",
          steps: [
            "Items in order: weight 2 value 3, weight 3 value 4, weight 4 value 5.",
            "After the first item, capacity 2 through 5 holds value 3.",
            "The second item at capacity 5 takes both the first and the second: value 3 + 4 = 7, weight 5.",
            "The third item at capacity 5 is value 5, which loses to 7. Optimum is 7, items one and two.",
          ],
        },
        problems: [
          {
            prompt: "Add a fourth item, weight 1 value 2, still capacity 5, using the optimum 7 from items one and two. What is the new optimum?",
            answer: "Weight 1 fits beside items one and two? Their weight is already 5, so no. Beside item two only: weights 3+1=4, values 4+2=6, worse than 7. Beside item one: weights 2+1=3, values 3+2=5. Beside item three: weights 4+1=5, values 5+2=7, a tie. The optimum stays 7.",
          },
          {
            prompt: "Edit distance, insert and delete and replace each cost 1. Transform 'cat' into 'cut'. What is the distance and one alignment?",
            answer: "One replacement, a to u. Distance 1. The table agrees: matching c, then replace a, then matching t.",
          },
        ],
      },
      {
        id: "l5",
        title: "NP-completeness and approximation",
        minutes: 45,
        paragraphs: [
          "P is the set of decision problems a deterministic machine can answer in time polynomial in the length of the input. NP is the set where a proposed witness can be checked in polynomial time. Every problem in P is in NP, because the checker can ignore the witness and solve the problem. The useful question is the other direction, and this course treats it as open. You will not be asked to settle it. You will be asked to use it.",
          "A problem is NP-complete when it is in NP and every problem in NP reduces to it by a polynomial-time mapping. The mapping must preserve yes and no. A reduction from a known NP-complete problem, usually 3-SAT or vertex cover or clique, is the ordinary way in. If you only reduce your problem to a known hard problem, you have shown nothing: easy problems also reduce to hard ones.",
          "Approximation is what you do after the reduction succeeds and you still need an answer. For vertex cover, take any maximal matching and keep both endpoints of each matched edge. The cover has twice as many vertices as the matching. Some cover must pick at least one endpoint of each matched edge, so the optimum is at least the number of matched edges. The algorithm is a 2-approximation. It is not the cover a human would draw, and the factor 2 is proved.",
          "A probabilistic algorithm is a different compromise. A Monte Carlo algorithm may be wrong with small probability and is usually cheap to repeat. A Las Vegas algorithm is always correct and its running time is the random variable, as with randomized quicksort. Do not call a heuristic an approximation unless you can name the worst-case factor. Do not call it Monte Carlo unless you can name the error probability.",
        ],
        figure: {
          kind: "pair",
          caption: "Two honest ways to live with an NP-complete problem. A heuristic is neither, until you prove something.",
          leftTitle: "Approximation",
          rightTitle: "Monte Carlo",
          left: ["Always a legal answer", "Cost within a factor", "Vertex cover: factor 2"],
          right: ["Sometimes wrong", "Error you can bound", "Repeat to drive it down"],
        },
        example: {
          title: "Vertex cover from a matching",
          steps: [
            "Edges: a-b, c-d, and nothing else. A maximal matching is both edges.",
            "The algorithm returns a, b, c, and d. Cover size 4.",
            "The optimum is 2, for example a and c. The ratio is 4 over 2, which meets the factor and does not beat it.",
          ],
        },
        problems: [
          {
            prompt: "You reduce sorting to vertex cover by a polynomial mapping. Does that prove sorting is NP-complete?",
            answer: "No. A reduction from A to B says B is at least as hard as A. Sorting is easy, so reducing it to vertex cover only shows you can encode an easy problem inside a hard one. Completeness needs a reduction from a known NP-complete problem, plus membership in NP.",
          },
          {
            prompt: "A graph is a triangle, three edges. What cover does the matching algorithm return, and what is the optimum?",
            answer: "A maximal matching has one edge. The algorithm returns both endpoints, size 2. The optimum is also 2, because one vertex leaves an edge uncovered. Ratio 1 on this graph. The worst-case factor 2 is about other graphs, not this one.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-625",
    lectures: [
      {
        id: "l1",
        title: "Search",
        minutes: 45,
        paragraphs: [
          "An agent is a state, a set of actions, and a goal test. Uninformed search expands states in an order that ignores the particular goal, except for the test. Breadth-first search expands the shallowest state first and returns a shortest path in hops when every action costs the same. Its memory holds the whole frontier. Depth-first search holds only the path it is on, and it can miss a shallow goal if the space is deep or cyclic. Use a visited set when actions can loop.",
          "Uniform-cost search expands the cheapest path first. It is Dijkstra on the implicit graph of states, and it needs nonnegative action costs. It finds an optimal path. Breadth-first search is the special case where every action costs one.",
          "A-star adds a heuristic h(n), an estimate of the remaining cost. The priority is g(n) plus h(n), where g is the cost already paid. If h never overestimates, A-star is optimal. A heuristic that overestimates can return a pretty path that is not cheapest, because the algorithm may finish a tempting branch before a dull but better one. Manhattan distance on a grid with no obstacles is admissible. Straight-line distance is admissible for travel when the cost is at least the crow-flies distance.",
          "Write the frontier on paper for any example smaller than ten states. If you cannot list the order of expansion, you do not yet know which search you implemented. The rest of the course, games and planning included, is this lecture with a different definition of state.",
        ],
        figure: {
          kind: "flow",
          caption: "A-star expands the lowest f = g + h. h must not overestimate.",
          steps: ["Pay g to reach the state", "Estimate h to the goal", "Expand smallest g + h", "Stop at the goal"],
        },
        example: {
          title: "A grid, start at (0,0), goal at (2,1)",
          steps: [
            "Actions move one cell north, south, east, or west, cost 1. Manhattan distance is the heuristic.",
            "Start f is 0 + 3 = 3. East to (1,0) has g 1 and h 2, so f is 3. North to (0,1) has g 1 and h 2, so f is 3.",
            "Expand east, then the cell (2,0) has f = 2 + 1 = 3, and (1,1) has f = 2 + 1 = 3. The goal (2,1) is reached at g = 3.",
            "Optimal cost is 3. An overestimate that said h(0,0) = 9 would still be a number, and it would not be safe.",
          ],
        },
        problems: [
          {
            prompt: "All action costs are 1. Is breadth-first search optimal? Is depth-first search optimal?",
            answer: "Breadth-first search is optimal because the first time it generates the goal, no shorter hop-path remains on the frontier. Depth-first search is not. It can walk a long branch and hit the goal before it ever tries a one-step branch.",
          },
          {
            prompt: "Heuristic h returns 0 for every state. What algorithm is A-star then, and is it optimal?",
            answer: "f equals g. A-star becomes uniform-cost search. With nonnegative costs it is optimal. The heuristic is admissible because 0 never exceeds the true remaining cost.",
          },
        ],
        narration:
          "An agent is a state, a list of actions, and a test for the goal. Search is how the agent looks before it moves. Breadth-first search tries short paths first. When every step costs the same, the first time you reach the goal you have a shortest path, and you have also stored every state on the frontier. Depth-first search stores only the path in hand. It can miss a nearby goal by walking a long hall. Uniform-cost search is what you want when steps have different prices. It expands the cheapest path first, and it is optimal if no step pays you to take it. A-star adds a guess of the remaining cost. The guess has one rule. It must not say the goal is closer than it is. If the guess never overestimates, the first time you pull the goal off the queue, the path is optimal. Manhattan distance on an open grid obeys the rule. A guess that is too optimistic does not. Draw the frontier for the worked grid before you do the two problems. Games, plans, and decisions later in the course are this same loop with a different state.",
      },
      {
        id: "l2",
        title: "Games",
        minutes: 40,
        paragraphs: [
          "A two-player zero-sum game is a tree of moves. Max plays, then Min, then Max, until a leaf with a utility for Max. Minimax says Max chooses the child with the largest value and Min chooses the child with the smallest value. The value of a node is defined only after the children are defined, so the implementation is a depth-first walk. On a tree with branching factor b and depth d the walk looks at about b to the d leaves. That is the whole problem with the algorithm, and it is why chess programs do not expand to the end of the game.",
          "Alpha-beta pruning walks the same tree and keeps two bounds. Alpha is the best value Max can already force. Beta is the best value Min can already force. If a node's remaining children cannot change the decision above, they are not generated. The result equals minimax. The savings depend on the order. If the best move is tried first, the effective branching is about the square root of b, which doubles the depth you can see for the same work.",
          "When the tree is too deep, replace the leaf utility with an evaluation function and stop at a fixed depth. The function is a guess, and every flaw in it becomes a move. A function that counts material and ignores whose turn it is will walk into a one-move loss looking rich. Horizon effects are the same bug at a distance: a bad event sits one ply past the cutoff, so the search pretends it is not there.",
          "Ethics shows up here as the utility, not as a paragraph at the end. If the leaf score rewards only winning, the agent will take a legal move that harms a person the score does not mention. Changing the legal moves, or putting that harm in the utility, changes the game. A sermon after the algorithm does not.",
        ],
        figure: {
          kind: "pipeline",
          caption: "One ply of a game. Max and Min read the same tree and optimize opposite ways.",
          stages: ["Max move", "Min move", "Max move", "Leaf score"],
        },
        example: {
          title: "A tree with four leaves",
          steps: [
            "Root is Max. Two children, each a Min node. Min on the left has leaves 3 and 5. Min on the right has leaves 2 and 9.",
            "Left Min returns 3. Right Min returns 2. Max returns 3.",
            "Alpha-beta, left first: after the left Min returns 3, alpha is 3. The right Min sees 2 first. 2 is already worse for Max than 3, so the leaf 9 is not examined.",
          ],
        },
        problems: [
          {
            prompt: "Same tree, but the right Min's leaves are 4 and 9, and you still search left first. Does alpha-beta skip any leaf?",
            answer: "Left Min returns 3, so alpha is 3. Right Min's first leaf is 4, which is better than 3, so Min must look at 9 to know its own value. Min returns min(4, 9) = 4. Max then picks 4. No leaf is skipped.",
          },
          {
            prompt: "Evaluation at depth 2 says a position is +8, but the opponent can force a loss in one more ply. What is the name of this failure?",
            answer: "The horizon effect. The cutoff hid the loss. The repair is a deeper search on unstable positions, or a different evaluation, not a claim that +8 was optimal play.",
          },
        ],
      },
      {
        id: "l3",
        title: "Logic and planning",
        minutes: 45,
        paragraphs: [
          "Propositional logic is a language for facts that are true or false. A model assigns each symbol a bit. A sentence is satisfiable when some model makes it true, valid when every model does. Inference algorithms exist because you do not want to list the models. Resolution is refutation-complete for propositional logic: if a set of clauses is unsatisfiable, resolution will derive the empty clause. It is not a way to generate interesting consequences in a helpful order. You still have to ask a question.",
          "First-order logic adds objects and quantifiers. It can say 'every lock has a key' without naming them. The price is that entailment is undecidable. This course uses it as the language of a planner, not as a theorem-proving marathon. If you cannot write the sentence, you do not have the constraint, no matter how sophisticated the search is.",
          "Classical planning is search in a factored state. A state is a set of ground facts. An action has preconditions and effects that add and delete facts. Forward search from the initial state works, and it is the search lecture again, with a heuristic that ignores the delete lists. Ignoring deletes makes the problem easier and the estimate admissible for the remaining number of actions, because you only become more able to act.",
          "A plan that is correct in the model and disastrous outside it is still a correct plan in the model. Write the preconditions you actually care about, including the ones that protect a person or a machine. The planner will not invent a precondition you refused to name.",
        ],
        figure: {
          kind: "flow",
          caption: "A planner is search over sets of facts. The action is legal only if the preconditions hold.",
          steps: ["State: a set of facts", "Action needs preconditions", "Add and delete effects", "Stop at the goal facts"],
        },
        example: {
          title: "A locked drawer",
          steps: [
            "Facts: Closed, Locked. Goal: Open. Key is in hand already, so HasKey is true and stays true.",
            "Unlock requires Locked and HasKey. Effect: delete Locked.",
            "Open requires Closed and not Locked. Effect: delete Closed, add Open.",
            "The only legal plan is Unlock, then Open. Open first has no model in which its precondition holds.",
          ],
        },
        problems: [
          {
            prompt: "You drop the precondition HasKey because the planner 'should be smart'. What plan does forward search return, and what is wrong with it?",
            answer: "Unlock then Open, even when HasKey is false. The plan is legal in the model you wrote and impossible on the drawer you own. The missing precondition is the bug.",
          },
          {
            prompt: "Is a sentence that is true in every model satisfiable, valid, both, or neither?",
            answer: "Both. Valid means true in every model. Satisfiable means true in at least one. Every valid sentence is satisfiable. The converse is false.",
          },
        ],
      },
      {
        id: "l4",
        title: "Probability and decisions",
        minutes: 45,
        paragraphs: [
          "A probability is a number between 0 and 1 assigned to events so that the whole space sums to 1. Conditional probability P(A given B) is P(A and B) divided by P(B). Bayes' rule turns that around when the thing you can measure is the evidence and the thing you want is the cause. The denominator is the probability of the evidence, summed over the causes. Skip the denominator and you have scores, not probabilities.",
          "A Bayesian network is a directed acyclic graph of conditional independences. A node is independent of its non-descendants given its parents. That is the whole modeling claim. The joint distribution factors into one conditional table per node. For n binary nodes with at most k parents, you store about n times 2 to the k numbers instead of 2 to the n. The savings are the point. The graph is not a picture of causality unless you earned that reading separately.",
          "A Markov decision process is a state, actions, transition probabilities, and a reward. A policy picks an action in each state. The value of a state under a policy is the expected sum of rewards, usually discounted by gamma so a reward now is worth more than the same reward later. Value iteration applies the Bellman update until the numbers stop moving. With a finite state space and a discount below 1, it converges.",
          "The reward is the ethics. If the reward pays for speed and does not charge for a broken machine or a harmed person, value iteration will break the machine. Put the cost in the reward before you iterate. An agent that is optimal for the wrong number is not a neutral piece of mathematics.",
        ],
        figure: {
          kind: "layers",
          caption: "A tiny network. Alarm depends on fire. Calls depend on alarm, not on fire directly.",
          rows: ["Fire", "Alarm, given fire", "Neighbor calls, given alarm"],
        },
        example: {
          title: "One Bayes update",
          steps: [
            "P(fire) = 0.01. P(alarm given fire) = 0.9. P(alarm given no fire) = 0.1.",
            "P(alarm) = 0.9 * 0.01 + 0.1 * 0.99 = 0.009 + 0.099 = 0.108.",
            "P(fire given alarm) = 0.009 / 0.108 = 1/12, about 0.083.",
            "The alarm raised the chance from 1 percent to about 8 percent. It did not make the fire likely.",
          ],
        },
        problems: [
          {
            prompt: "Value iteration, one state, one action, reward 4 every step, discount 1/2. What is the value?",
            answer: "V = 4 + (1/2) V. So (1/2) V = 4 and V = 8. The infinite series 4 + 2 + 1 + 1/2 + ... sums to 8.",
          },
          {
            prompt: "In the alarm numbers, what is P(fire given no alarm)?",
            answer: "P(no alarm given fire) = 0.1. P(no alarm) = 1 - 0.108 = 0.892. P(fire and no alarm) = 0.1 * 0.01 = 0.001. The conditional is 0.001 / 0.892, about 0.00112. The fire is now less likely than the base rate.",
          },
        ],
      },
      {
        id: "l5",
        title: "Learning inside an agent",
        minutes: 40,
        paragraphs: [
          "Learning here means updating a function from examples when the model is too large to write by hand. A supervised example is an input and a label. The hypothesis is a function from inputs to labels. Training picks the hypothesis that scores well on the examples you have. Testing asks about examples you did not train on. A perfect training score with a bad test score is memorization. Report the test score.",
          "A linear classifier scores a weighted sum of features and thresholds it. The features are the modeling decision. A feature you did not include cannot be used, just as a planner cannot obey a precondition you did not write. Add a feature when you can say what it measures. Do not add one because the training score went up on thirty examples.",
          "Overfitting is fitting noise. Regularization adds a cost for large weights so the hypothesis stays smoother than the examples strictly require. A separate validation set chooses the strength of that cost. Using the test set to choose it makes the test set a second training set, and the number you publish is optimistic.",
          "An agent that learns online changes its policy while acting. The examples are then produced by the policy, not by the world at large. A bad early policy collects bad examples and can confirm itself. That is a technical failure, and it is also the ethics problem: the data the system sees are the data its behavior created. Hold out a test that the policy did not generate before you claim the agent learned the task.",
        ],
        figure: {
          kind: "pair",
          caption: "The same labeled points. One hypothesis will still be wrong on the next point.",
          leftTitle: "Memorize",
          rightTitle: "Linear rule",
          left: ["Zero training error", "A kink per point", "Test error unknown"],
          right: ["May miss a point", "Two numbers to learn", "Test can be estimated"],
        },
        example: {
          title: "Three points, one feature",
          steps: [
            "Examples: x = 0 label 0, x = 1 label 0, x = 2 label 1.",
            "Threshold 'predict 1 when x is at least 2' fits all three.",
            "Threshold 'predict 1 when x is at least 1.5' also fits all three. The training set cannot tell them apart.",
            "A test point at x = 1.7 decides. You do not get to pick it after seeing it and still call it a test.",
          ],
        },
        problems: [
          {
            prompt: "Training accuracy is 100 percent and test accuracy is 54 percent on a balanced two-class problem. What happened?",
            answer: "The hypothesis memorized the training sample. 54 percent is barely above a coin flip. Collect more data, simplify the hypothesis, or regularize. Do not ship the training number.",
          },
          {
            prompt: "You tune a regularizer on the test set until test accuracy peaks. Why is the published test accuracy biased?",
            answer: "The test set was used to choose the model, so it is no longer unseen. The peak is an optimistic draw over the choices you tried. A fresh set, or a three-way split, is the repair.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-633",
    lectures: [
      {
        id: "l1",
        title: "Supervised induction and linear models",
        minutes: 45,
        paragraphs: [
          "Induction here means inferring a function from examples. A training set is pairs (x, y). A linear model predicts a weighted sum of the coordinates of x, plus a bias. Least squares chooses the weights that minimize the sum of squared differences between prediction and y. Squared error is not sacred. It is convenient, it punishes large misses, and it has a closed form when the columns of the design matrix are linearly independent.",
          "Stack the examples as rows of a matrix X, with a column of ones for the bias. The normal equations are X transpose X times the weight vector equals X transpose y. You solve a square system whose side is the number of features, not the number of examples. If two features are copies of each other, X transpose X is singular and there is no unique weight vector. Drop a feature or add a ridge term.",
          "The fit on the training points is not the result. The result is the prediction on a new x drawn the same way. A line that threads every training point in a high-dimensional space can be an interpolating accident. Keep a test set out of the solver. If you only have twenty points, say so next to the number.",
          "Explanation-based learning is the other induction in this catalog. You already have a theory, and one example is enough to specialize it into a rule. Statistical least squares is what you do when you do not have that theory. Do not pretend a fitted line is an explanation. It is a function with a measured error.",
        ],
        figure: {
          kind: "pipeline",
          caption: "Least squares. The design matrix already includes the column of ones.",
          stages: ["Build X", "Form X'X", "Solve weights", "Test on new x"],
        },
        example: {
          title: "Three points, prediction a x + b",
          steps: [
            "Points (1, 2), (2, 3), (3, 5). X transpose X is the matrix [[3, 6], [6, 14]]. X transpose y is [10, 23].",
            "Equations: 3b + 6a = 10 and 6b + 14a = 23.",
            "From the first, b = (10 - 6a) / 3. Substitute: 20 - 12a + 14a = 23, so 2a = 3 and a = 1.5. Then b = 1/3.",
            "Predictions are about 1.83, 3.33, and 4.83. The residuals are small and not zero. That is a fit, not a law.",
          ],
        },
        problems: [
          {
            prompt: "Fit y = a x through the origin to the same three points. What is a?",
            answer: "a = (1*2 + 2*3 + 3*5) / (1 + 4 + 9) = 23 / 14, about 1.64. No bias term, so the line is steeper than 1.5 and misses the intercept the data wanted.",
          },
          {
            prompt: "Two features are identical on every row. Why do the normal equations fail, and what is one repair?",
            answer: "The columns of X are dependent, so X transpose X has determinant 0 and no unique solution. Drop one feature, or add a positive number to the diagonal (ridge regression) so the matrix is invertible.",
          },
        ],
        narration:
          "Machine learning in this course starts with induction from examples, not with a neural net. You are given pairs, an input and a number, and you want a function that predicts the number on an input you have not seen. The linear model predicts a weighted sum plus a bias. Least squares picks the weights that make the squared errors small. Stack the inputs as rows, add a column of ones, and the best weights solve the normal equations. On the points one two, two three, and three five, the slope is one point five and the intercept is one third. The line does not pass through the points. It is not supposed to. A perfect thread through every point is often memorization. Keep a test set out of the solver. If two columns of the matrix are the same feature written twice, the equations have no unique answer. Drop a column. The fit is not an explanation of the world. It is a function with an error you measured. Do the origin-only problem next. The arithmetic is short and the difference from the intercept model is the lesson.",
      },
      {
        id: "l2",
        title: "Classification, bias, and variance",
        minutes: 45,
        paragraphs: [
          "Logistic regression classifies by turning a weighted sum into a probability through the logistic function, one over one plus e to the minus z. Training minimizes the negative log likelihood, which is convex in the weights. There is no closed form. Gradient descent takes a step opposite the gradient. On a small problem you should compute one step by hand so the learning rate is a number you chose, not a ritual.",
          "Bias is error from a hypothesis that cannot represent the pattern even with infinite data. A line cannot fit a clean parabola, and more points will not save it. Variance is error from a hypothesis that changes too much when the sample changes. A high-degree polynomial can pass through every training point and swing wildly between them. The test error is the sum of those two pressures plus noise you cannot remove.",
          "Regularization adds a penalty on the size of the weights. Ridge adds the sum of squares of the weights. It shrinks every weight and usually lowers variance and raises bias. The penalty strength is chosen on a validation set. Lasso uses the sum of absolute weights and can set some weights to exactly zero, which is a form of feature selection. Neither penalty knows which features you care about for reasons outside the loss.",
          "A model with lower training error is not automatically better. Plot both training and validation error against model capacity. When they move apart, you are fitting the sample. Stop, or penalize, or get more data. More data reduces variance. It does not fix a hypothesis class that cannot represent the pattern.",
        ],
        figure: {
          kind: "pair",
          caption: "Capacity is the knob. Both ends lose, for different reasons.",
          leftTitle: "High bias",
          rightTitle: "High variance",
          left: ["Line on a curve", "Train error stays up", "More data will not fix it"],
          right: ["A kink per point", "Train error near zero", "A new sample moves the fit"],
        },
        example: {
          title: "One gradient step on a single logistic point",
          steps: [
            "One feature x = 1, label y = 1, weight w = 0, bias 0, so z = 0 and the predicted probability is 0.5.",
            "The gradient of the log loss with respect to w, for one point, is (probability minus y) times x = (0.5 - 1) * 1 = -0.5.",
            "A step with learning rate 0.2 moves w from 0 to 0.1, toward the positive label.",
            "The new probability is logistic(0.1), a little above one half. One step is not training. It is a check that the sign is right.",
          ],
        },
        problems: [
          {
            prompt: "Training error falls and validation error rises as you add polynomial degree. Which side of the pair are you on, and what do you change?",
            answer: "High variance. Reduce degree, strengthen regularization, or add data. Do not add features.",
          },
          {
            prompt: "A line's validation error stays high and matches its training error, on data that is clearly curved. What do you change?",
            answer: "The class is biased. Increase capacity, for example a quadratic term. More copies of the same points will not draw the curve.",
          },
        ],
      },
      {
        id: "l3",
        title: "Clustering, exemplars, and analogy",
        minutes: 40,
        paragraphs: [
          "Clustering is unsupervised. You have points and no labels, and you want groups. k-means picks k centers, assigns every point to the nearest center, and moves each center to the mean of its points. Repeat until the assignment stops changing. The objective, total squared distance to centers, never rises. It can stop in a bad local minimum, so run it more than once from different starts and keep the best objective. k is not estimated by the algorithm. You chose it.",
          "An exemplar method stores points instead of fitting weights. The nearest neighbor classifier predicts the label of the closest stored point. k nearest neighbors vote among k of them. The method is analogy: this case resembles that case. It has almost no training time and a prediction time that grows with the sample unless you build an index. The distance is the model. Euclidean distance on raw pixels is a poor analogy. Euclidean distance on features you designed might be a good one.",
          "A single stored prototype per class is the other extreme. Compute the mean of each class and classify by the nearer mean. That is a linear method in disguise for two classes, and it fails when a class is two blobs. k-means on each class separately is one way to admit that a class has more than one exemplar.",
          "Discovery in this catalog means noticing a structure you did not label in advance. A cluster is a proposal, not a finding, until you can predict something new with it. If the groups do not correspond to any measurement you held out, you have partitioned a sample. Say that in the write-up.",
        ],
        figure: {
          kind: "pair",
          caption: "Two unlabeled pictures of the same points. k is a decision.",
          leftTitle: "k = 2",
          rightTitle: "k = 4",
          left: ["Two means", "Lower detail", "May merge a real split"],
          right: ["Four means", "Fits small clumps", "May split noise"],
        },
        example: {
          title: "Four points on a line",
          steps: [
            "Points at 0, 1, 10, and 11. Start with centers at 0 and 10.",
            "Assign 0 and 1 to the first center, 10 and 11 to the second.",
            "New centers: 0.5 and 10.5. The assignment does not change. Stop.",
            "A start with both centers at 0 and 1 can collapse. That is why you restart.",
          ],
        },
        problems: [
          {
            prompt: "Nearest neighbor on a training set memorizes every training label. Why can test accuracy still be poor?",
            answer: "Prediction uses distance, not the training label of the test point. If the distance is wrong, the neighbor is the wrong analogy. Noise labels are also copied exactly. Accuracy on the training set is 100 percent by construction and is not evidence.",
          },
          {
            prompt: "k-means objective after iteration 3 is 14, and after iteration 4 is 16. Where is the bug?",
            answer: "A correct k-means step never increases the sum of squared distances. The assignment step or the mean step is wrong, or the distance changed between iterations. Do not interpret 16 as a worse cluster you discovered. It is an implementation error.",
          },
        ],
      },
      {
        id: "l4",
        title: "A network with one hidden layer",
        minutes: 45,
        paragraphs: [
          "A feedforward network composes linear sums and a nonlinearity. Without the nonlinearity, a stack of linear maps is one linear map, and you have the first lecture again with worse notation. A hidden layer with a pointwise nonlinearity can approximate more functions as you add units. That existence claim does not say that gradient descent will find the approximation, or that you have the data to pin it down.",
          "Backpropagation is the chain rule on a computation graph. You compute the output, compare it to the target, and send a derivative backward through each operation. Each weight's gradient is the local input to that weight times the derivative arriving from above. The arithmetic is ordinary. The bookkeeping is the part people skip, and it is the part that has to be right.",
          "A worked linear network is enough to see the signs. Let the hidden value be w1 times x, the prediction be w2 times the hidden value, and the loss be one half the square of prediction minus target. The derivative of the loss with respect to the prediction is the residual. Multiply by the hidden value to get the gradient for w2. Multiply the residual by w2 and then by x to get the gradient for w1. A nonlinearity inserts its derivative in the middle and changes nothing about the shape of the argument.",
          "Training still overfits. A network with enough units can memorize a finite sample. Early stopping, weight decay, and a validation set are the same bias-variance tools as in the linear lecture. A lower training loss is not the result you report.",
        ],
        figure: {
          kind: "pipeline",
          caption: "Forward is left to right. The gradients travel back along the same pipes.",
          stages: ["Input x", "Hidden h", "Output y", "Loss"],
        },
        example: {
          title: "One backprop step, no nonlinearity",
          steps: [
            "x = 2, w1 = 0.5, so h = 1. w2 = 3, so the prediction is 3. Target is 1.",
            "Loss is one half of (3 - 1) squared, which is 2. The residual is 2.",
            "Gradient for w2 is residual times h = 2. Gradient for w1 is residual times w2 times x = 2 * 3 * 2 = 12.",
            "A step of size 0.01 subtracts 0.02 from w2 and 0.12 from w1. The prediction moves toward 1.",
          ],
        },
        problems: [
          {
            prompt: "In that example, what is the gradient for w1 if the target is 3 instead of 1?",
            answer: "Prediction equals target, residual is 0, and every gradient is 0. The step does nothing. That is correct, not a dead network.",
          },
          {
            prompt: "You remove the nonlinearity and add a third linear layer. Can the training loss be lower than the best single linear map on the same features?",
            answer: "No. Three linear maps compose to one linear map. The minimum squared loss cannot beat the ordinary least-squares line on those features. Any gap is optimization, not representation.",
          },
        ],
      },
      {
        id: "l5",
        title: "Evaluation and what a model does not show",
        minutes: 40,
        paragraphs: [
          "Split the data before you look at it for decisions. Training fits the weights. Validation chooses the model. Test is touched once. If you touch the test set twice, the second number is not a test. Time series and medical records break a random split, because tomorrow's row is not independent of today's, and two rows from the same person are not two people. Split by time, or by person, or you will publish an echo.",
          "Accuracy hides the base rate. A test that always says 'no disease' is 99 percent accurate when 1 percent of people have the disease, and it is useless. Precision is the fraction of positive predictions that are right. Recall is the fraction of real positives you caught. Report both, or report a confusion matrix. A single threshold is a decision about which error is more expensive, not a property of the model.",
          "Calibration is whether a predicted 0.7 happens about 70 percent of the time. A classifier can rank well and still be overconfident. If you will threshold the probability or show it to a person, check calibration on the validation set. A pretty ranking curve does not answer that.",
          "Discovery and analogy do not survive a bad split. A cluster found on the whole data set, then 'confirmed' on the same rows, is not a confirmation. An exemplar retrieved from the test patient's own history is leakage. Write the split in the first paragraph of the report, not the last.",
        ],
        figure: {
          kind: "layers",
          caption: "Touch the layers in order. The test layer is not a place to choose a threshold.",
          rows: ["Test, once", "Validation, for choices", "Training, for weights"],
        },
        example: {
          title: "A 100-person test, 10 of whom are positive",
          steps: [
            "The model flags 10 people, and 5 of them are truly positive.",
            "Precision is 5/10 = 0.5. Recall is 5/10 = 0.5.",
            "Accuracy is 90 percent if the 5 false positives and 5 false negatives are the only mistakes: 90 correct out of 100.",
            "The accuracy sounds like success. The recall says half the people you care about were missed.",
          ],
        },
        problems: [
          {
            prompt: "A spam filter flags nothing. Spam is 5 percent of mail. What is the accuracy, the precision, and the recall?",
            answer: "Accuracy is 95 percent. Precision is undefined or irrelevant, because there are no positive predictions. Recall is 0. The accuracy is the base rate of non-spam.",
          },
          {
            prompt: "You randomly split sensor readings taken every second. Why can the test error be optimistic?",
            answer: "Adjacent seconds are almost the same event. The test set contains near-copies of the training set. Split by day, or by device, so the test is a new period rather than the next second.",
          },
        ],
      },
    ],
  },
];
