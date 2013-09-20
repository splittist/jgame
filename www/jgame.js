window.addEventListener('load',function(e) {

    var Q = window.Q = Quintus().include("Sprites, Scenes, Input, Touch, 2D, Anim, UI");
    
    Q.setup({ maximize: true })
	.touch(Q.SPRITE_ALL);

    function randomX() {
	return (Math.random()*(Q.width - 90)) + 25;
    };

    function randomY() {
	return (Math.random()*(Q.height - 120)) + 40;
    };
    
    Q.Sprite.extend("GoldCoin", {
	init: function(p) {

	    p = this.createCoin(p);
	    
	    this._super(p,{
		sprite: "gold_coin",
		sheet: "gold_coin"
	    });
	    
	    this.add("animation, 2d");
	    this.p.gravity = 0;
	    this.play("spin");

	    this.on("touch");
	},

	touch: function(touch) {
	    if(Q.state.get("charge") > 0) {
		this.p.gravity = 3;
		this.play("fall");
	    }
	},

	createCoin: function(p) {
            p = p || {};

            p.x = randomX();
            p.y = randomY();	
    return p;
	}

    });

    Q.Sprite.extend("GreenDollar", {
	init: function(p) {
	    
	    p = this.createDollar(p);

	    this._super(p,{
		sprite: "green_dollar",
		sheet: "green_dollar"
	    });
	    
	    this.add("2d");
	    this.p.gravity = 0;
	    
	    this.on("touch");
	},

	touch: function(touch) {
	    if(Q.state.get("charge") > 0) {
		this.p.gravity = 3;
	    }
	},

	createDollar: function(p) {
            p = p || {};

            p.x = randomX();
            p.y = randomY();
	    return p;
	}
	
    });

    Q.Sprite.extend("RedDollar", {
	init: function(p) {

	    p = this.createDollar(p);
	    
	    this._super(p,{
		sprite: "red_dollar",
		sheet: "red_dollar"
	    });
	    
	    this.add("animation, 2d");
	    this.p.gravity = 0;
	    this.play("spin");

	    this.on("touch");
	},

	touch: function(touch) {
	    this.p.gravity = 3;
	    this.play("fall");
	},

	createDollar: function(p) {
            p = p || {};

            p.x = randomX();
            p.y = randomY();
	    return p;
	}
    });
    
    Q.Sprite.extend("Battery", {
	init: function(p) {
	    this._super({
		w: 64,
		h: 32,
		x: Q.width - 100,
		y: Q.height - 24
	    });
	},

	draw: function(ctx) {
	    ctx.fillStyle = "black";
	    ctx.lineWidth = 2;
	    
	    ctx.beginPath();
	    ctx.moveTo(-this.p.cx, -this.p.cy);
	    ctx.lineTo(this.p.cx - 4, -this.p.cy);
	    ctx.lineTo(this.p.cx - 4, this.p.cy);
	    ctx.lineTo(-this.p.cx, this.p.cy);
	    ctx.lineTo(-this.p.cx, -this.p.cy);
	    ctx.stroke();
	    ctx.fillRect(this.p.cx -2, this.p.y + 2, 2, 2);

	    var fill = Math.max(0,
				Math.floor(Q.state.get("charge")/100 * (this.p.w - 12)));

	    ctx.fillRect(-this.p.cx + 4, -this.p.cy + 4,
			 fill, this.p.h - 8);
	}
    });

    Q.Sprite.extend("Charger", {
	init: function(p) {
	    this._super({
		y: Q.height/2,
		x: Q.width - 20,
		w: 32,
		h: Q.height - 200
	    });
	    this.on("touch");
	},

	touch: function(touch) {
	    Q.state.set("charge",100);
	},

	draw: function(ctx) {
	    ctx.fillStyle = "gold";
	    ctx.lineWidth = 5;
	    ctx.strokeStyle = "gold";

	    //draw a circle
	    ctx.beginPath();
	    ctx.arc(0, this.p.cy - 16, 16, 0, Math.PI*2, true);
	    ctx.closePath();
	    ctx.fill();

	    //draw the zig-zag
	    ctx.beginPath();
	    ctx.moveTo(0 , this.p.cy - 32);
	    ctx.lineTo(0 , this.p.cy - 48);
	    ctx.lineTo(this.p.cx, this.p.cy - 64);
	    var xx = -this.p.cx;
	    var yy = this.p.cy - 80;
	    while(yy > -this.p.cy) {
		ctx.lineTo(xx,yy);
		xx = -1 * xx;
		yy -= 16;
	    };
	    ctx.stroke();
	},
    });

    Q.Sprite.extend("RedCross", {
	init: function(p) {

	    p = this.createCross(p);

	    this._super(p,{
		type: Q.SPRITE_PARTICLE,
		asset: "red_cross.png"
	    });

	    this.on("touch");
	},

	touch: function(touch) {
	    Q.state.inc("warnings",1);
	    if(Q.state.get("warnings") > 1) {
		Q.stageScene("gameOver");
	    } else {
		this.stage.insert(new Q.Warning())
		Q.stage().pause();
	    }
	},

	createCross: function(p) {
	    p = p || {};

	    p.x = randomX();
	    p.y = randomY();
	    return p;
	}
    });

    Q.Sprite.extend("CoinCollector",{
	init: function(p) {
	    this._super(p,{
		color: "gold",
		w: Q.width,
		h: 50
	    });
	    this.on("hit",this,"collision");
	},
	
	draw: function(ctx) {
	    ctx.fillStyle = this.p.color;
	    // Draw a filled rectangle centered at
	    // 0,0 (i.e. from -w/2,-h2 to w/2, h/2)
	    ctx.fillRect(-this.p.cx,
			 -this.p.cy,
			 this.p.w,
			 this.p.h);
	    
	},

	collision: function(collision) {
	    if(collision.obj.isA("GoldCoin")) {
		collision.obj.destroy();
		Q.state.inc("score",10);
		Q.state.dec("charge",20);
	    } else if(collision.obj.isA("GreenDollar")) {
		collision.obj.destroy();
		Q.state.inc("score",50);
		Q.state.dec("charge",10);
	    } else if(collision.obj.isA("RedDollar")) {
		collision.obj.destroy();
		Q.state.dec("lives",1);
		if(Q.state.get("lives") < 1) {
		    Q.stageScene("gameOver");
		}
	    }
	},

	step: function(dt) {
	    if((Q("GoldCoin").length == 0) && (Q.state.get("lives") > 0)) {
		this.stage.trigger("complete");
	    }
	}
    });
    
    // Number of shapes to add to the page
    var numCoins = 10;
    var numDollars = 5;
    var numCrosses = 2;

    // Scene that actually adds shapes onto the stage
    Q.scene("start",new Q.Scene(function(stage) {

	Q.state.reset({ score: 0, lives: 3, charge: 100, warnings: 0 });

	var redCrossesLeft = numCrosses;
	while(redCrossesLeft-- > 0) {
	    var x = new Q.RedCross();
	    stage.insert(x);
	};
	var coinsLeft = numCoins;
	while(coinsLeft-- > 0) {
	    var c = new Q.GoldCoin();
	    stage.insert(c);
	};
	var dollarsLeft = numDollars;
	while(dollarsLeft-- > 0) {
	    var d = new Q.GreenDollar();
	    stage.insert(d);
	};
	var redDollarsLeft = numDollars;
	while(redDollarsLeft-- > 0) {
	    var r = new Q.RedDollar();
	    stage.insert(r);
	};
	stage.insert(new Q.CoinCollector({
	    x: Q.width/2,
	    y: Q.height - 25}));
	stage.insert(new Q.Charger());

	Q.stageScene("hud",1);

	stage.on("complete",function() { Q.stageScene("winner");});

    }));

    Q.UI.Text.extend("Lives",{
	init: function() {
	    this._super({
		label: "♥♥♥",
		color: "red",
		align: "left",
		x: 70,
		y: Q.height - 20,
		weight: "normal",
		size:42
	    });

	    Q.state.on("change.lives",this,"lives");
	},

	lives: function(lives) {
	    this.p.label = "";
	    while(lives-- > 0) {
		this.p.label += "♥";
	    }
	}
    });

    Q.UI.Text.extend("Score",{
	init: function() {
	    this._super({
		label: "$0",
		align: "center",
		x: Q.width/2,
		y: Q.height - 20
	    });

	    Q.state.on("change.score",this,"score");
	},

	score: function(score) {
	    this.p.label = "$" + score;
	}
    });

    Q.UI.Text.extend("Charge",{
	init: function() {
	    this._super({
		label: "Charge: 100",
		align: "right",
		x: Q.width - 100,
		y: Q.height - 20
	    });

	    Q.state.on("change.charge",this,"charge");
	},

	charge: function(charge) {
	    this.p.label = "Charge: " + charge;
	}
    });

    Q.scene("hud", function(stage) {
	stage.insert(new Q.Score());
	stage.insert(new Q.Lives());
//	stage.insert(new Q.Charge());
	stage.insert(new Q.Battery());
    });

    Q.Sprite.extend("Warning", {
	init: function(p) {
	    this._super({
		x: Q.width/2,
		y: Q.height/2,
		asset: "warning.png"
	    });
	    
	    this.on("touch");
	},

	touch: function(touch) {
	    Q.stage().unpause();
	    this.destroy();
	}
    });
	    
    Q.Sprite.extend("Title", {
	init: function(p) {
	    this._super({
		y: 150,
		x: Q.width/2,
		asset: "title.png"
	    });
	}
    });

    Q.Sprite.extend("Background",{
	init: function(p) {
	    this._super(p,{
		x: Q.width/2,
		y: Q.height/2,
		asset: 'background-wall.png',
		type: Q.SPRITE_NONE
	    });
	}
    });

    Q.scene("title",function(stage) {
	
	// Clear the hud out
	Q.clearStage(1); 
	
	var bg = stage.insert(new Q.Background({ type: Q.SPRITE_UI }));
	bg.on("touch",function() {  Q.stageScene("start");  });
	
	stage.insert(new Q.Title());
	
	stage.insert(new Q.UI.Text({
	    label: "Tap to start",
	    align: 'center',
	    x: Q.width/2,
	    y: 280,
	}));


	stage.insert(new Q.UI.Text({
	    label: "Don't tap the red items!",
	    align: 'center',
	    x: Q.width/2,
	    y: 370,
	}));
    });

    Q.scene("gameOver",function(stage) {
	
	var bg = stage.insert(new Q.Background({ type: Q.SPRITE_UI }));
	bg.on("touch",function() {  Q.stageScene("title");  });
	
	stage.insert(new Q.Title());
	
	stage.insert(new Q.UI.Text({
	    label: "Game Over!",
	    align: 'center',
	    x: Q.width/2,
	    y: 350,
	}));

    });

    Q.scene("winner",function(stage) {

	var bg = stage.insert(new Q.Background({ type: Q.SPRITE_UI }));
	bg.on("touch",function() {  Q.stageScene("title");  });
	
	stage.insert(new Q.Title());
	
	stage.insert(new Q.UI.Text({
	    label: "You Win!",
	    align: 'center',
	    x: Q.width/2,
	    y: 350,
	}));
	
    });

    Q.load("gold_coin.png, gold_coin.json, green_dollar.png, green_dollar.json, red_dollar.png, red_dollar.json, title.png, background-wall.png, red_cross.png, warning.png", function() {
	Q.compileSheets("gold_coin.png","gold_coin.json");	
Q.compileSheets("green_dollar.png","green_dollar.json");
	Q.compileSheets("red_dollar.png","red_dollar.json");

	Q.animations('gold_coin', {
	    spin: { frames: [7,6,5,4,3,2,1,0], rate: 1/8 },
	    fall: { frames: [4], loop: false }
	});
	Q.animations('red_dollar', {
	    spin: { frames: [0], loop: false },
	    fall: { frames: [1], loop: false }
	});

	Q.stageScene("title");
    });

});
