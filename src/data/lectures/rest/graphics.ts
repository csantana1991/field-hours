import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-641",
    lectures: [
      lec(
        "l1",
        "A triangle and its weights",
        [
          "You store a solid as triangles because a triangle is planar, so a rasterizer fills it with one rule. Take vertices at (0, 0, 0), (2, 0, 0), and (1, 2, 0). Those 3 points define a face. Any interior point is a mix of the vertices with weights that add to 1. You keep every weight nonnegative so the point stays inside the triangle and not past an edge.",
          "You also store a normal per vertex so later shading can vary across the face. For this flat triangle the 3 normals can match the face normal, which points along z if the face lies in the xy plane. A shared vertex between two faces keeps one position and may keep two normals when a crease should stay sharp. You do not average those normals, or the crease becomes a smooth bend.",
        ],
        {
          kind: "layers",
          caption: "One triangle record. Positions can be shared. Normals split only at a crease.",
          rows: ["Face as three indices", "Three vertex positions", "Normals, one or two"],
        },
        "Weights inside the sample triangle",
        [
          "The centroid uses weights 1/3, 1/3, and 1/3. They add to 1 and stay nonnegative, so the point is inside.",
          "The midpoint of the first edge uses weights 1/2, 1/2, and 0. A zero weight puts the point on the boundary, which you still accept.",
          "Weights 2, -1, and 0 add to 1, but a negative weight lands outside the triangle. You reject that mix.",
        ],
        [
          {
            prompt: "A point uses weights 0.2, 0.2, and 0.6. Is it inside the triangle?",
            answer: "Yes. The three weights are nonnegative and add to 1, so the point is a mix of the three vertices and lies inside the face.",
          },
          {
            prompt: "Two faces share a vertex and you want a sharp crease. How many normals do you store there?",
            answer: "Two. One position is shared. Averaging the two face normals would smooth the crease, so you keep a separate normal for each face.",
          },
        ],
      ),
      lec(
        "l2",
        "A camera at (0, 0, 4)",
        [
          "You place a camera at (0, 0, 4) looking toward the origin, with up along y. The view transform moves the world so the camera sits at the origin and looks down the negative z axis. Your sample triangle, which lived in z = 0, then sits 4 units in front of the camera. You build the transform from the camera position, the look direction, and the up vector, three vectors that must stay orthogonal.",
          "You then apply a perspective divide. A point with eye-space depth 4 maps to a smaller image than the same point at depth 2, because you divide x and y by a depth term. With a vertical field of 90 degrees, a point at the edge of that field lands on the top or bottom of the image. You clip before the divide so a vertex behind the camera does not flip across the image.",
        ],
        {
          kind: "pipeline",
          caption: "From a world point to a pixel. Clip before you divide by depth.",
          stages: ["World position", "View transform", "Clip", "Perspective divide", "Pixel"],
        },
        "A point on the optical axis",
        [
          "The origin is 4 units in front of the camera at (0, 0, 4). After the view transform it lies on the optical axis.",
          "Its x and y are already 0, so the perspective divide leaves it at the center of the image.",
          "A second point halfway to the origin is only 2 units in front. It also lands at the center, and the depth test will treat it as closer.",
        ],
        [
          {
            prompt: "The camera is at (0, 0, 4) and looks at the origin. How far in front of the camera is a vertex at the origin?",
            answer: "4 units. The view transform places that vertex 4 units in front of the camera, on the optical axis.",
          },
          {
            prompt: "Why do you clip a vertex that is behind the camera before the perspective divide?",
            answer: "Dividing by a depth term that has changed sign flips the vertex across the image. Clipping removes it so that flip never happens.",
          },
        ],
      ),
      lec(
        "l3",
        "Pixels and a depth buffer",
        [
          "You turn the projected triangle into pixels by walking its screen bounds and testing each pixel against the 3 edges. A pixel is inside when it lies on the same side of each edge as the opposite vertex. On an 8 by 8 image the triangle may cover only a handful of those 64 pixels. You compute barycentric weights per pixel so you can interpolate depth and the vertex attributes without a second pass.",
          "You resolve visibility with a depth buffer, one depth per pixel. When two fragments land on the same pixel, you keep the one with the smaller distance and discard the other. If the near fragment has depth 2 and the far fragment has depth 5, the buffer stores 2 and the color of the near fragment. You write depth and color together so a later fragment cannot paint over a closer surface.",
        ],
        {
          kind: "flow",
          caption: "A pixel is colored only if it is inside the triangle and closer than the stored depth.",
          steps: ["Test the three edges", "Interpolate the depth", "Compare with the buffer", "Write color and depth"],
        },
        "Two fragments, one pixel",
        [
          "Fragment A at a pixel has depth 2. The buffer is empty, so you write A's color and store 2.",
          "Fragment B at the same pixel has depth 5. Because 5 is larger than 2, you discard B and leave both color and depth.",
          "A later fragment with depth 1 replaces the color and the stored depth. The buffer now holds 1.",
        ],
        [
          {
            prompt: "The depth buffer holds 3 at a pixel. A new fragment has depth 3.5. Do you replace the color?",
            answer: "No. 3.5 is farther than 3, so you discard the new fragment and leave the stored color and depth.",
          },
          {
            prompt: "A pixel has barycentric weights 0.5, 0.5, and 0.2. Is the pixel inside the triangle?",
            answer: "No. The weights must add to 1 and stay nonnegative. These add to 1.2, so the pixel fails the inside test.",
          },
        ],
      ),
      lec(
        "l4",
        "Diffuse light and a highlight",
        [
          "You shade a fragment with a diffuse product: light intensity times the diffuse coefficient times the cosine of the angle between the normal and the light. If that cosine is 0, the surface faces the light edge-on and the diffuse term is 0. You clamp a negative cosine to 0 so a face that points away from the light does not subtract light it never received. The product is evaluated at the fragment, using the interpolated normal.",
          "You add a specular lobe that depends on the view. With the light and the eye both 45 degrees off the normal in one plane, the reflection of the light heads toward the eye and the highlight is strong. Move the eye by another 20 degrees and the same reflection misses the eye, so the highlight drops. You evaluate this per fragment. Once per triangle, the highlight stays a flat blotch.",
        ],
        {
          kind: "pair",
          caption: "Diffuse light uses the normal and the lamp. The highlight also uses the eye.",
          leftTitle: "Diffuse term",
          rightTitle: "Specular lobe",
          left: ["Normal and light", "Clamp the cosine at 0", "No view direction"],
          right: ["Reflected light direction", "Strong at 45 degrees", "Computed per fragment"],
        },
        "A light along the normal",
        [
          "The normal is (0, 0, 1) and the light direction is (0, 0, 1). The cosine is 1.",
          "Intensity 2 times diffuse coefficient 0.5 times cosine 1 gives a diffuse brightness of 1.",
          "A second light from the side has cosine 0, so its diffuse contribution is 0 and you add nothing.",
        ],
        [
          {
            prompt: "Intensity is 4, the diffuse coefficient is 0.25, and the cosine is 1. What is the diffuse brightness?",
            answer: "1. You multiply 4 by 0.25 by 1.",
          },
          {
            prompt: "The cosine between the normal and the light is -0.3. What diffuse contribution do you add?",
            answer: "0. You clamp a negative cosine to 0 because that face does not face the light.",
          },
        ],
      ),
      lec(
        "l5",
        "Rays, shadows, and a bounce cap",
        [
          "You trace a ray from the camera at (0, 0, 4) through one pixel and keep the closest hit. The ray starts at the camera and aims at that pixel on a plane at z = 3, one unit ahead. You test each triangle and keep the smallest positive distance. You ignore a hit at distance 0 or less so the camera is not treated as a surface.",
          "You spawn a shadow ray from the hit toward a point light. If anything intersects that ray before the light, you add no direct light at the hit. A reflection ray leaves along the mirror direction. With a recursion cap of 2, you follow one more bounce and then stop, so mirrors cannot loop. You shade the closest hit with the cosine rule, then add the reflection term.",
        ],
        {
          kind: "flow",
          caption: "One pixel starts one camera ray, then a short chain of secondary rays.",
          steps: ["Cast the camera ray", "Keep the closest hit", "Cast a shadow ray", "Reflect, then stop at 2"],
        },
        "A hit 3 units out",
        [
          "The camera ray starts at (0, 0, 4) and hits a triangle at distance 3. A second triangle at distance 6 loses.",
          "The shadow ray from the hit reaches the light with no intersection, so you add the direct cosine term.",
          "The reflection ray is cast once. The cap of 2 means the reflected hit does not spawn its own reflection.",
        ],
        [
          {
            prompt: "Two triangles sit at distances 3 and 6 along the same camera ray. Which hit do you shade?",
            answer: "The triangle at distance 3. You keep the smallest positive distance and ignore the farther hit.",
          },
          {
            prompt: "A reflection path wants a third bounce, but the cap is 2. What do you do?",
            answer: "Stop. You already used the two allowed bounces, so you do not spawn another reflection ray.",
          },
        ],
      ),
      lec(
        "l6",
        "Patches and radiosity",
        [
          "You switch from rays to patches when the light is mostly diffuse. Split a room into 20 patches. Each patch has an area and a view of the others. The form factor from patch i to patch j is the fraction of light leaving i that arrives at j. You compute those fractions once, because the mechanism depends on geometry, not on how bright the patches currently are.",
          "You then solve for radiosities. A patch radiosity is its emitted light plus its reflectance times the light gathered from the other 19 patches, each weighted by a form factor. If one patch emits 1 and the rest emit 0, light still reaches a facing patch, and that patch reflects a fraction. You iterate the gather until the change in every patch drops below 0.01.",
        ],
        {
          kind: "pipeline",
          caption: "Form factors come from geometry. Radiosity comes from repeating the gather.",
          stages: ["Split into 20 patches", "Store form factors", "Gather the light", "Stop below 0.01"],
        },
        "Two patches facing each other",
        [
          "Patch A emits 1 and has reflectance 0. Patch B emits 0 and has reflectance 0.5.",
          "The form factor from B to A is 1, a toy case where all of the light B receives comes from A.",
          "B radiosity is 0 plus 0.5 times 1, which is 0.5. A stays at 1 because its reflectance is 0.",
        ],
        [
          {
            prompt: "You have 20 patches. How many form factors do you store if every patch has a factor to every patch, including a zero to itself?",
            answer: "400. Each of the 20 patches stores a factor to each of the 20 patches, and 20 times 20 is 400.",
          },
          {
            prompt: "Patch B has reflectance 0.5, emission 0, and gathers 1 from the other patches. What is its radiosity?",
            answer: "0.5. Radiosity is emission plus reflectance times gathered light, so 0 plus 0.5 times 1.",
          },
        ],
      ),
      lec(
        "l7",
        "A matrix per frame",
        [
          "You animate the triangle by changing a transform over time, not by rewriting the 3 vertex positions by hand each frame. At frame 0 the triangle sits in its rest pose. At frame 30, half a second later at 60 frames per second, a rotation about y has turned it. You store the rest positions in a buffer and send a new matrix each frame. The vertices stay in that buffer.",
          "You hand the rest of the frame to the graphics processor. It runs a vertex stage on each of the 3 vertices, then a raster stage that builds fragments, then a fragment stage that shades them. The depth test still happens, in fixed hardware beside the color write. You keep the vertex buffer static and the matrix in a small uniform slot so the mesh is not reloaded when only the pose changed.",
        ],
        {
          kind: "pipeline",
          caption: "The mesh stays in the buffer. The matrix changes with the frame number.",
          stages: ["Rest vertex buffer", "Vertex stage", "Raster stage", "Fragment stage"],
        },
        "A 60 frame spin",
        [
          "The mesh buffer holds the 3 rest vertices for all 60 frames. You upload that buffer once.",
          "Frame 0 uses a matrix with no rotation. Frame 30 uses a half turn about y, which is 180 degrees.",
          "Only the uniform matrix changes between those frames. You do not upload the 3 vertices again.",
        ],
        [
          {
            prompt: "The animation is 60 frames and the pose changes every frame. How many times do you upload the 3 rest vertices?",
            answer: "Once. You keep them in a static buffer and upload a new matrix each frame instead.",
          },
          {
            prompt: "Name the three processor stages that run after you submit the mesh, in order.",
            answer: "Vertex stage, then raster stage, then fragment stage. The depth test sits with the color write, not as a fourth stage you schedule.",
          },
        ],
      ),
      lec(
        "l8",
        "Choosing how a frame is made",
        [
          "You can now take the 3-vertex triangle, put a camera at (0, 0, 4), and produce a shaded image either by rasterizing with a depth buffer or by tracing one ray per pixel. You can also bounce diffuse light across 20 patches, and you can move the triangle over 60 frames by changing a matrix. The practical split is a raster path for interactive frames and a ray path when you need a reflection with a cap of 2.",
          "You still match the mechanism to the path the light takes. A depth buffer can hide a triangle at depth 5, but it does not tell you if that point sees a lamp. A shadow ray does. Radiosity will not give a sharp mirror, because a form factor spreads light by area, not along 1 reflection direction. You pick the tool that matches the scene.",
        ],
        {
          kind: "pair",
          caption: "Two ways to hide what should not be seen, and the question each one answers.",
          leftTitle: "Depth buffer",
          rightTitle: "Shadow ray",
          left: ["Compares two depths", "Keeps the closer color", "No lamp visibility"],
          right: ["From the hit to the lamp", "A hit means shadow", "Drops the direct term"],
        },
        "One triangle, two tests",
        [
          "Rasterize the triangle from the camera at (0, 0, 4). The depth buffer stores the near depth at each covered pixel.",
          "Trace one camera ray through the center pixel. It hits at distance 4 if the triangle contains the origin.",
          "From that hit, a shadow ray either reaches the lamp or stops on a blocker. The raster image has no such test unless you add one.",
        ],
        [
          {
            prompt: "Combine the depth test and a shadow ray. A pixel has a far fragment at depth 5 and a near fragment at depth 2. The near hit shadow ray meets a blocker. What direct light do you write?",
            answer: "None. You keep the near fragment because depth 2 is closer than depth 5, and the shadow ray says that hit is blocked, so the direct term is 0.",
          },
          {
            prompt: "You need a sharp mirror and a 60 frame animation. Which two mechanisms do you use?",
            answer: "A reflection ray under the cap of 2, and a matrix that changes each frame while the 3 rest vertices stay in a static buffer. Radiosity would blur the mirror.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-645",
    lectures: [
      lec(
        "l1",
        "Four points and de Casteljau",
        [
          "You build a cubic Bezier curve from 4 control points. It starts at the first point and ends at the last. The middle two pull the shape but the curve need not pass through them. At t = 0 you are at the first point, and at t = 1 you are at the last. You evaluate t by repeated linear blends, the de Casteljau step, instead of expanding a polynomial.",
          "You take P0 = (0, 0), P1 = (1, 2), P2 = (2, 2), and P3 = (3, 0). At t = 0.5 each blend is a midpoint, so the first step yields (0.5, 1), (1.5, 2), and (2.5, 1). Two more steps land on the curve. You keep all 4 points, because moving P1 changes the leaving tangent at P0 and does not move the endpoint P0 itself.",
        ],
        {
          kind: "flow",
          caption: "de Casteljau evaluates a cubic by blending, not by expanding powers of t.",
          steps: ["Start with 4 points", "Blend each pair at t", "Blend the results", "Land on the curve"],
        },
        "The sample cubic at t = 0.5",
        [
          "The first blends are the midpoints (0.5, 1), (1.5, 2), and (2.5, 1).",
          "The second blends are the midpoints of those, (1, 1.5) and (2, 1.5).",
          "The third blend is (1.5, 1.5). That point lies on the curve. Parameter 0.5 is not a claim about arc length.",
        ],
        [
          {
            prompt: "At t = 0, which control point does the cubic pass through?",
            answer: "P0, the first control point. The curve passes through the first and last of the 4 points, not through the middle two.",
          },
          {
            prompt: "You move P1 from (1, 2) to (1, 4). Does P0 move?",
            answer: "No. P0 stays at (0, 0). Moving P1 changes the tangent that leaves P0.",
          },
        ],
      ),
      lec(
        "l2",
        "Joins that match, or do not",
        [
          "You join two cubic segments so a longer wire can look like one curve. Position continuity, called C0, means the end of the first segment and the start of the second are the same point. If both are (3, 0), the join has no gap. You can still have a corner, because C0 says nothing about direction. The mechanism is a shared point, not a shared tangent.",
          "You get a C1 join when the outgoing tangent of the first segment matches the incoming tangent of the second in direction and length. With the shared point at (3, 0), a shared tangent vector of (1, -1) makes the join C1. Matching direction only, while the second tangent is twice as long, is geometric smoothness, G1. You use G1 when the parameter speed may jump.",
        ],
        {
          kind: "pair",
          caption: "A shared point closes a gap. A shared tangent vector removes the corner.",
          leftTitle: "C0 join",
          rightTitle: "C1 join",
          left: ["Same endpoint", "A corner is allowed", "Tangents may differ"],
          right: ["Same endpoint", "Same tangent vector", "No corner at the join"],
        },
        "Two segments at (3, 0)",
        [
          "Segment A ends at (3, 0) with tangent vector (1, -1).",
          "Segment B starts at (3, 0), and its first control sits at (4, -1), the same offset of (1, -1).",
          "Position and tangent both match, so the join is C1. If B started toward (4, 1), you would have C0 only.",
        ],
        [
          {
            prompt: "Two segments meet at (3, 0) but their tangents point opposite ways. Which continuity do you have?",
            answer: "C0 only. The positions match, so there is no gap, but the tangent vectors do not match, so the join is not C1.",
          },
          {
            prompt: "The tangents match in direction, but the second is twice as long. Is the join C1?",
            answer: "No. C1 needs the tangent vectors to match in direction and length. Matching direction only is G1.",
          },
        ],
      ),
      lec(
        "l3",
        "A spline that edits locally",
        [
          "You use a cubic B-spline when you want local control. A point on the curve depends on 4 consecutive control points, not on the whole chain. Move control point number 7 in a chain of 12 and only the nearby spans change. You do not rerun the blend on the distant spans. The 4 basis weights in a span sum to 1, so the curve stays in their convex hull.",
          "You place the parameter on uniform knots spaced by 1, so span k runs from parameter k to k + 1. Inside one span you blend the 4 active controls. At a knot of multiplicity 1 the cubic stays C2: position, tangent, and curvature agree. Raise that knot to multiplicity 3 and the curve can pass through a control and lose that smoothness. That is how you cut a corner without splitting the chain by hand.",
        ],
        {
          kind: "layers",
          caption: "A cubic span reads four controls. The other controls in the chain stay idle.",
          rows: ["One span, four controls", "Weights that sum to 1", "Distant spans stay put"],
        },
        "Editing point 7 of 12",
        [
          "The chain has 12 control points. You move point 7 from (7, 0) to (7, 2).",
          "A cubic span uses 4 consecutive controls, so a span that does not include point 7 is unchanged.",
          "You recompute only the spans that include point 7. The rest of the chain keeps its old points.",
        ],
        [
          {
            prompt: "How many control points does one cubic B-spline span use?",
            answer: "4. A point on a cubic span is a blend of 4 consecutive controls, and those basis weights sum to 1.",
          },
          {
            prompt: "You raise one knot from multiplicity 1 to multiplicity 3. What agreement can you lose?",
            answer: "The C2 agreement at that knot. Multiplicity 1 keeps position, tangent, and curvature matched. Multiplicity 3 can put a corner on a control.",
          },
        ],
      ),
      lec(
        "l4",
        "Sixteen controls on a patch",
        [
          "You make a surface patch as a grid of curves. A bicubic Bezier patch has 4 rows of 4 control points, 16 points in all. You pick parameters u and v, each from 0 to 1. First you run de Casteljau along each row at the chosen u, which gives you 4 points. Then you run it down those 4 points at v. One pair (u, v) yields one point on the patch.",
          "You read each boundary off the border of the grid. The edge at v = 0 is the cubic of the first row of 4 controls. A corner of the patch is a corner control, so the patch passes through its 4 corners and not through the other 12 controls. You move an interior control to bulge the middle without sliding a corner. The corner stays on its control point.",
        ],
        {
          kind: "pipeline",
          caption: "A bicubic patch is two nested curve evaluations on a 4 by 4 grid.",
          stages: ["16 control points", "Four blends in u", "One blend in v", "A surface point"],
        },
        "A flat patch, then a bulge",
        [
          "All 16 controls have z = 0. The corners are (0, 0, 0), (3, 0, 0), (0, 3, 0), and (3, 3, 0).",
          "At (u, v) = (0.5, 0.5) every blend stays in the plane z = 0.",
          "Raise the interior controls by 2 and evaluate again. The corners stay on z = 0 and the center rises.",
        ],
        [
          {
            prompt: "How many control points does a bicubic Bezier patch have?",
            answer: "16. The grid is 4 rows of 4 controls.",
          },
          {
            prompt: "You move one interior control. Which of the 4 corners move?",
            answer: "None. The patch passes through its 4 corner controls. An interior control bulges the middle and does not slide a corner.",
          },
        ],
      ),
      lec(
        "l5",
        "A lattice of 64 points",
        [
          "You extend the patch by one parameter when the shape has thickness. A tricubic Bezier solid uses a lattice of 4 by 4 by 4 controls, which is 64 points. A parameter triple (u, v, w), each from 0 to 1, picks one point in the volume. You evaluate it as three nested de Casteljau passes, along u, then v, then w. The 8 corners of the lattice are corners the map must hit.",
          "You use the solid for a bracket that is 2 units thick, with the outer boundary on one parameter face and the inner boundary on the opposite face. Deform the lattice and both boundaries follow, so thickness is not painted on later. You still test for a fold. If two different triples land on one point, the solid has pinched, and a later slice will lie to you about what is inside.",
        ],
        {
          kind: "layers",
          caption: "One more parameter turns a patch into a volume. A fold means two triples collide.",
          rows: ["64 control points", "Three nested blends", "A point in the volume", "Reject a folded map"],
        },
        "Two corners and a center parameter",
        [
          "The lattice is 4 by 4 by 4. Parameter (0, 0, 0) returns the control at that corner.",
          "Parameter (1, 1, 1) returns the opposite corner. Those two are among the 8 corners the solid passes through.",
          "Parameter (0.5, 0.5, 0.5) is inside the parameter cube. It is a blend of controls, not automatically one center control.",
        ],
        [
          {
            prompt: "How many control points are in a 4 by 4 by 4 tricubic lattice?",
            answer: "64. You multiply 4 by 4 by 4.",
          },
          {
            prompt: "Two different parameter triples evaluate to the same point. What is wrong?",
            answer: "The solid has folded or pinched. Different triples should land on different points, or a slice through the volume is no longer trustworthy.",
          },
        ],
      ),
      lec(
        "l6",
        "Vertices, edges, and faces",
        [
          "You describe a mesh by connectivity, not by where the vertices sit. Count vertices V, edges E, and faces F. One triangle has V = 3, E = 3, and F = 1. For a mesh that is a single disk, V minus E plus F equals 1, and 3 minus 3 plus 1 equals 1. You recompute that count after every edit. A wrong total means a hole, a pinch, or an edge you counted twice.",
          "You weld a second triangle onto one edge. The new face adds 1 face, 2 edges, and 1 vertex, because the shared edge and its 2 vertices are already stored. The totals become V = 4, E = 5, and F = 2, and 4 minus 5 plus 2 is still 1. You store the shared edge once, with two face pointers. Storing it twice inflates E even though the picture looks welded.",
        ],
        {
          kind: "pair",
          caption: "The same disk count before and after a weld. The shared edge is stored once.",
          leftTitle: "One triangle",
          rightTitle: "Two triangles welded",
          left: ["V 3, E 3, F 1", "Count equals 1", "No shared edge"],
          right: ["V 4, E 5, F 2", "Count still equals 1", "One edge, two faces"],
        },
        "Weld along one edge",
        [
          "Start from V = 3, E = 3, F = 1. The disk count is 1.",
          "Add a triangle on one edge: plus 1 vertex, plus 2 edges, plus 1 face.",
          "The result is V = 4, E = 5, F = 2. Then 4 minus 5 plus 2 equals 1, so the mesh is still a disk.",
        ],
        [
          {
            prompt: "A disk mesh has V = 6 and E = 8. What must F be so that V minus E plus F equals 1?",
            answer: "3. Six minus 8 is -2, and -2 plus 3 equals 1.",
          },
          {
            prompt: "You store the shared edge of the two-triangle mesh as two edges. What is E, and what is the count?",
            answer: "E becomes 6 instead of 5. Then V minus E plus F is 4 minus 6 plus 2, which equals 0, so the count no longer matches a disk.",
          },
        ],
      ),
      lec(
        "l7",
        "Union, intersection, difference",
        [
          "You combine two solids with a Boolean test instead of dragging vertices. Union keeps any point inside either solid. Intersection keeps a point only when it is inside both. Difference keeps points inside the first and outside the second. You classify each candidate with 2 inside tests. A point inside both is in the intersection, and that same point is rejected by difference.",
          "You apply the tests to a box and a cylinder. The box occupies x and y from 0 to 4, and z from 0 to 2. The cylinder has radius 1 and its axis along z through (2, 2). A point at (2, 2, 1) is inside both, so intersection keeps it and difference removes it. A point at (0.2, 0.2, 1) is inside the box only, so difference keeps it and intersection discards it.",
        ],
        {
          kind: "flow",
          caption: "Each Boolean is two inside tests and a rule for how the two answers combine.",
          steps: ["Test the first solid", "Test the second solid", "Apply one rule", "Keep or drop the point"],
        },
        "Box minus cylinder",
        [
          "The box runs from 0 to 4 in x and y, and from 0 to 2 in z. The cylinder has radius 1 about (2, 2).",
          "The point (2, 2, 1) is inside both solids, so difference rejects it.",
          "The point (0.2, 0.2, 1) is inside the box and outside the cylinder, so difference keeps it.",
        ],
        [
          {
            prompt: "A point is inside the box and inside the cylinder. Is it in the intersection?",
            answer: "Yes. Intersection keeps a point only when both inside tests pass, and both pass here.",
          },
          {
            prompt: "That same point is tested for box minus cylinder. Do you keep it?",
            answer: "No. Difference keeps points inside the first solid and outside the second. This point is inside the cylinder, so it is removed.",
          },
        ],
      ),
      lec(
        "l8",
        "A model you can check",
        [
          "You can now lay a cubic through 4 controls with de Casteljau, join two cubics as C0 or C1, and edit one span of a 12-point B-spline without touching the far spans. You can fill a 16-point patch and a 64-point solid, check a disk mesh with V minus E plus F, and combine a box with a cylinder by union, intersection, or difference. Each construction has a count you can recompute.",
          "You close a model by checking shape and connectivity together. A join that is only C0 still shows a corner even when the Boolean solid is closed. A mesh whose disk count is not 1 will break a later cut even if the Bezier boundary looked smooth. You run the tangent test at the join and the count on the mesh before you trust the solid you are about to hand off.",
        ],
        {
          kind: "pipeline",
          caption: "Build, then check the join and the count, then combine solids.",
          stages: ["Build the curves", "Fill patch or solid", "Check V, E, and F", "Boolean combine"],
        },
        "A disk under a smooth wire",
        [
          "Two cubics meet at (3, 0) with the same tangent vector, so the wire join is C1.",
          "The mesh under the wire is the welded pair: V = 4, E = 5, F = 2, and the disk count is 1.",
          "You then subtract a cylinder of radius 1. A point inside both solids is removed, and you recompute the count after the cut.",
        ],
        [
          {
            prompt: "Combine continuity and topology. Two cubics meet at one point but their tangents differ, and the mesh has V = 4, E = 5, F = 2. What is true of each?",
            answer: "The mesh is still a disk because 4 minus 5 plus 2 equals 1, but the curve join is only C0. The corner stays until the tangent vectors match.",
          },
          {
            prompt: "A bicubic patch has 16 controls and you move 1 interior control. How many corners stay fixed?",
            answer: "All 4 corners stay fixed. You rerun the nested de Casteljau steps for the (u, v) pairs you care about, because an interior control changes the interior only.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-646",
    lectures: [
      lec(
        "l1",
        "Sixteen samples in a grid",
        [
          "You store an image as a grid of samples, not as paint. A 4 by 4 gray image holds 16 numbers, one per pixel. You index a pixel by column c and row r, each running from 0 to 3. The value at (c, r) is the light recorded in that cell. You keep the 16 values in row order so pixel (c, r) sits at index 4 times r plus c. Display size is a separate scale.",
          "You can draw those same 16 values as a 2 inch square or a 4 inch square. The samples do not change when only the scale changes. You resample when you need a new grid. An 8 by 8 grid would hold 64 samples, and you do not have them yet. Inventing them by stretching the drawing is a display change, not a new measurement of the scene.",
        ],
        {
          kind: "layers",
          caption: "Address the sample first. The size on the page is not another sample.",
          rows: ["16 samples, row order", "Index is 4r plus c", "Display scale is separate"],
        },
        "Address of one pixel",
        [
          "The image has 4 columns and 4 rows. Both indices run from 0 to 3.",
          "Pixel (c, r) = (2, 1) has index 4 times 1 plus 2, which is 6.",
          "Changing the drawn width from 2 inches to 4 inches does not move the sample at index 6.",
        ],
        [
          {
            prompt: "Where is pixel (0, 3) stored in the row-order array of a 4 by 4 image?",
            answer: "At index 12. The index is 4 times the row plus the column, so 4 times 3 plus 0 is 12.",
          },
          {
            prompt: "You draw the same 16 samples at twice the width. How many samples do you have?",
            answer: "16. Display scale does not create samples. An 8 by 8 grid would need 64 samples, which this image does not have.",
          },
        ],
      ),
      lec(
        "l2",
        "Levels from 0 to 255",
        [
          "You display each sample by mapping it onto a device range. A sample stored from 0 to 255 uses 8 bits, so there are 256 levels. Level 0 is the darkest mark and level 255 is the brightest. You store the nearest level. If the ideal value is 100.4 you store 100, and the leftover 0.4 is quantization error. That error is part of the representation, not a later filter.",
          "You see the error as bands when a smooth ramp has too few levels. A ramp across 4 columns that should rise by a fraction per column cannot, because stored levels are integers. You dither by adding a small pattern before the round, so neighboring pixels round in different directions. Across those 4 pixels the average can sit between two levels even though each stored sample is an integer.",
        ],
        {
          kind: "pipeline",
          caption: "Quantization picks a level. Dither moves the rounding, not the level set.",
          stages: ["Ideal sample", "Add a dither", "Round to a level", "Store 0 to 255"],
        },
        "Rounding one sample",
        [
          "The ideal value is 100.4. The nearest of the 256 levels is 100.",
          "The quantization error is 100.4 minus 100, which is 0.4.",
          "A neighbor whose ideal value is 100.6 rounds to 101. The pair of errors points in opposite directions.",
        ],
        [
          {
            prompt: "How many distinct levels can an 8 bit sample store?",
            answer: "256. The stored levels run from 0 through 255.",
          },
          {
            prompt: "An ideal value is 20.2 and you store the nearest integer level. What is the quantization error?",
            answer: "0.2. You store 20, and 20.2 minus 20 is 0.2.",
          },
        ],
      ),
      lec(
        "l3",
        "Three channels and a luminance",
        [
          "You store color as three channels, red, green, and blue, each on the same 0 to 255 scale. One pixel is three numbers, so a 4 by 4 color image holds 48 samples rather than 16. You do not mix the channels in the file. A blur that should treat the picture as one image must apply the same weights to each channel. Different weights slide the edges apart and leave a colored fringe.",
          "You convert to luminance when the edit is about brightness. Use weights 0.2, 0.7, and 0.1 on red, green, and blue. Those three weights add to 1. For red 100, green 40, and blue 10, the luminance is 0.2 times 100 plus 0.7 times 40 plus 0.1 times 10, which is 49. You keep the three channels if a later step still needs the hue.",
        ],
        {
          kind: "pair",
          caption: "Three channels keep hue. Luminance collapses them with weights that add to 1.",
          leftTitle: "Three channels",
          rightTitle: "One luminance",
          left: ["Red, green, and blue", "48 samples in 4 by 4", "Filter each the same"],
          right: ["Weights 0.2, 0.7, 0.1", "The weights add to 1", "Hue is dropped"],
        },
        "Luminance of one pixel",
        [
          "The pixel stores red 100, green 40, and blue 10.",
          "The products are 0.2 times 100 = 20, 0.7 times 40 = 28, and 0.1 times 10 = 1.",
          "The luminance is 20 plus 28 plus 1, which is 49. The original three channels stay if you still need hue.",
        ],
        [
          {
            prompt: "How many channel samples are in a 4 by 4 image with 3 channels?",
            answer: "48. Each of the 16 pixels stores 3 numbers, and 16 times 3 is 48.",
          },
          {
            prompt: "Red is 0, green is 100, and blue is 0. With weights 0.2, 0.7, and 0.1, what is the luminance?",
            answer: "70. Only the green term is nonzero, and 0.7 times 100 is 70.",
          },
        ],
      ),
      lec(
        "l4",
        "A 3 by 3 kernel",
        [
          "You filter by replacing each pixel with a weighted sum of its neighbors. A 3 by 3 box has 9 weights, each 1/9, and the 9 weights add to 1 so a flat region does not get brighter. You center the kernel on pixel (c, r), multiply each covered sample by its weight, and sum. You write the sum into a new 4 by 4 buffer. Writing into the input would feed changed values to the next pixel.",
          "You need a border rule, because pixel (0, 0) does not have a full neighborhood inside a 4 by 4 image. You can skip the border, copy the input there, or repeat the edge sample so the kernel still sees 9 values. Repeating the edge is a mechanism, not a measurement: the missing sample is a copy. You use the same rule on all 4 borders so the corners are not a special case you forget.",
        ],
        {
          kind: "flow",
          caption: "The kernel reads the input. The result goes to a second buffer.",
          steps: ["Center a 3 by 3 kernel", "Multiply the nine samples", "Write a new buffer", "Use one border rule"],
        },
        "A flat region of 2",
        [
          "Every sample under the kernel is 2, and each of the 9 weights is 1/9.",
          "The weighted sum is 9 times 1/9 times 2, which is 2. The flat region stays flat because the weights add to 1.",
          "You store that 2 in the output buffer, so the next pixel still reads the original samples.",
        ],
        [
          {
            prompt: "A kernel has 9 weights, each equal to 1. What is wrong with using it as a blur on a flat region of value 2?",
            answer: "The weights add to 9, not to 1, so the region becomes 18. A box blur needs weights that add to 1, such as 1/9 each.",
          },
          {
            prompt: "Why do you write filter output into a second buffer?",
            answer: "So later pixels still read the original samples. Writing into the input mixes old and new values inside one kernel.",
          },
        ],
      ),
      lec(
        "l5",
        "Stretch and sharpen",
        [
          "You stretch contrast when the 16 samples of a 4 by 4 image all lie between 40 and 80. Map 40 to 0 and 80 to 255 with a linear rule. A sample of 60 is halfway from 40 to 80, so it maps halfway from 0 to 255, which is 127.5, and you then quantize. You skip this stretch if a single spike already occupies 0 or 255, because the rest of the image would stay cramped.",
          "You sharpen by putting back a fraction of the detail a blur removed. Subtract the blurred copy from the original, then add part of that difference to the original. If a pixel is 80, its blur is 50, and you add half the difference, the result is 80 plus 0.5 times 30, which is 95. You cap the result at 255 so a strong edge cannot wrap around to a dark value.",
        ],
        {
          kind: "pipeline",
          caption: "Stretch uses the range you measured. Sharpen adds a fraction of a difference.",
          stages: ["Find low and high", "Stretch toward 255", "Add high-pass detail", "Cap the result at 255"],
        },
        "One stretch and one sharpen",
        [
          "Samples lie from 40 to 80. The sample 60 is halfway, so the linear map sends it to 127.5 before rounding.",
          "A different pixel is 80 and its blur is 50. The difference is 30.",
          "Adding half of 30 gives 95. If a sum exceeded 255 you would store 255, not a wrapped value.",
        ],
        [
          {
            prompt: "The darkest sample is 40 and the brightest is 80. What does the linear stretch map 40 to, before quantization?",
            answer: "0. You send the low end of the measured range to 0 and the high end, 80, to 255.",
          },
          {
            prompt: "A pixel is 10 and its blur is 10. You add half the difference. What is the sharpened value?",
            answer: "10. The difference is 0, so you add 0. There was no detail to put back.",
          },
        ],
      ),
      lec(
        "l6",
        "Pulling samples through a warp",
        [
          "You warp by an inverse map: each output pixel asks where it came from in the input. For each of the 16 output pixels you compute a source location, which may fall between input samples. You read it with bilinear interpolation from the 4 surrounding pixels. You do not push input pixels forward. Two inputs can land on one output and leave another output with no sample at all.",
          "You try a shift of 1 column to the right. Output pixel (c, r) reads the input at column c minus 1 in the same row. Output column 0 asks for column -1, which is outside the 4 columns, so you write 0. Output columns 1, 2, and 3 read input columns 0, 1, and 2. The last input column is never read. That is the inverse map doing one shift, including the hole it creates.",
        ],
        {
          kind: "pair",
          caption: "Pushing pixels forward leaves holes. Pulling gives every output one source.",
          leftTitle: "Push forward",
          rightTitle: "Inverse map",
          left: ["Input hunts an output", "Holes where none lands", "Two inputs can collide"],
          right: ["Each output asks once", "Sample 4 neighbors", "Outside reads become 0"],
        },
        "Shift one row by a column",
        [
          "One input row is 10, 20, 30, 40.",
          "The inverse shift by 1 column reads source columns -1, 0, 1, and 2.",
          "The output row is 0, 10, 20, 30. The input value 40 is not copied, because nothing asks for column 3.",
        ],
        [
          {
            prompt: "Why do you pull samples with an inverse map instead of pushing each input pixel forward?",
            answer: "Pushing can send two inputs onto one output and leave another output empty. Pulling gives every one of the 16 outputs a single source location.",
          },
          {
            prompt: "An inverse map asks for column -1 on a 4 column image. What do you write?",
            answer: "0. Column -1 is outside the image, so there is no sample to interpolate.",
          },
        ],
      ),
      lec(
        "l7",
        "Alpha on one pixel",
        [
          "You composite two 4 by 4 images with an alpha weight on the foreground pixel. Alpha 1 copies the foreground. Alpha 0 keeps the background. Alpha 0.25 forms the output as 0.25 times the foreground plus 0.75 times the background. If the rest of your pipeline stores premultiplied color, you multiply by alpha before you store, and you stay with that convention. Mixing the two conventions darkens edges.",
          "You compute one pixel by hand. The foreground is 200 with alpha 0.25, and the background is 40 with alpha 1. The straight composite is 0.25 times 200 plus 0.75 times 40, which is 50 plus 30, which is 80. The background alpha does not change the weights because it is already 1. You use that same alpha on all 3 channels so one channel does not pick up a tint.",
        ],
        {
          kind: "flow",
          caption: "One alpha blends one foreground pixel over one background pixel.",
          steps: ["Read color and alpha", "Read the background", "Blend with one weight", "Write the output"],
        },
        "Gray under a quarter weight",
        [
          "The foreground color is 200 and its alpha is 0.25. The background color is 40.",
          "The foreground contributes 0.25 times 200, which is 50.",
          "The background contributes 0.75 times 40, which is 30. The output pixel is 80.",
        ],
        [
          {
            prompt: "Alpha is 1. The foreground is 15 and the background is 90. What is the output?",
            answer: "15. Alpha 1 copies the foreground and does not use the background.",
          },
          {
            prompt: "Alpha is 0.25, the foreground is 200, and the background is 40. What is the straight composite?",
            answer: "80. You add 0.25 times 200 and 0.75 times 40, which is 50 plus 30.",
          },
        ],
      ),
      lec(
        "l8",
        "A pipeline on a small grid",
        [
          "You can now address any of the 16 pixels in a 4 by 4 grid, quantize into 256 levels, turn 3 channels into a luminance, blur with a 3 by 3 kernel whose weights add to 1, stretch a range, warp by an inverse map, and composite with alpha. Each step writes a number you can recompute on this grid. Staying at 4 by 4 is practice, not a limit on later images.",
          "You chain two operations only after you name the buffer each one reads. A blur must finish into its own buffer before a warp samples that result. A composite that expects alpha from 0 to 1 is wrong if you feed it a sample you already stretched toward 255. You write the range on every buffer. The mechanism is the same either way. The range is what changes the meaning.",
        ],
        {
          kind: "pipeline",
          caption: "Name the buffer and its range before you connect the next operation.",
          stages: ["Samples and levels", "Filter or stretch", "Warp by inverse map", "Composite with alpha"],
        },
        "Blur a flat foreground, then place it",
        [
          "A 3 by 3 box on a flat region of 2 returns 2, because the weights add to 1. You write 2 into a new buffer.",
          "That buffer is the foreground. Alpha is 0.25 and the background is 40.",
          "The composite is 0.25 times 2 plus 0.75 times 40, which is 0.5 plus 30, which is 30.5.",
        ],
        [
          {
            prompt: "Combine the box filter and the composite. A flat foreground of 2 is blurred with weights that add to 1, then placed at alpha 0.25 over a background of 40. What is the output?",
            answer: "30.5. The blur leaves the value 2, and 0.25 times 2 plus 0.75 times 40 is 0.5 plus 30.",
          },
          {
            prompt: "Pixel (2, 1) is warped after a stretch that maps the sample 60 to 127.5. Which value does the inverse map read?",
            answer: "The stretched value, once that stretch has been written into the buffer the warp reads. The inverse map samples the buffer you give it. It does not remember the earlier range of 40 to 80.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-647",
    lectures: [
      lec(
        "l1",
        "A pinhole at (0, 0, 5)",
        [
          "You form an image with a pinhole at (0, 0, 5) and an image plane at z = 4, one unit in front of the pinhole. A scene point and the pinhole determine a line, and that line meets the plane in one place. You store the meeting point as a pixel. A point on the z axis projects along that axis and hits the center of the plane. This projection is the mechanism that assigns scene points to pixels.",
          "You turn the hit into a column using the plane width. The plane runs from x = -1 to x = 1, so a hit at x = 0.5 is halfway from the center to the right edge. On a 4 by 4 image that hit falls on a boundary between two columns. You give each column a half-open interval so the boundary belongs to exactly 1 of the 4 columns.",
        ],
        {
          kind: "pipeline",
          caption: "A scene point, a line through the pinhole, one hit, one column.",
          stages: ["Scene point", "Line through pinhole", "Hit on the plane", "One pixel column"],
        },
        "The origin through the pinhole",
        [
          "The pinhole is at (0, 0, 5). The plane is z = 4 and runs from x = -1 to x = 1.",
          "The origin, the pinhole, and the plane center are on one line, so the hit is the center (0, 0, 4).",
          "x = 0 is the boundary between column 1 and column 2 of the 4 columns. Your half-open rule assigns it to one column.",
        ],
        [
          {
            prompt: "The pinhole is at (0, 0, 5) and the plane is at z = 4. A scene point lies on the z axis. Where does it hit in x and y?",
            answer: "At x = 0 and y = 0, the center of the plane. The line is the z axis.",
          },
          {
            prompt: "Why does a boundary between two of the 4 columns need a half-open rule?",
            answer: "So the boundary point belongs to exactly one column. Without the rule you would count it in two columns or drop it.",
          },
        ],
      ),
      lec(
        "l2",
        "A lamp and a cosine",
        [
          "You shade a visible hit with light that comes straight from a lamp. That is local illumination. The lamp is at (0, 4, 0). The hit is at (0, 0, 0) with normal (0, 1, 0), so the direction to the lamp matches the normal and the cosine is 1. You multiply intensity 3 by albedo 0.2 by that cosine and get a diffuse brightness of 0.6. A cosine of 0 would zero the product.",
          "You add a specular term only around the mirror of the lamp direction. If the eye sits on that reflected ray, the specular weight is 1. If the eye is 30 degrees off it, you raise the cosine of that 30 degree gap to a shininess power. With power 2, a cosine of 0.5 becomes 0.25. You force the specular term to 0 when the diffuse cosine was clamped, so a back face does not glint.",
        ],
        {
          kind: "pair",
          caption: "Both terms are local. Only the specular term looks at the eye.",
          leftTitle: "Diffuse term",
          rightTitle: "Specular term",
          left: ["Lamp direction, normal", "Cosine clamped at 0", "Intensity times albedo"],
          right: ["Mirror of the lamp", "Raised to a power", "Off if diffuse is 0"],
        },
        "Brightness 0.6, then a glint",
        [
          "Intensity 3, albedo 0.2, and cosine 1. The diffuse term is 3 times 0.2 times 1, which is 0.6.",
          "The eye is 30 degrees off the mirror direction, and the cosine of that angle is 0.5.",
          "Shininess 2 turns 0.5 into 0.25. You multiply the specular coefficient by 0.25 only if the diffuse cosine was positive.",
        ],
        [
          {
            prompt: "Intensity is 3, albedo is 0.2, and the cosine is 0. What is the diffuse brightness?",
            answer: "0. The product is 3 times 0.2 times 0.",
          },
          {
            prompt: "The cosine to the lamp is negative, and the eye sits on the mirror direction. What specular weight do you use?",
            answer: "0. You turn the specular term off when the diffuse cosine was clamped to 0.",
          },
        ],
      ),
      lec(
        "l3",
        "A segment to the lamp",
        [
          "You test a shadow by walking from the hit toward the lamp and asking whether any surface lies on that segment. The hit is at (0, 0, 0) and the lamp is at (0, 4, 0), so the segment is 4 units long. A triangle that crosses it at distance 1 puts the hit in shadow, and you drop the direct term. You do not drop light the surface itself emits. Emission is not the lamp term.",
          "You bias the test so the hit does not shadow itself. A numerical intersection at distance 0.0001 is the surface you started from. You ignore intersections closer than 0.01. A blocker at distance 1 is farther than the bias and closer than the lamp, so you count it. You pick 0.01 because it is small beside a segment of length 4 and large beside the noise in the hit.",
        ],
        {
          kind: "flow",
          caption: "The shadow test is a segment. Hits nearer than the bias are the surface itself.",
          steps: ["Segment from hit to lamp", "Ignore hits under 0.01", "A nearer hit shadows", "Drop the direct term"],
        },
        "A blocker at distance 1",
        [
          "The lamp is 4 units above the hit at (0, 0, 0).",
          "An intersection at distance 0.0001 is under the bias of 0.01, so you ignore it as self-intersection.",
          "An intersection at distance 1 is a blocker, and the direct term becomes 0. A hit at distance 5 is past the lamp and does not count.",
        ],
        [
          {
            prompt: "The only intersection on the shadow segment is at distance 0.005, and the bias is 0.01. Is the hit in shadow?",
            answer: "No. 0.005 is closer than the bias, so you treat it as the surface itself and keep the direct term.",
          },
          {
            prompt: "A blocker is at distance 1 and the lamp is at distance 4. Is the hit in shadow?",
            answer: "Yes. The blocker is farther than the bias of 0.01 and closer than the lamp, so you drop the direct term.",
          },
        ],
      ),
      lec(
        "l4",
        "Which hit the pixel sees",
        [
          "You decide the visible surface before you shade. Along a camera ray the visible surface is the closest hit with positive distance. Hits at distances 2 and 7 mean you shade the hit at 2. A raster depth buffer makes the same choice: the fragment with the smaller depth wins. You shade the winner only. Shading the loser and then hiding it wastes the shadow test you would have spent on it.",
          "You treat transparency as continued visibility, not as a darker paint. If the closest surface has opacity 0.5, half the pixel still comes from behind it, so you keep the hit at distance 7 as well and composite. You stop after 3 transparent layers. A stack of glass must not demand an unbounded walk. Opaque surfaces still hide everything farther along the ray.",
        ],
        {
          kind: "pair",
          caption: "Opacity decides whether distance 7 is ever shaded. The closest hit is still first.",
          leftTitle: "Opaque winner",
          rightTitle: "Opacity 0.5",
          left: ["Keep distance 2", "Discard distance 7", "Shade the winner only"],
          right: ["Keep both hits", "Composite front and back", "Stop after 3 layers"],
        },
        "Two hits along one ray",
        [
          "The camera ray hits surfaces at distance 2 and at distance 7.",
          "If the near surface is opaque, you shade distance 2 and never look at distance 7.",
          "If the near opacity is 0.5, you shade both and composite them. You do not continue past a third transparent layer.",
        ],
        [
          {
            prompt: "Hits lie at distances 2 and 7, and the near surface is opaque. Which distance do you shade?",
            answer: "2. The closest positive hit is the visible surface, and an opaque surface hides the hit at 7.",
          },
          {
            prompt: "The first three surfaces along the ray are transparent. Do you search for a fourth?",
            answer: "No. You stop after 3 transparent layers, even if more glass sits farther along the ray.",
          },
        ],
      ),
      lec(
        "l5",
        "Coordinates on a checker",
        [
          "You color a hit by a texture lookup at (u, v), each from 0 to 1. You store (u, v) on the vertices and interpolate them as you interpolate a normal. A 2 by 2 checker splits the unit square at 0.5. A hit at (0.25, 0.25) sits in one square, and (0.75, 0.25) sits in the neighbor. Those two hits can carry different albedos into the same shade.",
          "You filter the lookup when one pixel covers many texels. If the footprint is about 4 texels wide, you read a mip level that already averaged a block, not the single texel at the center. The center texel may be a black square of the checker while the pixel covers half black and half white. The averaged level keeps the checker from sparkling as the camera at (0, 0, 5) moves.",
        ],
        {
          kind: "pipeline",
          caption: "Interpolate the coordinates, choose a mip level, then shade with that albedo.",
          stages: ["Interpolate u and v", "Choose a mip level", "Read the albedo", "Then shade"],
        },
        "Two hits on a 2 by 2 checker",
        [
          "The checker splits at u = 0.5 and at v = 0.5.",
          "(u, v) = (0.25, 0.25) reads one square. (0.75, 0.25) reads the square beside it.",
          "A pixel whose footprint covers both squares reads a mip level averaged over about 4 texels, not either center texel alone.",
        ],
        [
          {
            prompt: "A hit has coordinates (0.75, 0.25) on a checker split at 0.5. Which side of the vertical split is it on?",
            answer: "The right side. u = 0.75 is past 0.5, while v = 0.25 is still below the horizontal split.",
          },
          {
            prompt: "A pixel footprint is 4 texels wide. Why do you avoid the single center texel?",
            answer: "The center can be one checker color while the footprint covers both colors. A mip level that averaged a block matches the footprint.",
          },
        ],
      ),
      lec(
        "l6",
        "Eight rays into the hemisphere",
        [
          "You account for light that bounced before it reached the hit. A path starts at the camera, hits the surface, and then continues into the scene, not only toward the lamp. With 1 extra bounce you catch light that reflected once. A red wall can tint the hit even when the lamp cosine is 0, because the light arrived from the wall. A local lamp term misses that tint. The bounce is the difference.",
          "You estimate the bounce with a fixed set of directions. Cast 8 rays from the hit into the hemisphere. If 2 of them see a bright wall and 6 see darkness, you average the 8 results. You do not keep the brightest. Before the average, you multiply each result by the cosine of its direction and by the albedo. Without the cosine, a grazing sample counts as much as one that faces the normal.",
        ],
        {
          kind: "flow",
          caption: "Direct light is the lamp. The bounce is an average of eight weighted rays.",
          steps: ["Shade the direct lamp", "Cast 8 bounce rays", "Weight each by cosine", "Average the eight"],
        },
        "Two bright samples out of eight",
        [
          "You cast 8 rays. Two return brightness 4 from a red wall, and the other six return 0.",
          "For a toy sample, take cosine and albedo both equal to 1, so each bright sample stays 4.",
          "The average is 4 plus 4 plus six zeros, divided by 8, which is 1. You add that 1 to the direct term.",
        ],
        [
          {
            prompt: "You cast 8 rays, all return brightness 2, and cosine and albedo are both 1. What is the average?",
            answer: "2. The eight samples sum to 16, and 16 divided by 8 is 2.",
          },
          {
            prompt: "The lamp cosine is 0 and a red wall is visible to some bounce rays. Does a local-only shade show the red tint?",
            answer: "No. Local illumination uses the lamp. The tint requires the bounce rays. With cosine 0 the direct diffuse term is already 0.",
          },
        ],
      ),
      lec(
        "l7",
        "Paths you may drop",
        [
          "You write the pixel as a sum of paths, and you drop a path only when you know it carries no light. A shadow ray that hits a blocker drops the direct path. A bounce into a closed black box returns 0, and that branch can stop. You do not drop a path only because it is dim. With albedo 0.5, a second bounce carries 0.5 times 0.5, which is 0.25, and 0.25 is still a contribution you add.",
          "You keep projection, visibility, and transport as three separate mechanisms. The pinhole at (0, 0, 5) chooses the camera ray. The closest-hit test, or the depth buffer, chooses the visible surface so you do not shade a hidden one. The samples choose how light reached that surface. You can render the same hit with 0 bounce rays or with 8. The pixel still names the same visible point.",
        ],
        {
          kind: "layers",
          caption: "Change the bounce count without changing which surface the pixel owns.",
          rows: ["Projection picks the ray", "Visibility picks the hit", "Samples sum the paths", "A zero path may stop"],
        },
        "A factor of 0.25",
        [
          "The albedo is 0.5. Light that bounces off this material twice picks up 0.5 times 0.5.",
          "That factor is 0.25. You still add the path. Dim is not the same as zero.",
          "A ray into a closed black box returns 0, and that branch stops. The pinhole and the closest hit do not change.",
        ],
        [
          {
            prompt: "Albedo is 0.5 on each of 2 bounces. What factor multiplies that path?",
            answer: "0.25. You multiply 0.5 by 0.5, and you still add the path.",
          },
          {
            prompt: "You change the bounce count from 0 to 8. Which two decisions stay fixed?",
            answer: "The projection, which builds the camera ray from the pinhole at (0, 0, 5), and the visibility test, which keeps the closest hit. Only the transport samples change.",
          },
        ],
      ),
      lec(
        "l8",
        "Explaining one pixel",
        [
          "You can now project a scene through the pinhole at (0, 0, 5), shade the visible hit with a local lamp term, cut that term when a shadow segment finds a blocker past the bias of 0.01, paint the hit from texture coordinates, and add a bounce estimate from 8 hemisphere rays. You can stop a path that returns 0, and you can keep a path whose factor is only 0.25. That is enough to explain a pixel.",
          "You debug a suspicious pixel by splitting the sum. Confirm the hit distance first, because the wrong winner makes every later term meaningless. Then confirm the shadow segment. Then ask whether the color came from (u, v) or from a bounce. A red tint with the lamp cosine at 0 has to come from the texture or from the 8 rays. You do not move the lamp until those are separated.",
        ],
        {
          kind: "flow",
          caption: "Separate the terms before you decide which mechanism made the color.",
          steps: ["Confirm the visible hit", "Then the shadow test", "Then texture or bounce", "Add the remaining paths"],
        },
        "A pixel that looks too red",
        [
          "The closest hit is at distance 2, so the surface at distance 7 is hidden and is not the source of the red.",
          "The lamp cosine is 0, so the local diffuse term is 0. The shadow test cannot create that red either.",
          "Either (u, v) landed in a red texel, or some of the 8 bounce rays hit a red wall. You check those two sources.",
        ],
        [
          {
            prompt: "Combine visibility and shadowing. The ray hits at distance 2 and at distance 7. The near surface is opaque, and its shadow segment has a blocker at distance 1, past the bias. What direct brightness do you write?",
            answer: "0. You shade only the hit at distance 2, and the blocker sets that hit direct term to 0. You do not shade the hit at distance 7.",
          },
          {
            prompt: "Combine texturing and the bounce. The lamp cosine is 0, the texture at (u, v) is red, and all 8 bounce rays return 0. Where does the red come from?",
            answer: "The texture. The local lamp term is 0 and the bounce average is 0, so the remaining color source is the texture lookup.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-648",
    lectures: [
      lec(
        "l1",
        "Eight heads and a width",
        [
          "You start a sculpture with proportions you can measure, not with a smooth surface. A standing figure in this exercise is 8 heads tall. The midpoint, at 4 heads, is the pelvis, not the navel and not the knee. You mark those heights on a vertical line before you attach a volume. This course is a composite: the height marks come from figure practice, and the surfaces you hang on them come from the mathematics in the later lectures.",
          "You measure width in the same head unit. If the head is 1 unit wide, a shoulder span of 2 units is narrow here, and a span of 3 units is the width you want. You lay those 3 units on the shoulder line at 6.5 heads up from the ground, above the midpoint. You correct the width before any smooth pass. A later surface will not repair a shoulder that is still 2 units wide.",
        ],
        {
          kind: "layers",
          caption: "Heights first, then a width. Smoothing does not repair a short measurement.",
          rows: ["8 heads, ground to crown", "Midpoint at the pelvis", "Shoulders at 6.5 heads", "Width of 3 head units"],
        },
        "Checking a blocked figure",
        [
          "The figure is 8 units tall. One unit is the head height you are using as the ruler.",
          "The pelvis mark is at 4. The shoulder line is at 6.5.",
          "The shoulders measure 2 units across. You widen them to 3 before you build a surface.",
        ],
        [
          {
            prompt: "A figure is 8 heads tall. At what height is the pelvis in this exercise?",
            answer: "4 heads. That is the midpoint, and the midpoint is the pelvis, not the navel and not the knee.",
          },
          {
            prompt: "The shoulders are 2 head units wide. What do you change before smoothing?",
            answer: "Widen them to 3 head units. A smooth surface will not add the missing unit of width.",
          },
        ],
      ),
      lec(
        "l2",
        "A line of action",
        [
          "You pose the figure with a line of action, one curve the spine follows. In the standing rest pose that line is vertical, from the pelvis at height 4 up through the neck. In a lean, the line tilts, and you draw the tilt before you move the rib volume. A lean of 10 degrees carries the head off the vertical through the pelvis. The feet have to move, or the figure reads as falling rather than leaning.",
          "You keep joint angles inside a named range. A knee here bends from 0 degrees, straight, to 140 degrees, fully folded. You do not bend it to 180 degrees, which would send the shin through the thigh. The shoulder in this exercise swings about 90 degrees forward. You store the pose as those angles on the line of action. Dragging a surface point and hoping the joint follows will twist the volume.",
        ],
        {
          kind: "pair",
          caption: "The line of action is the pose. The angles are limits on that line.",
          leftTitle: "Rest pose",
          rightTitle: "Lean of 10 degrees",
          left: ["Line of action vertical", "Head over the pelvis", "Knee at 0 degrees"],
          right: ["Line tilted 10 degrees", "Head off the vertical", "Feet must move"],
        },
        "A knee inside its range",
        [
          "The rest knee is 0 degrees. The line of action is vertical through the pelvis at height 4.",
          "You set the knee to 140 degrees. The shin folds and does not pass through the thigh.",
          "A value of 180 degrees is outside the range. You reject it before you move any surface point.",
        ],
        [
          {
            prompt: "The line of action tilts 10 degrees and the feet stay under the old vertical. What does the pose read as?",
            answer: "Falling. The head has left the vertical through the support, and the feet have not moved with the lean.",
          },
          {
            prompt: "What knee angles are allowed in this exercise?",
            answer: "From 0 degrees, straight, through 140 degrees, fully folded. You reject 180 degrees because the shin would pass through the thigh.",
          },
        ],
      ),
      lec(
        "l3",
        "A cubic on the limb",
        [
          "You build a silhouette with a few cubics rather than a cloud of points. A limb in side view uses 4 control points: the shoulder, the muscle bulge, the narrow part near the joint, and the next joint. You evaluate with de Casteljau at t = 0, t = 0.5, and t = 1. The curve passes through the first and last controls. You pin those to the joints so the pose angles remain in charge of the endpoints.",
          "You mirror the left and right cubics only in the rest pose. After the 10 degree lean, the two silhouettes are different curves. A mirrored pair would put the same bulge on the compressed side and the stretched side. You move the middle two controls of the compressed cubic inward by 0.5 head units, and you leave both joint pins fixed. The endpoints stay on the angles you stored.",
        ],
        {
          kind: "flow",
          caption: "Joint pins own the endpoints. A lean edits the middle controls on one side only.",
          steps: ["Pin the joints", "Place two middle controls", "Evaluate three parameters", "Do not mirror a lean"],
        },
        "One limb cubic",
        [
          "The four controls are joint A, a bulge, a narrow point, and joint B. The curve passes through A and B.",
          "At t = 0 you are at A. At t = 1 you are at B. At t = 0.5 the middle controls pull the point off the chord.",
          "After a 10 degree lean you shift the compressed side middle controls by 0.5 and you do not copy them across.",
        ],
        [
          {
            prompt: "Which of the 4 controls must the limb curve pass through?",
            answer: "The first and the last, the two joint pins. The middle two pull the bulge and the narrow part, and the curve need not pass through them.",
          },
          {
            prompt: "Why do you stop mirroring controls after the line of action tilts 10 degrees?",
            answer: "The compressed side and the stretched side differ. A mirror would give both the same bulge. You edit the compressed cubic by 0.5 head units and keep the joint pins.",
          },
        ],
      ),
      lec(
        "l4",
        "Sections along the torso",
        [
          "You turn the curves into a volume by sweeping a cross section along the line of action. The torso here uses an ellipse with radii 1.5 and 1, in head units, swept from the pelvis at height 4 to the shoulder line at height 6.5. That span is 2.5 units. You place 5 cross sections along it so a twist is visible. The sweep is the mechanism. The 5 sections are how you inspect it.",
          "You orient each section with a frame, not by eye. The frame long axis follows the line of action, and the second axis points to the figure left. When the knee bends to 140 degrees, the frames along the shin rotate with the bone, and the sections rotate with the frames. If you leave the sections in the rest orientation, the volume stays vertical while the bone has folded by that full angle.",
        ],
        {
          kind: "pipeline",
          caption: "The line of action carries the frames. The sections inherit those frames.",
          stages: ["Line of action", "Five cross sections", "A frame on each", "The swept volume"],
        },
        "A torso sweep",
        [
          "The sweep runs from height 4 to height 6.5, a span of 2.5 head units.",
          "Each ellipse has radii 1.5 and 1. You place 5 of them along the span.",
          "Each section takes its orientation from a frame on the line. A bend of the line rotates the frames and the sections together.",
        ],
        [
          {
            prompt: "How tall is the torso sweep from the pelvis to the shoulder line?",
            answer: "2.5 head units. The pelvis is at 4 and the shoulders are at 6.5.",
          },
          {
            prompt: "The shin bends to 140 degrees and the cross sections stay in the rest orientation. What is wrong?",
            answer: "The volume and the bone disagree by 140 degrees. The sections have to rotate with the frames on the line of action.",
          },
        ],
      ),
      lec(
        "l5",
        "A cylinder cuts a socket",
        [
          "You cut a volume with constructive solid geometry when the cut is a known solid. The torso is solid A. A cylinder of radius 0.4 is solid B, set where the arm socket belongs. Difference keeps points inside A and outside B. You classify a sample with both inside tests. This is the mathematical half of the composite: the same Boolean you would use on a bracket, applied to a figure.",
          "You place the cylinder from the pose, not from a picture. Its axis leaves the shoulder line at height 6.5 and runs outward. A point 0.2 units from that axis is inside the radius of 0.4, so difference removes it. A point 1 unit from the axis is outside the cylinder, so it stays if it is also inside the torso. After a 10 degree lean you move the cylinder with the shoulder, or you cut the old pose.",
        ],
        {
          kind: "pair",
          caption: "Difference removes the socket and leaves torso points outside the cylinder.",
          leftTitle: "Inside the cylinder",
          rightTitle: "Outside the cylinder",
          left: ["Distance 0.2, radius 0.4", "Removed by difference", "This becomes the socket"],
          right: ["Distance 1, radius 0.4", "Kept if inside torso", "Not part of the cut"],
        },
        "Cutting the socket",
        [
          "The cylinder has radius 0.4 and its axis runs outward from height 6.5.",
          "A point at distance 0.2 is inside the cylinder and is removed from the torso.",
          "A point at distance 1 is outside the cylinder. Difference keeps it when it is inside the torso.",
        ],
        [
          {
            prompt: "A point is inside the torso and inside the socket cylinder. Does difference keep it?",
            answer: "No. Difference keeps points inside the first solid and outside the second. This point is inside the cylinder, so the cut removes it.",
          },
          {
            prompt: "After a 10 degree lean, what do you do with the socket cylinder?",
            answer: "Move it with the shoulder. The axis was defined on the shoulder line at height 6.5, and that line moved. The old cylinder would cut the rest pose.",
          },
        ],
      ),
      lec(
        "l6",
        "A field that bridges",
        [
          "You blend two volumes with an implicit field when a hard Boolean edge is the wrong join. Each ball contributes a field of 1 divided by distance from its center. You sum the fields and keep the surface where the sum equals 1. One ball then has radius 1. A second ball adds field, so the level set bulges toward it and can bridge the gap.",
          "You put the centers on the figure. One sits on the shoulder at height 6.5 and one sits 2 units down the upper arm. If the summed field in the gap reaches 1, the surface connects the balls. You keep level 1 on purpose. A level of 2 shrinks a lone ball to radius 0.5, since the field equals 2 only there. Extract the level after the centers match the pose.",
        ],
        {
          kind: "flow",
          caption: "Sum the fields, then extract one level. The level chooses the size.",
          steps: ["Field is 1 over distance", "Sum the ball fields", "Extract level 1", "A bridge if the sum holds"],
        },
        "Two balls along the arm",
        [
          "Ball A is centered at the shoulder. Alone, its level set of 1 is a sphere of radius 1.",
          "Ball B is centered 2 units down the arm. Alone, it is another sphere of radius 1.",
          "In the gap the fields add. If the sum reaches 1, the surface bridges. A level of 2 would shrink a lone ball to radius 0.5.",
        ],
        [
          {
            prompt: "One ball uses the field 1 over distance, and you extract level 1. What is the radius?",
            answer: "1. The field equals 1 when the distance is 1.",
          },
          {
            prompt: "You raise the level from 1 to 2 on a single ball. What is the new radius?",
            answer: "0.5. The field equals 2 when the distance is 0.5, so the surface shrinks.",
          },
        ],
      ),
      lec(
        "l7",
        "From 200 triangles to 800",
        [
          "You refine the mesh only after proportion and pose are right. A coarse figure might use 200 triangles. Splitting each triangle into 4 gives 800. That pass does not move the line of action, does not change the 140 degree knee limit, and does not move the socket you cut with the cylinder. You subdivide so a brush has smaller flats to push. If the pelvis is at the wrong height, 800 triangles only record the mistake more smoothly.",
          "You push a vertex along its normal by 0.1 head units, and you leave the joint pins fixed. A stroke across the muscle moves the region the middle Bezier controls owned. You do not pull a pin at the knee, or the bend stops matching the stored angle. After the stroke you look at the silhouette again. If the 0.1 step broke the bulge you wanted, you undo it rather than smoothing the error into the neighbors.",
        ],
        {
          kind: "layers",
          caption: "Density comes last. A brush step does not get to move a joint pin.",
          rows: ["Fix the pose first", "200 triangles become 800", "Push 0.1 along the normal", "Joint pins stay fixed"],
        },
        "One brush step",
        [
          "The mesh has 200 triangles. You subdivide each into 4, getting 800, only after the pelvis is at height 4.",
          "A stroke moves one non-pin vertex 0.1 units along its normal.",
          "The knee pin does not move, so the stored angle, up to the 140 degree limit, still matches the mesh.",
        ],
        [
          {
            prompt: "You split each of 200 triangles into 4. How many triangles result, and does that fix a low pelvis?",
            answer: "800 triangles. The split does not move the pelvis. A height error remains, only on a finer mesh.",
          },
          {
            prompt: "A stroke would move the knee pin by 0.1. What do you do?",
            answer: "Leave the pin fixed. Moving it would pull the joint off the stored angle. A non-pin vertex may move 0.1 along its normal.",
          },
        ],
      ),
      lec(
        "l8",
        "Review in order",
        [
          "You can now block a figure at 8 heads, set a knee from 0 to 140 degrees, build a limb with a 4-point cubic, sweep a torso with 5 sections over 2.5 units, cut a socket by difference, and bridge an arm where a field equals 1. You can then go from 200 triangles to 800 and push a vertex by 0.1 without moving a pin. Figure practice and the surface math stay on one model.",
          "You review in that order because a later tool hides an earlier error. An implicit bridge at level 1 will paper over a shoulder that is still 2 units wide instead of 3. A Boolean socket left on the rest pose misses the shoulder after a 10 degree lean. You check heights, then angles, then the curve pins, then the field level, and only then the triangle count. The composite is the order, not a pile of tools.",
        ],
        {
          kind: "pipeline",
          caption: "Later tools hide earlier mistakes, so the check follows the build order.",
          stages: ["Heights and angles", "Curves and volumes", "Boolean or field", "Then subdivide"],
        },
        "A leaned figure, checked in order",
        [
          "The pelvis is at 4, the shoulders are at 6.5 and 3 units wide, and the line of action tilts 10 degrees.",
          "The knee is at 140, not 180. The limb cubics are not mirrored. The socket cylinder moved with the shoulder.",
          "The arm bridge is the level set at 1. Only then do you go from 200 triangles to 800.",
        ],
        [
          {
            prompt: "Combine the lean and the implicit surface. The line of action leans 10 degrees after you placed two ball centers. What must move before you extract level 1?",
            answer: "The ball centers. They sit on the shoulder at height 6.5 and 2 units down the arm, and those landmarks moved with the lean. Level 1 on the old centers would bridge the rest pose.",
          },
          {
            prompt: "Combine the sweep and the brush. Five sections run from height 4 to 6.5, then a stroke moves a vertex 0.1 along its normal, including a joint pin. Which part do you keep?",
            answer: "Only the move on non-pin vertices. The pin stays, so the sweep joint and the stored angle still agree. The 0.1 step is allowed on the rest of the section.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-649",
    lectures: [
      lec(
        "l1",
        "Position, velocity, and a step",
        [
          "You represent a bit of matter as a particle with a position, a velocity, and a mass. One particle starts at position 0 with velocity 2 and mass 1, and no force acts, so acceleration is 0. Over a time step of 0.5 you update velocity first, then position from the new velocity. Velocity stays 2. Position becomes 0 plus 2 times 0.5, which is 1. That two-update order is the integrator.",
          "You add a constant acceleration of -10, a stand-in for gravity, and keep the step at 0.5. Velocity changes first: 2 plus -10 times 0.5 equals -3. Position then uses the new velocity: 0 plus -3 times 0.5 equals -1.5. You do not add acceleration directly onto position. The step 0.5 is large so the overshoot is obvious. A step of 0.1 would move less far under the same acceleration.",
        ],
        {
          kind: "flow",
          caption: "Acceleration changes velocity. The new velocity changes position. Then you repeat.",
          steps: ["Acceleration from forces", "Update the velocity", "Update the position", "Repeat the step"],
        },
        "One step, two accelerations",
        [
          "Start at position 0, velocity 2, mass 1, and time step 0.5.",
          "With acceleration 0, velocity stays 2 and position becomes 1.",
          "With acceleration -10, velocity becomes -3 and position becomes -1.5.",
        ],
        [
          {
            prompt: "Acceleration is 0, velocity is 2, the time step is 0.5, and position starts at 0. Where is the particle after one step?",
            answer: "At position 1. Velocity stays 2, and 2 times 0.5 is 1.",
          },
          {
            prompt: "Acceleration is -10, the time step is 0.5, and velocity starts at 2. What is the velocity after the velocity update?",
            answer: "-3. You add -10 times 0.5, which is -5, to the starting velocity 2.",
          },
        ],
      ),
      lec(
        "l2",
        "Force, mass, and the floor",
        [
          "You compute acceleration as net force divided by mass. Two forces, 4 and -1, act on a particle of mass 2. The net force is 3, so the acceleration is 1.5. You feed that acceleration into the velocity update. The same net force on mass 1 would accelerate at 3, twice as hard. You do not skip the division and treat the force number as an acceleration. Mass is part of the mechanism.",
          "You answer a hit on the ground plane y = 0 with a projection, not with hope that the next step stays legal. If the updated position is y = -0.2, the particle has passed the plane by 0.2. You put it back at y = 0 and reverse the inward velocity. An inward velocity of -3 becomes 3 if the bounce coefficient is 1. With coefficient 0 the stored velocity is 0 and the particle rests on the plane.",
        ],
        {
          kind: "pair",
          caption: "Forces become acceleration through mass. The floor is a projection after the step.",
          leftTitle: "Force to acceleration",
          rightTitle: "Ground at y = 0",
          left: ["Sum the forces first", "Divide by the mass", "Mass 2 and force 3"],
          right: ["Move y back to 0", "Reverse inward velocity", "Scale by the bounce"],
        },
        "A step into the floor",
        [
          "Net force is 3 and mass is 2, so acceleration is 1.5. That value enters the velocity update.",
          "A later position lands at y = -0.2. You move the particle to y = 0.",
          "Inward velocity -3 with bounce coefficient 1 becomes 3. With coefficient 0 it becomes 0.",
        ],
        [
          {
            prompt: "Forces are 4 and -1, and the mass is 2. What is the acceleration?",
            answer: "1.5. The net force is 3, and 3 divided by 2 is 1.5.",
          },
          {
            prompt: "The particle reaches y = -0.2 with velocity -3, and the bounce coefficient is 0. What do you store?",
            answer: "Position y = 0 and velocity 0. You place the particle on the plane and scale the reversed velocity by 0.",
          },
        ],
      ),
      lec(
        "l3",
        "A spring of rest length 1",
        [
          "You model a short flexible rod as two particles and one spring. The rest length is 1. Particle A is at 0 and particle B is at 1.6, so the stretch is 0.6. Stiffness 10 pulls with magnitude 10 times 0.6, which is 6, along the rod. You apply 6 to each particle, in opposite directions, toward the other. The pair of forces adds to 0, so the spring does not invent a net shove of the whole rod.",
          "You damp the spring, or the integrator will keep the oscillation going. Damping opposes the rate of change of length. If the length grows at speed 0.4 and the damping coefficient is 5, the damping magnitude is 2. You add it on the same line as the spring, in the direction that slows the growth. Without it, the energy in the stretch of 0.6 trades between the spring and the velocities on every step of size 0.5.",
        ],
        {
          kind: "flow",
          caption: "Spring force uses stretch. Damping uses how fast the length is changing.",
          steps: ["Compare length to rest", "Force is k times stretch", "Damping opposes the rate", "Push both particles"],
        },
        "Stretch of 0.6",
        [
          "Rest length is 1, current length is 1.6, and stiffness is 10. The spring magnitude is 6.",
          "A is pulled toward B and B is pulled toward A, each with magnitude 6.",
          "The length grows at 0.4 and the damping coefficient is 5, so you add a damping magnitude of 2 against that growth.",
        ],
        [
          {
            prompt: "Rest length is 1, current length is 1.6, and stiffness is 10. What is the spring force magnitude on each particle?",
            answer: "6. The stretch is 0.6, and 10 times 0.6 is 6. The two forces point toward each other.",
          },
          {
            prompt: "The length grows at speed 0.4 and the damping coefficient is 5. What damping magnitude do you add?",
            answer: "2. You multiply 5 by 0.4, and that force opposes the growth of the length.",
          },
        ],
      ),
      lec(
        "l4",
        "Two links and two angles",
        [
          "You pose an arm from joint angles when the motion is prescribed rather than forced. Both links have length 2. The shoulder angle is 0 degrees, along x, and the elbow angle is 90 degrees. The elbow sits at (2, 0). The wrist sits at (2, 2), because the second link points up. You compute these positions from the angles. You do not integrate them from forces. The map from angles to positions is the kinematic mechanism.",
          "You also get a wrist speed from the angle rates. If the elbow angle increases at 1 radian per second and the shoulder is still, the wrist moves perpendicular to the second link. That link points along y, so the motion is along x. The speed is the link length times the rate, 2 times 1, which is 2. You use this when a later constraint cares how fast the wrist moves, not only where it sits.",
        ],
        {
          kind: "pipeline",
          caption: "Angles determine positions. Angle rates determine the wrist speed.",
          stages: ["Two joint angles", "Elbow at (2, 0)", "Wrist at (2, 2)", "Speed from the rate"],
        },
        "The right-angle elbow",
        [
          "Both links have length 2. The shoulder angle is 0, so the elbow is at (2, 0).",
          "The elbow angle is 90 degrees, so the wrist is at (2, 2).",
          "The elbow rate is 1 radian per second and the shoulder rate is 0. The wrist speed is 2, perpendicular to the second link.",
        ],
        [
          {
            prompt: "Both links have length 2, the shoulder angle is 0, and the elbow angle is 90 degrees. Where is the wrist?",
            answer: "At (2, 2). The elbow is at (2, 0), and the second link points up by its length of 2.",
          },
          {
            prompt: "The elbow rate is 1 radian per second, the shoulder is still, and the second link has length 2. What is the wrist speed?",
            answer: "2. Speed is link length times angular rate, and the direction is perpendicular to the second link.",
          },
        ],
      ),
      lec(
        "l5",
        "A number that must be 0",
        [
          "You state a constraint as a number that must stay 0. A particle stuck to the ground has constraint value y, which must be 0. A bead that must stay 1 unit from the origin has constraint value x squared plus y squared minus 1. At (1, 0) that value is 0, so the bead is legal. At (1.2, 0) the value is 1.44 minus 1, which is 0.44. The bead has drifted off the circle.",
          "You remove the drift on this step instead of only attaching a spring. A spring would leave the 0.44 error and pull over time. For the bead you slide the position along the radius back to length 1, from (1.2, 0) to (1, 0). You then strip the outward part of the velocity so the next step of size 0.5 does not rebuild the same drift. The projection is the constraint mechanism.",
        ],
        {
          kind: "pair",
          caption: "A spring tolerates an error for a while. A projection removes it on this step.",
          leftTitle: "Spring pull",
          rightTitle: "Projection",
          left: ["Error of 0.44 remains", "Force acts over time", "Drift can persist"],
          right: ["Move back to length 1", "From (1.2, 0) to (1, 0)", "Strip outward velocity"],
        },
        "A bead outside the circle",
        [
          "The legal circle has radius 1. The bead is at (1.2, 0).",
          "The constraint value is 1.44 minus 1, which is 0.44.",
          "You project the bead to (1, 0) and remove the outward part of the velocity before the next step.",
        ],
        [
          {
            prompt: "The bead is at (1, 0) and the required radius is 1. What is the constraint value?",
            answer: "0. One squared plus zero squared minus 1 is 0, so the bead is legal and you do not move it.",
          },
          {
            prompt: "The bead is at (1.2, 0). What position do you project it to?",
            answer: "(1, 0). You keep the direction and set the distance to 1. You also remove the outward velocity so the next step does not rebuild the 0.44 error.",
          },
        ],
      ),
      lec(
        "l6",
        "Pinning the wrist",
        [
          "You pin the wrist by changing joint angles, not link lengths. The wrist is at (2, 2) and the target is (2, 1), so the error vector is (0, -1) and the error length is 1. Both links stay length 2. You take a small elbow step that reduces the error. An elbow rate moves the wrist perpendicular to the second link. You do not stretch a link to close the gap.",
          "You stop when the error length drops under 0.1. If one step cuts the error from 1 to 0.4, you step again. If a step would push the elbow past 150 degrees, you stop at 150 and say the rest is out of reach. Two links of length 2 can extend to 4, so (2, 1) may be reachable, but the angle limit can still block a step. You check the limit first.",
        ],
        {
          kind: "flow",
          caption: "The wrist follows the angles. The angles move only until the error or the limit stops them.",
          steps: ["Wrist from the angles", "Error against the target", "Step the elbow angle", "Stop under 0.1"],
        },
        "Target at (2, 1)",
        [
          "The current wrist is (2, 2). The target is (2, 1). The error length is 1.",
          "An elbow step moves the wrist perpendicular to the second link. You keep a step that reduces the error.",
          "You repeat until the error length is under 0.1, and you refuse an elbow angle past 150 degrees.",
        ],
        [
          {
            prompt: "The wrist is at (2, 2) and the target is (2, 1). What is the error length?",
            answer: "1. The error vector is (0, -1), and the length of that vector is 1.",
          },
          {
            prompt: "A proposed step would set the elbow to 160 degrees, and the limit is 150. What do you store?",
            answer: "150 degrees, and you report that the step cannot be taken in full. Both links stay length 2. You do not stretch a link to buy the extra 10 degrees.",
          },
        ],
      ),
      lec(
        "l7",
        "Step size and order",
        [
          "You choose the time step from the stiff spring, not from the frame rate. Stiffness 10 on a stretch of 0.6 makes a force of 6. On mass 1, a step of 0.5 changes velocity by 3. A step of 0.1 changes it by 0.6. The smaller change is less likely to fling the particle past rest length 1. The mechanism stays the same. Only the step size changes the throw.",
          "You still apply collisions and constraints after the force update. The order is: spring and other forces, velocity, position, then the ground, then a bead or wrist projection. If you project the bead to radius 1 and afterward evaluate the spring at the old illegal position, you put the 0.44 error back. A step of 0.1 does not repair that swapped order. You write the order next to the step and use it on every substep.",
        ],
        {
          kind: "pipeline",
          caption: "Forces first, motion second, projections last. A smaller step does not reorder them.",
          stages: ["Spring and forces", "Update velocity", "Update position", "Project constraints"],
        },
        "The same spring, two steps",
        [
          "The spring force magnitude is 6 and the mass is 1.",
          "A step of 0.5 changes velocity by 3. A step of 0.1 changes velocity by 0.6.",
          "Either way you project constraints after the position update. Projecting earlier lets the spring read a stale position.",
        ],
        [
          {
            prompt: "The spring force magnitude is 6, the mass is 1, and the time step is 0.1. How much does that force change the velocity?",
            answer: "By 0.6. Force divided by mass is 6, and 6 times the step 0.1 is 0.6.",
          },
          {
            prompt: "Why does a smaller step fail to fix a solver that projects the bead before the spring reads the position?",
            answer: "The spring still reads the illegal position and can reintroduce the 0.44 drift. Projection has to follow the position update. Step size does not repair a swapped order.",
          },
        ],
      ),
      lec(
        "l8",
        "One short shot",
        [
          "You can now step a particle from force and a time step, bounce it off y = 0, tie two particles with a spring of rest length 1, pose a two-link arm of lengths 2 and 2, and pin the wrist until the error is under 0.1. You can also tell a kinematic pose from a dynamic step. Angles map straight to positions. Forces reach positions only through the velocity update and the step. That split is the modeling choice.",
          "You build one short shot in the order from the stability lecture. Use the arm to place the wrist near (2, 1), then a constraint to finish under error 0.1, without passing 150 degrees. Hang a vertical rod from that wrist on the spring. Step at 0.1, then project the ground. A frame that skips the projection can show a negative y and still be called contact. You do not accept that frame.",
        ],
        {
          kind: "flow",
          caption: "Pose, then constrain, then step the spring, then the floor.",
          steps: ["Pose the two-link arm", "Project the wrist error", "Step the spring at 0.1", "Then the ground plane"],
        },
        "A rod hung from the wrist",
        [
          "The arm places the wrist near (2, 1) with links of length 2. The constraint finishes with error under 0.1.",
          "The rod rest length is 1. At length 1.6 and stiffness 10 the spring magnitude is 6.",
          "You step at 0.1, so that force changes a unit-mass velocity by 0.6, then you project any y below 0 back to the plane.",
        ],
        [
          {
            prompt: "Combine the spring and the ground on a vertical rod. Stiffness 10, stretch 0.6, mass 1, and step 0.1 change velocity by 0.6 during the force update. The position update then lands at y = -0.2 with velocity -3, and the bounce coefficient is 0. What do you store?",
            answer: "y = 0 and velocity 0. The spring already acted in the force update. The ground projection then places the particle on the plane and, with bounce coefficient 0, stores velocity 0.",
          },
          {
            prompt: "Combine the arm and the circle-style constraint. The wrist is at (2, 2), the target is (2, 1), and the elbow limit is 150 degrees. What is the error length, and what do you refuse to change?",
            answer: "The error length is 1. You change joint angles to reduce it. You refuse to push the elbow past 150 degrees, and you refuse to change either link length from 2.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-650",
    lectures: [
      lec(
        "l1",
        "A field of view is not presence",
        [
          "You separate immersion from presence before you judge a headset. Immersion is what the device supplies: field of view, tracking, and stereo. This exercise uses a headset with a 100 degree horizontal field and tracking of the head plus 2 controllers. Presence is the sense of being in the place you drew. You can have the 100 degree field and still have no presence if the world does not answer when the head turns.",
          "You test the split with one action. The user turns their head 30 degrees left. The view must rotate by those same 30 degrees. A delay past about 20 milliseconds is a failed coupling you can feel. That coupling is immersion. Whether the user then ducks a virtual beam is evidence about presence. You do not score the duck from the field-of-view number.",
        ],
        {
          kind: "pair",
          caption: "Immersion is the device coupling. Presence is what the user does with it.",
          leftTitle: "Immersion",
          rightTitle: "Presence",
          left: ["A 100 degree field", "Head plus 2 controllers", "Delay near 20 ms"],
          right: ["Sense of being there", "Not a device spec", "Read from behavior"],
        },
        "A 30 degree head turn",
        [
          "The headset reports a yaw change of 30 degrees.",
          "You rotate the view by 30 degrees. If the image trails by more than about 20 milliseconds, the coupling has failed.",
          "You do not mark the user present because the field is 100 degrees. You watch whether they duck the beam.",
        ],
        [
          {
            prompt: "The headset has a 100 degree field and the view ignores a head turn. Which side, immersion or presence, has already failed?",
            answer: "Immersion. Tracking that does not rotate the view by the reported angle fails the device coupling. You cannot read presence from a view that did not follow.",
          },
          {
            prompt: "The view matches a 30 degree turn well under 20 milliseconds, and the user does not react to a virtual beam. What may you conclude?",
            answer: "The immersion coupling worked. You may not conclude presence. Presence needs the behavioral evidence, and here it was absent.",
          },
        ],
      ),
      lec(
        "l2",
        "A floor and an eye height",
        [
          "You match the virtual floor to the real floor at one mark, the origin. Eye height here is 1.6 meters, so the camera starts at y = 1.6. At y = 1.2 the floor reads 0.4 meters too close. You check with a real 1 meter stick on the mark. It should meet a virtual segment from y = 0 to y = 1. The stick is the calibration mechanism.",
          "You track the 2 controllers in the same frame as the head. A controller at (0.3, 1.0, 0.4) is 0.3 meters right of the origin, 1.0 meters up, and 0.4 meters forward. You do not give the hand its own origin. A separate origin can put a hand that is beside the head in the room a meter away in the world, and a grab fails. You recompute the controller from the same tracker that applied the 30 degree yaw.",
        ],
        {
          kind: "layers",
          caption: "One origin serves the floor, the eyes, and both controllers.",
          rows: ["Origin on the real floor", "Eyes at 1.6 meters", "Controllers share that frame", "Check with a 1 m stick"],
        },
        "The stick on the mark",
        [
          "The origin is a mark on the real floor. The camera starts at y = 1.6.",
          "A 1 meter stick on the mark should line up with a virtual segment from y = 0 to y = 1.",
          "A controller at (0.3, 1.0, 0.4) uses that same origin. A second origin for the hand would break the grab.",
        ],
        [
          {
            prompt: "You set the camera at y = 1.2 and the eye height is 1.6 meters. By how much is the virtual floor wrong?",
            answer: "0.4 meters too close. The camera is 0.4 meters below the eyes, so the floor appears nearer than the real floor.",
          },
          {
            prompt: "Why must a controller use the head origin?",
            answer: "So a hand beside the head in the room stays beside the head in the world. A separate origin can place the hand a meter away, and the grab fails.",
          },
        ],
      ),
      lec(
        "l3",
        "A ray and a button",
        [
          "You select with a ray that starts at the controller, here (0.3, 1.0, 0.4), and runs along the controller forward axis. The first object hit within 3 meters is the candidate. You confirm with a button press, not with the hit alone, so a ray that sweeps a menu does not select every icon it crosses. A hit at 4 meters is outside the range and is not a candidate, even if the button goes down.",
          "You carry a selected object by storing the offset at the press. If the hit was 1 meter along the ray, you keep that 1 meter offset while the button is held. A controller motion of 0.2 meters moves the object by 0.2 meters. Leaving the object at the original hit point would not let the user carry it. Releasing the button drops the attachment and keeps the last pose. The object does not snap back.",
        ],
        {
          kind: "pipeline",
          caption: "The ray proposes. The button confirms. The stored offset does the carrying.",
          stages: ["Ray from the controller", "First hit within 3 m", "Button confirms", "Offset held while down"],
        },
        "Carry by 0.2 meters",
        [
          "The ray starts at (0.3, 1.0, 0.4). The first hit is 1 meter out, inside the 3 meter range.",
          "The button stores that 1 meter offset and attaches the object to the controller.",
          "A later controller motion of 0.2 meters moves the object by 0.2 meters. Release keeps the new pose.",
        ],
        [
          {
            prompt: "The first hit is 4 meters out and the user presses the button. What is selected?",
            answer: "Nothing. The range is 3 meters, so a hit at 4 meters is not a candidate. The button does not override the range.",
          },
          {
            prompt: "The object is attached at an offset of 1 meter, and the controller then moves 0.2 meters. How far does the object move?",
            answer: "0.2 meters. The offset stays fixed in the controller frame, so the object follows. On release it keeps the new pose.",
          },
        ],
      ),
      lec(
        "l4",
        "Walking and teleport",
        [
          "You do not map the gallery onto the real floor one meter for one meter. The tracked space is 2 meters by 2 meters. The gallery is 10 meters long, so walking covers only 2 meters. You add a teleport: the controller ray aims at the floor, a second button moves the origin, and the feet land there. You keep head yaw. Resetting yaw makes the user relearn where the real door is.",
          "You reject a target that would put the body in a wall. A floor point at least 0.5 meters from any wall is legal. A point 0.2 meters from a wall is not, because the body occupies space the ray did not measure. You also reject a teleport while an object is attached, so a carry and a jump are not one press. Two buttons, two actions. Between teleports the user can still turn inside the 2 meter space.",
        ],
        {
          kind: "pair",
          caption: "Walking uses the tracked floor. Teleport moves the origin and keeps yaw.",
          leftTitle: "Real walking",
          rightTitle: "Teleport",
          left: ["Space is 2 by 2 m", "Feet move the camera", "Stops at the boundary"],
          right: ["Gallery is 10 meters", "Ray aims at the floor", "Yaw stays as it was"],
        },
        "A legal jump down the gallery",
        [
          "The user stands in a 2 by 2 meter space and aims at a floor point 6 meters along the 10 meter gallery.",
          "The point is 0.5 meters from the nearest wall, so you move the origin and you do not change yaw.",
          "A point 0.2 meters from a wall is rejected. So is any target while an object is still attached.",
        ],
        [
          {
            prompt: "The tracked space is 2 meters by 2 meters and the gallery is 10 meters long. Why is walking not enough?",
            answer: "Walking covers only the 2 meter space. The rest of the 10 meter gallery would leave the tracked area. Teleport covers that difference.",
          },
          {
            prompt: "A floor target is 0.2 meters from a wall and nothing is attached. Do you teleport?",
            answer: "No. The clearance rule requires 0.5 meters. Targets you do accept also keep the current yaw.",
          },
        ],
      ),
      lec(
        "l5",
        "What breaks the place",
        [
          "You treat presence as easy to spoil with one inconsistency. The user has ducked a beam, which is a useful sign. You then let the hand pass 10 centimeters into the grabbed object because the stored offset was stale. That intersection tells the user the object is a picture. You would rather drop the attachment than draw the hand inside the mesh. The 100 degree field does not repair a hand that occupies the same space as the prop.",
          "You also watch body cues you did not script. If all 4 of your test users lean when the gallery floor appears to drop, the floor cue is working. If none lean, you do not add a louder sound and rename it presence. You change the floor cue and test again. A self-report comes after the behavior. A score of 5 out of 7 from a user who walked through a wall is not the number you lead with.",
        ],
        {
          kind: "layers",
          caption: "Behavior is the evidence. A score comes after you have described what people did.",
          rows: ["Watch the body first", "Hand must miss the mesh", "A lean can be evidence", "A score of 5 comes later"],
        },
        "A hand inside the prop",
        [
          "The user selected the object and you stored a 1 meter offset.",
          "A later frame draws the hand 10 centimeters inside the mesh because that offset was stale.",
          "You drop the attachment rather than show the intersection. The earlier duck of the beam does not cover this frame.",
        ],
        [
          {
            prompt: "All 4 users walk through a virtual wall, and each reports presence as 5 out of 7. What do you report first?",
            answer: "That they walked through the wall. The behavior says the wall did not act as a boundary. The score of 5 comes after that fact, not ahead of it.",
          },
          {
            prompt: "The hand intersects the prop by 10 centimeters. What do you do with the attachment?",
            answer: "Drop it. Drawing the hand inside the mesh says the object is not solid. The field of view does not cover that error.",
          },
        ],
      ),
      lec(
        "l6",
        "A task and four users",
        [
          "You evaluate with a task and a count, not with a tour. The task is to select 3 objects and teleport to the far end of the 10 meter gallery. You time it and you count errors: a selection past 3 meters, a teleport you accepted inside 0.5 meters of a wall, a dropped object. Four users make a pilot. You do not average 4 people into a general claim. You list every error beside the task that produced it.",
          "You compare two interfaces only when the task stays fixed. Interface A uses the ray. Interface B uses a touch range of 0.4 meters and no ray. If A finishes with 1 error and B with 5, B failed this task in this pilot. You may not say a ray is better in every room. The 4 users and the 2 meter space are part of the claim you write down.",
        ],
        {
          kind: "flow",
          caption: "Fix the task, count the errors, and keep the claim inside that pilot.",
          steps: ["Fix the task in writing", "Count each error", "Four users is a pilot", "Do not widen the claim"],
        },
        "Two interfaces, one task",
        [
          "The task is 3 selections plus one teleport to the end of the 10 meter gallery.",
          "Interface A records 1 error. Interface B records 5. Both counts come from the same 4 users.",
          "You report the task and the pilot size with the counts. You do not generalize past this room.",
        ],
        [
          {
            prompt: "Interface A has 1 error and interface B has 5, on the same task with the same 4 users. What may you claim?",
            answer: "On this task, in this pilot, B produced more errors than A. You may not claim that a ray is better for every room and every user.",
          },
          {
            prompt: "Why is an unstructured tour of the gallery a weak evaluation?",
            answer: "A tour has no fixed task and no error count. The assigned task, 3 selections and a teleport, gives times and errors you can list.",
          },
        ],
      ),
      lec(
        "l7",
        "A gallery small enough to test",
        [
          "You build one room, not a city. The gallery is 10 meters long, with 3 objects, a floor matched at eye height 1.6 meters, and the 2 meter tracked space at one end. You place the 3 objects inside the 3 meter ray range, so the first selection needs no teleport. The far target sits 0.5 meters clear of the end wall. That room is the whole pilot.",
          "You implement in an order you can test. First the 30 degree yaw, then the 1 meter stick, then the ray and its button, then teleport on the second button, then a log. If the mesh comes first, a failed grab might be the ray, the origin, or the mesh. You log hit distance on every press. A hit at 4 meters is an out-of-range error.",
        ],
        {
          kind: "pipeline",
          caption: "Each piece is testable before the next one depends on it.",
          stages: ["Yaw, then the floor", "Ray and its button", "Teleport on button two", "Log every error"],
        },
        "The pilot room",
        [
          "The room is 10 meters long. The tracked space is 2 by 2 meters at one end. Eye height is 1.6 meters.",
          "Three objects sit within 3 meters of the start. The far target is 0.5 meters clear of the end wall.",
          "You log hit distance on each press. A hit at 4 meters is the out-of-range error from the selection rule.",
        ],
        [
          {
            prompt: "Why do you place the 3 objects within 3 meters of the start pose?",
            answer: "So the first selection can succeed with the ray alone and does not depend on teleport. A failure is then about selection, not about navigation.",
          },
          {
            prompt: "A button press logs a hit at 4 meters. What error is that?",
            answer: "An out-of-range selection. The ray range is 3 meters, so the press must not select that hit. The log records the distance rather than a generic failure.",
          },
        ],
      ),
      lec(
        "l8",
        "Run the pilot again",
        [
          "You can now set a headset with a 100 degree field, match a floor at eye height 1.6 meters, select with a ray out to 3 meters, carry an object by a stored offset, and teleport across a 10 meter gallery from a 2 meter play space. You can tell immersion from presence, and you can run a 4-person pilot whose claim stays inside its task. That is a small experience you can defend without adding a second room.",
          "You close by running that pilot and writing behavior plus count. If a user walks through the end wall, the 0.5 meter clearance or the wall itself failed, and a high score does not cancel the walk. If selections fail only while an object is attached, look at the rule that blocks teleport during a carry. You fix the mechanism the errors name, then you repeat the same task. You do not add a room to escape a bad count.",
        ],
        {
          kind: "flow",
          caption: "The same task, a named fix, then the task again. Do not grow the room.",
          steps: ["Run the same task", "List behavior and errors", "Fix the named rule", "Repeat the pilot"],
        },
        "A pilot that met the wall",
        [
          "The task is still 3 selections and one teleport in the 10 meter gallery, with 4 users.",
          "One user reaches a point 0.2 meters from the wall because you accepted it, and they intersect the wall.",
          "You restore the 0.5 meter rejection and run the same task. You do not lengthen the gallery and call the result new.",
        ],
        [
          {
            prompt: "Combine selection range and presence. A press on a hit at 4 meters selects it anyway, and the hand then passes through the object. What two failures do you write?",
            answer: "The 3 meter range was not enforced, which is an interaction failure on the immersion side, and the hand intersecting the object is a presence failure because the object no longer behaves as a solid. The 100 degree field offsets neither.",
          },
          {
            prompt: "Combine navigation and the pilot. One of 4 users teleports to a point 0.2 meters from a wall. How do you report it, and what do you refuse?",
            answer: "You count an error on this task: a target inside the 0.5 meter clearance was accepted. You refuse to treat a presence score as the result, and you refuse a claim beyond these 4 users and this task. You fix the rejection and repeat the task.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-743",
    lectures: [
      lec(
        "l1",
        "Beam on, beam off",
        [
          "You describe a machine by the path a tool follows and by what it does to material. The laser travels in x and y over a bed of 400 by 300 millimeters, and it cuts only where the beam is on. A segment that leaves the bed is a fault, not a cut. You write segments with a beam state, on or off, rather than a picture of the part. The picture is not yet a toolpath.",
          "You separate drawing length from cutting time. A 40 millimeter square becomes four beam-on sides, 160 millimeters of cutting, plus beam-off travel between jobs. At a feed of 20 millimeters per second, those 160 millimeters take 8 seconds of beam-on time. You compute that before you start the machine. Beam-off moves add time, but they do not add char. The mechanism is the state on each segment, not the outline in the file.",
        ],
        {
          kind: "pipeline",
          caption: "A drawing becomes segments. Time comes from beam-on length and feed.",
          stages: ["Drawing on the bed", "Segments, beam state", "Feed of 20 mm/s", "Time from the length"],
        },
        "A 40 millimeter square",
        [
          "The bed is 400 by 300 millimeters. Each side of the square is 40 millimeters, so the square fits.",
          "Beam-on length is 4 times 40, which is 160 millimeters.",
          "At 20 millimeters per second the beam is on for 8 seconds. Travel with the beam off is extra time.",
        ],
        [
          {
            prompt: "Four sides of 40 millimeters are cut at 20 millimeters per second. How many seconds is the beam on?",
            answer: "8 seconds. The length is 160 millimeters, and 160 divided by 20 is 8.",
          },
          {
            prompt: "A segment runs past the 400 millimeter edge of the bed. What is it?",
            answer: "A fault, not a cut. The toolpath has to stay on the bed. You do not send it because the drawing looked small on the screen.",
          },
        ],
      ),
      lec(
        "l2",
        "Plywood, kerf, and the wrong knife",
        [
          "You choose a material by how it fails. This sheet is 3 millimeter plywood. The laser chars an edge. The vinyl cutter will not cut it: the sheet is too thick for a drag knife. You write 3 millimeters on the job. A path made for 6 millimeter stock does not transfer. On a laser it may burn through, because the pass count was chosen for the thicker stock.",
          "You account for kerf, the width the tool destroys. This laser kerf is 0.2 millimeters. A slot drawn at 10 millimeters becomes about 10.2 millimeters if the beam walks the center of the line. You offset the path by half the kerf, 0.1 millimeters, into the waste, so the part that remains matches the drawing. You cut and measure one test square before the rest of the sheet. The charred band is not solid material you can count on.",
        ],
        {
          kind: "pair",
          caption: "The drawing is the intent. The kerf offset is what the part actually keeps.",
          leftTitle: "Drawn slot",
          rightTitle: "After the kerf",
          left: ["Slot drawn at 10 mm", "Path on the line", "No offset yet"],
          right: ["Kerf is 0.2 mm", "Offset by 0.1 mm", "Offset goes into waste"],
        },
        "A slot in 3 millimeter plywood",
        [
          "The sheet is 3 millimeter plywood. The laser kerf is 0.2 millimeters. The vinyl knife is the wrong tool.",
          "You offset each side of the 10 millimeter slot by 0.1 millimeters into the waste.",
          "You cut one test square and measure it before you commit the rest of the sheet.",
        ],
        [
          {
            prompt: "The kerf is 0.2 millimeters and you offset into the waste. How far does the path move?",
            answer: "0.1 millimeters, half the kerf. Offsetting by the full 0.2 would remove too much of the part.",
          },
          {
            prompt: "Why do you refuse the vinyl cutter for this sheet?",
            answer: "The sheet is 3 millimeter plywood, too thick and too hard for a drag knife. The laser matches this material. The vinyl cutter is for thin film.",
          },
        ],
      ),
      lec(
        "l3",
        "Packing the bed",
        [
          "You pack parts on the 400 by 300 millimeter bed with a gap so neighboring kerfs do not eat one part. Each gap is at least 2 millimeters. Five squares of 40 millimeters, plus 4 gaps of 2, occupy 208 millimeters. A 10 millimeter margin leaves a usable run of 380. The row of 208 fits. You do not shave a gap to 0 to squeeze another square.",
          "You order cuts so a freed part cannot shift. Cut interior holes before the outline. If the outline of a 40 millimeter square runs first, the square can tilt and a later hole will miss. This job has 1 hole and 1 outline, so the hole runs first. You also leave a 1 millimeter tab so the part does not fall into the bed. You cut that tab by hand after the sheet comes off.",
        ],
        {
          kind: "flow",
          caption: "Pack with a gap, cut holes before outlines, and hold loose parts with a tab.",
          steps: ["Gap parts by 2 mm", "Holes before outlines", "Leave a 1 mm tab", "Cut the tab by hand"],
        },
        "Five squares on the bed",
        [
          "Each square is 40 millimeters, and each of the 4 gaps is 2 millimeters. The row is 208 millimeters.",
          "The bed is 400 millimeters wide, with a 10 millimeter margin, so 208 fits inside the usable 380.",
          "Each hole is cut before its outline, and a 1 millimeter tab holds the part until the sheet is off the machine.",
        ],
        [
          {
            prompt: "Five squares of 40 millimeters have 4 gaps of 2 millimeters. How long is the row?",
            answer: "208 millimeters. Five times 40 is 200, and four times 2 is 8.",
          },
          {
            prompt: "A part has one hole and one outline. Which path runs first, and what holds the part?",
            answer: "The hole runs first. If the outline runs first, the part can shift and the hole misses. A 1 millimeter tab can hold the part, and you cut that tab after the sheet leaves the machine.",
          },
        ],
      ),
      lec(
        "l4",
        "Fifty layers",
        [
          "You print by stacking layers, and each layer is its own toolpath. Layer height is 0.2 millimeters. A part 10 millimeters tall needs 50 layers. Each layer has an outline plus infill. You do not treat the part as one laser-style path. A fault in layer 12 is buried by layer 30. You cannot recut it the way you can recut an open sheet.",
          "You set infill as a fraction of the layer area, in the job, not by drawing interior walls by hand. At 20 percent the interior is mostly air, and the wall still follows the outline. The same 10 millimeter cube at 80 percent uses more material and compresses less. The nozzle diameter is 0.4 millimeters, so one wall line is about that wide. Those walls have to sit inside the outer size, or the cube prints larger than 10 millimeters.",
        ],
        {
          kind: "layers",
          caption: "A print is a stack of toolpaths. A bad lower layer is covered before you can see it fail.",
          rows: ["50 layers at 0.2 mm", "Nozzle width 0.4 mm", "Infill at 20 percent", "A lower fault is buried"],
        },
        "A 10 millimeter cube",
        [
          "Height 10 millimeters at 0.2 millimeters per layer is 50 layers.",
          "The nozzle is 0.4 millimeters wide, and the walls consume that width inside the outer size.",
          "Infill is 20 percent of each layer. The same cube at 80 percent uses more material and compresses less.",
        ],
        [
          {
            prompt: "The part is 10 millimeters tall and each layer is 0.2 millimeters. How many layers do you print?",
            answer: "50. You divide 10 by 0.2.",
          },
          {
            prompt: "Why is a bad layer 12 hard to repair once you are on layer 30?",
            answer: "Layer 12 is already covered. The print is 50 stacked toolpaths, not one path you can stop and recut the way you might on an open laser sheet.",
          },
        ],
      ),
      lec(
        "l5",
        "A bit that cannot cut a sharp corner",
        [
          "You mill by removing stock with a spinning bit, and the diameter limits the inside corner. A 6 millimeter end mill cannot cut an inside corner sharper than radius 3, half the diameter. A square pocket comes off with rounded corners. You redesign the corner to a radius of at least 3 millimeters, or you plan a second operation. The bit will not make a radius of 0.",
          "You leave stock for a finish pass. The rough pass stays 0.5 millimeters proud of the final surface, and the finish pass removes that 0.5. If you rough to final size, a deflection gouge cannot be repaired. The block is larger than the part: you leave 20 millimeters of extra stock so the bit never meets the vise jaws.",
        ],
        {
          kind: "pair",
          caption: "The drawing can ask for a square corner. The bit can only leave its own radius.",
          leftTitle: "Drawn pocket",
          rightTitle: "6 mm end mill",
          left: ["Inside radius asked: 0", "Final size already", "No stock left to fix"],
          right: ["Radius at least 3 mm", "Rough leave of 0.5 mm", "Finish removes that 0.5"],
        },
        "A pocket and a 6 millimeter bit",
        [
          "The bit diameter is 6 millimeters, so the inside corner radius cannot be under 3 millimeters.",
          "The rough pass stops 0.5 millimeters before the final surface.",
          "The finish pass removes that 0.5. The vise holds an extra 20 millimeters of stock so the bit stays off the jaws.",
        ],
        [
          {
            prompt: "The end mill diameter is 6 millimeters. What is the smallest inside corner radius it can cut?",
            answer: "3 millimeters, half the diameter. A drawn corner of radius 0 will not appear on the part.",
          },
          {
            prompt: "Why does the rough pass stop 0.5 millimeters early?",
            answer: "So the finish pass still has stock to remove. If you rough to the final size, a deflection gouge cannot be corrected because the material is already gone.",
          },
        ],
      ),
      lec(
        "l6",
        "Eight tiles and a rule",
        [
          "You treat programmable matter as parts that carry an assembly rule, not as a printer setting. This studio uses 8 identical tiles. Each has a west edge and an east edge that fit in only 1 orientation. A tile checks its neighbor, not a drawing of the whole chain. You build the 8 by those edges, and you stop if a joint seats only when you flip a tile against its mark.",
          "You make the rule physical in the joint. A tab 10 millimeters wide, cut so that the 0.2 millimeter kerf does not loosen it, seats one way. You offset by 0.1 millimeters, half the kerf, as on the plywood sheet. A symmetric tab seats two ways, and then the neighbor cannot tell the legal orientation. You cut the 8 tiles from the 3 millimeter plywood. The machine does not assemble them. You do. The programmed part is the joint.",
        ],
        {
          kind: "flow",
          caption: "The joint is the program. The laser only cuts it. You assemble the chain.",
          steps: ["Eight identical tiles", "West edge, east edge", "The joint fits one way", "Stop if a tile flips"],
        },
        "A chain of eight",
        [
          "Each tile west edge accepts only the previous tile east edge.",
          "The tab is 10 millimeters. A 0.1 millimeter offset keeps the 0.2 millimeter kerf from opening a second orientation.",
          "You seat all 8 by hand. If tile 5 fits only when flipped, the mark is wrong and you stop.",
        ],
        [
          {
            prompt: "A tab is symmetric and seats in 2 orientations. What happens to the assembly rule?",
            answer: "The local rule is lost. A neighbor can no longer read the legal orientation from the joint. You need an asymmetric tab, such as the 10 millimeter one-way joint.",
          },
          {
            prompt: "Who assembles the 8 tiles?",
            answer: "You do, by hand. The laser only cuts them from the 3 millimeter sheet. The programmed behavior is in the joint, not in a machine step that snaps the chain together.",
          },
        ],
      ),
      lec(
        "l7",
        "Two tiles before eight",
        [
          "You test one joint before cutting 8 tiles. Cut 2 tiles, seat them, and pull. If they fall apart, the 0.1 millimeter offset was too large, or the sheet is under the 3 millimeters you assumed. If they will not seat, the offset was too small. You change the offset by 0.05 millimeters and cut 2 more. You do not recut all 8 from one sticky joint.",
          "You record the test the way a studio records a critique you can reuse. Write the machine, the thickness, the kerf you assumed, the offset you used, and whether the joint seated. A later note about the 10 millimeter printed cube does not teach you about this plywood joint. Different machine, different failure. When the 2-tile test seats and resists a pull, then you cut the remaining tiles toward a chain of 8.",
        ],
        {
          kind: "pipeline",
          caption: "A pair of tiles is the experiment. The batch of eight waits on that result.",
          stages: ["Cut 2 test tiles", "Seat them and pull", "Adjust by 0.05 mm", "Then cut the rest"],
        },
        "A loose pair",
        [
          "Two tiles in 3 millimeter plywood fall apart. The offset you used was 0.1 millimeters.",
          "You reduce the offset by 0.05, to 0.05 millimeters, and you cut two new tiles.",
          "They seat and hold under a pull. Only then do you cut the tiles that complete a chain of 8.",
        ],
        [
          {
            prompt: "Two test tiles fall apart and the offset was 0.1 millimeters. What do you cut next?",
            answer: "Two new tiles at an offset reduced by 0.05 millimeters. You do not recut all 8 until a pair seats and holds a pull.",
          },
          {
            prompt: "Why keep the laser notes off the page that records the 10 millimeter printed cube?",
            answer: "They are different machines and different failures. The cube layer height does not say whether the plywood kerf offset was right. The joint test stays with the laser job.",
          },
        ],
      ),
      lec(
        "l8",
        "A job sheet you can trust",
        [
          "You can now turn a drawing into a toolpath on a 400 by 300 millimeter bed, offset a 0.2 millimeter kerf, pack parts with 2 millimeter gaps, print 50 layers of 0.2 millimeters, and leave 0.5 millimeters where a mill cannot beat an inside radius of 3. You can cut 8 tiles that assemble one way, after a 2-tile pull test. The skill is the path, the material, and a test you can hold.",
          "You finish a piece only when the test and the batch agree. A cube of 50 layers at 20 percent infill is not the plywood chain, and sanding one hides nothing about the other. Before 8 tiles you need the 2-tile pull test. Before a pocket you need the corner a 6 millimeter bit can cut. You write those limits on the job sheet and stop when a path would cross one.",
        ],
        {
          kind: "pair",
          caption: "Each machine has its own limit. A pass on one does not clear the other.",
          leftTitle: "Laser and plywood",
          rightTitle: "Mill and printer",
          left: ["Kerf of 0.2 mm", "Test 2 tiles first", "Then a chain of 8"],
          right: ["Corner radius at least 3", "Finish leave of 0.5 mm", "50 layers of 0.2 mm"],
        },
        "Three jobs, three results",
        [
          "The laser job names 3 millimeter plywood, a starting offset of 0.1 millimeters, and a 2-tile test before 8 tiles.",
          "The mill job names a 6 millimeter bit, a minimum inside radius of 3 millimeters, and a rough leave of 0.5 millimeters.",
          "The print job names 50 layers and 20 percent infill. You do not borrow a pass or a fail from one job for another.",
        ],
        [
          {
            prompt: "Combine kerf and the assembly rule. The kerf is 0.2 millimeters, and a symmetric tab seats two ways. What do you change, and what offset do you start from?",
            answer: "Make the tab asymmetric so only one orientation seats, and offset the path by half the kerf, 0.1 millimeters, into the waste. Prove the joint on 2 tiles before you cut 8.",
          },
          {
            prompt: "Combine the bed limit and the mill. The drawing asks for a square inside corner, and the only bit has diameter 6 millimeters. The blank must also stay on the 400 by 300 millimeter bed. What radius can you cut?",
            answer: "3 millimeters, not 0. The bit cannot make a sharper inside corner, so the drawing changes or you plan a second operation. Separately, the toolpath still has to stay inside the 400 by 300 millimeter bed.",
          },
        ],
      ),
    ],
  },
  {
    slug: "csce-748",
    lectures: [
      lec(
        "l1",
        "Time, aperture, and a disk",
        [
          "You form a photograph with a lens that gathers a bundle of rays. A point at 2 meters lands on one sensor cell. A point at 5 meters lands as a disk, the defocus blur. The sensor integrates that disk for 0.01 seconds, and a moving subject also smears. You have two blurs, depth and motion, in the same exposure. Naming which blur you have is the first measurement.",
          "You set exposure as a product you can double in more than one way. Doubling the time from 0.01 seconds to 0.02 seconds doubles the collected energy and can saturate a cell. Opening the aperture by one stop also doubles the energy, and it changes the defocus disk, because a wider aperture takes a wider bundle from the point at 5 meters. A brightness slider after the fact is a later multiply. It is not this integral on the sensor.",
        ],
        {
          kind: "pair",
          caption: "Focus picks which distance is a point. Aperture and time both change energy.",
          leftTitle: "Point at 2 meters",
          rightTitle: "Point at 5 meters",
          left: ["Lands on one cell", "Time is 0.01 seconds", "Motion can still smear"],
          right: ["Lands as a disk", "Wider aperture, larger disk", "One stop doubles energy"],
        },
        "Two ways to double the energy",
        [
          "A point at 2 meters is sharp on one cell. A point at 5 meters is a defocus disk.",
          "Time of 0.01 seconds collects some energy. Time of 0.02 seconds collects twice as much, and a cell may saturate.",
          "One stop wider also doubles the energy, and it enlarges the disk from the point at 5 meters.",
        ],
        [
          {
            prompt: "You double the time from 0.01 seconds to 0.02 seconds and leave the aperture fixed. What happens to the collected energy, and what happens to defocus size?",
            answer: "The energy doubles, so a cell near the top of its range can saturate. The defocus size does not change, because the aperture stayed fixed.",
          },
          {
            prompt: "You open the aperture by one stop and keep the time at 0.01 seconds. What two things change?",
            answer: "The collected energy doubles, and the defocus disk of a point at 5 meters grows. A point at the 2 meter focus can stay on one cell.",
          },
        ],
      ),
      lec(
        "l2",
        "A kernel after the shutter",
        [
          "You filter the grid with a kernel chosen for a photographic reason. A 3 by 3 box of weights 1/9 cuts noise and also widens the defocus disk from the point at 5 meters. Use it only when noise is the larger problem. The 9 weights must add to 1. If each weight is 1, a flat gray of 20 becomes 180, an exposure change hiding in the filter.",
          "You sharpen only where the sensor still has range. Subtract a blur from the original and add a fraction of the difference. A pixel at 80, a blur at 50, and a fraction of 0.5 give 95. You do not sharpen a pixel already at 255. There is no detail above the clip, and the difference would invent a halo. Leave 255, and sharpen neighbors that still have room.",
        ],
        {
          kind: "pipeline",
          caption: "A blur whose weights add to 1 keeps a flat gray. Sharpen skips a clipped pixel.",
          stages: ["Weights must sum to 1", "Blur into a new buffer", "Add a fraction back", "Leave 255 alone"],
        },
        "A pixel at 80",
        [
          "The blur at that pixel is 50. The difference is 30.",
          "Half of 30 is 15. The sharpened value is 95.",
          "A neighbor already at 255 stays 255. You do not build a halo from a difference the clip cannot support.",
        ],
        [
          {
            prompt: "Each of 9 kernel weights is 1, and the pixel sits in a flat region of value 20. What is the output, and what is wrong?",
            answer: "The output is 180, because 9 times 20 is 180. The weights add to 9 rather than 1, so the filter changes brightness. A box blur uses 1/9 for each weight.",
          },
          {
            prompt: "A pixel is 80, its blur is 50, and you add half the difference. What do you store, and what would you refuse if the pixel were 255?",
            answer: "You store 95, because half of 30 is 15 and 80 plus 15 is 95. If the pixel were already 255 you would leave it, because there is no detail above the clip.",
          },
        ],
      ),
      lec(
        "l3",
        "Four pairs and a seam",
        [
          "You stitch two views with a homography when the scene is far, or the camera rotated about its center. You mark 4 point pairs on the shared wall, with no 3 points on one line. Those pairs fix the map from view A to view B. You warp A with the inverse map so each output pixel pulls a sample. Fewer than 4 pairs leaves the map unfixed. A disagreeing fifth pair means the scene is not one plane.",
          "You blend the overlap after the warp. If the overlap is 40 pixels wide, a pixel 10 pixels in takes weight 10/40 from the incoming view and 30/40 from the other. You blend the aligned images. Blending before the warp smears the seam in the wrong coordinate. A doubled parallax edge will not be fixed by that 40 pixel ramp. It needs a model other than one plane.",
        ],
        {
          kind: "flow",
          caption: "Four pairs fix the map. The ramp only hides a seam that is already aligned.",
          steps: ["Mark 4 point pairs", "Solve the homography", "Warp by the inverse", "Blend across 40 pixels"],
        },
        "Ten pixels into a seam",
        [
          "Four pairs, no three on one line, fix the map from view A onto view B.",
          "You warp A by pulling a sample for every output pixel. The overlap is 40 pixels wide.",
          "A pixel 10 pixels into the overlap uses weight 0.25 from the incoming view and 0.75 from the other, because 10/40 is 0.25.",
        ],
        [
          {
            prompt: "You have 3 point pairs. Can they fix a homography between the two views?",
            answer: "No. You need 4 pairs, and no three of the points may lie on one line. Three pairs leave the map underdetermined.",
          },
          {
            prompt: "The overlap is 40 pixels wide and the pixel is 10 pixels into it. What is the incoming view weight?",
            answer: "0.25. That is 10 divided by 40. The other view receives the remaining 0.75.",
          },
        ],
      ),
      lec(
        "l4",
        "Three exposures",
        [
          "You merge several exposures because one frame cannot hold both a lamp and a shadow. You shoot 3 frames at 0.01, 0.04, and 0.16 seconds. Each step multiplies time by 4. A pixel at 255 in the long frame is saturated, so you ignore it. The same pixel may read 40 in the short frame. You divide each usable sample by its time so the frames share one radiance unit.",
          "You check linearity where a pixel is valid in two frames. At 0.01 seconds the sample is 20. At 0.04 seconds a linear sensor should read near 80, because the time grew by 4. A reading of 60 means a raw divide will bias the radiance. After the merge you tone-map into a display range of 0 to 255. That map is a display compress, not a clip of the long frame.",
        ],
        {
          kind: "pipeline",
          caption: "Drop clipped samples, scale the rest by time, then compress for display.",
          stages: ["Three exposure times", "Drop samples at 255", "Divide by the time", "Tone-map into 0 to 255"],
        },
        "One pixel in two frames",
        [
          "The times are 0.01, 0.04, and 0.16 seconds. The long frame reads 255, so you drop that sample.",
          "The short frame reads 20. If the sensor is linear, the middle frame should read near 80, because 4 times 20 is 80.",
          "A middle reading of 60 means you cannot trust a raw divide. Usable samples are divided by their own times before the tone map.",
        ],
        [
          {
            prompt: "The exposure times are 0.01, 0.04, and 0.16 seconds. By what factor does each step increase the time?",
            answer: "4. You get 0.04 by multiplying 0.01 by 4, and 0.16 by multiplying 0.04 by 4.",
          },
          {
            prompt: "A pixel is 255 in the longest frame and 40 in the shortest. Which sample enters the radiance estimate?",
            answer: "The short-frame sample, 40, divided by its exposure time of 0.01. The value 255 is saturated, so you do not average it in.",
          },
        ],
      ),
      lec(
        "l5",
        "Sixteen rays, not a sum",
        [
          "You store a light field when one summed image is not enough to refocus later. Each sample records a ray by where it hits a lens plane and where it hits a sensor plane. This exercise keeps 4 viewpoints and 4 pixels, which is 16 rays, not a finished photograph. An ordinary exposure would sum every lens-plane sample that lands on one sensor cell. You refuse that sum at capture so you can choose a different sum after the shutter.",
          "You refocus by shifting, then adding. For the point at 2 meters, you average the 4 viewpoint samples at shift 0. To focus closer, you shift a neighbor view by 1 pixel before the add. A point at 5 meters that needed a different shift stays a disk. You did not delete defocus. You chose which of the two depths the average makes sharp.",
        ],
        {
          kind: "layers",
          caption: "Keep the rays apart. A shift chooses the depth that the average will sharpen.",
          rows: ["4 views and 4 pixels", "16 rays, not summed", "Shift by 0 or by 1", "Average the 4 views"],
        },
        "A shift of one pixel",
        [
          "You stored 4 views instead of the lens sum. The toy grid holds 16 rays.",
          "To focus at 2 meters you add the 4 view samples with shift 0 and average them.",
          "To focus closer you shift neighbor views by 1 pixel, then average. The point at 5 meters stays soft if it needed another shift.",
        ],
        [
          {
            prompt: "You stored 4 viewpoints and 4 pixels. How many rays is that, and why not store the summed photo?",
            answer: "16 rays. The summed photo would throw away the lens-plane split, so a later shift could not refocus.",
          },
          {
            prompt: "The point at 2 meters is sharp at shift 0. What do you do with the 4 view samples?",
            answer: "Add them with no shift, then average. A shift of 1 pixel is the choice for a closer depth, and it would leave the 2 meter point less sharp.",
          },
        ],
      ),
      lec(
        "l6",
        "A cheap path down the image",
        [
          "You change width by removing seams, not by scaling every column. On this 8 by 8 image a seam is 8 pixels, one per row, each step touching a neighbor. You score a pixel by its difference from its horizontal neighbors. You remove the path whose 8 scores sum to the least. A uniform scale would shrink a face and a blank wall together. The seam tries to take the wall.",
          "You protect a region with a penalty. The face occupies columns 3 through 5, and you add 100 to every score there. A path through the face then loses unless the wall costs more than 100 per pixel. After one removal the image is 8 by 7. You recompute scores. Closing the gap changed the neighbors, so the old path is not a path on the narrower image.",
        ],
        {
          kind: "pair",
          caption: "Scale shrinks everything. A seam removes one cheap path and can spare a marked face.",
          leftTitle: "Uniform scale",
          rightTitle: "One seam",
          left: ["Face and wall both shrink", "No path of 8 pixels", "The width change is global"],
          right: ["One pixel from each row", "Remove the cheap path", "Penalty 100 on the face"],
        },
        "From 8 columns to 7",
        [
          "Each candidate seam has 8 pixels, one per row, and its cost is the sum of those scores.",
          "You add 100 to the scores in columns 3, 4, and 5 so a path through the face is expensive.",
          "You delete the cheapest seam. The image is now 8 by 7, and you recompute scores before any second seam.",
        ],
        [
          {
            prompt: "How many pixels does one seam remove from an image that is 8 pixels tall?",
            answer: "8, one from each row. The width drops by 1, from 8 columns to 7.",
          },
          {
            prompt: "Why recompute scores after a removal instead of deleting the same seam again?",
            answer: "Closing the gap changes the neighbors of the remaining pixels, so the scores change. The old path is not a path in the 8 by 7 image.",
          },
        ],
      ),
      lec(
        "l7",
        "Copy one pixel, not the tile",
        [
          "You synthesize texture by copying pixels whose neighborhoods match a sample, not by stretching it. The sample is 4 by 4. The output is 8 by 8, which you do not have. For each new pixel you find the sample site whose neighborhood is closest to the neighbors already filled. You copy that 1 pixel. Copying the whole 4 by 4 would tile the output and show a grid seam.",
          "You seed the output so the first comparison has neighbors. Copy the top-left 2 by 2 of the sample, 4 pixels, into the corner, then grow. If two sites match equally, either pick is allowed, and a second run may differ. You do not ignore the neighborhood and repeat the 4 by 4 on a lattice. That repeat seams every 4 columns. Check columns 3 and 4 before you accept the 8 by 8.",
        ],
        {
          kind: "flow",
          caption: "A seed gives the first neighborhood. After that, one pixel is copied at a time.",
          steps: ["Seed a 2 by 2 block", "Match the neighborhood", "Copy a single pixel", "Check every 4th column"],
        },
        "Growing past the seed",
        [
          "The sample is 4 by 4. You copy its top-left 2 by 2, four pixels, into the output as the seed.",
          "The next pixel compares its filled neighbors with the sample and copies one pixel from the closest match.",
          "A tiled copy would seam every 4 columns. You inspect columns 3 and 4 before you accept the 8 by 8 result.",
        ],
        [
          {
            prompt: "Why copy one pixel from the best neighborhood match instead of pasting the whole 4 by 4 sample?",
            answer: "Pasting the whole sample tiles it, and a seam appears every 4 pixels. Copying one pixel lets the next neighborhood continue the texture without that grid.",
          },
          {
            prompt: "The seed is the top-left 2 by 2 of the sample. How many pixels is that, and why do you need them?",
            answer: "4 pixels. The first synthesized pixel needs neighbors to match. An empty output has no neighborhood to compare against the sample.",
          },
        ],
      ),
      lec(
        "l8",
        "Match the fault to the tool",
        [
          "You can now read a frame as an exposure of 0.01 seconds focused at 2 meters, filter it without shifting a flat gray, stitch two views from 4 point pairs, merge 3 exposures, refocus 16 rays, remove a seam of 8 pixels, and grow an 8 by 8 texture from a 4 by 4 sample. Each edit has a number you can recompute. You can also say which edit does not repair which fault.",
          "You pick the edit from the fault. A lamp clipped at 255 needs another exposure, not a sharpen. A squeezed face needs a seam with penalty 100, not a homography. A disk from a point at 5 meters needs a light-field shift, not a 3 by 3 box, which widens the disk. You name the fault, then the mechanism, then the number that shows it ran.",
        ],
        {
          kind: "pair",
          caption: "The fault names the mechanism. A nearby tool can make the fault worse.",
          leftTitle: "The fault",
          rightTitle: "The mechanism",
          left: ["A pixel stuck at 255", "A face squeezed flat", "A disk at 5 meters"],
          right: ["Use a shorter exposure", "Seam, penalty 100", "Shift the light field"],
        },
        "Three faults, three tools",
        [
          "A pixel at 255 in the 0.16 second frame is dropped. The 0.01 second frame supplies the sample you divide by time.",
          "A seam of 8 pixels, with a penalty of 100 on the face columns, changes the width without scaling the face.",
          "A shift of 1 pixel among the 4 views refocuses. A 3 by 3 box is the wrong tool for the disk at 5 meters.",
        ],
        [
          {
            prompt: "Combine the exposure merge and the sharpen. The long frame reads 255 and the short frame reads 20 at 0.01 seconds. What do you use, and what do you refuse to sharpen?",
            answer: "You use 20 divided by 0.01, and you drop the 255. You refuse to sharpen the clipped 255, because there is no detail above the clip. After the tone map you may sharpen an in-range pixel, such as 80 against a blur of 50, which becomes 95.",
          },
          {
            prompt: "Combine the panorama blend and the seam. The overlap is 40 pixels, and an 8-pixel-tall image must lose 1 column. What is the incoming weight 10 pixels into the overlap, and how many pixels does the seam remove?",
            answer: "The incoming weight is 0.25, which is 10 divided by 40, and the other view gets 0.75. The seam removes 8 pixels, one per row. The blend does not change the width. The seam does. You do not use a uniform scale for that width change.",
          },
        ],
      ),
    ],
  },
];


