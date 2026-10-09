import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-603",
    lectures: [
      lec("l1", "Relations, schemas, and keys", [
        "You name a relation, list its attributes, and then store tuples that match that list. A tuple is one value for each attribute, and the relation is a set, so an exact duplicate tuple is not a second fact. Take a Student relation with 4 attributes: id, last, first, and year. The schema is the attribute list. The rows you insert later have to follow it, including the year stored as an integer rather than a phrase.",
        "A key is a set of attributes that stays unique and that contains no smaller unique set. You choose one candidate key as the primary key. In a section of 30 students, last name fails as a key when 2 students share it, while student_id works if each id is issued once. When no single column identifies a row, you use a composite key of 2 attributes.",
      ], { kind: "layers", caption: "From a schema down to one key.", rows: ["Relation name and attributes", "Tuples, with duplicates collapsed", "Candidate keys inside the attributes", "One primary key you declare"] }, "Two Ada rows, one key", [
        "You insert (17, Ada, Lee) twice and (18, Ada, Ng) once. The duplicate (17, Ada, Lee) is one tuple, so 2 tuples remain.",
        "student_id values 17 and 18 differ, so id separates the rows even though both first names are Ada.",
        "The pair (first, last) is not a key. A later row (19, Ada, Lee) is legal, and the names collide while the ids do not.",
      ], [
        { prompt: "The 2 rows you have today differ in last name. Is (first, last) a key?", answer: "No. A key has to stay unique in every legal state, not only in the rows you happen to store. A third student can share both names while holding a new student_id." },
        { prompt: "A section is identified by term and course_no, but two sections of one course meet in the same term. Is that pair a key?", answer: "No. Those two sections share term and course_no, so the pair is not unique. Add a section attribute. A composite key is required when no single column identifies the row, and this pair is still too small." },
      ]),
      lec("l2", "Relationships become relations", [
        "You draw entities for things that need their own attributes, and you draw relationships for facts that connect them. Cardinality tells you how many entities on one side can match one entity on the other. A student and a department with a many-to-one advisor link means each student has 1 department, while a department has many students. You do not store a list inside a cell. You store that link as attributes that refer to keys.",
        "A many-to-many relationship cannot hide inside either entity. You give it a new relation whose primary key is the pair of foreign keys, plus any attribute that belongs to the link itself. Enrollment of 80 students across 6 courses is that case: a grade is not a property of the student alone or of the course alone. It is a property of the pair, so the grade column lives on the enrollment relation.",
      ], { kind: "pipeline", caption: "From a link to a table.", stages: ["Name the two entities", "Read the cardinality", "Make a relation for the link", "Put grade on that pair"] }, "Where a grade is allowed to live", [
        "Student and Course are entities. One student takes many courses, and one course enrolls many students.",
        "Enrollment(student_id, course_id, grade) is the link. The key is the pair of ids, not either id alone.",
        "A grade column on Student would give that student one cell. It cannot record grades for 4 courses.",
      ], [
        { prompt: "Why do you refuse to store a list of course ids inside the student row?", answer: "A list inside a cell is not one value for an attribute. The link has to be attributes that refer to keys, so each course id can stand in its own enrollment row." },
        { prompt: "Each of 80 students enrolls in 2 of the 6 courses. How many enrollment rows do you get?", answer: "160. Each enrollment is one pair, and 80 students times 2 courses is 160 rows. The 6 courses bound the catalog, not the row count." },
      ]),
      lec("l3", "Selection, products, and joins", [
        "You read rows with SELECT, you keep columns with the select list, and you keep rows with WHERE. A join matches tuples by a predicate, usually equality of a foreign key and a primary key. If you write two relations in FROM and forget the predicate, you get the Cartesian product. On 20 students and 5 courses that product has 100 rows, almost all of them meaningless pairs you did not intend to report.",
        "An inner join keeps a tuple only when the predicate finds a partner. You use it for enrollment rows that must point at a real student and a real course. A student with 0 enrollments disappears from that result, which is correct if you asked who is enrolled, and wrong if you asked for every student. Put the student on the preserved side of an outer join when absence is a fact you still need to see.",
      ], { kind: "flow", caption: "How an unbounded product shrinks.", steps: ["FROM builds 20 times 5 rows", "The predicate keeps real pairs", "Inner join drops unmatched students", "Outer join can keep them"] }, "A product you did not ask for", [
        "Student has 20 rows and Course has 5. FROM Student, Course with no predicate yields 100 rows.",
        "Adding the enrollment equalities keeps only pairs that appear in Enrollment. The 100 was not that set.",
        "A student with no enrollment row is missing from the inner join. A left outer join from Student still returns that student.",
      ], [
        { prompt: "Why is 100 the wrong answer to 'which students take which courses' when you have 20 students and 5 courses?", answer: "100 is the Cartesian product, 20 times 5. Most of those pairs were never enrolled. You need a join predicate through Enrollment, not the bare product." },
        { prompt: "A student has 0 enrollment rows. What does an inner join to Enrollment return for that student, and what does a left outer join from Student return?", answer: "The inner join drops the student, because no partner matches. The left outer join keeps the student and leaves the enrollment columns empty. Use it when absence itself is a fact you need." },
      ]),
      lec("l4", "Groups, aggregates, and nested queries", [
        "WHERE filters rows before groups exist. GROUP BY then bundles the surviving rows, and the select list may contain only group attributes and aggregates such as COUNT, SUM, and AVG. HAVING filters groups after the aggregate is computed. If you want courses with average grade at least 80, the average does not exist at WHERE time. You put that test in HAVING, and you put student-level tests, such as grade above 0, in WHERE.",
        "A nested query is a SELECT whose result you use inside another predicate. You use IN when the inner query returns a set of keys. Use a scalar subquery only when the inner query is guaranteed to return 1 row. The courses of one instructor can be that inner set, and the outer query finds students enrolled in it. If the inner query returns 2 rows, a scalar comparison fails instead of picking a row.",
      ], { kind: "pipeline", caption: "Filter, group, then filter groups.", stages: ["WHERE keeps rows", "GROUP BY builds groups", "Aggregates compute a number", "HAVING keeps groups"] }, "Averages against a line at 80", [
        "Course A has grades 70 and 90, B has 100, and C has 50 and 60. With no WHERE, all 5 grades remain.",
        "GROUP BY course computes averages 80, 100, and 55.",
        "HAVING average >= 80 keeps A and B and drops C. A WHERE grade >= 80 would have deleted 70, 50, and 60 first, so C would vanish instead of reporting 55.",
      ], [
        { prompt: "What is course A's average, and does HAVING average >= 80 keep it?", answer: "A's grades are 70 and 90, so the average is 80. The HAVING test keeps a group at 80, so A remains, together with B at 100. C at 55 does not." },
        { prompt: "You grouped by course_id. Why is student name illegal in the select list?", answer: "The select list may contain only the group attributes and aggregates. Student name is neither, so a course group does not have one student name to return." },
      ]),
      lec("l5", "Dependencies and three anomalies", [
        "A functional dependency is a rule on legal tuples: if two tuples agree on a set of attributes X, they must agree on Y. You write that as X determines Y. Keys are the dependencies you already used for identity, but other dependencies hide in the attributes. In a table that stores employee_id, dept, and manager, each employee has 1 dept, and each dept has 1 manager, so employee_id determines dept and dept determines manager.",
        "If you store the manager beside every employee, that fact is copied once per person. Change it in 1 of 3 rows and the other 2 keep the old name: an update anomaly. Delete the last employee and you also delete the only copy of the manager: a deletion anomaly. A new department with 0 employees has nowhere to store its manager: an insertion anomaly.",
      ], { kind: "pair", caption: "One fact, copied three times.", leftTitle: "Stored rows", rightTitle: "What the copy causes", left: ["(1, Lab, Kim)", "(2, Lab, Kim)", "(3, Lab, Kim)"], right: ["Edit 1 row, 2 stay stale", "Delete all 3, Lab is gone", "No row for a new dept"] }, "Three copies of Kim", [
        "The rows are (1, Lab, Kim), (2, Lab, Kim), and (3, Lab, Kim). employee_id determines dept, and dept determines manager.",
        "You change row 1 to Patel and leave rows 2 and 3 as Kim. Lab now shows two managers.",
        "Delete all 3 employees and the fact that Lab has a manager disappears with them.",
      ], [
        { prompt: "Which dependency is transitive in the employee table?", answer: "employee_id determines manager, because employee_id determines dept and dept determines manager. manager is not itself the key. That chain is the transitive dependency." },
        { prompt: "You update the manager in 1 of the 3 Lab rows. How many rows are stale?", answer: "2. Those two rows still show the old manager, so the department no longer has one manager fact." },
      ]),
      lec("l6", "Third normal form and a split", [
        "First normal form requires each cell to hold one value, not a list. Second normal form applies when the key has 2 or more attributes: a non-key attribute must not depend on only part of that key. Third normal form forbids a transitive dependency, where a non-key attribute determines another non-key attribute. You check the employee table against the third condition, because manager depends on dept and dept depends on employee_id.",
        "Boyce-Codd normal form asks for something stricter than third normal form: every determinant must be a candidate key. You reach a practical design by decomposing along a dependency. Split the employee table into two relations, Emp(employee_id, dept) and Dept(dept, manager). The shared attribute dept lets you join them back. With 9 employees and 2 departments, the manager name is stored 2 times after the split, not 9.",
      ], { kind: "layers", caption: "Four checks, from cells to keys.", rows: ["One value in each cell", "No partial key dependency", "No transitive dependency", "Every determinant is a key"] }, "Pull the manager into its own row", [
        "EmpDept violates third normal form: dept determines manager, and dept is not a candidate key. employee_id is the key.",
        "Replace it with Emp(employee_id, dept) and Dept(dept, manager). dept is the key of Dept, so the join on dept matches at most one manager.",
        "Nine employees and 2 departments store each manager 2 times, not 9. Each employee still has one dept.",
      ], [
        { prompt: "A cell stores two phone numbers. Does the relation satisfy first normal form?", answer: "No. First normal form requires one value in each cell, not a list. Split the phones into their own rows or their own relation." },
        { prompt: "The key is (student_id, course_id), and student_name depends only on student_id. Which normal form fails?", answer: "Second normal form. The key has 2 attributes, and student_name depends on only one of them. Move student_name to a Student relation whose key is student_id." },
      ]),
      lec("l7", "Constraints and views", [
        "A primary key constraint rejects a second row with the same key. A foreign key rejects a reference to a missing parent, and it can block a delete of a parent that still has 3 children. CHECK rejects a predicate that fails, such as a grade outside 0 to 100. NOT NULL rejects a missing value in a column you marked mandatory. You declare these on the schema so the bad write fails at once.",
        "A view is a named query. You query it as if it were a relation, and the database merges the view definition into the outer query. A view of one base relation that only drops rows or columns can be updatable. A view that joins 2 relations or aggregates them is a report, and an INSERT through it is not a single base-row write. Use the view for the read you repeat, and use the base relations for the write.",
      ], { kind: "flow", caption: "A write meets the schema.", steps: ["Check the primary key", "Check each foreign key", "Check CHECK and NOT NULL", "Accept or reject the row"] }, "A grade that cannot be stored", [
        "CHECK requires grade between 0 and 100. An insert of 110 fails before any query can see it.",
        "A foreign key requires course_id to exist. Citing course 999 fails when that course row is absent.",
        "A view of students in year 4 can accept a name change. A view that averages grades by course cannot accept an insert, because that insert is not one base row.",
      ], [
        { prompt: "A parent row still has 3 child rows. What does the foreign key do if you delete the parent?", answer: "It can block the delete while those 3 children remain. The lecture's rule is that a parent with 3 children is not removed out from under them." },
        { prompt: "Why do you refuse an INSERT into a view that joins 2 relations?", answer: "That view is a report. An insert through it is not a single base-row write, so you insert into the base relations instead." },
      ]),
      lec("l8", "A schema you can defend", [
        "You can now turn a short description into entities, relations, keys, and dependencies, and you can see when a table should be split. You can write the SQL that joins those relations, groups them, and rejects a row that breaks a constraint. Given 1 description of students, courses, and grades, you should be able to place the grade on the enrollment relation, argue the key, and compute a per-course average without mixing WHERE and HAVING.",
        "The design is finished only when the dependencies and the queries agree. If you decompose into 2 relations so that dept determines manager in its own relation, you must still join back on dept and get each employee's manager one time. A foreign key from employee.dept to department.dept keeps that join from inventing a department you never stored. Normalization without the constraint is a drawing. The constraint without a dependency to remove is only a refusal to insert.",
      ], { kind: "pipeline", caption: "One description, one schema.", stages: ["Place grade on the pair", "Check each determinant", "Declare the foreign keys", "Group in HAVING, not WHERE"] }, "Enrollment that survives a join", [
        "Build Student(student_id, name), Course(course_id, title), and Enrollment(student_id, course_id, grade). The grade sits on the pair.",
        "student_id determines name, course_id determines title, and the pair determines grade. Each determinant is a key, so the schema is in Boyce-Codd normal form.",
        "Foreign keys point from Enrollment to both parents. An average by course uses GROUP BY and HAVING on AVG(grade), not WHERE.",
      ], [
        { prompt: "You split managers into Dept(dept, manager). An employee row names dept Q, and Q is not in Dept. What happens, and which two earlier mechanisms are doing the work?", answer: "The foreign key rejects the insert. The split put each manager in Dept so it is stored once per department, and the foreign key stops a dept value that would not join to any manager. Without the constraint you could store Q and then fail to find a manager. Without the split the manager fact would still be copied onto every employee." },
        { prompt: "Course P has grades 80 and 100. Course Q has grade 70. You want averages of at least 85, and the grade must not live on Student. Which course remains, and why is Enrollment the relation you group?", answer: "P remains: (80 + 100) / 2 = 90, and 90 >= 85. Q's average is 70, so Q is dropped by HAVING. The grade is a property of the student-course pair, so it lives on Enrollment, which is the relation you group by course." },
      ]),
    ],
  },
  {
    slug: "csce-628",
    lectures: [
      lec("l1", "Strings, alphabets, and frames", [
        "You treat a genome as a string over a small alphabet. DNA uses 4 letters, A, C, G, and T, and the complement swaps A with T and C with G while reversing direction. A read stored from the opposite strand will not match the reference until you build that reverse complement. Proteins are a different string: 20 amino acids, written after the cell has translated codons of length 3.",
        "A codon is 3 bases and codes for one amino acid or a stop. On one strand you can start at position 0, 1, or 2, which gives 3 forward frames. The reverse complement has 3 more, so a double-stranded stretch has 6 frames you may have to translate. A shift of 1 base changes every codon downstream. That is why you do not compare protein strings until you have chosen the frame the bases were read in.",
      ], { kind: "layers", caption: "One DNA stretch, six translations.", rows: ["DNA string of 4 letters", "Reverse complement of that string", "3 starts on the given strand", "3 starts on the opposite strand"] }, "Reverse complement of ACGT", [
        "Write the string ACGT. Replace each letter: A becomes T, C becomes G, G becomes C, T becomes A. You now have TGCA.",
        "Reverse that result. The reverse complement is ACGT. This particular string is its own reverse complement.",
        "A one-base shift still matters after the complement. Reading ATGAAA from index 1 is not the same codon sequence as reading it from index 0.",
      ], [
        { prompt: "What is the reverse complement of ATG, and how many forward frames does a single strand give you?", answer: "The complement of ATG is TAC, and the reverse of TAC is CAT. A single strand gives you 3 forward frames, starting at positions 0, 1, and 2." },
        { prompt: "Why can a shift of 1 base make a protein comparison meaningless even when the letters are unchanged?", answer: "Codons are read in groups of 3. Starting one base later regroups every codon downstream, so the translated amino acids are a different string. You have to choose the frame before you compare proteins." },
      ]),
      lec("l2", "Edit distance", [
        "You measure how far two strings are by the cheapest script of edits. Insertion, deletion, and substitution each have a cost you set. With every cost equal to 1, distance is the size of the cheapest script. CAT and CAR differ by one substitution at the end, so the distance is 1. CAT and AT differ by deleting C, so that distance is 1 as well.",
        "An alignment writes the edits in columns. Two letters in a column are a match or a substitution, and a dash is a gap. A gap is an insertion against one string and a deletion against the other. For strings of length 3 and 3, you need at least 3 columns and at most 6, and you never place 2 dashes in the same column. You want the cheapest alignment, not the first one you sketch.",
      ], { kind: "pair", caption: "Two edits, both cost 1.", leftTitle: "CAT against CAR", rightTitle: "CAT against AT", left: ["Last letters differ", "One substitution", "Distance 1"], right: ["Drop the leading C", "One deletion", "Distance 1"] }, "Align CAT with CAR at unit cost", [
        "Match cost is 0, and substitution, insertion, and deletion each cost 1.",
        "Pair C with C and A with A. Those two columns cost 0.",
        "Pair T with R. That substitution costs 1, so the alignment costs 1, which is the distance.",
      ], [
        { prompt: "With every edit cost equal to 1, what is the distance between AC and ABC?", answer: "1. Insert B between A and C. The other letters match, so one insertion is enough, and you cannot do it in 0 edits because the strings differ." },
        { prompt: "Two strings each have length 3. Why is an alignment of 7 columns impossible under the rule you are using?", answer: "Each letter appears in some column, so you need at least 3 columns, and you never stack 2 dashes in one column, so you cannot exceed 6. A 7th column would require two dashes or a repeated letter." },
      ]),
      lec("l3", "Global and local alignment", [
        "You fill a matrix whose cell (i, j) is the best score of the first i letters against the first j letters. Needleman-Wunsch aligns the strings globally. Each cell takes the best of three moves: a gap in the first string, a gap in the second, or a pairing of the two current letters. With match cost 0, substitution cost 1, and gap cost 1, the bottom-right cell is the edit distance.",
        "Smith-Waterman changes one rule: a cell that would go negative is reset to 0, and you may start a new local alignment there. You report the best cell anywhere in the matrix, not the corner. That is the right mechanism when a gene of length 40 sits inside a chromosome of length 4000 and the flanking bases should not pay gap costs. A global alignment would force those flanks into the score.",
      ], { kind: "flow", caption: "One cell, three incoming moves.", steps: ["Gap in the first string", "Gap in the second string", "Pair the two letters", "Keep the cheapest move"] }, "Corner cell for CAT and CAR", [
        "Costs are match 0, substitution 1, gap 1. The cell for the first C against the first C stores 0.",
        "The cell for prefix CA against prefix CA also stores 0, because both pairings match.",
        "The final T against R is a substitution, so the bottom-right cell stores 1. That 1 is the global distance.",
      ], [
        { prompt: "Under match 0, substitution 1, and gap 1, the bottom-right cell of CAT against CAR is 1. What does that cell mean?", answer: "It is the edit distance of the whole strings. Needleman-Wunsch reports the corner, and the cheapest global alignment substitutes T for R and matches the other two letters." },
        { prompt: "A gene is 40 bases inside a chromosome of 4000. Why do you reset negative cells to 0 instead of forcing a global alignment?", answer: "A global alignment charges the flanking bases, which can bury a good local match. Smith-Waterman resets a negative cell to 0 so a local alignment can start there, and you read the best cell in the matrix rather than the corner." },
      ]),
      lec("l4", "Substitution scores for proteins", [
        "DNA match-or-mismatch is a blunt score once you have translated to protein. You look up a pair of amino acids in a substitution matrix instead of charging every change the same cost. The matrix entry is high when that substitution is common in real proteins and low when it is rare. In a toy matrix, A against A scores 2, and A against B scores -1. You add the column scores to score the alignment.",
        "Gaps still have their own penalty, a larger cost to open a gap than to extend it by 1 more letter. You choose the matrix for the question you have. A matrix built from close homologs punishes substitutions harder than a matrix built from distant ones. If two candidate alignments of the same pair score 8 and 5 under your matrix, you keep 8. The number is not a probability until you say how random strings of that length score.",
      ], { kind: "pair", caption: "Same change, two alphabets.", leftTitle: "DNA cost", rightTitle: "Protein matrix", left: ["Match costs 0", "Any change costs 1", "Letters are only 4"], right: ["A with A scores 2", "A with B scores -1", "Letters are 20"] }, "Score AA against AB", [
        "Use the toy matrix: identical letters score 2, and A against B scores -1. Open no gaps.",
        "Column 1 pairs A with A and scores 2. Column 2 pairs A with B and scores -1.",
        "The alignment scores 2 + (-1) = 1. A second alignment that scores 5 would outrank this one.",
      ], [
        { prompt: "Under the toy matrix, identical letters score 2 and A against B scores -1. What is the score of AAA against ABA with no gaps?", answer: "3. The columns score 2, -1, and 2. The sum is 2 - 1 + 2 = 3." },
        { prompt: "Two alignments of the same protein pair score 8 and 5. Which do you keep, and why is 8 not yet a probability?", answer: "You keep 8, the higher matrix score. It becomes a probability only after you say how random strings of that length score. The raw sum is not that probability." },
      ]),
      lec("l5", "Seeds before a full alignment", [
        "Full dynamic programming against every database sequence is too slow for a query you repeat. BLAST first requires an exact seed shared by the query and a subject. Protein search often uses a seed of length 3. DNA search often uses a seed of length 11, because 11 letters are already specific in an alphabet of 4. A subject with no seed is not passed to the slower alignment step.",
        "Around each seed you extend both ways and stop when the score falls more than a dropoff below its best so far. A dropoff of 5 means a dip of 6 ends that extension. You keep the hit only if the finished score clears a threshold you set, such as 20. A seed of length 3 can still die in a bad neighborhood. You can miss a true homolog that shares no exact word of length 3.",
      ], { kind: "pipeline", caption: "A hit has to survive two gates.", stages: ["Find an exact seed", "Extend while the score holds", "Drop a dip past 5", "Keep scores of at least 20"] }, "A protein seed of length 3", [
        "The query contains the word MKM. A database protein contains MKM starting at one position. That shared word is a seed of length 3.",
        "You extend left and right. The running score peaks, then falls by 6, which is more than the dropoff of 5, so extension stops.",
        "The finished score is 18. The threshold is 20, so you discard the hit even though the seed matched.",
      ], [
        { prompt: "Why is a DNA seed often length 11 while a protein seed is often length 3?", answer: "DNA has an alphabet of 4, so a word of length 11 is already specific. Protein has an alphabet of 20, so a word of length 3 is specific enough to use as the seed. Subjects with no seed skip the slow alignment." },
        { prompt: "A seed matches and the extension score peaks, then falls by 6 from that peak, and finishes at 18. Your dropoff is 5 and your threshold is 20. Do you keep the hit?", answer: "No. A dip of 6 is past the dropoff of 5, so extension stops, and 18 is below the threshold of 20. An exact seed is not by itself a reported hit." },
      ]),
      lec("l6", "Reads, k-mers, and a contig", [
        "A sequencer gives you short reads, not a finished chromosome. Shotgun assembly overlaps those reads until the overlaps spell a longer sequence. In a de Bruijn graph you break each read into k-mers, words of length k. Consecutive k-mers overlap by k minus 1 letters and form a path you can follow. With k equal to 3, the read ATGCT yields the 3 k-mers ATG, TGC, and GCT, and that path spells ATGCT again.",
        "A second read, GCTA, with the same k of 3, yields GCT and CTA. GCT is already a node, so the reads merge into one path that spells ATGCTA, length 6. You needed a shared k-mer. If k is too small, a repeat of length 2 glues unrelated regions together. If k is larger than the overlap you truly have, the shared node never appears and the reads stay in 2 components.",
      ], { kind: "flow", caption: "Two reads become one path.", steps: ["Break each read into 3-mers", "Share the node GCT", "Spell ATGCTA on the path"] }, "Assemble ATGCT with GCTA", [
        "k is 3. ATGCT gives ATG, TGC, and GCT. Consecutive k-mers overlap by 2 letters.",
        "GCTA gives GCT and CTA. GCT is already present, so the second read joins the path.",
        "The merged path spells ATGCTA, which has length 6. Without the shared 3-mer the reads would stay separate.",
      ], [
        { prompt: "With k = 3, which 3-mers do you take from ATGCT, and what string does that path spell?", answer: "ATG, TGC, and GCT. Consecutive 3-mers overlap by 2 letters, and the path spells ATGCT." },
        { prompt: "You add the read GCTA. What contig do you spell at k = 3, and what happens at k = 4?", answer: "At k = 3 the reads share GCT and spell ATGCTA, length 6. At k = 4, ATGCT yields ATGC and TGCT, while GCTA yields only GCTA. No node is shared, so the reads stay in 2 components." },
      ]),
      lec("l7", "From a frame to a peptide", [
        "You translate DNA only after you pick a frame. Take ATGAAA, which has length 6, so it holds 2 codons if you start at position 0: ATG and AAA. ATG is a common start, and AAA codes for lysine in the standard table, so this frame yields a dipeptide you can write as MK if you use the one-letter code. Starting at position 1 uses different groups and is a different product.",
        "An open reading frame runs from a start codon to an in-frame stop, and its base length is divisible by 3. You scan 6 frames because the given strand may be backwards. An ORF of 99 codons is 297 bases. For proteomics you digest the predicted protein in the model: trypsin cuts after K and after R. A cut site inside the chain means the mass you look for is the peptide mass, not the mass of the whole protein.",
      ], { kind: "pipeline", caption: "Bases to a mass you can search.", stages: ["Pick 1 of 6 frames", "Translate codons of length 3", "Cut after K and after R", "Search the peptide mass"] }, "Translate ATGAAA in frame 0", [
        "Length 6 divides by 3, so frame 0 has 2 codons: ATG and AAA.",
        "ATG becomes M and AAA becomes K. The peptide is MK.",
        "Frame 1 does not group the bases that way. You do not report MK for frame 1.",
      ], [
        { prompt: "An open reading frame has 99 codons. How many coding bases is that, and why must the count be divisible by 3?", answer: "297 bases, because 99 times 3 is 297. Codons are length 3, so a base count that is not divisible by 3 is not an integer number of codons in that frame." },
        { prompt: "Trypsin cuts after K and after R. Why do you search a peptide mass rather than the mass of the whole translated protein?", answer: "A cut site inside the chain breaks the protein into peptides. The spectrum matches a peptide mass, not the mass of the intact chain, whenever a K or an R falls inside it." },
      ]),
      lec("l8", "A sequence question you can name", [
        "You can now take a biological string and choose a computation that matches the question. Distance and dynamic programming compare two sequences you already hold. Seeds decide whether a database sequence deserves that comparison. K-mers merge reads into a contig. Frames and a digest connect a DNA string to a peptide a mass spectrometer might see. Those are 5 mechanisms, and a wrong frame or a missed seed is a failure you can name.",
        "A result is not done when a number comes out. You still have to say which string, which frame, and which score produced it. An assembly contig of length 6 that you then translate in frame 0 is a different object from the same bases aligned as DNA against a reference. If the protein alignment scores 8 and a second frame scores 1, you report frame 0 and the score 8, and you name the seed length.",
      ], { kind: "layers", caption: "Pick the computation by the question.", rows: ["Edit distance for two strings", "A seed before the full matrix", "K-mers when the input is reads", "A frame, then a peptide mass"] }, "Contig, frame, and a seed that cannot exist", [
        "Reads ATGCT and GCTA at k = 3 assemble to ATGCTA, length 6.",
        "Frame 0 of a different string, ATGAAA, translates to MK. That peptide is not a property of the DNA contig until you translate it.",
        "A DNA search seed of length 11 cannot occur inside a contig of length 6, so the seed stage rejects the contig before any score.",
      ], [
        { prompt: "You assemble ATGCT and GCTA at k = 3, then search the contig as DNA with seed length 11. What string did assembly spell, and why does the seed stage reject it?", answer: "Assembly spells ATGCTA, length 6, by sharing the 3-mer GCT. A DNA seed has length 11, and 6 is shorter than 11, so the contig contains no seed. The search seed and the assembly k are different word lengths, and this query fails the seed gate." },
        { prompt: "Frame 0 of ATGAAA is MK. Your toy matrix scores identical letters at 2. What is the score of MK against MK, and why is frame 1 not allowed to use that score?", answer: "M against M scores 2 and K against K scores 2, so the sum is 4. Frame 1 regroups the bases and does not produce MK, so it cannot claim the score 4. You report the frame together with the score." },
      ]),
    ],
  },
  {
    slug: "csce-670",
    lectures: [
      lec("l1", "The inverted index", [
        "You do not scan every document for every query once the collection is large. You build an inverted index: each term maps to a postings list of document identifiers. You tokenize each document and emit pairs of term and doc id, then sort and group by term. In a collection of 4 documents, cat might post 2 identifiers. A term that appears once posts a list of length 1.",
        "You keep each postings list sorted by document identifier so two lists can be merged in one pass. You also store document frequency, the length of that list. A term in 3 of 4 documents is less selective than a term in 1 of 4. The index stores locations, not the original sentence. If phrase queries matter, store a position too: cat at position 2 beside dog at position 3 is a different fact from those words far apart.",
      ], { kind: "pipeline", caption: "Tokens become one postings list.", stages: ["Tokenize each document", "Emit term and doc id", "Sort and group by term", "Store the sorted postings"] }, "Index four short documents", [
        "Documents 1 and 3 contain cat. Documents 2 and 4 do not. You emit the pairs (cat, 1) and (cat, 3).",
        "After sorting, the postings for cat are 1, 3. The document frequency is 2.",
        "A second term, dog, occurs only in document 4, so its list has length 1 and its document frequency is 1.",
      ], [
        { prompt: "In a collection of 4 documents, cat occurs in 2 of them. What is stored for cat, and what is its document frequency?", answer: "A sorted postings list of those 2 document identifiers, and a document frequency of 2. The index does not store the original sentences." },
        { prompt: "cat is at position 2 and dog is at position 9 in the same document. Why is that not the same fact as cat at 2 beside dog at 3?", answer: "Positions 2 and 3 are adjacent, which can support a phrase. Positions 2 and 9 are only a bag of words. If you need phrases, the postings have to store positions, not only document identifiers." },
      ]),
      lec("l2", "Boolean queries on postings", [
        "A Boolean query combines terms with AND, OR, and NOT. AND is the intersection of two sorted postings lists. You walk the lists with two pointers and emit an identifier only when both pointers see it, then you advance the pointer that is behind. OR is the union, and you emit every identifier once. NOT against a corpus of 10000 documents turns a list of length 2 into a huge complement you rarely want.",
        "The order of operations changes the work. Intersect the shorter list first. If cat posts 3 documents and animal posts 400, you intersect cat with the next term before you touch the long list, when the Boolean structure allows it. Conjunctive queries are the common case in web search even when the user typed no AND. Lists 1, 4, 9, 12 and 4, 7, 12 intersect at 4 and 12.",
      ], { kind: "flow", caption: "Intersect two sorted lists.", steps: ["Compare the two heads", "Emit an id only on equality", "Advance the smaller head", "Stop at the end of either list"] }, "Intersect 1, 4, 9, 12 with 4, 7, 12", [
        "Heads are 1 and 4. 1 is smaller, so you advance the first list. Heads are now 4 and 4.",
        "They match, so you emit 4 and advance both. Next heads are 9 and 7. Advance the second list to 12.",
        "9 is behind 12, so you advance to 12 and 12, emit 12, and stop. The intersection has size 2.",
      ], [
        { prompt: "What is the intersection of postings 1, 4, 9, 12 and 4, 7, 12, and why do you not emit 7?", answer: "The intersection is 4 and 12. 7 appears in only one list. AND emits an identifier only when both pointers see it." },
        { prompt: "A term's postings have length 2, and the corpus has 10000 documents. Why is NOT on that term a poor query by itself?", answer: "The complement has 9998 documents. NOT turns a short list into almost the whole corpus, which is rarely the set you meant to retrieve." },
      ]),
      lec("l3", "Ranking with tf-idf", [
        "Boolean retrieval returns a set, and ranked retrieval returns an order. You weight a term by its frequency in the document times its inverse document frequency. Use log base 2. If N is 4 and the term appears in 2 documents, inverse document frequency is log2 of 4/2, which equals 1. A document with term frequency 3 then has weight 3. A term that appears in all 4 documents has weight contribution 0, because log2 of 1 is 0.",
        "A multi-term query scores a document by summing weights of query terms that occur in it. You ignore document terms the query did not ask for. With idf of cat equal to 1 and idf of dog equal to 2, a document that has cat twice and dog never scores 2. A document that has each term once scores 3, because the rare term contributes 2. You sort by that sum and put the higher score first.",
      ], { kind: "pair", caption: "Two documents, one query.", leftTitle: "Document 1", rightTitle: "Document 2", left: ["cat twice, no dog", "Score is 2", "Ranks second"], right: ["cat once, dog once", "Score is 3", "Ranks first"] }, "Score cat and dog", [
        "idf(cat) is 1 and idf(dog) is 2. The query contains both terms.",
        "Document 1 has term frequencies 2 and 0, so the score is 2 times 1, plus 0, which is 2.",
        "Document 2 has term frequencies 1 and 1, so the score is 1 times 1, plus 1 times 2, which is 3. You rank document 2 first.",
      ], [
        { prompt: "N is 4 and a term appears in all 4 documents. What is its inverse document frequency, and can it change the ranking?", answer: "log2 of 4/4 is log2 of 1, which is 0. Every document gets weight 0 from that term, so it cannot change the order." },
        { prompt: "idf(cat) = 1 and idf(dog) = 2. Document A has cat three times and no dog. Document B has each term once. Which ranks first, and what are the scores?", answer: "A scores 3 times 1 = 3. B scores 1 times 1 + 1 times 2 = 3. They tie at 3. Neither ranks strictly first. The rare term's extra 2 on B matches A's extra cat counts." },
      ]),
      lec("l4", "Precision, recall, and a cutoff", [
        "A ranked list is not a success until you compare it with judgments. Precision is the fraction of retrieved documents that are relevant. Recall is the fraction of relevant documents that you retrieved. If you return 10 documents and 4 of them are relevant, precision is 4/10, which is 0.4. If the collection holds 5 relevant documents, recall is 4/5, which is 0.8. The two numbers move differently when you lengthen the list: recall can rise while precision falls.",
        "You must fix a cutoff, because a ranked list can be the whole collection. Precision at 10 uses the first 10 hits only. If 4 relevant hits sit at ranks 11 to 14, recall at 10 is 0. Average precision averages the precision at each relevant hit's rank, over all relevant documents, using 0 when a hit is missing. You write the cutoff beside precision or two runs cannot be compared.",
      ], { kind: "layers", caption: "One list, two different fractions.", rows: ["10 retrieved documents", "4 of those are relevant", "5 relevant documents exist", "Precision 0.4 and recall 0.8"] }, "Average precision for two hits", [
        "Two documents are relevant, and both are retrieved, at ranks 1 and 3. No relevant document is missing.",
        "Precision at rank 1 is 1/1 = 1. Precision at rank 3 is 2/3.",
        "Average precision is (1 + 2/3) / 2 = (5/3) / 2 = 5/6. You divide by the 2 relevant documents, not by the length of the list.",
      ], [
        { prompt: "You return 10 documents, 4 are relevant, and the collection has 5 relevant documents. What are precision and recall?", answer: "Precision is 4/10 = 0.4. Recall is 4/5 = 0.8. You need both, because lengthening the list can raise recall while precision falls." },
        { prompt: "The only 2 relevant documents sit at ranks 1 and 3. What is the average precision?", answer: "5/6. Precision at those ranks is 1 and 2/3. Their sum is 5/3, and you divide by 2 relevant documents, which gives 5/6." },
      ]),
      lec("l5", "Gaps and variable bytes", [
        "Document identifiers in a postings list are sorted, so you can store gaps instead of the raw identifiers. The first gap is the first identifier, and each later gap is the difference from the previous identifier. The list 5, 6, 9, 20 becomes the gaps 5, 1, 3, 11. The gaps sum to 20, which is the last identifier, so you can rebuild the list by a running total.",
        "You encode each gap in as few bytes as the code allows. Seven bits of each byte hold data, and the eighth bit says whether another byte follows. A gap of 127 or less fits in 1 byte. A gap of 200 needs 2 bytes, because 200 is greater than 127. Three gaps, 4, 10, and 200, therefore cost 1 + 1 + 2 = 4 bytes. Storing the same three raw identifiers as 4-byte integers would cost 12 bytes.",
      ], { kind: "pipeline", caption: "Identifiers become short gaps.", stages: ["Sort the document ids", "Store differences as gaps", "Encode each gap in bytes", "Rebuild by a running sum"] }, "Encode three gaps", [
        "The gaps are 4, 10, and 200. Values through 127 fit in 1 byte, so 4 and 10 take 1 byte each.",
        "200 is greater than 127, so it takes 2 bytes. The three gaps cost 4 bytes.",
        "Three raw identifiers stored as 4-byte integers would cost 12 bytes. The gap encoding is smaller on this list.",
      ], [
        { prompt: "Postings are 5, 6, 9, 20. What gaps do you store, and what is their sum?", answer: "Gaps 5, 1, 3, and 11. They sum to 20, the last identifier. A running total rebuilds 5, then 6, then 9, then 20." },
        { prompt: "How many bytes do variable-byte codes use for gaps 4, 10, and 200, and how many bytes do three 4-byte integers use?", answer: "4 bytes for the gaps: 1 plus 1 plus 2, because 200 exceeds 127. Three 4-byte integers use 12 bytes." },
      ]),
      lec("l6", "Walking postings for a query", [
        "Term-at-a-time scoring finishes one query term's postings before it reads the next term. Document-at-a-time scoring walks the lists in parallel, in document-identifier order, and keeps a partial score only for the document it is on. With 3 query terms you either make 3 passes over accumulators or you advance 3 pointers together. Document-at-a-time uses less memory for accumulators when you only keep the current candidates, which matters when the collection has millions of documents and the query is short.",
        "A skip pointer jumps forward in a postings list when the other list is already past this block. Place a skip every 4 postings. A list of 16 identifiers then carries 4 skips. During AND, if the other pointer is beyond the skip target, you jump rather than compare the next 4 identifiers. The intersection does not change. You only change the number of comparisons required to produce it.",
      ], { kind: "pair", caption: "Two ways to score three terms.", leftTitle: "Term at a time", rightTitle: "Document at a time", left: ["Finish one list first", "3 passes over scores", "Accumulators stay large"], right: ["Walk lists together", "3 pointers stay in step", "Score the current doc"] }, "Four skips on a list of 16", [
        "The postings list has 16 identifiers. You place a skip every 4 postings, so there are 4 skips.",
        "During AND, the other list's head is past the end of the current block. You follow the skip instead of comparing those 4 identifiers.",
        "The emitted intersection is unchanged. You saved comparisons, not a different answer.",
      ], [
        { prompt: "A query has 3 terms. What is the difference between term-at-a-time and document-at-a-time in how you touch those lists?", answer: "Term-at-a-time finishes one term's postings before the next, which is 3 passes. Document-at-a-time advances 3 pointers together in document-identifier order and scores the current document." },
        { prompt: "A list has 16 postings and a skip every 4. How many skips is that, and does a skip change the AND result?", answer: "4 skips. The intersection does not change. A skip only avoids comparisons inside a block the other pointer has already passed." },
      ]),
      lec("l7", "One step of PageRank", [
        "Term weights ignore links. PageRank scores a page from the pages that point at it. The update is (1 - d) / N plus d times the sum of each in-neighbor's score divided by that neighbor's out-degree. With damping d = 1/2 and N = 3 pages, the teleport piece (1 - d) / N equals 1/6. You start from a uniform score of 1/3 on each page. A page still receives 1/6 even if nobody links to it.",
        "Take pages A, B, and C. A links to B and C, B links only to C, and C links only to A. One update from uniform 1/3 scores gives A = 1/3, B = 1/4, and C = 5/12. C ranks first after that step because A and B both point at C, while A must split its credit across 2 out-links. You have done 1 iteration, not a fixed point. Out-degree is what splits a page's credit.",
      ], { kind: "flow", caption: "Credit into C on one step.", steps: ["Start each page at 1/3", "A splits across 2 links", "B sends all its score to C", "C becomes 5/12"] }, "Update A, B, and C once", [
        "Teleport is 1/6 and d is 1/2. A receives only C: 1/6 + (1/2) * (1/3) = 1/3.",
        "B receives half of A, because A has 2 out-links: 1/6 + (1/2) * ((1/3) / 2) = 1/6 + 1/12 = 1/4.",
        "C receives half of A plus all of B: 1/6 + (1/2) * ((1/3) / 2 + 1/3) = 1/6 + 1/4 = 5/12. The three scores sum to 1.",
      ], [
        { prompt: "After one update from uniform 1/3, with d = 1/2, what are the scores of A, B, and C, and which page ranks first?", answer: "A is 1/3, B is 1/4, and C is 5/12. C ranks first. Those three fractions sum to 1, and this is a single iteration, not a fixed point." },
        { prompt: "Why does A send only half of its score toward C, while B sends all of its score toward C?", answer: "A has 2 out-links, so its credit is split. B has 1 out-link, so C receives B's whole score. Out-degree is the split." },
      ]),
      lec("l8", "Index, score, and measure", [
        "You can now build a small retrieval system and say whether it worked. Tokenize documents into a sorted inverted index, answer AND by intersecting postings, and rank a free-text query with tf-idf using a base-2 log. Compress the postings as gaps if you store them, and walk them document-at-a-time when the query has several terms. Judge the top 10 against a set of relevant ids and report precision and recall at that cutoff.",
        "The pieces have to use the same document identifiers. A gap list that decodes to 5, 6, 9, 20 is the same postings the intersect routine expects, not a different numbering. A tf-idf score that ranks document 2 above document 1 is not a precision. If your top 2 contains 1 relevant document and there are 4 relevant in total, precision at 2 is 1/2 and recall at 2 is 1/4.",
      ], { kind: "pipeline", caption: "From bytes to a measured list.", stages: ["Build sorted postings", "Score with tf-idf", "Cut the list at 10", "Report precision and recall"] }, "A score is not yet a precision", [
        "Document 2 scores 3 and document 1 scores 2, so the ranked order is document 2, then document 1.",
        "Suppose document 2 is relevant and document 1 is not, and 4 documents in the collection are relevant.",
        "Precision at 2 is 1/2. Recall at 2 is 1/4. Reporting only the scores 3 and 2 never states either fraction.",
      ], [
        { prompt: "Gaps decode to document ids 5, 6, 9, 20, and a second list is 4, 12. You also have tf-idf scores that rank document 2 above document 1. Which of those ids can the intersection use, and why are the scores not a precision?", answer: "The intersection can use only the decoded ids, so it looks for shared values among 5, 6, 9, 20 and 4, 12, which is empty. Document 2 and document 1 are a different numbering unless you have said they are those ids. The scores 3 and 2 are not a precision, because precision needs relevance judgments and a cutoff." },
        { prompt: "Your top 2 contains 1 relevant document, and 4 documents in the collection are relevant. What are precision at 2 and recall at 2?", answer: "Precision at 2 is 1/2. Recall at 2 is 1/4. You report both. Either fraction alone hides what the cutoff did." },
      ]),
    ],
  },

  {
    slug: "csce-676",
    lectures: [
      lec("l1", "Look at the table first", [
        "You are handed a table, and the first computation is a description, not a model. Count the rows, the columns, and the empty cells. If 15 of 100 rows leave a column empty, the missingness of that column is 0.15, and a mean computed after dropping them is a mean of 85 rows. You record 15 and 85. An algorithm that drops empty rows is no longer describing all 100.",
        "Columns also lie about scale. A measurement in the thousands and a measurement between 0 and 1 will not contribute fairly to a sum of squares. You divide each column by its own spread, or you subtract the column mean and divide by the column standard deviation, before you cluster. If one column has standard deviation 50 and another has standard deviation 2, the first column will own an unscaled Euclidean distance.",
      ], { kind: "flow", caption: "Describe the table before a model.", steps: ["Count rows, columns, and holes", "Record missingness of 0.15", "Standardize columns with huge spread", "Only then cluster or classify"] }, "A column missing in 15 rows", [
        "The table has 100 rows. One column is empty in 15 of them.",
        "Missingness is 15/100 = 0.15. A mean that drops those rows uses 85 rows, not 100.",
        "You write 15, 85, and 0.15 next to the column. A later step that refuses empty cells is describing a different population.",
      ], [
        { prompt: "15 of 100 rows leave a column empty, and you drop them before the mean. What are the missingness and the number of rows in that mean?", answer: "Missingness is 0.15. The mean uses 85 rows. You record both, because the algorithm no longer describes all 100 rows." },
        { prompt: "One column has standard deviation 50 and another has standard deviation 2. What happens to an unscaled Euclidean distance, and what do you do first?", answer: "The column with spread 50 dominates the sum of squares. You standardize, subtracting each column's mean and dividing by its own standard deviation, before you cluster." },
      ]),
      lec("l2", "Frequent itemsets and Apriori", [
        "A frequent itemset is a set of items whose support is at least a threshold you choose. Support is the fraction of transactions that contain the set. Equivalently you can count: with 4 transactions, support 0.5 means the set occurs in at least 2 transactions. Apriori's pruning rule is the mechanism that makes the search smaller. If a set occurs in only 1 transaction, every superset of it occurs in at most 1, so you never generate those supersets.",
        "You start with single items, drop those below the count, and join the survivors into pairs. Take four baskets: milk bread eggs; milk bread; bread eggs; milk eggs. With minimum count 2, milk, bread, and eggs each occur 3 times and all survive. The pairs milk-bread, milk-eggs, and bread-eggs each occur 2 times and survive. The triple milk-bread-eggs occurs in 1 basket and dies.",
      ], { kind: "pipeline", caption: "Grow sets only from frequent sets.", stages: ["Count single items", "Drop counts below 2", "Join survivors into pairs", "Stop when the triple dies"] }, "Four baskets, minimum count 2", [
        "Baskets are {milk, bread, eggs}, {milk, bread}, {bread, eggs}, and {milk, eggs}. The minimum count is 2.",
        "milk, bread, and eggs each occur 3 times. Every pair among them occurs 2 times, so all three pairs survive.",
        "The triple occurs in 1 basket. Apriori does not extend it, because every superset of an infrequent set is infrequent.",
      ], [
        { prompt: "A set occurs in 1 of 4 baskets, and the minimum count is 2. Why do you skip its supersets?", answer: "A superset cannot occur more often than the set itself, so every superset occurs in at most 1 basket. That is below 2, and Apriori never generates those supersets." },
        { prompt: "Using the four baskets and minimum count 2, which pairs survive, and what is the count of {milk, bread, eggs}?", answer: "milk-bread, milk-eggs, and bread-eggs each occur 2 times and survive. The triple occurs once, in the first basket only, so it is not frequent." },
      ]),
      lec("l3", "Confidence and lift", [
        "You split an itemset into a left side and a right side to make a rule. Confidence of X implies Y is support of X union Y divided by support of X. It answers how often Y shows up in the transactions that already have X. From the four baskets, milk and bread occur together in 2, and milk occurs in 3, so confidence of milk implies bread is 2/3.",
        "Lift compares that confidence with how common Y is anyway. Lift is confidence of X implies Y divided by support of Y. Bread occurs in 3 of 4 baskets, support 3/4. Lift of milk implies bread is (2/3) divided by (3/4), which is 8/9, a bit under 1. A lift near 1 means the rule restates the base rate. You would rather see a lift well above 1 before you treat the rule as a dependence.",
      ], { kind: "pair", caption: "Frequency is not dependence.", leftTitle: "Confidence", rightTitle: "Lift", left: ["Divide by support of X", "Milk implies bread is 2/3", "Ignores how common Y is"], right: ["Divide confidence by support of Y", "Bread already has support 3/4", "Lift is 8/9"] }, "Milk implies bread", [
        "The pair milk and bread occurs in 2 baskets. Milk occurs in 3. Confidence is 2/3.",
        "Bread occurs in 3 of 4 baskets, so its support is 3/4.",
        "Lift is (2/3) / (3/4) = 8/9, which is under 1. The pair is frequent at count 2 and still not a positive dependence.",
      ], [
        { prompt: "In the four baskets, what is the confidence of milk implies bread, and what is the support of that pair?", answer: "Confidence is 2/3, because the pair occurs in 2 baskets and milk occurs in 3. Support of the pair is 2/4 = 1/2. Confidence divides by the left side, not by all 4 baskets." },
        { prompt: "Bread's support is 3/4 and the confidence of milk implies bread is 2/3. What is the lift, and does a minimum count of 2 make this a dependence?", answer: "Lift is (2/3) / (3/4) = 8/9, which is under 1. The pair meets count 2, but lift near 1 means the rule restates the base rate. Frequency did not give you a dependence." },
      ]),
      lec("l4", "K-means on a line", [
        "K-means alternates two steps you can implement directly. Assign each row to the nearest centroid, then replace each centroid by the mean of its rows. Stop when the assignment does not change. Points 1, 2, 10, and 11, with k = 2 and initial centroids 1 and 10, form two pairs. The updated centroids are 1.5 and 10.5. The next assignment keeps those pairs, so this run stops after that update.",
        "The result depends on the initial centroids and on k, which you chose. Two different starts can produce two different partitions of the same 4 points, and the algorithm will report both as converged. You keep the partition with the smaller within-cluster sum of squares. Empty clusters are a real case: if a centroid wins 0 rows, you cannot take its mean. Place it again, or reduce k.",
      ], { kind: "flow", caption: "Assign, average, and stop.", steps: ["Start centroids at 1 and 10", "Assign each point to the nearer", "Replace centroids by means", "Stop when pairs do not move"] }, "Update 1, 2, 10, and 11", [
        "Initial centroids are 1 and 10. Points 1 and 2 are nearer to 1. Points 10 and 11 are nearer to 10.",
        "The new means are (1+2)/2 = 1.5 and (10+11)/2 = 10.5.",
        "Reassignment leaves the same pairs, so the run has converged. You do not average again unless the membership changes.",
      ], [
        { prompt: "Points are 1, 2, 10, and 11. Initial centroids are 1 and 10. What are the two means after one update?", answer: "1.5 and 10.5. The pairs are {1, 2} and {10, 11}, and each mean is the average of its pair. The next assignment does not change, so the run stops." },
        { prompt: "A centroid is assigned 0 of the 4 points. Why can you not leave it where it is and still call the update a mean?", answer: "A mean of no rows is undefined. You place that centroid again or you reduce k. Leaving the old coordinate pretends it still represents points." },
      ]),
      lec("l5", "Squared error and the choice of k", [
        "You justify a choice of k by the within-cluster sum of squared errors. For centroids 1.5 and 10.5 the four squared errors are each 0.25, so the sum is 1. One cluster around the mean 6 has sum (5 squared) + (4 squared) + (4 squared) + (5 squared) = 82. Lower is better only when k is fixed. If you set k to 4, each point is a centroid and the sum is 0, which is perfect and useless.",
        "Squared Euclidean distance is the mechanism inside that sum, so every coordinate must be on a scale you can square. Standardize 2 columns that use different units before you trust a comparison. Manhattan distance sums absolute deviations and does not square a wild coordinate. If you change the distance, the mean may no longer be the right center. K-means as stated uses squared Euclidean distance and the arithmetic mean. Keep those two together.",
      ], { kind: "pair", caption: "Same points, two values of k.", leftTitle: "k = 2", rightTitle: "k = 4", left: ["Centroids 1.5 and 10.5", "Squared error sums to 1", "A real partition"], right: ["Each point is a centroid", "Squared error sums to 0", "Perfect and useless"] }, "Sum of squares for the two pairs", [
        "Errors from 1.5 are 0.5 and 0.5. Each square is 0.25. The pair contributes 0.5.",
        "Errors from 10.5 are 0.5 and 0.5. That pair also contributes 0.5. The total is 1.",
        "The mean of all four points is 6, and one cluster around 6 has sum of squares 82. You do not compare 1 with 82 across different k as if they were the same contest.",
      ], [
        { prompt: "Centroids are 1.5 and 10.5 for points 1, 2, 10, and 11. What is the within-cluster sum of squares?", answer: "1. Each of the four errors is 0.5, each square is 0.25, and 4 times 0.25 is 1." },
        { prompt: "Why is a sum of squares of 0 at k = 4 not a reason to choose k = 4, and why is a sum of 1 on raw units not comparable to a sum of 1 after you standardize?", answer: "At k = 4 every point is its own centroid, so the sum is 0 and the partition is useless. Standardization changes the units, so a sum of 1 before it and a sum of 1 after it are not the same quantity." },
      ]),
      lec("l6", "A split and its Gini", [
        "A decision tree splits rows with a question and repeats on each side. You pick the question that reduces impurity most. Gini impurity is 1 minus the sum of squared class fractions. On 6 rows with 4 yes and 2 no, Gini is 1 minus (4/6) squared minus (2/6) squared, which equals 4/9. A pure node has Gini 0. You stop on a pure node, at a depth cap, or when a node holds fewer than 2 rows.",
        "Suppose a split makes a left node of 3 yes and 0 no, and a right node of 1 yes and 2 no. The left Gini is 0. The right Gini is 1 minus (1/3) squared minus (2/3) squared, which equals 4/9. The weighted impurity is (3/6) times 0 plus (3/6) times (4/9), which equals 2/9. The gain is the parent 4/9 minus 2/9, which is 2/9. You prefer this split to one whose gain is 0.",
      ], { kind: "layers", caption: "Parent impurity, then the two children.", rows: ["Parent Gini is 4/9", "Left child is pure, Gini 0", "Right child Gini is 4/9", "Gain after weighting is 2/9"] }, "Gain on six labeled rows", [
        "The parent has 4 yes and 2 no. Gini is 4/9.",
        "The left child has 3 yes. Its Gini is 0. The right child has 1 yes and 2 no. Its Gini is 4/9.",
        "Weight each child by 3/6. Weighted impurity is 2/9. Gain is 4/9 minus 2/9, which is 2/9.",
      ], [
        { prompt: "Six rows contain 4 yes and 2 no. What is the Gini impurity?", answer: "4/9. Compute 1 minus (4/6) squared minus (2/6) squared, which is 1 minus 16/36 minus 4/36 = 16/36 = 4/9." },
        { prompt: "The split above has weighted impurity 2/9. What is the gain, and why is a gain computed on all 6 rows not yet a test score?", answer: "Gain is 4/9 minus 2/9 = 2/9. Those 6 rows are the rows you split on, so 2/9 is an in-sample reduction. It does not say what happens on rows you have not seen." },
      ]),
      lec("l7", "A holdout, not a training score", [
        "A score on the rows you trained on is not evidence. You hold out a test set before you look at it. With 50 rows, train on 40 and test on 10. A tree that memorizes training ids can score 40/40 on the train set and 5/10 on the test set. If the majority class covers 7 of the 10 test rows, a constant predictor scores 7/10 without using any feature. Your tree lost to that constant.",
        "You do not tune the depth cap on the test set and then report that same test set as confirmation. Every time you reject a depth because of those 10 rows, the test set becomes part of training. Use a third slice, or accept that a single split of 50 rows is noisy. A rule you find by mining, such as a frequent itemset, needs the same discipline if you want to claim it will hold on new baskets.",
      ], { kind: "pair", caption: "Train score against a constant rule.", leftTitle: "Memorizing tree", rightTitle: "Majority class", left: ["Train accuracy 40/40", "Test accuracy 5/10", "Uses the training ids"], right: ["Ignores every feature", "Test accuracy 7/10", "Wins on these 10 rows"] }, "Forty rows to fit, ten to test", [
        "You randomly hold out 10 of 50 rows and fit only on the other 40.",
        "The tree is perfect on the 40 and correct on 5 of the 10. The majority class is correct on 7 of the 10.",
        "5/10 is worse than 7/10. You do not ship the tree on the strength of the 40/40.",
      ], [
        { prompt: "A tree scores 40/40 on the training rows and 5/10 on the test rows. The majority class scores 7/10 on that same test. Which predictor is better on the test, and why is 40/40 not the number you report?", answer: "The majority class is better on the test, 7/10 against 5/10. The 40/40 is a training score. A score on the rows you trained on is not evidence about new rows." },
        { prompt: "You try five depth caps and keep the one that looks best on the same 10 test rows. What did those 10 rows become?", answer: "They became part of training. Each rejection used them to choose the cap, so you cannot also report them as untouched confirmation. Use a third slice, or admit that one split of 50 rows is noisy." },
      ]),
      lec("l8", "A result you can recompute", [
        "You can now describe a table, mine frequent itemsets, score a rule by confidence and lift, cluster points with k-means, and grow a tree by Gini gain. You can also refuse a training score that was not checked on held-out rows. Itemset support answers a basket question. A tree answers a labeled question. A cluster id is not a class unless rows were labeled. Confidence on the same 4 baskets that produced the rule is not a test.",
        "Two ideas have to stay attached when you write up a result. A pair that meets minimum count 2 in 4 baskets can still have lift 8/9, under 1, so frequency did not give you a dependence. A k-means sum of squares of 1 on standardized coordinates is not comparable to a sum of squares of 1 on raw coordinates, because the units changed. You name the threshold, the distance, and the split that produced the figure.",
      ], { kind: "layers", caption: "What you can now defend.", rows: ["Support, then confidence and lift", "A k you justify by error", "A split scored by Gini gain", "A number from held-out rows"] }, "Frequency and a centroid in one writeup", [
        "The pair milk and bread meets count 2. Confidence is 2/3 and lift is 8/9. You report the lift, not only the count.",
        "The line of points converges to centroids 1.5 and 10.5 with sum of squares 1, after you have said the coordinates are already on one scale.",
        "If those points were still in mixed units, the 1 is not comparable to a 1 computed after standardization. The writeup names which sum it is.",
      ], [
        { prompt: "Milk and bread occur together in 2 of 4 baskets, milk occurs in 3, and bread occurs in 3. The pair meets minimum count 2. What are confidence and lift of milk implies bread, and does the count alone show dependence?", answer: "Confidence is 2/3. Lift is (2/3) / (3/4) = 8/9, which is under 1. The count says the pair is frequent. The lift says it restates the base rate, so the count alone is not a dependence." },
        { prompt: "Your k-means sum of squares is 1 at centroids 1.5 and 10.5, and a tree's Gini gain on all 6 labeled rows is 2/9. Which of those numbers, if either, is a test-set accuracy?", answer: "Neither. The sum of squares is a training fit of the four points, and it is comparable only at a fixed k and a fixed scaling. The gain 2/9 is an in-sample impurity drop on the same 6 rows you split. A test accuracy needs rows you held out." },
      ]),
    ],
  },
  {
    slug: "csce-679",
    lectures: [
      lec("l1", "Marks, channels, and magnitude", [
        "You encode a table by choosing a mark and a channel. Marks are points, lines, and areas. Channels include position, length, area, and color. For a quantity comparison you spend position on a common scale first, then length. Area is a weaker magnitude channel, and hue is worse still. Values 10 and 30 should become bar lengths in the ratio 1 to 3. That ratio is the claim the reader must be able to see.",
        "Radius is where area encodings go wrong. Area grows with the square of radius. If you set radii in the ratio 1 to 3 for the values 10 and 30, the areas stand in the ratio 1 to 9. You have overstated the larger value by a factor of 3. The mechanism is the square, not the reader's taste. Use a bar, or set areas, not radii, in the ratio 1 to 3.",
      ], { kind: "pair", caption: "Two encodings of 10 and 30.", leftTitle: "Bar lengths", rightTitle: "Radii set to 1 and 3", left: ["Lengths in ratio 1 to 3", "The claim stays 10 and 30"], right: ["Areas grow by the square", "The picture says 1 to 9"] }, "Do not square the ratio", [
        "The values are 10 and 30. The true ratio is 1 to 3.",
        "Bar lengths of 10 and 30 units keep that ratio.",
        "Circle radii in the ratio 1 to 3 produce areas in the ratio 1 to 9. That overstates the larger value by a factor of 3.",
      ], [
        { prompt: "Values are 10 and 30. You set circle radii in the ratio 1 to 3. What area ratio does the reader see, and by what factor is the larger value overstated?", answer: "Areas stand in the ratio 1 to 9, because area grows with the square of radius. The true value ratio is 1 to 3, so the larger value is overstated by a factor of 3." },
        { prompt: "You need the reader to compare 10 and 30. Which channel do you spend first, and what length ratio should the bars have?", answer: "Spend position on a common scale first, and if you use bars, spend length. The lengths should be in the ratio 1 to 3, matching the values." },
      ]),
      lec("l2", "Match the channel to the data type", [
        "Expressiveness means the channel can express the facts in the data and no extra facts. A nominal field has no order. If you paint it with a luminance ramp from light to dark, you invent an order the field does not have. Use distinct hues for nominal categories, and keep the count near 8. An ordinal field may use a light-to-dark ramp. A quantitative field should use position or length before you reach for color.",
        "Effectiveness means people read one channel more accurately than another for the task you set. Test a readout, not a preference. Two bars of length 10 and 30 are easier to order than two hues standing for the same numbers. A rainbow scale adds a separate failure: hue is circular, so the ends are not an order. For one continuous measure, vary lightness of a single hue. That keeps the order inside 1 channel.",
      ], { kind: "layers", caption: "Type of data, then channel.", rows: ["Nominal data get distinct hues", "Keep the hue count near 8", "Ordinal data may use lightness", "Quantities get position or length"] }, "A department code is not a magnitude", [
        "The field is a department code with 6 values and no order.",
        "A dark-to-light ramp would rank the codes. That ranking is not in the data, so the channel is not expressive.",
        "You assign 6 distinct hues. Six is near the limit of about 8, and you do not use those hues to encode the budget.",
      ], [
        { prompt: "A department code has no order. Why does a light-to-dark ramp fail expressiveness?", answer: "A ramp states an order. The codes do not have one, so the channel adds a fact the data do not contain. Use distinct hues instead, and keep the count near 8." },
        { prompt: "Why is a rainbow a bad encoding of one continuous measure, and what do you use instead?", answer: "Hue is circular, so the two ends are not an order. Vary the lightness of a single hue. That keeps the order inside 1 channel. Position or length is still the stronger magnitude channel if you have an axis free." },
      ]),
      lec("l3", "Tables, trees, and networks", [
        "Arrangement encodes relationship by proximity. You keep values that the reader must compare in a shared frame. A network can be a node-link drawing or an adjacency matrix. On 8 nodes the maximum number of undirected edges is 28. At 20 edges a node-link drawing crosses a lot, and a matrix of 8 by 8 cells still shows each edge as one mark.",
        "Order inside the arrangement is part of the encoding. If you sort heatmap rows by a quantity, adjacency in the picture means adjacency in that quantity. If you leave the rows in the order of a file dump, adjacency means nothing and the reader will still try to read it. A tree laid out with the root at the top and 4 leaves in a row states depth by vertical position.",
      ], { kind: "pair", caption: "Twenty edges on eight nodes.", leftTitle: "Node-link drawing", rightTitle: "Adjacency matrix", left: ["Crossings pile up at 20 edges", "Better for a short path"], right: ["8 by 8 cells", "Better for looking up a pair"] }, "Choose a matrix at 20 edges", [
        "You have 8 nodes. A complete undirected graph would have 28 edges. You have 20.",
        "A node-link drawing of those 20 edges crosses heavily.",
        "An 8 by 8 matrix shows each edge as a mark in a cell. You pick the matrix when the task is lookup of a pair.",
      ], [
        { prompt: "How many undirected edges can 8 nodes have at most, and why is a node-link drawing a weak default at 20 edges?", answer: "The maximum is 28, from 8 times 7 divided by 2. At 20 edges the drawing crosses a lot. A matrix of 8 by 8 cells still shows every edge." },
        { prompt: "You leave heatmap rows in file order. What does vertical adjacency mean, and what does it mean after you sort by a quantity?", answer: "In file order, adjacency means nothing, but readers will still try to read it. After you sort by a quantity, adjacency in the picture means adjacency in that quantity." },
      ]),
      lec("l4", "What the eye does first", [
        "Some channels pop out before a deliberate search. A single red point among gray points is found in a time that barely grows with the number of gray points. A single point defined only by a conjunction, red and square, among red circles and gray squares, forces a serial search. You use one pop-out channel for the thing the reader must find first. A dashboard with 12 bright colors has spent the pop-out and left the reader to scan.",
        "Contrast is local. The same gray looks lighter on black than on white, so a cell's neighbors change how you read a heatmap. Separate regions when the reader must match a cell to a legend. A small absolute gap is also easier on a short bar than on a long one: adding 1 to a bar of length 5 changes it by a fifth, and adding 1 to a bar of length 50 changes it by a fiftieth.",
      ], { kind: "pair", caption: "Pop-out against a conjunction.", leftTitle: "One red point", rightTitle: "Red and square together", left: ["Color differs alone", "Search stays fast"], right: ["Two features define the target", "Search becomes serial"] }, "A difference of 1 on two bars", [
        "Bar A has length 5. Adding 1 makes length 6, which is a change of 1/5.",
        "Bar B has length 50. Adding 1 makes length 51, which is a change of 1/50.",
        "If that gap of 1 is the claim, encode the difference directly. Do not hope the reader sees it on the long bar.",
      ], [
        { prompt: "Why can a reader find one red point among gray points faster than a point that is red and square among red circles and gray squares?", answer: "A single channel, color, pops out, and the time barely grows with the number of gray points. The red square is a conjunction, so the reader has to search serially. You spend one pop-out channel on the fact that must be found first." },
        { prompt: "You add 1 to a bar of length 5 and 1 to a bar of length 50. Which change is the larger fraction, and what should you encode if the gap of 1 is the claim?", answer: "The change on the short bar is 1/5. The change on the long bar is 1/50. Encode the difference itself, not only the raw totals, when that gap is what the reader must see." },
      ]),
      lec("l5", "Filter, select, and details", [
        "Interaction changes the subset or the detail without a new encoding design. Filter, select, and details on demand are the three mechanisms to build first. A filter keeps rows that pass a predicate, such as year = 2020, and draws only those. A brush on one chart selects marks, and a linked chart highlights the same ids. Details on demand print the raw values for 1 mark you point at.",
        "Linking is what makes two views one tool. If a click in a list does not highlight the matching point, you have two separate pictures. A filter that drops 90 of 100 rows must say that 10 remain, and a control must restore the 90. Otherwise absence looks like a property of the data. Keep the filter animation short, a few tenths of a second, so a second click is not triggered by doubt.",
      ], { kind: "flow", caption: "One filter, with a way back.", steps: ["Start from all 100 rows", "Keep the rows for 2020", "Show that 10 remain", "Offer a control that restores 90"] }, "A brush that really links", [
        "The scatter and the list share document ids. The reader brushes 4 points.",
        "The list highlights those same 4 ids. A click that does not highlight has not linked the views.",
        "Details on demand show the raw numbers for 1 of the 4. The other marks stay unlabeled.",
      ], [
        { prompt: "A filter hides 90 of 100 rows. What must the view say, and what control do you owe the reader?", answer: "It must say that 10 rows remain. A control must restore the 90. Otherwise the missing rows look like a property of the data rather than a view state." },
        { prompt: "Why is a list beside a scatter not yet one tool when a click in the list leaves the scatter unchanged?", answer: "Linking is the mechanism that makes two views one tool. Without the highlight on the matching point, you have two pictures that only share a topic." },
      ]),
      lec("l6", "Sequence and annotation", [
        "A narrative is an ordered argument made of views. You choose which comparison the reader meets first. Change one thing per step: the filter, the encoding, or the annotation. With 3 outliers, use 3 steps or one step with 3 callouts, rather than one unlabeled scatter of 200 points. A title can state the claim, for example that region 2 fell after week 4. A title that only names the chart type does not carry that claim.",
        "The reader of an interactive narrative can leave your order. That does not cancel the order. It means you also provide a scrubber or a step control with the count of steps visible, such as step 2 of 5. A reader who jumps to step 5 must still see the annotations that make step 5 true, not a chart that depended on a sentence you spoke over step 1. Put the claim on the view.",
      ], { kind: "pipeline", caption: "One change at each step.", stages: ["State the claim in the title", "Change only the filter", "Annotate region 2", "Leave the other encodings fixed"] }, "Three outliers, not one cloud", [
        "The scatter has 200 points and 3 outliers you need the reader to see.",
        "You do not dump all 200 unlabeled. You either use 3 steps or one view with 3 callouts.",
        "The title says what happened, not the chart type. A reader who opens step 2 of 5 still sees that sentence on the view.",
      ], [
        { prompt: "You have 3 outliers in a scatter of 200 points. How do you show them without changing the filter, the encoding, and the annotation in one step?", answer: "Change one thing per step. Use 3 steps, or one step with 3 callouts. Do not bury the outliers in a single unlabeled scatter, and do not retitle the view with only the chart type." },
        { prompt: "A reader jumps to step 5 of 5. Why must the claim still be written on that view?", answer: "The reader can leave your order. Step 5 cannot depend on a sentence you spoke over step 1. Put the claim on the view, and show the step count, such as step 2 of 5, on the control." },
      ]),
      lec("l7", "When a third spatial axis helps", [
        "Use a third spatial dimension when the data are spatial. A terrain or a molecule already has height and depth the reader can interpret as space. You rotate it so the face that matters points at the camera, and occlusion is a fact about the object. Extruding 5 bars makes a front bar hide a back bar, and perspective makes two equal heights look different. You spent position on a depth the data do not have.",
        "A 3D scatter is a different case from a terrain. With 40 points, some lie behind others, and a still image cannot be rotated. Prefer position for 2 attributes and lightness for the third. If you keep the 3D scatter, add a rotation the reader controls and a readout of all 3 coordinates of the point they select. A hidden point plus no readout is a missing value you introduced.",
      ], { kind: "pair", caption: "Depth that is real, and depth that is not.", leftTitle: "A molecule", rightTitle: "Five extruded bars", left: ["The third axis is space", "Rotation resolves occlusion"], right: ["The third axis is fake", "A front bar hides a back bar"] }, "Forty points and a hidden one", [
        "The scatter has 40 points in 3 coordinates. In a still image, some points sit behind others.",
        "You add a rotation the reader controls, plus a readout of all 3 coordinates of the selected point.",
        "Without that readout, a hidden point is a missing value you created. Two attributes on position and the third on lightness avoid that hole.",
      ], [
        { prompt: "Why may you use a third spatial axis for a molecule, and why not for 5 bar values?", answer: "A molecule already has spatial height and depth, and rotation treats occlusion as a fact about the object. Extruding 5 bars spends position on a depth the data do not have, hides a back bar, and makes equal heights look different under perspective." },
        { prompt: "A still 3D scatter has 40 points. What two additions keep a hidden point from becoming a missing value you introduced?", answer: "A rotation the reader controls, and a readout of all 3 coordinates of the selected point. Otherwise the hidden point has no value the reader can recover." },
      ]),
      lec("l8", "Defend an encoding", [
        "You can now choose a mark and a channel, refuse a channel that invents order, and refuse a radius that squares a ratio. You can choose a matrix for dense edges, keep 3D for spatial data, and report how many rows a filter leaves. You can order a few narrative steps so each step changes one thing. A reader should recover a ratio you encoded, such as 1 to 3, and tell a filter from a fact.",
        "You will see designs fail in combinations. A 3D bar chart of a nominal field, colored with a rainbow and filtered with no count of remaining rows, has stacked 4 mistakes. The fix uses the same stack in reverse. Put the quantity on bar length in 2D, color the nominal field with a few distinct hues, and show that the filter kept 10 of 100 rows. Add one annotation that states the claim.",
      ], { kind: "layers", caption: "Undo four stacked mistakes.", rows: ["Leave 3D for spatial data", "Put the quantity on bar length", "Paint the nominal field with hues", "Say the filter kept 10 of 100"] }, "Rebuild one bad chart", [
        "The bad chart extrudes bars, paints a department code with a rainbow, and filters without saying how many rows remain.",
        "You drop the extrusion, map the quantity to length in the ratio the data have, and give the code distinct hues.",
        "The filter reports 10 of 100. One annotation states the claim. A reader can recover the ratio and can tell the filter from the data.",
      ], [
        { prompt: "A chart encodes 10 and 30 as circle radii in the ratio 1 to 3, and it paints an unordered code with a light-to-dark ramp. What two failures are those, and what do you change?", answer: "The radii square the ratio: areas become 1 to 9, overstating the larger value by a factor of 3. Use lengths in the ratio 1 to 3. The ramp invents an order the code does not have. Use distinct hues, near a count of 8 at most." },
        { prompt: "Your fix is 2D bars, distinct hues for a nominal field, and a filter that keeps 10 of 100 rows, plus one claim in the title. Which earlier mechanisms did you combine, and what readout shows the filter is not a fact about the data?", answer: "You combined the length channel, an expressive nominal encoding, and a filter that reports its own state. The readout is the count: 10 remain and 90 were removed by the view. Without that count, absence looks like a property of the data." },
      ]),
    ],
  },

  {
    slug: "csce-632",
    lectures: [
      lec("l1", "Where the barrier sits", [
        "You need a model before you choose a fix, because the model decides where the problem sits. A medical model puts the problem in a body and treats a design change as an exception. An interaction model puts the problem in a mismatch between a person and an environment built for someone else. A door with 12 stairs is a barrier for a wheelchair user and for a person with a cart. You change the entrance.",
        "The model changes the requirement you write. A form that works only with a mouse fails the interaction model even if all 8 people in your last study used a mouse. Those 8 matched the old assumption, so they could not reveal the barrier. A keyboard path is part of the task. You also do not demand a disability disclosure before the page works, and you do not collect that disclosure if 0 features need it.",
      ], { kind: "pair", caption: "Two places to put the problem.", leftTitle: "Medical model", rightTitle: "Interaction model", left: ["The body is the problem", "The design is an exception"], right: ["The mismatch is the problem", "You change the 12 stairs"] }, "Twelve stairs and a cart", [
        "The entrance is 12 stairs and no ramp.",
        "A wheelchair user and a person with a cart both stop. The stairs are the barrier in the interaction model.",
        "Adding a ramp changes the entrance. Asking those people to identify themselves before they may enter does not.",
      ], [
        { prompt: "Your last study had 8 mouse users and the form works only with a mouse. Why does that study not clear the form?", answer: "Those 8 matched the assumption that everyone uses a mouse, so they could not reveal the barrier. Under the interaction model the keyboard path is part of the task, not an exception you defer." },
        { prompt: "A door has 12 stairs. Where does the interaction model locate the problem, and what do you change?", answer: "It locates the problem in the mismatch between the person and an entrance built for someone else. You change the entrance. The same 12 stairs also stop a person with a cart." },
      ]),
      lec("l2", "A statute points at a standard", [
        "Law and a technical standard are different layers you have to keep straight. The US ADA is a civil-rights statute, and Section 508 is a federal procurement rule. The 2017 refresh of Section 508 points federal web content at WCAG 2.0 Level AA, a list of 38 success criteria. A private shop and a federal site are not under the same rule. You name the rule that applies before you call a page covered.",
        "WCAG itself is not a statute. It becomes an obligation when a law, a contract, or a policy incorporates it. Level A is the floor, and Level AA adds criteria on top of A. You can fail AA while passing A. Contrast of body text is an AA criterion in WCAG 2.0, set at 4.5 to 1, and a page can meet 20 other criteria and still fail that one. Counting passed criteria does not average a failure away.",
      ], { kind: "layers", caption: "From a statute down to one check.", rows: ["Name the statute or the contract", "See which WCAG level it names", "Level AA adds criteria past A", "One failed criterion fails the level"] }, "Twenty passes do not erase one fail", [
        "The policy incorporates WCAG 2.0 Level AA.",
        "Body text on the page has contrast 2 to 1. The AA line for ordinary text is 4.5 to 1.",
        "You can pass 20 other criteria and still fail AA. The failure is not averaged away.",
      ], [
        { prompt: "What does the 2017 refresh of Section 508 point federal web content at, and how many success criteria is that level in WCAG 2.0?", answer: "WCAG 2.0 Level AA, a list of 38 success criteria. Section 508 is a federal procurement rule. A private shop is not under that same rule." },
        { prompt: "A page meets 20 AA criteria and fails body-text contrast at 2 to 1. Have you met Level AA?", answer: "No. Ordinary text needs 4.5 to 1 under WCAG 2.0 Level AA. You can fail AA while passing A, and counting passed criteria does not average one applicable failure away." },
      ]),
      lec("l3", "One design, more people", [
        "Universal design aims at one design that more people can use, rather than a separate door for a labeled group. A curb cut is the usual evidence: it was pressed for wheelchair users and it also helps a traveler with a suitcase. You are looking for that kind of overlap on purpose. Flexibility is one of the operating principles. A site with exactly 1 path through a form, and no way to skip a repeated block, fails flexibility.",
        "Perceptible information and tolerance for error are two further principles. You do not convey status by color alone, because someone who cannot separate the colors loses the status. Pair the color with a word. Tolerance for error means a destructive action can be undone or must be confirmed. Deleting 30 files with no undo fails that test. A confirm step, or an undo of a few seconds, is the mechanism you add.",
      ], { kind: "flow", caption: "A principle you can fail.", steps: ["Ask who else the change helps", "Offer more than 1 path", "Do not use color alone", "Confirm before deleting 30 files"] }, "Color is not the status", [
        "A form shows errors only by turning the border red.",
        "A reader who cannot separate red from the default border loses the status. You add the word 'error' beside the field.",
        "The delete control removes 30 files immediately. You add a confirm, because tolerance for error requires undo or confirmation.",
      ], [
        { prompt: "A form has exactly 1 path and no way to skip a repeated block. Which principle fails, and what would a curb-cut style change look like?", answer: "Flexibility fails. Universal design looks for one design that more people can use. A second way through, including a skip of the repeated block, is the overlap you are looking for, the way a curb cut helps more than one group." },
        { prompt: "Delete removes 30 files with no undo, and errors are shown only in red. Which two principles fail?", answer: "Tolerance for error fails on the delete, because a destructive action needs undo or a confirm. Perceptible information fails on the red border, because status by color alone is lost when the colors cannot be separated." },
      ]),
      lec("l4", "Four groups of criteria", [
        "WCAG groups criteria so you can see what kind of barrier you are looking for. Perceivable means the information is available to at least 1 sense the person can use. A photograph with no text alternative fails this group, because a screen reader has nothing to speak. Operable means the controls can be used. A widget that responds only to a hover and ignores the keyboard fails operable. A captioned video can still trap keyboard focus.",
        "Understandable means text and behavior are predictable enough to use. A form that moves focus on the first keystroke fails that group. The fourth group asks that content keep working with user agents, including assistive technologies. You meet it with markup those agents already understand, not with a picture of text. A custom control needs a name, a role, and a value. If you ship 1 div that only looks like a button, this is the group you failed.",
      ], { kind: "layers", caption: "What kind of barrier is this?", rows: ["Perceivable: a sense can reach it", "Operable: a control can be used", "Understandable: behavior is predictable", "Markup agents already understand"] }, "A caption does not free the keyboard", [
        "The video has captions, so the speech is perceivable as text.",
        "The player moves focus in and will not release it. The keyboard user cannot reach the rest of the page.",
        "That failure is operable, not perceivable. You do not close the ticket because the captions exist.",
      ], [
        { prompt: "A photograph has no text alternative. Which group fails, and why does a screen reader care?", answer: "Perceivable. The screen reader has nothing to speak, so the information is not available to a sense the person can use." },
        { prompt: "You ship 1 div that only looks like a button. Which group fails, and what three things does a custom control need?", answer: "The group about working with user agents and assistive technologies. A custom control needs a name, a role, and a value. Markup those agents already understand is the mechanism, not a picture of text." },
      ]),
      lec("l5", "The accessibility tree", [
        "A screen reader walks an accessibility tree, not your pixels. Each object needs a name a person hears, a role such as button, and a state such as checked. A native button exposes all 3. A div with a click handler and no role is easy to miss in that tree. The visible label is not automatically the name. You bind the visible text to the control, or the spoken name and the label drift apart.",
        "Keyboard use is the other half of operable. Tab moves through controls in the order you set, and the focused control has to be visible. A focused button should activate from Enter and from Space, which is 2 keys, not a mouse click. If the div listens only to click, both keys do nothing. Keep a visible focus indicator. Run 1 complete task with the mouse unplugged before you call the path done.",
      ], { kind: "pipeline", caption: "From pixels to a spoken control.", stages: ["Expose the accessibility tree", "Give a name, role, and state", "Bind the visible label", "Accept Enter and Space"] }, "A div that only looks like Search", [
        "The control is a div. The visible word is Search. There is no role and no accessible name.",
        "A screen reader walking the tree does not announce a button named Search.",
        "You set the role to button, bind the name to the visible word, and handle Enter and Space. Tab order puts it after the field, and the focus ring stays visible.",
      ], [
        { prompt: "The visible label says Search, but the accessible name is empty. Why can those two differ, and what do you bind?", answer: "The visible label is not automatically the name in the accessibility tree. You bind the visible text to the control. Otherwise the spoken name and the label drift apart." },
        { prompt: "A focused control listens only to click. What do Enter and Space do, and what test do you run before calling the path done?", answer: "Both keys do nothing. A button should activate from those 2 keys. You run 1 complete task with the mouse unplugged, and you keep a visible focus indicator." },
      ]),
      lec("l6", "Contrast, captions, and hit targets", [
        "Ordinary text under WCAG 2.0 Level AA needs contrast of at least 4.5 to 1 against its background. Large text, about 18 point regular or 14 point bold, may go down to 3 to 1. You measure the pixels on the screen, not the brand swatch from before it was lightened. Gray at 2 to 1 on white fails even when the page looks quiet. Darken the text or lighten the card. A help sentence does not raise the ratio.",
        "Captions are timed text locked to the audio. A transcript under the player is a different aid. A viewer of a 4 minute clip needs the line when it is spoken, which a transcript does not time. Later WCAG also sets a pointer target at 24 by 24 CSS pixels, with some exceptions. You miss that if the visible icon is 24 pixels and the hit region is still 10. Measure the hit region, not the picture of the icon.",
      ], { kind: "pair", caption: "Two different repairs.", leftTitle: "Contrast", rightTitle: "Target size", left: ["Ordinary text needs 4.5 to 1", "Measure the pixels", "A help note does not count"], right: ["Target at least 24 by 24", "The hit region can be 10", "Measure the hit, not the icon"] }, "Gray type on a white card", [
        "You sample the text pixel and the card pixel. The contrast is 2 to 1.",
        "Ordinary text needs 4.5 to 1. This fails, even if a designer calls the gray quiet.",
        "You darken the text until the measured ratio meets 4.5 to 1. You do not add a sentence to the help page and leave the gray.",
      ], [
        { prompt: "Body text measures 2 to 1 on white. Large text is about 18 point. Which threshold applies to the body text, and does a help sentence fix it?", answer: "Body text needs 4.5 to 1 under WCAG 2.0 Level AA. The 3 to 1 allowance is for large text, about 18 point regular or 14 point bold. A help sentence does not raise the ratio." },
        { prompt: "The icon art is 24 pixels wide and the hit region is 10 pixels. A 4 minute clip has a transcript but no captions. What fails?", answer: "The hit target fails if the requirement is 24 by 24 CSS pixels, because you measure the hit region, not the picture. Captions also fail: a transcript is not timed text, and a viewer of the 4 minute clip needs the line when it is spoken." },
      ]),
      lec("l7", "An audit and ten papers", [
        "An automated scan is a filter, not an audit. It can catch a missing text alternative and a contrast ratio. It cannot see that tab order jumps from the header to the footer and skips the form. Run the scanner, then do 1 task by keyboard and 1 task with a screen reader. A page can show 6 machine-reported failures and still hide 3 focus-order bugs you only find by hand. Record 9.",
        "The literature half is yours to write. Pick 10 papers on one question, such as how screen-reader users complete a checkout, and build a matrix. Rows are papers. Columns are the population, the task, the method, and the claim, which is 4 columns. A paragraph that only praises the topic has not used the 10. You want the disagreement: two studies of the same task with different error counts.",
      ], { kind: "pipeline", caption: "A scan, then two manual passes.", stages: ["Run the automated scan", "Finish 1 keyboard task", "Finish 1 screen-reader task", "Add the bugs the scan missed"] }, "Six from the tool, three from you", [
        "The scanner reports 6 contrast failures and 0 keyboard failures.",
        "Your keyboard pass finds 3 focus-order bugs. The screen-reader pass confirms the search control has no name.",
        "You record 9, not 6. The literature matrix is a separate product: 10 papers, 4 columns, one question.",
      ], [
        { prompt: "The scanner reports 6 failures and your keyboard pass finds 3 more. What total do you record, and why is 6 not the audit?", answer: "You record 9. An automated scan is a filter. It misses focus-order bugs, so its 6 was never the full set." },
        { prompt: "What belongs in the matrix for 10 papers, and why is a paragraph of praise not a review?", answer: "Rows are the 10 papers. Columns are population, task, method, and claim, which is 4 columns. Praise does not use those cells. You are looking for disagreement, such as two studies of one task with different error counts." },
      ]),
      lec("l8", "A criterion plus an observation", [
        "You can now name the model a design assumes, the rule that pulls in a standard, and the criterion a page fails. You can check contrast, walk a keyboard path, and require a name, a role, and a state on a control. You can reduce 10 papers to a matrix of population, task, method, and claim. A finding names a criterion and an observation. A nameless div used as search is a finding, because the tree has nothing to announce.",
        "Keep the legal layer and the tree on separate lines. Under WCAG 2.0 Level AA, body text at 2 to 1 contrast fails even when the button name is correct. Contrast at 7 to 1 does not repair a button with no accessible name. You file those as 2 failures because a team will fix one and close the ticket. The paper matrix can tell you whether the name should match the visible word.",
      ], { kind: "layers", caption: "What a finding has to contain.", rows: ["The model you are using", "The rule that applies", "The criterion that failed", "The observation, not a mood"] }, "Two failures, one ticket", [
        "Body text measures 2 to 1. The search control is a div with no accessible name.",
        "Under WCAG 2.0 Level AA those are 2 failures. Contrast at 7 to 1 would fix only the first.",
        "You file both. The matrix of 10 papers may tell you the name should be the visible word Search, and the audit says this page does not expose that name.",
      ], [
        { prompt: "Body text is 2 to 1 and the search control has a correct accessible name. Under WCAG 2.0 Level AA, is the page done?", answer: "No. Body text fails the 4.5 to 1 contrast criterion even when the name is correct. A correct name does not repair contrast, and you do not average the failure away." },
        { prompt: "Contrast is 7 to 1 and the search control is a div with no name. Combine the standard and the tree: how many failures do you file, and why will one fix not close both?", answer: "You file 2 failures. Contrast at 7 to 1 can satisfy the contrast criterion and still leave the tree with nothing to announce. A team that fixes only contrast will close the ticket too early. The name is a separate criterion." },
      ]),
    ],
  },
  {
    slug: "csce-634",
    lectures: [
      lec("l1", "The adaptation loop", [
        "An intelligent interface changes from evidence about this user, not only from a design that was frozen. The loop has 4 beats. You observe an action, infer a small belief, adapt the interface, and take the user's reaction as the next observation. A menu of 12 commands that promotes the 4 most used ones is that loop in miniature. A cutoff between 9 uses and 8 uses is sharp and can be wrong tomorrow.",
        "Adaptation has a cost the static menu does not. The command the user wants may have moved. If they look in the old slot and the command is now 3 places lower, the system has added search time in order to save search time for a more common command. You should move a command when the frequency gap is large, and you should keep a stable way to find all 12, such as a full list that does not reorder.",
      ], { kind: "flow", caption: "Four beats, then the user reacts.", steps: ["Observe the command", "Infer a small belief", "Reorder the top 4", "Read the next action"] }, "Promote four of twelve", [
        "The menu has 12 commands. Over the window you counted, four of them dominate.",
        "You promote those 4. The command in fifth place, used 8 times against the fourth place's 9, stays in the stable list.",
        "The stable list still shows all 12 in a fixed order. A user who needs the rare command once can find it without searching a moving menu.",
      ], [
        { prompt: "A menu of 12 promotes the 4 most used commands. The fourth was used 9 times and the fifth 8 times. What is wrong with treating that cutoff as stable truth?", answer: "The gap is 1 use. The loop will reorder on a sharp cutoff that can be wrong tomorrow. Keep a stable list of all 12 so the rare command does not have to be hunted after it moves." },
        { prompt: "Why can promoting a command add search time?", answer: "The wanted command may now sit 3 places lower than the slot the user remembers. The system spent the user's search time to save search time on a more common command. Move a command only when the frequency gap is large." },
      ]),
      lec("l2", "Stereotypes and overlays", [
        "A user model is what the system stores and then acts on. A stereotype is a bundle of defaults for a group, such as a novice who gets short labels and extra confirms. An overlay records where this person differs. If the stereotype assumes metric units and the user chooses imperial on 4 forms, you store imperial on the overlay and leave the stereotype alone. The working model is the stereotype plus the overlay. On a conflict, the overlay wins.",
        "You should say which observations move someone out of a stereotype. A usable rule is numeric: after 20 finished tasks with fewer than 2 errors, drop the extra confirms. The overlay can be wrong too. Four imperial choices might be one assignment, not a lasting preference. Decay those 4, or let the user edit them, so old observations do not govern a later task. A model you cannot inspect will keep applying a stereotype the person has already left.",
      ], { kind: "layers", caption: "What the system believes.", rows: ["Stereotype: defaults for a group", "Overlay: where this person differs", "Overlay wins on a conflict", "Decay or edit stale observations"] }, "Four imperial choices", [
        "The novice stereotype stores metric units and extra confirms.",
        "The user picks imperial on 4 forms. You write imperial on the overlay. Other novices stay metric.",
        "On the next form the overlay wins, so the default is imperial. If those 4 picks were one assignment, the user can clear them.",
      ], [
        { prompt: "The stereotype says metric, and the overlay says imperial after 4 forms. Which value do you use, and do you change the stereotype?", answer: "You use imperial. On a conflict the overlay wins. The stereotype stays metric for everyone else." },
        { prompt: "What numeric rule drops the extra novice confirms, and why should 4 imperial picks be allowed to decay?", answer: "After 20 finished tasks with fewer than 2 errors, drop the extra confirms. Four imperial picks may be one assignment, not a preference. If they never decay and cannot be edited, they govern a later task for the wrong reason." },
      ]),
      lec("l3", "Predicting the next action", [
        "A task model is a distribution over the next action given the recent ones. You can estimate it by counts. After File, suppose Save was chosen in 7 of the last 10 times. A predictor that always offers Save is then right 0.7 of the time in that context. A fancier model must beat 0.7 on actions you did not fit. If it scores 0.65, ship the counts. The mechanism is that conditional frequency.",
        "You can spend a prediction on a highlight, a prefetch, or an automatic action, and those costs differ. Highlighting Save is cheap to ignore. Prefetching a 200 megabyte file because the frequency is 0.7 can be the wrong spend on a slow link. Match the intervention to the cost of a miss. When a wrong action is expensive, do not let a 7 out of 10 count trigger it alone.",
      ], { kind: "pair", caption: "Same 0.7, two different spends.", leftTitle: "Highlight Save", rightTitle: "Prefetch 200 megabytes", left: ["Cheap to ignore", "0.7 can be enough"], right: ["Costly if wrong", "Wait for a higher count"] }, "Seven saves out of ten", [
        "In the last 10 times the user opened File, Save followed 7 times. The conditional frequency is 0.7.",
        "A model that scores 0.65 on held-out actions loses to always offering Save. You ship the counts.",
        "You highlight Save. You do not prefetch a 200 megabyte file on that same 0.7, because a miss is expensive.",
      ], [
        { prompt: "Save follows File in 7 of the last 10 times. A learned model scores 0.65 on held-out actions in that context. Which do you ship?", answer: "Ship the counts. Always offering Save is right 0.7 of the time, and 0.65 does not beat 0.7. The mechanism is the conditional frequency." },
        { prompt: "Why may the same 0.7 justify a highlight and not a 200 megabyte prefetch?", answer: "A highlight is cheap to ignore. A prefetch of 200 megabytes on a slow link is not, if the true next file is different. Match the intervention to the cost of a miss. Do not let 7 out of 10 trigger an expensive act alone." },
      ]),
      lec("l4", "The environment is not a preference", [
        "The environment is what is true around the task and is not a lasting preference. Device width, place, and time of day are ordinary features. You can switch to a one-handed layout when the viewport is under 400 pixels and keep a denser layout otherwise. That rule uses 1 measurement. Do not write 'likes mobile' into the user model because someone used a phone once. The width belongs to that situation, not to the preference overlay.",
        "Environment features go stale faster than a stereotype. A location that is 30 minutes old may be a different building. You store the time of the reading and you skip the adaptation when the age passes a limit, such as 2 minutes for a driving signal. Enlarging every control because of a stale driving flag is worse than doing nothing. If the sensor is not allowed, you do not guess the place.",
      ], { kind: "pair", caption: "Preference versus situation.", leftTitle: "Overlay", rightTitle: "Environment", left: ["Imperial after 4 forms", "Decays slowly", "A lasting difference"], right: ["Width under 400 pixels", "Stale after a few minutes", "Not an identity"] }, "A width is not a taste", [
        "The viewport is 360 pixels, under the 400 pixel line, so you show the one-handed layout.",
        "You do not store 'likes mobile' on the overlay. Tomorrow's desk at 1200 pixels is a new situation.",
        "A driving flag older than 2 minutes does not enlarge the controls. If location was never allowed, you do not invent a place.",
      ], [
        { prompt: "The viewport is 360 pixels once, at 8 in the morning. Why do you not store 'likes mobile' on the overlay?", answer: "Width is an environment feature, one measurement, not a lasting preference. The one-handed layout applies while the viewport is under 400 pixels. The overlay should not inherit that width as identity." },
        { prompt: "A driving signal is 30 minutes old, and your limit for that signal is 2 minutes. What do you do?", answer: "You skip the adaptation. A reading that old may be a different situation, and enlarging every control from a stale flag is worse than doing nothing. You stored the time so you can apply the limit." },
      ]),
      lec("l5", "Act only past a threshold", [
        "Mixed initiative means both you and the system can take the next step. The system acts alone only when confidence clears a threshold you set. A highlight may be allowed at 0.7. Deleting a file should wait for something stricter, such as 0.9. If 20 predictions arrive and 5 of them are at or above 0.9, the system acts on those 5 and leaves the other 15 as suggestions. The threshold is a design choice.",
        "Asking has a cost. A dialog on every uncertain step trains people to click through, and the threshold stops mattering. You budget the interruptions: at most 1 ask per 10 actions, and otherwise use a suggestion that does not block. A false act does the wrong thing. A false ask interrupts a step the user already intended. If the log shows 15 false asks and 1 false act, the asks are too heavy or too frequent for this task.",
      ], { kind: "flow", caption: "Confidence decides who acts.", steps: ["Score the next action", "Highlight at 0.7", "Act only at 0.9 or above", "Ask at most 1 time in 10"] }, "Five acts out of twenty", [
        "You set highlight at 0.7 and auto-act at 0.9. Deleting a file uses the stricter line.",
        "Of 20 predictions, 5 are at or above 0.9. The system acts on those 5.",
        "The other 15 stay suggestions. If the log later shows 15 false asks and 1 false act, you made asking too common.",
      ], [
        { prompt: "Of 20 predictions, 5 are at or above 0.9 and the rest are between 0.7 and 0.9. How many automatic acts, and how many highlights, does this rule produce if highlight starts at 0.7?", answer: "The system acts on the 5 predictions at or above 0.9. The other 15 are at least 0.7 and below 0.9, so they are highlights or suggestions, not acts. A delete still uses the 0.9 line." },
        { prompt: "The log shows 15 false asks and 1 false act, with a budget of 1 ask per 10 actions. What does that log say about the asks?", answer: "The asks are too heavy or too frequent. A dialog trains people to click through, and then the threshold stops mattering. A false ask interrupts a step the user already intended. One false act against 15 false asks is a timid or heavy ask, not a careful act." },
      ]),
      lec("l6", "Compare adaptive with static", [
        "You do not judge an adaptive interface by asking whether it feels smart. Compare it with a static interface on the same tasks. In a small study, 6 people use the adaptive menu and 6 use the stable one. Suppose the adaptive mean is 40 seconds and the static mean is 55. The gap is 15 seconds on this sample. You still have to see the spread, and you have to see the trials where the prediction was wrong.",
        "Count wrong adaptations separately. Suppose the 6 adaptive users make 8 task errors and need 3 recoveries when the guess is wrong. The 6 static users make 14 task errors and 0 such recoveries. Adding recoveries gives 11 events against 14. The adaptive side is still lower, but the 3 recoveries were part of the price. A gain on the first try that disappears by try 5 is a novelty effect. You are not done if you timed try 1.",
      ], { kind: "pair", caption: "Count the recovery, not only the clock.", leftTitle: "Adaptive, 6 people", rightTitle: "Static, 6 people", left: ["Mean time 40 seconds", "8 errors plus 3 recoveries", "11 costly events"], right: ["Mean time 55 seconds", "14 errors, 0 recoveries", "14 costly events"] }, "Eleven events against fourteen", [
        "Adaptive users: 8 task errors and 3 recoveries. Sum is 11.",
        "Static users: 14 task errors and 0 recoveries. Sum is 14.",
        "The adaptive side is lower by 3 events, and only if you counted the recoveries. The 15 second gap, 55 minus 40, is a sample description, not by itself a ship decision.",
      ], [
        { prompt: "Adaptive mean time is 40 seconds and static mean time is 55 seconds, with 6 people in each condition. What is the gap, and why is it not yet a decision to ship?", answer: "The gap is 15 seconds. It describes this sample. You still need the spread and the trials where the prediction was wrong. Feeling smart is not the comparison." },
        { prompt: "Adaptive users make 8 task errors and 3 recoveries. Static users make 14 task errors and 0 recoveries. What are the two event totals, and what does a gain that dies by try 5 mean?", answer: "Adaptive events are 8 + 3 = 11. Static events are 14. The adaptive side is lower only when the 3 recoveries are included. A gain that is gone by try 5 is a novelty effect, so timing only try 1 is not done." },
      ]),
      lec("l7", "Inspect, undo, and delete the log", [
        "The user must be able to see why the interface changed and to undo it. Scrutability means you can open the model. For the menu, the belief to show is that 4 commands were the most frequent over the last 30 days. If you cannot show that sentence, you do not yet understand the adaptation. Undo is one action that restores the previous order. A wrong change with no override is a loss of control.",
        "The model is personal data. Thirty days of commands can reveal a job or a habit, so you set a retention limit before you collect. If the limit is 30 days, the next day drops the oldest day instead of growing an archive. A design that needs a year of logs is a different product from one that needs 7 days, and you should not take the year quietly. Give a control that clears the overlay and returns the stereotype.",
      ], { kind: "flow", caption: "A belief the user can read.", steps: ["Show the sentence that fired", "Name the 30-day window", "Undo in one action", "Drop day 1 when day 31 arrives"] }, "Why the menu moved", [
        "The menu promoted 4 commands. The sentence you show is that those 4 were the most frequent over 30 days.",
        "One action restores the previous order. If you cannot write the sentence, you do not ship the reorder.",
        "On day 31 the oldest day is deleted. A control clears the overlay and the person returns to the stereotype.",
      ], [
        { prompt: "What sentence must you be able to show for a menu that promoted 4 commands, and what does undo do?", answer: "That those 4 commands were the most frequent over the last 30 days. Undo is one action that restores the previous order. A wrong change with no override is a loss of control." },
        { prompt: "The retention limit is 30 days. What happens on the next day, and why is a quiet year of logs a different product from 7 days?", answer: "The oldest day is dropped instead of growing an archive. A year of commands and 7 days of commands are different products. You set the limit before you collect, and you do not take the year quietly." },
      ]),
      lec("l8", "Specify the loop before you animate", [
        "You can now specify an adaptive loop. Name what you observe, whether the belief is a stereotype, an overlay, a next-action count, or an environment feature, and what changes on screen. Set a threshold so a 0.7 guess highlights and a 0.9 guess acts. Compare the result with a static version using time, errors, and recoveries. Say how the user inspects the belief, undoes it, and how many days the log lives.",
        "The task model said Save follows File 7 times out of 10, which is 0.7, and the mixed-initiative rule said you only auto-act at 0.9. You therefore highlight Save and you do not send or delete anything. If the environment sensor is stale by 30 minutes, you also do not let it override that decision. Keep the 0.9 bar even if the overlay says the user is an expert.",
      ], { kind: "layers", caption: "The design, not the animation.", rows: ["What you observe", "Which belief you store", "The threshold for an act", "Inspect, undo, and retention"] }, "Highlight, do not send", [
        "Save follows File in 7 of 10 cases, so the task frequency is 0.7.",
        "The act threshold is 0.9. You highlight Save. You do not send the message.",
        "A driving or location reading 30 minutes old does not change that. An expert overlay may remove extra confirms and still may not lower the 0.9 bar for a destructive act.",
      ], [
        { prompt: "Save follows File 7 times out of 10. Your highlight threshold is 0.7 and your act threshold is 0.9. What does the interface do, and why does an expert overlay not let it send the message?", answer: "It highlights Save and does not send or delete. 0.7 clears the highlight and misses 0.9. The overlay may mark the user as an expert and remove extra confirms, but the lecture keeps the 0.9 bar for a destructive act." },
        { prompt: "Combine the task count with a stale environment reading. The frequency is 0.7 and the location reading is 30 minutes old, past a 2 minute limit. What may change on screen?", answer: "You may highlight from the 0.7 task count. You do not let the 30 minute location reading override that decision or trigger its own adaptation. Stale environment features are skipped. The act threshold of 0.9 still blocks an automatic send." },
      ]),
    ],
  },

  {
    slug: "csce-656",
    lectures: [
      lec("l1", "The reader finishes the work", [
        "A fixed film plays the same way for each viewer. An interactive work does not, because the reader supplies actions and those actions select among prepared possibilities. If there are 3 endings, the author wrote 3 outcomes and a rule that picks one. You are that reader when you study a piece, and you are the author when you write the rule. Three unlabeled links with no memory are a menu.",
        "You are designing a space of performances, not one fixed performance. Decide what the reader may change. A piece that lets someone reorder 4 stanzas gives away order and keeps the words. A piece that lets someone replace the words gives away more. Write that split down before you build. Otherwise you will call a legal play cheating. If the rule never forbade the action, the reader did not break it.",
      ], { kind: "pair", caption: "What the author kept.", leftTitle: "Reorder 4 stanzas", rightTitle: "Replace the words", left: ["Order is given away", "The words stay fixed"], right: ["The words are given away", "The rule must say so"] }, "Three endings are a rule", [
        "The piece has 3 endings. Each ending is text the author wrote.",
        "A state variable, call it path, selects among them. The reader does not invent a fourth ending.",
        "If path is never stored, the 3 links are a menu that forgets the reader. You write the rule before you call the forgetfulness a mystery.",
      ], [
        { prompt: "A piece offers 3 endings and stores nothing. What did the author actually write, and why is a reader who takes an unlabeled link not cheating?", answer: "The author wrote 3 outcomes and, if any, a rule that picks one. With no memory the links are a menu. If the rule never forbade the action, the reader did not break it. Cheating is often an underspecified rule." },
        { prompt: "Reordering 4 stanzas and replacing the words are different gifts. What did the author keep in the first case?", answer: "The words. Order was given away and the words stayed. Replacing the words gives away more. You write that split down before you build." },
      ]),
      lec("l2", "State, choice, and time", [
        "State is memory of what already happened in this performance. A link that appears only after 2 visits is state, not a brand-new page. You keep a counter, and you decide whether the reader can see it. Hidden state pushes experiment. Visible state lets the reader plan. If a scene advances after 10 seconds unless the reader acts, a slow reader and a fast reader get different works.",
        "Choice without state is a branch that forgets you. Choice with state is a branch that changes what exists later. A locked door that opens after the reader picks up 1 key is the second kind. If you forget to record the key, the door code is a bug, not a mystery. A key that must be used within 3 turns is a state variable plus a clock. Write both variables down or the piece is not designed yet.",
      ], { kind: "layers", caption: "What the performance remembers.", rows: ["A counter of visits", "A key flag, held or not", "Turns left, an integer", "Whether the reader can see them"] }, "A door and a 3-turn key", [
        "The reader picks up 1 key. You store held = true. The door checks that flag.",
        "Turns left starts at 3. Each move subtracts 1. At 0 the key is no longer accepted.",
        "If you never stored held, the door fails for a reader who did pick up the key. That is a bug. The missing variable is not a mystery.",
      ], [
        { prompt: "A link appears only after 2 visits, and the counter is hidden. What kind of pressure does that put on the reader, compared with a visible counter?", answer: "Hidden state pushes experiment. Visible state lets the reader plan. The link is state, not a new page, because it depends on a counter you keep." },
        { prompt: "The door should open for 1 key, and the key dies after 3 turns. Which variables do you write down?", answer: "A flag for whether the key is held, and an integer for turns left. If you forget the flag, a door that stays shut is a bug, not a mystery. If you cannot list the variables, the piece is not designed yet." },
      ]),
      lec("l3", "Nodes, links, and guards", [
        "Hypertext is a graph of nodes and directed links. Four nodes in a cycle, A to B to C to D and back to A, can trap a reader who has no way out. A back command is a stack of the nodes this reader visited, not a guess about which node links here. If 2 nodes link to the current page, a guess can pick the wrong one. You implement the stack, with depth up to the path length.",
        "A link can carry a guard, a predicate on state. The link from A to C that requires B is that kind of edge. Guards plus a cycle are how you delay an ending, and also how you make an ending unreachable. If a guard demands 3 visits and the only path offers 2, the link never fires. Trace 1 path and mark which guards become true. An unreachable node is an authoring error unless you planned a secret.",
      ], { kind: "flow", caption: "Back follows the path taken.", steps: ["Push each node you visit", "Two links can enter one node", "Pop the stack for back", "Do not guess the parent"] }, "A guard that asks for three visits", [
        "The only path visits the guarded node twice. The guard requires 3 visits.",
        "The link never fires. You mark the guard false along that path.",
        "The ending node is unreachable. Unless you planned a secret you can still reach, that node is an authoring error.",
      ], [
        { prompt: "Nodes B and D both link to C. The reader came from B. Why can 'go to the node that links here' implement back incorrectly?", answer: "Two nodes link to C, so a guess can pick D. Back is a stack of the nodes this reader visited. You pop B, the node actually used, and the stack depth follows the path length." },
        { prompt: "A guard demands 3 visits and the only path offers 2. What happens to the link, and what do you call the node it was supposed to open?", answer: "The link never fires. Trace that 1 path and the guard stays false. The node is unreachable, which is an authoring error unless you planned a secret you can still reach." },
      ]),
      lec("l4", "Rules that write instances", [
        "Procedural authorship means you write rules and the system writes instances. A generator with 5 sentence templates and 8 nouns has 40 candidates if every noun fits every template. Constraints throw candidates away. If 10 pairs break a constraint, for example a plural noun in a template that demands a singular verb, 30 candidates remain. You do not advertise 40 works. You have 30, and some of those 30 may still be nonsense the constraint failed to catch.",
        "A generated instance may be one nobody has seen, including you. The constraint set is the reason it is still acceptable, not a hope you check later. Give the reader a way to draw again and a way to stop. Another draw from the same 30 is part of the work. An endless stream with no stop is you refusing to choose. The reader cannot be responsible for an unbounded pile you did not bound.",
      ], { kind: "pipeline", caption: "Candidates, then a constraint.", stages: ["5 templates times 8 nouns", "40 candidates before rules", "Reject 10 broken pairs", "30 instances remain"] }, "Forty candidates, thirty left", [
        "5 templates and 8 nouns give 40 pairs if every noun fits every template.",
        "10 pairs put a plural noun in a singular template. You reject those 10.",
        "30 remain. You read a sample of those 30, because a constraint can miss nonsense. You do not claim 40 works.",
      ], [
        { prompt: "5 templates and 8 nouns start at 40 candidates, and 10 pairs break a constraint. How many instances do you have, and why not 40?", answer: "30. You subtract the 10 rejected pairs. Advertising 40 counts candidates the constraint already threw away." },
        { prompt: "Why does a regenerate control need a stop, if each draw is one of the same 30?", answer: "Another draw from those 30 is part of the work. An endless stream is you refusing to choose. The reader is not responsible for an unbounded pile you did not bound." },
      ]),
      lec("l5", "Name the reader you actually have", [
        "Name the reader's role or you will grade the wrong behavior. An explorer is rewarded for coverage of a space. A chooser is rewarded for a consequence of a branch. A co-author adds text you keep. The same graph of 4 nodes is a different work in each role. If you wanted a chooser and nothing later changes, you built extra clicks. Write the role in 1 sentence before you add a feature.",
        "Then look at logs, because the role you named may not be the role you have. Suppose 20 sessions start at the first node and 15 of them never open the second node. Three quarters of your readers are not explorers of the graph. They are readers of a single page. You change the first node, or you change your claim. Do not add a fifth node behind the second if most people never arrive.",
      ], { kind: "pair", caption: "The reader you named, and the log.", leftTitle: "Claimed role", rightTitle: "20 sessions", left: ["You wanted an explorer", "4 nodes to cover"], right: ["15 never open node 2", "They read one page"] }, "Fifteen sessions stop early", [
        "You claimed the reader is an explorer of 4 nodes.",
        "The log has 20 sessions. 15 never open the second node, so only 5 get further.",
        "You change the first node or you drop the explorer claim. A new node behind node 2 does not serve the 15.",
      ], [
        { prompt: "You wanted a chooser, and no later node changes after a link. What did you build?", answer: "Extra clicks. A chooser is rewarded for a consequence. If nothing later changes, the same 4-node graph is an explorer with nowhere new to go, or a menu. Write the role in 1 sentence before you add a feature." },
        { prompt: "Of 20 sessions, 15 never open the second node. What fraction never continues, and what do you not add?", answer: "15/20, which is 3/4, never open node 2. They are readers of one page, not explorers. You do not add another node behind the second. You change the first node or you change the claim." },
      ]),
      lec("l6", "One mechanic, and a log", [
        "You learn this by making a small piece. Scope it to 1 screen, 1 interaction, and 1 state variable you can name. In a frame-based sketch running at 60 frames a second, a beat of 10 seconds is 600 frames. Count frames rather than hoping a pause is exact. The sketch has to argue something about the reader. If you cannot name the action the reader is allowed to take, you are decorating.",
        "Keep a log, which is the seminar half. Each entry is one piece you could open, answering 4 questions: what the reader can do, what is remembered, what is refused, and who the reader is. Two entries can be compared only if they answer those same questions. A note that only praises a mood has not said whether any state exists. After 6 entries you should spot a missing rule faster.",
      ], { kind: "pipeline", caption: "A sketch small enough to finish.", stages: ["One screen", "One interaction", "One named variable", "A log of 4 questions"] }, "Ten seconds as frames", [
        "The draw loop runs at 60 frames a second.",
        "A beat of 10 seconds is 60 times 10 = 600 frames. You count frames.",
        "The one state variable might be frames-until-advance. If you cannot name the reader's action, stop adding shapes.",
      ], [
        { prompt: "The sketch runs at 60 frames a second. How many frames is a 10 second beat, and why not a pause you hope is exact?", answer: "600 frames, because 60 times 10 is 600. You count frames. A hoped pause is not the mechanism, and the sketch still needs 1 named state variable and 1 action the reader may take." },
        { prompt: "What 4 questions does a log entry answer, and why is a mood note not an entry?", answer: "What the reader can do, what is remembered, what is refused, and who the reader is. A mood note does not say whether any state exists. After 6 entries that answer those questions, a missing rule is easier to spot." },
      ]),
      lec("l7", "Three questions, in writing", [
        "A critique tests the rule. Open the work and write three answers. What can the reader do in the first 30 seconds. What is remembered after that action. What is refused, including a control that looks alive and does nothing. If you cannot answer the memory question, the work is stateless or it hides state, and you should say which. Ask the same 3 questions of a second work before you call the first one unusual.",
        "Include your own limit as data. If a timer of 10 seconds makes you miss the choice, that is evidence about the time rule. If in 5 attempts you use only 1 of 4 links, you are the reader who never leaves the first node. A critique that only repeats the author's intention ignores that evidence. You have the behavior in front of you. Use the 5 attempts.",
      ], { kind: "flow", caption: "Ask, then ask again.", steps: ["What can the reader do", "What is remembered", "What is refused", "Ask a second work the same 3"] }, "Five attempts, one link", [
        "You play the piece 5 times. Each time you have 4 links and you use 1.",
        "That matches a log in which readers never leave the first node. The finding is about the first node, not about your taste.",
        "A timer of 10 seconds that makes you miss a choice is evidence about the time rule. You write it down as data.",
      ], [
        { prompt: "You cannot say what the piece remembers after the first action. What are the two possibilities, and why do you ask a second work the same questions?", answer: "The work is stateless, or it hides state. You should say which. The same 3 questions on a second work stop you from calling the first one unusual before you have a comparison." },
        { prompt: "In 5 attempts you use 1 of 4 links, and a 10 second timer makes you miss a choice. What are those observations evidence about?", answer: "The single link is evidence that you are the reader who stays on the first node. The miss is evidence about the time rule, not a personal apology. A critique that only repeats the author's intention ignores both." },
      ]),
      lec("l8", "Specify the work and its reader", [
        "You can now specify a small interactive work and name its reader. You can list the state variables, the guards on links, and the time rule, and you can say whether a generator's 40 candidates survived a constraint. You can say whether the reader is an explorer, a chooser, or a co-author, and you can check that claim against a count of sessions. You can critique a piece with the 3 questions of action, memory, and refusal.",
        "The state rule says a link appears after 2 visits. The log says 15 of 20 sessions never make the second visit, so the link's condition is unreachable for those readers. You either change the first node so more than 5 sessions arrive, or you stop claiming the link is part of the work the reader actually gets. A constraint that 10 of 40 draws still violate is the same kind of gap.",
      ], { kind: "layers", caption: "A specification you can check.", rows: ["State variables and guards", "The reader role, in one line", "A log that can falsify it", "Action, memory, and refusal"] }, "A link the log never reaches", [
        "The rule shows a link after 2 visits. That is state, a counter.",
        "Of 20 sessions, 15 never make visit 2, so only 5 can see the link.",
        "You change the first node or you stop claiming the link is part of the work those 15 get. The same test applies if 10 of 40 generated draws still break a constraint the reader can trigger.",
      ], [
        { prompt: "A link requires 2 visits. In 20 sessions, 15 never open the second node. How many sessions can see the link, and what do you change?", answer: "5 sessions, because 20 minus 15 is 5. For the other 15 the link is unreachable. You change the first node so more sessions arrive, or you stop claiming the link is part of the work the reader gets. That combines the state rule with the log." },
        { prompt: "A generator offers 40 candidates and 10 still violate a constraint the reader can trigger. How is that the same failure as the unreachable link?", answer: "You advertised a rule that is not in the piece. 30 candidates may be legal, but the 10 the reader can still trigger mean the constraint lives in your notes. As with the link, you either enforce the rule or you stop claiming it." },
      ]),
    ],
  },
  {
    slug: "csce-671",
    lectures: [
      lec("l1", "Three ideas that are still questions", [
        "Keep the idea from each historical system, not the hardware list. In 1945 Bush described the Memex as trails that link documents, an associative path rather than a pile of files. In 1963 Sutherland's Sketchpad let a person edit a drawing while constraints updated related geometry. One bets on links between records. The other bets on a picture that stays consistent as you drag it. You should know which bet your screen inherited.",
        "Engelbart's 1968 demo put a mouse, a chorded keyset, and a shared view in front of a group. Keep the claim about augmentation, not the novelty of the mouse. A tool can make a new task possible and make an old task harder at the same time. You ask both questions. If you remember only the pointing device, you have stored a product fact and lost the 1968 argument.",
      ], { kind: "layers", caption: "Three dates, three claims.", rows: ["1945: trails between documents", "1963: a picture under constraints", "1968: a group, not only a mouse", "Ask what task became possible"] }, "Which bet the screen inherited", [
        "A document reader stores associative trails between notes. That is the 1945 bet, links between records.",
        "A drawing tool updates a second shape when you drag the first, because a constraint still holds. That is the 1963 bet.",
        "A shared cursor in a meeting is closer to the 1968 claim, augmentation of a group. Remembering only the mouse drops that claim.",
      ], [
        { prompt: "What idea do you keep from the 1945 Memex, and what idea do you keep from the 1963 Sketchpad, if you refuse a gadget list?", answer: "From 1945, trails that link documents, an associative path rather than a pile of files. From 1963, a drawing you can edit while constraints keep related geometry consistent. They are different bets, and a screen can inherit either." },
        { prompt: "Why is remembering only the mouse a bad summary of the 1968 demo?", answer: "The demo put a shared view in front of a group. The claim is augmentation: a tool can make a new task possible and an old task harder. The mouse is a product fact. You ask both questions, or you have lost the argument." },
      ]),
      lec("l2", "Three processors and a bound", [
        "The Model Human Processor is a rough estimate, not a portrait. It gives you a perceptual processor, a cognitive processor, and a motor processor. Common cycle times used for this estimate are 100 milliseconds, 70 milliseconds, and 70 milliseconds. A simple reaction, see a light and press a known key, spends about one cycle of each. The sum is 240 milliseconds. You use it to spot a demand for 3 decisions inside 100 milliseconds.",
        "Do not add this estimate to a later keystroke model as if they timed the same event twice. The 240 millisecond figure is one reaction to one signal. A keystroke estimate uses its own operators, including about 200 milliseconds for a key, and it answers a different question. Adding them double-counts the motor act. Use the processor model when the budget is a few tenths of a second. Use keystrokes when you compare 2 methods that take seconds.",
      ], { kind: "flow", caption: "One cycle of each processor.", steps: ["Perceive the light, 100 ms", "Decide it is the signal, 70 ms", "Press the key, 70 ms", "Sum to 240 ms"] }, "A budget of 100 milliseconds", [
        "A simple reaction is about 100 + 70 + 70 = 240 milliseconds.",
        "The game asks for 3 decisions inside 100 milliseconds. Even one reaction does not fit in 100.",
        "You call the demand impossible under this estimate. You do not use the estimate to rank two real people.",
      ], [
        { prompt: "Using 100, 70, and 70 milliseconds, what is the estimate for one simple reaction, and why is 3 decisions inside 100 milliseconds not credible here?", answer: "240 milliseconds, the sum of one perceptual, one cognitive, and one motor cycle. Three decisions inside 100 milliseconds is below even one of those reactions. The figure spots an impossible demand. It does not rank two real users." },
        { prompt: "Why do you not add the 240 millisecond reaction to a 200 millisecond keystroke operator for the same press?", answer: "They answer different questions and the motor act would be counted twice. Use the processor model for a budget of a few tenths of a second. Use keystrokes when you compare 2 methods that take seconds." },
      ]),
      lec("l3", "Execution and evaluation", [
        "Separate the path from goal to action and the path from system state back to the goal. The gulf of execution is the gap between what you want and the action you can find. The gulf of evaluation is the gap between a change and your ability to tell that it matched the goal. A labeled save control can be 1 click, a small execution gulf. You can perform the click and still not know whether the file was stored.",
        "Bridging execution means making the next action discoverable and in the user's terms. Bridging evaluation means showing state in the user's terms, soon enough to act on. A spinner that never ends fails evaluation even if the command was easy to give. A status line that says 'error 17' may fail evaluation if the user cannot map 17 onto a repair. You ask, for each step, which gulf is larger. The 1 click was never the whole complaint.",
      ], { kind: "pair", caption: "Two gaps on one save.", leftTitle: "Execution", rightTitle: "Evaluation", left: ["Find the action", "Here it is 1 click", "The label is clear"], right: ["See the result", "No confirmation", "You cannot tell"] }, "One click, no confirmation", [
        "The goal is to store the file. The control is labeled and takes 1 click. The execution gulf is small.",
        "Nothing on screen changes to say the write finished. The evaluation gulf is the remaining problem.",
        "You can perform the click and still not know whether the file was stored. Polishing the click does not close that gulf.",
      ], [
        { prompt: "Save is 1 labeled click, and the screen never confirms the write. Which gulf is larger, and why can the click still fail the user?", answer: "The evaluation gulf is larger. Execution is 1 discoverable click. You can perform it and still not know whether the file was stored, because nothing maps the change back to the goal." },
        { prompt: "A status line says 'error 17' after an easy command. Which gulf fails, and what would bridge it?", answer: "Evaluation. The user cannot map 17 onto a repair, so the state is not in the user's terms. Bridging evaluation means showing the state in those terms, soon enough to act on. The easy command was the execution side." },
      ]),
      lec("l4", "Operators you can add", [
        "GOMS names goals, operators, methods, and selection rules. The keystroke-level model adds up operators. Use K = 0.2 seconds for a key or button, P = 1.1 seconds to point, H = 0.4 seconds to home the hand, and M = 1.35 seconds for one mental chunk. You put one M on a decision, not on every key inside the chunk. Write the operator sequence before you add. A method you cannot write down cannot be timed.",
        "Compare two methods for one goal, with the hand already on the right device. A recalled command of 4 letters plus Enter is M + 5K = 1.35 + 1.0 = 2.35 seconds. A two-level menu, point and click twice, is M + P + K + P + K = 3.95 seconds. The command wins by 1.6 seconds in the model. You only get that win if the user recalls the 4 letters.",
      ], { kind: "pair", caption: "One goal, two timed methods.", leftTitle: "Recalled command", rightTitle: "Two-level menu", left: ["M + 5K", "2.35 seconds", "Needs recall"], right: ["Two points and two clicks", "3.95 seconds", "Needs recognition"] }, "Command against a menu", [
        "Hand on the keyboard. One mental chunk, then 4 letters and Enter: M + 5K = 1.35 + 5 times 0.2 = 2.35 seconds.",
        "Hand on the mouse. One mental chunk, two points, two clicks: 1.35 + 1.1 + 0.2 + 1.1 + 0.2 = 3.95 seconds.",
        "The difference is 3.95 - 2.35 = 1.6 seconds, and only while the 4 letters are recalled. Looking them up needs more operators.",
      ], [
        { prompt: "With K = 0.2 and M = 1.35, the hand already on the keyboard, what is M + 5K for a 4-letter command plus Enter?", answer: "2.35 seconds. Five keys are 5 times 0.2 = 1.0, and 1.35 + 1.0 = 2.35. You place one M on the chunk, not one M on each key." },
        { prompt: "The menu method is M + P + K + P + K with P = 1.1. How long is it, and by how much does the recalled command beat it?", answer: "3.95 seconds: 1.35 + 1.1 + 0.2 + 1.1 + 0.2. The command is 2.35, so it wins by 1.6 seconds in the model, and only if the user recalls the 4 letters. Looking the command up is not charged." },
      ]),
      lec("l5", "Subtasks and a plan", [
        "Hierarchical task analysis splits a goal into subtasks plus a plan. The plan states order, optional steps, and branches. Take 4 subtasks for tea: fill, boil, bag in cup, pour. Fill and bag-in-cup can swap. Pour cannot precede boil, and it cannot precede the bag. You write those constraints. A flat list of the 4 names hides which swaps are legal. The plan is the analysis.",
        "Plans include error paths. If the kettle is empty when you pour, return to fill. Number the steps and write the rule in one line: do 1 through 4, but if water is missing redo 1 before 4. A colleague can test it by asking whether step 4 is legal when step 2 failed. A button that offers pour before boil ignores that plan. Easy and legal are different claims.",
      ], { kind: "flow", caption: "A plan, not a flat list.", steps: ["Do 1, fill", "Do 2, boil", "Do 3, bag in cup", "Do 4 only after 2 and 3"] }, "Pour is not legal yet", [
        "The 4 subtasks are fill, boil, bag in cup, and pour.",
        "The plan allows fill and bag-in-cup to swap. It forbids pour before boil and pour before the bag.",
        "A pour button shown before boil is easy and illegal. The analysis is allowed to say the easy action is the wrong action.",
      ], [
        { prompt: "Which of the 4 tea subtasks may swap, and which ordering is forbidden?", answer: "Fill and bag-in-cup may swap. Pour cannot precede boil, and pour cannot precede the bag. A flat list of the 4 names hides those constraints. The plan is the analysis." },
        { prompt: "Step 2 failed because the water is missing. Is step 4 legal, and what does the plan say to do?", answer: "No. The rule is do 1 through 4, but if water is missing redo 1 before 4. A colleague can test the plan by asking exactly this. A pour button offered anyway ignores the plan." },
      ]),
      lec("l6", "Styles are theories of action", [
        "An interaction style is a claim about how action is expressed. A command of 8 characters spends recall: the user must produce the string. A menu spends recognition: the options are on screen. Direct manipulation spends action on a visible object and shows the effect at once, and it should be reversible. A form spends action as values in labeled slots. You will see different errors from each. Recall fails by a blank memory. Recognition fails by a misleading label.",
        "Selection rules in GOMS are how a skilled user picks a style when several methods exist. If the command is recalled, use the 2.35 second method. If it is not, use the menu. You can write that rule down. Interfaces get into trouble when the style and the task constraints conflict. A direct-manipulation canvas is a poor fit for entering 40 precise numbers. A form is a poor fit for rotating a shape by eye.",
      ], { kind: "pair", caption: "Recall against recognition.", leftTitle: "Command", rightTitle: "Menu", left: ["Produce 8 characters", "Fails if memory is blank", "Fast when recalled"], right: ["Pick a visible option", "Fails on a bad label", "Slower in the model"] }, "Forty numbers, or one rotation", [
        "Entering 40 precise numbers wants labeled slots, a form. A canvas makes each number a hunting task.",
        "Rotating a shape by eye wants direct manipulation: act on the object and see the effect at once, with undo.",
        "If the 8-character command is recalled, the selection rule picks the 2.35 second method. If not, it picks the menu.",
      ], [
        { prompt: "What error does a command style tend to produce, and what error does a menu tend to produce?", answer: "A command spends recall, so it fails by a blank memory, for example an 8-character string the user cannot produce. A menu spends recognition, so it fails by a misleading label. You will see different errors from each style." },
        { prompt: "Why is a direct-manipulation canvas a poor fit for 40 precise numbers, and a form a poor fit for rotating a shape by eye?", answer: "The canvas does not offer labeled slots for 40 exact values. The form does not let you act on a visible object and see a continuous rotation. Style has to match the task. The selection rule can still pick a recalled command at 2.35 seconds over the menu when the string is known." },
      ]),
      lec("l7", "Where the thinking sits", [
        "Distributed cognition puts thinking across people and artifacts, not only inside one head. A wall chart that 4 people can see stores a memory none of them must recite. Move it to a personal screen and the audience may shrink from 4 people in the room to 1 login. The task 'who is next' can get worse on a sharper display. You ask where a fact lives, who updates it, and who can see the update.",
        "A cognitive walkthrough reviews a step without a room full of users. You ask 4 questions. Will the person form this subgoal. Will they see the control. Will they connect the control to the subgoal. Will they notice progress. Failing 2 of the 4 on one screen is a result, not a hunch. If progress now sits on a display they are not looking at, question 4 fails. That is an evaluation gulf caused by moving the representation.",
      ], { kind: "layers", caption: "Four walkthrough questions.", rows: ["Will they form the subgoal", "Will they see the control", "Will they connect it", "Will they notice progress"] }, "The chart left the room", [
        "Four people could read the wall chart. The fact 'who is next' lived there.",
        "The same fact moves to a personal screen. The audience becomes 1 login.",
        "A walkthrough of the next step fails question 4 for the other 3 people: they cannot notice progress on a display they are not looking at.",
      ], [
        { prompt: "A wall chart visible to 4 people moves to a personal screen. What changed about the audience, and what question do you ask?", answer: "The audience may shrink from 4 people in the room to 1 login. You ask where the fact lives, who updates it, and who can see the update. A sharper display can still make 'who is next' worse." },
        { prompt: "Progress is now on a display the person is not looking at. Which of the 4 walkthrough questions fails, and which gulf is that?", answer: "Question 4, will they notice progress. That is an evaluation gulf caused by moving the representation. Failing 2 of the 4 questions on one screen is a result of the review, not a hunch, and this review does not require a room full of users." },
      ]),
      lec("l8", "An account, not a score", [
        "You can now give a theoretical account of an interface. Place a design against linked trails or against an editable constraint. Estimate a simple reaction at 240 milliseconds and do not add that figure to a keystroke sum. Name the larger gulf. Time a method with M, P, and K. Write a plan for 4 subtasks, including what may not be reordered. Say who can still see a fact if you move it off a shared wall.",
        "The keystroke time and the gulf do not measure the same failure. The menu method at 3.95 seconds can still leave an evaluation gulf if the menu closes and the document looks unchanged. Your plan may say step 4 is illegal until step 2 finishes, while the screen offers step 4 anyway. You report both: the time estimate for the legal method, and the walkthrough failure on the illegal control.",
      ], { kind: "pair", caption: "Time and legality are different lines.", leftTitle: "Keystroke time", rightTitle: "Plan and gulf", left: ["Menu method is 3.95 seconds", "Command is 2.35 if recalled"], right: ["Step 4 is illegal early", "No confirmation is a gulf"] }, "Fast, and still the wrong step", [
        "The legal menu method times at 3.95 seconds. The recalled command times at 2.35. You report the time of the legal method.",
        "The plan says step 4 waits on step 2. The screen offers step 4 anyway. The walkthrough fails there.",
        "You do not add the 3.95 and the walkthrough failure into one score. They are different mechanisms, and a single score would hide which one failed.",
      ], [
        { prompt: "The menu method is 3.95 seconds and the document looks unchanged after the menu closes. The plan says step 4 is illegal until step 2 finishes, but the screen offers step 4. What do you report, and why not one combined score?", answer: "Report the 3.95 second estimate for the legal method, and report the walkthrough failure on the illegal control. Also name the evaluation gulf: the document looks unchanged, so the user cannot tell the goal was met. A single score would add those failures and hide the mechanism." },
        { prompt: "You estimated a simple reaction at 240 milliseconds and a command at 2.35 seconds. Why do those two numbers stay on separate lines?", answer: "The 240 millisecond figure is one perceptual, cognitive, and motor cycle. The 2.35 second figure is M + 5K. Adding them double-counts the motor act. You use each model for its own question." },
      ]),
    ],
  },
  {
    slug: "csce-672",
    lectures: [
      lec("l1", "Four cells, and the handoff", [
        "Locate the collaboration in time and in place before you pick a tool. The 4 cells are same time and place, same time and different places, different times and same place, and different times and places. A room board is the first. A live call is the second. A shift log on one ward is the third. Email is the fourth. A shared document edited hours apart serves the fourth cell and does not, by itself, carry a same-time argument.",
        "Real work crosses cells, and the handoff is where systems fail. A same-time call can produce a decision a later shift must read. If nobody writes it into the shift log, cell 2 never reaches cell 3. You treat the handoff as an object with an author and a timestamp. A product that truly covers 1 cell should say so. Covering 1 cell is not a defect until you claim you covered 4.",
      ], { kind: "layers", caption: "Time and place, four cells.", rows: ["Same time, same place", "Same time, different places", "Different times, same place", "Different times, different places"] }, "A call that never reaches the shift", [
        "The decision is made on a live call. That is cell 2, same time and different places.",
        "The next shift reads a log on the ward. That is cell 3. If the call is not written down, cell 3 never receives it.",
        "You make the handoff an object with an author and a timestamp. A tool that only covers 1 cell must not claim it covers 4.",
      ], [
        { prompt: "Which cell is a shared document that people edit hours apart, and why does it not by itself support a same-time argument?", answer: "Different times and different places, the fourth cell. Hours apart is not same time. You name the cell the tool actually serves. A same-time argument needs a different cell, such as a live call." },
        { prompt: "A decision is made in cell 2 and needed in cell 3. What object do you design, and when is covering only 1 cell a defect?", answer: "A handoff with an author and a timestamp, written into the shift log. If nobody writes it, cell 2 never reaches cell 3. Covering 1 cell is a defect only when you claim you covered 4." },
      ]),
      lec("l2", "Awareness has a volume", [
        "Awareness is knowing who is here, what they did, and where they are in the shared thing. A feed of the last 5 edits answers whether someone changed the paragraph you are about to touch. You choose which events belong in those 5. A join, a leave, and an edit are different, and one undifferentiated list hides the edit. Design the feed as attention, not as a dump of every event the server can emit.",
        "Too much awareness is a failure mode with a number. If 40 edits arrive in a minute, you cannot read them and also do the task. Aggregate, or slow the feed down to the events that touch your current section. Peripheral awareness, a marker that 3 people are in the document, is cheaper than a narration of their keystrokes. Keystroke narration is surveillance dressed as help, and it will change what people are willing to type.",
      ], { kind: "pair", caption: "A feed you can read, and one you cannot.", leftTitle: "Last 5 edits", rightTitle: "40 edits a minute", left: ["You chose which events", "The edit stays visible"], right: ["You cannot read and work", "Aggregate or filter"] }, "Five events, not every key", [
        "The feed shows the last 5 edits that touch the section you have open. Joins are a separate marker.",
        "A marker says 3 people are in the document. You do not stream their keystrokes.",
        "At 40 edits a minute the 5-event rule still holds: you aggregate, you do not expand the feed until it becomes the task.",
      ], [
        { prompt: "Why do you not put joins, leaves, and edits in one undifferentiated list of 5?", answer: "They are different events, and the list hides the edit. You choose which events belong in the 5. Awareness is a design of attention. The feed answers whether someone changed the paragraph you are about to touch." },
        { prompt: "40 edits arrive in a minute, and a marker already says 3 people are present. What do you change, and why not narrate keystrokes?", answer: "Aggregate, or keep only events that touch the current section. You cannot read 40 edits and do the task. Keystroke narration is surveillance dressed as help, and it changes what people will type. The marker of 3 is the cheaper peripheral signal." },
      ]),
      lec("l3", "Common ground is evidence", [
        "Common ground is a fact you and a partner mutually believe you share. A fact on the screen is not ground if the other person does not know you saw it. Evidence can be a phrase repeated back or a cursor both of you can see. At a table, a point can do that in 1 gesture. A remote pair may need 3 extra turns to confirm the same paragraph. You count those turns as task time, not as chatter.",
        "A tool can cheapen grounding or counterfeit it. A green presence dot says someone is online. It is not evidence they see your paragraph. You have ground about a line only when there is evidence about that line. A shared highlight both people can see is stronger than 1 dot. If the product shows the dot and hides the selection, it bought the cheaper signal. Do not report the dot as common ground about a sentence.",
      ], { kind: "pair", caption: "Presence is not a shared referent.", leftTitle: "One green dot", rightTitle: "A shared highlight", left: ["Says someone is online", "Silent about the line"], right: ["Both see the sentence", "Evidence about that line"] }, "Three turns to name a paragraph", [
        "A remote pair needs to confirm they mean paragraph 4. They spend 3 extra turns.",
        "Those 3 turns are task time. A co-located pair might have pointed once, which is 1 gesture.",
        "A green dot during the 3 turns does not replace them. Ground about paragraph 4 needs evidence about paragraph 4.",
      ], [
        { prompt: "Why is a fact on the screen not yet common ground, and how many extra turns might a remote pair spend to confirm one paragraph?", answer: "The other person may not know you saw it. Common ground is mutual belief that you share the fact. A remote pair may need 3 extra turns, against 1 gesture at a table. You count those turns as task time." },
        { prompt: "A product shows 1 green dot and hides the selection. What have you not established?", answer: "Common ground about a sentence. The dot says someone is online. Ground about a line needs evidence about that line, such as a highlight both people can see. The product bought the cheaper signal." },
      ]),
      lec("l4", "Articulation is the work around the work", [
        "Articulation work divides, sequences, and repairs a shared task. It is not the task itself. Someone must decide who writes the introduction, what done means, and what happens after a silence of 2 days. A checklist of 6 steps makes that work visible. If the software hides the checklist, the work moves into memory and private notes. You will see missed steps. The list was coordination, even when it looked like extra process.",
        "A handoff packages state for the next person when the time-place cell changes. A ticket with 3 required fields, owner, status, and next action, is a small version of that package. If next action is optional, tickets sit in progress with no verb. You require the field. Automatic assignment among 4 people is fine only when the rule is readable, for example a round-robin. A hidden assignment removes a negotiation people were actually doing.",
      ], { kind: "pipeline", caption: "A ticket that carries the handoff.", stages: ["Name the owner", "Set the status", "Require the next action", "Show the assignment rule"] }, "Six steps that were not bureaucracy", [
        "The group uses a checklist of 6 steps to decide who writes next after a silence of 2 days.",
        "The new tool hides the checklist and opens the document directly. Missed steps show up within the week.",
        "You put the checklist back, or you encode its decisions as required ticket fields. Hiding it did not delete the articulation.",
      ], [
        { prompt: "A checklist has 6 steps and the software hides it. Where does the articulation go, and what do you observe?", answer: "It moves into memory and private notes. You will see missed steps. The list was coordination, not extra process, including the decision about a silence of 2 days." },
        { prompt: "Next action is optional on a ticket, and assignment among 4 people is hidden. What two failures are those?", answer: "Tickets sit in progress with no verb, so you require the next-action field. Hidden assignment removes a negotiation. A readable rule, such as round-robin among the 4, keeps the articulation visible." },
      ]),
      lec("l5", "Two inserts, one string", [
        "You say what two simultaneous writes mean. Last-write-wins on the whole string is easy and lossy. Both start from 'abcd', length 4. One inserts X at index 2, producing 'abXcd'. The other inserts Y at index 2, producing 'abYcd'. Keeping only the later full string leaves length 5, not 6. The author of the lost insert may get no notice, so this is an awareness failure as well as a consistency failure.",
        "You keep both inserts by transforming indexes under a shared tie rule. If both target index 2, the loser of the tie shifts by 1. Both replicas can then build one string of length 6, either 'abXYcd' or 'abYXcd'. If the inserts start at different indexes, 1 and 3, the greater index grows by the earlier insert's length. A one-character insert ordered first at index 1 turns the other index from 3 into 4.",
      ], { kind: "pair", caption: "Same two inserts, two storage rules.", leftTitle: "Last write of the string", rightTitle: "Index transform", left: ["Keeps one full string", "Length becomes 5", "One character is lost"], right: ["Shifts the losing index by 1", "Length becomes 6", "Both characters remain"] }, "Index 3 becomes 4", [
        "The string 'abcd' has length 4. One insert is a single character at index 1. The other is a single character at index 3.",
        "The tie rule orders the index-1 insert first. The other index grows by 1, from 3 to 4.",
        "Both characters remain, so the length is 6. Last-write-wins on the whole string would have left length 5.",
      ], [
        { prompt: "Both people insert one character at index 2 into 'abcd'. What lengths do last-write-wins and an index transform produce?", answer: "Last-write-wins keeps one full string, length 5, and drops a character. The transform shifts the losing index by 1 and keeps both characters, length 6, as 'abXYcd' or 'abYXcd' depending on the tie." },
        { prompt: "Inserts are one character at index 1 and one character at index 3. The index-1 insert is ordered first. What does the other index become, and what is the final length?", answer: "The index 3 becomes 4, because it grows by the length of the earlier insert, which is 1. Both characters remain, so the length is 6, starting from 4." },
      ]),
      lec("l6", "Skew, visibility, and consent", [
        "Count the social pattern, do not only describe it. On a document with 8 accounts, 2 of them may make 90 percent of the edits. The other 6 are not automatically a failure. A newcomer who reads for 7 days and then edits is not the same as an owner who never comes back. You need the sequence, not only the totals 2 and 6. One snapshot cannot separate learning from free riding.",
        "Visibility changes contribution and it spends privacy. Publishing each edit count can raise output and can punish someone who revises carefully. A marker that shows you in the file at midnight is a different disclosure from a cursor in a scheduled hour. You need consent for the stronger one. Awareness that helps coordination is not automatically acceptable. If the 8 people did not agree to overnight presence, an account signup was not that agreement.",
      ], { kind: "pair", caption: "A cursor at work, and a dot at midnight.", leftTitle: "Scheduled cursor", rightTitle: "Midnight marker", left: ["Shows the shared hour", "Matches the task"], right: ["Shows presence at night", "Needs its own consent"] }, "Two editors out of eight", [
        "The document has 8 accounts. Across the whole history, 2 accounts made 90 percent of the edits.",
        "The weekly sequence shows one of the other 6 editing after 7 days of reading. That person is not the same pattern as an owner who never returns.",
        "You report 2 and 6 and the sequence. You do not invent a motive the log does not show.",
      ], [
        { prompt: "2 of 8 accounts make 90 percent of the edits. Why is the other 6 not automatically free riding?", answer: "A snapshot of 2 and 6 cannot separate stories. A newcomer who reads for 7 days and then edits is not an owner who never comes back. You need the sequence before you name a motive." },
        { prompt: "Why is a midnight presence marker not justified by the fact that awareness helps coordination, if 8 people only signed up for an account?", answer: "It is a stronger disclosure than a cursor in a scheduled hour. Awareness that helps coordination is not automatically acceptable. Signup was not consent to overnight presence. You need consent for the stronger sensor." },
      ]),
      lec("l7", "Study the group before you automate", [
        "Study the group before you automate the coordination. An interview with 1 manager yields the official plan, which is often not the plan in use at 2 in the morning. Keep a diary of 5 days of handoffs. You will see steps a chart skips, such as a call that carries the real next action while the ticket stays empty. If you automate the empty ticket, you freeze the wrong process.",
        "The unit you study is the group. A test of 1 person on 1 editor can be careful and still miss the handoff between 2 roles. Give a pair a task that forces that handoff. Record where they build common ground and where they fail. 3 extra turns spent agreeing on a referent belong in the findings. A note that only says a button was hard to see has stayed inside a single-user analysis.",
      ], { kind: "flow", caption: "Watch the handoff, then automate.", steps: ["Diary of 5 days", "Note the call the ticket missed", "Test a pair, not 1 user", "Count turns spent grounding"] }, "The call that was the process", [
        "For 5 days the real next action travels by a phone call. The ticket stays empty.",
        "An interview with 1 manager describes the official 6-field ticket and never mentions the call.",
        "If you automate the empty ticket, you freeze the wrong process and drop the call. A pair test that records 3 grounding turns will see the handoff the single-user button test missed.",
      ], [
        { prompt: "You interviewed 1 manager and the ticket is empty while a call carries the next action. What happens if you automate that ticket?", answer: "You freeze the wrong process and drop the call that made the work succeed. The manager gave the official plan, often not the plan in use at 2 in the morning. A diary of 5 days is what shows the call." },
        { prompt: "A careful test of 1 person finds a hard button, and a pair spends 3 turns agreeing on a referent. Which finding belongs to this course, and why is the button note not enough?", answer: "The 3 turns belong in the findings, because the unit is the group and the handoff between 2 roles. A note that only says the button was hard stays inside a single-user analysis. It never asks who else had to understand the work." },
      ]),
      lec("l8", "A workflow with an explicit limit", [
        "You can now place work in the time-place matrix and name the cell a tool really serves. You can size an awareness feed, for example the last 5 events, and reject a feed of 40 events a minute. You can treat a checklist as articulation and keep 2 simultaneous inserts without dropping one. You can report a skew of 2 editors out of 8 without inventing a motive. You can refuse to automate a handoff you have not watched.",
        "The cell and the write rule interact. Different-time editing makes overlapping inserts likely, because the authors do not share a cursor. Last-write-wins then keeps length 5 and drops a character that an index transform would have kept to reach length 6. You either add same-time awareness so they see the clash, or you keep both characters. A feed of 5 events does not repair a rule that deletes one of them.",
      ], { kind: "pipeline", caption: "Name the limit of the workflow.", stages: ["Name the time-place cell", "Size the awareness feed", "Pick a write rule", "Watch before you automate"] }, "Async edits and a dropped character", [
        "The document is different-time and different-place. The authors do not share a cursor, so overlapping inserts are likely.",
        "Both insert into 'abcd'. Last-write-wins leaves length 5. A transform leaves length 6.",
        "You either move the activity toward same-time awareness or you keep both characters. Showing the last 5 events does not restore the dropped character.",
      ], [
        { prompt: "Two authors edit at different times, with no shared cursor, and both insert one character into 'abcd'. What length does last-write-wins leave, what length does an index transform leave, and why does a feed of 5 events not fix the shorter result?", answer: "Last-write-wins leaves length 5 and drops a character. The transform leaves length 6. Different-time work makes the overlap likely because they do not see each other's cursor. A feed of 5 events is awareness, not a storage rule, so it does not put the dropped character back. You either add same-time awareness or you keep both characters." },
        { prompt: "A log shows 2 of 8 accounts editing, and you have not watched the handoff. What may you report, and what do you refuse to automate?", answer: "You may report the skew, 2 out of 8, without inventing a motive the log does not show. You refuse to automate the handoff until you have watched it. The checklist and the diary are how you learn the articulation. The transform, if you use one, must still be correct even when only 2 people edit." },
      ]),
    ],
  },

];
