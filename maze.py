import sys
import pdb

class Node():
    def __init__(self, state, parent, action, cost = 0):
        self.state = state
        self.parent = parent
        self.action = action
        self.cost = 0


class StackFrontier():
    def __init__(self):
        # initially an empty frontier
        self.frontier = []

    def add(self, node):
        self.frontier.append(node)

    def contains_state(self, state):
        return any(node.state == state for node in self.frontier)

    def empty(self):
        return len(self.frontier) == 0

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:
            node = self.frontier[-1]
            self.frontier = self.frontier[:-1]
            return node


# Bread First Search Method
# inherits from stack frontier but removes from the beginning of the list
class QueueFrontier(StackFrontier):

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:
            node = self.frontier[0]
            self.frontier = self.frontier[1:]
            return node


class GreedyQueueFrontier(StackFrontier):

    def heuristic(position):
        x,y = position.state
        print(x)
        print(y)
        cost = abs((5 - x)) + abs((20 - y))
        return cost

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:
            # lets remove the node with the minimum heuristic value
            costs = list(map(GreedyQueueFrontier.heuristic, self.frontier))
            minimum = min(costs)
            index = costs.index(minimum)
            
            # remove minimum node...
            node = self.frontier[index]
            self.frontier.pop(index)

            return node


class AStarSearch(StackFrontier):
    '''
    Search algorithm that expands node with lowest vallue of g(n) + h(n)

    g(n) = cost to reach node
    h(n) = estimated cost to goal(implemented in Greedy BFS)
    '''

    def heuristic(position):
        x, y = position.state
        cost = (abs((5 - x)) + abs((20 - y)) + position.cost)
        
        return cost

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:

            # convert our nodes to a list of estimated costs
            costs = list(map(AStarSearch.heuristic, self.frontier))
        
            print(costs)

            # find the index of the first occurence of minimum node cost
            minimum = min(costs)
            print(minimum)
            index = costs.index(minimum)
            

            # proceed to minimum node cost, and remove that element
            node = self.frontier[index]
            self.frontier.pop(index)

            return node

class Maze():

    def __init__(self, blocks):
        # Keep track of order when traversing the matrix
        self.order = []
        self.cost = 1

        # Determine height and width of maze
        self.height = 25
        self.width = 50

        # Create the maze
        maze = [[0] * self.width for _ in range(self.height)]
        
        # Manually setting A
        maze[20][5] = "A"
        # Manually setting B
        maze[5][20] = "B"

        # Convert list of string tuples to list of tuples
        for index, item in enumerate(blocks):
            blocks[index] = eval(item)

        # Add walls to the maze, walls are == 1
        for i,j in blocks:
            maze[i][j] = 1
        
        # Keep track of walls
        self.walls = []
        for i in range(self.height):
            row = []
            for j in range(self.width):
                try:
                    if maze[i][j] == "A":
                        self.start = (i, j)
                        row.append(False)
                    elif maze[i][j] == "B":
                        self.goal = (i, j)
                        row.append(False)
                    elif maze[i][j] == 0:
                        row.append(False)
                    else:
                        row.append(True)
                except IndexError:
                    row.append(False)
            self.walls.append(row)

        self.solution = None

    def print(self):
        solution = self.solution[1] if self.solution is not None else None
        print()
        for i, row in enumerate(self.walls):
            for j, col in enumerate(row):
                if col:
                    print("█", end="")
                elif (i, j) == self.start:
                    print("A", end="")
                elif (i, j) == self.goal:
                    print("B", end="")
                elif solution is not None and (i, j) in solution:
                    print("*", end="")
                else:
                    print(" ", end="")
            print()
        print()

    def neighbors(self, state):
        row, col = state
        candidates = [
            ("up", (row - 1, col)),
            ("down", (row + 1, col)),
            ("left", (row, col - 1)),
            ("right", (row, col + 1))
        ]

        result = []
        for action, (r, c) in candidates:
            if 0 <= r < self.height and 0 <= c < self.width and not self.walls[r][c]:
                result.append((action, (r, c)))
        return result

    def add(self, node):
        self.order.append(node)

    def solve(self, algo):
        """Finds a solution to maze, if one exists."""
        print("ALGOOOOOO", algo)

        # Keep track of number of states explored
        self.num_explored = 0

        # Initialize frontier to just the starting position
        start = Node(state=self.start, parent=None, action=None)
        # Stack frontier is depth first search, queue is breadth first search

        if algo == "depth":
            frontier = StackFrontier()
        elif algo =="breadth":
            frontier = QueueFrontier()
        elif algo =="greedy":
            frontier = GreedyQueueFrontier()
        elif algo == "astar":
            frontier = AStarSearch()


        frontier.add(start)

        # Initialize an empty explored set
        self.explored = set()

        # Keep looping until solution found
        while True:

            # If nothing left in frontier, then no path
            if frontier.empty():
                raise Exception("no solution")

            # Choose a node from the frontier
            node = frontier.remove()
            self.num_explored += 1

            # keep track of order exploring the nodes
            self.add(node.state)

            # If node is the goal, then we have a solution
            if node.state == self.goal:
                actions = []
                cells = []
                while node.parent is not None:
                    actions.append(node.action)
                    cells.append(node.state)
                    node = node.parent
                actions.reverse()
                cells.reverse()
                self.solution = (actions, cells)
                return

            # Mark node as explored
            self.explored.add(node.state)

            # Add neighbors to frontier
            
            for action, state in self.neighbors(node.state):
                if not frontier.contains_state(state) and state not in self.explored:
                    child = Node(state=state, parent=node, action=action)
                    child.cost = self.cost
                    frontier.add(child)
            self.cost += 1

    def output_image(self, filename, show_solution=True, show_explored=False):
        from PIL import Image, ImageDraw
        cell_size = 50
        cell_border = 2
        
        # Create a blank canvas
        img = Image.new(
            "RGBA",
            (self.width * cell_size, self.height * cell_size),
            "black"
        )
        draw = ImageDraw.Draw(img)

        solution = self.solution[1] if self.solution is not None else None
        for i, row in enumerate(self.walls):
            for j, col in enumerate(row):

                # Walls
                if col:
                    fill = (40, 40, 40)

                # Start
                elif (i, j) == self.start:
                    fill = (255, 0, 0)

                # Goal
                elif (i, j) == self.goal:
                    fill = (0, 171, 28)

                # Solution
                elif solution is not None and show_solution and (i, j) in solution:
                    fill = (220, 235, 113)

                # Explored
                elif solution is not None and show_explored and (i, j) in self.explored:
                    fill = (212, 97, 85)

                # Empty cell
                else:
                    fill = (237, 240, 252)

                # Draw cell
                draw.rectangle(
                    ([(j * cell_size + cell_border, i * cell_size + cell_border),
                      ((j + 1) * cell_size - cell_border, (i + 1) * cell_size - cell_border)]),
                    fill=fill
                )

        img.save(filename)