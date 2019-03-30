
class Enemy extends fw.Entity
{
    constructor(x, y, type)
    {
        super(x, y);

        // megfelelő spritesheetek kiválasztása
        this.sprite_idleLeft = fw.sprites["sprites/" + type + "/idle/idle.png"];
        this.sprite_idleRight = fw.sprites["sprites/" + type + "/idle/idle_right.png"];
        this.sprite_dieLeft = fw.sprites["sprites/" + type + "/die/die.png"];
        this.sprite_dieRight = fw.sprites["sprites/" + type + "/die/die_right.png"];

        this.animationFrameIndex = 0;
        this.animationFrameCount = 0;
        this.animationType = "idle";
        this.speedY = 10;
        this.lastDirection = (Math.random() < 0.5) ? 1 : -1;

        this.body = fw.world.createBody(Enemy.bodyDef);
        this.body.createFixture(Enemy.fixtureDef);
        this.body.setPosition(planck.Vec2(x / PTM * 128, (y - 1) / PTM * 128));

        this.body.gameobject = this;

        // ha megütik akkor villog egy ideig
        this.flash = false;

        this.health = 3;
    }

    draw()
    {
        // villogás esetén nem mindig van kirajzolva
        if (this.flash)
        {
            let frame = (this.flashDuration / hitFlashInterval) | 0;
            if (frame & 1)
                return;
        }

        let currentAnimationData = Enemy.animationData[this.animationType];
        let spriteIndexX = this.animationFrameIndex % currentAnimationData.countX;
        let spriteIndexY = (this.animationFrameIndex / currentAnimationData.countX) | 0;

        // megfelelő sprite és animációk kiválasztása
        let currentSpriteSheet = this["sprite_" + this.animationType + ((this.lastDirection == -1) ? "Left" : "Right")];

        let offsetX = ((this.lastDirection == -1) ? currentAnimationData.offsetXLeft : currentAnimationData.offsetXRight) * this.lastDirection;

        let bodyPosition = this.body.getPosition();
        ctx.drawImage(currentSpriteSheet,
                    spriteIndexX * currentAnimationData.width, spriteIndexY * currentAnimationData.height,
                    currentAnimationData.width, currentAnimationData.height,

                    (bodyPosition.x * PTM + offsetX - fw.cameraPositionX) | 0, (bodyPosition.y * PTM - fw.cameraPositionY + currentAnimationData.offsetY) | 0,
                    currentAnimationData.width, currentAnimationData.height);
    }

    update()
    {
        // animáció frissítése
        let currentAnimationData = Enemy.animationData[this.animationType];
        ++this.animationFrameCount;
        if (this.animationFrameCount === currentAnimationData.frameDuration)
        {
            this.animationFrameCount = 0;
            ++this.animationFrameIndex;
            if (this.animationFrameIndex === currentAnimationData.count)
            {
                this.animationFrameIndex = 0;
                currentAnimationData.onFinish && currentAnimationData.onFinish(this);
            }
        }
            
        if (this.flash)
        {
            if (++this.flashDuration === hitFlashDuration)
                this.flash = false;
        }
    }

    setNewAnimationType(type)
    {
        this.animationType = type;
        this.animationFrameIndex = 0;
        this.animationFrameCount = 0;
    }

    // ez a függvény hívódik meg, ha megütik
    receiveHit()
    {
        if (--this.health === 0)
        {
            this.setNewAnimationType("die");
            this.flash = false;
            fw.destroyedObjects.push(this);
            return;
        }

        this.flash = true;
        this.flashDuration = 0;
    }
}

Enemy.events = ["draw", "update"];

// animáció adatok
Enemy.animationData =
{
    "idle":
    {
        "countX": 6,
        "countY": 1,
        "count": 6,
        "width": 158,
        "height": 256,
        "offsetXLeft": -75,
        "offsetXRight" : 20,
        "offsetY": 0,
        "frameDuration": 7
    },

    "die":
    {
        "countX": 8,
        "countY": 1,
        "count": 8,
        "width": 320,
        "height": 256,
        "offsetXLeft": 0,
        "offsetXRight" : -50,
        "offsetY": 0,
        "frameDuration": 6,
        "onFinish": enemy =>
        {
            fw.RemoveEntity(enemy);
        }
    },
};

(() =>
{
    // fizikai objektum létrehozása
    let bodyWidth = 100;
    const bodyHeight = 240;
    let offsetX = (256 - bodyWidth) * 0.5 / PTM;
    let right = bodyWidth / PTM + offsetX;

    let vertices =
    [
        planck.Vec2(offsetX, (256 - bodyHeight) / PTM),
        planck.Vec2(offsetX, 250 / PTM),
        planck.Vec2(offsetX + 6 / PTM, 256 / PTM),
        planck.Vec2(right - 6 / PTM, 256 / PTM),
        planck.Vec2(right, 250 / PTM),
        planck.Vec2(right, (256 - bodyHeight) / PTM)
    ];

    const box = planck.Polygon(vertices);

    Enemy.shape = box;
})();

Enemy.fixtureDef =
{
    shape: Enemy.shape,
    restitution: 0,
    friction: 1,
    density: 100,
    fixedRotation: true
}

Enemy.bodyDef =
{
    type: "dynamic"
}

const hitFlashInterval = 5;
const hitFlashDuration = 40;
