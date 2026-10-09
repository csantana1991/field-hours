import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-624",
    lectures: [
      lec(
        "l1",
        "Resample the ink before you compare",
        [
          "You do not classify the raw sensor stream. A stroke arrives as samples of x, y, and time, and a slow writer can emit 200 points where a fast writer emits 40. You resample by arc length to a fixed list of 64 points so both marks share a length. Spacing by time would treat a pause as a long side. Spacing by distance does not.",
          "You then subtract the centroid so the cloud sits on the origin, and you scale the bounding box to a square of side 1. A circle 80 pixels across and a circle 20 pixels across then occupy the same frame. Leave rotation alone for now: an upward arrow and a rightward arrow are different lists until a later search tries angles. Keep the 64 time stamps in a side array, because shape and speed are different evidence.",
        ],
        {
          kind: "pipeline",
          caption: "Ink normalized before any score.",
          stages: ["Sample x, y, t", "Resample to 64", "Center on the centroid", "Scale the box to 1"],
        },
        "A pause must not become an edge",
        [
          "Four samples arrive at times 0, 10, 20, and 500 milliseconds. The last gap is 480 milliseconds of waiting, not a long side of the mark.",
          "Arc-length resampling to 4 points spaces those points by distance. The 480 millisecond gap does not stretch the shape.",
          "You still store the times 0, 10, 20, and 500 beside the 4 points. A later speed feature can see the pause that the shape channel dropped.",
        ],
        [
          {
            prompt: "Two writers draw the same square. One sensor emits 40 points and the other emits 200. Why is the raw list a bad feature vector?",
            answer: "The lengths differ, so you cannot pair coordinates. Resampling both strokes to 64 points by arc length makes the vectors the same length without treating a pause as extra shape.",
          },
          {
            prompt: "You scale by the bounding box before you remove one outlier 30 pixels off the stroke. What goes wrong?",
            answer: "The outlier sets the box, so the real stroke shrinks inside the unit square. Drop or repair that point, then center and scale. A bad box warps every later distance.",
          },
        ],
      ),
      lec(
        "l2",
        "Features you can check by hand",
        [
          "You compress the 64-point stroke into a few numbers a person can audit. Divide the straight distance from the first point to the last by the path length. A closed box lands near 0, and a straight stroke lands near 1. Count a corner wherever the turning angle exceeds 45 degrees. A rectangle often shows 4 corners, and a clean circle shows 0. These checks are not the whole recognizer.",
          "You also store the box aspect, width divided by height, and the mean absolute turn over the 64 samples. An ellipse twice as wide as it is tall has aspect 2. Use the features as a gate before any template distance. If you asked for a circle and you already counted 4 corners, you can reject the stroke in one test. A gate on 4 corners will also reject a sloppy circle, so you fit the cutoff on labeled ink.",
        ],
        {
          kind: "layers",
          caption: "Four numbers you can recompute.",
          rows: ["Closedness near 0 or 1", "Corners past 45 degrees", "Box width over height", "Mean absolute turn"],
        },
        "One rectangle, counted by hand",
        [
          "The path length is 40 and the gap from the first point to the last is 2. Closedness is 2 divided by 40, so 0.05, under a cutoff of 0.1, so you call the stroke closed.",
          "Interior turning angles are 10, 80, 20, and 85 degrees. With a threshold of 45 degrees you count 2 corners from this list, at 80 and at 85.",
          "The box is 30 pixels wide and 15 tall, so the aspect is 2. A circle gate that requires 0 corners and aspect near 1 rejects this stroke before any template runs.",
        ],
        [
          {
            prompt: "Path length 40, start-to-end gap 2, cutoff 0.1. Is the stroke closed, and what is the ratio?",
            answer: "Yes. The ratio is 2 divided by 40, which is 0.05, and 0.05 is under 0.1.",
          },
          {
            prompt: "Why fit the corner cutoff on labeled ink instead of leaving it at 45 degrees forever?",
            answer: "A gate at 4 corners also rejects a sloppy circle that really is a circle. The cutoff is part of the recognizer, so you choose it on strokes whose labels you already know.",
          },
        ],
      ),
      lec(
        "l3",
        "A geometric template distance",
        [
          "You score a candidate against each template only after both strokes are resampled to 64 points, centered, and scaled to the unit square. The geometric method first rotates by the indicative angle, the direction from the centroid to the first point, which removes most of the rotation in one step. A leftover error of a few degrees is reduced by golden-section search over an interval of plus or minus 45 degrees, using about 8 probes.",
          "The path distance is the mean Euclidean gap between the 64 paired points. Divide that mean by half the diagonal of the unit square, about 0.707, and subtract the result from 1 to get a score. A perfect overlay scores 1. You label the stroke with the template class whose score is highest. If the best score on your held-out set sits under 0.75, return reject rather than a forced name.",
        ],
        {
          kind: "flow",
          caption: "Ordered match after one rotation.",
          steps: [
            "Resample, center, and scale",
            "Rotate by the indicative angle",
            "Search a 45 degree interval",
            "Keep the best score above 0.75",
          ],
        },
        "Four points, then a score",
        [
          "After scaling, the template and the candidate are paired. The four Euclidean gaps are 0, 0, 0, and 4. The mean gap is 1.",
          "Half the diagonal of the unit square is about 0.707. The normalized distance is 1 divided by 0.707, about 1.41, which already exceeds 1.",
          "You subtract that from 1 only when the normalized distance is below 1. Here the score would be negative, so you clamp it at 0 and this template loses. A perfect overlay, mean gap 0, scores 1.",
        ],
        [
          {
            prompt: "The mean point gap is 0 and the half diagonal is about 0.707. What score do you report?",
            answer: "1. The normalized distance is 0, and 1 minus 0 is 1. That is a perfect overlay.",
          },
          {
            prompt: "The best template scores 0.70 and your reject threshold is 0.75. What do you return, and why not the nearest class anyway?",
            answer: "Reject. A forced label below 0.75 is a guess. The threshold is the rule you set so a poor overlay does not receive a name.",
          },
        ],
      ),
      lec(
        "l4",
        "Clouds when stroke order wanders",
        [
          "A symbol made of several strokes does not have a stable order. One writer draws the crossbar of a T second, and another draws it first. You drop order: resample each stroke, join the samples into one cloud of 32 points, and match that cloud to a template cloud. Direction dies with order. A clockwise trace and a counterclockwise trace can land on the same 32 points.",
          "Greedy matching is not the ordered geometric distance. For each of the 32 candidate points you claim the nearest template point that is still free, add the Euclidean cost, and move on. The sum divided by 32 is the cloud distance. You pay when two classes share a silhouette but not a path, such as arrows with opposite heads. Then keep an ordered score too, and let a margin of 0.1 decide which one you trust.",
        ],
        {
          kind: "pair",
          caption: "Order is information you sometimes drop.",
          leftTitle: "Ordered path",
          rightTitle: "Point cloud",
          left: ["64 paired points", "Direction is kept", "Stroke order matters"],
          right: ["32 greedy pairs", "Direction is dropped", "Order may vary"],
        },
        "A three-point greedy match",
        [
          "The candidate points must match unused template points. Costs from the first candidate are 1 to template A and 4 to template B. You take A.",
          "The second candidate sees only B, at cost 2. The third sees the last template at cost 3. The sum is 1 plus 2 plus 3, so 6.",
          "Divide by 3 points, not by 32, in this toy: the cloud distance is 2. On the real recognizer you divide the sum by 32. A second class with sum 3 would win.",
        ],
        [
          {
            prompt: "In the three-point toy the costs are 1, 2, and 3. What is the cloud distance?",
            answer: "2. The sum is 6 and you divide by 3 points.",
          },
          {
            prompt: "Two arrow classes share a silhouette but the heads point opposite ways. Why is the cloud score not enough?",
            answer: "Greedy matching ignores path direction, so both arrows can land on the same 32 points. You keep an ordered score beside the cloud score and let a margin of 0.1 decide which distance you trust.",
          },
        ],
      ),
      lec(
        "l5",
        "Speed and pauses as evidence",
        [
          "Speed is what the geometric normalizer throws away when it resamples by arc length. Between raw samples you divide distance by the time gap. A flick and a careful trace can share a shape and still differ by a factor of 4 in median speed. Count a pause when a gap exceeds 150 milliseconds. A tap is one short stroke, high speed, and 0 pauses. A box drawn while thinking may show 2 pauses at corners.",
          "Keep timing as its own score. Build a histogram of 4 speed bins and normalize so the bins sum to 1. The sum of absolute bin differences is 0 on a match and at most 2 if the histograms are disjoint. If the best geometric score and the runner-up differ by less than 0.05, you may let the timing distance break the tie. Do not add that distance to a geometric score: the units differ.",
        ],
        {
          kind: "pipeline",
          caption: "Timing stays in its own units.",
          stages: ["Measure each time gap", "Fill 4 speed bins", "Normalize the bins to 1", "Compare histograms"],
        },
        "One pause and one speed",
        [
          "Successive gaps are 20, 20, 20, and 200 milliseconds. The pause threshold is 150, so you count 1 pause, the last gap.",
          "The first segment covers 10 pixels in 20 milliseconds, so the speed is 0.5 pixels per millisecond. That value falls in one of the 4 bins.",
          "Two normalized histograms differ by absolute amounts 0.1, 0.1, 0.0, and 0.2. The timing distance is 0.4. You do not add 0.4 to a geometric score near 0.9.",
        ],
        [
          {
            prompt: "Gaps are 20, 20, 20, and 200 milliseconds, and the pause cutoff is 150. How many pauses do you count?",
            answer: "1. Only the gap of 200 exceeds 150.",
          },
          {
            prompt: "Geometric scores are 0.91 and 0.88. May timing break the tie, and may you add the raw timing distance to 0.91?",
            answer: "Timing may break the tie, because the geometric margin is 0.03, which is under 0.05. You still may not add the raw timing distance to 0.91. The units differ, so you compare the histograms on their own scale.",
          },
        ],
      ),
      lec(
        "l6",
        "A grid of pixels beside the path",
        [
          "Some marks are easier as pixels than as paths. You paint the centered stroke on a 24 by 24 grid, 576 cells, and turn a cell on if any point lands in it. A thin stroke might light 40 cells, so the density is 40 divided by 576. A cell stores no stroke id, so order among 2 strokes is already gone. A wide pen changes the density, and you should fix the pen width before you compare grids.",
          "You can score two grids by Hamming distance, the count of cells that disagree. Identical grids score 0. Missing a bar of 10 cells costs at least 10. At 24 by 24, a hook under one cell vanishes, so do not let pixels be your only vote. Keep the ordered geometric score next to the Hamming count, and normalize later: a distance of 10 on 576 cells is not a similarity of 10.",
        ],
        {
          kind: "pair",
          caption: "A path and a picture see different mistakes.",
          leftTitle: "Ordered path",
          rightTitle: "24 by 24 grid",
          left: ["Keeps a small hook", "Uses point order", "Score near 1 is good"],
          right: ["Drops a sub-cell hook", "Forgets stroke order", "Hamming 0 is perfect"],
        },
        "Forty cells on, ten cells off",
        [
          "The grid has 576 cells and the stroke lights 40 of them. Density is 40 divided by 576, about 0.069.",
          "A template disagrees on 10 cells. The Hamming distance is 10, not 10 divided by anything yet.",
          "The mapped similarity is 1 minus 10 divided by 576, about 0.983. You may compare that number with a geometric score. You may not compare the raw 10 with a score that already lives near 1.",
        ],
        [
          {
            prompt: "576 cells, 40 lit. What is the density as a fraction?",
            answer: "40 divided by 576, which is 5 divided by 72, about 0.069.",
          },
          {
            prompt: "Hamming distance is 10 on 576 cells. Why is 10 not the similarity you add to a geometric score?",
            answer: "A geometric score already sits near 1, and 10 is a count of cells. Map it first: 1 minus 10 divided by 576, about 0.983. Then the units match.",
          },
        ],
      ),
      lec(
        "l7",
        "Three scores, one decision",
        [
          "You now hold three numbers: a geometric similarity, a timing distance, and a pixel Hamming count. They are not in one unit, so you map each onto 0 to 1 before any sum. A Hamming count h on 576 cells becomes 1 minus h divided by 576. A timing distance you have capped at 2 becomes 1 minus that distance divided by 2. A weighted sum can then use weights 0.5, 0.3, and 0.2.",
          "You fit those three weights on 50 labeled strokes per class by counting mistakes, not by preference. After the weights are fixed, reject a decision when the top two class totals differ by less than 0.05. Also reject when the winner itself is under 0.6. The first test catches a tie between circle and oval. The second catches a scribble that matches no class. Store the rejects: they are the next 10 templates you should add.",
        ],
        {
          kind: "flow",
          caption: "Map, weight, then maybe reject.",
          steps: [
            "Map each score onto 0 to 1",
            "Apply weights 0.5, 0.3, 0.2",
            "Reject a margin under 0.05",
            "Reject a winner under 0.6",
          ],
        },
        "One weighted total",
        [
          "Mapped scores are geometric 0.80, timing 0.50, and pixel 0.70. Weights are 0.5, 0.3, and 0.2.",
          "The products are 0.40, 0.15, and 0.14. The total is 0.69.",
          "A runner-up total of 0.66 differs by 0.03, which is under 0.05, so you reject even though 0.69 clears 0.6. Both tests have to pass.",
        ],
        [
          {
            prompt: "Mapped scores 0.80, 0.50, and 0.70 with weights 0.5, 0.3, and 0.2. What is the total?",
            answer: "0.69. The products are 0.40, 0.15, and 0.14.",
          },
          {
            prompt: "The top totals are 0.69 and 0.66. The winner is above 0.6. Do you label the stroke?",
            answer: "No. The margin is 0.03, under 0.05, so the tie test rejects. Clearing 0.6 is not enough by itself.",
          },
        ],
      ),
      lec(
        "l8",
        "A recognizer you can defend",
        [
          "You can now take a raw stroke, resample it to 64 points, score ordered templates, score a 4-bin speed histogram, paint a 24 by 24 grid, and combine the three mapped scores with weights fit on 50 strokes per class. You can refuse the label when the top two totals differ by less than 0.05. That is a recognizer you can implement and inspect one stage at a time. It does not promise that every symbol family separates.",
          "What you still owe is a count on ink you did not tune on. Hold out 20 strokes per class, run the full stack, and tally errors by stage. If circles and ovals collide in the ordered distance, add the aspect feature from the second lecture and refit only the weights. If pauses separate a gesture from a shape, let the timing term cast the deciding vote. You should be able to name the stage that caused a given miss.",
        ],
        {
          kind: "layers",
          caption: "The stack you can point at.",
          rows: ["64 resampled points", "Three mapped scores", "Weights from 50 strokes", "Reject or emit a label"],
        },
        "Shape ties, timing does not",
        [
          "Both the circle class and the gesture class have geometric score 0.90. Timing scores are 0.20 for the circle and 0.80 for the gesture.",
          "With equal weights 0.5 and 0.5, the circle total is 0.55 and the gesture total is 0.85.",
          "The gesture wins by 0.30. The margin is above 0.05, and 0.85 is above 0.6, so you emit the gesture label. Geometry alone could not have chosen.",
        ],
        [
          {
            prompt: "Hold out 20 strokes per class and 4 of the circle strokes are labeled oval. Where do you look first?",
            answer: "The ordered geometric stage, because circles and ovals collide there. Add the aspect feature and refit only the weights. Do not retune on these 20 strokes and then quote them as a test.",
          },
          {
            prompt: "Combine the geometric score and the timing score. Both classes score 0.90 on geometry. Timing is 0.20 and 0.80. Weights are 0.5 and 0.5. Which class wins, and by how much?",
            answer: "The gesture class. Its total is 0.85 and the circle total is 0.55, so the margin is 0.30. You emit the gesture label because the margin clears 0.05 and the winner clears 0.6.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-630",
    lectures: [
      lec(
        "l1",
        "The source and the vocal-tract filter",
        [
          "You model a vowel as a source passed through a filter. The source for voiced sound is a pulse train, often near 120 hertz for one speaker and 200 for another. The vocal tract is the filter: it boosts some harmonics and cuts others, and those peaks are the formants. Change the filter and you change the vowel. Change the pulse rate from 120 to 150 and you change the pitch, not the vowel.",
          "An unvoiced sound has no pulse train. You replace the source with noise and keep a filter, which is how a fricative differs from a vowel at the same mouth shape. A whisper is the same move: drop the pulses, keep the formants. In a toy synth you can emit 120 impulses in one second, or noise, and pass either through the same 2 formant peaks. If the peaks stay put, the vowel identity stays put.",
        ],
        {
          kind: "pair",
          caption: "Pitch and vowel are different knobs.",
          leftTitle: "Source",
          rightTitle: "Filter",
          left: ["Pulses near 120 hertz", "Or noise, for unvoiced", "Sets the pitch"],
          right: ["Formant peaks", "Same peaks, same vowel", "Mouth shape, not rate"],
        },
        "Harmonics of a 100 hertz source",
        [
          "A pulse train at 100 hertz has energy at 100, 200, 300, and 400 hertz, the integer multiples.",
          "A filter peak near 300 hertz boosts the third harmonic and leaves the 100 hertz line weaker. That pattern is the vowel.",
          "Move the pulse rate to 125 hertz and the lines sit at 125, 250, 375, and 500. If the peak stays near 300, the vowel is the one you kept and the pitch is the one you changed.",
        ],
        [
          {
            prompt: "You raise the pulse rate from 120 hertz to 150 and leave the formant peaks fixed. What changed?",
            answer: "The pitch. The vowel is the filter. A new pulse rate moves the harmonics and does not by itself move the formants.",
          },
          {
            prompt: "A whisper keeps the same 2 formant peaks but replaces 120 impulses per second with noise. Which sound class did you leave, and which did you keep?",
            answer: "You left voiced speech, because the pulse train is gone. You kept the vowel identity, because the filter peaks stayed put.",
          },
        ],
      ),
      lec(
        "l2",
        "What the ear groups together",
        [
          "You do not hear a spectrum as a flat list of bins. The ear groups frequencies into critical bands that widen as you go up: near 500 hertz a band is about 100 hertz wide, and near 4000 hertz it is wider. Masking follows those bands. A loud tone can hide a quieter neighbor inside the same band and leave a tone two bands away easy to hear. A feature built on linear bins fights that grouping.",
          "The mel scale is a practical map of that widening. You space filter centers linearly below about 1000 hertz and logarithmically above it, then put a triangle filter on each center. With 26 filters you cover a speech band from 0 to 8000 hertz at a 16 kilohertz sample rate. Energy in one triangle is one number. A loud bin outside the triangle contributes 0, which is the model of masking you are building, not a picture of the cochlea.",
        ],
        {
          kind: "pipeline",
          caption: "From linear bins to one band energy.",
          stages: ["Start from hertz bins", "Place 26 triangles", "Weight bins inside each", "Sum energy per triangle"],
        },
        "Two bins, one triangle",
        [
          "A triangle peaks at 1000 hertz and hits 0 at 800 and at 1200. A bin at 1000 has weight 1. A bin at 1400 has weight 0.",
          "Bin energies are 4 at 1000 hertz and 10 at 1400. The triangle output is 1 times 4 plus 0 times 10, so 4.",
          "The loud bin did not mask its way into this channel, because it sits outside the triangle. A second triangle centered near 1400 would be the place that 10 belongs.",
        ],
        [
          {
            prompt: "Triangle weights are 1 and 0 on bin energies 4 and 10. What energy does this channel report?",
            answer: "4. The bin of energy 10 has weight 0, so it adds nothing.",
          },
          {
            prompt: "Why space the 26 filters linearly below about 1000 hertz and more widely above it?",
            answer: "Critical bands are narrower near 500 hertz, about 100 hertz, and wider near 4000. The mel spacing is a practical map of that widening, not a uniform grid of bins.",
          },
        ],
      ),
      lec(
        "l3",
        "Frames, hops, and a window",
        [
          "A spectrum of a whole sentence mixes every vowel into one smear. You cut the wave into short frames so the tract stays nearly fixed inside each one. A common choice is a window of 25 milliseconds and a hop of 10 milliseconds. At 16 kilohertz the window holds 400 samples and the hop holds 160. You multiply the 400 samples by a Hamming window so the frame edges fade, which keeps the abrupt cut from inventing fake high frequencies.",
          "Count the frames before you train anything. One second at 16 kilohertz is 16000 samples. The first frame uses samples 0 through 399. Each hop moves 160 samples. The last legal start is 16000 minus 400, which is 15600, and 15600 divided by 160 is 97.5. You can start a frame only at whole hops, so there are 97 hops after the first frame, and 98 frames in all. A file one sample shorter can drop that last frame.",
        ],
        {
          kind: "flow",
          caption: "How one second becomes 98 frames.",
          steps: [
            "Take a 400-sample window",
            "Hop forward 160 samples",
            "Stop at start index 15600",
            "Count 98 legal frames",
          ],
        },
        "Frame count for one second",
        [
          "The sample rate is 16 kilohertz, so 1 second is 16000 samples. The window is 400 samples and the hop is 160.",
          "The last start index is 16000 minus 400, so 15600. Dividing 15600 by 160 gives 97.5, and a start index must be a whole number of hops.",
          "You get the first frame plus 97 later starts, which is 98 frames. A file of 15999 samples cannot host that last start, so it can have 97 frames instead.",
        ],
        [
          {
            prompt: "At 16 kilohertz, with a 400-sample window and a 160-sample hop, how many frames are in 1 second?",
            answer: "98. The last legal start is 15600, 15600 divided by 160 is 97.5, and only 97 whole hops fit after the first frame.",
          },
          {
            prompt: "Why multiply the 400 samples by a Hamming window instead of cutting the wave with a hard edge?",
            answer: "A hard cut invents high frequencies that were not in the tract. The Hamming window fades the frame edges so the spectrum you measure is closer to the short-time vowel.",
          },
        ],
      ),
      lec(
        "l4",
        "A mel bank and a cepstrum",
        [
          "Inside one frame you build a mel spectrum, then compress it. Take the power in each of 26 triangles, add a floor of 1e-10 so you never take a log of 0, and take the log. The log turns a multiplicative tilt of the spectrum into a shift you can subtract later. You then apply a discrete cosine transform and keep the first 13 coefficients. Those 13 numbers are the cepstral vector for that frame.",
          "You append how the vector is moving. Subtract the previous frame's 13 coefficients from the next frame's and divide by 2 hops, which is a delta. Do that again on the deltas to get a delta-delta. Stacking static, delta, and delta-delta yields 39 numbers per frame. A static vector cannot tell a rising formant from a falling one. The deltas can, at the price of 2 extra frames of context at each edge, where you may repeat the end frame.",
        ],
        {
          kind: "layers",
          caption: "From filter energies to 39 numbers.",
          rows: ["26 log filter energies", "13 cosine coefficients", "13 deltas", "13 delta-deltas"],
        },
        "A two-sided difference",
        [
          "One cepstral coordinate is 1.0 on the previous frame and 1.4 on the next frame. The central frame is the one you are labeling.",
          "The delta is (1.4 minus 1.0) divided by 2, so 0.2. You do not use the central value in this particular difference.",
          "Stacking 13 static values, 13 deltas, and 13 delta-deltas yields 39 numbers. At the first frame you have no previous frame, so you repeat the end value rather than inventing a slope of 0 without saying so.",
        ],
        [
          {
            prompt: "Previous value 1.0, next value 1.4. What is the delta if you divide the difference by 2?",
            answer: "0.2. The difference is 0.4, and 0.4 divided by 2 is 0.2.",
          },
          {
            prompt: "Why keep 39 numbers instead of the 13 static cepstra alone?",
            answer: "The static 13 cannot tell a rising formant from a falling one. Deltas and delta-deltas add that motion, at the cost of 2 frames of context at each edge.",
          },
        ],
      ),
      lec(
        "l5",
        "A hidden chain for a phone",
        [
          "A phone is not one frame. You model it as a small chain of hidden states, often 3 states for a phone, and each state emits a feature vector with some density. Transitions between states carry probabilities that sum to 1. A left-to-right chain lets you stay in a state, which stretches the phone in time, or move forward. You do not observe the state. You observe the 39-dimensional frame and must infer the path.",
          "Viterbi keeps the best path into each state at each frame. You multiply incoming score, transition, and emission, or add logs so the product does not hit 0. At the last of 98 frames you take the max score and walk the stored backpointers. A path that stays in one of 3 states for every frame is legal in a left-to-right chain only if self-loops exist. That walk is the recognized state sequence.",
        ],
        {
          kind: "flow",
          caption: "Viterbi keeps one best path per state.",
          steps: [
            "Multiply transition and emission",
            "Keep the best incoming path",
            "Store a backpointer",
            "Walk back from the last frame",
          ],
        },
        "Two states at frame 2",
        [
          "Start probabilities are 0.5 and 0.5. Frame-1 emissions are 0.5 for A and 0.2 for B, so the scores are 0.25 and 0.10.",
          "Transitions: A to A is 0.6, A to B is 0.4, B to A is 0.4, B to B is 0.6. Frame-2 emissions are 0.4 for A and 0.5 for B.",
          "Into A, the path from A scores 0.25 times 0.6 times 0.4, so 0.06, and the path from B scores 0.10 times 0.4 times 0.4, so 0.016. Into B, the path from A scores 0.05 and the path from B scores 0.03. You pick A with score 0.06. The path is A then A.",
        ],
        [
          {
            prompt: "Using the worked transitions and emissions, what is the best score at frame 2, and which state has it?",
            answer: "State A with score 0.06. The competing path into B scores 0.05. The backpointer for A is A, so the path is A then A.",
          },
          {
            prompt: "A phone has 3 states and no self-loop. What is the longest frame sequence that phone can cover?",
            answer: "3 frames. Without a self-loop a left-to-right chain cannot stay, so it cannot stretch past one frame per state.",
          },
        ],
      ),
      lec(
        "l6",
        "A network that scores frames",
        [
          "A neural acoustic model replaces the emission table with a network. You feed 40 log mel bins, plus 2 frames on each side. For a single frame that is 5 times 40, or 200 inputs. The network ends in a softmax over the phone set. If you have 40 phones, the output is 40 probabilities that sum to 1. You train it to put mass on the labeled phone for that frame.",
          "Cross entropy falls when the probability on the correct phone rises. Between two models on the same frame, you prefer the one that assigns 3/4 to the correct phone over the one that assigns 1/2. The hidden chain can stay: the network supplies the emission, and Viterbi still multiplies by transitions. A 3-state phone needs 3 outputs, or you tie them and share 1. A language model can still veto a word the acoustics liked.",
        ],
        {
          kind: "pipeline",
          caption: "Frames in, phone probabilities out.",
          stages: ["Stack 5 frames of 40", "Run the network", "Softmax over 40 phones", "Hand scores to Viterbi"],
        },
        "Two models, one correct phone",
        [
          "Model 1 puts probability 1/2 on the labeled phone. Model 2 puts 3/4 on that same phone. The other probability mass is spread over the remaining phones and sums with these to 1.",
          "Cross entropy uses the negative log of the correct probability. Because 3/4 is larger than 1/2, model 2 has the smaller loss on this frame.",
          "You still multiply the chosen probability by a transition inside Viterbi. An acoustic 3/4 on the wrong word can lose to a word sequence the language model scores higher.",
        ],
        [
          {
            prompt: "One model assigns 1/2 to the correct phone and another assigns 3/4. Which has the lower cross entropy on that frame?",
            answer: "The model that assigns 3/4. Cross entropy falls as the probability on the correct phone rises.",
          },
          {
            prompt: "The acoustic model likes a word and the language model calls that word impossible. Which score is allowed to veto?",
            answer: "The language model can veto the word. Acoustic probability alone is not the recognizer. Viterbi still multiplies emissions by transitions, and the language model scores the word sequence.",
          },
        ],
      ),
      lec(
        "l7",
        "Change duration without changing the vowel",
        [
          "Synthesis runs the source-filter model forward. You place 100 impulses in one second and pass them through the vowel filters. For 125 hertz you place 125 impulses and leave those filters fixed. The vowel should not move. To stretch time, repeat a frame for 2 hops instead of 1 so duration doubles while pitch stays near 100 hertz. Pitch and vowel are separate controls, and you should not move both when you meant one.",
          "Modification of a recorded utterance uses the same split. You mark pitch periods, about 160 samples apart at 16 kilohertz if the pitch is 100 hertz, because 16000 divided by 100 is 160. Overlap-add can then repeat or drop periods. Dropping every other period raises the perceived rate, but if you also resample the wave by 2 you changed duration and pitch together. Say which of the two you intended before you touch the samples.",
        ],
        {
          kind: "pair",
          caption: "Two edits that are not the same.",
          leftTitle: "Pitch only",
          rightTitle: "Duration only",
          left: ["100 impulses become 125", "Filters stay fixed", "Vowel should not move"],
          right: ["Use a frame for 2 hops", "Impulse rate stays", "Local time doubles"],
        },
        "One frame, two hops",
        [
          "The hop is 10 milliseconds and the pitch is 100 hertz, so a one-second vowel would hold 100 impulses and about 98 analysis frames.",
          "You repeat one vowel frame so it is used for 2 hops, 20 milliseconds, instead of 1 hop. Local duration doubles.",
          "The impulse spacing inside the frame stays at 160 samples, which is 100 hertz at 16 kilohertz. The vowel filters are untouched. You changed time, not pitch.",
        ],
        [
          {
            prompt: "At 16 kilohertz and 100 hertz pitch, how many samples apart are the pitch marks?",
            answer: "160. You divide 16000 samples per second by 100 impulses per second.",
          },
          {
            prompt: "You resample the whole wave by 2 and also drop every other pitch period. Why is that a confused edit?",
            answer: "Resampling by 2 changes duration and pitch together. Dropping periods is a separate rate change. You have moved both knobs, so you cannot tell which one produced the vowel you hear.",
          },
        ],
      ),
      lec(
        "l8",
        "A front end you can trace",
        [
          "You can now build a front end and say what each stage did. From one second at 16 kilohertz you cut about 98 frames, map each through 26 mel filters to 13 cepstra, and stack deltas to 39. You can score a phone chain with Viterbi or replace the emission with a softmax over 40 phones. You can place 100 impulses through a fixed filter to hold a vowel, or repeat a frame across 2 hops to stretch time.",
          "You still owe a count, not a spectrogram you liked. On 20 held-out seconds, count frames where the argmax phone is wrong, and count words the best Viterbi path gets wrong. If frames are wrong but words are right, the language model is hiding a weak acoustic score. If both are high, look at the 98-frame count and the 39-vector before you add layers. You should be able to change pitch by moving only the impulse rate.",
        ],
        {
          kind: "layers",
          caption: "The path from a wave to a score.",
          rows: ["98 frames from one second", "13 cepstra, or 39 with motion", "Viterbi or a 40-way softmax", "A count of frame errors"],
        },
        "How many numbers one second holds",
        [
          "One second at the settings above is 98 frames. Each frame, with deltas, is 39 coefficients.",
          "The matrix holds 98 times 39 numbers. That product is 3822.",
          "If you had kept only the 13 static cepstra, the matrix would be 98 times 13, which is 1274. The extra 2548 numbers are the deltas and delta-deltas, 2 times 1274. You should know which matrix you handed to the recognizer.",
        ],
        [
          {
            prompt: "On 20 held-out seconds the frame error is high and the word error is low. What is covering the acoustic mistakes?",
            answer: "The language model. It can pick a likely word even when many frame posteriors are wrong. Look at the acoustic scores before you add more layers.",
          },
          {
            prompt: "Combine framing and cepstra. One second is 98 frames of 39 coefficients. How many numbers is that, and why is it not 98 times 13?",
            answer: "3822. The 13 static cepstra are stacked with 13 deltas and 13 delta-deltas, so each frame is 39 numbers, and 98 times 39 is 3822. The static-only matrix would be 1274.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-631",
    lectures: [
      lec(
        "l1",
        "The function from percepts to acts",
        [
          "You define an agent by sensors, actions, and a performance measure. Take a vacuum on 2 squares. The percept is the square it occupies and whether that square is dirty. The actions are left, right, and suck. Performance can be 10 points for each clean square minus 1 point per action. An agent function maps the whole percept sequence to the next action. The full table of sequences is infinite, so you will not store it.",
          "You store a program, not the infinite table. On 2 squares a reflex rule is enough: if the square is dirty, suck, else move to the other square. That rule needs 0 bits of memory and still cleans both squares. With 3 squares, each extra move costs 1 against a 10-point bonus. Write that measure before you keep the rule. You should be able to name a percept on which the rule acts and the points that action changes.",
        ],
        {
          kind: "pipeline",
          caption: "A claim you can score.",
          stages: ["Name the percept", "Choose an action", "Apply the measure", "Read the new percept"],
        },
        "Two squares, one suck",
        [
          "Both squares start dirty. The vacuum is on the left. The rule sucks. That square is now clean, and the action cost 1 point.",
          "The left square is clean, so the next action moves right. Cost is another 1. The right square is dirty, so the third action sucks.",
          "You collected 10 points for each of 2 squares, minus 3 actions, so 17. A program that sucks the clean left square again would spend another 1 and collect nothing new.",
        ],
        [
          {
            prompt: "Both squares get cleaned and the agent used 3 actions, each worth minus 1, with 10 points per clean square. What is the score?",
            answer: "17. Two squares contribute 20, and 3 actions subtract 3.",
          },
          {
            prompt: "Why not store the agent function as a table of every percept sequence?",
            answer: "The table is infinite, because sequences can be arbitrarily long. You store a program that implements the sequences you care about, such as the 0-bit reflex rule on 2 squares.",
          },
        ],
      ),
      lec(
        "l2",
        "Reflex rules, then a model, then a goal",
        [
          "A reflex program reads only the current percept. On 2 squares, 4 rules cover location and dirt, and that is enough while everything relevant is visible. The other square's dirt is invisible, so you keep a model: 2 bits, one per square, updated when you suck or move. Clear a bit only for the square you are on. If you clear both bits after one suck, the next action is aimed at a map that is already false.",
          "A goal-based agent adds a test and a search, not just another rule. Suppose the goal is both squares clean. If you are on the left and only the right is dirty, left and suck fail, and right is the useful action. You can find that by trying sequences of length at most 2. The model tells you which outcomes exist. Without a model you probe the real world and pay 1 point per failed action.",
        ],
        {
          kind: "pair",
          caption: "What the agent is allowed to remember.",
          leftTitle: "Reflex only",
          rightTitle: "Model plus goal",
          left: ["Uses the current percept", "4 rules on 2 squares", "No memory of the other"],
          right: ["Stores 2 dirt bits", "Searches depth at most 2", "Pays 1 per real probe"],
        },
        "A false bit",
        [
          "The map says left dirty, right dirty. You are on the left and you suck. The correct update clears only the left bit.",
          "A bug clears both bits. The model now says both squares are clean, so the goal test succeeds and you stop.",
          "The right square is still dirty. You paid 1 point for the suck and missed the 10-point bonus on the right. The goal test answered the model, not the room.",
        ],
        [
          {
            prompt: "You suck the left square and your update clears both dirt bits. What does the goal test do, and why is it wrong?",
            answer: "It stops, because the model says both squares are clean. The right square is still dirty. Clear only the square you are on.",
          },
          {
            prompt: "You are on the left and only the right square is dirty. Which action of length 1 helps, and what does a failed real probe cost?",
            answer: "Right. Left and suck do not clean the dirty square. Each failed probe in the real room costs 1 point, which is why you would rather search the model.",
          },
        ],
      ),
      lec(
        "l3",
        "Expected utility when acts can fail",
        [
          "A true-or-false goal cannot rank two successful plans. You score outcomes with utilities and, when an action is random, you take expected utility: sum of probability times utility. A move that pays 5 with probability 0.8 and 0 with probability 0.2 has expected utility 4. A sure payoff of 3 loses to it. A sure payoff of 4.5 beats it. You use the probabilities in the model, not a story you tell after the roll.",
          "Expected utility is not a probability, and you should not threshold it at 0.5. The number 4 above is a payoff, not a chance. If you multiply every utility by 2, the move scores 8 and the sure 3 becomes 6, and the choice is unchanged. Add 10 to every utility and the choice is also unchanged. Squaring utilities can flip a risky move against a sure one, so you would be scoring a preference you did not write.",
        ],
        {
          kind: "flow",
          caption: "Expectation before you move.",
          steps: [
            "List each outcome",
            "Multiply probability by utility",
            "Sum over the outcomes",
            "Pick the larger expectation",
          ],
        },
        "Move versus a sure 3",
        [
          "The move yields 5 with probability 0.8 and 0 with probability 0.2. The products are 4 and 0.",
          "Expected utility is 4. The sure action yields 3. You take the move because 4 is greater than 3.",
          "A sure action of 4.5 beats the move. Multiplying every payoff by 2 turns these into 8 and 9, and the sure action still wins. The ranking survived a positive scale.",
        ],
        [
          {
            prompt: "A move pays 5 with probability 0.8 and 0 otherwise. A sure action pays 3. Which do you pick, and what are the two numbers?",
            answer: "The move. Its expected utility is 4, and 4 is greater than 3.",
          },
          {
            prompt: "Why is thresholding the expected utility at 0.5 the wrong test?",
            answer: "Expected utility is a payoff, not a probability. The value 4 is already larger than a sure 3, and it is not a chance of success. A threshold of 0.5 answers a different question than the one you wrote down.",
          },
        ],
      ),
      lec(
        "l4",
        "A loop that calls a tool",
        [
          "An agent that uses tools still has the same loop: percept, choice, action, new percept. The action may be a tool call rather than a motor command. You pass arguments, you read a result, and that result is the next percept. Allow at most 3 calls on one task so a confused agent cannot hammer a service. An error string is a percept. Do not resend the same arguments.",
          "Read the tool contract as part of the model. A search that returns at most 2 rows cannot finish a job that needs 5 facts inside one call. Your cap of 3 then allows at most 6 rows if every call succeeds. Log arguments and results for each call. When the run fails, you can see whether the fault was a bad argument, an empty result, or a goal test that ignored a row it already had.",
        ],
        {
          kind: "flow",
          caption: "Stop for a reason you logged.",
          steps: [
            "Send arguments",
            "Read the result or the error",
            "Test the goal",
            "Stop at 3 calls",
          ],
        },
        "Two calls, then a stop",
        [
          "The first call uses a bad id and returns an error string. That string is the next percept. You must change the argument.",
          "The second call returns 2 rows, which is the contract maximum. The goal test can see both rows and it passes.",
          "You do not make the third call. The log has 2 entries. If you had repeated the bad id, the cap of 3 would still stop you, but all 3 lines would be the same error.",
        ],
        [
          {
            prompt: "Each call returns at most 2 rows and you allow 3 calls. What is the most rows you can see if every call succeeds?",
            answer: "6. Three calls times 2 rows is 6. A job that needs more than 6 facts cannot finish inside this cap.",
          },
          {
            prompt: "The first call returns an error and the agent sends the same arguments again. What should it have done instead?",
            answer: "Treat the error string as a percept and change an argument, or stop. Resending the same arguments spends the cap of 3 on one mistake.",
          },
        ],
      ),
      lec(
        "l5",
        "Search as the agent's private plan",
        [
          "When the next action is not a table lookup, you search inside the model. With branching factor 2 and depth limit 3 you expand at most 15 nodes if states do not repeat: 1, then 2, then 4, then 8. That bound is why a depth limit belongs in the agent: an unbounded tree of tool calls or moves will not return. You test the goal when you generate a node, not after you have expanded everything.",
          "Repeats break the 15-node bound, because two paths into one square are counted twice. You store visited states and skip a repeat. The 2-square vacuum has location and 2 dirt bits: 2 times 4 states, so 8, and you can expand all of them. A tool agent is larger. Each new argument string is a new state, so the cap of 3 calls stays even after you add the visited set.",
        ],
        {
          kind: "layers",
          caption: "What keeps the search finite.",
          rows: ["Depth limit of 3", "Visited states skipped", "Goal test on generation", "Tool cap still at 3"],
        },
        "Fifteen nodes, then eight states",
        [
          "A tree with branching factor 2 and depth limit 3 has 1 root, 2 children, 4 grandchildren, and 8 leaves. The sum is 15.",
          "The vacuum state is one location bit and 2 dirt bits. Locations times dirt patterns is 2 times 4, so 8 distinct states.",
          "Once you store those 8, further actions that return to a known state are not expanded. The tree bound of 15 was for a tree without that set. The tool cap of 3 is a separate limit on calls, not on vacuum states.",
        ],
        [
          {
            prompt: "Branching factor 2, depth limit 3, no repeated states. What is the most nodes you expand?",
            answer: "15. The levels hold 1, 2, 4, and 8 nodes.",
          },
          {
            prompt: "Why does a visited set not replace the cap of 3 tool calls?",
            answer: "Each distinct argument string can be a new state, so the visited set need not stay small. The cap of 3 bounds calls even when the state space does not.",
          },
        ],
      ),
      lec(
        "l6",
        "Two agents and one shared door",
        [
          "Two agents can undo each other. Give 2 robots one door that holds 1. If both enter at time 0, each scores 0. A joint plan gives the door to A for 2 steps and to B after that, so B starts at step 2. You have to write that plan. Each robot, searching a model that omits the other, will still pick time 0.",
          "A reservation is a constraint: the sender owns the door for 2 steps, and the other agent marks those steps blocked. If both reserve at once, lowest id wins. With ids 1 and 2, robot 1 keeps the door and robot 2 waits. You put that tie break in the protocol. Omit it and both robots treat the door as theirs, which brings back the collision at time 0.",
        ],
        {
          kind: "pair",
          caption: "A private plan is not a joint plan.",
          leftTitle: "Each robot alone",
          rightTitle: "One reservation",
          left: ["Model omits the other", "Both pick time 0", "Each scores 0"],
          right: ["Owner holds 2 steps", "Lowest id wins a tie", "The other waits"],
        },
        "Ids 1 and 2 at the same instant",
        [
          "Both robots send a reservation at time 0. The door holds 1 robot. The protocol says the lowest id wins.",
          "Robot 1 has id 1 and robot 2 has id 2, so robot 1 owns the door for 2 steps. Robot 2 may start at step 2.",
          "If you delete the tie break, each robot marks the door as its own. Both enter at time 0 and each scores 0, which is the collision the message was supposed to prevent.",
        ],
        [
          {
            prompt: "Robots with ids 1 and 2 reserve the door at the same time. Who owns it, and for how long?",
            answer: "Robot 1, for 2 steps. The lowest id wins, and robot 2 waits until step 2.",
          },
          {
            prompt: "Each robot searches a model that does not contain the other. Why do they both arrive at time 0?",
            answer: "Nothing in either private model marks the door busy. A joint plan or a reservation has to put the other robot into the search, or both pick the same time.",
          },
        ],
      ),
      lec(
        "l7",
        "Messages that create commitments",
        [
          "A message is an action that updates what the other agent may assume. Stick to 4 types: request, agree, refuse, and inform. A request names an act and a deadline of 2 steps. Agree commits the sender to try before that deadline. You must not read silence as agree. After 2 quiet steps on a lossy link the reply is unknown, so you resend once or pick another partner.",
          "A commitment changes the search, not just the log. If A must free the door at step 2, a new reward of 5 for staying is not enough by itself. You may break the agree only if you priced the break. Put a penalty of 9 on a broken agree. Then 5 is worse than 9, and A leaves. Drop the penalty and the utility step will ignore the message you just taught the agent to send.",
        ],
        {
          kind: "pipeline",
          caption: "A message that binds a later search.",
          stages: ["Request with deadline 2", "Agree or refuse", "Search under the penalty", "Inform when done"],
        },
        "Five points against a penalty of nine",
        [
          "A agreed to free the door at step 2. A new local reward of 5 favors staying.",
          "The penalty for a broken agree is 9. Staying is worth 5 minus 9, so minus 4, if leaving is worth 0 and keeps the agreement.",
          "You pick leave, because 0 is greater than minus 4. Without the penalty of 9, the utility step sees only 5 and stays, contradicting the agree.",
        ],
        [
          {
            prompt: "No reply arrives for 2 steps on a lossy link. Is that an agree?",
            answer: "No. Silence is unknown, not yes. You resend once or pick another partner.",
          },
          {
            prompt: "Staying is worth 5 and breaking the agree costs 9. Leaving is worth 0. Which act do you pick, and what is the net of staying?",
            answer: "Leave. Staying nets 5 minus 9, which is minus 4, and 0 is greater than minus 4.",
          },
        ],
      ),
      lec(
        "l8",
        "An agent you can specify",
        [
          "You can now write an agent as percepts, actions, and a measure: 10 points for a clean square minus 1 per action. You use 4 reflex rules when the percept is enough, a 2-bit model when it is not, and expected utility when a move pays 5 only with probability 0.8. A tool call is just another action, capped at 3. A reservation and an agree message are how you stop 2 robots from taking 1 door at time 0.",
          "You should be able to point at which piece failed. If both robots still collide, check the tie break on ids 1 and 2 before you retrain anything. If a tool loop spins, check the cap of 3 and whether an error was fed back as a percept. If a risky move was chosen over a sure 4.5, recompute the expectation. If you cannot calculate the 2-square case by hand, a larger network will not make the agent clear.",
        ],
        {
          kind: "layers",
          caption: "Pieces you can check one at a time.",
          rows: ["A numeric measure", "Rules, model, or expectation", "Tools capped at 3 calls", "Messages with a tie break"],
        },
        "A sure 4.5 against a commitment",
        [
          "The risky move still has expected utility 4, from 0.8 times 5. A sure payoff of 4.5 beats it, so you do not take the move.",
          "Separately, robot A agreed to leave. Staying collects 5 and then pays the penalty 9, which is minus 4. Leaving is worth 0, so you leave.",
          "Those are two checks. 4 is less than 4.5, and minus 4 is less than 0. A log that shows the risky move or a stay failed the check that names that number.",
        ],
        [
          {
            prompt: "Both robots collide at time 0. What do you check before you replace the whole agent?",
            answer: "The tie break on ids 1 and 2, and whether each robot's model even contains the other. A missing reservation reproduces the collision without any change to the learning code.",
          },
          {
            prompt: "Combine the expectation and the agree penalty. The risky move has expectation 4 and loses to a sure payoff of 4.5. Staying after an agree collects 5 and then pays penalty 9, while leaving is worth 0. What is the net of staying, and which door act do you pick?",
            answer: "Staying nets minus 4, because 5 minus 9 is minus 4. You leave, because 0 is greater than minus 4. The sure payoff of 4.5 beats the risky move, and that comparison does not cancel the penalty on the door.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-635",
    lectures: [
      lec(
        "l1",
        "How far each wheel rolled",
        [
          "You track a differential-drive robot by what each wheel traveled, not by a single speed. Let the right wheel roll 1.2 meters and the left roll 1.0 meter, with the wheels 0.5 meters apart. The body center moves the average, (1.2 plus 1.0) divided by 2, which is 1.1 meters. The heading changes by (1.2 minus 1.0) divided by 0.5, which is 0.4 radians. Apply heading first, then translation, and convert that body step into the world frame.",
          "Wheel slip makes that 0.4 radian figure a prediction, not a measurement. Equal skids of 0.05 meters shift distance by 0.05 and leave heading error near 0. If they skid differently, heading absorbs (right skid minus left skid) divided by 0.5. You correct the prediction with a sensor later. For now, log both wheel distances and the pose you integrated. Do not hand that pose to a planner as if it were exact.",
        ],
        {
          kind: "flow",
          caption: "One body step from two wheel travels.",
          steps: [
            "Average the wheel travels",
            "Divide the difference by 0.5",
            "Rotate, then translate",
            "Write the pose in the world",
          ],
        },
        "1.1 meters and 0.4 radians",
        [
          "Right travel is 1.2 meters and left travel is 1.0 meter. The baseline is 0.5 meters.",
          "Center travel is (1.2 plus 1.0) divided by 2, so 1.1 meters. Heading change is (1.2 minus 1.0) divided by 0.5, so 0.4 radians.",
          "You apply the 0.4 radian turn first, then move 1.1 meters along the new heading. Equal skids of 0.05 meters would change the 1.1 and leave the 0.4 nearly alone.",
        ],
        [
          {
            prompt: "Right wheel 1.2 meters, left wheel 1.0 meter, baseline 0.5 meters. What are the center travel and the heading change?",
            answer: "1.1 meters and 0.4 radians. The center travel is the average of 1.2 and 1.0. The heading change is 0.2 divided by 0.5.",
          },
          {
            prompt: "Both wheels skid an extra 0.05 meters in the same direction. Which of the two outputs moves, and by how much?",
            answer: "The center travel moves by 0.05 meters. The heading change stays near 0.4 radians, because equal skids cancel in the difference.",
          },
        ],
      ),
      lec(
        "l2",
        "A grid of occupied and free",
        [
          "You keep an occupancy grid, not just a pose. A cell of 0.2 meters turns a 10 meter side into 50 cells. Store log odds as an integer that starts at 0. Add 1 on a hit and subtract 1 on a miss. The updates plus 1, minus 1, minus 1 leave the cell at minus 1, which you call free. Your planner may cross a cell still at 0 only if you allow it.",
          "A beam updates a whole ray, not one cell. Walk from the sensor out to the hit. Cells along the ray before the hit each get minus 1. The hit cell gets plus 1. A beam that travels 2 meters at 0.2 meters per cell crosses 10 cells: 9 free updates and 1 occupied update. You cap the ray at 4 meters, 20 cells, so a miss does not erase a wall.",
        ],
        {
          kind: "pipeline",
          caption: "One beam writes a ray of cells.",
          stages: ["Walk out to the hit", "Subtract 1 before the hit", "Add 1 on the hit cell", "Stop by 4 meters"],
        },
        "Ten cells along a 2 meter ray",
        [
          "The cell is 0.2 meters. A hit at 2 meters is 10 cells out.",
          "You subtract 1 from the first 9 cells and add 1 to the 10th. A cell that started at 0 and was only the hit ends at plus 1, occupied.",
          "A missed return must not walk past 4 meters. That cap is 20 cells. Without it you would mark free space through a wall you never saw.",
        ],
        [
          {
            prompt: "Start at 0 and apply plus 1, minus 1, minus 1. What is the cell, and do you call it free?",
            answer: "Minus 1, and yes, you call a negative cell free. Zero would have stayed unknown.",
          },
          {
            prompt: "A square room is 10 meters on a side and each cell is 0.2 meters. How many cells is that?",
            answer: "2500. Each side is 50 cells, and 50 times 50 is 2500.",
          },
        ],
      ),
      lec(
        "l3",
        "Particles that vote for a pose",
        [
          "Odometry drifts, so you keep many pose guesses. With 100 particles you move each one by the wheel update plus noise, then weight it by the sensor match at that pose. Resampling draws a new set of 100, with replacement, using the weights as probabilities. A particle whose weight is 0 is never drawn. If one particle holds half the weight, you expect about 50 copies of it.",
          "The sensor weight is a number you must define. On a grid, compare the beam's hit cell to the map. Give weight 3 if the map cell is occupied and the beam hit, weight 1 if both say free, and weight 0 if they disagree. You normalize weights 1, 3, and 6 by their sum, 10, before resampling. If every weight is 0, you reseed instead of dividing by 0.",
        ],
        {
          kind: "flow",
          caption: "Predict, weight, then resample.",
          steps: [
            "Move all 100 particles",
            "Weight each by the beam",
            "Normalize by the sum",
            "Draw 100 with replacement",
          ],
        },
        "Weights 1, 3, and 6",
        [
          "Three particles have unnormalized weights 1, 3, and 6. The sum is 10.",
          "Normalized weights are 0.1, 0.3, and 0.6. In a draw of 100 you expect about 10, 30, and 60 copies.",
          "A weight of 0 is never drawn. If every particle scores 0, you do not divide by the sum. You reseed.",
        ],
        [
          {
            prompt: "Unnormalized weights are 1, 3, and 6. What are the normalized weights?",
            answer: "0.1, 0.3, and 0.6. The sum is 10, and you divide each weight by 10.",
          },
          {
            prompt: "Every particle has sensor weight 0. What do you do, and why not normalize?",
            answer: "Reseed. The sum is 0, so dividing would be undefined. The map and the motion model disagree completely.",
          },
        ],
      ),
      lec(
        "l4",
        "A path with a cost and a guess",
        [
          "You plan on the same grid. A free cell links to 4 neighbors, and a step into a free cell costs 1. If you allow unknown cells, charge them 2 so the path prefers mapped free space. Rank the frontier by f, which is g plus h: g is cost so far, h is remaining guess. On 4-connected cells, Manhattan distance never overestimates. The first time you pop the goal, the path is optimal for those costs.",
          "An inadmissible h can make you expand the wrong cell and keep a longer path. If the true remaining cost is 3, an h of 5 is illegal, while an h of 3 is allowed. On a straight 4-connected hall, a cell 6 steps from the goal has Manhattan distance 6, not 4. You also block any cell with log odds above 0. A heuristic that walks through that occupied cell is scoring a graph you already forbade.",
        ],
        {
          kind: "pair",
          caption: "f is g plus a guess that must not lie high.",
          leftTitle: "Cost so far",
          rightTitle: "Guess of the rest",
          left: ["Free step costs 1", "Unknown step costs 2", "Occupied cells are blocked"],
          right: ["Manhattan on 4 links", "Never above the true cost", "h of 5 exceeds cost 3"],
        },
        "Expand the smaller f",
        [
          "Cell A has g of 4 and h of 3, so f is 7. Cell B has g of 5 and h of 1, so f is 6.",
          "You expand B first. The path through B is not yet known to be shorter in g alone. The ranking uses f.",
          "If h of A had been 5 while the true remainder was 3, that h is illegal for the optimality claim. Manhattan on a 6-step hall is 6, not 4.",
        ],
        [
          {
            prompt: "Cell A has g 4 and h 3. Cell B has g 5 and h 1. Which do you expand first, and what are the two f values?",
            answer: "B first. f(A) is 7 and f(B) is 6.",
          },
          {
            prompt: "The true remaining cost is 3 and your h is 5. Why can the first path you pop fail to be shortest?",
            answer: "h overestimates, so the optimality claim does not apply. An h of 3 would have been allowed. Manhattan distance on a 4-connected hall does not make this mistake.",
          },
        ],
      ),
      lec(
        "l5",
        "Layers that can suppress each other",
        [
          "Subsumption is a stack, not a plan. Give layer 1 the avoid behavior inside 0.4 meters, layer 2 a wander, and layer 3 a goal aim. Higher layers suppress lower ones for a cycle. A return at 0.3 meters lets layer 1 fire, and the aim toward a goal 2 meters away is dropped for that cycle. You get a quick flinch. You do not get the optimal grid path, and you should not claim that you did.",
          "A potential field is a second fast law. Attraction of strength 2 pulls toward the goal, and repulsion grows inside 0.4 meters. You command the direction of the sum. Attraction (2, 0) plus repulsion (-3, 0) sums to (-1, 0), so you step away from the goal. That local trap is why a field is not a planner. If the heading flips for more than 5 cycles, hand the problem to the grid search instead of raising the gain.",
        ],
        {
          kind: "layers",
          caption: "A higher layer can silence a lower one.",
          rows: ["Avoid inside 0.4 meters", "Wander when nothing is close", "Aim at a goal", "Grid search after 5 flips"],
        },
        "A flinch at 0.3 meters",
        [
          "The goal is 2 meters ahead. Layer 3 would aim at it. A sonar return is 0.3 meters, inside the 0.4 meter avoid band.",
          "Layer 1 fires and suppresses the aim for this cycle. The command is the flinch, not the goal heading.",
          "Attraction (2, 0) plus repulsion (-3, 0) is (-1, 0). You step away from the goal. If that heading flips for more than 5 cycles, you stop raising the gain and call the grid planner.",
        ],
        [
          {
            prompt: "The goal is 2 meters ahead and a return is 0.3 meters. Which layer's command do you send this cycle?",
            answer: "Layer 1, the avoid layer. 0.3 is inside 0.4, so it suppresses the goal aim for this cycle. The result is not the optimal grid path.",
          },
          {
            prompt: "Attraction is (2, 0) and repulsion is (-3, 0). Which way do you step, and why is that not a plan?",
            answer: "Toward (-1, 0), away from the goal. The sum is a local law. It can trap you, which is why a flip lasting more than 5 cycles should hand the problem to the grid search.",
          },
        ],
      ),
      lec(
        "l6",
        "A reward along a short path",
        [
          "A policy maps state to action and is trained on a reward you define, not on a layer diagram. Pay plus 10 for entering the goal and minus 1 for each action. The return of a trajectory is the sum. You keep the formula in one function so a change to the minus 1 is not buried in 3 call sites. You recompute a 4-action success as 6 before you trust a training curve.",
          "The state you feed the policy has to be something the robot can measure. Integrated pose drifts, so do not train on a perfect x and y the robot will not have. Prefer a local observation: 8 range bins, the log-odds of the cell ahead, and the goal angle binned into 4 quadrants. That is 8 plus 1 plus 4 channels of input if you one-hot the quadrant, which is 13 numbers.",
        ],
        {
          kind: "flow",
          caption: "The return is a sum you can recompute.",
          steps: [
            "Subtract 1 per action",
            "Add 10 at the goal",
            "Sum along the path",
            "Train only on measured state",
          ],
        },
        "Four actions, return 6",
        [
          "Each action costs 1. Entering the goal pays 10. A trajectory with 4 actions that arrives on the last action returns 10 minus 4.",
          "That return is 6. A trajectory with 12 actions returns 10 minus 12, which is minus 2.",
          "The learner that maximizes the sum prefers 6 over minus 2. If you forgot a crash penalty, the formula you wrote is still the whole task, and the policy will take the crash.",
        ],
        [
          {
            prompt: "The goal pays 10 and each action costs 1. What is the return of 4 actions that reach the goal?",
            answer: "6. You compute 10 minus 4.",
          },
          {
            prompt: "Why is a perfect x and y a bad training input if the robot only integrates wheel travel?",
            answer: "Wheel integration drifts, so the deployed robot will not see that perfect pose. Train on measurements it will have, such as 8 ranges, one log-odds cell, and 4 angle bins, 13 numbers in all.",
          },
        ],
      ),
      lec(
        "l7",
        "Beams that say which way is blocked",
        [
          "You turn sensors into the grid and the particle weights. In a toy lidar of 8 beams, a range under 0.5 meters blocks that direction. If 3 beams qualify, 3 directions are blocked and 5 are open. Do not steer into a blocked beam just because a cell last touched 20 cycles ago still says free. Write the new hit into the grid before the planner runs again. A mismatched beam must lower that particle's weight in the same cycle.",
          "A camera is not a range sensor. If you place an object 2 meters ahead on a ground plane, that is 10 cells of 0.2 meters, and a height error of 0.5 meters can move the cell. Add plus 1 for a vision hit and plus 3 for a lidar hit, so one camera frame does not outvote 3 lidar misses. You record which sensor added each increment. Otherwise a bad ground plane quietly rewrites the map the planner trusts.",
        ],
        {
          kind: "pipeline",
          caption: "A fresh beam outranks a stale cell.",
          stages: ["Read 8 ranges", "Block under 0.5 meters", "Write the grid", "Reweight particles"],
        },
        "Three beams, then a camera",
        [
          "Eight beams return. Three are under 0.5 meters, so 3 directions are blocked and 5 are open.",
          "You write those hits before planning. A cell last updated 20 cycles ago does not override a blocked beam.",
          "A camera hit adds 1. Three lidar misses add minus 1 each, so minus 3. The net is minus 2. One camera frame does not outvote those 3 misses. A lidar hit would have added 3, which is a different event.",
        ],
        [
          {
            prompt: "Of 8 beams, 3 are under 0.5 meters. How many directions are open?",
            answer: "5. Eight minus 3 is 5.",
          },
          {
            prompt: "A vision hit adds 1 and 3 lidar misses add minus 1 each. What is the net, and which sensor won?",
            answer: "The net is minus 2. The lidar misses win. One camera frame does not outvote 3 misses. You should also record which sensor wrote each increment.",
          },
        ],
      ),
      lec(
        "l8",
        "A robot that can explain a move",
        [
          "You can integrate a wheel step, update a 0.2 meter grid by plus 1 or minus 1, and resample 100 particles. You can search a 4-connected grid with Manhattan h, then let a beam inside 0.4 meters suppress that plan for one cycle. You can score 4 successful actions as 6 when the reward is plus 10 and minus 1. You should name which block emitted a bad command: odometry, map, particles, search, or policy.",
          "A closed check mixes two of those blocks. Predict the pose with the wheel model, weight 3 particles by the latest beam, and only then plan. Do not plan from a particle whose cell has log odds above 0. If the beam inside 0.4 meters and the plan disagree, the reflex layer wins for 1 cycle and you replan. You are done when you can run that audit on a 10 meter map and name the failing block.",
        ],
        {
          kind: "layers",
          caption: "Name the block that emitted the command.",
          rows: ["Wheel step to a pose", "Grid plus particles", "Plan or one-cycle flinch", "Reward you can recompute"],
        },
        "The heavy particle is occupied",
        [
          "Unnormalized weights 1, 3, and 6 normalize to 0.1, 0.3, and 0.6. The mode is the particle at 0.6.",
          "That particle's cell has log odds above 0, so it is occupied. You do not start the 4-connected search there.",
          "You resample or back up, then plan from a free cell. A beam inside 0.4 meters can still suppress the new plan for 1 cycle. The failure you name is the occupied start, not the heuristic.",
        ],
        [
          {
            prompt: "A bad command sent the robot into a wall. What do you name before you retrain the policy?",
            answer: "The block that emitted it: odometry, the map, the particles, the search, or the policy. A 4-action return of 6 does not tell you which block was wrong.",
          },
          {
            prompt: "Combine the particle weights with the planner. Weights 1, 3, and 6 normalize to 0.1, 0.3, and 0.6, and the 0.6 particle sits on log odds above 0. Do you start the search there?",
            answer: "No. The normalized weight 0.6 is the mode, but log odds above 0 means occupied. You resample or back up and plan from a free cell. The heuristic does not make an occupied cell legal.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-636",
    lectures: [
      lec(
        "l1",
        "A prediction, a target, and a loss",
        [
          "You predict with y equals w times x plus b and score the half square loss, one half times (y minus t) squared. That one half makes the derivative in y equal to (y minus t), not twice that. For row x equals 1 and t equals 1, w equals 0.5 and b equals 0 yield y equals 0.5. You may change w only because the loss falls. A fit on 1 row is not evidence about the next row.",
          "Bias is a weight on a constant input of 1. You can fold b into the same rule as w by appending a 1 to x. With two weights, a miss can be blamed on either coordinate, and the gradient tells you the split. If x is 0, the weight w gets gradient 0 and only b can move. Check x equals 0: w stays put, while b can still cut a loss of 0.125.",
        ],
        {
          kind: "flow",
          caption: "Prediction, then one scalar loss.",
          steps: [
            "Compute y from w and b",
            "Subtract the target",
            "Square and multiply by 1/2",
            "Keep the row for the next test",
          ],
        },
        "One row, loss 0.125",
        [
          "x is 1, w is 0.5, b is 0, and t is 1. Then y is 0.5 times 1 plus 0, so 0.5.",
          "The residual is 0.5 minus 1, so minus 0.5. Half of the square is 0.5 times 0.25, which is 0.125.",
          "That 0.125 is the number a later step is allowed to reduce. Fitting this single row does not tell you the loss on a second row.",
        ],
        [
          {
            prompt: "x is 1, w is 0.5, b is 0, and t is 1. What are y and the half square loss?",
            answer: "y is 0.5 and the loss is 0.125. The residual is minus 0.5, its square is 0.25, and half of that is 0.125.",
          },
          {
            prompt: "x is 0 and the loss is still wrong. Which parameter can move, and which gets gradient 0?",
            answer: "b can move, because bias is a weight on a constant input of 1. w gets gradient 0, since this input did not touch the loss.",
          },
        ],
      ),
      lec(
        "l2",
        "The derivative that names the blame",
        [
          "You fill the gradient one partial at a time. For half square loss, the partial of the loss in w is (y minus t) times x, and the partial in b is (y minus t) times 1. Compute y, then the residual, then multiply. On the row x equals 1, y equals 0.5, t equals 1, the residual is minus 0.5, so the w partial is minus 0.5 times 1. You read that sign before you step.",
          "Backpropagation is this multiplication on a bigger graph. If y goes through a second unit, you multiply by that unit's local derivative as you walk backward. A linear second unit with slope 2 multiplies every upstream partial by 2. You still start from the residual at the loss, which is one number, and you never differentiate the data. Write 0 into a partial to freeze that weight while a new block of 1 layer adapts.",
        ],
        {
          kind: "pipeline",
          caption: "Residual times the local factor.",
          stages: ["Form the residual", "Multiply by x for w", "Multiply by 1 for b", "Walk backward for more units"],
        },
        "A partial of minus 0.5",
        [
          "x is 1, y is 0.5, and t is 1. The residual y minus t is minus 0.5.",
          "The partial in w is (y minus t) times x, so minus 0.5 times 1, which is minus 0.5. The partial in b is minus 0.5 times 1, also minus 0.5.",
          "A second linear unit of slope 2 would multiply that upstream partial by 2, producing minus 1. You still do not differentiate x. x is data.",
        ],
        [
          {
            prompt: "y is 0.5, t is 1, and x is 1. What is the partial of the half square loss with respect to w?",
            answer: "Minus 0.5. The residual is minus 0.5, and you multiply by x, which is 1.",
          },
          {
            prompt: "A second linear unit has slope 2. What does backpropagation multiply the upstream partial by?",
            answer: "2. You multiply by the local derivative as you walk backward, and you still start from the residual at the loss.",
          },
        ],
      ),
      lec(
        "l3",
        "One parameter step, then another",
        [
          "You step each weight by minus the learning rate times its partial. Rate 0.1 and a w partial of minus 0.5 add 0.05 to w, so 0.5 becomes 0.55. The new y on x equals 1 is 0.55, the residual is minus 0.45, and the half square loss falls from 0.125 to 0.10125. A rate of 10 can raise the loss, so you test the rate on a batch of 32.",
          "Momentum stores a velocity. With coefficient 0.9, start at 0 and set velocity to 0.9 times 0 plus a partial of minus 0.5, so velocity is minus 0.5. You then subtract rate times velocity. At rate 0.1 the first step sends w from 0.5 to 0.55. The second step keeps part of that velocity, 0.9 times minus 0.5, and can move farther than the new partial alone. Try this on 1 weight before you trust it on a large net.",
        ],
        {
          kind: "flow",
          caption: "A step you recompute before the next one.",
          steps: [
            "Scale the partial by the rate",
            "Subtract from the weight",
            "Recompute y and the loss",
            "Reject a rate that raises it",
          ],
        },
        "From 0.5 to 0.55",
        [
          "The partial in w is minus 0.5 and the rate is 0.1. The update is minus the rate times the partial, so minus 0.1 times minus 0.5, which is plus 0.05.",
          "w moves from 0.5 to 0.55. On x equals 1 the new y is 0.55 and the residual is 0.55 minus 1, so minus 0.45.",
          "The new half square loss is 0.5 times 0.45 squared. 0.45 squared is 0.2025, and half of that is 0.10125. The loss fell from 0.125. A rate of 10 would add 5 to w instead and can raise the loss.",
        ],
        [
          {
            prompt: "w is 0.5, the partial is minus 0.5, and the rate is 0.1. What is the new w, and what is the new half square loss on x equals 1 with t equals 1?",
            answer: "w is 0.55 and the loss is 0.10125. The new prediction is 0.55, the residual is minus 0.45, and half of 0.2025 is 0.10125.",
          },
          {
            prompt: "Momentum coefficient 0.9, velocity starts at 0, partial is minus 0.5. What is the velocity on the first step, and does w land in a different place than plain descent at rate 0.1?",
            answer: "The velocity is minus 0.5. w still goes from 0.5 to 0.55. The first step matches plain descent. The carried term 0.9 times minus 0.5 shows up on the second step.",
          },
        ],
      ),
      lec(
        "l4",
        "A small kernel slid over a patch",
        [
          "Convolution shares one kernel across patches. You multiply kernel entries by the inputs under them and add. A 2 by 2 kernel on a 3 by 3 input, stride 1, no padding, yields a 2 by 2 map. You store 4 weights, not a separate weight for each of the 4 outputs. Use it when the same local pattern can appear anywhere in the 3 by 3 input.",
          "You backpropagate into the kernel by summing, over patches, the upstream residual times the input under that entry. One patch with residual 2 and input 3 contributes 6. A pattern seen in 1 of 4 patches still changes the detector used everywhere. Do not invent input when padding is 0. An edge output has fewer patches in the sum, and you must count them or the kernel gradient is scaled wrong.",
        ],
        {
          kind: "pair",
          caption: "One kernel, many patches, one update.",
          leftTitle: "Forward patch",
          rightTitle: "Kernel partial",
          left: ["Multiply, then add", "Output of this patch is 2", "4 weights, not 4 sets"],
          right: ["Residual times input", "One patch contributes 6", "Sum over every patch"],
        },
        "Products that sum to 2",
        [
          "The kernel, row by row, is 1, 0, 0, 1. The patch under it is 1, 2, 0, 1.",
          "The products are 1 times 1, 0 times 2, 0 times 0, and 1 times 1, so 1, 0, 0, and 1. The output is 2.",
          "Stride 1 and no padding on a 3 by 3 input give a 2 by 2 map. All 4 outputs share these 4 weights. A residual of 2 on a patch whose input under the first entry is 3 contributes 6 to that entry.",
        ],
        [
          {
            prompt: "Kernel 1, 0, 0, 1 on patch 1, 2, 0, 1. What is the output?",
            answer: "2. The products are 1, 0, 0, and 1.",
          },
          {
            prompt: "One patch has upstream residual 2 and the input under a kernel entry is 3. What does that patch add to the entry's partial?",
            answer: "6. You multiply residual by the input that touched the entry, then you still have to sum the other patches.",
          },
        ],
      ),
      lec(
        "l5",
        "A state carried to the next input",
        [
          "A recurrent state carries a summary forward. Use h equals 0.5 times the previous h plus the input, starting at 0. Inputs 1 then 1 give h equals 1 and then 1.5, so the older input survives at half strength. To train the 0.5 you walk backward through both steps, multiplying by 0.5 at each hop. Two hops contribute a factor of 0.25 to the older input's partial.",
          "A forget gate between 0 and 1 scales the old state before you add the new input. Gate 0 wipes h. Gate 1 copies it, so a distractor input of 9 stays out if the input gate is also 0. You now have 4 maps instead of 1, and you should still hand-check a sequence of length 2. A length of 40 is the same recurrence, not a new idea.",
        ],
        {
          kind: "flow",
          caption: "The older input is scaled at every hop.",
          steps: [
            "Start h at 0",
            "Scale h by 0.5",
            "Add the new input",
            "Multiply by 0.5 walking back",
          ],
        },
        "Two inputs, state 1.5",
        [
          "h starts at 0. The first input is 1, so h becomes 0.5 times 0 plus 1, which is 1.",
          "The second input is 1, so h becomes 0.5 times 1 plus 1, which is 1.5. The first input remains as 0.5 inside that sum.",
          "Backpropagation through both hops multiplies by 0.5 twice. The factor on the older input is 0.25. A forget gate of 0 would have wiped the 0.5 instead of keeping it.",
        ],
        [
          {
            prompt: "h starts at 0 and the multiplier is 0.5. Inputs are 1 then 1. What are the two states?",
            answer: "1, then 1.5. The second state is 0.5 times 1 plus 1.",
          },
          {
            prompt: "You walk backward through 2 hops that each multiply by 0.5. What factor reaches the older input?",
            answer: "0.25. Two factors of 0.5 multiply. That is why a chain of 20 steps can shrink an early gradient.",
          },
        ],
      ),
      lec(
        "l6",
        "Freeze most of the net, train the top",
        [
          "You freeze the first 4 layers by setting their rate to 0, and you train a new top layer at 0.1. Those frozen layers hold features from the old task. A top vector of 10 scores can still fit your labels. Unfreezing everything at 0.1 can wipe the features, since the new loss ignores the old task. After the top layer settles, a fine-tune at 0.01 lets the lower layers move a little without a large jump.",
          "After one batch of 16, the frozen block's partial norm should be 0, or you must skip its step. Computing a partial and still applying it is not freezing. The loss can fall while those weights drift. Compare one weight before and after a single step. If it moved, your rate-0 story is false. You only learn about adaptation when the 4 frozen layers stay unchanged and the top layer is the one that changed.",
        ],
        {
          kind: "pair",
          caption: "A frozen block is a claim you can falsify.",
          leftTitle: "Frozen 4 layers",
          rightTitle: "New top layer",
          left: ["Rate set to 0", "Weight identical after 1 step", "Partial norm 0, or skip"],
          right: ["Rate 0.1 at first", "10 class scores", "Later fine-tune at 0.01"],
        },
        "One weight that was supposed to sit still",
        [
          "You record a weight in layer 2. It is 1.25. The rate on the first 4 layers is supposed to be 0.",
          "After one step on a batch of 16 the weight is 1.27. It moved, so the freeze failed even if the training loss fell.",
          "The top layer of 10 scores is allowed to change at rate 0.1. A later fine-tune at 0.01 may move layer 2, but only after you meant to unfreeze it.",
        ],
        [
          {
            prompt: "A weight in a frozen layer goes from 1.25 to 1.27 in one step while the loss falls. Did the freeze work?",
            answer: "No. A frozen weight must stay put. A falling loss does not prove the rate was 0. Compare the weight before and after the step.",
          },
          {
            prompt: "Why fine-tune at 0.01 instead of unfreezing all 4 layers at the original rate 0.1?",
            answer: "Rate 0.1 can erase features the new loss does not care about. After the top layer of 10 scores has settled, 0.01 lets the lower layers move a little.",
          },
        ],
      ),
      lec(
        "l7",
        "The same loss on three kinds of input",
        [
          "A vision example can be 32 by 32, that is 1024 gray values, with 10 class scores at the top. A speech frame can be 40 log mel bins, or 200 numbers with 2 frames of context on each side. A control state can be 8 ranges plus 1 angle, with 3 command outputs. You train each with the same loss idea and a different tensor. Feeding the 40-bin frame into the vision kernel is not transfer.",
          "Speech and control need memory: a recurrent state, or a stack of 5 frames. A single picture often needs no recurrence if the label is that picture alone. You can freeze 4 vision layers and retrain a top of 10 scores. A control policy may have nothing to freeze and must learn from plus 10 and minus 1. If you have 100 labeled images and 0 labeled traces, do not pretend the same adaptation plan fits both.",
        ],
        {
          kind: "layers",
          caption: "Same training step, three shapes.",
          rows: ["1024 pixels, 10 scores", "40 bins, or 200 with context", "8 ranges plus 1 angle", "3 commands or a class"],
        },
        "200 speech inputs is not 1024 pixels",
        [
          "A vision tensor is 32 times 32, so 1024 values. A speech frame with 2 frames of context on each side is 5 times 40, so 200 values.",
          "You do not reshape 200 into 1024. The kernel was tied to the image grid. The shapes are different models.",
          "Control can be 8 ranges plus 1 angle, 9 numbers, with 3 outputs. If you have 100 labeled images and 0 labeled traces, only the vision top has a supervised set to adapt.",
        ],
        [
          {
            prompt: "A frame has 40 bins and you add 2 frames on each side. How many inputs is that, and why is it not a 32 by 32 image?",
            answer: "200. Five frames times 40 is 200. A 32 by 32 image is 1024 values, and a vision kernel is not a model of a 40-bin spectrum.",
          },
          {
            prompt: "You have 100 labeled images and 0 labeled wheel traces. Which adaptation plan is available?",
            answer: "Freeze 4 vision layers and retrain a top of 10 scores. There is no labeled trace set, so you cannot pretend the control policy has the same fine-tune.",
          },
        ],
      ),
      lec(
        "l8",
        "A training step you can audit",
        [
          "You can audit a training step by hand. From x equals 1 and w equals 0.5 you form y, the half square loss, and the partial in w. At rate 0.1 you move w to 0.55 when that partial is minus 0.5. You can share a 2 by 2 kernel, carry a state scaled by 0.5, and freeze 4 layers. A tensor of 40 bins does not belong in a 32 by 32 net.",
          "One check should combine the kernel and the step. Suppose a kernel entry of 1 sees input 3 and the upstream residual is 2, so its partial is 6. A rate of 0.1 moves that entry to 1 minus 0.6, which is 0.4. If you also froze that layer, the entry must stay 1. You are done when the kernel update and the freeze agree on that entry.",
        ],
        {
          kind: "flow",
          caption: "The same partial, two different updates.",
          steps: [
            "Partial is residual times input",
            "Here that product is 6",
            "Rate 0.1 moves 1 to 0.4",
            "A freeze leaves the entry at 1",
          ],
        },
        "Entry 1, partial 6, two outcomes",
        [
          "The kernel entry is 1. The input under it is 3 and the upstream residual is 2. The partial is 2 times 3, so 6.",
          "At rate 0.1 you subtract 0.1 times 6, which is 0.6. The entry becomes 1 minus 0.6, so 0.4.",
          "If the layer is one of the 4 frozen layers, you skip the step. The entry stays 1. A loss that fell does not override that check.",
        ],
        [
          {
            prompt: "x is 1, w is 0.5, the partial in w is minus 0.5, and the rate is 0.1. What is the updated w?",
            answer: "0.55. You add 0.05, which is minus the rate times a partial of minus 0.5.",
          },
          {
            prompt: "Combine the kernel gradient with a freeze. Entry 1 sees input 3, the residual is 2, and the rate is 0.1. What is the entry if you step, and what is it if the layer is frozen?",
            answer: "If you step, the partial is 6 and the entry becomes 0.4. If the layer is frozen, the entry stays 1. Both checks use the same partial.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-638",
    lectures: [
      lec(
        "l1",
        "Counts over a finite vocabulary",
        [
          "You choose tokens before any model. Split on spaces and lowercase, so the word with a capital and the same word without one share a type. If a type occurs fewer than 2 times, replace it with one unknown symbol. In a toy of 6 tokens where only one type repeats, you might keep 2 symbols: that type and unknown. Changing it later silently changes every count and every probability you compute on top.",
          "Map the kept types to ids 0 and 1, and store each sentence as a list of ids. Two sentences of length 6 and 4 need a pad id so the batch is rectangular. You mask pad in the loss. Forget the mask and the model spends updates predicting pad, which might be 2 positions out of 10. If id 0 decodes to the wrong word, every probability you print is about a different token than the one you named.",
        ],
        {
          kind: "pipeline",
          caption: "From a string to ids you can count.",
          stages: ["Split and lowercase", "Drop types seen once", "Map survivors to ids", "Mask the pad id"],
        },
        "Six tokens, two kept types",
        [
          "The toy line has 6 tokens. Only one type occurs at least twice. Every other type is replaced by the unknown symbol.",
          "You keep 2 symbols and assign ids 0 and 1. A second sentence of length 4 is padded to length 6, so 2 of 6 positions are pad.",
          "Those 2 pad positions must be masked in the loss. If you train on them, 2 of every 6 positions in this batch teach the model to emit pad.",
        ],
        [
          {
            prompt: "A type occurs once and your cutoff is 2. What do you replace it with?",
            answer: "The single unknown symbol. Types below 2 occurrences share that symbol, so the vocabulary does not grow a column for a hapax.",
          },
          {
            prompt: "A batch row has length 6 and 2 of the positions are pad. What happens if you forget the mask?",
            answer: "The model is trained to predict pad on those 2 positions. The loss is then partly about the pad id, not about the sentence.",
          },
        ],
      ),
      lec(
        "l2",
        "The probability of the next token",
        [
          "A unigram sets a token probability to its count divided by N. On the line the cat sat on the mat, N is 6 and the occurs 2 times, so its probability is 2/6, or 1/3. A bigram divides by the history count instead. The history the occurs 2 times, once before cat and once before mat, so each of those conditionals is 1/2. At the first position there is no history, and you fall back to the unigram.",
          "A bigram that never saw the pair at test time gets probability 0, and a whole sentence score, the product of the conditionals, becomes 0. Add-1 adds 1 to every bigram count and adds V, the vocabulary size, to every history count. If V is 4 and the history count is 2, a seen conditional that was 1/2 becomes 2/6, and an unseen one becomes 1/6. You should check they sum to 1.",
        ],
        {
          kind: "pair",
          caption: "A count is not yet a conditional.",
          leftTitle: "Unigram",
          rightTitle: "Bigram after add-1",
          left: ["Count divided by N", "the has probability 1/3", "No previous token"],
          right: ["Divide by the history", "Seen pair becomes 2/6", "Unseen pair becomes 1/6"],
        },
        "Smooth four next-word values",
        [
          "N is 6 and the occurs 2 times, so the unigram probability is 2/6, which is 1/3. The bigram P(cat given the) is 1/2 before smoothing, and P(mat given the) is 1/2.",
          "Add-1 with V equal to 4 lifts each seen count from 1 to 2 and the history count from 2 to 6. Each seen conditional becomes 2/6.",
          "Each of the 2 unseen next words becomes 1/6. The four probabilities are 2/6, 2/6, 1/6, and 1/6, and they sum to 1. A product that included a raw 0 would have been 0.",
        ],
        [
          {
            prompt: "On the line the cat sat on the mat, what is the unigram probability of the, and what is P(cat given the) before smoothing?",
            answer: "The unigram probability is 2/6, or 1/3. P(cat given the) is 1/2, because the history the occurs twice and one of those is followed by cat.",
          },
          {
            prompt: "V is 4 and the history count is 2, with two seen next words of count 1. After add-1, what are the two seen probabilities and one unseen probability?",
            answer: "Each seen probability is 2/6. An unseen probability is 1/6. The denominator is 2 plus 4.",
          },
        ],
      ),
      lec(
        "l3",
        "A grammar and one legal tree",
        [
          "You add a grammar when a bag of bigrams is not structure. Three rules suffice: sentence to noun phrase and verb phrase, noun phrase to determiner and noun, verb phrase to verb and noun phrase. The line the cat sat the mat has 5 tokens. It has a tree if cat and mat are nouns and sat is a verb. You reject the string when no tree exists, even if each bigram probability was above 1/2.",
          "Chart parsing stores spans, not a single guessed tree. A sentence of length 5 has 15 spans. You fill length 1 first, from the part of speech, then longer spans by combining two shorter ones when a rule matches. The cell from 1 to 5 is filled only if some tree covers the sentence. You should be able to name the two child spans that built the verb phrase.",
        ],
        {
          kind: "flow",
          caption: "Short spans before the full sentence.",
          steps: [
            "Label the 5 tokens",
            "Combine spans a rule allows",
            "Fill shorter cells first",
            "Accept only a full span",
          ],
        },
        "Fifteen cells, one verb phrase",
        [
          "The sentence the cat sat the mat has length 5. The number of spans is 5 times 6 divided by 2, so 15.",
          "Noun phrase covers tokens 1 and 2, the cat. Verb phrase covers tokens 3 through 5, sat the mat. Those two children fill the sentence cell.",
          "You can name that split. If the cell from 1 to 5 stays empty, the string is outside this grammar even when every bigram is above 1/2.",
        ],
        [
          {
            prompt: "A sentence has length 5. How many chart spans are there?",
            answer: "15. The count is 5 times 6 divided by 2.",
          },
          {
            prompt: "Every bigram probability is above 1/2, but no tree covers the sentence. Do you accept the string?",
            answer: "No. You accept only when a tree exists under the grammar. Bigram scores do not replace the chart.",
          },
        ],
      ),
      lec(
        "l4",
        "A vector that stands in for a word",
        [
          "You compare meanings with vectors, not with raw ids. Let cat be (1, 0) and dog be (0.6, 0.8). Their dot product is 0.6. Both lengths are 1, since 0.6 squared plus 0.8 squared equals 1, so the cosine is also 0.6. Let mat be (0, 1). Its cosine with cat is 0, so you rank dog closer than mat. You still sort by cosine, and you check lengths before trusting a raw dot product.",
          "Roles are not cosines. In the cat sat the mat, mark cat as agent and mat as location. The grammar tree supplies that: in this toy the noun phrase before the verb is the agent, and the other noun phrase is the location. Swap the two phrases and the roles swap, while the cosine between cat and dog stays 0.6. You want both signals. A cosine does not say who sat.",
        ],
        {
          kind: "pair",
          caption: "Nearness is not the same fact as a role.",
          leftTitle: "Cosine",
          rightTitle: "Role from the tree",
          left: ["cat dot dog is 0.6", "Lengths are both 1", "mat is cosine 0"],
          right: ["Agent is before the verb", "Location is inside the verb phrase", "A swap moves roles, not cosine"],
        },
        "Dot product 0.6, lengths 1",
        [
          "cat is (1, 0) and dog is (0.6, 0.8). The dot product is 1 times 0.6 plus 0 times 0.8, so 0.6.",
          "dog's length is the square root of 0.36 plus 0.64, which is the square root of 1, so 1. cat's length is 1. The cosine is 0.6.",
          "mat at (0, 1) has cosine 0 with cat. You rank dog closer. Swapping noun phrases in the sentence does not change this 0.6.",
        ],
        [
          {
            prompt: "cat is (1, 0) and dog is (0.6, 0.8), both of length 1. What is the cosine?",
            answer: "0.6. The dot product is 0.6 and you divide by the product of the lengths, which is 1.",
          },
          {
            prompt: "You swap the two noun phrases. What happens to the agent role, and what happens to the cosine between cat and dog?",
            answer: "The agent role moves to the noun phrase that is now before the verb. The cosine stays 0.6. Role and nearness are different signals.",
          },
        ],
      ),
      lec(
        "l5",
        "Spans pulled out of a sentence",
        [
          "You score extracted spans by exact match: start, end, and label. If the system returns 4 spans and 3 match, precision is 3/4. If the answer key has 5 spans, recall is 3/5. A span one token too wide counts as a miss, not as half credit. Decide that rule before you read the output. Otherwise the 4th span, the wrong one, becomes a story instead of an error.",
          "You can propose spans from the chart's noun phrases, or from tags. Use 5 tags for person and place: begin and inside for each, plus one shared outside. A span is a begin plus the following inside tags. If your guideline says a lone begin is illegal, do not emit a span for it. Otherwise precision of 3/4 mixes boundary bugs with label bugs, and you cannot tell which of the 4 returned spans failed for which reason.",
        ],
        {
          kind: "pipeline",
          caption: "Propose a span, then demand an exact match.",
          stages: ["Tag or take a noun phrase", "Emit begin plus insides", "Demand start, end, and label", "Precision 3/4, recall 3/5"],
        },
        "Three hits out of four returned",
        [
          "The system returns 4 spans. Three match the key on start, end, and label. Precision is 3/4.",
          "The key has 5 spans, so recall is 3/5. The two missed gold spans are not excused by the three hits.",
          "The fourth returned span is one token too wide. It counts as a full miss. You do not give it half credit after looking at it.",
        ],
        [
          {
            prompt: "The system returns 4 spans and 3 match. The key has 5 spans. What are precision and recall?",
            answer: "Precision is 3/4 and recall is 3/5. Exact match requires start, end, and label.",
          },
          {
            prompt: "A lone begin tag appears and your guideline says that sequence is illegal. Do you emit a span?",
            answer: "No. A span is a legal begin plus its inside tags. Emitting the lone begin would mix a boundary bug into the precision.",
          },
        ],
      ),
      lec(
        "l6",
        "A target sentence and an alignment",
        [
          "You score a translation as a product of token conditionals given the source and the tokens so far. A target of 4 tokens plus a stop decision is 5 factors. If each factor is 1/2, the product is 1/32. Compare candidates by the log sum, 5 times the log of 1/2. A higher score is not a better translation if the reference says otherwise: you still need a separate count of how many words matched.",
          "An alignment links target tokens to source tokens. On a pair of length 3, a monotone alignment has 3 links: positions (1, 1), (2, 2), and (3, 3). Attention replaces a hard link with a distribution over the 3 source positions, and that distribution must sum to 1. If it is flat, each source position gets 1/3, and you have no single link to blame. Do not describe a crisp alignment when the max weight is only 1/3.",
        ],
        {
          kind: "flow",
          caption: "Five factors, then a link or a distribution.",
          steps: [
            "Score each target token",
            "Multiply 4 terms and a stop",
            "Product 1/32 if each is 1/2",
            "Read attention only if it peaks",
          ],
        },
        "Four tokens and a stop",
        [
          "The target has 4 tokens. Each conditional is 1/2, and the stop probability is 1/2. That is 5 factors.",
          "The product is 1/2 to the fifth, which is 1/32. In logs you add 5 copies of the log of 1/2.",
          "A second candidate with product 1/16 beats 1/32. If the reference disagrees, you still count matching words. A flat attention of 1/3, 1/3, 1/3 does not name one source token as the cause.",
        ],
        [
          {
            prompt: "Four target tokens and a stop decision are each probability 1/2. What is the sentence score?",
            answer: "1/32. You multiply five factors of 1/2.",
          },
          {
            prompt: "Attention over 3 source positions is 1/3, 1/3, and 1/3. Why should you not narrate a single aligned source word?",
            answer: "The distribution is flat and already sums to 1. The maximum is 1/3, so the model did not pick one source position.",
          },
        ],
      ),
      lec(
        "l7",
        "Precision on sentiment labels",
        [
          "Summarization, dialogue, and sentiment reuse the same pieces with different targets. A summary may be capped at 10 tokens. You still multiply conditionals, and you also require overlap with a source of 40 tokens. A dialogue turn is a generation conditioned on the last 2 user turns plus a retrieved fact. Sentiment is not generation. You classify one sentence into 2 labels, positive or negative, and you report a confusion count rather than a fluent paragraph.",
          "You read a 2 by 2 count, not a single accuracy. On 10 sentences, 6 true positives and 1 true negative give 7 correct, so accuracy is 7/10. The 2 false positives make precision 6/8. The 1 false negative makes recall 6/7. Quote all three. The same counts score a dialogue act or a factual tag on a summary. A string of 10 generated tokens still needs a separate overlap check, because fluency is not the confusion table.",
        ],
        {
          kind: "pair",
          caption: "Accuracy hides the two off-diagonal cells.",
          leftTitle: "Accuracy 7/10",
          rightTitle: "The rest of the table",
          left: ["6 true positives", "1 true negative", "7 correct of 10"],
          right: ["2 false positives", "Precision 6/8", "Recall 6/7"],
        },
        "Ten sentences, three numbers",
        [
          "The cells are 6 true positives, 2 false positives, 1 false negative, and 1 true negative. They sum to 10.",
          "Accuracy is 7/10. Precision for the positive class is 6 divided by 6 plus 2, so 6/8, which is 3/4.",
          "Recall is 6 divided by 6 plus 1, so 6/7. You quote all three. A summary capped at 10 tokens still needs an overlap check against its source of 40 tokens. Fluency is not this table.",
        ],
        [
          {
            prompt: "The cells are 6, 2, 1, and 1 for true positive, false positive, false negative, and true negative. What are accuracy, precision, and recall for the positive class?",
            answer: "Accuracy is 7/10, precision is 6/8, and recall is 6/7. The 2 false positives are invisible if you quote only accuracy.",
          },
          {
            prompt: "A summary is 10 fluent tokens and the source is 40 tokens. Why is the confusion table not enough?",
            answer: "Sentiment and factual tags can use the table. A generated string still needs an overlap check against the source. Fluency is not a count of true positives.",
          },
        ],
      ),
      lec(
        "l8",
        "A pipeline from tokens to a decision",
        [
          "You can move from raw text to a decision you can recompute. You tokenize, drop types seen once, and estimate a bigram. You can test a 5-token sentence against 3 grammar rules and fill 15 chart cells. You can rank two vectors by cosine, pull spans with precision 3/4, and score a 4-token translation as a product of 5 factors of 1/2, which is 1/32. Sentiment ends as a count: accuracy 7/10 is not the same report as precision 6/8.",
          "Put a language-model gate on the extractor. Of 4 returned spans, 3 are correct, and the wrong one has smoothed bigram probability 1/6. Your cutoff is 1/2, so you drop it. Precision moves from 3/4 to 3/3. Recall against 5 gold spans stays 3/5 if that dropped span was not gold. You are done when you can recompute both fractions and say which lecture each one came from.",
        ],
        {
          kind: "layers",
          caption: "A decision you can recompute by hand.",
          rows: ["Tokens and a bigram", "A chart of 15 spans", "Cosine, spans, or 1/32", "A confusion count"],
        },
        "Drop the span whose bigram is 1/6",
        [
          "The extractor returns 4 spans and 3 match, so precision is 3/4. The wrong span has smoothed bigram probability 1/6.",
          "The cutoff is 1/2. Because 1/6 is below 1/2, you drop that span. Three correct spans remain, so precision is 3/3.",
          "The key still has 5 gold spans, and the dropped span was not gold. Recall stays 3/5. You used the bigram lecture and the extraction lecture on the same list.",
        ],
        [
          {
            prompt: "Four target-token factors and a stop are each 1/2, and a separate sentiment table has accuracy 7/10. Which number is the translation score, and which is not a string probability?",
            answer: "The translation score is 1/32. Accuracy 7/10 is a count of labels, not a product of token conditionals.",
          },
          {
            prompt: "Combine the bigram cutoff with extraction. Of 4 spans, 3 are correct, and the incorrect span has smoothed probability 1/6 under a cutoff of 1/2. The key has 5 gold spans and the dropped span was not gold. What are the new precision and the recall?",
            answer: "Precision becomes 3/3. Recall stays 3/5. You drop the span because 1/6 is below 1/2, and that span was not one of the gold spans.",
          },
        ],
      ),
    ],
  },
];

