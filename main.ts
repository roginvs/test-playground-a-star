/**
 * string with 12 characters 0 or 1
 */
type State = string;

function log(s: string) {
  const e = document.getElementById("logs");
  if (e) {
    const line = document.createElement("div");
    line.innerHTML = s;
    e.appendChild(line);
  }
}

/**
 * Returns estimated distance, from 0 to 6
 * (How many dots are left)
 */
function estimate(state: State) {
  return (
    6 -
    (parseInt(state[2]) +
      parseInt(state[5]) +
      parseInt(state[6]) +
      parseInt(state[8]) +
      parseInt(state[9]) +
      parseInt(state[10]))
  );
}

function rotate(state: State, circleId: 0 | 1 | 2, direction: boolean) {
  const circles = [
    [1, 2, 6, 9, 8, 4],
    [2, 3, 7, 10, 9, 5],
    [5, 6, 10, 0, 11, 8],
  ];
  const circle = circles[circleId];

  const newState = state.split("");
  if (direction) {
    const tmp = newState[circle[0]];
    for (let i = 0; i < 5; i++) {
      newState[circle[i]] = newState[circle[i + 1]];
    }
    newState[circle[5]] = tmp;
  } else {
    const tmp = newState[circle[5]];
    for (let i = 5; i > 0; i--) {
      newState[circle[i]] = newState[circle[i - 1]];
    }
    newState[circle[0]] = tmp;
  }
  return newState.join("");
}

function draw(state: State) {
  let pattern =
    "\n" +
    "      1  -  2  -  3     \n" +
    "    /     /   \\    \\  \n" +
    "   4     5  -  6    7   \n" +
    "    \\   / \\   / \\  / \n" +
    "      8  -  9  -  A     \n" +
    "       \\         /     \n" +
    "         B  -  0        ";
  const indexes = "0123456789AB";
  for (let i = 0; i < indexes.length; i++) {
    pattern = pattern.replace(indexes[i], parseInt(state[i]) === 0 ? "*" : "@");
  }
  return pattern;
}

/**
 * Some health-checks
 */
function test() {
  const state = "101010101010";
  if (estimate(state) !== 2) {
    throw new Error("Not expected");
  }
  for (const i of [0, 1, 2] as const) {
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
  if (initialState.split("").filter((x) => x !== "0" && x !== "1").length > 0) {
    log("Wrong input symbols, only 0 or 1 are allowed!");
    return;
  }

  const finalState = "001001101110";

  log(`Solving state ${initialState}` + draw(initialState));

  let iterationsCount = 0;

  // State is added into `closed` when it have
  // minimum `f` from current `opened`
  const closed = new Set<State>();

  // Candidates for traversal
  const opened: {
    state: State;
    estimateWeight: number;
    knownPathWeight: number;
  }[] = [
    {
      state: initialState,
      estimateWeight: estimate(initialState),
      knownPathWeight: 0,
    },
  ];

  // To construct return path
  const bestFrom = new Map<State, State>();

  while (opened.length > 0) {
    // Get state with lowest f
    const current = opened.reduce((acc, current) =>
      acc.estimateWeight + acc.knownPathWeight <
      current.estimateWeight + current.knownPathWeight
        ? acc
        : current
    );
    opened.splice(
      opened.findIndex((x) => x.state === current.state),
      1
    );

    log(
      `Picking up opened state ${current.state} estimation=${
        current.estimateWeight
      } pathLen=${current.knownPathWeight} priority=f=${
        current.estimateWeight + current.knownPathWeight
      }` + draw(current.state)
    );
    if (current.state === finalState) {
      log(`Found a final state in ${iterationsCount} iterations!`);
      log(`========================`);
      let solutionJumpsCount = 0;
      let cursor = finalState;
      while (cursor) {
        solutionJumpsCount++;
        //log(draw(cursor));
        log(cursor);
        cursor = bestFrom.get(cursor);
      }
      log(`Need ${solutionJumpsCount} moves`);
      return;
    }

    // We can add into `closed` in the end of the main loop
    // But what if we have edge which returns to same state? Then it will be an infinite loop
    closed.add(current.state);

    iterationsCount++;

    const neighbors = [
      rotate(current.state, 0, true),
      rotate(current.state, 0, false),
      rotate(current.state, 1, true),
      rotate(current.state, 1, false),
      rotate(current.state, 2, true),
      rotate(current.state, 2, false),
    ];
    for (const neighbor of neighbors) {
      if (closed.has(neighbor)) {
        log(`  Neighbor ${neighbor} already closed`);
        continue;
      }
      const STEP_PATH_SIZE = 1;
      const newNode = {
        state: neighbor,
        estimateWeight: estimate(neighbor),
        knownPathWeight: current.knownPathWeight + STEP_PATH_SIZE,
      };
      const currentOpenedNode = opened.find(
        (openedNode) => openedNode.state === neighbor
      );

      if (!currentOpenedNode) {
        log(
          `  Neighbor ${neighbor} is added to opened e=${
            newNode.estimateWeight
          } p=${newNode.knownPathWeight} f=${
            newNode.estimateWeight + newNode.knownPathWeight
          }`
        );
        opened.push(newNode);
        bestFrom.set(neighbor, current.state);
      } else {
        if (
          currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight >
          newNode.estimateWeight + newNode.knownPathWeight
        ) {
          log(
            `  Neighbor ${neighbor} was is opened, but replaced with e=${
              newNode.estimateWeight
            } p=${newNode.knownPathWeight} f=${
              newNode.estimateWeight + newNode.knownPathWeight
            } ` +
              `old_e=${currentOpenedNode.estimateWeight} old_p=${
                currentOpenedNode.knownPathWeight
              } old_f=${
                currentOpenedNode.estimateWeight +
                currentOpenedNode.knownPathWeight
              }`
          );

          opened.splice(opened.indexOf(currentOpenedNode), 1);
          opened.push(newNode);
          bestFrom.set(neighbor, current.state);
        } else {
          log(
            `  Neighbor ${neighbor} is already opened e=${
              newNode.estimateWeight
            } p=${newNode.knownPathWeight} f=${
              newNode.estimateWeight + newNode.knownPathWeight
            }, no update`
          );
        }
      }
    }

    log("");
  }

  log("LOL, no solution");
}

function bruteForceTotalSolution() {
  const seen = new Set<State>();
  const initialState = "001001101110";

  function go(state: State) {
    if (seen.has(state)) {
      return;
    }
    seen.add(state);

    const neighbours = [
      rotate(state, 0, true),
      rotate(state, 0, false),
      rotate(state, 1, true),
      rotate(state, 1, false),
      rotate(state, 2, true),
      rotate(state, 2, false),
    ];
    for (const neighbour of neighbours) {
      go(neighbour);
    }
  }
  go(initialState);
  log(`Total states = ${seen.size}`);
}

test();

//bruteForceTotalSolution();

//const DEMO_STATE = "101010101010";
//solve(DEMO_STATE);
setTimeout(() => {
  document.getElementById("go_button")!.onclick = (e) => {
    e.preventDefault();
    document.getElementById("inputs")!.style.display = "none";
    const state: State = (document.getElementById("initial_state") as any)
      .value;
    solve(state);
  };
}, 1);
