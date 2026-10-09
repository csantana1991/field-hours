import type { CoursePack } from "./types";

function lec(
  id: string,
  title: string,
  paragraphs: string[],
  figure: CoursePack["lectures"][number]["figure"],
  exampleTitle: string,
  steps: string[],
  problems: { prompt: string; answer: string }[],
): CoursePack["lectures"][number] {
  return { id, title, minutes: 50, paragraphs, figure, example: { title: exampleTitle, steps }, problems };
}

/** The five foundation packs that were not in the first file. Six lectures each. */
export const prereqMore: CoursePack[] = [
  {
    slug: "csce-420",
    lectures: [
      lec(
        "l1",
        "An agent and a search",
        [
          "An agent takes a percept and returns an action. A problem, for search, is a state, a set of actions, a step cost, and a goal test. The solution is a sequence of actions, not a single clever number. Uninformed search tries actions without a hint about which one is closer to the goal.",
          "Breadth-first search expands the shallowest open state. On a tree with a uniform step cost it finds the fewest actions. It also stores every state on the frontier. Depth-first stores a path, not a layer, and can miss a short solution if it dives. Name the cost you care about before you pick the search.",
        ],
        { kind: "flow", caption: "Breadth-first, one layer.", steps: ["Expand the start", "Enqueue its children", "The first time you reach the goal, the path is shortest in hops"] },
        "A corridor of rooms",
        [
          "Rooms 1-2-3-4 in a line, and a side door from 2 to the goal. Start at 1. Each move costs 1.",
          "Breadth-first reaches the goal through 2. The path has two moves. Depth-first might walk 1-2-3-4 before it backs up, if it tries the corridor first.",
          "The goal test runs when you take a state off the frontier to expand it, not when you first enqueue it, if you want the shortest path. Checking at enqueue is a shortcut that is safe only for uniform cost.",
        ],
        [
          { prompt: "The step costs are not equal. Is breadth-first still the fewest-cost path?", answer: "No. Breadth-first counts actions, not cost. Use a search that expands the lowest path cost so far. A cheap long path can beat an expensive short one." },
          { prompt: "Why does CSCE 633 accept this course or CSCE 625?", answer: "Both teach search and a first probabilistic model. If 625 is already one of your ten master's courses, you can skip 420. Do not skip both and open machine learning cold." },
        ],
      ),
      lec(
        "l2",
        "A heuristic",
        [
          "A heuristic estimates the remaining cost from a state to the goal. It is not the true remaining cost. A* expands the state with the smallest path-so-far plus estimate. If the estimate never exceeds the true remaining cost, the first time A* expands the goal the path is optimal. That property is called admissible.",
          "An estimate that sometimes overshoots can return a path that is not cheapest. An estimate of zero is admissible and useless: A* becomes uniform-cost search. A good heuristic is admissible and large. Larger means fewer expansions, as long as you did not lie upward.",
        ],
        { kind: "pair", caption: "Two estimates of the same drive.", leftTitle: "Admissible", rightTitle: "Not admissible", left: ["Straight-line miles, which a road cannot beat", "A* may trust it"], right: ["A guess larger than the real road", "A* may skip the true best path"] },
        "Three towns",
        [
          "You have driven 10 miles to town B. The straight line from B to the goal is 6. The score is 16.",
          "The other open town, C, cost 4 miles to reach and the straight line is 14. The score is 18. Expand B first.",
          "If someone had claimed the line from B was 20, and the real road was 6, the algorithm might expand C and stop on a worse path. The lie was the overestimate.",
        ],
        [
          { prompt: "Your heuristic is twice the straight-line distance. Is A* still optimal?", answer: "Not in general. Twice a true lower bound can exceed the true remaining cost. Optimality needs the estimate to be at most the truth." },
          { prompt: "The heuristic is perfect: it equals the true remaining cost. How many states does A* expand, beyond the solution path?", answer: "Essentially none. Every detour has a higher score than the true path. A perfect heuristic is rare. It is the upper end of what admissible means, not a typical map." },
        ],
      ),
      lec(
        "l3",
        "Games",
        [
          "A two-player game of perfect information is a tree. You move, then the opponent, then you. Minimax scores a leaf and assumes the opponent minimizes your score while you maximize it. The value of a position is the best you can force, not the best leaf that exists if the opponent plays badly.",
          "The whole tree is too large. Alpha-beta prunes a branch once it cannot change the decision already available. The answer stays the same as minimax if both sides play the same evaluation. The order of moves matters for speed, not for the value, when the evaluation is exact.",
        ],
        { kind: "layers", caption: "One ply, then the reply.", rows: ["Your three moves", "The opponent's replies under each", "You keep the max of the mins"] },
        "Two moves, two replies",
        [
          "Move A has replies worth 3 and 1. The opponent picks 1.",
          "Move B has replies worth 2 and 4. The opponent picks 2.",
          "You pick B, value 2. The leaf worth 4 is not available, because the opponent will not hand it to you. A program that returns 4 is assuming a friendly opponent.",
        ],
        [
          { prompt: "You stop the search at a fixed depth and score the position with a guess. What did you give up?", answer: "The exact value of the game. The score is only as good as the guess and the depth. A horizon just before a loss can look fine. That is why the evaluation and the depth are part of the claim, not an implementation detail." },
          { prompt: "Alpha-beta cuts a branch. Can the chosen move differ from minimax?", answer: "No, if the leaf scores are the same and both algorithms finish. The cut only skips a branch that cannot beat the best alternative already known. A bug in the bounds can change the move. The idea does not." },
        ],
      ),
      lec(
        "l4",
        "Constraints",
        [
          "A constraint problem is variables, domains, and constraints that rule out some combinations. The solution assigns every variable a value that satisfies every constraint. Backtracking tries a value and retreats when a constraint is already broken. Forward checking, after an assignment, deletes values in other domains that the new assignment forbids.",
          "The order of variables changes the size of the tree. A variable with two legal values left is a smaller branch than a variable with twenty. Pick the tight one first. This is a heuristic, not a proof that the problem is easy.",
        ],
        { kind: "flow", caption: "One assignment.", steps: ["Pick an unassigned variable", "Try a value still in its domain", "Delete values that now conflict", "Backtrack if a domain goes empty"] },
        "Three colors, three regions",
        [
          "Regions X, Y, Z. Colors red, green, blue. X touches Y. Y touches Z. X does not touch Z.",
          "Set X to red. Forward checking removes red from Y. Z still has all three colors.",
          "Set Y to green. Z may still be red, because X and Z do not touch. Blue and green remain too, except green was taken by Y if they touch. Z ends with red and blue. Two solutions from here, not a failure.",
        ],
        [
          { prompt: "A domain becomes empty. What do you do, and what do you not conclude about the whole problem?", answer: "Undo the latest assignment and try another value. An empty domain kills that branch, not the problem. Another color earlier might have worked." },
          { prompt: "Why is 'the map has a solution' not the same as 'my search found one'?", answer: "The search might have stopped early, or a constraint might be coded wrong. A found assignment you can check against every constraint is evidence. A failed search is evidence only if the search was complete." },
        ],
      ),
      lec(
        "l5",
        "One probabilistic model",
        [
          "A probability is a number between 0 and 1 for a proposition you are not treating as certain. The useful step is conditioning: the chance of A given B is the chance of both, divided by the chance of B, when B is possible. Bayes' rule swaps the condition when the swapped one is the quantity you can estimate.",
          "A Bayes net is a picture of which variables depend on which. An arrow is a claim of direct dependence, not a decoration. If the picture says a symptom depends on a disease and not on an unrelated test, you do not invent an edge because the numbers moved once. CSCE 633 will fit models like this. Here you only compute one update by hand.",
        ],
        { kind: "pipeline", caption: "A single update.", stages: ["Prior on the cause", "How likely the observation is if the cause is true", "How likely the observation is if it is false", "Posterior"] },
        "A rare fault and a test",
        [
          "One machine in a hundred has the fault. The test catches the fault 90 times out of 100, and it false-alarms 5 times out of 100 on a healthy machine.",
          "Out of 10,000 machines, about 100 are faulty and 90 of those alarm. About 9,900 are healthy and about 495 of those alarm.",
          "An alarm is therefore 90 true out of 585 alarms, about 15 percent. The test is accurate and the fault is still uncommon among the alarms. Ignore the base rate and you will quote 90 percent, which is the wrong question.",
        ],
        [
          { prompt: "The test is positive. Which number is not the answer: the true-positive rate, or the chance of the fault given the alarm?", answer: "The true-positive rate is 90 percent. The chance of the fault given the alarm is about 15 percent in this story. They are different conditional probabilities. Bayes' rule is the swap." },
          { prompt: "You add an arrow from the weather to the fault because one rainy day had more faults. What is wrong with that as a model?", answer: "One day is not a dependence you have earned. An arrow is a claim you will use for every later inference. Add it when the mechanism or the data supports it, and then the joint distribution changes. A story is not an edge." },
        ],
      ),
      lec(
        "l6",
        "What learning will assume",
        [
          "You can now separate a search from a heuristic, a game value from a friendly leaf, a constraint failure from an empty search, and a true-positive rate from a posterior. CSCE 633 starts at fitting a predictor, not at the definition of a state.",
          "If CSCE 625 is on your master's plan, that course covers this ground at graduate depth and the catalog lets it stand in for 420. Taking both 420 and 625 is allowed as study. Only 625 sits inside the 36 credits.",
        ],
        { kind: "layers", caption: "Four sentences to keep.", rows: ["A solution is a path with a cost", "An admissible heuristic does not overestimate", "The opponent will not choose your favorite leaf", "An alarm is not the base rate"] },
        "A question you should answer cold",
        [
          "A test is 99 percent accurate and the condition is rare. Why might most alarms be false?",
          "Because the healthy population is large. A small false-alarm rate times a large population can exceed the true alarms.",
          "If that sentence is not immediate, redo the numerical update before CSCE 633.",
        ],
        [
          { prompt: "Name the catalog line that lets you skip this course.", answer: "CSCE 633 requires CSCE 420 or CSCE 625. Skipping 420 is legitimate when 625 is one of the ten. Skipping both is not." },
          { prompt: "A* with an admissible heuristic expands the goal. What may you claim?", answer: "The path cost is optimal. You may not claim it expanded the fewest nodes among all possible heuristics. You may not claim the heuristic was perfect." },
        ],
      ),
    ],
  },
  {
    slug: "csce-431",
    lectures: [
      lec(
        "l1",
        "A requirement a test can fail",
        [
          "A requirement says what the system must do in a sentence a stranger can check. 'Fast' is not a requirement. 'The report for one clinic day finishes in under three seconds on the stated machine' can fail a test. The test is the requirement made executable.",
          "Write the failure before the code. If you cannot say what the wrong output looks like, you do not yet know what you are building. CSCE 606 will argue about process. This course is the sentence and the test.",
        ],
        { kind: "pair", caption: "Two ways to ask for the same feature.", leftTitle: "Not yet a requirement", rightTitle: "A requirement", left: ["The search should feel smart", "Users will love it"], right: ["A misspelled last name still finds the patient", "The test plants the typo"] },
        "One clinic rule",
        [
          "The desk asks: find a patient by last name, and a single wrong letter should still show that patient in the first ten rows.",
          "The test inserts 'Nguyen' and queries 'Nguyan'. The assertion is that the row appears in the top ten.",
          "A search that only does exact match fails this test today. That failure is the start of the work, not a surprise at the demo.",
        ],
        [
          { prompt: "Rewrite 'the app must be secure' into something a test can fail.", answer: "Pick one threat. Example: a request with another patient's id returns no row for a user who is not on that patient's care team. The test sends that request and expects a refusal. 'Secure' names no request and no refusal." },
          { prompt: "Why does CSCE 606 list this course?", answer: "606 assumes you can already write a checkable requirement and a test. It spends its weeks on process, review, and change. It should not be the first time you replace an adjective with a number." },
        ],
      ),
      lec(
        "l2",
        "A build you can repeat",
        [
          "A build turns the source into the thing you run, with one command, on a machine that is not yours. If the steps live in someone's memory, the project does not build. Pin the tools. Record the command. A new checkout that fails is a bug in the project, not in the newcomer.",
          "Version control stores the history of that source. A commit is a snapshot with a reason. The main line should build. A branch is where it is allowed not to, and it comes back only when the tests you wrote in the previous lecture pass.",
        ],
        { kind: "pipeline", caption: "From a clean checkout.", stages: ["Clone", "One setup command", "One test command", "The same result on a second machine"] },
        "A laptop that is not the author's",
        [
          "The author has a library installed globally. The checkout on a lab machine does not.",
          "The setup command installs the declared dependencies. The test command does not rely on the global library.",
          "If the lab machine still fails, the declaration is incomplete. Add the missing piece to the project, not to a private note.",
        ],
        [
          { prompt: "The tests pass on your laptop and fail in the clean checkout. Where is the defect?", answer: "In the project: an undeclared dependency, a local file that was never committed, or a path that only exists on your machine. 'Works for me' is the report of that defect." },
          { prompt: "Why is a commit message that says 'fix' not enough?", answer: "The history is how the next person, often you, learns why the line changed. Name the requirement that failed. The diff shows what. The message should say why." },
        ],
      ),
      lec(
        "l3",
        "Tests at the boundary",
        [
          "A unit test calls one piece with an input you chose and checks the output. It does not start the whole system. An integration test crosses a boundary: the database, the file, the other module. You need both. A pile of unit tests that never touch the boundary will pass while the boundary is wrong.",
          "A regression test is a unit or integration test that used to fail. Keep it. Deleting it because the bug 'cannot happen again' is how it happens again. The test is the memory.",
        ],
        { kind: "layers", caption: "What each test is allowed to touch.", rows: ["Unit: one function, inputs you invent", "Integration: a real boundary, a fixture you control", "A manual click is neither, until you write it down"] },
        "The typo search, two levels",
        [
          "Unit: the distance function returns 1 for Nguyen against Nguyen with one letter changed. No database.",
          "Integration: the query against a fixture table returns that patient in the top ten.",
          "A click in the browser is a third check. It is not a substitute for the first two, because a click is slow and easy to skip.",
        ],
        [
          { prompt: "All unit tests pass and the clinic still gets no rows. What kind of test was missing?", answer: "A test across the boundary that actually failed: the query, the connection, or the column name. The unit tests never saw it. Add the integration test that would have gone red." },
          { prompt: "You fixed a bug and deleted the test that caught it, to keep the suite small. What did you lose?", answer: "The proof that the bug stays fixed. The next edit can reintroduce it silently. Keep the test. Shrink the production code if the suite is slow, not the assertion." },
        ],
      ),
      lec(
        "l4",
        "A module boundary",
        [
          "A module hides a decision. The rest of the program depends on the behavior you promised, not on the data layout inside. If every file reaches into every other file's tables, a change to a column is a change to the program.",
          "The boundary is a small set of functions. Inputs, outputs, and the errors. What it does not promise is part of the design. CSCE 606 will talk about responsibility. Here, draw the box before you add a second feature.",
        ],
        { kind: "pair", caption: "Who knows the table shape.", leftTitle: "No boundary", rightTitle: "A boundary", left: ["The page reads the columns itself", "A renamed column breaks the page"], right: ["The page asks for a patient", "The table can change behind the function"] },
        "Finding a patient",
        [
          "The page calls find_patients(last_name). It does not know the column is called surname.",
          "The module runs the query and returns records with the fields the page was promised.",
          "Renaming the column edits the module and its tests. The page stays. If the page imported the column name, the rename is a hunt.",
        ],
        [
          { prompt: "A function both draws the button and updates the database. What is the practical failure?", answer: "You cannot test the update without the drawing, and you cannot change the drawing without risking the update. Split them. The drawing calls the update. Each has its own tests." },
          { prompt: "Is a smaller file always a better module?", answer: "No. A module is a hidden decision, not a line count. Ten tiny files that all know the same table are one module pretending to be ten." },
        ],
      ),
      lec(
        "l5",
        "Review",
        [
          "A review is another person reading the change against the requirement, before it lands on the main line. The author does not review alone. The questions are concrete: which test covers this, what happens on the empty input, what did you refuse to change.",
          "Comments on taste are optional. Comments on a missing test are not. If the review always says 'looks good' in under a minute, it is a signature, not a review. CSCE 606 will measure this. Practice it once on a small change.",
        ],
        { kind: "flow", caption: "A change that lands.", steps: ["The requirement and the failing test exist", "The patch makes the test pass", "Someone else reads both", "Then it merges"] },
        "The typo patch",
        [
          "The reviewer asks for the test that plants Nguyen and queries Nguyen with one letter wrong.",
          "The author has the test. The reviewer runs it, or reads it and the assertion.",
          "The reviewer also asks what a one-letter first name does. If the author has no answer, that is a second requirement, not a reason to block forever, but it is written down.",
        ],
        [
          { prompt: "The author says the change is too small to review. When is that wrong?", answer: "When the change can break a requirement, which is almost every change that touches behavior. A typo in a comment can skip the review. A change to a query cannot. The size in lines is the wrong measure." },
          { prompt: "What should a review comment cite?", answer: "A requirement, a test, or a failure mode. 'I would have written it differently' is not a defect unless you can say what the different version does that this one does not." },
        ],
      ),
      lec(
        "l6",
        "Change",
        [
          "A change request arrives after the first version works. You do not silently absorb it into the same requirement. Write the new sentence, say what it costs, and decide. A log of decisions is the difference between a project and a folder of files.",
          "CSCE 606 assumes this habit and adds maintenance, release, and the arguments teams actually have. Come in able to point at one requirement, one test, and one review.",
        ],
        { kind: "layers", caption: "A decision, written.", rows: ["The new sentence", "What it breaks or costs", "Accepted or refused, and why"] },
        "Add date of birth to the search",
        [
          "The new sentence: a query may include a date of birth, and a wrong date must not hide a correct name match. It ranks lower. It does not disappear.",
          "Cost: the index and the unit test grow. The old name-only test must still pass.",
          "You accept it and add the test before the code. If you refuse it, the refusal is a sentence in the log, not a forgotten chat message.",
        ],
        [
          { prompt: "A stakeholder asks for a change in the hallway and you implement it the same hour. What is missing?", answer: "The sentence, the test, and the decision. The hallway request will be remembered differently by the two people who heard it. Write it down, even if you then build it immediately." },
          { prompt: "Which three artifacts should you be able to show before CSCE 606?", answer: "A requirement a test can fail, the test, and a review or a decision log for one change. The graduate course will not spend its first weeks inventing those." },
        ],
      ),
    ],
  },
  {
    slug: "csce-436",
    lectures: [
      lec(
        "l1",
        "A task, not a screen",
        [
          "Start from a task a specific person does, in their words. 'Look up today's patient before they reach the desk' is a task. 'A modern dashboard' is a mood. The person, the place, and the success condition come before any drawing.",
          "Write five tasks. If you cannot, you are designing for yourself. CSCE 655 will run a study. This course is the first time you watch the task instead of the widget.",
        ],
        { kind: "pair", caption: "Two descriptions of one morning.", leftTitle: "A screen", rightTitle: "A task", left: ["Cards, a chart, a search box", "No person, no deadline"], right: ["The clerk, 30 seconds, the right chart", "Success is the chart in hand"] },
        "The front desk",
        [
          "Person: the clerk, standing, one hand free.",
          "Task: identify the patient who just walked in, from a spoken last name, before the line grows.",
          "Success: the correct row is visible without a second question. Failure: the clerk asks the patient to spell it while the line waits.",
        ],
        [
          { prompt: "You shipped a dashboard the clerk never opens. Did you finish the task?", answer: "No. The task was identifying the patient at the desk. A screen nobody uses during that task did not change the morning. Go watch the task before you add another chart." },
          { prompt: "Why is this course, or CSCE 444, named before CSCE 655?", answer: "655 assumes you have already named a user and a task and watched someone struggle. The catalog accepts 436 or 444 for that preparation. This site teaches it as 436. Take one." },
        ],
      ),
      lec(
        "l2",
        "A prototype you can throw away",
        [
          "The first artifact should be cheap to discard. Paper, or a few static screens, is enough to walk a task. A working database at this stage makes you defend the wrong decisions, because they were expensive.",
          "Walk the five tasks on the paper. Where the person hesitates, the prototype is wrong or the task is wrong. Change the paper. Do not explain the hesitation away.",
        ],
        { kind: "flow", caption: "One pass.", steps: ["Five tasks", "A paper screen for each step", "One person walks them", "Change the paper, not the speech"] },
        "The spoken name",
        [
          "The paper shows a single field and a list.",
          "The clerk says the name and the walker types it wrong on purpose. The list is empty.",
          "The next paper shows close matches without a second click. That change took a pencil. The same change in a finished app would have been a negotiation.",
        ],
        [
          { prompt: "The prototype looks unfinished and the stakeholder is embarrassed. What do you protect?", answer: "The right to throw it away. A polished look at this stage hides the hesitations. Invite the criticism while the artifact is still paper." },
          { prompt: "When is a paper prototype the wrong tool?", answer: "When the question is about timing, animation, or a hardware constraint the paper cannot fake. Then build the smallest running slice of that one question, not the whole product." },
        ],
      ),
      lec(
        "l3",
        "A session",
        [
          "A session is one person, who did not build the thing, doing the tasks while you stay quiet. You record what they did, not what they said they would do. Five people will show you the broken task. They will not give you a percentage you can publish. Say the sample size.",
          "Ask them to think aloud if they can. Do not help on the first failure. Helping teaches you nothing about the next clerk who will not have you standing there. Note the time and the exact miss.",
        ],
        { kind: "pipeline", caption: "A small session.", stages: ["Read the task aloud", "Stay quiet", "Write the miss", "Thank them", "Change one thing"] },
        "Three clerks",
        [
          "Task: find Nguyen from a spoken name, thirty seconds.",
          "Two of the three type the name and freeze on an empty list. One tries a first name and also fails.",
          "You do not average this into a satisfaction score. You write: empty exact-match results stranded two people. The next build must show near matches.",
        ],
        [
          { prompt: "You explained the icon and then the person succeeded. What can you claim?", answer: "That they can do it after your explanation. You cannot claim the icon works. The explanation will not ship. Run the task again without helping, on the changed design." },
          { prompt: "Is three people a study you can generalize to every clinic?", answer: "No. It is enough to see a repeated miss. CSCE 655 will talk about what a small sample can and cannot support. Do not invent a percentage from three." },
        ],
      ),
      lec(
        "l4",
        "Access",
        [
          "A person who does not use a pointer still has the task. Keyboard order, labels that a screen reader can speak, and contrast you can check are part of the task, not a later coat of paint. If the only path is a drag, you excluded someone.",
          "Try the task with the keyboard alone. Every action the mouse can do needs a key path, or an honest reason the task is spatial. 'We will add access later' means the later release is the first one that includes those people.",
        ],
        { kind: "layers", caption: "One task, more than one body.", rows: ["Pointer", "Keyboard only", "Text that can be read aloud", "Contrast you measured, not a feeling"] },
        "The list of patients",
        [
          "Tab moves through the search, then the rows, in the order a clerk scans them.",
          "Enter opens the row that has focus. There is no mouse-only control.",
          "The selected row is not indicated by color alone. A marker or a weight change survives a grayscale printout and a common color blindness.",
        ],
        [
          { prompt: "The designer says color-blind users are an edge case. What is the concrete test you still run?", answer: "Complete the task with color removed, or with a simulation of a common deficiency. If the selected row disappears, the design depends on color. Add a second cue. The size of the population is not the test." },
          { prompt: "A drag-and-drop queue has no keyboard path. Is the task done?", answer: "Not for someone who does not drag. Add a move action on the focused row, or do not claim the queue is usable. The mouse path can stay." },
        ],
      ),
      lec(
        "l5",
        "One change",
        [
          "After the session, change one thing that the misses justify. Do not redesign the product. A second session on the new paper tells you whether that one change helped. Two changes at once and you will not know which one mattered.",
          "Write what you refused to change, and why. A request that fights the task belongs in that list. CSCE 655's capstone weeks assume you have done this loop once.",
        ],
        { kind: "flow", caption: "The loop.", steps: ["Misses from the session", "One change", "The same tasks again", "What you refused"] },
        "Near matches",
        [
          "The change: an empty exact search shows the closest names instead of a blank page.",
          "The same three tasks, or three new people if you can get them. You watch whether the freeze is gone.",
          "You refuse a request to add a stock photo of a clinic. It does not touch the miss. The refusal is one sentence.",
        ],
        [
          { prompt: "You changed the colors, the layout, and the search in one night. The second session went better. What do you know?", answer: "That the bundle went better. You do not know which change did it. Next time change one. If you must ship the bundle, say so, and do not claim you measured the search." },
          { prompt: "A stakeholder wants the photo. The session did not mention it. Where does it go?", answer: "On the list of things you refused, with the reason: no miss in the session supports it. If they insist, it is a new requirement, not a usability finding." },
        ],
      ),
      lec(
        "l6",
        "What the graduate studio assumes",
        [
          "You can name a person and a task, walk a cheap prototype, sit through a quiet session, reach the task without a pointer, and change one thing because of a miss. CSCE 655 will add study design, consent, and a longer argument about what a small sample means.",
          "The catalog also accepts CSCE 444 in this slot. You do not need both. You do need one of them before you treat 655 as a first course in watching users.",
        ],
        { kind: "layers", caption: "Bring these.", rows: ["Five tasks in the user's words", "A prototype you were willing to scrap", "Notes from a session with no helping", "One change and one refusal"] },
        "A question you should answer cold",
        [
          "The person succeeded after you pointed at the button. What claim is illegal?",
          "That the button was findable. Your hand was part of the interface.",
          "If that distinction is fuzzy, run one more session before the graduate course.",
        ],
        [
          { prompt: "What will you not claim from five people?", answer: "A percentage that generalizes to every user. You can claim the misses you saw, and that a repeated miss is worth a change. The graduate course tightens that language." },
          { prompt: "Which course on this site stands in for the catalog's CSCE 436 or CSCE 444 line?", answer: "CSCE 436. Take it before CSCE 655 if you have not already done an equivalent studio. It is outside the 36 credits." },
        ],
      ),
    ],
  },
  {
    slug: "csce-463",
    lectures: [
      lec(
        "l1",
        "Delay",
        [
          "A packet does not arrive instantly. The delay is processing at the nodes, plus transmission onto the link, plus propagation down the link, plus time spent waiting in queues. You can compute the first three from the size, the rate, and the distance. The queue is the one that depends on other people's traffic.",
          "Transmission delay is the size divided by the bandwidth. Propagation is the distance divided by the speed in the medium. A large file on a fast long link is often transmission. A small packet on a slow long link can be propagation. Say which term you mean.",
        ],
        { kind: "pipeline", caption: "Four contributions.", stages: ["Process", "Transmit: size / rate", "Propagate: distance / speed", "Queue"] },
        "One packet, one link",
        [
          "A 1,000 byte packet. The link is 1 megabit per second. Transmission is 8,000 bits over 1,000,000 bits per second, which is 8 milliseconds.",
          "The link is 300 kilometers of fiber, about 1 millisecond of propagation at a typical fiber speed. Use the number you were given in the problem. Do not mix it with the 8.",
          "If the queue is empty and processing is negligible, the delay is about 9 milliseconds. A busy queue can dwarf both.",
        ],
        [
          { prompt: "You doubled the bandwidth and the small control packet is still slow. Which term did you not buy down?", answer: "Propagation, and possibly processing. Bandwidth shrinks transmission delay. A 40 byte packet was already a tiny transmission. The distance did not change." },
          { prompt: "Why is this course outside the 36 credits if CSCE 612 is on the plan?", answer: "The catalog counts only one of CSCE 463 and CSCE 612 toward a degree. Here 463 is the preparation and 612 is the master's course. Do not list both inside the ten." },
        ],
      ),
      lec(
        "l2",
        "A link",
        [
          "A link can corrupt bits. A checksum detects some corruption. It does not correct it, and a weak checksum misses some errors. An acknowledgement says the packet arrived intact. A timeout says you stopped waiting. Retransmission sends again. Together those three are a reliable link, in outline.",
          "Stop-and-wait sends one packet and waits. The link sits idle during the wait. A window of several packets fills the pipe. The window is not free: the sender must remember what is unacknowledged. CSCE 612 will derive the window from the delay and the rate. Here, see why one-at-a-time is slow.",
        ],
        { kind: "flow", caption: "Stop-and-wait.", steps: ["Send one packet", "Wait for the acknowledgement", "The pipe is idle during the wait", "A timeout sends it again"] },
        "A long fat link",
        [
          "Transmission of one packet is 1 millisecond. The round trip is 100 milliseconds.",
          "Stop-and-wait spends about 1 millisecond sending and 100 waiting, per packet. The useful fraction is about 1 percent.",
          "A window of about 100 packets would keep the sender busy. You have not built that protocol. You have seen the arithmetic that demands it.",
        ],
        [
          { prompt: "The checksum passes and the packet is still wrong. Is that possible?", answer: "Yes. A checksum is a finite check. Some different bit patterns share a checksum. A stronger check lowers that chance and does not make it zero. Do not treat a pass as proof of perfection." },
          { prompt: "A timeout fires and the packet had arrived. What does the receiver see if you retransmit naively?", answer: "A duplicate. The receiver needs a sequence number, or an equivalent, to drop the second copy. Reliability without identity creates repeats. The graduate course will not let you forget that." },
        ],
      ),
      lec(
        "l3",
        "Forwarding",
        [
          "Forwarding is what a router does with one packet: look up the destination in a table and send the packet out one link. The table is not the whole map of the internet. It is a set of prefixes. The longest matching prefix wins.",
          "Routing is how the table gets built. Do not use the two words as synonyms. A bug in forwarding drops this packet. A bug in routing fills the tables wrong for everyone who trusts them.",
        ],
        { kind: "pair", caption: "Two jobs.", leftTitle: "Forwarding", rightTitle: "Routing", left: ["One packet, one table lookup", "Happens at line rate"], right: ["Messages between routers", "Builds the table over time"] },
        "Longest prefix",
        [
          "The table has 10.0.0.0/8 out of link A, and 10.1.0.0/16 out of link B.",
          "A packet for 10.1.2.3 matches both. The longer prefix, /16, wins. The packet goes to B.",
          "A packet for 10.2.2.3 matches only /8. It goes to A. If you had stopped at the first match, you might have sent 10.1.2.3 to A and missed the more specific route.",
        ],
        [
          { prompt: "Two prefixes match and you pick the shorter one. What goes wrong?", answer: "Traffic that had a more specific route takes the general one. That can be a black hole, a detour, or a leak into the wrong network. Longest match is the rule. First match is an accident of table order." },
          { prompt: "The packet took the right link and the application still failed. Is that a forwarding bug?", answer: "Not by itself. Forwarding delivered the packet to the next hop. The failure may be later: the port, the loss, the server. Check the hop you meant before you blame the route." },
        ],
      ),
      lec(
        "l4",
        "Routing in outline",
        [
          "Distance-vector: each router tells its neighbors the destinations it can reach and the cost. A neighbor adds the link cost and keeps the smallest. The simple version counts to infinity when a link dies, because a neighbor's old advertisement loops back. Split horizon and a poison reverse are patches. They are not a proof that loops are impossible.",
          "Link-state: each router floods the state of its own links. Everyone computes the same shortest paths from that map. The flood must converge on one map. A partial map is a wrong map. CSCE 612 compares these carefully. You need the failure mode of the first one.",
        ],
        { kind: "flow", caption: "A dead link, distance-vector.", steps: ["The route used to point at the neighbor", "The neighbor still advertises a route that points back", "The cost climbs instead of dying", "That climb is count-to-infinity"] },
        "Two routers",
        [
          "A reaches Z through B, cost 1 plus B's cost. B's link to Z dies.",
          "Before B has a chance to say so honestly, B hears A's advertisement: A can reach Z. B now points at A. A still points at B.",
          "Each round adds the link cost. The route should have been deleted. The advertisements formed a loop. You will compute one round of this by hand in the problems.",
        ],
        [
          { prompt: "Link-state floods every link to every router. What do you gain, and what do you spend?", answer: "Each router can run a shortest-path computation on a full map, so it does not trust a neighbor's summary. You spend flood traffic and you must deal with a map that is temporarily inconsistent. The protocol is not free." },
          { prompt: "Is count-to-infinity a forwarding bug?", answer: "No. Forwarding obeyed the table. The table was built by a routing exchange that looped. Fix the routing rule or the timers. Do not 'fix' it by dropping a random prefix." },
        ],
      ),
      lec(
        "l5",
        "A reliable byte stream",
        [
          "An application often wants a stream of bytes, in order, without gaps or duplicates. The network underneath is packets that can be lost, reordered, or repeated. The transport above fills that gap with sequence numbers, acknowledgements, retransmission, and a window.",
          "A connection is state at both ends about that stream. A handshake agrees to create the state. A finish agrees to release it. Skipping the handshake and hoping is how two sides disagree about whether the conversation exists. You are not implementing the full protocol. You are naming the state.",
        ],
        { kind: "pipeline", caption: "What the stream hides.", stages: ["Bytes from the application", "Segments with sequence numbers", "Acks and retransmission", "Bytes, in order, at the other end"] },
        "A lost segment",
        [
          "You sent bytes 1 through 100, then 101 through 200. The second segment is lost.",
          "The receiver has 1 through 100. It does not hand the application a hole. It acknowledges 100 and waits.",
          "The sender's timeout retransmits 101 through 200. The receiver then delivers both ranges, in order. The application never saw the loss.",
        ],
        [
          { prompt: "The receiver got segment 200 before segment 100, and it delivered 200 to the application immediately. What broke?", answer: "The in-order promise. Hold 200 until 100 arrives, or the application must be written for datagrams, not a stream. Those are different interfaces. Do not mix them silently." },
          { prompt: "Both sides think the connection is open, and one has rebooted and forgotten. What was the handshake for?", answer: "To create state both sides remember. After a reboot the state is gone. Packets from the old conversation must not be accepted as part of a new one. Identifiers and the handshake are how you tell the two apart. The graduate course spends a week on this." },
        ],
      ),
      lec(
        "l6",
        "Names and a request",
        [
          "People use names. Routers use addresses. A name system answers a name with an address. The answer can be cached, and a cache can be stale. A failed lookup is not the same as a refused connection.",
          "A request on top of the byte stream names a resource and a method. The response is a code and a body. You can now read a packet capture at the level of delay, a prefix, a retransmission, and a request. CSCE 612 starts from that reading and asks you to design, not only to define.",
        ],
        { kind: "layers", caption: "One web fetch, bottom to top.", rows: ["Addresses and prefixes", "A byte stream", "A name that became an address", "A request and a response code"] },
        "A page that fails",
        [
          "The name lookup fails. You never open a connection. The bug is not a timeout of the stream.",
          "The lookup succeeds and the connection times out. The address was wrong, the packet was filtered, or the server is down. The name system did its job.",
          "The connection succeeds and the response code is 404. The stream worked. The resource name did not. Three different failures. Write down which layer you blame before you change a setting.",
        ],
        [
          { prompt: "A cached name points at yesterday's address. The host moved. What does the user see, and what expired?", answer: "A connection to the old address, which may refuse or be someone else. The cache lifetime expired in the world and not in the cache. Shorten the lifetime or flush it. Do not retransmit the old address harder." },
          { prompt: "What should you be able to compute before CSCE 612?", answer: "A transmission delay, a longest-prefix choice, and one round of a routing loop. The master's course will not rederive what a prefix is." },
        ],
      ),
    ],
  },
  {
    slug: "csce-465",
    lectures: [
      lec(
        "l1",
        "A threat, named",
        [
          "A threat is an actor, a capability, and an asset. 'Hackers' is not a threat model. 'Someone who can send packets to the clinic server, and wants another patient's record' is one. Write three. If the model is empty, every later control is a guess.",
          "You will not stop every actor. Say which one this course's mechanisms address. CSCE 701 builds on a model like this. It will not spend its first week forcing you to name the actor.",
        ],
        { kind: "layers", caption: "One threat, three lines.", rows: ["Who: a person on the public network", "Can: send requests, not read the disk", "Wants: one patient's record"] },
        "The clinic, three threats",
        [
          "A remote requester who is not staff, sending ordinary requests.",
          "A staff account that looks up patients outside their team. The actor is inside.",
          "Someone who can read a stolen backup. They do not need a login if the backup is the record.",
          "The controls differ. A firewall does nothing about the third.",
        ],
        [
          { prompt: "The product has a firewall and you claim it is secure. Which of the three threats did you ignore?", answer: "At least the stolen backup, and the staff member who is allowed through the firewall. A firewall is one control for one capability. Name the threat it does not touch." },
          { prompt: "Why is this course on the site if CSCE 701's catalog line only says graduate classification?", answer: "Graduate classification assumes an undergraduate security course. CSCE 465 is that course. Take it, and CSCE 313, before 701. The hours sit outside the 36 credits." },
        ],
      ),
      lec(
        "l2",
        "Memory",
        [
          "A buffer has a length. Writing past it changes adjacent memory. On a stack, that memory can include a saved return address. The program then jumps where the extra bytes said. That is the classic overflow. The fix is to refuse the extra bytes, and to make the return address harder to forge. You need the layout from CSCE 312 and the pointer from CSCE 313 before this sentence is obvious.",
          "A format string, or a use of memory after it was freed, is the same family: the program treats attacker bytes as a meaning the programmer did not intend. Find the place where the size is trusted.",
        ],
        { kind: "layers", caption: "A stack frame, simplified.", rows: ["Local buffer", "Saved frame", "Saved return address", "Bytes past the buffer walk upward into the return"] },
        "Eight bytes of room",
        [
          "The buffer holds 8 bytes. The input is 16. The copy does not check.",
          "The second 8 bytes land on the saved return address. The function returns into those bytes.",
          "Check the length and stop at 8, or refuse the call. The graduate course will add the surrounding properties. The check is this course.",
        ],
        [
          { prompt: "The language checks the length for you. Are you done with this bug?", answer: "For that buffer, in that language, the overrun is no longer yours to forget. Other bugs remain: a logic check that uses the wrong identity, a secret in a log. Do not import a C habit into a safe language, and do not assume the safe language ended security." },
          { prompt: "You made the stack non-executable. The overflow still happens. What did you stop, and what did you not?", answer: "You stopped the easy case of running the bytes that were written onto the stack. You did not stop the overwrite. A return into existing code can still be enough. The length check is still required." },
        ],
      ),
      lec(
        "l3",
        "A secret and a hash",
        [
          "A password is a secret the user can remember. You do not store it. You store a slow hash of the password plus a salt. The salt is unique per user so two users with the same password do not look the same in the file. A fast hash is wrong here, because guessing is the attack.",
          "Encryption is a different tool. It hides a message from someone without the key. Hashing a password is not encryption. You cannot decrypt a hash. Systems that 'decrypt the password to email it back' were storing the password.",
        ],
        { kind: "pair", caption: "Two tools.", leftTitle: "Slow salted hash", rightTitle: "Encryption", left: ["Store this for a password", "No need to recover the text"], right: ["Hide a message you must read later", "Wrong tool for a password database"] },
        "Two users, one password",
        [
          "Ada and Ben both choose the same passphrase.",
          "Ada's salt is S1, Ben's is S2. The stored values differ, because the hash inputs differ.",
          "A stolen file does not show that they match, and a precomputed table of unsalted hashes does not apply to either row.",
        ],
        [
          { prompt: "You hashed passwords with a fast checksum and no salt. What is the attack?", answer: "Guess common passwords, hash them once, and compare against every row. One computation per guess covers the whole file. A salt forces the guess to be redone per row. A slow hash makes each guess expensive. Use both." },
          { prompt: "The product emails the user their current password. What does that imply about storage?", answer: "The password is recoverable, so it is not only a slow hash. It is stored in a reversible form, or in the clear. Replace that with a reset token. You should not be able to read the password back." },
        ],
      ),
      lec(
        "l4",
        "The network attacker",
        [
          "On an open path, the attacker can read, drop, replay, or change packets. A password sent in the clear is then the attacker's password. A lock icon is not the analysis. The analysis is: which bytes were secret, and who else could see them.",
          "A replay sends an old correct message again. If the server accepts it, the attacker does not need the secret, only a copy of the request. A nonce, a timestamp, or a one-time token is how the server notices the copy. CSCE 701 will formalize this. You should already refuse a design that replays.",
        ],
        { kind: "flow", caption: "A replay.", steps: ["The real client sends a valid request", "The attacker stores it", "The attacker sends the same bytes later", "The server must be able to say: I have seen this"] },
        "A transfer request",
        [
          "The message says: move ten dollars from A to B, with a valid signature.",
          "The attacker cannot forge a new signature. They can send the same signed message tomorrow.",
          "If the server has no memory of that message, it moves the money twice. Store a unique id from the message and reject the second one, or bind the signature to a one-time challenge.",
        ],
        [
          { prompt: "The channel is encrypted and you still accept a replayed ciphertext. What was missing?", answer: "Freshness. Encryption hides the bytes from a reader. It does not, by itself, tell you this ciphertext is a second copy of an old one, unless the protocol binds a nonce that the server checks. Turn the encryption on and still check the replay." },
          { prompt: "You log the full request, including the password, 'for debugging'. Who is the new attacker?", answer: "Anyone who can read the log: an operator, a stolen backup of the logs, a too-wide admin tool. The threat model grew. Do not write secrets into logs. Log an id, not the secret." },
        ],
      ),
      lec(
        "l5",
        "Who may do what",
        [
          "Authentication says who is calling. Authorization says what that identity may do. A checked password is not a permission. The permission is a rule: this identity may read this row. Check it on the server, on every request. A hidden button is not a check. The request can be sent without the button.",
          "A confused deputy is a program that has a privilege and uses it on behalf of a caller who does not. The clinic server can read every row. The clerk may not. The server must use the clerk's limit, not its own, when answering the clerk. CSCE 701 names this. You should already see it in the query.",
        ],
        { kind: "pair", caption: "Two questions.", leftTitle: "Authentication", rightTitle: "Authorization", left: ["This request is Ada", "A password, a key, a session"], right: ["Ada may see this row", "Checked even if the button is hidden"] },
        "Another patient's id",
        [
          "Ada is authenticated. She changes the id in the request from her patient to Ben's.",
          "The server looks up Ben's row because the database account can see every row.",
          "The missing check is: is Ada on Ben's care team? If not, return nothing. The hidden button on Ada's page never ran. The request did.",
        ],
        [
          { prompt: "The page hides the button for other patients. Is the record safe?", answer: "No. Hiding a button is a display choice. The request is the authority boundary. Check the team on the server for every id. Assume the caller can send any id." },
          { prompt: "The server process runs as a database user that can read all rows. Is that a bug by itself?", answer: "Not always. The process needs a way to read the rows it is allowed to serve. The bug is using that power for a caller who was not allowed. Constrain the query with the caller's identity. That is the deputy." },
        ],
      ),
      lec(
        "l6",
        "What the graduate course will assume",
        [
          "You can write a threat in three lines, explain an overflow as a length that was not checked, store a password as a slow salted hash, spot a replay, and separate a hidden button from a server-side check. CSCE 701 will talk about properties, cryptography as a tool, and incidents. It should not be the first time you see these.",
          "CSCE 313 is the other preparation: processes, memory, and files. Take that too if the machine underneath these attacks is still vague.",
        ],
        { kind: "layers", caption: "Five checks before 701.", rows: ["A named threat", "A length check", "A salted slow hash", "A replay the server refuses", "A permission checked on the server"] },
        "A question you should answer cold",
        [
          "The firewall is on, the password is hashed, and a staff member exports every patient. Which control failed?",
          "Authorization. The staff identity was real. The export was not limited to their team. The firewall and the hash addressed other threats.",
          "If you blamed the firewall, redo the threat lecture before the graduate course.",
        ],
        [
          { prompt: "Name two courses to finish before CSCE 701, and why neither is inside the 36.", answer: "CSCE 313 for the machine, and CSCE 465 for threats and the basic mechanisms. Both are undergraduate preparation. 701 is the master's course and is the one that counts toward the ten." },
          { prompt: "A test that used to overflow now stops at the buffer length. What do you keep?", answer: "The test. It is the regression that the length check stays. Deleting it because the bug is fixed is how the next edit removes the check." },
        ],
      ),
    ],
  },
];
