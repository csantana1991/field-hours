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

export const moreLearning: CoursePack[] = [
  {
    slug: "csce-625",
    lectures: [
      week(
        "l6",
        "Constraints",
        [
          "A constraint satisfaction problem is a set of variables, a finite domain for each, and a set of constraints that mention subsets of the variables. A solution is an assignment that satisfies every constraint. Map coloring, scheduling, and sudoku are the same problem with different constraints. Saying so is useful only if you write the variables and the domains down.",
          "Backtracking assigns one variable at a time and retreats when a constraint is already violated. Forward checking, when you assign a variable, deletes values from its neighbors that are now impossible. Arc consistency is stronger: a value survives in a domain only if some value in the other variable's domain supports it. AC-3 enforces that on every arc. It does not by itself search. It shrinks domains before and during search.",
          "Variable ordering changes the size of the tree. The minimum-remaining-values heuristic assigns the variable with the smallest domain next, on the grounds that it is the most likely to fail soon. Least-constraining value tries values that leave the neighbors the most options. These are heuristics. They do not change which solutions exist.",
          "If the constraint graph is a tree, arc consistency plus a pass from the leaves solves the problem in time linear in the number of values times the number of edges. Cycles are why the general problem is NP-complete. A tree decomposition of small width is the structured way out, and it is the reason a schedule with local constraints can be easy while an arbitrary one is not.",
        ],
        { kind: "pipeline", caption: "Search with propagation.", stages: ["Pick a variable", "Try a value", "Delete unsupported neighbor values", "Backtrack if a domain empties"] },
        "Two variables, domains of size two",
        [
          "X and Y each have domain {1, 2}. The only constraint is X + Y = 3, so the allowed pairs are (1, 2) and (2, 1).",
          "Arc consistency on X: 1 is supported by Y = 2, and 2 is supported by Y = 1. Nothing is deleted. The same holds for Y.",
          "Assign X = 1. Forward checking deletes Y = 1, because 1 + 1 is not 3. Y's domain is {2}. No search past that assignment is required.",
        ],
        [
          {
            prompt: "Arc consistency leaves every domain nonempty. Is the problem guaranteed to have a solution?",
            answer: "No, once the constraint graph has a cycle. Three variables, each domain {1, 2}, and constraints that they are pairwise different, is arc consistent if you are not careful with the count: actually pairwise different on {1, 2} for three variables is not arc consistent, because a value needs a support in each neighbor simultaneously across arcs one at a time. A standard counterexample is a cycle of inequalities that is locally supported and globally impossible after a larger domain. Nonempty domains after AC-3 do not certify a solution. You still have to search, unless the graph is a tree.",
          },
          {
            prompt: "Why does assigning the most constrained variable first often beat assigning variables in the order they were written?",
            answer: "A failure near the root throws away a larger subtree than a failure near a leaf. The variable with the smallest domain is the one most likely to fail immediately. You pay a small amount now to avoid copying a dead end across the remaining variables.",
          },
        ],
      ),
      week(
        "l7",
        "Logical inference",
        [
          "Propositional logic is a language of atoms and the connectives not, and, or, and implication. A model is a truth assignment. Entailment means every model of the knowledge base is a model of the query. Inference rules are sound if they only derive entailed sentences, and complete if they can derive every entailed sentence. You want both. A rule that sometimes invents facts is worse than a slow one.",
          "Resolution is a complete method for propositional entailment when the knowledge base is in conjunctive normal form. From (A or B) and (not B or C) you derive (A or C). To test whether the knowledge base entails Q, add not Q and ask whether resolution derives the empty clause. If it does, not Q is inconsistent with the knowledge base, so Q is entailed. The procedure can take exponential time. It will not lie if you implement the clause set correctly.",
          "Forward chaining on definite clauses, which have exactly one positive literal, runs in linear time in the size of the knowledge base. It is complete for queries that are single atoms, and incomplete for arbitrary propositional queries. Backward chaining starts from the query and is the same idea from the other end. Use them when the knowledge is a set of rules. Use resolution when you need the full language.",
          "First-order logic adds quantifiers and relations. Unification replaces propositional matching. The course needs you to see that a finite propositional encoding of a planning problem is already first-order structure flattened into atoms. It does not need a full theorem-prover project.",
        ],
        { kind: "flow", caption: "Refutation by resolution.", steps: ["Put the knowledge base in CNF", "Add the negated query", "Resolve pairs until the empty clause", "Or stop when no new clause appears"] },
        "A three-clause knowledge base",
        [
          "Clauses: (A or B), (not A or C), (not B or C). Query: C.",
          "Add (not C). Resolve (A or B) with nothing about C yet. Resolve (not A or C) with (not C) to get (not A). Resolve (not B or C) with (not C) to get (not B).",
          "Resolve (A or B) with (not A) to get (B). Resolve (B) with (not B) to get the empty clause. The knowledge base entails C. A model with C false cannot satisfy all three original clauses.",
        ],
        [
          {
            prompt: "Forward chaining on definite clauses derives C from the example above. Why is that not a reason to use forward chaining on every knowledge base?",
            answer: "Definite clauses have exactly one positive literal. A knowledge base with (A or B) and no other structure is not a set of definite clauses, and forward chaining as defined for rules does not apply. Resolution still does. Completeness is relative to the fragment you claimed.",
          },
          {
            prompt: "The empty clause is derived after adding not Q. What do you report, and what would the empty clause mean if you had not added not Q?",
            answer: "Report that the knowledge base entails Q. If the empty clause appears before you add not Q, the knowledge base itself is contradictory, and it entails every query. You should notice that case instead of treating every question as yes.",
          },
        ],
      ),
      week(
        "l8",
        "Planning",
        [
          "A planning problem names a set of facts, a start state, a goal, and actions. Each action has preconditions that must hold and effects that add or delete facts. A plan is a sequence of actions from the start to a state that contains the goal. This is search in a state space that you should not expand by hand, because the number of states is exponential in the number of facts.",
          "Ignore-delete-lists is a relaxation: pretend actions never remove a fact. The relaxed problem is easier, and the number of relaxed actions needed to reach the goal is an admissible heuristic for the real search. Admissible means the heuristic never overestimates the remaining cost. A* with an admissible heuristic returns an optimal plan. An inadmissible heuristic can return a plan that works and is not the shortest.",
          "Partial-order planning keeps actions unordered except where one action's effect is another action's precondition. The plan is a set of constraints, not a single sequence, until the end. That avoids committing to an order that a later threat will break. A threat is an action that deletes a fact another action needs. You resolve it by ordering the threat before the producer or after the consumer.",
          "The frame problem is the obligation to say what does not change. STRIPS-style effects solve it by assuming unspecified facts stay as they are. If your action language lacks that default, every action must mention every fact, and the model is not usable.",
        ],
        { kind: "flow", caption: "From facts to a plan.", steps: ["Write the start facts", "Write each action's preconditions and effects", "Relax deletes to get a heuristic", "Search, and check the real deletes"] },
        "A locked drawer",
        [
          "Facts: locked, have-key, drawer-open. Start: locked, have-key. Goal: drawer-open.",
          "Unlock requires locked and have-key, deletes locked, adds unlocked. Open requires unlocked and not drawer-open, adds drawer-open.",
          "The relaxed problem that ignores deletes still needs both actions, so the heuristic is 2. The real plan is unlock, then open. Searching with that heuristic expands the right plan first.",
        ],
        [
          {
            prompt: "You drop the precondition 'unlocked' from Open, and the planner says the plan is a single Open. Whose mistake is that?",
            answer: "The modeler's. The planner answered the problem you wrote. A missing precondition is not a search bug. Read the plan back against the world before you blame the heuristic.",
          },
          {
            prompt: "A heuristic counts the number of goal facts not yet true. On the drawer, the goal is one fact, so the heuristic is 1 at the start. Is that admissible, and is it tight?",
            answer: "It is admissible if each action can add at least one missing goal fact and actions cost 1, because you need at least one action per missing goal fact only when no action adds two. Here one action cannot open a locked drawer, so the true cost is 2 and the heuristic of 1 never overestimates. It is admissible and not tight. Ignore-delete-lists was tighter.",
          },
        ],
      ),
      week(
        "l9",
        "Belief networks",
        [
          "A Bayesian network is a directed acyclic graph whose nodes are random variables, plus a conditional probability table for each node given its parents. The joint distribution factors into those tables. That factorization is the reason the model is smaller than an explicit table over every variable. A joint over n binary variables is 2^n numbers. A network with small parent sets is linear in n times the table size.",
          "Inference by enumeration sums the joint over the variables you did not ask about. It is correct and exponential. Variable elimination sums one variable at a time and reuses factors. Its cost depends on the order. A bad order recreates the full joint. Belief propagation is exact on trees and approximate, unless you are careful, on graphs with cycles.",
          "Conditional independence is the point of the arrows. Given its parents, a node is independent of its non-descendants. You can read some independences off the graph with d-separation, and you should not claim an independence the graph does not support. An arrow is not a causal claim unless you built the graph that way and you are willing to say what intervention means.",
          "A network is only as good as the numbers in the tables. Invented probabilities produce invented posteriors. If the tables came from counts, say how many observations, and refuse a probability of zero unless the event is impossible rather than merely unseen.",
        ],
        { kind: "layers", caption: "A three-node network. Alarm depends on fire. Call depends on alarm.", rows: ["Fire, no parents", "Alarm given fire", "Call given alarm", "Joint is the product of the three tables"] },
        "One update",
        [
          "P(fire) = 0.01. P(alarm | fire) = 0.9. P(alarm | no fire) = 0.1. You observe the alarm and have not modeled the call yet.",
          "P(alarm) = 0.9 * 0.01 + 0.1 * 0.99 = 0.009 + 0.099 = 0.108.",
          "P(fire | alarm) = 0.009 / 0.108 = 1/12, about 0.083. The alarm raised the probability from 0.01, and it did not make a fire certain, because false alarms are common relative to fires.",
        ],
        [
          {
            prompt: "You add a node Call with P(call | alarm) = 0.7 and P(call | no alarm) = 0.01. You observe a call and no alarm reading. Does the call give information about fire?",
            answer: "Yes. Call is not independent of fire once you have not observed alarm, because alarm is a common parent path: fire -> alarm -> call. Observing call raises the probability of alarm and therefore of fire. If you had observed alarm, the call would be independent of fire in this graph. d-separation says so, and the calculation agrees.",
          },
          {
            prompt: "A table contains a zero for an event you have simply never recorded. What does inference do with that zero?",
            answer: "It treats the event as impossible and can force a posterior to zero or make a query undefined when every explanation is ruled out. Use a small count, or an explicit model of unseen events, unless you mean impossible.",
          },
        ],
      ),
      week(
        "l10",
        "Decisions over time",
        [
          "A Markov decision process is a set of states, actions, transition probabilities, and rewards. The Markov property says the next state depends on the past only through the current state and the action. A policy picks an action in each state. The value of a state under a policy is the expected sum of discounted rewards from that state. The discount gamma, between 0 and 1, makes a reward next step worth gamma times a reward now, and it makes the infinite sum finite.",
          "Value iteration applies the Bellman optimality backup until the values change by less than a tolerance. The backup replaces a state's value by the best action's expected immediate reward plus gamma times the expected value of the next state. With a finite state space and gamma under 1, the iteration converges to the optimal values. The greedy policy with respect to those values is optimal.",
          "Policy iteration alternates evaluating the current policy, which is a linear system, and improving it by one greedy step. It often takes fewer iterations than value iteration and more work per iteration. Both return the same optimum if you run them to convergence. Stopping early returns a policy that can be suboptimal by a bound you can compute from the residual.",
          "A grid with a pit and a goal is the whole idea. If the transition is noisy, the optimal path does not hug the pit. A deterministic planner that ignores the 0.1 chance of slipping is solving a different problem, and it will look efficient until the first slip.",
        ],
        { kind: "pipeline", caption: "One value-iteration backup.", stages: ["For each state", "For each action", "Expected reward plus discounted next value", "Keep the best action"] },
        "Two states",
        [
          "States Good and Bad. One action. From Good you stay in Good with reward 1. From Bad you move to Good with reward 0. Gamma is 0.5.",
          "Optimal values satisfy V(Good) = 1 + 0.5 V(Good), so 0.5 V(Good) = 1, and V(Good) = 2. V(Bad) = 0 + 0.5 V(Good) = 1.",
          "One backup from zeros: V(Good) becomes 1, V(Bad) becomes 0. Next backup: V(Good) = 1 + 0.5 * 1 = 1.5, V(Bad) = 0.5 * 1.5 = 0.75 on the following pass if you use the new Good value. The sequence climbs to 2 and 1. It does not jump there from a single backup.",
        ],
        [
          {
            prompt: "Gamma is 1 and every state has a positive reward available forever. What happens to the value of an infinite horizon?",
            answer: "The sum diverges. Values are infinite and comparisons are meaningless. Use a discount under 1, or a finite horizon, or switch to average reward and say so. Do not run value iteration and report the last finite number as if it were the infinite sum.",
          },
          {
            prompt: "Your robot slips into the pit 10 percent of the time when it walks beside the pit, and the pit reward is -100. The shortest path walks beside the pit for one square and a longer path does not. Why might the longer path have higher value?",
            answer: "The expected cost of one slip is 10, in the same units, before discounting, which can exceed the extra steps of the long path. The optimum is an expectation, not a length. A planner that only counts steps is ignoring the transition model you wrote.",
          },
        ],
      ),
      week(
        "l11",
        "Learning a policy",
        [
          "Reinforcement learning is an MDP whose transitions or rewards you do not know as a table. You learn from trajectories. A model-based method learns the transition counts and then runs value iteration. A model-free method learns values or a policy without storing the transition table. Q-learning learns the value of a state-action pair from the backup of the next state's best action, and it does not need the transition model. It converges under conditions you should be able to name: every pair is tried infinitely often, and the learning rate falls appropriately.",
          "Exploration is not optional. A greedy policy with respect to a half-learned value will never try the action that looked bad once. Epsilon-greedy takes a random action with probability epsilon. A fixed epsilon never stops exploring. Decaying epsilon can stop too soon. The course requirement is that you notice the choice, not that you invent a new schedule.",
          "A reward function is a specification. If you pay the agent for points, you get points, including points earned by a behavior you did not picture. That is specification gaming, and it is an ordinary failure of the formalization, the same kind as a planner with a missing precondition. Changing the learning rate does not fix a reward that scores the wrong event.",
          "Policy gradient methods optimize a parameterized policy by climbing the expected return. They can represent stochastic policies and they can be unstable. This course asks you to explain Q-learning on a small table before you treat a neural policy as anything but a function approximator with a failure mode.",
        ],
        { kind: "pair", caption: "Two ways to learn the same task.", leftTitle: "Model-based", rightTitle: "Q-learning", left: ["Count transitions", "Average the rewards", "Plan with value iteration"], right: ["Store Q(state, action)", "Back up from the next max", "No explicit transition table"] },
        "One Q update",
        [
          "Q(s, a) is 0. You take a, receive reward 1, and land in s' where the best Q is 2. Gamma is 0.5. Learning rate is 0.5.",
          "The target is 1 + 0.5 * 2 = 2. The update moves halfway from 0 toward 2, so the new Q(s, a) is 1.",
          "A second identical experience moves halfway from 1 toward 2, so Q becomes 1.5. It approaches 2 and does not store the transition that produced s'.",
        ],
        [
          {
            prompt: "Epsilon is 0 from the start and every Q is 0. What policy do you actually run?",
            answer: "A fixed arbitrary tie-break among actions, forever, if greedy breaks ties the same way. You never gather the data the convergence proof assumed. Epsilon-greedy with epsilon 0 is not exploration.",
          },
          {
            prompt: "The agent is rewarded for reaching a charger and learns to drive in circles that each touch the charger. Is the learning algorithm wrong?",
            answer: "The algorithm optimized the reward you wrote. Circles are optimal if each touch pays and there is no cost for time or wear. Change the reward or the horizon. Do not call the optimizer broken for succeeding.",
          },
        ],
      ),
      week(
        "l12",
        "State you cannot see",
        [
          "A hidden Markov model has a state you do not observe, a transition on that state, and an observation that depends on the state. Filtering asks for the distribution over the current state given observations so far. Prediction asks for a future state. Smoothing asks for a past state given later observations. They are different queries. A filter that you then treat as a smoothed history is answering the wrong one.",
          "The forward step multiplies the predicted state distribution by the likelihood of the observation and normalizes. On a small discrete model you can do it with a vector. The normalize step is not optional: without it the numbers are not a distribution and the next step compounds the error.",
          "Particle filters represent the distribution by weighted samples when the state is continuous or huge. You predict each particle through the transition, weight it by the observation, and resample. If you resample from a handful of particles that all missed the true region, the filter collapses and more observations cannot revive a state you threw away. That failure has a name. Use it when your robot is suddenly certain and wrong.",
          "Localization and tracking in the robotics courses are this recursion with a motion model and a sensor model. The artificial-intelligence obligation is to write both models and the query. A heatmap is not a method.",
        ],
        { kind: "pipeline", caption: "One filter update.", stages: ["Predict with the transition", "Weight by the observation", "Normalize", "That distribution is the input to the next step"] },
        "Two states, one observation",
        [
          "States H and L, prior 0.5 each. Transitions: stay with probability 0.8, switch with 0.2. You observe High, and P(High | H) = 0.75, P(High | L) = 0.25.",
          "Predict is still 0.5 if you start from 0.5 and the chain is symmetric. Weights: H gets 0.5 * 0.75 = 0.375, L gets 0.5 * 0.25 = 0.125. Sum 0.5.",
          "Normalize: P(H | High) = 0.375 / 0.5 = 0.75, P(L | High) = 0.25. The observation moved the belief and did not erase the 0.25.",
        ],
        [
          {
            prompt: "You skip the normalize step and feed 0.375 and 0.125 into the next prediction. What breaks?",
            answer: "They are not a distribution. Their sum is 0.5, so every later observation is scaled by a shrinking or arbitrary factor, and a comparison of hypotheses is no longer a probability. Normalization is the step that makes the filter a posterior.",
          },
          {
            prompt: "Smoothing says the robot was probably in the hallway at time 3. Filtering at time 3 said the dock. Can both be right?",
            answer: "Yes. Filtering uses observations up to time 3. Smoothing also uses observations after time 3, which can rule out the dock. They are different conditional distributions. Report which one you computed.",
          },
        ],
      ),
      week(
        "l13",
        "What the agent does not know",
        [
          "An agent that acts on a model is only as calibrated as the model. The earlier weeks built search, logic, probability, and learning. This week is the boundary. A fact absent from the knowledge base is not false. A probability of 0.9 is not a promise about the next single trial. A policy that is optimal for the MDP is optimal for that MDP, not for the building the MDP simplified.",
          "Calibration means that among the events you called 80 percent, about 80 percent occur. A classifier can be accurate and badly calibrated, and a planner that treats a calibrated 0.8 as a certainty will take risks the model told you not to take. Reliability diagrams are a check, not a decoration.",
          "Ethics in this course is a constraint on the specification, not a paragraph after the demo. Whose data is in the model, who is affected by a false positive, and whether the action can be refused are part of the problem statement. If you cannot say who pays for a mistake, the problem is not specified.",
          "When the model and the world disagree, the engineering move is to measure the disagreement and narrow the claim. It is not to add parameters until the training log looks calm.",
        ],
        { kind: "pair", caption: "Two different claims.", leftTitle: "What the model supports", rightTitle: "What it does not", left: ["Optimal for the stated MDP", "Entailed by the stated sentences", "Calibrated on the stated test"], right: ["Optimal in the building", "True because it was not mentioned", "Safe because the loss fell"] },
        "A false positive with a cost",
        [
          "A detector flags 10 out of 100 people, and 4 of the 10 flags are wrong. Each false flag costs the person an hour. Each missed case, of which there is 1, costs a different harm you must name rather than bury inside accuracy.",
          "Accuracy can be high while those 4 hours are real. Report the false-positive count beside the accuracy.",
          "The specification either accepts those 4 hours or it changes the threshold. That choice is part of the agent. It is not a later ethics essay disconnected from the threshold.",
        ],
        [
          {
            prompt: "The knowledge base does not contain a sentence about a door being locked. May the planner assume the door is unlocked?",
            answer: "Only if the problem statement says that unmentioned doors are unlocked. Otherwise the door's status is unknown, and a plan that requires it to be unlocked is incomplete. Absence of a sentence is not a truth value.",
          },
          {
            prompt: "Your probabilities are calibrated and the optimal action still harms a group that was rare in the data. Does calibration answer the objection?",
            answer: "No. Calibration says the numbers mean what they say. It does not say the objective was acceptable. The harm belongs in the reward or the constraint, or the system should not take that action. A well-calibrated wrong objective is still wrong.",
          },
        ],
      ),
      week(
        "l14",
        "An agent you can grade",
        [
          "The project for this course is a single agent on a small, fully specified world. Pick one: a search problem with an admissible heuristic you can justify, a planner whose preconditions you can violate on purpose to show the failure, or an MDP whose values you compute by hand on a subset and by iteration on the rest. Do not pick all three.",
          "The write-up has four parts. The formal problem. The algorithm and its invariant or backup. A worked instance small enough to check. And one input on which a plausible wrong version fails. That fourth part is how you show you understand the method. A demo that only shows the happy path is not gradable.",
          "Measure something. Nodes expanded against the heuristic. Plan length against the relaxation. Value error against the number of backups. A table with one column is not a measurement.",
          "If you use learning, separate the data you fit from the data you report. The standard from the machine-learning course applies here even though the models look like agents. An agent that memorized the test maze has not learned a policy.",
        ],
        { kind: "layers", caption: "What the write-up must contain.", rows: ["The formal problem", "The invariant or the backup", "A worked instance", "One input that breaks the wrong version"] },
        "A heuristic you can check",
        [
          "Grid from (0, 0) to (2, 1), four-connected, each step costs 1. Manhattan distance is |dx| + |dy| = 3.",
          "The true shortest path is 3. The heuristic never exceeds that on this instance, and on a grid with no obstacles Manhattan never exceeds the true cost, so it is admissible here.",
          "If you add a wall and keep using Manhattan, it remains admissible because walls only lengthen the true path. It may become a bad guide. Admissible does not mean efficient.",
        ],
        [
          {
            prompt: "Your A* heuristic cuts corners through walls and sometimes exceeds the true remaining cost. What may you no longer claim about the path it returns?",
            answer: "You may not claim it is shortest. A* with an inadmissible heuristic can return a feasible path that is not optimal. Drop the heuristic or repair it before you use the word optimal.",
          },
          {
            prompt: "The worked instance has three states and your code prints values for fifty. What belongs in the write-up beside the printout?",
            answer: "A hand calculation of the three-state case that matches the code, plus the definition of the fifty-state instance. The printout is not evidence until a smaller case agrees with arithmetic you did yourself.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-633",
    lectures: [
      week(
        "l6",
        "Regularization",
        [
          "A model that fits the training set and fails on new data has memorized. Regularization adds a penalty so that large weights are expensive. Ridge regression minimizes the squared error plus lambda times the sum of squared weights. Lasso uses the sum of absolute weights and can set some weights to zero. The penalty is part of the objective. It is not a post-processing step you mention in a caption.",
          "Lambda is chosen on validation data, never on the test set. If you try ten lambdas on the test set and keep the best, the test set became training data and the number you report is optimistic. Nested selection exists because of this. Use it, or hold out the test set until the model, the features, and lambda are frozen.",
          "Weight decay in a neural net is ridge regression on the weights, usually excluding the biases. Dropout is a different regularizer: it randomly hides units during training so the network cannot depend on one path. At evaluation you use the full network and scale appropriately, or you use the inference rule your library documents. Mixing the training rule with the evaluation rule silently changes the model.",
          "More data reduces variance. A penalty reduces variance by restricting the hypothesis class, and it can increase bias. The bias-variance lecture already said this. Regularization is how you act on it when you cannot collect more data this week.",
        ],
        { kind: "pair", caption: "The same fit, two penalties.", leftTitle: "Ridge", rightTitle: "Lasso", left: ["Penalty on squared weights", "Shrinks, rarely zeros", "Closed form with the design matrix"], right: ["Penalty on absolute weights", "Can zero a coefficient", "No simple closed form in general"] },
        "Three points and a penalty",
        [
          "You fit a line to three points and the unpenalized slope is 5 because one point is extreme.",
          "Ridge with a large lambda pulls the slope toward 0. The training error rises. If the extreme point was noise, the validation error falls.",
          "If the extreme point was the only signal, the same lambda raises validation error. The penalty does not know which case you are in. The validation set is how you tell.",
        ],
        [
          {
            prompt: "You choose lambda by the lowest error on the test set, then report that error. What is wrong with the report?",
            answer: "The test error is no longer an unbiased estimate of future error. You used it to make a decision. Report the error on a set that was not used to pick lambda, or admit that the number is a training result.",
          },
          {
            prompt: "Lasso sets a coefficient to zero. Does that mean the corresponding feature is irrelevant in the world?",
            answer: "No. It means that under this penalty and this sample, the objective preferred zero. A correlated feature can be zeroed while its partner carries the signal. Zero is a statement about the fit, not a discovery that the variable does not exist.",
          },
        ],
      ),
      week(
        "l7",
        "Margins and kernels",
        [
          "A support vector machine for two classes finds a linear separator that maximizes the margin, the distance from the line to the nearest training point. The points that touch the margin are the support vectors. Moving a point that is not a support vector, as long as it stays on the correct side and outside the margin, does not move the separator. That is the geometric content of the method.",
          "If the classes overlap, the soft-margin version allows violations and charges them in the objective. The charge is a hyperparameter, chosen on validation data, with the same discipline as lambda. A hard margin on overlapping data is infeasible. The solver is not broken. The constraint is.",
          "A kernel is a dot product in some feature space. You never write the features down if the kernel can be computed from the original inputs. The polynomial kernel and the Gaussian kernel are the two you should be able to define. The Gaussian kernel can separate almost anything if its width is tiny, which means it can also memorize. Width is a hyperparameter.",
          "The kernel trick does not say that a nonlinear problem became linear in the original coordinates. It became linear in a different space. Report the kernel you used. 'SVM' is not a specification.",
        ],
        { kind: "pair", caption: "A margin in the plane.", leftTitle: "What moves the line", rightTitle: "What does not", left: ["A point on the margin", "A point on the wrong side", "The penalty on violations"], right: ["A point far on the correct side", "A label you did not include", "The filename of the dataset"] },
        "Four points",
        [
          "Positive points at x = 0 and x = 1. Negative points at x = 3 and x = 4. In one dimension the hard-margin separator sits at the midpoint of the gap, x = 2.",
          "The margin is the distance from 2 to the nearest point, which is 1. The support 'vectors' are the points at 1 and 3.",
          "Move the point at 0 to -10. It is not a support vector. The separator stays at 2. Move the point at 1 to 1.5 and the separator moves, because that point defined the margin.",
        ],
        [
          {
            prompt: "Two classes overlap in the original coordinates and you use a hard-margin linear SVM. What should the solver report?",
            answer: "Infeasible. There is no line with a positive margin that classifies every point correctly. Switch to a soft margin or a kernel, and say which. Do not add a tiny margin and call it hard.",
          },
          {
            prompt: "A Gaussian kernel with a very small width classifies the training set perfectly and fails on a point placed next to a training point. What happened?",
            answer: "The kernel treated each training point as its own island. The model memorized locations. Widen the kernel using validation data, or you have a nearest-neighbor classifier with a fragile radius, not a margin method.",
          },
        ],
      ),
      week(
        "l8",
        "Trees and ensembles",
        [
          "A decision tree splits the input on one feature at a time, chosen to reduce an impurity measure such as Gini or entropy. The tree can represent interactions that a linear model cannot, and it can also isolate single training points if you let it grow. A pure leaf on one training point is a memorization. Limit the depth, or require a minimum number of samples in a leaf, and choose that limit on validation data.",
          "A single tree is unstable: a small change in the sample can change the root split. Bagging trains many trees on bootstrap samples and averages them. Random forests also restrict each split to a random subset of features, which makes the trees disagree more, which is what makes the average useful. Averaging models that all make the same mistake does nothing.",
          "Boosting trains the next tree on the residuals or on reweighted points that the current ensemble gets wrong. Gradient boosting is the version you will meet in practice. It can overfit. The number of trees and the learning rate are hyperparameters. Early stopping on a validation set is the usual control.",
          "Feature importance from a tree is a description of that fit, not a causal ranking. A feature used at the root reduced impurity in this sample. A correlated feature that was never chosen can be just as informative. Do not put an importance bar chart in a report without that sentence.",
        ],
        { kind: "layers", caption: "One tree, then a forest.", rows: ["Root split on one feature", "Leaves hold class counts", "A second tree sees a bootstrap sample", "The forest averages the votes"] },
        "Four points, one split",
        [
          "Points: (0, red), (1, red), (2, blue), (3, blue), using a single numeric feature.",
          "A split at 1.5 puts both reds on the left and both blues on the right. Impurity of each child is 0. The tree stops.",
          "A split at 0.5 isolates one red and leaves the other red mixed with the blues. Impurity falls less. The first split is the one the algorithm keeps.",
        ],
        [
          {
            prompt: "You grow a tree until every leaf is pure on the training set. What do you expect on a test point that falls into a leaf with one training sample?",
            answer: "The leaf predicts that sample's label, whether or not the region means anything. Training accuracy is 100 percent by construction. Test accuracy is whatever memorization is worth on this problem. Constrain the tree.",
          },
          {
            prompt: "All 200 trees in a forest produce the same splits. Will the forest beat one tree?",
            answer: "No. The average of identical predictions is that prediction. Random feature subsets and bootstrap samples exist to make the errors differ. If they do not differ, you have one tree with extra steps.",
          },
        ],
      ),
      week(
        "l9",
        "Mixtures",
        [
          "A mixture model says each point was produced by one of several sources, and you do not observe which. A Gaussian mixture uses a mean, a variance, and a weight for each source. Clustering from the earlier lecture is the special case where you assign each point to the nearest mean and the variances are fixed. The mixture also says how unsure that assignment is.",
          "Expectation-maximization alternates two steps. The E-step computes the probability that each source produced each point, given the current parameters. The M-step updates the parameters from those probabilities as if they were fractional counts. Each full step does not decrease the likelihood. It can converge to a poor local maximum, so the start matters. Initializing means at random data points is the ordinary start, and you run more than once.",
          "A variance that collapses to zero on a single point sends the likelihood to infinity. That is a known degeneracy of Gaussian mixtures, not a sign that you found a perfect cluster. Constrain the variance, or stop treating an infinite likelihood as success.",
          "The number of sources is a hyperparameter. Likelihood on the training data always prefers more sources. Choose the number by held-out likelihood or by a penalty. Do not choose it by the picture that looks nicest unless the picture is the decision and you say so.",
        ],
        { kind: "pipeline", caption: "One EM cycle.", stages: ["Guess means and weights", "Soft-assign every point", "Update means from the soft counts", "Repeat until the likelihood stalls"] },
        "Four points on a line",
        [
          "Points at 0, 0.2, 5, and 5.2. Two sources.",
          "Start means at 0 and 5. The E-step assigns the first pair to the first source and the second pair to the second, almost hard, because the gap is large relative to any reasonable variance.",
          "The M-step puts the means at 0.1 and 5.1. A start with both means at 0 can collapse. Run a second start before you trust a single picture.",
        ],
        [
          {
            prompt: "The log likelihood becomes largely positive because one variance went to zero. Did the algorithm find a better cluster?",
            answer: "No. A Gaussian with zero variance is not a usable density. The likelihood is unbounded on this model class. Reject that run and constrain the variance.",
          },
          {
            prompt: "You pick the number of sources by the highest training likelihood. What number will you pick?",
            answer: "The largest number you allow, up to one source per point, because each added source can fit leftover variation. Training likelihood is not a model-selection criterion here. Use held-out likelihood.",
          },
        ],
      ),
      week(
        "l10",
        "Training a network",
        [
          "Backpropagation computes the gradient of the loss with respect to each weight by the chain rule. The earlier lecture did one step on a tiny net. This week is what happens when the net is deep. A gradient that is the product of many small factors vanishes, and the early layers stop moving. A product of large factors explodes, and the update destroys the weights. Initialization and the choice of nonlinearity exist to keep those products moderate.",
          "Stochastic gradient descent uses a minibatch so the gradient is noisy and cheaper than a full pass. The step size is a hyperparameter. A step size that is too large diverges. A step size that is too small stalls inside the time you were willing to wait, which you can mistake for a finished training run. Plot the training loss. A flat line at a high value is not convergence to a good model.",
          "Batch normalization, residual connections, and careful initialization are engineering responses to the product of factors. You should know what problem they are responding to. Using all of them because a recipe said so, without being able to say what failed before, is not a method.",
          "The training loss going down is necessary and not sufficient. Watch the validation loss. When it rises while training loss falls, you are overfitting. Stop, add data, or strengthen regularization. Do not keep the checkpoint with the best training loss.",
        ],
        { kind: "flow", caption: "What you watch while training.", steps: ["Forward pass on a batch", "Loss", "Backward pass", "Update", "Compare validation loss"] },
        "A product of three factors",
        [
          "Three layers each multiply the gradient by 0.1. The gradient at the first layer is 0.001 times the loss gradient.",
          "A step size of 0.1 moves the first-layer weights by 0.0001 times the loss gradient. They are effectively frozen.",
          "Replace the factors by 0.9 and the same product is about 0.73. The first layer moves. The arithmetic is the vanishing-gradient story, without a particular brand of layer.",
        ],
        [
          {
            prompt: "Training loss falls for fifty epochs and validation loss falls for ten and then rises. Which checkpoint do you keep?",
            answer: "A checkpoint near epoch ten, when validation loss was lowest, not epoch fifty. Epoch fifty fits the training set better and generalizes worse. Save more than the last iterate.",
          },
          {
            prompt: "The loss becomes NaN on step three. Name two distinct causes that produce that symptom.",
            answer: "A step size large enough to overflow the weights, or a loss that is undefined at the current prediction, such as a log of zero in a probability. The fix is different. Reduce the step and check the loss implementation before you add a new architecture.",
          },
        ],
      ),
      week(
        "l11",
        "Scores and calibration",
        [
          "Accuracy hides the base rate. The evaluation lecture computed precision and recall on a rare positive class. This week adds the score itself. Many models emit a number that is not a probability. A threshold turns the number into a decision. The right threshold depends on the costs of the two mistakes, which are part of the problem, not a default of 0.5.",
          "A proper scoring rule rewards calibrated probabilities. Log loss does. Accuracy does not. You can improve accuracy by predicting the majority class and be useless on the rare class. Report the score that matches the decision. If someone will threshold at a cost ratio, show precision and recall at that threshold, not at the threshold that makes the paper look balanced.",
          "Calibration plots bin the predicted probabilities and compare them to the observed frequency. A model that says 0.9 and is right 60 percent of the time is overconfident. Recalibration on a validation set can repair the numbers without retraining the features. It cannot repair a model that ranks the cases backwards.",
          "A single test set gives a noisy estimate. If you need a comparison, use a second split or a bootstrap and show the range. A 0.01 difference on a hundred examples is not a result. Compute the counts before you write 'better.'",
        ],
        { kind: "pair", caption: "Two reports from one model.", leftTitle: "A decision", rightTitle: "A probability", left: ["Pick a threshold from costs", "Report precision and recall there", "Accuracy alone is not enough"], right: ["Log loss on held-out data", "A calibration curve", "Do not threshold first"] },
        "One hundred people, ten positive",
        [
          "The model flags 20 people. Of the 10 positives, it finds 8. Precision is 8/20 = 0.4. Recall is 8/10 = 0.8.",
          "Accuracy is (8 true positives + 78 true negatives) / 100 = 0.86. Predicting nobody yields accuracy 0.90 and recall 0. A higher accuracy can be a worse detector.",
          "If a false positive costs 1 and a missed positive costs 9, the 8 true positives and 2 misses and 12 false positives have a cost you can compute: 2 * 9 + 12 * 1 = 30. Compare that cost to another threshold instead of comparing accuracies.",
        ],
        [
          {
            prompt: "You sweep thresholds on the test set and report the best F1. What did you use the test set for?",
            answer: "For model selection. The F1 you report is optimistic. Choose the threshold on validation data and touch the test set once.",
          },
          {
            prompt: "The model outputs scores between 0 and 1 that are badly calibrated, and the ranking of patients is correct. What can you fix without new features?",
            answer: "The mapping from score to probability, fit on validation data. You cannot fix a reversed ranking by recalibration. Check the ranking first. If it is right, a monotone map can repair the probabilities.",
          },
        ],
      ),
      week(
        "l12",
        "Leakage",
        [
          "Leakage is information from the test label, or from the future, entering the training procedure. It produces optimistic numbers that collapse on a real deployment. The common cases are concrete. Scaling features using the mean of the whole dataset before the split. Selecting features by correlation with the label on all rows. Duplicating a person across train and test. Using a timestamp from after the outcome.",
          "The split unit is the unit that will be new later. If you will see new patients, split by patient, not by visit. Two visits from the same patient, one in train and one in test, let the model recognize the patient. The test score then measures memorization of people, which you will not have when a new person arrives.",
          "Any preprocessing that looks at labels or at other rows is part of the model and must be fit on the training fold only. A pipeline object is useful because it attaches the scaler to the fold. A notebook that scales, then splits, is the bug.",
          "When a result looks too good for the features you have, assume leakage and try to find it before you assume a breakthrough. A model that predicts tomorrow's value from a column that already contains tomorrow's value is not a model.",
        ],
        { kind: "flow", caption: "A split that does not leak.", steps: ["Choose the split unit", "Hold out the test units", "Fit every preprocessor on train only", "Evaluate once"] },
        "A column that is the label",
        [
          "The table has a column total that equals the sum of the feature you meant to predict and a tax that is a fixed fraction of it.",
          "A model given total predicts the target with almost no error. The column is the label wearing a hat.",
          "Drop it. If the error stays tiny, look for another copy of the label: an id that orders the classes, a timestamp of the decision, a duplicate row.",
        ],
        [
          {
            prompt: "You normalize each feature by the maximum in the column, computed before the split. How can that use the test set?",
            answer: "The maximum may be a test row. The training features were divided by a number that depends on the test set. Fit the maximum on the training rows only, and apply that same number to the test rows.",
          },
          {
            prompt: "Accuracy is 0.99 and the positive class is 50 percent of the data. You did not expect the features to be that informative. What do you check first?",
            answer: "Leakage: duplicate rows, a column derived from the label, and whether the split unit matches the deployment unit. Only after those checks fail do you treat 0.99 as a result.",
          },
        ],
      ),
      week(
        "l13",
        "Prediction is not a cause",
        [
          "A predictive model estimates an outcome from features as they co-occur in the data. A causal claim says what would happen if you changed a feature. Those are different questions. A model that predicts readmission from the number of medications is not a reason to take the medications away. The medications may mark the severity that causes readmission.",
          "If you need a causal answer, you need a design: a randomized assignment, a natural experiment, or an explicit assumption about what is unobserved. The algorithm does not supply the assumption. Writing 'controlled for' and listing covariates is not a design unless the list is justified.",
          "Distribution shift is the predictive version of the same humility. A model trained in one hospital sees different measurements in another. Accuracy on a random split of the first hospital does not transfer. Collect a sample from the place you will deploy, or restrict the claim to the place you measured.",
          "The write-up should contain the sentence: this predicts, it does not say what to change. If you do intend an intervention, the sentence should be replaced by the assumption that makes the intervention valid, and by the measurement you would accept as a refutation.",
        ],
        { kind: "pair", caption: "Two questions, two methods.", leftTitle: "Prediction", rightTitle: "Intervention", left: ["Features as observed", "A held-out sample from the same process", "Accuracy, calibration, cost"], right: ["A change you impose", "An assumption or a randomization", "An outcome measured after the change"] },
        "Medications and readmission",
        [
          "Patients with more medications are readmitted more often. A model uses the count and ranks patients well.",
          "A policy that reduces medications in order to reduce readmission is a different claim. The count may be a stand-in for illness.",
          "The predictive model can still be the right tool for scheduling follow-up. It is the wrong tool for deciding which drug to cancel, until someone states an assumption you can test.",
        ],
        [
          {
            prompt: "You add twenty covariates and the coefficient on medications shrinks. May you call the remaining coefficient a causal effect?",
            answer: "No. Shrinking is consistent with confounding and also with having removed part of the pathway you meant to measure. A coefficient from a regression is a causal effect only under assumptions you have to state. The shrinkage itself is not those assumptions.",
          },
          {
            prompt: "The model was trained on morning labs and will be run on afternoon labs from a new clinic. What number do you not yet have?",
            answer: "The error on afternoon labs from that clinic. The morning test set does not provide it. Measure a sample, or do not claim the morning accuracy.",
          },
        ],
      ),
      week(
        "l14",
        "A study",
        [
          "The last week is a study small enough to finish and strict enough to defend. Pick a dataset you can describe in one paragraph: what a row is, how it was collected, and what a prediction is for. Split by the unit that will be new later. Fit a linear model and one nonlinear model. Choose hyperparameters only on the training side.",
          "Report the base rate, the cost-weighted error or precision and recall at a stated threshold, and the same numbers for a baseline that predicts the majority class or the mean. A model that does not beat that baseline on the metric you care about has not earned a diagram.",
          "Include one failure. A slice of the data where the model is worse, or a feature you removed because it leaked. A study with no failure mode has not been inspected.",
          "The hours for this course include this study. The opening lectures are the vocabulary. This write-up is the evidence that you can use it without fooling yourself.",
        ],
        { kind: "layers", caption: "The study, in order.", rows: ["Describe the row and the decision", "Split by the deployment unit", "Baseline, then two models", "One failure you can point at"] },
        "A baseline that is easy to forget",
        [
          "Ninety of 100 labels are negative. The majority predictor scores accuracy 0.90 and recall 0.",
          "Your model scores accuracy 0.91 and recall 0.2. On accuracy it barely wins. On recall it is a different tool.",
          "If the decision needs recall, report 0.2 against 0, not 0.91 against 0.90. The baseline is part of the result.",
        ],
        [
          {
            prompt: "You try five model families on the test set and keep the best accuracy. How should you label that accuracy?",
            answer: "As a tuned result, not as a confirmatory test. The test set selected the family. Either nest the selection inside the training side and re-evaluate once, or say the number is exploratory.",
          },
          {
            prompt: "The nonlinear model matches the linear model on every metric you chose. What do you conclude?",
            answer: "On this split and these metrics, the extra capacity did not pay. Prefer the linear model and say so. Do not keep the nonlinear model because it is more modern. Equality is a result.",
          },
        ],
      ),
    ],
  },
];
