/*
Take the Money and Run: A Bot's Journey
by Simon & Aidan

ICM Final Project, Fall 2017
In this game, your player avatar will live out a wild and uninhibited life
of world travel, adventure and excitement while you stay at home,
go to work, and live out your decidedly more inhibited life.  Enjoy.

Sources:
Mappa: https://github.com/cvalenzuela/Mappa
Seriously.js:
	https://github.com/brianchirls/Seriously.js/
	https://www.youtube.com/watch?v=jdKep6jo7b0
*/
let video;
let canvas;

function setup() {
	canvas = createCanvas(640, 480);
	canvas.id('p5canvas');
	video = createCapture(VIDEO);
	video.size(640,480);
	video.id('p5video');

	let seriously = new Seriously();

	let src = seriously.source('#p5video');
	let target = seriously.target('#p5canvas');

}

function draw() {

}

// class for player avatar
class Avatar {
	constructor(pic,startingBudget,loc,currentTime){

		this.pic = pic; //string to hold profile picture location
		this.budget = startingBudget; //starting budget

		//location
		this.latitude = loc.lat;
		this.longitude = loc.lng;

		this.timeStarted = currentTime
	}





}
