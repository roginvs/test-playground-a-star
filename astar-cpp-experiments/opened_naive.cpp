#include <iostream>
#include <vector>
#include <stdexcept>
#include <map>
#include <set>

template <class State>
class OpenedSet
{
public:
    class OpenedItem
    {
    public:
        OpenedItem(State state, unsigned int known_path, unsigned int estimate)
            : state(state), known_path(known_path), estimate(estimate){};
        State state;
        unsigned int known_path;
        unsigned int estimate;
        inline unsigned int f()
        {
            return known_path + estimate;
        }
    };

private:
    std::vector<OpenedItem> items;

public:
    OpenedSet()
    {
        // nothing here
    }

    static_assert(sizeof(State) <= 24, "State is too big! Use pointers instead");

    // Return copy because we remove it from class storage
    const OpenedItem pop_lowest()
    {
        if (items.size() == 1)
        {
            auto popped = items[0];
            items.pop_back();
            return popped;
        };

        int lowest_index = 0;
        for (int i = 1; i < items.size(); i++)
        {
            if (items[i].f() < items[lowest_index].f())
            {
                lowest_index = i;
            };
        };

        std::swap(items[lowest_index], items[items.size() - 1]);
        auto popped = items[items.size() - 1];
        items.pop_back();
        return popped;
    };

    void add_state(State state, unsigned int known_path, unsigned int estimate)
    {
        items.emplace_back(state, known_path, estimate);
    };

    unsigned int size()
    {
        return items.size();
    };

    const OpenedItem *find(State state)
    {
        for (int i = 0; i < items.size(); i++)
        {
            if (items[i].state == state)
            {
                return &items[i];
            };
        };
        return nullptr;
    };

    void update_state_known_length(State state, unsigned int new_known_path)
    {
        for (int i = 0; i < items.size(); i++)
        {
            if (items[i].state == state)
            {
                items[i].known_path = new_known_path;
                return;
            }
        }
    };
};