from Shape import Shape
from PaddleCircle import PaddleCircle
import pygame
import math

class Puck(Shape):
    def __init__(self, color, puckPosition, radius, isMoving):
        Shape.__init__(self, color)
        self.__radius = radius
        self.__puckPosition = puckPosition
        self.__speed = 5.1
        self.__xSpeed = 5.1
        self.__ySpeed = 0
        self.__pointScored = False
        self.__isMoving = isMoving

    def move(self, screen, paddleL: PaddleCircle, paddleR: PaddleCircle):
        if (not self.__isMoving):
            pygame.draw.circle(screen, self.getColor(), self.__puckPosition, self.__radius)
            return
        
        if (self.__pointScored == True and (self.__pointScored != "r" and self.__pointScored != "l")):
            self.__onScreen(screen)
        elif(self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
            self.__checkCollision(screen)
            self.__checkPaddleCollision(paddleL, paddleR)

        self.__puckPosition.x += self.__xSpeed
        self.__puckPosition.y += self.__ySpeed
        pygame.draw.circle(screen, self.getColor(),self.__puckPosition, self.__radius)

    def __checkPaddleCollision(self, paddleL: PaddleCircle, paddleR: PaddleCircle):
        puckMiddleX = self.__puckPosition.x
        puckMiddleY = self.__puckPosition.y

        paddleLLeft, paddleLRight, paddleLTop, paddleLBottom, paddleLMiddleX, paddleLMiddleY = paddleL.getSides()
        paddleRLeft, paddleRRight, paddleRTop, paddleRBottom, paddleRMiddleX, paddleRMiddleY = paddleR.getSides()

        distL = math.sqrt((paddleLMiddleX - puckMiddleX)**2 + (paddleLMiddleY - puckMiddleY)**2)
        distR = math.sqrt((paddleRMiddleX - puckMiddleX)**2 + (paddleRMiddleY - puckMiddleY)**2)
        minDist = paddleL.getRadius() + self.__radius

        if (distL <= minDist):
            self.__calcReflection(paddleL, distL)
        if (distR <= minDist):
            self.__calcReflection(paddleR, distR)

    def __calcReflection(self, paddle: PaddleCircle, dist):
        paddlePosition = paddle.getPaddlePosition()
        xDir = 0
        yDir = 0

        if (paddlePosition.x < self.__puckPosition.x):
            xDir = 1
        elif (paddlePosition.x > self.__puckPosition.x):
            xDir = -1
        else:
            xDir = 0
        if (paddlePosition.y < self.__puckPosition.y):
            yDir = 1
        elif (paddlePosition.y > self.__puckPosition.y):
            yDir = -1
        else:
            yDir = 0

        xDisplace, yDisplace = self.__calcReflectionPoints(paddle, dist)
        collisionPoint = pygame.Vector2(paddlePosition.x, paddlePosition.y)

        collisionPoint.x += xDisplace * xDir
        collisionPoint.y += yDisplace * yDir
        
        unitVector = pygame.Vector2(xDisplace * xDir / dist, yDisplace * yDir / dist)
        tanVector = pygame.Vector2(-unitVector.y, unitVector.x)
        incidenceVector = pygame.Vector2(self.__xSpeed, self.__ySpeed)

        vectorThetaR = self.__getThetaBetweenVectors(incidenceVector, tanVector)
        negTanVector = pygame.Vector2(-tanVector.x, -tanVector.y)

        reflectVector = self.__rotateVector(negTanVector, -vectorThetaR)
        reflectVector.x = reflectVector.x * self.__speed
        reflectVector.y = reflectVector.y * self.__speed

        self.__xSpeed = reflectVector.x
        self.__ySpeed = reflectVector.y

    def __rotateVector(self, vector, thetaR):
        x = (vector.x * math.cos(thetaR)) - (vector.y * math.sin(thetaR))
        y = (vector.x * math.sin(thetaR)) + (vector.y * math.cos(thetaR))
        returnVector = pygame.Vector2(-x, -y)
        return returnVector

    def __getThetaBetweenVectors(self, vector1, vector2):
        lenVector1 = math.sqrt((vector1.x)**2 + (vector1.y)**2)
        lenVector2 = math.sqrt((vector2.x)**2 + (vector2.y)**2)

        dotProduct = (vector1.x * vector2.x) + (vector1.y * vector2.y)
        thetaR = math.acos(dotProduct / (lenVector1 * lenVector2))

        return thetaR
    
    def __calcReflectionPoints(self, paddle: PaddleCircle, dist):
        paddlePosition = paddle.getPaddlePosition()
        
        yDist = self.__puckPosition.y - paddlePosition.y

        theta = math.asin(abs(yDist / dist))

        returnY = math.sin(theta) * paddle.getRadius()
        returnX = math.cos(theta) * paddle.getRadius()

        return returnX, returnY

    def __checkCollision(self, screen):
        puckLeft, puckRight, puckUp, puckDown, puckMiddleX, puckMiddleY = self.getSides()

        if (puckLeft <= 0):
            if (self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
                self.__pointScored = "r"
        elif (puckRight >= screen.get_width()):
            if (self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
                self.__pointScored = "l"
        if (puckUp <= 0):
            self.__hitsTopWall()
        elif (puckDown >= screen.get_height()):
            self.__hitsBottomWall()

    def __onScreen(self, screen):
        puckLeft = self.__puckPosition.x - self.__radius
        puckRight = self.__puckPosition.x + self.__radius

        if (puckRight < -30 or puckLeft > screen.get_width() + 30):
            self.__puckPosition.x = screen.get_width()/2
            self.__ySpeed = 0
            self.__puckPosition.y = screen.get_height()/2
            self.__pointScored = False

    def resetPosition(self, screen, speed):
        self.__puckPosition = pygame.Vector2(screen.get_width() / 2, screen.get_height() / 2)
        self.__radius = screen.get_height() / 24
        self.__xSpeed = speed * 1.05 if self.__xSpeed > 0 else speed * -1.05
        self.__speed = speed * 1.05
        self.__ySpeed = 0

    def __hitsTopWall(self):
        self.__ySpeed = abs(self.__ySpeed)

    def __hitsBottomWall(self):
        self.__ySpeed = abs(self.__ySpeed) * -1

    def getSides(self):
        puckLeft = self.__puckPosition.x - self.__radius
        puckRight = self.__puckPosition.x + self.__radius
        puckTop = self.__puckPosition.y - self.__radius
        puckBottom = self.__puckPosition.y + self.__radius
        puckMiddleX = self.__puckPosition.x
        puckMiddleY = self.__puckPosition.y

        return puckLeft, puckRight, puckTop, puckBottom, puckMiddleX, puckMiddleY


    def getPointScored(self):
        return self.__pointScored
    
    def getPuckPosition(self):
        return self.__puckPosition
    
    
    def setPointScored(self, pointScored):
        self.__pointScored = pointScored

    def setPuckPosition(self, puckPosition):
        self.__puckPosition = puckPosition

    def setXSpeed(self, speed):
        self.__xSpeed = speed

    def setYSpeed(self, speed):
        self.__ySpeed = speed

    def setIsMoving(self, isMoving):
        self.__isMoving = isMoving