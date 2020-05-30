
type Ball = 1 | 0
/** 12 items */
type State = Ball[];

function estimate(state: State) {
    return state[2] + state[5] + state[6] + state[8] + state[9] + state[10]
}

function rotate(state: State, circleId: 0 | 1 | 2, direction: boolean) {
    const circles = [
        [1,2,6,9,8,4],
        [2,3,7,10,9,5],
        [5,6,10,0,11,8]
    ];
    const circle = circles[circleId];

    const newState = [...state];
    if (direction) {        
        const tmp = newState[circle[0]];
        for (let i = 0; i < 5; i++) {
            newState[circle[i]] = newState[circle[i+1]];            
        }
        newState[circle[5]] = tmp;
    } else {
        const tmp = newState[circle[5]];
        for (let i = 5; i > 0; i--) {
            newState[circle[i]] = newState[circle[i-1]];            
        }
        newState[circle[0]] = tmp;
    }
    return newState;
}

function draw(state: State) {
    let pattern = ""+                                      
"      1  -  2  -  3     \n" +
"    /     /   \\    \\  \n" +
"   4     5  -  6    7   \n" +
"    \\   / \\   / \\  / \n" +
"      8  -  9  -  A     \n" +
"       \\         /     \n" +
"         B  -  0        \n";
   const indexes = '0123456789AB';
   for (let i = 0; i < indexes.length; i++) {
       pattern = pattern.replace(indexes[i], state[i] === 0 ? "*" : "@")
   };
   console.info(pattern);
}

function test() {
    const state: State = '101010101010'.split('').map(x => parseInt(x) as 0| 1);
    if (estimate(state) !== 4) {
        throw new Error("Not expected")
    }
    for (const i of [0,1,2] as const) {
        if (rotate(rotate(state, i, true), i, false).join('-') != state.join('-')) {
            throw new Error("Not expected")
        }
    }
    

    console.info(`Initial state`)
    draw(state);
    //draw(rotate(state, 1, true))


}


test();