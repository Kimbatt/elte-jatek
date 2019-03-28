const fw = {};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const backgroundCanvas = document.getElementById("background-canvas");
const backgroundCtx = backgroundCanvas.getContext("2d");

fw.WindowResized = function()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
}

window.addEventListener("load", fw.WindowResized);
window.addEventListener("resize", fw.WindowResized);

fw.Entity = class Entity
{
    constructor(x, y, width, height)
    {
        this.ID = Entity.ID;
        ++Entity.ID;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        for (let ev in this.constructor.events)
            fw.Subscribe(this.constructor.events[ev], this);
    }
};

const worldStepInterval = 1 / 60;
fw.Update = function()
{
    fw.FireEvent("update");

    fw.world.step(worldStepInterval, 5, 5);

    fw.DrawBackground();

    fw.FireEvent("draw");

    if (fw.run)
        window.requestAnimationFrame(fw.Update);
}

fw.DrawBackground = function()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const backgroundSizeX = 1024, backgroundSizeY = 1024;
    const parallaxMultiplier = 0.25;
    backgroundCtx.fillStyle = backgroundPattern;
    backgroundCtx.save();
    let offsetX = (fw.cameraPositionX * parallaxMultiplier | 0) % backgroundSizeX,
        offsetY = (fw.cameraPositionY * parallaxMultiplier | 0) % backgroundSizeY;
    if (offsetX < 0)
        offsetX += backgroundSizeX;
    
    if (offsetY < 0)
        offsetY += backgroundSizeY;

    backgroundCtx.translate(-offsetX, -offsetY);
    backgroundCtx.fillRect(offsetX, offsetY, canvas.width + offsetX, canvas.height + offsetY);
    backgroundCtx.restore();
}

fw.IsOnScreen = function(x, y, width, height)
{
    const startX = fw.cameraPositionX - width, endX = startX + canvas.width + width;
    const startY = fw.cameraPositionY - height, endY = startY + canvas.height + height;

    if (x < startX || x > endX || y < startY || y > endY)
        return false;
    
    return true;
}

fw.FireEvent = function(ev, args)
{
    if (!fw.subscribers.hasOwnProperty(ev))
        return;
    
    let subscribers = fw.subscribers[ev];
    for (key in subscribers)
    {
        subscribers[key][ev](args);
    }
}

fw.Subscribe = function(eventType, obj)
{
    let subscribers;
    if (fw.subscribers.hasOwnProperty(eventType))
        subscribers = fw.subscribers[eventType];
    else
    {
        subscribers = {};
        fw.subscribers[eventType] = subscribers;
    }

    subscribers[obj.ID] = obj;
}


fw.keyMap =
{
    "up": false,
    "down": false,
    "left": false,
    "right": false,
    "space": false
};


fw.KeyStateChanged = function(key, state)
{
    switch (key)
    {
        case "KeyW":
        case "ArrowUp":
            fw.keyMap.up = state;
            break;
        case "KeyA":
        case "ArrowLeft":
            fw.keyMap.left = state;
            break;
        case "KeyS":
        case "ArrowDown":
            fw.keyMap.down = state;
            break;
        case "KeyD":
        case "ArrowRight":
            fw.keyMap.right = state;
            break;
        case "Space":
            fw.keyMap.space = state;
            break;
    }
}

window.addEventListener("keydown", event => fw.KeyStateChanged(event.code, true));
window.addEventListener("keyup", event => fw.KeyStateChanged(event.code, false));

let backgroundPattern;

fw.Start = function()
{
    fw.run = true;
    fw.Entity.ID = 0;
    fw.Entities = {};
    fw.subscribers = {};
    fw.InitWorld();

    backgroundPattern = ctx.createPattern(fw.sprites["sprites/background.jpg"], "repeat");

    fw.Player = new Player(100, 100);
    fw.LoadLevel(0);

    fw.Update();
}

fw.LoadLevel = function(level)
{
    if (Tile.tilemap)
    {
        for (let i = 0; i < Tile.tilemap.length; ++i)
        {
            let currentRow = Tile.tilemap[i];
            for (let j = 0; j < currentRow.length; ++j)
            {
                if (currentRow[j])
                    fw.world.destroyBody(currentRow[j]);
            }
        }
    }

    let tilesRows = levels[level].split("\n");
    let tilemap = [];
    for (let i = 0; i < tilesRows.length; ++i)
    {
        let currentTileRow = [];
        let currentRow = tilesRows[i];
        for (let j = 0; j < currentRow.length; ++j)
        {
            const char = currentRow[j];
            if (char === " ")
                continue;
            else if (char === "x")
                currentTileRow[j] = new Tile(j, i);
            else if (char === "d")
                new Door(j, i);
            else if (char === "e")
                new Enemy(j, i);
        }

        tilemap[i] = currentTileRow;
    }

    Tile.tilemap = tilemap;
    for (let i = 0; i < tilemap.length; ++i)
    {
        let currentRow = tilemap[i];
        for (let j = 0; j < currentRow.length; ++j)
        {
            if (currentRow[j])
                currentRow[j].selectSprite();
        }
    }

    fw.Player.setPosition(playerStartPositions[level][0], playerStartPositions[level][1]);
}

fw.ImageLoaded = function()
{
    if (++fw.loadedCount == fw.targetLoadCount)
        fw.Start();
}

fw.sprites = {};

fw.targetLoadCount = 0;
fw.loadedCount = 0;
fw.LoadImages = function(images)
{
    fw.targetLoadCount += images.length;
    for (let i = 0; i < images.length; ++i)
    {
        let imageName = images[i];
        let img = new Image();
        img.onload = fw.ImageLoaded;
        img.src = imageName;

        fw.sprites[imageName] = img;
    }
}

fw.Box = function(w, h)
{
    let w2 = w * 0.5 / PTM;
    let h2 = h * 0.5 / PTM;
    const box = planck.Box(w2, h2);

    box.m_vertices[0].x += w2;
    box.m_vertices[0].y += h2;
    box.m_vertices[1].x += w2;
    box.m_vertices[1].y += h2;
    box.m_vertices[2].x += w2;
    box.m_vertices[2].y += h2;
    box.m_vertices[3].x += w2;
    box.m_vertices[3].y += h2;

    return box;
}

const PTM = 30;

fw.InitWorld = function()
{
    fw.world = new planck.World(new planck.Vec2(0, 150));
    fw.world.on("begin-contact", e =>
    {
        let object1 = e.m_fixtureA.m_body.gameobject;
        let object2 = e.m_fixtureB.m_body.gameobject;

        if (object1 && object1.onCollision)
            object1.onCollision(e, object2.body);

        if (object2 && object2.onCollision)
            object2.onCollision(e, object1.body);
    });

    fw.world.on("end-contact", e =>
    {
        let object1 = e.m_fixtureA.m_body.gameobject;
        let object2 = e.m_fixtureB.m_body.gameobject;

        if (object1 && object1.onCollisionLeave)
            object1.onCollisionLeave(e, object2.body);

        if (object2 && object2.onCollisionLeave)
            object2.onCollisionLeave(e, object1.body);
    });
}

fw.FinishLevel = function()
{
    if (!fw.run)
        return;
    
    fw.Shutdown();
    
    document.getElementById("level-finished-overlay").className = "level-finished-overlay-visible";
}

fw.Shutdown = function()
{
    fw.run = false;
}