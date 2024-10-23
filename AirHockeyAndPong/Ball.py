from Shape import Shape
from PaddleRect import PaddleRect
import pygame
import math

class Ball(Shape):
    def __init__(self, color, ballPosition, radius, isMoving):
        Shape.__init__(self, color)
        self.__radius = radius
        self.__ballPosition = ballPosition
        self.__xSpeed = 5
        self.__ySpeed = 0
        self.__theta = 0
        self.__pointScored = False
        self.__isMoving = isMoving

    def move(self, screen, paddleL: PaddleRect, paddleR: PaddleRect):
        if (not self.__isMoving):
            pygame.draw.circle(screen, self.getColor(), self.__ballPosition, self.__radius)
            return
        
        if (self.__pointScored == True and (self.__pointScored != "r" and self.__pointScored != "l")):
            self.__onScreen(screen)
        elif(self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
            self.__checkCollision(screen)
            self.__checkPaddleCollision(paddleL, paddleR)

        self.__ballPosition.x += self.__xSpeed
        self.__ballPosition.y += self.__ySpeed
        pygame.draw.circle(screen, self.getColor(),self.__ballPosition, self.__radius)

    def __checkPaddleCollision(self, paddleL: PaddleRect, paddleR: PaddleRect):
        ballLeft, ballRight, ballTop, ballBottom, ballMiddleX, ballMiddleY = self.getSides()

        paddleLLeft, paddleLRight, paddleLTop, paddleLBottom = paddleL.getSides()
        paddleRLeft, paddleRRight, paddleRTop, paddleRBottom = paddleR.getSides()

        if ((ballLeft <= paddleLRight and ballLeft >= paddleLLeft) or (ballLeft <= paddleLLeft and ballMiddleX >= paddleLRight)):
            if (self.__ballPosition.y <= paddleLBottom and self.__ballPosition.y >= paddleLTop):
                self.__xSpeed = abs(self.__xSpeed)
                self.__getPaddleSegment(paddleL, self.__ballPosition.y)
            elif (ballTop <= paddleLBottom and ballTop >= paddleLTop):
                self.__xSpeed = abs(self.__xSpeed)
                self.__getPaddleSegment(paddleL, ballTop)
            elif (ballBottom <= paddleLBottom and ballBottom >= paddleLTop):
                self.__xSpeed = abs(self.__xSpeed)
                self.__getPaddleSegment(paddleL, ballBottom)
        if ((ballRight >= paddleRLeft and ballRight <= paddleRRight) or (ballRight >= paddleRLeft and ballMiddleX <= paddleRRight)):
            if (self.__ballPosition.y <= paddleRBottom and self.__ballPosition.y >= paddleRTop):
                self.__xSpeed = abs(self.__xSpeed) * -1
                self.__getPaddleSegment(paddleR, self.__ballPosition.y)
            elif (ballTop <= paddleRBottom and ballTop >= paddleRTop):
                self.__xSpeed = abs(self.__xSpeed) * -1
                self.__getPaddleSegment(paddleR, ballTop)
            elif (ballBottom <= paddleRBottom and ballBottom >= paddleRTop):
                self.__xSpeed = abs(self.__xSpeed) * -1
                self.__getPaddleSegment(paddleR, ballBottom)

    def __getPaddleSegment(self, paddle: PaddleRect, ballPoint):
        increment = paddle.getHeight() / 5
        paddleTop = paddle.getYPos()
        if (ballPoint >= paddleTop and ballPoint < (paddleTop + increment)):
            self.__theta = -50
        elif (ballPoint >= (paddleTop + increment) and ballPoint < (paddleTop + 2*increment)):
            self.__theta = -30
        elif (ballPoint >= (paddleTop + 2*increment) and ballPoint <= (paddleTop + 3*increment)):
            self.__theta = 0
        elif (ballPoint > (paddleTop + 3*increment) and ballPoint <= (paddleTop + 4*increment)):
            self.__theta = 30
        elif (ballPoint > (paddleTop + 4*increment) and ballPoint <= (paddleTop + 5*increment)):
            self.__theta = 50
        self.__calcYSpeed()

    def __checkCollision(self, screen):
        ballLeft, ballRight, ballUp, ballDown, ballMiddleX, ballMiddleY = self.getSides()

        if (ballLeft <= 0):
            if (self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
                self.__pointScored = "r"
        elif (ballRight >= screen.get_width()):
            if (self.__pointScored == False and (self.__pointScored != "r" and self.__pointScored != "l")):
                self.__pointScored = "l"
        if (ballUp <= 0):
            self.__hitsTopWall()
        elif (ballDown >= screen.get_height()):
            self.__hitsBottomWall()

    def __onScreen(self, screen):
        ballLeft = self.__ballPosition.x - self.__radius
        ballRight = self.__ballPosition.x + self.__radius

        if (ballRight < -30 or ballLeft > screen.get_width() + 30):
            self.__ballPosition.x = screen.get_width()/2
            self.__ySpeed = 0
            self.__theta = 0
            self.__ballPosition.y = screen.get_height()/2
            self.__pointScored = False

    def resetPosition(self, screen, speed):
        self.__ballPosition = pygame.Vector2(screen.get_width() / 2, screen.get_height() / 2)
        self.__radius = screen.get_height() / 20
        self.__xSpeed = speed if self.__xSpeed > 0 else -speed
        self.__ySpeed = 0

    def __calcYSpeed(self):
        thetaR = math.radians(self.__theta)
        self.__ySpeed = self.__xSpeed * math.tan(thetaR)
        self.__ySpeed = abs(self.__ySpeed) if self.__theta >= 0 else -1 * abs(self.__ySpeed)

    def __hitsTopWall(self):
        self.__ySpeed = abs(self.__ySpeed)

    def __hitsBottomWall(self):
        self.__ySpeed = abs(self.__ySpeed) * -1

    def getSides(self):
        ballLeft = self.__ballPosition.x - self.__radius
        ballRight = self.__ballPosition.x + self.__radius
        ballTop = self.__ballPosition.y - self.__radius
        ballBottom = self.__ballPosition.y + self.__radius
        ballMiddleX = self.__ballPosition.x
        ballMiddleY = self.__ballPosition.y

        return ballLeft, ballRight, ballTop, ballBottom, ballMiddleX, ballMiddleY
    

    def getPointScored(self):
        return self.__pointScored
    
    def getBallPosition(self):
        return self.__ballPosition.copy()
    
    def getRadius(self):
        return self.__radius


    def setPointScored(self, pointScored):
        self.__pointScored = pointScored

    def setBallPosition(self, ballPosition):
        self.__ballPosition = ballPosition

    def setXSpeed(self, speed):
        self.__xSpeed = speed

    def setYSpeed(self, speed):
        self.__ySpeed = speed

    def setIsMoving(self, isMoving):
        self.__isMoving = isMoving