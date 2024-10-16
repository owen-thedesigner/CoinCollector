// Define variables
var game;
var player;
var platforms;
var badges;
var items;
var cursors;
var jumpButton;
var text;
var timerText;
var winningMessage;
var bestTimeText; // Added to track best time
var timeElapsed = 0;
var won = false;
var currentScore = 0;
var winningScore = 105;
var currentLevel = 1;
var characterSelected = false;
var selectedCharacter = 'chalks'; // default character
var currentSelection = 0; // Track which character is currently selected
var difficultyMode = 'easy'; // Default difficulty mode
var bestTime = Infinity; // Initialize best time

// Character selection menu
var chalksButton, mikeButton, titleText;

function createCharacterSelect() {
    game.stage.backgroundColor = '#5db1ad';

    titleText = game.add.text(game.world.centerX, 100, "Select Your Character", { font: "bold 32px Arial", fill: "white" });
    titleText.anchor.set(0.5);

    // Create buttons for characters
    chalksButton = game.add.text(game.world.centerX, 250, "Choose Chalks", { font: "bold 24px Arial", fill: "white" });
    chalksButton.anchor.set(0.5);

    mikeButton = game.add.text(game.world.centerX, 350, "Choose Mike the Frog", { font: "bold 24px Arial", fill: "white" });
    mikeButton.anchor.set(0.5);

    // Handle keyboard input for character selection
    game.input.keyboard.onDownCallback = function() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && currentSelection > 0) {
            currentSelection--;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && currentSelection < 1) {
            currentSelection++;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            selectedCharacter = currentSelection === 0 ? 'chalks' : 'mike';
            characterSelected = true; // Set character selected to true
            clearCharacterSelect(); // Clear character selection text
            createDifficultySelect(); // Show difficulty selection after character selection
        }

        // Highlight the selected character
        chalksButton.fill = (currentSelection === 0) ? "yellow" : "white";
        mikeButton.fill = (currentSelection === 1) ? "yellow" : "white";
    };

    // Mouse click events for character selection
    chalksButton.inputEnabled = true;
    chalksButton.events.onInputUp.add(function() {
        selectedCharacter = 'chalks';
        characterSelected = true;
        clearCharacterSelect(); // Clear character selection text
        createDifficultySelect();
    });

    mikeButton.inputEnabled = true;
    mikeButton.events.onInputUp.add(function() {
        selectedCharacter = 'mike';
        characterSelected = true;
        clearCharacterSelect(); // Clear character selection text
        createDifficultySelect();
    });
}

// Function to clear character selection texts
function clearCharacterSelect() {
    titleText.destroy();
    chalksButton.destroy();
    mikeButton.destroy();
}

// Difficulty selection menu
function createDifficultySelect() {
    game.stage.backgroundColor = '#5db1ad';
    var title = game.add.text(game.world.centerX, 100, "Select Difficulty", { font: "bold 32px Arial", fill: "white" });
    title.anchor.set(0.5);

    // Create buttons for difficulty levels
    var easyButton = game.add.text(game.world.centerX, 250, "Easy Mode", { font: "bold 24px Arial", fill: "white" });
    easyButton.anchor.set(0.5);

    var mediumButton = game.add.text(game.world.centerX, 350, "Medium Mode", { font: "bold 24px Arial", fill: "white" });
    mediumButton.anchor.set(0.5);

    var hardButton = game.add.text(game.world.centerX, 450, "Hard Mode", { font: "bold 24px Arial", fill: "white" });
    hardButton.anchor.set(0.5);

    // Handle keyboard input for difficulty selection
    game.input.keyboard.onDownCallback = function() {
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && currentSelection > 0) {
            currentSelection--;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && currentSelection < 2) {
            currentSelection++;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            if (currentSelection === 0) {
                difficultyMode = 'easy';
            } else if (currentSelection === 1) {
                difficultyMode = 'medium';
            } else {
                difficultyMode = 'hard';
            }
            startGame(); // Start the main game after difficulty selection
        }

        // Highlight the selected difficulty
        easyButton.fill = (currentSelection === 0) ? "yellow" : "white";
        mediumButton.fill = (currentSelection === 1) ? "yellow" : "white";
        hardButton.fill = (currentSelection === 2) ? "yellow" : "white";
    };

    // Mouse click events for difficulty selection
    easyButton.inputEnabled = true;
    easyButton.events.onInputUp.add(function() {
        difficultyMode = 'easy';
        startGame();
    });

    mediumButton.inputEnabled = true;
    mediumButton.events.onInputUp.add(function() {
        difficultyMode = 'medium';
        startGame();
    });

    hardButton.inputEnabled = true;
    hardButton.events.onInputUp.add(function() {
        difficultyMode = 'hard';
        startGame();
    });
}

// Start the game with the selected character and difficulty
function startGame() {
    game.state.start('main'); // Start the main game state
}

// Main game state
var mainState = {
    preload: function() {
        game.stage.backgroundColor = '#5db1ad';
        game.load.image('platform', 'platform_1.png');
        game.load.image('platform2', 'platform_2.png');
        game.load.spritesheet('chalks', 'chalkers.png', 48, 62);
        game.load.spritesheet('mike', 'mikethefrog.png', 32, 32);
        game.load.spritesheet('coin', 'coin.png', 36, 44);
        game.load.spritesheet('badge', 'badge.png', 42, 54);
        game.load.spritesheet('poison', 'poison.png', 32, 32);
        game.load.spritesheet('star', 'star.png', 32, 32);
    },

    create: function() {
        currentScore = 0;
        won = false;

        player = game.add.sprite(50, 600, selectedCharacter);
        player.animations.add('walk');
        player.anchor.setTo(0.5, 1);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 500;

        addItems();
        addPlatforms();

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        text = game.add.text(16, 16, "SCORE: " + currentScore, { font: "bold 24px Arial", fill: "white" });
        timerText = game.add.text(650, 16, "TIME: 0", { font: "bold 24px Arial", fill: "white" });
        winningMessage = game.add.text(game.world.centerX, 275, "", { font: "bold 48px Arial", fill: "white" });
        winningMessage.anchor.setTo(0.5, 1);
        
        bestTimeText = game.add.text(game.world.centerX, 50, "BEST TIME: --", { font: "bold 24px Arial", fill: "white" });
        bestTimeText.anchor.set(0.5); // Center the text horizontally
    },

    update: function() {
        text.text = "SCORE: " + currentScore;

        timeElapsed += game.time.physicsElapsed;
        timerText.text = "TIME: " + Math.floor(timeElapsed); // Display time in seconds

        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.overlap(player, items, itemHandler);
        game.physics.arcade.overlap(player, badges, badgeHandler);
        player.body.velocity.x = 0;

        // Move the player
        if (cursors.left.isDown) {
            player.animations.play('walk', 10, true);
            player.body.velocity.x = -300;
            player.scale.x = -1;
        } else if (cursors.right.isDown) {
            player.animations.play('walk', 10, true);
            player.body.velocity.x = 300;
            player.scale.x = 1;
        } else {
            player.animations.stop();
        }

        // Jump
        if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down)) {
            player.body.velocity.y = -400;
        }

        // When the player wins the game
        if (won) {
            winningMessage.text = "YOU WIN!!!";
            // Update best time if applicable
            if (timeElapsed < bestTime) {
                bestTime = Math.floor(timeElapsed);
                bestTimeText.text = "BEST TIME: " + bestTime;
            }
        }
    },

    render: function() {
        // Optionally, you can add debug information here
    }
};

// Setup game when the web page loads
window.onload = function () {
    game = new Phaser.Game(800, 600, Phaser.AUTO, '');

    // Add states
    game.state.add('menu', { create: createCharacterSelect });
    game.state.add('main', mainState);
    
    // Start the menu state
    game.state.start('menu');
};

// Function to add collectable items to the game
function addItems() {
    items = game.add.physicsGroup();
    if (currentLevel === 1) {
        // Level 1 items
        createItem(375, 400, 'coin');
        createItem(575, 500, 'coin');
        createItem(225, 500, 'coin');
        createItem(100, 250, 'coin');
        createItem(575, 150, 'coin');
        createItem(525, 300, 'coin');
        createItem(650, 250, 'coin');
        createItem(225, 200, 'coin');
        createItem(375, 100, 'poison');
        createItem(370, 500, 'poison');
        createItem(100, 375, 'poison');
        createItem(125, 50, 'star');

        // Add additional items for medium mode
        if (difficultyMode === 'medium') {
            createItem(200, 300, 'poison');
            createItem(300, 200, 'poison');
            createItem(400, 400, 'poison');
        }

        // Add additional items for hard mode
        if (difficultyMode === 'hard') {
            createItem(250, 350, 'poison');
            createItem(450, 300, 'poison');
            createItem(200, 200, 'poison');
            createItem(200, 100, 'poison');
            createItem(100, 100, 'star');
        }
    } else if (currentLevel === 2) {
        // Level 2 items
        createItem(150, 450, 'coin');
        createItem(550, 150, 'coin');
        createItem(250, 250, 'poison');
        createItem(200, 450, 'poison');
        createItem(700, 350, 'poison');
        createItem(600, 50, 'star');
        createItem(100, 50, 'coin');
        createItem(100, 300, 'coin');
        createItem(700, 500, 'coin');
        createItem(750, 400, 'coin'); 
        createItem(450, 300, 'coin');
        createItem(750, 200, 'coin'); 

        // Add additional items for medium mode
        if (difficultyMode === 'medium') {
            createItem(200, 300, 'poison');
            createItem(400, 200, 'poison');
            createItem(530, 50, 'poison');
            createItem(150, 80, 'poison');
        }

        // Add additional items for hard mode
        if (difficultyMode === 'hard') {
            createItem(250, 150, 'poison');
            createItem(150, 80, 'poison');
            createItem(530, 50, 'poison');
            createItem(50, 300, 'poison');
            createItem(150, 200, 'star'); 
        }
    }
}

// Function to add platforms to the game
function addPlatforms() {
    platforms = game.add.physicsGroup();
    if (currentLevel === 1) {
        // Level 1 platforms
        platforms.create(450, 550, 'platform');
        platforms.create(100, 550, 'platform');
        platforms.create(300, 450, 'platform');
        platforms.create(250, 150, 'platform');
        platforms.create(50, 300, 'platform');
        platforms.create(150, 250, 'platform');
        platforms.create(650, 300, 'platform');
        platforms.create(550, 200, 'platform2');
        platforms.create(300, 450, 'platform2');
        platforms.create(400, 350, 'platform2');
        platforms.create(100, 100, 'platform2');

        // Add more platforms for hard mode
        if (difficultyMode === 'hard') {
            platforms.create(200, 300, 'platform');
            platforms.create(600, 450, 'platform2');
            platforms.create(350, 500, 'platform');
        }
    } else if (currentLevel === 2) {
        // Level 2 platforms
        platforms.create(380, 500, 'platform2');
        platforms.create(600, 400, 'platform');
        platforms.create(510, 100, 'platform');
        platforms.create(200, 300, 'platform2');
        platforms.create(400, 200, 'platform2');
        platforms.create(50, 350, 'platform');
        platforms.create(325, 350, 'platform');
        platforms.create(750, 250, 'platform');
        platforms.create(100, 100, 'platform');

        // Add more platforms for hard mode
        if (difficultyMode === 'hard') {
            platforms.create(150, 200, 'platform2');
        }
    }
    platforms.setAll('body.immovable', true);
}

// Function to create a single animated item and add it to the screen
function createItem(left, top, image) {
    var item = items.create(left, top, image);
    item.animations.add('spin');
    item.animations.play('spin', 10, true);
}

// Function to create the winning badge and add it to the screen
function createBadge() {
    badges = game.add.physicsGroup();
    var badge = badges.create(750, 400, 'badge');
    badge.animations.add('spin');
    badge.animations.play('spin', 10, true);
}

// When the player collects an item on the screen
function itemHandler(player, item) {
    item.kill();
    if (item.key === 'coin') {
        currentScore += 10;
    } else if (item.key === 'poison') {
        currentScore -= 25;
    } else if (item.key === 'star') {
        currentScore += 25;
    }
    if (currentScore >= winningScore) {
        createBadge();
    }
}

// When the player collects the badge at the end of the game
function badgeHandler(player, badge) {
    badge.kill();
    if (currentLevel === 1) {
        currentLevel = 2; // Move to next level
        currentScore = 0; // Reset score for next level
        timeElapsed = 0; // Reset timer
        won = false; // Reset winning state
        resetGame(); // Reset game state for new level
    } else {
        won = true; // Set winning state for the final level
    }
}

// Function to reset game state
function resetGame() {
    items.callAll('kill'); // Remove existing items
    platforms.callAll('kill'); // Remove existing platforms
    addItems(); // Add items for the new level
    addPlatforms(); // Add platforms for the new level
}
