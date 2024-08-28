![banner](./images/boids-n-inversekinematics_banner.png)

# My Boids and Inverse Kinematics Visualization

As usual when I'm bored and in search of a new project to create, instead of studying for my exams, I have stumbled upon the topics of [boids (flocking simulation)](https://www.youtube.com/watch?v=mhjuuHl6qHM) and [inverse kinematics](https://www.youtube.com/watch?v=hbgDqyy8bIw&t=1686s) from [@TheCodingTrain](https://www.youtube.com/@TheCodingTrain), and thought why not combine them into one project and create a a simple fish tank simulation. I mean how hard could it be, right?

## Setting up the project

Unfortunately, the coding train videos are with a framework called [p5.js](https://p5js.org/), which I am not familiar with, so I decided to use [raylib](https://www.raylib.com/) instead. I have used raylib in the past and I am quite comfortable with it. Although javascript implementation is probably easier to understand and implement, I wanted to challenge myself and try to implement it in C++.

### Setting up the raylib project

First of all I have created a class named `App` this class will be the main class of the project which will handle the application loop window creation and the input handling.

```cpp
class App
{
    App();

public:
    ~App();
    static App &GetInstance();
    void Run();

private:
    void Update();
    void Draw();
    void HandleInput();

private:
    float m_width = 1512;
    float m_height = 864;

    std::string m_title = "Boids Simulation";

    std::vector<std::shared_ptr<Boid>> m_boids;
};
```

This is just my boilerplate code for any project that I am starting with raylib. Please don't judge my usage of Singleton pattern, I know it's not the best practice but it works for me.

```cpp
App::App()
{
    InitWindow(this->m_width, this->m_height, this->m_title.c_str());
    SetTargetFPS(60);

    for (int i = 0; i < 50; i++)
    {
        this->m_boids.push_back(std::make_shared<Boid>());
    }
}
```

On the constructor of the `App` class I basically initialized the window and the boids vector with 50 boids. Probably my because of my implementation of this is not the best I had to use 50 as a starting point. (I think inverse kinematics part takes a lot of performance so I had to limit the number of boids)

```cpp
void App::Run()
{
    while (!WindowShouldClose())
    {
        this->HandleInput();
        this->Update();
        this->Draw();
    }
}

void App::Update()
{
    for (auto &boid : this->m_boids)
    {
        boid->Edges();
        boid->Flock(this->m_boids);
        boid->Update();
    }
}

void App::Draw()
{
    BeginDrawing();
    ClearBackground(BLACK);
    for (auto &boid : this->m_boids)
    {
        boid->Draw();
    }
    EndDrawing();
}
```

On these three functions basically Run starts the simulation loop. Update function updates the boids behavior (make sure that they come back from the opposite side of the screen when they go out of the screen, flocking behavior, and updating the position of the boid). Draw function clears the screen and draws the boids.

### Boids

Now to understand how the boids (flocking) work I suggest you to watch the video that I have linked above. But in short, boids have three main rules:

1. **Separation**: Boids try to keep a small distance from each other.
2. **Alignment**: Boids try to align their velocity with the average velocity of their neighbors.
3. **Cohesion**: Boids try to move towards the average position of their neighbors.

This is the main idea of [Craig Reynolds](https://www.red3d.com/cwr/) who is the creator of the boids simulation.

#### 1. Separation

```cpp
Vector2 m_position = {(float)GetScreenWidth() / 2, (float)GetScreenHeight() / 2};

Vector2 m_velocity;
Vector2 m_acceleration;

float m_maxForce = 0.2f;
float m_maxSpeed = 4.0f;
```

As you can see my boid class has these parameters which are the position, velocity, acceleration, max force, and max speed.

```cpp
Vector2 Boid::Separation(std::vector<std::shared_ptr<Boid>> &boids)
{
    // Separation: Steering to avoid crowding local flockmates

    Vector2 sum = {0, 0};
    int count = 0;

    for (const auto &boid : boids)
    {
        float distance = Vector2Distance(this->m_position, boid->m_position);

        // Check if the boid is within a certain range (you can experiment with this range)
        if (distance > 20 && distance < 100 && boid != shared_from_this())
        {
            Vector2 diff = Vector2Subtract(this->m_position, boid->m_position);
            diff = Vector2Normalize(diff); // Normalize the difference vector
            diff.x /= distance;            // Weight by distance
            diff.y /= distance;            // Weight by distance
            sum.x += diff.x;
            sum.y += diff.y;
            count++;
        }
    }

    if (count > 0)
    {
        sum.x /= static_cast<float>(count);
        sum.y /= static_cast<float>(count);

        sum = Vector2Normalize(sum); // Normalize the result
        sum.x *= m_maxSpeed;         // Scale to the maximum speed
        sum.y *= m_maxSpeed;         // Scale to the maximum speed
        sum.x -= m_velocity.x;       // Subtract current velocity to get steering force
        sum.y -= m_velocity.y;       // Subtract current velocity to get steering force
        sum = Vector2Normalize(sum); // Make sure the force does not exceed the maximum force
        sum.x *= m_maxForce;
        sum.y *= m_maxForce;
    }

    return sum;
}
```

This is the separation function of the boid class. Basically, it calculates the steering force that the boid should apply to avoid crowding local flockmates. It calculates the average of the difference vectors between the boid and its neighbors and normalizes it. Then it scales it to the maximum speed and subtracts the current velocity to get the steering force. Finally, it normalizes the result and scales it to the maximum force.

With this function the boids will try to keep a small distance from each other.

#### 2. Alignment

```cpp

```
