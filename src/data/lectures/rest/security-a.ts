import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-652",
    lectures: [
      lec(
        "l1",
        "Sections before opcodes",
        [
          "You start reverse engineering at the object file the compiler emitted, not at a guess about the source. The mechanism is the section table. You read 3 section names before any opcode: code, initialized data, and relocations. If the code section is 40 bytes, the machine text is 40 bytes, and every later offset must fall inside that length.",
          "You do not take a function location from a name the linker may rewrite. A symbol entry stores a name, a section index, and a value that is an offset inside that section. When the value is 16 and the section is code, byte 16 of the code is the first byte of that function. CSCE 313 is the systems prerequisite. You check this on 1 object until each offset lands on the bytes you see.",
        ],
        {
          kind: "layers",
          caption: "Three names you read before any opcode.",
          rows: ["Code section", "Initialized data", "Relocation records"],
        },
        "A symbol at offset 16",
        [
          "The code section is 40 bytes long. You read the symbol table before you decode.",
          "One symbol has value 16 and its section index selects code. Its first byte is byte 16 of that section.",
          "Offset 16 is inside a length of 40, so the symbol names a real location. You do not move it to match a source name.",
        ],
        [
          {
            prompt: "The code section is 40 bytes. A symbol's value is 36 and its section is code. Is byte 36 inside the section, and how many bytes of the section remain starting at that byte?",
            answer: "Yes. 40 minus 36 is 4, so 4 bytes remain, counting byte 36. An offset of 40 itself would be outside the section.",
          },
          {
            prompt: "The linker will rewrite a local name, and the symbol value is still 16 in the code section. Where is the function?",
            answer: "Byte 16 of the code section. The name is not the location. CSCE 313 told you a process image is more than a listing; here the listing starts at the section offset.",
          },
        ],
      ),
      lec(
        "l2",
        "Headers tell you where to read",
        [
          "You parse a file format by walking headers, which is the mechanism, not by scanning for a readable string. An executable header stores the entry point and the file offset of each loadable segment. Suppose the header occupies bytes 0 through 63, so its size is 64, and the first segment starts at offset 64. Byte 64 is the first mapped byte. You write both numbers down before you disassemble.",
          "A section table is a second walk from a base the file header gives you. If each section header is 40 bytes and the table starts at offset 200, section 2 begins at 200 plus 80, which is 280. You read the header at 280 and only then trust its fields. A string you noticed at offset 12 is not the entry point. Two offsets, 200 and 280, are enough to show you did the addition.",
        ],
        {
          kind: "pipeline",
          caption: "From the file header to one section.",
          stages: ["Read the table base", "Multiply index by width", "Add base to that product", "Read the header there"],
        },
        "Section 2 at a 40-byte stride",
        [
          "The section table starts at file offset 200. Each section header is 40 bytes wide.",
          "Index 2 contributes 2 times 40, which is 80. You add that to the base: 200 plus 80 is 280.",
          "You parse the header at offset 280. The string at offset 12 stays a string, not an entry point.",
        ],
        [
          {
            prompt: "The section table starts at offset 120. Each header is 40 bytes. Where do you read section 3?",
            answer: "At offset 240. 3 times 40 is 120, and 120 plus 120 is 240.",
          },
          {
            prompt: "The file header occupies bytes 0 through 63, and the first loadable segment starts at offset 64. Which byte is the first mapped byte?",
            answer: "Byte 64. Bytes 0 through 63 are the header you already consumed. A readable string in those bytes is not the entry point.",
          },
        ],
      ),
      lec(
        "l3",
        "Decode a fixed width",
        [
          "You disassemble by consuming a stated width and then decoding the opcode, which is the mechanism. In this toy encoding every instruction is 2 bytes: opcode, then a register or a small immediate. A buffer of 8 bytes holds exactly 4 instructions when you start at offset 0. If you start at offset 1 you split two real instructions and invent a byte pair nobody issued. Start only at a header entry or a branch target.",
          "You keep a short opcode table and you refuse bytes that are not in it. Opcode 1 is add, opcode 2 is jump, and opcode 3 is return. The pair 02 05 is a jump whose operand field is 5, not an add. You write one row per instruction: address, name, operand. Four rows cover the 8-byte buffer. You do not run the bytes. A row is not proof the program reached that address.",
        ],
        {
          kind: "pair",
          caption: "Where you are allowed to start a decode.",
          leftTitle: "Start at offset 0",
          rightTitle: "Start at offset 1",
          left: ["Width 2 consumes pairs", "8 bytes give 4 rows", "Opcodes stay in the table"],
          right: ["Pairs split real instructions", "The new pairs were not issued", "Refuse that start"],
        },
        "Four rows from eight bytes",
        [
          "The buffer is the 8 bytes starting at a named offset. Each instruction consumes 2 bytes, so you expect 4 rows.",
          "The bytes 02 05 become a jump with operand 5, because opcode 2 is jump. Opcode 1 would have been add.",
          "You stop after the fourth row. You do not execute the buffer, and you do not start the next decode at an odd offset.",
        ],
        [
          {
            prompt: "The toy width is 2 bytes and the buffer is 8 bytes, starting at a named offset of 0. How many instruction rows do you write?",
            answer: "4. 8 divided by 2 is 4. Each row is address, name, and operand. You do not run the bytes.",
          },
          {
            prompt: "You began the same 8-byte buffer at offset 1. What is wrong with the four pairs you see?",
            answer: "They are not the issued instructions. An odd start splits two real 2-byte instructions. You only decode from a header entry or a branch target.",
          },
        ],
      ),
      lec(
        "l4",
        "Edges the instruction named",
        [
          "A control-flow graph is the mechanism that groups decoded instructions into basic blocks. A block is a straight run that ends at a branch, a call, or a return. A function with 12 instructions and 3 branches often yields 4 blocks: entry, two targets, and a fall-through. You draw an edge only when some instruction names that destination. A curve you added because the code looks like a loop is not an edge.",
          "You label blocks so a later note can cite them. Call the entry B0. A conditional jump at the end of B0 has two successors, so the out-degree of B0 is 2. An indirect jump through a register is not those 2 edges. You mark it unresolved until a run reports one concrete target. One unresolved edge is a property of your graph. You do not replace it with an address you hoped for.",
        ],
        {
          kind: "flow",
          caption: "One block ends only at a transfer.",
          steps: ["End the block at a branch", "Read the named targets", "Draw only those edges", "Mark indirect edges open"],
        },
        "Out-degree 2 at B0",
        [
          "B0 ends in a conditional jump. The instruction names two successors, B1 and B2.",
          "You draw those 2 edges and no others. The out-degree of B0 is 2.",
          "A later indirect jump stays unresolved. You do not add a third edge because the shape reminds you of a loop.",
        ],
        [
          {
            prompt: "A function has 12 instructions, and 3 of them are branches. You drew 4 blocks but added a back edge no instruction names. Which edge do you delete?",
            answer: "The back edge you invented. An edge exists only when an instruction names the destination. Looking like a loop is not a name.",
          },
          {
            prompt: "B0 ends in an indirect jump through a register. How many resolved outgoing edges do you record before a run?",
            answer: "0 resolved edges. Two successors would be a conditional jump that names both targets. An indirect target stays unresolved until a run reports one concrete landing block.",
          },
        ],
      ),
      lec(
        "l5",
        "Facts you can claim without running",
        [
          "Static analysis walks the graph without running the program. The mechanism here is constant propagation inside one block. If B0 writes the immediate 7 into a register and no later instruction in B0 overwrites it, a use at the end of B0 still sees 7. You stop that claim at a join. Two predecessors means you carry 7 forward only when both predecessors carry 7. Otherwise the value at the join is unknown, not 7.",
          "You also read calls off the graph. A direct call edge names exactly 1 callee. If you see 5 call sites and 4 of them name the same function, you have one helper, not 5 unrelated functions. You list callees per block. A function with 0 call edges is a leaf. You do not treat a leaf as harmless: it can still write the byte the caller passed in a register. The leaf is small. The effect is not.",
        ],
        {
          kind: "pair",
          caption: "When the constant 7 may cross a join.",
          leftTitle: "One predecessor",
          rightTitle: "Two predecessors",
          left: ["B0 wrote immediate 7", "No later overwrite in B0", "The use still sees 7"],
          right: ["Carry 7 only if both do", "A disagreement blocks the claim", "The join stays unknown"],
        },
        "Five call sites, one helper",
        [
          "You list direct call edges. Each edge names exactly 1 callee.",
          "Five sites appear, and 4 of them name the same function. You record one helper used from 4 sites, plus the fifth callee.",
          "A different function has 0 call edges. You mark it a leaf and you still ask what byte it writes.",
        ],
        [
          {
            prompt: "B0 carries the constant 7. One predecessor of the join also carries 7, and the other carries an unknown value. What do you claim at the join?",
            answer: "The value is unknown, not 7. You need both predecessors to carry 7 before you propagate it. One agreement is not a join fact.",
          },
          {
            prompt: "You see 5 direct call sites and 4 name the same function. How many distinct callees do those 4 sites contribute?",
            answer: "1 helper. The fifth site may name someone else, so the function count is not 5. A leaf, with 0 call edges, is separate and is not automatically harmless.",
          },
        ],
      ),
      lec(
        "l6",
        "Counters from one run",
        [
          "Dynamic analysis runs the program and records facts the static graph left open. The mechanism is a counter on each basic block. After 1 run that takes the true side of a branch, the counter on B1 is 1 and the counter on B2 is 0. A count of 0 means this run missed the block. It does not mean the block is dead code. You need a second input before you delete B2.",
          "You add an indirect edge only when a trace shows the landing block. If B0 lands in B3 on this run, you add that single edge and you tag it as input 2 of 6. You do not add the other targets you have not seen. A watch on a register is the same mechanism at one instruction: you record the value you observed, such as 5, beside the address. The address without the value is an incomplete note.",
        ],
        {
          kind: "pipeline",
          caption: "What one run is allowed to add.",
          stages: ["Count entries per block", "Keep a zero count", "Add only seen edges", "Store value and address"],
        },
        "Input 2 lands in B3",
        [
          "This is input 2 of 6. The indirect jump in B0 lands in B3, so you add that one edge and tag it with input 2.",
          "B2's counter stays 0 on this run. You leave B2 in the graph.",
          "A register watch at the jump records the value 5 and the instruction address. You do not fill in targets from the other 4 inputs you have not run.",
        ],
        [
          {
            prompt: "After 1 run, B1 has count 1 and B2 has count 0. May you delete B2?",
            answer: "No. A count of 0 means this run missed B2. Dead code is a stronger claim, and you need another input before you delete the block.",
          },
          {
            prompt: "On input 2 of 6 the indirect jump lands in B3. How many new indirect edges do you add from that fact?",
            answer: "1 edge, tagged as input 2. You do not add the landings you have not seen among the other inputs. A register value such as 5 is recorded beside its address, not turned into extra edges.",
          },
        ],
      ),
      lec(
        "l7",
        "Live blocks and a measured file",
        [
          "Obfuscation keeps behavior and hides the graph. One mechanism inserts a bogus block on a predicate you can prove is always false. If the live function had 4 blocks and the transform adds 2 bogus blocks, a raw count of 6 overstates the live graph. You mark a block live only when a solved predicate or a trace reaches it. Dead blocks stay on the drawing, and you label them dead so you do not analyze them as reachable.",
          "You describe a suspicious file by measurements, not by a nickname. You record 3 facts: the file hash, the entry-point offset, and the number of unresolved indirect edges. A file with 9 unresolved edges is harder to summarize than a file with 1. You do not run that file on the machine that stores your notes. A writeup that omits the hash cannot be tied back to the bytes you read.",
        ],
        {
          kind: "pair",
          caption: "A raw block count is not the live graph.",
          leftTitle: "Raw drawing",
          rightTitle: "Live subset",
          left: ["4 real blocks plus 2", "Count reads 6", "Bogus predicate is false"],
          right: ["Reachable by proof or trace", "Dead blocks stay labeled", "Do not treat them as live"],
        },
        "Six blocks, four live",
        [
          "The transform added 2 bogus blocks to a function that had 4. The drawing shows 6.",
          "The predicate into each bogus block is always false. You label those 2 dead.",
          "You summarize the file with its hash, its entry-point offset, and 9 unresolved indirect edges. You do not execute it on the notes machine.",
        ],
        [
          {
            prompt: "A function's drawing has 6 blocks. You can show 2 of them sit under a predicate that is always false. How many blocks are live?",
            answer: "4. The raw count 6 overstates the live graph by the 2 bogus blocks. Dead blocks stay on the drawing and stay labeled dead.",
          },
          {
            prompt: "Your note lists 9 unresolved edges and an entry-point offset, but no hash. What can a reader not do?",
            answer: "They cannot tie the note to the bytes you read. The hash is 1 of the 3 required facts, with the entry-point offset and the unresolved-edge count. You also do not run the file on the machine that stores the notes.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now recover",
        [
          "You can now move from a file header to a control-flow graph you can defend. You can compute a section location, 200 plus 2 times 40, and land on byte 280. You can decode a 2-byte toy instruction and refuse an edge the instruction did not name. Propagation of the constant 7 stops at a join with a disagreeing predecessor. A dynamic count of 0 means that run missed the block, not that the block is absent.",
          "The lab path is Ali Hadi's public reverse-engineering sequence, with pwn.college as the place you practice. Spend the hours on these 8 mechanisms, not on a tour of menus. Your closing exercise is 1 file: parse the header, decode 4 instructions, draw the blocks, and name the 1 edge that is still unresolved. If the section-offset addition is missing, this course is not finished.",
        ],
        {
          kind: "flow",
          caption: "The close of this course is one file you can defend.",
          steps: ["Add the section offset", "Decode four instructions", "Draw only named edges", "Name one open edge"],
        },
        "Land on byte 280, then stop",
        [
          "The section table base is 200 and the header width is 40. Index 2 yields 80, and 200 plus 80 is 280.",
          "From a named start you decode 4 instructions of width 2. You draw an edge only when the instruction names it.",
          "You leave 1 indirect edge unresolved and you say so. The lab hours belong to Ali Hadi's sequence and to pwn.college, on mechanisms like this one.",
        ],
        [
          {
            prompt: "The section table is at offset 200, each header is 40 bytes, and you want section 2. Which file offset do you read, and what is the product you added?",
            answer: "You read offset 280. The product is 80, because 2 times 40 is 80, and 200 plus 80 is 280. Without that addition this course is not finished.",
          },
          {
            prompt: "Your closing file shows a dynamic count of 0 on B2 and a join where only one predecessor carries the constant 7. What may you claim?",
            answer: "This run missed B2, and the join value is unknown rather than 7. A zero count is not absence. One predecessor is not both predecessors.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-665",
    lectures: [
      lec(
        "l1",
        "States before payloads",
        [
          "You treat a network protocol as a state machine plus a message format. That pair is the mechanism. Each state names which messages are legal, and each message has a fixed set of fields. A toy handshake uses 3 states: idle, sent, and established. A data record that shows up in idle is not application data, and you drop it. You do not open this course before CS 144, because you need those field names first.",
          "On a live machine you keep the bytes and the state in one note. The mechanism is a numbered packet tied to a state name. Packet 4 while the endpoint is idle is a protocol error, even when the payload parses. You store 1 capture per trial and you hash that file before you filter it. A diagram that has states but no packet numbers cannot be checked against the machine.",
        ],
        {
          kind: "flow",
          caption: "A record is legal only in some states.",
          steps: ["Name the current state", "Check the message type", "Drop data while idle", "Hash the capture"],
        },
        "Packet 4 arrives too early",
        [
          "The endpoint is idle, the first of the 3 states. Packet 4 parses as a data record.",
          "You drop it. Established is the only state in this toy where application data is legal.",
          "You hash the capture before any filter. The note says packet 4 and idle, or it is not checkable.",
        ],
        [
          {
            prompt: "A data record arrives and your note says the endpoint is idle. What do you do with it, and how many handshake states does this toy define?",
            answer: "You drop it. The toy has 3 states: idle, sent, and established. Data is not legal in idle. You also hash the 1 capture before you filter it.",
          },
          {
            prompt: "Your diagram lists the three states and no packet numbers. What can a reader not check?",
            answer: "They cannot check the diagram against the machine. The mechanism is a packet number tied to a state name, such as packet 4 in idle. You were also supposed to finish CS 144 before these questions.",
          },
        ],
      ),
      lec(
        "l2",
        "The tag covers every field that moves",
        [
          "You authenticate a message with a tag computed over chosen bytes and a shared key. The mechanism is recompute and compare. Suppose the tag is 16 bytes. You accept the message only when all 16 bytes match the tag you just computed. A match on the first 15 bytes and a miss on the last byte is a reject. You do not hand the payload to the next state after a partial match.",
          "You include every field that must not be swapped. Destination, sequence number, and payload are 3 inputs to the tag in this toy. If you leave the sequence number out, a tag can be valid for the payload and still sit on the wrong packet. A check over 2 of the 3 fields is a different protocol. You write down which fields you covered. The byte length of the tag does not repair a field you skipped.",
        ],
        {
          kind: "pair",
          caption: "Partial agreement is still a failed tag.",
          leftTitle: "All 16 bytes match",
          rightTitle: "15 match, 1 misses",
          left: ["Recompute the tag", "Compare every byte", "Accept and move state"],
          right: ["The last byte differs", "Reject the message", "Do not deliver payload"],
        },
        "Three fields, or it is another protocol",
        [
          "You compute the tag over destination, sequence, and payload. That is 3 inputs, and the tag is 16 bytes.",
          "All 16 bytes match, so this message can move to the next check, which is freshness.",
          "A second design that omits the sequence number is not this protocol. You would write that it covers 2 fields, not 3.",
        ],
        [
          {
            prompt: "The recomputed tag matches on 15 bytes and differs on 1. The tag length is 16. Do you accept?",
            answer: "No. All 16 bytes must match. A partial match is a reject, and you do not hand the payload to the next state.",
          },
          {
            prompt: "The tag covers destination and payload, and it omits the sequence number. How many of the 3 required inputs are missing?",
            answer: "1 input, the sequence number. A valid tag on the other 2 fields can still sit on the wrong packet. Tag length does not repair the skipped field.",
          },
        ],
      ),
      lec(
        "l3",
        "A counter makes a copy stale",
        [
          "A valid tag does not make a message fresh. Replay is acceptance of the same bytes twice. The mechanism is a counter the receiver stores. When the last accepted sequence is 10, the next message must present 11 or higher. Sequence 10 with a valid tag is a replay, and you drop it. You persist the counter across a reboot. A restart that sets the counter back to 0 will accept old messages again.",
          "You keep a reorder window so a late packet is not punished. A window of width 4, after sequence 10, admits 11, 12, 13, and 14 in any order, each one time. Sequence 10 stays outside that window. You store 4 bits, one per slot. A second copy of sequence 12 finds its bit already set, and you drop the copy. The bit, not the tag alone, is what makes the second copy stale.",
        ],
        {
          kind: "layers",
          caption: "Freshness sits on top of a valid tag.",
          rows: ["Accept only a full tag", "Keep the last sequence", "Admit a window of 4", "Persist the counter"],
        },
        "Sequence 12 arrives twice",
        [
          "The last accepted sequence is 10. The window width is 4, so 11 through 14 are eligible once each.",
          "The first copy of sequence 12 has a valid tag. You set its bit among the 4 bits and you accept it.",
          "The second copy still has a valid tag, but the bit is set. You drop it. Sequence 10 remains outside the window.",
        ],
        [
          {
            prompt: "The last accepted sequence is 10. A message with sequence 10 arrives with a valid 16-byte tag. What do you do?",
            answer: "You drop it. It is a replay. The next sequence must be 11 or higher. A valid tag is not freshness, and a reboot must not reset the stored counter to 0.",
          },
          {
            prompt: "After sequence 10, the window width is 4 and sequence 12 has already been accepted. How many slots does the window have, and do you accept a second 12?",
            answer: "The window has 4 slots, for 11, 12, 13, and 14. You do not accept the second 12, because its bit is already set. Sequence 10 stays outside.",
          },
        ],
      ),
      lec(
        "l4",
        "A chain is not a banner",
        [
          "You authenticate a server with a certificate chain, not with a name printed in a banner. Each certificate is a signature over the next public key. A chain of length 3 contains a leaf, one intermediate, and a root you already trust. You verify 3 signatures, and you check that the leaf name is the name you asked for. If the chain ends at an intermediate you do not trust, you fail the handshake even when the inner signatures verify.",
          "The session key is not that long-term signing key. After the 3 checks succeed, you derive a session key and you tag records with it. A valid record tag does not, by itself, tell you which server you reached. You needed the chain for that. In this toy the handshake times out at 5 seconds, and a peer that never finishes remains in the sent state. You send no application data while the state is still sent.",
        ],
        {
          kind: "pipeline",
          caption: "Three signatures, then a session key.",
          stages: ["Check the leaf name", "Verify 3 signatures", "Require a trusted root", "Derive the session key"],
        },
        "The third link never reaches a root",
        [
          "The chain you received has a leaf and one intermediate. It does not reach a root you stored. Length so far is 2, not 3.",
          "Both signatures you can see do verify. You still fail the handshake, because the chain does not end at a trust anchor.",
          "Five seconds pass in the sent state with no completion. You send no application data, and you do not treat a later record tag as server authentication.",
        ],
        [
          {
            prompt: "You can verify 2 signatures, and the chain stops at an intermediate you do not trust. How many links is a full chain in this toy, and do you continue?",
            answer: "A full chain has 3 links: leaf, intermediate, and a root you trust. You do not continue. Inner signatures do not replace the missing trust anchor or the leaf-name check.",
          },
          {
            prompt: "The handshake has been in the sent state for 5 seconds and then a record arrives with a valid session tag. What is missing?",
            answer: "A finished chain check. The toy timeout is 5 seconds, and you send no application data from the sent state. A record tag does not name the server. The chain of 3 did that job.",
          },
        ],
      ),
      lec(
        "l5",
        "An answer must match the question",
        [
          "A resolver accepts an answer only when it matches the question you sent. The mechanism is a comparison of 3 fields: the name, the type, and the transaction id. You asked for name N, type A, and id 42. An answer that carries id 42 but a different name is not your answer, and you drop it. You also refuse to cache a record you did not ask for, even if it shared that packet.",
          "You also honor the time to live, which is a count of seconds in the record. If that count is 30, you may reuse the address until the timer reaches 0, and then you ask again. A client that keeps the address for 300 seconds is ignoring the record. On the live machine you log 3 columns: the id, the name, and the stored TTL. Those columns explain a later connection without inventing packets.",
        ],
        {
          kind: "flow",
          caption: "Cache a record only after it matches.",
          steps: ["Compare name and type", "Compare transaction id", "Drop extra records", "Honor the TTL"],
        },
        "Id 42, wrong name",
        [
          "Your question is name N, type A, id 42. The response repeats id 42 and type A, but the name is different.",
          "You drop that answer. You also skip a second record in the same packet that you never asked for.",
          "A matching record with TTL 30 may be reused for 30 seconds. You log id, name, and 30. You do not keep it for 300.",
        ],
        [
          {
            prompt: "You asked for name N with id 42. The packet has id 42 and a different name, plus an address you never requested. What do you cache?",
            answer: "Nothing from that packet. The name fails the 3-field match, and you do not cache a record you did not ask for even when it shares the packet.",
          },
          {
            prompt: "The matching record says TTL 30. Your client still holds the address at 300 seconds. By how many seconds did it overrun the record?",
            answer: "270 seconds. 300 minus 30 is 270. You may reuse the address only until the timer hits 0, then you ask again. Log the id, the name, and the TTL you actually stored.",
          },
        ],
      ),
      lec(
        "l6",
        "First match is the policy",
        [
          "A packet filter is an ordered rule list, and the mechanism is first match. You start at rule 1 and you stop at the first predicate that matches. If rule 1 accepts any source headed for destination port 22, then rule 4, which would deny one source, never sees that port. Order is the policy. A deny you append as rule 6 does not affect packets an earlier accept already took.",
          "You write each predicate with 4 fields you can point at: source, destination, port, and action. A missing port means the rule is wider than the prose you wrote beside it. On a live machine you log the rule number that fired, not only the word accept. If 80 of 100 packets hit rule 1, the later rules are almost idle, so inspect rule 1 first. New rules do not narrow a rule above them.",
        ],
        {
          kind: "pipeline",
          caption: "Walk rules until one predicate hits.",
          stages: ["Start at rule 1", "Test the four fields", "Stop at first match", "Log that rule number"],
        },
        "Rule 1 hides rule 4",
        [
          "Rule 1 accepts any source to destination port 22. Rule 4 would deny one particular source on that port.",
          "A packet to port 22 matches rule 1. You stop. Rule 4 does not run, and you log rule 1.",
          "In a sample of 100 packets, 80 hit rule 1. You inspect rule 1 before you add rule 7.",
        ],
        [
          {
            prompt: "Rule 1 accepts destination port 22 from any source. Rule 4 denies one source on port 22. Which rule fires for that source, and which rule never runs?",
            answer: "Rule 1 fires and rule 4 never runs. First match stops the walk. Appending the deny as rule 6 would not change packets rule 1 already accepted.",
          },
          {
            prompt: "A sample has 100 packets and 80 of them hit rule 1. How many packets hit something else, and what do you inspect first?",
            answer: "20 packets hit something else, because 100 minus 80 is 20. You inspect rule 1 before adding rule 7. Log the rule number, and write all 4 fields: source, destination, port, and action.",
          },
        ],
      ),
      lec(
        "l7",
        "A snapshot is not a timeline",
        [
          "You separate the socket table from the packet capture when you investigate a live host. The table is a snapshot with 4 columns: local address, remote address, state, and process. The capture is only the interval you recorded. A socket that is established, with no packet inside a 10-minute capture, can still be an idle connection. You print the start time and the stop time next to the snapshot so the gap is visible.",
          "You correlate the two sources only where address and time can meet. If the capture starts at minute 15 and you sampled the socket table at minute 12, the hole is 3 minutes. You do not invent packets for those minutes. Byte totals are sums you can recompute: flows of 40 bytes and 60 bytes total 100. You still name each flow. One unlabeled total hides which remote address you actually observed.",
        ],
        {
          kind: "pair",
          caption: "Two sources with different clocks of validity.",
          leftTitle: "Socket snapshot",
          rightTitle: "Packet capture",
          left: ["Four columns, one instant", "Sampled at minute 12", "Idle sockets may be quiet"],
          right: ["Only while it was running", "Starts at minute 15", "Hash it before a filter"],
        },
        "Forty bytes plus sixty",
        [
          "The socket table was sampled at minute 12. The capture starts at minute 15, so the hole is 3 minutes.",
          "Inside the capture, two flows account for 40 bytes and 60 bytes. You report 100 and you name both flows.",
          "An established socket with no packet in the 10-minute capture stays an idle connection, not a contradiction you paper over.",
        ],
        [
          {
            prompt: "The socket sample is at minute 12 and the capture starts at minute 15. How long is the hole, and may you fill it with packets?",
            answer: "The hole is 3 minutes, because 15 minus 12 is 3. You do not invent packets for it. Write both times next to the 4-column snapshot.",
          },
          {
            prompt: "Two flows show 40 bytes and 60 bytes. What total do you report, and what do you still have to name?",
            answer: "100 bytes, because 40 plus 60 is 100. You still name each flow. One unlabeled total hides the remote address.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now check on a trace",
        [
          "You can now check a protocol on a live machine as states, tags, and windows. Data that arrives in the idle state, 1 of 3 states, is dropped. A 16-byte tag must match on every byte, and sequence 10 is a replay once 10 has been accepted. A chain of 3 certificates is not a banner. First match means rule 1 can hide rule 4. You keep the capture hash and the minute window beside any claim.",
          "The public lab for this material is MIT 6.858, and you take it after CS 144, not before. These 8 lectures are the checks you should already be able to name: state, tag coverage, freshness, chain length, name match, and rule order. Your closing exercise is 1 capture of 10 minutes plus 1 socket snapshot. If you cannot say which rule fired, or you cannot recompute 40 plus 60, this course is not finished.",
        ],
        {
          kind: "layers",
          caption: "Checks you should be able to name in order.",
          rows: ["State, then message type", "Full tag, then freshness", "Chain of 3, then session", "First matching filter rule"],
        },
        "One capture, one sum",
        [
          "You hash a 10-minute capture and you place a socket snapshot beside it, with the 3-minute hole written out if the times differ.",
          "Two flows of 40 and 60 bytes sum to 100. You name both, and you name the rule number that accepted them.",
          "You can point at idle versus established, at a 16-byte tag, and at sequence 10 as a replay. The lab course is 6.858, after CS 144.",
        ],
        [
          {
            prompt: "Flows of 40 bytes and 60 bytes were accepted by rule 1, and rule 4 would have denied one of them. What is the byte total, and which rule do you cite?",
            answer: "The total is 100, because 40 plus 60 is 100. You cite rule 1, because first match never reached rule 4. If you cannot say which rule fired, this course is not finished.",
          },
          {
            prompt: "Sequence 10 was already accepted, the tag is 16 bytes and matches, and the endpoint is established. Is the message fresh?",
            answer: "No. Sequence 10 is a replay once 10 has been accepted. The matching tag only gets the message to the freshness check. Data would also have been dropped if the state were still idle, 1 of 3 states.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-702",
    lectures: [
      lec(
        "l1",
        "Four slots or it is not a rule",
        [
          "You read a cyber policy as an instrument that grants authority, not as advice. The mechanism is a sentence that names 4 slots: who must act, which systems are in scope, what action they take, and by when. A memo that says only be careful fills 0 of those slots. This course is the graduate law and policy course, cross-listed as CYBR 602. You will practice on documents, not on slogans.",
          "You test a draft by filling the 4 slots from the text alone. If the deadline slot is empty, the operator cannot know whether day 2 is late. Scope is a list you can audit: for example, 12 servers in one office, not the enterprise. You write the list. A policy that cannot be violated in a way you could show an auditor is not yet a policy. It is a wish with a letterhead.",
        ],
        {
          kind: "layers",
          caption: "A rule you could actually violate.",
          rows: ["Who must act", "Which systems are in scope", "What action they take", "By when"],
        },
        "Twelve servers, no deadline",
        [
          "The draft names an operator and lists 12 servers. The action is retain admin logs.",
          "The deadline slot is empty. You cannot tell whether day 2 is late, so the sentence is not finished.",
          "You do not replace the list of 12 with the word enterprise. A slogan fills 0 of the 4 slots.",
        ],
        [
          {
            prompt: "A memo says be careful with the enterprise and names no actor, no list, no action, and no deadline. How many of the 4 slots are filled?",
            answer: "0. A policy sentence needs who, scope, action, and deadline. This course, CYBR 602, practices on documents that can be violated, not on slogans.",
          },
          {
            prompt: "Scope is written as 12 servers, and the deadline slot is blank. Can the operator know whether day 2 is late?",
            answer: "No. Day 2 has nothing to be late against. You can audit the list of 12, and you still cannot apply a clock that was never written.",
          },
        ],
      ),
      lec(
        "l2",
        "A contract term you can fail",
        [
          "You turn a security need into a contract term you can accept or reject at procurement. The mechanism is an acceptance test written next to the term. Retain admin logs for 90 days is testable: on day 91 you either still have the log or you do not. A term that says use good security has no day count and no artifact, so you cannot score it. You require 1 test per requirement before you award the contract.",
          "You separate a control from a product name. The contract should demand the log retention of 90 days, not a brand. A vendor paragraph that lists 8 features does not replace the test. During acceptance you sample 1 day of logs and you check the oldest record age against 90. If the oldest record is 10 days old, the delivery fails that term. You record the fail against the term number, not against a salesperson slide.",
        ],
        {
          kind: "pipeline",
          caption: "From a need to a scored delivery.",
          stages: ["Write the numbered term", "Attach one acceptance test", "Sample the delivered artifact", "Score pass or fail"],
        },
        "Day 91, or the oldest record",
        [
          "The term says retain admin logs for 90 days. The test is that a log from day 0 still exists on day 91.",
          "You sample the delivery. The oldest record is 10 days old, which is not 90.",
          "You fail that term number. The vendor's list of 8 features does not change the sample.",
        ],
        [
          {
            prompt: "The term requires 90 days of admin logs. The oldest record in the delivery is 10 days old. Does the term pass, and what is the shortfall in days?",
            answer: "It fails. The shortfall is 80 days, because 90 minus 10 is 80. You record the fail against the term number. Eight advertised features are not the test.",
          },
          {
            prompt: "The draft says use good security and names a product. Why is that not ready to award?",
            answer: "It has no day count and no artifact, so you cannot score it. You require 1 acceptance test per requirement. The control is the retention, such as 90 days, not the brand.",
          },
        ],
      ),
      lec(
        "l3",
        "The clock starts when you write discovery",
        [
          "Operations policy is a clock plus a role. The mechanism is a deadline measured from a time you wrote down. If the rule says 72 hours from discovery, and you recorded discovery at 09:00 on Monday, the report is due at 09:00 on Thursday, 72 hours later. Starting the clock at the press conference instead of at discovery makes a late report look timely. You name 1 incident commander who may start that clock.",
          "You keep an operations log with 3 times: discovery, containment decision, and external notice. If discovery is hour 0 and notice is hour 80, you exceeded a 72-hour rule by 8 hours, and you write the 8. Do not backdate discovery to hour 8 so the subtraction looks like 72. A status meeting that produces no time entries does not operate the policy. You can have 5 meetings and still miss the only clock that matters.",
        ],
        {
          kind: "flow",
          caption: "Three times, then the subtraction.",
          steps: ["Write the discovery time", "Name one commander", "Log the notice time", "Subtract from the deadline"],
        },
        "Notice at hour 80",
        [
          "Discovery is logged at hour 0 by the 1 incident commander. The rule allows 72 hours.",
          "External notice goes out at hour 80. The overrun is 80 minus 72, which is 8 hours.",
          "You write 8. You do not move discovery to hour 8 to make the gap look like 72. Five status meetings do not replace the log.",
        ],
        [
          {
            prompt: "Discovery is hour 0, the rule is 72 hours, and notice goes out at hour 80. By how many hours is the notice late?",
            answer: "8 hours. 80 minus 72 is 8. You write the 8. Backdating discovery to hour 8 would fake a gap of 72 and is not allowed.",
          },
          {
            prompt: "Discovery was recorded at 09:00 Monday and the rule is 72 hours. When is the report due?",
            answer: "09:00 Thursday. 72 hours after Monday 09:00 is Thursday 09:00. The clock starts at the discovery time you wrote, not at a later press conference. One commander owns that start.",
          },
        ],
      ),
      lec(
        "l4",
        "Silence is not a signature",
        [
          "Governance answers who may bind the organization. The mechanism is a signature authority table, not a chat channel. Suppose 3 roles exist: an operator who proposes, a security officer who reviews, and an executive who accepts residual risk. A change that ships with only the operator note has 1 signature of the 3 you required. You do not treat silence in the review meeting as the missing signature. Silence has no name and no date.",
          "You review the table when a role is vacant. If the executive seat is empty for 14 days, residual-risk acceptance stops, because nobody holding that seat can sign. Borrowing the operator login to add the third name is not governance. You want the 3 names to be 3 people. A board slide that says security is a priority does not identify the signer. You can point at the table, or you do not have one.",
        ],
        {
          kind: "pair",
          caption: "What counts as binding the organization.",
          leftTitle: "A real acceptance",
          rightTitle: "Not acceptance",
          left: ["Three distinct people", "Name and date on each", "Executive signs residual"],
          right: ["Silence in a meeting", "A shared operator login", "A slide with no signer"],
        },
        "One signature of three",
        [
          "The change carries the operator's name and date. The reviewer and the executive lines are blank.",
          "You count 1 signature of the 3 required. The change does not ship.",
          "The executive seat has also been empty for 14 days, so residual-risk acceptance is stopped until that seat can sign as a different person.",
        ],
        [
          {
            prompt: "The operator signed, the reviewer was silent, and the executive line is blank. How many of the 3 required signatures do you have?",
            answer: "1. Silence is not a signature, because it has no name and no date. You need the operator, the security officer, and the executive as 3 people.",
          },
          {
            prompt: "The executive seat is empty for 14 days. Someone uses the operator login to type the executive's name. Is residual risk accepted?",
            answer: "No. Acceptance stops while that seat is empty, and a borrowed login is not a second person. Fourteen days of vacancy does not create authority. A priority slide does not name a signer either.",
          },
        ],
      ),
      lec(
        "l5",
        "Elements from the text",
        [
          "A domestic statute is briefed from its text, and the mechanism is an elements list. You fill 4 boxes and you leave a box blank rather than invent it: the conduct, the mental state, the object of the conduct, and the consequence the text states. A news summary that mentions only 2 of the 4 boxes is not your brief. You cite the section number beside each box you filled.",
          "You apply the brief to 1 fact pattern in a memo of fixed shape. The pattern is short: an employee copied 2 files from a system they were allowed to use, after hours. You ask which element, if any, those facts satisfy, and you say when an element is not met. You do not add a fifth element from a commentator. Global or domestic, the brief stays tied to the words you read.",
        ],
        {
          kind: "layers",
          caption: "Four boxes, each tied to a section.",
          rows: ["Conduct the text names", "Mental state the text names", "Object of that conduct", "Consequence the text states"],
        },
        "Two files, four boxes",
        [
          "The fact pattern is one employee and 2 files on a system they could already use. You open the statute, not a news recap.",
          "You fill only the boxes the section supports, and you cite the section number. A news note that covers 2 boxes is not the brief.",
          "If the mental-state box is not in the text, you leave it blank. You do not import a fifth element from a commentator.",
        ],
        [
          {
            prompt: "A news summary states 2 elements and skips the mental state and the consequence. How many boxes of your brief does that summary fill by itself?",
            answer: "None you may rely on. The brief's 4 boxes come from the statute text, with a section number beside each filled box. A summary that mentions 2 boxes is not the brief.",
          },
          {
            prompt: "The fact pattern is 2 copied files on a system the employee was allowed to use. May you add a fifth element from a commentator because the hours were late?",
            answer: "No. You test the 4 elements that are in the text and you say when one is not met. Late hours are part of the fact pattern, not a new element. One memo, one fact pattern.",
          },
        ],
      ),
      lec(
        "l6",
        "Two duties that do not average",
        [
          "A cross-border flow can sit under 2 regimes at once. The mechanism is to list each regime's duty separately, then choose an action that satisfies both. Suppose regime A requires log retention of at least 180 days and regime B requires deletion of the same log at day 90. Those two duties conflict, and you do not average them to 135. You escalate the conflict as a legal question.",
          "You track where the bytes sit, because location can change the duty. A backup copied into a second country is a second processing site, not a harmless spare. If 1 of your 4 backups crosses that border, you have a cross-border flow even though 3 copies stayed home. You record the site, the regime, and the retention number you are actually using. Three columns beat a map with no numbers.",
        ],
        {
          kind: "pair",
          caption: "Write both duties before you pick an action.",
          leftTitle: "Regime A",
          rightTitle: "Regime B",
          left: ["Keep the log 180 days", "Retention is the duty", "Do not average with B"],
          right: ["Delete the log at day 90", "Deletion is the duty", "Escalate the conflict"],
        },
        "One backup of four",
        [
          "You have 4 backups. One is copied into a second country, so you have a cross-border flow. The other 3 do not erase that fact.",
          "Regime A says retain at least 180 days. Regime B says delete at day 90. The average 135 satisfies neither text.",
          "You record site, regime, and the retention number you are actually using, and you escalate. You do not pick 135 because it sits in the middle.",
        ],
        [
          {
            prompt: "Regime A requires at least 180 days of retention and regime B requires deletion at day 90. What is the average, and why do you refuse it?",
            answer: "The average is 135 days, because 180 plus 90 is 270, and 270 divided by 2 is 135. You refuse it because 135 meets neither duty. You escalate the conflict.",
          },
          {
            prompt: "Four backups exist and 1 of them is copied into a second country. How many copies create a cross-border flow?",
            answer: "1 copy is enough. The other 3 staying home does not cancel the flow. You record the site, the regime, and the retention number in 3 columns.",
          },
        ],
      ),
      lec(
        "l7",
        "A folder with dates",
        [
          "Policy courses go stale when they rely on news, so your mechanism is a primary-source folder with a date. You keep 2 kinds of documents: official guidance, such as a CISA publication, and a statute or regulatory text. A video recap is not in the folder. For each document you store the title, the issuer, and the date you read it, which is 3 fields. If the date is missing, you cannot tell whether a 2022 draft was replaced.",
          "Stanford's Center for Internet and Society is a second primary shelf, useful for argument about doctrine, not as a substitute for the statute. You still brief 1 statute or 1 incident, not both in the same memo. An incident brief uses 4 headings: what happened, which duty applied, what the clock required, and what was actually done. Filling those headings from a news article alone leaves you with hearsay.",
        ],
        {
          kind: "pipeline",
          caption: "What goes in the folder before a brief.",
          stages: ["Store issuer and date", "Prefer the statute text", "Add CISA guidance", "Brief one subject only"],
        },
        "One incident, four headings",
        [
          "You open an official timeline and a statute, each with title, issuer, and the date you read it. A 2022 draft without a read-date is not citable yet.",
          "The memo is an incident brief, not also a statute brief. The 4 headings are what happened, which duty, what the clock required, and what was done.",
          "A news article can sit outside the folder. Stanford's Center for Internet and Society may inform the doctrine paragraph, and it does not replace the duty heading.",
        ],
        [
          {
            prompt: "Your folder has a CISA document with a title and an issuer, and no date read. What can you not tell a later reader?",
            answer: "Whether that copy was already replaced, for example whether a 2022 draft is still current. The 3 fields are title, issuer, and date read. A video recap does not fill them.",
          },
          {
            prompt: "You filled all 4 incident headings from one news article. What is wrong with the brief?",
            answer: "The headings are hearsay until an official timeline or the statute supports them. You brief 1 incident or 1 statute, not both in the same memo, and a news folder is not the course.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now brief",
        [
          "You can now write policy that someone could violate, test, and sign. A requirement names a number, such as 90 days of logs or a 72-hour notice. Governance names 3 roles, and a missing signature is not silence. A statute brief has 4 elements taken from the text. Two regimes that demand 180 days and 90 days are a conflict you escalate, not an average of 135.",
          "The reading path is CISA's public guidance and Stanford's Center for Internet and Society, plus the statute itself. You do not finish this course with a folder of news videos. Your closing product is 1 brief, either on 1 statute or on 1 incident, with the 4 headings filled from primary text. If a heading is supported only by a headline, this course is not finished. The cross-list name CYBR 602 does not change that standard.",
        ],
        {
          kind: "flow",
          caption: "Close on one brief a stranger can check.",
          steps: ["Pick statute or incident", "Fill four headings", "Cite issuer and date", "Drop headline-only lines"],
        },
        "Ninety days, or seventy-two hours",
        [
          "You can fail a procurement term: 90 days required, 10 days delivered, shortfall 80. You can subtract a notice clock: hour 80 minus hour 72 is 8.",
          "You can refuse the average of 180 and 90, which is 135, and you can count signatures out of 3.",
          "The closing brief uses primary text. CISA guidance and Stanford's Center for Internet and Society are the shelves. A headline-only heading means the course is not finished.",
        ],
        [
          {
            prompt: "Regime A says 180 days and regime B says 90 days. What number do people reach by averaging, and what do you do instead?",
            answer: "135. You do not adopt 135. You list both duties and escalate the conflict. The closing brief is still 1 statute or 1 incident, with 4 headings from primary text.",
          },
          {
            prompt: "Discovery is at hour 0, notice is at hour 80, and the rule is 72 hours. The brief's clock heading cites only a headline. What is the overrun, and is the brief done?",
            answer: "The overrun is 8 hours, because 80 minus 72 is 8. The brief is not done. A heading supported only by a headline fails the course standard, including for CYBR 602.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-703",
    lectures: [
      lec(
        "l1",
        "Four treatments, one choice",
        [
          "You respond to a risk with 1 of 4 treatments: avoid, accept, mitigate, or transfer. The mechanism is a written choice tied to a scenario, not a mood. Avoid means you do not run the service. Accept means a named person signs the residual. Mitigate means a control changes the likelihood or the impact. Transfer means a contract moves a stated loss, for example the first 50000 dollars of a defined event, and it does not move the incident itself.",
          "You do not stack the words as if they were one action. A firewall is a mitigation. An insurance clause that pays 50000 dollars is a transfer of money, while you still mitigate or accept what remains. If you shut the service off, you avoided that scenario, and the insurance is idle for it. This course, cross-listed as CYBR 603, asks you to name the treatment for each scenario you keep. A diagram with no treatment name is unfinished.",
        ],
        {
          kind: "layers",
          caption: "Pick one treatment and write it.",
          rows: ["Avoid: do not run it", "Accept: a person signs", "Mitigate: a control changes the score", "Transfer: a contract moves dollars"],
        },
        "Insurance is not avoidance",
        [
          "The scenario is a defined outage. A contract pays the first 50000 dollars of that outage. That sentence is transfer.",
          "You still run the service, so you did not avoid it. A firewall you also deploy is a separate mitigation on a different part of the score.",
          "Whatever remains after the 50000 dollars needs accept or mitigate, named on its own. CYBR 603 wants one treatment per scenario you keep.",
        ],
        [
          {
            prompt: "A contract pays the first 50000 dollars of a defined event, and you keep running the service. Which treatment is the contract, and which treatment did you not choose?",
            answer: "The contract is transfer of 50000 dollars. You did not choose avoid, because the service still runs. Transfer does not move the incident itself, so residual still needs accept or mitigate.",
          },
          {
            prompt: "Your diagram shows a firewall and no treatment word. What is missing for CYBR 603?",
            answer: "The treatment name. A firewall is a mitigation only once you write mitigate and tie it to a scenario. Avoid, accept, mitigate, and transfer are 4 choices, and you pick 1 per scenario.",
          },
        ],
      ),
      lec(
        "l2",
        "Three levels, not one adjective",
        [
          "Categorization is a coarse impact label you assign before you shop for controls. The mechanism is a table with 3 levels: low, moderate, and high, applied to confidentiality, integrity, and availability separately. A public brochure site can be low for confidentiality and high for availability if an outage of 1 hour stops sales. You do not copy the brochure label onto the payroll store beside it. Two systems on one network can carry two different triples.",
          "You write the level from a stated harm, not from a feeling that the system is important. If a confidentiality breach exposes 200 employee records, you point at a rule you set in advance, such as 100 or more records means high. 200 meets that bar, so confidentiality is high. Availability stays whatever your outage bar says. Mixing the two into one warm adjective hides which harm you meant. The triple is 3 decisions.",
        ],
        {
          kind: "pair",
          caption: "The same network can hold two triples.",
          leftTitle: "Brochure site",
          rightTitle: "Payroll store",
          left: ["Confidentiality can be low", "One hour outage is high", "Do not copy this triple"],
          right: ["200 records meets high", "Bar was 100 records", "Availability is separate"],
        },
        "Two hundred records",
        [
          "Your written bar says 100 or more exposed employee records means high confidentiality. The scenario exposes 200.",
          "200 is at least 100, so confidentiality is high. You do not also flip availability unless the outage bar says so.",
          "The brochure site on the same network keeps its own triple. An outage of 1 hour can be high availability there and irrelevant to payroll confidentiality.",
        ],
        [
          {
            prompt: "The bar is 100 or more records for high confidentiality. A breach exposes 200 records. What level do you assign, and by how many records does it clear the bar?",
            answer: "High. 200 minus 100 is 100, so it clears the bar by 100 records. Availability is a separate decision. You do not copy this label onto a different system.",
          },
          {
            prompt: "The brochure site is low confidentiality and high availability because a 1-hour outage stops sales. May payroll inherit that pair?",
            answer: "No. Two systems can share a network and still need two triples. Payroll confidentiality follows the record bar, such as 200 against 100. The brochure outage does not set it.",
          },
        ],
      ),
      lec(
        "l3",
        "The score is a product",
        [
          "You score a scenario as likelihood times impact, both integers from 1 to 5. The product is the mechanism that lets you compare unlike stories. Likelihood 4 and impact 5 give a score of 20. An unconfirmed rumor does not get a 4. You only score a scenario you can describe with an asset, a cause, and an effect. Those are 3 clauses. A score without the clauses is a number you should not sort on.",
          "After a control, you rescore. If the control cuts likelihood from 4 to 1 and impact stays 5, the score falls from 20 to 5. The 5 is residual risk, and it is what accept or transfer must cover. You do not leave the old 20 on the chart once the control is in place and tested. A mitigation you have not tested does not earn the new likelihood.",
        ],
        {
          kind: "pair",
          caption: "Rescore only after the control is tested.",
          leftTitle: "Before the test",
          rightTitle: "After a tested control",
          left: ["Likelihood 4, impact 5", "Product is 20", "Untested work stays here"],
          right: ["Likelihood 1, impact 5", "Product is 5", "Accept or transfer the 5"],
        },
        "From 20 down to 5",
        [
          "The scenario has an asset, a cause, and an effect. Likelihood 4 times impact 5 is 20.",
          "The control is in place and the test supports likelihood 1. Impact stays 5, so the residual product is 5.",
          "You replace 20 with 5 on the chart. Accept or transfer has to cover 5, not the old 20, and not a rumor you never described.",
        ],
        [
          {
            prompt: "Likelihood is 4 and impact is 5. After a tested control, likelihood is 1 and impact is still 5. What were the two scores?",
            answer: "20 before, and 5 after. 4 times 5 is 20, and 1 times 5 is 5. The residual 5 is what accept or transfer must cover. An untested control does not earn the 1.",
          },
          {
            prompt: "You wrote the number 20 and you cannot name the asset, the cause, or the effect. How many of the 3 clauses are present?",
            answer: "0. You should not sort on that 20. A score is likelihood times impact only after the 3 clauses exist, and an unconfirmed rumor does not receive a likelihood of 4.",
          },
        ],
      ),
      lec(
        "l4",
        "Six names in order",
        [
          "You select a mitigation by tracing a scenario to a control. The mechanism is that trace. You use 6 step names and you do not merge them: categorize, select, implement, assess, authorize, and monitor. Select comes after the category. A high confidentiality system does not inherit the control set of a low brochure site. Implement is step 3 of the 6, and you record the configuration you actually deployed, not the one you planned.",
          "The Risk Management Framework is the order you just named, and you apply it to 1 system rather than to a slogan. Implement is not authorize. A control that is installed and not assessed is still at step 3. You might have 9 controls selected and only 4 implemented. You report 4, not 9. Padding the count with planned work hides the residual you still carry at the old score.",
        ],
        {
          kind: "flow",
          caption: "Do not authorize a control that is only selected.",
          steps: ["Categorize the system", "Select from that category", "Implement and record it", "Leave assess for later"],
        },
        "Nine selected, four installed",
        [
          "You categorized 1 system, then selected 9 controls that match that category. Selection is not implementation.",
          "Four of the 9 are actually deployed, and you have the configuration for those 4. You report 4.",
          "The other 5 stay planned. They do not lower last lecture's score of 20. Authorize has not started, because assess has not started.",
        ],
        [
          {
            prompt: "You selected 9 controls and implemented 4. What count do you report as implemented, and how many are still only planned?",
            answer: "Report 4 implemented. 9 minus 4 is 5 still planned. Planned controls do not change the residual score. Implement is step 3 of 6, not authorize.",
          },
          {
            prompt: "A low brochure site already has a control set. Confidentiality on the payroll store is high. May you skip categorize and reuse the brochure set?",
            answer: "No. Categorize comes before select. A high confidentiality system does not inherit a low site's controls. The 6 names stay in order: categorize, select, implement, assess, authorize, monitor.",
          },
        ],
      ),
      lec(
        "l5",
        "Evidence, then a signature",
        [
          "Assessment checks the control you implemented, and the mechanism is evidence against a stated test. If the test says inactive accounts are disabled after 30 days, you sample the account table. Suppose 5 of 20 inactive accounts are still enabled. Then 15 pass and 5 fail, and you do not write that the control works. Authorize is a person accepting the result, including those 5 failures, for a period you name, such as 180 days.",
          "You distinguish an authorization from a passing grade. The official can authorize with failures present if they record the residual score, for example likelihood 2 times impact 5 equals 10. That 10 is what they accepted. You do not let an assessor both write the finding and sign the acceptance. A package with 0 findings and 0 tests is not a strong result. It is a package that skipped assessment, which means you are not at the authorize step.",
        ],
        {
          kind: "pipeline",
          caption: "A signature sits on a sample, not on a hope.",
          stages: ["State the 30-day test", "Sample the accounts", "Record passes and fails", "A different person signs"],
        },
        "Five failures out of twenty",
        [
          "The test is disablement after 30 days. You sample 20 inactive accounts and find 5 still enabled.",
          "Fifteen pass, because 20 minus 5 is 15. You do not write that the control works.",
          "A different person may accept residual likelihood 2 times impact 5, which is 10, for 180 days. The assessor does not sign that line.",
        ],
        [
          {
            prompt: "Of 20 inactive accounts, 5 are still enabled after the 30-day test. How many passed, and may you say the control works?",
            answer: "15 passed, because 20 minus 5 is 15. You may not say the control works. Authorize can still accept the 5 failures only with a recorded residual, for a named period such as 180 days.",
          },
          {
            prompt: "Likelihood 2 times impact 5 is the residual an official is willing to sign. What is the product, and may the assessor sign it?",
            answer: "The product is 10. The assessor does not sign it. Writing the finding and accepting it are different roles. A package with 0 tests is not at the authorize step.",
          },
        ],
      ),
      lec(
        "l6",
        "The authorization expires in practice",
        [
          "Monitoring is the step that keeps an authorization from becoming a souvenir. The mechanism is a repeated measurement on a schedule. You recheck the same account test every 30 days. If the next sample shows 8 failures out of 20 instead of 5, the control got worse, and the old acceptance does not cover the new count. You reopen the score. Audit is the version of that habit: an auditor samples, and you show the record rather than the intention.",
          "You prepare for audit by tying each claim to an artifact. A claim that you disable inactive accounts needs the 30-day rule and a sample result. If the auditor pulls 10 of 40 controls, you can answer those 10 only if the artifacts exist before the visit. Building them during the meeting is not monitoring. The Cybersecurity Framework's 5 functions, identify, protect, detect, respond, and recover, are the language you use to group the artifacts.",
        ],
        {
          kind: "layers",
          caption: "Five function names for the audit folder.",
          rows: ["Identify the system", "Protect with the control", "Detect by the sample", "Respond when the count rises", "Recover under a tested plan"],
        },
        "Failures moved from 5 to 8",
        [
          "Last month, 5 of 20 inactive accounts failed the 30-day test, and someone accepted that result.",
          "This month the same test shows 8 of 20. The old acceptance does not cover 8. You reopen the score.",
          "The artifact is the sample, filed before any audit visit. If an auditor asks about 10 of 40 controls, only the ones with artifacts are answerable.",
        ],
        [
          {
            prompt: "The accepted sample had 5 failures out of 20. The next 30-day sample has 8 failures out of 20. By how many failures did the control get worse?",
            answer: "3 failures. 8 minus 5 is 3. The old acceptance does not cover the new count, so you reopen the score. Show the record, not the intention.",
          },
          {
            prompt: "An auditor pulls 10 of 40 controls. How many controls were not pulled, and when must the artifacts exist?",
            answer: "30 controls were not pulled, because 40 minus 10 is 30. Artifacts for the 10 must exist before the visit. The 5 Cybersecurity Framework functions are only the grouping language for those artifacts.",
          },
        ],
      ),
      lec(
        "l7",
        "One server you can actually name",
        [
          "You apply the whole path to 1 system you actually know, which is the mechanism that makes the framework yours. Pick a system with a boundary you can draw, such as a lab server used by 8 people. List 3 scenarios. For each, write the treatment, the score, and the control. If one scenario is likelihood 3 and impact 4, the score is 12. You do not import a generic risk register of 50 rows you cannot explain.",
          "You walk that server through authorize and monitor, not only through a spreadsheet. Suppose the chosen control is account disablement at 30 days, and your sample finds 1 failure among 8 accounts. The residual is not zero. You ask a named person to accept it or to fund a fix, and you date the decision. Transfer does not fit this scenario unless a contract states a dollar amount. Avoid would mean turning the server off. You pick one.",
        ],
        {
          kind: "flow",
          caption: "Three scenarios on one server.",
          steps: ["Draw the server boundary", "Score three scenarios", "Test the chosen control", "Date the signature"],
        },
        "One failure among eight accounts",
        [
          "The lab server has 8 people. One scenario is likelihood 3 and impact 4, so the product is 12, with a treatment and a control beside it.",
          "The 30-day sample finds 1 failure among the 8 accounts. You do not call the residual zero.",
          "A named person accepts that failure or funds a fix, with a date. You do not call it transfer unless a dollar amount is in a contract, and you do not call it avoid unless the server goes off.",
        ],
        [
          {
            prompt: "Likelihood is 3 and impact is 4. What is the score, and how many scenarios does the closing system need in total?",
            answer: "The score is 12, because 3 times 4 is 12. The system needs 3 scenarios, each with a treatment, a score, and a control. A borrowed register of 50 rows does not count.",
          },
          {
            prompt: "The server has 8 accounts and 1 of them fails the 30-day test. How many passed, and why is the residual not zero?",
            answer: "7 passed, because 8 minus 1 is 7. The residual is not zero because 1 account is still enabled. A named person must accept it or fund a fix, with a date. Avoid would mean turning the server off.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now accept or refuse",
        [
          "You can now carry one system from a category to a monitored authorization. You can assign 3 impact levels, multiply likelihood 4 by impact 5 to get 20, and rescore to 5 when likelihood falls to 1. You can say which of the 4 treatments you chose, and you can refuse a transfer that names no dollar amount. Assessment evidence, such as 5 failures out of 20, is part of the decision.",
          "The text for the hours is the NIST Risk Management Framework and the Cybersecurity Framework, read slowly and applied to the 1 system you know. These 8 lectures are the skeleton: 4 treatments, 3 levels, a product score, 6 ordered steps, and 5 functions for the audit folder. Your closing page lists 3 scenarios with scores and treatments. If a score is not a product you can recompute, this course is not finished.",
        ],
        {
          kind: "pipeline",
          caption: "The page that closes the course.",
          stages: ["Name one real system", "Write three scored scenarios", "Attach the sample", "Recompute every product"],
        },
        "Twenty, then five",
        [
          "Likelihood 4 times impact 5 is 20. After a tested control, likelihood 1 times impact 5 is 5. You can show both products.",
          "The same page names the treatment. Transfer without a dollar amount is refused. Avoid, accept, mitigate, and transfer stay distinct.",
          "The reading is the NIST Risk Management Framework and the Cybersecurity Framework, on 1 system. Three scenarios with recomputable scores close the course.",
        ],
        [
          {
            prompt: "Before the control, likelihood is 4 and impact is 5. After the tested control, likelihood is 1 and impact is 5. What are the two products?",
            answer: "20 and 5. 4 times 5 is 20, and 1 times 5 is 5. If you cannot recompute the product, this course is not finished. The 5 is the residual a person may accept.",
          },
          {
            prompt: "A sample shows 5 failures out of 20, and the transfer column names no dollars. How many accounts passed, and is transfer available?",
            answer: "15 passed, because 20 minus 5 is 15. Transfer is not available until a contract states a dollar amount. The 5 failures stay in the evidence the signature has to face.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-704",
    lectures: [
      lec(
        "l1",
        "A row you can sort twice",
        [
          "You start with a row, not with a model. The mechanism is a fixed set of columns you can fill from a log. This toy row has 5 fields: time, source address, account, action, and result. A free-text paragraph is not a row, because you cannot sort it the same way twice. You drop or repair a row that is missing the account when the question is about accounts.",
          "You separate the label from the features. The label is whether the row is malicious, and it must come from a decision you can cite, not from the same field you will predict. If you mark a row malicious because the action string contains the word fail, you have leaked the label into a feature. Suppose you have 40 rows and you labeled 6 by hand from a ticket. The other 34 stay unlabeled until you have a reason.",
        ],
        {
          kind: "layers",
          caption: "Five fields, and a label that is not one of them.",
          rows: ["Time of the event", "Source address", "Account", "Action and result", "Label from a ticket"],
        },
        "Six labels, thirty-four waiting",
        [
          "You have 40 rows with the 5 fields filled. A ticket supports labels on 6 of them.",
          "The other 34 stay unlabeled. You do not mark a row malicious because the action text says fail.",
          "A row missing the account is dropped or repaired before any count about accounts. Free text never becomes a sixth hidden column.",
        ],
        [
          {
            prompt: "You have 40 rows and tickets support labels on 6. How many rows stay unlabeled?",
            answer: "34. 40 minus 6 is 34. Those 34 stay unlabeled until you have a reason. Copying the word fail from the action field into the label is leakage, not a reason.",
          },
          {
            prompt: "The question is about accounts, and a row has time, address, action, and result, but no account. What do you do with it before you count?",
            answer: "You drop it or repair it. The toy row has 5 fields, and account is one of them. A paragraph of free text is not a substitute column.",
          },
        ],
      ),
      lec(
        "l2",
        "The denominator is the story",
        [
          "A base rate is the count of the class divided by the count of rows, and it is the mechanism behind every later percentage. If 2 of 50 flows are malicious, the base rate is 2/50, which is 1/25, or 0.04. A detector that flags everything scores a recall of 1 and is still useless, because 48 of the 50 flags are false. You write the base rate on the page before you praise a model.",
          "You keep the units straight when you compare two days. Day 1 has 2 malicious flows out of 50, rate 0.04. Day 2 has 2 malicious flows out of 200, rate 0.01. The count stayed at 2, and the rate fell by a factor of 4, because 0.04 divided by 0.01 is 4. You do not say the attack doubled. You say the count was flat and the denominator changed.",
        ],
        {
          kind: "pair",
          caption: "Same count, different rate.",
          leftTitle: "Day 1",
          rightTitle: "Day 2",
          left: ["2 malicious out of 50", "Rate is 0.04", "Write this before the model"],
          right: ["2 malicious out of 200", "Rate is 0.01", "The count did not double"],
        },
        "Two malicious, two denominators",
        [
          "Day 1: 2 of 50, which is 0.04. Day 2: 2 of 200, which is 0.01.",
          "The ratio of the rates is 0.04 divided by 0.01, which is 4. The malicious count stayed 2.",
          "A detector that flags all 50 flows on day 1 has 48 false flags. You write 0.04 on the page before you talk about that detector.",
        ],
        [
          {
            prompt: "Day 1 has 2 malicious flows out of 50, and day 2 has 2 out of 200. What are the two rates, and by what factor did the rate fall?",
            answer: "The rates are 0.04 and 0.01. The factor is 4, because 0.04 divided by 0.01 is 4. The count stayed 2, so you do not say the count doubled.",
          },
          {
            prompt: "A detector flags all 50 flows, and 2 are malicious. How many flags are false?",
            answer: "48. 50 minus 2 is 48. Recall can be 1 and the detector is still useless at a base rate of 2/50, which is 0.04. Write that rate before you praise the model.",
          },
        ],
      ),
      lec(
        "l3",
        "Precision is a fraction",
        [
          "A supervised detector maps features to a score, and the mechanism you control is the threshold. You flag a row when its score is at least 7. In a batch of 10 scores, the values 9, 8, and 7 are flags, and the value 6 is not. That is 3 flags. If 2 of those 3 are truly malicious, precision is 2/3. You report 2/3, not a claim that the model works.",
          "You train on rows that already have labels, and you test on rows you did not train on. If you have 40 labeled rows, a 30 and 10 split means you fit on 30 and you measure precision on 10. Measuring on the 30 is not a test. A threshold you picked because it looked good on the test 10 is no longer an honest test of those 10. You would need a fresh slice.",
        ],
        {
          kind: "pipeline",
          caption: "Fit, then measure on rows you held out.",
          stages: ["Fit on 30 labeled rows", "Score the other 10", "Flag scores of at least 7", "Report precision as a fraction"],
        },
        "Three flags, two true",
        [
          "Scores at or above 7 are flags. In the batch, 9, 8, and 7 qualify, and 6 does not. That is 3 flags.",
          "Two of the 3 are truly malicious. Precision is 2/3. You write the fraction.",
          "Those 3 were inside the held-out 10, not inside the 30 you fit. If you chose the threshold 7 because of these 10, you need a fresh slice before you quote 2/3 again.",
        ],
        [
          {
            prompt: "The threshold is 7. The scores include 9, 8, 7, and 6. How many of these four are flags, and what is precision if 2 of the flags are true?",
            answer: "3 flags. The score 6 is not a flag. Precision is 2/3. You report 2/3, and you do not measure it on the 30 rows you trained on.",
          },
          {
            prompt: "You have 40 labeled rows and you fit on 30. How many rows are in the test split?",
            answer: "10. 40 minus 30 is 10. Measuring precision on the 30 is not a test. A threshold chosen to look good on that same 10 needs a fresh slice.",
          },
        ],
      ),
      lec(
        "l4",
        "Distance, then a cutoff",
        [
          "Clustering groups rows by distance, with no label. The mechanism is a distance you compute and a cutoff you state. Take two points in the plane, (0, 0) and (3, 4). The squared distance is 3 squared plus 4 squared, which is 9 plus 16, which is 25, so the distance is 5. If your cutoff is 6, these two points can share a cluster. A cutoff of 4 would separate them.",
          "You do not treat cluster size as malice. A cluster of 30 rows can be the nightly backup, and a cluster of 2 can be a mistake in your distance. You name a cluster by the feature that pulled it together, such as the same account on 30 rows. If you change the cutoff from 6 to 2, you should expect the 30 to split, and you recompute before you brief anyone.",
        ],
        {
          kind: "flow",
          caption: "A cluster is a cutoff plus a distance.",
          steps: ["Square each coordinate gap", "Add, then take the root", "Compare with the cutoff", "Name the shared feature"],
        },
        "Three, four, and a cutoff of six",
        [
          "The points are (0, 0) and (3, 4). 3 squared is 9 and 4 squared is 16. 9 plus 16 is 25, and the distance is 5.",
          "The cutoff is 6, and 5 is within 6, so these two points may share a cluster. A cutoff of 4 would refuse them.",
          "If that cluster later has 30 rows, you name the feature they share. You do not brief the 30 as malice, and you recompute if the cutoff moves from 6 to 2.",
        ],
        [
          {
            prompt: "What is the distance between (0, 0) and (3, 4)? Show the sum of squares.",
            answer: "5. 3 squared is 9, 4 squared is 16, and 9 plus 16 is 25. The positive root of 25 is 5. A cutoff of 6 includes the pair. A cutoff of 4 does not.",
          },
          {
            prompt: "A cluster contains 30 rows that share an account, and you lower the cutoff from 6 to 2. What must you do before you brief the 30 as one group?",
            answer: "Recompute the clusters at cutoff 2. The 30 may split. Size is not malice, and a nightly backup of 30 rows is still a backup until the distance says otherwise.",
          },
        ],
      ),
      lec(
        "l5",
        "Far from a quiet mean",
        [
          "Anomaly detection flags a point far from a summary of the rest, and the mechanism is a distance from the mean. Take the four counts 3, 4, 4, and 5. Their sum is 16, so the mean is 16 divided by 4, which is 4. A new count of 10 sits at distance 6 from that mean. If your rule flags a distance of 5 or more, you flag 10, and you do not flag 5, whose distance is 1.",
          "You choose the summary from data you believe is ordinary. If the mean of 4 was computed with the 10 already inside, the mean moves and the distance shrinks, which hides the point you wanted to see. With values 3, 4, 4, 5, and 10, the sum is 26 and the mean is 26 divided by 5, which is 5.2. Distance from 10 to 5.2 is 4.8, and a threshold of 5 would miss it.",
        ],
        {
          kind: "pair",
          caption: "The mean you fit changes the distance.",
          leftTitle: "Quiet baseline",
          rightTitle: "Point folded in",
          left: ["Mean of 3, 4, 4, 5 is 4", "Distance of 10 is 6", "Threshold 5 flags it"],
          right: ["Sum 26 over 5 is 5.2", "Distance of 10 is 4.8", "Threshold 5 misses it"],
        },
        "Sixteen divided by four",
        [
          "The quiet counts are 3, 4, 4, and 5. The sum is 16 and the mean is 4.",
          "The new count 10 has distance 6. Your rule flags distance 5 or more, so you flag 10. The count 5 has distance 1 and stays quiet.",
          "If you instead average 3, 4, 4, 5, and 10, the sum is 26 and the mean is 5.2. The distance 4.8 no longer clears a threshold of 5.",
        ],
        [
          {
            prompt: "The quiet counts are 3, 4, 4, and 5. What is their mean, and what is the distance of a new count of 10?",
            answer: "The mean is 4, because the sum 16 divided by 4 is 4. The distance is 6, because 10 minus 4 is 6. A threshold of 5 flags 10. The count 5 has distance 1 and is not flagged.",
          },
          {
            prompt: "You fold 10 into the same list, so the values are 3, 4, 4, 5, and 10. What is the mean, and does distance from 10 clear a threshold of 5?",
            answer: "The mean is 5.2, because the sum is 26 and 26 divided by 5 is 5.2. The distance is 4.8, which does not clear 5. Fit the mean on the quiet baseline, then score the new point.",
          },
        ],
      ),
      lec(
        "l6",
        "One identifier the row supports",
        [
          "You map a detection to a phenomenon with a taxonomy, and the mechanism is one technique identifier per alert, backed by a field in the row. MITRE ATT&CK is the taxonomy you use for the names. You attach an identifier only when the row supports it. Four failed logins for one account in 1 minute can support a guessing label. A row that only says connection opened does not. You do not attach 12 identifiers to look thorough.",
          "You keep tactics and techniques in their lanes. A tactic is a goal name. A technique is a narrower behavior. If your alert shows 4 failures and you only write the tactic credential access, you have not said what happened. The technique identifier is the sentence that can be checked against the 4 failures. CS 229 does not teach these names, so you read the taxonomy beside the estimator, not instead of it.",
        ],
        {
          kind: "flow",
          caption: "A name is allowed only with a field behind it.",
          steps: ["Read the row fields", "Pick one technique", "Reject a bare tactic", "Leave unsupported names off"],
        },
        "Four failures, one name",
        [
          "The row shows 4 failed logins for one account inside 1 minute. That field can support one guessing technique identifier.",
          "You do not stop at the tactic name credential access. The technique has to be checkable against the 4 failures.",
          "A different row that only says connection opened gets no identifier. You do not add 12 names. CS 229 remains the estimator course, and ATT&CK remains the name list.",
        ],
        [
          {
            prompt: "An alert shows 4 failed logins in 1 minute, and the writeup names only the tactic credential access. What is missing?",
            answer: "The technique identifier that the 4 failures can check. A tactic is only a goal name. You attach 1 identifier the row supports, not 12, and a bare connection-opened row gets none.",
          },
          {
            prompt: "You attached 12 technique identifiers to one connection-opened row so the map would look complete. How many does the row support in this example?",
            answer: "0. Connection opened does not support a guessing label. Four failed logins for one account in 1 minute could support 1 identifier. CS 229 does not supply these names.",
          },
        ],
      ),
      lec(
        "l7",
        "Buckets before color",
        [
          "Visualization for this course is a count you can recompute, and the mechanism is a time bucket. You slice one hour into 6 buckets of 10 minutes. If the failure counts in those buckets are 1, 1, 1, 1, 1, and 9, the last bucket holds 9 of the 14 failures. You plot the 6 numbers, and you do not smooth them into a single hourly total of 14 before you look. The spike is the 9.",
          "You annotate the bucket with the rows that fell in it, or the picture cannot be audited. The 9 failures should point at 9 rows, each with the 5 fields from the first lecture. If 2 of the 9 are missing an account, you have 7 usable rows, and you say 7. Color is not a scale. If you paint high counts red, you still print the numeral 9, because a reader cannot reverse a color into a count.",
        ],
        {
          kind: "pipeline",
          caption: "From one hour to a spike you can audit.",
          stages: ["Cut six 10-minute buckets", "Count failures in each", "Point at the rows", "Print the numeral"],
        },
        "Nine of fourteen in the last bucket",
        [
          "The six buckets hold 1, 1, 1, 1, 1, and 9 failures. The sum is 14, and the last bucket holds 9.",
          "You plot all 6 numbers. You do not replace them with the single total 14 before you look.",
          "Two of the 9 rows lack an account, so you cite 7 usable rows. The chart still prints 9, even if that bar is red.",
        ],
        [
          {
            prompt: "Bucket counts are 1, 1, 1, 1, 1, and 9. What is the hourly total, and how many failures sit in the last bucket?",
            answer: "The total is 14, and the last bucket holds 9. You plot the 6 numbers. Smoothing to 14 before you look hides the spike.",
          },
          {
            prompt: "The last bucket has 9 failure rows and 2 of them lack an account. How many usable rows do you cite?",
            answer: "7. 9 minus 2 is 7. You still print the numeral 9. Color is not a scale, and each usable row should carry the 5 fields.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now measure",
        [
          "You can now turn a log into a count someone else can repeat. A row has 5 fields, and a label is not copied from the action text. A base rate of 2 out of 50 is 0.04, and the same count out of 200 is 0.01. Precision on 2 true flags out of 3 flags is 2/3. The distance from (0, 0) to (3, 4) is 5. Mean 4 and threshold 5 flag a distance of 6.",
          "The methods path is CS 229, with anomaly detection included, and the names path is MITRE ATT&CK. You do not swap them. After both, you practice on 1 public dataset. Your closing check is the mean of 3, 4, 4, and 5, which is 4, and the distance of the point 10, which is 6. If you cannot show that arithmetic, or you cannot say which 1 technique the 4 failures support, this course is not finished.",
        ],
        {
          kind: "layers",
          caption: "Counts that close the course.",
          rows: ["Base rate before praise", "Precision on held-out rows", "Distance against a cutoff", "One technique per alert"],
        },
        "Mean 4, distance 6",
        [
          "Quiet counts 3, 4, 4, and 5 sum to 16. Divided by 4, the mean is 4. The point 10 sits at distance 6, which clears a threshold of 5.",
          "Separately, (0, 0) to (3, 4) is distance 5, and 2 true flags out of 3 is precision 2/3.",
          "You name 1 ATT&CK technique for the 4 failures, using CS 229 only for the estimator. A missing subtraction means this course is not finished.",
        ],
        [
          {
            prompt: "What is the mean of 3, 4, 4, and 5, and what is the distance from that mean to 10? Does a threshold of 5 flag it?",
            answer: "The mean is 4, because 16 divided by 4 is 4. The distance is 6, because 10 minus 4 is 6. Yes, 6 clears a threshold of 5. Folding 10 into the mean is a different, worse summary.",
          },
          {
            prompt: "Precision is 2 true flags out of 3 flags, and the points (0, 0) and (3, 4) are one cluster candidate. What are the precision and the distance?",
            answer: "Precision is 2/3. The distance is 5, because 9 plus 16 is 25 and the root of 25 is 5. You still owe 1 technique name for a row that shows 4 failures, or this course is not finished.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-711",
    lectures: [
      lec(
        "l1",
        "One key, one ciphertext",
        [
          "Perfect secrecy is a definition, and the one-time pad is the mechanism that meets it for a single use. Let the message bits be 1011 and the key bits be 1101. Bitwise, 1 XOR 1 is 0, 0 XOR 1 is 1, 1 XOR 0 is 1, and 1 XOR 1 is 0, so the ciphertext is 0110. You decrypt by XOR with the same key: 0110 XOR 1101 returns 1011. Use the key once.",
          "You use the count of keys to see why one ciphertext hides the message. A 4-bit message has 16 possible keys if the key is uniform and independent of the message. For any fixed message and any fixed ciphertext, exactly 1 of those 16 keys produces that ciphertext, namely the XOR of the two strings. So each ciphertext has probability 1/16 given the message. STAT 211 is the probability prerequisite, and CSCE 411 is the algorithms prerequisite.",
        ],
        {
          kind: "pipeline",
          caption: "Encrypt and decrypt by the same XOR.",
          stages: ["Line up message and key", "XOR each bit once", "Send only the ciphertext", "XOR the key again"],
        },
        "1011 XOR 1101",
        [
          "Message 1011 and key 1101. The four XOR bits are 0, 1, 1, and 0, so the ciphertext is 0110.",
          "Decrypt: 0110 XOR 1101. The bits return 1, 0, 1, and 1, which is the message 1011.",
          "There are 16 keys of length 4. Exactly 1 of them maps this message to this ciphertext. You do not reuse the key on a second message.",
        ],
        [
          {
            prompt: "Message bits are 1011 and the key is 1101. What is the ciphertext, and what do you get if you XOR that ciphertext with 1101 again?",
            answer: "The ciphertext is 0110. XOR with 1101 again returns 1011. Each bit of 1011 XOR 1101 is 0, 1, 1, 0. The key is used once.",
          },
          {
            prompt: "The message is 4 bits and the key is uniform. How many keys are there, and how many of them map one fixed message to one fixed ciphertext?",
            answer: "There are 16 keys. Exactly 1 of them works, so the ciphertext probability given the message is 1/16. STAT 211 and CSCE 411 are the prerequisites for this counting.",
          },
        ],
      ),
      lec(
        "l2",
        "Advantage is a subtraction",
        [
          "Indistinguishability is an experiment, and the mechanism is a hidden bit. You send two equal-length messages. The challenger encrypts one, chosen by a bit that is 0 or 1 with equal chance, and you guess that bit. Right on 6 of 10 trials means success rate 6/10, which is 3/5. Blind guessing is right with probability 1/2. Advantage is 3/5 minus 1/2, which equals 1/10.",
          "You compare the advantage to a bound you wrote before the experiment. Suppose the bound is 1/20. Your advantage of 1/10 equals 2/20, which is larger than 1/20, so this adversary breaks the bound you set. An advantage of 0 would mean 5 of 10 expected from pure guessing, not a moral victory. You also refuse a comparison across unequal message lengths, because the experiment required equal length.",
        ],
        {
          kind: "pair",
          caption: "A bound you wrote before you counted wins.",
          leftTitle: "This experiment",
          rightTitle: "The bound",
          left: ["6 wins out of 10", "Rate 3/5", "Advantage 1/10"],
          right: ["Bound was 1/20", "1/10 equals 2/20", "2/20 breaks 1/20"],
        },
        "Six wins out of ten",
        [
          "You are right on 6 of 10 trials. 6/10 is 3/5. Blind guessing is 1/2.",
          "Subtract: 3/5 minus 1/2 is 1/10. That is the advantage you report.",
          "The bound on the page is 1/20. Since 1/10 is 2/20, the bound fails. You do not rerun the experiment with messages of different lengths.",
        ],
        [
          {
            prompt: "An adversary is right on 6 of 10 trials. What is the success rate as a fraction in lowest terms, and what is the advantage over 1/2?",
            answer: "The success rate is 3/5. The advantage is 1/10, because 3/5 minus 1/2 is 1/10. Five wins out of 10 would have been advantage 0.",
          },
          {
            prompt: "The written bound is 1/20 and the advantage is 1/10. Does the adversary break the bound? Express both with denominator 20.",
            answer: "Yes. 1/10 is 2/20, and 2/20 is larger than 1/20. The messages in the experiment also have to be equal length, or the comparison is refused.",
          },
        ],
      ),
      lec(
        "l3",
        "Sixteen strings out of 256",
        [
          "A pseudorandom generator stretches a short seed, and it does not give you the pad's perfect secrecy. The mechanism is expansion: a 4-bit seed has 16 possible values, and an 8-bit output has 256 possible strings. At most 16 of those 256 strings are generator outputs, a fraction of 16/256, which is 1/16. If you see a string outside that set of 16, you know it was not produced by the generator.",
          "You count fresh bits before you reuse a stretched string as a pad. One 8-bit generator output, from a 4-bit seed, is being asked to hide 8 message bits. The one-time pad would have required 8 fresh key bits, so the deficit is 8 minus 4, which is 4. What replaces the information-theoretic claim is a computational bound: a distinguisher you care about should have advantage under 1/16 on the test you stated.",
        ],
        {
          kind: "flow",
          caption: "Expansion is a count, not a new pad.",
          steps: ["Count the seeds", "Count the output strings", "Divide to get the fraction", "State a numeric bound"],
        },
        "A four-bit seed, an eight-bit string",
        [
          "Seeds: 2 to the 4th is 16. Outputs: 2 to the 8th is 256. At most 16 outputs occur, and 16/256 is 1/16.",
          "Using one such output to hide 8 message bits leaves a deficit of 4 fresh bits, because 8 minus 4 is 4.",
          "You replace the perfect-secrecy claim with a bound, advantage under 1/16 for the distinguisher you named. A string outside the image set is not generator output.",
        ],
        [
          {
            prompt: "A generator stretches a 4-bit seed to 8 bits. How many seeds are there, how many 8-bit strings are there, and what fraction of strings can be outputs?",
            answer: "16 seeds and 256 strings. The fraction is 16/256, which is 1/16. A string outside those at most 16 outputs was not produced by the generator.",
          },
          {
            prompt: "You hide 8 message bits with a pad derived from a 4-bit seed. How many fresh key bits is the construction short of a one-time pad?",
            answer: "4. The pad would need 8 fresh bits, and 8 minus 4 is 4. The replacement claim is computational: advantage under a stated bound such as 1/16, not perfect secrecy.",
          },
        ],
      ),
      lec(
        "l4",
        "Two ciphertexts, the key cancels",
        [
          "Reusing a pad destroys the subtraction you just trusted. The mechanism of the failure is the XOR of two ciphertexts. Let the key be 0110, the first message 1010, and the second message 1100. Then 1010 XOR 0110 is 1100, and 1100 XOR 0110 is 1010. XOR the ciphertexts: 1100 XOR 1010 is 0110. XOR the messages: 1010 XOR 1100 is 0110. The two results match, so the key canceled.",
          "A fresh key for the second message stops that cancellation from being about the messages alone. If the second key is 0011 instead of 0110, the second ciphertext is 1100 XOR 0011, which is 1111. Then the ciphertext XOR is 1100 XOR 1111, which is 0011, while the message XOR is still 0110. They differ, so you no longer read the message XOR directly. Security here means the hidden-bit advantage stays under a bound such as 1/20.",
        ],
        {
          kind: "pair",
          caption: "Reuse lets the messages show through.",
          leftTitle: "Same key 0110",
          rightTitle: "Second key 0011",
          left: ["Ciphertext XOR is 0110", "Message XOR is 0110", "The key canceled"],
          right: ["Ciphertext XOR is 0011", "Message XOR is still 0110", "They no longer match"],
        },
        "1010 and 1100 under one key",
        [
          "Key 0110. First ciphertext is 1010 XOR 0110, which is 1100. Second ciphertext is 1100 XOR 0110, which is 1010.",
          "Ciphertext XOR is 1100 XOR 1010, which is 0110. Message XOR is 1010 XOR 1100, which is also 0110.",
          "Change the second key to 0011 and the second ciphertext becomes 1111. Ciphertext XOR is then 0011, not the message XOR 0110.",
        ],
        [
          {
            prompt: "Key 0110, messages 1010 and 1100. What is the XOR of the two ciphertexts, and what is the XOR of the two messages?",
            answer: "Both are 0110. 1010 XOR 0110 is 1100, 1100 XOR 0110 is 1010, and 1100 XOR 1010 is 0110. The matching message XOR means the key canceled.",
          },
          {
            prompt: "The second key is 0011 instead, and the first ciphertext is still 1100. What is the second ciphertext, and what is the ciphertext XOR?",
            answer: "The second ciphertext is 1111, because 1100 XOR 0011 is 1111. The ciphertext XOR is 0011, because 1100 XOR 1111 is 0011. The message XOR remains 0110, so they differ. Keep the hidden-bit advantage under a bound such as 1/20.",
          },
        ],
      ),
      lec(
        "l5",
        "Exponents that invert",
        [
          "A public-key scheme uses a key you can publish and a different key you keep. The mechanism in this toy is exponentiation modulo n. Take primes 5 and 11, so n is 55. There are 40 integers below 55 coprime to 55. Private exponent 27 inverts public exponent 3 because 3 times 27 is 81, and 81 minus 2 times 40 is 1. Publishing 3 and 55 does not publish the factors 5 and 11.",
          "You encrypt the message 2 by raising it to the public exponent. Compute 2 cubed, which is 8, and 8 mod 55 is 8, so the ciphertext is 8. Decryption raises 8 to the 27th power mod 55. You can build that power by squares: 8 squared is 64, and 64 minus 55 is 9. Then 9 squared is 81, and 81 minus 55 is 26, so 8 to the 4th is 26.",
        ],
        {
          kind: "pipeline",
          caption: "Check the inverse, then the ciphertext.",
          stages: ["Multiply the primes", "Check 3 times 27", "Cube the message", "Square up to exponent 27"],
        },
        "Ciphertext 8 comes back to 2",
        [
          "n is 5 times 11, which is 55. 3 times 27 is 81, and 2 times 40 is 80, so 81 minus 80 is 1. The exponents invert.",
          "Encrypt message 2 as 2 cubed mod 55, which is 8. Then 8 squared is 64, and 64 minus 55 is 9. 9 squared is 81, and 81 minus 55 is 26, so 8 to the 4th is 26.",
          "Continue: 26 squared is 676, and 55 times 12 is 660, so 8 to the 8th is 16. 16 squared is 256, and 55 times 4 is 220, so 8 to the 16th is 36. Then 36 times 16 is 576, which is 26 mod 55; 26 times 9 is 234, which is 14 mod 55; 14 times 8 is 112, which is 2 mod 55.",
        ],
        [
          {
            prompt: "Compute 3 times 27, compute 2 times 40, and subtract. What do you get, and why does it matter for exponents 3 and 27?",
            answer: "81 minus 80 is 1. So 3 times 27 is 1 more than a multiple of 40, and 27 inverts 3 modulo 40. Publishing 3 and n=55 does not publish the factors 5 and 11.",
          },
          {
            prompt: "The public exponent is 3, n is 55, and the message is 2. What is the ciphertext? After reducing 8 squared mod 55, what residue do you have?",
            answer: "The ciphertext is 8, because 2 cubed is 8 and 8 mod 55 is 8. 8 squared is 64, and 64 minus 55 is 9. Full decryption of 8 to the 27th mod 55 returns 2.",
          },
        ],
      ),
      lec(
        "l6",
        "Cube the signature",
        [
          "A signature is not encryption run backward as a privacy tool. The mechanism is a private exponent on a short digest, checked with the public exponent. Using the same toy, sign the digest 2: 2 to the 27th mod 55. Because 2 to the 20th is 1 mod 55, and 2 to the 7th is 128, which is 2 times 55 plus 18, the signature is 18. You check with public exponent 3.",
          "Verification raises the signature to the public exponent. Compute 18 squared, which is 324. Then 324 minus 5 times 55: 5 times 55 is 275, and 324 minus 275 is 49. Now multiply by 18, because the public exponent is 3, so you need one more factor of 18. 49 times 18 is 882. Then 16 times 55 is 880, and 882 minus 880 is 2. The result 2 matches the digest, so you accept.",
        ],
        {
          kind: "flow",
          caption: "Verify in public, sign in private.",
          steps: ["Raise digest 2 to 27", "Reduce mod 55 to 18", "Cube 18 mod 55", "Accept only if you get 2"],
        },
        "18 cubed returns 2",
        [
          "2 to the 20th is 1 mod 55, and 2 to the 7th is 128, which is 110 plus 18. The signature on digest 2 is 18.",
          "18 squared is 324. Subtract 275, which is 5 times 55, and get 49. 49 times 18 is 882.",
          "Subtract 880, which is 16 times 55, and get 2. The digest matches, so you accept. A result of anything but 2 is a reject.",
        ],
        [
          {
            prompt: "Sign digest 2 with private exponent 27 modulo 55. 2 to the 20th is 1 mod 55, and 2 to the 7th is 128. What is the signature?",
            answer: "18. 128 minus 2 times 55 is 128 minus 110, which is 18. Because 2 to the 20th contributes a factor of 1, 2 to the 27th is 18 mod 55.",
          },
          {
            prompt: "Verify signature 18 by cubing it mod 55. What is 18 squared mod 55, and what is the final residue?",
            answer: "18 squared is 324, and 324 minus 275 is 49, so the square is 49 mod 55. Then 49 times 18 is 882, and 882 minus 880 is 2. You accept because 2 matches the digest.",
          },
        ],
      ),
      lec(
        "l7",
        "Four rounds, one sixteenth",
        [
          "Zero knowledge convinces a verifier without handing over the secret. The mechanism is a challenge you could have simulated. In this toy the verifier sends 1 bit, 0 or 1. An honest prover who knows the secret answers either bit and is accepted. A cheating prover who can answer only 1 of the 2 bits succeeds with probability 1/2 on that round. Over 4 independent rounds the cheat probability is 1/2 to the 4th, which is 1/16.",
          "The simulator is how you test the zero-knowledge claim. It picks the challenge bit first, then builds a transcript that accepts for that bit, with no help from the prover. On 1 round it can always do this for the bit it picked, which is 1 of 2 bits. That transcript is not evidence the simulator knows the secret. It is evidence the view is easy to fake.",
        ],
        {
          kind: "layers",
          caption: "What four challenge rounds change.",
          rows: ["One round: cheat chance 1/2", "Simulator picks the bit first", "Honest prover passes either bit", "Four rounds: cheat chance 1/16"],
        },
        "A cheater faces four bits",
        [
          "Each round the verifier sends 1 bit. A cheater who prepared only 1 of the 2 answers succeeds with probability 1/2.",
          "Four independent rounds multiply: 1/2 times 1/2 times 1/2 times 1/2 is 1/16.",
          "The simulator picks its bit first and fakes that one answer. The fake transcript does not mean the simulator knows the secret. You still require all 4 rounds to pass.",
        ],
        [
          {
            prompt: "A cheater succeeds on one challenge bit with probability 1/2. What is the success probability over 4 independent rounds?",
            answer: "1/16. That is 1/2 to the 4th, or 1/2 times 1/2 times 1/2 times 1/2. You accept only when all 4 rounds pass.",
          },
          {
            prompt: "The simulator picks 1 of 2 challenge bits before it builds the transcript. Does that transcript show the simulator knows the secret?",
            answer: "No. It shows the verifier's view can be faked for the bit the simulator already chose. Soundness is the separate 1/16 bound on a cheater across 4 rounds.",
          },
        ],
      ),
      lec(
        "l8",
        "What you can now compute",
        [
          "You add secret inputs using additive shares. That is the mechanism. They want 6 plus 7, which is 13. Split 6 into 2 plus 4, and split 7 into 1 plus 6. A holds 2 and 1, and adds them to get a local sum of 3. B holds 4 and 6, and adds them to get 10. They add the local sums, 3 plus 10, and get 13.",
          "Boneh's Cryptography I and the Boneh-Shoup book are the path you stay on. If definitions are unfriendly in week 1, use Christof Paar for that week only, then return. Your closing check is the pad: 1011 XOR 1101 equals 0110, and the share sum 3 plus 10 equals 13. You also recompute advantage 1/10 from 6 of 10 trials before you call the definition done. If either closing number is wrong on your page, this course is not finished.",
        ],
        {
          kind: "pipeline",
          caption: "Shares that reconstruct to 13.",
          stages: ["Split 6 into 2 and 4", "Split 7 into 1 and 6", "Add locally to 3 and 10", "Add those to get 13"],
        },
        "Local sums 3 and 10",
        [
          "x is 6, shared as 2 and 4. y is 7, shared as 1 and 6. Neither party holds both pieces of either input.",
          "A adds 2 plus 1 and gets 3. B adds 4 plus 6 and gets 10. 3 plus 10 is 13, and 6 plus 7 is 13.",
          "You close by also checking 1011 XOR 1101, which is 0110, and 6 wins out of 10, which is advantage 1/10. Boneh is the path after a week of Paar if you need it.",
        ],
        [
          {
            prompt: "Party A holds shares 2 and 1. Party B holds shares 4 and 6. What are the two local sums, and what is the reconstructed total? Check it against 6 plus 7.",
            answer: "The local sums are 3 and 10. The total is 13, because 3 plus 10 is 13, and 6 plus 7 is also 13. A did not see 7, and B did not see 6.",
          },
          {
            prompt: "The closing pad check uses message 1011 and key 1101. What is the ciphertext? Separately, 6 wins out of 10 trials gives what advantage over 1/2?",
            answer: "The ciphertext is 0110. The advantage is 1/10, because 6/10 is 3/5, and 3/5 minus 1/2 is 1/10. If either number is wrong, this course is not finished.",
          },
        ],
      ),
    ],
  },
];
