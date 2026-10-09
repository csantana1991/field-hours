import type { CoursePack } from "../types";
import { lec } from "./lec";

export const packs: CoursePack[] = [
  {
    slug: "csce-706",
    lectures: [
      lec("l1", "Compile, link, and a documented main", [
        "You start from a text file. The preprocessor runs first and pastes each header you name. The compiler then checks types and writes an object file. The linker joins that file to the C library and produces one program. Those are three tools, and a 12-line file that prints a single integer still goes through all of them. Stop after the compiler and you have no command you can run.",
        "Inside main, statements run from the first line downward. The declaration int n = 4; creates an int and stores 4 in it. The next statement may read n. A comment does not run. Above main, you write two lines that name the input and the one result. That note is documentation. The compiler skips it, and you should not have to guess what the stored 4 is for.",
      ], { kind: "pipeline", caption: "Three tools, then a command.", stages: ["Preprocessor pastes headers", "Compiler writes an object file", "Linker produces one program"] }, "Print the sum of 2 and 2", [
        "Inside main, declare int a = 2 and int b = 2.",
        "Declare int s = a + b. The stored value is 4.",
        "Pass s to printf with a format for one int. The program prints 4 and main returns 0.",
      ], [
        { prompt: "You produce an object file and stop. Why is there still no program to run?", answer: "The linker has not joined that object file to the C library. You have the compiler's output, not a finished command." },
        { prompt: "The comment above main says the program prints 4, but the code adds a = 2 and b = 3. What does the machine print?", answer: "It prints 5. Comments are documentation and do not run. The stored values are 2 and 3, and their sum is 5." },
      ]),
      lec("l2", "Integer division and operator order", [
        "An int on a common machine occupies 4 bytes, which is 32 bits, and one of those bits is the sign. You store a whole number, not a fraction. The expression 7 / 2 uses integer division and yields 3, because the remainder is dropped. The expression 7 % 2 yields 1, the remainder. If you needed the half that disappeared, a wider int would not restore it. You would use a double.",
        "You do not choose precedence while you type. Multiplication happens before addition, so 2 + 3 * 4 is 14, not 20. Parentheses force the other grouping: (2 + 3) * 4 is 20. Assignment stores. The test == compares and does not store. If you write if (n = 4), you store 4, and the condition is true because 4 is not 0. That bug still compiles.",
      ], { kind: "pair", caption: "Same symbols, two groupings.", leftTitle: "No parentheses", rightTitle: "Parentheses first", left: ["2 + 3 * 4", "Multiply, then add", "The result is 14"], right: ["(2 + 3) * 4", "Add, then multiply", "The result is 20"] }, "Where 7 sits on a 4-mark clock", [
        "The stored hour is 7. The clock has 4 marks.",
        "7 % 4 is 3, because 4 * 1 + 3 = 7. The mark is 3.",
        "7 / 4 is 1, the number of full turns. Printing the quotient answers a different question than printing the remainder.",
      ], [
        { prompt: "What are 11 / 4 and 11 % 4 when both operands are ints?", answer: "Integer division gives 2. The remainder is 3, because 4 * 2 + 3 = 11." },
        { prompt: "You wrote if (count = 0) to test whether count is zero. What does that condition do?", answer: "It stores 0 into count. The condition is false, because 0 is the false value. The previous count is gone. A test uses == and does not store." },
      ]),
      lec("l3", "One branch, then a counted loop", [
        "A branch runs one block. if (n > 0) runs the next block only when the test is true, and else runs when it is false. With n equal to 3, you take the true block once. With n equal to 0, you take the else once. Nested tests are still a single path. Draw the two paths before you add a third test, or one value will match none of the blocks you wrote.",
        "A loop repeats a block while a test stays true. for (i = 1; i <= 4; i = i + 1) runs the body four times, with i holding 1, then 2, then 3, then 4. After the loop, i is 5, because the test fails at 5. A while loop is the same machine with the test written at the top. If you forget the update, the test never becomes false and the program does not finish.",
      ], { kind: "flow", caption: "A loop that runs four times.", steps: ["i starts at 1", "Body runs, then i grows", "Stop when i is 5", "The body ran 4 times"] }, "Add the integers from 1 through 4", [
        "Set int s = 0 and int i = 1.",
        "While i <= 4, set s = s + i and then i = i + 1. The partial sums are 1, then 3, then 6, then 10.",
        "The test fails when i is 5. s holds 10. That 10 is the result of the four additions, not a fifth pass.",
      ], [
        { prompt: "A for loop sets i to 1, continues while i <= 4, and adds 1 to i each time. How many times does the body run, and what is i after the loop?", answer: "The body runs 4 times, for i equal to 1, 2, 3, and 4. After the loop i is 5, the first value that fails the test." },
        { prompt: "You want the sum of 1 through 4. The loop adds i, but i stays 1. What happens?", answer: "The test stays true, so the loop does not end. A finished loop adds 1 to i on each pass and stops with the sum 10." },
      ]),
      lec("l4", "Functions, copies, and a contract", [
        "A function is a named block with inputs and one result. The heading int add(int a, int b) says both inputs are int and the result is int. The body returns a + b. A call add(3, 5) copies 3 into a and 5 into b, then returns 8. The copy is the mechanism. If you set a = 0 inside add before the return, you change that copy. The caller's variable is a different slot.",
        "Above the function, you write three short lines: what each argument means, what you return, and what you refuse to do. For add, two ints go in and their sum comes out, with no other effect. A reader should not have to run the body to learn that. If the function also prints, the note must say so. Printing and returning a sum are two jobs. Split them so a test can check the returned 8 without reading the screen.",
      ], { kind: "pipeline", caption: "A call copies, then returns.", stages: ["Caller writes add(3, 5)", "Copies land in a and b", "Body returns a + b", "Caller receives 8"] }, "A function that sums 1 through 4", [
        "int sum_through_4(void) sets s to 0, then loops i from 1 to 4, adding i into s on each pass.",
        "The return value is 10. The names s and i disappear when the function returns.",
        "main calls sum_through_4 once and stores 10. It does not repeat the loop itself.",
      ], [
        { prompt: "add(4, 6) copies into a and b. The body sets a = 0 and then returns a + b. What does the caller receive, and does the caller's variable change?", answer: "The caller receives 6, because the return uses the copy: 0 + 6. The caller's variable is a separate slot and is not changed." },
        { prompt: "Why does the three-line note above add have to mention printing if the body prints the sum?", answer: "The contract is inputs, the return, and the effects. Printing is an effect. A caller who only expects the returned 8 will not know the function also writes to the screen unless the note says so." },
      ]),
      lec("l5", "Arrays, bounds, and the zero byte", [
        "An array is one row of slots of a single type. int a[4] gives you four ints, at indexes 0, 1, 2, and 3. The last legal index is 3, one less than the length. a[0] = 10 stores 10 in the first slot. Reading a[4] steps past the row. C does not check that read for you. You pass the length 4 beside the array, because the array value does not store how many slots it has.",
        "A C string is a char array with a zero byte after the last character. The four letters in the word code occupy indexes 0 through 3, and index 4 holds 0. strlen walks until that zero and returns 4. It does not count the zero byte. If you omit the zero, the walk continues into whatever bytes follow. When you copy, leave room for that extra byte, so those four letters need 5 chars.",
      ], { kind: "layers", caption: "Four slots, indexes from 0.", rows: ["Index 0 is the first slot", "Index 1 is the second", "Index 2 is the third", "Index 3 is the last legal"] }, "Sum four slots without stepping past them", [
        "int a[4] holds 1, 2, 3, and 4. Set s to 0 and i to 0.",
        "While i < 4, add a[i] into s and add 1 to i. You touch indexes 0, 1, 2, and 3.",
        "s is 10. The test i <= 4 would also read index 4, which is outside the four slots.",
      ], [
        { prompt: "An array has length 4. Which indexes may you read, and what is index 4?", answer: "You may read 0, 1, 2, and 3. Index 4 is one past the end. It is not a fifth element, and C will not stop you from naming it." },
        { prompt: "How many chars do you allocate for the word code as a C string, and what does strlen return?", answer: "Allocate 5 chars: the four letters plus a zero byte at index 4. strlen returns 4, because it stops at the zero and does not count it." },
      ]),
      lec("l6", "Pointers name a slot by its address", [
        "A pointer stores an address, not the int sitting at that address. If n is an int, int *p = &n stores the address of n in p. The expression *p reads or writes that int. After *p = 9, n itself is 9. The pointer is a separate slot. When you print p, you see an address. When you print *p, you see 9. Mixing those two prints is the usual bug, and the compiler often accepts both.",
        "When you pass an array, you pass the address of element 0, not a copy of the ints. The parameter int *a holds that address. A write to a[2] changes the caller's slot, because both names refer to the same row of 4 ints. You still pass the length as a second argument. Pointer arithmetic steps by elements: a + 1 is the next int, 4 bytes later. a + 4 is just past the last element.",
      ], { kind: "pair", caption: "The pointer and the int.", leftTitle: "The pointer p", rightTitle: "The int n", left: ["Holds an address", "Printing p shows that address"], right: ["Holds 9 after the write", "Printing *p shows 9"] }, "Write the third slot through a pointer", [
        "int a[4] starts as 0, 0, 0, 0. int *p = a stores the address of a[0].",
        "*(p + 2) = 7 writes 7 into a[2]. The notation p[2] = 7 is the same write.",
        "The row is now 0, 0, 7, 0. The caller sees 7 because p holds the row's address, not a copy of four ints.",
      ], [
        { prompt: "n is 4. You set int *p = &n and then *p = 9. What is n, and what do you see if you print p rather than *p?", answer: "n is 9, because *p writes the int at that address. Printing p shows the address, not 9. Printing *p shows 9." },
        { prompt: "A function receives int *a and the length 4, then sets a[0] = 5. Why does the caller see 5 in the first slot?", answer: "The argument is the address of element 0, not a copy of the four ints. a[0] and the caller's first slot are the same memory." },
      ]),
      lec("l7", "A struct, then one heap block", [
        "A struct groups named fields in one object. struct Point { int x; int y; } stores two ints side by side. After you set p.x = 3 and p.y = 4, both numbers live in p. Pass struct Point by value and the function gets a copy of those two ints. Pass struct Point *q and an assignment through q->x changes the caller's field. Use the pointer when that one object should be updated in place.",
        "malloc(sizeof(struct Point)) asks the heap for one block large enough for 2 ints and returns its address. You test that pointer against null before you write x and y. free takes the same address and returns the block. Call free once. Afterward the pointer still holds the old address, so you set it to null, or a later free will hand that address out a second time. A stack Point dies on return. This heap Point does not.",
      ], { kind: "flow", caption: "One heap block, then free.", steps: ["malloc one struct Point", "Reject a null address", "Write the two fields", "free that address once"] }, "A heap Point at x = 3, y = 4", [
        "struct Point *q = malloc(sizeof(struct Point)). Suppose the returned address is not null.",
        "Set q->x = 3 and q->y = 4. Both fields sit in that one block.",
        "free(q), then set q to null. The block is returned once. You do not pass the old address to free again.",
      ], [
        { prompt: "You pass a Point by value into a function that sets x to 8. The caller had x equal to 3. What does the caller see after the return?", answer: "The caller still sees 3. The function received a copy of both fields, and the assignment changed only that copy." },
        { prompt: "You malloc one Point, free it, then free that same address again. What went wrong?", answer: "The block was returned on the first free. The second free hands the same address out again. After the first free, set the pointer to null so you do not free that address a second time." },
      ]),
      lec("l8", "A finished program you can defend", [
        "You can now write a small C program and name what each piece does. A loop from 1 to 4, a function that returns a sum, an array of length 4, a pointer to its first slot, and one struct on the heap are enough for a utility that reads four ints and returns one result. You also know the note above the function: inputs, the return, and the effects. Pass every length. Test malloc. free each block once.",
        "The failure you look for is a contract that disagrees with the body. If the comment says you do not allocate, but the body calls malloc for 4 ints, the next reader will leak those ints. Match the comment to the code before you stop. Run the loop by hand on the four values and write the sum. If the hand sum and the return disagree, the bug is the update or the bound. Fix the function, then the comment.",
      ], { kind: "layers", caption: "What a finished utility contains.", rows: ["A note on inputs and return", "A loop with a tested bound", "An array passed with its length", "One malloc paired with one free"] }, "Sum four ints that live on the heap", [
        "int *a = malloc(4 * sizeof(int)). If a is null, stop and allocate nothing else.",
        "Store 1, 2, 3, and 4. int total(int *a, int n) with n equal to 4 adds a[0] through a[3] and returns 10.",
        "free(a) and set a to null. The note says the caller owns the block and frees it once. The function total itself does not allocate.",
      ], [
        { prompt: "The note says total does not allocate and sums 4 ints. The body mallocs 4 ints, loops while i <= 4, adds a[i], frees once, and returns. The slots hold 1, 2, 3, and 4. What is wrong, and what should a correct sum be?", answer: "Two faults, from the contract and from the bound. The note says no allocation, but malloc ran. The test i <= 4 reads index 4, past the last legal index 3. The sum of the four ints is 10, using indexes 0, 1, 2, and 3 only. If the malloc stays, free it once and fix the note." },
        { prompt: "You need a function to set a Point's y to 4 while x stays 3, and the caller must see both fields. Do you pass the struct by value or by pointer?", answer: "Pass struct Point * and assign through the pointer. After the call, x is 3 and y is 4. A by-value parameter would change a copy, and the caller would keep the old y." },
      ]),
    ],
  },
  {
    slug: "csce-708",
    lectures: [
      lec("l1", "Instructions run in the order you wrote", [
        "A program is a list of instructions the machine runs from top to bottom. In Java the list sits in a method named main. The statement int n = 4; stores 4 under the name n. The next line may use n. A nearby line does not run early. Order is the mechanism. Swap two legal lines and you have written a different program. Even a main of 4 lines has a first line and a last line.",
        "You trace by simulating one line, then the next, on paper. Write the name n and the value 4. When a later line adds 1, cross out 4 and write 5. If your trace and the machine disagree at line 3, the bug is in an earlier line, not in the printer. Do not skip ahead. Four lines are few enough that you can finish the trace before you compile.",
      ], { kind: "flow", caption: "Run main from the top.", steps: ["Enter main", "Store 4 under the name n", "Use n on the next line", "Leave at the last line"] }, "Two stores, then a sum", [
        "Line 1 stores int a = 2. Line 2 stores int b = 2.",
        "Line 3 stores int s = a + b. Your trace shows s equal to 4.",
        "Line 4 prints s. The print shows 4 because the addition already happened on line 3, not inside the print.",
      ], [
        { prompt: "Line 1 prints n, and line 2 stores int n = 4. What goes wrong when you run from the top?", answer: "Line 1 uses n before any store. Order is the mechanism: the store on line 2 has not run yet, so the print is not showing 4." },
        { prompt: "Your trace says s is 4 after int s = 2 + 2, and the program prints 5. Which line do you inspect?", answer: "The addition on the earlier line, not the print. The print shows whatever s holds. A trace that expects 4 means the store is where a printed 5 has to come from." },
      ]),
      lec("l2", "A name, a type, and one stored value", [
        "A variable is a named slot with a type. In Java, int holds a whole number and double holds a fraction. You pick the type when you create the slot. The line int q = 7 / 2 stores 3, because both operands are ints and the remainder is dropped. The line double q = 7.0 / 2.0 stores 3.5. The operand types are the mechanism. A wider name on the left does not put the fraction back.",
        "Assignment replaces the stored value. It does not keep a history. If n is 4 and you execute n = n + 1, the slot holds 5 and the 4 is gone. The right-hand side is read first, which is why n + 1 still sees 4. You must store a first value when you create a local, even when that value is 0. Reading a local you never stored is rejected at compile time.",
      ], { kind: "pair", caption: "Two divisions, two types.", leftTitle: "int division", rightTitle: "double division", left: ["Operands 7 and 2", "Remainder is dropped", "Stored result is 3"], right: ["Operands 7.0 and 2.0", "Fraction is kept", "Stored result is 3.5"] }, "Update one slot twice", [
        "Create int n = 4. The slot holds 4.",
        "Execute n = n + 1. The right-hand side reads 4, adds 1, and stores 5. The old 4 is gone.",
        "Execute n = n + 1 again. The slot holds 6. Two updates from 4 give 6, not a list of older values.",
      ], [
        { prompt: "What does int q = 7 / 2 store, and what does double q = 7.0 / 2.0 store?", answer: "The int division stores 3, because both operands are ints and the remainder is dropped. The double division stores 3.5." },
        { prompt: "n holds 4. You execute n = n + 1 twice. What is in the slot, and where did the original 4 go?", answer: "The slot holds 6. Each assignment replaces the previous value. The 4 was overwritten by 5, and the 5 was overwritten by 6." },
      ]),
      lec("l3", "Tests, and, or, and one chosen block", [
        "A boolean is true or false. The test n > 0 is true when n is 3 and false when n is 0. if runs one block for true, and else runs the other. You do not take both. && requires two tests. When n is 3 and m is 0, n > 0 && m > 0 is false because the second half fails. Java skips that second half when the first half of && is already false.",
        "|| is true when either side is true. With n equal to 3 and m equal to 0, n > 0 || m > 0 is true. ! flips one boolean, so !(n > 0) is false when n is 3. Write the numbers into the test before you nest a second if. Three booleans give 8 possible rows. You do not need all 8 yet. Name the one row you want, and let the other rows fall into else.",
      ], { kind: "pair", caption: "Same numbers, two connectors.", leftTitle: "And", rightTitle: "Or", left: ["n > 0 is true", "m > 0 is false", "And is false"], right: ["n > 0 is true", "m > 0 is false", "Or is true"] }, "Classify 4 with two tests", [
        "Store int n = 4. The test n > 0 is true. The test n < 10 is true.",
        "n > 0 && n < 10 is true, so the if block runs. That block is the one for a small positive value.",
        "Change n to 0 and repeat. n > 0 is false, so && does not need the second test, and else runs.",
      ], [
        { prompt: "n is 3 and m is 0. What are n > 0 && m > 0 and n > 0 || m > 0?", answer: "The && test is false, because m > 0 is false. The || test is true, because n > 0 is true. One true side is enough for ||." },
        { prompt: "The first half of n > 0 && m > 0 is false. Does Java evaluate m > 0?", answer: "No. && stops when the left side is false, because the whole test is already false. That skip matters when the right side would have been an illegal read." },
      ]),
      lec("l4", "A loop is an algorithm you can count", [
        "An algorithm is a finite list of steps that stops on every input you agreed to accept. A loop is the step you repeat. for (int i = 1; i <= 4; i = i + 1) runs the body 4 times. You should know that count before you run it. The update i = i + 1 is the mechanism that makes i <= 4 become false. Delete the update and the list of steps never finishes.",
        "After each pass, name what is true. After one pass, one number is in the sum. After four passes, four numbers are in it. Start s at 0 and set s = s + i in the body. The partial sums are 1, then 3, then 6, then 10. When the test fails, s is 10, the sum of 1 through 4. That sentence is the algorithm. The for line is only how you write it.",
      ], { kind: "flow", caption: "Repeat one add, four times.", steps: ["s starts at 0", "Add i, then grow i", "Stop after i passes 4", "s holds 10"] }, "Hand trace of the four additions", [
        "i is 1 and s becomes 0 + 1 = 1. Then i becomes 2.",
        "s becomes 1 + 2 = 3, then 3 + 3 = 6, then 6 + 4 = 10. That is four additions.",
        "i becomes 5. The test i <= 4 fails. You stop with s equal to 10.",
      ], [
        { prompt: "The loop is for (int i = 1; i <= 4; i = i + 1) and the body adds i into s, which starts at 0. What is s at the end, and how many times did the body run?", answer: "s is 10, the sum 1 + 2 + 3 + 4. The body ran 4 times. The test fails when i becomes 5." },
        { prompt: "You delete the update i = i + 1, and i starts at 1 with the test i <= 4. Why is this no longer an algorithm for the inputs you accepted?", answer: "The test stays true, so the step list does not finish. An algorithm has to stop. The update is what lets i pass 4." },
      ]),
      lec("l5", "A method returns one result", [
        "A method is a named block you call. static int add(int a, int b) takes two ints and returns one int. The call add(3, 5) copies 3 into a and 5 into b. The return becomes the value of the call, which is 8. The copy is the mechanism. Setting a = 0 inside add changes the copy, not the caller's variable. The caller sees only the returned int.",
        "Keep one job in the method. add returns a sum and does not also print. A second method can print the 8 if someone must see it. The split lets you test: call add(3, 5) and compare the return with 8. If the sum is only printed, the test has to read the screen. A method that promises an int must return an int on every path, including the path that handles 0.",
      ], { kind: "pipeline", caption: "Call, copy, then return.", stages: ["Caller writes add(3, 5)", "Copies go into a and b", "return sends 8 back", "The call value is 8"] }, "A method that sums 1 through 4", [
        "static int sumThrough4() sets s to 0 and loops i from 1 to 4, adding i each time.",
        "The return is 10. The names s and i exist only inside the method.",
        "main stores int answer = sumThrough4(). answer is 10. main does not contain the loop.",
      ], [
        { prompt: "add(4, 6) runs a body that sets a = 0 and then returns a + b. What is the value of the call?", answer: "6. The parameters are copies, so a becomes 0 and b stays 6. The return is 0 + 6. The caller sees the assignment only through that returned 6." },
        { prompt: "Why is a method that both prints and returns the sum harder to test than a method that only returns it?", answer: "A test of the method that only returns compares the return with 8, or with 10 for the sum of 1 through 4. A method that also prints forces the test to read the screen, which mixes two jobs." },
      ]),
      lec("l6", "An array is a numbered row", [
        "An array stores several values of one type under one name. int[] a = new int[4] creates 4 ints. Legal indexes are 0, 1, 2, and 3. a[0] = 10 writes the first slot. a.length is 4, so the last legal index is 3. Java checks the index. Reading a[4] stops the program instead of quietly using bytes past the row. You let that stop stand. Slot 4 does not exist.",
        "A scan visits each slot once. Start s at 0 and i at 0. While i < a.length, add a[i], then add 1 to i. With values 1, 2, 3, and 4, the sum is 10, and i ends at 4, which is not a legal index. The test i < a.length keeps the read inside the row. i <= a.length tries index 4 and the program stops. The four numbers share one name. You call that scan the algorithm.",
      ], { kind: "layers", caption: "Four slots in one array.", rows: ["new int[4] creates four slots", "Index 0 holds the first", "Index 3 is the last legal", "a.length is 4"] }, "Sum the row 1, 2, 3, 4", [
        "Store 1, 2, 3, and 4 in a. Set s = 0 and i = 0.",
        "While i < 4, add a[i] to s and add 1 to i. The indexes you read are 0, 1, 2, and 3.",
        "s is 10 and i is 4. You do not read a[4]. The length told you where to stop.",
      ], [
        { prompt: "a.length is 4. Which indexes are legal, and what does Java do if you read a[4]?", answer: "Legal indexes are 0, 1, 2, and 3, and the last is a.length - 1. Reading a[4] stops the program. Java checks the index." },
        { prompt: "The slots hold 1, 2, 3, and 4. The loop adds a[i] while i < a.length, and s starts at 0. What is s?", answer: "s is 10. The loop reads four slots and stops when i becomes 4, without reading past the end." },
      ]),
      lec("l7", "A class groups fields and one action", [
        "A class is a plan for objects. class Counter { int value; } says each Counter has its own int. new Counter() creates one object. c.value = 4 stores 4 in c, not in the class. A second object d has a different value slot. Changing c does not change d. That separate field is the mechanism. Without the class you would pass loose ints and hope you remember which ones form a pair.",
        "A method acts on one object. int bump() { value = value + 1; return value; } uses the field of the object you called. If c.value is 4, c.bump() stores 5 and returns 5. d stays as it was if you did not call bump on d. You construct, then you call. A call before new has no object, so there is no slot holding 4. One class and one returned int are enough here.",
      ], { kind: "pair", caption: "Two objects, one class.", leftTitle: "Object c", rightTitle: "Object d", left: ["Its own value slot", "Starts at 4", "bump returns 5"], right: ["A different value slot", "Stays at its own number", "Not changed by c.bump"] }, "Bump one counter from 4 to 5", [
        "Counter c = new Counter(); then c.value = 4. Counter d = new Counter(); then d.value = 1.",
        "int got = c.bump(). The method adds 1 to c.value and returns 5. got is 5.",
        "d.value is still 1. The call named c, so only c's field was updated.",
      ], [
        { prompt: "c.value is 4 and d.value is 1. You call c.bump(), which adds 1 and returns the field. What are c.value and d.value afterward?", answer: "c.value is 5, and the return is 5. d.value stays 1, because bump ran on c, and each object has its own field." },
        { prompt: "Why does calling bump require new first?", answer: "bump updates the value field of one object. new creates that object. Without it there is no slot holding 4, and no object to receive the call." },
      ]),
      lec("l8", "You can trace a small Java program", [
        "You can now trace a short Java program by hand. Lines run in order. The int division 7 / 2 stores 3, and && can skip its second test. You can write a loop from 1 to 4 that sums to 10, a method that returns that sum, and a scan of an array of length 4 that stops at a.length. You can put an int in a class, construct one object, and return the updated field.",
        "Check two things before you trust the run. Trace a boolean with real numbers, including one case that takes else, such as n equal to 0. Then trace the loop and write the partial sums 1, 3, 6, and 10. If the method return and your paper disagree, the bug is the bound or the update, not the print. Fix the method. A program you cannot trace on 4 items is not finished, even when it compiles.",
      ], { kind: "layers", caption: "What you can now trace.", rows: ["Lines in main, in order", "A test with one false case", "A loop from 1 to 4", "A return you can recompute"] }, "Sum 1 through 4, then bump a counter", [
        "static int sumThrough4() loops i from 1 to 4, adds i into s, and returns 10.",
        "main stores that return in a Counter field: c.value = sumThrough4(), so the field becomes 10.",
        "c.bump() adds 1 and returns 11. Your paper trace should show 10, then 11, before you look at any printed line.",
      ], [
        { prompt: "A loop uses i from 1 through 4. An array a of length 4 holds 1, 2, 3, and 4. If the body adds a[i] on those i values, which read is illegal, and what is the sum of the four slots at indexes 0 through 3?", answer: "a[4] is illegal. The last legal index is 3, and the loop's last i is 4. The sum of the four slots, read at indexes 0, 1, 2, and 3, is 10." },
        { prompt: "c.value is 4. You wanted d, a second Counter, to stay at 1 while c becomes 5. Which call does that?", answer: "c.bump(). It adds 1 to c's own field, so c.value becomes 5. d.value stays 1 because you did not call bump on d." },
      ]),
    ],
  },
  {
    slug: "csce-709",
    lectures: [
      lec("l1", "Copies, references, and a small main", [
        "You already know statements and functions. A C++ program still starts in main and runs top to bottom. The declaration int n = 4 stores 4. void show(int x) copies 4 into x, so changing x does not change n. void bump(int &x) makes x another name for the caller's slot. bump(n) writes 5 back into n when n started at 4. You pass a copy when the function must not change the caller, and a reference when it must.",
        "cout << n writes the stored 4. cin >> n replaces that slot with the next int from input. You check the stream after the read. If it failed, you stop instead of adding a value you do not have. A main that reads two ints, adds them, and writes the sum is the shell for this course. Later you hide a class, and the memory that class owns, behind that same main.",
      ], { kind: "pair", caption: "Copy versus another name.", leftTitle: "Copy parameter", rightTitle: "Reference parameter", left: ["void show(int x)", "x starts as a copy of 4", "Assigning to x keeps n"], right: ["void bump(int &x)", "x names the caller's slot", "bump(n) stores 5 in n"] }, "Add 1 through 4 by reference", [
        "int s = 0. void add(int &s, int v) executes s = s + v.",
        "Call add(s, 1), then add(s, 2), then add(s, 3), then add(s, 4).",
        "The caller's slot holds 10. A copy parameter would have left that slot at 0.",
      ], [
        { prompt: "n is 4. show takes int x and sets x = 9. bump takes int &x and sets x = 9. What is n after each call?", answer: "After show, n is still 4, because x was a copy. After bump, n is 9, because the reference names the caller's slot." },
        { prompt: "s starts at 0. add takes int &s and does s = s + v. You call it with 1, then 2, then 3, then 4. What is s, and what would the caller's s be if the parameter were a plain int copy?", answer: "s is 10. The partial sums are 1, then 3, then 6, then 10, because each call updates the same slot. A copy parameter would leave the caller's s at 0." },
      ]),
      lec("l2", "const, overloads, and a returned sum", [
        "const on a reference is a promise the compiler checks. int total(const int &a, const int &b) may read a and b and may not assign to them. total(3, 5) returns 8. You use const when the job is to look, not to update. Drop const only on a parameter the body must change. A body that assigns through a const reference will not compile. That refusal is the mechanism. A comment is a weaker guard.",
        "Two functions may share a name when the parameter types differ. int add(int a, int b) and double add(double a, double b) are overloads. add(2, 3) runs the int version and returns 5. add(2.5, 1.5) runs the double version and returns 4.0. The compiler picks from the argument types. It does not guess. If you pass two ints, you get the int body. Adding 7 and 2 that way returns 9.",
      ], { kind: "pair", caption: "One name, two bodies.", leftTitle: "int add", rightTitle: "double add", left: ["Two int parameters", "add(2, 3) returns 5", "7 and 2 return 9"], right: ["Two double parameters", "2.5 and 1.5 return 4.0", "The fraction stays"] }, "A const parameter bounds a sum", [
        "int sum_to(const int &n) is called with n equal to 4. The body may read n and may not assign to it.",
        "The loop runs i from 1 through n, adding i. The return is 10.",
        "The caller's 4 is unchanged. You did not need a writable reference, because the job was to look at n and return a new int.",
      ], [
        { prompt: "total takes two const int references and returns a + b. Can the body set a = 0 before returning, and what is total(3, 5)?", answer: "No. const forbids the assignment, so that body does not compile. total(3, 5) returns 8." },
        { prompt: "You have int add(int, int) and double add(double, double). What do add(2, 3) and add(2.5, 1.5) return?", answer: "add(2, 3) returns 5 from the int overload. add(2.5, 1.5) returns 4.0 from the double overload. The argument types pick the body." },
      ]),
      lec("l3", "A class, a constructor, and one method", [
        "A class packs fields and the methods that use them. Each Rect holds two ints, w and h, plus a method area. Rect r(3, 4) runs the constructor, which copies 3 into w and 4 into h. r.area() returns 12. The call uses that object's fields. You put w and h in the private section so other code cannot write r.w. const on area promises not to change the two ints, and a write inside area will not compile.",
        "Define the body as int Rect::area() const { return w * h; }. Rect:: names the class. You still call r.area(), not a free function. A free function would take the Rect as an extra argument. Keeping area on the class ties the two fields to the one operation. Callers that hold r do not rebuild the product. 3 times 4 is 12, and that product is the whole job of area. The constructor is where those fields are set.",
      ], { kind: "layers", caption: "One Rect, private fields.", rows: ["Constructor stores w and h", "private hides both ints", "area is a const method", "The call reads only that Rect"] }, "A 3 by 4 rectangle", [
        "Rect r(3, 4) stores w = 3 and h = 4 in r.",
        "r.area() returns w * h, which is 12. const means the call leaves 3 and 4 in place.",
        "Rect s(1, 1) has its own fields. s.area() returns 1. Calling it does not change r.",
      ], [
        { prompt: "r is constructed as Rect(3, 4). What does r.area() return, and can that const method set w to 0?", answer: "It returns 12, because 3 * 4 = 12. It cannot set w to 0. const on the method rejects a write to the fields." },
        { prompt: "Why can main not assign r.w = 9 after Rect r(3, 4) if w is private?", answer: "private allows only Rect's own methods to name w. main must use the constructor or a method. The stored width stays 3 unless a method of Rect changes it." },
      ]),
      lec("l4", "new in the constructor, delete in the destructor", [
        "A constructor runs when the object is created, and it is where you take a resource. Bag::Bag() sets n = 4 and data = new int[4]. Those 4 ints live on the heap, and data holds their address. The destructor ~Bag() runs when the Bag dies and executes delete[] data. That pair is the mechanism. If you allocate in the constructor and skip the destructor, the 4 ints leak when the Bag leaves scope.",
        "You do not call the destructor by hand for a local Bag. Leaving the block destroys it, and ~Bag() runs. new int[4] is matched with delete[], not with delete. The brackets say this is an array of 4, not one int. After delete[] you do not use data. A Rect of two plain ints needs no new and no delete. You add this resource only when the object owns memory the language will not free for you.",
      ], { kind: "flow", caption: "A Bag owns four ints.", steps: ["Constructor runs new int[4]", "Methods use the block", "Scope ends, destructor runs", "delete[] frees that block"] }, "Fill a Bag and let it die", [
        "Bag b; the constructor sets n = 4 and allocates four ints. Suppose you then store 1, 2, 3, and 4.",
        "A method sum walks indexes 0, 1, 2, and 3 and returns 10. It does not allocate a second block.",
        "When b leaves the block, ~Bag() runs delete[] data once. You do not also call delete on that address.",
      ], [
        { prompt: "Bag::Bag() does new int[4], and the class has no destructor. What is wrong when a local Bag leaves its block?", answer: "The 4 ints stay allocated. Nobody calls delete[]. The constructor acquired a resource and nothing released it, so the block leaks." },
        { prompt: "The constructor used new int[4]. Which form belongs in the destructor, delete or delete[]?", answer: "delete[]. The brackets match an array new. delete without brackets is for a single object, not for the array of 4 ints." },
      ]),
      lec("l5", "A copied pointer is a double free", [
        "If the compiler copies a Bag, it copies the pointer, not the 4 ints. Two Bags then hold one address. Each destructor runs delete[], so the second free gives that address back again. The fix is a copy you write: allocate a fresh int[4] and copy the four values. Each Bag then frees only its own block. You now have two heap arrays. The pointer copy is the mechanism that caused the double free.",
        "You can forbid the copy when a Bag must stay unique. Deleting the copy constructor means a second Bag cannot be made from the first, so the shared pointer never appears. Pick one rule. Either each copy allocates its own 4 ints, or copying is not allowed. A warning in a comment is not a rule. If two objects exist, two destructors run, and each frees the pointer it holds.",
      ], { kind: "pair", caption: "Two ways to copy a Bag.", leftTitle: "Compiler copy", rightTitle: "Copy you write", left: ["Copies the pointer only", "Both free one address", "The second free is wrong"], right: ["Allocates a new int[4]", "Copies the four values", "Each frees its own block"] }, "Hand a Bag to a function by value", [
        "b holds 1, 2, 3, 4 in a block from new int[4]. void show(Bag x) receives x by value.",
        "The compiler copy makes x.data equal b.data. Both names are one address.",
        "When show returns, ~Bag() runs for x and frees that address. When b dies, the second delete[] frees it again. A deep copy would have given x its own four ints.",
      ], [
        { prompt: "Two Bags hold the same data pointer because one was copied from the other by the compiler. What happens when both destructors run?", answer: "Both call delete[] on one address. The first free returns the block. The second free returns that same address again, which is a double free." },
        { prompt: "You want show(Bag x) to be safe, and x should see the four values 1, 2, 3, and 4. What must the copy do?", answer: "Allocate a new int[4] and copy the four values into it. x then frees its own block, and the caller frees a different block. The sum of those values is still 10." },
      ]),
      lec("l6", "A vector owns the array for you", [
        "A vector<int> grows a heap array and frees it in its destructor. Push 1, then 2, then 3, then 4, and size() is 4. You read indexes 0 through 3. Naming index 4 steps past those elements, and the bracket operator does not check. You do not write delete. The destructor does. A Bag you wrote by hand is the same 4 ints with the free left for you to get right.",
        "A loop from i = 0 while i < size() adds each element into s. The sum of 1, 2, 3, and 4 is 10. size() is the bound. Passing the vector by value copies every element, all 4 of them. Passing a const reference looks at them and cannot write. You choose the reference when the function should not own a second array. For this sum, the const reference is the match.",
      ], { kind: "pipeline", caption: "Sum a vector of four.", stages: ["Push 1, 2, 3, and 4", "size() reports 4", "Add indexes 0 through 3", "Destructor frees the block"] }, "Return 10 without a manual delete", [
        "vector<int> v; push 1, then 2, then 3, then 4. v.size() is 4.",
        "int total(const vector<int> &v) sets s = 0 and adds v[0] through v[3]. The return is 10. const blocks a write.",
        "When v leaves scope, its destructor frees the heap array. total did not copy the four ints and does not delete them.",
      ], [
        { prompt: "v holds 1, 2, 3, and 4. A loop adds v[i] while i < v.size(), and s starts at 0. What is s, and does your code call delete?", answer: "s is 10. You do not call delete. size() is 4, so the indexes are 0, 1, 2, and 3, and the vector destructor frees the block." },
        { prompt: "total only reads the vector. Why pass const vector<int> & instead of vector<int> by value?", answer: "A by-value parameter copies all 4 elements into a second array. The const reference looks at the caller's vector and cannot assign to it. The sum does not need a second owner." },
      ]),
      lec("l7", "Private data and a checked index", [
        "An invariant is a fact you keep true after every public method. For a Bag, n is 4, data points at 4 ints, and no index at or past 4 is read. The constructor makes that true. get(i) returns data[i] only when i is at least 0 and less than n. When i is 4, you refuse. Callers cannot break the row just by asking. One checked method is the mechanism, instead of a test copied into every caller.",
        "You test the invariant on a tiny bag, not with a speech. Store 1, 2, 3, and 4, and check that sum returns 10. Then call get(4) and check that it refuses. If the sum is 10 but get(4) still reads, the bound is missing. Public methods are the door. A public pointer lets a caller write index 4 and skip your test. Keep data private so the 4-slot rule stays in your code.",
      ], { kind: "flow", caption: "Check the index, then read.", steps: ["Caller asks for index i", "Reject i outside 0 to 3", "Return data[i] if it fits", "Sum of the four is 10"] }, "get(2) versus get(4)", [
        "The bag holds 1, 2, 3, 4, and n is 4. get(2) sees 2 < 4 and returns 3, the value at index 2.",
        "get(4) sees 4 is not less than n. It refuses and does not read data[4].",
        "sum still walks only 0, 1, 2, and 3 and returns 10. The refusal did not change the stored ints.",
      ], [
        { prompt: "n is 4 and the slots are 1, 2, 3, 4. What does a checked get(2) return, and what does get(4) do?", answer: "get(2) returns 3, the int at index 2. get(4) refuses, because 4 is not less than n. It does not read past the last legal index, which is 3." },
        { prompt: "Why keep the data pointer private if get already checks the index?", answer: "A public pointer lets a caller write index 4 and skip get. Private data forces that write through your method, so the 4-slot rule still runs." },
      ]),
      lec("l8", "A class that owns one resource", [
        "You can now build a small C++ type that owns one resource. You pick a copy or a reference at the call. You mark look-only parameters const. You write a class, a constructor that does new int[4], and a destructor that does delete[]. You either copy those 4 ints into a new block or you forbid the copy, so two objects never free one address. You can also say the invariant: private data, n slots, indexes below n.",
        "Before you call the type done, run one object out of a block and see the destructor fire once. Store 1, 2, 3, and 4, and check the sum is 10. Then copy the object, or try to, and name the ownership rule you picked. If both destructors would free the same address, the copy is wrong. Fix the copy or forbid it. A class you cannot explain at 4 elements is not finished.",
      ], { kind: "layers", caption: "What you can now build.", rows: ["A class with private fields", "new in the constructor", "delete[] in the destructor", "A copy rule you can name"] }, "One Bag, summed, then destroyed", [
        "Bag b's constructor does new int[4] and you store 1, 2, 3, and 4. sum returns 10, reading indexes 0 through 3.",
        "Pass b to int total(const Bag &x). The const reference does not copy the pointer and does not allocate.",
        "When b leaves the block, one destructor runs delete[] once. There is no second owner, so nothing frees that address again.",
      ], [
        { prompt: "A Bag is constructed with new int[4] holding 1, 2, 3, and 4. You pass it by value into a function that returns the sum, and both the parameter and the caller are later destroyed. What does the compiler's copy do, and what is the sum if the copy allocates its own four ints?", answer: "The compiler copies the pointer, so both destructors call delete[] on one address and the block is freed twice. A copy that allocates its own int[4] and copies the values returns 10, and each destructor frees only its own block." },
        { prompt: "total only reads a Bag. Should the parameter be Bag by value, or const Bag &? What does the sum of 1, 2, 3, and 4 equal either way, if ownership is safe?", answer: "Use const Bag &. By value copies the pointer unless you wrote a deep copy. The const reference does not allocate and cannot change the Bag. The sum is 10." },
      ]),
    ],
  },
];
