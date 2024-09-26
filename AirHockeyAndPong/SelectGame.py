import pygame
from Constants import *
from AirHockey import *
from Pong import *
import math

class SelectGame():
    def createObjects(self):
        self.__screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.RESIZABLE)
        self.__fontSize = FONT_SIZE_LARGE
        self.__fontSizeMedium = FONT_SIZE_MEDIUM
        self.__fontSizeSmall = FONT_SIZE_SMALL

    def __startAirHockey(self):
        airHockey = AirHockey()
        airHockey.createObjects(self.__screenObj)
        airHockey.run()

    def __startPong(self):
        pong = Pong()
        pong.createObjects(self.__screenObj)
        pong.run()

    def __resizeWindow(self):
        self.__fontSize = math.floor(self.__screen.get_width() / 20)
        self.__fontSizeMedium = math.floor(self.__screen.get_width() / 30)
        self.__fontSizeSmall = math.floor(self.__screen.get_width() / 50)
        self.__fnt = pygame.font.SysFont("Sans", self.__fontSize)
        self.__fntMedium = pygame.font.SysFont("Sans", self.__fontSizeMedium)
        self.__fntSmall = pygame.font.SysFont("Sans", self.__fontSizeSmall)
        self.__txtLine1 = self.__fnt.render("Select a game:", True, TEXT_COLOR)
        self.__txtLine2 = self.__fnt.render("1: Pong      2: Air Hockey", True, TEXT_COLOR)
        self.__instructionsTxt = self.__fntMedium.render("Press 1 or 2 to begin", True, TEXT_COLOR)
        self.__txtWidth1 = self.__txtLine1.get_width()
        self.__txtWidth2 = self.__txtLine2.get_width()
        self.__txtWidthInstructions = self.__instructionsTxt.get_width()

        self.__txtLabel = self.__fnt.render("Controls:", True, TEXT_COLOR)
        self.__txtWasd = self.__fntMedium.render("WASD: Player 1 controls", True, TEXT_COLOR)
        self.__txtIjkl = self.__fntMedium.render("IJKL: Player 2 controls", True, TEXT_COLOR)
        self.__txtEsc = self.__fntMedium.render("ESCAPE: Exit the game", True, TEXT_COLOR)
        self.__txtSpace = self.__fntMedium.render("SPACE: Activate Ball", True, TEXT_COLOR)
        self.__txtR = self.__fntMedium.render("R: Reset game", True, TEXT_COLOR)
        self.__txtContinue = self.__fntSmall.render("Press space to continue", True, TEXT_COLOR)

        self.__labelWidth = self.__txtLabel.get_width()
        self.__wasdWidth = self.__txtWasd.get_width()
        self.__ijklWidth = self.__txtIjkl.get_width()
        self.__escWidth = self.__txtEsc.get_width()
        self.__spaceWidth = self.__txtSpace.get_width()
        self.__rWidth = self.__txtR.get_width()
        self.__continueWidth = self.__txtContinue.get_width()
    
    def run(self):
        pygame.init()

        clock = pygame.time.Clock()
        running = True

        gameSelected = False

        self.__fnt = pygame.font.SysFont("Sans", self.__fontSize)
        self.__fntMedium = pygame.font.SysFont("Sans", self.__fontSizeMedium)
        self.__fntSmall = pygame.font.SysFont("Sans", self.__fontSizeSmall)

        self.__txtLine1 = self.__fnt.render("Select a game:", True, TEXT_COLOR)
        self.__txtLine2 = self.__fnt.render("1: Pong      2: Air Hockey", True, TEXT_COLOR)
        self.__instructionsTxt = self.__fntMedium.render("Press 1 or 2 to begin", True, TEXT_COLOR)

        self.__txtWidth1 = self.__txtLine1.get_width()
        self.__txtWidth2 = self.__txtLine2.get_width()
        self.__txtWidthInstructions = self.__instructionsTxt.get_width()


        self.__txtLabel = self.__fnt.render("Controls:", True, TEXT_COLOR)
        self.__txtWasd = self.__fntMedium.render("WASD: Player 1 controls", True, TEXT_COLOR)
        self.__txtIjkl = self.__fntMedium.render("IJKL: Player 2 controls", True, TEXT_COLOR)
        self.__txtEsc = self.__fntMedium.render("ESCAPE: Exit the game", True, TEXT_COLOR)
        self.__txtSpace = self.__fntMedium.render("SPACE: Activate Ball", True, TEXT_COLOR)
        self.__txtR = self.__fntMedium.render("R: Reset game", True, TEXT_COLOR)
        self.__txtContinue = self.__fntSmall.render("Press space to continue", True, TEXT_COLOR)

        self.__labelWidth = self.__txtLabel.get_width()
        self.__wasdWidth = self.__txtWasd.get_width()
        self.__ijklWidth = self.__txtIjkl.get_width()
        self.__escWidth = self.__txtEsc.get_width()
        self.__spaceWidth = self.__txtSpace.get_width()
        self.__rWidth = self.__txtR.get_width()
        self.__continueWidth = self.__txtContinue.get_width()



        airHockey = False
        pong = False

        while running:
            keys = pygame.key.get_pressed()

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if event.type == pygame.VIDEORESIZE:
                    self.__resizeWindow()

                if event.type == pygame.KEYDOWN:
                    keys = pygame.key.get_pressed()
                    if keys[pygame.K_ESCAPE]:
                        pong = False
                        airHockey = False
                        running = False
                    elif keys[pygame.K_1] and not gameSelected:
                        pong = True
                        gameSelected = True
                    elif keys[pygame.K_2] and not gameSelected:
                        airHockey = True
                        gameSelected = True
                    elif keys[pygame.K_SPACE] and gameSelected:
                        running = False

            self.__screen.fill(BACKGROUND_COLOR)
            if (not gameSelected):
                self.__screen.blit(self.__txtLine1, ((self.__screen.get_width() / 2) - (self.__txtWidth1 / 2), self.__screen.get_height() * .75 / 3))
                self.__screen.blit(self.__txtLine2, ((self.__screen.get_width() / 2) - (self.__txtWidth2 / 2), self.__screen.get_height() * 1.5 / 3))
                self.__screen.blit(self.__instructionsTxt, ((self.__screen.get_width() / 2) - (self.__txtWidthInstructions / 2), self.__screen.get_height() * 2.5 / 3))
            else:
                self.__screen.blit(self.__txtLabel, ((self.__screen.get_width() / 2) - self.__labelWidth / 2, self.__screen.get_height() * .25 / 3))
                self.__screen.blit(self.__txtWasd, ((self.__screen.get_width() / 2) - self.__wasdWidth / 2, self.__screen.get_height() * 1 / 3))
                self.__screen.blit(self.__txtIjkl, ((self.__screen.get_width() / 2) - self.__ijklWidth / 2, self.__screen.get_height() * 1.25 / 3))
                self.__screen.blit(self.__txtSpace, ((self.__screen.get_width() / 2) - self.__spaceWidth / 2, self.__screen.get_height() * 1.5 / 3))
                self.__screen.blit(self.__txtR, ((self.__screen.get_width() / 2) - self.__rWidth / 2, self.__screen.get_height() * 1.75 / 3))
                self.__screen.blit(self.__txtEsc, ((self.__screen.get_width() / 2) - self.__escWidth / 2, self.__screen.get_height() * 2 / 3))
                self.__screen.blit(self.__txtContinue, ((self.__screen.get_width() / 2) - self.__continueWidth / 2, self.__screen.get_height() * 2.5 / 3))
            pygame.display.flip()
            clock.tick(60)

        self.__screenObj = pygame.display.Info()
        pygame.quit()
        if airHockey:
            self.__startAirHockey()
        elif pong:
            self.__startPong()