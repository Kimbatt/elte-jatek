
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
    document.getElementById("levelEditor").style.display = "";
    
    document.getElementById("exitToMenuButton").onclick = levelEditor.ExitToMenu;

    levelEditor.cameraPositionX = 0;
    levelEditor.cameraPositionY = 0;
    
    const requiredImages = ["sprites/background.jpg", "sprites/tilemap.png"]
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
    prevButton.className = "";
    prevButton.disabled = false;

    levelEditorCurrentAction = actionButton.id;
    const newButton = document.getElementById(levelEditorCurrentAction);
    newButton.className = "button-selected";
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
    
    switch (levelEditorCurrentAction)
    {
        case "levelEditor-addTiles":
            levelEditor.AddTileAtMousePosition();
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
    }
}

levelEditor.AddTileAtMousePosition = function()
{
    const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
    const key = coord[0] + " " + coord[1];
    if (!levelEditor.tiles.hasOwnProperty(key))
    {
        levelEditor.tiles[key] = new Tile(coord[0], coord[1], levelEditor.images["sprites/tilemap.png"], true);

        for (let i = coord[0] - 1; i <= coord[0] + 1; ++i)
        {
            for (let j = coord[1] - 1; j <= coord[1] + 1; ++j)
            {
                const currentTile = levelEditor.tiles[i + " " + j];
                if (currentTile)
                    currentTile.selectSprite(levelEditor.tiles);
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

levelEditor.tiles = {};
levelEditor.Update = function()
{
    levelEditor.DrawBackground();

    for (let coordStr in levelEditor.tiles)
    {
        const tile = levelEditor.tiles[coordStr];
        const coord = coordStr.split(" ");
        const posX = Number(coord[0]) * 128 - 64 - levelEditor.cameraPositionX;
        const posY = Number(coord[1]) * 128 - 64 - levelEditor.cameraPositionY;
        ctx.drawImage(levelEditor.images["sprites/tilemap.png"], tile.spriteX, tile.spriteY, 128, 128, posX, posY, 128, 128);
    }

    switch (levelEditorCurrentAction)
    {
        //case "levelEditor-moveCamera":
        //    break;
        case "levelEditor-addTiles":
            const coord = CoordFromScreenPos(levelEditor.cameraPositionX + mousePositionX, levelEditor.cameraPositionY + mousePositionY);
            if (!levelEditor.tiles.hasOwnProperty(coord[0] + " " + coord[1]))
            {
                const posX = coord[0] * 128 - 64 - levelEditor.cameraPositionX;
                const posY = coord[1] * 128 - 64 - levelEditor.cameraPositionY;

                ctx.drawImage(levelEditor.images["sprites/tilemap.png"], 256, 1920, 128, 128, posX, posY, 128, 128);
            }
            break;
    }

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