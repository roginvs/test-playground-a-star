#include <vector>
#include "./opened_smart.cpp"

template <class State>
struct NeighborInfo
{
    State state;
    unsigned int jump_price;
};

template <class State>
std::vector<State> astar(State initial_state,
                         bool is_final(State state),
                         std::vector<NeighborInfo<State>> get_neighbors(State state),
                         unsigned int estimate(State state))
{
    std::set<State> closed;

    OpenedSet<State> opened;

    std::map<State, State> best_from;

    opened.add_state(initial_state, 0, estimate(initial_state));

    // int max_opened = 0;
    while (opened.size() > 0)
    {
        // if (opened.size() > max_opened)
        //    max_opened = opened.size();

        auto lowest = opened.pop_lowest();
        if (is_final(lowest.state))
        {
            std::vector<State> path;
            path.push_back(lowest.state);
            State cursor = lowest.state;
            while (best_from.count(cursor) > 0)
            {
                cursor = best_from[cursor];
                path.push_back(cursor);
            }
            //std::cout << "max_opened=" << max_opened << "\n";
            return path;
        };

        closed.insert(lowest.state);

        //  debug_step(closed, opened, lowest.state);

        for (auto neighbor : get_neighbors(lowest.state))
        {
            //if (closed.find(neighbor.state) != closed.end())
            if (closed.count(neighbor.state) > 0)
            {
                continue;
            };

            auto neighbor_path = lowest.known_path + neighbor.jump_price;

            auto current_opened = opened.find(neighbor.state);
            if (current_opened == nullptr)
            {
                opened.add_state(neighbor.state, neighbor_path, estimate(neighbor.state));
                best_from[neighbor.state] = lowest.state;
                // best_from.insert(std::pair<State, State>(neighbor.state, lowest.state));
            }
            else if (current_opened->known_path > neighbor_path)
            {
                opened.update_state_known_length(neighbor.state, neighbor_path);
                best_from[neighbor.state] = lowest.state;
                // best_from.erase(neighbor.state);
                // best_from.insert(std::pair<State, State>(neighbor.state, lowest.state));
            }
            else
            {
                // do nothing;
            }
        }
    };

    std::vector<State> empty_path;
    return empty_path;
};

// ====== demo =====
/*

clang++ astar.func.cpp -std=c++14 -o astar.func.bin && ./astar.func.bin

*/

class State
{
public:
    int x;
    int y;

    friend bool operator==(const State &a, const State &b)
    {
        return a.x == b.x && a.y == b.y;
    };

    friend bool operator<(const State &a, const State &b)
    {
        return a.x == b.x ? a.y < b.y : a.x < b.x;
    }
};

#include <chrono>
#include <cmath>

const int MAX_X = 200;
const int MAX_Y = 40;

const State final_state = {MAX_X - 20, MAX_Y / 2};

std::set<State> borders;

int main(int argc, char *argv[])
{
    int start_x;
    int start_y;
    if (argc == 3)
    {
        start_x = std::stoi(argv[1]);
        start_y = std::stoi(argv[2]);
    }
    else
    {
        start_x = 0;
        start_y = 0;
    }

    std::cout << "Starting at " << start_x << "," << start_y << "\n";

    for (int i = 1; i < 20; i++)
    {
        State b = {10, i};
        borders.emplace(b);
    }
    for (int i = 10; i < 15; i++)
    {
        State b = {i, 10};
        borders.emplace(b);
    }
    for (int i = 5; i < 27; i++)
    {
        State b = {170, i};
        borders.emplace(b);
    }
    for (int i = 170; i < 185; i++)
    {
        State b = {i, 5};
        borders.emplace(b);
    }

    auto t1 = std::chrono::high_resolution_clock::now();

    auto route = astar<State>(
        {start_x, start_y}, [](State state) -> bool { return state == final_state; }

        ,

        [](auto state) -> std::vector<NeighborInfo<State>> {
            
             std::vector<NeighborInfo<State>> neighbors;
        neighbors.reserve(8);

        if (state.x > 0 && borders.count({state.x - 1, state.y}) == 0)
        {
            neighbors.push_back({{state.x - 1, state.y}, 10});
        };
        if (state.y > 0 && borders.count({state.x, state.y - 1}) == 0)
        {
            neighbors.push_back({{state.x, state.y - 1}, 10});
        };
        if (state.x < MAX_X && borders.count({state.x + 1, state.y}) == 0)
        {
            neighbors.push_back({{state.x + 1, state.y}, 10});
        };
        if (state.y < MAX_Y && borders.count({state.x, state.y + 1}) == 0)
        {
            neighbors.push_back({{state.x, state.y + 1}, 10});
        };
        if (state.x > 0 && state.y > 0 && borders.count({state.x - 1, state.y - 1}) == 0)
        {
            neighbors.push_back({{state.x - 1, state.y - 1}, 15});
        };
        if (state.x > 0 && state.y < MAX_Y && borders.count({state.x - 1, state.y + 1}) == 0)
        {
            neighbors.push_back({{state.x - 1, state.y + 1}, 15});
        };
        if (state.x < MAX_X && state.y < MAX_Y && borders.count({state.x + 1, state.y + 1}) == 0)
        {
            neighbors.push_back({{state.x + 1, state.y + 1}, 15});
        };
        if (state.x < MAX_X && state.y > 0 && borders.count({state.x + 1, state.y - 1}) == 0)
        {
            neighbors.push_back({{state.x + 1, state.y - 1}, 15});
        };

        return neighbors; },

        [](auto state) -> unsigned int { return std::sqrt(std::pow(abs(state.x - final_state.x), 2) +
                                                          std::pow(abs(state.y - final_state.y), 2)) *
                                                10; }

    );

    auto t2 = std::chrono::high_resolution_clock::now();
    std::chrono::duration<long long, std::ratio<1, 1000000000>> time_span = t2 - t1;
    std::cout << "\nIt took me " << time_span.count() / 1000 << " micro.\n";

    std::cout << "Path len=" << route.size() << "\n";

    return 0;
};