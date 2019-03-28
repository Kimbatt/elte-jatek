
class Tile extends fw.Entity
{
    constructor(x, y)
    {
        super(x, y);
        this.sprite = fw.sprites["sprites/tilemap.png"];

        this.body = fw.world.createBody(Tile.bodyDef);
        this.body.createFixture(Tile.fixtureDef);
        this.body.setPosition(planck.Vec2(x / PTM * 128, y / PTM * 128));

        this.body.gameobject = this;

        this.x = x;
        this.y = y;

        this.posX = x * 128;
        this.posY = y * 128;
    }

    selectSprite()
    {
        let border = 0x00;
        let temp;

        // top
        temp = Tile.tilemap[this.y - 1]
        if (temp && temp[this.x])
            border |= 0x01;
            
        // right
        temp = Tile.tilemap[this.y]
        if (temp && temp[this.x + 1])
            border |= 0x02;
        
        // bottom
        temp = Tile.tilemap[this.y + 1]
        if (temp && temp[this.x])
            border |= 0x04;
            
        // left
        temp = Tile.tilemap[this.y]
        if (temp && temp[this.x - 1])
            border |= 0x08;
            
        // topleft
        if ((border & 0x09) === 0x09)
        {
            temp = Tile.tilemap[this.y - 1]
            if (temp && temp[this.x - 1])
                border |= 0x10;
        }
            
        // topright
        if ((border & 0x03) === 0x03)
        {
            temp = Tile.tilemap[this.y - 1]
            if (temp && temp[this.x + 1])
                border |= 0x20;
        }
        
        // bottomright
        if ((border & 0x06) === 0x06)
        {
            temp = Tile.tilemap[this.y + 1]
            if (temp && temp[this.x + 1])
                border |= 0x40;
        }
            
        // bottomleft
        if ((border & 0x0c) === 0x0c)
        {
            temp = Tile.tilemap[this.y + 1]
            if (temp && temp[this.x - 1])
                border |= 0x80;
        }
        
        let index = Tile.spriteData[border];
        this.spriteX = (index & 0x07) * 256;
        this.spriteY = (7 - (index >> 3)) * 256 + 128;
    }

    draw()
    {
        if (!fw.IsOnScreen(this.posX, this.posY, 128, 128))
            return;

        let position = this.body.getPosition();
        ctx.drawImage(this.sprite, this.spriteX, this.spriteY, 128, 128,
            (position.x * PTM - fw.cameraPositionX) | 0, (position.y * PTM - fw.cameraPositionY) | 0, 128, 128);
    }
}

Tile.events = ["draw"];

Tile.fixtureDef =
{
    shape: fw.Box(128, 128),
    restitution: 0,
    friction: 0.1,
    density: 1
}

Tile.bodyDef =
{
    type: "static"
}

// 0x1 up 0x2 right 0x4 bottom 0x8 left
// 0x10 topleft 0x20 topright 0x40 bottomright 0x80 bottomleft
/*

        0x10    0x01     0x20
        
        0x08             0x02

        0x80    0x04     0x40

        10 a
        11 b
        12 c
        13 d
        14 e
        15 f
*/
Tile.spriteData =
{
    0xff: 0x00, 0x00: 0x01, 0x04: 0x02, 0x46: 0x03, 0x67: 0x04, 0x47: 0x05, 0x06: 0x06, 0x27: 0x07,
    0x07: 0x08, 0x08: 0x09, 0x8c: 0x0a, 0x0a: 0x0b, 0x0c: 0x0c, 0x0e: 0x0d, 0x02: 0x0e, 0xce: 0x0f,
    0x4e: 0x10, 0x23: 0x11, 0x3b: 0x12, 0x2b: 0x13, 0x8e: 0x14, 0x03: 0x15, 0x1b: 0x16, 0x0b: 0x17,
    0x01: 0x18, 0x05: 0x19, 0x19: 0x1a, 0x9d: 0x1b, 0xff: 0x1c, 0xdf: 0x1d, 0xbf: 0x1e, 0x9f: 0x1f,
    0x1d: 0x20, 0x7f: 0x21, 0x5f: 0x22, 0x3f: 0x23, 0x1f: 0x24, 0x09: 0x25, 0x8d: 0x26, 0xef: 0x27,
    0xcf: 0x28, 0xaf: 0x29, 0x8f: 0x2a, 0x0d: 0x2b, 0x6f: 0x2c, 0x4f: 0x2d, 0x2f: 0x2e, 0x0f: 0x2f
};