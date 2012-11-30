//Word woodles - With Multiplayer!
//jQuery'd by Coffeejawa. 
//p1rat33r@gmail.com

(function($){  
	$.fn.woodles = function(options) {
		///////
		// Helper stuff
		
		function AssertException(message) { this.message = message; }
		function AssertException(message) { this.message = message; }
		AssertException.prototype.toString = function () {
		  return 'AssertException: ' + this.message;
		};

		function assert(exp, message) {
		  if (!exp) {
		    throw new AssertException(message);
		  }
		}
			
   		/////////////////////////////////////////////
		// Classes
   		
		function Board(){
	   		this.rows = 15;
			this.cols = 15;
				
			this.mapping = [
			   		[0,0,0,'tw',0,0,'tl',0,'tl',0,0,'tw',0,0,0],
			   		[0,0,'dl',0,0,'dw',0,0,0,'dw',0,0,'dl',0,0],
			   		[0,'dl',0,0,'dl',0,0,0,0,0,'dl',0,0,'dl',0],
			   		['tw',0,0,'tl',0,0,0,'dw',0,0,0,'tl',0,0,'tw'],
			   		[0,0,'dl',0,0,0,'dl',0,'dl',0,0,0,'dl',0,0],
			   		[0,'dw',0,0,0,'tl',0,0,0,'tl',0,0,0,'dw',0],
			   		['tl',0,0,0,'dl',0,0,0,0,0,'dl',0,0,0,'tl'],
			   		[0,0,0,'dw',0,0,0,'star',0,0,0,'dw',0,0,0],
			   		['tl',0,0,0,'dl',0,0,0,0,0,'dl',0,0,0,'tl'],
			   		[0,'dw',0,0,0,'tl',0,0,0,'tl',0,0,0,'dw',0],
			   		[0,0,'dl',0,0,0,'dl',0,'dl',0,0,0,'dl',0,0],
			   		['tw',0,0,'tl',0,0,0,'dw',0,0,0,'tl',0,0,'tw'],
			   		[0,'dl',0,0,'dl',0,0,0,0,0,'dl',0,0,'dl',0],
			   		[0,0,'dl',0,0,'dw',0,0,0,'dw',0,0,'dl',0,0],
			   		[0,0,0,'tw',0,0,'tl',0,'tl',0,0,'tw',0,0,0]
			   		];			
			this.GetHTML = function() {
				str = '';
				var count = 0;
				for(var i=0; i < this.rows; i++){
					str += '<div class="boardrow">';
					for(var j=0; j < this.cols; j++){
						var fill='';
						switch(this.mapping[i][j]){
							case 0:
								break;
							case 'dl':
								fill='dl';
								break;
							case 'tl':
								fill='tl';
								break;
							case 'dw':
								fill='dw';
								break;
							case 'tw':
								fill='tw';
								break;
							case 'star':
								fill='star';
								break;
						}
						str += ('<div id="c' + count + '" class="cell ' + fill + '"><div class="header">' + fill.toUpperCase() + '</div></div>');
					count += 1;
					}
					str+="</div><br />"; //boardrow
				}
				return str + '</div>';
			};
		} 

		function Player(name) {
			//World has a global tileset			
			this.tileset = new TileSet();
			this.name = name;
		}
		function ScoreBoard(){
			this.activePlayer = 1;
			this.player1Score = 0;
			this.player2Score = 0;
			this.UpdateScore = function(player1Score,player2Score){
				this.player1Score += player1Score;
				this.player2Score += player2Score;
				$("div#player1").html('Player 1: '+this.player1Score);
				$("div#player2").html('Player 2: '+this.player2Score);
			};
			this.SetActivePlayer = function(i){
				this.activePlayer = i;
				$(".active").removeClass("active");
				$("#player"+i).addClass("active");
			};
			this.SwitchActivePlayer = function(){
				if( this.activePlayer == 1 )
					this.SetActivePlayer(2);
				else
					this.SetActivePlayer(1);
			};
		}

		function Tile(inLetter, inID, inPoints){
			this.letter = inLetter;
			this.tileID = inID;
			this.points = inPoints;
			this.bOnBoard = false;
			this.bChosen = false;
									
			this.GetHTML = function(){
				return '<div id="t' + this.tileID + '" class="tile">' + this.letter + '<div class="points">' + this.points +'</div></div>';
			};
		};

		function TilesDisplay(){
			this.tileset = null;
			this.GetHTML = function(){
				var html = '<div class="TilesDisplay"><div>';
				// Always have 7 cells, some may be empty
				for( var i = 0; i < 7; i++ ){	
					html+='<div class="display cell">';
					if( i < this.tileset.tiles.length ){
						html += this.tileset.tiles[i].GetHTML();
					}
					html+='</div>'; //cell		
				}
				return html + '</div></div>'; //div, TilesDisplay
			};
		}
		function TileSet(){	
			this.tiles = new Array();
			this.maxTiles = 100;
			this.setToFullSet = function(){
				var tempTiles = [
					'A','A','A','A','A','A','A','A','A','B',
					'B','C','C','D','D','D','D','E','E','E',
					'E','E','E','E','E','E','E','E','E','F',
					'F','G','G','G','H','H','I','I','I','I',
					'I','I','I','I','I','J','K','L','L','L',
					'L','M','M','N','N','N','N','N','N','O',
					'O','O','O','O','O','O','O','P','P','Q',
					'R','R','R','R','R','R','S','S','S','S',
					'T','T','T','T','T','T','U','U','U','U',
					'V','V','W','W','X','Y','Y','Z','_','_',
				];
				var tempPoints = [
				   1,1,1,1,1,1,1,1,1,3,
				   3,3,3,2,2,2,2,1,1,1,
				   1,1,1,1,1,1,1,1,1,4,
				   4,2,2,2,4,4,1,1,1,1,
				   1,1,1,1,1,8,5,1,1,1,
				   1,3,3,1,1,1,1,1,1,1,
				   1,1,1,1,1,1,1,3,3,10,
				   1,1,1,1,1,1,1,1,1,1,
				   1,1,1,1,1,1,1,1,1,1,
				   4,4,4,4,8,4,4,10,0,0             
                ];
				
				for( var i = 0; i < tempTiles.length && i < tempPoints.length; i++){
	
					this.tiles.push(new Tile(tempTiles[i],i,tempPoints[i]));
				}
			};

			this.AddTile = function(tile){
				if(this.tiles.length >= this.maxTiles)
					return false;
				this.tiles.push(tile);
				return true;
			};
			this.RemoveTile = function(i){
				if(this.tiles.length <= 0)
					return null;
				return this.tiles.splice(i,1)[0];
			};
			this.ChooseRandom = function(){
				var i = Math.floor(Math.random()*this.tiles.length);
				return this.tiles[i];
			};
			this.RemoveRandom = function(){
				var i = Math.floor(Math.random()*this.tiles.length);
				return this.RemoveTile(i);
			};
		}	
		function Game(){
			// Game Board
			this.board = new Board();
			
			// Scoreboard
			this.scoreboard = new ScoreBoard();
			this.scoreboard.SetActivePlayer(1);
			
			// Tiles
			this.tiles = new TileSet();
			this.tiles.setToFullSet();
			
			this.tilesNotChosen = new TileSet();
			for( var i=0; i < this.tiles.tiles.length; i++ )
			{
				var tile1 = this.tiles.tiles[i];
				this.tilesNotChosen.AddTile(new Tile(tile1.letter,tile1.tileID,tile1.points));
			}
			// Player objects
			this.player1 = new Player();
			this.player2 = new Player();
			this.activePlayer = this.player1;
			for( var i=0; i < 7; i++ ){
				this.player1.tileset.AddTile(this.tilesNotChosen.RemoveRandom());	
				this.player2.tileset.AddTile(this.tilesNotChosen.RemoveRandom());
			}
			
			// Tiles Display
			this.tilesDisplay = new TilesDisplay();
			this.tilesDisplay.tileset = this.player1.tileset;
			
			this.SwitchActivePlayer = function(){
				if( player1 == activePlayer)
					activePlayer = player2;
				else
					activePlayer = player1;
				this.scoreboard.SwitchActivePlayer();
			}
			
		}

	var game = new Game();
	
	function updateTilesDisplay()
	{
		$('#tilesdisplay').html(game.tilesDisplay.GetHTML());
		$('#tilesdisplay > .TilesDisplay > div > div > .tile').draggable({
			snap: '.cell',
			cursor: 'move',
			containment: '#woodles',
			start: tileDragStartHandler,
			stop: tileDragStopHandler
		});	
	}
	
	function getCellMultiplier($cell)
	{
		ret = 1;
		if($cell.hasClass('dl'))
		{
			ret = 2;
		}
		else if($cell.hasClass('tl'))
		{
			ret = 3;
		}
		else if($cell.hasClass('star'))
		{
			ret = 2;
		}
		return ret;
	}
	function getWordMultiplier($cell)
	{
		ret = 1;
		if($cell.hasClass('dw'))
		{
			ret = 2;
		}
		else if($cell.hasClass('tw'))
		{
			ret = 3;
		}
		return ret;
	}
	
	updateTilesDisplay();
	// Jquery stuff 
	$('#board').append(game.board.GetHTML());

	function tileDragStartHandler( event, ui ){
		$(this).addClass('moved');
	}
	function tileDragStopHandler( event, ui ){
		// check for other tiles in the spot
		$tile = $(this);
		var left = $tile.offset().left;
		var top = $tile.offset().top;
		
		$('.tile').not('#'+$tile.attr('id')).each(function(){
			if( $(this).offset().left == left &&
					$(this).offset().top == top )
			{
				// conflict detected
				revertDraggable($('#'+$tile.attr('id')));
			}
		});
	}
	
	$('.cell').droppable({
		drop: cellDropHandler,
	});
	function cellDropHandler( event, ui ) {
		var i = ui.draggable.attr('id').split('t')[1];
		var tile = game.tiles.tiles[i];
		tile.bOnBoard = true;
		if( !ui.draggable.data('originalPosition')) {
			ui.draggable.data('originalPosition',
				ui.draggable.data('draggable').originalPosition);
		}
		$(this).addClass('occupied');
	}
	function revertDraggable($selector) {
		$selector.animate(
		{
			left: 0,
			top: 0,
		}, 
		500, 
		function(){
			$selector.data('originalPosition',null);
			$selector.removeClass('moved');
		});
	}
	
	$('.button#pass').click(function(){
		// TODO : return all tiles to player's hand
		for( var i=0; i< game.tiles.tiles.length; i++ )
		{
			var tile = game.tiles.tiles[i];
			if( tile.bOnBoard )
			{
				$('.tile#t'+tile.tileID).animate({left:0,top:0},500);
			}
			tile.bOnBoard = false;
		}
		game.scoreboard.SwitchActivePlayer();
	});
	
	function recallTiles(){
		// TODO : return all tiles to player's hand
		for( var i=0; i< game.tiles.tiles.length; i++ )
		{
			var tile = game.tiles.tiles[i];
			if( tile.bOnBoard )
			{
				$('.tile#t'+tile.tileID).animate({left:0,top:0},500);
			}
			tile.bOnBoard = false;
		};
		$('.tile').removeClass('moved');
		$('.cell.occupied').removeClass('occupied');
	}
	
	$('.button#recall').click(recallTiles);

	$('.button#swap').click(function(){
		// Disable drag and drop for now
		$('.tile').removeClass('ui-draggable');
		$('#text').html('Choose tiles to swap.<br>Click Swap again when done.');
		$('.tile').click(function(){
			$(this).addClass('swap');
		});
		$(this).click(function(){
			// return tiles to set tilesNotChosen 
			$('.tile.swap').each(function(){
				$(this).removeClass('swap');
				var tileID = $(this).attr('id').split('t')[1];
				for( var i=0; i<game.activePlayer.tileset.tiles.length; i++ )
				{
					if( game.activePlayer.tileset.tiles[i].tileID == ''+tileID )
					{
						var tile1 = game.activePlayer.tileset.RemoveTile(i);
						assert( tile1 , 'Tile1 is undefined' );
						game.tilesNotChosen.AddTile(tile1);
					};
				};
			});
			// add new tiles;
			for( var i=game.activePlayer.tileset.tiles.length; i < 7; i++ ){
				game.activePlayer.tileset.AddTile(game.tilesNotChosen.RemoveRandom());	
			}
			// todo : eliminate possibility of getting same tiles back
			
			//update html
			$('#text').html('');
			updateTilesDisplay();
		});
		
	});
	$('.button#play').click(function(){
		// find tiles on the board that are not played yet
		$tiles = $('.tile:not([class*=played]).moved');
				
		
		// get the position of the first tile
		var left = $tiles.eq(0).offset().left;
		var top = $tiles.eq(0).offset().top;
		var ruleOutHoriz = false;
		var ruleOutVert = false;
		$tiles.each(function(){
			// make sure all the played tiles are in line, and they must line up with existing word!
			// check in line for now
			// check vertical
			// within threshold of 5 px
			var leftOffset = ($(this).offset().left - left);
			var topOffset = ($(this).offset().top - top);
			if( leftOffset < -5 || leftOffset > 5 )
				ruleOutHoriz = true;
			if( topOffset < -5 || topOffset > 5 )
				ruleOutVert = true;
			// TODO : make sure the word is connected to a prev word	
		});
		if( ruleOutHoriz && ruleOutVert )
		{
			$('#text').html('Invalid WORD biatch!');
			recallTiles();
			return;
		}
		
		//if they all pass validation
		//mark as played and calculate score
		var score = 0;
		$tiles.each(function(){
			$(this).addClass('played');
			//$(this).detach();
			wordMultiplier = 1;
			for( var i=0; i< game.tilesDisplay.tileset.tiles.length; i++ )
			{
				if( $(this).attr('id').split('t')[1] = game.tilesDisplay.tileset.tiles[i].tileID )
				{
					// add this tile's html to the board
					$(this).css({'left':'-1px','top':'-14px'});
					$(this).removeClass('ui-draggable');
					$cell = $('.cell.occupied').eq(0); 
					
					// calculate tile score using cell attributes 
					score += getCellMultiplier($cell) * parseInt($(this).children('.points').html());
					wordMultiplier += getWordMultiplier($cell)-1;
					
					$cell.append($(this));
					$cell.removeClass('occupied');
					game.tilesDisplay.tileset.RemoveTile(game.tilesDisplay.tileset.tiles[i].tileID);
					break;
				}
			}
			score *= wordMultiplier;
		});
		
		//update score and scoreboard
		if( game.scoreboard.activePlayer == 1 ){
			game.scoreboard.UpdateScore(score,0);
		}
		else{
			game.scoreboard.UpdateScore(0,score);
		}
		
		//switch player
		game.scoreboard.SwitchActivePlayer();
		//switch tiles
		if( game.scoreboard.activePlayer == 1 ){
			game.tilesDisplay.tileset = game.player1.tileset;
		}
		else
			game.tilesDisplay.tileset = game.player2.tileset;
		// get more tiles if needed
		while( game.tilesDisplay.tileset.tiles.length < 7 )
		{
			game.tilesDisplay.tileset.addTile(game.tilesNotChosen.RemoveRandom());
		}	
		updateTilesDisplay();
		return;
	});
	};
})(jQuery); 