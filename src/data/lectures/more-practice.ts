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

export const morePractice: CoursePack[] = [
  {
    slug: "csce-606",
    lectures: [
      week(
        "l6",
        "Requirements you can fail",
        [
          "A requirement is a sentence a test can reject. 'The system should be fast' is not a requirement. 'A recorded payment is visible to a second session within one second, or the user is shown a pending state' is a requirement. The earlier lecture asked for a spec and a test. This week is how to write the sentence so the test is obvious.",
          "Use cases are the sequences you will actually support, including the failures. A transfer that debits and then loses the network is a use case, not an edge you will get to later. If it is not in the list, the implementation will invent a behavior and the invention will ship.",
          "Non-functional requirements need a number and a condition. 'Available' needs a definition of downtime and a window. 'Secure' needs a threat, which the security course will demand anyway. Import the threat. Do not write the word secure.",
          "Trace each requirement to a test name. A requirement with no test is a wish. A test with no requirement is a guess about what matters. The matrix can be a list of pairs. It does not need a tool.",
        ],
        { kind: "pair", caption: "A wish and a requirement.", leftTitle: "Not testable", rightTitle: "Testable", left: ["Fast", "User friendly", "Secure"], right: ["Under 200 ms at the stated load", "A new user finishes the task in two minutes", "The lost-response retry does not double-charge"] },
        "One payment sentence",
        [
          "Wish: payments should not be lost or duplicated.",
          "Requirement: if the client retries with the same request id after a timeout, the server returns the original result and commits at most one charge.",
          "The test is the late-acknowledgement case from the networks course, applied to this spec. You can fail it on purpose by deleting the id check.",
        ],
        [
          {
            prompt: "Rewrite 'the page should load quickly' as a requirement a test can fail.",
            answer: "State the page, the network condition, and a number. For example: on a cold cache and a 50-millisecond round-trip, the payment page's HTML is complete in under 300 milliseconds for the fixture user. A test that measures 900 milliseconds fails the requirement.",
          },
          {
            prompt: "A test exists for a behavior no requirement mentions. What do you do with it?",
            answer: "Either write the requirement it is protecting, or delete the test. An unexplained test becomes a reason to keep an accidental behavior forever. The trace goes both ways.",
          },
        ],
      ),
      week(
        "l7",
        "Modules",
        [
          "A module is a boundary with a responsibility and a secret. The secret is what other modules may not depend on: a data layout, a protocol, a vendor. The earlier lecture on local change is this boundary stated as a test. If a change to the secret forces edits outside the module, the boundary is a comment, not a module.",
          "The dependency arrow points toward the thing whose changes you want to absorb. A domain module that imports a web framework will change when the framework changes. Invert it: the web module depends on the domain, and the domain does not mention HTTP. The arrow is a design decision you can check with a search.",
          "A layer that every call passes through, and that contains no policy, is a pass-through. Delete it or give it a secret worth hiding. Layers are not a virtue. Each one must earn the indirection by absorbing a change you can name.",
          "Interfaces are small. A module that exposes its map of records has no secret. Expose the operations the use cases need. When a new use case needs a new operation, that is a real change to the boundary, and it should be visible in review.",
        ],
        { kind: "layers", caption: "Arrows that may point inward.", rows: ["HTTP handlers depend on the domain", "The domain does not import the handlers", "The store is a secret of one module", "A change to the table stays in that module"] },
        "A rate that will change",
        [
          "The earlier example hid a rate behind a function. Put that function in one module.",
          "Search the code for the numeric rate. It appears in that module and in tests of that module. It does not appear in the handler.",
          "If it appears in the handler, the boundary failed. Move it. Do not add a comment telling people not to duplicate it.",
        ],
        [
          {
            prompt: "The domain module imports the HTTP request type so it can 'see the user.' What change will ripple?",
            answer: "A change of web framework, or of the request object, will edit the domain. Pass the user id or a domain object in. The domain should not mention the framework.",
          },
          {
            prompt: "A module's public function returns the internal dictionary. Why is that a broken secret?",
            answer: "Callers can insert keys the module does not validate, and they depend on the dictionary type. You cannot change the representation. Return the specific values the caller needs, or an object that does not expose the collection.",
          },
        ],
      ),
      week(
        "l8",
        "Tests that find faults",
        [
          "A test suite can be green and useless. Line coverage says which lines ran, not which faults would be caught. A test that calls a function and never checks the result covers lines and catches nothing. Assertion is the test. The call is the setup.",
          "Boundary values are the cases next to a change in behavior: zero, one, the capacity, the capacity plus one, an empty name, a duplicate id. Pick them from the spec, not from the code's current branches. If you only test the branches the code already has, you will not notice a missing branch.",
          "A regression test is a test you add when you fix a bug, which fails on the old code and passes on the new. It is how the bug stays fixed. A bug fix without a test will return. The lecture on history and builds told you the environment. This is what you put in it.",
          "Flaky tests are tests that depend on time, order, or a network. They train the team to ignore red builds. Quarantine is a temporary state with a ticket, not a home. A suite people rerun until it passes is not a suite.",
        ],
        { kind: "flow", caption: "From a bug to a permanent test.", steps: ["Reproduce it in a test", "Watch the test fail", "Fix the code", "The test stays"] },
        "An off-by-one capacity",
        [
          "A buffer holds 2 items. The spec says a third insert returns an error and leaves the two items in place.",
          "A test inserts two, asserts success, inserts a third, asserts the error, and asserts the length is still 2.",
          "A buggy implementation that overwrites the first item fails the length assertion. A test that only checks the error code, and not the surviving contents, misses that bug.",
        ],
        [
          {
            prompt: "Coverage is 100 percent and a bug remains. How is that possible?",
            answer: "The bug is a missing check, or a wrong check on a value the tests never asserted. Every line ran with inputs that did not expose it. Coverage does not generate the boundary you forgot.",
          },
          {
            prompt: "A test passes alone and fails when the suite runs. What kind of bug is that, and where do you look?",
            answer: "Order dependence: leftover global state, a shared file, a clock. Look at what the previous test mutated. The production code may be fine and the tests may be sharing a world they should not share.",
          },
        ],
      ),
      week(
        "l9",
        "Review",
        [
          "A review is a reading of a change against the spec and the invariants, before it merges. It is not a style referendum and not a test run. The tests already ran. The reviewer looks for the requirement the change violates, the secret that leaked, and the missing failure case.",
          "The author attaches the requirement and the test names. A review of a diff with no statement of intent becomes a review of taste. If you cannot say what the change is for, it is not ready.",
          "Comments in a review are either defects or questions. A defect names the failing input. A question means the reviewer does not understand, which is itself a problem if the code is supposed to be readable. 'Nit' comments on names are allowed after the defects, and they are not a reason to block a correct change forever.",
          "The author does not merge their own change on a module another person can read. Solo work still needs a pause and a checklist. The checklist is the invariant list from the earlier lecture, plus the requirement id.",
        ],
        { kind: "layers", caption: "What a review reads, in order.", rows: ["The requirement", "The tests that should fail without the change", "The invariants", "Only then the names"] },
        "A change that forgets the retry",
        [
          "The diff adds a charge. The requirement says a retry with the same id charges once. The diff has no id.",
          "The reviewer cites the requirement and the missing test, not a preference about method length.",
          "The author adds the test first, watches it fail, then adds the id. That order is the review doing its job.",
        ],
        [
          {
            prompt: "A reviewer asks for a rename and does not mention a missing error case you can see in the diff. What should happen to the merge?",
            answer: "The missing error case blocks the merge. The rename can happen in the same change or a follow-up. Treating the rename as the review, and merging the missing case, is the failure mode of review-as-style.",
          },
          {
            prompt: "Why attach the requirement id to the change?",
            answer: "So the reviewer can check the right sentence, and so a later reader can find why the code exists. A diff without an intent can only be checked for local taste and obvious crashes.",
          },
        ],
      ),
      week(
        "l10",
        "Change over time",
        [
          "Software spends more time being changed than being written. The cost of a change is the modules you must open and the tests you must rethink. A design is good if the likely changes are local. You cannot make every change local. You choose which changes are likely and localize those.",
          "Technical debt is a specific shortcut: a missing module boundary, a duplicated policy, a test you skipped, with a named cost to pay later. It is not a synonym for code you dislike. Write the cost down or you will 'repay' debt by rewriting the parts that were fine.",
          "A deprecation needs a time and a caller list. Breaking an interface with no remaining callers is a deletion, not a deprecation. Breaking one with callers you did not find is an outage. Search for the callers as part of the change.",
          "Version the data, not only the code. A record written last year must still load, or you need a migration with a test. The migration is a program. It gets a review.",
        ],
        { kind: "flow", caption: "A change you expected.", steps: ["Name the likely change", "Hide it in one module", "When it arrives, edit that module", "Add the regression test"] },
        "A second payment provider",
        [
          "The likely change, written on day one, is a second provider. The secret of the first provider sits behind an interface with charge(id, amount).",
          "The second provider arrives. You add a module. The handlers do not change, if the interface was honest.",
          "If the handler built the first provider's JSON, the change touches every handler. That cost is the measure of the earlier shortcut. Write it down as debt if you defer the interface, including the day you will pay it.",
        ],
        [
          {
            prompt: "Someone calls a messy module 'debt' and proposes a rewrite of the whole service. What is missing?",
            answer: "The specific shortcut and its cost. Debt is payable because it is scoped. A rewrite of everything is a new project. Ask which change is hard, and localize that.",
          },
          {
            prompt: "Old records lack a field the new code requires. What has to ship with the code?",
            answer: "A migration or a default that the spec accepts, plus a test that loads an old record. Shipping the code alone will fail when it reads yesterday's data.",
          },
        ],
      ),
      week(
        "l11",
        "When it is running",
        [
          "A running system fails in ways a unit test did not arrange. Logs, metrics, and a way to tell which version is running are part of the software. A log line that does not include the request id cannot be tied to the failed payment. A metric that only exists on your laptop does not exist.",
          "An alert needs an action. 'CPU is high' is not an action. 'The payment error rate exceeded one percent over five minutes, and the runbook says to fail over the provider' is an alert. Page a person only for the second kind.",
          "A rollback is a feature. If the migration cannot roll back, the deploy is a one-way door and the review should say so. Practice the rollback before the night you need it. A rollback you have never run is a rumor.",
          "Incidents get a short note: what broke, how you know it is fixed, and what test or alert you added. Blame is not a repair. The software-engineering content of an incident is the missing test.",
        ],
        { kind: "layers", caption: "Operate the change.", rows: ["A request id in the log", "A metric for the requirement", "An alert with an action", "A rollback you have run"] },
        "A failed deploy",
        [
          "Error rate on charges rises after the deploy. The request ids in the logs match the new version.",
          "You roll back. The error rate falls. The version metric confirms the old code is what is running.",
          "You add a test for the case the new code mishandled, and you write three sentences. The next deploy does not repeat it by accident.",
        ],
        [
          {
            prompt: "The only log line is 'something went wrong.' Why can you not operate this?",
            answer: "You cannot tie the line to a request, a user, or a version, and you cannot count it. Add the request id and the error class. A unique sentence per failure is less useful than a class you can graph.",
          },
          {
            prompt: "An alert fires every night and is always ignored. What should you change?",
            answer: "The alert. Either it is not actionable and should be a dashboard, or the nightly condition is a real bug and the runbook is wrong. An ignored page trains you to ignore the next one.",
          },
        ],
      ),
      week(
        "l12",
        "The maintenance exercise",
        [
          "Take a program you wrote earlier in the degree and change it. The change must be a requirement with a test, reviewed against an invariant, and small enough to finish. The earlier lecture's optional third integer is this exercise in miniature. Here you also write the rollback and the log line.",
          "Before you edit, find the module that should own the change. If the change wants to touch five modules, stop and ask whether the boundary is wrong or the requirement is five requirements. Split until one of them is local.",
          "Measure the diff. A change of the behavior that adds two hundred unrelated lines is two changes. Split the commits. A reviewer, even if the reviewer is you tomorrow, should see the requirement in one commit.",
          "This is the course's project. The algorithms, the database, and the network code you wrote are eligible targets. Changing them under a spec is the software-engineering skill. Writing a new feature with no spec is a different, weaker exercise.",
        ],
        { kind: "flow", caption: "The exercise.", steps: ["A failing test for the new sentence", "The smallest module", "The change", "A log line and a way back"] },
        "The optional third integer",
        [
          "The spec gains: an optional third integer, defaulting to 0, and the sum includes it.",
          "The test calls the old two-argument form and expects the same sum as before, then calls the three-argument form.",
          "If the old form breaks, the change was not compatible. The requirement did not ask you to break callers. The default is the compatibility.",
        ],
        [
          {
            prompt: "The change is correct and the diff reformats the whole file. What do you do before review?",
            answer: "Split the format from the behavior, or drop the format. A reviewer cannot see the requirement inside a whitespace storm. The behavior commit should be readable as the requirement.",
          },
          {
            prompt: "You cannot find a module that can own the change without also editing the HTTP layer and the store. What does that say?",
            answer: "The policy is smeared across layers. The exercise now includes putting the policy in one place first, then the behavior change. Doing both in one undiffable edit hides the design repair.",
          },
        ],
      ),
      week(
        "l13",
        "Quality is a trade",
        [
          "You cannot maximize every quality. Reliability, time to ship, performance, and a clean boundary compete. The engineering decision names the one you are sacrificing and the one you are protecting. 'We will ship the retry bug because the demo is tomorrow' is an honest, usually bad, decision. Silence about the bug is not a decision.",
          "A prototype may drop the durable log and must not be confused with the system. Mark it. The earlier human-computer course will prototype interfaces. Those prototypes are not the payment path. Throw them away or rewrite them against the requirements.",
          "Reuse is copying a module whose secret still matches, not copying a function you do not understand. A copied function is a second secret that will diverge. The dependency, if you can take it, is better. If you cannot, write your own and test it.",
          "Artificial intelligence tools that write a patch are junior authors. The requirement, the test, and the review still belong to you. A patch you cannot explain is a patch you cannot maintain. Do not merge it.",
        ],
        { kind: "pair", caption: "Say the trade.", leftTitle: "Protect", rightTitle: "Sacrifice, on purpose", left: ["The single charge", "The migration", "The rollback"], right: ["A nicer name", "A second provider this week", "A perfect boundary you have not needed"] },
        "A demo tomorrow",
        [
          "The retry bug is real. The demo is tomorrow. You can disable retries for the demo and say so, which protects correctness by narrowing the feature.",
          "Or you can ship the retry and risk a double charge in front of an audience. That protects the feature list and sacrifices the requirement.",
          "Either choice can be written down. Showing the retry and hoping is the choice that cannot.",
        ],
        [
          {
            prompt: "A prototype's code is the shortest path to the demo and fails the durability requirement. How do you label the branch?",
            answer: "As a prototype that must not be deployed. The label is in the README and in the absence of the production config. Merging it to the release branch unlabeled is how prototypes become the system.",
          },
          {
            prompt: "A generated patch passes the tests and you do not understand the lock it added. Do you merge it?",
            answer: "No. You can learn it, or you can reject it. The tests did not review the invariant. An unexplained lock is how you add deadlock. The author of record is you.",
          },
        ],
      ),
      week(
        "l14",
        "The engineering bar",
        [
          "The course is a method you can apply to every other course's code. Specify the behavior a test can reject. Hide the likely change. Check the invariant in review. Leave a way to tell, in production, that the requirement is failing, and a way to go back.",
          "You are done with a week when you can apply it to a small program without looking at these notes. The hours are that practice. Reading the week is the start.",
          "The capstone will be graded, by you, against this bar. A capstone that cannot say what a retry does, where the policy lives, and how you know it is up, is unfinished regardless of how many features it lists.",
          "These notes are original. They are the standard method, not a transcription of a term at a particular school. Use them on your code.",
        ],
        { kind: "layers", caption: "The bar.", rows: ["A sentence a test can fail", "A module that owns the secret", "A review against an invariant", "A signal in production and a way back"] },
        "Apply it to a sort",
        [
          "Requirement: the function returns a new list, sorted, and does not mutate the input.",
          "The test passes a list, keeps a copy, and compares. A sort that sorts in place fails.",
          "The likely change is the comparison. It sits in one function. The review checks mutation, not the variable names.",
        ],
        [
          {
            prompt: "Which part of the bar is missing if the sort is correct, tested, and nobody can tell in the running system whether the endpoint that calls it is failing?",
            answer: "The production signal. Correctness in a unit test does not operate the service. Add the error metric or the log with a request id on the endpoint. The sort can stay.",
          },
          {
            prompt: "Name the likely change for a parser of a record format, and where it should live.",
            answer: "A new field. It should live in the parser module, with a test that the old format still parses. Callers should see a default, not a new argument they must all learn on the same day, unless the requirement says the field is mandatory.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-701",
    lectures: [
      week(
        "l6",
        "Authentication",
        [
          "Authentication is how a system decides that a request comes from a principal it has seen before. The common secret is a password. The system must not store the password. It stores a slow hash of the password plus a unique salt. A fast hash lets an attacker try a dictionary against every user at once if the salts are missing, and against one user quickly even if you salted a fast hash.",
          "A salt is not a pepper and not encryption. It is a unique value stored beside the hash so that two users with the same password do not have the same stored value, and so a precomputed table does not apply to everyone. The salt is not secret. The password is.",
          "Session identifiers after login are capabilities. They must be unguessable, transported only over the secure channel, and revocable. A session id in a URL will leak through logs and referrers. A session that never expires on a shared computer is a gift to the next person who sits down.",
          "Multi-factor authentication adds a second check that is not the same secret. A second password is not a second factor. A stolen password database should not be enough. Phishing can still sit in front of both factors if the user will type them into the wrong page. The name check on the certificate is part of authentication.",
        ],
        { kind: "layers", caption: "What is stored.", rows: ["A unique salt, not secret", "A slow hash of salt and password", "Not the password", "Not a fast hash of the password alone"] },
        "Two users, one password",
        [
          "Ada and Ben both choose the same password. Without salts, the stored hashes match, and a dictionary attack cracks both at once.",
          "With unique salts, the stored values differ. The attacker recomputes the hash per user.",
          "If the hash is fast, per-user recomputation is still cheap. The slow hash is what makes the dictionary expensive. Salt and speed solve different problems.",
        ],
        [
          {
            prompt: "You encrypt passwords with a key stored on the same server. Why is that worse than a slow hash?",
            answer: "A thief who copies the database and the key decrypts every password. A hash has no key that reverses it. Encryption is reversible by design. Password storage must not be.",
          },
          {
            prompt: "A session id is the user's email address. What can another user do?",
            answer: "Present that email address and be treated as the victim, if the server accepts it as the session. The id has to be unguessable. An identifier you can look up is not a session secret.",
          },
        ],
      ),
      week(
        "l7",
        "Access control",
        [
          "Authentication says who is calling. Access control says what they may do. An access-control list on an object lists principals and actions. A capability is an unforgeable reference that itself confers the action. The operating-systems week introduced both. Here they apply to records in your system, not only to files.",
          "The confused deputy is a program with authority that uses it on the attacker's behalf. A report generator that can read every record, and that accepts a path from the user, will read the payroll file if the user names it. The generator's authority and the user's authority were mixed. Pass a capability for the records the user may see, not a filename and a powerful process.",
          "Default deny is the policy you can audit. Default allow is how a new endpoint ships without a check. List the endpoints and the rule on each. An endpoint missing from the list is a bug.",
          "Privilege separation splits the program so the part that parses untrusted input does not hold the database credentials. A bug in the parser then cannot, by itself, dump the table. The split is a process boundary or a careful module boundary with no shared secret. A comment that says 'do not call this' is not separation.",
        ],
        { kind: "pair", caption: "Two designs for the same report.", leftTitle: "Deputy", rightTitle: "Capability", left: ["Process can read all files", "User supplies a path", "The payroll file is reachable"], right: ["User holds a handle to their reports", "The process cannot name the payroll file", "A bad path is not a name the process can open"] },
        "A path from the user",
        [
          "The report tool runs as a service account that can read every customer's files. It takes a path from the query string.",
          "The attacker asks for the path of another customer's export. The tool's check, if it only checks that the file exists, will read it.",
          "The fix is to derive the path from the authenticated principal, or to require a capability issued to that principal. Do not concatenate the user's string onto a directory and call it access control.",
        ],
        [
          {
            prompt: "Why is 'we check the role in the UI' not access control?",
            answer: "The UI is not the boundary. A client can send the request the UI would have hidden. The check has to run on the server that holds the data, on every request.",
          },
          {
            prompt: "A new endpoint ships with no rule, and the framework allows the call. What is the default, and why is it wrong?",
            answer: "The default is allow. Any authenticated, or unauthenticated, caller can use the endpoint. Default deny means a missing rule is a refusal, so the endpoint stays dark until someone writes the rule.",
          },
        ],
      ),
      week(
        "l8",
        "The network attacker",
        [
          "The attacker on the path can read, drop, reorder, and replay anything that is not inside a secure channel. The networks course built the channel. This week is the attacks that remain when you forget a piece. Replaying a captured request is the first. A unique nonce or a timestamp checked at the server makes the replay fail. Without it, a copied 'pay' request pays twice, which you have now seen from three courses at once.",
          "Spoofing a source address is how a packet claims to be from someone else, on a protocol that does not authenticate. UDP and raw IP do not. TCP's handshake makes off-path spoofing harder and does not stop an on-path attacker. Do not treat a source address as an identity.",
          "A downgrade attack strips the secure option from a handshake that is willing to proceed without it. Refuse to proceed. The earlier lecture said this. Here it is the attacker's move, named.",
          "DNS lies are a network attack before you ever connect. If the resolver is poisoned, you open a secure channel to the wrong host, and the certificate check is the remaining defense. If you skip the name check, the lie works.",
        ],
        { kind: "flow", caption: "A replay.", steps: ["Capture a valid request", "Send it again", "A nonce the server remembers", "The second send fails"] },
        "A copied payment",
        [
          "The attacker records a request that was correctly signed, including the body.",
          "They send it again. The signature still verifies. The server charges again if it has no memory of the request id.",
          "The server stores the id for longer than the signature's lifetime. The second request fails the replay check even though the bytes are perfect.",
        ],
        [
          {
            prompt: "Why is a source IP address not an authenticated identity?",
            answer: "Off the path, some protocols let the sender write any source they want. On the path, the attacker does not even need to spoof. Identity comes from a key or a password checked at the endpoint, not from the address on the packet.",
          },
          {
            prompt: "A signature covers the body and not the request id. What does the attacker replay?",
            answer: "The body, with a fresh id if the server only checks the id for uniqueness and the signature does not bind the id. Bind every field that matters, including the id and the timestamp, or the signature is on the wrong message.",
          },
        ],
      ),
      week(
        "l9",
        "The browser",
        [
          "A web session adds attacks that are not on the packet path. Cross-site scripting runs the attacker's script in the victim's origin, which holds the session. The defense is to encode untrusted data on the way out, and to not splice untrusted data into script. A sanitizer you half-wrote is how the bug survives. Use a maintained encoder and a content security policy as the backstop, not as the only control.",
          "Cross-site request forgery tricks the victim's browser into sending the victim's cookies to your site. A cookie that is sent on every request is the vulnerability. A token the attacker's page cannot read, checked on the state-changing request, is the fix. Same-site cookies are a strong default and not a theory you should skip.",
          "The origin is the scheme, the host, and the port. A subdomain is a different origin. A script that treats them as the same will share a secret across more parties than you listed. Write the origins down.",
          "Dependencies in the page are code you run. A third-party script can read the session if it is in your origin. Load it only if you would give that party a copy of the database.",
        ],
        { kind: "pair", caption: "Two browser attacks.", leftTitle: "Script injection", rightTitle: "Forged request", left: ["Attacker's script runs in your origin", "Encode output", "Do not build script from input"], right: ["Victim's browser sends cookies", "Attacker's page cannot read a token", "Check the token on the write"] },
        "A name in a page",
        [
          "A user named themselves <script>.... The page inserts the name into HTML without encoding.",
          "The browser executes the script in your origin and can read the session.",
          "Encoding the name as text removes the tag. The script does not run. A test with that name belongs in the suite. The software-engineering regression rule applies.",
        ],
        [
          {
            prompt: "Your CSRF token is in a cookie and nowhere else, and the browser sends cookies automatically. Does the check work?",
            answer: "No. The attacker's request will include the cookie. The token has to be somewhere the attacker's page cannot force the browser to send, typically a header or a field that script on another origin cannot set on your request. A cookie alone is the credential being forged, not the proof.",
          },
          {
            prompt: "A third-party analytics script is included in the payment page. What can it do?",
            answer: "Whatever your own script can do, if it runs in your origin: read the DOM, including the account, and send it elsewhere. Treat it as a deputy with full page access. If that is unacceptable, do not load it there.",
          },
        ],
      ),
      week(
        "l10",
        "Failures of the mechanism",
        [
          "Cryptography fails in use more often than it fails in the primitive. Reusing a nonce in a stream cipher, as the earlier lecture showed with a pad used twice, is a use failure. So is trusting a certificate you did not check, truncating a MAC, and encrypting without authenticating. The primitive can be excellent and the composition wrong.",
          "Side channels leak a secret through time, power, or errors. A comparison that returns early on the first mismatched password byte tells an attacker which prefix they have right. Compare in constant time when the secret is a MAC or a password hash check that an attacker can time. This is not a complete treatment of side channels. It is the case you can introduce by writing a normal loop.",
          "Randomness is a dependency. A key generated from a clock, or from a random function that is not a cryptographic generator, is guessable. Use the operating system's cryptographic generator. Do not seed your own from the time.",
          "Errors must not reveal which check failed when that information is a password oracle. 'No such user' and 'wrong password' as distinct messages let an attacker enumerate accounts. One message for both is the usual fix. The log on the server can still tell them apart.",
        ],
        { kind: "layers", caption: "A MAC check that leaks.", rows: ["Compare byte 0 and return", "The attacker times the return", "A correct prefix takes longer", "Compare the whole tag in constant time"] },
        "A pad used twice, recalled",
        [
          "Two messages encrypted with the same one-time pad are revealed by their XOR, up to the language you assume.",
          "A stream-cipher nonce reused under one key is the same bug with a modern name.",
          "The fix is a unique nonce per message under that key, stored or counted, not hoped for. A random nonce from a small space will collide. Size the space.",
        ],
        [
          {
            prompt: "Password check returns in 1 millisecond if the first character is wrong and 2 milliseconds if it is right. What is the attacker learning?",
            answer: "The first character, by timing, then the next, the same way. The early return is an oracle. Compare the entire hash or the entire MAC before returning, in time that does not depend on the mismatch position.",
          },
          {
            prompt: "The login form says 'unknown user' or 'bad password.' Why does that matter if passwords are hashed?",
            answer: "It confirms which addresses have accounts, which is the list the attacker needed before the hashes, or instead of them. The hash does not fix the oracle. Use one error for both cases.",
          },
        ],
      ),
      week(
        "l11",
        "Logs and incidents",
        [
          "An incident is a claim that a security property failed, plus the evidence. The evidence is logs. A log that stores passwords or full card numbers is a second breach waiting. Log the request id, the principal, the action, the result, and the time. Log enough to detect, not a copy of the database.",
          "Detection is a query you can run. Five failed logins followed by a success from a new address is a query. A terabyte of unstructured text is not. The alert rule from the software-engineering course applies: if nobody will act, it is not detection.",
          "When you suspect a stolen session, you revoke the session and the refresh tokens, fix the hole that stole it, and decide whether passwords must be reset. Resetting every password because a CSS bug leaked a page title is a different incident from a stolen password database. Match the response to the evidence.",
          "Write the timeline from the logs after a drill, not only after a breach. A drill that restores from backup tells you whether the backup exists. A backup you have not restored is a file.",
        ],
        { kind: "flow", caption: "A small incident.", steps: ["A query that fires", "A timeline from the logs", "Revoke what was taken", "A test that would catch the hole"] },
        "A stolen session",
        [
          "The log shows a session used from two countries in five minutes. The user was not traveling. You revoke the session.",
          "The timeline shows the session cookie appeared in a referrer log because it was in a URL. That is the hole.",
          "You move the id out of the URL, add a regression test that the cookie is not in the query string, and you do not reset every password if the passwords were not in the log. The evidence did not say they were.",
        ],
        [
          {
            prompt: "The application logs the full Authorization header. What did you create?",
            answer: "A second copy of the bearer token, visible to anyone who can read the logs. Log that a credential was present, not the credential. Treat the log store as part of the trusted computing base or strip it.",
          },
          {
            prompt: "A detector fires only on a signature you wrote after the last incident. What class of attack does it miss?",
            answer: "The next one that does not match that signature. Signature detection catches repeats. A control that removes the hole, plus a test, is the repair. The detector is the alarm, not the fix.",
          },
        ],
      ),
      week(
        "l12",
        "The threat model, written",
        [
          "The first lecture asked for a threat model of a small clinic. This week you write one for the capstone, one page. Assets, adversaries, what they can do, and what you explicitly ignore. Ignoring a national intelligence service is allowed if you say so. Ignoring a stolen laptop, if the capstone holds personal records, is not.",
          "For each asset, name the control: the hash, the lock, the channel, the check. A control you cannot point to in a design note is a slogan. The page should be checkable.",
          "Include one abuse case the way the software course included a failing test. The attacker replays a request, injects a query, or fetches another user's path. Say which control stops it.",
          "This page is part of the security course's hours. It is also an entrance ticket to the capstone. You will not bolt it on after the code.",
        ],
        { kind: "layers", caption: "One page.", rows: ["Assets", "Adversaries and what they can do", "What you ignore, said aloud", "A control for each asset", "One abuse case"] },
        "The clinic, revisited",
        [
          "Asset: the record. Adversary: another patient, and a thief who copies the disk.",
          "Controls: access check on each read, disk encryption or a database that demands a credential, a session that is not in the URL.",
          "Ignored: a coerced insider with a legitimate login, if you say you are not solving that this term. Unsaid, that omission looks like a hole. Said, it is a scope.",
        ],
        [
          {
            prompt: "The model says 'we use encryption' and does not say which asset or which key. What is wrong?",
            answer: "Encryption is not a control until you name the data, the key, and who can decrypt. 'We use encryption' cannot be reviewed. Name the column or the channel and the key store.",
          },
          {
            prompt: "You ignore denial of service. What must the page still say if the capstone takes payments?",
            answer: "That a flood can stop payments, and that this is accepted for the exercise or mitigated by a specific limit. Silence means you did not decide. A payment system that falls over may create its own integrity bugs if retries are wrong. Point at the retry control even if you ignore volumetric attack.",
          },
        ],
      ),
      week(
        "l13",
        "Building it so the model is true",
        [
          "Take one abuse case and implement the control with a test that fails when the control is removed. This is the same shape as every other course's last project, aimed at an attack. The test is the evidence the model is not a PDF.",
          "If the abuse is injection, the test sends a quote and a second statement and asserts one statement ran. If the abuse is a missing access check, the test authenticates as the other user and asserts a refusal. If the abuse is a replay, the test sends the request twice.",
          "Do not fix the test by weakening it when it fails. A test that used to send a quote and now sends a letter is not a passing control. The software review rule is the same.",
          "When the test passes, write the one-line control next to the abuse case on the threat-model page. The two documents agree. A model that lists a control the code does not have is a liability, not a design.",
        ],
        { kind: "flow", caption: "From the model to a test.", steps: ["Pick one abuse", "Write the attack as a test", "Watch it fail", "Add the control", "Cite the test on the model"] },
        "A second statement",
        [
          "The login query is built by gluing the name into SQL, as in the injection lecture.",
          "The test submits a name that closes the quote and adds a condition that is always true.",
          "The buggy code authenticates. The parameterized query does not. The test is the lecture's example turned into a regression.",
        ],
        [
          {
            prompt: "The test uses a mocked database that never executes SQL. Does it catch injection?",
            answer: "No. The mock never concatenates. Test against a real query execution, or a library call that would reject the extra statement. A mock of the success path hides the bug.",
          },
          {
            prompt: "The threat model lists replay protection and the code has no stored nonce. What do you change first, the model or the code?",
            answer: "Either add the control or remove the claim. They must agree. Leaving the claim is worse, because the next reader will trust it. Prefer adding the control if the asset needs it.",
          },
        ],
      ),
      week(
        "l14",
        "Security as a property you can show",
        [
          "You should be able to show, for a small system: a password store that survives a database copy, an access check the UI cannot skip, a channel whose name is checked, a replay that fails, and a log that does not contain the secret. Those five are the course.",
          "The hours are the threat-model page and the one attack test, plus the problems. The opening lectures named the mechanisms. These weeks are how they fail in a program.",
          "When a later course, or the capstone, asks you to 'add security,' this list is the answer. A badge that says HTTPS is one item on it.",
          "The notes are original and the attacks are the standard ones. Do not collect exploit code. Write the defensive test.",
        ],
        { kind: "layers", caption: "Five things you can show.", rows: ["A slow salted hash", "A server-side access check", "A checked name on the channel", "A replay that fails", "A log without the secret"] },
        "Remove one control",
        [
          "Delete the access check. The other-user test fails. Good: the test noticed.",
          "Delete the salt and the other tests stay green. That means you have no test for equal hashes. Add one.",
          "A control without a test will vanish in a refactor. The engineering course and this one are the same method.",
        ],
        [
          {
            prompt: "Which of the five fails if two users with the same password have the same stored hash?",
            answer: "The password store. The salt is missing or ignored. The slow hash may still be there. Both parts are the control.",
          },
          {
            prompt: "The channel is encrypted and the certificate name is not checked. Which item failed?",
            answer: "The checked name. Encryption to an unauthenticated peer is a secure channel to the attacker. The lock icon is not the check.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-655",
    lectures: [
      week(
        "l6",
        "A person takes time",
        [
          "The earlier weeks found a need and tested a prototype. This week is a quantitative model you can use before the test. Fitts' law says the time to point at a target grows with the distance and shrinks with the size. A small button far from the current pointer is slower and less accurate. The law is a log of distance over width, plus a constant. You do not need the fitted constants to use the shape of it.",
          "Hick's law says the time to choose grows with the log of the number of equally likely options. A menu of forty peer items is a tax. Grouping, or a default, is how you stop charging it. The law does not excuse hiding the option people need. It tells you the cost of laying them out as peers.",
          "Working memory holds a few chunks. A form that asks for a code, a date, and a reason, and then clears them when a validation fails, spends the user's memory for nothing. Keep the values. The error belongs next to the field.",
          "These models are hypotheses about the interface, tested by the usability session. If the model says the button is fine and three people miss it, believe the people.",
        ],
        { kind: "pair", caption: "Two costs you can see.", leftTitle: "Pointing", rightTitle: "Choosing", left: ["Far and small is slow", "The edge of the screen is a large target"], right: ["More peer options take longer", "A default removes the choice"] },
        "A 12-pixel button",
        [
          "The primary action is 12 pixels tall, in the corner opposite the pointer's usual rest, beside a 40-pixel destructive action.",
          "Fitts says the destructive action is the easier target. People will hit it by mistake.",
          "Swap the sizes, or move the destructive action away and confirm it. The model told you before the test. The test will tell you if you were wrong about which action is primary.",
        ],
        [
          {
            prompt: "You add a confirmation dialog to every action, including the common one, to 'prevent mistakes.' What cost did you add?",
            answer: "A choice and an extra pointing step on the frequent path. Hick and Fitts both go up on the action people came to perform. Confirm the destructive rare action. Do not confirm the primary one.",
          },
          {
            prompt: "A validation error clears the form. Why is that a memory bug and not only a manners bug?",
            answer: "The user must hold every field in working memory to retype them, and they will misremember one. Keep the text. Show the error beside the field that failed.",
          },
        ],
      ),
      week(
        "l7",
        "Structure",
        [
          "Information architecture is which things sit together and what they are called. A label is wrong when two people looking for the same thing choose different labels and only one of them is in the menu. Card sorting, even with five people and paper, finds that disagreement before you build the menu.",
          "Hierarchy earns itself when the branches match the user's task. An org-chart hierarchy matches the company and often fails the task. Group by the job the user is doing this minute.",
          "Search is not a substitute for a structure nobody can browse, unless you have measured that people can name the thing. A person who does not know the term 'prior authorization' will not type it. The label has to contain a word they have.",
          "Wayfinding tells people where they are and how to go back. A page with no name and a logo that does not go home is a trap. The back control must undo the last step the user thinks they took, not a step in your implementation.",
        ],
        { kind: "layers", caption: "A structure you can test.", rows: ["Labels in the user's words", "Groups by task", "A name for the current page", "A way back"] },
        "Two names for one form",
        [
          "Staff call the form 'check-in.' Patients call it 'sign in' or 'the clipboard.' The menu says 'encounter initiation.'",
          "Three people in a hallway test cannot find it. They can find 'sign in.'",
          "Rename the menu. The database table can keep its name. The label is not the schema.",
        ],
        [
          {
            prompt: "Why can a search box fail even when the page exists?",
            answer: "The user does not know the words in the page. Search matches strings. If the label and the query share no words, the page is invisible. Browseable task groups, using their words, are the backup.",
          },
          {
            prompt: "The logo does not navigate home and there is no other home control. What is the wayfinding failure?",
            answer: "People cannot reset the task without the browser's back button, which may leave your application in a state you did not design. Give them a control that returns to a known page.",
          },
        ],
      ),
      week(
        "l8",
        "How you evaluate",
        [
          "A usability test with a person and a task is the method you already used. A heuristic review is an expert reading against a list: visibility of status, match to the user's language, control and freedom, consistency, error prevention. It finds cheap problems and misses problems only a real task reveals. Do the heuristic pass before you spend the participant's time, not instead of it.",
          "Five participants find a large fraction of the obvious problems in a small interface, and they do not find rare ones. The number five is a rule of thumb from a simple model, not a law. If the first three people fail in three different ways, you are not done at five. If they all fail the same way, fix it before you recruit the next five.",
          "A survey after the fact measures opinion. It does not measure whether they could do the task. Ask for the time and the success before you ask whether they liked it. People like interfaces they failed at, and dislike interfaces they completed, often enough that the scores are not the result.",
          "Comparative tests need a fair task. Changing the task between version A and version B measures the task. Keep the task, change the interface.",
        ],
        { kind: "pair", caption: "Two evaluations.", leftTitle: "Heuristic review", rightTitle: "A session", left: ["An expert and a list", "Fast, no participant", "Misses task failures"], right: ["A person and a task", "Slow, specific", "Shows the actual miss"] },
        "Five people, one button",
        [
          "All five fail to find the export control, which sits in a menu named 'tools.'",
          "You do not need a sixth person to know the label is wrong. Fix it and run a smaller confirmation.",
          "A survey that asked 'was the tools menu useful' would have returned opinions. The failures were the data.",
        ],
        [
          {
            prompt: "You run a heuristic review and find no issues, and the first participant cannot complete the task. Which result do you trust?",
            answer: "The participant. The heuristic list did not contain their task. Watch the session, fix the task failure, and then add the missing check to your own list.",
          },
          {
            prompt: "Why is 'three out of five liked it' not a success criterion?",
            answer: "Liking is not task success. Define success as completing the task in the time you named, without help. Report liking separately if you measured it, and do not let it replace the count of failures.",
          },
        ],
      ),
      week(
        "l9",
        "Reading a small study",
        [
          "Five people are not a p-value. Report counts. Three of five failed. The times were 40, 55, 70, 90, and 200 seconds. The 200 is a person you should describe, not a number to delete because it ruins the average. The median is more honest than the mean on a set this small with one long tail.",
          "Do not compute a statistical test you cannot interpret and then write 'significant.' A claim of a difference between two versions with five people each is usually a description, not a detection. Say what happened.",
          "Consent and harm belong here. Tell the person the task, that they can stop, and that you are testing the interface and not them. Do not record more than you said you would. Delete the recording when the note is written, if that was the agreement.",
          "A single quoted sentence from a participant can carry the finding, next to the count. 'I thought check-in was the clipboard' plus three failures is a result. The sentence alone is an anecdote. The count alone is a table. Keep both.",
        ],
        { kind: "layers", caption: "What to report.", rows: ["How many people, how many failures", "The times, including the long one", "One sentence they said", "No test you cannot explain"] },
        "Five times",
        [
          "Times in seconds: 40, 55, 70, 90, 200. The mean is 91. The median is 70.",
          "The person at 200 gave up and used a paper form. That is a failure, not a slow success.",
          "Report 4 of 5 completed, median 70, one abandonment. The mean hid the abandonment if you only plotted it.",
        ],
        [
          {
            prompt: "You drop the 200-second session because it was 'an outlier.' What did you hide?",
            answer: "A failure mode. Outliers on five people are often the finding. Describe the session. Do not delete it to tighten the average.",
          },
          {
            prompt: "Both versions have five people and version B is 10 seconds faster on the median. What may you claim?",
            answer: "That in this sample the median was 10 seconds lower. You may not claim you have detected a general advantage. The sample is a pilot. A larger difference, or a difference in success counts, is the thing worth acting on.",
          },
        ],
      ),
      week(
        "l10",
        "Access",
        [
          "The earlier lecture put contrast and a primary action on the page. This week is the rest of access. A person who does not use a pointer needs every action from the keyboard, in an order that follows the task, with a visible focus. A person who uses a screen reader needs a name on every control. A button whose only content is an icon has no name unless you give it one.",
          "Captions and text alternatives are the same idea for other senses. An error communicated only by color is invisible to someone who does not see that color. Add the text.",
          "Zoom must not clip the primary action. A layout that locks the font size will be overridden badly. Let the text grow and let the page reflow.",
          "Access is a requirement in the sense of the software course: a sentence a test can fail. 'Works with a keyboard' fails when you cannot reach the export control without a pointer. Put that test in the suite. Do not leave it as a final-week surprise.",
        ],
        { kind: "flow", caption: "A keyboard pass.", steps: ["Start at the top", "Tab in task order", "See the focus", "Activate without a pointer", "Hear a name, not 'button'"] },
        "An icon with no name",
        [
          "The delete control is a trash-can image with no text.",
          "A screen reader says 'button' or nothing useful. The keyboard user can focus it and does not know what it will do if the focus style was removed.",
          "Add an accessible name and a visible focus outline. The visual design can keep the icon. The name is not optional metadata.",
        ],
        [
          {
            prompt: "The error is a red border and no text. Who cannot use it, even among people who see the screen?",
            answer: "Anyone who does not perceive that red, and anyone who does not know the border means error rather than focus. Add the words. Color can stay as a duplicate signal.",
          },
          {
            prompt: "Tab order follows the visual order of a two-column layout that was implemented as one column in the markup, then moved with styles. What does the keyboard user experience?",
            answer: "Focus jumps in the markup order, not the visual order. They tab to a field that is not the next one on the screen. Put the markup in task order, or set the order deliberately and test it.",
          },
        ],
      ),
      week(
        "l11",
        "Studies and the people in them",
        [
          "A study uses someone's time and their behavior. The minimum standard is informed consent, a way to stop, data minimization, and a purpose you told them. A usability test of a school project is still a study. 'It is just a class' is not a waiver.",
          "Do not test on people who cannot refuse you: an employee who reports to you, a patient waiting for care, a student whose grade you control, without a path that does not involve you. The power is the ethical problem, not the questionnaire.",
          "Store the notes without the names if the names are not the data. A video of a person's face is identifiable. Prefer notes taken in the session if you do not need the video. If you need it, say so before they start.",
          "The finding should be allowed to be 'do not build this.' A study that can only end in shipping is a demonstration. The clinic front desk may not need your application. That is a successful study if you learned it before they had to live with the application.",
        ],
        { kind: "layers", caption: "Before you recruit.", rows: ["What you will ask them to do", "That they can stop", "What you will keep", "Who must not feel obliged"] },
        "A front desk during clinic hours",
        [
          "You want to watch staff use a prototype. The waiting room is full. They cannot stop without abandoning a patient.",
          "That is not consent. Schedule a time when stopping is real, or do not run the session there.",
          "A hallway card sort with a volunteer who knows they can walk away is a different study. Use that if you cannot get the real setting ethically.",
        ],
        [
          {
            prompt: "You record the session 'in case,' and the consent form said notes only. What do you do with the file?",
            answer: "Delete it. You do not have consent to keep it. The notes you said you would take are the data. A useful recording you were not allowed to make is not a reason to amend the agreement after the fact.",
          },
          {
            prompt: "The study shows the tool slows the task relative to paper. What is a valid conclusion?",
            answer: "Do not replace the paper, or change the tool and test again. Shipping it because the semester ends is not a finding. The slowdown is the finding.",
          },
        ],
      ),
      week(
        "l12",
        "A design you can iterate",
        [
          "The project is one task, two versions, and a session. Version one is the prototype from the early weeks. You run the session, count the failures, change one thing that the failures named, and run a confirmation. The earlier lecture's retest is this, with the models and the access checks included.",
          "Change one thing. If you redesign the whole screen, you do not know what fixed the failure. The software course said the same about diffs. It is the same idea.",
          "Include the keyboard pass and one access requirement in the confirmation. A visual fix that removes focus is not a fix.",
          "Write a page: the task, the count, the change, the second count. That page is the deliverable. A slide of screenshots is not.",
        ],
        { kind: "pipeline", caption: "Two versions.", stages: ["A task and a success rule", "Five sessions or fewer", "One change, tied to a failure", "A confirmation session"] },
        "Dashes, before and after",
        [
          "Before: three of four people type the id without dashes and the field rejects them. Times are long because they retype.",
          "The change: accept the digits with or without dashes, and show the canonical form. One change.",
          "After: four of four enter the id. If a new failure appears, you write it down and do not pretend the confirmation was clean.",
        ],
        [
          {
            prompt: "You change the label, the order, and the button in response to one failure. What can the confirmation tell you?",
            answer: "Only that the bundle differs. You cannot attribute the new result to the label. Change the one thing the failure named, or call the session a new pilot rather than a confirmation.",
          },
          {
            prompt: "The confirmation removes the text alternative so the layout matches a screenshot. What requirement did you break?",
            answer: "The access requirement that the control has a name. The visual match is not the success criterion. Put the name back before you call the iteration done.",
          },
        ],
      ),
      week(
        "l13",
        "The interface of the capstone",
        [
          "The capstone has a person who is not you. That phase is this course. Before you build the screen, write the task, the success criterion, and the one access sentence. Then prototype on paper. A paper session is cheaper than a session of a finished wrong screen.",
          "The security course will forbid some convenient designs: a session in the URL, an error that reveals whether the account exists, a report tool that takes a raw path. Those constraints are part of the interface. A usable design that fails them is not a candidate. Find a design that a person can finish and that the threat model allows.",
          "The database course will ask for a transaction around the action the button performs. The button's label should be the action the transaction actually commits. A button named Save that also sends a message and charges a card is three tasks pretending to be one.",
          "Bring the one-page study plan to the capstone hours. Do not invent the user test on the last day.",
        ],
        { kind: "layers", caption: "Before the screen.", rows: ["The task in one sentence", "Success, timed or counted", "The access sentence", "The security constraint the screen must not break"] },
        "A button with three effects",
        [
          "The button says Save. It saves the record, emails a third party, and submits a charge.",
          "A person who wanted to save a draft has sent the email and the charge. The label lied.",
          "Split the actions, or rename the button to the real effect and confirm the costly part. The transaction boundaries should match the labels.",
        ],
        [
          {
            prompt: "The usable design puts the account number in the URL so the back button works. What do you change?",
            answer: "The navigation, not the security rule. Keep the account number out of the URL and the logs, and give the back control a real history. A usable leak is still a leak.",
          },
          {
            prompt: "You have no participant yet and the interface is already coded. What do you do this week?",
            answer: "Paper or a clickable sketch, one task, one person who can refuse. You will still learn whether the label is wrong. Waiting for the finished UI wastes the iteration.",
          },
        ],
      ),
      week(
        "l14",
        "What you owe the person using it",
        [
          "You should be able to run a small study, report counts without theater, name a pointing or labeling problem with a model, and check a keyboard path. You should also be able to stop a study you should not be running. That is the course.",
          "The hours include one session and one revision, not a reread. The notes are the checklist. The session is the evidence.",
          "When the capstone's last phase says a person who is not you, this is the method. Five tasks, a way to stop, a change tied to a failure, and a sentence about what you refused to change.",
          "The work is original teaching of standard human-computer practice. It is not a copy of a studio course. The standard is the part that matters: watch a person, count what happened, change one thing.",
        ],
        { kind: "layers", caption: "The close.", rows: ["A task", "A count", "One change", "A person who could have stopped"] },
        "A session you stop",
        [
          "The participant is frustrated and asks to stop on task two of five.",
          "You stop. You do not coax a complete dataset. The note says they stopped, and why.",
          "That session still counts as information. It does not count as a success. You do not replace their tasks with your own performance of the UI.",
        ],
        [
          {
            prompt: "What do you report if one of five people stops and the other four succeed?",
            answer: "Four successes, one stop, and the reason they gave. You do not report five sessions completed. The stop is part of the result.",
          },
          {
            prompt: "Name one model and one access check you apply before recruiting the next session.",
            answer: "Fitts or Hick on the primary control, and a keyboard pass that reaches it with a visible focus and a name. Then recruit. A session spent discovering that the button has no name is a session you did not have to spend.",
          },
        ],
      ),
    ],
  },
];
