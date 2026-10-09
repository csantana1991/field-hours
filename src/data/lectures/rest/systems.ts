import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-605",
    lectures: [
      lec(
        "l1",
        "Longest match in the scanner",
        [
          "You scan source by running one automaton over the characters, and you keep the longest match. When the keyword if accepts and an identifier also accepts, you emit the longer lexeme, and equal lengths take the earlier rule. On the input ifx = 12 the identifier wins at length 3, so you do not emit the keyword if of length 2.",
          "You code the scan as a loop that reads one character and updates a state number. A small language needs about 6 kinds: keyword, identifier, integer, operator, punctuation, and whitespace you drop. When the next character has no edge, you emit the last accepting state and put that one character back, which is how 12 and a following semicolon stay two tokens.",
        ],
        {
          kind: "pipeline",
          caption: "One character at a time. The last accept, not the current state, is what you emit.",
          stages: ["Read one character", "Update one state", "Record last accept", "Emit and back up"],
        },
        "Scan ifx = 12",
        [
          "From the start state, i then f then x stay in the identifier. The accept length is 3, which beats the keyword if at length 2.",
          "The space has no identifier edge. You emit one identifier, ifx, and you put the space back for a fresh scan.",
          "You skip that 1 space. Then = is an operator and 12 is an integer. You emit four tokens, and the keyword rule never fires.",
        ],
        [
          {
            prompt: "The input is ifx. How many tokens do you emit, and of what kind?",
            answer: "One identifier of length 3. Longest match will not peel off the keyword if, because the third character still extends the lexeme.",
          },
          {
            prompt: "Why do you put one character back when the integer rule stops on 12;?",
            answer: "The semicolon has no edge out of the integer state. You emit 12 from the last accept, then rescan the semicolon as punctuation. Dropping it hides the separator from the parser.",
          },
        ],
      ),
      lec(
        "l2",
        "One token of lookahead",
        [
          "You parse by writing one procedure per nonterminal and choosing a production from a single lookahead token. The mechanism is the FIRST set: a token may start a production only if it belongs to that set. The grammar is LL(1) when the FIRST sets of a nonterminal's alternatives are disjoint, so one token selects at most one production. If two stmt alternatives both start with id, you must left-factor before the parser can decide.",
          "You consult FOLLOW when a production can derive the empty string. With one lookahead token, you take the empty alternative only if that token sits in FOLLOW of the nonterminal. An expression with + and * needs 2 precedence levels, which you encode as term and factor rather than one left-recursive expr rule. Left recursion would call the same procedure forever, before it consumes a single token.",
        ],
        {
          kind: "flow",
          caption: "Predictive descent uses one token because the FIRST sets do not overlap.",
          steps: ["Compute each FIRST set", "Require disjoint alternatives", "Predict from one token", "Expand that production"],
        },
        "Choose between assignment and if",
        [
          "stmt is either id = expr ; or if ( expr ) stmt. FIRST of the first alternative is {id}. FIRST of the second is {if}.",
          "Lookahead id selects the assignment. You consume id, then =, then an expr, then one semicolon. You never try the if production.",
          "Lookahead if selects the other production with that same one token. If both FIRST sets had contained id, the grammar would not be LL(1).",
        ],
        [
          {
            prompt: "Both productions for stmt start with id. Can you choose with one lookahead token?",
            answer: "No. Both FIRST sets contain id, so the grammar is not LL(1). You left-factor, pulling the common id out, before one token can decide.",
          },
          {
            prompt: "An optional else derives empty. When may you take that empty production?",
            answer: "Only when the single lookahead token is in FOLLOW of the statement. If it is not in FOLLOW, you must parse the else instead of stopping.",
          },
        ],
      ),
      lec(
        "l3",
        "Shift, reduce, and conflicts",
        [
          "A parser generator builds a shift-reduce table from your productions. Each state holds items that remember how far along a right-hand side you are. Shift pushes the next state. Reduce pops one state per symbol: a rule of 3 symbols pops 3 states, then goto pushes the state for the left-hand side. You do not hand-code that pop count once the table exists.",
          "You read conflicts from the same table. A shift/reduce conflict on + means one item wants to shift + and another wants to reduce. You close an operator conflict by assigning precedence and associativity. Left associativity of + reduces on a second +, so 1+2+3 becomes (1+2)+3 rather than (1+(2+3)). If you leave the conflict, the table is not a deterministic parser.",
        ],
        {
          kind: "pair",
          caption: "The same stack, two table actions. The pop count is the length of the right-hand side.",
          leftTitle: "Shift +",
          rightTitle: "Reduce +",
          left: ["Push the state for +", "Wait for the next operand", "Right associativity does this"],
          right: ["Pop the E + E rule", "Goto on E", "Left associativity does this"],
        },
        "Parse 1+2+3 left associative",
        [
          "You shift 1, shift +, and shift 2. The lookahead is now the second +.",
          "Left associativity reduces E + E before shifting that second +. The stack holds one E, and you have popped 3 states.",
          "You then shift +, shift 3, and reduce again. The only tree is (1+2)+3. Right associativity would have shifted the second + instead.",
        ],
        [
          {
            prompt: "A production has 3 symbols on its right-hand side. How many states does reduce pop?",
            answer: "3. Reduce pops one state per symbol, then goto pushes one state for the left-hand side.",
          },
          {
            prompt: "The table conflicts on +, and you mark + left associative. What tree do you build for 1+2+3?",
            answer: "(1+2)+3. Left associativity reduces the first plus when the second plus is the lookahead, instead of shifting it.",
          },
        ],
      ),
      lec(
        "l4",
        "Scopes and stack frames",
        [
          "You keep one symbol table per scope and link it to the enclosing scope. Lookup walks that chain and stops at the first hit, so an inner name shadows an outer name with the same spelling. In a procedure with 4 integer locals of 4 bytes, you assign offsets 0, 4, 8, and 12. The frame is 16 bytes before you add slots for saved registers.",
          "You place locals in the stack frame so 2 recursive calls get 2 frames. The call sequence you emit saves a return address and the frame pointer, then subtracts the frame size from the stack pointer. Parameters sit at fixed offsets from that pointer; a call with 2 arguments uses 2 slots and one sign convention. A static link stored in the frame lets a nested procedure read the enclosing activation.",
        ],
        {
          kind: "layers",
          caption: "One activation. Offsets are measured from the frame pointer you just saved.",
          rows: ["Return address", "Saved frame pointer", "Four locals, 4 bytes each", "Static link if nested"],
        },
        "Four integer locals",
        [
          "Locals a, b, c, and d are 4 bytes each. Their offsets are 0, 4, 8, and 12.",
          "Ignoring saved registers, the frame is 16 bytes. The prologue subtracts 16 from the stack pointer.",
          "A nested call stores a static link to this frame. A use of a loads offset 0 through that link, not from the inner frame.",
        ],
        [
          {
            prompt: "You add a fifth integer local of 4 bytes. What is its offset, and what is the frame size, still ignoring saved registers?",
            answer: "The offset is 16. The frame size becomes 20. Each local keeps the same 4-byte stride.",
          },
          {
            prompt: "Two recursive calls of this procedure are active. How many copies of local a exist?",
            answer: "Two. Each activation has its own frame, and a sits at offset 0 in that frame. One global slot would make the calls share a single a.",
          },
        ],
      ),
      lec(
        "l5",
        "Three-address code and blocks",
        [
          "You lower expressions to three-address instructions, each with one operator and at most 3 operands, such as t1 = a + b. Later passes get easier because you cut this list into basic blocks: straight-line runs with no entry or exit in the middle. A leader starts each block. Leaders are the first instruction, any jump target, and the instruction that sits immediately after a jump.",
          "You give each assignment its own temporary so a definition names one value. In a block of 5 instructions for (a+b)*(a+b), a naive lowering recomputes the sum and uses 3 temporaries, while reusing the sum uses 2. The block ends at a conditional jump, which has 2 successors in the control-flow graph. Dataflow walks that graph. It does not walk source line numbers.",
        ],
        {
          kind: "flow",
          caption: "Leaders cut the instruction list. A jump ends a block and names a successor.",
          steps: ["Mark the leaders", "Cut basic blocks", "Link each successor"],
        },
        "Four instructions, three leaders",
        [
          "The body is: 1, t1 = a + b; 2, if t1 goto 4; 3, t2 = 1; 4, return t1. Instruction 1 is a leader because it is first.",
          "Instruction 4 is a leader because it is a jump target. Instruction 3 is a leader because it follows a jump. That is 3 leaders.",
          "The blocks are {1, 2}, {3}, and {4}. The jump at 2 has 2 successors: block 3 when the test fails, and block 4 when it holds.",
        ],
        [
          {
            prompt: "Using that same four-instruction body, which instruction numbers are leaders?",
            answer: "1, 3, and 4. Instruction 2 is not a leader. It sits inside the first block; it is the jump, not a target and not an instruction after a jump.",
          },
          {
            prompt: "Inside one block you lower (a+b)*(a+b). How many temporaries does a naive lowering use, and how many if you reuse the sum?",
            answer: "The naive lowering uses 3 temporaries. Reusing the sum uses 2.",
          },
        ],
      ),
      lec(
        "l6",
        "Reaching definitions and liveness",
        [
          "You compute reaching definitions with a forward pass on the block graph. A definition of x reaches a use when some path carries it and no later definition of x kills it. The mechanism is a bit vector, one bit per definition. With 8 definitions, each block stores an 8-bit IN set and an 8-bit OUT set. You iterate until a pass changes nothing. The equations are monotone, so that fixed point exists.",
          "Liveness runs backward. A name is live where some path uses it before the next definition. You start from uses at the end of a block and walk predecessors, deleting a temporary that is live on 0 paths. A loop of 3 blocks can take 2 or 3 iterations before the live set stops growing, because the back edge feeds the header. You must not stop after a single pass.",
        ],
        {
          kind: "pair",
          caption: "Same graph, opposite directions. One bit per definition, or one bit per name.",
          leftTitle: "Reaching, forward",
          rightTitle: "Liveness, backward",
          left: ["Union of predecessor OUT", "Kill definitions of x", "Gen the local definition"],
          right: ["Union of successor IN", "A use makes a name live", "A definition clears it"],
        },
        "Two definitions reach one use",
        [
          "The function has 8 definitions in its bit vector. Block A defines x as d1. Block B defines x as d2. Both flow to block C, which uses x.",
          "OUT of A contains d1 and not d2, because defining x kills other definitions of x. OUT of B contains d2 and not d1.",
          "IN of C is the union, so both bits are set. The use does not have a unique reaching definition, and you may not treat x as a constant.",
        ],
        [
          {
            prompt: "A pass changes one block's OUT set among the 8 bits. Do you stop the iteration?",
            answer: "No. You stop only when a full pass changes nothing. A changed OUT can alter a successor IN on the next pass.",
          },
          {
            prompt: "A temporary is live on 0 paths at its definition. What may you do with that instruction?",
            answer: "Delete it. Nothing uses the value before the next definition. On a loop you confirm the 0 only after the live set has stopped growing.",
          },
        ],
      ),
      lec(
        "l7",
        "Folding, copies, and coloring",
        [
          "You fold an instruction whose operands are constants before you allocate registers. If t1 = 2 + 3, you replace later uses of t1 by 5 and you delete the add once t1 is dead. Copy propagation does the same for t2 = t1: uses of t2 become uses of t1, and the copy often disappears. Both rewrites need a single reaching definition. If 2 definitions of t1 reach the use, you do not fold.",
          "You allocate registers from an interference graph. Two temporaries interfere when one is live at the definition of the other. A graph you color with 4 colors fits in 4 registers. A node of degree 5 or more, on that 4-register machine, is a spill: you store it in a frame slot and reload it at each use. Spills add uses, so you recompute liveness once after you insert the loads.",
        ],
        {
          kind: "pipeline",
          caption: "Fold only a unique definition. Spill only after coloring fails, then rebuild liveness.",
          stages: ["Fold a constant", "Delete a dead op", "Build interference", "Color or spill"],
        },
        "Fold 2 + 3, then color",
        [
          "The only definition of t1 that reaches the use is t1 = 2 + 3. You replace the use by 5.",
          "t1 is now live on 0 paths, so you delete the add. The block lost 1 instruction.",
          "Suppose a remaining temporary has degree 5 and you have 4 registers. You spill that name to the frame and recompute liveness, because each reload is a new use.",
        ],
        [
          {
            prompt: "Two definitions reach a use of t: t = 2 + 3 and t = a + b. May you rewrite the use to 5?",
            answer: "No. Folding needs one reaching definition. Two definitions reach the use, so the value is not always 5.",
          },
          {
            prompt: "You have 4 registers, and one temporary has interference degree 5. What do you do next?",
            answer: "Spill it to a frame slot and reload it at each use. Then recompute liveness, because the new loads are uses the old set did not contain.",
          },
        ],
      ),
      lec(
        "l8",
        "A compiler you can defend",
        [
          "You can now carry a small source file from characters to optimized three-address code. You scan with longest match, parse with 1 lookahead token or a generated shift-reduce table, and assign frame offsets in a nested symbol table. You then split instructions into basic blocks. On a function with 4 locals of 4 bytes you can name each offset, and you can say which definitions reach a given use.",
          "You can also change that code and defend the change. Constant folding is legal only when one reaching definition supplies the constants, and coloring is legal only for the liveness you computed. Fold 2 + 3 into 5 and, once that temporary is dead, remove 1 instruction. If 4 registers are not enough, spill 1 name and recompute liveness, because each new load is a use the old set missed.",
        ],
        {
          kind: "layers",
          caption: "The passes in the order you can now justify, not as a list of tool names.",
          rows: ["Longest-match scan", "Predict or shift-reduce", "Frames, then basic blocks", "Dataflow, then folding"],
        },
        "Fold, and the frame is unchanged",
        [
          "A use of t1 has the single definition t1 = 2 + 3. You fold the use to 5 and delete the add because t1 is dead. That removes 1 instruction.",
          "The procedure still has 4 integer locals. Their frame is still 16 bytes. Folding a temporary did not move local offsets.",
          "If coloring then needs a fifth register, you spill 1 name into that same frame and you recompute liveness. The fold and the spill are separate edits.",
        ],
        [
          {
            prompt: "A use of t has two reaching definitions, t = 2 + 3 and t = a + b, and 4 registers are free. May you fold the use to 5?",
            answer: "No. Folding requires a unique reaching definition, and two definitions reach this use. Free registers do not make the value a constant. Coloring and folding answer different questions.",
          },
          {
            prompt: "A procedure has 3 integer locals of 4 bytes. Its body is the four-instruction example whose leaders are 1, 3, and 4. What is the frame size, ignoring saved registers, and how many basic blocks are there?",
            answer: "The frame is 12 bytes. There are 3 leaders, so there are 3 basic blocks. The frame size does not change the leader rule, and the jumps do not change the 4-byte stride.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-616",
    lectures: [
      lec(
        "l1",
        "A plan, not a waveform",
        [
          "You do not tape out a block because a few directed vectors looked right. You write a plan that names the behaviors, the stimulus that will reach them, and the checker that will judge them. A 4-bit adder has 256 input pairs if you count only the two operands, and 512 if you also toggle carry-in. The plan says which of those you will hit and which you will argue from a smaller set.",
          "You separate three mechanisms that people collapse into the word test. Stimulus drives pins. A checker compares the pins to a rule, every clock, not only at the end. Coverage records which behaviors of the plan actually occurred. A simulation of 1000 cycles with an empty checker is not a passing test. It is a waveform you happened to save.",
        ],
        {
          kind: "flow",
          caption: "A passing log is the last box, and only if the first three were written down.",
          steps: ["Name the behaviors", "Drive the pins", "Check every cycle", "Record the bins"],
        },
        "Corners of a 4-bit adder",
        [
          "Two 4-bit operands and a carry-in give 512 combinations. You do not type all of them on the first day.",
          "You direct the corners: 0 plus 0, 15 plus 15, and 15 plus 15 plus carry-in. That last sum is 31, so the low nibble is 15 and carry-out is 1.",
          "You cover carry-out with 2 bins. A plan that never drives carry-out 1 leaves a bin empty even when every nibble you tried was correct.",
        ],
        [
          {
            prompt: "How many input combinations does a 4-bit adder have if you include carry-in, and why is a green waveform of one sum not a finished plan?",
            answer: "512, because 16 times 16 times 2 is 512. One waveform shows one combination. The plan still needs a checker and a record of which behaviors, including both carry-out bins, actually occurred.",
          },
          {
            prompt: "You ran 1000 cycles and saved the waveform, but you wrote no checker. Did the block pass?",
            answer: "No. A checker compares pins to a rule. An empty checker cannot pass or fail. Coverage of the plan was not recorded either.",
          },
        ],
      ),
      lec(
        "l2",
        "A directed testbench",
        [
          "You build a directed testbench around a clock and a reset. For the first 2 cycles you hold reset, then you release it and drive one input vector per cycle from a list you wrote. A 4-bit counter test might drive enable for 5 cycles and expect the count to move 0, 1, 2, 3, 4. You sample outputs on the clock edge the design uses, and you fail the test on the first mismatch.",
          "You keep expected values next to the stimulus, not in your head. The mechanism is a cycle-by-cycle compare against that list, which catches a bug at cycle 3 instead of letting it poison cycle 4 and cycle 5. Directed tests are how you lock a known corner: reset, the all-ones input, a back-to-back pair. They do not scale to every legal interleaving, and you should not pretend a list of 20 vectors did.",
        ],
        {
          kind: "pipeline",
          caption: "Expected values sit beside the vectors. The first mismatch ends the test.",
          stages: ["Hold reset two cycles", "Drive one listed vector", "Sample on the edge", "Fail on first mismatch"],
        },
        "Enable a counter for 5 cycles",
        [
          "Reset is held for 2 cycles. The count must read 0 on the edge where reset releases.",
          "Enable stays high for 5 cycles. You expect 1, then 2, then 3, then 4, then 5, each on the active edge.",
          "If the third enabled cycle shows 4, you fail at that cycle. You do not wait to see whether the fifth cycle lands on 5 by luck.",
        ],
        [
          {
            prompt: "Reset is held 2 cycles and enable is then high for 5 cycles, from a count of 0. What do you expect on the fifth enabled edge?",
            answer: "5. The count moves 1, 2, 3, 4, 5 across the five enabled cycles. You fail at the first edge that disagrees, not at the end of the list.",
          },
          {
            prompt: "Why is a list of 20 directed vectors not a complete check of every legal interleaving?",
            answer: "The list only locks the corners you wrote down. Interleavings you did not list are untested. Directed stimulus does not grow to cover them by itself.",
          },
        ],
      ),
      lec(
        "l3",
        "Assertions on the protocol",
        [
          "You attach assertions to the design so the check runs even when the stimulus came from someone else. An immediate assertion tests a Boolean on the spot, such as a one-hot grant: in any cycle the 4 grant bits contain at most one 1. A concurrent assertion talks about time. The property that a request is granted within 3 cycles fails if cycle t has a request and cycles t through t+2 have no grant.",
          "You write the assertion next to the protocol, not inside one test. Then all 50 directed tests and every later random test inherit the same check. A disabled assertion is not a waiver. If you turn it off to make a log quiet, you have deleted the checker. Keep the failure, and fix the design or the property you misstated.",
        ],
        {
          kind: "pair",
          caption: "Same pins, two kinds of check. Zero grants can pass one and fail the other.",
          leftTitle: "Immediate",
          rightTitle: "Concurrent",
          left: ["One Boolean this cycle", "At most one of 4 grants", "No window of cycles"],
          right: ["A request starts a window", "Grant must arrive in 3", "Time is part of the check"],
        },
        "A request that waits too long",
        [
          "At cycle 10 the request is 1 and the 4 grant bits are 0000. A window of 3 cycles starts.",
          "Cycles 10, 11, and 12 stay at grant 0000. The concurrent property fails at cycle 12.",
          "The immediate one-hot check still passes on 0000, because zero grants is not two grants. The two checks are not substitutes.",
        ],
        [
          {
            prompt: "Grant bits are 0011 in a cycle. Does the immediate one-hot assertion pass?",
            answer: "No. Two of the 4 bits are 1, and the check allows at most one. The failure is this cycle; it does not wait for a later grant.",
          },
          {
            prompt: "A request at cycle t is granted at cycle t+3. The bound is 3 cycles, counting t through t+2. Does the property pass?",
            answer: "No. Cycles t, t+1, and t+2 have no grant, so the window of 3 misses. A grant at t+3 is one cycle late.",
          },
        ],
      ),
      lec(
        "l4",
        "Constraints and seeds",
        [
          "You replace a hand-written list with a constraint solver that draws legal inputs. A constraint is a rule the draw must obey, such as length between 1 and 8, or opcode not equal to a reserved code. The solver picks one solution at random from that set. On a bus with 4 opcodes and a 3-bit length, the legal space is 4 times 8, which is 32, until a cross constraint deletes pairs.",
          "You still need a seed. The same seed and the same constraints reproduce the same 100 draws, which is how you debug a failure. A different seed explores a different path through the 32 legal pairs. Constrained random finds interleavings you did not list. It will not hit a behavior your constraints made impossible, so a bug in the constraint is a hole in the stimulus, not a quiet success.",
        ],
        {
          kind: "flow",
          caption: "The solver only draws inside the rules. A seed makes the draw replayable.",
          steps: ["Write the constraints", "Draw one solution", "Drive that draw", "Save the seed"],
        },
        "Thirty-two legal pairs, then twenty-five",
        [
          "Opcode is in {0, 1, 2, 3} and length is in 0 through 7. That is 4 times 8 = 32 legal transactions.",
          "Seed 7 produces a sequence. A failure on draw 12 is rerun with seed 7, and draw 12 is the same transaction.",
          "A further rule says opcode 3 implies length 0, which removes 7 pairs. The space is 32 minus 7 = 25. Opcode 3 with length 5 never appears.",
        ],
        [
          {
            prompt: "Opcode has 4 values and length has 8. No cross constraint. How many legal transactions are there?",
            answer: "32. The solver multiplies 4 by 8. A draw outside that set violates a constraint and must not be driven.",
          },
          {
            prompt: "Seed 7 failed on draw 12. You change the seed and cannot reproduce the bug. What did you lose?",
            answer: "The replay. The same seed and the same constraints reproduce the same draws. A new seed is a different path through the legal pairs, not a rerun of draw 12.",
          },
        ],
      ),
      lec(
        "l5",
        "Bins and crosses",
        [
          "You measure what happened, not how long you ran. A coverpoint is a value you sample, and a bin is a bucket of that value. An opcode coverpoint with 4 bins, one per opcode, is hit for a bin only when a sampled transaction carries that opcode. Running 1000 cycles that all use opcode 0 leaves 3 bins empty. The test is not done.",
          "You add a cross when the bug lives in a pair. Opcode crossed with a 2-value direction has 4 times 2 = 8 bins. Hitting every opcode and both directions in separate tests can still miss the pair you care about, such as opcode 3 with direction 1. Coverage of 6 out of 8 is 75 percent, and the missing 2 bins are the plan for the next constraint, not a rounding error.",
        ],
        {
          kind: "layers",
          caption: "A cross is not the sum of two coverpoints. Empty pairs stay empty until something hits them.",
          rows: ["Coverpoint: one field", "Bin: one bucket of values", "Cross: a pair of fields", "Hit count, not cycle count"],
        },
        "Six of eight cross bins",
        [
          "You sample opcode and direction on each transaction. The cross has 4 times 2 = 8 bins.",
          "After the run, 6 bins have a count above 0 and 2 bins are 0. Coverage is 6/8 = 75 percent.",
          "The empty bins are opcode 3 with direction 1, and opcode 2 with direction 0. The next test is written to hit those 2 pairs, not to add random cycles.",
        ],
        [
          {
            prompt: "All 1000 cycles use opcode 0. The coverpoint has 4 opcode bins. How many bins are empty?",
            answer: "3. Only the bin for opcode 0 is hit. Cycle count does not fill the other bins.",
          },
          {
            prompt: "A cross has 8 bins and 6 were hit. What coverage do you report, and what is the next action?",
            answer: "75 percent, because 6/8 = 0.75. The next action is a constraint or a directed test for the 2 empty bins, not a longer run of the same stimulus.",
          },
        ],
      ),
      lec(
        "l6",
        "A scoreboard and a model",
        [
          "You check a stream of transactions with a scoreboard, not with a glance at a waveform. The monitor reconstructs each transaction from pins. A reference model, often a short program in a software language, predicts the result. The scoreboard compares prediction and observation. If the model says the sum of 9 and 6 is 15 and the pins say 14, you have a fail at that transaction, even if later sums look fine.",
          "You decide what the scoreboard is allowed to reorder. A design with an in-order adder must match the model transaction by transaction, so 1 mismatch fails the run. A design that may return 2 outstanding results out of order needs a match by id, not by arrival time. If you sort neither side, you will file a bug that is really your checker. Write the matching rule down before you run the 100th random test.",
        ],
        {
          kind: "pipeline",
          caption: "The model is the specification you can execute. The scoreboard is the compare.",
          stages: ["Monitor a transaction", "Model predicts the result", "Match by the rule", "Mismatch fails the run"],
        },
        "Nine plus six comes back fourteen",
        [
          "The monitor sees operands 9 and 6 and a result of 14, tagged with one id.",
          "The reference model computes 15. The scoreboard sees a difference of 1, so this transaction fails.",
          "There is no second result in flight, so matching by arrival or by id agrees. A legal reorder of a second id would be a different case, and you would match on the id.",
        ],
        [
          {
            prompt: "The model returns 15 for inputs 9 and 6. The pins return 14. What does the scoreboard report?",
            answer: "A failure on that transaction. The difference is 1. Later correct sums do not erase it.",
          },
          {
            prompt: "Two results may complete out of order, distinguished by id. You compare by arrival time and flag a mismatch. What should you check first?",
            answer: "The matching rule. A legal reorder of 2 outstanding results fails an arrival-time compare even when each id matches the model. Match by id before you call the design wrong.",
          },
        ],
      ),
      lec(
        "l7",
        "Simulation and a bounded proof",
        [
          "You use simulation to run many cycles of a whole block, and you use a formal tool when you want every behavior inside a bound. A bounded check of 20 cycles searches inputs out to length 20. If an assertion can fail, the tool returns a counterexample waveform. If it cannot fail inside 20 cycles, you have a proof only up to that bound, not a proof for cycle 21.",
          "You do not point a formal solver at an unconstrained 32-bit datapath and wait. You cut the input space with the same properties you already wrote, and you often prove control, such as a 4-entry credit counter never going negative, rather than the arithmetic. Simulation with a seed still owns the long trace, the software reference model, and the coverage of the 8 cross bins. Formal owns the claim that no short trace escapes the assertion.",
        ],
        {
          kind: "pair",
          caption: "Simulation samples traces. A bounded proof talks about all traces up to the bound, and no further.",
          leftTitle: "Simulation",
          rightTitle: "Bound of 20",
          left: ["One seed, many cycles", "Scoreboard and bins", "Misses what you did not draw"],
          right: ["All inputs to cycle 20", "A waveform if it fails", "Silent about cycle 21"],
        },
        "A counterexample of length 12",
        [
          "You ask whether a request can go ungranted for 3 cycles, inside a bound of 20.",
          "The tool returns a counterexample of length 12: request at cycle 9, no grant through cycle 12. That is a bug or a missing assumption.",
          "If instead it proves the property through cycle 20, a bug at cycle 21 is still possible. You say the bound in the same sentence as the proof.",
        ],
        [
          {
            prompt: "A property is proved for a bound of 20 cycles. Have you proved it for cycle 21?",
            answer: "No. The search stopped at 20. Cycle 21 was not included. You may still simulate past the bound.",
          },
          {
            prompt: "Why prove a 4-entry credit counter rather than an unconstrained 32-bit datapath?",
            answer: "The counter has a small input cone, so a bound of 20 can finish. An unconstrained 32-bit datapath is a search you will not exhaust. Simulation still owns long traces and the 8 coverage bins.",
          },
        ],
      ),
      lec(
        "l8",
        "A plan you can close",
        [
          "You can now write a verification plan for a small block and carry it out. You name the behaviors, drive them with directed vectors or with constrained random draws, and check them with assertions plus a scoreboard against a reference model. For a coverpoint of 4 bins you can say how many are empty. For a bound of 20 cycles you can say what a formal pass does not mean.",
          "You can also tell a passing log from a finished plan. A run of 1000 cycles that hits 6 of 8 cross bins is not closed, and a green scoreboard does not fill the other 2 bins. You add a constraint or a directed test aimed at the hole, or you record a waiver with a reason. You can defend that choice to someone who did not watch the waveform.",
        ],
        {
          kind: "flow",
          caption: "Closure is a list of bins and checkers, not a cycle count.",
          steps: ["Plan the behaviors", "Choose the stimulus", "Name the checker", "List bins still open"],
        },
        "Six bins and a late grant",
        [
          "A cross of 4 opcodes and 2 directions has 8 bins. The random run hits 6 and the scoreboard stays green.",
          "The 2 empty bins are still open. More cycles under the same constraints do nothing if those pairs have probability 0.",
          "Separately, a request granted only at cycle t+3 fails the 3-cycle property even if the scoreboard liked the payload. You fix or waive each hole on its own.",
        ],
        [
          {
            prompt: "A cross has 8 bins and a random run hits 6. The scoreboard passed. Why might a longer run with the same constraints never finish the plan?",
            answer: "The 2 empty bins stay empty if the constraints give them probability 0. A green scoreboard only checked the transactions you actually drew. You change a constraint, add a directed test, or waive a bin with a reason.",
          },
          {
            prompt: "Inputs 9 and 6 return 14, and in that same cycle 2 of 4 grant bits are 1. The model sum is 15, and the grant must be one-hot. What do you report?",
            answer: "Two failures. The scoreboard expected 15, so the result is wrong by 1. The immediate assertion expected at most one of the 4 grant bits. Fixing the sum does not fix the grant.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-654",
    lectures: [
      lec(
        "l1",
        "Intensity and the ridge",
        [
          "You judge a kernel by arithmetic intensity: flops per byte moved. A node at 64 billion flops per second and 16 billion bytes per second has its ridge at 64/16, which is 4 flops per byte. Below 4, the kernel is bandwidth-bound even if every flop is a vector flop. Above 4, the flop peak is reachable in principle. You place the kernel on that roofline before you rewrite a line.",
          "You count bytes the memory system actually moves, including a write of a dirty line, not only the operands written in the source. A 7-point stencil that updates one double of 8 bytes and does 7 flops has intensity 7/8 = 0.875, far under the ridge of 4. You will not make it compute-bound by unrolling. You cut bytes, by reusing a value already in cache, or you accept the bandwidth ceiling and stop tuning flops.",
        ],
        {
          kind: "pair",
          caption: "The ridge is peak flops divided by bandwidth. The kernel is a point, not a slogan.",
          leftTitle: "This node",
          rightTitle: "A 7-point stencil",
          left: ["64 billion flops per second", "16 billion bytes per second", "Ridge at 4 flops per byte"],
          right: ["7 flops on one point", "8 bytes moved", "Intensity 0.875, under the ridge"],
        },
        "Place the stencil",
        [
          "Peak is 64 billion flops per second and bandwidth is 16 billion bytes per second. The ridge is 64/16 = 4 flops per byte.",
          "One updated double moves 8 bytes and the stencil does 7 flops. Intensity is 7/8 = 0.875.",
          "0.875 is below 4, so the ceiling is bandwidth. Raising the flop peak does not move this kernel until the bytes drop.",
        ],
        [
          {
            prompt: "A kernel does 40 flops and moves 8 bytes. The ridge is 4. Which ceiling applies?",
            answer: "Intensity is 40/8 = 5 flops per byte, above 4. The flop peak is the ceiling, not the bandwidth line.",
          },
          {
            prompt: "You double the peak to 128 billion flops per second and leave bandwidth at 16 billion bytes per second. What is the new ridge?",
            answer: "128/16 = 8 flops per byte. A kernel that sat between 4 and 8 was compute-side of the old ridge and is bandwidth-bound on the new one.",
          },
        ],
      ),
      lec(
        "l2",
        "Vector lanes and the tail",
        [
          "You vectorize a loop by issuing one instruction on several lanes. A 256-bit register holds 4 doubles of 8 bytes, so one add updates 4 elements. The mechanism is a contiguous load into that register, aligned to 32 bytes when the instruction requires it. If iteration i depends on iteration i-1, the lanes are not independent and you do not issue the 4-wide add. You rewrite the dependence or you leave the loop scalar.",
          "You check the remainder. A trip count of 10 is 2 vector iterations of 4 and a scalar tail of 2. Forgetting the tail drops elements 8 and 9. A branch inside the loop becomes a mask: lanes that fail the test still occupy the instruction, and you write back only the lanes you want. If the mask keeps only 1 lane of 4, you did the arithmetic of 4 and the useful work of 1.",
        ],
        {
          kind: "pipeline",
          caption: "Width 4 covers a multiple of 4. The tail is still your loop.",
          stages: ["Count the trips", "Issue groups of 4", "Run the scalar tail", "Mask partial lanes"],
        },
        "Ten iterations, width 4",
        [
          "The vector width is 4 doubles. 10 = 2 times 4, plus a remainder of 2.",
          "You issue 2 vector adds, covering elements 0 through 7.",
          "The tail runs elements 8 and 9 as scalar code. Skip it and those two results stay at their old values.",
        ],
        [
          {
            prompt: "The trip count is 16 and the width is 4. How many vector iterations, and how long is the tail?",
            answer: "4 vector iterations and a tail of 0. 16 divided by 4 is 4 exactly, so nothing is left for scalar code.",
          },
          {
            prompt: "A mask keeps 1 lane out of 4. How many lanes does the instruction occupy, and how many results do you keep?",
            answer: "The instruction occupies 4 lanes. You keep 1 result. The other 3 did arithmetic you discard.",
          },
        ],
      ),
      lec(
        "l3",
        "A team and a reduction",
        [
          "You mark a loop as shared-memory parallel work. A team of 8 threads splits iterations. The mechanism that keeps the answer right is a reduction on a sum: each thread accumulates a private partial, and the runtime adds those 8 partials at the join. If you instead let every thread write one shared total, the updates race and the total depends on the schedule. You do not call a parallel loop finished until you have named which variables are private.",
          "You watch the schedule and the barrier. Static chunks are fine when each iteration costs the same. If the last chunk does 10 times the work, one of 8 threads holds that tail and the other 7 wait at the implicit barrier. A dynamic schedule hands the next chunk to a free thread and pays more dispatch. You remove the barrier with a nowait clause only when the next region does not read the values just written.",
        ],
        {
          kind: "flow",
          caption: "Private partials make the sum one answer. The barrier is where the other threads wait.",
          steps: ["Fork a team of 8", "Sum into private partials", "Add the 8 partials", "Barrier, unless nowait"],
        },
        "Eight threads add 8000 numbers",
        [
          "The loop sums 8000 numbers. Eight threads each take 1000 of them into a private partial.",
          "At the join the runtime adds those 8 partials. The total does not depend on which thread ran first.",
          "A shared total updated inside the loop can lose additions. The private partial is the mechanism that prevents the race.",
        ],
        [
          {
            prompt: "Eight threads add into one shared total with no reduction and no lock. Is the numeric result determined?",
            answer: "No. The threads race on that total. Eight private partials, added at the join, are the version with one result.",
          },
          {
            prompt: "Seven of 8 threads finish, and the eighth holds a chunk that is 10 times heavier, with a barrier at the end of the loop. What are the other threads doing?",
            answer: "They wait at the implicit barrier. Team time is the heavy chunk, not the average chunk. A dynamic schedule can hand later chunks to the idle 7.",
          },
        ],
      ),
      lec(
        "l4",
        "Two ranks and a halo",
        [
          "You move bytes explicitly when the processes do not share memory. Rank 0 and rank 1 are two addresses. A send on rank 0 copies a buffer into the network; a matching receive on rank 1 copies it out. The match uses a tag and a communicator. If you send 8 doubles, that is 64 bytes, and the receive must ask for at least 64. A receive posted for 32 bytes does not describe this message.",
          "You order the posts so you do not deadlock. If rank 0 and rank 1 each send before either receives, and the messages are larger than the eager buffer, both can wait forever. The safe pattern for a pair is: rank 0 sends then receives, rank 1 receives then sends. One exchange of a halo of 8 doubles is that pattern in both directions. You do not time the exchange until both sides have entered and left it.",
        ],
        {
          kind: "pair",
          caption: "A pair exchange deadlocks if both sides send first and the eager buffer cannot hold the message.",
          leftTitle: "Rank 0",
          rightTitle: "Rank 1",
          left: ["Send 8 doubles first", "Then receive the halo", "64 bytes on the wire"],
          right: ["Receive 64 bytes first", "Then send 8 doubles", "Same tag, other way"],
        },
        "Exchange two halos of 8 doubles",
        [
          "Rank 0 sends 8 doubles, 64 bytes, with tag 1, then posts a receive for rank 1's halo.",
          "Rank 1 posts the receive for those 64 bytes first, then sends its own 8 doubles.",
          "If both send first and the message exceeds the eager buffer, both sit in send. This order reaches both receives.",
        ],
        [
          {
            prompt: "You send 8 doubles but post a receive of 32 bytes. What is wrong?",
            answer: "The message is 64 bytes. A 32-byte receive is smaller than the message. The receive count must be at least 64.",
          },
          {
            prompt: "Rank 0 and rank 1 both send 8 doubles before either receives, and the eager buffer cannot hold the message. What happens?",
            answer: "Both block in send, and neither reaches its receive. That is a deadlock. One side must receive first.",
          },
        ],
      ),
      lec(
        "l5",
        "A stencil and its halo",
        [
          "You map the stencil onto the bytes you must move. A 5-point update reads the center and 4 neighbors and does 5 flops, writing one new double. On one rank, cached neighbors are cheap. Across ranks, the neighbor may be a ghost cell you do not own. You fill a halo of 1 layer by exchanging those ghosts before the sweep. Interior points then use the same 5-point formula as a serial code.",
          "You count halo bytes against interior points. A strip of height 8 and width 1024 updates 8192 points. Two ghost edges move 2 times 1024 doubles, which is 16384 bytes. A strip of height 1 moves that same ghost traffic and updates only 1024 points, so you ship more than you compute. You thicken the owned rows until the ghost surface is a small fraction of the 8192-point interior.",
        ],
        {
          kind: "layers",
          caption: "Ghosts are not part of the answer. They exist so the 5-point formula can run unchanged.",
          rows: ["Owned interior, height 8", "One ghost layer on each edge", "16384 bytes of ghosts", "Then the 5-point update"],
        },
        "Height 8, width 1024",
        [
          "The owned strip is height 8 and width 1024, so the interior count is 8 times 1024 = 8192 points.",
          "Two ghost edges are 2 times 1024 doubles. At 8 bytes each, that is 16384 bytes moved before the sweep.",
          "Height 1 would still move 16384 bytes and would update only 1024 points. You keep height 8 so 8192 updates share that traffic.",
        ],
        [
          {
            prompt: "Height is 8 and width is 1024. How many interior points, and how many ghost bytes do two edges of doubles cost?",
            answer: "Interior points are 8 times 1024 = 8192. Ghost bytes are 2 times 1024 times 8 = 16384.",
          },
          {
            prompt: "On one rank, a 5-point stencil still reads 4 neighbors. Why is that not the same bill as a halo?",
            answer: "The formula always reads 4 neighbors plus the center. On one rank those neighbors can hit cache. A halo is the copy of neighbors another rank owns, and you pay it on the network before the sweep.",
          },
        ],
      ),
      lec(
        "l6",
        "Barriers, flops, and scaling",
        [
          "You time a region with a barrier on both sides, otherwise rank 0's clock includes waiting you did not mean to include. You count flops from the algorithm, not from a hardware counter you have not defined. The 8192-point stencil at 5 flops per point is 40960 flops. If the timed region takes 0.001 seconds, you report 40960 / 0.001 = 40.96 million flops per second. You write the time and the flop count in the same note.",
          "You name strong or weak scaling before you quote a speedup. Strong scaling keeps 8192 points fixed and adds ranks, so halos grow as a fraction of the work. Weak scaling gives each rank those same 8192 points and grows the grid. A drop from 8 seconds on 1 rank to 4 seconds on 2 ranks is speedup 2, strong. The same times on a weak study are a loss: work doubled, and time did not stay near 8.",
        ],
        {
          kind: "pipeline",
          caption: "The barriers define the region. The rate is flops you counted, divided by seconds you measured.",
          stages: ["Barrier, then start", "Count algorithm flops", "Barrier, then stop", "Divide flops by seconds"],
        },
        "40960 flops in a millisecond",
        [
          "There are 8192 points and 5 flops each, so the region does 40960 flops.",
          "Barriers bracket the sweep. The clock reads 0.001 seconds.",
          "The rate is 40960 / 0.001 = 40960000 flops per second, which is 40.96 million. A strong-scaling drop from 8 seconds to 4 seconds on 2 ranks is speedup 2.",
        ],
        [
          {
            prompt: "Time falls from 8 seconds on 1 rank to 4 seconds on 2 ranks, with the same 8192 points. What is the strong-scaling speedup?",
            answer: "Speedup is 8/4 = 2. The point count stayed fixed, so the study is strong scaling, and the speedup is 2.",
          },
          {
            prompt: "Each rank still owns 8192 points when you go from 1 rank to 2, and the time stays 8 seconds. Did weak-scaling efficiency hold?",
            answer: "Yes. Work per rank stayed the same and time stayed 8 seconds. If the time had risen above 8, efficiency would have dropped.",
          },
        ],
      ),
      lec(
        "l7",
        "Allreduce in a tree",
        [
          "You call a collective when every rank holds part of one answer. Allreduce adds one double from each rank and returns the total everywhere. On 8 ranks a binomial tree has depth 3: the count of partials goes 8, 4, 2, 1. That is 3 steps, not 7 sends. You use the library collective for this small payload. You drop to manual sends only after you time both on the same 8 ranks.",
          "You separate latency from bandwidth in the call. An allreduce of 8 bytes is mostly latency, because 3 tree steps pay startup and the payload is tiny. An allreduce of 8 million doubles is mostly bandwidth, and the tree moves that buffer more than once. You reduce inside the rank first, then you allreduce a vector of length 4, instead of shipping every element.",
        ],
        {
          kind: "flow",
          caption: "Eight ranks, three steps. A short vector beats an allreduce of every element.",
          steps: ["Reduce inside the rank", "Allreduce length 4", "Tree depth is 3", "Use the total"],
        },
        "Sum one double on 8 ranks",
        [
          "Each of 8 ranks holds one double. A binomial allreduce has depth 3, because the partials go 8, then 4, then 2, then 1.",
          "A gather of the other 7 ranks straight to rank 0 is 7 sends in one direction, then more sends to broadcast the total.",
          "If each rank already holds 4 local values, you sum them locally and allreduce a vector of length 4, not 4 separate calls.",
        ],
        [
          {
            prompt: "How many binomial-tree steps does an allreduce use on 8 ranks, and how many sends does a one-direction gather to rank 0 use from the other ranks?",
            answer: "The tree has 3 steps. A gather to rank 0 uses 7 sends, one from each other rank. The tree is not those 7 sends.",
          },
          {
            prompt: "Why is an allreduce of 8 bytes latency-bound, while an allreduce of 8 million doubles is not?",
            answer: "Three tree steps pay startup, and 8 bytes hide under that startup, so the call is latency. Millions of doubles make the bytes dominate, so the call is bandwidth. Reduce locally first when you can, and allreduce a vector of length 4.",
          },
        ],
      ),
      lec(
        "l8",
        "A kernel you can place",
        [
          "You can now place a scientific kernel on a machine and defend the placement. You compute intensity against a ridge, here 4 flops per byte on the node with peak 64 and bandwidth 16, and you say whether lanes of 4 doubles can matter. You choose a shared-memory team or explicit messages of 64-byte halos. You time with barriers, and you label the study strong or weak before you report a speedup.",
          "You can also refuse a tuning step that cannot move the bound. Unrolling a stencil at intensity 0.875 does not cross a ridge of 4. Adding ranks on a strong problem of 8192 points helps only while the interior still dwarfs the halo of 16384 ghost bytes. You write the flop count, the byte count, and the seconds in one place, and you stop when the next change cannot touch the term that dominates.",
        ],
        {
          kind: "layers",
          caption: "Report these four numbers together. A speedup without them is an unlabeled clock.",
          rows: ["Intensity against ridge 4", "Vector width 4", "Halo bytes versus interior", "Seconds between barriers"],
        },
        "Do not unroll past the ridge",
        [
          "The stencil does 7 flops and moves 8 bytes. Intensity is 0.875, and the ridge is 4, so unrolling cannot make the kernel compute-bound.",
          "On a strong study the same 8192 points drop from 8 seconds on 1 rank to 4 seconds on 2 ranks. Speedup is 2.",
          "You still owe the halo: 16384 ghost bytes. If that surface swallows the interior, the next rank will not repeat the speedup of 2.",
        ],
        [
          {
            prompt: "The ridge is 4 flops per byte. A stencil does 5 flops and moves 8 bytes per point. A strong-scaling run goes from 8 seconds on 1 rank to 4 seconds on 2 ranks. What is the intensity, is the kernel compute-bound, and what is the speedup?",
            answer: "Intensity is 5/8 = 0.625 flops per byte, under 4, so the kernel is bandwidth-bound, not compute-bound. Speedup is 8/4 = 2. Extra vector flops do not cross the ridge; the time cut has to come from bandwidth or from less data per rank.",
          },
          {
            prompt: "A strip is height 8 and width 1024, with two ghost edges of doubles. How many interior points share the 16384 ghost bytes?",
            answer: "8192 interior points. That is 8 times 1024. The ghost bill stays 2 times 1024 times 8 = 16384 bytes. A height of 1 would put that same bill on only 1024 points.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-662",
    lectures: [
      lec(
        "l1",
        "Failures you are willing to admit",
        [
          "You start from the failure you are willing to admit. In this course a process crashes and stays down, and a message may be lost or delayed, but a live process does not send a forged message. That crash-stop model is why a timeout exists: after 3 missed heartbeats, 1 second apart, you declare the peer dead. You may be wrong if the peer is only slow, so every later protocol has to tolerate a false suspicion.",
          "You name the message protocol before you name the service. A request carries a client id and a unique number, and the reply quotes that number, so you can match them. With 2 requests in flight you must not apply the reply for number 9 to the call that sent number 10. A protocol that only says send the bytes and hope cannot support the file service or the transaction later. You write the fields down.",
        ],
        {
          kind: "pair",
          caption: "Crash-stop is the model. A forged message from a live process is a different course.",
          leftTitle: "Admitted",
          rightTitle: "Not in this model",
          left: ["Crash, and stay down", "Lose or delay a message", "3 missed beats, then dead"],
          right: ["A live process forges data", "Clocks that all agree", "A timeout that is knowledge"],
        },
        "Three missed heartbeats",
        [
          "Heartbeats are 1 second apart. You miss beat 1, beat 2, and beat 3.",
          "After the third miss you mark the peer dead and you stop sending it new work.",
          "The peer may only be slow. Any service you build next must stay correct if that suspicion was early.",
        ],
        [
          {
            prompt: "Heartbeats are 1 second apart and you declare death after 3 misses. How long is the silence?",
            answer: "3 seconds. That is a suspicion, not proof. A slow peer can still be alive, so later protocols must tolerate a false death.",
          },
          {
            prompt: "Replies for request numbers 9 and 10 are both in flight. Which reply may you apply to the call that sent 10?",
            answer: "Only the reply that quotes 10. Applying the reply for 9 to call 10 mixes two calls. The unique number is the match.",
          },
        ],
      ),
      lec(
        "l2",
        "Remote calls and duplicate replies",
        [
          "You call a remote procedure through a stub that looks local and is not. The client stub packs arguments, sends the request, and waits. The server stub unpacks, calls the procedure, and sends the reply. A timeout of 2 seconds without a reply means you do not know whether the procedure ran. Retrying blindly can run a transfer twice. The mechanism that stops that is an at-most-once table: the server remembers the unique number and the reply it already computed.",
          "You either make the operation safe to repeat or you keep the at-most-once table. Adding 1 to a counter is not safe to run 2 times. Writing the same 4 bytes at the same offset is safe, because the second write leaves the same bits. For the add, the server stores the reply by unique id and returns it on a duplicate, without adding again. A client timeout can still follow success, so at-most-once is not exactly-once.",
        ],
        {
          kind: "pipeline",
          caption: "The stub hides packing, not failure. The table is what makes a retry safe for an add.",
          stages: ["Pack and send", "Server runs or replays", "Reply quotes the id", "Timeout is not knowledge"],
        },
        "Retry an increment",
        [
          "The client sends unique id 9 and asks the server to add 1 to a counter that is currently 5.",
          "The server adds, stores reply 6 under id 9, and the reply is lost. After 2 seconds the client resends id 9.",
          "The table returns 6 and does not add again. The counter stays 6. If the table had been missing, the counter would be 7.",
        ],
        [
          {
            prompt: "A duplicate of unique id 9 asks the server to add 1 again. The stored reply is 6. What does the server do?",
            answer: "It returns 6 and does not add. The at-most-once table treats id 9 as already done. Running the add a second time would make the counter 7.",
          },
          {
            prompt: "Writing the same 4 bytes to the same offset twice is safe, and adding 1 twice is not. Why the difference?",
            answer: "The second write of those 4 bytes leaves the same bits as the first. The second add changes the counter again. Idempotent writes can be retried; the add needs the reply table.",
          },
        ],
      ),
      lec(
        "l3",
        "Chunks, replicas, and leases",
        [
          "You split a file into chunks instead of locking the whole file. Each chunk is 64 megabytes, stored as 3 replicas. A write goes to the primary, which orders it and pushes the bytes to the other 2. A read may use any replica that has applied that order. If you read one that is 1 update behind, you see stale bytes. That staleness is the consistency rule you chose, not a surprise.",
          "You cache a chunk on the client with a lease. The lease is a time, here 10 seconds. While it holds, the client may read its copy and the primary recalls it before a conflicting write. When the lease ends, you drop the cache or renew. A cache with no lease can serve a value the other 2 replicas have already replaced. The directory maps the file name to the chunk ids and to the 3 servers that hold them.",
        ],
        {
          kind: "layers",
          caption: "The directory names holders. A lease is the only reason a client copy is still valid.",
          rows: ["Client cache, leased 10 seconds", "Directory of chunk ids", "Primary plus 2 replicas", "64 megabytes in one chunk"],
        },
        "A write, then a stale read",
        [
          "The chunk is 64 megabytes and lives on 3 servers. The primary orders a write and pushes it to the other 2.",
          "One replica is still 1 update behind. A read that lands there returns the old bytes.",
          "A client cache without a lease of 10 seconds can do the same thing after the primary has moved on. With the lease, the primary recalls it before the conflicting write.",
        ],
        [
          {
            prompt: "How many replicas hold each 64-megabyte chunk, and what do you see if you read one that is 1 update behind?",
            answer: "3 replicas. You see the bytes from before that update. The protocol allows that staleness until the replica applies the primary's order.",
          },
          {
            prompt: "A client cached a chunk and the lease was 10 seconds. The lease has ended and was not renewed. May the client keep serving the cache?",
            answer: "No. When the lease ends you drop the cache or renew it. Without a live lease the other replicas may already hold a newer write.",
          },
        ],
      ),
      lec(
        "l4",
        "Backups and checkpoints",
        [
          "You survive a crash by keeping a backup with the same state. The primary logs each update, waits until 1 backup has stored it, then replies. With that pair you tolerate 1 crash. If you reply before the log is stored, a dead primary loses an update the client thinks succeeded. On handover the backup becomes primary and applies any logged update that was not finished.",
          "You checkpoint so a crash does not redo an hour of work. Every 10 minutes you store a snapshot plus the message log since then. Recovery loads the snapshot and replays the log. If the snapshot omits the receive buffer, you may replay a message already handled, so you include that buffer. Coordinated checkpointing pauses 2 processes, writes both snapshots, and resumes. Two uncoordinated snapshots can describe a state that never existed.",
        ],
        {
          kind: "pair",
          caption: "Reply after the log is stored. A checkpoint that drops the receive buffer will replay a message.",
          leftTitle: "Primary and backup",
          rightTitle: "Checkpoint",
          left: ["Log, then reply", "Survive 1 crash", "Backup becomes primary"],
          right: ["Snapshot every 10 minutes", "Plus the log since then", "Include the receive buffer"],
        },
        "Reply too early",
        [
          "The primary writes the update into its log and replies to the client before the backup stores that log.",
          "The primary crashes. The client already believes the update stuck. The backup never saw it.",
          "Handover promotes the backup, which does not have the update. The correct order was: backup stores the log, then the primary replies.",
        ],
        [
          {
            prompt: "You have 1 primary and 1 backup, and the backup has stored the log before you reply. How many crashes of those two can you tolerate without losing the acknowledged update?",
            answer: "1. The surviving process has the log. Replying before the backup stores it means a crash of the primary can lose an update the client was told succeeded.",
          },
          {
            prompt: "Two processes take snapshots at different times, with no pause. What can go wrong at recovery?",
            answer: "The two snapshots can describe a combined state that never existed. Coordinated checkpointing pauses both processes, writes both snapshots, then resumes. Also include each receive buffer or you may replay a handled message.",
          },
        ],
      ),
      lec(
        "l5",
        "Moving work without moving everything",
        [
          "You balance load by moving work, not by hoping equal connections mean equal cost. A least-connections dispatcher sends the next request to the server with the fewest open calls. If one of 4 servers holds 10 calls and the others hold 2, the next call goes to a server at 2. That rule fails when one call is a 30-second report and another is a 1-millisecond ping. You then weight by measured service time.",
          "You place sessions with consistent hashing so one death does not move every key. Hash the key onto a ring. Each of 4 servers owns the arc ahead of its position. When 1 server leaves, only keys on its arc move, about a quarter, not the rest. Key mod 4 is the contrasting map: going from 4 servers to 3 remaps most keys, about three quarters. You pick the ring when reshuffling the cache dominates the cost.",
        ],
        {
          kind: "flow",
          caption: "Least connections ignores service time. The ring moves one arc, not three quarters of the keys.",
          steps: ["Count the open calls", "Send to the short queue", "Hash a key on the ring", "Move only the dead arc"],
        },
        "Four servers, one departure",
        [
          "Four servers sit on the ring. A new session hashes onto one arc. Least-connections is a different dispatcher: a server with 10 calls loses to one with 2.",
          "One server dies. Only the keys on its arc move, about a quarter of them.",
          "Key mod 4, reduced to 3 servers, remaps about three quarters of the keys. Those cache misses are the cost you avoided with the ring.",
        ],
        [
          {
            prompt: "Servers hold 10, 2, 2, and 2 open calls. Least-connections routing: where does the next call go?",
            answer: "To a server that holds 2, not to the server that holds 10. If one of those short calls is a 30-second report, the count is the wrong weight and you should use measured service time.",
          },
          {
            prompt: "You place keys with key mod 4, then a server dies and 3 remain. About what fraction of keys move, compared with one death on a 4-server ring?",
            answer: "Key mod 4 remaps about three quarters of the keys. One death on the ring moves about a quarter, the arc that server owned, and leaves the other arcs put.",
          },
        ],
      ),
      lec(
        "l6",
        "Two databases, one commit",
        [
          "You commit a transaction that touches 2 databases with two-phase commit. The coordinator sends prepare to both. Each participant writes a prepared record in its log and votes yes or no. If both vote yes, the coordinator writes commit and tells them. If 1 votes no, the coordinator writes abort. After a participant is prepared it cannot undo on its own, because the coordinator may already have told the other database to commit.",
          "You pay for atomicity with blocking. If the coordinator dies after both of 2 participants are prepared and before they hear the decision, they wait. They cannot commit or abort until that decision returns. A timeout does not free them, because the other site may have committed. You log the decision before you send it, so a restarted coordinator can answer the 2 waiters.",
        ],
        {
          kind: "pipeline",
          caption: "Prepared means the participant has given up the right to choose. The coordinator's log is the choice.",
          stages: ["Prepare both sites", "Collect yes or no", "Log commit or abort", "Tell the 2 sites"],
        },
        "One no vote",
        [
          "The coordinator asks 2 databases to prepare. The first votes yes and writes a prepared record. The second votes no.",
          "The coordinator writes abort, not commit, and tells both. The first database undoes.",
          "If both had voted yes and the coordinator then died before sending the decision, both would wait. A timeout would not let either choose.",
        ],
        [
          {
            prompt: "Both participants have voted yes and written prepared records. The coordinator crashes before sending a decision. What may each participant do?",
            answer: "Wait. Neither may commit or abort on its own, because the other site might already have been told the opposite. A timeout does not unlock them. A restarted coordinator answers from the decision it logged before sending.",
          },
          {
            prompt: "One of 2 participants votes no. What does the coordinator write?",
            answer: "Abort. Commit requires both yes votes. The participant that voted yes must undo after it hears abort.",
          },
        ],
      ),
      lec(
        "l7",
        "Tickets and access",
        [
          "You separate authentication from authorization on every request. Authentication answers who sent it. A shared password sent on each call is a bad mechanism: it repeats a secret. You use a ticket a key server minted, carrying the client id, the server id, and an expiry of 8 hours, encrypted so only the file server can read it. The client presents that ticket instead of the password. A ticket copied after expiry fails the time check.",
          "You authorize only after the ticket names a client. An access list says which ids may read and which may write. A capability is the other mechanism: holding an unforgeable token for the chunk is the right, so you check the token, not a list. With 3 replicas every replica enforces the same rule, or a client denied on the primary reads a backup. Encrypting bytes hides them on the wire. It does not decide who may ask.",
        ],
        {
          kind: "pair",
          caption: "The ticket names the client. The list or the capability says what that client may do.",
          leftTitle: "Authentication",
          rightTitle: "Authorization",
          left: ["Ticket, not the password", "Client id and server id", "Expires in 8 hours"],
          right: ["Access list of ids", "Or a capability token", "Same rule on 3 replicas"],
        },
        "Denied on the primary only",
        [
          "The ticket names the client and has 6 hours left on an 8-hour expiry, so the time check passes.",
          "The primary's access list denies the write. Replica 2 of 3 does not check and serves the bytes.",
          "That is a hole. All 3 replicas must enforce the same rule. Encrypting the bytes on the wire would not have closed it.",
        ],
        [
          {
            prompt: "A ticket expired after 8 hours. The bytes on the wire are encrypted. May the file server still honor the ticket?",
            answer: "No. Expiry fails the time check. Encryption hides bytes from the network and does not extend the ticket.",
          },
          {
            prompt: "The primary denies a client and one of the other 2 replicas does not check the access list. What can the client do?",
            answer: "Read the backup that skipped the check. With 3 replicas, every replica has to enforce the same list or the same capability. A check on the primary alone is not authorization.",
          },
        ],
      ),
      lec(
        "l8",
        "A request you can trace",
        [
          "You can now trace a request from a stub through a durable write. You attach a unique number so a retry runs at most once. You store the bytes as 3 replicas of one chunk and log them on a backup before you answer. You can fold that write into two-phase commit with a second database, and you can explain a block if the coordinator dies. You can also name who was allowed to call.",
          "You can refuse a design that mixes these up. A load balancer that rewrites key mod 4 when a server dies will move about three quarters of the cached chunks, which is a different cost from losing 1 replica of 3. A ticket of 8 hours does not make the write atomic. You pick the mechanism that matches the failure you wrote down in the first lecture, and you can point at the log record that makes the claim true.",
        ],
        {
          kind: "layers",
          caption: "Each layer has a record you can point at. A timeout is not one of those records.",
          rows: ["Unique id, at most once", "Three replicas of the chunk", "Log before the reply", "Ticket, then the access rule"],
        },
        "Early reply, and a prepared peer",
        [
          "The client writes 4 bytes. The primary logs them locally and replies before the backup stores the log, then the primary crashes.",
          "The client was told the write succeeded. The backup may not have the 4 bytes, so handover can lose them.",
          "A second database was already prepared in two-phase commit. It cannot commit or abort while the coordinator's decision is unknown. The early reply and the wait are two different failures.",
        ],
        [
          {
            prompt: "A client writes 4 bytes. The primary replies before the backup stores the log, then crashes. A second database is already prepared for the same transaction. What was the client told, and what can the prepared database do?",
            answer: "The client was told the write succeeded, but the backup may lack the 4 bytes, so handover can lose them. The prepared database cannot commit or abort by itself while the decision is unknown. The early reply broke the backup rule, and two-phase commit still blocks the other site.",
          },
          {
            prompt: "One of 3 replicas dies, and separately you rehash keys with key mod 4 down to 3 servers. Which event moves about three quarters of the cached keys?",
            answer: "The rehash from 4 servers to 3. Losing 1 replica of 3 drops a copy, and the other 2 still hold the chunk. Those are different costs. A ticket expiry of 8 hours moves neither.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-664",
    lectures: [
      lec(
        "l1",
        "Power, distance, and noise",
        [
          "You budget a wireless link before you invent a protocol. Transmit power spreads over space, and in free space received power falls with the square of distance. Double the distance, from 10 meters to 20, and received power falls to about 1/4. Noise does not fall with it, so the signal-to-noise ratio falls too. A frame that needed a higher ratio does not get through by wishing.",
          "You also lose power to walls and to other senders in the same 20 MHz channel. A ratio you can compute is the threshold: if the radio needs a ratio of 10 to hold its modulation, and one doubling cut the ratio from 40 to 10, you are on the edge. One more doubling cuts it to 2.5, below 10. You then lower the bit rate or shorten the link. The MAC cannot repair a frame the receiver never heard.",
        ],
        {
          kind: "layers",
          caption: "Each doubling of distance cuts free-space power to a quarter. The noise floor stays.",
          rows: ["Start at ratio 40", "One doubling: ratio 10", "Two doublings: ratio 2.5", "Modulation needs ratio 10"],
        },
        "Two doublings from a ratio of 40",
        [
          "Free-space power scales with one over distance squared. From 10 meters to 20, power is multiplied by 1/4, so a ratio of 40 becomes 10.",
          "From 20 meters to 40, you multiply by 1/4 again. The ratio becomes 2.5.",
          "A modulation that needs a ratio of 10 still works at 20 meters and fails at 40. You drop the bit rate or you do not use that link.",
        ],
        [
          {
            prompt: "Distance doubles once in free space and the ratio starts at 40. What ratio do you expect?",
            answer: "10. Received power falls to 1/4, and the noise did not fall, so 40/4 = 10.",
          },
          {
            prompt: "The radio needs a ratio of 10 and you are at 2.5 after two doublings. What can the MAC do about a frame the receiver never hears?",
            answer: "Nothing useful. The frame never arrived, so a retry at the same rate still fails. You lower the bit rate or shorten the link until the ratio is at least 10.",
          },
        ],
      ),
      lec(
        "l2",
        "Carrier sense and a hidden sender",
        [
          "You share one channel by sensing energy before you transmit. A station that hears energy waits. The mechanism fails for a hidden terminal: station A and station C both reach the access point and do not reach each other. Each senses an idle medium and transmits. The access point sees the sum of 2 frames, and both die. Sensing at the sender did not sense the collision at the receiver.",
          "You reserve the medium with a short request and a clear-to-send from the receiver. The request names a duration. Neighbors of the receiver hear the clear and set a network allocation vector for that many microseconds, here 200, and they stay quiet. Station C, hidden from A, hears the access point and defers. Without that clear, the data frame of 1500 bytes is what collides, which wastes more airtime than the short handshake of 2 control frames.",
        ],
        {
          kind: "pair",
          caption: "Sense protects a sender that can hear the other sender. It does not protect the access point.",
          leftTitle: "Carrier sense",
          rightTitle: "Request and clear",
          left: ["Listen, then send", "Hidden pair both hear idle", "Both frames die at the point"],
          right: ["Receiver sends a clear", "Neighbors defer 200 microseconds", "Data of 1500 bytes is reserved"],
        },
        "A and C both send",
        [
          "A and C cannot hear each other. Both hear the access point, sense idle, and transmit a 1500-byte frame.",
          "The access point receives the sum of 2 frames. Both fail.",
          "A clear from the access point, naming 200 microseconds, makes C defer even though C never heard A. The data frame is no longer the thing that collides.",
        ],
        [
          {
            prompt: "A and C are hidden from each other and both sense idle. Where do the 2 frames collide?",
            answer: "At the access point, which hears both. Each sender's carrier sense was quiet because the other sender was out of range. The collision is at the receiver.",
          },
          {
            prompt: "The clear tells neighbors to stay quiet for 200 microseconds. What does station C do if it hears that clear and not station A?",
            answer: "C defers for those 200 microseconds. The clear is how a hidden sender learns about a reservation it could not sense.",
          },
        ],
      ),
      lec(
        "l3",
        "Backoff and a growing window",
        [
          "You do not transmit the instant the medium goes idle. After a fixed interframe space you draw a backoff, a random count of slots from 0 through the contention window. A window of 15 means 16 possible counts, 0 through 15. You decrement the count only while the medium is idle. When it hits 0 you transmit. Two stations that draw the same count collide, and both see a failure.",
          "You double the window after a collision so the next draw spreads wider. A window of 15 becomes 31, then 63, up to a cap of 1023. A success shrinks it, often back to 15. If 20 stations all start at 15, many draw the same slot, and skipping the doubling keeps that clash. If you start at 1023, you pay a long wait even when you are the only sender.",
        ],
        {
          kind: "flow",
          caption: "The count falls only on idle slots. A collision widens the next draw.",
          steps: ["Wait the interframe gap", "Draw from 0 to 15", "Send when the count hits 0", "Double toward 1023"],
        },
        "A collision, then a wider draw",
        [
          "Two stations draw the same count inside a window of 15. There are 16 possible counts, 0 through 15, and they picked one.",
          "They transmit together and both fail. Each sets the window to 31.",
          "The next draws are spread over 32 counts, 0 through 31. A later success can shrink a window back toward 15. Starting at 1023 would have delayed even a single sender.",
        ],
        [
          {
            prompt: "The contention window is 15. How many distinct backoff counts can you draw?",
            answer: "16. The counts are 0 through 15. You send only when the count reaches 0, and you decrement only while the medium is idle.",
          },
          {
            prompt: "After one collision the window was 15. What is it for the next draw, and what is the cap?",
            answer: "31 for the next draw. Each further collision doubles it, and the cap in this lecture is 1023. A success can bring it back toward 15.",
          },
        ],
      ),
      lec(
        "l4",
        "Loss that is not a full queue",
        [
          "You inherited a transport rule that treats loss as congestion. A timeout, or 3 duplicate acknowledgements, cuts the congestion window in half. A window of 64 segments becomes 32. On a wire, that reaction matches a full queue. On a radio, a bit error or a hidden-terminal collision drops a frame the queue did not cause. You still cut the window, so a loss rate of 2 percent can pin the rate far below an idle medium.",
          "You repair the mistake in 1 of 2 places. Link retransmission hides the loss: the access point retries, and the window stays at 64 if the retry beats the timeout. The retry must keep order, or 3 duplicate acknowledgements still cut the window to 32. The other repair is a transport that does not halve when the link marks the loss as wireless. You name which one you used.",
        ],
        {
          kind: "pair",
          caption: "The transport sees a gap. It does not see whether the queue or the air caused it.",
          leftTitle: "Wired assumption",
          rightTitle: "Radio loss",
          left: ["Loss means a full queue", "Window 64 becomes 32", "The cut is the right reaction"],
          right: ["A collision, not a queue", "Same cut, wrong reason", "Retry at the link, or mark it"],
        },
        "A hidden collision cuts the window",
        [
          "The congestion window is 64 segments. A hidden-terminal collision drops one frame. The link does not retry.",
          "The sender sees loss, by timeout or by 3 duplicate acknowledgements, and sets the window to 32.",
          "No queue overflow was required. A link retry that finishes in time would have left the window at 64.",
        ],
        [
          {
            prompt: "The window is 64 and a radio loss is visible to the transport. What does the window become?",
            answer: "32. Loss halves it. On a wire that matches a full queue. On a radio the frame may have died in a collision, and the cut still happens unless something hides the loss.",
          },
          {
            prompt: "The access point retries the frame and the retry finishes before the transport timeout. What happens to a window of 64?",
            answer: "It stays 64, because the transport never saw the loss. If the retry reorders segments badly enough to cause 3 duplicate acknowledgements, the window still falls to 32.",
          },
        ],
      ),
      lec(
        "l5",
        "Bits per hertz, then users",
        [
          "You estimate cell capacity as bandwidth times bits per hertz, then divide by the users who share the air. A 20 MHz channel at 4 bits per hertz carries 80 million bits per second before headers. Ten active users, sharing fairly and never colliding, get 8 million bits per second each. Backoff slots and interframe spaces eat into the 80. You quote the 8 only with those taxes named.",
          "You do not use 4 bits per hertz when the ratio cannot hold it. Two doublings of distance cut power by 1/16. A starting ratio of 40 becomes 2.5, and a modulation that needs 10 will not run. You drop that user to 1 bit per hertz. A fair tenth of a 20 MHz channel is then 2 million bits per second, not the 8 million the cell center can take.",
        ],
        {
          kind: "pipeline",
          caption: "Raw rate first, then the share, then the ratio the edge user actually has.",
          stages: ["20 MHz times 4", "80 million bits", "Divide by 10 users", "Cut if the ratio fails"],
        },
        "Center user and edge user",
        [
          "The channel is 20 MHz at 4 bits per hertz, so the raw rate is 80 million bits per second.",
          "Ten fair users with no collisions each get 8 million, before backoff and headers take their cut.",
          "An edge user at ratio 2.5 cannot hold 4 bits per hertz. At 1 bit per hertz their fair tenth is 2 million bits per second, because 20 million divided by 10 is 2 million.",
        ],
        [
          {
            prompt: "A 20 MHz channel runs at 4 bits per hertz and 10 users share it fairly, ignoring headers. What does each user get?",
            answer: "8 million bits per second. The raw rate is 20 times 4 = 80 million, and 80/10 = 8 million. Backoff and interframe gaps reduce that 8 further.",
          },
          {
            prompt: "The same user can hold only 1 bit per hertz and still receives a tenth of the airtime. What is that share?",
            answer: "2 million bits per second. The whole channel at 1 bit per hertz is 20 million, and a tenth is 2 million. They do not get the 8 million that 4 bits per hertz would allow.",
          },
        ],
      ),
      lec(
        "l6",
        "Hops and a duty cycle",
        [
          "You route in an ad hoc net with no access point. A source floods a route request. Each forwarder records the previous hop and adds 1 to the hop count. The destination replies along the reverse path. A data route of 4 hops costs 4 transmissions of the payload, and a broken link costs a new flood. You flood the short request once. You do not flood the data.",
          "You treat energy as the budget on a sensor. A node awake 10 milliseconds each second has a duty cycle of 1 percent, so a 100 milliwatt radio averages 1 milliwatt if sleep draws nothing. A route of 4 hops multiplies one report by 4, because each hop transmits. You pick a parent toward the sink and sleep the rest of the second. A beacon every 10 milliseconds at full power erases the duty cycle you computed.",
        ],
        {
          kind: "flow",
          caption: "Flood the request, not the data. Then sleep. A chatty beacon spends the battery.",
          steps: ["Flood a short request", "Reply along reverse hops", "Unicast a 4-hop payload", "Sleep the other 990 ms"],
        },
        "Four hops and a 1 percent radio",
        [
          "The route request collects a path of 4 hops. Each forwarder added 1 to the hop count.",
          "The payload is unicast 4 times, once per hop, not flooded.",
          "The radio is on for 10 milliseconds out of 1000, a duty cycle of 1 percent. At 100 milliwatts while awake and 0 while asleep, the average is 1 milliwatt. Four hops make one report cost about 4 transmissions.",
        ],
        [
          {
            prompt: "A route has 4 hops. How many times is the payload transmitted, and what do you flood instead?",
            answer: "The payload is transmitted 4 times, once per hop. You flood the short route request once, not the data. A break costs a new flood of that request.",
          },
          {
            prompt: "The radio draws 100 milliwatts and is awake 10 milliseconds each second. What is the duty cycle, and what is the average draw if sleep draws 0?",
            answer: "The duty cycle is 1 percent, because 10/1000 = 0.01. The average draw is 1 milliwatt. A beacon every 10 milliseconds at full power removes that saving.",
          },
        ],
      ),
      lec(
        "l7",
        "Management frames and a second radio",
        [
          "You protect data frames and you often leave management frames open. An attacker sends one deauthentication, spoofing the access point, and the client leaves a network it was using. No data key is required for that management frame on older gear. The client then scans and may join an evil twin that answers the same network name. You lose the session at frame 1 of the attack, before any guess at the password.",
          "You authenticate the infrastructure, not only a password. The handshake binds the key to both names and checks an integrity code on management frames, so 1 forged deauthentication fails. If you turn that check off for a lab of 15 laptops, any laptop can forge the frame. Data protection does not save the client: the attacker aims them at another radio. You check the access point name and the management code together.",
        ],
        {
          kind: "pair",
          caption: "Encrypting the payload does not authenticate the access point that sent a management frame.",
          leftTitle: "Open management",
          rightTitle: "Checked management",
          left: ["One forged deauthentication", "Client leaves at frame 1", "Evil twin reuses the name"],
          right: ["Integrity code on the frame", "Forgery fails the check", "Lab of 15 must keep it on"],
        },
        "One deauthentication",
        [
          "The client is associated. The attacker sends 1 deauthentication that names the access point. Older gear does not check a data key on that frame.",
          "The client drops the association and scans. An evil twin answers the same network name.",
          "With an integrity check on management frames, that 1 frame fails the check and the client stays. Turning the check off for 15 lab machines restores the attack.",
        ],
        [
          {
            prompt: "Data frames are encrypted and management frames are not checked. How many forged deauthentication frames does it take to drop the client?",
            answer: "1. The client leaves on that frame. Encryption of the data does not apply to the management frame, so no password guess is required.",
          },
          {
            prompt: "You disable the management integrity check for a lab of 15 laptops. What can any one of those laptops do?",
            answer: "Forge a deauthentication and aim a client at another radio. The check is what makes that frame fail. Data-frame protection does not replace it.",
          },
        ],
      ),
      lec(
        "l8",
        "One frame, four layers",
        [
          "You can now follow one frame from the air to the transport and name the field that failed. You can compute a drop to 1/4 of the power when distance doubles, explain a collision that carrier sense missed, and double a contention window from 15 to 31. You can say why a loss cut a window from 64 to 32, and why a sensor awake 10 milliseconds per second sits at a 1 percent duty cycle.",
          "You can also put a number on the cell and on the attack. A 20 MHz channel at 4 bits per hertz is 80 million bits per second before sharing, and 10 users do not each receive all of it. One forged deauthentication moves a client if management frames are unchecked. You can write which layer you would change, and you can predict the side effect one layer up, including a window cut that a queue did not cause.",
        ],
        {
          kind: "layers",
          caption: "Name the layer that failed before you retune a different layer.",
          rows: ["Ratio after the distance", "Backoff and the hidden pair", "Window cut on loss", "Management integrity"],
        },
        "Collision, then a halved window",
        [
          "A and C are hidden, both sense idle, and their frames collide at the access point. The link does not retry.",
          "The transport window is 64. It sees the loss and becomes 32. No queue had to overflow.",
          "A clear that reserves the medium, or a link retry that beats the timeout, would have kept the window at 64. The radio failure and the transport reaction are one story.",
        ],
        [
          {
            prompt: "A hidden terminal causes a collision, the link does not retry, and the congestion window is 64. What does the window become, and did a queue overflow?",
            answer: "The window becomes 32, because a visible loss halves it. No queue overflow is required. Both senders sensed an idle medium, and the frames collided at the access point.",
          },
          {
            prompt: "Distance has doubled twice, so free-space power is 1/16 of the start. The starting ratio was 40. The channel is 20 MHz, the edge user holds only 1 bit per hertz, and they get a fair tenth of the airtime. What ratio do they see, and what share do they get?",
            answer: "The ratio is 40/16 = 2.5. At 1 bit per hertz the full channel is 20 million bits per second, and a tenth is 2 million. They do not get the 8 million that 4 bits per hertz would give a center user.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-678",
    lectures: [
      lec(
        "l1",
        "Partial failure and a record",
        [
          "You design a job so the death of 1 machine out of 50 does not cancel the other 49. The record of work is replicated, not kept in one process. A worker writes output under a name that fixes the bytes, then appends a completion record. If it dies between those 2 steps, another worker may redo the task. Doing it twice still leaves 1 result, because the name determines the bytes.",
          "You treat a slow machine and a dead machine as the same suspicion until a record proves otherwise. A heartbeat every 2 seconds, missed 3 times, is 6 seconds of silence, after which the scheduler may reassign the task. The first worker can be alive and writing. Partial failure means some messages arrived and some did not, and you will not get a stack trace from the missing half. The completion record is what the rest of the job trusts.",
        ],
        {
          kind: "pair",
          caption: "Local memory dies with the worker. The completion record is what the other 49 machines can see.",
          leftTitle: "Worker memory",
          rightTitle: "Shared record",
          left: ["Dies with the process", "May sit between 2 steps", "Not visible to the job"],
          right: ["Name fixes the bytes", "Completion is a record", "A redo leaves 1 result"],
        },
        "A worker dies between two steps",
        [
          "The worker writes the output under a determined name, then should append the completion record. It dies in between.",
          "After 3 missed heartbeats, 2 seconds apart, the scheduler waits 6 seconds and reassigns the task.",
          "The second worker writes the same bytes under the same name. You keep 1 result, not 2.",
        ],
        [
          {
            prompt: "Heartbeats are every 2 seconds and you reassign after 3 misses. How many seconds of silence is that?",
            answer: "6 seconds. The first worker may still be alive. The output name must determine the bytes so a redo does not create a second result.",
          },
          {
            prompt: "Why does running the same task 2 times leave 1 result?",
            answer: "The output name fixes the bytes. The second run writes the same place. A completion record, not the worker's memory, is what the rest of the job trusts.",
          },
        ],
      ),
      lec(
        "l2",
        "Map, shuffle, and a backup",
        [
          "You express a batch job as a map and a reduce. Each map reads one split and emits pairs. With 4 mappers and 400 megabytes of input, each map sees about 100 megabytes. The shuffle groups pairs by key and gives one key to one reducer. A reducer for key 7 sees every pair for that key, from all 4 maps, and writes one output. You do not give key 7 to 2 reducers.",
          "You recompute a split instead of patching a half-written file. If mapper 2 of 4 dies, you run its split again. In the model the shuffle waits for all 4 map outputs before a reducer starts. A straggler that is 5 times slower holds the job, so you launch a backup copy and keep the output that finishes first. The backup is safe only because the map is deterministic: one split yields one set of pairs.",
        ],
        {
          kind: "pipeline",
          caption: "One key goes to one reducer. A second copy of a map is safe only if the split is deterministic.",
          stages: ["Map 4 splits", "Shuffle by key", "Reduce each key once", "Backup a slow map"],
        },
        "Four maps and one slow split",
        [
          "Input is 400 megabytes. Four mappers each read about 100 megabytes and emit pairs.",
          "Key 7 from all 4 maps arrives at one reducer. A second reducer does not also own key 7.",
          "Mapper 2 is 5 times slower than the others. You start a backup copy and keep whichever output finishes first. Both copies must emit the same pairs.",
        ],
        [
          {
            prompt: "Four mappers read 400 megabytes, split evenly. About how much does each map read, and may two reducers both own key 7?",
            answer: "About 100 megabytes each. No. The shuffle gives key 7 to one reducer so that reducer sees every pair for that key.",
          },
          {
            prompt: "Mapper 2 of 4 is 5 times slower and you start a second copy. Why is keeping the first finished output safe?",
            answer: "The map is deterministic: one split yields one set of pairs. The copy writes the same output. You recompute instead of patching a half-written file.",
          },
        ],
      ),
      lec(
        "l3",
        "Counters and leases",
        [
          "You cannot treat wall clocks on 2 machines as one clock. A Lamport counter advances on each local event. If you receive a stamp of 5 while your counter is 3, you set it to 6 before work. When this rule orders event a before b, the stamp of a is smaller. A smaller stamp does not prove earlier wall time. You use the stamps to order a log, not to measure the 6 seconds a heartbeat might suggest.",
          "You grant a lock as a lease of 10 seconds, not until the owner calls unlock. If the owner dies, another worker may take the lock after expiry. A write at second 11 is late, and you reject it. The expiry is checked on every use. You renew near second 5 if the work continues. Waiting forever for an unlock waits forever after 1 crash.",
        ],
        {
          kind: "flow",
          caption: "The counter orders events. The lease ends whether or not the holder calls unlock.",
          steps: ["Receive stamp 5", "Local counter was 3", "Set the counter to 6", "Reject a write at second 11"],
        },
        "Stamp 5 meets counter 3",
        [
          "Your counter is 3. A message arrives stamped 5. You set the counter to 6 before the next local event.",
          "That orders the receive after the send. It does not say the send happened 6 seconds earlier on a wall clock.",
          "A lock leased for 10 seconds is a different clock: a write at second 11 is rejected even if the holder never crashed, only slowed.",
        ],
        [
          {
            prompt: "Your Lamport counter is 3 and you receive a message stamped 5. What do you set the counter to?",
            answer: "6. It must be at least one past the stamp you received and past your old value. A smaller stamp does not prove earlier wall-clock time.",
          },
          {
            prompt: "A lock lease is 10 seconds. The holder writes at second 11 and never called unlock. Do you accept the write?",
            answer: "No. The lease expired, so the holder no longer owns the lock. You reject the write. Renew near second 5 if the work should continue.",
          },
        ],
      ),
      lec(
        "l4",
        "A ring and a finger",
        [
          "You look up a key on a peer ring without a central directory. Each node stores its successor, the next id clockwise. A query walks successors until the node whose arc contains the key, and on a ring of 8 nodes that walk is up to 7 hops. A finger table cuts the hops. From a node, the fingers reach distances 1, 2, and 4, so one hop can skip half the remaining ids instead of stepping one successor.",
          "You store a key on the successor of its id. To survive 2 deaths you also copy it to the next 2 nodes. Finger lookup on 8 nodes takes about 3 hops, since a hop can halve the distance. A joining node takes the keys now on its arc from its successor. You do not notify all 8 nodes. Lagging fingers still end at the right successor.",
        ],
        {
          kind: "layers",
          caption: "Successors alone are a long walk. Fingers skip ahead by doubling distances.",
          rows: ["8 nodes on one ring", "Successor is the next id", "Fingers at 1, 2, and 4", "Key copied to 2 more nodes"],
        },
        "Lookup on eight nodes",
        [
          "Walking only successors on 8 nodes takes up to 7 hops to reach the arc that owns the key.",
          "Fingers at distances 1, 2, and 4 let a hop halve the remaining distance. The lookup is about 3 hops.",
          "The key lives on the successor of its id, plus the next 2 nodes, so 2 deaths do not erase it. A join moves only the keys on the new arc.",
        ],
        [
          {
            prompt: "A ring has 8 nodes and you walk only successors. What is the worst-case hop count, and about how many hops do fingers take?",
            answer: "Up to 7 hops along successors. Fingers, at distances 1, 2, and 4, bring it to about 3 hops by halving the remaining distance.",
          },
          {
            prompt: "You want the key to survive 2 deaths. How many extra nodes, beyond the successor, hold a copy?",
            answer: "2. The key is on the successor and the next 2 nodes. A joining node takes only the keys that fall on its new arc. You do not notify all 8 nodes.",
          },
        ],
      ),
      lec(
        "l5",
        "A majority before you answer",
        [
          "You elect a leader before appending to a replicated log. Servers keep a term number. After 150 milliseconds of silence a follower becomes a candidate, adds 1 to its term, and requests votes. With 5 servers the majority is 3, including its own vote. A split of 2 and 2, plus 1 server that has not voted, elects nobody. They wait a random delay and open another term.",
          "You commit a log entry only after a majority has stored it. The leader appends the entry, sends it to the other 4 servers, and waits until 2 of them store it, which makes 3 copies. Then it may answer the client. If you answer after only 1 copy, a crash loses an entry you already acknowledged. An old leader cannot overwrite a newer majority. The 3-of-5 rule is the agreement, not a hint about speed.",
        ],
        {
          kind: "pipeline",
          caption: "Votes pick a leader. Copies of the entry, not the election itself, are what let you answer.",
          stages: ["Silence for 150 ms", "Collect 3 votes of 5", "Store the entry on 3", "Then answer the client"],
        },
        "Three copies, then the reply",
        [
          "Five servers, majority 3. The candidate counts itself and needs 2 more votes.",
          "As leader it appends an entry and must see 2 other servers store it, for 3 copies, before it answers the client.",
          "Answering after the local copy alone means a crash can drop an entry the client was told was committed. A 2-2 vote split elects nobody and starts another term after a random delay.",
        ],
        [
          {
            prompt: "There are 5 servers. How many votes elect a leader, and how many stored copies must an entry have before you answer the client?",
            answer: "3 votes, counting the candidate. The entry needs 3 stored copies: the leader plus 2 of the other 4. Answering after 1 copy can lose an acknowledged entry.",
          },
          {
            prompt: "Two candidates split the remaining votes 2 and 2, and 1 server has not voted. Who leads?",
            answer: "Nobody. Neither candidate has 3 votes. They wait a random delay and open another term. A majority of 3 is the election, not a plurality.",
          },
        ],
      ),
      lec(
        "l6",
        "Quorums that intersect",
        [
          "You size quorums so every read meets every write. On 3 replicas, write 2 and read 2 intersect in at least 1. Tag each write, and the reader keeps the highest tag in its quorum. Read count plus write count must exceed 3: here 2 + 2 does. If both quorums are 1, they need not intersect, and a read can miss a write for good.",
          "You can send every write to 1 primary and read that primary, which orders updates without comparing tags. Quorum writes stay up when any 1 of the 3 replicas is down, because 2 remain and a write quorum is 2. They stop when 2 are down, because you cannot gather those 2. You choose quorums when any replica may accept a write. You choose a primary when you want one order and you can stand losing that one machine.",
        ],
        {
          kind: "pair",
          caption: "Intersection is the whole rule. A primary is a different way to get one order.",
          leftTitle: "Quorum 2 of 3",
          rightTitle: "One primary",
          left: ["Read 2 and write 2", "They share at least 1", "Highest tag wins"],
          right: ["Every write hits 1 primary", "Reads can use that primary", "Down primary stalls writes"],
        },
        "One replica down",
        [
          "N is 3, write quorum is 2, read quorum is 2. Replica 3 is down.",
          "A write still finds 2 live replicas, so it succeeds. Any later read of 2 replicas must include at least 1 of those writers.",
          "If replicas 2 and 3 are both down, only 1 remains and the write quorum of 2 cannot form. Both quorums of 1 would have allowed a read to miss the write.",
        ],
        [
          {
            prompt: "N is 3, R is 2, and W is 2. One replica is down. Can you write, and why must a later read see that write?",
            answer: "Yes, 2 replicas remain, which is the write quorum. Any read of 2 intersects any write of 2 in at least 1 replica, so the reader can take the highest tag.",
          },
          {
            prompt: "Both quorums are 1 on 3 replicas. What can a read miss?",
            answer: "A write that landed on a different replica. The sets need not intersect, because 1 + 1 does not exceed 3. The reader can miss that write for good.",
          },
        ],
      ),
      lec(
        "l7",
        "Slots, shares, and stragglers",
        [
          "You place tasks on slots. One machine with 8 slots runs 8 tasks. A job with 4 maps and 2 reduces needs 6 slots if they overlap, or 4 then 2 if reduces wait. Fairness, with 2 users waiting, gives each 4 of the 8 slots. If A has 100 tasks and B has 2, a fair share still runs B. Filling all 8 with A makes B wait behind 100 tasks.",
          "You copy a straggler. When 1 of 4 maps remains after the other 3 finish, you start a second copy on a free slot and keep the first output. If the disk on a free machine lacks the split, you wait about 1 second for a local slot, then run remotely. You do not wait forever for the local copy, and you do not skip the wait on every task.",
        ],
        {
          kind: "flow",
          caption: "Fair share is about who waits. Locality is a short wait, not a permanent one.",
          steps: ["Count 8 free slots", "Give 4 to each of 2 users", "Copy the slow map", "Wait 1 second for local data"],
        },
        "Two users, eight slots",
        [
          "The machine has 8 slots. Users A and B are both waiting. Each receives 4 slots.",
          "A has 100 tasks and B has 2. B's tasks run in B's 4 slots instead of waiting until A's 100 finish.",
          "Separately, 1 of 4 maps is left after the other 3 finish. You start a copy on a free slot. If that slot's disk lacks the split, you wait about 1 second, then run remotely.",
        ],
        [
          {
            prompt: "Eight slots and 2 waiting users. How many slots does a fair split give each, and what happens to B if A is allowed to fill all 8?",
            answer: "Each user gets 4. If A fills all 8, B waits behind A's tasks. With A holding 100 tasks and B holding 2, that wait is the failure of fairness.",
          },
          {
            prompt: "Three of 4 maps have finished and 1 remains. What do you launch, and how long do you wait for a machine that already holds the split?",
            answer: "A second copy of the remaining map, and you keep the first output to finish. You wait about 1 second for a local slot, then you run remotely rather than waiting forever.",
          },
        ],
      ),
      lec(
        "l8",
        "A job you can specify",
        [
          "You can now specify a job that survives 1 dead worker and 1 dead leader. You run 4 mappers, shuffle by key, and reduce, and you copy a map that is 5 times slower. You order events with a counter that jumps to 6 on a stamp of 5. You take a lock only as a 10-second lease, and you commit a log entry only at 3 copies out of 5.",
          "You can say which mechanism answers which failure. A backup map is safe because the map is deterministic and the same split yields the same pairs. A write quorum of 2 still succeeds when 1 of 3 replicas is down, and it fails when 2 are down. Fairness on 8 slots gives 4 slots to each of 2 waiting users. Answering a client after 1 log copy would make the majority rule false.",
        ],
        {
          kind: "layers",
          caption: "Match the failure to the record that survives it. A timeout alone is not that record.",
          rows: ["Deterministic map, plus a copy", "Majority of 3 out of 5", "Quorum 2 when 1 is down", "4 slots for each of 2 users"],
        },
        "A slow map and one dead replica",
        [
          "One of 4 mappers is 5 times slower. You launch a second copy and keep the first finished output, which is safe because the split determines the pairs.",
          "That output is written with a quorum of 2 out of 3. One replica is down, and 2 remain, so the write still forms.",
          "If 2 replicas were down, the quorum could not form and the finished map would have nowhere to land under that rule. The copy and the quorum solve different failures.",
        ],
        [
          {
            prompt: "One of 4 mappers is 5 times slower, and each map output is written to a quorum of 2 out of 3 replicas. Why is a second copy of the slow map safe, and can the write finish if 1 replica is down?",
            answer: "The copy is safe because the map is deterministic: the same split yields the same pairs, and you keep one finished output. A write quorum of 2 still succeeds when 1 of 3 replicas is down. If 2 are down, the quorum cannot form.",
          },
          {
            prompt: "A leader has stored a log entry on 1 server and wants to answer the client. Separately, 2 users share 8 slots. What is wrong with the answer, and how many slots does each user get under a fair split?",
            answer: "The entry is not committed: with 5 servers you need 3 stored copies before you answer, and 1 copy can be lost. Each of the 2 users gets 4 of the 8 slots. The early answer and the slot split are different rules.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-680",
    lectures: [
      lec(
        "l1",
        "Stuck-at, then collapse",
        [
          "You model a defect as a stuck-at fault on one line. Stuck-at-0 forces the line to 0 no matter what drives it. Stuck-at-1 forces it to 1. A 2-input AND has 6 single stuck-at faults if you count both inputs and the output, each in 2 polarities. You assume one fault at a time. A passing test does not call the chip perfect. It says those faults, alone, would have changed an output you observed.",
          "You collapse equivalent faults before you count the work. On an AND, an input stuck-at-0 and the output stuck-at-0 both force the output to 0 for every input, so you keep 1 representative. Input stuck-at-1 is not the same as output stuck-at-1: the other input can still make the output 0. After the collapse this gate is 4 faults, not 6. You generate tests for the collapsed set and you remember what you merged.",
        ],
        {
          kind: "pair",
          caption: "Same gate, two polarities. Equivalent faults are one test, not two.",
          leftTitle: "Stuck-at-0",
          rightTitle: "Stuck-at-1",
          left: ["Line forced to 0", "AND input matches output", "One class after collapse"],
          right: ["Line forced to 1", "AND input is not the output", "Keep it in the list"],
        },
        "Six faults become four",
        [
          "A 2-input AND has faults on input a, input b, and the output, each stuck-at-0 and stuck-at-1. That is 6 faults.",
          "Input a stuck-at-0, input b stuck-at-0, and output stuck-at-0 all force the output to 0. You keep 1 of them.",
          "Input a stuck-at-1, input b stuck-at-1, and output stuck-at-1 stay distinct. The collapsed list has 4 faults, not 6.",
        ],
        [
          {
            prompt: "How many single stuck-at faults does a 2-input AND have before collapse, and how many equivalence classes after the collapse in this lecture?",
            answer: "6 before collapse: two inputs and the output, each stuck-at-0 and stuck-at-1. After collapse, 4. The three stuck-at-0 faults are one class. The three stuck-at-1 faults are not equivalent to each other.",
          },
          {
            prompt: "Why is an AND input stuck-at-1 not equivalent to the output stuck-at-1?",
            answer: "With the other input at 0, an input stuck-at-1 still yields output 0, while output stuck-at-1 yields 1. The two faults are distinguishable, so you keep both.",
          },
        ],
      ),
      lec(
        "l2",
        "Activate, justify, observe",
        [
          "You build a test by making the good circuit and the bad circuit disagree at a pin you can see. For an AND output stuck-at-0 you need the good output to be 1, so you set both inputs to 1. The faulty output is 0. That pair, good 1 and bad 0, is the discrepancy you move toward a primary output. If a later gate blocks it, the pattern does not detect the fault even though you activated it.",
          "You justify side inputs so the discrepancy can pass. A 2-input OR passes it only if the other input is 0. Side input 1 makes the OR output 1 in both machines, and the fault is masked. An AND passes a discrepancy only if its side input is 1. With 2 side inputs, a contradiction sends you back. The pattern is the assignment that reaches a pin.",
        ],
        {
          kind: "flow",
          caption: "Activation without a path to a pin detects nothing. Side inputs are part of the pattern.",
          steps: ["Set both AND inputs to 1", "Good 1, faulty 0", "Hold the OR side at 0", "Read the pin"],
        },
        "An AND feeding an OR",
        [
          "The fault is the AND output stuck-at-0. You set both AND inputs to 1. Good output is 1, faulty output is 0.",
          "That discrepancy enters one input of a 2-input OR. You set the other OR input to 0 so the discrepancy reaches the OR output.",
          "If you had set the side input to 1, both machines would drive the OR to 1 and the fault would be invisible. The pattern is the values that survive that check.",
        ],
        [
          {
            prompt: "You want to detect an AND output stuck-at-0. What do you drive on the two inputs, and what do the good and bad outputs do?",
            answer: "Both inputs are 1. The good output is 1 and the faulty output is 0. If a later gate masks that pair, the pattern still does not detect the fault.",
          },
          {
            prompt: "A discrepancy arrives on one input of a 2-input OR. What must the other input be, and what happens if you set it to 1?",
            answer: "The other input must be 0, or the discrepancy dies. If it is 1, both the good and the bad machine produce 1, and the fault is masked.",
          },
        ],
      ),
      lec(
        "l3",
        "Coverage after fault dropping",
        [
          "You grade patterns by fault simulation. You simulate the good machine once, then each faulty machine, and you mark a fault detected when some output differs. With 50 collapsed faults and 45 detected, coverage is 45/50 = 0.90. The other 5 are undetected. A long set that still misses them is not finished until you know whether they are redundant or merely untested.",
          "You drop a fault once some pattern detects it. After early patterns, 45 of 50 are gone and the next pattern is scored against the remaining 5, so later patterns simulate less. A fault that no pattern can detect may be redundant: nothing makes good and bad differ. Pushing coverage to 100 percent fails if 2 of the 50 are redundant. You separate those 2 from faults you have not hit yet.",
        ],
        {
          kind: "pipeline",
          caption: "Drop detected faults. The last few simulations are about the residue, not the whole list.",
          stages: ["Simulate the good machine", "Simulate remaining faults", "Mark a differing pin", "Drop the detected ones"],
        },
        "Forty-five of fifty",
        [
          "The collapsed list has 50 faults. Patterns so far make 45 of them disagree with the good machine on some pin.",
          "Coverage is 45/50 = 0.90. You drop those 45. The next pattern is simulated against 5 faults, not 50.",
          "If 2 of those 5 can never be detected, they are redundant. The other 3 are still your test-generation job. Reporting 100 percent would be false.",
        ],
        [
          {
            prompt: "Patterns detect 45 of 50 collapsed faults. What is the coverage, and how many faults does the next pattern need to be simulated against if you drop detected faults?",
            answer: "Coverage is 45/50 = 0.90. The next pattern is simulated against the remaining 5, not against all 50.",
          },
          {
            prompt: "Two of the 50 faults are redundant. Why will more patterns never reach coverage 1?",
            answer: "No input makes the good machine and that faulty machine differ, so no pattern detects them. You separate those 2 from the faults you have not tried. The ceiling is 48/50 = 0.96 if the other 48 are detectable.",
          },
        ],
      ),
      lec(
        "l4",
        "A scan chain",
        [
          "You cannot set internal flip-flops from the pins the way you set the AND inputs. Scan adds a second path. Each flip-flop gets a multiplexer on its data input. In scan mode the flops form one shift register. You shift a pattern in, apply 1 functional clock, and shift the captured bits out. A chain of 100 flops needs 100 scan clocks to load and 100 to unload, plus that 1 capture, for every pattern.",
          "You pay area and time for scan. The multiplexer adds delay, and scan enable costs a pin unless you reuse one. For 20 patterns on a chain of 100, without overlapping the two shifts, clocks are 20 times (200 + 1) = 4020. You turn scan off in mission mode, or the chip is only a shift register. Scan lets pattern generation treat the cloud as combinational logic.",
        ],
        {
          kind: "layers",
          caption: "Mission mode uses the functional input. Scan mode chains the flops into one shift register.",
          rows: ["Combinational cloud", "Mux on each flip-flop", "Chain of 100", "One capture clock"],
        },
        "Twenty patterns, chain of 100",
        [
          "Each pattern shifts 100 bits in, pulses 1 capture clock, and shifts 100 bits out. That is 201 clocks, and you are not overlapping the shifts.",
          "Twenty patterns cost 20 times 201 = 4020 clocks.",
          "In mission mode scan enable is off, so the multiplexer selects functional data. Left on, every flop is only a bit in a shift register.",
        ],
        [
          {
            prompt: "A chain has 100 flops and you do not overlap shift-in with shift-out. How many clocks does 1 pattern take, and how many do 20 patterns take?",
            answer: "One pattern takes 100 + 100 + 1 = 201 clocks. Twenty patterns take 20 times 201 = 4020 clocks.",
          },
          {
            prompt: "Why must scan enable be off in mission mode?",
            answer: "If it stays on, the flops form a shift register and the chip is not the functional design. The multiplexer must select the functional data input. Scan is a test mode, not the product mode.",
          },
        ],
      ),
      lec(
        "l5",
        "Patterns from a register",
        [
          "You generate patterns on the chip when a tester cannot feed a long chain at speed. A linear feedback shift register makes them. A 4-bit register with the right taps visits 15 nonzero states, because 2 to the fourth minus 1 is 15, then it repeats. The all-zero state sticks at 0, so you do not seed 0. Each clock is a new pattern for the combinational block. You did not store those 15 patterns in a table.",
          "You compact responses so you do not shift every result off the chip. A signature register folds each response into a running code of 16 bits, and you compare that 1 code with the good signature. Two streams can share a code. There are 65536 codes, so a random bad stream hits the good one about 1 time in 65536. You accept that or you add bits.",
        ],
        {
          kind: "flow",
          caption: "Do not seed the all-zero state. Compact the responses to one code and accept a tiny alias risk.",
          steps: ["Seed a nonzero 4-bit state", "Clock through 15 patterns", "Fold responses to 16 bits", "Compare one signature"],
        },
        "Fifteen patterns, one signature",
        [
          "A 4-bit register with the right taps has 15 nonzero states. You seed anything but 0, or it stays at 0.",
          "Fifteen clocks produce 15 patterns. You do not store them off-chip.",
          "Responses fold into a 16-bit signature. A wrong stream matches the good signature about 1 time in 65536. You compare that one code, not every response bit.",
        ],
        [
          {
            prompt: "What is the period of a maximal 4-bit linear feedback shift register, and why do you avoid the seed 0?",
            answer: "15, which is 2 to the fourth minus 1. The all-zero state has period 1: it sticks at 0 and never produces the other patterns.",
          },
          {
            prompt: "A 16-bit signature has how many codes, and about how often does a random bad stream match the good signature?",
            answer: "65536 codes. A random bad stream matches about 1 time in 65536. That alias is why a passing signature is not a proof that every response bit was correct.",
          },
        ],
      ),
      lec(
        "l6",
        "Marching through a memory",
        [
          "You test a memory as cells, not as a cloud of gates. A march walks addresses in one direction and applies a fixed list of reads and writes. For 4 addresses, an up march touches 0, then 1, then 2, then 3. A down march touches 3, then 2, then 1, then 0. The element read-0 write-1 expects 0 and leaves 1. You fail the chip on the first read that returns the wrong bit.",
          "You pick the march for the fault you claim. Stuck-at cells fall to a short march: write 0 everywhere, then upward read 0 and write 1, then downward read 1 and write 0. On 4 cells that is 4 writes, plus 8 operations upward, plus 8 downward, so 20 operations. A coupling fault, where a write to cell i flips cell j, can hide on an up-only walk. You keep the down pass, and you record the 20.",
        ],
        {
          kind: "layers",
          caption: "Direction is part of the test. Up alone can miss a coupling that down exposes.",
          rows: ["Write 0 on the way up", "Read 0, write 1, upward", "Read 1, write 0, downward", "20 operations on 4 cells"],
        },
        "Twenty operations on four cells",
        [
          "Upward, write 0 at addresses 0, 1, 2, and 3. That is 4 writes.",
          "Upward again, read 0 and write 1 at each address: 8 operations. Downward, read 1 and write 0 at each address: 8 more.",
          "The total is 4 + 8 + 8 = 20. The first wrong read fails the chip. Dropping the downward pass can hide a coupling that only shows up when addresses fall.",
        ],
        [
          {
            prompt: "The march is write 0 up, then read 0 write 1 up, then read 1 write 0 down, on 4 cells. How many operations is that?",
            answer: "20. The first element is 4 writes. Each of the other two elements is 4 reads and 4 writes, so 8 plus 8. 4 + 8 + 8 = 20.",
          },
          {
            prompt: "Why keep the downward pass if the upward pass already wrote and read every cell?",
            answer: "A coupling fault can depend on direction: a write to a higher address flips a lower cell, or the reverse. An up-only walk can miss it. You record the down pass as part of the 20 operations.",
          },
        ],
      ),
      lec(
        "l7",
        "Intersect the suspects",
        [
          "You diagnose by intersecting the faults that predict the failures. Pattern P1 fails, and only faults f2 and f5 in the dictionary predict that fail. Pattern P2 fails, and only f5 and f7 predict it. The intersection is f5, so you indict f5. Stop after P1 and you still have 2 suspects. The second pattern is what isolates 1. The dictionary stores those predictions so the bench does not resimulate during the session.",
          "You sometimes get an empty set or a pair. Empty means the defect is not a single stuck-at in the dictionary, or the setup is wrong. A pair no pattern separates is indistinguishable, as with equivalent faults on the AND. You cannot name 1 net when both explain all 3 failing patterns and the passes. You report the set, not a guess from the first red pin.",
        ],
        {
          kind: "pair",
          caption: "Each failing pattern contributes a set. The diagnosis is the intersection, which can be empty.",
          leftTitle: "After pattern P1",
          rightTitle: "After pattern P2",
          left: ["Suspects f2 and f5", "Two explanations", "Do not stop here"],
          right: ["Suspects f5 and f7", "Intersection is f5", "One site indicted"],
        },
        "Two patterns, one site",
        [
          "P1 fails. The dictionary says only f2 and f5 would cause that failure. You have 2 suspects.",
          "P2 fails. The dictionary says only f5 and f7 would cause it.",
          "The intersection is f5. You indict f5, not f2 and not f7. If the intersection had been empty, the single stuck-at model would not explain this chip.",
        ],
        [
          {
            prompt: "P1 is explained only by f2 and f5. P2 is explained only by f5 and f7. Which fault do you indict?",
            answer: "f5. It is the only fault in both sets. Stopping after P1 would leave 2 suspects. The dictionary is what lists those predictions.",
          },
          {
            prompt: "The intersection of the explaining sets is empty after 3 failing patterns. What do you conclude?",
            answer: "The defect is not a single stuck-at from the dictionary, or the setup is wrong. You do not pick a favorite net from the first red pin. An indistinguishable pair would be reported as a set of 2, not as one name.",
          },
        ],
      ),
      lec(
        "l8",
        "A test plan with two ledgers",
        [
          "You can now take a small netlist from a fault list to a scan plan. You list stuck-at sites, collapse an AND from 6 faults to 4, and sensitize a path so good and bad differ at a pin. You grade coverage as 45 out of 50. You insert a scan chain of 100 flops when state is not controllable, and you can replace patterns with a register of period 15.",
          "You can also read a failing chip. A march of 20 operations on 4 cells catches the cell faults you built it for, and intersecting 2 failing patterns can cut 2 suspects to 1. Coverage and diagnosis answer different questions. A figure of 0.90 says how much of the list you can light up. The intersection says which site explains this chip. You can write both numbers and not mix them.",
        ],
        {
          kind: "flow",
          caption: "Coverage grades the list. Diagnosis names a site on one chip. Do not swap the sentences.",
          steps: ["Collapse, then sensitize", "Grade 45 of 50", "Time the chain of 100", "Intersect failing patterns"],
        },
        "Coverage and scan time",
        [
          "The list has 50 collapsed faults and 45 are detected. Coverage is 0.90. The other 5 are not cured by calling the scan chain longer.",
          "The chain has 100 flops and you apply 20 patterns with no shift overlap. Each pattern is 201 clocks, and 20 patterns are 4020 clocks.",
          "A separate chip fails 2 patterns whose suspect sets intersect in 1 fault. That name is a diagnosis. It is not a new coverage number.",
        ],
        [
          {
            prompt: "You have 50 collapsed faults and the patterns detect 45. A chain of 100 flops runs 20 patterns with no shift overlap, at 2 full shifts plus 1 capture per pattern. What is the coverage, and how many clocks do you spend?",
            answer: "Coverage is 45/50 = 0.9. Clocks are 20 times (2 times 100 plus 1) = 20 times 201 = 4020. More scan clocks do not detect the other 5 unless new patterns actually detect them. Coverage and scan time are different ledgers.",
          },
          {
            prompt: "A march on 4 cells uses 20 operations, and two failing patterns have suspect sets {f2, f5} and {f5, f7}. What does the march count, and which fault do you indict?",
            answer: "The 20 counts reads and writes of the march, not stuck-at coverage. The intersection of the two sets is f5, so you indict f5. The march and the dictionary answer different questions about the same chip.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-714",
    lectures: [
      lec(
        "l1",
        "Unit, cluster, and chip",
        [
          "You verify an IP at 3 scales and you do not keep one bench for all of them. The unit is one 32-bit peripheral whose pins you can still drive. The cluster puts several IPs on one bus; new bugs sit in the wiring and the arbiter, not in a unit you closed. The chip adds clocks and pads. A property proved on the unit for 20 cycles is not a cluster proof. You write one goal per scale.",
          "You reuse the unit checker at the cluster instead of rewriting it. The mechanism is an agent bound to an interface, not to a global pin name. The agent that drove the peripheral alone now watches the internal bus. You expect its 4 opcode bins to be hit again by neighbors. If a bin is empty only at the cluster, that opcode never appears. You record whether it is illegal at this scale.",
        ],
        {
          kind: "layers",
          caption: "A unit proof does not climb the stack by itself. Each scale has its own goal.",
          rows: ["Unit: one IP, all pins", "Cluster: several IPs, one bus", "Chip: clocks, resets, pads", "Reuse the unit agent"],
        },
        "An opcode the cluster never sends",
        [
          "At the unit, 4 opcode bins are hit by sequences you wrote. A 20-cycle proof covers the unit properties you named.",
          "At the cluster the same agent watches the internal bus. Opcode 3's bin stays at 0.",
          "Either the neighbors cannot legally send opcode 3, which you waive with a reason, or the wiring dropped it. The unit proof does not decide which.",
        ],
        [
          {
            prompt: "A property is proved on the unit to a bound of 20 cycles. Does that prove the same property for the cluster?",
            answer: "No. The cluster adds wiring and an arbiter the unit proof did not include. You write a separate goal for the cluster, even if you reuse the unit agent.",
          },
          {
            prompt: "The unit hit 4 opcode bins. At the cluster, 1 of those bins stays empty. What are the two honest explanations?",
            answer: "The opcode is illegal once the IP is integrated, and you waive that bin with a reason, or the integration never produces it, which is a cluster bug. The empty bin alone does not say which.",
          },
        ],
      ),
      lec(
        "l2",
        "Sequence, driver, monitor, scoreboard",
        [
          "You split the bench so each layer does one job. A sequence names a transaction: opcode 2, length 4, and a payload. A driver turns it into pin wiggles. A monitor rebuilds a transaction from pins. A scoreboard compares it with a reference. You do not let the sequence poke pins, and you do not let the driver judge correctness. When the bus grows from 32 bits to 64, you retune the driver and keep the sequence.",
          "You bring the layers up in an order you can debug. First you send 1 directed sequence through the driver and read what the monitor reconstructed. If those two disagree, the bench is lying and the design is not on trial. Then you connect the scoreboard. Then you enable random sequences. A team that starts with 100 seeds cannot tell a driver bug from a design bug. The 4 layers are what make a failure point at one place.",
        ],
        {
          kind: "pipeline",
          caption: "The sequence never touches a pin. The driver never decides pass or fail.",
          stages: ["Sequence: opcode 2", "Driver wiggles pins", "Monitor rebuilds it", "Scoreboard compares"],
        },
        "One directed sequence first",
        [
          "You send one sequence: opcode 2, length 4. The driver wiggles the 32-bit bus. The monitor should reconstruct opcode 2 and length 4.",
          "If the monitor reports length 8, you fix the monitor or the driver before you look at the design. The scoreboard is still disconnected.",
          "Only after that pair agrees do you connect the scoreboard and then turn on random sequences. Starting with 100 seeds would mix bench bugs with design bugs.",
        ],
        [
          {
            prompt: "The bus width changes from 32 to 64. Which layer do you retune, and which layer should stay?",
            answer: "Retune the driver, which turns transactions into pin wiggles. Keep the sequence, which still says opcode 2 and length 4. The sequence does not poke pins.",
          },
          {
            prompt: "The monitor reports a different length than the one sequence you sent. Where do you look first?",
            answer: "At the bench, not the design. The driver and the monitor disagree on 1 directed sequence, so one of them is wrong. Connect the scoreboard only after they agree.",
          },
        ],
      ),
      lec(
        "l3",
        "One agent, two configurations",
        [
          "You parameterize the agent with a configuration object so 2 instances are not 2 copies of the source. The object carries the width, 32 or 64, an address mask, and whether the agent is active or passive. An active agent drives. A passive agent only monitors, which is what you want on a port you do not own. You build both from the same source. A pasted copy misses a fix you applied to only 1 of the 2 copies.",
          "You pass the configuration before any sequence runs. A sequence that reads the width can emit a payload of 8 bytes on the narrow bus and 16 bytes on the wide bus without an edit. A literal 32 buried in the driver makes the 64-bit instance wrong, and the wide bins stay at 0. You keep 1 object per instance. Sharing 1 object between 2 agents means a change for the peripheral silently retunes the arbiter monitor.",
        ],
        {
          kind: "pair",
          caption: "Same source, two objects. A pasted second agent will miss the next bugfix.",
          leftTitle: "Active, width 32",
          rightTitle: "Passive, width 64",
          left: ["Drives the peripheral", "Payload of 8 bytes", "Own config object"],
          right: ["Only monitors", "Payload of 16 bytes", "Not a second copy"],
        },
        "Eight bytes or sixteen",
        [
          "The narrow configuration says width 32. The sequence asks the object and builds a payload of 8 bytes.",
          "The wide configuration says width 64. The same sequence builds 16 bytes. You did not edit the sequence.",
          "If both agents shared 1 object, setting the peripheral to 32 would also force the arbiter monitor to 32. Each instance gets its own object.",
        ],
        [
          {
            prompt: "Width 32 uses an 8-byte payload and width 64 uses 16 bytes, chosen by the sequence from the configuration. What goes wrong if the driver contains a literal 32?",
            answer: "The 64-bit instance still behaves as a 32-bit bus. Wide bins stay at 0. The sequence cannot correct a width that the driver ignored.",
          },
          {
            prompt: "Why is a passive agent not a second copy of the active source?",
            answer: "Both are the same source, selected by the configuration: active drives, passive only monitors. A pasted copy would miss a fix applied to only 1 of the 2 files.",
          },
        ],
      ),
      lec(
        "l4",
        "Hits, holes, and waivers",
        [
          "You close coverage against a written plan, not a feeling about seeds. A cross of 4 opcodes and 2 directions has 8 bins, and 2 are empty after 50 seeds. Closure means every bin is hit or waived. A waiver names the bin and the reason. Hard to hit is not a reason. If opcode 3 with direction 1 is forbidden by a configuration bit, the denominator becomes 7, not 8.",
          "You aim stimulus at a hole instead of adding seeds. If a seed hits the empty bin 1 time in 100, then 50 seeds are a weak bet. You add a directed sequence that forces opcode 3 and direction 1, run it once, and watch the bin go from 0 to 1. Randomness filled 6 bins. The other 2 are the closure work. You recheck after a design change so a hit bin does not return to 0.",
        ],
        {
          kind: "flow",
          caption: "An empty bin is a task. A waiver changes the denominator only with a reason you can read.",
          steps: ["List the 8 bins", "See that 2 are empty", "Force the pair, or waive", "Denominator may become 7"],
        },
        "Two holes after fifty seeds",
        [
          "The cross has 4 times 2 = 8 bins. After 50 seeds, 6 bins are nonzero and 2 are 0.",
          "One empty bin is illegal under the configuration. You waive it, name the bit that forbids it, and the denominator becomes 7.",
          "The other empty bin is legal. You add one directed sequence that forces that pair. Its count goes from 0 to 1. More copies of the same 50 seeds are not the plan.",
        ],
        [
          {
            prompt: "A cross has 8 bins, 6 are hit, and 1 empty bin is illegal under a configuration bit. What is the denominator after a proper waiver?",
            answer: "7. You remove the illegal bin from the plan and you write the reason. The remaining empty legal bin is still open. Hard to hit is not a waiver.",
          },
          {
            prompt: "An empty legal bin is hit by about 1 seed in 100, and you have run 50. Why is another 50 of the same stimulus a weak plan?",
            answer: "Fifty seeds are fewer than the 100 you would expect to wait, and you can still miss. A directed sequence or a constraint that forces the pair hits the bin once, on purpose.",
          },
        ],
      ),
      lec(
        "l5",
        "Seeds and one signature",
        [
          "You run the suite on every change, and you record the seed. A failure stores the seed, here 17, the test name, and a signature of the log. Rerunning seed 17 reproduces the same draws, which is the only reason a random failure is debuggable. Lose the seed and the night of 100 seeds is a story you cannot replay. You triage by signature: 12 failures with 1 signature are 1 bug, not 12.",
          "You rank signatures before you ignore any of them. A signature that shows up on 2 tests after a one-line arbiter edit is your first read. A signature that has failed for 9 nights is old, and you do not let it hide a new signature that failed once. You keep the last passing change beside the first failing one. The difference is where you read. A suite that always fails teaches you nothing about today's edit.",
        ],
        {
          kind: "pipeline",
          caption: "The seed replays the draws. The signature groups failures so you debug once.",
          stages: ["Save seed 17", "Hash the failing log", "Group 12 into 1 bug", "Diff the last pass"],
        },
        "Twelve logs, one bug",
        [
          "Seed 17 fails. You store 17, the test name, and a signature of the log. A rerun with seed 17 hits the same draw.",
          "That night, 12 tests fail and all 12 share the signature. You debug 1 bug, not 12.",
          "Nine older nights already carry a different signature. You do not start there if a new signature appeared after the arbiter edit. The passing change just before this one is the diff you read.",
        ],
        [
          {
            prompt: "Twelve failing tests share one signature, and the failure was first seen with seed 17. How many bugs do you open, and how do you replay?",
            answer: "One bug. You rerun seed 17 to reproduce the draws. Without the seed, the 100-seed night cannot be replayed. The signature is what grouped the 12 logs.",
          },
          {
            prompt: "A signature has failed for 9 nights, and a new signature failed once after today's edit. Which do you read first, and why?",
            answer: "The new signature. The 9-night failure is old and will hide today's bug if you only stare at it. You also keep the last passing change next to the first failing one.",
          },
        ],
      ),
      lec(
        "l6",
        "A proof with a small cone",
        [
          "You use a formal tool where the state is small, and you leave the long traces to simulation. A credit counter whose maximum is 4 is such a block. You assert it never goes below 0 and never above 4. A failure comes back as a waveform, here 12 cycles. You turn that waveform into a directed test so the bug stays in the suite after you fix it.",
          "You do not submit the whole chip. The cone of the assertion is the counter and its 2 inputs, not the processor. Assumptions about the handshake are part of the proof. If cluster tests violate an assumption 1 time in 50, the proof does not apply there. You fix the neighbor or weaken the assumption and prove again. A bound of 20 cycles says nothing about cycle 21.",
        ],
        {
          kind: "pair",
          caption: "Formal exhausts a small cone. Simulation still owns the chip and the long traces.",
          leftTitle: "Formal cone",
          rightTitle: "Chip simulation",
          left: ["Counter max is 4", "Proof or a 12-cycle wave", "Assumptions are in the claim"],
          right: ["Whole chip, many cycles", "May break an assumption", "Keeps the directed test"],
        },
        "Credits reach five",
        [
          "The counter's maximum is 4. The checker asks whether credits can hit 5 or go below 0.",
          "The tool returns a waveform of 12 cycles in which the count becomes 5. You add that waveform as a directed test.",
          "The cone was the counter and 2 inputs. If you had assumed a handshake the cluster breaks 1 time in 50 tests, the proof does not cover those tests until you fix the assumption.",
        ],
        [
          {
            prompt: "A credit counter must stay between 0 and 4, and the tool returns a 12-cycle waveform where the count is 5. What do you add to the simulation suite?",
            answer: "A directed test taken from that waveform, so the bug remains covered after the fix. The formal run found it. The simulation suite is what keeps it from returning unnoticed.",
          },
          {
            prompt: "You proved the counter only under a handshake assumption, and cluster tests violate that assumption 1 time in 50. What is the proof worth on those tests?",
            answer: "It does not apply. The assumption is part of the claim. You fix the neighbor or weaken the assumption and prove again. A bound of 20, if that was the request, also says nothing about cycle 21.",
          },
        ],
      ),
      lec(
        "l7",
        "Rules between two IPs",
        [
          "You put a protocol checker on the bus between IPs, because integration bugs are protocol bugs. A valid-ready handshake has 2 rules. While valid is high and ready is low, data must hold. After valid rises it stays high until a cycle where ready is also high. If valid drops after 1 cycle with ready still low, the consumer can miss the beat, and the checker flags that cycle. A payload scoreboard never sees a withdrawn beat.",
          "You check credits the same way. A sender with 4 credits may issue 4 beats, then must wait. Each accepted beat returns 1 credit, and the count stays between 0 and 4. Two IPs that passed unit tests can still deadlock if each waits for the other's first credit. The cluster checker sees that wait. The unit benches never ran the pair. You fail on the illegal cycle, not after a 10000-cycle timeout that only says hung.",
        ],
        {
          kind: "flow",
          caption: "The checker names the cycle. A timeout of 10000 only says the test stopped making progress.",
          steps: ["Valid holds until ready", "Data stays while waiting", "Credits stay within 0 to 4", "Fail on the bad cycle"],
        },
        "Valid drops too early",
        [
          "Valid rises and ready stays low. The data must hold, and valid must stay high.",
          "On the next cycle valid falls while ready is still low. The consumer can miss the beat. The checker fails on that cycle.",
          "A sender that has used all 4 credits and issues a fifth beat fails the credit rule the same way. Waiting 10000 cycles to announce a hang does not name the cycle.",
        ],
        [
          {
            prompt: "Valid is high for 1 cycle, ready stays low, and valid then falls. Which rule fails?",
            answer: "Valid must stay high until a cycle where ready is also high. Dropping it while ready is low lets the consumer miss the beat. The payload scoreboard may never see that withdrawn beat.",
          },
          {
            prompt: "A sender has 4 credits and issues a fifth beat before any credit returns. What do you report, and why is a 10000-cycle timeout worse?",
            answer: "The credit count left the range 0 to 4, so you fail on that beat. A timeout of 10000 cycles only says the test hung. It does not name the illegal cycle, and two unit-clean IPs can still deadlock as a pair.",
          },
        ],
      ),
      lec(
        "l8",
        "Reuse, then close",
        [
          "You can now verify an IP and reuse the work on the next one. You bind one agent, active or passive, to a port of width 32 or 64. You drive sequences, not pins. You close a cross of 8 bins by a hit or a waiver on each bin. You can replay a failure from seed 17, and you can turn a 12-cycle waveform of a 4-credit counter into a directed test.",
          "You can also pick the scale. A unit proof, even to 20 cycles, does not close the cluster, and a cluster protocol checker does not replace the unit scoreboard. When 2 bins are empty you change the stimulus or you waive with a reason. You do not only add seeds. When 12 failing tests share a signature, you debug once. You can write the plan for a new peripheral as reused pieces plus the holes that are actually new.",
        ],
        {
          kind: "layers",
          caption: "The plan for a new IP is the reused machinery plus the holes that are actually new.",
          rows: ["One agent, two widths", "8 bins hit or waived", "Seed 17 replays", "Formal wave becomes a test"],
        },
        "A waveform and two empty bins",
        [
          "Formal analysis of a counter whose maximum is 4 returns a 12-cycle waveform in which credits hit 5. You add that waveform as a directed test.",
          "The cluster cross has 8 bins and 6 are hit. The new test does not fill the other 2 unless those bins are the same behavior.",
          "You still hit or waive each of the 8 bins. The proof and the cross are two ledgers. A unit bound of 20 cycles does not close either of them by itself at the cluster.",
        ],
        [
          {
            prompt: "A formal run on a counter whose maximum is 4 returns a 12-cycle waveform where credits hit 5. The cluster cross has 6 of 8 bins hit. What do you add to simulation, and does that close coverage?",
            answer: "You add a directed test from the 12-cycle waveform so the credit bug stays covered. That test does not fill the 2 empty bins unless they are the same behavior. Each of the 8 bins still needs a hit or a waiver. The formal result and the cross are separate.",
          },
          {
            prompt: "You have one agent configured for width 32 and you need the same checker on a 64-bit port. What do you reuse, and what must not be shared?",
            answer: "You reuse the agent source and pass a second configuration with width 64, passive or active as needed. You do not share one configuration object between the two instances, and you do not paste a second copy of the source.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-735",
    lectures: [
      lec(
        "l1",
        "Four states of one line",
        [
          "You track a cache line in 4 states so two cores do not silently keep different data. Modified means this core has the only copy and it is dirty. Exclusive means the only clean copy. Shared means other cores may hold it. Invalid means do not use it. A write to a Shared line invalidates the others first. With 2 cores in Shared, one store leaves the writer Modified and the other Invalid.",
          "You pay a coherence message for that store, not only a local write. The line is 64 bytes. Invalidating it reaches the other core even if you changed 4 bytes. Exclusive lets you write with no message when nobody else holds the line: you upgrade Exclusive to Modified locally. The state is checked on the access. If you forget that Shared requires an invalidation, you will describe a broadcast as if it had been one store.",
        ],
        {
          kind: "pair",
          caption: "A store to a Shared line is a coherence transaction. Exclusive can upgrade locally.",
          leftTitle: "Before the store",
          rightTitle: "After the store",
          left: ["Both cores Shared", "Line is 64 bytes", "Data matches"],
          right: ["Writer is Modified", "Other core is Invalid", "4 bytes caused a message"],
        },
        "Two cores, one store",
        [
          "Core 0 and core 1 both hold the line Shared. The line is 64 bytes.",
          "Core 0 stores 4 bytes. It must invalidate core 1. Core 0 becomes Modified. Core 1 becomes Invalid.",
          "A later read on core 1 misses and fetches the new data. If the line had been Exclusive on core 0, the store would have upgraded to Modified with no message.",
        ],
        [
          {
            prompt: "Two cores hold a line Shared. One stores. What states do the writer and the other core end in?",
            answer: "The writer is Modified and the other core is Invalid. The store is not only a local write. The other copy must be invalidated first.",
          },
          {
            prompt: "The line is Exclusive on one core and Invalid everywhere else. The core stores 4 bytes of the 64-byte line. Does it send an invalidation?",
            answer: "No. Exclusive means nobody else holds the line, so the upgrade to Modified is local. A Shared line would have required an invalidation even for those 4 bytes.",
          },
        ],
      ),
      lec(
        "l2",
        "Shared memory or a message",
        [
          "You pick the tool from the address spaces. Four cores on one socket share memory, so a thread publishes a result by writing a variable. Four nodes do not, so you send a message of 4096 bytes. A race is 2 threads using one address, at least one writing, with no order you enforced. A receive completes after its send. You do not hide a race with extra messages on one socket unless the copy is the point.",
          "You pay for the choice in overhead. Spawning 4 threads to add 4 numbers spends more time on the spawn than on the adds. You put enough work in a task, thousands of operations, before you pay for another thread. A message of 8 bytes pays almost the same startup as a larger one, so you pack values into one buffer of 8 doubles instead of sending 8 messages. The tool fits when the work between synchronizations hides the synchronization.",
        ],
        {
          kind: "pipeline",
          caption: "Choose from whether an address is shared. Then make the work bigger than the handshake.",
          stages: ["Shared socket or 4 nodes", "Threads or one message", "Pack 8 doubles", "Check for a race"],
        },
        "Four numbers, wrong tool",
        [
          "You want the sum of 4 numbers on one socket. Spawning 4 threads costs more than the 4 adds.",
          "The right cut is one thread, or a larger task with thousands of operations per thread.",
          "Across 4 nodes you cannot publish the sum by writing a variable. You send a message. Eight separate 8-byte messages pay 8 startups; one buffer of 8 doubles pays 1.",
        ],
        [
          {
            prompt: "Two threads write the same address and you enforced no order. What is that called, and does sending extra messages inside one socket fix it?",
            answer: "A data race. Extra messages inside one socket only help if the copy is the point. The fix on shared memory is an order you enforce, such as a lock or an atomic, around that address.",
          },
          {
            prompt: "You need to move 8 doubles to another node. Why is one message better than 8 messages?",
            answer: "Each message pays startup. Eight bytes of payload barely change that startup, so 8 messages pay 8 startups. One buffer of 8 doubles pays once.",
          },
        ],
      ),
      lec(
        "l3",
        "A bound before you buy cores",
        [
          "You bound speedup before you add cores. If fraction s is serial and the rest scales with n cores, speedup is 1 divided by s plus (1 minus s) divided by n. For s = 0.2 and n = 4, the denominator is 0.2 + 0.8/4 = 0.4. Speedup is 1/0.4 = 2.5. Four cores do not give you 4. The serial 0.2 of the original time remains, and the parallel part also shrinks to 0.2.",
          "You compute efficiency as speedup divided by n. Here 2.5/4 = 0.625, so the cores are not full. The mechanism that sets s is whatever you left outside the parallel region: a prefix, a copy back to one core, a final reduction done serially. You measure s from a serial timing and a parallel timing. You do not guess it. Cutting s is often worth more than adding a fifth core past the 4 you already have.",
        ],
        {
          kind: "layers",
          caption: "Speedup is 1 over the serial fraction plus the scaled parallel fraction.",
          rows: ["Serial fraction 0.2", "Parallel 0.8 over 4 cores", "Denominator 0.4", "Speedup 2.5"],
        },
        "Serial fraction 0.2, four cores",
        [
          "s is 0.2 and n is 4. The parallel fraction is 0.8, and 0.8/4 = 0.2.",
          "The denominator is 0.2 + 0.2 = 0.4. Speedup is 1/0.4 = 2.5.",
          "Efficiency is 2.5/4 = 0.625. A measured run below 2.5 means the parallel part did not actually shrink by 4, or s was larger than 0.2.",
        ],
        [
          {
            prompt: "The serial fraction is 0.2 and you have 4 cores. What speedup does the formula give, and what is the efficiency?",
            answer: "Speedup is 1 / (0.2 + 0.8/4) = 1 / 0.4 = 2.5. Efficiency is 2.5/4 = 0.625. You do not get 4.",
          },
          {
            prompt: "Where does the serial fraction come from if you did not guess it?",
            answer: "From timing. It is the work you left outside the parallel region, such as a prefix, a copy back to one core, or a serial reduction. You measure it. Adding cores does not shrink that fraction.",
          },
        ],
      ),
      lec(
        "l4",
        "A tree of partials",
        [
          "You reduce with a tree so the span is short. Eight partial sums combine in 3 steps: 4 pairs, then 2, then 1. A serial loop needs 7 additions and has span 7. The tree also uses 7 additions, but the span is 3, so enough cores finish in 3 addition times plus movement. You do not claim fewer additions. You claim a shorter chain of dependent additions.",
          "You build a prefix when every index needs the sum of the values before it, not only the total. A serial scan of 8 elements does 7 additions and produces all 8 outputs. A parallel scan does more additions, on the order of 8 times 3 if each element climbs and descends, and the span stays a small multiple of 3. You use it to hand each worker a starting offset. A reduction alone cannot do that. The prefix can.",
        ],
        {
          kind: "flow",
          caption: "The tree shortens the chain. It does not reduce the number of additions below 7.",
          steps: ["Eight partials", "Pair down in 3 steps", "Span is 3, work is 7", "Prefix if every index needs a sum"],
        },
        "Eight partial sums",
        [
          "You have 8 partial sums. Pairing them takes 4 additions, then 2, then 1. That is 7 additions, the same count as a serial loop.",
          "The longest chain is 3 additions, not 7. With enough cores the span is 3 steps plus the movement of the partials.",
          "If each of the 8 workers also needs its own starting offset, a reduction is not enough. A prefix of those 8 values does the extra work, on the order of 8 times 3 additions, and still has a short span.",
        ],
        [
          {
            prompt: "You reduce 8 partial sums with pairing. How many additions, and what is the span?",
            answer: "7 additions, the same as a serial loop, because 4 + 2 + 1 = 7. The span is 3 steps, not 7. The win is the shorter chain, not fewer additions.",
          },
          {
            prompt: "Each of 8 workers needs the sum of everything before its own chunk. Why is a single reduction not enough?",
            answer: "A reduction produces one total. A prefix produces a sum at every index, which is the starting offset. The parallel prefix does more additions, on the order of 8 times 3, and keeps a short span.",
          },
        ],
      ),
      lec(
        "l5",
        "Blocks or a stride",
        [
          "You cut the data or you cut the tasks. A block gives each of 4 threads a contiguous quarter of 16 elements, so thread 0 owns indexes 0 through 3. A cyclic cut gives thread 0 indexes 0, 4, 8, and 12. If work grows with the index, the last block is heavy and 1 thread falls behind. Cyclic spreads those heavy indexes. You pick the cut from the cost of an element, not from a drawing.",
          "You also cut for communication. A block of a grid keeps neighbors together, so a thread's edge is short. A cyclic cut makes almost every neighbor belong to someone else, and a stencil then talks on every point. For 16 points in a line and 4 threads, a block thread owns 4 consecutive points and talks at most at 2 ends. You accept imbalance only when that edge traffic is the worse problem.",
        ],
        {
          kind: "pair",
          caption: "Block keeps neighbors. Cyclic spreads uneven work. You cannot have both for free.",
          leftTitle: "Block of 16",
          rightTitle: "Cyclic of 16",
          left: ["Thread 0 owns 0 to 3", "Edge is 2 ends", "Last block can be heavy"],
          right: ["Thread 0 owns 0, 4, 8, 12", "Heavy indexes are spread", "Neighbors are remote"],
        },
        "Sixteen elements, four threads",
        [
          "Block: thread 0 gets 0, 1, 2, 3. Thread 3 gets 12, 13, 14, 15. If index 15 is the expensive one, thread 3 is the straggler.",
          "Cyclic: thread 0 gets 0, 4, 8, 12. The expensive high indexes are spread over the 4 threads.",
          "On a line, the block thread touches foreign data at most at 2 ends. The cyclic thread's 4 points each need neighbors it does not own.",
        ],
        [
          {
            prompt: "Sixteen elements and 4 threads. Which indexes does thread 0 own under a block cut, and which under a cyclic cut?",
            answer: "Block: 0 through 3. Cyclic: 0, 4, 8, and 12. If work grows with the index, the block cut leaves the last thread heavy and the cyclic cut spreads it.",
          },
          {
            prompt: "A stencil needs neighbors. Why can a block cut talk less than a cyclic cut on a line of 16?",
            answer: "A block thread owns 4 consecutive points and shares an edge at most at 2 ends. A cyclic thread does not own the neighbors of its 4 points, so almost every point needs a remote value.",
          },
        ],
      ),
      lec(
        "l6",
        "The line, not the address",
        [
          "You separate false sharing from a true race. True sharing is 2 cores writing one address, and it needs a lock or an atomic if both updates must count. False sharing is 2 cores writing different addresses on one 64-byte line. Core 0 writes byte 0. Core 1 writes byte 4. Each store invalidates the other core, though neither reads the other's counter. Coherence did what you asked, at line granularity.",
          "You stop the bounce by separating the lines. Pad each counter to 64 bytes, or give each core a private partial and add the partials once. Four cores writing 4 adjacent counters can move the line on every store. Four cores writing 4 private partials, then adding those 4 numbers, move the line a few times instead of once per increment. The result matches only when the operation allows that combine, as a sum does. You pad or you privatize.",
        ],
        {
          kind: "pair",
          caption: "Different addresses can still share a line. The invalidation does not care that the program does.",
          leftTitle: "True sharing",
          rightTitle: "False sharing",
          left: ["One address", "Both writes must count", "Lock or atomic"],
          right: ["Bytes 0 and 4", "One 64-byte line", "Pad or use 4 partials"],
        },
        "Two counters, four bytes apart",
        [
          "Core 0 increments a counter at byte 0. Core 1 increments a different counter at byte 4. Both sit on one 64-byte line.",
          "Each store invalidates the other core. The programs never read each other's counters. That is false sharing, not a race on one address.",
          "Pad each counter out to 64 bytes, or keep 4 private partials and add them at the end. A sum allows that combine. A linked-list insert would not.",
        ],
        [
          {
            prompt: "Two cores write different counters at byte 0 and byte 4 of the same 64-byte line. Is this a data race on one address?",
            answer: "No. The addresses differ, so it is false sharing. Each store still invalidates the other core because the line is the coherence unit. True sharing would be both cores writing the same address.",
          },
          {
            prompt: "You have 4 cores and 4 counters that are only added. What do you change so the line does not bounce on every increment?",
            answer: "Give each core a private partial and add the 4 partials once, or pad each counter to 64 bytes. Both stop unrelated stores from sharing a line. Privatization is correct here because a sum can be combined.",
          },
        ],
      ),
      lec(
        "l7",
        "A tile that fits",
        [
          "You tile a matrix product so the block stays in cache. For order 8 and a tile of 4, a tile holds 16 numbers. A core loads a 4 by 4 tile of A and of B, forms a partial 4 by 4 of C, and reuses those loads inside the tile. Without a tile, the inner loop runs far enough that early values of A leave the cache before reuse. You changed the reuse, not the formula.",
          "You count tile steps. Order 8 divided by 4 is 2, so each output tile accumulates 2 products. Tiling both dimensions gives 4 output tiles, and 4 cores can take one each. Those cores may share reads of A and B. They must not write the same tile of C. Two writers on one element are a race, not a tiling win. You assign each output tile to 1 core.",
        ],
        {
          kind: "layers",
          caption: "Reuse is inside the tile. The product is the same arithmetic with a better schedule.",
          rows: ["Order 8, tile 4", "16 numbers in a tile", "2 steps along the inner edge", "4 output tiles, 1 core each"],
        },
        "Four output tiles",
        [
          "Order 8 divided by 4 is 2, so there are 2 tile steps along a dimension. Each tile holds 4 times 4 = 16 numbers.",
          "Output tiles: 2 along rows times 2 along columns is 4. Each accumulates 2 products of input tiles.",
          "Four cores can take one output tile each. They may all read A and B. If two cores write the same C tile, those elements race. Assign each of the 4 tiles to one core.",
        ],
        [
          {
            prompt: "Matrices are order 8 and the tile is 4. How many output tiles are there, and how many input-tile products does each accumulate?",
            answer: "4 output tiles, because (8/4) times (8/4) = 4. Each accumulates 8/4 = 2 products along the inner dimension. A tile holds 16 numbers.",
          },
          {
            prompt: "Two cores write the same tile of C. Why is that not a successful parallel tiling?",
            answer: "Those C elements race: two writers, one address, no order. Reads of A and B may be shared. You assign each of the 4 output tiles to 1 core.",
          },
        ],
      ),
      lec(
        "l8",
        "A bound you can defend",
        [
          "You can now take a small parallel program from the machine to a bound. You can say what a store does to a Shared line on 2 cores, and pick threads or a message from whether memory is shared. You can compute speedup 2.5 for serial fraction 0.2 on 4 cores. You can replace a reduction of 8 values by a tree of span 3, pick a block or cyclic cut, and keep 2 counters off one 64-byte line.",
          "You can also refuse a speedup the formula will not give. Four cores and a serial fraction of 0.2 cannot yield a speedup of 4. Tiling matrices of order 8 with tiles of 4 raises cache reuse and does not shrink that fraction. False sharing can push a measured speedup below 2.5 by adding coherence traffic the formula left out. You write the bound, name the traffic, and only then time the run.",
        ],
        {
          kind: "flow",
          caption: "Write the bound first. Traffic the formula ignored can only make the measurement worse.",
          steps: ["Compute speedup 2.5", "Remove false sharing", "Tile for reuse", "Then time the run"],
        },
        "The bound and the bounce",
        [
          "Serial fraction 0.2 and 4 cores give speedup 2.5 only if the parallel part really scales and adds no extra serial traffic.",
          "Two cores then write different counters on one 64-byte line inside that parallel part. Each store invalidates the other core.",
          "The measured speedup can sit below 2.5. Padding each counter to 64 bytes, or using private partials, removes that traffic. Tiling an order-8 product does not change the 0.2 by itself.",
        ],
        [
          {
            prompt: "The serial fraction is 0.2 on 4 cores, so the formula gives 2.5 if the parallel part scales. Two cores then write different counters on one 64-byte line inside that parallel part. Does the formula still promise 2.5, and what does a store do?",
            answer: "No. The 2.5 assumes the parallel fraction scales and does not add coherence traffic. Each store to a shared line invalidates the other core, so the line bounces. Measured speedup can fall below 2.5. Pad to 64 bytes or use private partials.",
          },
          {
            prompt: "You tile order-8 matrices with tiles of 4 and you also owe a prefix so 8 workers can find their starting offsets. How many output tiles are there, and why does a reduction not hand out those offsets?",
            answer: "There are 4 output tiles, from (8/4) times (8/4). A reduction yields one total, not a sum at each index. A prefix of the 8 chunk sizes produces the offsets. Tiling and the prefix solve different problems, and neither erases a serial fraction of 0.2.",
          },
        ],
      ),
    ],
  },
];







