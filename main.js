var IS_NODE = typeof document === "undefined";
function log(s) {
    if (IS_NODE) {
        console.info(s);
        return;
    }
    var e = document.getElementById("logs");
    if (e) {
        var line = document.createElement("div");
        line.innerHTML = s;
        e.appendChild(line);
    }
}
/**
 * Returns estimated distance, from 0 to 6
 * (How many dots are left)
 */
function estimate(state) {
    return (6 -
        (parseInt(state[2]) +
            parseInt(state[5]) +
            parseInt(state[6]) +
            parseInt(state[8]) +
            parseInt(state[9]) +
            parseInt(state[10])));
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
    if (initialState.length !== 12) {
        log("Wrong input length!");
        return;
    }
    if (initialState.split("").filter(function (x) { return x !== "0" && x !== "1"; }).length > 0) {
        log("Wrong input symbols, only 0 or 1 are allowed!");
        return;
    }
    var finalState = "001001101110";
    log("Solving state " + initialState + draw(initialState));
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
        log("Picking up opened state " + current.state + " estimation=" + current.estimateWeight + " pathLen=" + current.knownPathWeight + " priority=f=" + (current.estimateWeight + current.knownPathWeight) + draw(current.state));
        if (current.state === finalState) {
            log(" ");
            log("Found a final state in " + iterationsCount + " iterations!");
            log(" ");
            log("========== A solution: ============");
            var solutionJumpsCount = 0;
            var cursor = finalState;
            while (cursor) {
                log(cursor + " " + draw(cursor));
                cursor = bestFrom.get(cursor);
                if (cursor) {
                    solutionJumpsCount++;
                }
            }
            log("Need " + solutionJumpsCount + " moves");
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
                log("  Neighbor " + neighbor + " already closed");
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
                log("  Neighbor " + neighbor + " is added to opened e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight));
                opened.push(newNode);
                bestFrom.set(neighbor, current.state);
            }
            else {
                if (currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight >
                    newNode.estimateWeight + newNode.knownPathWeight) {
                    log("  Neighbor " + neighbor + " was is opened, but replaced with e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight) + " " +
                        ("old_e=" + currentOpenedNode.estimateWeight + " old_p=" + currentOpenedNode.knownPathWeight + " old_f=" + (currentOpenedNode.estimateWeight +
                            currentOpenedNode.knownPathWeight)));
                    opened.splice(opened.indexOf(currentOpenedNode), 1);
                    opened.push(newNode);
                    bestFrom.set(neighbor, current.state);
                }
                else {
                    log("  Neighbor " + neighbor + " is already opened e=" + newNode.estimateWeight + " p=" + newNode.knownPathWeight + " f=" + (newNode.estimateWeight + newNode.knownPathWeight) + ", no update");
                }
            }
        };
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var neighbor = neighbors_1[_i];
            _loop_2(neighbor);
        }
        log("");
    };
    while (opened.length > 0) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
            return state_1.value;
    }
    log("LOL, no solution");
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
    log("Total states = " + seen.size);
}
test();
//bruteForceTotalSolution();
if (IS_NODE) {
    var DEMO_STATE = "101010101010";
    solve(DEMO_STATE);
}
else {
    setTimeout(function () {
        document.getElementById("go_button").onclick = function (e) {
            e.preventDefault();
            document.getElementById("inputs").style.display = "none";
            var state = document.getElementById("initial_state")
                .value;
            solve(state);
        };
        var updatePreview = function () {
            var hint = "\n" +
                "      1  -  2  -  3     \n" +
                "    /     /   \\    \\  \n" +
                "   4     5  -  6    7   \n" +
                "    \\   / \\   / \\  / \n" +
                "      8  -  9  -  10     \n" +
                "       \\         /     \n" +
                "         11  -  0        ";
            var val = document.getElementById("initial_state").value;
            var preview = document.getElementById("preview");
            if (val.length !== 12) {
                preview.innerHTML =
                    "\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0434\u043B\u0438\u043D\u043D\u0430, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E " + val.length + " \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432, \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F 12" +
                        hint;
                return;
            }
            if (val.split("").filter(function (x) { return x !== "0" && x !== "1"; }).length > 0) {
                preview.innerHTML = "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0441\u0438\u043C\u0432\u043E\u043B\u044B, \u0442\u043E\u043B\u044C\u043A\u043E 0 \u0438 1 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435" + hint;
                return;
            }
            if (val.split("").filter(function (x) { return x === "0"; }).length !== 6 ||
                val.split("").filter(function (x) { return x === "1"; }).length !== 6) {
                preview.innerHTML =
                    "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432, \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043F\u043E 6 \u043A\u0430\u0436\u0434\u043E\u0433\u043E" + hint;
                return;
            }
            preview.innerHTML = draw(val);
        };
        document.getElementById("initial_state").onchange = updatePreview;
        document.getElementById("initial_state").onkeyup = updatePreview;
        updatePreview();
    }, 1);
}
