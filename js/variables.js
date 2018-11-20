var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var scene, camera, controls;
var renderer, loader;
var celestialBodies = [];
var objects = [];

var distance = 5, baseDistance = 15;
var rotationSpeed, revolutionSpeed;
var rotations, revolutions;
var globalScale = 1;

var zoomedIn = false;
var currScene, currObj, currCam;

var realScale = false;
var showInfoBox = true;
var showOrbit = true;

var names = [
    "sun",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
];

var distances = [
    0,
    distance,
    distance * 1.895,
    distance * 2.614,
    distance * 4,
    distance * 13.68,
    distance * 25.21,
    distance * 50.36,
    distance * 79.47,
    distance * 103.95,
];

var distancesScaled = [
    0,
    distance * 0.5,
    distance * 1,
    distance * 2,
    distance * 3,
    distance * 6,
    distance * 9,
    distance * 12,
    distance * 15,
    distance * 18,
];

var scaleToSize = [
    1,
    100,
    100,
    100,
    100,
    10,
    10,
    25,
    25,
    300,
];