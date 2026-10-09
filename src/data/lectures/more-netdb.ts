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

export const moreNetDb: CoursePack[] = [
  {
    slug: "csce-612",
    lectures: [
      week(
        "l6",
        "Names and requests",
        [
          "An application does not send packets to a path. It sends a request to a name. DNS maps the name to an address. The mapping is cached, and a cache can be stale for as long as the time-to-live it stored. A failure that lasts exactly that long is often a DNS failure, not a routing failure.",
          "HTTP is a request and a response over a reliable byte stream. The version you should be able to read by hand has a method, a path, headers, and an optional body. The status code is the contract. A 200 with an error inside the body is a broken contract. A 404 is a successful delivery of a refusal.",
          "The reliable byte stream under HTTP does not know that HTTP exists. It delivers bytes in order, or it fails. Framing those bytes into requests is the application's job. If you lose the framing, you will parse the next request as the rest of the previous body.",
          "Timeouts belong at this layer too. A request that waits forever for a server that has gone is not reliable. It is stuck. Choose a timeout and say what the user sees when it fires.",
        ],
        { kind: "pipeline", caption: "From a name to a response.", stages: ["Resolve the name", "Open a byte stream", "Send a framed request", "Read a status and a body"] },
        "One stale cache",
        [
          "A record says the address is 10.0.0.1 for 300 seconds. The host moves to 10.0.0.2 at second 10.",
          "Resolvers that cached the record keep using 10.0.0.1 until the 300 seconds end. The routing table can be perfect and the connection still fails.",
          "The fix is a shorter time-to-live, or an explicit flush, not a new route. Identify the layer before you debug it.",
        ],
        [
          {
            prompt: "A client reads bytes until the connection closes and treats them as one HTTP response. What goes wrong if the server keeps the connection open for a second request?",
            answer: "The client blocks until the timeout or the close, and it may glue two responses together or wait forever. Framing uses the content length or chunking, not the close. Persistent connections require that framing.",
          },
          {
            prompt: "Why is a 200 response with a body that says 'error' a contract bug?",
            answer: "Intermediaries and clients branch on the status. A 200 will be cached and treated as success. The error belongs in a 4xx or 5xx code. The body can explain it. The body cannot replace it.",
          },
        ],
      ),
      week(
        "l7",
        "Congestion control, numerically",
        [
          "The earlier lecture said two senders share a link. This week is the rule TCP uses. Additive increase, multiplicative decrease: each round-trip without loss adds one segment to the congestion window, and a loss cuts the window in half. The window is the number of unacknowledged bytes the sender may have in flight.",
          "Slow start doubles the window every round-trip until a threshold, then additive increase takes over. It is how a new connection finds a rate without being told the link speed. It overshoots, loses a packet, and cuts back. That loss is the probe, not necessarily a failure of the path.",
          "Fairness in this model means two flows that share a bottleneck and use the same rule converge toward equal windows. A flow that does not cut on loss takes the link. That is why a UDP sender that ignores loss is not 'more efficient TCP.' It is a flow that refused the rule the others are using.",
          "Bufferbloat is a large queue that delays the loss signal. The window grows until the buffer fills, and the delay rises long before the throughput does. A smaller buffer, or an explicit signal, tells the sender sooner. Capacity and delay are different axes.",
        ],
        { kind: "layers", caption: "One cycle of AIMD.", rows: ["Window 8, a loss", "Window becomes 4", "Four quiet round-trips add 1 each", "Window returns to 8 and probes again"] },
        "Two flows, one link",
        [
          "The link carries 16 segments per round-trip. Flow A has window 12, flow B has window 4. Both see loss when the sum exceeds 16.",
          "Both cut in half: A becomes 6, B becomes 2. Sum is 8, under the link.",
          "Each additive increase raises both by 1 per round-trip. They meet near 8 and 8. The larger flow cut more in absolute segments. That is the fairness argument, and it assumes both flows obey the cut.",
        ],
        [
          {
            prompt: "Flow B never reduces its window on loss. What happens to flow A if A obeys AIMD?",
            answer: "A keeps cutting and B does not, so B occupies the link and A's window ratchets toward zero. AIMD fairness requires both sides to decrease. A polite flow against a greedy flow loses.",
          },
          {
            prompt: "The buffer holds 1000 packets and the bandwidth-delay product is 10 packets. Why can delay be large while throughput looks fine?",
            answer: "The sender fills the buffer. Throughput stays at the link rate, and each packet waits behind hundreds of others. The user sees delay. A loss-only signal arrives only after the buffer is full. The queue, not the link, is the latency.",
          },
        ],
      ),
      week(
        "l8",
        "Routing protocols",
        [
          "Distance-vector routing exchanges, with each neighbor, the cost to every destination. A router sets its cost to a destination to the minimum, over neighbors, of the link cost plus the neighbor's advertised cost. The information is only a distance. The path is implicit. Count-to-infinity is the failure: when a link dies, routers that still point at each other increment the distance forever, or until a cap.",
          "Split horizon and a maximum distance reduce that failure and do not make it impossible in every topology. Link-state routing floods the map. Each router computes shortest paths on the same graph. A failed link is a flooded fact, not a rumor about a distance. The cost is the flood and the requirement that the maps converge to one picture.",
          "The earlier shortest-path lecture is the algorithm inside link state. The protocol is how the inputs arrive and how you avoid acting on a partial flood. A router that runs Dijkstra on a half-updated map will black-hole traffic until the rest of the flood arrives.",
          "Policy is not shortest paths. An organization may refuse to carry traffic that is not its customer, even when it has a cheap path. BGP exists because the Internet is a set of policies. Pretending every route is Dijkstra will not explain a path that leaves the continent to reach a neighbor.",
        ],
        { kind: "pair", caption: "Two ways to learn a route.", leftTitle: "Distance vector", rightTitle: "Link state", left: ["Advertise distances", "Count-to-infinity", "Small messages"], right: ["Flood the links", "Each router runs shortest paths", "One shared map"] },
        "Three routers in a line",
        [
          "A-B-C, each link cost 1. C's route to A is through B, cost 2. B's route to A is the direct link, cost 1.",
          "The link A-B fails. B should set its cost to A to infinity. If B's update is slow, C still advertises cost 2, and B may adopt C as the next hop, cost 3.",
          "C then hears B's new cost and raises its own. They count upward. A maximum distance stops the count and still leaves a window where packets loop.",
        ],
        [
          {
            prompt: "Why does link state not suffer the same count-to-infinity on this failure?",
            answer: "B floods 'link A-B is down.' C and B compute on a map that does not contain the link. Neither adopts a route that uses it. There is no mutually referential distance left to increment.",
          },
          {
            prompt: "A shortest path exists through a network that refuses to transit your traffic. Why is the packet not sent that way?",
            answer: "The refusal is policy. The protocol that implements policy will not advertise or will not select that path. Shortest path on a graph that ignores policy answers a problem the network is not solving.",
          },
        ],
      ),
      week(
        "l9",
        "Queues",
        [
          "A switch or a router is a queue in front of a link. When the arrival rate exceeds the service rate, the queue grows. A drop-tail queue drops the arrival that does not fit. The sender learns about congestion from the loss, one round-trip later, and every flow sees the loss together. That synchronization is a reason queues are not only storage.",
          "Fair queuing gives each flow a share of the link instead of a share of the buffer slots. A flow that sends too fast fills its own queue and loses its own packets. The others continue. FIFO cannot do that. One fast flow occupies the FIFO queue.",
          "Priority queues serve one class first. They are how a latency-sensitive flow skips a bulk transfer, and they are how a misconfigured high class starves everyone else. Priority without a rate limit on the high class is a starvation bug.",
          "The end-to-end argument still holds. The queue can drop and can schedule. It cannot know the application's retransmission semantics. Reliability remains the endpoint's job. The queue's job is to allocate the link you actually have.",
        ],
        { kind: "pair", caption: "One fast flow, one slow flow.", leftTitle: "FIFO", rightTitle: "Fair queuing", left: ["One shared buffer", "The fast flow fills it", "The slow flow sees the drops"], right: ["A queue per flow", "The fast flow drops its own", "The slow flow keeps its share"] },
        "A link of 10, a sender of 30",
        [
          "The link serves 10 units per second. One sender offers 30, another offers 5.",
          "A deep FIFO fills with the fast sender. The slow sender's packets wait behind a buffer of traffic that is not its own, or are dropped when the buffer is full of the fast sender.",
          "Fair queuing serves them in proportion, or equally if you configured equal weights, so the slow sender's 5 get through and the fast sender's excess is the traffic that waits or drops.",
        ],
        [
          {
            prompt: "Why can a larger buffer increase delay without increasing the throughput of a saturated link?",
            answer: "The link is already full. Extra buffer holds extra packets. Throughput stays at the service rate. Delay grows with the queue length. This is the same phenomenon as bufferbloat, seen from the queue rather than from the window.",
          },
          {
            prompt: "A priority class has no rate cap and a buggy sender marks everything as high. What happens to the low class?",
            answer: "It starves as long as the high class has a packet. Priority is a preference, and without a cap it is a monopoly. Cap the high class or it is not a priority configuration you can defend.",
          },
        ],
      ),
      week(
        "l10",
        "Reliable delivery",
        [
          "The earlier lecture sized a window. This week is the protocol that uses it. A sender numbers bytes, holds a copy until they are acknowledged, and retransmits on a timeout or on duplicate acknowledgements. A receiver accepts in-order bytes and either discards or buffers the rest. The choice changes performance, not correctness, if the sender retransmits.",
          "A cumulative acknowledgement says every byte up to N has arrived. It is compact, and it cannot name a hole past N. Selective acknowledgements name the holes. Without them a loss at the front of a window can retransmit bytes the receiver already has.",
          "The timeout must exceed a reasonable round-trip or you retransmit data that was only slow. An estimate of the round-trip, plus a variance term, is the usual rule. A fixed timeout chosen on a laptop will be wrong on a path that takes longer.",
          "Idempotence is the application's problem once the byte stream is reliable. The stream may deliver a request once and the response may be lost, so the application retries and the server sees the request twice. The byte stream did its job. The request needs its own identity.",
        ],
        { kind: "flow", caption: "A loss in a window.", steps: ["Send bytes 1 through 8", "Bytes 4 are lost", "The receiver has 1 through 3", "Retransmit from 4, or only 4 if the ack is selective"] },
        "Window of four segments",
        [
          "Segments 1, 2, 3, 4 are in flight. Segment 2 is lost. The receiver buffers 3 and 4 if it is allowed, and acknowledges 1.",
          "Duplicate acknowledgements of 1 tell the sender that later segments arrived and 2 did not, if you use that signal. A timeout would also fire.",
          "Retransmitting only 2, then continuing, is what selective information allows. Retransmitting 2, 3, and 4 also works and wastes the link.",
        ],
        [
          {
            prompt: "The byte stream delivers a write exactly once, the response packet is lost, and the client retries the request. How many times does the server perform the operation?",
            answer: "Twice, unless the operation is idempotent or the request carries an identifier the server has seen. Reliability of the byte stream is not exactly-once application semantics.",
          },
          {
            prompt: "Why is a timeout of one second wrong on a path whose round-trip is two seconds, even when nothing is lost?",
            answer: "Every segment looks lost. You retransmit continuously and may inflate the congestion window's loss signals. The timeout has to sit above the real round-trip, including its variance.",
          },
        ],
      ),
      week(
        "l11",
        "The secure channel",
        [
          "A byte stream can be read by anyone on the path. A secure channel adds confidentiality, integrity, and an identity. The handshake agrees on keys and checks a certificate. The record layer then encrypts and authenticates the bytes. The details of the ciphers belong to the security course. The networking obligation is to know what the handshake must finish before any application byte is trusted.",
          "A certificate binds a name to a public key, if you trust the issuer. The client must check the name against the name it meant to reach. A valid certificate for a different name is a failure. You already saw that case. Here it sits in the connection setup, before HTTP.",
          "Downgrade is a network attack on the handshake: the path strips the strong options and the endpoints accept a weak suite. A modern handshake refuses the weak suite rather than being helpful. Helpful, in this layer, is how you end up unencrypted.",
          "The channel ends at the process that holds the key. A log line that prints the decrypted request is fine inside the server and a breach if the log is the path. Know where the channel stops.",
        ],
        { kind: "pipeline", caption: "Before the first request.", stages: ["TCP connects", "Handshake and certificate check", "Keys exist", "Only then an application byte"] },
        "A certificate for the wrong host",
        [
          "The user asked for mail.example. The certificate is valid, unexpired, and names files.example.",
          "The signature check passes. The name check fails. A client that only checks the signature will send the user's password to the wrong host.",
          "The connection must stop before the request. There is no later HTTP status that repairs a handshake with the wrong party.",
        ],
        [
          {
            prompt: "The handshake completes and the application then sends a session cookie in the clear on a second connection. What did the secure channel protect?",
            answer: "Only the connection that used it. The cookie on the clear connection is visible to the path. The channel does not bless the application. Every connection that carries the secret has to be inside a channel.",
          },
          {
            prompt: "Why does a handshake that accepts 'no encryption' as an option fail even if both honest endpoints prefer encryption?",
            answer: "The path can strip the preference and leave both sides believing the other offered nothing. If the protocol allows the null suite, the attacker selects it. Refuse the null suite.",
          },
        ],
      ),
      week(
        "l12",
        "What the application may assume",
        [
          "Write down the assumptions a careful application is allowed to make. Bytes on one connection arrive in order, or the connection fails. They are not secret and not authentic unless a secure channel said so. A request may be performed more than once if the client retries. A name may resolve to a stale address until the time-to-live expires. A send rate that ignores loss will harm the other flows and may be policed.",
          "Write down what it may not assume. A fixed latency. A path that stays up for the whole transfer. An address that means a particular machine next week. A queue that is fair to a flow that will not mark itself. Delivery of a datagram. If you need those, you build them, and you can, because the lower layers told you the truth about what they withhold.",
          "The programming labs in a networks course are the test of this list. A byte-stream implementation that loses a sequence number will violate the first assumption. You should be able to point at the line.",
          "The hours for this course include computing one window, one AIMD step, and one count-to-infinity by hand. The notes are the method. The arithmetic is the evidence you did it.",
        ],
        { kind: "pair", caption: "The contract.", leftTitle: "You may assume", rightTitle: "You may not", left: ["In-order bytes or a clean failure", "A checked name on a secure channel", "Loss as a congestion signal"], right: ["A stable address", "Exactly-once side effects", "A fair share if you ignore loss"] },
        "A retry that double-charges",
        [
          "The client sends 'pay.' The server commits the payment and the response is lost.",
          "The client times out and sends 'pay' again. The server commits a second payment.",
          "A request id stored with the payment lets the server recognize the retry and return the first result. The byte stream could not do that for you. The id is the application's sequence number.",
        ],
        [
          {
            prompt: "List one bug that breaks in-order delivery and one bug that breaks exactly-once payment even if delivery is perfect.",
            answer: "Reordering sequence numbers, or acknowledging a byte you did not receive, breaks order. A retry after a lost response breaks exactly-once payment even when every byte of each attempt arrives in order. They are different layers.",
          },
          {
            prompt: "DNS returns an old address and the connection fails. Which layer is wrong, and which layer is working?",
            answer: "The name layer is stale, within its time-to-live. Routing may be delivering to the address you asked for. Debug the resolver cache before you debug the routes.",
          },
        ],
      ),
      week(
        "l13",
        "Measuring a path",
        [
          "A path has a delay, a loss rate, and a bottleneck rate. Ping measures a round-trip for a small packet, which is not the transfer time of a large file and not a one-way delay. A throughput test fills the window and measures bytes over time. Mixing the two numbers up is how people conclude a path is broken when it is merely long.",
          "The bandwidth-delay product is the bottleneck rate times the round-trip time. It is the amount of data that must be in flight to keep the pipe full. A window smaller than that product leaves the link idle. A window much larger fills a buffer and adds delay. You computed a version of this in the first congestion lecture. Here you measure the inputs instead of being handed them.",
          "Loss during a short test may be the probe itself. A test that opens many connections will induce the congestion it reports. One connection, a stated duration, and the window's behavior are the measurement.",
          "Write the topology you think you measured. A number without the path is not a result. Wireless, a VPN, and a congested home router are different paths that can share an address.",
        ],
        { kind: "layers", caption: "Three different numbers.", rows: ["Round-trip of a small packet", "Bottleneck rate", "Their product, the window you need"] },
        "A long fat pipe",
        [
          "Rate 1 gigabit per second, round-trip 100 milliseconds. The product is 100 megabits, about 12.5 megabytes in flight.",
          "A window of 64 kilobytes fills 64/12500 of the pipe. The transfer is window-limited and the link looks slow.",
          "Raising the window to the product, if the path can buffer the fair share, raises the throughput. Raising it far past the product raises delay. Measure the round-trip as you raise it.",
        ],
        [
          {
            prompt: "Ping takes 20 milliseconds and a file transfer is slow. Why is that not a contradiction?",
            answer: "Ping did not fill the pipe. The transfer may be window-limited, lossy, or sharing the link. The small-packet delay can be fine while the throughput is not. Measure the throughput and the window separately.",
          },
          {
            prompt: "You open 32 parallel connections to 'measure the path' and see loss. What did you measure?",
            answer: "The path with your 32 connections on it. You may have created the congestion. A single connection's loss and window tell you more about the path you will actually use.",
          },
        ],
      ),
      week(
        "l14",
        "A protocol you could implement",
        [
          "The closing project is a small reliable protocol over an unreliable datagram, or a careful client of a byte stream that retries without double effects. Either one forces the contract into code. Pick one.",
          "If you build the reliable layer, the tests are: loss of a data segment, loss of an acknowledgement, reordering, and a timeout that is shorter than the round-trip. The last one should not cause a failure of correctness, though it will waste the link. If your protocol breaks when an acknowledgement arrives late, the timeout handling is wrong.",
          "If you build the client, the tests are: a lost response, a stale DNS name you simulate with a bad address, and a status code your parser must not treat as success. Write the tests first. The software-engineering course was about that order for a reason.",
          "Document the invariant in a paragraph. Sequence numbers increase. A byte is not delivered twice. A retry carries an id. Whichever you chose, the paragraph should be falsifiable by one of the tests.",
        ],
        { kind: "flow", caption: "Tests before the happy path.", steps: ["Loss of data", "Loss of an acknowledgement", "Reorder", "A timeout shorter than the round-trip"] },
        "A late acknowledgement",
        [
          "You send segment 5 and time out. You send it again. Then both acknowledgements arrive.",
          "The sender must ignore the duplicate acknowledgement or treat it as already satisfied, and it must not advance the window twice.",
          "The receiver must ignore the duplicate segment or deliver it only once. Both sides need a memory of what they have already accepted.",
        ],
        [
          {
            prompt: "A test drops every other acknowledgement and your sender stalls forever. What state is missing?",
            answer: "A retransmission timer, or a reading of duplicate information that would trigger a resend. Reliability requires a way to notice the absence of an acknowledgement. A sender that only advances on the first ack and never times out will stall as soon as one ack is lost.",
          },
          {
            prompt: "Your client retries a POST when the connection resets after the server committed. What must the server store?",
            answer: "An idempotency key or request id, and the result of the first commit, so the retry returns that result instead of committing again. The reset is not evidence that the commit did not happen.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-608",
    lectures: [
      week(
        "l6",
        "Relational algebra and SQL",
        [
          "The earlier lecture joined two tables by hand. This week is the language. Selection keeps rows. Projection keeps columns. A join combines rows that agree on a predicate. Union, difference, and renaming complete the algebra you need. SQL is a syntax for that algebra plus grouping and aggregation, which the pure algebra did not need for the first lecture.",
          "The order of operations changes the cost and not the answer, if you rewrite legally. Filtering before a join is legal when the filter mentions only one side. Projecting away a column you later join on is not legal. An optimizer searches the legal rewrites. You should be able to spot an illegal one.",
          "NULL is not a value. A comparison with NULL is unknown, and unknown fails a WHERE clause. That surprises people who expected false. An outer join exists to keep a row that matched nothing, and the missing side is NULL. If you then filter on the missing side, you may delete the rows the outer join added.",
          "Grouping computes an aggregate per group. Every column in the output is either grouped or aggregated. A column that is neither is a query the language should reject. If a system accepts it, you do not know which row's value you got.",
        ],
        { kind: "pipeline", caption: "A legal rewrite.", stages: ["Start from the joins", "Push a one-sided filter down", "Then project", "Do not drop a join key early"] },
        "One join, filtered",
        [
          "Students have ids and majors. Enrollments have student ids and course ids. You want computer-science students in course 629.",
          "Filter students to the major first, then join. The result matches filtering after the join, and the join is smaller.",
          "Project students down to the major alone before the join and you can no longer join. The rewrite is illegal. The optimizer that does it is wrong, and so is the person who deleted the column in a subquery.",
        ],
        [
          {
            prompt: "A WHERE clause says name = NULL. How many rows match, if some names are NULL?",
            answer: "None. The comparison is unknown, not true. Use IS NULL. Equality is the wrong predicate for NULL.",
          },
          {
            prompt: "An outer join keeps students with no enrollment, and a later WHERE says course id = 629. What happens to the unenrolled students?",
            answer: "They disappear. Their course id is NULL, and NULL = 629 is not true. Put the course filter in the join condition if you meant to keep the unenrolled rows, or accept that the WHERE cancelled the outer join.",
          },
        ],
      ),
      week(
        "l7",
        "Dependencies and normal forms",
        [
          "A functional dependency X -> Y means that two rows that agree on X agree on Y. It is a constraint on the legal tables, not a property of the current contents. A table that happens to satisfy it today and can violate it tomorrow does not have the dependency.",
          "A key determines every other column. Third normal form says every non-key column depends on a key, a whole key, and not on another non-key. The definition used in practice is: for every dependency X -> A, either X is a superkey or A is part of a key. Boyce-Codd is stricter and sometimes splits tables in a way that loses a dependency you then have to enforce elsewhere.",
          "A decomposition is lossless if the natural join of the pieces returns the original table, no more and no less. It is dependency-preserving if every dependency can be checked inside one piece. You can have one without the other. A lossy decomposition returns extra rows and silently invents facts.",
          "Normalize a table that mixes two entities. Do not normalize a table whose remaining dependencies you did not write down. The normal form is a statement about dependencies you claimed, not about the shape of the spreadsheet.",
        ],
        { kind: "pair", caption: "One table or two.", leftTitle: "Mixed", rightTitle: "Decomposed", left: ["Student, major, advisor's phone", "Phone depends on advisor, not on student"], right: ["Student and advisor", "Advisor and phone", "The phone is stored once"] },
        "A phone number that changes",
        [
          "Rows: (Ada, systems, 555-0100), (Ben, systems, 555-0100), both advised by Kim. The dependency advisor -> phone holds if Kim has one phone.",
          "Update Ada's row to 555-0199 and Ben still shows 555-0100. The dependency is violated. The table allowed two phones for one advisor.",
          "Split into enrollment-or-student rows that store the advisor, and an advisor table that stores the phone. The update touches one row. The join gets the phone back. If the split drops the advisor from the student side, the join cannot reconstruct the original, and the decomposition was lossy.",
        ],
        [
          {
            prompt: "You decompose a table and the join has more rows than you started with. What did you lose?",
            answer: "The lossless condition. The pieces no longer determine which combinations existed. Extra rows are invented facts. Put back a key that ties the pieces together, or do not decompose that way.",
          },
          {
            prompt: "A table is in third normal form for the dependencies you wrote, and the application still stores two birth dates for one person. Where is the bug?",
            answer: "In the missing dependency person -> birth date, or in a missing key. Normal form does not repair a constraint you never declared. Declare it and enforce it.",
          },
        ],
      ),
      week(
        "l8",
        "Choosing a plan",
        [
          "A query has many legal plans. A cost-based optimizer estimates the cost of each and picks the cheapest estimate. The estimate is built from cardinalities and from the cost of scans, index lookups, and joins. A wrong cardinality produces a wrong plan that is still legal. Correctness and cost are separate.",
          "Selections that remove most rows should happen early. A join order that starts from the selective input builds smaller intermediate results. The System R approach considers left-deep trees and keeps, for each subset of tables, the cheapest plan that produces it. You do not need to implement that search to see why an index on the selective predicate changes the winner.",
          "Statistics are how the optimizer knows a predicate is selective. A stale histogram that thinks a column has two values, when it has two million, will pick a scan or an index for the wrong reason. Analyze the table after a bulk load. The plan can change under you, and that is the optimizer doing what you asked.",
          "Look at the plan when a query is slow. A sequential scan of a table you thought was indexed means the index does not match the predicate, or the optimizer thinks the index is not worth it. Read the predicate. A function wrapped around the column defeats an ordinary index.",
        ],
        { kind: "flow", caption: "From a query to a plan.", steps: ["Legal rewrites", "Estimate cardinalities", "Cost the candidate trees", "Pick the cheapest estimate"] },
        "One thousand outer rows",
        [
          "Outer table 1000 rows, inner table 5000, and a predicate on the outer table matches 10 rows. Nested loops without an index is 1000 times 5000 probes if you join first.",
          "Filter the outer table first: 10 times 5000, or 10 index lookups if the inner join key is indexed. The earlier lecture's unindexed nested loop was the expensive plan.",
          "If the statistic says the predicate matches 900 rows, the optimizer may scan. Update the statistic and the plan can flip. The query text did not change.",
        ],
        [
          {
            prompt: "An index exists on name and the predicate is lower(name) = 'ada'. Why might the plan ignore the index?",
            answer: "The index is on name, not on lower(name). Every row's function value is a different expression. A scan, or an index on the expression, is what the predicate allows. The index you have does not answer it.",
          },
          {
            prompt: "The optimizer's estimated rows are 10 and the actual rows are 100000. The plan was legal and slow. What do you fix first?",
            answer: "The statistics or the estimate, not the query's meaning. The plan was chosen for a different cardinality. Analyze the table, or add a better histogram, and recheck the plan before you rewrite the SQL.",
          },
        ],
      ),
      week(
        "l9",
        "Serializability",
        [
          "Transactions are the unit of atomicity and of isolation. A schedule is serializable if its effect on the data is the effect of some serial order of the committed transactions. Two people reading a balance, each adding a deposit in their head, and each writing back, can lose one deposit. Both transactions committed. The schedule was not serializable.",
          "Two-phase locking requires a transaction to acquire all the locks it will need before it releases any. The growing phase, then the shrinking phase. It ensures conflict serializability if you use shared locks for reads and exclusive locks for writes. Deadlock is possible. The earlier operating-systems course told you how a cycle forms. Here the locks are on records.",
          "A weaker isolation level lets a transaction see another transaction's uncommitted or later-committed data. It runs faster and it admits anomalies you must name. Read committed does not prevent the lost update by itself if both transactions read before either writes, unless the write takes a lock that conflicts. Know which anomaly your level allows before you pick it for speed.",
          "The lock manager is not the log. Locks are isolation. The log is durability and atomicity. A system can have one and not the other. You want both, and they are different mechanisms.",
        ],
        { kind: "pair", caption: "Two deposits.", leftTitle: "Serializable", rightTitle: "Lost update", left: ["T1 reads 100 and locks", "T2 waits", "T1 writes 150 and unlocks", "T2 reads 150 and writes 180"], right: ["Both read 100", "T1 writes 150", "T2 writes 130", "The 50 deposit is gone"] },
        "A balance of 100",
        [
          "T1 deposits 50. T2 deposits 30. The serial results are 180, in either order.",
          "If both read 100 and both write their sum, the second write keeps 150 or 130 and drops the other deposit.",
          "Exclusive locks on the read-for-update make the second transaction wait, reread, and add 30 to 150. Two-phase locking holds the lock until the transaction is ready to finish.",
        ],
        [
          {
            prompt: "A transaction releases a lock on row A and then acquires a lock on row B. What two-phase locking forbids, and what bug does that allow?",
            answer: "It forbids acquiring after releasing. Another transaction can change A after the release and change B before the acquire, so this transaction's view of A and B never existed together. That is a failure of serializability.",
          },
          {
            prompt: "You turn off locking and keep the write-ahead log. Which property did you keep?",
            answer: "Durability and the ability to undo a crash, if the log is complete. You gave away isolation. Concurrent transactions can still lose updates. The log does not order them.",
          },
        ],
      ),
      week(
        "l10",
        "Recovery",
        [
          "Write-ahead logging means a change is on the log, on stable storage, before the data page is allowed to hold it. A crash then has a source of truth. Recovery redoes committed work that did not reach the pages and undoes uncommitted work that did. The earlier lecture's 'crash after commit' is the redo half.",
          "A checkpoint bounds how far back recovery must read. Fuzzy checkpoints let transactions keep running and record a starting point. You do not need every optimization to state the invariant: after recovery, every committed transaction's effects are present and every uncommitted transaction's effects are absent.",
          "Compensation records are how undo is itself logged, so a crash during recovery can be recovered. If undo changed a page and did not log the undo, a second crash has no idea the undo happened. The log is the only structure you trust after a crash. The pages are suspects.",
          "A commit point is the moment the commit record is stable. A transaction that printed 'done' to a user before that record is durable has lied. The application waits for commit.",
        ],
        { kind: "flow", caption: "Recovery.", steps: ["Read the log from the checkpoint", "Redo winners", "Undo losers", "The commit record is the difference"] },
        "A crash after a commit record",
        [
          "The log contains an update and a commit for T1. The data page was not flushed.",
          "Recovery redoes the update. T1's effect is present. There is nothing to undo.",
          "If the commit record had not reached stable storage, T1 is a loser. Recovery undoes the update if it reached the page. The user was not told success, if the application waited.",
        ],
        [
          {
            prompt: "The data page is written before the log record, and the crash happens between them. Can recovery reconstruct the change?",
            answer: "No. The page holds a change the log has never seen, or a torn version of it, and the log cannot redo or undo what it does not contain. Write-ahead exists to forbid this order.",
          },
          {
            prompt: "Recovery crashes halfway through undo. What lets the second recovery finish?",
            answer: "The undo steps were logged as compensation records. The second recovery sees them and does not undo the undo. Without those records the second pass can corrupt the page.",
          },
        ],
      ),
      week(
        "l11",
        "Two machines",
        [
          "A transaction that must commit on two databases cannot decide alone. Two-phase commit elects a coordinator. Each participant votes after preparing, which means its local log can commit or abort as instructed. If every vote is yes, the coordinator writes a commit and tells them. If any vote is no, or a participant is silent past the timeout you defined, the coordinator aborts.",
          "The window is the coordinator's commit record. A participant that voted yes and has not heard back must keep the transaction prepared and hold its locks. It cannot unilaterally commit, and it cannot unilaterally abort if the coordinator might have committed. That uncertainty is the cost of the protocol. A timeout alone does not resolve it.",
          "Replication of a single log is a different design. One leader orders the commits. Followers apply the log. Failover promotes a follower that has the log. Split brain, two leaders, is the failure you design against with a majority. Two-phase commit across independent authorities and replication inside one service answer different organizational problems.",
          "The capstone's crash test can be this protocol in miniature: two logs, a coordinator, a killed process after the prepare and before the commit message. You should be able to say what each side is allowed to do next.",
        ],
        { kind: "pipeline", caption: "Two-phase commit.", stages: ["Prepare", "Vote", "Coordinator decides", "Participants learn the decision"] },
        "A vote that gets lost",
        [
          "Participant A votes yes and prepares. The coordinator decides to commit and crashes before A's message leaves.",
          "A holds locks. It does not abort on a timer, because the coordinator may have told B to commit already.",
          "When the coordinator recovers, its commit record tells it to resend the decision. A applies it. The uncertainty ends when the decision is known, not when A is impatient.",
        ],
        [
          {
            prompt: "Both participants voted yes and the coordinator has no stable commit record, then the coordinator crashes. What is the decision on recovery?",
            answer: "Abort. Without a stable commit, the coordinator did not decide to commit. It tells the participants to abort. They are still waiting, prepared, and they can roll back.",
          },
          {
            prompt: "Why is a timeout not enough for a prepared participant to abort?",
            answer: "The coordinator may already have committed and told the other participant. Aborting locally would make one side committed and one aborted. The participant must learn the decision. The protocol blocks rather than guess.",
          },
        ],
      ),
      week(
        "l12",
        "Physical design",
        [
          "An index speeds the predicate it matches and slows the writes that must maintain it. A table with six indexes pays six updates on every insert. Build the index that the slow query uses. Do not build one per column as a ritual.",
          "A clustered index stores the rows in key order. A range on that key is sequential I/O. A secondary index stores pointers and may turn a range into random fetches of the rows. The earlier B+ tree lecture is the structure. Clustering is the decision about which key matches the layout.",
          "A covering index holds every column the query needs, so the plan need not touch the row. It is larger. It is justified when the query is frequent and the table is wide. Explain the query before you add the columns.",
          "Denormalization copies a column to avoid a join. It reintroduces the update anomaly from the normal-form lecture. Do it when the measurement says the join dominates and you have a way to keep the copy honest. Do it as a default and you will store two phones for one advisor again.",
        ],
        { kind: "pair", caption: "Clustered or not.", leftTitle: "Clustered on the key", rightTitle: "Secondary index", left: ["Rows sit in key order", "A range is a scan of neighbors"], right: ["The index holds pointers", "A range becomes many fetches"] },
        "Leaves that hold two keys, and a range",
        [
          "A B+ tree on course id, clustered, leaves hold (629, row) and (633, row) as neighbors if the ids are adjacent in the key order you chose.",
          "A query for ids between 629 and 640 reads those leaves in order.",
          "The same keys in a secondary index yield pointers. If the rows live on different pages, the range costs a random read per row. The tree height was never the expensive part.",
        ],
        [
          {
            prompt: "A table is inserted into constantly and queried by primary key once a day. How many secondary indexes do you want?",
            answer: "None, until a query needs one. Each secondary index taxes the inserts every day for a lookup that does not happen. The primary access already has a structure.",
          },
          {
            prompt: "You copy a customer's city onto every order to avoid a join, and the customer moves. What must the write path do?",
            answer: "Update every copied city, or accept that orders show different cities for one person. The copy is a dependency you reintroduced. The write path has to maintain it, or the denormalization is a bug.",
          },
        ],
      ),
      week(
        "l13",
        "A schema for the capstone",
        [
          "The capstone stores records that more than one request may touch. Design the schema this week, before the code. Write the entities, the keys, and the dependencies. Put it in third normal form unless you write the dependency you are choosing to violate and the code that repairs it.",
          "Name the transactions. A transfer of a record from one owner to another is one transaction, not two requests that each commit. The serializability lecture is why. Name the isolation you need. If two requests can lose an update, you need the locks, not a comment.",
          "Name the crash. Which log record is the commit. What recovery must redo. If there are two stores, say whether you are using two-phase commit or a single log. The design is the sentence that answers that. The code comes after.",
          "Estimate one query. What index it uses, what it would cost without the index, on a thousand rows and on a million. The number can be rough. It cannot be absent.",
        ],
        { kind: "layers", caption: "The design note.", rows: ["Entities, keys, dependencies", "Transactions and their isolation", "The crash and the log", "One query and its index"] },
        "A record and an audit row",
        [
          "Updating a record and inserting an audit row must commit together. If only the audit row commits, the history describes a change that is not there.",
          "One transaction, one commit record, covers both writes.",
          "A crash after the commit redoes both. A crash before the commit undoes both, or never made them visible. That is the whole specification of this pair.",
        ],
        [
          {
            prompt: "Two requests update the same record and each commits its own transaction after reading the old value. Which lecture names the bug?",
            answer: "The serializability lecture. It is a lost update. The schema being in normal form does not prevent it. The transactions need conflicting locks or a conditional update that fails if the value changed.",
          },
          {
            prompt: "You store the user's display name on every audit row. What dependency did you create?",
            answer: "Audit row -> display name is false if the name lives on the user. User id -> display name is the dependency, and copying the name means an update must find every audit row or the copies will disagree. Write that down or store the id only.",
          },
        ],
      ),
      week(
        "l14",
        "The database you can defend",
        [
          "You should be able to do five things on paper. Translate a small question into a join and say which filter pushes down. Name a dependency and decompose without losing rows. Read a plan and say why an index was ignored. Show a lost update and the lock that prevents it. Say what a commit record means after a crash.",
          "The hours for this course are those five, worked without the notes, plus the schema note for the capstone. The opening lectures introduced the pieces. These weeks are the course.",
          "If a tool picks a plan for you, you are still responsible for the plan. Print it. If a tool picks an isolation level, name the anomaly it allows. Defaults are not knowledge.",
          "Nothing here is a manual for a particular product. The mechanisms are the ones every transactional store is judged against. Use a product in the capstone, and map its words onto these.",
        ],
        { kind: "layers", caption: "Five checks.", rows: ["A legal rewrite", "A lossless split", "A plan and a statistic", "A lock order", "A commit record"] },
        "Map a product word",
        [
          "A product says 'repeatable read.' You look up which anomalies it still allows. You do not assume the English words match the textbook level of the same name. Dialects differ.",
          "You write down the anomaly your capstone cannot tolerate, and you confirm the level forbids it, with a test of two sessions.",
          "The test is two transactions, the same one as the lost-update example. If the second write silently overwrites, the level is not the one you needed.",
        ],
        [
          {
            prompt: "Recovery restores committed work and your application still shows the user a success it printed before commit returned. Where is the bug?",
            answer: "In the application. It claimed durability before the commit record was stable. Wait for commit, then tell the user. Recovery did what it could.",
          },
          {
            prompt: "Which of the five checks fails if the join of your decomposed tables grows extra rows?",
            answer: "The lossless split. The other four can pass and the schema is still wrong. Extra rows are invented facts. Fix the decomposition before you index it.",
          },
        ],
      ),
    ],
  },
];
