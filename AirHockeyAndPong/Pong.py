from Ball import Ball
from PaddleRect import PaddleRect
from Constants import *
import pygame
import math

class Pong():
    def createObjects(self, screenObj):
        width = screenObj.current_w
        height = screenObj.current_h
        self.__screen = pygame.display.set_mode((width, height), pygame.RESIZABLE)

        ballPosition = pygame.Vector2(self.__screen.get_width() / 2, self.__screen.get_height() / 2)
        self.__ball = Ball(CIRCLE_COLOR, ballPosition, CIRCLE_RADIUS, False)

        self.__paddleL = PaddleRect(PADDLE_COLOR, PADDLE_WIDTH, PADDLE_HEIGHT, 10, 10, "l", False)
        rectRXPos = self.__screen.get_width() - PADDLE_WIDTH - 10
        self.__paddleSpeed = 5
        self.__paddleR = PaddleRect(PADDLE_COLOR, PADDLE_WIDTH, PADDLE_HEIGHT, rectRXPos, 10, "r", False)

        self.__resizeWindow()
        self.__gameInProgress = True
        self.__isMoving = False

    def __resizeWindow(self):
        self.__paddleSpeed = self.__screen.get_height() / 60
        self.__ball.resetPosition(self.__screen, self.__paddleSpeed)
        self.__paddleL.resetPosition(self.__screen)
        self.__paddleR.resetPosition(self.__screen)

        self.__scoreFontSize = math.floor(self.__screen.get_width() / 50)
        self.__winnerFontSize = math.floor(self.__screen.get_width() / 20)

    def __setMoving(self, isMoving):
        self.__isMoving = isMoving
        self.__ball.setIsMoving(self.__isMoving)
        self.__paddleL.setIsMoving(self.__isMoving)
        self.__paddleR.setIsMoving(self.__isMoving)

    def run(self):
        pygame.init()

        clock = pygame.time.Clock()
        running = True

        scoreFnt = pygame.font.SysFont("Sans", math.floor(self.__screen.get_width() / 50))
        winnerFnt = pygame.font.SysFont("Sans", math.floor(self.__screen.get_width() / 20))
        lPoints = 0
        rPoints = 0
    
        winnerLTxt = winnerFnt.render("Player 1 wins", True, (255,255,255))
        winnerRTxt = winnerFnt.render("Player 2 wins", True, (255,255,255))

        winnerLWidth = winnerLTxt.get_width()
        winnerRWidth = winnerRTxt.get_width()

        while running:            

            keys = pygame.key.get_pressed()

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False

                if event.type == pygame.VIDEORESIZE:
                    self.__resizeWindow()
                    scoreFnt = pygame.font.SysFont("Sans", self.__scoreFontSize)
                    winnerFnt = pygame.font.SysFont("Sans", self.__winnerFontSize)
                    winnerLTxt = winnerFnt.render("Player 1 wins", True, (255,255,255))
                    winnerRTxt = winnerFnt.render("Player 2 wins", True, (255,255,255))
                    winnerLWidth = winnerLTxt.get_width()
                    winnerRWidth = winnerRTxt.get_width()
                    print("font size", self.__scoreFontSize)

                if event.type == pygame.KEYDOWN:
                    keys = pygame.key.get_pressed()
                    if keys[pygame.K_ESCAPE]:
                        running = False
                    elif (keys[pygame.K_SPACE] and not self.__gameInProgress):
                        self.__resizeWindow()
                        self.__gameInProgress = True
                        lPoints = 0
                        rPoints = 0
                        self.__ball.setYSpeed(0)
                        self.__ball.setPointScored(False)
                    elif (keys[pygame.K_SPACE] and self.__gameInProgress and not self.__isMoving):
                        self.__setMoving(True)
                        self.__ball.setPointScored(False)
                        self.__resizeWindow()
                    elif keys[pygame.K_r]:
                        self.__resizeWindow()
                        self.__gameInProgress = True
                        lPoints = 0
                        rPoints = 0
                        self.__ball.setPointScored(False)
                        self.__setMoving(False)

            
            if keys[pygame.K_w]:
                self.__paddleL.move(self.__screen, -self.__paddleSpeed, "y")
            elif keys[pygame.K_s]:
                self.__paddleL.move(self.__screen, self.__paddleSpeed, "y")
            if keys[pygame.K_a]:
                self.__paddleL.move(self.__screen, -self.__paddleSpeed, "x")
            elif keys[pygame.K_d]:
                self.__paddleL.move(self.__screen, self.__paddleSpeed, "x")
            if keys[pygame.K_i]:
                self.__paddleR.move(self.__screen, -self.__paddleSpeed, "y")
            elif keys[pygame.K_k]:
                self.__paddleR.move(self.__screen, self.__paddleSpeed, "y")
            if keys[pygame.K_j]:
                self.__paddleR.move(self.__screen, -self.__paddleSpeed, "x")
            elif keys[pygame.K_l]:
                self.__paddleR.move(self.__screen, self.__paddleSpeed, "x")


            scoreStr = str(lPoints) + ":" + str(rPoints)
            scoreTxt = scoreFnt.render(scoreStr, True, (255, 255, 255))
            scoreWidth = scoreTxt.get_width()

            
            if (lPoints >= 3 or rPoints >= 3):
                self.__screen.fill(BACKGROUND_COLOR)
                self.__screen.blit(scoreTxt, ((self.__screen.get_width() / 2) - (scoreWidth / 2), 10))
                self.__gameInProgress = False
                if (lPoints >= 3):
                    self.__screen.blit(winnerLTxt, ((self.__screen.get_width() / 2) - (winnerLWidth / 2), self.__screen.get_height() / 2))
                else:
                    self.__screen.blit(winnerRTxt, ((self.__screen.get_width() / 2) - (winnerRWidth / 2), self.__screen.get_height() / 2))
            
            if (self.__gameInProgress):
                self.__screen.fill(BACKGROUND_COLOR)
                self.__screen.blit(scoreTxt, (self.__screen.get_width() / 2 - (scoreWidth / 2), 10))
                self.__paddleL.draw(self.__screen)
                self.__paddleR.draw(self.__screen)
                self.__ball.move(self.__screen, self.__paddleL, self.__paddleR)
                if (self.__ball.getPointScored()  == "l" or self.__ball.getPointScored()  == "r"):
                    if (self.__ball.getPointScored()  == "l"):
                        lPoints += 1
                    else:
                        rPoints += 1

                    self.__setMoving(False)
                    self.__resizeWindow()
                    self.__ball.setPointScored(True)

            if (not self.__gameInProgress or (self.__gameInProgress and lPoints == 0 and rPoints == 0 and not self.__isMoving)):
                startTxt = scoreFnt.render("Press space to start", True, TEXT_COLOR)
                startWidth = startTxt.get_width()
                self.__screen.blit(startTxt, (self.__screen.get_width() / 2 - (startWidth / 2), self.__screen.get_height() * 6 / 7))
            elif (self.__gameInProgress and not self.__isMoving):
                continueTxt = scoreFnt.render("Press space to continue", True, TEXT_COLOR)
                continueWidth = continueTxt.get_width()
                self.__screen.blit(continueTxt, (self.__screen.get_width() / 2 - (continueWidth / 2), self.__screen.get_height() * 6 / 7))


            pygame.display.flip()
            clock.tick(60)
        pygame.quit()