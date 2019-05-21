
const levelEditor = {};
let levelEditorLoading = false;
let levelEditorRunning = false;
let levelEditorCurrentAction = "levelEditor-moveCamera";

function OpenLevelEditor()
{
    if (levelEditorLoading)
        return;

    levelEditorLoading = true;
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "";
    document.getElementById("loading-overlay").style.display = "flex";
    document.getElementById("levelEditor").style.display = "";
    
    document.getElementById("exitToMenuButton").onclick = levelEditor.ExitToMenu;

    levelEditor.cameraPositionX = 0;
    levelEditor.cameraPositionY = 0;

    levelEditor.levelData = {};
    levelEditor.levelData.tiles = {};
    levelEditor.levelData.enemies = {};

    const requiredImages = ["sprites/background.jpg", "sprites/tilemap.png", "sprites/delete.png",
        "sprites/skeleton/idle/idle.png", "sprites/anim/idle/idle_right.png", "sprites/door.png"];

    let loadedCount = 0;
    const requiredCount = requiredImages.length;

    levelEditor.images = {};

    for (let imageName of requiredImages)
    {
        let _name = imageName;
        let img = new Image();
        img.onload = () =>
        {
            levelEditor.images[_name] = img;

            if (++loadedCount === requiredCount)
            {
                levelEditor.backgroundPattern = ctx.createPattern(levelEditor.images["sprites/background.jpg"], "repeat");
                levelEditorLoading = false;
                document.getElementById("loading-overlay").style.display = "none";
                levelEditor.Update();
            }
        };

        img.src = imageName;
    }

    window.addEventListener("mousedown", levelEditor.MouseDown);
    window.addEventListener("mouseup", levelEditor.MouseUp);
    window.addEventListener("mousemove", levelEditor.MouseMove);

    levelEditorRunning = true;
}

function SelectAction(actionButton)
{
    const prevButton = document.getElementById(levelEditorCurrentAction);
    prevButton.classList.remove("button-selected");
    prevButton.disabled = false;

    levelEditorCurrentAction = actionButton.id;
    const newButton = document.getElementById(levelEditorCurrentAction);
    newButton.classList.add("button-selected");
    newButton.disabled = true;
}

let mouseButtonDown = false;
let mousePositionX = 0, mousePositionY = 0;
levelEditor.MouseDown = function(ev)
{
    const mouseIsOverThisElement = document.elementFromPoint(mousePositionX, mousePositionY);
    if (!mouseIsOverThisElement || mouseIsOverThisElement.tagName !== "CANVAS")
        return;

    if (ev.button === 0)
        mouseButtonDown = true;
    else
        return;
    
    switch (levelEditorCurrentAction)
    {
        case "levelEditor-deleteTiles":
            levelEditor.SetTileAtMousePosition(false);
            break;
        case "levelEditor-addTiles":
            levelEditor.SetTileAtMousePosition(true);
            break;
        case "levelEditor-setPlayerPosition":
            levelEditor.SetPlayerAtMousePosition();
            break;
        case "levelEditor-setExitPosition":
            levelEditor.SetExitAtMousePosition();
            break;
        case "levelEditor-addEnemy":
            levelEditor.SetEnemyAtMousePosition(true);
            break;
        case "levelEditor-deleteEnemy":
            levelEditor.SetEnemyAtMousePosition(false);
            break;
    }
}

levelEditor.MouseUp = function(ev)
{
    if (ev.button === 0)
        mouseButtonDown = false;
}

levelEditor.MouseMove = function(ev)
{
    mousePositionX = ev.clientX;
    mousePositionY = ev.clientY;

    if (!mouseButtonDown)
        return;
    
    switch (levelEditorCurrentAction)
    {
        case "levelEditor-moveCamera":
            levelEditor.cameraPositionX -= ev.movementX;
            levelEditor.cameraPositionY -= ev.movementY;
            break;
        case "levelEditor-deleteTiles":
            levelEditor.SetTileAtMousePosition(false);
            break;
        case "levelEditor-addTiles":
            levelEditor.SetTileAtMousePosition(true);
            break;
        case "levelEditor-setPlayerPosition":
            levelEditor.SetPlayerAtMousePosition();
            break;
        case "levelEditor-setExitPosition":
            levelEditor.SetExitAtMousePosition();
            break;
        case "levelEditor-addEnemy":
            levelEditor.SetEnemyAtMousePosition(true);
            break;
        case "levelEditor-deleteEnemy":
            levelEditor.SetEnemyAtMousePosition(false);
            break;
    }
}

levelEditor.SetTileAtMousePosition = function(isAdd)
{
    const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
    const key = coord[0] + " " + coord[1];
    let changed = false;
    if (isAdd && levelEditor.IsPositionAvailable(coord[0], coord[1]))
    {
        changed = true
        levelEditor.levelData.tiles[key] = new Tile(coord[0], coord[1], levelEditor.images["sprites/tilemap.png"], true);
    }
    else if (!isAdd && levelEditor.levelData.tiles.hasOwnProperty(key))
    {
        changed = true;
        delete levelEditor.levelData.tiles[key];
    }

    if (changed)
    {
        for (let i = coord[0] - 1; i <= coord[0] + 1; ++i)
        {
            for (let j = coord[1] - 1; j <= coord[1] + 1; ++j)
            {
                const currentTile = levelEditor.levelData.tiles[i + " " + j];
                if (currentTile)
                    currentTile.selectSprite(levelEditor.levelData.tiles);
            }
        }
    }
}

levelEditor.SetPlayerAtMousePosition = function()
{
    const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);

    if (levelEditor.IsPositionAvailable(coord[0], coord[1], "player") && levelEditor.IsPositionAvailable(coord[0], coord[1] - 1, "player"))
        levelEditor.levelData.player = { x: coord[0], y: coord[1] };
}

levelEditor.SetExitAtMousePosition = function()
{
    const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
    if (levelEditor.IsPositionAvailable(coord[0], coord[1], "door") &&
        levelEditor.IsPositionAvailable(coord[0] + 1, coord[1], "door") &&
        levelEditor.IsPositionAvailable(coord[0], coord[1] - 1, "door") &&
        levelEditor.IsPositionAvailable(coord[0] + 1, coord[1] - 1, "door") &&
        levelEditor.IsPositionAvailable(coord[0], coord[1] - 2, "door") &&
        levelEditor.IsPositionAvailable(coord[0] + 1, coord[1] - 2, "door") &&
        // can only be placed if on the ground
        levelEditor.levelData.tiles.hasOwnProperty(coord[0] + " " + (coord[1] + 1)) &&
        levelEditor.levelData.tiles.hasOwnProperty((coord[0] + 1) + " " + (coord[1] + 1)))
        levelEditor.levelData.door = { x: coord[0], y: coord[1] };
}

levelEditor.SetEnemyAtMousePosition = function(isAdd)
{
    const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
    const key = coord[0] + " " + coord[1];
    if (isAdd)
    {
        if (levelEditor.IsPositionAvailable(coord[0], coord[1]) && levelEditor.IsPositionAvailable(coord[0], coord[1] - 1))
        {
            const key2 = coord[0] + " " + (coord[1] - 1);
            const enemy = new Enemy(coord[0], coord[1], "skeleton", true);
            levelEditor.levelData.enemies[key] = enemy;
            levelEditor.levelData.enemies[key2] = true; // just to indicate that the position is taken
        }
    }
    else
    {
        const key2 = coord[0] + " " + (coord[1] + 1);
        if (levelEditor.levelData.enemies.hasOwnProperty(key) || levelEditor.levelData.enemies.hasOwnProperty(key2))
        {
            let enemy;
            let key_;
            if (levelEditor.levelData.enemies[key] instanceof Enemy)
            {
                enemy = levelEditor.levelData.enemies[key];
                key_ = key;
            }
            else if (levelEditor.levelData.enemies[key2] instanceof Enemy)
            {
                enemy = levelEditor.levelData.enemies[key2];
                key_ = key2;
            }
            
            if (enemy)
            {
                delete levelEditor.levelData.enemies[key_];
                const coord2 = key_.split(" ");
                delete levelEditor.levelData.enemies[coord2[0] + " " + (Number(coord2[1]) - 1)];
            }
        }
    }
}

levelEditor.DrawBackground = function()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // a háttér el van tolva az előtérhez képest, hogy parallax hatású legyen
    const backgroundSizeX = 1024, backgroundSizeY = 1024;
    const parallaxMultiplier = 0.25;
    backgroundCtx.save();
    backgroundCtx.fillStyle = levelEditor.backgroundPattern;
    let offsetX = (levelEditor.cameraPositionX * parallaxMultiplier | 0) % backgroundSizeX,
        offsetY = (levelEditor.cameraPositionY * parallaxMultiplier | 0) % backgroundSizeY;
    if (offsetX < 0)
        offsetX += backgroundSizeX;
    
    if (offsetY < 0)
        offsetY += backgroundSizeY;

    backgroundCtx.translate(-offsetX, -offsetY);
    backgroundCtx.fillRect(offsetX, offsetY, canvas.width + offsetX, canvas.height + offsetY);
    backgroundCtx.restore();
}

function CoordFromScreenPos(x, y)
{
    let cx = ((x + 64) / 128);
    if (cx < 0)
        cx -= 1;

    let cy = ((y + 64) / 128);
    if (cy < 0)
        cy -= 1;

    return [cx | 0, cy | 0];
}

levelEditor.IsPositionAvailable = function(x, y, type)
{
    if (levelEditor.levelData.tiles.hasOwnProperty(x + " " + y))
        return false;
    
    if (levelEditor.levelData.enemies.hasOwnProperty(x + " " + y))
        return false;
    
    if (levelEditor.levelData.player && type !== "player")
    {
        if (x === levelEditor.levelData.player.x)
        {
            if (y === levelEditor.levelData.player.y || y === levelEditor.levelData.player.y - 1)
                return false;
        }
    }

    if (levelEditor.levelData.door && type !== "door")
    {
        const doorX = levelEditor.levelData.door.x, doorY = levelEditor.levelData.door.y;
        if ((doorX === x || doorX + 1 === x) &&
            (doorY === y || doorY - 1 === y || doorY - 2 === y))
            return false;
    }

    return true;
}

levelEditor.Update = function()
{
    levelEditor.DrawBackground();

    // draw tiles
    for (let coordStr in levelEditor.levelData.tiles)
    {
        const tile = levelEditor.levelData.tiles[coordStr];
        const coord = coordStr.split(" ");
        const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
        const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY;
        ctx.drawImage(levelEditor.images["sprites/tilemap.png"], tile.spriteX, tile.spriteY, 128, 128, posX, posY, 128, 128);
    }

    // draw enemies
    for (let coordStr in levelEditor.levelData.enemies)
    {
        if (levelEditor.levelData.enemies[coordStr] instanceof Enemy)
        {
            const coord = coordStr.split(" ");
            const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
            const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY - 128;
            ctx.drawImage(levelEditor.images["sprites/skeleton/idle/idle.png"], 0, 0, 154, 256, posX, posY, 154, 256);
        }
    }

    // draw player
    if (levelEditor.levelData.player)
    {
        const x = levelEditor.levelData.player.x, y = levelEditor.levelData.player.y;
        const posX = x * 128 - 64 - levelEditor.cameraPositionX;
        const posY = y * 128 - 64 - levelEditor.cameraPositionY - 128;
        ctx.drawImage(levelEditor.images["sprites/anim/idle/idle_right.png"], 0, 0, 256, 256, posX - 20, posY, 256, 256);
    }

    // draw door
    if (levelEditor.levelData.door)
    {
        const x = levelEditor.levelData.door.x, y = levelEditor.levelData.door.y;
        const posX = x * 128 - 64 - levelEditor.cameraPositionX;
        const posY = y * 128 - 64 - levelEditor.cameraPositionY - 256;
        ctx.drawImage(levelEditor.images["sprites/door.png"], posX, posY);
    }
    
    ctx.save();
    switch (levelEditorCurrentAction)
    {
        //case "levelEditor-moveCamera":
        //    break;
        case "levelEditor-deleteTiles":
        {
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (levelEditor.levelData.tiles.hasOwnProperty(coord[0] + " " + coord[1]))
            {
                const posX = coord[0] * 128 - 64 - levelEditor.cameraPositionX;
                const posY = coord[1] * 128 - 64 - levelEditor.cameraPositionY;

                ctx.drawImage(levelEditor.images["sprites/delete.png"], posX, posY);
            }
            break;
        }
        case "levelEditor-addTiles":
        {
            ctx.globalAlpha = 0.7;
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (levelEditor.IsPositionAvailable(coord[0], coord[1]))
            {
                const posX = coord[0] * 128 - 64 - levelEditor.cameraPositionX;
                const posY = coord[1] * 128 - 64 - levelEditor.cameraPositionY;

                ctx.drawImage(levelEditor.images["sprites/tilemap.png"], 256, 1920, 128, 128, posX, posY, 128, 128);
            }
            break;
        }
        case "levelEditor-deleteEnemy":
        {
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            const key = coord[0] + " " + coord[1];
            const key2 = coord[0] + " " + (coord[1] + 1);

            if (levelEditor.levelData.enemies.hasOwnProperty(key) || levelEditor.levelData.enemies.hasOwnProperty(key2))
            {
                let enemy;
                let key_;
                if (levelEditor.levelData.enemies[key] instanceof Enemy)
                {
                    enemy = levelEditor.levelData.enemies[key];
                    key_ = key;
                }
                else if (levelEditor.levelData.enemies[key2] instanceof Enemy)
                {
                    enemy = levelEditor.levelData.enemies[key2];
                    key_ = key2;
                }
                
                if (enemy)
                {
                    const split_ = key_.split(" ");
                    const coordX = Number(split_[0]);
                    const coordY = Number(split_[1]);
                    const coordY2 = Number(split_[1] - 1);
                    
                    const posX = coordX * 128 - 64 - levelEditor.cameraPositionX;
                    const posY = coordY * 128 - 64 - levelEditor.cameraPositionY;
                    const posY2 = coordY2 * 128 - 64 - levelEditor.cameraPositionY;
                    ctx.drawImage(levelEditor.images["sprites/delete.png"], posX, posY);
                    ctx.drawImage(levelEditor.images["sprites/delete.png"], posX, posY2);
                }
            }
            break;
        }
        case "levelEditor-addEnemy":
        {
            ctx.globalAlpha = 0.7;
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (levelEditor.IsPositionAvailable(coord[0], coord[1]) && levelEditor.IsPositionAvailable(coord[0], coord[1] - 1))
            {
                const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
                const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY - 128;
                ctx.drawImage(levelEditor.images["sprites/skeleton/idle/idle.png"], 0, 0, 154, 256, posX, posY, 154, 256);
            }
            break;
        }
        case "levelEditor-setPlayerPosition":
        {
            ctx.globalAlpha = 0.7;
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (levelEditor.IsPositionAvailable(coord[0], coord[1], "player") && levelEditor.IsPositionAvailable(coord[0], coord[1] - 1, "player"))
            {
                const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
                const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY - 128;
                ctx.drawImage(levelEditor.images["sprites/anim/idle/idle_right.png"], 0, 0, 256, 256, posX - 20, posY, 256, 256);
            }
            break;
        }
        case "levelEditor-setExitPosition":
        {
            /*
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            */
            ctx.globalAlpha = 0.7;
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (levelEditor.IsPositionAvailable(coord[0], coord[1], "door") &&
                levelEditor.IsPositionAvailable(coord[0] + 1, coord[1], "door") &&
                levelEditor.IsPositionAvailable(coord[0], coord[1] - 1, "door") &&
                levelEditor.IsPositionAvailable(coord[0] + 1, coord[1] - 1, "door") &&
                levelEditor.IsPositionAvailable(coord[0], coord[1] - 2, "door") &&
                levelEditor.IsPositionAvailable(coord[0] + 1, coord[1] - 2, "door") &&
                // can only be placed if on the ground
                levelEditor.levelData.tiles.hasOwnProperty(coord[0] + " " + (coord[1] + 1)) &&
                levelEditor.levelData.tiles.hasOwnProperty((coord[0] + 1) + " " + (coord[1] + 1)))
            {
                const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
                const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY - 256;
                ctx.drawImage(levelEditor.images["sprites/door.png"], posX, posY);
            }
            break;
        }
    }
    
    ctx.restore();

    if (levelEditorRunning)
        window.requestAnimationFrame(levelEditor.Update);
}

levelEditor.ExitToMenu = function()
{
    levelEditorRunning = false;
    document.getElementById("menu").style.display = "flex";
    document.getElementById("game").style.display = "none";
    document.getElementById("levelEditor").style.display = "none";

    window.removeEventListener("mousedown", levelEditor.MouseDown);
    window.removeEventListener("mouseup", levelEditor.MouseUp);
    window.removeEventListener("mousemove", levelEditor.MouseMove);
}