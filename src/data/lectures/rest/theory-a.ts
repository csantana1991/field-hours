import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
    {
      slug: "csce-620",
      lectures: [
        lec("l1", "Turns and the cost of a test", [
          "You test the turn from A to B to C with the cross product (Bx - Ax) times (Cy - Ay) minus (By - Ay) times (Cx - Ax). Place A at (0, 0), B at (4, 0), and C at (1, 2). The value equals 8, so the path turns left. A negative value is a right turn, and zero means collinear. Later algorithms call this test and do not add a second geometric primitive.",
          "You also name the cost model before you pick an algorithm. A test on coordinates that fit in a machine word is one step. Sorting n points by x-coordinate costs on the order of n log n tests, and for n = 8 that is about 24 comparisons. A hull or a triangulation that hides an extra quadratic pass loses to one that sorts once and then scans. You count tests in this model.",
        ], { kind: "pair", caption: "Sign of one cross product", leftTitle: "Positive 8", rightTitle: "Negative sign", left: ["Path A, B, C turns left", "C sits above segment AB"], right: ["Path A, B, C turns right", "C would sit below AB"] }, "Left turn at height 2", [
          "A is (0, 0), B is (4, 0), and C is (1, 2).",
          "The cross product is 4 times 2 minus 0 times 1, which equals 8.",
          "The sign is positive, so you record a left turn. The point C at (1, -2) would give -8, a right turn.",
        ], [
          { prompt: "A is (0, 0), B is (2, 0), and C is (2, 5). What is the cross product, and which way does the path turn?", answer: "It equals 2 times 5 minus 0 times 2, which is 10. The turn is left." },
          { prompt: "A is (1, 1), B is (3, 1), and C is (5, 1). What does the test return, and what do you conclude?", answer: "It equals 2 times 0 minus 0 times 4, which is 0. The three points are collinear." },
        ]),
        lec("l2", "Convex hull by a monotone chain", [
          "You build a convex hull with Andrew's monotone chain. Sort the points by increasing x-coordinate, breaking ties by y, then scan left to right. Keep a lower chain that makes only left turns. When the newest point makes a right turn or a flat turn with the last two points, pop the middle one and test again. On 5 points with 1 inside, that interior point is popped and the hull keeps the other 4.",
          "You pay for the sort, not for the pops. Each point is pushed once and popped at most once, so the lower scan does at most n pops. With n = 5 that is at most 5 pops below and 5 on the upper chain, which scans right to left with the same left-turn test. You glue the chains at the two extreme points. The n log n term is the sort.",
        ], { kind: "flow", caption: "Lower chain, left to right", steps: ["Sort by x, then by y", "Append the next point", "Pop any right turn", "Keep the left turns"] }, "Five points, one inside", [
          "Sorted order is (0, 0), (0, 3), (2, 1), (4, 0), (4, 3).",
          "The lower scan pops (2, 1) because (0, 0), (2, 1), (4, 0) is a right turn. The lower chain ends at (0, 0), (4, 0), (4, 3).",
          "The upper scan, right to left, also pops (2, 1). After dropping duplicated ends the hull is the four corners.",
        ], [
          { prompt: "On (0, 0), (1, 1), (2, 0), does the lower scan keep (1, 1)? Is that point still a hull vertex?", answer: "No. The cross product of that triple is -2, a right turn, so the lower scan pops (1, 1). The upper scan keeps it. All 3 points are hull vertices." },
          { prompt: "A lower scan runs on n = 9 points. At most how many pops can it perform, and which term still dominates the whole hull algorithm?", answer: "At most 9 pops, one per point. The scan is linear. The sort, on the order of n log n comparisons, still dominates." },
        ]),
        lec("l3", "Crossings by a vertical sweep", [
          "You find segment crossings by sweeping a vertical line from left to right. The status stores the segments that meet the sweep line, ordered by the y where they cross it. Two segments can begin an intersection only after they become neighbors in that order, so you test neighbors rather than every pair. With 4 segments the naive pair count is 6. The sweep tests a pair only when the status makes them adjacent.",
          "You handle endpoints as events. A left endpoint inserts a segment and creates at most 2 new neighbor pairs. A right endpoint deletes a segment. For n segments and k crossings, a balanced status tree costs about (n + k) log n steps. Take n = 4 and k = 1. You still report that single crossing, and you do not pay a quadratic 6 for every input of this size when some segments never become neighbors.",
        ], { kind: "pipeline", caption: "Report one neighbor crossing", stages: ["Insert the left ends", "Test the new neighbors", "Queue the crossing", "Swap their order"] }, "Two segments cross at (2, 2)", [
          "Segment P runs from (0, 0) to (4, 4), so y = x. Segment Q runs from (0, 4) to (4, 0), so y = 4 - x.",
          "Both left endpoints lie at x = 0, so the two segments are neighbors and you are allowed to test that pair.",
          "Set x = 4 - x. Then x = 2 and y = 2. The sweep reports (2, 2) and swaps the order just to the right of it.",
        ], [
          { prompt: "Just to the right of x = 2, which of P and Q is above the other?", answer: "P is above Q. For x greater than 2, y = x exceeds y = 4 - x. The sweep swaps them at the crossing." },
          { prompt: "Five segments give how many naive pairs? Why can the sweep test fewer than that?", answer: "5 times 4 over 2 equals 10 naive pairs. The sweep tests a pair only when the two segments are neighbors on the sweep line, so separated segments are never paired." },
        ]),
        lec("l4", "Ears and a triangulation count", [
          "You triangulate a simple polygon with n vertices into n - 2 triangles, using n - 3 diagonals. One diagonal clips a triangle and leaves a polygon on n - 1 vertices, which needs (n - 1) - 2 = n - 3 triangles, and adding the clipped triangle gives n - 2. For a hexagon, n = 6, so you draw 3 diagonals and obtain 4 triangles. The count does not depend on which legal diagonal you draw first.",
          "You find a legal diagonal by clipping an ear. An ear is three consecutive vertices a, b, c such that segment a-c lies inside the polygon and no vertex lies inside triangle abc. A simple polygon with n greater than 3 has at least 2 ears, so you do not get stuck. A convex hexagon has 6 ears. One reflex vertex leaves fewer ears, and the lower bound of 2 still holds.",
        ], { kind: "layers", caption: "Clipping a hexagon", rows: ["Start with 6 vertices", "Clip one ear, 5 left", "Clip again, 4 left", "Finish with 4 triangles"] }, "A convex quadrilateral", [
          "A convex quadrilateral has n = 4, so the formulas give n - 2 = 2 triangles and n - 3 = 1 diagonal.",
          "Either diagonal lies inside, and every vertex is an ear. Clip one vertex by drawing that single diagonal.",
          "The remainder is already a triangle, so you stop. Two triangles and one diagonal match the formulas.",
        ], [
          { prompt: "A simple polygon has n = 10 vertices. How many triangles, and how many diagonals, are in any triangulation?", answer: "Triangles: 10 - 2 = 8. Diagonals: 10 - 3 = 7." },
          { prompt: "You clip one ear from a polygon of 7 vertices. How many vertices remain, and how many triangles does that remaining polygon need?", answer: "6 vertices remain. That polygon needs 6 - 2 = 4 triangles. With the clipped ear, the original total is 5, matching 7 - 2." },
        ]),
        lec("l5", "Voronoi cells from bisectors", [
          "You define the Voronoi cell of a site as the points closer to that site than to any other. For 2 sites the boundary is the perpendicular bisector, and you get 2 unbounded cells. For 3 sites not on one line, the bisectors meet at the center of the circle through the sites. You compute that one center. Each cell is a convex region cut out by bisectors.",
          "You check the center on sites (0, 0), (6, 0), and (0, 6). A right triangle has its circumcenter at the midpoint of the hypotenuse, here (3, 3). The squared distance from (3, 3) to each site is 18. A query at (1, 1) has squared distance 2 to (0, 0) and 26 to each other site. The cell of the origin owns (1, 1).",
        ], { kind: "pair", caption: "Two sites, then three", leftTitle: "Two sites", rightTitle: "Three sites", left: ["One bisector line", "Two unbounded cells"], right: ["Bisectors meet once", "Vertex at (3, 3)"] }, "Right triangle, center (3, 3)", [
          "Sites A (0, 0), B (6, 0), and C (0, 6). The midpoint of B and C is (3, 3).",
          "Squared distance from (3, 3) to A is 9 + 9 = 18, and the distances to B and to C match it.",
          "The Voronoi vertex is (3, 3). The query (1, 1) has squared distances 2, 26, and 26, so A's cell owns it.",
        ], [
          { prompt: "Which site owns (5, 1)? Compare squared distances to A (0, 0), B (6, 0), and C (0, 6).", answer: "Squared distances are 26 to A, 2 to B, and 50 to C. B owns (5, 1)." },
          { prompt: "A point is equidistant from A and B and closer to both than to C. Why is it not interior to only one cell?", answer: "Equal distance to A and B puts it on their shared boundary. C does not own it. Boundary points are not interior to a single cell." },
        ]),
        lec("l6", "Empty circles and nearest sites", [
          "You draw a Delaunay edge when two Voronoi cells share a boundary. The test you run is the empty circle: keep a triangle when the circle through its vertices holds no other site. If a fourth site lies inside, you flip. On sites (0, 0), (6, 0), and (0, 6) there is no fourth site, so that one triangle is Delaunay and all 3 edges stay.",
          "You find a nearest neighbor among the Delaunay neighbors, not among all n - 1 other sites. In a convex quadrilateral, n = 4, one diagonal leaves two vertices of degree 2. Take the rectangle (0, 0), (4, 0), (4, 3), (0, 3) with diagonal (0, 0) to (4, 3). Vertex (4, 0) then has only 2 neighbors, (0, 0) and (4, 3). You compare those 2 distances, not 3.",
        ], { kind: "layers", caption: "Degree after one diagonal", rows: ["Four corners of a rectangle", "One diagonal is drawn", "Two vertices have degree 2", "Compare 2 distances, not 3"] }, "Nearest neighbor of (4, 0)", [
          "With diagonal (0, 0) to (4, 3), the neighbors of (4, 0) are (0, 0) and (4, 3).",
          "The distance to (4, 3) is 3. The distance to (0, 0) is 4. The non-neighbor (0, 3) is 5 away.",
          "The nearest site is (4, 3), at distance 3, and it is one of the 2 Delaunay neighbors.",
        ], [
          { prompt: "A site in a 12-point set has Delaunay degree 3. How many distances do you compute to find its nearest neighbor, against a full scan?", answer: "You compute 3 distances, not 11. The nearest neighbor is one of the Delaunay neighbors." },
          { prompt: "Point D lies strictly inside the circle through triangle ABC. Is ABC a Delaunay triangle?", answer: "No. The empty-circle test fails. You flip or rebuild so that every circumcircle is empty." },
        ]),
        lec("l7", "Rectangles on a kd-tree", [
          "You store points in a kd-tree by alternating split axes. The root splits on x, the children split on y, and the next level splits on x again. Each node owns an axis-aligned region. A query rectangle visits a node only when the regions meet, and it reports a point only when the point is inside. In 2D the cost is on the order of square root of n plus k hits.",
          "You can see a prune on 4 points: (1, 1), (2, 5), (6, 2), and (7, 6). The root splits at x = 6, left holding the first pair and right the second. The query x from 0 to 3 and y from 0 to 3 ends before the split. You drop the right child, skipping 2 points. The left side reports only (1, 1), so k = 1.",
        ], { kind: "layers", caption: "Prune at the root split", rows: ["Root cuts at x = 6", "Left holds two points", "Right child is dropped", "Report k = 1"] }, "Query that misses the right half", [
          "The root split at x = 6 puts (1, 1) and (2, 5) on the left and (6, 2) and (7, 6) on the right.",
          "The query rectangle stops at x = 3, so it cannot meet the right region. You skip 2 points in one test.",
          "On the left, (1, 1) lies inside x 0 to 3 and y 0 to 3. The point (2, 5) does not. You report k = 1.",
        ], [
          { prompt: "Same tree, but the query is x from 0 to 3 and y from 4 to 6. What is k, and which point is it?", answer: "k = 1, the point (2, 5). The right child is still pruned. (1, 1) has y = 1, outside 4 to 6." },
          { prompt: "The 2D range bound is on the order of square root of n plus k. For n = 100 and k = 3, what number is that?", answer: "Square root of 100 is 10, plus k = 3, which is 13. That is an order-of-cost expression, not a claim that every query touches exactly 13 nodes." },
        ]),
        lec("l8", "What you can now build", [
          "You can now build a convex hull, a Voronoi diagram with its Delaunay dual, and a kd-tree answer to a rectangle. Each one uses the orientation or distance tests you started with, including the cross product that equaled 8. For n = 8 a sort is about 24 comparisons. A triangulation with h hull vertices has 2n - 2 - h triangles. You name h before you use that formula.",
          "You keep hull answers and query answers apart. For n = 8 and h = 5 the formula gives 16 - 2 - 5 = 9 triangles, and the interior count is 8 - 5 = 3. A range query with k = 1 did not find those 3 interior points. It found the points inside one rectangle. You can build the objects, and you can say which number came from which question.",
        ], { kind: "pair", caption: "Hull count versus a query", leftTitle: "Hull, n = 8", rightTitle: "One range query", left: ["h = 5 extreme points", "9 triangles in the set"], right: ["Rectangle, not the hull", "Reports k = 1 only"] }, "Eight points, five on the hull", [
          "n = 8 and h = 5. The triangle count is 2 times 8 minus 2 minus 5.",
          "That is 16 - 2 - 5 = 9 triangles. Interior points are 8 - 5 = 3.",
          "A query with k = 1 answers a different question. The value 1 is not the interior count 3.",
        ], [
          { prompt: "A set has n = 10 and h = 6. How many triangles does a triangulation have, and how many points are interior?", answer: "Triangles: 2 times 10 minus 2 minus 6 = 12. Interior points: 10 - 6 = 4." },
          { prompt: "Combine the hull formula with a range count. For n = 8 and h = 5, how many triangles are there, and does a query result k = 1 equal the number of interior points?", answer: "Triangles: 16 - 2 - 5 = 9. Interior points: 3. The query result 1 is not 3. A rectangle count and a hull count are different questions." },
        ]),
      ],
    },
    {
      slug: "csce-626",
      lectures: [
        lec("l1", "Work, span, and Brent", [
          "You charge a parallel algorithm with two numbers. Work W is every operation a single processor would perform. Span S is the longest chain of dependent operations. Summing 8 numbers in a balanced tree uses W = 7 additions, because each addition removes one partial sum, and the span is S = 3, one level each time you halve 8 down to 1. You cannot report a parallel time from W alone.",
          "You turn work and span into a time on P processors with Brent's bound: T is at most W/P + S. On the sum of 8 numbers with P = 4, that is 7/4 + 3 = 4.75. A careful schedule stays inside the bound, and a careless assignment of additions to processors can idle everyone and do worse. The bound is an upper bound on a good schedule. It is not a promise about every schedule.",
        ], { kind: "layers", caption: "Adding eight ones", rows: ["8 leaves at the start", "4 sums on level 1", "2 sums on level 2", "1 total, span 3"] }, "Sum of eight ones", [
          "Pair 8 ones into four 2s, then two 4s, then a single 8.",
          "The additions are 4 + 2 + 1 = 7, so W = 7. The longest chain has S = 3 levels.",
          "With P = 4, Brent's bound is 7/4 + 3 = 4.75. The tree itself finishes in 3 levels if 4 processors are free at the first level.",
        ], [
          { prompt: "Sum 16 numbers in a balanced tree. What are W and S?", answer: "W = 15 and S = 4. You need 15 additions to leave one total, and log base 2 of 16 is 4." },
          { prompt: "On the sum of 8 numbers, what is Brent's bound with P = 2?", answer: "7/2 + 3 = 6.5. Fewer processors raise the bound from 4.75 to 6.5." },
        ]),
        lec("l2", "Speedup when the chain is short", [
          "You define speedup as sequential time divided by parallel time. If the sequential time is the work W, and no schedule beats the span S, then speedup is at most W/S. On the sum of 8 numbers, W/S = 7/3, about 2.33. A machine with 100 processors still cannot finish in fewer than 3 dependent steps. Most of those processors have no addition to run on the last level, where only 1 addition remains.",
          "You get efficiency by dividing speedup by P. The tree on 8 numbers finishes in 3 steps on P = 4, so speedup is 7/3 and efficiency is (7/3)/4 = 7/12. The first level has 4 additions and the last has 1, so those 4 processors cannot stay full. You match P to the width of the dag rather than to the machine you happen to own.",
        ], { kind: "pair", caption: "Same span, more processors", leftTitle: "P = 4", rightTitle: "P = 100", left: ["Finish in 3 steps", "Efficiency is 7/12"], right: ["Span still blocks you", "Speedup at most 7/3"] }, "Ceiling on the sum tree", [
          "Work is 7 and span is 3, so the speedup ceiling is 7/3.",
          "On 4 processors, finishing in 3 steps gives efficiency (7/3) divided by 4, which is 7/12.",
          "On 100 processors the span is still 3, so speedup cannot exceed 7/3. Extra processors do not shorten the chain.",
        ], [
          { prompt: "A dag has W = 100 and S = 5. What is the largest possible speedup if you buy P = 40?", answer: "Speedup is at most 100/5 = 20. Forty processors cannot beat span 5, so the ceiling stays 20, not 40." },
          { prompt: "The sum tree finishes in 3 steps on P = 4 with W = 7. What is the efficiency as a fraction?", answer: "Speedup is 7/3. Efficiency is (7/3)/4 = 7/12." },
        ]),
        lec("l3", "Prefix sums in two sweeps", [
          "You compute a prefix sum by replacing x1 through xn with the sums of the growing prefixes. A work-efficient scan uses two sweeps. The up-sweep is a reduction tree. The down-sweep fills each slot from a sibling partial sum. For n = 8 each sweep has depth 3, so the span of both is 6, while the work stays under about 2n additions. A sequential scan on the same array has a chain of length 8.",
          "You check n = 4 on the input 1, 2, 3, 4. The up-sweep writes 1, 3, 3, 7 and then 1, 3, 3, 10. Clear the total to 0 and the down-sweep yields exclusive prefixes 0, 1, 3, 6. Add the original entries to get inclusive prefixes 1, 3, 6, 10. Two sweeps have span 2 times log base 2 of 4, which is 4.",
        ], { kind: "pipeline", caption: "Up-sweep, then down-sweep", stages: ["Up-sweep to the total", "Clear the total to 0", "Down-sweep the prefixes", "Add the original entries"] }, "Scan of 1, 2, 3, 4", [
          "Up-sweep: the array becomes 1, 3, 3, 7 and then 1, 3, 3, 10.",
          "Set the last entry to 0 and down-sweep. The exclusive prefixes are 0, 1, 3, 6.",
          "Add the originals: 0+1, 1+2, 3+3, 6+4 gives the inclusive scan 1, 3, 6, 10.",
        ], [
          { prompt: "What is the inclusive prefix scan of 2, 2, 2, 2?", answer: "2, 4, 6, 8. Each entry is the sum of the inputs up through that index." },
          { prompt: "For n = 8, the work-efficient scan has span 2 times log base 2 of 8. What is that span, and why is it not 8?", answer: "Log base 2 of 8 is 3, so the span is 6. A sequential scan has a chain of length 8. The two sweeps cut the chain to 6 on this size." },
        ]),
        lec("l4", "Pointer jumping on a list", [
          "You rank a linked list by pointer jumping, since a tree scan needs random access. Each round sends a node to its successor's successor, so round r reaches 2 to the r hops ahead. A list of 8 nodes finishes in 3 rounds, because 2 cubed is 8. Each node starts at rank 1 and adds the rank it jumps over. One round reads the old ranks, then writes.",
          "You can finish a list of 4 nodes in 2 rounds. Ranks start at 1, 1, 1, 1. After round 1 they are 2, 2, 2, 1. After round 2 they are 4, 3, 2, 1, and the head holds the length 4. On a list of 8, one processor per node does 8 times 3 = 24 updates, and the span is 3. The original chain is now a log-depth circuit.",
        ], { kind: "flow", caption: "Ranks on four nodes", steps: ["Start at rank 1 each", "Round 1 writes 2, 2, 2, 1", "Round 2 writes 4, 3, 2, 1", "Head rank equals length 4"] }, "Ranking A, B, C, D", [
          "Nodes A, B, C, D start with ranks 1, 1, 1, 1.",
          "After one synchronous round the ranks are 2, 2, 2, 1.",
          "After the second round the ranks are 4, 3, 2, 1. The head holds 4, and the span was 2 rounds.",
        ], [
          { prompt: "A list has 16 nodes, each starting at rank 1. How many rounds does the head need, and what rank does it hold at the end?", answer: "4 rounds, because 2 to the 4th is 16. The head's rank is 16, the number of nodes from the head through the tail." },
          { prompt: "On the 4-node list, why is the second node's rank 3 rather than 4?", answer: "Three nodes remain from that node through the tail. Round 1 gave it rank 2, and round 2 added the tail's rank 1, totaling 3." },
        ]),
        lec("l5", "Area against time on a cut", [
          "You charge area when the schedule is laid out as a chip. A cut of w wires that must move n bits needs time T at least n/w, because one step moves at most w bits. If the cut length is w, this counting model takes area A at least w squared, and width 2 means area 4. Then A times T squared is at least n squared. You can trade area for time. You do not delete the product.",
          "You set n = 8 and w = 2. Time is at least 8/2 = 4, and area is at least 4. Then A T squared is at least 4 times 16 = 64, matching n squared. At w = 4, time falls to at least 2 and area rises to at least 16, and 16 times 4 is still 64. You buy time with area. In this model the product does not drop.",
        ], { kind: "pair", caption: "Two cuts, same product", leftTitle: "Width w = 2", rightTitle: "Width w = 4", left: ["Time at least 4", "Area at least 4"], right: ["Time at least 2", "Area at least 16"] }, "Eight bits through two wires", [
          "With w = 2, time is at least 8/2 = 4 steps.",
          "Area is at least w squared = 4, so A T squared is at least 4 times 16.",
          "That product is 64, equal to n squared. Widening to w = 4 still yields 16 times 4 = 64.",
        ], [
          { prompt: "For n = 8 you want T at most 2. What wire count does T at least n/w require, and what area follows?", answer: "w at least 8/2 = 4. Area at least 16. Then A T squared is at least 16 times 4 = 64." },
          { prompt: "Why do you reject a proposed layout with A = 4 and T = 2 for n = 8?", answer: "A T squared = 4 times 4 = 16, which is below n squared = 64. This counting model forbids it." },
        ]),
        lec("l6", "Fan-in lower bounds", [
          "You lower-bound span by fan-in before you draw a chip. A gate with 2 inputs forms a tree, so an output that depends on n bits needs depth at least log base 2 of n. Parity of 8 bits depends on every bit: flip one input and the output flips. The span is at least 3. Depth 2 sees at most 4 inputs, so it cannot compute parity on every 8-bit string.",
          "You see the same bound on a 3 by 3 window. Nine neighbors cannot feed one gate of fan-in 2. A binary tree on 9 leaves has depth 4, because depth 3 holds at most 8 leaves. One processor per pixel does not cut that depth. More pixels add work across the image. They do not shorten the chain inside the window.",
        ], { kind: "layers", caption: "Parity tree on eight bits", rows: ["8 input bits", "4 gates on level 1", "2 gates on level 2", "1 parity bit, depth 3"] }, "Parity of eight bits", [
          "The bits 1, 0, 1, 1, 0, 0, 1, 0 contain four 1s, so the parity is 0.",
          "A binary tree computes that bit in 3 levels: 4 gates, then 2, then 1.",
          "A circuit of depth 2 sees at most 4 inputs. It cannot be correct for every 8-bit string.",
        ], [
          { prompt: "Parity of 32 bits, gates of fan-in 2. What is the minimum depth?", answer: "Log base 2 of 32 is 5. A shallower circuit cannot depend on all 32 inputs." },
          { prompt: "Why is the depth of a binary sum of 9 window pixels at least 4, not 3?", answer: "Depth 3 has at most 8 leaves. The ninth pixel needs another level. Depth 4 is the minimum." },
        ]),
        lec("l7", "A short filter, scheduled", [
          "You schedule a width-3 filter as short chains. Each output adds a sample to its two neighbors. On n = 8 padded samples, each output does 2 additions, so the work is 16 and the span is 2. The 8 outputs are independent. Brent with P = 8 gives T at most 16/8 + 2 = 4. The short span is the local dependency, not the name of the task.",
          "You set that filter next to parity of the same 8 bits. Parity had work 7 and span at least 3, because the bit depends on all 8 inputs. The filter has more work, 16, and a shorter span, 2. A window of width 8 would force span at least 3 again. You read the bound from the dependency, not from the application name.",
        ], { kind: "pipeline", caption: "One output, three taps", stages: ["Read three samples", "Add the first pair", "Add the third sample", "Write that output"] }, "Third sample of 1 through 8", [
          "The window on the sample 3 covers 2, 3, and 4.",
          "Add 2 + 3 = 5, then 5 + 4 = 9. That output has span 2.",
          "Eight such outputs give work 16. With P = 8, Brent's bound is 16/8 + 2 = 4.",
        ], [
          { prompt: "Same filter, n = 8, but P = 4. What is Brent's bound?", answer: "16/4 + 2 = 6." },
          { prompt: "You widen the window from 3 taps to 8, so each output depends on all 8 samples. What replaces the span of 2?", answer: "A binary tree on 8 inputs has depth at least 3. The span is at least 3. The old span of 2 used the narrow window." },
        ]),
        lec("l8", "What you can now bound", [
          "You can now state work, span, and a Brent bound, rank a list by pointer jumping, and scan an array in two sweeps. You can also tell when a chip cut forbids a schedule the graph allowed. Summing 8 numbers has W = 7 and S = 3, so P = 4 yields 7/4 + 3 = 4.75. Moving 8 bits through w = 2 wires needs time at least 8/2 = 4.",
          "You hold the two limits apart. The span says the additions cannot finish before step 3. The cut says the wires cannot finish before step 4 if only 2 wires cross. A design with T = 3 can satisfy the tree and still be impossible as that layout. Parity of 8 bits also needs depth 3, the same number of rounds pointer jumping used on a list of 8. You write both bounds down before you claim a speedup.",
        ], { kind: "pair", caption: "Span versus the cut", leftTitle: "Addition tree", rightTitle: "Cut of width 2", left: ["Span S = 3", "Brent bound is 4.75"], right: ["Time at least 4", "Product at least 64"] }, "Three is not always enough", [
          "Summing 8 numbers has W = 7 and S = 3. Brent on P = 4 allows up to 4.75.",
          "Moving 8 bits on w = 2 wires needs T at least 4, with A T squared at least 64.",
          "Time 3 meets the span and misses the cut. You need time at least 4, or a wider cut.",
        ], [
          { prompt: "For the sum of 8 numbers on P = 4, is a running time of 4 allowed by both Brent and the w = 2 cut?", answer: "Yes. Brent allows up to 4.75, and the cut requires at least 4. Time 4 meets both. Time 3 meets the span and fails the cut." },
          { prompt: "Combine pointer jumping with fan-in. A list of 8 nodes is ranked in 3 rounds. Parity of those 8 weights needs depth at least 3. Can you compute that parity in depth 2 by skipping the ranking?", answer: "No. Fan-in 2 forces depth at least 3 on 8 bits, whether or not you also compute ranks. Ranking in 3 rounds matches that depth and returns every rank, not only the parity bit." },
        ]),
      ],
    },
    {
      slug: "csce-627",
      lectures: [
        lec("l1", "A stack for parentheses", [
          "You recognize balanced parentheses with a pushdown automaton: one state, one stack symbol X, and a bottom marker Z. On an open parenthesis you push X. On a close you pop X, and you reject if the top is not X. You accept at the end only when Z is on top. The input (()) pushes to height 2 above Z and then pops back to Z. The stack is the whole memory.",
          "You walk (()) one symbol at a time. After the first open the stack is Z X. After the second open it is Z X X. The first close leaves Z X, and the second close leaves Z, so you accept. The string (() ends with Z X still on the stack, so you reject even though every pop succeeded. Length 3 is enough to show both failures: a bad pop, and a nonempty stack at the end.",
        ], { kind: "flow", caption: "Stack while reading (())", steps: ["Push to stack Z X", "Push to stack Z X X", "Pop back to Z X", "Pop to Z and accept"] }, "Accepting (())", [
          "Start with Z alone. Two opens produce Z X X, height 2 above the marker.",
          "Two closes pop both X symbols and leave Z.",
          "The end test sees Z and accepts. The machine used one state and one stack.",
        ], [
          { prompt: "Trace () on this machine. Does it accept, and what is the maximum height above Z?", answer: "One open pushes X, height 1. One close pops it. The stack is Z, so you accept. The maximum height above Z is 1." },
          { prompt: "Trace the input ()). Where does the machine reject?", answer: "The open pushes X. The first close pops it and leaves Z. The second close sees Z rather than X and rejects." },
        ]),
        lec("l2", "The grammar that matches the stack", [
          "You generate the same strings with a grammar. The productions are S goes to ( S ) S, and S goes to the empty string. From S you rewrite to ( S ) S, then rewrite the inner S the same way, then erase every remaining S. The yield is (()). That derivation and the one-state machine agree on this string of length 4. The grammar builds the string. The automaton checks it.",
          "You can see why ()) has no derivation. Each use of S goes to ( S ) S adds one open and one close, and the empty production adds neither, so the two counts stay equal. The string ()) has 1 open and 2 closes. No sequence of productions yields it, which matches the stack machine rejecting it. One nonterminal is enough here because every unfinished suffix is another copy of S.",
        ], { kind: "pipeline", caption: "Derive (()) from S", stages: ["S becomes ( S ) S", "Inner S grows a pair", "Erase leftover S symbols", "Yield is (())"] }, "Three rewrites to (())", [
          "Start at S and apply S goes to ( S ) S.",
          "Apply that production again to the first S, producing ( ( S ) S ) S.",
          "Erase every S. The terminals left are (()). The stack machine accepts this same string of length 4.",
        ], [
          { prompt: "Derive () with these productions. How many uses of S goes to ( S ) S do you need?", answer: "One. S goes to ( S ) S, then both leftover S symbols become empty, yielding (). You do not need the second nesting step." },
          { prompt: "Does the grammar generate ())?", answer: "No. Each parentheses production adds one open and one close, so the counts stay equal. The string ()) has 2 closes and 1 open." },
        ]),
        lec("l3", "Pumping past the context-free sets", [
          "You prove that strings a^n b^n c^n are not context-free with the pumping lemma. The lemma gives a length p. The string with p letters of each kind splits into five pieces u, v, x, y, z, where v y is nonempty and the middle v x y has length at most p. A window that short sits in one block of letters or across 1 boundary. It cannot touch a's, b's, and c's together.",
          "You pump by setting i = 2, which inserts one extra copy of v and of y. Those copies add letters to at most two of the three blocks, so the equal counts break. Take p = 3 and the string aaabbbccc, and let the middle be the three b's with v equal to one b. The pumped string has 3 a's, 4 b's, and 3 c's. It is outside the language. Every other window fails the same way.",
        ], { kind: "pair", caption: "One pump breaks equality", leftTitle: "Before the pump", rightTitle: "After i = 2", left: ["3 a, 3 b, 3 c", "Middle sits in the b block"], right: ["3 a, 4 b, 3 c", "Counts are not equal"] }, "Pumping inside the b's", [
          "Let v x y be the three b's in aaabbbccc, and let v be a single b.",
          "The pumped string at i = 2 is aaa, then four b's, then ccc.",
          "The counts 3, 4, 3 are not equal, so the string leaves the language. The split did not stay inside.",
        ], [
          { prompt: "Same string aaabbbccc, but v y is the boundary pair bc. What are the counts after i = 2?", answer: "You add one b and one c. The counts become 3 a's, 4 b's, and 4 c's. The a count did not rise, so the string is outside the language." },
          { prompt: "Why can a window of length p = 3 not contain an a, a b, and a c inside a^3 b^3 c^3?", answer: "Three b's sit between the a's and the c's. Any three consecutive letters cover a and b, or b and c, but not all three letters." },
        ]),
        lec("l4", "A Turing machine you can step", [
          "You run a Turing machine as a table of steps: state, symbol read, symbol written, direction, next state. This machine accepts any tape that contains at least one 1. In state Scan, a 0 writes 0, moves right, and stays in Scan. A 1 writes 1, moves right, and enters Yes. A blank enters No. On the input 001 the head needs 3 steps to read the 1 and accept.",
          "You should notice that this machine always halts. Every step moves right, the input has length 3, and the blank ends the scan. It is a decider for this one language: every input stops with yes or no. Do not promote that fact into a claim about every machine. On 001 the first two steps read 0 and stay in Scan, and the third step reads 1 and enters Yes. You can point at the row that fired.",
        ], { kind: "flow", caption: "Scan 001 until a 1", steps: ["Read 0, move right", "Read 0, move right", "Read 1, enter Yes"] }, "Three steps on 001", [
          "Tape 0 0 1, head on the first 0, state Scan.",
          "Step 1 and step 2 each read 0, write 0, move right, and stay in Scan.",
          "Step 3 reads 1 and enters Yes. The machine accepts in 3 steps, the length of the input.",
        ], [
          { prompt: "Run the same machine on input 00. What happens, and does it halt?", answer: "Two steps cross the two 0 symbols, still in Scan. The next cell is blank, so the machine enters No and rejects. It halts. It does not accept." },
          { prompt: "Change the row for symbol 1 so the machine stays in Scan and moves right. Does input 001 still accept?", answer: "No. The head slides from the 1 onto the blank and then enters No. The Yes row was the only accepting step." },
        ]),
        lec("l5", "Recursion that stays primitive", [
          "You build primitive recursive functions from zero, successor, and projections, using composition and one recursion schema. The schema sets f(x, 0) to a base value and sets f(x, y+1) from x, y, and f(x, y) only. Addition fits: add(x, 0) = x, and add(x, y+1) is the successor of add(x, y). You compute add(2, 2) as add(2, 0) = 2, then 3, then 4. Two successors take you from 2 to 4.",
          "You cannot fit Ackermann's function into that schema, because a call increases the first argument, not only the second. It is still total, so some Turing machine computes it. Set A(0, n) = n + 1, A(m, 0) = A(m - 1, 1), and otherwise A(m, n) = A(m - 1, A(m, n - 1)). Then A(1, 0) = 2, A(1, 1) = 3, and A(1, 2) = 4. No primitive recursive definition gives the function.",
        ], { kind: "layers", caption: "add(2, 2) in two steps", rows: ["add(2, 0) equals 2", "add(2, 1) equals 3", "add(2, 2) equals 4"] }, "Ackermann at (1, 2)", [
          "A(1, 0) uses the zero rule: A(0, 1) = 2.",
          "A(1, 1) = A(0, A(1, 0)) = A(0, 2) = 3.",
          "A(1, 2) = A(0, A(1, 1)) = A(0, 3) = 4.",
        ], [
          { prompt: "Compute add(3, 2) with the same schema.", answer: "add(3, 0) = 3, add(3, 1) = 4, and add(3, 2) = 5. You apply successor twice to 3." },
          { prompt: "Compute A(2, 1) from the rules, using A(1, 1) = 3.", answer: "A(2, 0) = A(1, 1) = 3. Then A(2, 1) = A(1, 3). And A(1, 3) = A(0, A(1, 2)) = A(0, 4) = 5. So A(2, 1) = 5." },
        ]),
        lec("l6", "Why the halting decider breaks", [
          "You cannot build a decider H that always halts and says whether machine M halts on w. From H you build D. On input M, D asks H about M running on its own text. If H says halt, D loops. If H says loop, D halts. Run D on D. Each answer H might give is the opposite of what D then does. Both of the 2 branches contradict, so no such H exists.",
          "You can see the flip on 2 programs. Suppose P1 halts on P1 and P2 loops on P2. D does the opposite: it loops on P1 and halts on P2. D cannot be P1, because that cell would both halt and loop, and it cannot be P2 either. The real argument lists every program, including D. You add one row, and that row breaks the same way.",
        ], { kind: "pair", caption: "Flip the two diagonal cells", leftTitle: "What H claims", rightTitle: "What D does", left: ["P1 on P1 halts", "P2 on P2 loops"], right: ["D on P1 loops", "D on P2 halts"] }, "A diagonal that will not sit still", [
          "H claims P1 halts on its own text and P2 loops on its own text.",
          "D loops on P1 and halts on P2, the opposite of that diagonal.",
          "D cannot equal P1 or P2. A complete table would also need a row for D, and that row contradicts itself.",
        ], [
          { prompt: "Suppose H says that D halts on D. What does D actually do?", answer: "If H says halt, D loops. So D does not halt, and H's yes answer is wrong. A decider is not allowed that wrong answer." },
          { prompt: "The Scan machine accepts 001 in 3 steps. Does that one halting run show that H exists?", answer: "No. H must answer for every machine and every input. One machine you built to halt on one tape is a question H might be asked. It is not H." },
        ]),
        lec("l7", "Decidable, and still a long table", [
          "You call a language decidable when some Turing machine halts with the right yes or no on every input. The cost can still be unusable. Satisfiability on n boolean variables is decidable by trying every assignment, and there are 2 to the n of them. For n = 3 you try 8 rows. Each row plugs 3 bits into the formula. If any row is true you accept. If all 8 fail you reject. Adding one variable doubles the table.",
          "You keep that search away from the halting problem. The search halts because you wrote the bound 8 into the machine before it started. Halting has no bound, written from the input length, that works for every machine. Your Scan machine halted on 001 in 3 steps because you designed the moves. A decider for one language is not a procedure that predicts arbitrary machines. You name the bound that makes the procedure halt.",
        ], { kind: "pipeline", caption: "Search the eight rows", stages: ["Write the 3 bits", "Evaluate the formula", "Accept on a true row", "Reject if all 8 fail"] }, "The formula x and y and z", [
          "There are 8 assignments of three bits.",
          "The row 1, 1, 1 makes every conjunct true. The other 7 rows miss at least one variable.",
          "The decider accepts when it reaches that row. It would reject only after all 8 failed.",
        ], [
          { prompt: "How many assignments do you try for n = 4, and how does that compare with n = 3?", answer: "2 to the 4th is 16, twice the 8 rows for n = 3. One added variable doubles the search, and the procedure still halts." },
          { prompt: "Why does trying all 8 rows not solve the halting problem?", answer: "Those 8 rows exist because a formula in 3 variables has exactly that many assignments. A machine can run longer than any bound read off the input length. Halting has no such finite table." },
        ]),
        lec("l8", "What you can now separate", [
          "You can now build a stack machine and a grammar for parentheses, reject a^n b^n c^n by pumping, and run a 3-step Turing machine by hand. You can also separate three grades. Parentheses are context-free. Strings with equal blocks of a, b, and c are decidable and not context-free. Halting is not decidable. For n = 2 the string aabbcc has length 6, and one left-to-right scan counts 2, 2, and 2.",
          "You do not let that decider pretend to be H. On aabbcc the counts match and you accept. On aabbc the counts are 2, 2, and 1 and you reject. Both runs halt. H would have to answer for every machine, including the diagonal machine D. A language can sit outside the context-free languages and still have a decider that scans once. A decider for one language is not a halting oracle. You say which claim you actually proved.",
        ], { kind: "layers", caption: "Three grades, one skill", rows: ["Parentheses, one stack", "Equal blocks, one scan", "Halting, no decider"] }, "Counting aabbcc", [
          "One left-to-right scan of aabbcc counts 2 a's, then 2 b's, then 2 c's.",
          "The counts match, so the decider accepts and halts. On aabbc the counts are 2, 2, 1 and it rejects.",
          "This decider never takes a machine description. It cannot say whether D halts on D.",
        ], [
          { prompt: "The counts on aaabbbccc are 3, 3, and 3. Does the decider accept, and is the language context-free?", answer: "The decider accepts because the counts match. The language is still not context-free. Pumping already ruled out every grammar. Decidable is not the same as context-free." },
          { prompt: "Combine the stack machine with the halting diagonal. The parenthesis machine accepts (()) and halts, with stack height 2 in the middle. Why is that machine not the decider H?", answer: "H must take an arbitrary machine and input and say whether that run halts. The parenthesis machine only checks one string against a stack. The height-2 accept shows (()) is a yes for that language. It never runs D on D." },
        ]),
      ],
    },
    {
      slug: "csce-637",
      lectures: [
        lec("l1", "Polynomial time, measured in n", [
          "You place a language in P when a deterministic Turing machine decides it in at most c times n to the k steps, for fixed c and k. Even parity is one pass. On 101011, length 6, you flip state once per 1. There are 4 ones, an even count, so you accept by step 6. The exponent is 1. A bound that is not a fixed power of n is not a membership proof for P.",
          "You measure n in symbols of the input, not in the integer a binary string denotes. Trying all 2^m strings of length m is exponential in the length. For m = 10 you try 1024 strings, while m squared is only 100. When you claim a problem is in P, you name the machine and the exponent. A machine that always halts can still sit outside P. Halting is not the same promise as a polynomial budget.",
        ], { kind: "flow", caption: "Even parity in one pass", steps: ["Read the next bit", "Flip state on a 1", "Stop at the blank", "Accept when the count is even"] }, "Parity of 101011", [
          "The string 101011 has length 6, and the 1 bits are in positions 1, 3, 5, and 6.",
          "You flip four times. Four is even, so you accept.",
          "The scan finishes by step 6. That is n to the first power.",
        ], [
          { prompt: "Input 111000 has length 6. Do you accept, and how many flips do you make?", answer: "There are 3 ones, an odd count, so you reject. You flip 3 times and finish by step 6. Rejection is still inside P." },
          { prompt: "A procedure tries every binary string of length m = 10. How many strings is that, and why is the procedure outside a bound of m squared?", answer: "2^10 = 1024 strings. m squared is 100. The loop is already past a quadratic budget at this length, and the gap grows." },
        ]),
        lec("l2", "A certificate you can check", [
          "You place a language in NP when every yes input has a certificate that a deterministic checker accepts in polynomial time. For a boolean formula the certificate is an assignment. The formula (x or y) and (not x) has certificate x = 0, y = 1. You check 2 clauses. The first is true because y is 1. The second is true because x is 0. You do not try the other 3 assignments of 2 bits.",
          "You do not get a short certificate for a no input. That asymmetry is the content of NP. Even parity on length 6 is in P, hence in NP: the checker ignores any certificate and runs the 6-step scan. Membership in NP is the easy direction for a problem already in P. The interesting direction is a short check for a yes answer when you do not know a short way to find it.",
        ], { kind: "pair", caption: "Four rows versus one witness", leftTitle: "All 4 assignments", rightTitle: "One certificate", left: ["00, 10, and 11 fail", "Only 01 succeeds"], right: ["Bits x = 0, y = 1", "Check the 2 clauses"] }, "Checking x = 0, y = 1", [
          "Clause (x or y) becomes (0 or 1), which is true.",
          "Clause (not x) becomes not 0, which is true.",
          "Both clauses pass. You evaluated 1 assignment, not all 4.",
        ], [
          { prompt: "Is x = 1, y = 1 a certificate for (x or y) and (not x)?", answer: "No. The first clause is true, but (not x) is false. The checker rejects this pair. The passing certificate is x = 0, y = 1." },
          { prompt: "Why is even parity on an input of length 6 in NP?", answer: "A language in P is in NP. The checker runs the 6-step scan and may ignore the certificate. An even count is verified in polynomial time." },
        ]),
        lec("l3", "Reductions and a 4-cycle", [
          "You reduce A to B by a polynomial-time function f such that x is in A exactly when f(x) is in B. If B is in P, you decide A by computing f and running B's decider. Hardness reductions run from a problem you already know is hard, toward the problem you care about. Reducing an easy problem to a hard one proves nothing about the hard one. You can encode parity into a hard problem on 4 vertices.",
          "You can check one reduction on 4 vertices. Let the edges be 1-2, 2-3, 3-4, and 4-1, a 4-cycle. A set S is independent exactly when V minus S is a vertex cover. Take S = {1, 3}. No edge has both ends in S, so S is independent and has size 2. The complement {2, 4} hits every edge and has size 4 - 2 = 2. One construction answers both questions. You did not search the graph twice.",
        ], { kind: "pair", caption: "One subset, two names", leftTitle: "Independent set", rightTitle: "Vertex cover", left: ["S = {1, 3}", "Size 2, no inside edge"], right: ["Complement is {2, 4}", "Size 2, every edge hit"] }, "Cover from the complement", [
          "The graph is a 4-cycle: edges 1-2, 2-3, 3-4, and 4-1.",
          "S = {1, 3} contains no edge. It is an independent set of size 2.",
          "The complement {2, 4} meets all 4 edges. Its size is 4 - 2 = 2.",
        ], [
          { prompt: "Is S = {1, 2} independent in this 4-cycle, and is its complement a vertex cover?", answer: "No. {1, 2} contains edge 1-2. The complement is {3, 4}, which contains edge 3-4, so it is not a cover. The two failures match." },
          { prompt: "You reduce parity to vertex cover in polynomial time. Have you shown parity is NP-hard?", answer: "No. A reduction from A to B says B is at least as hard as A. Parity is in P. Hardness of vertex cover needs a reduction from a known hard problem into vertex cover." },
        ]),
        lec("l4", "Space, squared by Savitch", [
          "You place a language in PSPACE when a Turing machine decides it using polynomially many tape cells, reusing cells as time goes on. Time may be exponential while the cell count stays modest. Savitch's theorem says a nondeterministic machine that uses s cells can be simulated deterministically in on the order of s squared cells. You square the space, so 5 cells become 25. You do not keep the running time.",
          "You get the square from recursive reachability. To ask whether configuration A reaches B within t steps, you name a middle configuration M and ask two questions of length t/2. The depth is logarithmic in the number of configurations, and that number is exponential in s, so the depth is proportional to s. Each level stores one configuration of s cells. With s = 5 the product is on the order of 25 cells.",
        ], { kind: "layers", caption: "Split reachability at the middle", rows: ["Ask if A reaches B", "Name a middle M", "Two questions of half length", "Store s cells per level"] }, "Five cells become twenty-five", [
          "The nondeterministic machine uses s = 5 cells.",
          "The number of configurations is exponential in 5, so the recursion depth is proportional to 5.",
          "Space is on the order of 5 times 5 = 25 cells. Time may grow much faster than that. You squared space, not time.",
        ], [
          { prompt: "A nondeterministic machine uses s = 4 cells. On the order of how many cells does the deterministic simulation use?", answer: "4 squared = 16 cells. The theorem squares the space bound. It does not say the simulation runs in 16 steps." },
          { prompt: "Why store the middle configuration instead of the whole path?", answer: "The path can be exponential in s. Storing it would break the space bound. One middle configuration, with the space reused on the two half questions, costs s cells per level." },
        ]),
        lec("l5", "One-sided error, repeated", [
          "You place a language in RP when a randomized polynomial-time machine has one-sided error. On a no input it always says no. On a yes input it says yes with probability at least 1/2. Independent repetition cuts the miss probability. One yes trial fails with probability at most 1/2, so 2 failures have probability at most 1/4, and 3 failures have probability at most 1/8. A no input still never produces a yes.",
          "You treat BPP as two-sided error at most 1/3 on every input, cut down by a majority of repeated trials. RP is the one-sided case. Neither class is known to leave P, and you are not asked to settle that. After 3 RP trials on a yes input, the chance that every trial missed is at most 1/8, so the chance you saw a yes is at least 7/8.",
        ], { kind: "pipeline", caption: "Repeat an RP trial", stages: ["Run one trial", "Accept on the first yes", "Otherwise repeat", "Stop by trial 3"] }, "Three misses at one eighth", [
          "On a yes input, one trial fails with probability at most 1/2.",
          "Two independent failures have probability at most 1/4. Three have probability at most 1/8.",
          "The chance of at least one yes by trial 3 is at least 1 - 1/8 = 7/8. A no input still yields no yes answers.",
        ], [
          { prompt: "An RP yes input is tested twice, and one trial fails with probability at most 1/2. What is the probability both fail?", answer: "At most 1/4. Independent trials multiply. You do not add the two probabilities." },
          { prompt: "Why can repetition not turn an RP no input into a yes?", answer: "On a no input every trial says no. Repeating those no answers still yields no. The fraction 1/8 applies only to missing a yes input." },
        ]),
        lec("l6", "AND states and OR states", [
          "You read an alternating machine as AND states and OR states. An OR state accepts if some move accepts. An AND state accepts if every move accepts. Alternating polynomial time decides exactly PSPACE, the class whose deterministic space Savitch squared. A quantified boolean formula is the same idea in logic. Exists is an OR over a bit. Forall is an AND over a bit. You evaluate the 2 quantifiers from the outside.",
          "You evaluate exists x forall y of (x or not y) on single bits. Pick x = 1. Then both y = 0 and y = 1 make the clause true, so the AND accepts on 2 values and the OR accepts. Pick x = 0 and y = 1 fails, so that branch dies. One good x is enough. You checked 2 values of y.",
        ], { kind: "pair", caption: "Two choices of the bit x", leftTitle: "Pick x = 1", rightTitle: "Pick x = 0", left: ["y = 0 succeeds", "y = 1 succeeds"], right: ["y = 0 succeeds", "y = 1 fails"] }, "A sentence that is true", [
          "Choose x = 1. For y = 0 the clause (1 or not 0) is true.",
          "For y = 1 the clause (1 or not 1) is true. Both AND branches accept.",
          "Exists therefore succeeds. You do not need the failing branch x = 0.",
        ], [
          { prompt: "Evaluate exists x forall y of (x and y) on one-bit variables.", answer: "False. For x = 1, y = 0 makes (1 and 0) false, so forall fails. For x = 0 both values of y fail. Exists finds no good x." },
          { prompt: "When you accept exists x forall y of (x or not y) by picking x = 1, how many values of y do you still check?", answer: "Both of them, 2 values. Exists lets you ignore x = 0, but the inner forall still requires y = 0 and y = 1." },
        ]),
        lec("l7", "Oracles the diagonal does not cross", [
          "You say a proof relativizes when it still works after every machine in it receives the same oracle, a box that answers one membership question in 1 step. There is an oracle that makes P and NP equal, and a different oracle that separates them. A proof that P equals NP, or that it does not, needs an ingredient that fails for at least one of those oracles. A technique that survives every oracle cannot finish the question alone.",
          "You can still diagonalize a time bound. That argument relativizes. Build a language decided in about n squared steps that no n-step machine decides. For n = 4, simulate the fast machine for 16 steps and flip its bit. It is wrong on that input. The flip does not separate P from NP: an oracle can add questions the simulation never counts. You keep the hierarchy. You do not promote it.",
        ], { kind: "flow", caption: "Flip one fast machine", steps: ["Take an input of length 4", "Simulate for 16 steps", "Output the opposite bit", "That fast machine is wrong"] }, "Budget 4 against budget 16", [
          "An n-step machine on n = 4 has a budget of 4.",
          "The diagonal language may use about n squared steps, here 16, which is enough to see the fast answer.",
          "You write the opposite bit. This fast machine and the diagonal language disagree on the input.",
        ], [
          { prompt: "For n = 5, how many steps does the n-squared simulation get, and why is that enough to flip an n-step machine?", answer: "5 squared = 25 steps. The fast machine stops by step 5, so 25 steps can read its answer and write the opposite bit." },
          { prompt: "Why does the same flip not prove that P differs from NP?", answer: "Some oracles make P and NP equal, and some separate them. A proof that treats every oracle the same way cannot give both outcomes. The flip separates time budgets. It does not, alone, separate P from NP." },
        ]),
        lec("l8", "What you can now place", [
          "You can now put a language in P with a power of n, put it in NP with a certificate, and carry hardness along a polynomial reduction. You can square a space bound, cut an RP miss probability from 1/2 to 1/8 in 3 trials, evaluate two quantifiers, and say why a relativizing flip does not settle P against NP. On the 4-cycle, the independent set {1, 3} and the cover {2, 4} are one fact said twice.",
          "You match the claim to the witness. Certificate x = 0, y = 1 shows a formula is in NP: the checker reads 2 clauses. It does not show NP-hardness, which needs a reduction from a known hard problem. For n = 4 the hierarchy simulation used 16 steps. Savitch on s = 4 uses about 16 cells. Those two copies of 16 are not the same resource.",
        ], { kind: "pair", caption: "Two different sixteens", leftTitle: "Time hierarchy", rightTitle: "Savitch space", left: ["n = 4 gives 16 steps", "Flip the fast answer"], right: ["s = 4 gives 16 cells", "Square the space bound"] }, "A certificate is not completeness", [
          "Certificate x = 0, y = 1 makes both clauses of (x or y) and (not x) true. That places satisfiability in NP.",
          "Separately, n = 4 yields 16 simulation steps, and s = 4 yields about 16 cells.",
          "The shared numeral 16 does not identify steps with cells, and the 2-bit certificate does not prove NP-completeness.",
        ], [
          { prompt: "A 2-bit certificate passes a 2-clause check. Have you proved the language is NP-complete?", answer: "No. You have membership in NP. Completeness also needs a reduction from a known NP-complete problem, or from every language in NP. The certificate is only the membership direction." },
          { prompt: "Combine the hierarchy with Savitch. For n = 4 and s = 4 both calculations produce 16. What does each 16 count, and does the match identify time with space?", answer: "The hierarchy gets 16 steps, from 4 squared. Savitch gets about 16 cells, from 4 squared. Steps are not cells. Equal numerals do not make the resources the same." },
        ]),
      ],
    },
    {
      slug: "csce-640",
      lectures: [
        lec("l1", "One qubit, one gate X", [
          "You write a one-qubit state as a|0> + b|1>, with real amplitudes whose squares sum to 1. The state |0> has a = 1 and b = 0. A circuit is an ordered list of gates. The gate X swaps the two amplitudes, so X applied to |0> returns |1>. Measurement returns 0 with probability a squared and 1 with probability b squared. After one X those probabilities are 0 and 1.",
          "You apply gates from the input outward, one at a time, on a state you can write. On this circuit the input is |0>, the list is a single X, and the output is |1>. Measurement returns the bit 1 with probability 1. A second X swaps back to |0>, so the probability of 0 is again 1. Two gates on one qubit give you an identity you can check without any hidden notation.",
        ], { kind: "pipeline", caption: "Send |0> through X", stages: ["Start in state |0>", "Apply the gate X", "State is now |1>", "Measure the bit 1"] }, "X, then X again", [
          "Start at |0>: amplitude 1 on |0> and amplitude 0 on |1>.",
          "One X swaps them. A measurement returns 1 with probability 1 squared, which is 1.",
          "A second X swaps back to |0>. Two X gates cancel, and the probability of measuring 0 is 1.",
        ], [
          { prompt: "You apply X three times to |0>. What is the state, and what is the probability of measuring 1?", answer: "Three swaps end at |1|. The probability of measuring 1 is 1. Two swaps would have returned |0>." },
          { prompt: "A state has amplitude 0 on |0> and amplitude -1 on |1>. What is the probability of measuring 1?", answer: "(-1) squared is 1. The sign is invisible to the probability. You measure 1 with certainty." },
        ]),
        lec("l2", "Hadamard, and a second Hadamard", [
          "You use the Hadamard gate H to send |0> to (|0> + |1>) divided by the square root of 2, and to send |1> to (|0> - |1>) divided by the same square root. Each outcome then has probability 1/2, because each amplitude squares to 1/2. H builds a uniform superposition. It does not itself emit a random bit. The measurement is what turns the two amplitudes into a bit.",
          "You cancel two Hadamard gates. H on |0> produces the superposition above. H on that result sends the |0> piece and the |1> piece through H again. The |1> amplitudes cancel, and the |0> amplitudes add to 1, so the state returns to |0>. Measurement then returns 0 with probability 1. The circuit of 2 Hadamards is the identity on this input. You checked it by adding two explicit states.",
        ], { kind: "pair", caption: "One H, then another", leftTitle: "After one H", rightTitle: "After two H gates", left: ["Each outcome has chance 1/2", "State is not |0>"], right: ["Back to state |0>", "Measure 0 for certain"] }, "H twice returns |0>", [
          "Start at |0> and apply H. The state is (|0> + |1>) divided by the square root of 2.",
          "Apply H again. The |1> amplitudes cancel and the |0> amplitudes add to 1.",
          "The state is |0>. Measurement returns 0 with probability 1. You used 2 gates.",
        ], [
          { prompt: "Apply H once to |0> and measure. What is the probability of outcome 1?", answer: "The amplitude of |1> is 1 over the square root of 2. Its square is 1/2." },
          { prompt: "The input is |0> and you want |0> at the output using only H. How many H gates do you use, and what is the probability of measuring 0?", answer: "Two. One H leaves the superposition. The second returns |0>, and the probability of measuring 0 is 1." },
        ]),
        lec("l3", "Deutsch on a one-bit function", [
          "You use Deutsch's algorithm to test a function f from one bit to one bit. Constant means f(0) equals f(1). Balanced means the two values differ. Classically the worst case takes 2 evaluations. The quantum circuit uses 1 query to an oracle that sends |x> |y> to |x> |y xor f(x)>. You put the target in (|0> - |1>) over the square root of 2. The oracle then multiplies |x> by -1 to the power f(x).",
          "You put H on the input, query once, and put H on the input again. If f is constant 0, every phase is +1, the two H gates cancel, and you measure 0. Constant 1 multiplies the whole state by -1, a sign you cannot see, and you still measure 0. If f(x) = x, the oracle negates only |1>, and the final H yields |1>. You measure 1 and report balanced. One query names the type.",
        ], { kind: "flow", caption: "One query, then measure", steps: ["H on the input qubit", "Query the oracle once", "H on the input again", "0 constant, 1 balanced"] }, "The balanced function f(x) = x", [
          "f(0) = 0 and f(1) = 1, so f is balanced. After the first H the input is (|0> + |1>) over the square root of 2.",
          "The oracle multiplies the |1> term by -1. The input becomes (|0> - |1>) over the square root of 2.",
          "The final H turns that state into |1>. You measure 1 and report balanced, after 1 query.",
        ], [
          { prompt: "f(0) = 1 and f(1) = 1. What do you measure on the input qubit, and which type is f?", answer: "You measure 0. The values match, so f is constant. The shared minus sign is global and does not change the measurement." },
          { prompt: "Why do 2 classical queries decide the type, and why is 1 classical query not enough in the worst case?", answer: "Two queries read f(0) and f(1). Matching values mean constant, and differing values mean balanced. After one classical query both types remain possible." },
        ]),
        lec("l4", "The same promise on two bits", [
          "You extend the promise to n = 2 bits, where a function has 4 inputs. Constant means one output on all 4. Balanced means the output 0 appears on exactly 2 inputs. Deutsch-Jozsa uses 1 quantum query. You measure the all-zero string when f is constant, and some nonzero string when f is balanced. You are separating a promise, not identifying an arbitrary function of 4 inputs.",
          "You need 3 classical queries in the worst case on these 4 inputs. Two answers of 0 still leave both promises open: the hidden pair might be 0, 0, which is constant, or 1, 1, which is balanced. A third query breaks the tie. Under the promise you never need the fourth query, so the classical number is 3 against 1 quantum query. Drop the promise and one quantum query no longer names an arbitrary f.",
        ], { kind: "pair", caption: "Two zeros, both promises", leftTitle: "Could be constant", rightTitle: "Could be balanced", left: ["Seen outputs 0 and 0", "Hidden pair is 0, 0"], right: ["Seen outputs 0 and 0", "Hidden pair is 1, 1"] }, "Why the third query exists", [
          "You query two of the four inputs and both return 0.",
          "Constant 0 still fits if the hidden pair is 0, 0. Balanced still fits if the hidden pair is 1, 1.",
          "A third classical query breaks the tie. The quantum circuit still uses 1 query.",
        ], [
          { prompt: "You have seen outputs 0, 0, and 1 on three inputs, and the promise holds. Is f constant or balanced, and do you query the fourth input?", answer: "Balanced. Constant is already impossible because you saw both 0 and 1. The unseen input must be 1 so that exactly two inputs return 1. You do not need to query it." },
          { prompt: "How many quantum queries does Deutsch-Jozsa use for n = 2, and how many classical queries are in the worst case?", answer: "1 quantum query, and 3 classical queries. All-zero measurement means the promised function is constant." },
        ]),
        lec("l5", "Grover on four marked-or-not items", [
          "You search N = 4 items for one marked item with Grover's iterate. Start from the uniform superposition, amplitude 1/2 on each item. The oracle flips the sign of the marked item. Diffusion replaces each amplitude a by 2 m - a, where m is the mean of the four amplitudes. One query finishes this N. Classically, with exactly one marked item, the worst case still looks at 3 items before the last item is forced.",
          "You compute the amplitudes. After the sign flip they are 1/2, 1/2, 1/2, and -1/2. The sum is 1 and the mean m is 1/4. An unmarked amplitude becomes 2 times 1/4 minus 1/2, which is 0. The marked amplitude becomes 2 times 1/4 minus -1/2, which is 1. You measure the marked item with probability 1. The other 3 amplitudes are 0. For larger N you would repeat about square root of N times. Here 1 iterate is exact.",
        ], { kind: "pipeline", caption: "One iterate on four items", stages: ["Start at amplitude 1/2", "Flip the marked sign", "Reflect about the mean", "Measure the marked item"] }, "Mean one fourth, then a spike", [
          "After the oracle the amplitudes are 1/2, 1/2, 1/2, -1/2. Sum 1, mean 1/4.",
          "Unmarked update: 2 times 1/4 minus 1/2 = 0. Marked update: 2 times 1/4 plus 1/2 = 1.",
          "Measurement returns the marked item with probability 1. You used 1 oracle query.",
        ], [
          { prompt: "Before diffusion, with amplitudes 1/2, 1/2, 1/2, -1/2, what is the probability of measuring the marked item?", answer: "(-1/2) squared is 1/4. Each unmarked item also has probability 1/4. The sign flip alone does not concentrate the probability." },
          { prompt: "After diffusion, how many of the 4 amplitudes are 0, and what is the probability of a wrong item?", answer: "The other 3 amplitudes are 0. The probability of a wrong item is 0. The marked probability is 1." },
        ]),
        lec("l6", "A Bell state is not two copies", [
          "You treat (|00> + |11>) over the square root of 2 as one joint state. The probability of 00 is 1/2 and of 11 is 1/2. The probability of 01 or of 10 is 0. Measure the first qubit as 0 and the second is |0>. Measure 1 and the second is |1>. Two independent copies of (|0> + |1>) over the square root of 2 would also yield 01 and 10. This state does not.",
          "You cannot clone an unknown qubit with a linear circuit. Suppose a map sends |0>|0> to |0>|0> and |1>|0> to |1>|1>. On (|0> + |1>) over the square root of 2, times |0>, linearity emits (|00> + |11>) over the square root of 2. A real copy would be the product of the superposition with itself, four basis terms each of amplitude 1/2. Two terms are not four terms. The map made the Bell state, not two copies.",
        ], { kind: "pair", caption: "Four terms versus two", leftTitle: "A real copy", rightTitle: "The linear image", left: ["Four basis terms", "Each amplitude is 1/2"], right: ["Only |00> and |11>", "01 and 10 have chance 0"] }, "Why the cloner misses |+>", [
          "The input is (|0> + |1>) over the square root of 2, beside a fresh |0>.",
          "Linearity emits (|00> + |11>) over the square root of 2.",
          "A true copy expands to four basis states, each of amplitude 1/2. Two terms are not that copy.",
        ], [
          { prompt: "You measure (|00> + |11>) over the square root of 2 and the first qubit is 1. What is the second qubit, and what is the probability of this branch?", answer: "The second qubit is |1>. The probability is 1/2, the square of 1 over the square root of 2. Outcome 10 has probability 0." },
          { prompt: "How many basis terms are in the product of the superposition with itself, and how many are in the Bell state?", answer: "The product has 4 terms. The Bell state has 2. The linear map lands on the 2-term state, not on the 4-term copy." },
        ]),
        lec("l7", "H then CNOT builds the pair", [
          "You prepare that Bell state with 2 gates from |00>. Hadamard on the first qubit yields (|00> + |10>) over the square root of 2. CNOT, control on the first qubit and target on the second, turns |10> into |11> and leaves |00> alone. The state is (|00> + |11>) over the square root of 2. H made the superposition. CNOT wrote the control bit onto the target.",
          "You still measure 00 or 11, each with probability 1/2. This circuit uses 0 oracle queries, 1 Hadamard, and 1 CNOT. If the first qubit measures 0, the second is |0> on a branch of probability 1/2. Order matters: CNOT first on |00> does nothing, and a later H leaves (|00> + |10>) over the square root of 2. That is a product state, not the Bell state.",
        ], { kind: "pipeline", caption: "Two gates from |00>", stages: ["Start from |00>", "H on the first qubit", "CNOT onto the second", "Two nonzero amplitudes"] }, "Build, then read 00", [
          "After H, |00> and |10> each have amplitude 1 over the square root of 2.",
          "CNOT sends |10> to |11> and leaves |00> fixed.",
          "The probability of 00 is 1/2 and the probability of 11 is 1/2. Amplitude on |01> and on |10> is 0.",
        ], [
          { prompt: "What is the probability of measuring 01 after H then CNOT on |00>?", answer: "0. The only nonzero amplitudes are on |00> and |11>, each with probability 1/2." },
          { prompt: "You apply CNOT before H, starting from |00>, same control and target. What state do you get?", answer: "CNOT leaves |00> unchanged. H then yields (|00> + |10>) over the square root of 2. That is a product state, not the Bell state. The order was the mechanism." },
        ]),
        lec("l8", "What you can now calculate", [
          "You can now apply X and H, read a probability as an amplitude squared, and run Deutsch's one-query test. You can run one Grover iterate on N = 4, where the marked amplitude becomes 1, and you can build (|00> + |11>) over the square root of 2 with H then CNOT. A probability is a square: 1 over the square root of 2, squared, is 1/2. Every amplitude in these circuits was written down.",
          "You add query bills without mixing promises. Deutsch uses 1 quantum query against a classical worst case of 2. Grover on 4 items uses 1 quantum query against a classical worst case of 3. The quantum total is 2 and the classical worst-case total is 5. The sum is not a new algorithm. One promise is constant versus balanced. The other is one marked item among 4.",
        ], { kind: "pair", caption: "Add the two query bills", leftTitle: "Quantum queries", rightTitle: "Classical worst case", left: ["Deutsch costs 1", "Grover costs 1"], right: ["Deutsch costs 2", "Grover costs 3"] }, "Two queries against five", [
          "Deutsch queries once and measures 0 on a constant function.",
          "Grover queries once on N = 4 and leaves the marked amplitude at 1.",
          "Quantum total: 1 + 1 = 2. Classical worst-case total: 2 + 3 = 5. The gap on this pair is 3 queries.",
        ], [
          { prompt: "You run Deutsch and the 4-item Grover search as above. How many quantum queries, and how many classical worst-case queries, do you spend in total?", answer: "Quantum: 1 + 1 = 2. Classical worst case: 2 + 3 = 5." },
          { prompt: "Combine the Bell state with Deutsch's outcome. The probability of measuring 11 on (|00> + |11>) over the square root of 2 is what, and why is that not the same fact as Deutsch measuring 1 on a balanced function?", answer: "The Bell probability is 1/2. Deutsch's 1 is a one-qubit label for a balanced function, not a probability of 1/2 and not a two-qubit outcome. The shared symbol 1 does not make them one experiment." },
        ]),
      ],
    },
    {
      slug: "csce-653",
      lectures: [
        lec("l1", "Absolute error and truncation", [
          "You report absolute error and relative error as different divisions. Absolute error is the absolute value of approximate minus true. Relative error divides that by the absolute value of the true value. Approximate 1/3 by 0.3, that is 3/10. The difference 3/10 - 1/3 has absolute value 1/30. Divide by 1/3 and the relative error is 1/10. An absolute miss of 1/30 is a different story when the true value is near 1000. You state the scale.",
          "You separate truncation from rounding. The series for e to the x starts 1 + x + x squared over 2. Keep only 1 + x. At x = 0.1 the first dropped term is 0.01 / 2 = 0.005. That is truncation. Rounding is storing 1/3 as 0.3, which made the absolute error 1/30. You can round little and still truncate badly. Name the ledger before you compare methods.",
        ], { kind: "pair", caption: "Two errors for one third", leftTitle: "Absolute error", rightTitle: "Relative error", left: ["3/10 minus 1/3", "Absolute value 1/30"], right: ["Divide that by 1/3", "Relative error is 1/10"] }, "Missing one third by 0.3", [
          "The difference 3/10 - 1/3 equals -1/30.",
          "The absolute error is 1/30. The relative error is (1/30) divided by (1/3), which is 1/10.",
          "At x = 0.1, cutting the exponential series after 1 + x drops a first term of size 0.005. That ledger is truncation.",
        ], [
          { prompt: "Approximate 1/3 by 33/100. What is the absolute error as a fraction?", answer: "The absolute value of 33/100 - 1/3 is 1/300. That is smaller than 1/30, the error of 3/10." },
          { prompt: "You keep terms through x squared over 2 for e to the x at x = 0.1, and you drop x cubed over 6. What is the size of that first dropped term?", answer: "x cubed is 1/1000, divided by 6 is 1/6000. Keeping the quadratic term replaced a drop of 0.005 by a drop of 1/6000." },
        ]),
        lec("l2", "Bisection, then a tangent", [
          "You bracket a root by bisection when a continuous function changes sign. For f(x) = x squared - 2 on [1, 2], f(1) = -1 and f(2) = 2. The midpoint 1.5 has f(1.5) = 0.25, so the root lies in [1, 1.5]. One halving cuts the width from 1 to 1/2. After k steps the width is 1 over 2 to the k. You always keep a bracket. You do not need the derivative for this method.",
          "You drop the bracket when you use Newton's update, x minus f(x) divided by f'(x). Here the derivative is 2x. From x = 1 the next value is 1 - (1 - 2) / 2 = 1.5. One more step is 1.5 - (2.25 - 2) / 3 = 1.5 - 1/12 = 17/12. You followed the tangent. If the derivative at your start is 0, the division is undefined and you do not take the step.",
        ], { kind: "flow", caption: "Two Newton steps from 1", steps: ["Start at x = 1", "First update is 1.5", "Second update is 17/12"] }, "From 1.5 down to 17/12", [
          "f(1.5) = 2.25 - 2 = 0.25, and the derivative at 1.5 is 3.",
          "Subtract 0.25 / 3 = 1/12 from 1.5.",
          "1.5 is 18/12, so 18/12 - 1/12 = 17/12. That is the second Newton approximation.",
        ], [
          { prompt: "Continue bisection from [1, 1.5]. The midpoint is 1.25 and f(1.25) is negative. What is the next bracket, and what is its width?", answer: "The sign change is between 1.25 and 1.5, so the bracket is [1.25, 1.5]. The width is 0.25, which is 1/4 after two halvings of the original width 1." },
          { prompt: "Take one Newton step on the same f starting at x = 2. What value do you get?", answer: "f(2) = 2 and f'(2) = 4, so you compute 2 - 2/4 = 1.5." },
        ]),
        lec("l3", "A line, then a square", [
          "You get the line through two samples from the slope. Points (0, 1) and (2, 5) have slope (5 - 1)/(2 - 0) = 2, so y = 1 + 2x. At x = 1, with no sample, you predict 3. Two distinct x values fix degree 1. A third sample generally forces a quadratic. You drop the line when the third point misses it.",
          "You can watch that line miss a square. Samples of x squared at 0 and 2 are (0, 0) and (2, 4), so the line is y = 2x. At x = 1 the line says 2 and the function says 1. The absolute error is 1. Add (1, 1) and the quadratic is y = x squared, with error 0 at x = 1. Matching degree removes this polynomial error. It does not repair a bad sample.",
        ], { kind: "pair", caption: "Line against the square", leftTitle: "Line on the ends", rightTitle: "Quadratic, three points", left: ["Predicts 2 at x = 1", "True value is 1"], right: ["Hits the middle sample", "Error at x = 1 is 0"] }, "Error 1 on the chord", [
          "Samples of x squared at 0 and 2 are 0 and 4. The slope is 2, and the line is y = 2x.",
          "At x = 1 the line returns 2 and the function returns 1. Absolute error 1.",
          "The extra sample (1, 1) makes the interpolant y = x squared, so the error at x = 1 drops to 0.",
        ], [
          { prompt: "The line through (0, 1) and (2, 5) is y = 1 + 2x. What does it return at x = 2 and at x = 3?", answer: "At x = 2 it returns 5, a sample you already have. At x = 3 it returns 7. The value 7 is past the last sample." },
          { prompt: "You interpolate x squared using only x = 0 and x = 2, then you evaluate at x = 1. What is the absolute error?", answer: "The line gives 2 and the function gives 1, so the absolute error is 1." },
        ]),
        lec("l4", "Trapezoid, then Simpson", [
          "You estimate an integral with one trapezoid: (b - a) / 2 times (f(a) + f(b)). Integrate x squared from 0 to 2. The antiderivative x cubed over 3 gives 8/3. The trapezoid sees f(0) = 0 and f(2) = 4, so the estimate is 4. The absolute error is 4 - 8/3 = 4/3. A single trapezoid on a bending graph misses by a visible amount. Here the miss is exactly 4/3, not a rounding artifact.",
          "You add the midpoint with Simpson: (b - a)/6 times (f(a) + 4 f(mid) + f(b)). On [0, 2] the mid value is f(1) = 1. Then 2/6 times (0 + 4 + 4) equals 8/3, and the error is 0. Simpson is exact on quadratics, and x squared is one, so the zero is by design. You now have 4 from the trapezoid and 8/3 from Simpson.",
        ], { kind: "pair", caption: "Same integral, two rules", leftTitle: "Trapezoid", rightTitle: "Simpson", left: ["Estimate equals 4", "Error equals 4/3"], right: ["Estimate equals 8/3", "Error equals 0"] }, "x squared from 0 to 2", [
          "The true integral is 8/3.",
          "The trapezoid returns 4, so the absolute error is 4 - 8/3 = 4/3.",
          "Simpson returns (1/3) times 8 = 8/3. The error is 0 because the integrand is a quadratic.",
        ], [
          { prompt: "Use the trapezoid rule on x squared from 0 to 1. What are the estimate, the true integral, and the absolute error?", answer: "The estimate is 1/2. The true integral is 1/3. The absolute error is 1/2 - 1/3 = 1/6." },
          { prompt: "Why is Simpson's error 0 on [0, 2] for x squared, while the trapezoid error is not?", answer: "Simpson is exact for quadratics, and x squared has degree 2. The trapezoid is exact for linear functions. Its error here is 4/3, not 0." },
        ]),
        lec("l5", "Elimination and a swap", [
          "You clear a 2 by 2 system by elimination, then back-substitute. Take x + y = 3 and 2x + y = 4. Subtract 2 times the first row from the second. You get -y = -2, so y = 2, then x + 2 = 3, so x = 1. One multiplier, the number 2, did the elimination. Both checks pass: 1 + 2 = 3 and 2 + 2 = 4.",
          "You swap when the pivot has smaller absolute value than the entry below it. The pivot 1 sits above 2, so partial pivoting swaps. The multiplier becomes 1/2, not 2. You still finish at y = 2 and x = 1. On this exact system the swap changes the arithmetic, not the answer. You swap so you do not divide by a smaller pivot.",
        ], { kind: "flow", caption: "Clear y, then find x", steps: ["Subtract 2 times row 1", "Read y = 2", "Back-substitute x = 1", "Check both original rows"] }, "One multiplier, two checks", [
          "Rows: x + y = 3 and 2x + y = 4. The multiplier is 2.",
          "The second row minus twice the first is -y = -2, so y = 2.",
          "Then x + 2 = 3, so x = 1. The checks are 3 and 4, both matching.",
        ], [
          { prompt: "Solve x + y = 5 and 3x + y = 7 by elimination without a swap. What are x and y?", answer: "Subtract 3 times the first row from the second to get -2y = -8, so y = 4. Then x + 4 = 5, so x = 1." },
          { prompt: "In the lecture system, why does partial pivoting refuse the multiplier 2?", answer: "The pivot 1 has smaller absolute value than the 2 below it. You swap, and the multiplier becomes 1/2. The solution remains x = 1, y = 2." },
        ]),
        lec("l6", "A cubic that does not corner", [
          "You use one cubic on each interval, matching value, slope, and second derivative at each interior knot. A natural spline sets the second derivative to 0 at both ends. Samples (0, 0), (1, 1), and (2, 0) make two intervals of width 1. The polyline through them is a linear spline with a corner at x = 1. The cubic is not allowed that corner.",
          "You check the piece 1.5 x - 0.5 x cubed. It is 0 at x = 0 and 1 at x = 1. Its second derivative -3x is 0 at x = 0, the natural end. At x = 0.5 it equals 0.75 - 0.0625 = 11/16. The linear spline returns 1/2, which is 8/16. The gap is 3/16. Matching the slope at the knot lifts the middle above the chord.",
        ], { kind: "layers", caption: "Values on the first cubic", rows: ["x = 0 gives value 0", "x = 0.5 gives 11/16", "x = 1 gives value 1"] }, "Chord versus 11/16", [
          "The cubic 1.5 x - 0.5 x cubed equals 1 at x = 1, the middle sample.",
          "At x = 0.5 it equals 0.75 - 0.0625 = 11/16.",
          "The straight segment from (0, 0) to (1, 1) equals 1/2 there. The cubic sits 3/16 higher.",
        ], [
          { prompt: "Evaluate 1.5 x - 0.5 x cubed at x = 1. Which sample does that check?", answer: "1.5 - 0.5 = 1, the sample (1, 1). The spline has to hit every sample, so this check must pass." },
          { prompt: "What does the linear spline return at x = 0.5, and what is the absolute gap versus 11/16?", answer: "It returns 1/2, which is 8/16. The gap is 11/16 - 8/16 = 3/16." },
        ]),
        lec("l7", "Euler steps and a second difference", [
          "You step y' = y, y(0) = 1, by Euler: add h times the current y. With h = 1/2 the first step is 1 + 1/2 = 3/2. The second is 3/2 + (1/2)*(3/2) = 9/4, now at t = 1. Each step multiplies by 3/2, so two steps multiply by 9/4. You replaced the solution curve by 2 straight segments. That replacement is the truncation.",
          "You approximate u'' by (u left - 2u + u right) over h squared. Take h = 1/2 and -u'' = 2, with u(0) = u(1) = 0. The true solution x(1 - x) equals 1/4 at x = 1/2. One interior node gives (0 - 2u)/(1/4) = -2, so -8u = -2 and u = 1/4. The node matches because this u is a quadratic and the second difference is exact on it.",
        ], { kind: "pipeline", caption: "Two Euler steps to t = 1", stages: ["Start at y = 1", "First step reaches 3/2", "Second step reaches 9/4", "Stop at time t = 1"] }, "Multiply by 3/2 twice", [
          "With h = 1/2, the first step is 1 + (1/2) times 1 = 3/2.",
          "The second step is (3/2) times (3/2) = 9/4.",
          "Separately, the difference equation for -u'' = 2 gives u(1/2) = 1/4, matching x(1 - x) at that node.",
        ], [
          { prompt: "Take one Euler step of size h = 1 for y' = y, y(0) = 1. What do you get at t = 1, and how does it differ from 9/4?", answer: "You get 1 + 1 = 2. Two steps of size 1/2 gave 9/4. Both approximate y(1), and 2 is not 9/4." },
          { prompt: "The second-difference equation produced -8u = -2. What is u?", answer: "u = 1/4. That equals x(1 - x) at x = 1/2." },
        ]),
        lec("l8", "What you can now check", [
          "You can now separate an absolute error of 1/30 from a truncation of size 0.005, bracket a root, and follow Newton's tangent. Two updates of x squared - 2, starting at 1, produced 17/12. The residual is 289/144 - 2 = 1/144. The derivative at 17/12 is 17/6. Divide the residual by that derivative: (1/144) times (6/17) = 1/408. That quotient estimates the absolute error. You still have the bracket method when the derivative vanishes.",
          "You keep integral error and differential error apart. Simpson on x squared from 0 to 2 returned 8/3 with error 0, exact on quadratics. Euler on y' = y, two steps of size 1/2, returned 9/4 at t = 1, which is not exact. You say which polynomial the rule matches. One of these errors is 0. The Newton estimate on a different problem was 1/408.",
        ], { kind: "pair", caption: "Residual versus exact integral", leftTitle: "Newton at 17/12", rightTitle: "Simpson on [0, 2]", left: ["Residual is 1/144", "Estimate of error 1/408"], right: ["Estimate is 8/3", "Error on this quadratic is 0"] }, "Divide 1/144 by 17/6", [
          "f(17/12) = 289/144 - 288/144 = 1/144. The derivative is 17/6.",
          "Divide: (1/144) times (6/17) = 1/408. That estimates the absolute distance to the root.",
          "Simpson's 8/3 needs no correction on x squared. Its error is 0, while 1/408 belongs to the root problem.",
        ], [
          { prompt: "If the residual stayed 1/144 but the derivative were 6, what absolute-error estimate would the division give?", answer: "(1/144) / 6 = 1/864. You divide the residual by the derivative. A different derivative changes the estimate." },
          { prompt: "Combine Euler and Simpson. Euler produced 9/4 at t = 1. Simpson produced 8/3 for the integral of x squared from 0 to 2. Which result is exact for its own problem, and what is 8/3 minus 9/4?", answer: "Simpson's 8/3 is exact for that integral. Euler's 9/4 is not exact for the exponential. The difference is 32/12 - 27/12 = 5/12, a comparison of two outputs, not an error term for either problem." },
        ]),
      ],
    },
];
