import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-712",
    lectures: [
      lec(
        "l1",
        "Scope and the custody log",
        [
          "You open a case by writing the question, the devices in scope, and the time window. A chain of custody is the mechanism that ties a later image to that seizure. Each handoff records 4 fields: the item, who released it, who received it, and the clock time. If you leave one field blank, a reader cannot show that item 2 on the bench is the drive you took from the desk.",
          "You photograph connectors before you unplug them, because cable order is part of the scene. Then you mark the device with a case number and an item number, such as item 3. The bag, the form, and the image you make later must carry that same pair. A report about a laptop you cannot match to item 3 is a story. It is not an exhibit you can defend.",
        ],
        {
          kind: "layers",
          caption: "Four fields on each handoff",
          rows: ["Item identifier", "Person who released it", "Person who received it", "Time of the handoff"],
        },
        "Item 3 changes hands twice",
        [
          "You seize item 3 at 09:10 and log yourself as the receiver. The releaser is the person who had the laptop.",
          "At 11:40 you hand item 3 to a colleague. The log now has a second line: you release, they receive, time filled in.",
          "The image made that afternoon is labeled item 3. A reader can walk both lines without guessing who held the drive.",
        ],
        [
          {
            prompt: "The log for item 3 names the releaser and the receiver but leaves the time blank. What can you not claim?",
            answer: "You cannot claim a complete chain for item 3. The handoff needs 4 fields, and the time is one of them. Names alone do not show when the drive moved.",
          },
          {
            prompt: "You photographed the ports, labeled item 5, and then imaged a different unlabeled laptop. What is wrong with the exhibit?",
            answer: "The image is not tied to item 5. The bag, the form, and the image must carry the same item number. A careful photo does not repair a swapped device.",
          },
        ],
      ),
      lec(
        "l2",
        "Imaging through a write blocker",
        [
          "You acquire a disk through a write blocker, which forwards read commands and drops writes. The result is a forensic image plus a hash of the sectors you copied. You compute the same hash, often SHA-256, on the source and on the image, and you write both digests in the notes. If they differ by 1 bit, you do not search that image. You acquire it again.",
          "A copy of visible files is not enough when you still need deleted space. The image keeps unallocated clusters, slack, and the partition table. You store it on wiped media and you keep a second copy under the same item number. NIST tool tests check whether a product reports a known image, including a planted mismatch. You read 1 such report before you trust a tool you have not used.",
        ],
        {
          kind: "pipeline",
          caption: "From device to checked image",
          stages: ["Attach the write blocker", "Copy every sector", "Hash source and image", "Store two labeled copies"],
        },
        "A four-sector toy image",
        [
          "The source has 4 sectors. The blocker accepts the reads and rejects a write your imager tries by mistake.",
          "You hash the 4 sectors and hash the image. The two digests match, so this image is the one you will search.",
          "You keep a second copy on other media, still labeled with the item number. A later scratch does not force a new seizure.",
        ],
        [
          {
            prompt: "The source digest and the image digest differ. What do you do with that image?",
            answer: "You do not search it. A difference of even 1 bit means the image is not a faithful copy. You acquire the source again through the write blocker and compare the hashes once more.",
          },
          {
            prompt: "You copied only the files a user can see, and the hashes of those files match. Is deleted space preserved?",
            answer: "No. A logical file copy never stored unallocated clusters or slack. Matching file hashes do not replace a full image when the question needs deleted space.",
          },
        ],
      ),
      lec(
        "l3",
        "Names, clusters, and carved candidates",
        [
          "A file system maps names to clusters through metadata. When you delete a file, many systems only clear a flag in the directory entry. The clusters can sit unchanged until a later write reuses them. You may carve a header, such as a 4-byte signature of a known type, from unallocated space. You label that hit a candidate, not a restored user file with a trustworthy name.",
          "You do not treat a recovered name as proof of who typed the bytes. Account identifiers, link files, and logs have to agree with the name. A thumbnail can show a picture whose main file is already gone. You record the path, which of 2 timestamps you trusted, and the tool version. 3 agreeing artifacts beat 1 parser you cannot explain to a reader.",
        ],
        {
          kind: "pair",
          caption: "Candidate versus named file",
          leftTitle: "Carved candidate",
          rightTitle: "Named file",
          left: ["Header found in free space", "No trustworthy path", "Say it is a candidate"],
          right: ["Directory entry still points", "Path and owner recorded", "Corroborate with logs"],
        },
        "One deleted note, one thumbnail",
        [
          "The directory flag is clear, but 2 clusters still hold a 4-byte header you recognize. You carve those clusters and mark them a candidate.",
          "A thumbnail in another folder shows the same picture. You record both places and you do not invent a user name for the carved bytes.",
          "A log on the same image shows the account that owned the folder. You cite the log, the thumbnail, and the candidate as 3 separate facts.",
        ],
        [
          {
            prompt: "Your carver prints a file name next to a header found in free space. What do you call the result, and why?",
            answer: "You call it a candidate. Deletion often clears the directory flag and leaves clusters behind. A header is not a path, and a path the tool guessed is not proof of who wrote the bytes.",
          },
          {
            prompt: "You have a carved header, a thumbnail, and an account log that all fit the same picture. How many artifacts are you citing?",
            answer: "You are citing 3 artifacts. They are stronger together than 1 parser, and you still describe each source separately instead of merging them into a single guessed file.",
          },
        ],
      ),
      lec(
        "l4",
        "Clocks and a timeline you can defend",
        [
          "A timestamp is a clock plus a meaning. One file can store a created time, a modified time, and an accessed time, and those 3 fields do not move together. You convert every stamp into one zone, usually UTC, and you keep the raw value beside it. If two sources disagree by 5 seconds, you do not average them. You write down the skew and which source you used.",
          "You anchor the timeline to an event that also appears off the disk, such as a login in a network log. A laptop that was off can drift. If that clock is ahead of UTC, you subtract the gap. A gap of 2 hours means you subtract 2. A chart with no hypothesis is not a finding. You state the claim, or you do not.",
        ],
        {
          kind: "flow",
          caption: "Build one defended timeline",
          steps: ["Read each raw stamp", "Convert into UTC", "Note any skew", "State one hypothesis"],
        },
        "A clock that is two hours ahead",
        [
          "The file's modified stamp reads 11:00 on the laptop. You have already measured that this clock is 2 hours ahead of UTC.",
          "You subtract 2 hours. The stamp is 09:00 UTC. You keep 11:00 in the notes as the raw value.",
          "A network log shows a related login at 09:20 UTC. The file stamp is 20 minutes earlier. That is the hypothesis you can write, not a guess about intent.",
        ],
        [
          {
            prompt: "The laptop is 3 hours ahead of UTC. A file stamp reads 16:40 local. What is the UTC time?",
            answer: "13:40 UTC. A clock ahead of UTC by H hours is converted by subtracting H, so 16:40 minus 3 hours is 13:40. You still keep the raw 16:40 beside it.",
          },
          {
            prompt: "Two tools report the same event 5 seconds apart. Should you average them to 2.5 seconds of adjustment?",
            answer: "No. You record the 5-second skew and name which source you used. Averaging hides a disagreement the reader needs to see.",
          },
        ],
      ),
      lec(
        "l5",
        "Volatile collection before shutdown",
        [
          "RAM can hold processes, keys, and sockets that a disk image will not contain after you power off. You collect volatile evidence first, and you record that the collection itself changed memory. A memory image is still a copy you hash. The order is fixed: capture RAM, note the process list, then image the disk. Doing those 3 steps backward loses the sockets you came for.",
          "You do not trust a process name by itself. The name is a string the program chose. You read the parent, the path, the user, and the endpoint together. A 16-byte key in a process is a lead, not proof the user typed it. You name the tool and the system profile. Pages the kernel already evicted are a limit you state, not a gap you fill.",
        ],
        {
          kind: "layers",
          caption: "Order from volatile to disk",
          rows: ["Memory image first", "Process list second", "Disk image third"],
        },
        "A socket that shutdown would drop",
        [
          "The machine is on. You image RAM and hash that image before you ask the box to shut down.",
          "The process list shows one process with a network endpoint. You record parent, path, user, and endpoint as 4 fields.",
          "Only then do you image the disk. The report says the endpoint came from memory, because the disk image alone would not have kept it.",
        ],
        [
          {
            prompt: "You imaged the disk, shut the machine down, and only then wished you had the sockets. What did the order cost you?",
            answer: "The sockets were volatile. After shutdown they are gone, and the disk image cannot recreate them. The required order is RAM, then the process list, then the disk: 3 steps, memory before power off.",
          },
          {
            prompt: "A process is named like a system tool and holds a 16-byte key. What may you claim?",
            answer: "You may claim that this process image contained a 16-byte key, and you must cite parent, path, user, and endpoint. You may not claim the user typed the key, or that the name alone identifies the program.",
          },
        ],
      ),
      lec(
        "l6",
        "Logs and captures are partial",
        [
          "Network evidence is usually a log or a packet capture, and both are partial. A firewall log may store the time, the two addresses, the ports, and the action, and drop the payload. You hash the original file before you filter it. A capture of 10 minutes is not the whole day. You write the start, the stop, and the interface, or a reader cannot see what you never recorded.",
          "You correlate a flow with a host artifact only when the address, the port, and the time agree inside the skew you already measured. If the log shows a query at 14:02 and your capture starts at 14:05, you do not invent the missing packets. You report that the capture cannot confirm the response. A negative finding is still a finding. It keeps the 2 sources distinct.",
        ],
        {
          kind: "pair",
          caption: "What each source can show",
          leftTitle: "Firewall log",
          rightTitle: "Packet capture",
          left: ["Addresses, ports, action", "Payload often absent", "Hash the file first"],
          right: ["Bytes on one interface", "Only while it was running", "Write start and stop"],
        },
        "A query just before the capture",
        [
          "The DNS log records a query at 14:02. Your capture file starts at 14:05 and runs 10 minutes, until 14:15.",
          "You hash the capture before you filter. Inside the file you do not see that query or its response.",
          "You report both facts. You do not fill the 3-minute gap with packets you do not have.",
        ],
        [
          {
            prompt: "The capture runs from 14:05 to 14:15. The log shows a query at 14:02. Can you describe the response packets?",
            answer: "No. The query is 3 minutes before the capture starts. You report the log line and the capture window, and you do not invent packets for the gap.",
          },
          {
            prompt: "You filtered a firewall log and then hashed the filtered file only. What did you fail to preserve?",
            answer: "The original log. You hash the original before you filter so a reader can see that your later worksheet came from that file. A hash of the filtered copy does not anchor the source.",
          },
        ],
      ),
      lec(
        "l7",
        "Tool tests and the written report",
        [
          "A tool is evidence about evidence. You name the product, the version, and the settings, because a parser change can move a timestamp. NIST's tool testing program publishes results on known data. You read the test for the function you rely on. If that report says the tool missed 2 of 8 planted cases, you do not write that your single hit is certain.",
          "The report answers the question in the scope, in an order a stranger can check. You separate facts, interpretations, and limits. A fact is that the hash matched and the file was at a path. An interpretation is that the account likely opened it. A limit is that you never imaged the second drive. You attach the custody log. A 1-page conclusion with no appendix is not something you should sign.",
        ],
        {
          kind: "pipeline",
          caption: "From notes to a signed report",
          stages: ["Name tool and version", "Separate fact from limit", "Attach the custody log", "Answer only the scope"],
        },
        "A tool that missed two planted files",
        [
          "The NIST-style report you read says this version missed 2 of 8 planted deleted files.",
          "Your case has one carved candidate. You write that the tool can miss planted files, so absence is not proof the file was never there.",
          "The conclusion stays inside the scope, cites the hash, and points at the custody log. The miss rate stays in the limits section.",
        ],
        [
          {
            prompt: "A tool missed 2 of 8 planted files in a published test. Your image shows no hit. What may you tell the reader?",
            answer: "You may say the tool reported no hit on this image. You may not say the file was never present. A known miss on 2 of 8 planted cases belongs in the limits.",
          },
          {
            prompt: "Your draft says the user intended to hide a file. Which bucket is that sentence in?",
            answer: "It is an interpretation, not a fact. Facts are things like a matching hash and a path. Intent is not established by a parser output, and the limit section should say what you did not image.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now do with a case",
        [
          "You can now take a device from a labeled seizure to a report a reader can audit. You can image through a write blocker, require matching hashes, and refuse a copy that differs by 1 bit. You can build a timeline in UTC: if a clock is ahead of UTC by H hours, you subtract H. You can keep the 3-step volatile order and say what a tool failed to show in a published test.",
          "You can also keep the legal half as a procedure rather than a mood. A handoff still needs 4 fields, and an item number must match from bag to image. When a log and a capture disagree, you report both windows instead of inventing packets. Practice on a toy image you create, with 3 planted files and 1 deleted, and write the short report. If you cannot point at the hash, you are not done.",
        ],
        {
          kind: "flow",
          caption: "A case you can close",
          steps: ["Log four custody fields", "Hash the full image", "Convert clocks to UTC", "State facts and limits"],
        },
        "Hash match, then a clock conversion",
        [
          "The source hash and the image hash match, so you may analyze this copy. The match does not order events in time.",
          "A file stamp reads 11:40 on a laptop you measured as 2 hours ahead of UTC. You subtract 2. The stamp is 09:40 UTC.",
          "A log line for the same case sits at 09:10 UTC. The file stamp is 30 minutes later. You report that order and you keep the raw 11:40.",
        ],
        [
          {
            prompt: "The two hashes match. The laptop is 4 hours ahead of UTC, and a file stamp reads 18:15 local. A log line is at 13:15 UTC. Is the file stamp before or after the log line, and by how many minutes? Use the ahead-of-UTC rule.",
            answer: "Subtract 4 hours from 18:15 to get 14:15 UTC. The log line is 13:15 UTC, so the file stamp is 60 minutes after the log line. Matching hashes only show the image matches the disk. They do not put the events in order.",
          },
          {
            prompt: "Your toy practice image has 3 planted files and 1 deleted file, but the custody form has no time. What must you fix before you sign?",
            answer: "The handoff is incomplete: you still need all 4 fields, including the time. The planted counts do not replace the custody log, and you also need a hash you can point at.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-713",
    lectures: [
      lec(
        "l1",
        "A diagram before a patch",
        [
          "You start with a data-flow diagram, not with a pile of bug names. Draw each process, each store, and each trust boundary the bytes cross. A small web app often has 3 boundaries: browser to server, server to database, and server to an admin host. At every boundary you ask what can be spoofed, changed, denied, leaked, flooded, or used to gain a role. You write 1 threat per boundary before you pick a control.",
          "You name the asset on the far side of the boundary in the same sentence as the threat. A login form that accepts a string is not yet a threat. The threat is that the string crosses into a query, a file path, or a role check. You give each threat an identifier, such as T2, so a later test can point back at it. A control that traces to no boundary is a guess.",
        ],
        {
          kind: "flow",
          caption: "From diagram to one threat",
          steps: ["Mark trust boundaries", "Name the asset", "Write one threat", "Point a control at it"],
        },
        "Three boundaries, one identifier",
        [
          "You draw the browser, the server, and the database. That is 3 boundaries once you also include the admin host.",
          "On the server-to-database boundary you write T2: an untrusted string must not change the query text.",
          "The control you name is a parameter channel. T2 is the identifier the test will cite. You do not start by renaming functions.",
        ],
        [
          {
            prompt: "You listed 12 possible bugs and never drew a boundary. What is missing?",
            answer: "The data-flow diagram and a threat tied to a boundary. A bug list without a boundary does not say which asset the bytes can reach. Write 1 threat per boundary, with an identifier, before you pick controls.",
          },
          {
            prompt: "Threat T2 says an untrusted string must not change query text. Which boundary is that, in the small app?",
            answer: "The server-to-database boundary. The browser-to-server boundary is where the string arrives, and T2 is about the string becoming query text on the way into the database.",
          },
        ],
      ),
      lec(
        "l2",
        "Three defenses around memory",
        [
          "You treat a memory safety bug as a class you contain, not as a single bad copy. Three mechanisms sit on a typical process. A stack canary is a value, often 8 bytes, placed before the return data and checked before the function returns. If those bytes changed, you abort. Address space layout randomization slides bases so a location that was right in one run is wrong in the next. A page may be writable or executable, not both.",
          "You still remove the bad copy. The 3 mechanisms raise the cost of turning a bad write into control of the process, and they do not make an 8-byte overflow acceptable. You turn them on in the build you ship, and you turn on the same checks in the build you test. A crash that only appears with the canary disabled is a finding you file. It is not a reason to ship the weaker build.",
        ],
        {
          kind: "layers",
          caption: "Three contains on one process",
          rows: ["Canary checked on return", "Bases slide each run", "Write or execute, not both"],
        },
        "An eight-byte buffer and its canary",
        [
          "A function has an 8-byte buffer. The canary sits after it and is checked when the function returns.",
          "A write of 9 bytes changes a canary byte. The check fails and the process aborts instead of returning.",
          "You file the abort against the function. You do not turn the canary off to make the test look quiet.",
        ],
        [
          {
            prompt: "The canary is 8 bytes and a write touches 9 bytes of the buffer area. What should the return check do?",
            answer: "It should fail and abort the process. The canary is there so a write past the 8-byte buffer is noticed before the return. Disabling the check is not a fix.",
          },
          {
            prompt: "ASLR made one hardcoded location fail on the second run. Do you still fix the overflow?",
            answer: "Yes. ASLR is 1 of the 3 defenses. A slide that changes each run is not a repair of the copy that writes past the buffer. You fix the copy and you keep the slide, the canary, and the page rule.",
          },
        ],
      ),
      lec(
        "l3",
        "Keep data out of the instruction channel",
        [
          "You assume every byte that crossed a trust boundary is data, not instructions. The mechanism is to pass structure and value in separate channels. A database call sends the query text with a placeholder and sends the value beside it, so a 20-character name cannot close the statement and open another. The same split applies to a command, a file path, and a document that would otherwise mix markup with text.",
          "You check the shape you actually accept. If an account number is 8 digits, you reject a string of length 9 before it reaches the store. Allow-lists are smaller than deny-lists: you name the characters you keep, and you drop the rest. Encoding on the way out is a second mechanism, for a page that must show the value. Validation on the way in does not replace encoding on the way out. You do both.",
        ],
        {
          kind: "pair",
          caption: "Two ways to pass a name",
          leftTitle: "Mixed into text",
          rightTitle: "Separate channels",
          left: ["Value sits inside the query", "Length can change the parse", "Reject this shape"],
          right: ["Placeholder stays fixed", "Value rides beside it", "Parser sees one statement"],
        },
        "An eight-digit account number",
        [
          "The field must be 8 digits. The submitted string has length 9, so you reject it at the boundary and you never open a query.",
          "A valid value, 8 digits, goes out on the parameter channel. The query text still has one placeholder.",
          "When you render that value on a page, you encode it for the page. The input check does not do that job.",
        ],
        [
          {
            prompt: "An account field must be 8 digits. The input has length 12. Where do you stop it?",
            answer: "At the boundary, before any query, command, or path use. Length 12 is not the 8-digit shape you accept. A parameter channel is for values that already passed the shape check.",
          },
          {
            prompt: "You bound the value as a parameter and then inserted it into a page with no encoding. What did you skip?",
            answer: "The output encoding. The parameter channel keeps the value out of the query text. A page is a second channel, and validation on the way in does not encode on the way out.",
          },
        ],
      ),
      lec(
        "l4",
        "Privileges that fail closed",
        [
          "You give a component the smallest set of rights that lets it do its job, and you default to deny. A service account that only reads 1 table should not hold a database role that can write every table. When a check fails or a dependency is down, you fail closed: the operation stops. An error page that still returns the record is an open failure. You would rather return nothing than return the row.",
          "You split roles that should not meet. The code that renders a page does not also own the migration credential. An admin action requires a second check, not only a hidden link. You review rights on a schedule, and you remove a right that no call has used. A process running as 1 identity for both public traffic and admin traffic will eventually use the stronger right on the weaker path.",
        ],
        {
          kind: "pipeline",
          caption: "Tighten one service account",
          stages: ["List the calls it makes", "Grant only those rights", "Deny on any failed check", "Remove unused rights"],
        },
        "One table, read only",
        [
          "The service answers a lookup by reading 1 table. You grant that table and that operation, and nothing else.",
          "A check cannot reach the policy store. You fail closed and return no row. You do not fall back to a broader role.",
          "A review finds a write right nobody calls. You remove it. The public path and the admin path no longer share one identity.",
        ],
        [
          {
            prompt: "The policy service times out. Your code returns the row anyway so the page still loads. What is the failure mode?",
            answer: "It fails open. A failed check must stop the operation. Returning the row because a dependency is down hands out data you did not authorize on that request.",
          },
          {
            prompt: "The public site and the admin tool share 1 service account that can write every table. What do you change?",
            answer: "You split the identities and cut the public account down to the calls it makes. If it only needs to read 1 table, that is the grant. Unused write rights come off.",
          },
        ],
      ),
      lec(
        "l5",
        "What a static pass can see",
        [
          "A static pass reads the program without running it and looks for a path from a source to a sink. A source is a place untrusted bytes enter, such as a request field. A sink is a place those bytes must not control, such as a query, a path, or an HTML insertion. If the pass finds 14 paths and you confirm 3 of them, you file those 3. You do not close the other 11 by wishing.",
          "You learn the false alarms of the tool you chose. A sanitizer the tool does not recognize will look like an open path. You mark that function as a sanitizer in the tool's model, or you rewrite the call so the safe channel is obvious. You do not suppress a warning by deleting the check. A 0-warning build means the pass is quiet. It does not mean you finished the diagram from the first lecture.",
        ],
        {
          kind: "flow",
          caption: "Triage one static warning",
          steps: ["Find the source", "Walk to the sink", "Confirm or explain it", "Fix the real path"],
        },
        "Fourteen warnings, three confirmed",
        [
          "The pass reports 14 source-to-sink paths. You open each one and ask whether the bytes can still reach the sink.",
          "You confirm 3. One of them builds a query by joining a request field into the text. You change that call to a parameter.",
          "You leave the other 11 visible until you either fix them or record why each is not a path. You do not delete the warnings.",
        ],
        [
          {
            prompt: "The tool reports 14 paths and you confirm 3. How many remain your problem until you explain them?",
            answer: "11. Confirming 3 does not clear the rest. Each of the 11 is either a real path you fix or a warning you can explain, including a sanitizer the tool failed to see.",
          },
          {
            prompt: "A build with 0 static warnings still has no data-flow diagram. Are you done?",
            answer: "No. A quiet pass means the tool's checks are quiet. It does not replace a threat per boundary, and it will miss sinks the model does not know.",
          },
        ],
      ),
      lec(
        "l6",
        "Tests that treat the boundary as hostile",
        [
          "You write security tests against the threats you already numbered. Each test names an identifier such as T2, sends an input at the boundary, and states the result you expect. A parser that reads a length and then that many bytes must reject a header whose length is 4 when only 2 bytes follow. The expected result is a clean reject and no partial object. A crash is a failure of the test, not a trophy.",
          "A fuzzer is a generator plus an oracle. It mutates inputs and watches for a failed assertion, a timeout, or an abort. You run it on a build that still has the canary and the page rules turned on. You cap a run, for example 20000 cases, and you file every new abort with the input that reached it. You do not ship a parser that only survives the 12 examples you typed by hand.",
        ],
        {
          kind: "pipeline",
          caption: "One security test, end to end",
          stages: ["Cite the threat id", "Send the boundary input", "Expect a clean reject", "File any abort"],
        },
        "A length that does not match",
        [
          "Threat T4 says a short read must not become an object. You send a header that claims length 4 and then you supply 2 bytes.",
          "The parser returns a reject and allocates nothing. That is the expected result, so this case passes.",
          "A later generated case aborts inside the same parser. You save that input, keep the canary on, and file the abort against T4.",
        ],
        [
          {
            prompt: "The header says length 4 and the body has 2 bytes. What is the expected result?",
            answer: "A clean reject and no partial object. The test is tied to the threat that a short read must not become an object. An abort is a failed test, not a success.",
          },
          {
            prompt: "Your suite has 12 hand-written cases, all green, and you have never run a generator. What coverage claim is off?",
            answer: "You have not exercised the boundary beyond those 12 cases. A generator plus an oracle, on a build with the canary still on, is how you look for aborts your examples missed. Green examples are not that run.",
          },
        ],
      ),
      lec(
        "l7",
        "Score only what you confirmed",
        [
          "You score a confirmed issue as likelihood times impact. Both are integers from 1 to 5, and the product is the score you record. An issue you have not confirmed scores 0, even if a tool shouted. You only score an issue that crosses a boundary you drew. After a control, you rescore. If likelihood drops from 4 to 1 and impact stays 5, the score drops from 20 to 5. The 5 is the residual you still own.",
          "You spend time on the highest residual, not on the loudest headline. A score of 20 that you can cut to 5 this week outranks a score of 6 you cannot touch yet. You write the residual next to the threat identifier so the diagram stays honest. Risk acceptance is a sentence a person signs: they accept residual 5 on T2 for 30 days. Silence is not acceptance.",
        ],
        {
          kind: "pair",
          caption: "Before and after one control",
          leftTitle: "Before the control",
          rightTitle: "Residual",
          left: ["Likelihood 4, impact 5", "Product is 20", "Boundary crossing confirmed"],
          right: ["Likelihood 1, impact 5", "Product is 5", "Owner signs the 5"],
        },
        "From twenty down to five",
        [
          "T2 is confirmed on the database boundary. Likelihood 4, impact 5, score 20.",
          "You move the value onto a parameter channel. Likelihood falls to 1. Impact stays 5 because the data is still sensitive. Residual score is 5.",
          "A named owner accepts residual 5 for 30 days, in writing. The unsigned tool warning you did not confirm stays at 0.",
        ],
        [
          {
            prompt: "Likelihood is 3 and impact is 4 on a confirmed boundary crossing. What is the score?",
            answer: "12. The score is likelihood times impact, so 3 times 4 is 12. Both factors are on the 1 to 5 scale.",
          },
          {
            prompt: "A tool warning is real-looking but you have not confirmed it, and it does not cross a boundary you drew. What score do you record?",
            answer: "0. Unconfirmed issues score 0, and you only score crossings of a boundary you drew. Volume of warnings is not a score.",
          },
        ],
      ),
      lec(
        "l8",
        "A design you can now review",
        [
          "You can now review a system instead of hunting for a clever bug. You draw the boundaries, write one threat on each, and keep data off the instruction channel. You leave the 3 memory defenses on in the build you ship. You turn a static path into a confirmed issue or a written explanation, and you add a test that cites the threat. You score only confirmed crossings: likelihood times impact, from 1 to 5, and everything else scores 0.",
          "You can also say what you did not finish. A residual score still needs an owner and a date. A green run of 12 hand-written cases is not a fuzz campaign. Practice on one service with 3 boundaries. Confirm the crossings, rescore after each control, and fail closed when a check cannot run. If a right is unused, you remove it. That stack is the review.",
        ],
        {
          kind: "layers",
          caption: "The review you can now run",
          rows: ["Diagram and threat ids", "Defenses and safe channels", "Tests that cite threats", "Scores with an owner"],
        },
        "Two warnings, one score",
        [
          "You drew the boundaries. Warning A crosses one of them. Likelihood 2, impact 4, so its score is 8.",
          "Warning B does not cross a boundary you drew. Its score is 0 even though a tool ranked it first.",
          "You add the products. The review total is 8. You attach a test id to warning A and you leave B explained, not silenced.",
        ],
        [
          {
            prompt: "Warning A crosses a boundary you drew, with likelihood 2 and impact 5. Warning B does not cross a boundary, with likelihood 5 and impact 5. Using only confirmed boundary crossings, what total do you record?",
            answer: "10. A scores 2 times 5, which is 10. B scores 0 because it is not a confirmed crossing of a boundary you drew. The total is 10, not 35.",
          },
          {
            prompt: "After that review you still have residual 10, no named owner, and only 12 hand-written tests. What is unfinished?",
            answer: "Residual 10 needs an owner and a date, and 12 hand-written cases are not a generator run. The score is not acceptance until someone signs it, and the tests should cite the threat identifier.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-715",
    lectures: [
      lec(
        "l1",
        "A claim is not a session",
        [
          "You separate authentication from authorization on purpose. Authentication is the mechanism that checks a claim of identity. Authorization is the later decision about what that identity may do. A session cookie that appears after a login is not the check itself. It is a handle you issued because a check succeeded. If you skip the check and only look for the cookie's shape, you have mixed up the 2 questions.",
          "You write the claim in one sentence: this subject controls authenticator A, checked at this time, for this relying party. A subject can be a person or a service. You store an account identifier that is stable, not an email address you plan to recycle. When the check fails, you do not open a half session. One failed claim yields 0 privileges. A friendly error string is not a credential.",
        ],
        {
          kind: "pair",
          caption: "Two questions you keep apart",
          leftTitle: "Authentication",
          rightTitle: "Authorization",
          left: ["Checks an identity claim", "Uses an authenticator", "Failure grants nothing"],
          right: ["Decides a permitted action", "Runs after a real check", "Uses the stable account id"],
        },
        "A failed claim and a cookie",
        [
          "The subject presents authenticator A. Your check fails. You issue no session handle.",
          "A caller then shows a cookie-shaped string they invented. You do not treat the shape as a successful claim.",
          "Because the claim failed, the authorization step never runs. The subject receives 0 privileges, not a reduced role.",
        ],
        [
          {
            prompt: "A request carries a well-formed session cookie, but you never ran an authentication check. What have you confused?",
            answer: "You confused the session handle with the check. Authentication decides whether the claim holds. The cookie is only a handle you issue after success. Shape alone is not a claim.",
          },
          {
            prompt: "The authenticator check fails. How many privileges do you grant?",
            answer: "0. A failed claim does not open a half session and does not fall through into an authorization decision.",
          },
        ],
      ),
      lec(
        "l2",
        "Salt, a slow hash, and a blocklist",
        [
          "You never store the secret a person typed. You store a salt and the output of a slow one-way function. The salt is a random value, unique per account, so two users who pick the same secret do not produce the same stored string. You set a cost parameter, for example 1000 iterations, so one check does far more work than a single hash. A lab unit that spends 1 unit per iteration spends 1000 units on that check.",
          "You also reject secrets you already know are common. A blocklist does that job better than a rule about mixing character classes. Length matters: you accept a long secret, at least 8 characters, and you allow pastes of a phrase. NIST SP 800-63B is the public guide you read for those verifier rules. A pepper, if you add one, is a secret key held outside the account table, not a second salt you store beside the hash.",
        ],
        {
          kind: "pipeline",
          caption: "Store a verifier, not the secret",
          stages: ["Draw a unique salt", "Run the slow function", "Store salt and output", "Reject blocklisted secrets"],
        },
        "One thousand units per check",
        [
          "Account 7 has its own salt. You run 1000 iterations of the slow function on salt plus secret.",
          "You store the salt and the output. You do not store the secret. A second account with the same secret and a different salt stores a different output.",
          "A guess spends 1000 units, not 1. Four online guesses on this account spend 4000 units before any lockout rule.",
        ],
        [
          {
            prompt: "One check uses 1000 iterations, and each iteration costs 1 unit. How many units do 4 checks cost?",
            answer: "4000. Each check costs 1000 units, and 4 times 1000 is 4000. The salt does not change that cost. It stops identical secrets from sharing one stored output.",
          },
          {
            prompt: "Two accounts chose the same secret. Why are the stored outputs different?",
            answer: "Each account has its own salt, and the slow function takes salt plus secret. Equal secrets with different salts do not produce the same stored string. You still never store the secret itself.",
          },
        ],
      ),
      lec(
        "l3",
        "Online guesses meet a lock",
        [
          "You rate-limit checks against one account and against one source. The mechanism is a counter plus a lock. After 5 failed checks you stop accepting new attempts for that account for a window you chose, such as 15 minutes. A success resets the failure counter to 0. The lock is an online control. It does nothing for someone who already stole the verifier file and can guess somewhere else.",
          "You keep the error text dull. The message does not say whether the account exists. You also do not let the lock become a tool that freezes every account a stranger can name: you can require a second signal, such as the source address, before a short lock. Log the failures with the account identifier and the time. A spike of 50 failures on one account in a minute is a page you answer, not a graph you admire.",
        ],
        {
          kind: "flow",
          caption: "Five failures, then a lock",
          steps: ["Count failed checks", "Lock at five", "Stay dull in errors", "Reset only on success"],
        },
        "Five failures at one thousand units",
        [
          "Each failed check still runs the slow function and costs 1000 units. The counter moves from 0 toward 5.",
          "Failure number 5 locks the account for 15 minutes. Online work spent on those failures is 5000 units.",
          "A correct secret during the lock does not slip through. When the window ends, one success sets the counter back to 0.",
        ],
        [
          {
            prompt: "Each check costs 1000 units and you lock at 5 failures. How many units did those failures cost online?",
            answer: "5000. Five times 1000 is 5000. The 15-minute lock then stops further online attempts. It does not slow guesses against a stolen verifier file.",
          },
          {
            prompt: "Your error text says the account does not exist. What did you give away?",
            answer: "You told the caller whether the account identifier is valid. The failure message should stay dull and should not split missing accounts from bad secrets.",
          },
        ],
      ),
      lec(
        "l4",
        "A second factor bound to the site",
        [
          "You add a second authenticator that is not another copy of the same secret. A time-based code is a common second factor: both sides share a key, and the code is a short truncation of a function of that key and a time step. With a 30-second step and a 6-digit code, the verifier accepts the current step and maybe 1 step of clock skew. A phished code can be replayed until that step ends. You should know that limit.",
          "A phishing-resistant factor binds the check to the site name. The authenticator signs a challenge that includes the origin, and your verifier rejects a signature that names a different origin. A lookalike site can display a prompt and still cannot obtain a signature your real origin will accept. You offer this factor for accounts that can reset other people. Two factors that both live in the same chat app are really 1 basket.",
        ],
        {
          kind: "layers",
          caption: "What the second factor adds",
          rows: ["A secret the site stores", "A time step or a challenge", "A check bound to the origin"],
        },
        "A thirty-second code versus a signature",
        [
          "The account passes the password check. You still want a second factor. The code changes every 30 seconds and shows 6 digits.",
          "An impostor site can ask the person to read those digits aloud. Until the step rolls, a forwarded code can pass your verifier.",
          "You switch that account to a signature over a challenge that includes your origin. A signature made for another origin fails your check.",
        ],
        [
          {
            prompt: "A code is 6 digits on a 30-second step, and you allow 1 step of skew. Why is a forwarded code still a problem inside that window?",
            answer: "The verifier accepts the current step and the skew step. A code read out and reused before those steps end still matches. Binding a signature to the origin closes that replay. A short code does not.",
          },
          {
            prompt: "The signed challenge names origin example.test, and your site is example.edu. Do you accept it?",
            answer: "No. The factor is phishing resistant only if you require the origin in the signature to be your origin. example.test is not example.edu, so this signature fails.",
          },
        ],
      ),
      lec(
        "l5",
        "Two error rates for a biometric",
        [
          "A biometric check compares a fresh sample to a stored template. You track two rates. The false accept rate counts impostor matches. The false reject rate counts real subjects turned away. If the false reject rate is 1 in 50, then in 100 genuine tries you expect 2 rejects. If the false accept rate is 1 in 10000, then in 20000 impostor tries you expect 2 false accepts.",
          "You store a template derived from the sample, not a raw image, and you protect it like a verifier. You cannot rotate a fingerprint the way you rotate a password. Revocation means a new template, a new matcher setting, and a second factor so a stolen template is not enough. A threshold that drives false accepts toward 0 pushes false rejects up. You write both rates down before you ship.",
        ],
        {
          kind: "pair",
          caption: "The two rates you publish",
          leftTitle: "False accept",
          rightTitle: "False reject",
          left: ["Impostor treated as match", "1 in 10000 in this lab", "Tighten and rejects rise"],
          right: ["Real subject turned away", "1 in 50 in this lab", "Expect 2 per 100 tries"],
        },
        "One hundred genuine tries",
        [
          "Your matcher is set so a genuine subject is rejected about 1 time in 50.",
          "In a lab of 100 genuine tries, you expect 100 divided by 50, which is 2 false rejects.",
          "You record that 2 beside the false accept figure. You do not publish only the rate that looks kinder.",
        ],
        [
          {
            prompt: "The false reject rate is 1 in 50. How many false rejects do you expect in 250 genuine tries?",
            answer: "5. Divide 250 by 50. The false accept rate is a different number and does not enter this count.",
          },
          {
            prompt: "The false accept rate is 1 in 10000. How many false accepts do you expect in 20000 impostor tries?",
            answer: "2. Divide 20000 by 10000. Lowering this rate further will usually raise false rejects, so you record both rates before you change the threshold.",
          },
        ],
      ),
      lec(
        "l6",
        "A challenge, a toy secret, a response",
        [
          "You do not let a client send the same response twice and have it count twice. The mechanism is a challenge. Your server draws a fresh nonce, the client computes a function of the shared secret and that nonce, and you check the result. An old response fails because it was built for a different nonce. On a toy 4-bit secret, you can see the whole shape without pretending the toy is a real key.",
          "The toy is not a fielded system. The secret is the 4 bits 1011, which is 11. The challenge is 0011, which is 3. The response is the exclusive or, 1000, which is 8. You accept 8 only for this challenge. A second login draws a new challenge, so 8 will not match again. A real function is a message authentication code over a long secret. The 4-bit mix only shows why the nonce must change.",
        ],
        {
          kind: "flow",
          caption: "One fresh challenge, one check",
          steps: ["Draw a new nonce", "Client mixes in the secret", "Accept only this response"],
        },
        "Four bits, one challenge",
        [
          "The shared toy secret is 1011. You send the challenge 0011 and you store it for this attempt only.",
          "The client returns 1011 xor 0011, which is 1000. In decimal that is 11 xor 3 = 8.",
          "You accept 8 for this nonce. Replaying 8 on the next attempt fails, because the next nonce is not 0011.",
        ],
        [
          {
            prompt: "The toy secret is 1100 (decimal 12) and the challenge is 0101 (decimal 5). What response do you expect under the same exclusive-or rule?",
            answer: "1001, which is decimal 9. Bitwise, 1100 xor 0101 is 1001, and 12 xor 5 is 9. You accept it only for this challenge.",
          },
          {
            prompt: "The client resends 1001 after you have issued a new challenge. Why do you reject it?",
            answer: "The response is bound to the nonce that produced it. A new challenge needs a new mix with the secret. The old 1001 is a replay, even though it was correct once.",
          },
        ],
      ),
      lec(
        "l7",
        "Compare every byte, then decide",
        [
          "A compare that returns at the first mismatch does different work for different inputs. On a toy token of 4 characters, ab12 versus ax99 can stop at the second character, while ab12 versus ab19 runs further. The time, or a step counter, then tracks the matching prefix. You do not ship that compare for a secret or a token. The leak is the early exit, even when the token is fake.",
          "You compare every position and fold differences into one accumulator. For each of the 4 positions you exclusive-or the bytes and combine that into the accumulator. You look once, after the loop. Equal tokens leave 0. Any difference leaves a nonzero value, and the loop length stays 4. You still test two tokens that differ at index 0 and at index 3.",
        ],
        {
          kind: "pair",
          caption: "Two compares of four bytes",
          leftTitle: "Early exit",
          rightTitle: "Full fold",
          left: ["Stops at first mismatch", "Steps track the prefix", "Do not use it here"],
          right: ["Visits all 4 positions", "One check at the end", "Length does not vary"],
        },
        "Tokens ab12 and ab19",
        [
          "An early-exit compare of ab12 and ax99 stops at the second character. That is 2 steps.",
          "The same style of compare on ab12 and ab19 walks further, because the first 2 characters match. The step count changed.",
          "The full fold visits all 4 positions for both pairs and checks one accumulator at the end. Both calls do 4 steps.",
        ],
        [
          {
            prompt: "You compare a 4-byte token and your loop returns on the first mismatch. Why is that a problem even for a fake token?",
            answer: "The number of steps tracks how long the prefix matched. A caller who can observe steps learns where the first difference sits. You fold all 4 positions into one accumulator and branch once at the end.",
          },
          {
            prompt: "Two tokens differ only at the last byte. How many positions does the full fold visit?",
            answer: "4. The loop does not stop early. The accumulator becomes nonzero on the last byte, and you inspect it only after all 4 positions.",
          },
        ],
      ),
      lec(
        "l8",
        "An authenticator set you can specify",
        [
          "You can now specify an authenticator set instead of saying the login is secure. You store a unique salt and a slow output, with a cost you can state, such as 1000 units per check. Online, you lock at 5 failures, and those checks cost 5000 units. That lock does not bound guesses on a stolen verifier. You can add a second factor. A 6-digit code on a 30-second step can be forwarded until the step ends.",
          "You can also say when a biometric is fit to ship. You publish both error rates, and you keep a second factor because a template is hard to rotate. A challenge must be fresh: in the 4-bit toy, response 8 belonged to one nonce. Compares of tokens visit every byte. Your spec names the claim, the factors, the lock, and the cost. If the lock is your only control on a stolen table, the spec is not finished.",
        ],
        {
          kind: "layers",
          caption: "What the spec must name",
          rows: ["Salt and slow cost", "Lock after five failures", "Second factor and origin", "Fresh nonce, full compare"],
        },
        "Online cost is not offline cost",
        [
          "One check costs 1000 units. The account fails 5 times and locks. Online work is 5000 units.",
          "A stolen copy of the verifier is not stopped by that lock. The slow function still costs 1000 units per guess somewhere else, but the counter never runs.",
          "You write both sentences in the spec. You add a factor whose signature must name your origin, so a forwarded 6-digit code is not the whole story.",
        ],
        [
          {
            prompt: "Each check costs 1000 units and the lock trips at 5 failures. What is the online work for those failures, and does the lock cap guesses against a stolen verifier?",
            answer: "Online work is 5000 units, because 5 times 1000 is 5000. The lock does not cap offline guesses. A stolen verifier can be tested without your counter, which is why the slow function and a second factor still matter.",
          },
          {
            prompt: "Your spec uses a 6-digit code with a 30-second step, a 4-byte compare that returns early, and no origin check. Which two controls are missing or weak?",
            answer: "The compare must visit all 4 bytes before it decides, and the second factor should bind a signature to your origin. A 30-second code can be forwarded inside its step, so the early-exit compare and the unbound code are both unfinished.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-716",
    lectures: [
      lec(
        "l1",
        "Three blocks and a broken link",
        [
          "A chain stores, in each block, the hash of the block before it. You can see the mechanism on a toy of 3 blocks. Block 2 stores the hash of block 1. Block 3 stores the hash of block 2. If you change 1 byte in block 1, that hash no longer matches the parent stored in block 2. The chain is no longer intact, even though block 3 still points at the old block 2.",
          "To make every link match after that edit, you must recompute all 3 blocks. Block 2 has to store the new parent hash, which changes block 2's own hash, which forces block 3 to store a new parent too. Copying the old block 3 forward does not hide the edit. The hash is the mechanism, and the number you recompute is the cost. A chain does not make a false block true. It makes a quiet edit expensive.",
        ],
        {
          kind: "pipeline",
          caption: "Links in a three-block toy",
          stages: ["Write block 1", "Store its hash in block 2", "Store block 2 hash in block 3", "Recompute all three after an edit"],
        },
        "Change one byte, recompute three",
        [
          "You have blocks 1, 2, and 3. Block 2 stores the hash of block 1. Block 3 stores the hash of block 2.",
          "You flip one byte in block 1. The parent field in block 2 is now wrong. Block 3 still matches the unchanged block 2.",
          "You recompute block 1, then block 2, then block 3. That is 3 blocks. Stopping after block 1 leaves a broken link.",
        ],
        [
          {
            prompt: "You change a byte in block 1 of a 3-block chain and you do not touch block 2 or block 3. Which link fails?",
            answer: "The link from block 2 to block 1. Block 2 still stores the old hash. Block 3's link to the unchanged block 2 still matches. The chain as a history of block 1 is not intact.",
          },
          {
            prompt: "You want every link to match after replacing block 1. How many blocks must you recompute?",
            answer: "3. Block 1 changes, block 2 must store the new hash, and block 3 must store block 2's new hash. Leaving either later block untouched leaves a broken parent.",
          },
        ],
      ),
      lec(
        "l2",
        "A target and an expected number of tries",
        [
          "Proof of work asks you to find a nonce such that the hash of the header falls under a target. In the toy, the first 4 bits of the hash must be 0. If the hash behaves evenly, 1 try in 16 succeeds, so one block expects 16 tries. You do not pick the nonce by taste. The search is the cost that makes a rewrite expensive.",
          "Two independent blocks at that target expect 32 tries, because 16 plus 16 is 32. A header that misses the target is not a finished block. Difficulty is a knob on the target. If you move the toy from 4 leading zero bits to 8, the expected tries for one block jump from 16 to 256. You should compute that change yourself.",
        ],
        {
          kind: "flow",
          caption: "Search until the hash fits",
          steps: ["Set a 4-bit target", "Hash header plus nonce", "Stop when 1 of 16 hits"],
        },
        "Expected tries for two blocks",
        [
          "The toy target needs 4 leading zero bits. One try succeeds with probability 1 in 16.",
          "The expected search for block A is 16 hashes. Block B, independent and at the same target, expects 16 more.",
          "Together you budget 32 hashes on average. A header that misses the target is not a finished block.",
        ],
        [
          {
            prompt: "The target needs 4 leading zero bits, so 1 try in 16 works. What is the expected number of tries for 3 independent blocks?",
            answer: "48. Each block expects 16 tries, and 3 times 16 is 48. A header that does not meet the target does not count as one of the successes.",
          },
          {
            prompt: "You tighten the toy target from 4 leading zero bits to 8. What happens to the expected tries for one block?",
            answer: "They rise from 16 to 256. Four zero bits leave 1 success in 16. Eight zero bits leave 1 success in 256. Difficulty is that change in the target.",
          },
        ],
      ),
      lec(
        "l3",
        "A coin you must not spend twice",
        [
          "An unspent-output design treats coins as specific outputs, not as a balance number. A transaction consumes 1 or more outputs and creates new ones. The rule you enforce is simple to state: an output may be consumed once. If two transactions both name output 7, you accept at most 1 of them. The other is a double spend, and every honest node drops it. The chain is the public log of which consumption won.",
          "An account design stores a balance and a sequence number instead. Account 4 with balance 10 can send 3 only if 3 is not greater than 10, and only if the sequence number is the next one you expect. You reject a second transaction that reuses the same sequence number. The two designs differ in what you store, not in the goal. Either way you need a total order so two conflicting spends cannot both settle.",
        ],
        {
          kind: "pair",
          caption: "Two ways to record coins",
          leftTitle: "Unspent outputs",
          rightTitle: "Accounts",
          left: ["Spend a named output once", "Output 7 cannot be reused", "Conflicts are explicit"],
          right: ["Balance plus a sequence", "Reject a reused sequence", "Overdrafts fail the check"],
        },
        "Output 7 named twice",
        [
          "Output 7 is worth 5 units and is still unspent. Transaction A consumes it and creates a new output.",
          "Transaction B also names output 7. You already accepted A, so B fails the once-only rule.",
          "On an account version of the same story, balance 10 and a repeated sequence number, the second transaction fails the sequence check even if the amount is only 3.",
        ],
        [
          {
            prompt: "Output 7 is consumed by an accepted transaction. A second transaction names output 7 again. What do you do?",
            answer: "You reject the second transaction. An output may be consumed once. The chain records which consumption won. You do not merge the two spends.",
          },
          {
            prompt: "Account 4 has balance 10 and the next sequence number is 2. A transaction sends 3 with sequence 2, and another sends 3 with sequence 2 again. Which one can settle?",
            answer: "Only one. The first valid transaction with sequence 2 can move 3, leaving balance 7. The second reuses sequence 2, so you reject it even though 3 is under the old balance.",
          },
        ],
      ),
      lec(
        "l4",
        "Confirmations are a policy, not a proof",
        [
          "A fork is two valid blocks that claim the same parent. Nodes follow the chain with the most accumulated work. A confirmation count is how many blocks sit on top of the one you care about. In a toy where a block takes 10 minutes, 6 confirmations cost 60 minutes of block time. That wait is a policy. It is not a theorem that no competing fork exists.",
          "You do not call a payment final because a wallet printed 6. If one party can produce more work than the honest side, they can grow an alternate chain and overtake those 6 blocks. You state finality as an assumption about hash power plus a confirmation depth you chose. For a 3-block toy with no extra work on top, the tip has 0 confirmations. Depth is a count, and you should be able to point at the blocks you counted.",
        ],
        {
          kind: "layers",
          caption: "Depth is blocks built on top",
          rows: ["Your block at the start", "Later blocks add depth", "Six deep is 60 minutes here", "Most work picks the fork"],
        },
        "Six blocks at ten minutes",
        [
          "Your transaction sits in block 1. Five more blocks are built on it, so you count 5 confirmations so far, not 6.",
          "Each block in this toy represents 10 minutes. Five blocks are 50 minutes. You are 10 minutes short of a 6-confirmation policy.",
          "A competing fork with less work does not replace your chain. A competing fork with more work does, policy number or not.",
        ],
        [
          {
            prompt: "In the toy, a block is 10 minutes and your policy is 6 confirmations. How many minutes is that wait?",
            answer: "60. Six times 10 is 60. The wait is a policy about depth. It does not prove that a heavier fork cannot appear later.",
          },
          {
            prompt: "The tip contains your transaction and nothing is built on it. How many confirmations do you have?",
            answer: "0. Confirmations are blocks built on top of the block you care about. The tip itself does not count as one of them in this definition.",
          },
        ],
      ),
      lec(
        "l5",
        "A contract is a state machine",
        [
          "A contract is code plus state that every node runs. You specify the transition before you admire the syntax. For a transfer, you subtract amount M from the sender and add M to the receiver in one step, and you reject the step if the balance would go negative. With balances 10 and 1, a transfer of 4 ends at 6 and 5. A transfer of 11 from the account holding 10 never applies.",
          "You test that spec the way you test any state machine: name the start state, the call, and the end state. Two calls that both spend the same 10 must not both succeed. The chain gives you ordered execution and a public end state. It does not invent a spec you forgot to write. If the code adds M twice and subtracts it once, the chain will faithfully repeat that bug on every node.",
        ],
        {
          kind: "flow",
          caption: "One transfer, one transition",
          steps: ["Read both balances", "Reject if M does not fit", "Subtract M and add M"],
        },
        "Balances ten and one",
        [
          "Start state: account A holds 10, account B holds 1. The call asks to move 4 from A to B.",
          "Four is not greater than 10, so the transition applies. End state: A holds 6, B holds 5.",
          "A second call asks to move 11 from A. Eleven is greater than 6, so you reject it and the state stays 6 and 5.",
        ],
        [
          {
            prompt: "A holds 10 and B holds 1. You apply a valid transfer of 4. What are the two balances afterward?",
            answer: "A holds 6 and B holds 5. You subtract 4 from 10 and add 4 to 1 in the same transition. The pair sums to 11 before and after.",
          },
          {
            prompt: "A holds 6 after that transfer. A call tries to move 11 from A to B. What is the end state?",
            answer: "Still 6 and 5. The spec rejects a transition that would make the sender negative, so the call does not apply. The chain recording the rejection is not the same as moving the coins.",
          },
        ],
      ),
      lec(
        "l6",
        "What the chain does not know",
        [
          "A chain can order transactions and check the proofs you actually programmed. It does not know the weather, a delivery, or the contents of a box. If your contract pays out when a shipment arrives, some oracle has to write that fact into state. You are trusting that writer for 1 fact the chain cannot see. Naming the oracle is part of the spec. Pretending the chain observed the truck is not.",
          "You also do not get confidentiality from replication. Every node that runs the contract sees the balances in the toy transfer, both the 10 and the 4. Hiding an input takes a different mechanism, and this course's foundation half does not magically add it. If one party can outwork everyone else, your confirmation depth can be replaced. You list these 3 limits next to any claim you make: oracles, visibility, and hash power.",
        ],
        {
          kind: "pair",
          caption: "Checks versus outside facts",
          leftTitle: "The chain can check",
          rightTitle: "The chain cannot see",
          left: ["Order of transactions", "Balance rules you coded", "Links and work targets"],
          right: ["A truck or a delivery", "Hidden inputs by default", "A future heavier fork"],
        },
        "A payout that waits on a truck",
        [
          "The contract releases 10 units when a flag becomes 1. Nothing in the block header contains the truck.",
          "An oracle account submits the flag. You name that account in the spec as the trusted writer of 1 fact.",
          "Every node sees the flag and the 10. You do not claim the payment was private, and you do not claim a deeper fork is impossible.",
        ],
        [
          {
            prompt: "Your contract pays 10 units when a shipment arrives, and no oracle is named. What is the hole?",
            answer: "The chain cannot see the shipment. Some account has to write that fact, and you must name that oracle. Without it, the payout condition is a story, not a transition you can run.",
          },
          {
            prompt: "The transfer of 4 from a balance of 10 is replicated to every node. Which of the 3 limits did you fail if you promised the amount stayed hidden?",
            answer: "Visibility. Replication shows the balances and the amount. Oracles and hash power are separate limits. Hiding inputs is a different mechanism from consensus.",
          },
        ],
      ),
      lec(
        "l7",
        "An escrow with an explicit rule",
        [
          "You can specify a tiny escrow without waving at a platform. The buyer locks 9 units in the contract. Release to the seller requires 2 of 3 signatures: buyer, seller, and arbiter. Refund to the buyer uses the same 2-of-3 rule. A single signature moves 0 units. The state machine is small: locked, released, or refunded, and the terminal states do not accept another spend.",
          "You write the invariant in one line: the contract's balance is 9 until a 2-of-3 release or refund, and then it is 0. You test the boring paths. Buyer plus seller releases. Buyer plus arbiter refunds. Seller alone does nothing. Arbiter alone does nothing. Two releases in a row must fail the second time. If the code pays 9 and leaves 9, the invariant is already false and the chain will keep the bug.",
        ],
        {
          kind: "pipeline",
          caption: "Lock, then a two-of-three spend",
          stages: ["Lock nine units", "Collect two signatures", "Pay seller or buyer", "Reject a second spend"],
        },
        "Nine units, two signatures",
        [
          "The buyer locks 9. The contract balance is 9. Seller alone submits a release and you move 0.",
          "Buyer and seller both sign a release. You pay 9 to the seller and set the contract balance to 0.",
          "A second release, even with all 3 signatures, fails. The terminal state does not spend again.",
        ],
        [
          {
            prompt: "The contract holds 9. Only the seller signs. How many units move, and what is the contract balance?",
            answer: "0 units move, and the balance stays 9. Release needs 2 of 3 signatures. One signature is not a transition.",
          },
          {
            prompt: "Buyer and arbiter sign a refund, so the buyer receives 9 and the contract holds 0. What happens if they submit the same refund again?",
            answer: "The second call fails. The state is already terminal, and the invariant says the balance is 0 after one refund. A second spend would break that invariant.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now claim a chain does",
        [
          "You can now say what a chain guarantees and stop there. On a toy of 3 blocks, an edit to block 1 forces you to recompute all 3 if every parent hash must match. A 4-bit work target expects 16 tries per block, so the rewrite expects 48 tries. You can reject a second spend of output 7. Six confirmations at 10 minutes is a 60-minute policy, not a proof.",
          "You can also write a spec past a bare transfer. The escrow locks 9 units, moves them only on 2 of 3 signatures, and rejects a second spend. You name any oracle, you admit the state is visible, and you treat hash power as an assumption. If you cannot point at the invariant and at the 3 links you would recompute, you are not ready to claim the application. The chain will run the code you wrote, including the mistake.",
        ],
        {
          kind: "layers",
          caption: "Claims you can now support",
          rows: ["Parent hashes bind history", "Work prices a rewrite", "Spend rules are explicit", "Oracles stay named"],
        },
        "Rewrite cost on the toy chain",
        [
          "Someone wants to replace block 1 and keep a valid 3-block chain. You recompute blocks 1, 2, and 3.",
          "Each block expects 16 hashes under the 4-bit target. Three blocks expect 48 hashes.",
          "That budget is only the work. It does not make an outside event true, and it does not hide the 9 units in an escrow.",
        ],
        [
          {
            prompt: "A 3-block toy uses a target of 4 leading zero bits, so each block expects 16 tries. You must recompute every block so the parent links match after an edit to block 1. What is the expected number of tries?",
            answer: "48. You recompute all 3 blocks, and 3 times 16 is 48. Fixing only block 1 leaves the parent in block 2 wrong, so the cheaper number 16 is not enough.",
          },
          {
            prompt: "Your escrow holds 9 units and your policy waits 6 confirmations at 10 minutes each. Seller alone signs a release. What moves, and how long was the confirmation policy?",
            answer: "0 units move, because release needs 2 of 3 signatures. The confirmation policy is 60 minutes, because 6 times 10 is 60. Depth does not relax the signature rule, and one signature does not spend the 9.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-749",
    lectures: [
      lec(
        "l1",
        "Write the function before the protocol",
        [
          "You start applied cryptography by writing the function you want, not by naming a product. Two parties hold inputs x and y. You want both to learn f(x, y) and nothing else you can avoid. For a toy, x is 4, y is 1, and f is the sum, so the output is 5. If either party also learns the other's input, you computed a different function, the pair, and you should say so.",
          "You name the adversary before you pick a tool. A semi-honest party follows the messages and tries to read more. A malicious party can send a wrong message. A definition that covers only the first does not cover the second. You also name the leak you accept, such as a circuit depth of 100 gates. A protocol with no function and no leak list is not applied yet.",
        ],
        {
          kind: "flow",
          caption: "Pin the goal, then the leak",
          steps: ["Write f of the inputs", "Name who learns the output", "List the accepted leak", "Only then pick a tool"],
        },
        "Sum five, or the whole pair",
        [
          "Party A holds 4 and party B holds 1. The agreed function is addition. The honest output is 5.",
          "A transcript that also shows B the value 4 computed the pair, not the sum. You reject that transcript for this goal.",
          "You write the leak you do accept: both parties learn that the output is 5, and they learn that two inputs were used. They do not learn the other input.",
        ],
        [
          {
            prompt: "A holds 4, B holds 1, and f is addition. The protocol reveals 4 to B and then prints 5. Did you compute f?",
            answer: "No. f returns only 5. Revealing 4 means you computed something closer to the pair (4, 5). The extra input is not an allowed leak unless you wrote it down as one.",
          },
          {
            prompt: "Your notes name a product and never name f or the adversary. What is missing?",
            answer: "The function, the leak list, and whether the other party is only curious or can send bad messages. A product name does not answer any of those, even if the circuit has 100 gates.",
          },
        ],
      ),
      lec(
        "l2",
        "Commit, then open",
        [
          "A commitment lets you bind to a value now and open it later. The toy uses a hash: you pick a 4-bit pad and a 4-bit value, and the commitment is the hash of pad followed by value. Opening means you send both parts, and the other person hashes them again. Binding means you should not find a second value that opens the same commitment. Hiding means the commitment alone should not show the value.",
          "You do not ship the toy. A 4-bit pad has only 16 choices, so the hiding is a sketch. The mechanism is still the one you need: the pad is random, and the open is checked by hashing again. A real pad is long enough that guessing is not the exercise. If you can open the same commitment to 2 values, binding has already failed.",
        ],
        {
          kind: "pair",
          caption: "Hide now, open later",
          leftTitle: "Commit",
          rightTitle: "Open",
          left: ["Random 4-bit pad", "Hash pad and value", "Send only the hash"],
          right: ["Send pad and value", "Recompute the hash", "Reject a mismatch"],
        },
        "Sixteen pads, one value",
        [
          "You choose a 4-bit pad and a 4-bit value. There are 16 possible pads. You send the hash and keep both parts.",
          "Later you open by sending the pad and the value. The checker hashes them and compares to the stored hash.",
          "A second value with some pad that hits the same hash would break binding. With a tiny toy hash you do not claim that cannot happen.",
        ],
        [
          {
            prompt: "The pad is 4 bits. How many pads exist, and why is that not a real hiding parameter?",
            answer: "There are 16 pads. A search of 16 is small, so this toy only shows commit-then-open. You would not ship a 4-bit pad and call the value hidden.",
          },
          {
            prompt: "You open with a pad and a value, and the recomputed hash does not match. What do you do?",
            answer: "You reject the opening. The check is equality with the commitment. A mismatched recompute is not a successful open, even if the value looks plausible.",
          },
        ],
      ),
      lec(
        "l3",
        "Convince without handing over the witness",
        [
          "A zero-knowledge proof is a protocol for a statement and a witness. The statement might be that a commitment opens to an even 4-bit value. The witness is the pad and the value. Completeness says an honest prover convinces the verifier. Soundness says a prover with no witness convinces you only with tiny probability. Zero knowledge says the transcript can be simulated without the witness, so the verifier learns the statement and not the 4 bits.",
          "You keep the three properties apart when you read a design. A proof that sends the witness can be complete and sound, but it is not zero knowledge. In the even-value story the verifier may learn 1 bit, the parity, and not the other bits. If the transcript shows the pad, you leaked the witness. A simulator with no witness is the test that those bits stayed hidden.",
        ],
        {
          kind: "layers",
          caption: "Three properties, kept apart",
          rows: ["Complete: honest proof works", "Sound: no witness, tiny chance", "Zero knowledge: simulate it"],
        },
        "Parity without the four bits",
        [
          "The statement is that the committed 4-bit value is even. That is 1 bit of information you are willing to reveal.",
          "The prover has the pad and the value. Sending both would let the verifier check, and would also reveal all 4 bits. That fails zero knowledge.",
          "A simulator that can build a matching transcript with no witness is the reason you may claim the extra bits stayed hidden. You still need a soundness argument.",
        ],
        [
          {
            prompt: "The prover sends the 4-bit value and the pad, and the verifier checks the commitment and the parity. Which property fails?",
            answer: "Zero knowledge. The check can be complete and sound, but the transcript contains the witness. The verifier was only supposed to learn 1 bit, the parity.",
          },
          {
            prompt: "A simulator with no witness produces a transcript the verifier cannot tell from a real one. What does that support, and what does it not replace?",
            answer: "It supports the zero-knowledge property. It does not replace soundness. A prover with no witness must still have only a tiny chance of convincing you.",
          },
        ],
      ),
      lec(
        "l4",
        "A short proof for a long circuit",
        [
          "You compile the statement into a circuit, or an equivalent set of constraints, and a prover who knows the witness produces a short proof. The verifier checks the proof and does not replay every gate. A classroom size makes the split obvious: the circuit has 10000 gates, and the proof stays under 1 kilobyte. The verifier's work stays small compared with redoing those 10000 gates. That asymmetry is the point of a succinct argument.",
          "You still verify the statement, not a vibe. The proof shows that some witness satisfies the circuit you fixed in a public setup or in the verifier key. If you encoded the wrong circuit, a valid proof checks the wrong thing. Setup, when the scheme needs one, is a trust step you name: 1 toxic value thrown away, or a ceremony you can audit. You do not skip that sentence because the proof is short.",
        ],
        {
          kind: "pipeline",
          caption: "Circuit, proof, then one check",
          stages: ["Fix the circuit in public", "Prover uses the witness", "Proof stays under 1 kilobyte", "Verifier skips the 10000 gates"],
        },
        "Ten thousand gates, one short proof",
        [
          "The statement compiles to 10000 gates. Re-running them is the cost you want the verifier to avoid.",
          "The prover holds the witness and emits a proof under 1 kilobyte. The witness is not attached.",
          "The verifier checks the proof against the circuit key. A pass means this circuit accepted, not some other circuit you meant to write.",
        ],
        [
          {
            prompt: "The circuit has 10000 gates and the proof is under 1 kilobyte. What work does the verifier skip, and what do they still bind the proof to?",
            answer: "They skip replaying the 10000 gates. They still bind the proof to the circuit in the verifier key. A short proof of the wrong circuit is a valid proof of the wrong statement.",
          },
          {
            prompt: "The scheme needs a setup value that must be deleted. You keep the value because the proof is small. What did you add?",
            answer: "A trusted party who can forge, namely anyone who still holds that 1 setup value. Shortness does not remove the setup obligation. You name the ceremony or you do not claim the soundness you think you have.",
          },
        ],
      ),
      lec(
        "l5",
        "Outsource the work, keep the check",
        [
          "Verifiable computation lets you send an input, let a server do the work, and check a proof instead of redoing it. Take a function that sums 8 numbers. The server returns the sum and a proof that the sum matches those inputs. You check the proof. If the check fails, you discard the sum, even when the number looks familiar.",
          "You still hold the inputs you care about, or a commitment to them, and you run the verifier. If checking costs more than adding the 8 numbers, you picked a small example: the savings show up on a heavy query, not on a handful of additions. The server learns inputs you sent in the clear. You have not bought privacy yet.",
        ],
        {
          kind: "flow",
          caption: "Delegate, prove, then accept",
          steps: ["Send the input", "Server returns output and proof", "Check the proof", "Drop the output on failure"],
        },
        "Eight numbers and a sum",
        [
          "The client holds 8 numbers that add to 36. It asks the server to compute the sum.",
          "The server returns 36 and a proof tied to those inputs. The client runs the verifier and accepts.",
          "A second server returns 35 with a proof that does not check. The client keeps 36 from the first result only if that proof passed, and it drops 35.",
        ],
        [
          {
            prompt: "The server returns 35 for inputs that sum to 36, and the proof check fails. Which number do you keep?",
            answer: "Neither from that response. You discard 35 because the check failed. The correct sum is 36 only if some proof for these inputs actually verifies. A familiar number is not a check.",
          },
          {
            prompt: "You sent 8 inputs in the clear and verified the sum. What privacy did you get?",
            answer: "None for those inputs. The server saw them. Verifiable computation checks correctness. Hiding the inputs is a separate goal you have not specified.",
          },
        ],
      ),
      lec(
        "l6",
        "Add shares without showing the secret",
        [
          "Additive sharing splits a secret so that each party holds noise and the noises sum to the secret. In the toy, values live modulo 10. You want secret 7. You draw share a = 3 and set share b = 4, because 3 plus 4 is 7. Party A sees only 3. Party B sees only 4. Either share alone is compatible with any secret, as long as the other share adjusts. Both shares together reconstruct 7.",
          "Addition of two secrets is local. One secret is split as 3 and 4, another as 1 and 2. Each party adds its shares: 3 plus 1 is 4, and 4 plus 2 is 6. The new shares sum to 10, which is 0 modulo 10, matching 7 plus 3. Multiplication is not local. You need a pre-shared triple and a short exchange. You do not skip that step.",
        ],
        {
          kind: "pipeline",
          caption: "Split, add locally, reconstruct",
          stages: ["Pick share a at random", "Set b so a plus b matches", "Add shares on each side", "Open only when you should"],
        },
        "Secret seven, shares three and four",
        [
          "You split 7 into a = 3 and b = 4 modulo 10. Each party stores one share.",
          "A second secret 3 is split into 1 and 2. Local sums are 3 plus 1 = 4, and 4 plus 2 = 6.",
          "You open 4 and 6 only when the function says the output may be revealed. They sum to 10, which is 0 modulo 10, the same as 7 plus 3.",
        ],
        [
          {
            prompt: "Shares are a = 6 and b = 8, modulo 10. What secret do they reconstruct?",
            answer: "4. Six plus 8 is 14, and 14 modulo 10 is 4. You need both shares. One of them is not enough.",
          },
          {
            prompt: "Secrets 7 and 3 are shared as (3, 4) and (1, 2) modulo 10. What are the local sums, and what output do they open to?",
            answer: "Local sums are 4 and 6. They open to 0 modulo 10, because 4 plus 6 is 10. That matches 7 plus 3, which is also 10, or 0 modulo 10.",
          },
        ],
      ),
      lec(
        "l7",
        "Hide a record inside a training step",
        [
          "Private learning names which object stays hidden. If 4 clients each hold a gradient and you only need the sum, you can add the gradients with shares so the server sees the sum and not one client's vector. That is secure computation applied to an aggregate. It is not the same as hiding the final model. The model may still memorize a record. You do not let the word private do both jobs.",
          "Differential privacy is the other mechanism: you add noise so that one record moves the released numbers only inside a budget you set. You pick epsilon before you train. A smaller epsilon is a tighter promise and usually more noise. An epsilon of 1 is a budget you spend when you release a result, not a label on a slide. It limits influence. It does not hide a person who is the only member of a group of 1.",
        ],
        {
          kind: "pair",
          caption: "Two different privacy goals",
          leftTitle: "Hidden gradients",
          rightTitle: "Bounded influence",
          left: ["Four clients share a sum", "Server sees the aggregate", "The model can still memorize"],
          right: ["Noise under a budget", "Epsilon 1 is one budget", "A group of 1 can stick out"],
        },
        "Four gradients, one sum",
        [
          "Four clients hold gradients. You want the server to learn the sum and not client 2's vector.",
          "Each client shares its gradient. Local addition produces shares of the sum. The server opens only the sum.",
          "You still have not set epsilon. If you later release a model, you pick epsilon, here 1, and you spend it on that release. The aggregate protocol did not spend it for you.",
        ],
        [
          {
            prompt: "Four clients sum gradients through shares, and the server opens only the sum. Does client 2's gradient stay hidden from the server?",
            answer: "Yes, under the sharing assumption: the server sees the sum, not client 2's vector. The final model is a different object and may still memorize a record. This protocol did not set epsilon.",
          },
          {
            prompt: "You release a model under epsilon 1 and one person is the only member of a group. What did epsilon 1 not do?",
            answer: "It did not make that person blend into a crowd. Epsilon 1 bounds how much one record can move the released numbers. A group of 1 can still stick out. You had to pick the budget before release.",
          },
        ],
      ),
      lec(
        "l8",
        "A private computation you can now specify",
        [
          "You can now specify a private computation without treating a chain or a model as magic. You write the function, the leak, and the adversary. You can commit and open by recomputing, and you know a 4-bit pad has only 16 choices. You can ask for a proof that is complete, sound, and simulated. A proof under 1 kilobyte can stand in for a circuit of 10000 gates, and you reject a sum whose proof fails.",
          "You can also split a secret modulo 10, add shares locally, and open only the output. Shares 6 and 8 reconstruct 4, because 14 modulo 10 is 4, and one share fixes nothing. On a learning task you can sum 4 clients' gradients, and you separately spend epsilon 1 if you release a model. Put a proof on a chain only when the contract checks this statement. Say what the verifier learns.",
        ],
        {
          kind: "layers",
          caption: "The spec you can now write",
          rows: ["Function, leak, adversary", "Commit, prove, or share", "Check before you accept", "Name epsilon if you release"],
        },
        "Shares, then a checked release",
        [
          "Two parties hold shares 6 and 8 modulo 10. Opened together they reconstruct 4. Opened alone, either share fits every secret.",
          "They also want a public checker to accept the result. They produce a short proof for the circuit that says the opened sum is 4, and the checker does not receive the shares.",
          "If a model is released afterward, you set epsilon to 1 up front. The proof check does not choose that budget.",
        ],
        [
          {
            prompt: "Shares modulo 10 are 6 and 8. You commit to each share and open both, and a proof check for the sum succeeds. What is the reconstructed secret, and why was one share not enough?",
            answer: "The secret is 4, because 6 plus 8 is 14 and 14 modulo 10 is 4. One share is not enough: the missing share can be any of 10 digits, so the secret is not fixed until both open. The proof must be for that sum, not for a different circuit.",
          },
          {
            prompt: "The same result is a model release, and you never set epsilon, but the proof was under 1 kilobyte for 10000 gates. What is still unspecified?",
            answer: "The privacy budget. A short proof shows the circuit accepted. It does not add noise or set epsilon. If you meant epsilon 1, you have to choose it before release and say so.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-765",
    lectures: [
      lec(
        "l1",
        "Name the layer, then the defense",
        [
          "You place a network threat on a layer before you pick a tool. This course uses 4 layers: link, internet, transport, and application. A frame that never should have entered the switch is a link problem. A packet with a lying source address is an internet problem. A session that replays an old record is a transport or record-layer problem. A password sent to the wrong name is an application problem. One product rarely covers all 4.",
          "You write the defense next to the layer in the same row. Filtering a source prefix does not check a name in a certificate. A certificate check does not stop a host on a switch port it should not use. You will collect 4 defenses, one habit per layer, and you will refuse a diagram that marks every layer done because 1 of them is on.",
        ],
        {
          kind: "layers",
          caption: "Four layers, four questions",
          rows: ["Link: who is on the segment", "Internet: is the source prefix real", "Transport: is the session fresh", "Application: is the name right"],
        },
        "One symptom, one layer",
        [
          "A laptop appears on a switch port you reserved for servers. You mark that as link, not as a certificate bug.",
          "A packet arrives claiming a source prefix that does not belong on that interface. You mark that as internet.",
          "You do not fix either one by rotating an application password. That control sits on a different layer.",
        ],
        [
          {
            prompt: "A packet's source prefix is wrong for the interface, and the application password is strong. Which layer failed, and does the password fix it?",
            answer: "The internet layer failed. A strong application password does not check the source prefix. You need a defense on the layer where the lie happened.",
          },
          {
            prompt: "You turned on one defense and marked all 4 layers done. What is the mistake?",
            answer: "A single control does not cover link, internet, transport, and application. You name a defense per layer. One row being green is not the other three.",
          },
        ],
      ),
      lec(
        "l2",
        "A port that stays shut",
        [
          "On the link, you do not let a port forward traffic just because a cable fits. The mechanism is port authentication: the switch leaves the port unauthorized until the endpoint completes a check. Only then does the port join the segment. A second mechanism encrypts frames between 2 neighbors, so a tap sees ciphertext. You can require both. They do different jobs.",
          "You bind the check to the port, not to a friendly hostname the endpoint claims. If port 12 authenticates as a printer, you do not let it talk like a laptop for the rest of the day without a new check. When the link drops, you clear the authorization. A guest network that shares the same layer-2 segment as the servers has already skipped this lecture. You would rather run 2 segments than trust a label on the wall.",
        ],
        {
          kind: "flow",
          caption: "Open a port only after a check",
          steps: ["Leave the port unauthorized", "Check the endpoint", "Authorize that port", "Clear it when the link drops"],
        },
        "Port twelve and a printer",
        [
          "Port 12 comes up. The switch forwards nothing yet. The endpoint identifies as a printer and the account check succeeds.",
          "You authorize port 12 for the printer role only. A later frame that needs a laptop role does not ride that authorization.",
          "The cable drops. You clear port 12. The next link has to pass the check again, even if the hostname string matches.",
        ],
        [
          {
            prompt: "Port 12 authenticated as a printer, then the link dropped. What is the port's state before a new check?",
            answer: "Unauthorized. You clear the authorization when the link drops. The old success does not stick to the port, and the hostname string is not a check.",
          },
          {
            prompt: "You encrypt frames on the segment but any cable can join it. What did you skip?",
            answer: "Port authentication. Encryption hides frames from a tap. It does not decide which endpoint may join. You can require both, and one does not replace the other.",
          },
        ],
      ),
      lec(
        "l3",
        "Drop a source that cannot belong here",
        [
          "You filter packets at the edge by the prefix that interface is allowed to originate. A /24 means the first 3 numbers of the address must match the interface prefix. On an interface that owns 10.1.4.0/24, a packet from 10.1.4.20 may pass the source check. A packet from 10.1.9.20 may not, because the third number is 9, not 4. You drop it. You do not forward it and hope a later box is stricter.",
          "You apply the rule where a lying source is cheap. Ingress on a customer interface drops sources outside that customer's prefix. You keep an allow entry per interface, not one flat list. If interface 2 drops 40 packets in a minute, you can see the rule work. The filter does not check a certificate or a session number. It only answers the source question.",
        ],
        {
          kind: "pipeline",
          caption: "Ingress check on one interface",
          stages: ["Read the interface prefix", "Compare the first 3 numbers", "Drop a mismatch", "Log the drop count"],
        },
        "Prefix 10.1.4.0/24",
        [
          "Interface 2 is allowed to originate 10.1.4.0/24. A packet from 10.1.4.20 matches on 10, 1, and 4.",
          "A packet from 10.1.9.20 fails on the third number. You drop it on interface 2 and you do not route it onward.",
          "The counter on interface 2 records the drop. Forty such drops in one minute means the rule is firing, not that the session layer was checked.",
        ],
        [
          {
            prompt: "Interface 2 owns 10.1.4.0/24. Which source do you drop: 10.1.4.20 or 10.1.9.20?",
            answer: "You drop 10.1.9.20. A /24 requires the first 3 numbers to match, and the third number is 9 instead of 4. You may pass 10.1.4.20 on this check alone.",
          },
          {
            prompt: "The filter drops 40 mismatched packets in one minute. What question did those drops answer?",
            answer: "Whether the source prefix belonged on that interface. They did not check a certificate, a name, or whether a session number was fresh.",
          },
        ],
      ),
      lec(
        "l4",
        "What the handshake actually binds",
        [
          "A TLS 1.3 handshake does 3 jobs in 1 round trip for a new session: it authenticates the server, it agrees on keys, and it protects application bytes. The certificate binds a key to a name. You check that name, the chain up to an anchor you already hold, and the dates. A self-signed certificate you have never pinned is not an anchor.",
          "You do not treat a padlock as the whole check. If you asked for pay.example and the certificate names other.example, you stop, even when the chain is valid. The handshake does not filter source prefixes. It binds this session to 1 name and 1 key. When you resume, you still use the ticket rules, not a picture of a lock icon.",
        ],
        {
          kind: "flow",
          caption: "Checks inside one handshake",
          steps: ["Match the intended name", "Chain to a held anchor", "Check the certificate dates", "Then protect the bytes"],
        },
        "The name pay.example",
        [
          "You meant to reach pay.example. The handshake offers a certificate whose name is other.example.",
          "The chain leads to an anchor you hold, and the dates are valid. The name is still wrong, so you stop.",
          "You do not send the password on that session. A later handshake that actually names pay.example can proceed through the 1 round trip.",
        ],
        [
          {
            prompt: "The certificate chains to an anchor you hold, the dates are valid, and the name is other.example. You wanted pay.example. Do you continue?",
            answer: "No. The name must match the name you meant to reach. A valid chain for a different name is a valid certificate for that other name, not for pay.example.",
          },
          {
            prompt: "How many round trips does a new TLS 1.3 session use in the handshake this lecture described, and what does that number not include?",
            answer: "1 round trip. That figure is the handshake shape, not a source-prefix filter and not a check of the human. You still verify name, anchor, and dates.",
          },
        ],
      ),
      lec(
        "l5",
        "A name you can check",
        [
          "DNS answers are network data, and an unsigned answer is only advice. DNSSEC adds signatures so you can check a response against a chain that ends at a root anchor you already hold. You validate the signature on the record you use. A failure is a failed lookup. You do not fall back to an unsigned answer and call the 1 check done.",
          "Absence has a signed form too. A bare error is not proof the name is missing. A signed denial covers a range, and you check that your query sits in that range. In a toy zone of 8 names, a denial for names 3 through 5 does not cover name 7. You also refuse a signature past its expiration.",
        ],
        {
          kind: "pipeline",
          caption: "Validate one signed answer",
          stages: ["Start from the root anchor", "Check each signature", "Cover the asked name", "Reject a stale signature"],
        },
        "A denial that covers the wrong gap",
        [
          "The toy zone has 8 names. You asked for name 7. The response is a signed denial whose range is names 3 through 5.",
          "The signature checks, and the anchor is one you hold. The range does not include 7, so this denial does not answer you.",
          "You do not fall back to an unsigned error. You treat the lookup as failed until a denial or a record actually covers name 7.",
        ],
        [
          {
            prompt: "A signed denial covers names 3 through 5 in a zone of 8. You asked for name 7. Is the name proven absent?",
            answer: "No. The range does not include 7. A valid signature on the wrong gap is not a denial of name 7. You refuse an unsigned fallback.",
          },
          {
            prompt: "The signature is valid but past its expiration. What do you do?",
            answer: "You reject it. Expiration is part of the check. A signature that used to be good is not a reason to accept the record today.",
          },
        ],
      ),
      lec(
        "l6",
        "Default deny between segments",
        [
          "You segment the network so a compromised host cannot talk to every neighbor. The mechanism is a policy that denies by default and allows the flows you listed. The application segment may reach the database segment on port 5432 and on nothing else. A host in the application segment that tries port 22 on the database is denied. You would rather maintain 5 allow rules than run one flat segment with a password as your only control.",
          "You write the rule in the direction it applies. Inbound from the application segment is not the same rule as inbound from the internet. You log the denies. If rule 3 denies 100 flows in an hour, you look. A segment boundary does not replace the name check in the handshake. You still fail closed when the policy service is down.",
        ],
        {
          kind: "pair",
          caption: "Allow list versus a flat segment",
          leftTitle: "Default deny",
          rightTitle: "Flat segment",
          left: ["Allow port 5432 only", "Five rules you can read", "Deny the rest"],
          right: ["Any port to any neighbor", "Password is the only gate", "One host sees too much"],
        },
        "Port 5432 and a denied 22",
        [
          "The application segment may open port 5432 on the database segment. That is allow rule 1.",
          "The same host opens port 22 on the database. No allow rule matches. The default deny drops it.",
          "You log the deny under rule 3's counter. The handshake inside an allowed flow is still a separate check.",
        ],
        [
          {
            prompt: "The only allow rule from the application segment to the database is port 5432. A flow targets port 22. What happens?",
            answer: "You deny it. Default deny drops anything that is not on the allow list. Port 22 is not 5432, so the flow does not pass.",
          },
          {
            prompt: "You have 5 allow rules and the policy service fails. Do you forward traffic until it returns?",
            answer: "No. You fail closed. A segment boundary that opens when the policy service is down is a flat segment with extra steps. Logging denies does not mean allowing them.",
          },
        ],
      ),
      lec(
        "l7",
        "A window of fresh sequence numbers",
        [
          "You reject a replay by remembering what you already accepted. You accept a sequence number only when it is greater than the high-water mark and at most 4 above it. After you accept 20, the fresh values are 21, 22, 23, and 24. A repeat of 20 fails. A jump to 25 fails because it is more than 4 above 20.",
          "When you accept a fresh number, the mark moves to it. Accept 22 and the fresh set becomes 23, 24, 25, and 26. Old numbers stay old. The window does not check the source prefix or the certificate name. You still want those 2 checks. A receiver that forgets every old number will eventually take a replay.",
        ],
        {
          kind: "flow",
          caption: "Move the mark, shrink the past",
          steps: ["Remember the high-water mark", "Accept only the next 4", "Reject repeats and jumps", "Slide the mark forward"],
        },
        "High-water mark at twenty",
        [
          "The highest accepted sequence is 20. The fresh values are 21, 22, 23, and 24.",
          "A packet numbered 22 arrives. It is inside the window and above the mark, so you accept it. The mark is now 22.",
          "A repeat of 22 arrives. It is not greater than the mark, so you drop it. Fresh values are now 23 through 26.",
        ],
        [
          {
            prompt: "The high-water mark is 20 and the window is 4. Which of 20, 24, and 25 do you accept?",
            answer: "Only 24. It is greater than 20 and at most 4 above it. 20 is a repeat. 25 is more than 4 above 20, so both are rejected.",
          },
          {
            prompt: "You accept 22 with the mark at 20. What are the four fresh sequence numbers now?",
            answer: "23, 24, 25, and 26. The mark moves to 22, and you accept only numbers greater than 22 and at most 4 above it. 22 itself is no longer fresh.",
          },
        ],
      ),
      lec(
        "l8",
        "A flow you can now defend by layer",
        [
          "You can now defend a flow by naming the layer and the mechanism. A switch port stays shut until the endpoint checks out. A /24 filter compares the first 3 numbers. A handshake binds a name to a key in 1 round trip only after name, anchor, and dates check. A denial must cover the name you asked for. Between segments you deny by default.",
          "You can also stack those checks. You accept a sequence number only when it is above the high-water mark and at most 4 above it. A packet can pass the prefix test and still be a replay. A packet can fail the prefix test before the sequence check runs. Practice on 1 flow: write the layers, the allow rule, and the window. Say which check drops the packet.",
        ],
        {
          kind: "layers",
          caption: "Checks you can now stack",
          rows: ["Port authorization on the link", "Prefix filter at the edge", "Name check in the handshake", "Sequence window on the records"],
        },
        "Prefix first, then the window",
        [
          "Interface 2 owns 10.0.5.0/24. The high-water mark is 30, so fresh sequences would be 31, 32, 33, and 34.",
          "A packet from 10.0.9.8 with sequence 33 fails the prefix test on the third number. You drop it and you do not move the mark.",
          "A packet from 10.0.5.8 with sequence 33 passes the prefix test and sits in the window. You accept it and the mark becomes 33.",
        ],
        [
          {
            prompt: "Interface 2 owns 10.0.5.0/24, and the high-water mark is 30 with a window of 4. A packet from 10.0.9.8 has sequence 33. Which check fails, and what is the mark afterward?",
            answer: "The prefix check fails, because a /24 needs the first 3 numbers to match and the third number is 9, not 5. You drop the packet before the sequence window. The mark stays 30. Sequence 33 would have been fresh only if the prefix had matched.",
          },
          {
            prompt: "A later packet from 10.0.5.8 has sequence 33, the mark is still 30, and the name in the certificate is the name you wanted. Do you accept the sequence, and what are the fresh values after you do?",
            answer: "Yes. The source matches the /24, 33 is greater than 30 and at most 4 above it, and the name check passed. You accept 33 and the fresh values become 34, 35, 36, and 37.",
          },
        ],
      ),
    ],
  },
];
