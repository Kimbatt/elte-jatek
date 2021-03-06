const fw = {};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// külön canvas van a háttérnek
const backgroundCanvas = document.getElementById("background-canvas");
const backgroundCtx = backgroundCanvas.getContext("2d");

const targetWindowHeight = 960;
let ratio;
fw.WindowResized = function()
{
    ratio = window.innerHeight / targetWindowHeight;
    document.documentElement.style.setProperty("--pixelratio", window.devicePixelRatio);
    document.body.style.zoom = (ratio * 100) + "%";
    const w = window.innerWidth / ratio;
    canvas.width = w;
    canvas.height = targetWindowHeight;
    
    backgroundCanvas.width = w;
    backgroundCanvas.height = targetWindowHeight;
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
    }
    
    subscribeForEvents()
    {
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

if (isTouchDevice)
{
    const touchChanged = function(ev)
    {
        fw.keyMap.up = false;
        fw.keyMap.left = false;
        fw.keyMap.down = false;
        fw.keyMap.right = false;

        if (ev.target && ev.target.tagName !== "CANVAS")
            return;

        const posX = ev.clientX, posY = ev.clientY;
        const w = window.innerWidth, h = window.innerHeight;

        /*
        
        screen:

        +-----------------------+
        | jump  | jump  | jump  |
        | left  |  up   | right |
        |       |       |       |
        +-----------------------+
        |           |           |
        |  go left  |  go right |
        |           |           |
        +-----------------------+
        
        */
        if (posY > h / 2) // képernyő alja
        {
            if (posX < w / 2)
                fw.keyMap.left = true;
            else
                fw.keyMap.right = true;
        }
        else
        {
            fw.keyMap.up = true;
            if (posX < w / 3)
                fw.keyMap.left = true;
            else if (posX > w / 3 * 2)
                fw.keyMap.right = true;
        }
    };

    window.addEventListener("touchstart", function(ev)
    {
        touchChanged(ev.touches[0]);
    });

    window.addEventListener("touchend", function(ev)
    {
        fw.keyMap.up = false;
        fw.keyMap.left = false;
        fw.keyMap.down = false;
        fw.keyMap.right = false;
    });

    window.addEventListener("touchmove", function(ev)
    {
        touchChanged(ev.touches[0]);
    });


    document.getElementById("attackButton").ontouchstart = function()
    {
        fw.keyMap.space = true;
    };

    document.getElementById("attackButton").ontouchend = function()
    {
        fw.keyMap.space = false;
    };
}
else
{
    window.addEventListener("keydown", event => fw.KeyStateChanged(event.code, true));
    window.addEventListener("keyup", event => fw.KeyStateChanged(event.code, false));
}

let backgroundPattern;

fw.Start = function()
{
    backgroundPattern = ctx.createPattern(fw.sprites["sprites/background.jpg"], "repeat");
    document.getElementById("loading-overlay").style.display = "none";

    if (!levelEditorPlaying)
        fw.LoadLevel(levels[0]);
}

fw.currentLevel = 0;
// pálya betöltése
fw.LoadLevel = function(level)
{
    let levelStr;
    if (typeof level === "number")
        levelStr = levels[level];
    else
        levelStr = level;

    fw.run = true;
    fw.Entity.ID = 0;
    fw.Entities = {};
    fw.subscribers = {};
    fw.InitWorld();
    fw.Player = new Player();

    // pálya feldolgozása
    let tilesRows = levelStr.split("\n");
    let tilemap = {};
    for (let i = 0; i < tilesRows.length; ++i)
    {
        let currentRow = tilesRows[i];
        for (let j = 0; j < currentRow.length; ++j)
        {
            const char = currentRow[j];
            switch (char)
            {
                case "x":
                    tilemap[j + " " + i] = new Tile(j, i, fw.sprites["sprites/tilemap.png"]);
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
                case "p":
                    fw.Player.setPosition(j * 128 - 64, (i - 1) * 128);
                    break;
            }
        }
    }

    for (let coord in tilemap)
    {
        const currentTile = tilemap[coord];
        currentTile.selectSprite(tilemap);
    }

    if (typeof level === "number")
        fw.currentLevel = level;

    if (isTouchDevice)
        document.getElementById("attackButton").style.display = "";

    fw.Update();
}

fw.ImageLoaded = function()
{
    if (++fw.loadedCount == fw.targetLoadCount)
        fw.AllImagesLoadedCallback();
}

fw.sprites = {};

fw.targetLoadCount = 0;
fw.loadedCount = 0;

// képek betöltése, ha az összes kép betöltődött, akkor indul a játék
fw.LoadImages = function(images, callback)
{
    fw.AllImagesLoadedCallback = callback
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

fw.LoadRequiredImages = function(callback)
{
    fw.LoadImages([
        "sprites/anim/idle/idle.png", "sprites/anim/idle/idle_right.png",
        "sprites/anim/run/run.png", "sprites/anim/run/run_right.png",
        "sprites/tilemap.png",
        "sprites/background.jpg",
        "sprites/anim/jump/jump.png", "sprites/anim/jump/jump_right.png",
        "sprites/anim/jump/fall.png", "sprites/anim/jump/fall_right.png",
        "sprites/anim/jump/land.png", "sprites/anim/jump/land_right.png",
        "sprites/door.png",
        "sprites/anim/attack/attack.png", "sprites/anim/attack/attack_right.png",
        "sprites/skeleton/appear/appear.png", "sprites/skeleton/appear/appear_right.png",
        "sprites/skeleton/attack/attack.png", "sprites/skeleton/attack/attack_right.png",
        "sprites/skeleton/die/die.png", "sprites/skeleton/die/die_right.png",
        "sprites/skeleton/idle/idle.png", "sprites/skeleton/idle/idle_right.png",
        "sprites/skeleton/walk/walk.png", "sprites/skeleton/walk/walk_right.png",
        "sprites/zombie/appear/appear.png", "sprites/zombie/appear/appear_right.png",
        "sprites/zombie/attack/attack.png", "sprites/zombie/attack/attack_right.png",
        "sprites/zombie/die/die.png", "sprites/zombie/die/die_right.png",
        "sprites/zombie/idle/idle.png", "sprites/zombie/idle/idle_right.png",
        "sprites/zombie/walk/walk.png", "sprites/zombie/walk/walk_right.png",
    ], callback);
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
    const overlayDiv = document.getElementById("level-finished-overlay");

    if (levelEditorPlaying)
    {
        overlayDiv.innerText = "Level complete!";
        window.setTimeout(function()
        {
            overlayDiv.className = "level-finished-overlay-hidden";
            levelEditorPlaying = false;
            levelEditorRunning = true;
            
            document.getElementById("levelEditor-buttons").style.display = "";
            
            const playButton = document.getElementById("levelEditor-play");
            playButton.onclick = levelEditor.PlayLevel;
            playButton.innerText = "Play";

            document.getElementById("exitToMenuButton").style.display = "";
            document.getElementById("attackButton").style.display = "none";

            levelEditor.Update();
        }, 2000);
    }
    else
    {
        ++fw.currentLevel;
        if (fw.currentLevel < 3)
        {
            // ha van még pálya
            overlayDiv.innerText = "Level complete!";
            window.setTimeout(function()
            {
                overlayDiv.className = "level-finished-overlay-hidden";
                fw.LoadLevel(levels[fw.currentLevel]);
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
    }

    overlayDiv.className = "level-finished-overlay-visible";
}

// leállítja a futást
fw.Shutdown = function()
{
    fw.run = false;
}