
class Door extends fw.Entity
{
    constructor(x, y)
    {
        super(x, y);
        this.sprite = fw.sprites["sprites/door.png"];

        this.body = fw.world.createBody(Door.bodyDef);
        this.body.createFixture(Door.fixtureDef);
        this.body.setPosition(planck.Vec2((x + 0.5) / PTM * 128, (y - 1) / PTM * 128));

        this.body.gameobject = this;

        this.x = x;
        this.y = y;

        this.posX = x * 128;
        this.posY = y * 128 - 256;
    }

    onCollision(args, other)
    {
        if (other.gameobject === fw.Player)
            fw.FinishLevel();
    }

    draw()
    {
        if (!fw.IsOnScreen(this.posX, this.posY, 256, 384))
            return;

        ctx.globalCompositeOperation = "destination-over";
        ctx.drawImage(this.sprite, (this.posX - fw.cameraPositionX) | 0, (this.posY - fw.cameraPositionY) | 0);
        ctx.globalCompositeOperation = "source-over";
    }
}

Door.events = ["draw"];

Door.fixtureDef =
{
    shape: fw.Box(128, 256),
    isSensor: true
}

Door.bodyDef =
{
    type: "static"
}
