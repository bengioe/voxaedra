voxaedra
========

Yet another voxel RTS game.


Train of Though
===============

I don't exactly know what kind of game I want to build yet.

What I have in mind is a game where you give objective in your denizens, and they find ways to accomplish them. Objectives such as building, digging, piling and ultimately destroying things.

The game is in 3d, using voxels to render the game. I'd like the terrain also to be in 3d, but it does seem like an additionnal game logic and rendering challenge.

Terrain
-------

I'd like to start by thinking about the terrain. The Terrain is made of lots and lots of cubic blocks, each made of a certain amount of subblocks, which render to voxels. Blocks are of certain types and have certain properties. They can potentially be digged, built upon, or maybe just burned away.

### Terrain Objects

So of course, a terrain will contain objects, like stockpiles and chests, each responsible of their appearance.