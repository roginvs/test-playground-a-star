/**

clang++ vector-test.cpp -o vector-test.bin && ./vector-test.bin

*/

#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>

using namespace std;

class Opened
{
public:
    string state;
    int f;

    Opened(int f) : f(f)
    {
        state = to_string(f);
        cout << "Create opened name=" << state << endl;
    };
    ~Opened()
    {
        cout << "Destroy opened name=" << state << endl;
    }
    Opened &operator=(Opened other) = delete;
    Opened(const Opened &t)
    {
        cout << "Copied opened name=" << t.state << endl;
        state = t.state + "copy";
        f = t.f;
    }
    Opened(Opened &&t)
    {
        cout << "Moved opened name=" << t.state << endl;
        state = t.state + " copy";
        f = t.f;
    }
};

class MyTest
{
private:
    vector<Opened> v;

public:
    void add(Opened &item)
    {
        //v.push_back(item);
        v.emplace_back(item);
    }
};

void vector_test()
{
    MyTest t;

    {
        Opened st1(1);
        t.add(st1);
    };
    cout << "Exited from block" << endl;
};

Opened return_opened()
{
    cout << "Creating in return_opened" << endl;
    Opened x(100);
    return x;
};

void return_test()
{
    Opened y = return_opened();
    cout << "Return from return_test" << endl;
}

void give_me_an_opened(Opened &x)
{
    // todo
}

void reference_test()
{
    Opened x(100);
    give_me_an_opened(x);
    cout << "Return from reference_test" << endl;

    const int &r = 2;
}

int main()
{
    vector_test();
    cout << "-------- Ending 1 ------- " << endl;

    return_test();
    cout << "-------- Ending 2 ------- " << endl;

    reference_test();
    cout << "-------- Ending 2 ------- " << endl;

    return 0;
}
