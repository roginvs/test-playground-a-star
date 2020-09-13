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
    std::vector<OpenedItem> heap;

    /** Положение State в куче */
    std::map<State, int> state_to_index;

    /** 
     Подъём элемента
    */
    void bubble_up(int start_at)
    {
        int current_pos = start_at;
        //   cout << "Start bubble up" << endl;
        while (true)
        {
            //     cout << " pos = " << current_pos << endl;
            if (current_pos == 0)
            {
                break;
            };

            int parent_pos = (current_pos - 1) / 2;

            // @heaporder
            if (heap[parent_pos].f() > heap[current_pos].f())
            {
                //       cout << "    Exchange " << current_pos << " with parent " << parent_pos << endl;
                exchange(parent_pos, current_pos);

                current_pos = parent_pos;
            }
            else
            {
                //     cout << "    Parent is not bigger" << endl;
                break;
            }
        }
    };

    /** 
     Спуск элемента
    */
    void heapify_down(int start_at)
    {
        int current_pos = start_at;
        //        cout << "Start heapify_down up" << endl;
        while (true)
        {
            // cout << "  current = " << current_pos << endl;
            int left_pos = 2 * current_pos + 1;
            int right_pos = 2 * current_pos + 2;
            int smallest = current_pos;
            int size = heap.size();

            // @heaporder
            if (left_pos < size && heap[left_pos].f() < heap[smallest].f())
            {
                smallest = left_pos;
            };
            if (right_pos < size && heap[right_pos].f() < heap[smallest].f())
            {
                smallest = right_pos;
            };
            if (smallest == current_pos)
            {
                break;
            }
            exchange(current_pos, smallest);
            current_pos = smallest;
        }
    };

    void exchange(int i1, int i2)
    {
        std::swap(heap[i1], heap[i2]);

        state_to_index[heap[i1].state] = i1;
        state_to_index[heap[i2].state] = i2;
    };

public:
    OpenedSet()
    {
        // nothing here
    }

    static_assert(sizeof(State) <= 24, "State is too big! Use pointers instead");

    // Return copy because we remove it from class storage
    const OpenedItem pop_lowest()
    {
        if (heap.size() == 0)
        {
            throw std::runtime_error("Empty heap");
        };
        auto saved_item = heap[0];
        heap[0] = heap[heap.size() - 1];
        heap.pop_back();
        state_to_index[heap[0].state] = 0;
        state_to_index.erase(saved_item.state);
        heapify_down(0);

        // Возвращаем не-reference!
        return saved_item;
    };

    void add_state(State state, unsigned int known_path, unsigned int estimate)
    {
        if (state_to_index.count(state) > 0)
        {
            throw std::runtime_error("Not allowed to push item if it already exists!");
        };
        heap.emplace_back(state, known_path, estimate);
        state_to_index[state] = heap.size() - 1;

        bubble_up(heap.size() - 1);
    };

    unsigned int size()
    {
        return heap.size();
    };

    const OpenedItem *find(State state)
    {
        // returns null or pointer
        if (state_to_index.count(state) == 0)
        {
            return nullptr;
        };
        auto index = state_to_index[state];
        return &heap[index];
    };

    void update_state_known_length(State state, unsigned int new_known_path)
    {
        if (state_to_index.count(state) == 0)
        {
            throw std::runtime_error("No such state!");
        };
        auto heap_pos = state_to_index[state];
        OpenedItem &item = heap[heap_pos];
        auto old_known_path = item.known_path;
        if (old_known_path == new_known_path)
        {
            return;
        };
        // @heaporder
        if (new_known_path > old_known_path)
        {
            throw std::runtime_error("Why do you provide bigger path?");
        };
        item.known_path = new_known_path;
        // @heaporder
        bubble_up(heap_pos);
    }
};
