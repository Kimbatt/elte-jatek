
class Player extends fw.Entity
{
    constructor(x, y)
    {
        super(x, y);
        this.sprite_idleLeft = fw.sprites["sprites/anim/idle/idle.png"];
        this.sprite_idleRight = fw.sprites["sprites/anim/idle/idle_right.png"];
        this.sprite_runLeft = fw.sprites["sprites/anim/run/run.png"];
        this.sprite_runRight = fw.sprites["sprites/anim/run/run_right.png"];
        this.sprite_jumpLeft = fw.sprites["sprites/anim/jump/jump.png"];
        this.sprite_jumpRight = fw.sprites["sprites/anim/jump/jump_right.png"];
        this.sprite_fallLeft = fw.sprites["sprites/anim/jump/fall.png"];
        this.sprite_fallRight = fw.sprites["sprites/anim/jump/fall_right.png"];
        this.sprite_landLeft = fw.sprites["sprites/anim/jump/land.png"];
        this.sprite_landRight = fw.sprites["sprites/anim/jump/land_right.png"];
        this.sprite_attackLeft = fw.sprites["sprites/anim/attack/attack.png"];
        this.sprite_attackRight = fw.sprites["sprites/anim/attack/attack_right.png"];

        this.animationFrameIndex = 0;
        this.animationFrameCount = 0;
        this.animationType = "idle";
        this.speedY = 10;
        this.lastDirection = 1;
        this.falling = false;

        this.body = fw.world.createBody(Player.bodyDef);
        this.body.createFixture(Player.fixtureDef);
        this.body.setPosition(planck.Vec2(x / PTM, y / PTM));

        this.body.createFixture(Player.attackAreaFixtureDefLeft);
        this.body.createFixture(Player.attackAreaFixtureDefRight);

        this.body.gameobject = this;

        this.setPosition(x, y);
    }

    setPosition(x, y)
    {
        this.body.setPosition(planck.Vec2(x / PTM, y / PTM));
        fw.cameraPositionX = x - canvas.width * 0.5 + 128;
        fw.cameraPositionY = y - canvas.height * 0.5 + 128;
    }

    draw()
    {
        let currentAnimationData = Player.animationData[this.animationType];
        let spriteIndexX = this.animationFrameIndex % currentAnimationData.countX;
        let spriteIndexY = (this.animationFrameIndex / currentAnimationData.countX) | 0;

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
        let left = fw.keyMap.left, right = fw.keyMap.right, up = fw.keyMap.up, down = fw.keyMap.down;
        let dirX = (left == right) ? 0 : (left ? -1 : 1);
        let attack = fw.keyMap.space;

        let velocityX = 0, velocityY = 0;
        let currentVelocity = this.body.getLinearVelocity();

        let jump = false;
        if (up && !this.falling)
        {
            switch (this.animationType)
            {
                case "idle":
                case "run":
                    this.falling = true;
                    velocityY = -55;
                    jump = true;
                    break;
            }
        }
        
        if (dirX !== 0 && this.animationType !== "attack")
        {
            this.lastDirection = dirX;
            velocityX = dirX * 15;
        }

        let newAnimationType = this.animationType;
        
        switch (this.animationType)
        {
            case "idle":
                if (jump)
                    newAnimationType = "jump";
                else if (dirX !== 0)
                    newAnimationType = "run";
                else if (this.falling)
                    newAnimationType = "fall";
                
                break;
            case "run":
                if (jump)
                    newAnimationType = "jump";
                else if (this.falling)
                    newAnimationType = "fall";
                else if (dirX === 0)
                    newAnimationType = "idle";
                
                break;
            //case "jump":
            //    // updated after animation finish
            //    break;
            //case "fall":
            //    // updated on collision enter
            //    break;
            //case "land":
            //    // updated after animation finish
            //    break;
            //case "attack":
            //    // updated after animation finish
            //    break;
        }

        if (attack && (newAnimationType === "idle" || newAnimationType === "run"))
            newAnimationType = "attack";

        let currentAnimationData = Player.animationData[newAnimationType];
        let animationOverride = false;
        if (this.animationType !== newAnimationType)
            this.setNewAnimationType(newAnimationType);
        else
        {
            ++this.animationFrameCount;
            if (this.animationFrameCount === currentAnimationData.frameDuration)
            {
                this.animationFrameCount = 0;
                ++this.animationFrameIndex;
                if (this.animationFrameIndex === currentAnimationData.count)
                {
                    this.animationFrameIndex = 0;
                    animationOverride = currentAnimationData.onFinish && currentAnimationData.onFinish(this);
                }
            }
        }

        if (!animationOverride)
            this.animationType = newAnimationType;

        this.body.setLinearVelocity(planck.Vec2(velocityX, velocityY === 0 ? currentVelocity.y : velocityY));

        let worldpos = this.body.getPosition();
        let targetx = worldpos.x * PTM - canvas.width * 0.5 + 128;
        let targety = worldpos.y * PTM - canvas.height * 0.5 + 128;
        let dx = (targetx - fw.cameraPositionX);
        let dy = (targety - fw.cameraPositionY);
        fw.cameraPositionX = dx * Math.max(Math.atan(Math.abs(dx / canvas.width * 0.5)), 0.12) + fw.cameraPositionX;
        fw.cameraPositionY = dy * Math.max(Math.atan(Math.abs(dy / canvas.height * 0.5)), 0.12) + fw.cameraPositionY;
    }

    setNewAnimationType(type)
    {
        this.animationType = type;
        this.animationFrameIndex = 0;
        this.animationFrameCount = 0;
    }

    onCollision(args, other)
    {
        if (this.isOnGround() && this.falling)
        {
            this.setNewAnimationType("land");
            this.falling = false;
        }
    }

    onCollisionLeave(args, other)
    {
        // hogy ne lehessen ugrani zuhanas kozben
        if (!this.isOnGround())
            this.falling = true;
    }

    isOnGround()
    {
        let contacts = this.body.getContactList();
        do
        {
            let c = contacts.contact;

            if (c.m_manifold.localNormal.y === 1)
                return true;

            contacts = contacts.next;
        } while (contacts);

        return false;
    }
}

Player.events = ["draw", "update"];

Player.animationData =
{
    "idle":
    {
        "countX": 3,
        "countY": 2,
        "count": 6,
        "width": 256,
        "height": 256,
        "offsetXLeft": 40,
        "offsetXRight" : 40,
        "offsetY": 0,
        "frameDuration": 7
    },

    "run":
    {
        "countX": 5,
        "countY": 4,
        "count": 18,
        "width": 320,
        "height": 256,
        "offsetXLeft": 95,
        "offsetXRight": 32,
        "offsetY": 0,
        "frameDuration": 2
    },

    "jump":
    {
        "countX": 4,
        "countY": 3,
        "count": 10,
        "width": 326,
        "height": 256,
        "offsetXLeft": 80,
        "offsetXRight": 0,
        "offsetY": 0,
        "frameDuration": 1,
        "onFinish": player =>
        {
            player.setNewAnimationType("fall");
            return true;
        }
    },

    "fall":
    {
        "countX": 1,
        "countY": 1,
        "count": 1,
        "width": 326,
        "height": 256,
        "offsetXLeft": 80,
        "offsetXRight": 0,
        "offsetY": 0,
        "frameDuration": 1
    },

    "land":
    {
        "countX": 3,
        "countY": 2,
        "count": 5,
        "width": 326,
        "height": 256,
        "offsetXLeft": 80,
        "offsetXRight": 0,
        "offsetY": 0,
        "frameDuration": 1,
        "onFinish": player =>
        {
            player.setNewAnimationType("idle");
            return true;
        }
    },

    "attack":
    {
        "countX": 4,
        "countY": 4,
        "count": 14,
        "width": 360,
        "height": 360,
        "offsetXLeft": 160,
        "offsetXRight": 55,
        "offsetY": -104,
        "frameDuration": 2,
        "onFinish": player =>
        {
            player.setNewAnimationType("idle");
            return true;
        }
    }
};

(() =>
{
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

    Player.shape = box;

    let attackAreaY = 50 / PTM;
    let attackAreaW = 200 / PTM;
    let attackAreaH = 150 / PTM;

    Player.attackAreaLeft = planck.Polygon(
    [
        planck.Vec2(offsetX - attackAreaW, attackAreaY),
        planck.Vec2(offsetX - attackAreaW, attackAreaY + attackAreaH),
        planck.Vec2(offsetX, attackAreaY + attackAreaH),
        planck.Vec2(offsetX, attackAreaY)
    ]);

    Player.attackAreaRight = planck.Polygon(
    [
        planck.Vec2(right, attackAreaY),
        planck.Vec2(right, attackAreaY + attackAreaH),
        planck.Vec2(right + attackAreaW, attackAreaY + attackAreaH),
        planck.Vec2(right + attackAreaW, attackAreaY)
    ]);
})();

Player.fixtureDef =
{
    shape: Player.shape,
    restitution: 0,
    friction: 0,
    fixedRotation: true
}

Player.attackAreaFixtureDefLeft =
{
    shape: Player.attackAreaLeft,
    isSensor: true,
    fixedRotation: true
}

Player.attackAreaFixtureDefRight =
{
    shape: Player.attackAreaRight,
    isSensor: true,
    fixedRotation: true
}

Player.bodyDef =
{
    type: "dynamic"
}