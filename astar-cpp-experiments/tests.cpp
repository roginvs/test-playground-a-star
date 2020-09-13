/*

clang++ tests.cpp -std=c++14 -o tests.bin && ./tests.bin

*/

#include "./opened_smart.cpp"

#include <cassert>
#include <algorithm>
void opened_test()
{
    using namespace std;

    cout << "Creating set \n";
    OpenedSet<long long> opened;
    assert(opened.size() == 0);

    cout << "Pushing initial state\n";
    opened.add_state(5000, 10, 100);
    assert(opened.size() == 1);

    cout << "Popping state\n";
    auto st = opened.pop_lowest();

    assert(opened.size() == 0);
    assert(st.state == 5000);
    assert(st.known_path == 10);
    assert(st.estimate == 100);

    auto some_ints = {8, 5, 7, 3, 4, 2, 9};
    cout << "Pushing few states\n";
    for (auto x : some_ints)
    {
        opened.add_state(x * 1000, 10 * x, x);
    };
    assert(opened.size() == some_ints.size());
    cout << "Finding states\n";
    assert(opened.find(123123123) == nullptr);
    for (auto x : some_ints)
    {
        auto item = opened.find(x * 1000);
        assert(item != nullptr);
        assert(item->state == x * 1000);
        assert(item->known_path == 10 * x);
        assert(item->estimate == x);
    };

    cout << "Popping one-by-one\n";
    std::vector<int> sorted = some_ints;
    std::sort(sorted.begin(), sorted.end());

    for (int i = 0; i < sorted.size(); i++)
    {
        auto x = sorted[i];
        auto popped = opened.pop_lowest();
        assert(popped.state == x * 1000);
        assert(popped.known_path == x * 10);
        assert(popped.estimate == x);

        for (int ii = 0; ii <= i; ii++)
        {
            //cout << "i=" << i << " ii=" << ii << "\n";
            assert(opened.find(sorted[ii] * 1000) == nullptr);
        };
        for (int ii = i + 1; ii < sorted.size(); ii++)
        {
            auto still_exists = opened.find(sorted[ii] * 1000);
            assert(still_exists != nullptr);
            assert(still_exists->state == sorted[ii] * 1000);
            assert(still_exists->known_path == sorted[ii] * 10);
            assert(still_exists->estimate == sorted[ii]);
        };
    };

    cout << "Pushing and popping\n";
    cout << "Pushing few states\n";
    for (auto x : some_ints)
    {
        opened.add_state(x * 1000, 100 * x, x);
    };
    for (auto x : {2, 3, 4})
    {
        opened.pop_lowest();
    };
    for (auto x : {16, 2, 55})
    {
        opened.add_state(x * 1000, 100 * x, x);
    };
    auto lowest = opened.pop_lowest();
    assert(lowest.state == 2 * 1000);

    // Cleanup
    while (opened.size() > 0)
    {
        opened.pop_lowest();
    }

    cout << "Checking score update\n";
    // Score update
    for (auto x : some_ints)
    {
        opened.add_state(x * 1000, 100 * x, x);
    };
    opened.update_state_known_length(5 * 1000, 100 * 5 - 300);
    opened.update_state_known_length(9 * 1000, 100 * 9 - 230);

    int last_f = 0;
    while (opened.size() > 0)
    {
        auto item = opened.pop_lowest();
        assert(last_f <= item.f());
        last_f = item.f();
        // cout << "state=" << item.state << " known_path=" << item.known_path << " e=" << item.estimate;
        //   cout << " f=" << item.f() << "\n";
    };
};

int main()
{
    opened_test();

    return 0;
}
