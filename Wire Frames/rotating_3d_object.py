import pygame
import numpy as np
import math
import sys
from pygame.locals import QUIT

FOV = 90

# Function to read cube data from a file
def read_object_data(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()
        
    lines = [line for line in lines if not line.strip().startswith('#')]
    
    num_vertices, num_faces = map(int, lines[0].strip().split())
    vertices = []
    for i in range(1, num_vertices + 1):
        vertexList = list(map(float, lines[i].strip().split()))
        vertexList.append(1)
        vertices.append(vertexList)
    
    faces = []
    for i in range(num_vertices + 1, num_vertices + 1 + num_faces):
        face_data = list(map(int, lines[i].strip().split()))
        faces.append(face_data[1:])  # skip the first number (it's the number of vertices in the face)
    
    return np.array(vertices), faces

    
def create_perspective_matrix(fov, aspect_ratio, near, far):
    perspectiveMatrix = np.array([
        [1.0/(aspect_ratio*math.tan((fov * 1.0)/2.0)), 0, 0, 0],
        [0, 1.0/(math.tan((fov * 1.0)/2.0)), 0, 0],
        [0, 0, ((far + near)*1.0)/(1.0*(near - far)), (2.0*far*near)/(1.0*(near - far))],
        [0, 0, -1, 0]
    ])
    return perspectiveMatrix

def projection(points, fov, width, height, near, far):

    # 1. Calculate aspect ratio
    aspectRatio = (1.0 * width)/(1.0 * height)

    # 2. Get the perspective projection matrix
    perspectiveMatrix = create_perspective_matrix(math.radians(fov), aspectRatio, near, far)

    screen_points = []
    # 3. Iterate through all the points in the object, project them and convert
    #    them to screen coordinates
    for point in points:
        perspectivePoint = perspectiveMatrix @ point
        perspectivePoint /= perspectivePoint[2]
        screenX = (perspectivePoint[0] + 1) * .5 * width
        screenY = (1 - perspectivePoint[1]) * .5 * height
        screen_points.append((int(screenX), int(screenY)))


    return screen_points

def translate_matrix(vertices, tx=0, ty=0, tz=0):
    translated_vertices = []
    translation_matrix = np.array([
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1]
    ])
    for vertex in vertices:
        translated_vertices.append(translation_matrix @ vertex)
    return translated_vertices

# Scale points
def scale_matrix(vertices, scale):
    scaledVertices = []
    for vertex in vertices:
        scaleMatrix = np.array([
            [scale, 0, 0, 0],
            [0, scale, 0, 0],
            [0, 0, scale, 0],
            [0, 0, 0, 1]
        ])
        scaledVertices.append(scaleMatrix @ vertex)

    return scaledVertices

# Functions to rotate points around an axis
def rotate_matrix_x(vertices, angle):
    rotatedVertices = []
    for vertex in vertices:
        rotationMatrix = np.array([
            [1, 0, 0, 0],
            [0, math.cos(angle), -1*(math.sin(angle)), 0],
            [0, math.sin(angle), math.cos(angle), 0],
            [0, 0, 0, 1]
        ])
        returnMatrix = rotationMatrix @ vertex
        rotatedVertices.append(returnMatrix)
    return rotatedVertices

def rotate_matrix_y(vertices, angle):
    rotatedVertices = []
    for vertex in vertices:
        rotationMatrix = np.array([
            [math.cos(angle), 0, math.sin(angle), 0],
            [0, 1, 0, 0],
            [-1*(math.sin(angle)), 0, math.cos(angle), 0],
            [0, 0, 0, 1]
        ])
        returnMatrix = rotationMatrix @ vertex
        rotatedVertices.append(returnMatrix)
    return rotatedVertices

def rotate_matrix_z(vertices, angle):
    rotatedVertices = []
    for vertex in vertices:
        rotationMatrix = np.array([
            [math.cos(angle), 0, math.sin(angle), 0],
            [-1*(math.sin(angle)), math.cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ])
        returnMatrix = rotationMatrix @ vertex
        rotatedVertices.append(returnMatrix)
    return rotatedVertices

# Function to draw the cube
def draw_cube(screen, vertices, faces, fov):
    width, height = screen.get_size()

    # 1. Scale the object's vertices to fit on the screen
    scaledVertices = scale_matrix(vertices, 1.5)
    if (len(vertices) > 8):
        scaledVertices = scale_matrix(vertices, (1/8))

    # 2. Translate the object's vertices to world coordinates
    worldCoords = translate_matrix(scaledVertices, tz=5)

    # 3. Project object's vertices using the perspective matrix and then
    #    transform to screen coordinates and put in screen_transformed[] list
    screen_transformed = projection(worldCoords, fov, width, height, .1, 1000)

    # 4. Iterate through all the object's faces and draw the transformed polygons
    for j,face in enumerate(faces):
        # Uncomment these after implementing the above
        points = [screen_transformed[i] for i in face]
        pygame.draw.polygon(screen, (0, 255, 255), points, 1)  # Draw polygon outline

# Main execution
def main():
    
    # Initialize pygame
    pygame.init()
    screen = pygame.display.set_mode((800, 600),pygame.RESIZABLE)
    pygame.display.set_caption("Wireframe Turntable - Mara Schimmel")
    clock = pygame.time.Clock()
    
    # Read the object data file
    filename = 'cube.dat'
    vertices, faces = read_object_data(filename)
    
    # Set initial value for rotation angle
    rotation_angle_y = 0
    rotation_angle_x = 25
    is_rotate = True
    rotation_angle_y_change = .5
    instructionsStr = "1: Cube   2: House   Arrow keys: Rotate object   F: Flip rotation direction   R: Reset position   P: Pause/resume rotation   ESC: Exit"

    instructionsFnt = pygame.font.SysFont("Sans", math.floor(screen.get_width() / 50))
    instructionsTxt = instructionsFnt.render(instructionsStr, True, (255,255,255))
    instructionsWidth, instructionsHeight = instructionsTxt.get_size()

    # Main event loop
    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()

            if event.type == pygame.VIDEORESIZE:
                    instructionsFnt = pygame.font.SysFont("Sans", math.floor(screen.get_width() / 50))
                    instructionsTxt = instructionsFnt.render(instructionsStr, True, (255,255,255))
                    instructionsWidth, instructionsHeight = instructionsTxt.get_size()
            elif event.type == pygame.KEYDOWN:
                keys = pygame.key.get_pressed()
                if keys[pygame.K_1]:
                    vertices, faces = read_object_data('cube.dat')
                elif keys[pygame.K_2]:
                    vertices, faces = read_object_data('house.dat')
                elif keys[pygame.K_r]:
                    rotation_angle_x = 25
                    rotation_angle_y_change = abs(rotation_angle_y_change)
                elif keys[pygame.K_p]:
                    is_rotate = not is_rotate
                elif keys[pygame.K_f]:
                    rotation_angle_y_change = -rotation_angle_y_change
                elif keys[pygame.K_ESCAPE]:
                    pygame.quit()
                    sys.exit()
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP]:
            rotation_angle_x -= 1
        elif keys[pygame.K_DOWN]:
            rotation_angle_x += 1
        if keys[pygame.K_LEFT]:
            rotation_angle_y -= 1
        elif keys[pygame.K_RIGHT]:
            rotation_angle_y += 1
        

        # Clear the screen
        screen.fill((0, 0, 0))
        
        # Rotate the cube
        transformed_vertices = rotate_matrix_y(vertices, math.radians(rotation_angle_y))
        transformed_vertices = rotate_matrix_x(transformed_vertices, math.radians(rotation_angle_x))
        # transformed_vertices = vertices
        
        # Increment the angle for rotation of the object        
        if is_rotate:
            rotation_angle_y += rotation_angle_y_change

        # Draw the cube        
        draw_cube(screen, transformed_vertices, faces, FOV)
        screen.blit(instructionsTxt, (screen.get_width() / 2 - instructionsWidth / 2, screen.get_height() - 5 - instructionsHeight))
        
        # Double-buffer the display and tick the clock
        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
