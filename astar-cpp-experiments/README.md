# A\* with heap and map

This is a c++ implemenation of A* algorithm. Set of opened nodes can be simple linear `opened_naive.cpp` or optimized advanced with heap and map `opened_smart.cpp` 
 
## Results

Naive implementation is faster on every sane maze. Something about 200ms (naive) vs 210ms (optimized).

On bigger mazes when opened have 1000-2000 items optimized OpenedSet wins and gives 9 vs 11 seconds, or 20 vs 30 seconds.

UPDATE:
Using optimization for neighbors with max_x=1000, max_y=400 optimized wins 3.9 seconds vs 6 seconds.
Current max_x/max_y gives: optimized=77-82ms, naive=63-69ms

UPDATE2:
Using `-O3`: x=1000,y=400: naive=3s, smart=1.5s

## Briefly

```js

const closed = new Set();
const opened = new Opened();

opened.add_state(initialState, 0, estimate(initialState));

while opened.length > 0:
  const [currentState, currentKnownLength] = opened.pop_lowest();

  if (currentState == finalState) {
      // OK, found!
  };

  closed.add(currentState);

  for (const [neighborState, jumpPrice] of getNeighbors(currentState)) {
      if (closed.have(neighborState)) {
          continue
      };

      /*
        score = f = g' + h'

        3 cases:
         A. no item in opened
         B. have item in opened, but with lower scope
         C. have item in opened with higher score

         A - add it, set bestFrom map (neighborState <- currentState)
         B - replace it, update bestFrom map (neighborState <- currentState)
         C - do nothing

      */

      openedCandidate = opened.find(neighborState);
      if (!openedCandidate){
          // caseA
         opened.add_state(neighborState, currentKnownLength + jumpPrice, estimate(neighborState));

      } else if (openedCandidate.known_path_len > jumpPrice + currentState.known_path_len ) {
          // case B
          opened.update_state_known_length(openedCandidate, ... )
      } else {
          // do nothing, case C
      }



  }




```
