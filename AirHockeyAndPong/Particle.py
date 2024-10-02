from Shape import Shape
from Constants import *
import random
import pygame

class Particle(Shape):
    def __init__(self, emitter, complexity: chr, game: chr):
        super().__init__(emitter.getColor())
        position = emitter.getBallPosition() if game == "p" else emitter.getPuckPosition()
        self.__position = position
        self.__radius = emitter.getRadius() if complexity == "s" else emitter.getRadius() * .5
        self.__drawRadius = self.__radius
        self.__lifespan = LIFESPAN
        self.__complexity = complexity
        self.__transparency = 0
        self.__age = 0
        self.__drawColor = emitter.getColor()

        if complexity == "c":
            self.__points = []
            self.__lifespan *= 1.5
            numPoints = 5
            for i in range(numPoints):
                randStart = random.random()
                randEnd = random.random()
                pt = {}

                startColor = self.combineColors(COMPLEX_COLOR_FRONT_1, COMPLEX_COLOR_FRONT_2, randStart)
                pt['startColor'] = startColor

                endColor = self.combineColors(COMPLEX_COLOR_BACK_1, COMPLEX_COLOR_BACK_2, randEnd)
                pt['endColor'] = endColor

                yDisplace = emitter.getRadius() * .4 * (random.randint(1, 8) - 4) / 4
                xDisplace = emitter.getRadius() * .4 * random.randint(-2,2) / 2
                pt['position'] = pygame.Vector2(self.__position.x + xDisplace, self.__position.y + yDisplace)

                pt['drawColor'] = startColor
                self.__points.append(pt)

    def draw(self, screen):
        if (self.__complexity == "s"):
            pygame.draw.circle(screen, self.__drawColor, self.__position, self.__radius)
        elif (self.__complexity == "c"):
            for pt in self.__points:
                pygame.draw.circle(screen, pt['drawColor'], pt['position'], self.__drawRadius)

    def updateAge(self):
        self.__age += 1

    def calcTransparency(self):
        transparencyIncrement = 1.0 / (self.__lifespan * 1.0)
        self.__transparency = transparencyIncrement * self.__age
        if (self.__complexity == "s"):
            self.__drawColor = self.combineColors(BACKGROUND_COLOR, self.getColor(), self.__transparency)
        elif (self.__complexity == "c"):
            self.__drawRadius = self.__radius
            for i in range(self.__age):
                self.__drawRadius *= .95
            for pt in self.__points:
                mixedColor = self.combineColors(pt['endColor'], pt['startColor'], self.__transparency)
                pt['drawColor'] = mixedColor
                if (self.__transparency > .5):
                    pt['drawColor'] = self.combineColors(BACKGROUND_COLOR, mixedColor, self.__transparency)

    def isDead(self):
        if (self.__age > self.__lifespan):
            return True
        return False
        
    def combineColors(self, color1, color2, p):
        r = color1[0] * p + color2[0] * (1-p)
        g = color1[1] * p + color2[1] * (1-p)
        b = color1[2] * p + color2[2] * (1-p)
        return (r,g,b)
    

    def getLifespan(self):
        return self.__lifespan

    
    def setAge(self, age):
        self.__age = age

    def setXPos(self, xPos):
        self.__position()


    def move(self):
        pass
    
    def getSides(self):
        pass