from Shape import Shape
import pygame

class PaddleCircle(Shape):
    def __init__(self, color, paddlePosition, radius, lOrR, isMoving):
        super().__init__(color)
        self.__paddlePosition = paddlePosition
        self.__radius = radius
        self.__lOrR = lOrR
        self.__isMoving = isMoving

    def draw(self, screen):
        pygame.draw.circle(screen, self.getColor(),self.__paddlePosition, self.__radius)

    def move(self, screen, amount, xOrY):
        if (not self.__isMoving):
            return
        if self.__checkWallCollision(screen, amount, xOrY):
            return
        if xOrY == "x":
            self.__paddlePosition.x += amount
        else:
            self.__paddlePosition.y += amount  
                      
    def __checkWallCollision(self, screen, amount, xOrY):
        paddleLeft = self.__paddlePosition.x - self.__radius
        paddleRight = self.__paddlePosition.x + self.__radius
        paddleUp = self.__paddlePosition.y - self.__radius
        paddleDown = self.__paddlePosition.y + self.__radius
        if (xOrY == "y"):
            if (paddleUp <= 0 and amount < 0):
                return True
            elif (paddleDown >= screen.get_height() and amount > 0):
                return True
        else: # xOrY == "x"
            if (self.__lOrR == "l"):
                if (paddleLeft <= -10 and amount < 0):
                    return True
                elif (paddleRight >= (screen.get_width() / 2) and amount > 0):
                    return True
            else:
                if (paddleLeft <= (screen.get_width() / 2) and amount < 0):
                    return True
                elif (paddleRight >= (screen.get_width() - 10) and amount > 0):
                    return True
        return False
    
    def resetPosition(self, screen):
        self.__radius = screen.get_height() / 8
        if self.__lOrR == "r":
            self.__paddlePosition.x = screen.get_width() - self.__radius - 10
        else:
            self.__paddlePosition.x = self.__radius + 10
        self.__paddlePosition.y = screen.get_height() / 2

    def getSides(self):
        paddleLeft = self.__paddlePosition.x - self.__radius
        paddleRight = self.__paddlePosition.x + self.__radius
        paddleTop = self.__paddlePosition.y - self.__radius
        paddleBottom = self.__paddlePosition.y + self.__radius
        paddleMiddleX = self.__paddlePosition.x
        paddleMiddleY = self.__paddlePosition.y

        return paddleLeft, paddleRight, paddleTop, paddleBottom, paddleMiddleX, paddleMiddleY
    
    
    def getPaddlePosition(self):
        return self.__paddlePosition
    
    def getRadius(self):
        return self.__radius
    
    def getLOrR(self):
        return self.__lOrR
    

    def setPaddlePosition(self, paddlePosition):
        self.__paddlePosition = paddlePosition

    def setIsMoving(self, isMoving):
        self.__isMoving = isMoving