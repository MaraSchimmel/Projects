from Shape import Shape
import pygame

class PaddleRect(Shape):
    def __init__(self, color, width, height, xPos, yPos, lOrR, isMoving):
        super().__init__(color)
        self.__width = width
        self.__height = height
        self.__xPos = xPos
        self.__yPos = yPos
        self.__lOrR = lOrR
        self.__isMoving = isMoving
        self.__rect = pygame.Rect(xPos, yPos, width, height)
        
    def __createRect(self):
        self.__rect = pygame.Rect(self.__xPos, self.__yPos, self.__width, self.__height)

    def draw(self, screen):
        pygame.draw.rect(screen, self.getColor(),self.__rect)

    def move(self, screen, amount, xOrY):
        if (not self.__isMoving):
            return
        if self.__checkWallCollision(screen, amount, xOrY):
            return
        if xOrY == "x":
            self.__xPos += amount
        else:
            self.__yPos += amount
        self.__createRect()
            
    def __checkWallCollision(self, screen, amount, xOrY):
        if (xOrY == "y"):
            if (self.__yPos <= 0 and amount < 0):
                return True
            elif ((self.__yPos + self.__height) >= screen.get_height() and amount > 0):
                return True
        else: # xOrY == "x"
            if (self.__lOrR == "l"):
                if (self.__xPos <= 10 and amount < 0):
                    return True
                elif ((self.__xPos + self.__width) >= (screen.get_width() / 2) and amount > 0):
                    return True
            else:
                if (self.__xPos <= (screen.get_width() / 2) and amount < 0):
                    return True
                elif ((self.__xPos + self.__width) >= (screen.get_width() - 10) and amount > 0):
                    return True
        return False
    
    def resetPosition(self, screen):
        self.__height = screen.get_height() / 4
        if self.__lOrR == "r":
            self.__xPos = screen.get_width() - self.__width - 10
        else:
            self.__xPos = 10
        self.__yPos = screen.get_height() / 2 - self.__height / 2
        self.__createRect()
    
    def getSides(self):
        paddleLeft = self.__xPos
        paddleRight = self.__xPos + self.__width
        paddleTop = self.__yPos
        paddleBottom  = self.__yPos + self.__height

        return paddleLeft, paddleRight, paddleTop, paddleBottom


    def getWidth(self):
        return self.__width
    
    def getHeight(self):
        return self.__height
    
    def getXPos(self):
        return self.__xPos
    
    def getYPos(self):
        return self.__yPos
    
    def getLOrR(self):
        return self.__lOrR
    
    
    def setXPos(self, xPos):
        self.__xPos = xPos

    def setYPos(self, yPos):
        self.__yPos = yPos

    def setHeight(self, height):
        self.__height = height

    def setIsMoving(self, isMoving):
        self.__isMoving = isMoving