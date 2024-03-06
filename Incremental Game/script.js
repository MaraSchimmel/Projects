//*** THE NUMBER: make this go up ***//
let number = 0;            

//** Resources ***//



//*** Images ***//
document.getElementById("cursor-icon").hidden=true;
document.getElementById("axe-icon").hidden=true;
document.getElementById("crossbow-icon").hidden=true;
document.getElementById("upgrade-text").hidden=true;

//*** Hide upgrades ***//


// Increase the counter by this much on each button click
let clickIncrement = 1;
let swordStrength = 1;
let strongerSwordsCost = 100;

// Automatically increment by this much every second
let autoclickers = 0;            
let autoclickerCost = 10;
let autoclickerStrength = 1;
let autoclickerTotal = 0;
let autoclickerUpgradeCost = 100;

let axes = 0;
let axeCost = 500;
let axeStrength = 5;
let axeTotal = 0;
let axeUpgradeCost = 1000;

let crossbows = 0;
let crossbowCost = 1500;
let crossbowStrength = 20;
let crossbowTotal = 0;
let crossbowUpgradeCost = 15000;

let prestigeCost = 500;
let prestigeStrength = 1;
let prestigeVal = false;

//let cost = {['strongerSword', 100], ['autoclicker', 10]};

//*** Enemy ***//
let hp = 100;
let maxHp = 100;
let enemy = "pixies";
let numEnemiesKilled = 0;
let maxEnemies = 25;



//*** Achievement object ***//
achievements = {upAndRunning: false, industrialRevolution: false, forestry: false, twang: false, theFae: false, goopy: false, itsAlive: false, underTheBridge: false, herculaneum: false};

let winCon = false;
//*** Change function ***//
//
// Called by any action that changes the number
//
// amount: the amount to increment or decrement
function changeNumber(amount) {
    number += amount;

    // Update the number field    
    document.getElementById("number").innerHTML = number;
}


//*** Upgrade purchase functions ***//
//
// Each of these is triggered by clicking on its relevant
// name in the Upgrades menu

//*** Upgrade clicker ***//
function upgradeClicker() {
  //Check that the number is big enough to purchase
  if (number < autoclickerUpgradeCost) {
    return;
  }
  
  //Reduce the number to pay for the upgrade
  changeNumber(-autoclickerUpgradeCost);

  //Update strength and cost
  autoclickerStrength *= 2;
  autoclickerUpgradeCost = Math.round(Math.pow(autoclickerUpgradeCost, 1.25)/1.5);

  autoclickerTotal = autoclickerStrength * autoclickers;
  updateUpgradeDescription('clicker');
}

//***Upgrade Axes***//
function upgradeAxe() {
  //Check that the number is big enough to purchase
  if (number < axeUpgradeCost) {
    return;
  }
  
  //reduce the number to pay for the upgrade
  changeNumber(-axeUpgradeCost);

  //upgrade strength and cost
  axeStrength *= 2;
  axeUpgradeCost = Math.round(Math.pow(axeUpgradeCost, 1.25)/1.5);
  
  axeTotal = axeStrength * axes;
  updateUpgradeDescription('axe');
}

//***Upgrade Crossbows***//
function upgradeCrossbow() {
  //Check that the number is big enough to purchase
  if (number < crossbowUpgradeCost) {
    return;
  }
  
  //reduce the number to pay for the upgrade
  changeNumber(-crossbowUpgradeCost);

  //upgrade strength and cost
  crossbowStrength *= 2;
  crossbowUpgradeCost = Math.round(Math.pow(crossbowUpgradeCost,1.1)/1.5);

  crossbowTotal = crossbowStrength * axes;
  updateUpgradeDescription('crossbow');
}

function prestigeSword() {
  if (number < prestigeCost) {
    return;
  }
  
  changeNumber(-prestigeCost);
  let element = document.getElementById("sword-click");
  switch(enemy) {
    case "pixies":
      //element.src="silver-sword.png";
      prestigeCost = 2000;
      break;
    case "slimes":
      //element.src="slime-sword.png";
      prestigeCost = 5000;
      break;
    case "trees":
      prestigeCost = 10000;
      break;
    case "trolls":
      prestigeCost = 15000;
      break;
    case "hydras":
      prestigeCost += 5000;
      break;
    case "head2":
    case "head3":
    case "head1":
      prestigeCost += 2500;
      break;
  }
  
  prestigeStrength += 1;
  clickIncrement = prestigeStrength * swordStrength;
  document.getElementById("num-swords-strength").innerHTML = clickIncrement;
  prestigeVal = true;
  document.getElementById("prestige-sword").classList.add("close");
  document.getElementById("upgrade-text").hidden=true;
}

function updateUpgradeDescription(text) {
  document.getElementById("upgrade-text").hidden=false;
  switch(text) { //Change update text
    case "clicker":
      document.getElementById("upgrade-text-description").innerHTML = "Double the strength of autoclickers";
      document.getElementById("upgrade-text-cost").innerHTML = autoclickerUpgradeCost;
      document.getElementById("upgrade-text-strength").innerHTML = "Autoclicker strength: " + autoclickerStrength;
      break;
      
    case "axe":
      document.getElementById("upgrade-text-description").innerHTML = "Double the strength of axes";
      document.getElementById("upgrade-text-cost").innerHTML = axeUpgradeCost;
      document.getElementById("upgrade-text-strength").innerHTML = "Axe strength: " + axeStrength;
      break;

    case "crossbow":
      document.getElementById("upgrade-text-description").innerHTML = "Doubles the strength of crossbows";
      document.getElementById("upgrade-text-cost").innerHTML = crossbowUpgradeCost;
      document.getElementById("upgrade-text-strength").innerHTML = "Crossbow strength: " + crossbowStrength;
      break;

    case "sword":
      document.getElementById("upgrade-text-description").innerHTML = "Prestige to the next sword";
      document.getElementById("upgrade-text-cost").innerHTML = prestigeCost;
      document.getElementById("upgrade-text-strength").innerHTML = "Prestige strength: " + prestigeStrength;
      break;
  }
}

function closeUpgrades() {
  document.getElementById("upgrade-text").hidden=true;
}

//*** Buy an autoclicker ***//
function buyAutoclicker() {
    // Check that the number is big enough to purchase
    if (number < autoclickerCost) {
        return;
    }

    //Show autoclicker
    if (enemy == "slimes") {
      document.getElementById("cursor-icon").hidden=false;
    }

    // Reduce the number to pay for the upgrade
    changeNumber(-autoclickerCost);

    // Add one more autoclicker
    autoclickers += 1;
    document.getElementById("num-autoclickers").innerHTML = autoclickers;

    // Upgrade cost scales nonlinearly
    // There's nothing special about this function choice    
    if (autoclickerCost < 500) {
      autoclickerCost = Math.round(Math.pow(autoclickerCost, 1.25)/1.5);
    }
    else {
      autoclickerCost = Math.round(Math.pow(autoclickerCost, 1.1)/1.5);
    }
    document.getElementById("autoclicker-cost").innerHTML = autoclickerCost;

    autoclickerTotal = autoclickerStrength * autoclickers;
}

//*** Increase sword strength ***//
function buyStrongerSwords() {
    if (number < strongerSwordsCost) {
        return;
    }

    changeNumber(-strongerSwordsCost);

    swordStrength *= 2;
    let test = "num-swords-strength";
    clickIncrement = swordStrength * prestigeStrength;
    //document.getElementById("num-swords-strength").innerHTML = clickIncrement;
    document.getElementById(test).innerHTML = clickIncrement;

    strongerSwordsCost = Math.round(Math.pow(strongerSwordsCost, 1.15)/1.5);
    document.getElementById("stronger-swords-cost").innerHTML = strongerSwordsCost;
}

//*** Buy an axe ***//
function buyAxe() {
  if (number < axeCost) {
    return;
  }

  changeNumber(-axeCost);

  if (enemy == "trees") {
    document.getElementById("axe-icon").hidden=false;
  }


  axes += 1;
  document.getElementById("num-axes").innerHTML = axes;

  axeCost = Math.round(Math.pow(axeCost, 1.1)/1.5);
  document.getElementById("axe-cost").innerHTML = axeCost;

  axeTotal = axes * axeStrength;
}

function buyCrossbow() {
    // Check that the number is big enough to purchase
    if (number < crossbowCost) {
        return;
    }

    //Show crossbow
    if (enemy == "trolls") {
      document.getElementById("crossbow-icon").hidden=false;
    }

    // Reduce the number to pay for the upgrade
    changeNumber(-crossbowCost);

    // Add one more crossbow
    crossbows += 1;
    document.getElementById("num-crossbows").innerHTML = crossbows;

    // Upgrade cost scales nonlinearly    
    crossbowCost = Math.round(Math.pow(crossbowCost, 1.1)/1.5);
    document.getElementById("crossbow-cost").innerHTML = crossbowCost;

    crossbowTotal = crossbowStrength * crossbows;
}

//*** Check achievements ***//
//
// Runs every cycle and posts any new achievements to the log
function checkAchievements() {
    if (number >= 1 && !achievements.upAndRunning) {
        achievements.upAndRunning = true;

        document.getElementById("achievements").innerHTML +=
            "<br/> <b>Up and running</b>: Click one time";
    }

    if (autoclickers >= 1 && !achievements.industrialRevolution) {
        achievements.industrialRevolution = true;

        document.getElementById("achievements").innerHTML +=
            "<br/> <b>Industrial revolution</b>: Buy an autoclicker";
    }

    if (axes >= 1 && !achievements.forestry) {
        achievements.forestry = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>Forestry</b>: Buy an axe";
    }

    if (crossbows >= 1 && !achievements.twang) {
        achievements.twang = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>Twang</b>: Buy a crossbow";
    }

    if (numEnemiesKilled >= 1 && enemy == "pixies" && !achievements.theFae) {
      achievements.theFae = true;
      document.getElementById("achievements").innerHTML += "<br/> <b>The Fae</b>: Kill a pixie";
    }

    if (numEnemiesKilled >= 1 && enemy == "slimes" && !achievements.goopy) {
        achievements.goopy = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>Goopy</b>: Kill a slime";
    }

    if (numEnemiesKilled >= 1 && enemy == "trees" && !achievements.itsAlive) {
        achievements.itsAlive = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>It's alive!</b>: Kill a tree";
    }
  
    if (numEnemiesKilled >= 1 && enemy == "trolls" && !achievements.underTheBridge) {
        achievements.underTheBridge = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>Under the bridge</b>: Kill a troll";
    }

    if (numEnemiesKilled >= 1 && enemy == "head3" && !achievements.herculaneum) {
        achievements.herculaneum = true;
        document.getElementById("achievements").innerHTML += "<br/> <b>Herculaneum</b>: Kill the hydra";
    }
}

//*** Rotate ***//
function rotate(t) {
  //alert("test");
  let click = document.getElementById(t);
  click.style.transform = "rotate(30deg)";
  setTimeout(function() {click.style.transform = "rotate(60deg)"}, 100);
  setTimeout(function() {click.style.transform = "rotate(90deg)"}, 100);
  setTimeout(function() {click.style.transform = "rotate(0deg)";}, 300);
}

//*** Attack Crossbow ***//
function attackCrossbow() {
  let cross = document.getElementById("crossbow-icon");
  cross.src="crossbow_shot.png";
  setTimeout(function() {cross.src="crossbow_loaded.png"}, 300);
}




//*** Enemy functions ***//

//Attempt to swing
function swing() {
  changeNumber(clickIncrement);
  rotate("sword-click");
  if (enemy == "pixies" || enemy == "hydras") {
    checkHp(clickIncrement);
  }
}
  
//Calculate attacks
function checkHp(dmg) {
  hp -= dmg;
  if (hp <= 0) {
    hp = maxHp;
    numEnemiesKilled += 1;
    document.getElementById("enemy-num").innerHTML = numEnemiesKilled;
    number += maxHp * .8;
  }
  document.getElementById("hp").innerHTML = hp;
}

//Determine attacks on different enemy types
function enemyType() {
  switch(enemy) {
    case "head1":
    case "slimes":
      checkHp(autoclickerTotal);
      rotate("cursor-icon");
      break;
    case "head2":
    case "trees":
      checkHp(axeTotal);
      rotate("axe-icon");
      break;
    case "head3":
    case "trolls":
      checkHp(crossbowTotal);
      attackCrossbow();
      break;
      
  }

  if (numEnemiesKilled >= maxEnemies) {
    if (prestigeVal) {
      switchEnemy();
    }
    else {
      document.getElementById("prestige-sword").classList.remove("close");
    }
  }
}

//Switch enemies
function switchEnemy() {
  switch(enemy) {
    case "pixies": //switch to slimes
      
      //change attacking icon
      if (autoclickers >= 1) {
        document.getElementById("cursor-icon").hidden = false;
      }

      //switch sword
      document.getElementById("sword-click").src = "silver_sword.png";
      
      //switch enemy
      enemy = "slimes";
      document.getElementById("enemy-name").innerHTML = "Slimes";
      document.getElementById("enemy").src = "slime.jpg";
      hp = 150;
      maxHp = 150;
      maxEnemies = 50;
      break;
    case "slimes": //switch to trees

      //Change attacking icon
      document.getElementById("cursor-icon").hidden = true;
      
      if (axes >= 1) {
        document.getElementById("axe-icon").hidden = false;
      }
      
      //switch sword
      document.getElementById('sword-click').src = "slime_sword.png";

      //switch enemy
      document.getElementById('enemy').src = "tree.png";
      enemy = "trees";
      document.getElementById("enemy-name").innerHTML = "Trees";
      maxHp = 250;
      hp = maxHp;
      maxEnemies = 100;
      break;
    case "trees": //switch to trolls
      
      //Change attacking icon
      document.getElementById("axe-icon").hidden = true;

      if (crossbows >= 1) {
        document.getElementById("crossbow-icon").hidden = false;
      }

      //switch sword
      document.getElementById('sword-click').src = "wood_sword.png";

      //switch enemy
      document.getElementById('enemy').src = "troll.png";
      enemy = "trolls";
      document.getElementById("enemy-name").innerHTML = "Trolls";
      hp = 500;
      maxHp = 500;
      maxEnemies = 200;
      
      break;
    case "trolls": //switch to hydras

      //change attack icon
      document.getElementById('crossbow-icon').hidden = true;
      
      //switch sword
      document.getElementById('sword-click').src = "jeweled_sword.png";

      //switch enemy
      document.getElementById('enemy').src = "hydra.jpg";
      enemy = "hydras";
      document.getElementById("enemy-name").innerHTML = "Hydras";
      hp = 2000;
      maxHp = 2000;
      maxEnemies = 1;
      break;

    case "hydras": //switch to head1

      //change attack icon
      if (autoclickers >= 1) {
        document.getElementById("cursor-icon").hidden = false;
      }
      
      //switch enemy
      document.getElementById('enemy').src = "head1.png";
      enemy = "head1";
      document.getElementById("enemy-name").innerHTML = "Heads #1";
      hp = maxHp - 500;
      maxHp -= 500;
      break;

    case "head1": //switch to head2

      //change attack icon

      document.getElementById("cursor-icon").hidden = true;
      
      if (axes >= 1) {
        document.getElementById("axe-icon").hidden = false;
      }
      
      //switch enemy
      document.getElementById('enemy').src = "head2.png";
      document.getElementById('enemy-name').innerHTML = "Heads #2";
      enemy = "head2";
      hp = maxHp + 1000;
      maxHp += 1000;
      break;

    case "head2": //switch to head3

      //change attack icon

      document.getElementById('axe-icon').hidden = true;

      if (crossbows >= 1) {
        document.getElementById("crossbow-icon").hidden = false;
      }

      //switch enemy
      document.getElementById('enemy').src = "head3.png";
      enemy = "head3";
      document.getElementById('enemy-name').innerHTML = "Heads #3";
      hp = maxHp + 1000;
      maxHp += 1000;
      break;

    case "head3":

      //change attack icon
      document.getElementById('crossbow-icon').hidden = true;

      //switch enemy
      document.getElementById('enemy').src = "hydra.jpg";
      enemy = "hydras";
      document.getElementById("enemy-name").innerHTML = "Hydras";
      hp = maxHp + 500;
      maxHp += 500;
      maxEnemies = 1;
      win();
      break;
    }
    prestigeVal = false;
    numEnemiesKilled = 0;
    document.getElementById("hp").innerHTML = hp;
    document.getElementById("max-enemy").innerHTML = maxEnemies;
    document.getElementById("enemy-num").innerHTML = numEnemiesKilled;
    
  
}

function showUpgrades() {
  if (autoclickers >= 1 && document.getElementById("new-axe").classList.contains("close")){
    document.getElementById("new-axe").classList.remove("close");
    document.getElementById("num-axes-count").classList.remove("close");
    document.getElementById("upgrade-clicker").classList.remove("close");
  }

  if (axes >= 1 && document.getElementById("new-cross").classList.contains("close")) {
    document.getElementById("new-cross").classList.remove("close");
    document.getElementById("num-crossbows-count").classList.remove("close");
    document.getElementById("upgrade-axe").classList.remove("close");
  }

  if (crossbows >= 1 && document.getElementById("upgrade-crossbow").classList.contains("close")) {
    document.getElementById("upgrade-crossbow").classList.remove("close");
  }
    
}

//*** Win ***//
function win() {
  if (!winCon){
    alert("You win!");
  }
  winCon = true;
}

//*** Main loop ***//
//
// Function runs every 1000 ms

window.setInterval(function() {
    changeNumber(autoclickerTotal + axeTotal + crossbowTotal);
    checkAchievements();
    enemyType();
    showUpgrades();
}, 1000);