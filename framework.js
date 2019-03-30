const fw = {};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// külön canvas van a háttérnek
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

// entitás ősosztály
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
// ez a függvény hívódik meg másodpercenként 60-szor
fw.Update = function()
{
    // fizikai objektumok; mivel a fizikai világ frissítése közben nem lehet törölni őket,
    // ezért egy listában tároljuk, és a frissítés után töröljük
    fw.destroyedObjects = [];

    fw.FireEvent("update");

    fw.world.step(worldStepInterval, 5, 5);

    fw.DrawBackground();

    fw.FireEvent("draw");

    for (let i = 0; i < fw.destroyedObjects.length; ++i)
    {
        let currentBody = fw.destroyedObjects[i].body;
        if (currentBody)
            fw.world.destroyBody(currentBody);
    }

    if (fw.run)
        window.requestAnimationFrame(fw.Update);
}

// a háttér kirajzolása
fw.DrawBackground = function()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // a háttér el van tolva az előtérhez képest, hogy parallax hatású legyen
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

// ez a függvény megadja, hogy egy objektum a képernyőn van-e (tehát hogy ki kell-e rajzolni)
fw.IsOnScreen = function(x, y, width, height)
{
    const startX = fw.cameraPositionX - width, endX = startX + canvas.width + width;
    const startY = fw.cameraPositionY - height, endY = startY + canvas.height + height;

    if (x < startX || x > endX || y < startY || y > endY)
        return false;
    
    return true;
}

// egy adott eseményre meghívja az összes feliratkozott entitás megfelelő függvényét
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

// ennek a függvénynek a segítségével egy entitás feliratkozhat egy eseményre
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

// entitás törlése
fw.RemoveEntity = function(entity)
{
    for (let ev in entity.constructor.events)
    {
        let event = entity.constructor.events[ev];
        if (fw.subscribers.hasOwnProperty(event))
            delete fw.subscribers[event][entity.ID];
    }

    fw.destroyedObjects.push(entity);
}

// billentyűzet információ
fw.keyMap =
{
    "up": false,
    "down": false,
    "left": false,
    "right": false,
    "space": false
};

// a gomb lenyomás/felengedés esemény kezelése
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
    backgroundPattern = ctx.createPattern(fw.sprites["sprites/background.jpg"], "repeat");

    fw.LoadLevel(0);
}

fw.currentLevel = 0;
// pálya betöltése
fw.LoadLevel = function(level)
{
    fw.run = true;
    fw.Entity.ID = 0;
    fw.Entities = {};
    fw.subscribers = {};
    fw.InitWorld();
    fw.Player = new Player();

    // régi tilemap törlése, ha van
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

    // pálya feldolgozása
    let tilesRows = levels[level].split("\n");
    let tilemap = [];
    for (let i = 0; i < tilesRows.length; ++i)
    {
        let currentTileRow = [];
        let currentRow = tilesRows[i];
        for (let j = 0; j < currentRow.length; ++j)
        {
            const char = currentRow[j];
            switch (char)
            {
                case "x":
                    currentTileRow[j] = new Tile(j, i);
                    break;
                case "d":
                    new Door(j, i);
                    break;
                case "s":
                    new Enemy(j, i, "skeleton");
                    break;
                case "z":
                    new Enemy(j, i, "zombie");
                    break;
            }
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

    fw.currentLevel = level;
    fw.Player.setPosition(playerStartPositions[level][0], playerStartPositions[level][1]);

    fw.Update();
}

fw.ImageLoaded = function()
{
    if (++fw.loadedCount == fw.targetLoadCount)
        fw.Start();
}

fw.sprites = {};

fw.targetLoadCount = 0;
fw.loadedCount = 0;

// képek betöltése, ha az összes kép betöltődött, akkor indul a játék
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

// fizikai világ létrehozása
fw.InitWorld = function()
{
    fw.world = new planck.World(new planck.Vec2(0, 150));

    // ütközés események
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

// ha egy pálya végére értünk
fw.FinishLevel = function()
{
    if (!fw.run)
        return;
    
    fw.Shutdown();
    let overlayDiv = document.getElementById("level-finished-overlay");
    ++fw.currentLevel;
    if (fw.currentLevel < 3)
    {
        // ha van még pálya
        overlayDiv.innerText = "Level complete!";
        window.setTimeout(function()
        {
            overlayDiv.className = "level-finished-overlay-hidden";
            fw.LoadLevel(fw.currentLevel);
        }, 2000);
    }
    else
    {
        // ha az összes pályát megcsináltuk
        overlayDiv.innerText = "All levels complete!";
        window.setTimeout(function()
        {
            document.getElementById("menu").style.display = "flex";
            document.getElementById("game").style.display = "none";
            overlayDiv.className = "level-finished-overlay-hidden";
        }, 2000);
    }

    overlayDiv.className = "level-finished-overlay-visible";
}

// leállítja a futást
fw.Shutdown = function()
{
    fw.run = false;
}