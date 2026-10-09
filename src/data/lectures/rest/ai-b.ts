import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-642",
    lectures: [
      lec(
        "l1",
        "Markov decision processes",
        [
          "You write an MDP as states, actions, a transition kernel, and a reward. The Markov property says the next state depends on the past only through the current state and the action you just took. With discount 0.9, a reward of 1 that arrives 10 steps from now is worth 0.9 to the tenth power, about 0.35. Distant payoffs shrink before you pick an algorithm.",
          "You also choose a horizon. A finite horizon of 5 makes the policy a function of state and time, because the last step has no future left. An infinite discounted horizon lets one stationary policy cover every time. If every reward sits between 0 and 1 and the discount is 0.9, the return is at most 1 divided by 1 minus 0.9, which equals 10. That bound keeps a value table finite when the episode never ends.",
        ],
        {
          kind: "layers",
          caption: "What you store in an MDP.",
          rows: [
            "States and actions",
            "Transition kernel",
            "Reward each step",
            "Discount on later reward",
          ],
        },
        "A two-state return",
        [
          "From A, the only action moves to B with reward 0. In B, the only action stays in B with reward 4. The discount is 0.5.",
          "The return from B is 4 plus 0.5 times 4 plus 0.25 times 4 and so on, which sums to 4 divided by 0.5, so 8.",
          "From A the return is 0 plus 0.5 times 8, so 4. You do not add the reward at B a second time outside that discount.",
        ],
        [
          {
            prompt: "Every reward is at most 2 and the discount is 0.5. What is the largest possible return?",
            answer: "4. The infinite sum of 2 times 0.5 to the k is 2 divided by 1 minus 0.5.",
          },
          {
            prompt: "You switch to a horizon of 1, starting in A, under the same transitions. What return do you collect, and why does time matter?",
            answer: "0. The only reward inside the horizon is the immediate 0 for leaving A. The value of B is never used, because you do not act there. A horizon of 1 makes value depend on remaining time.",
          },
        ],
      ),
      lec(
        "l2",
        "Value iteration",
        [
          "The Bellman optimality backup sets a state's value to the best action's expected reward plus the discount times the expected value of the next state. You turn that equation into value iteration by applying the backup to every state from a table of zeros. On a grid with 4 states and discount 0.9, one sweep rewrites all 4 entries. The largest change tends to shrink by about a factor of 0.9 each sweep, because the backup is a contraction.",
          "You stop when the biggest absolute change in any state falls below a tolerance you set, often 0.01 when rewards are near 1. The greedy policy picks, in each state, the action with the best one-step backup, and it is optimal once the values are exact. If you stop early, leftover error can still flip the best action wherever two actions differ by less than that leftover. You compare the action gap with the residual, not the residual alone.",
        ],
        {
          kind: "flow",
          caption: "One value-iteration sweep.",
          steps: [
            "Read the value table",
            "Backup every state",
            "Keep the best action",
            "Stop on a small change",
          ],
        },
        "Two states, old table held fixed",
        [
          "State H pays reward 2 and stays in H. State L pays 0 and moves to H. Discount 0.5. Start both values at 0, and use the previous table for the whole sweep.",
          "After one sweep, V(H) is 2 plus 0.5 times 0, so 2, and V(L) is 0. After the next sweep, V(H) is 2 plus 0.5 times 2, so 3, and V(L) is 0.5 times 2, so 1.",
          "The fixed point solves V(H) = 2 plus 0.5 V(H), so V(H) is 4, and V(L) is 0.5 times 4, so 2. One sweep does not land there.",
        ],
        [
          {
            prompt: "At the fixed point of this two-state backup, what is V(L)?",
            answer: "2. V(H) is 4, and L moves to H with reward 0, so its value is 0.5 times 4.",
          },
          {
            prompt: "Your tolerance is 0.5. In one state the two action backups are 3.2 and 3.4. Can you trust the greedy choice?",
            answer: "No. The gap is 0.2, which is smaller than the 0.5 leftover you still allow. A later sweep can reverse which action looks better.",
          },
        ],
      ),
      lec(
        "l3",
        "Policy iteration",
        [
          "Policy evaluation freezes a policy and solves the linear Bellman expectation equation, the backup without the max. With 3 states you get 3 equations and 3 unknown values. You may iterate that backup or solve the linear system once. Either way you obtain the value of the policy you froze, not the optimal value. A policy you have not evaluated does not yet have a return you can quote.",
          "Policy iteration then improves the policy. In every state you replace the action by the one whose one-step backup is largest under the values you just computed. On a table with 2 actions per state, one improvement pass compares 2 backups in each state. If no action changes, you have an optimum and you stop. You then evaluate the new policy before you improve again, because a backup from old values is not the new policy's return.",
        ],
        {
          kind: "pipeline",
          caption: "Policy iteration until the actions hold.",
          stages: [
            "Freeze the policy",
            "Solve the linear values",
            "Greedy improvement",
            "Stop if the policy holds",
          ],
        },
        "Stay or leave",
        [
          "In S, stay pays 1 and remains in S. Leave pays 0 and goes to T. In T the only action pays 3 and stays. Discount 0.5. Start by evaluating the policy that stays in S.",
          "V(S) = 1 plus 0.5 V(S), so V(S) is 2. V(T) = 3 plus 0.5 V(T), so V(T) is 6. The stay backup is 2. The leave backup is 0.5 times 6, so 3. Improvement switches S to leave.",
          "Under leave, V(S) is 0.5 times 6, so 3. Stay's backup against that value is 1 plus 0.5 times 3, so 2.5, which is worse. The improved policy is stable.",
        ],
        [
          {
            prompt: "After the first evaluation, which action does improvement pick in S, and what is its backup?",
            answer: "Leave, with backup 3. Stay's backup is 2.",
          },
          {
            prompt: "You keep the stay policy and never improve. By how much is V(S) worse than under the improved policy?",
            answer: "By 1. Stay evaluates to 2. Leave evaluates to 3.",
          },
        ],
      ),
      lec(
        "l4",
        "Q-learning without a model",
        [
          "You do not have the transition table. Temporal-difference learning updates a value from one transition: the target is the reward you just saw plus the discount times the value of the next state, and you step a fraction alpha of the way toward that target. With alpha 0.5, an old value of 0 and a target of 4 becomes 2 after one update. The same transition a second time moves the value from 2 to 3.",
          "Q-learning stores one number per state-action pair and targets the best next action, not the action you take next. That off-policy backup lets a behavior policy with epsilon 0.1 gather data while the stored values still chase the greedy action. With 4 actions, epsilon 0.1 picks a uniform random action about 1 time in 10. If epsilon is 0 and every entry starts at 0, a fixed tie break never tries the other 3 actions.",
        ],
        {
          kind: "pair",
          caption: "Two one-sample backups.",
          leftTitle: "TD on a state",
          rightTitle: "Q-learning",
          left: ["Target uses next value", "Samples the current policy", "One learning rate"],
          right: ["Target uses max next Q", "Behavior can differ", "Epsilon forces tries"],
        },
        "Two identical Q updates",
        [
          "Q(s, a) starts at 0. You take a, receive reward 2, and land where the best next Q is 4. Discount 0.5. Alpha 0.5.",
          "The target is 2 plus 0.5 times 4, so 4. The new Q is 0 plus 0.5 times (4 minus 0), so 2.",
          "The same transition again keeps the target at 4. The new Q is 2 plus 0.5 times (4 minus 2), so 3. You never stored the transition itself.",
        ],
        [
          {
            prompt: "What is Q(s, a) after the two updates in the example?",
            answer: "3.",
          },
          {
            prompt: "Epsilon is 0, every Q starts at 0, and ties break toward action 1. How many of the other actions do you sample?",
            answer: "None. You always take action 1, so the other actions stay at 0. The usual convergence story needs every pair tried enough times, and that does not happen.",
          },
        ],
      ),
      lec(
        "l5",
        "Function approximation",
        [
          "A table cannot store a state that is an 84 by 84 image. You replace the table by a parameterized function, here a network with about 2 million weights, and you train those weights so the output matches a Bellman target. The update is no longer a write into one cell. A step that cuts error on the current transition can raise error on another transition that shares the same weights.",
          "Three ingredients together are the usual divergence recipe: bootstrapping from your own next-state estimate, off-policy data, and a nonlinear function class. Dropping one of them changes the failure you should expect. A linear function, on-policy temporal difference, and 16 features can still be studied as a contraction in a weighted norm. A deep Q network keeps all 3 ingredients, so you add a replay buffer and a second target network instead of hoping the raw update stays put.",
        ],
        {
          kind: "layers",
          caption: "The table becomes a shared function.",
          rows: [
            "Image or vector state",
            "Shared parameterized function",
            "Bellman target",
            "One step touches many states",
          ],
        },
        "One weight for two states",
        [
          "Both states read the same weight w, and you want targets 0 and 2. The constant that minimizes average squared error is the mean, (0 plus 2) divided by 2, so w = 1. Squared error is 1 at each state.",
          "A step that only sees the second state moves w toward 2. From 1, adding 0.5 times the error (2 minus 1) sets w to 1.5.",
          "Error on the first state grows from 1 to 1.5, while error on the second falls from 1 to 0.5. A table would have edited only the cell you wrote.",
        ],
        [
          {
            prompt: "What single weight minimizes average squared error on the targets 0 and 2?",
            answer: "1, the mean of the two targets.",
          },
          {
            prompt: "Why can a step that is right for the second state increase error on the first?",
            answer: "Both states use the same weight. Moving w from 1 to 1.5 matches the target 2 better and the target 0 worse. Sharing is the mechanism, not a bug in the arithmetic.",
          },
        ],
      ),
      lec(
        "l6",
        "Deep Q networks",
        [
          "A deep Q network outputs one number per action. You store each transition in a replay buffer and draw a minibatch of 32 older transitions, so the update is not tied to the latest frame alone. That weakens the strong time correlation of consecutive frames. The target uses a copy of the weights that you refresh every 1000 steps, so the regression label does not chase the same weights you are moving on this step.",
          "You score one transition by the squared gap between online Q and a frozen target. The target is the reward plus the discount times the best next frozen Q, and you do not differentiate through that max. With rewards clipped into [-1, 1] and discount 0.99, a target has absolute value at most 1 divided by 0.01, which is 100. Clipping, not the raw game score, sets that scale for the fit.",
        ],
        {
          kind: "pipeline",
          caption: "One deep Q update.",
          stages: [
            "Store the transition",
            "Sample a batch of 32",
            "Build frozen targets",
            "Step the online weights",
          ],
        },
        "A target that does not move",
        [
          "Online Q(s, a) is 1.5. The frozen max next Q is 2.0. The reward is 0. The discount is 0.5.",
          "The target is 0 plus 0.5 times 2.0, so 1.0. The squared error is (1.5 minus 1.0) squared, so 0.25.",
          "You step the online weights to reduce that 0.25. The frozen copy stays at 2.0 until the next refresh, which in this design is every 1000 steps, not every step.",
        ],
        [
          {
            prompt: "Online Q is 1.5, reward is 0, discount is 0.5, and the frozen max is 2. What are the target and the squared error?",
            answer: "The target is 1.0. The squared error is 0.25.",
          },
          {
            prompt: "You copy the target network every step instead of every 1000 steps. What did the regression lose?",
            answer: "A label that stays fixed while you fit it. The target now moves with the online weights, so you chase a changing number instead of regressing onto a snapshot.",
          },
        ],
      ),
      lec(
        "l7",
        "Policy gradients",
        [
          "A stochastic policy assigns probabilities to actions. The policy gradient theorem writes the gradient of expected return as an expectation of the return times the gradient of the log probability of the action you sampled. REINFORCE multiplies that log-probability gradient by the full episode return. With a return of 10 and a learning rate of 0.01, the update scale is 0.1 times that gradient, and a large return on a poor action still increases its probability.",
          "An actor-critic replaces the full return by a one-step temporal-difference error, the advantage, so you do not wait for the episode to end. The critic is a value network and the actor is the policy network. A state-only baseline does not change the expected gradient, and it cuts variance. PPO clips the probability ratio at 0.2 on either side of 1, so one batch cannot multiply an action probability by more than a factor of 1.2.",
        ],
        {
          kind: "flow",
          caption: "An actor-critic step.",
          steps: [
            "Sample an action",
            "Form the advantage",
            "Scale the log probability",
            "Clip the ratio in PPO",
          ],
        },
        "Return versus a baseline",
        [
          "Two actions have probabilities 0.8 and 0.2. You sampled the rare action. The episode return is 5, with the discount already folded in.",
          "Plain REINFORCE scales the log-probability gradient of that action by 5, so a positive return raises its probability.",
          "A state baseline of 4 scales the same gradient by 5 minus 4, so 1. The direction is unchanged and the step is smaller. That subtraction is the actor-critic advantage in the one-step case when the critic matches the baseline.",
        ],
        [
          {
            prompt: "The return is 5 and the state baseline is 4. What number scales the log-probability gradient?",
            answer: "1, the advantage 5 minus 4.",
          },
          {
            prompt: "The PPO clip is 0.2 and a batch wants a probability ratio of 1.8 on an action with positive advantage. What ratio does the clipped objective use?",
            answer: "1.2. The allowed window is 0.8 to 1.2, and 1.8 lies above it. With positive advantage the objective uses the upper end, 1 plus 0.2.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can train and check",
        [
          "You can now write a small MDP, compute a discounted return, and run value iteration or policy iteration when the table fits in memory. You can also explain a Q-learning update with a learning rate of 0.5, and you can say why a deep Q network adds a replay buffer plus a target network copied every 1000 steps. Given a policy-gradient step, you can point at the return or the advantage that scales the log probability.",
          "You can diagnose a run that looks busy and learns nothing. If epsilon is 0 on a fresh table with 4 actions, you never try 3 of them. If the target network is copied every step, the regression label moves as fast as the prediction. If two actions differ by 0.2 and you stopped value iteration while values can still move by 0.5, the greedy action is not settled. Next you plot return against steps on one environment.",
        ],
        {
          kind: "pair",
          caption: "Table solvers and deep updates.",
          leftTitle: "Table methods",
          rightTitle: "Deep updates",
          left: ["Value or policy iteration", "Q-learning on cells", "A gap versus the residual"],
          right: ["Replay and a frozen target", "Advantage scales the actor", "Clip the probability ratio"],
        },
        "A flat return you can read",
        [
          "A task has 4 actions, discount 0.9, and rewards of 0 or 1. The run uses a deep Q network with epsilon 0 and copies the target every step. After 200 updates the plotted return is still 0.",
          "Two mechanisms from earlier lectures are off. Epsilon 0 never tries 3 of the 4 actions once ties break one way. Copying the target every step moves the label with the online weights.",
          "The discounted return of rewards at most 1 cannot exceed 1 divided by 0.1, so 10. A later plot that climbs past 10 is a logging error or an undiscounted sum, not a policy that beat the bound.",
        ],
        [
          {
            prompt: "Epsilon is 0 and the target network is copied every step. Which two mechanisms failed, and what was each supposed to do?",
            answer: "Exploration and the frozen target. Epsilon-greedy was supposed to try a random action on some steps so every action gets data; at 0 it does not. The frozen target was supposed to hold the regression label still between copies; copying every step lets the label move with the online weights.",
          },
          {
            prompt: "Discount is 0.9 and every reward is at most 1. Your plot shows an average discounted return of 12. What does the bound say?",
            answer: "The return cannot exceed 1 divided by 1 minus 0.9, which is 10. A plotted 12 is a measurement error, an undiscounted sum, or a reward outside the range you assumed.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-666",
    lectures: [
      lec(
        "l1",
        "Feature vectors",
        [
          "You turn a measurement into a vector before a classifier sees it, and you choose the coordinates. A 28 by 28 grayscale digit is 784 intensities. Two images of the same digit can sit far apart in that space after a shift of only 2 pixels, so raw distance is not identity. You either build features that absorb the shift, or you leave that work to the later model.",
          "Standardization is a concrete feature transform you fit on training data only. Subtract each coordinate's training mean and divide by that coordinate's training standard deviation, so a coordinate that spanned about 1000 units and one that spanned 0.1 both end with variance 1 on the training split. Using 50 test points to set the mean leaks the evaluation into the representation. You freeze the scale before you score those points.",
        ],
        {
          kind: "pipeline",
          caption: "From a measurement to a model input.",
          stages: [
            "Record the raw signal",
            "Choose the coordinates",
            "Fit scale on training data",
            "Pass the vector onward",
          ],
        },
        "Two coordinates, population scale",
        [
          "Coordinate A has training values 0 and 2. The mean is 1 and the population standard deviation is 1. Coordinate B has 0 and 4. The mean is 2 and the population standard deviation is 2.",
          "A new raw point (2, 4) centers to (1, 2).",
          "Dividing by those scales yields (1, 1). You computed both means and both scales without the new point.",
        ],
        [
          {
            prompt: "Using the training scales in the example, what is the scaled vector of the raw point (2, 4)?",
            answer: "(1, 1). Centered it is (1, 2), then each coordinate is divided by its training standard deviation, 1 and 2.",
          },
          {
            prompt: "You recompute the mean using the training set plus 50 test points, then report test error. What leaked?",
            answer: "The test measurements entered the feature transform through the mean. Test error no longer scores a representation that was fixed before those points were seen.",
          },
        ],
      ),
      lec(
        "l2",
        "Density estimates",
        [
          "A probability report needs a density, or at least a conditional density you estimated. A histogram with equal bins estimates height by the count in a bin divided by the bin width times the number of samples. With 100 samples and 20 of them in a bin of width 0.1, the height is 20 divided by 10, so 2. An empty bin gets height 0, which breaks a later logarithm.",
          "A kernel estimate places a bump of bandwidth h on every sample and averages them. With a box of width h, a location covered by k of n bumps has density k divided by n times h. You pick h by held-out likelihood, not by how smooth the picture looks. On data that varies on a scale of about 1, a bandwidth of 0.01 memorizes the sample, and a bandwidth of 10 flattens it.",
        ],
        {
          kind: "pair",
          caption: "Two density estimators.",
          leftTitle: "Histogram",
          rightTitle: "Box kernel",
          left: ["Fixed bins", "Count over width times n", "Empty bins are zero"],
          right: ["A bump on each sample", "Bandwidth h sets the width", "Overlap adds the bumps"],
        },
        "Four samples, box width 1",
        [
          "Samples sit at 0, 0, 1, and 1, so n is 4. Each box kernel has height 1 on an interval of length 1 starting at the sample: [0, 1) or [1, 2).",
          "At 0.5 only the two samples at 0 cover the query. Density is 2 divided by (4 times 1), so 0.5.",
          "At 2.5 no kernel covers the query, so the density is 0. A log likelihood there is undefined. A wider box, or a Gaussian bump, would have left a positive number.",
        ],
        [
          {
            prompt: "In the histogram, 100 samples put 20 points in a bin of width 0.1. What height do you plot?",
            answer: "2. The count 20 is divided by 100 times 0.1.",
          },
          {
            prompt: "In the box-kernel example, what is the density at 0.5, and why is density 0 at 2.5 a modeling choice?",
            answer: "0.5 at the point 0.5, because two of four kernels cover it and h is 1. Density 0 at 2.5 only means no kernel reaches there. It is not evidence that future points cannot land there. A wider bandwidth would assign them a small positive density.",
          },
        ],
      ),
      lec(
        "l3",
        "Bayes and linear decisions",
        [
          "For 0-1 loss you pick the class with the larger posterior. With equal priors of 0.5, that is the class with the larger class-conditional density. If class A is Gaussian with mean 0 and variance 1, and class B is Gaussian with mean 2 and variance 1, the two densities match at 1, halfway between the means. You place the boundary there because the shared variance cancels.",
          "When you do not trust that Gaussian story, a linear score still cuts the space with a hyperplane. Take weights (1, 0) and bias -1. You label a point positive when the first coordinate minus 1 is positive, so the boundary is the line where the first coordinate equals 1. The second coordinate never moves the score. Training accuracy of 100 percent on 8 points does not tell you the error on a fresh set of 20.",
        ],
        {
          kind: "flow",
          caption: "A linear score.",
          steps: [
            "Dot the weights with x",
            "Add the bias",
            "Read the sign",
            "Score a fresh split",
          ],
        },
        "Two points, one unused coordinate",
        [
          "Weights are (1, 0) and the bias is -1. The score is the first coordinate minus 1.",
          "The point (1.5, 4) scores 0.5, so you assign the positive class. The point (0.5, 4) scores -0.5, so you assign the negative class.",
          "Both points share the second coordinate 4, and it changes nothing because its weight is 0. A scatter plot can make that coordinate look informative while the score ignores it.",
        ],
        [
          {
            prompt: "What is the score of (1.5, 4), and which class do you assign if a positive score means class 1?",
            answer: "The score is 0.5, so class 1.",
          },
          {
            prompt: "Priors are equal. The two unit-variance Gaussians have means 0 and 2. A point arrives at 1. Which class does the Bayes rule prefer?",
            answer: "Neither. The densities are equal at 1, so both posteriors are 0.5. You need a tie break. The boundary sits there because the means differ by 2 and the variances match.",
          },
        ],
      ),
      lec(
        "l4",
        "Clustering",
        [
          "K-means assigns each point to the nearest of k centers, then replaces each center by the mean of its points. You repeat until assignments stop changing. With k = 2 and points at 0, 0, 10, and 10, centers settle at 0 and 10 if you start one center in each pair. A bad start can park both centers in one clump. You run 10 random initializations and keep the lowest total squared distance.",
          "A Gaussian mixture softens the assignment. Each point carries a responsibility between 0 and 1 for each component, and the mean update weights the point by that number. A responsibility of 0.75 sends three quarters of the point's mass to component 1 and 0.25 to component 2. K-means is the hard case, where every responsibility is 0 or 1. You choose k by a criterion you wrote down before looking, because the training cost falls as k grows.",
        ],
        {
          kind: "flow",
          caption: "One k-means pass.",
          steps: [
            "Assign points to nearest centers",
            "Replace each center by a mean",
            "Stop when labels hold",
          ],
        },
        "Three points, two centers",
        [
          "Points are 0, 2, and 10. You start centers at 0 and 9.",
          "Distances put 0 and 2 on the first center and 10 on the second. The new centers are the mean of 0 and 2, which is 1, and the point 10.",
          "The next assignment does not move. Squared distances are 1, 1, and 0, so the total is 2. That is the objective you compare across initializations, not a count of clusters you liked in a plot.",
        ],
        [
          {
            prompt: "What total squared distance do you get at convergence in the example?",
            answer: "2. The errors are 0 minus 1, 2 minus 1, and 10 minus 10.",
          },
          {
            prompt: "You set k = 3 on these 3 points and reach squared distance 0. Why is that not evidence of better structure?",
            answer: "Three centers can sit on the three points and drive the training objective to 0 by memorizing them. The objective falls as k grows. You needed a held-out criterion or a penalty on k.",
          },
        ],
      ),
      lec(
        "l5",
        "Spectral structure",
        [
          "Principal component analysis finds orthogonal directions of largest variance after you center the data. You form the covariance and take the leading eigenvectors. If the top component holds 0.9 of the trace, the reconstruction you just accepted throws away 0.1. You discard a coordinate only after you read that fraction. A plot of the first two scores is not by itself a reason to drop the rest.",
          "Spectral clustering builds a similarity graph, forms a Laplacian, and clusters eigenvectors instead of the raw coordinates. Two moons that interleave are not two round blobs, and k-means in the raw plane cuts them with a straight boundary between centers. With 2 well separated components, the leading Laplacian eigenvectors are nearly constant on each component. You then run k-means with k = 2 in that eigenvector coordinate.",
        ],
        {
          kind: "pair",
          caption: "Variance axes versus a graph cut.",
          leftTitle: "Principal components",
          rightTitle: "Spectral clustering",
          left: ["Center the coordinates", "Take top eigenvectors", "Read the variance fraction"],
          right: ["Build a similarity graph", "Take Laplacian eigenvectors", "Cluster those coordinates"],
        },
        "Four corners of a rectangle",
        [
          "Points are (0, 0), (2, 0), (0, 1), and (2, 1). The mean is (1, 0.5). Centered x coordinates are -1 or 1, so their mean square is 1. Centered y coordinates are -0.5 or 0.5, so their mean square is 0.25. Cross terms average to 0.",
          "The first axis is horizontal. Its share of the trace is 1 divided by 1.25, so 0.8.",
          "Projecting onto x keeps 0.8 of the variance and drops 0.2. You can quote that split. You should not say the vertical coordinate was noise unless a later task agrees.",
        ],
        [
          {
            prompt: "What fraction of variance does the first component keep in the rectangle example?",
            answer: "0.8. The x mean square is 1, the y mean square is 0.25, and 1 divided by 1.25 is 0.8.",
          },
          {
            prompt: "Why can k-means on raw coordinates fail on two interlocking moons when spectral clustering with k = 2 succeeds?",
            answer: "K-means assigns each point to the nearest center, so the boundary between two centers is a straight cut in the raw plane. Interlocking moons are not separated by that cut. Spectral clustering first maps points into Laplacian eigenvector coordinates, where the two components pull apart, and only then runs k-means.",
          },
        ],
      ),
      lec(
        "l6",
        "Hidden Markov models",
        [
          "A hidden Markov model has a state you do not see and an observation that depends only on the current state. Given that state, earlier states say nothing about the next one. With 3 hidden states the transition matrix is 3 by 3 and each row sums to 1. Filtering asks for the current state given observations so far. Smoothing uses the whole sequence, including later observations. You do not report a filter number as a smoothed label.",
          "You run the forward step by multiplying the predicted state masses by the observation likelihood, then you normalize. Start from a prior of 0.5 on H and 0.5 on L, before any transition. A symbol with likelihood 0.8 in H and 0.2 in L gives unnormalized masses 0.4 and 0.1. Their sum is 0.5, so the posterior is 0.8 on H and 0.2 on L. Drop the division and the next step is no longer a probability.",
        ],
        {
          kind: "pipeline",
          caption: "One forward filter step.",
          stages: [
            "Predict with the transition",
            "Multiply by the likelihood",
            "Normalize the masses",
            "Emit the current posterior",
          ],
        },
        "One observation, then a transition",
        [
          "After the observation above, the posterior is 0.8 on H and 0.2 on L.",
          "Stay probability is 0.75 and switch probability is 0.25. The next predicted mass on H is 0.8 times 0.75 plus 0.2 times 0.25, so 0.65. The mass on L is 0.35.",
          "Those two numbers sum to 1, so this predict step does not need a new normalize. The next observation will. Smoothing this same time index would also fold in any symbols that arrive after it, which this forward number has not seen.",
        ],
        [
          {
            prompt: "After the first observation and before any transition, what is the posterior on H?",
            answer: "0.8. The unnormalized masses are 0.4 and 0.1, and 0.4 divided by 0.5 is 0.8.",
          },
          {
            prompt: "Why is smoothing not the same query as the forward pass you just ran?",
            answer: "The forward pass uses only observations up to the current time. Smoothing a past state also uses observations that came later. Those future symbols can move the posterior, so a filter probability is the wrong label for a finished sequence.",
          },
        ],
      ),
      lec(
        "l7",
        "Ensembles",
        [
          "Bagging trains several classifiers on bootstrap draws and averages them. You draw a set of size n from a training set of size n, with replacement. The chance a given point is missed by one draw is about 1 over e, near 0.37, so those out-of-bag points can score that member. Averaging 10 trees cuts variance when their errors are not the same error. It does not cancel a bias every tree shares.",
          "Boosting fits the next member to points the current ensemble still misses. When a member has weighted error 0.25, its coefficient is 0.5 times the natural log of 3, about 0.549. You then multiply a missed point's weight by the square root of 3, about 1.732, before renormalizing. A member with error 0.5 gets coefficient 0. You stop when held-out error rises, even if training error is still falling.",
        ],
        {
          kind: "pair",
          caption: "Two ways to combine classifiers.",
          leftTitle: "Bagging",
          rightTitle: "Boosting",
          left: ["Bootstrap draws of size n", "About 0.37 left out", "Average the members"],
          right: ["Reweight missed points", "Coefficient from the error", "Stop on held-out error"],
        },
        "One AdaBoost multiplier",
        [
          "A point starts with weight 1. The new member has weighted error 0.25 and misclassifies the point.",
          "The coefficient is 0.5 times ln(3), about 0.549. Multiplying the weight by exp of that coefficient multiplies it by the square root of 3, about 1.732.",
          "A point this member got right is multiplied by 1 over the square root of 3, about 0.577. After you renormalize across the set, the missed point takes a larger share of the next fit.",
        ],
        [
          {
            prompt: "Weighted error is 0.25. What exact multiplier hits a misclassified point's weight before renormalization?",
            answer: "The square root of 3, about 1.732. It equals exp of 0.5 times ln(3).",
          },
          {
            prompt: "All 10 trees in a bagged ensemble make the same mistake on a point. What does the average predict, and which error remains?",
            answer: "The average repeats that mistake. Bagging only reduces variance that is not shared. The common bias stays.",
          },
        ],
      ),
      lec(
        "l8",
        "A pipeline you can defend",
        [
          "You can now turn a measurement into a feature vector, estimate a density with a histogram or a kernel, and pick a class by a Bayes rule or a linear score. You can cluster with k-means, read a variance fraction such as 0.8 off a principal component, filter a hidden Markov model and normalize it, and combine classifiers by bagging or by boosting. Each step has a number you can recompute.",
          "You can also name the failure that makes the pipeline lie. A scale fit on the test split, a histogram bin of height 0 inside a logarithm, a k equal to the number of points, a filter used as a smoothed label, and an ensemble stopped on training error are five different mistakes. The work you can do is to run one dataset through two of these stages and report the held-out number you defined before you looked.",
        ],
        {
          kind: "pipeline",
          caption: "Two stages and a held-out number.",
          stages: [
            "Fit the feature scale",
            "Estimate class densities",
            "Apply the Bayes rule",
            "Report held-out error",
          ],
        },
        "Scale, then a posterior",
        [
          "Training mean is 0 and training scale is 2. A raw value of 4 becomes (4 minus 0) divided by 2, so 2. You do not refit that scale on the test point.",
          "At the scaled value 2, the class-conditional density is 0.3 for A and 0.1 for B. Priors are equal, 0.5 each.",
          "The likelihood ratio is 0.3 divided by 0.1, so 3. With equal priors the posterior of A is 3 divided by 4, so 0.75. That 0.75 uses a representation fixed on training data.",
        ],
        [
          {
            prompt: "Combine standardization and the Bayes rule. Raw value 4, training mean 0, scale 2, densities 0.3 and 0.1, equal priors. What is the posterior of A?",
            answer: "0.75. The scaled value is 2. The likelihood ratio is 3, and 3 divided by 3 plus 1 is 0.75.",
          },
          {
            prompt: "K-means training cost falls when you raise k from 2 to 20 on 20 points, and a classifier's training error falls to 0. Which drop tells you about new points?",
            answer: "Neither. K-means training cost falls as k grows, and training error can fall to 0 by memorizing. You need the held-out score you fixed before looking. Those two training drops are the clustering objective and the classifier fit from earlier lectures, not evidence on new points.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-726",
    lectures: [
      lec(
        "l1",
        "Gradients and convex objectives",
        [
          "An objective is convex when the segment between any two points lies on or above the graph. For f(x) = 0.5 x squared, the second derivative is 1, so it is convex, and the gradient x is zero only at x = 0. You use the gradient as a local linear model. At x = 3 the gradient is 3, and a step of size 0.1 moves you to 2.7. The value falls from 4.5 to 3.645.",
          "A training loss is usually an average of per-example terms plus a regularizer. With n = 1000 the full gradient averages 1000 individual gradients. Convexity of each piece passes to the average, so squared loss or logistic loss on a linear model stays convex in the weights. A network with one hidden layer of 32 units is not convex in its weights. You still compute a gradient, and you do not inherit a global-minimum guarantee.",
        ],
        {
          kind: "layers",
          caption: "What the training objective adds up.",
          rows: [
            "Loss on one example",
            "Average over the training set",
            "Regularizer on the weights",
            "Gradient of that total",
          ],
        },
        "One step on a quadratic",
        [
          "f(x) = 0.5 x squared. At x = 3 the value is 4.5 and the gradient is 3.",
          "A step of size 0.1 lands at 2.7. The new value is 0.5 times 2.7 squared, so 3.645. The decrease is 4.5 minus 3.645, so 0.855.",
          "A step of size 2 from 3 lands at 3 minus 6, so -3, and the value is still 4.5. A step that is too long need not descend, even on this convex function.",
        ],
        [
          {
            prompt: "After the step of size 0.1 from x = 3, what are the new x and the new value?",
            answer: "x is 2.7 and the value is 3.645.",
          },
          {
            prompt: "Why does convex logistic regression not give you the same global claim for a hidden layer of 32 units?",
            answer: "That hidden layer is not a convex function of its weights. A point where the gradient is zero can be a saddle or a poor local minimum. Convexity was what made every stationary point global, and this model does not have it.",
          },
        ],
      ),
      lec(
        "l2",
        "Step sizes",
        [
          "You repeat one move in gradient descent: subtract the step size times the gradient. On f(x) = 0.5 L x squared the gradient is L x, so the error multiplies by 1 minus eta times L each step. If L is 4 and eta is 0.1, the factor is 0.6, and an error of 10 shrinks to 3.6 after 2 steps. If eta exceeds 2 divided by L, here 0.5, the absolute factor exceeds 1 and the iterates diverge.",
          "You rarely know L. A backtracking search tries a step and shrinks eta by a factor of 0.5 until the value falls in line with the linear model. On a training loss you may instead try a grid such as 0.001, 0.01, and 0.1, and keep a value whose curve descends. A curve that climbs by a factor of 10 in the first 5 steps is a step size that is too large, not a model that cannot fit.",
        ],
        {
          kind: "flow",
          caption: "Propose a step, then accept or shrink.",
          steps: [
            "Evaluate the gradient",
            "Propose the new point",
            "Accept if the value falls",
            "Otherwise shrink the step",
          ],
        },
        "A known curvature",
        [
          "L is 4 and eta is 0.1, so each step multiplies x by 0.6. Start at x = 10.",
          "After one step x is 6. After two steps x is 3.6.",
          "Here f(x) = 2 x squared, because 0.5 times L is 2. Then f(10) is 200 and f(3.6) is 25.92. The contraction factor on x is 0.6, which you can check before you look at the plot.",
        ],
        [
          {
            prompt: "With L = 4 and eta = 0.1, what is x after 2 steps from 10, and what is the factor per step?",
            answer: "x is 3.6. The factor is 0.6, which is 1 minus 0.1 times 4.",
          },
          {
            prompt: "You set eta = 1 with L = 4. What is the factor, and do the iterates converge?",
            answer: "The factor is 1 minus 4, so -3. Its absolute value is 3, which is greater than 1, so the iterates diverge. The lecture's upper limit is 2 divided by L, which is 0.5.",
          },
        ],
      ),
      lec(
        "l3",
        "Stochastic gradients",
        [
          "A stochastic gradient replaces the average over all n examples by the gradient of one example, or of a minibatch. With n = 10000, one full gradient costs about 10000 example gradients. A minibatch of 32 cuts the variance of the estimate relative to a single example by about a factor of 32 when the example gradients are uncorrelated, because the variance of an average scales as 1 over the batch size. You still take many steps per pass.",
          "If you keep the step size constant, the noise does not vanish and the iterate jitters near a minimizer. A schedule of 0.1 divided by the step index t drives that noise down. At step 1 the step size is 0.1. At step 100 it is 0.001. You plot loss against examples seen. Otherwise a batch of 32 and a batch of 256 look like the same effort when they are not.",
        ],
        {
          kind: "pipeline",
          caption: "One stochastic step.",
          stages: [
            "Draw 32 examples",
            "Average their gradients",
            "Step with the current eta",
            "Count examples seen",
          ],
        },
        "One noisy step versus the full gradient",
        [
          "The weight is 2. The full gradient is 6. One example draw gives gradient 10. The step size is 0.05.",
          "The stochastic update lands at 2 minus 0.05 times 10, so 1.5.",
          "The full-gradient update would land at 2 minus 0.05 times 6, so 1.7. The extra 0.2 of motion is the example gradient sitting 4 above the mean, times 0.05.",
        ],
        [
          {
            prompt: "What weight do you get after the stochastic step, and what would the full gradient have produced?",
            answer: "The stochastic step lands at 1.5. The full gradient would land at 1.7.",
          },
          {
            prompt: "Example gradients are uncorrelated. How does the variance of a batch-32 average compare with a single example?",
            answer: "It is about 1/32 of the single-example variance. You pay 32 examples per step for that reduction.",
          },
        ],
      ),
      lec(
        "l4",
        "Momentum",
        [
          "Momentum keeps a velocity. You set it to beta times its old value plus the new gradient, then subtract the step size times that velocity. With beta 0.9, step size 0.1, and a constant gradient of 2, velocity approaches 2 divided by 0.1, so 20. The effective step approaches 2, which is 10 times the plain step of 0.2. That factor is why you shrink the step size when you turn momentum on.",
          "You see the plain gradient zigzag on a long narrow valley, because the steep walls dominate each step. The velocity averages those wall components and keeps the component along the floor. With beta 0.9, a gradient from 10 steps ago still has weight 0.9 to the tenth power, about 0.35, so recent gradients lead and older ones still contribute. Nesterov momentum evaluates the gradient at a looked-ahead point instead.",
        ],
        {
          kind: "flow",
          caption: "One heavy-ball update.",
          steps: [
            "Decay the old velocity",
            "Add the new gradient",
            "Move by eta times velocity",
          ],
        },
        "Two steps from rest",
        [
          "Start velocity at 0 and x at 0. The gradient is the constant 2. Beta is 0.9 and the step size is 0.1.",
          "After one step the velocity is 2 and x is -0.2.",
          "After the second step the velocity is 0.9 times 2 plus 2, so 3.8, and x is -0.2 minus 0.1 times 3.8, so -0.58. Equilibrium velocity is 20, so you are still building speed.",
        ],
        [
          {
            prompt: "What are the velocity and x after the two steps in the example?",
            answer: "Velocity is 3.8 and x is -0.58.",
          },
          {
            prompt: "Why do you often lower the step size when you set beta to 0.9?",
            answer: "At equilibrium the velocity is the gradient divided by 1 minus 0.9, a factor of 10. The same step size then moves you 10 times farther than plain gradient descent. A step size that was stable without momentum can overshoot once that factor appears.",
          },
        ],
      ),
      lec(
        "l5",
        "Adaptive steps",
        [
          "You let AdaGrad divide each coordinate's step by the square root of the sum of that coordinate's past squared gradients, plus a tiny constant such as 1e-8. A coordinate whose gradients stay near 0.01 keeps a larger step than a coordinate whose gradients are near 10. The sum never forgets. After 10000 similar steps the denominator has grown like the square root of 10000, which is 100, so the steps shrink even if the curvature did not change.",
          "RMSProp replaces the sum by an exponential average with decay 0.99, so old squared gradients fade. Adam also averages the gradient with decay 0.9, and corrects bias because both averages start at 0. At step 1 the corrected momentum equals the first gradient. You still choose a base step, often 0.001. Adam does not choose it for you. A base step of 0.1 can diverge where 0.001 was stable.",
        ],
        {
          kind: "pair",
          caption: "Two per-coordinate scalings.",
          leftTitle: "AdaGrad",
          rightTitle: "Adam",
          left: ["Sum every squared gradient", "Denominator grows like sqrt(t)", "Per-coordinate steps"],
          right: ["Exponential average of squares", "Momentum with bias correction", "A base step you still set"],
        },
        "Two AdaGrad steps",
        [
          "One coordinate starts at 0. Both gradients are 2. Ignore the tiny constant. The base step is 0.5.",
          "After the first step the sum of squares is 4 and the denominator is 2. You subtract 0.5 times 2 divided by 2, so 0.5. The coordinate is -0.5.",
          "After the second step the sum of squares is 8 and the denominator is the square root of 8, about 2.828. You subtract 1 divided by that square root, about 0.354. The coordinate is about -0.854.",
        ],
        [
          {
            prompt: "To three decimals, where is the coordinate after the two AdaGrad steps?",
            answer: "-0.854. The first step subtracts 0.5. The second subtracts 1 over the square root of 8, about 0.354.",
          },
          {
            prompt: "Why can AdaGrad's step vanish late in a run where RMSProp would keep moving?",
            answer: "AdaGrad's denominator is the square root of a sum that keeps every past squared gradient, so it grows like the square root of the step count. RMSProp uses an exponential average, for example with decay 0.99, which forgets old gradients and can stay at a finite scale.",
          },
        ],
      ),
      lec(
        "l6",
        "What a rate actually says",
        [
          "For a smooth convex function, gradient descent with a fixed step drives the error down like 1 over k after k steps. Stochastic gradient on a convex Lipschitz objective, with a decaying step, has worst-case error like 1 over the square root of k. After 100 steps that bound has improved by a factor of 10, because the square root of 100 is 10. The bound is a guarantee, not a prediction of your plot.",
          "A deep network's training loss is not convex. The same algorithms still run, and a curve can fall faster than the bound or stall with gradient norm under 0.001 while training error is still 0.4. You report the quantity the guarantee names. One tiny gradient at step 100 does not finish a claim about an average of past norms. Training loss 0.01 beside validation loss 0.4 is memorization, and a smaller step will not close that gap.",
        ],
        {
          kind: "pair",
          caption: "A bound is not the same object as a curve.",
          leftTitle: "Convex guarantee",
          rightTitle: "One training plot",
          left: ["Error like 1 over sqrt(k)", "A decaying step size", "A worst-case statement"],
          right: ["A nonconvex loss curve", "A saddle with a tiny gradient", "Validation next to training"],
        },
        "Instantiate one worst-case expression",
        [
          "Take the illustration bound 5 divided by the square root of k. At k = 1 it equals 5.",
          "At k = 100 it equals 0.5. At k = 10000 it equals 0.05.",
          "A training curve that reads 2.0, then 0.8, then 0.3 by step 100 beat this illustration. That is allowed. A bound is not a tight description of one easy problem. A gradient norm of 0.0005 with loss still at 0.4 only says the first-order test is small.",
        ],
        [
          {
            prompt: "Using 5 divided by the square root of k, what is the bound at k = 100 and at k = 10000?",
            answer: "0.5 and 0.05.",
          },
          {
            prompt: "Training loss is 0.01 and validation loss is 0.4. What does a theorem about training gradient norms fail to tell you?",
            answer: "Whether the model predicts new points. The theorem and a tiny training gradient speak about the training objective. The gap of 0.39 is a generalization failure, and shrinking the step size does not correct it.",
          },
        ],
      ),
      lec(
        "l7",
        "Checks, decay, and schedules",
        [
          "Before a long run you check one backpropagated coordinate against a finite difference. Move that scalar weight by 1e-4 and divide the change in loss by 1e-4. If the loss rises by 2e-4, the quotient is 2. A backpropagated value of 2.0 agrees. A backpropagated value of 0.2 means the graph is wrong on that coordinate. No optimizer repairs a gradient that points the wrong way.",
          "Weight decay adds (lambda over 2) times the squared weight length, with lambda such as 1e-4. The extra gradient is lambda times the weight. At weight 3 that pull is 0.0003, small beside a data gradient of size 1 and large beside one of size 0.0001. Multiplying the step size by 0.1 after 5 stalled epochs is a second knob. You change one knob at a time, or the plot cannot tell you which change mattered.",
        ],
        {
          kind: "flow",
          caption: "Check one coordinate before the long run.",
          steps: [
            "Record the loss",
            "Perturb one weight by 1e-4",
            "Divide the loss change by 1e-4",
            "Compare with backpropagation",
          ],
        },
        "A check, then the decay term",
        [
          "The loss rises by 2e-4 when the weight rises by 1e-4. The quotient is 2. Backpropagation says 2. This coordinate passes.",
          "Separately, lambda is 1e-4 and the weight is 3. The extra gradient is 0.0003. The decay's own contribution to the loss is (1e-4 divided by 2) times 9, so 4.5e-4.",
          "If you add lambda divided by 2 times the weight, you add 0.00015 and you have implemented a different regularizer than the one you wrote down. Log the data term and the decay term separately.",
        ],
        [
          {
            prompt: "The loss rises by 2e-4 when one weight rises by 1e-4. What quotient do you compare with backpropagation?",
            answer: "2.",
          },
          {
            prompt: "Lambda is 1e-4 and the weight is 3. What extra gradient does weight decay add, and what does it add to the loss value?",
            answer: "The extra gradient is 0.0003. The loss contribution is 4.5e-4.",
          },
        ],
      ),
      lec(
        "l8",
        "The plot you owe",
        [
          "You can now take a gradient step, choose a step size that contracts a quadratic of curvature L, and replace the full gradient by a minibatch of 32. You can add momentum with a coefficient of 0.9, divide coordinates the way AdaGrad or Adam does, and state a 1 over square root of k bound when its assumptions hold. You can also check one backpropagated coordinate against a finite difference of size 1e-4.",
          "You can implement SGD, momentum, and Adam on one model and plot the loss against examples seen. That plot is the assignment. If momentum with beta 0.9 and the same step size diverges while SGD descends, the factor 10 is the first place you look. If Adam descends at base step 0.001 and diverges at 0.1, you have measured the base step the method did not choose for you.",
        ],
        {
          kind: "pipeline",
          caption: "The run you can now finish.",
          stages: [
            "Check one finite difference",
            "Train SGD, momentum, and Adam",
            "Plot loss against examples seen",
            "Read divergence off the step",
          ],
        },
        "Momentum on a noisy gradient",
        [
          "Plain SGD uses step size 0.01 on a batch gradient estimate of 4 from 32 examples. The step length is 0.04.",
          "Momentum with beta 0.9, once the velocity has reached equilibrium, multiplies that effective step by 10. The same step size and the same gradient estimate move you by 0.4.",
          "If that momentum curve oscillates, you cut the step size by about 10, down to 0.001, before you blame the minibatch noise. The finite-difference check should already have passed, or you are stepping on a bad gradient.",
        ],
        [
          {
            prompt: "Combine the momentum equilibrium with a stochastic step. The step size is 0.01, the batch gradient estimate is 4, and beta is 0.9 at equilibrium. How long is the effective step, and what step size restores a length of 0.04?",
            answer: "The effective step is 0.4, because equilibrium multiplies by 10. Restoring a length of 0.04 means dividing the step size by 10, so the step size is 0.001.",
          },
          {
            prompt: "A finite-difference quotient on one weight is 2, and backpropagation says 0.2. Adam then diverges. What do you fix first?",
            answer: "The gradient. The quotient 2 and the backpropagated 0.2 disagree by a factor of 10, so that coordinate is wrong. Changing Adam's base step does not repair a graph that points the wrong way.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-752",
    lectures: [
      lec(
        "l1",
        "Frames and rigid transforms",
        [
          "A frame is an origin and three orthogonal axes. You write a point as (1, 0, 0) in the sensor frame, and it is not that triple in the world until you apply the rigid transform. The transform is a rotation plus a translation. If the sensor origin sits at world (2, 0, 0) and the axes match, that point becomes (3, 0, 0). You apply the nearer frame first when you compose two transforms.",
          "You store the transform as a 4 by 4 matrix on homogeneous coordinates. A point ends in 1 and a direction ends in 0, so translation is multiplication and the last row stays 0 0 0 1. You invert the matrix to take a parent-frame point back into the child. A translation error of 0.02 meters biases every mapped point by that same 0.02 meters. You cannot average that bias away, because it is not noise.",
        ],
        {
          kind: "pipeline",
          caption: "Express one point in the world.",
          stages: [
            "Read sensor coordinates",
            "Apply the rotation",
            "Add the origin translation",
            "Attach the world frame",
          ],
        },
        "Aligned axes, a shifted origin",
        [
          "The sensor origin is at world (2, 0, 0), and the axes match the world axes. The point in the sensor frame is (1, 0, 0).",
          "World coordinates are (2, 0, 0) plus (1, 0, 0), so (3, 0, 0).",
          "Adding the translation twice reports (5, 0, 0), which is off by 2 meters. Composition is not a second copy of the same vector.",
        ],
        [
          {
            prompt: "What are the world coordinates of the sensor point (1, 0, 0) in the example?",
            answer: "(3, 0, 0).",
          },
          {
            prompt: "Every mapped point is biased by 0.02 meters along x, and the noise on each scan is about 0.001 meters. Why does averaging 100 scans not remove the bias?",
            answer: "The 0.02 meter shift is in the rigid transform, so it is common to every scan. Averaging shrinks the 0.001 meter noise. It does not remove an error that is the same each time.",
          },
        ],
      ),
      lec(
        "l2",
        "Forward and inverse kinematics",
        [
          "Forward kinematics multiplies one rigid transform per joint, from the base out to the tip. A planar arm with two links of length 1, at 0 degrees and 90 degrees, puts the tip at (1, 1) if 0 degrees points along x. A 6-joint arm is the same product with 6 factors. You evaluate that map with no solver. It is a function of joint numbers you already have.",
          "Inverse kinematics asks for joints that hit a desired pose. For this 2-link arm the target (1, 1) has 2 solutions, because the elbow can bend either way. A target at distance 3 is unreachable: two unit links stretch at most 2. You test that bound before you iterate. A numerical solver can settle on the nearer legal solution, and you cap it, for example at 50 steps, when the point is unreachable.",
        ],
        {
          kind: "layers",
          caption: "A planar two-link chain.",
          rows: [
            "Base frame",
            "Joint 1 then a unit link",
            "Joint 2 then a unit link",
            "End-effector pose",
          ],
        },
        "Two solutions, and one empty set",
        [
          "Links have length 1. Joints at 0 degrees and 90 degrees put the tip at (1, 1). The distance from the base is the square root of 2, about 1.414, which is under 2, so the point is reachable.",
          "The other solution uses 90 degrees and then -90 degrees. The first link ends at (0, 1). The second link then points along positive x and ends at (1, 1).",
          "The target (3, 0) is 3 from the base. No pair of unit-length links reaches it. Iteration does not create a configuration the geometry does not have.",
        ],
        [
          {
            prompt: "Where is the tip for joints 0 degrees and 90 degrees, and what other joint pair in the lecture hits the same point?",
            answer: "The tip is at (1, 1). The other pair is 90 degrees and -90 degrees.",
          },
          {
            prompt: "Why does a solver have no answer for the target (3, 0)?",
            answer: "Two links of length 1 reach at most 2. The target is 3 from the base, outside the workspace. No inverse solution exists.",
          },
        ],
      ),
      lec(
        "l3",
        "Jacobians and tip velocity",
        [
          "The Jacobian is the derivative of forward kinematics. For this planar arm it is 2 by 2 if you track the tip in x and y. You multiply it by joint rates in radians per second and get tip velocity in meters per second. At 0 degrees and 90 degrees, with unit links, the rows are (-1, -1) and (1, 0). A zero column would mean that joint does not move the tip at first order.",
          "A singular pose drops the rank, so some tip directions are instantaneously impossible. Both angles at 0 stretch the arm to (2, 0). The columns become parallel and the determinant is 0. You cannot produce a first-order velocity that lengthens the arm further. A damped solver adds about 0.01 on the diagonal before inverting, trading a few millimeters of error for a finite command. You do not invert a matrix whose determinant is 0.",
        ],
        {
          kind: "pair",
          caption: "A usable pose and a singular one.",
          leftTitle: "0 and 90 degrees",
          rightTitle: "Both angles 0",
          left: ["Determinant equals 1", "Second column is (-1, 0)", "Joint rate maps to tip speed"],
          right: ["Determinant equals 0", "Columns both point along y", "Radial velocity has no solution"],
        },
        "One joint rate",
        [
          "Use the Jacobian with rows (-1, -1) and (1, 0), at 0 degrees and 90 degrees.",
          "A joint rate of (0, 1) radian per second selects the second column.",
          "The tip velocity is (-1, 0) meters per second. The determinant of this matrix is 1, so the pose is not singular. The stretched pose, both angles 0, has determinant 0 and is a different question.",
        ],
        [
          {
            prompt: "At 0 degrees and 90 degrees, what tip velocity does the joint rate (0, 1) radian per second produce?",
            answer: "(-1, 0) meters per second, the second column of the Jacobian.",
          },
          {
            prompt: "Both joints are at 0 degrees. Why is a requested tip velocity of (1, 0) not achievable at first order?",
            answer: "The arm is fully stretched on the x axis and the determinant is 0. Both columns point along y, so first-order tip motion is vertical. A command along positive x has no solution. Damping can return a finite joint rate, and it will not produce that radial velocity exactly.",
          },
        ],
      ),
      lec(
        "l4",
        "Planning in free space",
        [
          "You search pose coordinates for a collision-free path. On a grid you mark occupied cells and run a shortest-path search. A 4-connected grid charges 1 per step and forbids diagonals, so 3 cells east and 4 north cost 7 when free. An 8-connected grid prices diagonals differently, and you must say which graph you built. The path stays on free cells. It does not cut a corner through an occupied cell.",
          "A random tree grows toward samples. You draw a configuration, find the nearest node, and step at most 0.5 meters, rejecting the step if it hits an obstacle. With 200 accepted nodes you often reach a goal a coarse grid missed, and the path is often longer than the grid optimum because the tree does not price cost the same way. The first feasible path is not a shortest path you should quote as optimal.",
        ],
        {
          kind: "flow",
          caption: "One tree expansion.",
          steps: [
            "Sample a configuration",
            "Find the nearest node",
            "Step at most 0.5 meters",
            "Add the node only if free",
          ],
        },
        "A blocked cell forces a detour",
        [
          "The grid is 4-connected. Start at (0, 0). The goal is (2, 0). The cell (1, 0) is blocked, so the straight graph path of length 2 is illegal.",
          "One free path is (0, 0), (0, 1), (1, 1), (2, 1), (2, 0). Its length is 4.",
          "The extra cost relative to the blocked straight path is 2. A tree that later returns a feasible path of length 6 has not contradicted this grid result. It answered a different question.",
        ],
        [
          {
            prompt: "What is the length of the detour through (0, 1), (1, 1), and (2, 1), and by how much does it exceed the blocked straight graph distance?",
            answer: "The detour has length 4. It exceeds 2 by 2.",
          },
          {
            prompt: "A random tree returns a feasible path of length 6 in this same world. Why is that not a counterexample to the grid path of length 4?",
            answer: "The tree returns a feasible path, not a shortest path. The 4-connected search optimized length and found 4. A longer feasible path can be a correct output of the tree.",
          },
        ],
      ),
      lec(
        "l5",
        "Calibration",
        [
          "Camera calibration recovers the map from a pixel to a ray. In a pinhole model, a point 2 meters in front of the camera that lands 200 pixels right of the principal point, with focal length 400 pixels, has lateral slope 200 divided by 400, so 0.5. You estimate focal length, principal point, and a few distortion coefficients from a known pattern, often 10 or more views of a checkerboard. One view leaves those parameters tangled with the unknown pose.",
          "Hand-eye calibration finds the rigid transform between the flange and a camera fixed on it. You record 8 flange poses and the camera view of a fixed board. The two motions are one physical motion written in two frames. A fit from only 2 poses is usually noisy. You report millimeters of residual on a pose you held out. Error of 1 millimeter on the 8 fits and 15 on a ninth pose means the solver memorized the set.",
        ],
        {
          kind: "pair",
          caption: "Two calibrations you do not mix up.",
          leftTitle: "Camera intrinsics",
          rightTitle: "Hand-eye transform",
          left: ["Focal length in pixels", "Principal point", "A few distortion coefficients"],
          right: ["Flange poses from the arm", "Camera poses from the board", "Residual on a held-out pose"],
        },
        "Pixels to a metric offset",
        [
          "Focal length is 400 pixels. The detection sits 200 pixels from the principal point. The ray slope is 200 divided by 400, so 0.5.",
          "At a depth of 2 meters the lateral position is 0.5 times 2, so 1 meter.",
          "A focal length of 800 pixels would turn the same 200 pixel offset into a slope of 0.25 and a lateral position of 0.5 meters at that depth. A factor-of-2 error in focal length doubles the metric position you report.",
        ],
        [
          {
            prompt: "Focal length 400, pixel offset 200, depth 2 meters. What lateral position do you reconstruct?",
            answer: "1 meter. The slope is 0.5, and 0.5 times 2 is 1.",
          },
          {
            prompt: "Hand-eye residual is 1 millimeter on the 8 fitting poses and 15 millimeters on a held-out pose. Which number do you trust as the calibration error?",
            answer: "The 15 millimeter held-out residual. The fitting poses are the data the solver matched. A small residual there does not measure a new pose.",
          },
        ],
      ),
      lec(
        "l6",
        "Stereo depth",
        [
          "A calibrated stereo pair recovers depth from disparity. With a baseline of 0.2 meters, a focal length of 400 pixels, and a disparity of 8 pixels, the depth is baseline times focal length divided by disparity, so 0.2 times 400 divided by 8, which is 10 meters. Doubling the disparity to 16 pixels halves the depth to 5 meters. After rectification you match along the epipolar line, a one-dimensional search rather than a search over the whole image.",
          "A fixed pixel mistake hurts more at long range. At disparity 8, a 1 pixel error uses disparity 9 and moves depth from 10 meters to 0.2 times 400 divided by 9, about 8.89 meters, a shift of about 1.11 meters. At disparity 40 the depth is 2 meters, and disparity 41 gives about 1.95 meters, a shift of about 0.05 meters. You do not quote one millimeter accuracy for the whole volume. The distant match is the weak one.",
        ],
        {
          kind: "pipeline",
          caption: "From a matched pair to a depth.",
          stages: [
            "Rectify the image pair",
            "Match along one row",
            "Read the disparity in pixels",
            "Divide baseline times focal length",
          ],
        },
        "One pixel, two ranges",
        [
          "Baseline 0.2 meters and focal length 400 pixels make the product 80. Disparity 8 gives depth 80 divided by 8, so 10 meters.",
          "Disparity 9 gives 80 divided by 9, about 8.89 meters. The absolute error is about 1.11 meters.",
          "Disparity 40 gives 2 meters. Disparity 41 gives 80 divided by 41, about 1.95 meters. The absolute error is about 0.05 meters. The same 1 pixel mistake is not the same metric mistake.",
        ],
        [
          {
            prompt: "Baseline 0.2 meters, focal length 400 pixels, disparity 8. What is the depth?",
            answer: "10 meters.",
          },
          {
            prompt: "A matcher is off by 1 pixel. At which disparity, 8 or 40, is the depth error larger, and about how many meters is each error?",
            answer: "Disparity 8 is worse, about 1.11 meters (10 versus about 8.89). Disparity 40 errs by about 0.05 meters (2 versus about 1.95).",
          },
        ],
      ),
      lec(
        "l7",
        "SLAM and navigation",
        [
          "You estimate pose and map together, because each depends on the other. A pose graph stores poses as nodes and motions or loop closures as edges. With 100 poses and 1 loop closure, that edge makes the drift observable. Odometry high by 0.01 meters on every step accumulates about 1 meter after 100 steps when the errors share a sign. The optimizer moves the nodes to cut the sum of squared edge errors.",
          "You then localize, plan on the free grid, and track the path. A local planner that looks only 2 meters ahead can dodge a new chair, and it can enter a dead end a global plan of 40 meters already rejected. You keep both. A pose whose uncertainty spans 3 meters is not exact enough when the doorway is only 1 meter wide.",
        ],
        {
          kind: "flow",
          caption: "From a loop edge to a path.",
          steps: [
            "Add the odometry edges",
            "Add the loop-closure edge",
            "Optimize the pose graph",
            "Plan on the resulting map",
          ],
        },
        "One meter of shared bias",
        [
          "Each true step is 1.00 meter. Each odometry edge reads 1.01 meters. After 100 steps the chain sums to 101 meters, while the truth is 100.",
          "A loop closure back to the start measures a relative pose near 0. The graph now contains a 1 meter disagreement.",
          "If the optimizer spreads that 1 meter evenly, each edge gives up 0.01 meter and the chain matches the closure. You still should not drive a mean pose through a 1 meter doorway when the pose uncertainty spans 3 meters.",
        ],
        [
          {
            prompt: "After 100 steps biased by 0.01 meter each, how far does the odometry chain say you traveled if each true step is 1 meter, and how large is the disagreement with a zero loop closure?",
            answer: "The chain sums to 101 meters. The disagreement with a return to the start is 1 meter.",
          },
          {
            prompt: "Why can a planner that only sees 2 meters ahead enter a dead end that a 40 meter global plan avoided?",
            answer: "The local window does not contain the trap if the failure sits beyond 2 meters. The global plan scored the whole 40 meter route and rejected it. Using only the local planner drops that information.",
          },
        ],
      ),
      lec(
        "l8",
        "A stack you can audit",
        [
          "You can now move a point between frames, multiply a two-link arm, and reject a target at distance 3 when the links reach only 2. You can read a tip velocity off a Jacobian, search a 4-connected grid, and grow a tree with a 0.5 meter step. You can turn a pixel offset and a focal length into a metric ray, turn a disparity into a depth, and pull a 1 meter odometry disagreement back with one loop closure.",
          "You can name the number that makes the stack fail. A transform bias of 0.02 meters is not scan noise. Stereo at disparity 8 moves about 1.11 meters if the match slips by 1 pixel, while disparity 40 moves about 0.05 meters. A pose uncertainty of 3 meters does not fit a doorway of 1 meter. The system you sketch is a calibrated sensor, a map, a plan, and a check that the uncertainty still fits the gap.",
        ],
        {
          kind: "pipeline",
          caption: "The navigation stack, with the check.",
          stages: [
            "Calibrate the sensor frame",
            "Build a map and close a loop",
            "Plan on an inflated grid",
            "Reject gaps inside the uncertainty",
          ],
        },
        "Depth error versus planner inflation",
        [
          "Baseline 0.2 meters, focal length 400 pixels, and disparity 8 put an obstacle at 10 meters. A 1 pixel slip moves that depth by about 1.11 meters, from the stereo lecture.",
          "The planner inflates obstacles by 0.3 meters. That radius is smaller than 1.11. A path that clears the nominal point by 0.3 meters can still hit the obstacle.",
          "You inflate by at least that depth error, or you refuse the far match. The grid cost is then computed on the inflated map. A transform bias of 0.02 meters is a separate error, and the pose-graph update does not cancel it.",
        ],
        [
          {
            prompt: "Combine stereo depth with planner inflation. Disparity 8 gives depth 10 meters, a 1 pixel mistake moves depth by about 1.11 meters, and inflation is 0.3 meters. Why is the clearance insufficient?",
            answer: "Inflation covers 0.3 meters, and the disparity error moves the obstacle by about 1.11 meters. A path that clears the nominal point by 0.3 meters can intersect the true obstacle. The inflation needs to be at least on the order of that depth error, or the far match should be refused.",
          },
          {
            prompt: "Combine frames and the loop closure. The sensor-to-base translation is wrong by 0.02 meters, and the pose graph sees a 1 meter odometry disagreement after 100 steps. Which error can the optimizer remove, and which remains?",
            answer: "The optimizer can spread the 1 meter odometry disagreement across the edges. The 0.02 meter sensor-to-base bias sits in the rigid transform outside those edges, so mapped points stay shifted by 0.02 meters.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-753",
    lectures: [
      lec(
        "l1",
        "The projective camera",
        [
          "A pinhole camera sends a point (X, Y, Z) to a pixel. With focal length f and principal point (cx, cy), you set u to f times X divided by Z, plus cx, and you do the same for Y. Take f = 500, principal point (320, 240), and the point (1, 0, 5). Then u is 420 and v is 240. Division by Z is why equal steps look smaller when they are farther away.",
          "You keep the ray and lose the distance. The points (1, 0, 5) and (2, 0, 10) share the ratio 0.2, so both hit one pixel. One image cannot tell 5 meters from 10 meters. You need a second view, a known size, or a range sensor. On a 640 by 480 image the principal point is near (320, 240) only if the sensor is centered. You measure that point rather than assuming it.",
        ],
        {
          kind: "pipeline",
          caption: "Pinhole projection drops the depth.",
          stages: [
            "Divide X and Y by Z",
            "Scale by the focal length",
            "Add the principal point",
            "Keep the pixel, lose the range",
          ],
        },
        "Two points, one pixel",
        [
          "Focal length 500 and principal point (320, 240). The point (1, 0, 5) projects to u = 100 plus 320, so 420, and v = 240.",
          "The point (2, 0, 10) has X divided by Z equal to 0.2 as well, so it projects to the same pixel (420, 240).",
          "The depth ratio is 2, and the lateral coordinate also doubled. That is why the pixel did not move. A single view recorded the ray, not a unique metric point.",
        ],
        [
          {
            prompt: "Where does (1, 0, 5) project, with focal length 500 and principal point (320, 240)?",
            answer: "(420, 240). The horizontal coordinate is 500 times 1 divided by 5, plus 320.",
          },
          {
            prompt: "Why can this image not decide between (1, 0, 5) and (2, 0, 10)?",
            answer: "Both points have X divided by Z equal to 0.2 and Y equal to 0, so both project to (420, 240). One view stores the ray, not a unique depth.",
          },
        ],
      ),
      lec(
        "l2",
        "Two views",
        [
          "Two cameras and a point give two rays that are coplanar with the baseline. After rectification the match lies on the same row. If one camera sees u = 420 and the other, shifted by 0.1 meters, sees u = 410, the disparity is 10 pixels. With focal length 500 the depth is 0.1 times 500 divided by 10, so 5 meters. You search that row, not all 640 by 480 pixels.",
          "The essential matrix stores rotation and translation direction, not metric scale. Baselines (0.1, 0, 0) and (0.2, 0, 0) give the same direction, because scaling the scene with the baseline does not change rays. You recover meters from a known length. Five correspondences are the calibrated minimum, and eight are the classical count for the fundamental matrix. Once matches are wrong, you need more than that minimum.",
        ],
        {
          kind: "pair",
          caption: "What a second camera adds.",
          leftTitle: "One view",
          rightTitle: "Two views",
          left: ["One ray per pixel", "Depth stays free", "Focal length and principal point"],
          right: ["Match on the epipolar line", "Disparity over a known baseline", "Depth from the two rays"],
        },
        "A 10 pixel shift along the row",
        [
          "Baseline 0.1 meters, focal length 500, disparity 10. Depth is 50 divided by 10, so 5 meters.",
          "If the second match is actually at a disparity of 20, the depth is 50 divided by 20, so 2.5 meters.",
          "A 10 pixel mistake along the row changed the depth by a factor of 2. The epipolar constraint told you which row to search. It did not guarantee the pixel you picked on that row.",
        ],
        [
          {
            prompt: "Baseline 0.1 meters, focal length 500, disparity 10. What is the depth?",
            answer: "5 meters. The product of baseline and focal length is 50, and 50 divided by 10 is 5.",
          },
          {
            prompt: "Why do the translations (0.1, 0, 0) and (0.2, 0, 0) give the same essential-matrix direction?",
            answer: "They are the same direction at two scales. Image rays do not change if you scale the scene and the baseline together, so the essential matrix does not store meters. You need a measured baseline or another known length.",
          },
        ],
      ),
      lec(
        "l3",
        "Estimating the camera",
        [
          "A 3 by 4 camera matrix has 12 entries up to scale, hence 11 degrees of freedom. Each 3D-to-2D correspondence gives you 2 equations, so 6 points are the classical minimum. Those 6 can be interpolated when there is no noise. With 20 points you solve a least-squares system. A mean residual of 0.3 pixels on the fitting points measures the fit, not a new view.",
          "You then split the matrix into intrinsics and extrinsics. Focal length should land near the number you expect, for example 500 pixels. A result of 50 pixels on an image 640 wide usually means the 3D units disagree with the point list. Radial distortion adds 2 coefficients, because a pure pinhole model leaves error that grows toward the corner. Residuals of 0.3 pixels at the center and 4 at the corner are that pattern.",
        ],
        {
          kind: "flow",
          caption: "Fit the matrix, then read the residual.",
          steps: [
            "Collect at least 6 known points",
            "Solve the linear camera matrix",
            "Split intrinsics and extrinsics",
            "Read the corner residual",
          ],
        },
        "Center versus corner",
        [
          "Six noiseless points can fix the 11-degree-of-freedom matrix. You add 14 more, for 20 points in all.",
          "The mean residual on the 20 is 0.4 pixels. Center points sit under 0.3 pixels. One corner point sits at 3 pixels.",
          "A two-coefficient distortion model brings that corner residual down to 0.5 pixels. The linear pinhole fit was not a broken solver. It was the wrong physical model at the edge of a 640-pixel image.",
        ],
        [
          {
            prompt: "How many known correspondences are the minimum for this 11-degree-of-freedom camera, and why is a zero residual on exactly that many not a confirmation?",
            answer: "Six. Each point supplies 2 equations, and six points cover the 11 degrees of freedom together with the homogeneous scale. A zero residual on those six points means the solver interpolated them. A seventh point is the check.",
          },
          {
            prompt: "The center residual is 0.3 pixels, the corner residual is 4 pixels, and the focal length comes out near 500. What should you add?",
            answer: "A radial distortion model, typically two coefficients. The focal length is already near 500, and the error grows toward the corner rather than sitting everywhere. A new focal length is not the first change.",
          },
        ],
      ),
      lec(
        "l4",
        "Features and matches",
        [
          "A detector picks repeatable points and a descriptor summarizes a window so you can match across views. A 16 by 16 window is 256 numbers. You compare by Euclidean distance, or by Hamming distance if each entry is a bit. Accept a match at nearest distance 20 and second distance 50, ratio 0.4, when your threshold is 0.8. The second neighbor stops a wall of identical bricks from matching every brick.",
          "A learned descriptor can replace that summary by 128 numbers, trained so a true match beats a false one by a margin such as 0.5. Your later tests do not change. You still threshold a ratio and still reject a match off the epipolar line. From 1000 detections you might keep 150 after the ratio test and 80 after the geometric check. The descriptor did not certify those 80. The geometry check did.",
        ],
        {
          kind: "pipeline",
          caption: "From a window to an inlier.",
          stages: [
            "Detect a repeatable point",
            "Build the descriptor",
            "Apply the ratio test",
            "Drop matches off the epipolar line",
          ],
        },
        "Two ratios",
        [
          "Nearest distance 20 and second nearest 50 give the ratio 20 divided by 50, so 0.4. A threshold of 0.8 accepts the match.",
          "Another point has distances 30 and 36. The ratio is 30 divided by 36, so 0.833, which fails 0.8. You discard it even though 30 is only modestly larger than 20.",
          "Of 150 matches that pass the ratio test, a single geometric model keeps 80 and drops 70. Those 70 agreed with a local distance test and disagreed with one global motion.",
        ],
        [
          {
            prompt: "Nearest distance 20, second nearest 50, threshold 0.8. Do you accept the match, and what is the ratio?",
            answer: "Yes. The ratio is 0.4, which is below 0.8.",
          },
          {
            prompt: "Why can a nearest distance of 30 be rejected while a nearest distance of 20 is kept, aside from 30 being larger?",
            answer: "The test uses the ratio to the second nearest, not the raw distance alone. 30 divided by 36 is about 0.83 and fails 0.8, while 20 divided by 50 is 0.4 and passes. Repeated texture produces a small distance to several wrong windows, and the ratio is what catches that.",
          },
        ],
      ),
      lec(
        "l5",
        "Consensus under bad matches",
        [
          "You fit a model on a minimal subset and count how many points agree. A line needs 2 points. With 100 correspondences and inlier rate 0.5, one draw of 2 points is clean with probability 0.25. The chance a draw is dirty is 0.75. After 10 draws, the chance of no clean pair is about 0.056, so about 0.944 that at least one clean pair showed up.",
          "You then refit on every point inside the threshold, not only on the 2 that proposed the model. A gate of 2 pixels keeps a point whose error is at most 2. A gate of 20 pixels will treat outliers as inliers and pull the refit. If the best sample holds 60 of 100 points, you refit those 60. The fraction you saw is 0.6, which can beat the 0.5 you assumed.",
        ],
        {
          kind: "flow",
          caption: "One consensus loop.",
          steps: [
            "Draw a minimal subset",
            "Fit the model",
            "Count points within 2 pixels",
            "Refit the largest consensus",
          ],
        },
        "Ten draws and a refit",
        [
          "Inlier probability per point is 0.5 and the sample size is 2, so one draw is clean with probability 0.25.",
          "The probability that all 10 draws are contaminated is about 0.056. The probability that at least one is clean is about 0.944.",
          "The best consensus holds 60 points. You refit on those 60. You do not refit on all 100, because the other 40 missed the 2 pixel test and would pull the model.",
        ],
        [
          {
            prompt: "If each point is an inlier with probability 0.5, what is the probability one draw of 2 points is clean, and about what is the probability that 10 draws include at least one clean draw?",
            answer: "0.25 for one draw. About 0.944 for ten draws, because the probability of missing every time is about 0.75 to the tenth, which is about 0.056.",
          },
          {
            prompt: "Why do you refit on the 60 inliers rather than on the original 2 points or on all 100?",
            answer: "The original 2 are only a minimal sample. All 100 include the 40 points outside the 2 pixel threshold, and those points pull the model. The refit uses the consensus set the threshold defined.",
          },
        ],
      ),
      lec(
        "l6",
        "Lidar points",
        [
          "A spinning lidar returns range at a known angle. A beam at 10 meters with sigma 0.02 meters is a 3D point once you apply the sensor frame. One turn with 1024 azimuth slots and 32 rows has 32768 possible returns. You drop max-range misses, often beyond 100 meters, before building a cloud. A max-range reading is not a surface you should keep.",
          "Point-to-plane registration pairs each point with a plane and cuts the distance to it. A 0.1 meter error along x can fall in one iteration when some plane constrains x. A corridor of parallel vertical planes does not constrain motion along the hall. That along-track error can stay near 0.1 meters for as many iterations as you run. You need geometry that breaks the symmetry, or a second sensor.",
        ],
        {
          kind: "layers",
          caption: "From beam slots to surface points.",
          rows: [
            "Angle plus a range",
            "Drop max-range misses",
            "Transform into the world",
            "Keep the surface returns",
          ],
        },
        "A corridor that does not lock",
        [
          "There are 32768 beam slots, and 2000 of them are max-range. You keep 30768 surface returns.",
          "In a room with a floor and an end wall, point-to-plane pairs can pull an initial 0.1 meter error along x down, because the end wall constrains that axis.",
          "In a corridor with no end wall in view, the same iteration leaves the along-track error near 0.1 meters. The cost can still fall a little by sliding along the free direction. A falling cost is not a fully constrained solution.",
        ],
        [
          {
            prompt: "How many surface returns do you keep if 2000 of 32768 slots are max-range?",
            answer: "30768.",
          },
          {
            prompt: "Why can the point-to-plane cost fall in a corridor while the along-track error stays near 0.1 meters?",
            answer: "The visible planes do not constrain motion along the corridor. Sliding on that axis barely changes point-to-plane distance, so the cost can look fine while that coordinate is still wrong by about 0.1 meters. You need geometry that breaks the symmetry.",
          },
        ],
      ),
      lec(
        "l7",
        "Visual and lidar SLAM",
        [
          "Visual SLAM tracks features and estimates poses and points together. You keep a keyframe after motion of about 0.2 meters or 10 degrees, so you skip a near-duplicate view. Bundle adjustment sums squared reprojection error. A miss of 3 pixels contributes 9. If 200 keyframes are too slow, you optimize a window of the last 5.",
          "Lidar SLAM uses a point-to-plane residual in meters and adds a pose-graph edge when a loop closes. A 0.4 meter loop residual is what makes 0.4 meters of drift observable. Low texture can drop your visual inliers from 80 to 5, and a bare corridor can leave lidar free along one axis. You drop the modality whose count collapsed. Averaging a 5-inlier pose with a good one gives the weak pose a vote it did not earn.",
        ],
        {
          kind: "pair",
          caption: "Two residuals, two units.",
          leftTitle: "Visual SLAM",
          rightTitle: "Lidar SLAM",
          left: ["Feature tracks across frames", "Squared error in pixels", "A keyframe every 0.2 meters"],
          right: ["Point-to-plane pairs", "Residual in meters", "Loop edges on the pose graph"],
        },
        "Pixels and meters stay separate",
        [
          "Ten points, each 3 pixels off, contribute 10 times 9, so 90, to the visual sum of squares. After adjustment, if each error is 1 pixel, the contribution is 10.",
          "A lidar loop residual of 0.4 meters is a different unit. You add it as a pose-graph edge. You do not add 0.4 to the pixel sum without a scale you declared.",
          "On the newest frame the visual inlier count is 5, down from 80. You drop the visual relative-pose edge for that frame and keep the lidar edge.",
        ],
        [
          {
            prompt: "Ten points each have a reprojection error of 3 pixels. What do they add to the sum of squares, and what do they add after each error falls to 1 pixel?",
            answer: "90 before, because 10 times 9 is 90. Afterward the contribution is 10, because each squared error is 1.",
          },
          {
            prompt: "Why is averaging a visual pose fit to 5 inliers with a lidar pose a poor fusion rule here?",
            answer: "The visual pose was fit to 5 matches, down from a typical 80, so that front end is starved. An average gives it the same vote as a lidar pose that still has geometry. The rule is to drop the modality whose inlier count collapsed.",
          },
        ],
      ),
      lec(
        "l8",
        "Residuals you can name",
        [
          "You can project a point with a focal length and a principal point, and you can say why one view leaves a ray. You can recover depth from disparity and a baseline, count 11 degrees of freedom in a camera matrix, and accept a match with a ratio threshold of 0.8. You can draw a minimal sample, keep on the order of 30000 lidar returns, and name a residual in pixels or in meters.",
          "You can put two-view depth and a mapping residual in one argument. Baseline 0.1 meters and disparity 10 pixels pin a depth of 5 meters, only as good as inliers inside a 2 pixel gate. A pixel sum of squares will ignore a lidar axis the planes do not lock, unless you ask which coordinate is actually constrained. The system you can audit is a projection, a set of inliers, and a residual whose units you can name.",
        ],
        {
          kind: "flow",
          caption: "Audit a metric point before you use it.",
          steps: [
            "Name the projection model",
            "Keep the inliers inside the gate",
            "Attach a residual with units",
            "Refuse an unconstrained axis",
          ],
        },
        "A disparity gate is a depth gap",
        [
          "Baseline 0.1 meters and focal length 500 give the product 50. Disparity 10 means depth 5 meters. That match was kept by a consensus gate of 2 pixels.",
          "A disparity of 12, still inside a slip of 2 pixels, gives depth 50 divided by 12, about 4.17 meters. The difference from 5 is about 0.83 meters.",
          "You should report that depth gap with the 5 meters. The image ray from the first lecture still cannot separate two points on its own. A lidar range along the same ray is what supplies the meters.",
        ],
        [
          {
            prompt: "Combine the two-view depth formula with the consensus gate. Baseline 0.1 meters, focal length 500, disparity 10, and a 2 pixel gate. What depth does disparity 10 give, and what depth does disparity 12 give?",
            answer: "Disparity 10 gives 5 meters. Disparity 12 gives 50 divided by 12, about 4.17 meters. The gate that accepted the match already allows a depth shift of about 0.83 meters.",
          },
          {
            prompt: "Combine one-view projection with a lidar range. The image cannot separate (1, 0, 5) from (2, 0, 10), and a lidar return along that ray reads 5.1 meters. What metric point do you report, and what did the image still supply?",
            answer: "You place the point on the camera ray at the lidar range. The ray has X divided by Z equal to 0.2, so at 5.1 meters the point is about (1.02, 0, 5.1). The image supplied the ray direction. The lidar supplied the metric depth one view did not have.",
          },
        ],
      ),
    ],
  },
];
