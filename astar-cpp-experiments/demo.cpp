/*

clang++ demo.cpp -std=c++14 -o demo.bin && ./demo.bin


*/
#include "./astar.cpp"
#include <algorithm>

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

#include <string.h>
#include <cmath>
using State2 = std::string;
class MyDemoPuzzle : public AStar<State>
{
    const int MAX_X = 200;
    const int MAX_Y = 40;

    const State final_state = {MAX_X - 20, MAX_Y / 2};

    std::set<State> borders;

    bool is_final(State state)
    {
        return state == final_state;
    }

    std::vector<NeighborInfo> get_neighbors(State state)
    {
        std::vector<NeighborInfo> neighbors;
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

        return neighbors;
    }

    void debug_step(const std::set<State> &closed, OpenedSet<State> &opened, const State &current_lowest)
    {
        for (int iy = 0; iy < MAX_Y; iy++)
        {
            for (int ix = 0; ix < MAX_X; ix++)
            {
                const State p = {ix, iy};
                if (p == current_lowest)
                {
                    std::cout << "C";
                }
                else if (borders.count(p) > 0)
                {
                    std::cout << "#";
                }
                else if (closed.count(p) > 0)
                {
                    std::cout << "*";
                }
                else if (opened.find(p) != nullptr)
                {
                    std::cout << "o";
                }
                else if (p == final_state)
                {
                    std::cout << "F";
                }
                else
                {
                    std::cout << " ";
                }
            }
            std::cout << " #\n";
        };
        for (int ix = 0; ix < MAX_X + 1; ix++)
        {
            std::cout << "#";
        }
        std::cout << " o=" << opened.size();
        std::cout << "\n";
        /*
        std::cout << "Closed are: ";
        for (auto c : closed)
        {
            std::cout << c.x << "," << c.y << " ";
        };
        std::cout << "\n";
        std::cout << "Current is " << current_lowest.x << "," << current_lowest.y << "\n";
        */
    }

    unsigned int estimate(State state)
    {
        //   return 0;
        return std::sqrt(std::pow(abs(state.x - final_state.x), 2) +
                         std::pow(abs(state.y - final_state.y), 2)) *
               10;
    }

public:
    void add_borders()
    {
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
    }

    void draw_solution(std::vector<State> path)
    {
        for (int iy = 0; iy < MAX_Y; iy++)
        {
            for (int ix = 0; ix < MAX_X; ix++)
            {
                const State p = {ix, iy};

                if (borders.count(p) > 0)
                {
                    std::cout << "#";
                }
                else if (p == final_state)
                {
                    std::cout << "F";
                }
                else if (std::find(path.begin(), path.end(), p) != path.end())
                {
                    std::cout << "x";
                }
                else
                {
                    std::cout << " ";
                }
            }
            std::cout << " #\n";
        };
        for (int ix = 0; ix < MAX_X + 1; ix++)
        {
            std::cout << "#";
        }
        std::cout << "\n";
    };
};

#include <chrono>

int main(int argc, char *argv[])
{
    MyDemoPuzzle demo;

    demo.add_borders();

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
    auto t1 = std::chrono::high_resolution_clock::now();
    auto route = demo.solve({start_x, start_y});
    auto t2 = std::chrono::high_resolution_clock::now();
    std::chrono::duration<long long, std::ratio<1, 1000000000>> time_span = t2 - t1;
    std::cout << "\nIt took me " << time_span.count() / 1000 << " micro.\n";

    std::cout << "Path len=" << route.size() << "\n";
    /*
    std::cout << "\nSolved: \n";

    for (auto x : route)
    {
        std::cout << "" << x.x << "," << x.y << " ";
    }
    std::cout << "\n";
    */
    demo.draw_solution(route);

    //std::string str = "asdasd";
    //demo.solve(str);

    return 0;
}