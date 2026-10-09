import type { CoursePack } from "./types";

export const packs: CoursePack[] = [
  {
    slug: "csce-606",
    lectures: [
      {
        id: "l1",
        title: "A spec, a test, and a method",
        minutes: 40,
        paragraphs: [
          "Software engineering in this course is the set of practices that change the rate of defects and the cost of a change. A methodology is a choice of which artifacts you keep: a written spec, tests that fail for a named reason, a review, a build that someone else can run. Collecting the artifacts without using them is not a methodology. It is a shelf. Pick the ones that catch the bugs you actually have, and drop a ceremony that has not caught a bug in a month.",
          "A specification says what the function must do on inputs you care about, including the inputs that should be rejected. 'Sort the list' is not a spec until you say whether duplicates stay, whether the input is preserved, and what an empty list returns. A test is a spec the machine can run. The test should fail for a reason you can point at. A test that passes before the code is written, or that cannot fail, is not a test. Delete it.",
          "Prototyping is a method, not a lack of one. A prototype exists to answer a question cheaply: will a person understand this control, does this file format hold the records, is the query fast enough on a fake million rows. The prototype is thrown away, or it is not a prototype. The failure mode is shipping it. Write the question on the first line of the prototype's notes. When the question is answered, stop.",
          "Reuse is a method with a cost. A library you adopt is a defect surface you did not write and a change schedule you do not control. Reuse it when the spec matches and you can test the boundary. Copying a function you do not understand is not reuse. It is a delayed bug with someone else's variable names.",
        ],
        figure: {
          kind: "flow",
          caption: "The order that keeps a method honest. A test that cannot fail never earns a place in the build.",
          steps: ["Write the behavior in one paragraph", "Write a test that fails", "Make it pass", "Keep the test in the build"],
        },
        example: {
          title: "A parser for a tiny record",
          steps: [
            "Spec: a record is two integers separated by a comma. Extra spaces are rejected. An empty string is rejected.",
            "The first test feeds '1, 2' and expects rejection, because of the space. It fails if the code accepts it.",
            "The second test feeds '' and expects rejection. A parser that returns zeros for empty input fails this test, which is the point.",
          ],
        },
        problems: [
          {
            prompt: "A test calls the function and does not check the return value. The build is green. What do you do with the test?",
            answer: "Remove it or make it assert a result. A test that cannot fail will stay green while the function breaks. It is not evidence.",
          },
          {
            prompt: "You keep a prototype because the demo went well. What question did you fail to answer before shipping it?",
            answer: "Whether it meets the spec you would write for a system you have to change: errors, tests, and the cases the demo did not click. A prototype answers a narrow question. Shipping it means you skipped the spec.",
          },
        ],
        narration:
          "This course is about the practices that change how many defects you ship and how expensive a change is. A method is a choice of artifacts you actually use. A spec says what happens on the inputs you care about, including the ones you reject. Sort the list is not a spec. You still owe an answer on duplicates, on the empty list, and on whether the input is preserved. A test is a spec the machine runs. It must be able to fail, and when it fails you should know why. A test that does not look at the return value is not a test. A prototype is allowed, and it is allowed only to answer a question. Write the question down. When you know the answer, throw the prototype away or admit you are shipping untested code. Reuse is the same discipline. A library you do not test at the boundary is someone else's bug on your schedule. The worked example is a two-integer record that rejects spaces and rejects empty input. Write those two tests so they fail on a sloppy parser. That is the whole method in one afternoon.",
      },
      {
        id: "l2",
        title: "Change that stays local",
        minutes: 40,
        paragraphs: [
          "A module is a boundary with a small interface and a secret behind it. The secret can change. Callers cannot. If changing the representation of a date forces edits in forty files, the date had no module. The interface is the set of operations, not a class keyword. A module that exposes its list so callers can append is a module in name only.",
          "Design for change means naming the changes you expect. A file format you expect to extend gets a version field. A tax rule you expect to vary becomes a function you can replace, not a constant in twenty formulas. You will guess wrong about some changes. The exercise is still useful, because an unnamed change is sprayed through the program, and a named one is at least in one place when it arrives.",
          "Reuse inside a program is the same boundary. Two callers that need the same rule should call one function. Two callers that need almost the same rule are a trap: a boolean flag that switches behavior makes both callers pay for both behaviors. Prefer two small functions, or a parameter that is a real part of the spec, not a mode you hope nobody combines.",
          "Coupling is a path by which a change spreads. A global configuration object that every file reads is a path. A cycle of imports is a path. You do not need a metric to see it. Try the change on paper. Count the files. If the count embarrasses you, the boundary is in the wrong place.",
        ],
        figure: {
          kind: "pair",
          caption: "One change, two designs. The right-hand design is what an interface is for.",
          leftTitle: "No boundary",
          rightTitle: "A small interface",
          left: ["The list is public", "Forty files append", "A new rule edits all of them"],
          right: ["Callers ask for a result", "The store stays hidden", "The rule changes in one file"],
        },
        example: {
          title: "A rate that will change",
          steps: [
            "Three reports multiply hours by 20. The 20 is the hourly rate, copied.",
            "The rate becomes 25. You must find all three, and you will miss a fourth in a test that used 20 as an anonymous expected value.",
            "A function rate_for(job) puts the 20 in one place. The reports call it. The test calls it or states 25 times hours as a derived expectation.",
          ],
        },
        problems: [
          {
            prompt: "A function takes a boolean called simple_mode that skips validation. Why is that a bad parameter?",
            answer: "Callers can combine it with paths that assumed validation ran. The spec is now two specs, and the type does not say which one you are in. A separate function with its own name makes the skipped checks visible at the call.",
          },
          {
            prompt: "You expect the on-disk record to grow a field next year. What do you put in the format now?",
            answer: "A version number, and a parser that rejects versions it does not know. Without the version, old and new bytes are ambiguous and every reader grows a guess.",
          },
        ],
      },
      {
        id: "l3",
        title: "Invariants and review",
        minutes: 40,
        paragraphs: [
          "An invariant is a fact that is true every time control passes a point you named. A stack's invariant is that the size is the number of items and is never negative. A function may break the invariant in the middle of its body and must restore it before it returns or throws. State the invariant next to the data. A bug is often an invariant you believed and did not check.",
          "Assertions check invariants in the build you test. They are not error handling for a user. An assertion that fails means the program is wrong. An error code means the user asked for something the spec rejects. Mixing them hides defects inside a polite message. Keep both, and know which one fired.",
          "Review is another person reading the change against the spec and the invariant. The useful comment is 'this path leaves the size negative' or 'this test does not cover an empty input'. The useless comment is taste about names, unless the name lies. A review that only checks style will approve a broken invariant that was neatly indented.",
          "Name the defect you are hunting. Off-by-one, a missing unlock, a retry that applies twice, a test that cannot fail. A review checklist of twenty generic items is a way to not look at the diff. Three questions aimed at this module catch more: what is the invariant, which test fails if it breaks, who else must change.",
        ],
        figure: {
          kind: "flow",
          caption: "An invariant is a door. You may break it inside the room. You may not leave through the door without it.",
          steps: ["State the invariant", "Break it only inside the function", "Restore it before return", "Assert it in tests"],
        },
        example: {
          title: "A stack",
          steps: [
            "Invariant: size equals the number of stored items, and size is at least 0.",
            "Pop on an empty stack that returns a default and decrements size leaves size at -1. The invariant is false.",
            "The repair is to refuse the pop when size is 0, as an error, and to assert size is at least 0 at the end of every public function.",
          ],
        },
        problems: [
          {
            prompt: "A reviewer says the variable should be called count instead of n, and misses that the lock is not released on the error path. What did the review measure?",
            answer: "Style, not the invariant. The missing unlock is the defect. A review checklist that starts with names will keep producing this result. Ask where the lock is released on every return.",
          },
          {
            prompt: "An assertion fires on a user's bad input. Why is the assertion the wrong tool?",
            answer: "The input is in the spec, as a rejection. The program should return an error the caller can handle. An assertion says the programmer is wrong, and it may be compiled out of the build the user runs.",
          },
        ],
      },
      {
        id: "l4",
        title: "History, builds, and environments",
        minutes: 40,
        paragraphs: [
          "Version history is how you know what you shipped. A commit should build, and the message should say why the change exists. A history of 'fix' and 'more' cannot be bisected. Bisect is the tool that finds the commit which broke a test, and it works only if the old commits build. A commit that does not build taxes every future search.",
          "The build is the environment. 'Works on my machine' means the machine has a compiler, a library, or a file the build did not name. The repair is to name them. A lockfile or a vendored dependency, a script that creates the database, a documented compiler version. A new person should run one command and get the tests. If they cannot, you do not have a build. You have a workstation.",
          "Environments multiply: a laptop, a test box, a production box. Configuration that differs belongs in the environment, not in a fork of the code. A fork will miss the next bugfix. The same binary, different configuration, is the rule. Secrets do not belong in the history. A key committed once is a key you must rotate, because history is copied.",
          "Reproducibility is a engineering property with a test. Two people on two days should get the same test result from the same commit. If they do not, the environment is part of the program and it is untested. Treat a flaky test as a defect in that property, not as a test to rerun until it passes.",
        ],
        figure: {
          kind: "layers",
          caption: "The commit names the code. The build names the rest. A laptop is not a layer.",
          rows: ["One command runs the tests", "Pinned dependencies", "A commit that builds", "The change and why"],
        },
        example: {
          title: "A library that moved",
          steps: [
            "The code imports a library and does not pin a version. This month the tests pass.",
            "Next month the library changes a default. The tests fail on a new laptop and pass on the old one, which still has the old install.",
            "Pinning the version, or vendoring it, makes the failure a deliberate upgrade instead of a ghost.",
          ],
        },
        problems: [
          {
            prompt: "You need a database password to run the tests. Where does it go?",
            answer: "In the environment of the machine running the tests, or in a local file the history ignores. Not in a commit. If it was committed, rotate the password. Deleting the file in a later commit leaves it in the old one.",
          },
          {
            prompt: "Bisect stops on a commit from last year that does not compile. What does that cost you?",
            answer: "You cannot use history to find which change broke the test, at least not past that commit. The old broken commit is a defect in the history. The repair going forward is to keep the main line buildable.",
          },
        ],
      },
      {
        id: "l5",
        title: "A change you can defend",
        minutes: 45,
        paragraphs: [
          "The last exercise is a maintenance change on a small program you specify yourself. Write a twenty-line program that parses the two-integer record from the first lecture and returns the sum, rejecting bad input. Put the tests in the build. Then change the spec: a record may have a third optional integer, and the sum includes it when it is present. Do the change without breaking the old tests.",
          "The old tests are the contract with yesterday. If you edit an old test so the new code passes, write down why the spec changed. An edited test that quietly expects the new behavior is a deleted contract. Add new tests for the third integer. Keep the rejection tests for spaces and empty strings unless the spec says those are now legal.",
          "Prototyping belongs in the middle of the change if you are unsure. A throwaway parser that only answers 'can a third field be optional without eating the error cases' is legitimate. The code you commit is the one the tests cover. The prototype does not get a special exemption because the change was small.",
          "Write the review notes as if you were the second person. Where is the invariant? Which test fails if the optional field is required by mistake? Which files changed? If the answer is 'the parser and its tests', the boundary held. If the answer is 'the parser, the reports, and three copies of the split', you skipped lecture two, and the change is not done.",
        ],
        figure: {
          kind: "pipeline",
          caption: "A maintenance change. Old tests stay. New tests arrive with the new clause of the spec.",
          stages: ["Old tests green", "Change the spec", "Add tests", "Then the code"],
        },
        example: {
          title: "The optional third integer",
          steps: [
            "Before: '1,2' sums to 3. '1,2,3' is rejected. '' is rejected.",
            "After: '1,2' still sums to 3. '1,2,3' sums to 6. '1,2,' is rejected because the third field is empty, not absent.",
            "A single split that treats a trailing comma as a zero fails the new rejection, and it should.",
          ],
        },
        problems: [
          {
            prompt: "'1,2' used to return 3 and now returns 6 because you always add a hidden default. Which test catches it?",
            answer: "The old test that '1,2' sums to 3. If you updated that test to expect 6, you erased the spec. The third field is optional, so its absence must leave the old sum.",
          },
          {
            prompt: "The change touched the parser, the report formatter, and a copy of the parser in a script. What should you do before you call it done?",
            answer: "Put the parse in one module and make the script and the formatter call it. Three copies will diverge on the next change. The boundary is the unfinished part of the work.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-701",
    lectures: [
      {
        id: "l1",
        title: "Threats, including machines and people",
        minutes: 40,
        paragraphs: [
          "Security is a claim about assets, adversaries, and what they must not achieve. An asset is something you would notice losing: a key, a file, the ability to stop a pump, a person's private data. An adversary is a concrete party with a budget and a position: on the network, in the building, or already running code on the machine. A threat model lists the assets, the adversaries, and the actions you refuse them. A product that says it is secure and does not list these is not making a claim.",
          "Confidentiality means the adversary does not learn the asset. Integrity means they do not change it without detection. Availability means they do not take it away. Most systems pick two and hand-wave the third. A lock on a disk does nothing for availability if the disk is in a fire. Write the three words next to each asset and mark the ones you are not covering.",
          "Cyber-physical security is the same model when the asset is a physical process. A false sensor reading is an integrity failure. A valve that will not close is an availability failure. The computer is not the asset. The computer is the path. A threat model that stops at the login page misses the pump.",
          "People are part of the path. A password reset done over a phone call is an authentication protocol whose adversary is a convincing voice. Social engineering is not a footnote after the cryptography. It is a protocol with weak binding between the speaker and the identity. Put it in the model in the first lecture or you will design a perfect channel to a person who should not be on it.",
        ],
        figure: {
          kind: "layers",
          caption: "A claim you can check. Each layer is a sentence, not a product category.",
          rows: ["What must not happen", "Who is trying", "What the asset is", "What you are not covering"],
        },
        example: {
          title: "A small clinic's records",
          steps: [
            "Asset: the visit notes. Adversary: a person on the public network, and a curious staff account.",
            "Refuse the network adversary the ability to read or alter notes. Refuse the staff account the ability to read notes for patients they are not treating.",
            "You are not, in this model, stopping a staff member who is treating the patient from copying notes out by hand. Say so. That limit is part of the model.",
          ],
        },
        problems: [
          {
            prompt: "The clinic encrypts the disk and leaves visit notes in a world-readable file on the server. Which property fails against the network adversary?",
            answer: "Confidentiality. Disk encryption does not cover a file the server hands out. The asset moved to a path the control does not see.",
          },
          {
            prompt: "A water plant's model lists the login password and not the valve. What asset did they skip?",
            answer: "The physical process: whether the valve obeys a true command. A stolen password matters because of the valve, and a forged command on the control network matters even with a fine password on the office door.",
          },
        ],
        narration:
          "Security starts with a claim, not with a tool. Name the asset, name who is trying, and name what they must not be able to do. Confidentiality means they do not learn it. Integrity means they do not change it unnoticed. Availability means they do not take it away. A lock can serve one of these and ignore the others. Write down the ones you ignore. If the asset is a machine in the world, a pump or a valve, the computer is only the path. A false reading is an integrity failure. A valve that stays open is an availability failure. A model that ends at the login page has not looked at the asset. People are a path too. A password reset over the phone is a protocol. The adversary is anyone who can sound right. That is not a soft topic parked after the math. It is an authentication bug. The clinic example in the notes is the pattern: notes are the asset, the network and a curious staff account are the adversaries, and a limit you will not cover is still written down. Do both problems. The rest of the course is mechanisms for a model you have already written.",
      },
      {
        id: "l2",
        title: "Memory safety and injection",
        minutes: 40,
        paragraphs: [
          "A buffer that writes past its end is an integrity failure in the threat model. The adversary who controls the length or the bytes can change a return address or a function pointer and run their own code. The bug is not that the language has pointers. The bug is that the program believed a length the adversary chose. Bounds checks, or a language that inserts them, close this path. A compiler warning you turned off does not.",
          "Injection is the same shape in a parser. The program builds a command, a query, or a page by gluing a string the adversary wrote into a string the program wrote. The adversary's string closes the intended grammar and opens a new one. A quote in a query, a semicolon in a shell command, a tag in a page. The repair is to keep data out of the grammar: a parameter slot the parser cannot reinterpret, or an encoder that makes the data grammatically inert.",
          "Authentication sits on these bugs. A login check that is correct and a query that is injectable is an open door with a good lock pictured beside it. The adversary does not have to pass the check if they can change the query that implements the check. Read the constructed string. If any character in it came from the request, you are in this lecture.",
          "Firewalls do not fix a bug in your parser. A firewall drops packets you told it to drop. The injectable query arrives as ordinary traffic to a port you left open because the application needs it. The control belongs in the code that builds the query. Defense in depth is a second control, not a substitute for the first.",
        ],
        figure: {
          kind: "pair",
          caption: "Two bugs, one shape. The adversary supplied a structure the program treated as data.",
          leftTitle: "A long buffer",
          rightTitle: "A crafted string",
          left: ["Length is the weapon", "Writes past the end", "Becomes code"],
          right: ["Punctuation is the weapon", "Closes the grammar", "Becomes a command"],
        },
        example: {
          title: "A login query built by gluing",
          steps: [
            "The program builds a query that asks for a user whose name equals the request's name field.",
            "The request contains a name that closes the quote and adds a clause the parser understands as 'or true'.",
            "The query returns rows. The login succeeds. The password check never constrained the adversary, because the query was no longer the query you wrote.",
          ],
        },
        problems: [
          {
            prompt: "You switch the query to a parameter slot, and the same bytes arrive in the name field. Why does the login not succeed?",
            answer: "The bytes stay inside one value. The parser does not see a quote or a second clause. It sees a strange username, finds no row, and rejects the login.",
          },
          {
            prompt: "A firewall blocks all ports except the application's. Does that stop the injectable query?",
            answer: "No. The attack is a legal request to the open port. The firewall is doing what you asked. The application is still concatenating strings.",
          },
        ],
      },
      {
        id: "l3",
        title: "Symmetric cryptography",
        minutes: 45,
        paragraphs: [
          "A cipher hides a message from someone who does not have the key. Symmetric means the same key encrypts and decrypts. The one-time pad xors the message with a key as long as the message, used once. It is information-theoretically hiding if the key is random and never reused. Reuse is fatal: the xor of two ciphertexts is the xor of the two plaintexts, and the key cancels. A pad you reused is not a pad. It is a mistake with a famous name.",
          "A stream cipher is a pad you generate from a short key and a nonce. The nonce must not repeat under the same key. A block cipher encrypts a fixed-size block. Modes extend it to longer messages. A mode that is a fancy name for 'xor a repeated block' repeats the pad and fails in the same way. An authenticated mode tells you if the ciphertext was modified. Encryption without authentication does not, and an adversary who can flip bits may flip a bit in a known place.",
          "Keys are assets. A key in a source repository is a key the history will keep. A key in a binary you ship is a key the user has. Deriving a key from a password is a different, slower function, because passwords are guessable. A cipher does not make a weak password strong. It makes the guessing happen at the password check.",
          "Cryptography does not decide who may speak. It decides what someone without the key can learn or alter. If the threat model includes a staff member who has the key, symmetric encryption of the database does not address that staff member. You already wrote that limit in lecture one. Do not let a cipher talk you out of it.",
        ],
        figure: {
          kind: "pipeline",
          caption: "A stream cipher. The nonce is not a secret. Reusing it under the same key is the failure.",
          stages: ["Key and nonce", "Keystream", "Xor message", "Ciphertext"],
        },
        example: {
          title: "A pad used twice",
          steps: [
            "Plaintext one is the bits 1010. Plaintext two is 1100. The key is 0110.",
            "Ciphertext one is 1100. Ciphertext two is 1010.",
            "Xor the ciphertexts: 0110, which is also the xor of the plaintexts. The key cancelled. Anyone who guesses one plaintext now has the other.",
          ],
        },
        problems: [
          {
            prompt: "A protocol uses a block cipher and no authentication. The adversary flips a bit in the ciphertext. What can you say when you decrypt?",
            answer: "You get some other plaintext, and you have no cryptographic signal that it is not the original. Integrity was not provided. Use an authenticated mode, or attach a tag you verify before you trust the bytes.",
          },
          {
            prompt: "Why is a one-time pad key the length of one message unsafe for a second message?",
            answer: "Xor of the two ciphertexts equals xor of the two plaintexts. The key drops out. That is enough to recover language-like messages and exact known pieces. A new key, or a nonce that makes the keystream new, is required.",
          },
        ],
      },
      {
        id: "l4",
        title: "Hashes, tags, firewalls, and detection",
        minutes: 40,
        paragraphs: [
          "A cryptographic hash maps a message to a short digest. A collision is two messages with the same digest. A preimage is a message for a digest you were given. A password hash must be slow and salted so a stolen file is not a dictionary you can check at cipher speed. A hash of a file detects accidents. It does not detect an adversary who can change the file and the hash together. For an adversary you need a key.",
          "A message authentication code is a keyed hash. The receiver recomputes it and rejects the message on a mismatch. The key is what turns a hash into an integrity check against an adversary. Order matters in the construction: a homemade 'hash the message and the key' can be weaker than the construction you were told to use. Use the function your library calls a MAC, and compare tags in constant time so the comparison does not leak how many bytes matched.",
          "A firewall is a policy on packets: these addresses, these ports, drop or allow. It is a coarse control and a useful one. It does not see an attack inside an allowed protocol. An intrusion detection system watches for known bad patterns or for behavior that is rare. A known pattern misses a new attack. A rare-behavior alarm rings when the world changes for a benign reason. Both tools produce a log. A log nobody reads is not a control.",
          "Authentication of a person is a separate mechanism: a secret, a device, or a biometric, and preferably more than one. The MAC authenticates a message between keys you already placed. It does not decide that the human at the keyboard is the human you hired. Put the human check at the start of the session. Put the MAC on the bytes after that.",
        ],
        figure: {
          kind: "pair",
          caption: "A hash and a MAC answer different adversaries. The difference is the key.",
          leftTitle: "Hash",
          rightTitle: "MAC",
          left: ["No key", "Catches accidents", "An editor can rehash"],
          right: ["Shared key", "Catches modification", "The editor lacks the key"],
        },
        example: {
          title: "A file and its digest",
          steps: [
            "You publish a file and a hash of the file on the same site.",
            "An adversary replaces both with a new file and a new hash.",
            "A visitor who trusts the site sees a match. The hash did not help. A signature under a key the visitor already has, or a MAC under a key that was exchanged earlier, is the check that fails.",
          ],
        },
        problems: [
          {
            prompt: "Password hashes are salted and slow. What does the salt stop, and what does the slowness stop?",
            answer: "The salt stops one precomputed table from matching every user who chose the same password. The slowness stops the adversary from trying millions of guesses per stolen hash per second. You want both.",
          },
          {
            prompt: "An intrusion system alerts on every new source address, and the office changed networks this morning. What is wrong with treating every alert as an incident?",
            answer: "The detector has no model of a benign change, so the morning is a pile of alerts and the real one is hidden. Tune the detector, or require a second signal. A log of everything is not detection.",
          },
        ],
      },
      {
        id: "l5",
        title: "Public keys and what a certificate checks",
        minutes: 45,
        paragraphs: [
          "Public-key encryption uses a pair. The public key encrypts or verifies. The private key decrypts or signs. You can publish the public key. You must not publish the private key. A signature is the private key applied to a hash of the message. Anyone with the public key can check it. A signature is not encryption. It does not hide the message. It binds the message to the holder of the private key, if you trust that the public key belongs to the party you think it does.",
          "That last 'if' is the certificate. A certificate is a signature by someone you already trust, over someone else's public key and name. Checking a certificate means checking the signature, the name, the dates, and whether the key was revoked. Skipping the name check means you talked to someone who has a valid certificate for a different name. The cryptography succeeded. The authentication failed.",
          "A session on the public network typically agrees on a symmetric key using the public-key machinery, then switches to the symmetric cipher from lecture three because it is faster. The handshake's job is to make sure the symmetric key is shared with the named party and not with the adversary in the middle. If the client does not check the name, the adversary in the middle is the named party as far as the code is concerned.",
          "Social attacks bypass the handshake. A person who is talked into reading a code to the wrong caller, or into installing a new root of trust, has moved the 'someone you already trust'. No signature detects that. The threat model from lecture one has to include it, and the recovery is a procedure: who may add a root, how a password reset is bound to a person, what you do when a key leaks. Cryptography ends. The procedure is the rest of the control.",
        ],
        figure: {
          kind: "flow",
          caption: "A certificate check. Stop at the first failure. A valid signature for the wrong name is a failure.",
          steps: ["Check the signature", "Check the dates and revocation", "Check the name", "Then use the key"],
        },
        example: {
          title: "A certificate for the wrong host",
          steps: [
            "You meant to reach mail.example. The peer offers a certificate whose name is other.example, signed by a trusted issuer, in date.",
            "The signature verifies. The name does not match.",
            "A client that ignores the name will set up a session with whoever offered the certificate. The issuer did their job. The client did not.",
          ],
        },
        problems: [
          {
            prompt: "Does a signature hide the message from an eavesdropper?",
            answer: "No. A signature is computed on the message, and the message is sent beside it. Hiding requires encryption. You often want both, and they are different operations.",
          },
          {
            prompt: "A caller asks an employee to read out a one-time code from the login device. Which control failed?",
            answer: "The binding between the code and the real session. The code is a secret the employee handed to an unverified voice. The certificate on the website never saw the call. The procedure for what staff may read aloud is the missing control.",
          },
        ],
      },
    ],
  },
  {
    slug: "csce-655",
    lectures: [
      {
        id: "l1",
        title: "Needfinding",
        minutes: 40,
        paragraphs: [
          "Human-centered work starts with a person doing a task, not with a screen you want to build. Needfinding is the set of observations that justify a design. An interview is one tool. Watching the task is a better one when the person cannot see their own workarounds. They will tell you the official procedure and then skip three steps. The skip is the data.",
          "Do not lead the witness. 'Would you like a dashboard' is a question about your idea, and polite people say yes. 'Walk me through the last time you filed this form' is a question about their life. Ask for a recent instance, not a generalization. 'I usually' is a story. 'Last Tuesday' is evidence.",
          "Write what you saw, separate from what you concluded. A note that says 'the user is confused' is a conclusion. A note that says 'they clicked Save, nothing visible changed, they clicked it three more times' is an observation. Design from the observations. The conclusion can be wrong and the clicks remain.",
          "A team project needs a shared set of notes. If each member interviewed a friend and kept the recording private, you do not have a sample. You have anecdotes. Put the raw notes where the team can read them before anyone draws a screen. The screen is a hypothesis about the notes.",
        ],
        figure: {
          kind: "pair",
          caption: "Two questions. Only one of them can surprise you.",
          leftTitle: "A leading question",
          rightTitle: "A recent instance",
          left: ["Would a dashboard help", "The answer is yes", "You learned nothing"],
          right: ["What happened Tuesday", "They skipped three steps", "The skip is the need"],
        },
        example: {
          title: "A clinic front desk",
          steps: [
            "You ask how check-in works. The answer is a tidy five-step policy.",
            "You watch one patient. The clerk copies a number from a card onto paper because the field will not take the dash the card prints.",
            "The need is the field, or the card, not a new dashboard. You would not have heard it from the policy.",
          ],
        },
        problems: [
          {
            prompt: "Four interviews all say they want 'more analytics'. What is missing before you build analytics?",
            answer: "A recent instance of a decision that failed for lack of a number. Without that observation, 'analytics' is a word they used to be helpful. Watch the decision or ask for the last time it happened.",
          },
          {
            prompt: "Your notes say 'user hates the form'. Why is that note weak?",
            answer: "It is a conclusion. It does not say what they did. A usable note records the click, the pause, or the sentence. Another designer can disagree with 'hates' and still use the click.",
          },
        ],
        narration:
          "Start with a person doing a task, not with a screen you want to draw. Needfinding is how you earn the design. People will describe the official steps and then skip three of them when you watch. The skip is the finding. Do not ask whether they would like the thing you already decided to build. They will say yes. Ask what happened the last time they did the task. Last Tuesday is evidence. I usually is a story. Write the observation separately from the conclusion. They clicked save and nothing changed is an observation. The user is confused is you, summarizing. A team does not have research if each person interviewed a friend and kept the notes private. Put the notes in one place before anyone opens a drawing tool. The clinic example is the pattern. The policy was five clean steps. The clerk was copying a number onto paper because a field rejected a dash. The need is the field. A dashboard would have been you, talking. Do both problems before you prototype anything.",
      },
      {
        id: "l2",
        title: "Prototypes you can throw away",
        minutes: 40,
        paragraphs: [
          "A prototype is a way to be wrong cheaply. Paper, a slide, or a clickable fake is enough when the question is whether a person understands the control. Production code is the wrong material for that question, because you will refuse to throw it away. The cost of the prototype should be low enough that a 'no' from a user is a relief, not a loss.",
          "Match the fidelity to the question. A visual question needs a picture at the size the person will see. A workflow question needs the steps in order, even if they are boxes on paper. A performance question needs data and a timer, not a picture. A pretty picture does not answer a workflow, and a workflow sketch does not answer whether the type is readable.",
          "Information structure is the part you can prototype before color. What are the objects, how are they grouped, what is the name of each group. If the person cannot say which group a task lives in, the structure is wrong and the typeface will not save it. Draw the groups as boxes. Ask the person to place a recent task in a box. Move the boxes. This is still a prototype.",
          "The team should be able to say what the prototype is not. It is not a commitment to the database. It is not a brand. Write the non-goals on the back of the paper. A stakeholder who sees a polished prototype will hear a promise. Use a rougher one if you are not ready to keep it.",
        ],
        figure: {
          kind: "pipeline",
          caption: "One question, one cheap artifact, then a decision. The artifact is allowed to die.",
          stages: ["Name the question", "Build the cheapest fake", "Watch someone use it", "Keep or discard"],
        },
        example: {
          title: "Where the dash goes",
          steps: [
            "Question: will a clerk enter the card number correctly if the field shows the dashes.",
            "Prototype: a paper form with the boxes printed, and a pencil. Not a database.",
            "Two clerks try a real card. You watch where they pause. Then you throw the paper away and keep the decision.",
          ],
        },
        problems: [
          {
            prompt: "The team spends three weeks on a prototype because the spacing is not final. What did they forget?",
            answer: "The question the prototype was for. Spacing is a later question. Three weeks means a no is now expensive, so they will not hear it. Cut the prototype back to the question.",
          },
          {
            prompt: "A stakeholder treats the paper sketch as a delivered design. What should have been written on it?",
            answer: "The question it answers and the non-goals, including that the data model is not decided. A sketch with no label is read as a promise.",
          },
        ],
      },
      {
        id: "l3",
        title: "A test with a success criterion",
        minutes: 40,
        paragraphs: [
          "A usability test is a person doing a task while you watch. It is not a focus group, and it is not you clicking through your own prototype. You write the task in the person's language, without naming the control. 'Check in the patient on this card' is a task. 'Click the dashed field' is a hint. Read the task aloud the same way every time.",
          "Success is defined before the session. For example: the clerk enters the number so it matches the card, in under a minute, without asking you what to do. If you decide after the session whether it went well, you will decide it went well. Write the criterion on the same page as the task.",
          "Think-aloud is optional and changes the task. Some people cannot talk and type. Silence plus what they click is data. Help only after they are stuck past a threshold you set, and count that session as helped. A success you coached is not a success.",
          "Five people will find the obvious breaks. They will not estimate a percentage in the population. Do not report '80 percent of users' from four out of five participants. Report what happened: three could not find the field, one entered the dashes, one finished inside the minute. The next design change is about those observations.",
        ],
        figure: {
          kind: "flow",
          caption: "A session. The criterion is written before the person arrives.",
          steps: ["Read the task", "Stay quiet", "Note what they do", "Score against the criterion"],
        },
        example: {
          title: "A one-minute check-in",
          steps: [
            "Task: check this patient in using the card. Criterion: the stored number matches the card, under one minute, no help.",
            "The first clerk searches the header for a while and finishes in two minutes. That is a failure against the criterion, even though they eventually succeed.",
            "You do not move the goalposts. You note where they searched.",
          ],
        },
        problems: [
          {
            prompt: "You tell the participant 'the field is on the left' after ten seconds. Can you count a success?",
            answer: "No. You coached the task. Mark the session helped. The ten seconds is the observation: they had not found it yet.",
          },
          {
            prompt: "Four of five people succeed. Why is '80 percent usability' a bad sentence in the report?",
            answer: "Five people is not a sample of the population. The honest sentence is four of these five completed the task, plus what the fifth did. A percentage implies a measurement you did not make.",
          },
        ],
      },
      {
        id: "l4",
        title: "Visual design, structure, and access",
        minutes: 40,
        paragraphs: [
          "Visual design is how the eye knows what matters. Hierarchy is size, weight, and position used consistently. If everything is bold, nothing is. Alignment is a grid the person never names and immediately feels when it breaks. Contrast is what makes text readable in the room you have, not on your laptop in a dark office. These are constraints on the prototype, and they are testable: can the person find the primary action without being told.",
          "Information structure is which objects exist and how they nest. A patient, a visit, a bill. If the bill is drawn as if it were a visit, the person will put money in the wrong object. The structure is the design. Color is not. Fix the structure in the boxes from lecture two before you pick a palette.",
          "Accessibility is a constraint on the same objects. A person who does not see the screen still has to complete the task. That means the structure is in the text and the controls, not only in the position of a colored box. Labels are visible and attached to fields. The action is reachable without a precise gesture. Contrast meets a number you can measure. You do not get to call the pretty version finished and the accessible version a later coat of paint. The paint is the only version some people can use.",
          "Test with the constraint in the room. A keyboard-only pass by you, once, will find the controls that are not reachable. It is not a substitute for a person who uses a screen reader, and it is more honest than a claim you did not try. Write the access criterion next to the time criterion: the task can be finished without a pointer, or it cannot, and you watched.",
        ],
        figure: {
          kind: "layers",
          caption: "What the person is actually parsing. Decoration is the bottom layer and the last one you earn.",
          rows: ["A task they can finish", "Objects and groups", "Labels and contrast", "Decoration"],
        },
        example: {
          title: "A primary action",
          steps: [
            "The screen has four buttons of equal size and equal color. The clerk asks which one saves the check-in.",
            "You make Save the only filled button and put it where the other primary actions live. The next clerk does not ask.",
            "The change was hierarchy, not a new feature. The structure of the task was already known.",
          ],
        },
        problems: [
          {
            prompt: "Error text is red on a dark red button. The clerk with typical vision can read it. Why is the design still wrong?",
            answer: "Contrast is too low for people who do not have the clerk's vision, and color is the only carrier of the error. Use text that says what to fix, and a contrast you can measure, so color is not the only signal.",
          },
          {
            prompt: "The team plans to 'add accessibility at the end'. What decision are they postponing?",
            answer: "Whether the structure and the actions are in the interface a keyboard and a reader can reach. Those are design choices. Left until the end, they become a rewrite, or they are skipped.",
          },
        ],
      },
      {
        id: "l5",
        title: "One test, and what you change",
        minutes: 45,
        paragraphs: [
          "Run one test on a paper or clickable prototype of the check-in field. Recruit three people who do the job or who can stand in without being on the team. Team members are a last resort and a biased one: they already know where the field is. Give them a real card. Use the task and the criterion from lecture three. Include the access pass from lecture four on at least one session: no pointer.",
          "Record observations, not a highlight reel. What they touched first. Where they paused. Whether the stored number matched. Whether they needed help. Separate those notes from the change you want to make. The change is a hypothesis about the notes. 'Make it cleaner' is not a hypothesis. 'Show the dashes in the field so the card and the field match' is a hypothesis, and it is the one the clinic story was pointing at.",
          "Change the prototype, not a document about the prototype. Then run one more session, even a single person, on the change. A redesign that was not retested is a guess you got attached to. The second session is allowed to be short. It is not allowed to be imaginary.",
          "Write the team report in this order: the task, the criterion, what happened, what you changed, what happened after. A report that starts with a screenshot and ends with a claim of delight is a pitch. This course grades the order. The project is done when the second session's notes are in the report, including a failure if you still have one.",
        ],
        figure: {
          kind: "pipeline",
          caption: "The whole project in one strip. The second session is part of the work, not a prize.",
          stages: ["Watch a real task", "Prototype one change", "Test against a criterion", "Test the change once more"],
        },
        example: {
          title: "Dashes, before and after",
          steps: [
            "Before: two of three clerks pause and one copies the number onto paper. Criterion failed for those two if the minute included the pause and the mismatch.",
            "Change: the field prints the dashes in the same places as the card. Nothing else moves.",
            "After: the next clerk enters the number without asking. One session is not a population. It is evidence the change is worth keeping while you watch a fourth person.",
          ],
        },
        problems: [
          {
            prompt: "The second session fails the criterion. What do you put in the report?",
            answer: "The failure, the observation, and the next change you would test. A report that hides the second session is a pitch. The course asked for the notes.",
          },
          {
            prompt: "Only teammates are available, and they helped design the field. How do you label their sessions?",
            answer: "As biased. They already know the answer to the only question the test can ask. Say so at the top of the notes. Do not report their success as a user success.",
          },
        ],
      },
    ],
  },
];
