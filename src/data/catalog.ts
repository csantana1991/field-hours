import { foundationCourses } from "./foundations";

export type Area =
  | "foundations"
  | "systems"
  | "theory"
  | "ai"
  | "data"
  | "security"
  | "interaction"
  | "graphics"
  | "research";

export type Match = "full" | "close" | "partial" | "practice";

export type Kind = "youtube" | "edx" | "coursera" | "ocw" | "site" | "book" | "lab";

export type Resource = {
  kind: Kind;
  title: string;
  source: string;
  url: string;
  note: string;
};

export type Course = {
  slug: string;
  code: string;
  title: string;
  credits: string;
  creditValue: number;
  area: Area;
  match: Match;
  bridge?: boolean;
  prereq: string;
  blurb: string;
  why: string;
  hours: number;
  resources: Resource[];
  /** Undergraduate course taken before the master's. Not part of the 36 credits. */
  foundation?: boolean;
  /** Master's course slugs this prerequisite prepares. */
  prepares?: string[];
};

export const AREAS = [
	{
		id: "all",
		label: "All fields"
	},
	{
		id: "systems",
		label: "Systems"
	},
	{
		id: "theory",
		label: "Theory"
	},
	{
		id: "ai",
		label: "Intelligence"
	},
	{
		id: "data",
		label: "Data"
	},
	{
		id: "security",
		label: "Security"
	},
	{
		id: "graphics",
		label: "Graphics"
	},
	{
		id: "interaction",
		label: "Interaction"
	},
	{
		id: "foundations",
		label: "Foundations"
	},
	{
		id: "research",
		label: "Research"
	}
];
export const MATCH_LABEL = {
	full: "Full lecture match",
	close: "Close equivalent",
	partial: "Nearest public material",
	practice: "Not a lecture course"
};
export const KIND_LABEL = {
	youtube: "YouTube",
	edx: "edX",
	coursera: "Coursera",
	ocw: "MIT OCW",
	site: "Course site",
	book: "Free book",
	lab: "Labs"
};
export const courses: Course[] = [
	{
		slug: "csce-603",
		code: "CSCE 603",
		title: "Database Systems and Applications",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "close",
		prereq: "CSCE 601; graduate classification. For non–computer-science majors. Only one of CSCE 310 or CSCE 603 counts.",
		blurb: "Relational design in the sense of E. F. Codd: schemas, keys, normalization, and hands-on SQL. Not database internals.",
		why: "This is the applied design course, not the systems course. Do the design sequence, then stop — CSCE 608 is the graduate internals class, and a degree plan should not take both as if they were different subjects.",
		hours: 88,
		resources: [
			{
				kind: "coursera",
				title: "Database Management Essentials",
				source: "University of Colorado Boulder",
				url: "https://www.coursera.org/learn/database-management",
				note: "Conceptual models, relational design, and SQL. Audit the videos."
			},
			{
				kind: "site",
				title: "CS50 SQL",
				source: "Harvard",
				url: "https://cs50.harvard.edu/sql/",
				note: "Short, strict, hands-on relational course. The right lab if the Coursera set feels soft."
			},
			{
				kind: "youtube",
				title: "Intro to Database Systems, lectures 1–2",
				source: "CMU 15-445",
				url: "https://www.youtube.com/playlist?list=PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5",
				note: "Relational model only. The rest of this playlist is CSCE 608."
			}
		]
	},
	{
		slug: "csce-605",
		code: "CSCE 605",
		title: "Compiler Design",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "CSCE 434.",
		blurb: "Parsers and parser generators, scope and storage, dataflow analysis, and optimization.",
		why: "Cornell’s self-guided advanced compilers course is the rare free class that expects you to build the optimizer, not just watch lex and yacc. Pair it with Alex Aiken’s Stanford lectures if you need the front end first.",
		hours: 100,
		resources: [
			{
				kind: "site",
				title: "CS 6120 Advanced Compilers, self-guided",
				source: "Cornell",
				url: "https://www.cs.cornell.edu/courses/cs6120/2020fa/self-guided/",
				note: "Primary path. Lessons plus implementation projects. This is the graduate course."
			},
			{
				kind: "coursera",
				title: "Compilers",
				source: "Stanford, Alex Aiken",
				url: "https://www.coursera.org/learn/compilers",
				note: "Front end through code generation. Free to audit."
			},
			{
				kind: "site",
				title: "CS 143 Compilers",
				source: "Stanford",
				url: "https://web.stanford.edu/class/cs143/",
				note: "Current Stanford offering: notes, assignments, and tools."
			}
		]
	},
	{
		slug: "csce-606",
		code: "CSCE 606",
		title: "Software Engineering",
		credits: "3",
		creditValue: 3,
		area: "foundations",
		match: "close",
		prereq: "CSCE 431 or instructor approval.",
		blurb: "Environments, methodology selection, prototyping, reuse, and the engineering practices that actually change software quality.",
		why: "No free course copies the TAMU seminar syllabus line for line. MIT’s software construction course is the rigorous public substitute: specifications, testing, design for change. Add the Missing Semester so the environment half is not just slogans.",
		hours: 88,
		resources: [
			{
				kind: "ocw",
				title: "6.005 Software Construction",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/6-005-software-construction-spring-2016/",
				note: "Primary. Reading, design problems, and a serious code standard."
			},
			{
				kind: "site",
				title: "The Missing Semester of Your CS Education",
				source: "MIT",
				url: "https://missing.csail.mit.edu/",
				note: "Shell, git, debugging, profiling. Short. Do it in week one."
			},
			{
				kind: "coursera",
				title: "Software Product Management",
				source: "University of Alberta",
				url: "https://www.coursera.org/specializations/product-management",
				note: "Process, requirements, and agile, if you want the methodology half explicit."
			}
		]
	},
	{
		slug: "csce-608",
		code: "CSCE 608",
		title: "Database Systems",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "full",
		prereq: "CSCE 310 or instructor approval.",
		blurb: "Query languages, physical layout, relational theory, query processing, transactions, recovery, and distributed data.",
		why: "CMU 15-445 is the course working database engineers actually send people to. Storage, indexes, joins, optimization, concurrency, recovery, and a parallel architecture unit — with public homework.",
		hours: 100,
		resources: [
			{
				kind: "youtube",
				title: "Intro to Database Systems, Fall 2025",
				source: "CMU 15-445/645",
				url: "https://www.youtube.com/playlist?list=PLSE8ODhjZXjYMAgsGH-GtY5rJYZ6zjsd5",
				note: "Primary lecture set. Andy Pavlo’s group."
			},
			{
				kind: "lab",
				title: "15-445 projects and homework",
				source: "CMU",
				url: "https://15445.courses.cs.cmu.edu/fall2025/",
				note: "Do the projects. The videos without the buffer pool are a tour."
			},
			{
				kind: "book",
				title: "Database System Concepts support",
				source: "CMU course site",
				url: "https://15445.courses.cs.cmu.edu/fall2025/",
				note: "Notes on the same site as the labs. Use them beside the lectures."
			}
		]
	},
	{
		slug: "csce-611",
		code: "CSCE 611",
		title: "Operating Systems",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "CSCE 313; graduate classification. Only one of CSCE 410 or CSCE 611 counts.",
		blurb: "Architecture history into modern kernels: scheduling, memory, resource allocation, concurrency, and case studies.",
		why: "Berkeley CS 162 is the standard public graduate-style OS course: processes, threads, files, concurrency, scheduling, and distributed storage. Read OSTEP in parallel — it is free and written as a textbook, not a blog.",
		hours: 100,
		resources: [
			{
				kind: "youtube",
				title: "CS 162 Operating Systems, Fall 2020",
				source: "UC Berkeley",
				url: "https://www.youtube.com/playlist?list=PLGXNiy5ajeVp1Gp2YJ3-kAPho5OFoirjH",
				note: "Primary. John Kubiatowicz. Full semester."
			},
			{
				kind: "book",
				title: "Operating Systems: Three Easy Pieces",
				source: "Wisconsin",
				url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
				note: "Free textbook. Read the chapter before the matching lecture."
			},
			{
				kind: "youtube",
				title: "CS 537 Operating Systems",
				source: "Wisconsin",
				url: "https://www.youtube.com/playlist?list=PLIIvTtItv0oc0M0KtiYamrzS0Re6--PI1",
				note: "Remzi and Andrea Arpaci-Dusseau. A second pass with the book’s own lectures."
			}
		]
	},
	{
		slug: "csce-612",
		code: "CSCE 612",
		title: "Applied Networks and Distributed Processing",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "Graduate classification. Only one of CSCE 463 or CSCE 612 counts.",
		blurb: "Layered architecture applied to real networks: design, protocol analysis, and programming labs.",
		why: "Stanford CS 144 is built the way this catalog entry is written — principles, then a lab where you implement the stack. The 2013 lectures are complete on YouTube; the current course site has the modern assignments.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "CS 144 Introduction to Computer Networking",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN",
				note: "Full lecture semester. Older recording, still the right syllabus."
			},
			{
				kind: "lab",
				title: "CS 144 current labs",
				source: "Stanford",
				url: "https://cs144.github.io/",
				note: "Write the TCP stack. This is the part that makes it a course."
			},
			{
				kind: "book",
				title: "Computer Networking: A Top-Down Approach, student resources",
				source: "Kurose & Ross",
				url: "https://gaia.cs.umass.edu/kurose_ross/index.php",
				note: "Wireshark labs from the standard textbook, free on the authors’ site."
			}
		]
	},
	{
		slug: "csce-614",
		code: "CSCE 614",
		title: "Computer Architecture",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "CSCE 350/ECEN 350 or CSCE 312; undergraduate computer engineering or computer science.",
		blurb: "Past the von Neumann bottleneck: pipelining, vectorization, arrays, multiprocessors, and dataflow.",
		why: "Onur Mutlu’s architecture lectures are the public record of CMU 18-447 and its successors: pipelines, caches, memory, SIMD, and GPUs, at graduate depth.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "Computer Architecture, Fall 2025",
				source: "Onur Mutlu",
				url: "https://www.youtube.com/playlist?list=PL5Q2soXY2Zi8tTLVb-9CUHcfKXLWESjOD",
				note: "Primary. Long lectures. Memory systems through GPUs."
			},
			{
				kind: "youtube",
				title: "CMU 18-447, Fall 2015",
				source: "Carnegie Mellon",
				url: "https://www.youtube.com/playlist?list=PL5PHm2jkkXmi5CxxI7b3JCL1TWybTDtKq",
				note: "A tighter semester of the same course if the 2025 set is more than you need."
			},
			{
				kind: "site",
				title: "Nand to Tetris",
				source: "IDC / Hebrew University",
				url: "https://www.nand2tetris.org/",
				note: "Only if your architecture background is thin. Build a computer, then return to Mutlu."
			}
		]
	},
	{
		slug: "csce-616",
		code: "CSCE 616",
		title: "Introduction to Hardware Design Verification",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "partial",
		prereq: "CSCE 312 or CSCE 350/ECEN 350; familiarity with C, C++, Verilog, or VHDL.",
		blurb: "Functional verification of digital hardware, industry practice, and logic verification.",
		why: "Universities rarely post a full verification course. The public path is industry-grade and free: Verification Academy for methodology, ChipVerify for SystemVerilog and UVM, after you can already build hardware.",
		hours: 88,
		resources: [
			{
				kind: "site",
				title: "Verification Academy courses",
				source: "Siemens EDA",
				url: "https://verificationacademy.com/courses",
				note: "Free account. Constrained-random, coverage, UVM. Closest thing to the industry half of this class."
			},
			{
				kind: "site",
				title: "SystemVerilog and UVM tutorial",
				source: "ChipVerify",
				url: "https://www.chipverify.com/uvm/uvm-tutorial",
				note: "Read-and-code reference. Work an example every chapter."
			},
			{
				kind: "site",
				title: "Nand to Tetris, hardware unit",
				source: "IDC / Hebrew University",
				url: "https://www.nand2tetris.org/",
				note: "Prerequisite repair if HDL is new. Not a verification course by itself."
			}
		]
	},
	{
		slug: "csce-620",
		code: "CSCE 620",
		title: "Computational Geometry",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 311 or instructor approval. Cross-listed VIZA 670.",
		blurb: "Convex hulls, Voronoi diagrams, range searching, and proximity.",
		why: "David Mount’s Maryland notes are the standard free graduate notes for this exact topic list. There is no equally complete YouTube semester; treat the notes as the course and Demaine’s folding class as geometric algorithm style.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "CMSC 754 Computational Geometry",
			source: "Maryland, David Mount",
			url: "https://www.cs.umd.edu/~mount/754/",
			note: "Primary. Lecture notes covering hulls, Voronoi, search, and proximity."
		}, {
			kind: "ocw",
			title: "6.849 Geometric Folding Algorithms",
			source: "MIT, Erik Demaine",
			url: "https://ocw.mit.edu/courses/6-849-geometric-folding-algorithms-linkages-origami-polyhedra-fall-2012/",
			note: "Adjacent graduate geometry course with video. Different problems, same proof culture."
		}]
	},
	{
		slug: "csce-624",
		code: "CSCE 624",
		title: "Sketch Recognition",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "partial",
		prereq: "Graduate classification.",
		blurb: "Feature, vision, geometric, timing, and path recognizers for ink, and how to combine them.",
		why: "This is a Texas A&M specialty (the Hammond line of work). Nobody posts an equivalent semester. The honest substitute is the classic $1 / $P recognizers, implemented, plus a vision course for the pixel-based methods.",
		hours: 88,
		resources: [
			{
				kind: "site",
				title: "The $1 Unistroke Recognizer",
				source: "University of Washington",
				url: "https://depts.washington.edu/acelab/proj/dollar/index.html",
				note: "Paper, pseudocode, and implementations. Build it. Then read $N and $P."
			},
			{
				kind: "youtube",
				title: "CS231n Deep Learning for Computer Vision",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16",
				note: "The vision-based half. Not ink-specific."
			},
			{
				kind: "site",
				title: "CS231n course site",
				source: "Stanford",
				url: "https://cs231n.stanford.edu/",
				note: "Assignments. Use one to classify stroke images after the geometric recognizer works."
			}
		]
	},
	{
		slug: "csce-625",
		code: "CSCE 625",
		title: "Artificial Intelligence",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "CSCE 411 or instructor approval; graduate classification.",
		blurb: "Search, games, logic, planning, probability, and a first look at learning, agents, and ethics.",
		why: "Berkeley CS 188 is this syllabus: uninformed and informed search, CSPs, games, MDPs, Bayes nets, and machine learning at the end, with the Pac-Man projects still public.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "CS 188 Introduction to Artificial Intelligence, Spring 2023",
				source: "UC Berkeley",
				url: "https://www.youtube.com/playlist?list=PLp8QV47qJEg7WWVg_5eOECzVPpy23UjJz",
				note: "Primary lectures."
			},
			{
				kind: "lab",
				title: "CS 188 projects",
				source: "Berkeley AI",
				url: "https://ai.berkeley.edu/",
				note: "Pac-Man projects. Do them. They are the course."
			},
			{
				kind: "site",
				title: "CS 188 current site",
				source: "UC Berkeley",
				url: "https://inst.eecs.berkeley.edu/~cs188/sp25/",
				note: "Newer exams and notes when you want a second set of problems."
			}
		]
	},
	{
		slug: "csce-626",
		code: "CSCE 626",
		title: "Parallel Algorithm Design and Analysis",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 221.",
		blurb: "Algorithms for highly parallel machines, area-time complexity, and lower bounds, with applications in AI, vision, and VLSI.",
		why: "Video courses skew toward CUDA programming (that is CSCE 735). For algorithm design, use Wen-mei Hwu’s manycore parallel algorithms course plus the NPTEL parallel-algorithms sequence.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "ECE 508 Manycore Parallel Algorithms",
			source: "UIUC, Wen-mei Hwu",
			url: "https://www.youtube.com/playlist?list=PLRRuQYjFhpmspsME4LmLbuCG1VHbJmIcy",
			note: "Primary. Parallel algorithm structure, not just API calls."
		}, {
			kind: "site",
			title: "Parallel Algorithm",
			source: "NPTEL, IIT Kanpur",
			url: "https://nptel.ac.in/courses/106104120/",
			note: "PRAM-style design and analysis. Closer to the theory sentence in the catalog."
		}]
	},
	{
		slug: "csce-627",
		code: "CSCE 627",
		title: "Theory of Computability",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "full",
		prereq: "CSCE 433.",
		blurb: "Pushdown automata, Turing machines, recursive functions, undecidability, and the complexity of decidable problems.",
		why: "MIT 18.404 is Sipser’s course. The OCW notes plus Ullman’s automata lectures and Georgia Tech’s newer videos cover the whole catalog entry.",
		hours: 88,
		resources: [
			{
				kind: "ocw",
				title: "18.404 Theory of Computation",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/",
				note: "Primary. Sipser. Notes and structure of a full semester."
			},
			{
				kind: "youtube",
				title: "Automata",
				source: "Stanford, Jeffrey Ullman",
				url: "https://www.youtube.com/playlist?list=PL82C4B8475CAC3F95",
				note: "Automata and languages, carefully taught."
			},
			{
				kind: "youtube",
				title: "CS 4510 Automata and Complexity",
				source: "Georgia Tech",
				url: "https://www.youtube.com/playlist?list=PLerMEx1Met7uOtmjvLr7v9XbYwjtNoOF2",
				note: "Newer full video semester, through complexity."
			}
		]
	},
	{
		slug: "csce-628",
		code: "CSCE 628",
		title: "Computational Biology",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "close",
		prereq: "Graduate classification or instructor approval. Cross-listed BICH 628.",
		blurb: "Biology problems restated as computation: genomics and proteomics.",
		why: "MIT’s computational and systems biology course is the right orientation. Rosalind is where it becomes a skill — sequence problems with an automatic judge.",
		hours: 88,
		resources: [{
			kind: "ocw",
			title: "7.91J Foundations of Computational and Systems Biology",
			source: "MIT",
			url: "https://ocw.mit.edu/courses/7-91j-foundations-of-computational-and-systems-biology-spring-2014/",
			note: "Primary lecture course."
		}, {
			kind: "lab",
			title: "Rosalind",
			source: "Rosalind",
			url: "https://rosalind.info/",
			note: "Bioinformatics problems. Do a location track through sequence alignment."
		}]
	},
	{
		slug: "csce-629",
		code: "CSCE 629",
		title: "Analysis of Algorithms",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "Concrete design and analysis, models of complexity, NP-completeness, approximation, and probabilistic algorithms.",
		why: "This is the course every track in this bulletin shares. MIT 6.046 is the graduate design course; Princeton’s Coursera pair forces the implementation habit 6.046 sometimes assumes.",
		hours: 96,
		resources: [
			{
				kind: "ocw",
				title: "6.046 Design and Analysis of Algorithms",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/",
				note: "Primary. Divide and conquer, graphs, NP, approximation."
			},
			{
				kind: "youtube",
				title: "6.006 Introduction to Algorithms",
				source: "MIT",
				url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63EdVPNLG3ToM6LaEUuStEY",
				note: "If 6.046 feels too fast. Do it first, not instead, unless you already have an algorithms course."
			},
			{
				kind: "coursera",
				title: "Algorithms, Part I and Part II",
				source: "Princeton, Sedgewick & Wayne",
				url: "https://www.coursera.org/learn/algorithms-part1",
				note: "Part II is https://www.coursera.org/learn/algorithms-part2. Programming assignments."
			}
		]
	},
	{
		slug: "csce-630",
		code: "CSCE 630",
		title: "Speech Processing",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "ECEN 314 or equivalent; signals, linear algebra, probability; programming.",
		blurb: "Production and perception, short-time analysis, recognition, synthesis, and modification.",
		why: "CMU’s speech recognition and understanding course is the graduate version of this catalog entry: features, HMMs, neural acoustic models, and language models.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "11-751 Speech Recognition and Understanding",
				source: "CMU",
				url: "https://www.youtube.com/playlist?list=PLfVqr2l0FG-tW8d5ZSz-_tCgQed_F1ndb",
				note: "Primary. Fall 2023, Shinji Watanabe."
			},
			{
				kind: "youtube",
				title: "Speech Technology",
				source: "IIT Madras",
				url: "https://www.youtube.com/playlist?list=PLZ2ps__7DhBaI_g3_V-CFrgFIf-0Yksiv",
				note: "Production, features, and classical recognition. Good first half."
			},
			{
				kind: "youtube",
				title: "11-492 Speech Processing",
				source: "CMU, Alan Black",
				url: "https://www.youtube.com/playlist?list=PL682UO4IMem9InUp3CZHL4g7IwzfKXe3c",
				note: "Synthesis and processing, the other half of the catalog description."
			}
		]
	},
	{
		slug: "csce-631",
		code: "CSCE 631",
		title: "Intelligent Agents",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "close",
		prereq: "CSCE 420 or CSCE 625.",
		blurb: "Design of intelligent agents and coordination among multiple agents, from principles to implementation.",
		why: "Take CS 188 first if you have not. Then build agents against real tools. The Hugging Face agents course is the current implementation path; it is not a multi-agent theory course, so read one Shoham chapter on coordination beside it.",
		hours: 88,
		resources: [
			{
				kind: "lab",
				title: "CS 188 projects, agent core",
				source: "Berkeley AI",
				url: "https://ai.berkeley.edu/",
				note: "Search, games, and reinforcement agents. Prerequisite if CSCE 625 is not done."
			},
			{
				kind: "site",
				title: "Agents course",
				source: "Hugging Face",
				url: "https://huggingface.co/learn/agents-course",
				note: "Primary build path: tools, workflows, and evaluation."
			},
			{
				kind: "coursera",
				title: "Game Theory",
				source: "Stanford / UBC",
				url: "https://www.coursera.org/learn/game-theory",
				note: "The coordination half: equilibria when more than one agent chooses."
			}
		]
	},
	{
		slug: "csce-632",
		code: "CSCE 632",
		title: "Accessible Computing",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "partial",
		prereq: "Graduate classification.",
		blurb: "Disability, law and ethics, universal design, standards, and a literature review.",
		why: "The technical half is well served in public: W3C’s own materials and Google’s accessibility course. The literature-review half you have to do yourself — pick ten papers and write the review. No playlist replaces that.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Web Accessibility by Google",
			source: "Udacity",
			url: "https://www.udacity.com/course/web-accessibility--ud891",
			note: "Primary skills course: semantics, focus, ARIA, screen readers."
		}, {
			kind: "site",
			title: "WAI fundamentals and courses",
			source: "W3C",
			url: "https://www.w3.org/WAI/",
			note: "The standards body. Read WCAG and the tutorials, not a summary of them."
		}]
	},
	{
		slug: "csce-633",
		code: "CSCE 633",
		title: "Machine Learning",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "CSCE 420 or CSCE 625.",
		blurb: "Induction, clustering, explanation-based learning, exemplars, analogy, discovery, and the modern supervised and unsupervised core.",
		why: "Stanford CS 229 is the graduate survey this course wants to be. Andrew Ng’s Coursera course is the gentler on-ramp with assignments. Do 229 if you can already do the math; do Ng first if you cannot.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "CS 229 Machine Learning, Spring 2022",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy",
				note: "Primary graduate lecture set."
			},
			{
				kind: "coursera",
				title: "Machine Learning",
				source: "Stanford / DeepLearning.AI, Andrew Ng",
				url: "https://www.coursera.org/learn/machine-learning",
				note: "Assignments and a cleaner first pass. Audit is free."
			},
			{
				kind: "site",
				title: "Learning From Data telecourse",
				source: "Caltech, Yaser Abu-Mostafa",
				url: "http://work.caltech.edu/telecourse.html",
				note: "The theoretical counterweight: VC dimension, bias, overfitting. Free videos linked from this page."
			}
		]
	},
	{
		slug: "csce-634",
		code: "CSCE 634",
		title: "Intelligent User Interfaces",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "partial",
		prereq: "Graduate classification and instructor approval.",
		blurb: "Systems that learn users, tasks, and environments — AI crossed with human-computer interaction.",
		why: "There is no public semester that is this intersection. Do the HCI design course and CS 229, then build one adaptive interface and evaluate it with five users. That project is the course.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Human-Computer Interaction",
			source: "UC San Diego",
			url: "https://www.coursera.org/specializations/human-computer-interaction",
			note: "Design, prototyping, and evaluation. The HCI half."
		}, {
			kind: "youtube",
			title: "CS 229 Machine Learning",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy",
			note: "The learning half. You do not need every lecture — classification and evaluation."
		}]
	},
	{
		slug: "csce-635",
		code: "CSCE 635",
		title: "AI Robotics",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "close",
		prereq: "Graduate classification. Includes a lab hour.",
		blurb: "AI methods for mobile robots — ground, air, or marine — emphasizing biological and cognitive principles over pure control theory.",
		why: "Split it the way the field is split. Modern Robotics for kinematics and planning, Berkeley’s deep RL course for learned control, and Stachniss for perception and mapping.",
		hours: 96,
		resources: [
			{
				kind: "site",
				title: "Modern Robotics",
				source: "Northwestern",
				url: "https://modernrobotics.northwestern.edu/",
				note: "Free book and video. Primary for kinematics, dynamics, and motion planning."
			},
			{
				kind: "coursera",
				title: "Modern Robotics specialization",
				source: "Northwestern",
				url: "https://www.coursera.org/specializations/modernrobotics",
				note: "Same material with a schedule, if you want deadlines."
			},
			{
				kind: "youtube",
				title: "CS 285 Deep Reinforcement Learning",
				source: "UC Berkeley",
				url: "https://www.youtube.com/playlist?list=PLkFD6_40KJIwhWJpGazJ9VSj9CFMkb79A",
				note: "Robot learning. The cognitive / learned-control half."
			},
			{
				kind: "youtube",
				title: "Cyrill Stachniss lectures",
				source: "University of Bonn",
				url: "https://www.youtube.com/@CyrillStachniss",
				note: "SLAM and robot perception. Pick one full course from the channel, not random talks."
			}
		]
	},
	{
		slug: "csce-636",
		code: "CSCE 636",
		title: "Deep Learning",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "MATH 251 and MATH 304, or instructor approval.",
		blurb: "Neural models, memory, adaptation, and applications to vision, speech, and control.",
		why: "Use fast.ai to build, MIT 6.S191 for a crisp survey, and CS231n when you want the math of representation learning. Ng’s Coursera specialization is the glossary if the others assume too much.",
		hours: 96,
		resources: [
			{
				kind: "site",
				title: "Practical Deep Learning for Coders",
				source: "fast.ai",
				url: "https://course.fast.ai/",
				note: "Primary. Code first. Free, including the book."
			},
			{
				kind: "site",
				title: "6.S191 Introduction to Deep Learning",
				source: "MIT",
				url: "http://introtodeeplearning.com/",
				note: "Short annual IAP course. Lectures and labs. Good map of the field."
			},
			{
				kind: "youtube",
				title: "CS231n",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16",
				note: "Vision-centered, but it is where deep learning is taught carefully."
			},
			{
				kind: "coursera",
				title: "Deep Learning Specialization",
				source: "DeepLearning.AI",
				url: "https://www.coursera.org/specializations/deep-learning",
				note: "Audit if you want a slower path with quizzes."
			}
		]
	},
	{
		slug: "csce-637",
		code: "CSCE 637",
		title: "Complexity Theory",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 627 or instructor approval.",
		blurb: "P, NP, and beyond: reducibility, time and space, randomness, alternation, and relativization.",
		why: "Arora and Barak’s book is free and is the field’s textbook. Georgia Tech’s automata-and-complexity videos are the lecture companion. Do not start here before CSCE 627.",
		hours: 88,
		resources: [
			{
				kind: "book",
				title: "Computational Complexity: A Modern Approach",
				source: "Arora & Barak",
				url: "https://theory.cs.princeton.edu/complexity/book.pdf",
				note: "Primary text. Draft is free from the authors."
			},
			{
				kind: "youtube",
				title: "CS 4510 Automata and Complexity",
				source: "Georgia Tech",
				url: "https://www.youtube.com/playlist?list=PLerMEx1Met7uOtmjvLr7v9XbYwjtNoOF2",
				note: "Lecture support through the first major complexity chapters."
			},
			{
				kind: "ocw",
				title: "18.404 Theory of Computation",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/",
				note: "Prerequisite repair and the complexity chapters Sipser does cover."
			}
		]
	},
	{
		slug: "csce-638",
		code: "CSCE 638",
		title: "Natural Language Processing",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "Language models, syntax, semantics, and the major applications: extraction, translation, summarization, dialogue, sentiment.",
		why: "Stanford CS 224N is the course. Manning’s lectures plus the public assignments are a stricter graduate NLP class than most paid bootcamps.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "CS 224N, Spring 2024",
				source: "Stanford, Christopher Manning",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D",
				note: "Primary."
			},
			{
				kind: "site",
				title: "CS 224N course site",
				source: "Stanford",
				url: "https://web.stanford.edu/class/cs224n/",
				note: "Notes and assignments. Do at least two."
			},
			{
				kind: "site",
				title: "NLP course",
				source: "Hugging Face",
				url: "https://huggingface.co/learn/nlp-course",
				note: "Tooling after the theory. Transformers, tokenizers, fine-tuning."
			}
		]
	},
	{
		slug: "csce-640",
		code: "CSCE 640",
		title: "Quantum Algorithms",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "full",
		prereq: "CSCE 629 or instructor approval.",
		blurb: "The circuit model, basic quantum algorithms, and selected results in quantum information.",
		why: "CMU’s quantum computation course is a real semester on algorithms, not a vendor tutorial. IBM’s learning platform is where you run the circuits.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "Quantum Computation and Quantum Information",
				source: "CMU",
				url: "https://www.youtube.com/playlist?list=PLm3J0oaFux3YL5qLskC6xQ24JpMwOAeJz",
				note: "Primary. Ryan O’Donnell."
			},
			{
				kind: "site",
				title: "IBM Quantum Learning",
				source: "IBM",
				url: "https://learning.quantum.ibm.com/",
				note: "Labs. Implement Deutsch, Grover, and a small phase algorithm."
			},
			{
				kind: "youtube",
				title: "Ph/CS 219 Quantum Computation",
				source: "Caltech",
				url: "https://www.youtube.com/playlist?list=PL0ojjrEqIyPy-1RRD8cTD_lF1hflo89Iu",
				note: "Preskill. Heavier physics. Use if the CMU set feels too discrete."
			}
		]
	},
	{
		slug: "csce-641",
		code: "CSCE 641",
		title: "Computer Graphics",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "full",
		prereq: "CSCE 441 or instructor approval. Cross-listed VIZA 672.",
		blurb: "3D representation, visibility, shading, ray tracing, radiosity, animation, and modern graphics hardware.",
		why: "Berkeley CS 184 and MIT 6.837 both cover this catalog entry. Prefer Berkeley’s newer imaging course, and use MIT if you want a classic rasterization-first semester.",
		hours: 96,
		resources: [
			{
				kind: "youtube",
				title: "CS 184/284A Computer Graphics and Imaging",
				source: "UC Berkeley",
				url: "https://www.youtube.com/playlist?list=PLIygTcviGPKABEUa7EJzO8tgYRz120EpP",
				note: "Primary. Ren Ng, Spring 2022."
			},
			{
				kind: "site",
				title: "CS 184 course site",
				source: "UC Berkeley",
				url: "https://cs184.eecs.berkeley.edu/sp22",
				note: "Projects. Do the path tracer."
			},
			{
				kind: "youtube",
				title: "6.837 Computer Graphics",
				source: "MIT",
				url: "https://www.youtube.com/playlist?list=PLkHIj5SCfn3_PCotoqTetMpJc_jkpkgLt",
				note: "Alternate full semester."
			}
		]
	},
	{
		slug: "csce-642",
		code: "CSCE 642",
		title: "Deep Reinforcement Learning",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "MDPs, deep networks, and the algorithms that join them.",
		why: "Start with David Silver so the MDP is solid, then Berkeley CS 285, which is the deep RL course. Sutton and Barto’s book is free and should stay open on the desk.",
		hours: 96,
		resources: [
			{
				kind: "site",
				title: "Reinforcement Learning course",
				source: "UCL, David Silver",
				url: "http://www0.cs.ucl.ac.uk/staff/d.silver/web/Teaching.html",
				note: "Ten lectures. Watch before deep methods. Video links are on the page."
			},
			{
				kind: "youtube",
				title: "CS 285 Deep Reinforcement Learning",
				source: "UC Berkeley, Sergey Levine",
				url: "https://www.youtube.com/playlist?list=PLkFD6_40KJIwhWJpGazJ9VSj9CFMkb79A",
				note: "Primary graduate course."
			},
			{
				kind: "youtube",
				title: "CS 234 Reinforcement Learning",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rN4wG6Nk6sNpTEbuOSosZdX",
				note: "A second campus, Spring 2024, if you want another voice."
			},
			{
				kind: "book",
				title: "Reinforcement Learning: An Introduction",
				source: "Sutton & Barto",
				url: "http://incompleteideas.net/book/the-book-2nd.html",
				note: "Free second edition."
			}
		]
	},
	{
		slug: "csce-643",
		code: "CSCE 643",
		title: "Seminar in Intelligent Systems and Robotics",
		credits: "3",
		creditValue: 3,
		area: "research",
		match: "practice",
		prereq: "Instructor approval. Content varies.",
		blurb: "A seminar: current problems, methods, and papers. Not a fixed syllabus.",
		why: "Do not hunt for a fake equivalent playlist. Run a ten-week seminar: one CS 285 lecture or a CoRL talk, one paper, one page of notes, each week.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "CS 285 as the seminar spine",
			source: "UC Berkeley",
			url: "https://www.youtube.com/playlist?list=PLkFD6_40KJIwhWJpGazJ9VSj9CFMkb79A",
			note: "Use lectures as prompts, then leave them for papers."
		}, {
			kind: "site",
			title: "arXiv robotics and cs.AI",
			source: "arXiv",
			url: "https://arxiv.org/list/cs.RO/recent",
			note: "The reading list. Write the notes. That writing is the credit."
		}]
	},
	{
		slug: "csce-645",
		code: "CSCE 645",
		title: "Geometric Modeling",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "close",
		prereq: "CSCE 441 and CSCE 442 or equivalent. Cross-listed VIZA 675.",
		blurb: "Splines and Bézier curves, parametric solids, topology, and Boolean structure.",
		why: "Keenan Crane’s discrete differential geometry course is the best public mathematics of curves, surfaces, and meshes. It is broader than a CAGD shop class and stricter than a Blender tutorial.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Discrete Differential Geometry",
			source: "CMU, Keenan Crane",
			url: "https://www.cs.cmu.edu/~kmcrane/Projects/DDG/",
			note: "Primary. Notes, lectures, and assignments linked from the course page."
		}, {
			kind: "youtube",
			title: "CS 184 curve and surface lectures, in context",
			source: "UC Berkeley",
			url: "https://www.youtube.com/playlist?list=PLIygTcviGPKABEUa7EJzO8tgYRz120EpP",
			note: "Use the geometry weeks beside Crane, not as a replacement."
		}]
	},
	{
		slug: "csce-646",
		code: "CSCE 646",
		title: "Digital Image",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "close",
		prereq: "Graduate classification or instructor approval. Cross-listed VIZA 654.",
		blurb: "Representation, display, warping, color, enhancement, filtering, and manipulation of 2D images.",
		why: "This is image processing, not computer vision research. A digital image processing course plus OpenCV’s official tutorials matches the lab hours in the catalog.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Image Processing",
			source: "Duke University",
			url: "https://www.coursera.org/learn/image-processing",
			note: "Sampling, filtering, enhancement. Audit the lectures."
		}, {
			kind: "lab",
			title: "OpenCV tutorials",
			source: "OpenCV",
			url: "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html",
			note: "The lab. Redo each filter yourself, then compare."
		}]
	},
	{
		slug: "csce-647",
		code: "CSCE 647",
		title: "Image Synthesis",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "full",
		prereq: "Graduate classification in visualization, VIZA 652, or instructor approval. Cross-listed VIZA 656.",
		blurb: "Local and global illumination, shading, shadows, visibility, texturing, and projections.",
		why: "Physically Based Rendering is the book, and it is free. Utah’s interactive graphics lectures and Berkeley’s path-tracing project are how you stop reading and start generating images.",
		hours: 88,
		resources: [
			{
				kind: "book",
				title: "Physically Based Rendering",
				source: "Pharr, Jakob, Humphreys",
				url: "https://pbr-book.org/",
				note: "Primary text. Online, free, current."
			},
			{
				kind: "youtube",
				title: "Interactive Computer Graphics",
				source: "University of Utah",
				url: "https://www.youtube.com/playlist?list=PLplnkTzzqsZS3R5DjmCQsqupu43oS9CFN",
				note: "Cem Yuksel. Rasterization and shading, taught directly."
			},
			{
				kind: "site",
				title: "CS 184 projects",
				source: "UC Berkeley",
				url: "https://cs184.eecs.berkeley.edu/sp22",
				note: "Implement a ray tracer. That single project is most of this course."
			}
		]
	},
	{
		slug: "csce-648",
		code: "CSCE 648",
		title: "Computer Aided Sculpting",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "partial",
		prereq: "Instructor approval. Cross-listed VIZA 657.",
		blurb: "Artistic and mathematical 3D modeling: proportion, posture, curves, volumes, CSG, implicit surfaces.",
		why: "No public course joins the figure-drawing half and the mathematics half. Do Crane for the math of surfaces and Blender’s official tutorials for the sculpting practice. Say so in your notes: this is a composite.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Discrete Differential Geometry",
			source: "CMU, Keenan Crane",
			url: "https://www.cs.cmu.edu/~kmcrane/Projects/DDG/",
			note: "Curves, surfaces, meshes."
		}, {
			kind: "site",
			title: "Blender tutorials",
			source: "Blender",
			url: "https://www.blender.org/support/tutorials/",
			note: "Sculpting practice. Official starting points, not a random creator marathon."
		}]
	},
	{
		slug: "csce-649",
		code: "CSCE 649",
		title: "Physically-Based Modeling",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "close",
		prereq: "Instructor approval. Cross-listed VIZA 659.",
		blurb: "Simulation for animation: particles, flexible materials, kinematics, and constraints.",
		why: "SIGGRAPH courses and Matthias Müller’s ten-minute physics lectures are where this material actually lives in public. Implement a particle system and a constraint before you watch a third survey.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "Ten Minute Physics",
				source: "Matthias Müller",
				url: "https://www.youtube.com/@TenMinutePhysics",
				note: "Primary. Short, exact, and meant to be coded."
			},
			{
				kind: "youtube",
				title: "SIGGRAPH conference courses",
				source: "ACM SIGGRAPH",
				url: "https://www.youtube.com/@ACMSIGGRAPH",
				note: "Pick a physics-based animation course from a recent year and finish it."
			},
			{
				kind: "book",
				title: "Physically Based Rendering, only the sampling chapters",
				source: "pbr-book.org",
				url: "https://pbr-book.org/",
				note: "If your interest is light transport rather than bodies. Otherwise skip."
			}
		]
	},
	{
		slug: "csce-650",
		code: "CSCE 650",
		title: "Virtual Reality",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "close",
		prereq: "Graduate classification or instructor approval. Cross-listed VIZA 677.",
		blurb: "Immersion, 3D interaction, presence, navigation, evaluation, and a built experience.",
		why: "The University of London specialization covers devices, perception, and interaction. Unity’s VR pathway is the lab. The catalog’s evaluation unit is on you: test the thing with other people.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Virtual Reality specialization",
			source: "University of London",
			url: "https://www.coursera.org/specializations/virtual-reality",
			note: "Primary survey. Audit."
		}, {
			kind: "lab",
			title: "VR development pathway",
			source: "Unity Learn",
			url: "https://learn.unity.com/pathway/vr-development",
			note: "Ship one experience. A headset helps; the editor still teaches the interaction design."
		}]
	},
	{
		slug: "csce-652",
		code: "CSCE 652",
		title: "Software Reverse Engineering",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "full",
		prereq: "CSCE 313 or instructor approval.",
		blurb: "From compiler output to file formats, disassembly, control-flow graphs, static and dynamic analysis, obfuscation, and malware.",
		why: "Ali Hadi’s offensive security and reverse engineering sequence is a full public course. pwn.college is the lab, and it is better than most university homework.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "Offensive Security and Reverse Engineering",
				source: "Ali Hadi",
				url: "https://www.youtube.com/playlist?list=PLCS2zI95IiNybAAQ0HL88YzwRpLXje5y6",
				note: "Primary lecture sequence."
			},
			{
				kind: "lab",
				title: "pwn.college",
				source: "Arizona State",
				url: "https://pwn.college/",
				note: "Do the reversing and program-security modules. Free."
			},
			{
				kind: "site",
				title: "OpenSecurityTraining",
				source: "OST",
				url: "https://opensecuritytraining.info/",
				note: "Introductory x86 and life-of-binaries material if the playlist starts too far in."
			}
		]
	},
	{
		slug: "csce-653",
		code: "CSCE 653",
		title: "Computer Methods in Applied Sciences",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "full",
		prereq: "CSCE 442 or MATH 417; graduate classification.",
		blurb: "Error, roots, interpolation, quadrature, linear systems, splines, ODEs, and finite differences.",
		why: "This is numerical analysis. Columbia’s recorded semester and Strang’s computational science course on OCW cover the catalog list without a paywall.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "Numerical Algorithms",
			source: "Columbia",
			url: "https://www.youtube.com/playlist?list=PL682UO4IMem98vm26lNUJ0TV0-EFrcUJb",
			note: "Primary lecture set."
		}, {
			kind: "ocw",
			title: "18.085 Computational Science and Engineering I",
			source: "MIT, Gilbert Strang",
			url: "https://ocw.mit.edu/courses/18-085-computational-science-and-engineering-i-fall-2008/",
			note: "The applied half: matrices, finite differences, differential equations."
		}]
	},
	{
		slug: "csce-654",
		code: "CSCE 654",
		title: "Supercomputing",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "close",
		prereq: "CSCE 614.",
		blurb: "High-performance scientific computing: vectorization, programming models, numerical methods, and measurement.",
		why: "There is no single ‘supercomputing’ MOOC that matches the machines. Stanford’s MPI/OpenMP/CUDA course plus Argonne’s ATPESC lectures are what people in HPC actually point to.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "CME 213 Parallel Computing with MPI, OpenMP, and CUDA",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLAtMgFDMfGy2mysjPHN_d1cf9sR1muRkq",
				note: "Primary programming course."
			},
			{
				kind: "site",
				title: "Argonne Training Program on Extreme-Scale Computing",
				source: "Argonne",
				url: "https://extremecomputingtraining.anl.gov/",
				note: "The scientific-supercomputing lectures. Recordings are posted by year."
			},
			{
				kind: "youtube",
				title: "ECE 408 Applied Parallel Programming",
				source: "UIUC",
				url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw-UKfRL5smPfFFpeqwN3Dsz",
				note: "GPU programming in more detail, if CME 213’s CUDA unit is too short."
			}
		]
	},
	{
		slug: "csce-655",
		code: "CSCE 655",
		title: "Human-Centered Computing",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "full",
		prereq: "Graduate classification, or CSCE 436 or 444, or instructor approval.",
		blurb: "Interaction, prototyping, evaluation, visual design, information structure, and a team project.",
		why: "Scott Klemmer’s HCI specialization is still the public course that behaves like a studio: needfinding, prototyping, heuristic evaluation, and a running project. Pick this or CSCE 671, not both, unless interaction is your field.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Human-Computer Interaction",
			source: "UC San Diego, Scott Klemmer",
			url: "https://www.coursera.org/specializations/human-computer-interaction",
			note: "Primary. Four courses. Audit, and still do the project."
		}, {
			kind: "site",
			title: "CS 147 materials",
			source: "Stanford HCI",
			url: "https://hci.stanford.edu/courses/cs147/",
			note: "A campus studio syllabus if you want extra project constraints."
		}]
	},
	{
		slug: "csce-656",
		code: "CSCE 656",
		title: "Computers and New Media",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "partial",
		prereq: "Graduate classification.",
		blurb: "Computers in the design of new media, and the relationship between authors and readers of interactive work.",
		why: "This is a studio-seminar, not a toolkit class. The Coding Train is the making practice (Processing and p5.js). The seminar half is a log of interactive works you can actually open, with a paragraph on who the reader is.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "The Coding Train",
			source: "Daniel Shiffman",
			url: "https://thecodingtrain.com/",
			note: "Primary making practice. Free. Follow one full track, then leave the tutorials."
		}, {
			kind: "site",
			title: "Processing tutorials",
			source: "Processing Foundation",
			url: "https://processing.org/tutorials",
			note: "Reference when the videos skip a language point."
		}]
	},
	{
		slug: "csce-658",
		code: "CSCE 658",
		title: "Randomized Algorithms",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "Probability tools aimed at algorithms: the main paradigms, then a lot of fully analyzed examples.",
		why: "MIT’s current randomized-algorithms lectures and Kent Quanrud’s Purdue course are both full graduate semesters. Either is the course. Do the problem sets that are posted.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "6.5220 / 6.856 Randomized Algorithms",
				source: "MIT",
				url: "https://www.youtube.com/playlist?list=PL278F9gM5aZb8HXAh2yT3QmwyYQZrQUNH",
				note: "Primary. Spring 2025."
			},
			{
				kind: "site",
				title: "Course page",
				source: "MIT",
				url: "https://courses.csail.mit.edu/6.856/current/",
				note: "Notes and assignments beside the videos."
			},
			{
				kind: "youtube",
				title: "CS 588 Randomized Algorithms",
				source: "Purdue, Kent Quanrud",
				url: "https://www.youtube.com/playlist?list=PL0YFU3y0Z_gZxc-FeLhbOFS99ZzlWl4He",
				note: "Spring 2024. Excellent alternate."
			}
		]
	},
	{
		slug: "csce-662",
		code: "CSCE 662",
		title: "Distributed Processing Systems",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "CSCE 313 and CSCE 463 or CSCE 612.",
		blurb: "Protocols, RPC, file sharing, fault tolerance, load balancing, distributed databases, and security.",
		why: "MIT 6.824 is this course: RPC, GFS, Raft, distributed transactions, and a lab series in Go that people finish years later and still cite. It overlaps CSCE 678. Take one.",
		hours: 100,
		resources: [{
			kind: "youtube",
			title: "6.824 Distributed Systems, Spring 2020",
			source: "MIT",
			url: "https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB",
			note: "Primary lectures."
		}, {
			kind: "lab",
			title: "6.824 labs",
			source: "MIT PDOS",
			url: "https://pdos.csail.mit.edu/6.824/",
			note: "MapReduce, Raft, a sharded key-value store. The labs are the degree."
		}]
	},
	{
		slug: "csce-664",
		code: "CSCE 664",
		title: "Wireless and Mobile Systems",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "partial",
		prereq: "CSCE 463 or CSCE 464 or instructor approval.",
		blurb: "Wireless fundamentals, MAC, transport over wireless, capacity, ad hoc and sensor nets, and mobile security.",
		why: "Public material splits into radio surveys and internet protocol courses. Yonsei’s wireless course is the friendly physical-layer half. CS 144 remains the protocol half. A full ad hoc networking lab is still mostly papers.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Wireless Communications for Everybody",
			source: "Yonsei University",
			url: "https://www.coursera.org/learn/wireless-communications",
			note: "Primary survey of the wireless channel and systems."
		}, {
			kind: "youtube",
			title: "CS 144",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN",
			note: "Layering and transport, so the wireless MAC lectures have a stack to sit in."
		}]
	},
	{
		slug: "csce-665",
		code: "CSCE 665",
		title: "Advanced Networking and Security",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "close",
		prereq: "Graduate classification and instructor approval.",
		blurb: "Security of network protocols, investigated on live machines.",
		why: "MIT 6.858 is the public course that treats network and software attacks as labs. Do it after CS 144, not before.",
		hours: 88,
		resources: [
			{
				kind: "ocw",
				title: "6.858 Computer Systems Security",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-858-computer-systems-security-fall-2014/video_galleries/video-lectures/",
				note: "Primary. Lectures and the lab mindset."
			},
			{
				kind: "youtube",
				title: "CS 144",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN",
				note: "Prerequisite repair: you cannot attack a stack you cannot draw."
			},
			{
				kind: "lab",
				title: "pwn.college",
				source: "Arizona State",
				url: "https://pwn.college/",
				note: "Live-machine practice when the 2014 labs are too dated to build."
			}
		]
	},
	{
		slug: "csce-666",
		code: "CSCE 666",
		title: "Pattern Analysis",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "close",
		prereq: "MATH 222, MATH 411 or equivalent; graduate classification.",
		blurb: "Density estimation, features, clustering, classifiers, spectral methods, HMMs, and ensembles.",
		why: "The catalog language is statistical pattern recognition, which is what Caltech’s Learning From Data and the unsupervised half of CS 229 still are. Deep learning is a later course, not a substitute.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Learning From Data",
			source: "Caltech",
			url: "http://work.caltech.edu/telecourse.html",
			note: "Primary. Theory of learning and generalization."
		}, {
			kind: "youtube",
			title: "CS 229",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy",
			note: "Generative models, clustering, and practical classifiers."
		}]
	},
	{
		slug: "csce-668",
		code: "CSCE 668",
		title: "Distributed Algorithms and Systems",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 411 or equivalent, or instructor approval.",
		blurb: "Leader election, mutual exclusion, consensus, logical time, snapshots, fault tolerance, and shared memory.",
		why: "This is the theory course, not 6.824. ETH’s Principles of Distributed Computing notes (Wattenhofer) follow the catalog almost heading for heading. Use 6.824 only as intuition before the proofs.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Principles of Distributed Computing",
			source: "ETH Zurich",
			url: "https://disco.ethz.ch/",
			note: "Primary. Wattenhofer’s lecture materials and free book drafts live on the group’s course pages."
		}, {
			kind: "youtube",
			title: "6.824 Distributed Systems",
			source: "MIT",
			url: "https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB",
			note: "Systems intuition for Raft and time. Not a proof course."
		}]
	},
	{
		slug: "csce-669",
		code: "CSCE 669",
		title: "Computational Optimization",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 629.",
		blurb: "Polyhedra as a way to solve combinatorial problems: flows, matching, matroids, and approximation.",
		why: "The catalog entry is polyhedral combinatorics. Pascal Van Hentenryck’s discrete optimization course is the public class that makes you formulate and solve those problems. Convex optimization is the continuous neighbor, not the same course.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Discrete Optimization",
			source: "University of Melbourne",
			url: "https://www.coursera.org/learn/discrete-optimization",
			note: "Primary. Hard assignments. That is the point."
		}, {
			kind: "site",
			title: "Convex Optimization, Boyd",
			source: "Stanford",
			url: "https://web.stanford.edu/~boyd/cvxbook/",
			note: "Free book. Read only if you also need the continuous theory. Extra, not required."
		}]
	},
	{
		slug: "csce-670",
		code: "CSCE 670",
		title: "Information Storage and Retrieval",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "full",
		prereq: "CSCE 310 or CSCE 603, or instructor approval; graduate classification.",
		blurb: "Indexes, compression, and query processing for very large document collections, plus evaluation of a full retrieval system.",
		why: "ETH’s information retrieval lectures and Stanford’s CS 276 notes are the classical graduate course: inverted indexes, scoring, evaluation, and web search.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "Information Retrieval",
			source: "ETH Zurich",
			url: "https://www.youtube.com/playlist?list=PLzn6LN6WhlN1ktkDvNurPSDwTQ_oGQisn",
			note: "Primary video semester."
		}, {
			kind: "site",
			title: "CS 276 Information Retrieval",
			source: "Stanford",
			url: "https://web.stanford.edu/class/cs276/",
			note: "Manning’s notes and assignments. Build a small index."
		}]
	},
	{
		slug: "csce-671",
		code: "CSCE 671",
		title: "Computer-Human Interaction",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "History and theory of CHI, user and interface models, task analysis, and interaction styles.",
		why: "Same public specialization as human-centered computing, read for the theory and the history rather than the studio. If interaction is not your field, take 655 instead of this.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Human-Computer Interaction",
			source: "UC San Diego",
			url: "https://www.coursera.org/specializations/human-computer-interaction",
			note: "Primary."
		}, {
			kind: "site",
			title: "CS 147",
			source: "Stanford HCI",
			url: "https://hci.stanford.edu/courses/cs147/",
			note: "Syllabus and readings for a second pass at the theory."
		}]
	},
	{
		slug: "csce-672",
		code: "CSCE 672",
		title: "Computer Supported Collaborative Work",
		credits: "3",
		creditValue: 3,
		area: "interaction",
		match: "partial",
		prereq: "CSCE 671 or CSCE 610 or instructor approval.",
		blurb: "Systems for people working together: theory, practice, and the social side of CSCW.",
		why: "CSCW is a research community more than a MOOC topic. Do the HCI specialization’s design methods, then read a year of CSCW papers and design one collaborative workflow. Label it a seminar.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Human-Computer Interaction",
			source: "UC San Diego",
			url: "https://www.coursera.org/specializations/human-computer-interaction",
			note: "Methods you will need before the papers make sense."
		}, {
			kind: "site",
			title: "ACM CSCW conference",
			source: "ACM",
			url: "https://cscw.acm.org/",
			note: "The community. Use open PDFs authors post, and keep a reading log."
		}]
	},
	{
		slug: "csce-676",
		code: "CSCE 676",
		title: "Data Mining and Analysis",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "full",
		prereq: "Graduate work in CS, or the cross-list. Cross-listed ECEN 758 and STAT 639.",
		blurb: "Exploration, pattern mining, clustering, classification, and applications to scientific and online data.",
		why: "Mining of Massive Datasets is the free book, and it is the course. Stanford CS 246 teaches it. The University of Washington playlist is a video alternative.",
		hours: 88,
		resources: [
			{
				kind: "book",
				title: "Mining of Massive Datasets",
				source: "Leskovec, Rajaraman, Ullman",
				url: "http://www.mmds.org/",
				note: "Primary text. Free."
			},
			{
				kind: "site",
				title: "CS 246 Mining Massive Data Sets",
				source: "Stanford",
				url: "http://web.stanford.edu/class/cs246/",
				note: "Assignments that follow the book."
			},
			{
				kind: "youtube",
				title: "Data Mining",
				source: "University of Washington",
				url: "https://www.youtube.com/playlist?list=PLTPQEx-31JXgtDaC6-3HxWcp7fq4N8YGr",
				note: "Full video course if you want lectures in order."
			}
		]
	},
	{
		slug: "csce-678",
		code: "CSCE 678",
		title: "Distributed Systems and Cloud Computing",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "Graduate classification. Cross-listed ECEN 757.",
		blurb: "MapReduce, synchronization, peer-to-peer systems, election, agreement, replication, and scheduling.",
		why: "The catalog description is nearly the 6.824 syllabus. Same lectures and labs as CSCE 662. Take 678 or 662, not both.",
		hours: 100,
		resources: [
			{
				kind: "youtube",
				title: "6.824 Distributed Systems",
				source: "MIT",
				url: "https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB",
				note: "Primary."
			},
			{
				kind: "lab",
				title: "6.824 labs",
				source: "MIT PDOS",
				url: "https://pdos.csail.mit.edu/6.824/",
				note: "Required. Watching Raft is not implementing Raft."
			},
			{
				kind: "youtube",
				title: "15-440 Distributed Systems",
				source: "CMU",
				url: "https://www.youtube.com/playlist?list=PLIygTcviGPKAp30J9kcVW9jPzFC7Otpol",
				note: "A second campus, Spring 2022."
			}
		]
	},
	{
		slug: "csce-679",
		code: "CSCE 679",
		title: "Data Visualization",
		credits: "3",
		creditValue: 3,
		area: "data",
		match: "close",
		prereq: "Graduate classification or instructor approval. Cross-listed VIZA 676.",
		blurb: "Visual encoding, 3D visualization, infographics, narrative, and interaction.",
		why: "Tamara Munzner’s framework is what graduate visualization courses teach. Pair the book site with a Coursera survey and then redesign one real dataset three ways.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Visualization Analysis and Design",
			source: "Tamara Munzner, UBC",
			url: "https://www.cs.ubc.ca/~tmm/vadbook/",
			note: "Primary framework. The book is not free; the course pages and talks linked here are the public path."
		}, {
			kind: "coursera",
			title: "Data Visualization",
			source: "University of Illinois",
			url: "https://www.coursera.org/learn/data-visualization",
			note: "A structured survey with exercises. Audit."
		}]
	},
	{
		slug: "csce-680",
		code: "CSCE 680",
		title: "Testing and Diagnosis of Digital Systems",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "partial",
		prereq: "ECEN 248 or equivalent, and a computer architecture course. Cross-listed ECEN 680.",
		blurb: "Testing VLSI circuits and systems, and design for testability.",
		why: "Design-for-test is taught in industry courses more than on YouTube. Verification Academy’s DFT material is the usable public path, after Nand to Tetris or an architecture course.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Verification Academy",
			source: "Siemens EDA",
			url: "https://verificationacademy.com/courses",
			note: "Look for design-for-test and functional verification modules."
		}, {
			kind: "site",
			title: "Nand to Tetris",
			source: "IDC / Hebrew University",
			url: "https://www.nand2tetris.org/",
			note: "So you have a circuit to talk about failing."
		}]
	},
	{
		slug: "csce-681",
		code: "CSCE 681",
		title: "Seminar",
		credits: "0–1",
		creditValue: 0,
		area: "research",
		match: "practice",
		prereq: "Graduate classification. Once in a master’s, twice in a PhD.",
		blurb: "Reports on current research and selected papers. A seminar credit, not a subject course.",
		why: "Do not count this toward the thirty. If you want the habit: one paper a week, one page, for a semester, in the field of your track.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "arXiv",
			source: "arXiv",
			url: "https://arxiv.org/",
			note: "Pick a single archive — cs.LG, cs.DC, cs.CR — and stay there."
		}]
	},
	{
		slug: "csce-682",
		code: "CSCE 682",
		title: "Introduction to Doctoral Studies",
		credits: "0",
		creditValue: 0,
		area: "research",
		match: "practice",
		prereq: "Doctoral classification in Computer Science and Engineering.",
		blurb: "Orientation to doctoral milestones, publication, and talks. Not a master’s course.",
		why: "Skip it for this bulletin. It has no subject matter to study in public, and it is restricted to doctoral students on campus.",
		hours: 0,
		resources: [{
			kind: "site",
			title: "How to do research, a practical note",
			source: "MIT 6.S983 and similar advice is scattered",
			url: "https://www.cs.cmu.edu/~mblum/research/pdf/grad.html",
			note: "Manuel Blum’s advice to a beginning graduate student. Read once. Then get back to a real course."
		}]
	},
	{
		slug: "csce-684",
		code: "CSCE 684",
		title: "Professional Internship",
		credits: "1–16",
		creditValue: 0,
		area: "research",
		match: "practice",
		prereq: "Department approval and one semester of graduate work. Off campus. At TAMU these hours are in addition to the 30, not inside them.",
		blurb: "Work under practicing professionals. Not substitutable by video.",
		why: "If you want the professional half of a master’s, ship something other people use. The bulletin will not pretend a playlist is an internship, and it will not count these hours toward thirty.",
		hours: 0,
		resources: [{
			kind: "site",
			title: "Missing Semester",
			source: "MIT",
			url: "https://missing.csail.mit.edu/",
			note: "The only ‘course’ that helps an internship. The internship itself is the work."
		}]
	},
	{
		slug: "csce-685",
		code: "CSCE 685",
		title: "Directed Studies",
		credits: "1–12",
		creditValue: 0,
		area: "research",
		match: "practice",
		prereq: "A limited research problem, meant to learn how to do research.",
		blurb: "Independent study. You would need an advisor. Videos are not an advisor.",
		why: "The self-directed version is a six-week project with a written report and code, scoped smaller than a thesis. Keep it off the thirty-credit count unless you are honest that nobody reviewed it.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "arXiv",
			source: "arXiv",
			url: "https://arxiv.org/",
			note: "Read five papers in one narrow topic before you write the report."
		}]
	},
	{
		slug: "csce-689",
		code: "CSCE 689",
		title: "Special Topics",
		credits: "0–4",
		creditValue: 3,
		area: "research",
		match: "practice",
		prereq: "Instructor approval. Repeatable. Content is whatever the faculty member is teaching that term.",
		blurb: "A shell number. On campus this is where new courses live before they get their own code.",
		why: "Use this slot for one advanced public course that is not already in your ten. Good fills: CS 224N if you are not in the NLP course, or 6.824 if you are not in distributed systems.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "CS 224N",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D",
			note: "One defensible special topic."
		}, {
			kind: "youtube",
			title: "6.824",
			source: "MIT",
			url: "https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB",
			note: "Another. Do not double-count it against CSCE 678."
		}]
	},
	{
		slug: "csce-691",
		code: "CSCE 691",
		title: "Research",
		credits: "1–23",
		creditValue: 0,
		area: "research",
		match: "practice",
		prereq: "Thesis or dissertation research. The Master of Computer Science is non-thesis; this number belongs to the M.S. and Ph.D.",
		blurb: "Research hours. The professional MCS this bulletin copies does not include them.",
		why: "If you want a thesis-shaped ending, add it after the thirty: one question, one implementation, one report. It is not a substitute for algorithms, systems, or a field course.",
		hours: 100,
		resources: [{
			kind: "site",
			title: "How to read a paper",
			source: "S. Keshav",
			url: "https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf",
			note: "Three-pass method. Use it on the related work before you claim a contribution."
		}]
	},
	{
		slug: "csce-701",
		code: "CSCE 701",
		title: "Foundations of Cybersecurity",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "close",
		prereq: "Graduate classification or instructor approval. Cross-listed CYBR 601.",
		blurb: "Principles, cryptography, cyber-physical security, authentication, firewalls, intrusion detection, and the social side.",
		why: "No single free course is this broad on purpose. CS50 Cybersecurity is the map. MIT 6.858 is the technical core. Boneh is the cryptography you are not allowed to fake.",
		hours: 88,
		resources: [
			{
				kind: "edx",
				title: "CS50 Cybersecurity",
				source: "Harvard",
				url: "https://cs50.harvard.edu/cybersecurity/",
				note: "The map: threats, cryptography in practice, and how attacks are told."
			},
			{
				kind: "ocw",
				title: "6.858 Computer Systems Security",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-858-computer-systems-security-fall-2014/video_galleries/video-lectures/",
				note: "Primary technical course."
			},
			{
				kind: "coursera",
				title: "Cryptography I",
				source: "Stanford, Dan Boneh",
				url: "https://www.coursera.org/learn/crypto",
				note: "Do not skip. The catalog names cryptographic algorithms for a reason."
			}
		]
	},
	{
		slug: "csce-702",
		code: "CSCE 702",
		title: "Law and Policy in Cybersecurity",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "partial",
		prereq: "Graduate classification. Cross-listed CYBR 602.",
		blurb: "Procurement, operations, governance, and domestic and global cyber law and policy.",
		why: "Policy courses rot quickly and few stay fully open. Read the primary sources: CISA’s public guidance and Stanford’s Center for Internet and Society. Keep a brief on one statute or one incident, not a folder of news videos.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Stanford Center for Internet and Society",
			source: "Stanford Law",
			url: "https://cyberlaw.stanford.edu/",
			note: "Primary reading room. Papers and explainers from a real cyberlaw clinic."
		}, {
			kind: "site",
			title: "CISA cybersecurity best practices",
			source: "CISA",
			url: "https://www.cisa.gov/topics/cybersecurity-best-practices",
			note: "Operational policy as the U.S. government actually publishes it."
		}]
	},
	{
		slug: "csce-703",
		code: "CSCE 703",
		title: "Cybersecurity Risk",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "close",
		prereq: "Graduate classification. Cross-listed CYBR 603.",
		blurb: "Avoid, accept, mitigate, transfer. Assessment, categorization, and audit frameworks.",
		why: "The course is NIST’s Risk Management Framework and the Cybersecurity Framework, read slowly and applied to one system you actually know. That is the professional version of this class.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "NIST Risk Management Framework",
			source: "NIST",
			url: "https://csrc.nist.gov/projects/risk-management/about-rmf",
			note: "Primary. Read the RMF overview, then 800-37."
		}, {
			kind: "site",
			title: "NIST Cybersecurity Framework",
			source: "NIST",
			url: "https://www.nist.gov/cyberframework",
			note: "The other document this course is built around. Apply both to one small system and write the assessment."
		}]
	},
	{
		slug: "csce-704",
		code: "CSCE 704",
		title: "Data Analytics for Cybersecurity",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "partial",
		prereq: "Graduate classification. Cross-listed CYBR 604.",
		blurb: "Clustering, supervised learning, anomaly detection, and visualization aimed at attacks and vulnerabilities.",
		why: "Composite on purpose: CS 229 for the methods (especially anomaly detection), MITRE ATT&CK for the phenomena. A university course would add a SOC dataset. You can use a public one after those two.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "CS 229 Machine Learning",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PLoROMvodv4rNyWOpJg_Yh4NSqI4Z4vOYy",
			note: "Methods. Stay for generative models and anomaly material."
		}, {
			kind: "site",
			title: "MITRE ATT&CK",
			source: "MITRE",
			url: "https://attack.mitre.org/",
			note: "The taxonomy real detection work uses. Learn it before you train a classifier on ‘malicious’."
		}]
	},
	{
		slug: "csce-706",
		code: "CSCE 706",
		title: "Structured Programming in C",
		credits: "3",
		creditValue: 3,
		area: "foundations",
		match: "full",
		bridge: true,
		prereq: "Graduate classification; non–computer-science majors.",
		blurb: "Algorithms, documentation, and the C language in detail. A bridge course, not a master’s elective in this bulletin.",
		why: "Harvard CS50 is the public C course, and it is on edX as well as Harvard’s own site. Take it before operating systems or reverse engineering if pointers are still a rumor.",
		hours: 88,
		resources: [{
			kind: "edx",
			title: "CS50x Introduction to Computer Science",
			source: "Harvard",
			url: "https://cs50.harvard.edu/x/",
			note: "Also on edX. C is the middle of the course. Do the problem sets."
		}, {
			kind: "youtube",
			title: "CS50 lectures",
			source: "Harvard",
			url: "https://www.youtube.com/@cs50",
			note: "The same lectures, if you already use YouTube for everything else."
		}]
	},
	{
		slug: "csce-708",
		code: "CSCE 708",
		title: "Introduction to Computer Science Concepts and Programming",
		credits: "3",
		creditValue: 3,
		area: "foundations",
		match: "full",
		bridge: true,
		prereq: "Graduate classification; non-CS engineering majors.",
		blurb: "Logic, algorithmic thinking, and Java. A bridge course.",
		why: "The University of Helsinki Java MOOC is stricter and freer than most introductions. It is the right bridge if your later courses will be in Java. If they will be in C or Python, take CS50 instead.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Java Programming MOOC",
			source: "University of Helsinki",
			url: "https://java-programming.mooc.fi/",
			note: "Primary. Free, automated grading, two parts."
		}, {
			kind: "edx",
			title: "CS50x",
			source: "Harvard",
			url: "https://cs50.harvard.edu/x/",
			note: "Alternate if you want C now and a language survey around it."
		}]
	},
	{
		slug: "csce-709",
		code: "CSCE 709",
		title: "Intermediate Program Design and Development with C++",
		credits: "3",
		creditValue: 3,
		area: "foundations",
		match: "close",
		bridge: true,
		prereq: "Graduate classification.",
		blurb: "C++ for people who already program: memory, objects, and not leaking either.",
		why: "LearnCpp is the complete free text. The C++ Core Guidelines are what you read after the language stops surprising you. This stays a bridge unless systems programming is the point.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "LearnCpp",
			source: "LearnCpp",
			url: "https://www.learncpp.com/",
			note: "Primary. Read in order. Do the quizzes."
		}, {
			kind: "site",
			title: "C++ Core Guidelines",
			source: "Standard C++ Foundation",
			url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines",
			note: "After the tutorial. This is how the language is supposed to be used."
		}]
	},
	{
		slug: "csce-711",
		code: "CSCE 711",
		title: "Foundation of Modern Cryptography",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "full",
		prereq: "STAT 211 and CSCE 411; graduate classification.",
		blurb: "Perfect secrecy, pseudorandomness, definitions, symmetric and public-key schemes, signatures, zero knowledge, and multiparty computation at the foundation level.",
		why: "Dan Boneh’s Cryptography I, plus the free Boneh–Shoup book, is this course. Christof Paar is the right first week if definitions feel hostile — then go back to Boneh and stay there.",
		hours: 96,
		resources: [
			{
				kind: "coursera",
				title: "Cryptography I",
				source: "Stanford, Dan Boneh",
				url: "https://www.coursera.org/learn/crypto",
				note: "Primary."
			},
			{
				kind: "book",
				title: "A Graduate Course in Applied Cryptography",
				source: "Boneh & Shoup",
				url: "https://toc.cryptobook.us/",
				note: "Free. Read beside the lectures. This is the graduate text."
			},
			{
				kind: "youtube",
				title: "Introduction to Cryptography",
				source: "Christof Paar, Ruhr University Bochum",
				url: "https://www.youtube.com/playlist?list=PLwJWuZfL_Ga2KJrTf9hOIgAQWkSpn9RNm",
				note: "Engineering intuition. Not a replacement for definitions."
			}
		]
	},
	{
		slug: "csce-712",
		code: "CSCE 712",
		title: "Digital Forensic Engineering",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "partial",
		prereq: "Graduate classification.",
		blurb: "Computer and network forensics: principles, tools, and the legal handling of digital evidence.",
		why: "Vendor certifications dominate this topic and are not free. 13Cubed’s lecture-quality YouTube archive plus NIST’s tool-testing program is the public technical path. The legal half is a procedure you must read, not a vibe.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "13Cubed",
			source: "13Cubed",
			url: "https://www.youtube.com/@13Cubed",
			note: "Primary. Windows forensics, artifacts, and investigation method. Follow a playlist, not the latest upload."
		}, {
			kind: "site",
			title: "Computer Forensics Tool Testing",
			source: "NIST",
			url: "https://www.nist.gov/itl/ssd/software-quality-group/computer-forensics-tool-testing-program",
			note: "How forensic tools are actually evaluated. Read one test report."
		}]
	},
	{
		slug: "csce-713",
		code: "CSCE 713",
		title: "Software Security",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "full",
		prereq: "CSCE 431 or CSCE 606, or instructor approval; graduate classification.",
		blurb: "Secure design and implementation, static and dynamic review, risk, and security testing.",
		why: "Maryland’s software security course on Coursera was built for this syllabus. pwn.college is where the bugs become muscle memory. MIT 6.858 if you want a campus lecture voice.",
		hours: 88,
		resources: [
			{
				kind: "coursera",
				title: "Software Security",
				source: "University of Maryland",
				url: "https://www.coursera.org/learn/software-security",
				note: "Primary. Michael Hicks. Audit."
			},
			{
				kind: "lab",
				title: "pwn.college",
				source: "Arizona State",
				url: "https://pwn.college/",
				note: "Required practice."
			},
			{
				kind: "ocw",
				title: "6.858 Computer Systems Security",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-858-computer-systems-security-fall-2014/video_galleries/video-lectures/",
				note: "Lecture alternate."
			}
		]
	},
	{
		slug: "csce-714",
		code: "CSCE 714",
		title: "Advanced Hardware Design Functional Verification",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "partial",
		prereq: "CSCE 616 or a hardware course; C/C++/Verilog/VHDL.",
		blurb: "Advanced functional verification in an IP-based hardware methodology.",
		why: "Continue the CSCE 616 path into UVM and coverage closure. There is no second public university semester. Verification Academy’s advanced courses are what industry uses after the introduction.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Verification Academy, advanced courses",
			source: "Siemens EDA",
			url: "https://verificationacademy.com/courses",
			note: "Primary. UVM, coverage, and formal, past the introduction."
		}, {
			kind: "site",
			title: "UVM tutorial",
			source: "ChipVerify",
			url: "https://www.chipverify.com/uvm/uvm-tutorial",
			note: "A concrete codebase to modify while the Academy courses talk."
		}]
	},
	{
		slug: "csce-715",
		code: "CSCE 715",
		title: "Secure Authentication Systems",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "partial",
		prereq: "Graduate classification.",
		blurb: "Passwords, multi-factor authentication, biometrics, end-to-end protocols, and side channels.",
		why: "Boneh gives you the protocol definitions. NIST SP 800-63 is the document working identity systems are written against. Together they are closer to this course than a product webinar.",
		hours: 88,
		resources: [{
			kind: "coursera",
			title: "Cryptography I",
			source: "Stanford, Dan Boneh",
			url: "https://www.coursera.org/learn/crypto",
			note: "MACs, authenticated encryption, and identification. Necessary."
		}, {
			kind: "site",
			title: "NIST Digital Identity Guidelines",
			source: "NIST SP 800-63",
			url: "https://pages.nist.gov/800-63-4/",
			note: "Passwords, authenticators, federation. Read the base volume and 63B."
		}]
	},
	{
		slug: "csce-716",
		code: "CSCE 716",
		title: "Foundations and Applications of Blockchains",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "What a chain can actually guarantee, and hands-on contracts — from transfers to something with a spec.",
		why: "Princeton’s Bitcoin and Cryptocurrency Technologies course is the foundations half, and the book is free. Ethereum’s own docs are the hands-on half. MIT’s Blockchain and Money lectures are the economic context.",
		hours: 88,
		resources: [
			{
				kind: "coursera",
				title: "Bitcoin and Cryptocurrency Technologies",
				source: "Princeton",
				url: "https://www.coursera.org/learn/cryptocurrency",
				note: "Primary. Narayanan, Bonneau, Miller, Goldfeder, Felten."
			},
			{
				kind: "book",
				title: "Bitcoin and Cryptocurrency Technologies",
				source: "Princeton",
				url: "https://bitcoinbook.cs.princeton.edu/",
				note: "Free book, same course."
			},
			{
				kind: "youtube",
				title: "15.S12 Blockchain and Money",
				source: "MIT, Gary Gensler",
				url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63UUkfL0onkxF6MYgVa04Fn",
				note: "Markets and policy context. Not a programming course."
			},
			{
				kind: "site",
				title: "Ethereum developer docs",
				source: "Ethereum",
				url: "https://ethereum.org/en/developers/docs/",
				note: "The lab. Deploy a small contract on a local or test network."
			}
		]
	},
	{
		slug: "csce-717",
		code: "CSCE 717",
		title: "Algorithmic Game Theory",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 629 or instructor approval.",
		blurb: "Equilibria, social choice, mechanism design, and the complexity of all three.",
		why: "Tim Roughgarden’s notes are the graduate course. The Coursera game theory class is classical game theory — take it only as the first three weeks, then move to Roughgarden.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Algorithmic Game Theory",
			source: "Tim Roughgarden",
			url: "http://timroughgarden.org/",
			note: "Primary. Lecture notes and course pages from the Stanford offerings."
		}, {
			kind: "coursera",
			title: "Game Theory",
			source: "Stanford / UBC",
			url: "https://www.coursera.org/learn/game-theory",
			note: "Nash, mixed strategies, auctions. The non-algorithmic preface."
		}]
	},
	{
		slug: "csce-726",
		code: "CSCE 726",
		title: "Large-Scale Optimization for Machine Learning",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "close",
		prereq: "CSCE 633 or CSCE 636, or instructor approval.",
		blurb: "SGD, adaptive methods, momentum, and convergence, implemented on real models.",
		why: "Boyd’s book is the foundation. MIT’s applied convex optimization lectures and CMU 10-725 are the courses. Implement SGD, momentum, and Adam on one model and plot the loss. That plot is the homework.",
		hours: 88,
		resources: [
			{
				kind: "book",
				title: "Convex Optimization",
				source: "Boyd & Vandenberghe",
				url: "https://web.stanford.edu/~boyd/cvxbook/",
				note: "Free book. Chapters 1–5 and 9 before you touch Adam."
			},
			{
				kind: "youtube",
				title: "Applied Convex Optimization",
				source: "MIT 6.S098",
				url: "https://www.youtube.com/playlist?list=PL5SG6ajT9NZKxdvM1jQOLXmeKO7MfyLxR",
				note: "Short course. Primary video."
			},
			{
				kind: "site",
				title: "10-725 Convex Optimization",
				source: "CMU",
				url: "https://www.stat.cmu.edu/~ryantibs/convexopt/",
				note: "Ryan Tibshirani. Notes and homework."
			}
		]
	},
	{
		slug: "csce-727",
		code: "CSCE 727",
		title: "Algorithmic Foundations of Big Data Computing",
		credits: "3",
		creditValue: 3,
		area: "theory",
		match: "close",
		prereq: "CSCE 629 or instructor approval.",
		blurb: "Streaming, parallel, sublinear, and sketching algorithms, with theory and implementations.",
		why: "Jelani Nelson’s sketching course is the theoretical heart. Mining of Massive Datasets is the applied heart. Do both, lightly, rather than a big-data tools tutorial.",
		hours: 88,
		resources: [
			{
				kind: "youtube",
				title: "Sketching Algorithms",
				source: "UC Berkeley, Jelani Nelson",
				url: "https://www.youtube.com/playlist?list=PLIygTcviGPKCdx1AVD-CAzNk5uXDu9wIA",
				note: "Primary theory."
			},
			{
				kind: "site",
				title: "Sketching course page",
				source: "Berkeley",
				url: "https://www.sketchingbigdata.org/fall20/lec/",
				note: "Notes aligned with the videos."
			},
			{
				kind: "book",
				title: "Mining of Massive Datasets",
				source: "mmds.org",
				url: "http://www.mmds.org/",
				note: "Streaming, locality-sensitive hashing, and MapReduce algorithms."
			}
		]
	},
	{
		slug: "csce-735",
		code: "CSCE 735",
		title: "Parallel Computing",
		credits: "3",
		creditValue: 3,
		area: "systems",
		match: "full",
		prereq: "Graduate classification or instructor approval.",
		blurb: "Multiprocessor architectures, programming tools, performance, and parallel algorithms in practice.",
		why: "UIUC’s applied parallel programming course (CUDA, with performance as the point) is the public version of this class. Stanford CME 213 if you also need MPI and OpenMP.",
		hours: 88,
		resources: [{
			kind: "youtube",
			title: "ECE 408 Applied Parallel Programming",
			source: "UIUC",
			url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw-UKfRL5smPfFFpeqwN3Dsz",
			note: "Primary. Wen-mei Hwu and Sanjay Patel."
		}, {
			kind: "youtube",
			title: "CME 213",
			source: "Stanford",
			url: "https://www.youtube.com/playlist?list=PLAtMgFDMfGy2mysjPHN_d1cf9sR1muRkq",
			note: "MPI, OpenMP, and CUDA in one semester."
		}]
	},
	{
		slug: "csce-743",
		code: "CSCE 743",
		title: "Digital Fabrication Studio",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "partial",
		prereq: "Graduate classification and instructor approval.",
		blurb: "Machines, materials, and programmable matter. A studio.",
		why: "Neil Gershenfeld’s How to Make (Almost) Anything is the course this descends from. The CBA site publishes class notes by year. You still need a machine — a library makerspace is the lab, not a video.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "How to Make (Almost) Anything",
			source: "MIT CBA",
			url: "https://fab.cba.mit.edu/",
			note: "Primary. Class archives, recitations, and machine notes."
		}, {
			kind: "youtube",
			title: "SIGGRAPH fabrication talks",
			source: "ACM SIGGRAPH",
			url: "https://www.youtube.com/@ACMSIGGRAPH",
			note: "The late-breaking computational fabrication half. Pick a session, do not binge the channel."
		}]
	},
	{
		slug: "csce-748",
		code: "CSCE 748",
		title: "Computational Photography",
		credits: "3",
		creditValue: 3,
		area: "graphics",
		match: "full",
		prereq: "Graduate classification or instructor approval.",
		blurb: "Image formation, filtering, panoramas, light fields, retargeting, HDR, and texture synthesis.",
		why: "Georgia Tech’s computational photography course on Udacity was built as this exact class and is still the public one to take.",
		hours: 88,
		resources: [{
			kind: "site",
			title: "Computational Photography",
			source: "Georgia Tech on Udacity",
			url: "https://www.udacity.com/course/computational-photography--ud955",
			note: "Primary. Irfan Essa and colleagues. Free."
		}, {
			kind: "youtube",
			title: "CS 184 imaging weeks",
			source: "UC Berkeley",
			url: "https://www.youtube.com/playlist?list=PLIygTcviGPKABEUa7EJzO8tgYRz120EpP",
			note: "Cameras and imaging from the graphics side, if you want a second explanation."
		}]
	},
	{
		slug: "csce-749",
		code: "CSCE 749",
		title: "Applied Cryptography",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "Secure computation, verifiable computation, and zero-knowledge proofs, applied to private learning and chains.",
		why: "Cryptography II is the applied Boneh course. The 2023 zero-knowledge MOOC is the part the catalog is actually excited about. Do not start 749 before Cryptography I.",
		hours: 88,
		resources: [
			{
				kind: "coursera",
				title: "Cryptography II",
				source: "Stanford, Dan Boneh",
				url: "https://www.coursera.org/learn/crypto2",
				note: "Primary applied course."
			},
			{
				kind: "site",
				title: "Zero Knowledge Proofs MOOC",
				source: "zk-learning.org",
				url: "https://zk-learning.org/",
				note: "Boneh, Thaler, and others. The right depth for the ZK half."
			},
			{
				kind: "book",
				title: "A Graduate Course in Applied Cryptography",
				source: "Boneh & Shoup",
				url: "https://toc.cryptobook.us/",
				note: "Later chapters. Free."
			}
		]
	},
	{
		slug: "csce-752",
		code: "CSCE 752",
		title: "Robotics and Spatial Intelligence",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "Graduate classification or instructor approval.",
		blurb: "Frames, kinematics, motion planning, calibration, stereo, SLAM, and navigation.",
		why: "Modern Robotics covers frames, kinematics, and planning with a free book. Stachniss covers the perception and SLAM the catalog names next. That pair is the course.",
		hours: 88,
		resources: [
			{
				kind: "site",
				title: "Modern Robotics",
				source: "Northwestern",
				url: "https://modernrobotics.northwestern.edu/",
				note: "Primary. Book and videos."
			},
			{
				kind: "coursera",
				title: "Modern Robotics specialization",
				source: "Northwestern",
				url: "https://www.coursera.org/specializations/modernrobotics",
				note: "Scheduled version of the same material."
			},
			{
				kind: "youtube",
				title: "Cyrill Stachniss",
				source: "University of Bonn",
				url: "https://www.youtube.com/@CyrillStachniss",
				note: "Take a full SLAM or photogrammetry course from the channel."
			}
		]
	},
	{
		slug: "csce-753",
		code: "CSCE 753",
		title: "Computer Vision and Robot Perception",
		credits: "3",
		creditValue: 3,
		area: "ai",
		match: "full",
		prereq: "Graduate classification.",
		blurb: "Projective geometry, multi-view relations, calibration, features, lidar, and visual or lidar SLAM.",
		why: "Columbia’s First Principles of Computer Vision is the geometry course. CS231n is the learning course. Robot perception needs both, then Stachniss for SLAM.",
		hours: 88,
		resources: [
			{
				kind: "site",
				title: "First Principles of Computer Vision",
				source: "Columbia, Shree Nayar",
				url: "https://fpcv.cs.columbia.edu/",
				note: "Primary for geometry, cameras, and multi-view."
			},
			{
				kind: "youtube",
				title: "CS231n",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16",
				note: "Features and learning. Do one assignment."
			},
			{
				kind: "youtube",
				title: "Cyrill Stachniss",
				source: "University of Bonn",
				url: "https://www.youtube.com/@CyrillStachniss",
				note: "SLAM and lidar. One full course."
			}
		]
	},
	{
		slug: "csce-765",
		code: "CSCE 765",
		title: "Network Security",
		credits: "3",
		creditValue: 3,
		area: "security",
		match: "close",
		prereq: "Graduate classification.",
		blurb: "Vulnerabilities by layer, cryptographic tools applied to real protocols, and the defenses that match them.",
		why: "MIT 6.858 again, this time read as a networking course: TLS, authentication, and network attacks. Boneh supplies the constructions you are supposed to apply rather than re-derive.",
		hours: 88,
		resources: [
			{
				kind: "ocw",
				title: "6.858 Computer Systems Security",
				source: "MIT",
				url: "https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-858-computer-systems-security-fall-2014/video_galleries/video-lectures/",
				note: "Primary."
			},
			{
				kind: "coursera",
				title: "Cryptography I",
				source: "Stanford",
				url: "https://www.coursera.org/learn/crypto",
				note: "Apply, don’t reinvent. Finish it or don’t claim the course."
			},
			{
				kind: "youtube",
				title: "CS 144",
				source: "Stanford",
				url: "https://www.youtube.com/playlist?list=PL6RdenZrxrw9inR-IJv-erlOKRHjymxMN",
				note: "The stack under the attacks."
			}
		]
	}
];
for (const course of foundationCourses) courses.push(course);

export const courseBySlug = new Map(courses.map((course) => [course.slug, course]));

export function courseByCode(code: string): Course | undefined {
  return courses.find((course) => course.code === code);
}

