/** 12 items */
type State = string;

function estimate(state: State) {
  return (
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
    "         B  -  0        \n";
  const indexes = "0123456789AB";
  for (let i = 0; i < indexes.length; i++) {
    pattern = pattern.replace(indexes[i], parseInt(state[i]) === 0 ? "*" : "@");
  }
  return pattern;
}


function insertSorted<T>(arr: T[], newValue: T, weight: (T) => number) {
    let minIndexWhichIsBigger = 0;

    const newValueWeight = weight(newValue);
    while (minIndexWhichIsBigger < arr.length) {
        if (newValueWeight < weight(arr[minIndexWhichIsBigger])) {
            break;
        }
        minIndexWhichIsBigger++;
    }
    arr.splice(minIndexWhichIsBigger, 0, newValue)
}


function test() {
    const state = "101010101010";
    if (estimate(state) !== 4) {
      throw new Error("Not expected");
    }
    for (const i of [0, 1, 2] as const) {
      if (rotate(rotate(state, i, true), i, false) !== state) {
        throw new Error("Not expected");
      }
    }

    
    const assert = (x: number[], y:number[]) => {
        if (x.join('-') != y.join(' ')) {
            throw new Error(`Assertion error: ${x.join('-')} ${y.join('-')}`)
        }
    }

    const assertInsertSorted = (target: number[], value: number, expected: number[]) =>{
        const copy = [...target];
        insertSorted(copy, value, x => x);
        if (copy.join('-') != expected.join('-')) {
            throw new Error(`Assertion error: ${copy.join('-')} ${expected.join('-')}`)
        }
    }

    assertInsertSorted([], 2, [2]);
    assertInsertSorted([5], 0, [0,5]);
    assertInsertSorted([1], 5, [1,5]);    
    assertInsertSorted([3,6], 1, [1,3,6]);
    assertInsertSorted([3,6], 3, [3,3,6]);
    assertInsertSorted([3,6], 5, [3,5,6]);
    assertInsertSorted([3,6], 9, [3,6,9]);
    
    
  }

function solve(state) {
  const finalState = "001001101110";

  console.info(`Solving state` + draw(state));
  
  const closed = new Set<State>();
  const opened: {
      state: State,
      estimateWeight: number,
      knownPathWeight: number
  }[] = [{
      state: state,
      estimateWeight: estimate(state),
      knownPathWeight: 0
  }];
  while (opened.length > 0) {
        const current = opened.shift();
        console.info(`Picking up state e=${current.estimateWeight} p=${current.knownPathWeight} f=${
            current.estimateWeight + current.knownPathWeight
        }`);
        if (current.state === finalState) {
            console.info(`Found a final state!`)
        };

        closed.add(current.state);

        const neighbours = [
            rotate(current.state, 0, true),
            rotate(current.state, 0, false),
            rotate(current.state, 1, true),
            rotate(current.state, 1, false),
            rotate(current.state, 2, true),
            rotate(current.state, 2, false),
        ];
        for (const neighbour of neighbours) {
            if(closed.has(neighbour)) {
                continue
            };
            const STEP_PATH_SIZE = 1;
            const node = {
                state: neighbour,
                estimateWeight: estimate(neighbour),
                knownPathWeight: current.knownPathWeight + STEP_PATH_SIZE
            };
            
        }
  }

  console.info("LOL, no solution")
}

test();

const DEMO_STATE = "101010101010";
solve(DEMO_STATE);
