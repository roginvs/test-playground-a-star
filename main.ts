/** 12 items */
type State = string;

function estimate(state: State) {
  return 6-(
    parseInt(state[2]) +
    parseInt(state[5]) +
    parseInt(state[6]) +
    parseInt(state[8]) +
    parseInt(state[9]) +
    parseInt(state[10])
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

function insertSorted<T>(arr: T[], newValue: T, weight: (T) => number) {
  let targetIndex = 0;

  const newValueWeight = weight(newValue);
  while (targetIndex < arr.length) {
    if (newValueWeight < weight(arr[targetIndex])) {
      break;
    }
    targetIndex++;
  }
  arr.splice(targetIndex, 0, newValue);
  return targetIndex;
}

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

  const assert = (x: number[], y: number[]) => {
    if (x.join("-") != y.join(" ")) {
      throw new Error(`Assertion error: ${x.join("-")} ${y.join("-")}`);
    }
  };

  const assertInsertSorted = (
    target: number[],
    value: number,
    expected: number[]
  ) => {
    const copy = [...target];
    insertSorted(copy, value, (x) => x);
    if (copy.join("-") != expected.join("-")) {
      throw new Error(
        `Assertion error: ${copy.join("-")} ${expected.join("-")}`
      );
    }
  };

  assertInsertSorted([], 2, [2]);
  assertInsertSorted([5], 0, [0, 5]);
  assertInsertSorted([1], 5, [1, 5]);
  assertInsertSorted([3, 6], 1, [1, 3, 6]);
  assertInsertSorted([3, 6], 3, [3, 3, 6]);
  assertInsertSorted([3, 6], 5, [3, 5, 6]);
  assertInsertSorted([3, 6], 9, [3, 6, 9]);
}

function solve(initialState) {
  const finalState = "001001101110";

  console.info(`Solving state ${initialState}` + draw(initialState));

  let iterationsCount = 0;

  const closed = new Set<State>();

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

  const bestFrom = new Map<State, State>();

  while (opened.length > 0) {
    const current = opened.reduce((acc, current) =>
      acc.estimateWeight + acc.knownPathWeight <
      current.estimateWeight + current.knownPathWeight
        ? acc
        : current
    );
   
    opened.splice(opened.findIndex(x => x.state ===current.state));

    console.info(
      `Picking up opened state ${current.state} estimation=${current.estimateWeight} pathLen=${
        current.knownPathWeight
      } priority=f=${current.estimateWeight + current.knownPathWeight}` +draw(current.state)
    );
    if (current.state === finalState) {
      console.info(`Found a final state in ${iterationsCount} iterations!`);
      console.info(`========================`);
      let cursor = finalState;
      while (cursor){
        console.info(draw(cursor));
        cursor = bestFrom.get(cursor);        
      }   
      return;
    }

    closed.add(current.state);

    iterationsCount++;

    const neighbours = [
      rotate(current.state, 0, true),
      rotate(current.state, 0, false),
      rotate(current.state, 1, true),
      rotate(current.state, 1, false),
      rotate(current.state, 2, true),
      rotate(current.state, 2, false),
    ];
    for (const neighbour of neighbours) {
      if (closed.has(neighbour)) {
        console.info(`  Neighbour ${neighbour} already closed`);
        continue;
      }
      const STEP_PATH_SIZE = 1;
      const newNode = {
        state: neighbour,
        estimateWeight: estimate(neighbour),
        knownPathWeight: current.knownPathWeight + STEP_PATH_SIZE,
      };
      const currentOpenedNode = opened.find((x) => x.state === neighbour);

      if (!currentOpenedNode) {
        console.info(`  Neighbor ${neighbour} is added to opened e=${newNode.estimateWeight} p=${
            newNode.knownPathWeight
          } f=${newNode.estimateWeight + newNode.knownPathWeight}`);
        opened.push(newNode);
        bestFrom.set(neighbour, current.state);
      } else {
        if (
          currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight >
          newNode.estimateWeight + newNode.knownPathWeight
        ) {
            console.info(`  Neighbor ${neighbour} was is opened, but replaced with e=${newNode.estimateWeight} p=${
                newNode.knownPathWeight
              } f=${newNode.estimateWeight + newNode.knownPathWeight} `+
              `old_e=${currentOpenedNode.estimateWeight} old_p=${
                currentOpenedNode.knownPathWeight
              } old_f=${currentOpenedNode.estimateWeight + currentOpenedNode.knownPathWeight}`);
    
          opened.splice(opened.indexOf(currentOpenedNode));
          opened.push(newNode);
          bestFrom.set(neighbour, current.state);
        } else {
          console.info(`  Neighbor ${neighbour} is already opened e=${newNode.estimateWeight} p=${
            newNode.knownPathWeight
          } f=${newNode.estimateWeight + newNode.knownPathWeight}, no update`);
        }
      }
    }

    console.info("");
  }

  console.info("LOL, no solution");
}

test();

const DEMO_STATE = "101010101010";
solve(DEMO_STATE);
