

window.oncontextmenu = () => false;

// ez a függvény indítja a játékot, a new game gombra kattintva
function StartGame()
{
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "";
    document.getElementById("loading-overlay").style.display = "flex";
    document.getElementById("exitToMenuButton").onclick = ExitToMenu;

    fw.LoadRequiredImages(fw.Start);
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
xxxxxxxxxx p                 x         s                  xxxxx
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
xxp   x                                         x   x                xx
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
xxxxxx   xxxxxxxxxx p xxxxxxxxxxxx                   xxxx
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
/*
// a játékos kiinduló pozíciója az adott pályákon
const playerStartPositions =
[
    [1400, 1280],
    [200, 1100],
    [2400, 2300],
];*/
