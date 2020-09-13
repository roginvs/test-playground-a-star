#include <vector>
#include "./opened_smart.cpp"

template <class State>
class AStar
{
public:
    struct NeighborInfo
    {
        State state;
        unsigned int jump_price;
    };

private:
    virtual bool is_final(State state) = 0;

    virtual std::vector<NeighborInfo> get_neighbors(State state) = 0;

    virtual unsigned int estimate(State state) = 0;

    virtual void debug_step(const std::set<State> &closed, OpenedSet<State> &opened, const State &current_lowest){
        // do nothing, use this for debugging
    };

public:
    std::vector<State> solve(State initial_state)
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
};