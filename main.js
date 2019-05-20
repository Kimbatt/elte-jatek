

window.oncontextmenu = () => false;

// ez a függvény indítja a játékot, a new game gombra kattintva
function StartGame()
{
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "";
    document.getElementById("exitToMenuButton").onclick = ExitToMenu;

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
    ]);
}      

function ExitToMenu()
{
    fw.Shutdown();
    document.getElementById("menu").style.display = "flex";
    document.getElementById("game").style.display = "none";
}

// pályák
const levels =
[
`
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                 xxxxx
xxxxxxxxx                                                xxxxxx
xxxxxxxxxx                      xx                     xxxxxxxx
xxxxxxxxxx                   x         s                  xxxxx
xxxxxxxxxxxxxx     s   xxxx         xxxxx               x xxxxx
xxxxxxxxxxx  x    xxxx                  xxx x x         xxxxxxx
xxxxxxxxxxx     xxxxxxxxxxxxxxxx                          xxxxx
xxxxxxxxxxx     xxxx x x x xxx x x xxx x xxx            xxxxxxx
xxxxxxxxxxxxx  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxx xxxxx
   xxxxxxxxxxxxxxxxxxxx                       xx       xx xxxxx
   xxxxxxxxxxx xxxxxxxxxxxxxxx              xxxx      xxxxxxxxx
x           xx              xxxx    xxxx              xxxxxx x
x           xx                xx      xx             xx xxxxxx
x        xxxx          x               xxx           x  xxx  xx
x                      xx             xxxxxxx        xxxxxxxxxx
x  xx               xxxxxx    s           xxxxx  s  xxxxxxxxx
x   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x xx
x x
x x
x x
x x
x x
x x               x
x x               x
x x               x
x                 x
x              d  x
xxxx           xxxx
x xxx         xxxxx
xxxxxxxxxxxxxxxxxxx
`
   ,
`
xxxxxxxxxxx                                        xxxxxxxxxxxxxxxxxx
xxxxxxxxxxx                                        xxxxxxxxxxxxxxxxxx
xxxxxxxxxxx                                s            xxxxxxxxxxxxx
xxxxxxxxxxx                      xxxxxxxxxxxxxxx       xxxxxxxxxxxxxx
xxxxxxxxxxx    d   xxxxxxxxxxxxxxxxxx          xxx     xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxx          xxxxx      xxxxx    xxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    xxxxxxxxxxxxxxx
xx    x                                         x   x               xx
xx    x                                         x   x                xx
xxxx  x                                         x  xx   xxxxxxxx      x
xx    x              xxxxx            x         x       xx     x     xx
xx    x             xx              xxxxx       xx  s    x     xxx   x
xx  xxx        xxxx                xxxx xx      xxxxxxxxxx           x
xx                               xxxxxxx xx                         xx
xx       s   x      xx             x x xxxxx    s            x       xx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`
    ,
`
    xxxxxxxxxxxxxxxxxxxxxxxx
xxxxxx    xxxxxx    xxxxxxxxxxx
xxxxxx                      xxxxxx
xxxxxx                       xxxxxx
xxxxx             s            xxxxxx
xxxxxx      xxxxxxxxxxxxxx       xxxxxx
xxxxx       xxxxxxxxxxxxxxx       xxxxxx
xxxxx      xxxxxxxxxxxxxxxx       xxxxxx
xxxx        xxxxxxxx    xxxxxxx     xxxx
xxxx        xxxxxxx       xxxxxx    xxxx
xxxx       xxxxxxxx                xxxxx
xxxxxx     xxxxxxx     xx    s   xxxxxxx
xxxxxxx     xxxxxxxxx   xxxxxxxxxxxxxxx
xxxxxxx     xxxxxxxxx      xxxxxxxxxxxx
xxxxxxx     xxxxxxxxxx    xxxxxxxxxxxx
xxxxxxx     xxxxxxx       xxxxxxxx
xxxxxx      xxxxxxx    xxxxxxxxxxx
xxxxxx    xxxxxxxxx   xxxxxxxxxxxx                   xxxx
xxxxxx   xxxxxxxxxx   xxxxxxxxxxxx                   xxxx
xxxxxx   xxxxxxxxxxxxxxxxxxxxxxxxx                   xxxxx
xxxxxx       xxxxxxxxxxxxxxxxxxx                     xxxxx
xxxxxxx      xxxxxxxxxxxxxxxxxxx                     xxxxxxx
xxxxxxx        xxxxxxxxxxxxxxxx                      xxxxxxx
xxxxxxx        xxxxxxxxxxxxxxx                       xxxxxxx
xxxxxxx        xxxxxxxxxxxxx                     s       xxx
xxxxxxxx       xxxxxxxxxxxx                   xxxxxx     xxx
xxxxxxxxxxx    xxxxxxxxx                     xxxx  xx    xxx
xxxxxxxx x     xxxxxxxxx    d              xxxxx         xxx
xxxxxxxxx       xxxxxxxxxxxxxxxxx   xxxxx xxx          xxxx
xxxxxxx        xxxxxxxxxxxxxxxxxxxxxxxxxxxxx        xxxxx
xxxxxxx        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx      xxxxxx
xxxxxxx        xxxxxxxxxxxxxxxx                  xxxxxxx
xxxxxxx      xxxxxxxxxxxx               s      xxxxxx
xxxxxxx         xxxx                xxxxxxxxxxxxxxxx
xxxxxxx           xx               xxxxxxxxxxxxxxx
xxxxxxxxx         x               xxxxxxxxxxxxxxxx
xxxxxxxx                 xxxxxxxxxxxxxxxxxxxx
xxxxxx                xxxxxxxxxxxxxxxxxxx
xxxxxxx              xxxxxxxxxxxxxxxx
 xxxxxx         xxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxx
   xxxxxxxxxxxxxxxxxx`
];

// a játékos kiinduló pozíciója az adott pályákon
const playerStartPositions =
[
    [1400, 1280],
    [200, 1100],
    [2400, 2300],
];
