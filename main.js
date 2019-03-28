

window.oncontextmenu = () => false;

function StartGame()
{
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "";

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
xxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxx xxxxx
   xxxxxxxxxxxxxxxxxxxx                       xx       xx xxxxx
   xxxxxxxxxxxxxxxxxxxxxxxxxxx              xxxx      xxxxxxxxx
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
];

const playerStartPositions =
[
    [1400, 1280],
];
