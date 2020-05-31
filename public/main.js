/**
 * Returns estimated distance, from 0 to 6
 * (How many dots are left)
 */
function estimate(state) {
    return 6 - (parseInt(state[2]) +
        parseInt(state[5]) +
        parseInt(state[6]) +
        parseInt(state[8]) +
        parseInt(state[9]) +
        parseInt(state[10]));
}
function rotate(state, circleId, direction) {
    var circles = [
        [1, 2, 6, 9, 8, 4],
        [2, 3, 7, 10, 9, 5],
        [5, 6, 10, 0, 11, 8],
    ];
    var circle = circles[circleId];
    var newState = state.split("");
    if (direction) {
        var tmp = newState[circle[0]];
        for (var i = 0; i < 5; i++) {
            newState[circle[i]] = newState[circle[i + 1]];
        }
        newState[circle[5]] = tmp;
    }
    else {
        var tmp = newState[circle[5]];
        for (var i = 5; i > 0; i--) {
            newState[circle[i]] = newState[circle[i - 1]];
        }
        newState[circle[0]] = tmp;
    }
    return newState.join("");
}
function draw(state) {
    var pattern = "\n" +
        "      1  -  2  -  3     \n" +
        "    /     /   \\    \\  \n" +
        "   4     5  -  6    7   \n" +
        "    \\   / \\   / \\  / \n" +
        "      8  -  9  -  A     \n" +
        "       \\         /     \n" +
        "         B  -  0        ";
    var indexes = "0123456789AB";
    for (var i = 0; i < indexes.length; i++) {
        pattern = pattern.replace(indexes[i], parseInt(state[i]) === 0 ? "*" : "@");
    }
    return pattern;
}
/**
 * Some health-checks
 */
function test() {
    var state = "101010101010";
    if (estimate(state) !== 2) {
        throw new Error("Not expected");
    }
    for (var _i = 0, _a = [0, 1, 2]; _i < _a.length; _i++) {
        var i = _a[_i];
        if (rotate(rotate(state, i, true), i, false) !== state) {
            throw new Error("Not expected");
        }
    }
}
function solve(initialState) {
    var finalState = "001001101110";
    console.info("Solving state " + initialState + draw(initialState));
    var iterationsCount = 0;
    // State is added into `closed` when it have
    // minimum `f` from current `opened`
    var closed = new Set();
    // Candidates for traversal
    var opened = [
        {
            state: initialState,
            estimateWeight: estimate(initialState),
            knownPathWeight: 0
        },
    ];
    // To construct return path
    var bestFrom = new Map();
    var _loop_1 = function () {
        // Get state with lowest f
        var current = opened.reduce(function (acc, current) {
            return acc.estimateWeight + acc.knownPathWeight <
                current.estimateWeight + current.knownPathWeight
                ? acc
                : current;
        });
        opened.splice(opened.findIndex(function (x) { return x.state === current.state; }), 1);
        console.info("Picking up opened state " + current.state + " estimation=" + current.estimateWeight + " pathLen=" + current.knownPathWeight + " priority=f=" + (current.estimateWeight + current.knownPathWeight) + draw(current.state));
        if (current.state === finalState) {
            console.info("Found a final state in " + iterationsCount + " iterations!");
            console.info("========================");
            var solutionJumpsCount = 0;
            var cursor = finalState;
            while (cursor) {
                solutionJumpsCount++;
                //console.info(draw(cursor));
                console.info(cursor);
                cursor = bestFrom.get(cursor);
            }
            console.info("Need " + solutionJumpsCount + " moves");
            return { value: void 0 };
        }
        // We can add into `closed` in the end of the main loop
        // But what if we have edge which returns to same state? Then it will be an infinite loop 
        closed.add(current.state);
        iterationsCount++;
        var neighbors = [
            rotate(current.state, 0, true),
            rotate(current.state, 0, false),
            rotate(current.state, 1, true),
            rotate(current.state, 1, false),
            rotate(current.state, 2, true),
            rotate(current.state, 2, false),
        ];
        var _loop_2 = function (neighbor) {
            if (closed.has(neighbor)) {
                console.info("  Neighbor " + neighbor + " already closed");
                return "continue";
            }
            var STEP_PATH_SIZE = 1;
            var newNode = {
                state: neighbor,
                estimateWeight: estimate(neighbor),
                knownPathWeight: current.knownPathWeight + STEP_PATH_SIZE
            };
            var currentOpenedNode = opened.find(function (openedNode) { return openedNode.state === neighbor; });
            if (!currentOpenedNode) {
                console.info("  Neighbor " + neighbor + " is added to opened e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight));
                opened.push(newNode);
                bestFrom.set(neighbor, current.state);
            }
            else {
                if (currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight >
                    newNode.estimateWeight + newNode.knownPathWeight) {
                    console.info("  Neighbor " + neighbor + " was is opened, but replaced with e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight) + " " +
                        ("old_e=" + currentOpenedNode.estimateWeight + " old_p=" + currentOpenedNode.knownPathWeight + " old_f=" + (currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight)));
                    opened.splice(opened.indexOf(currentOpenedNode), 1);
                    opened.push(newNode);
                    bestFrom.set(neighbor, current.state);
                }
                else {
                    console.info("  Neighbor " + neighbor + " is already opened e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight) + ", no update");
                }
            }
        };
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var neighbor = neighbors_1[_i];
            _loop_2(neighbor);
        }
        console.info("");
    };
    while (opened.length > 0) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    console.info("LOL, no solution");
}
function bruteForceTotalSolution() {
    var seen = new Set();
    var initialState = "001001101110";
    function go(state) {
        if (seen.has(state)) {
            return;
        }
        seen.add(state);
        var neighbours = [
            rotate(state, 0, true),
            rotate(state, 0, false),
            rotate(state, 1, true),
            rotate(state, 1, false),
            rotate(state, 2, true),
            rotate(state, 2, false),
        ];
        for (var _i = 0, neighbours_1 = neighbours; _i < neighbours_1.length; _i++) {
            var neighbour = neighbours_1[_i];
            go(neighbour);
        }
    }
    go(initialState);
    console.info("Total states = " + seen.size);
}
test();
//bruteForceTotalSolution();
var DEMO_STATE = "101010101010";
solve(DEMO_STATE);
