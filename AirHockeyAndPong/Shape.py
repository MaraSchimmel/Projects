from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def __init__(self, color):
        self.__color = color
        
    def getColor(self):
        return self.__color
    
    @abstractmethod
    def move(self, screen):
        pass

    @abstractmethod
    def getSides(self):
        pass