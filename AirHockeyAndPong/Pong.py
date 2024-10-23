from Ball import Ball
from PaddleRect import PaddleRect
from Particle import Particle
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

        self.__gameInProgress = True
        self.__isMoving = False

        self.__particles = []
        self.__complexity = ""
        self.__lastCreated = 0
        self.__sExample = []
        self.__cExample = []
        
        self.__resizeWindow()

    def __toggleParticles(self, complexity):
        match complexity:
            case "":
                self.__complexity = ""
            case "s":
                if self.__complexity == "s":
                    self.__complexity = ""
                else:
                    self.__complexity = "s"
            case "c":
                if self.__complexity == "c":
                    self.__complexity = ""
                else:
                    self.__complexity = "c"
        self.__particles.clear()

    def __drawComplexity(self):
        if self.__complexity == "s":
            for pt in self.__sExample:
                pt.draw(self.__screen)
        elif self.__complexity == "c":
            for pt in self.__cExample:
                pt.draw(self.__screen)

    def __createComplexityExamples(self):
        self.__sExample.clear()
        self.__cExample.clear()

        complexities = ["s", "c"]
        for complexity in complexities:
            emitterRadius = self.__scoreFontSize
            emitterPosition = pygame.Vector2(self.__screen.get_width() / 2 + emitterRadius, self.__screen.get_height() * 6.6 / 7)
            emitter = Ball(CIRCLE_COLOR, emitterPosition, emitterRadius, False)
            for i in range(4, -1, -1):
                newParticle = Particle(emitter, complexity, "p")
                newAge = math.floor((i * 1.0) / 5.0 * newParticle.getLifespan())
                newParticle.setAge(newAge)
                newParticle.calcTransparency()
                emitterPosition.x -= emitterRadius / 2
                if complexity == "s":
                    self.__sExample.append(newParticle)
                elif complexity == "c":
                    self.__cExample.append(newParticle)

    def __createParticles(self, currentTime):
        if (not self.__isMoving or currentTime - self.__lastCreated < 2):
            return
        self.__lastCreated = currentTime
        newParticle = Particle(self.__ball, self.__complexity, "p")
        self.__particles.append(newParticle)
    
    def __updateParticles(self):
        if (not self.__isMoving):
            return
        returnParticles = []

        for particle in self.__particles:
            particle.updateAge()
            particle.calcTransparency()
            if (not particle.isDead()):
                returnParticles.append(particle)

        self.__particles = returnParticles
                    
    def __drawParticles(self):
        for particle in self.__particles:
            particle.draw(self.__screen)

    def __resizeWindow(self):
        self.__paddleSpeed = self.__screen.get_height() / 60
        self.__ball.resetPosition(self.__screen, self.__paddleSpeed)
        self.__paddleL.resetPosition(self.__screen)
        self.__paddleR.resetPosition(self.__screen)

        self.__scoreFontSize = math.floor(self.__screen.get_width() / 50)
        self.__winnerFontSize = math.floor(self.__screen.get_width() / 20)

        self.__createComplexityExamples()

    def __setMoving(self, isMoving):
        if (not isMoving):
            self.__particles.clear()
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

        currentTime = 0

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
                    elif keys[pygame.K_0]:
                        self.__toggleParticles("")
                    elif keys[pygame.K_1]:
                        self.__toggleParticles("s")
                    elif keys[pygame.K_2]:
                        self.__toggleParticles("c")

            
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
                self.__createParticles(currentTime)
                self.__updateParticles()
                self.__drawParticles()
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

            spaceTxt = ""
            if (not self.__gameInProgress or (self.__gameInProgress and lPoints == 0 and rPoints == 0 and not self.__isMoving)):
                spaceTxt = scoreFnt.render("Press space to start", True, TEXT_COLOR)
            elif (self.__gameInProgress and not self.__isMoving):
                spaceTxt = scoreFnt.render("Press space to continue", True, TEXT_COLOR)
            if (spaceTxt != ""):
                spaceWidth = spaceTxt.get_width()
                self.__screen.blit(spaceTxt, (self.__screen.get_width() / 2 - (spaceWidth / 2), self.__screen.get_height() * 6 / 7))
                if (self.__complexity != "" and self.__gameInProgress):
                    self.__drawComplexity()


            pygame.display.flip()
            currentTime += 1
            clock.tick(60)
        pygame.quit()