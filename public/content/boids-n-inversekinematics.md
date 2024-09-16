![banner](./images/boids-n-inversekinematics_banner.png)

# My Boids and Inverse Kinematics Visualization

Date: 2024-08-28
\
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
Vector2 Boid::Align(std::vector<std::shared_ptr<Boid>> &boids)
{
    // Alignment: Steering towards the average heading of local flockmates

    Vector2 sum = {0, 0};
    int count = 0;

    for (const auto &boid : boids)
    {
        float distance = Vector2Distance(this->m_position, boid->m_position);

        // Check if the boid is within a certain range (you can experiment with this range)
        if (distance > 0 && distance < 100 && boid != shared_from_this())
        {
            sum.x += boid->m_velocity.x;
            sum.y += boid->m_velocity.y;
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

This is the alignment function of the boid class. Basically, it calculates the steering force that the boid should apply to align its velocity with the average velocity of its neighbors. It calculates the average of the velocities of the boid's neighbors and normalizes it. Then it scales it to the maximum speed and subtracts the current velocity to get the steering force. Finally, it normalizes the result and scales it to the maximum force.

With this function the boids will try to align their velocity with the average velocity of their neighbors.

#### 3. Cohesion

```cpp
Vector2 Boid::Cohesion(std::vector<std::shared_ptr<Boid>> &boids)
{
    // Cohesion: Steering to move towards the average position of local flockmates

    Vector2 sum = {0, 0};
    int count = 0;

    for (const auto &boid : boids)
    {
        float distance = Vector2Distance(this->m_position, boid->m_position);

        // Check if the boid is within a certain range (you can experiment with this range)
        if (distance > 0 && distance < 100 && boid != shared_from_this())
        {
            sum.x += boid->m_position.x;
            sum.y += boid->m_position.y;
            count++;
        }
    }

    if (count > 0)
    {
        sum.x /= static_cast<float>(count);
        sum.y /= static_cast<float>(count);

        Vector2 desired = Vector2Subtract(sum, this->m_position);
        desired = Vector2Normalize(desired); // Normalize the result
        desired.x *= m_maxSpeed;             // Scale to the maximum speed
        desired.y *= m_maxSpeed;             // Scale to the maximum speed

        Vector2 steering = Vector2Subtract(desired, m_velocity); // Calculate steering force
        steering = Vector2Normalize(steering);                   // Make sure the force does not exceed the maximum force
        steering.x *= m_maxForce;
        steering.y *= m_maxForce;

        return steering;
    }

    return sum;
}
```

In this function, the boid calculates the steering force that it should apply to move towards the average position of its neighbors. It calculates the average position of the boid's neighbors and normalizes it. Then it scales it to the maximum speed and subtracts the current velocity to get the steering force. Finally, it normalizes the result and scales it to the maximum force.

Boids will try to move towards the average position of their neighbors with this function.

<img src="images/boids.gif" style="width:100%"></img>

This is the result of the boids simulation. As you can see the boids are trying to keep a small distance from each other, align their velocity with the average velocity of their neighbors, and move towards the average position of their neighbors.

And now let's move on to the inverse kinematics part and create our fishes from the boids.

### Inverse Kinematics (This part has a fishy implementation 😅)

Now how the inverse kinematics work is a bit more complicated conseptually, but implementation-wise it's not that hard. I suggest you to watch the video that I have linked above to understand the concept of inverse kinematics.

Creating fishes from inverse kinematics concept was a foreign idea to me until I have watched a [video](https://www.youtube.com/watch?v=qlfh_rv6khY&t=289s) from [@argonautcode](https://www.youtube.com/@argonautcode). The concept was pretty intruiging, so I have decided to implement and combine with my boids implementation.

The main problem that I have faced was I couldn't create a coherent fish from the boids at first. I have only be able to create external points for main body of the fish, basically it was looking like an earth worm instead of a fish. I had to create a couple of utility functions to fill the body of the fish and create some fins from ellipses.

But before that let's see how the inverse kinematics works.

```cpp
class Spine
{
public:
    Spine(Vector2 origin, int jointCount, int linkSize, float angleConstraint = 2 * PI);
    void Resolve(Vector2 pos);
    void Draw();

public:
    std::vector<Vector2> m_joints;
    std::vector<float> m_angles;
    int m_linkSize;
    float m_angleConstraint;
};
```

This is the spine class that I have created for the inverse kinematics part. It has a vector of joints, angles, link size, and angle constraint. The joints are the points that the spine will be connected to. The angles are the angles between the joints.

When the Resolve function is called the spine will try to resolve the position of the joints according to the given position by changing the angles between the joints.

```cpp
void Spine::Resolve(Vector2 pos)
{
    m_angles[0] = atan2f(pos.y - m_joints[0].y, pos.x - m_joints[0].x);
    m_joints[0] = pos;
    for (size_t i = 1; i < m_joints.size(); ++i)
    {
        float curAngle = atan2f(m_joints[i - 1].y - m_joints[i].y, m_joints[i - 1].x - m_joints[i].x);
        m_angles[i] = ConstrainAngle(curAngle, m_angles[i - 1], m_angleConstraint);
        m_joints[i] = Vector2Subtract(m_joints[i - 1], Vector2Scale((Vector2){cosf(m_angles[i]), sinf(m_angles[i])}, m_linkSize));
    }
}
```

This is the Resolve function of the spine class. It calculates the angles between the joints and the position of the joints according to the given position. It calculates the angle between the first joint and the given position and sets the first joint to the given position. Then it calculates the angles between the other joints and the position of the joints according to the previous joint.

This is the main idea of the inverse kinematics. The spine will try to resolve the position of the joints according to the given position by changing the angles between the joints.

<video width="100%" controls>
  <source src="videos/inversekinematics.mov" type="video/mp4">
</video>

This is a simple example of the inverse kinematics. As you can see the spine is trying to resolve the position of the joints according to the given position by changing the angles between the joints.

#### Now the fun part: Creating the fish

This part was a bit tricky to implement because on raylib api there was no function to draw filled ellipses with angles. So I had to create a function to draw filled ellipses with angles.

```cpp
static void FillPolygon(const std::vector<Vector2> &polygon, Color color)
{
    if (polygon.size() < 3)
        return; // Not a polygon

    // Determine the bounding box of the polygon
    float minX = std::numeric_limits<float>::max();
    float maxX = std::numeric_limits<float>::lowest();
    float minY = std::numeric_limits<float>::max();
    float maxY = std::numeric_limits<float>::lowest();

    for (const auto &v : polygon)
    {
        minX = std::min(minX, v.x);
        maxX = std::max(maxX, v.x);
        minY = std::min(minY, v.y);
        maxY = std::max(maxY, v.y);
    }

    // Scanline fill algorithm
    for (int y = static_cast<int>(minY); y <= static_cast<int>(maxY); ++y)
    {
        std::vector<int> intersections;

        // Find intersections of the scanline with polygon edges
        for (size_t i = 0; i < polygon.size(); ++i)
        {
            size_t j = (i + 1) % polygon.size();
            const Vector2 &v0 = polygon[i];
            const Vector2 &v1 = polygon[j];

            if ((v0.y > y && v1.y <= y) || (v1.y > y && v0.y <= y))
            {
                float x = v0.x + (y - v0.y) * (v1.x - v0.x) / (v1.y - v0.y);
                intersections.push_back(static_cast<int>(x));
            }
        }

        // Sort intersections and fill between pairs of intersections
        std::sort(intersections.begin(), intersections.end());

        // Use drawpixel

        for (size_t i = 0; i < intersections.size(); i += 2)
        {
            int x0 = std::max(static_cast<int>(minX), intersections[i]);
            int x1 = std::min(static_cast<int>(maxX), intersections[i + 1]);
            for (int x = x0; x <= x1; ++x)
            {
                DrawPixel(x, y, color);
            }
        }
    }
}
```

This is the FillPolygon function that I have created to draw any polygon with a given color. It uses the scanline fill algorithm to fill the polygon.

```cpp
#define NUM_SEGMENTS 30

static void DrawFilledEllipse(Vector2 center, Vector2 radius, float angle, Color color)
{
    // Number of segments to approximate the ellipse
    const int segments = NUM_SEGMENTS;

    // Create an array to store the vertices of the ellipse
    std::vector<Vector2> vertices(segments + 1);

    // Compute angle increment for each segment
    float angleIncrement = 2.0f * PI / segments;

    // Calculate vertices
    for (int i = 0; i < segments; ++i)
    {
        float theta = angleIncrement * i;
        Vector2 point = {
            center.x + radius.x * cosf(theta),
            center.y + radius.y * sinf(theta)};

        // Rotate the point around the center
        Vector2 pointRel = Vector2Subtract(point, center);
        pointRel = Vector2Rotate(pointRel, angle);
        vertices[i] = Vector2Add(center, pointRel);
    }

    // Close the fan loop by repeating the first vertex
    vertices[segments] = vertices[0];

    FillPolygon(vertices, color);
}
```

Now on here, I have created the DrawFilledEllipse function to draw a filled ellipse with a given center, radius, angle, and color. It calculates the vertices of the ellipse and fills the ellipse with the FillPolygon function.

With these functions, I can easily create a body and fins fot the fish.

```cpp
void Fish::Draw()
{
    DrawVentralFins(m_spine.m_joints[0], m_spine.m_angles[0], m_bodyWidth[0], m_finColor);
    DrawPectoralFins(m_spine.m_joints[1], m_spine.m_angles[1], m_bodyWidth[1], m_finColor);
    DrawBody(m_spine.m_joints, m_spine.m_angles);
    DrawEyes(m_spine.m_joints[0], m_spine.m_angles[0], m_bodyWidth[0], m_finColor);
    DrawDorsalFin(m_spine.m_joints[0], m_spine.m_angles[0], m_bodyWidth[0], m_finColor);
}

void Fish::DrawPectoralFins(const Vector2 &position, float angle, float m_bodyWidth, Color color)
{
    DrawFilledEllipse({position.x - cosf(angle) * m_bodyWidth / 6 + sinf(angle) * m_bodyWidth / 2, position.y - sinf(angle) * m_bodyWidth / 6 - cosf(angle) * m_bodyWidth / 2}, {7.5, 12.5}, angle - PI / 8, color);
    DrawFilledEllipse({position.x - cosf(angle) * m_bodyWidth / 6 - sinf(angle) * m_bodyWidth / 2, position.y - sinf(angle) * m_bodyWidth / 6 + cosf(angle) * m_bodyWidth / 2}, {7.5, 12.5}, angle + PI / 8, color);
    Vector2 jointPos = m_spine.m_joints[m_spine.m_joints.size() - 8];
    float jointAngle = m_spine.m_angles[m_spine.m_joints.size() - 8];
    DrawFilledEllipse({jointPos.x + cosf(jointAngle) * m_bodyWidth / 6 + sinf(jointAngle) * m_bodyWidth / 2, jointPos.y + sinf(jointAngle) * m_bodyWidth / 6 - cosf(jointAngle) * m_bodyWidth / 2}, {3, 5}, jointAngle - PI / 4, color);
    DrawFilledEllipse({jointPos.x + cosf(jointAngle) * m_bodyWidth / 6 - sinf(jointAngle) * m_bodyWidth / 2, jointPos.y + sinf(jointAngle) * m_bodyWidth / 6 + cosf(jointAngle) * m_bodyWidth / 2}, {3, 5}, jointAngle + PI / 4, color);
}
```

Now if we look at these two function Draw and DrawPectoralFins, we can see that I have created the body, eyes, dorsal fin, and pectoral fins of the fish. I have used the DrawFilledEllipse function to draw the fins and body of the fish. Also the angle of the fins and body are calculated according to the spine of the fish.

<video width="100%" controls>
  <source src="videos/fishes.mov" type="video/mp4">
</video>

This is the result of the fish simulation. As you can see the fish is created from the boids and inverse kinematics. The fish has a body, eyes, dorsal fin, and pectoral fins. The body and fins are created from the spine and the spine of the fish is created from the inverse kinematics.

You can also find the live project on here: [Boids](https://burakssen.com/boids/)

# Conclusion

This was a fun project to create. I have learned a lot about boids and inverse kinematics. I have also learned how to create a fish from the boids and inverse kinematics. I hope you have enjoyed reading this article as much as I have enjoyed creating this project. If you have any questions or suggestions feel free to ask.
