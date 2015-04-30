/*
	俄罗斯方块类
	@name Tetris
	@author mike
	@require jQuery
	@version 0.0.1
	@date 2015-04-30
*/

//使用严格模式
// 'use strict';

//定义canvas的宽高，通过定义一个小块的宽高以及有多少个小块来生成
var CONFIG = {
	tetris_rows: 20,
	tetris_cols: 14,
	cell_size: 25
};

//定义俄罗斯方块的数据模型，一共7种模型	
var blockArr = [
	//第一种组合：z
	[
		{x: CONFIG.tetris_cols / 2 - 1, y: 0, color: 1},
		{x: CONFIG.tetris_cols / 2, y: 0, color: 1},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 1},
		{x: CONFIG.tetris_cols / 2 + 1, y: 1, color: 1}
	],
	//第二种组合：反z
	[
		{x: CONFIG.tetris_cols / 2 + 1, y: 0, color: 2},
		{x: CONFIG.tetris_cols / 2, y: 0, color: 2},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 2},
		{x: CONFIG.tetris_cols / 2 - 1, y: 1, color: 2}
	],
	//第三种组合：田
	[
		{x: CONFIG.tetris_cols / 2 - 1, y: 0, color: 3},
		{x: CONFIG.tetris_cols / 2, y: 0, color: 3},
		{x: CONFIG.tetris_cols / 2 - 1, y: 1, color: 3},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 3}
	],
	//第四种组合：L
	[
		{x: CONFIG.tetris_cols / 2 - 1, y: 0, color: 4},
		{x: CONFIG.tetris_cols / 2 - 1, y: 1, color: 4},
		{x: CONFIG.tetris_cols / 2 - 1, y: 2, color: 4},
		{x: CONFIG.tetris_cols / 2, y: 2, color: 4}
	],
	//第五种组合：J
	[
		{x: CONFIG.tetris_cols / 2, y: 0, color: 5},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 5},
		{x: CONFIG.tetris_cols / 2, y: 2, color: 5},
		{x: CONFIG.tetris_cols / 2 - 1, y: 2, color: 5}
	],
	//第六种组合：条
	[
		{x: CONFIG.tetris_cols / 2, y: 0, color: 6},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 6},
		{x: CONFIG.tetris_cols / 2, y: 2, color: 6},
		{x: CONFIG.tetris_cols / 2, y: 3, color: 6}
	],
	//第七种组合：|、
	[
		{x: CONFIG.tetris_cols / 2, y: 0, color: 7},
		{x: CONFIG.tetris_cols / 2 - 1, y: 1, color: 7},
		{x: CONFIG.tetris_cols / 2, y: 1, color: 7},
		{x: CONFIG.tetris_cols / 2 + 1, y: 1, color: 7}
	]
];

//定义8中颜色
var colors = ["#fff","red","blue","yellow","green","black","pink","orange"];

//构造俄罗斯方块的类
function Tetris() {
	
	//定义在在掉落的方块
	this.currentFall = [];
	
	//记录已经固定的方块的状态
	this.tetris_status = [];
	
	for(var i = 0; i < CONFIG.tetris_rows; i++){
		this.tetris_status[i] = [];
		for(var j = 0; j < CONFIG.tetris_cols; j++){
			this.tetris_status[i][j] = "NO_BLOCK";
		}
	}
	
	this.tetris_canvas = null;
	this.tetris_ctx = null;
	
	//定义游戏状态
	this.isPlaying = true;
	
	//获取当前速度，积分，最高积分的对象
	this.curScoreEle = document.getElementById("curScoreEle");
	this.curSpeedEle = document.getElementById("curSpeedEle");
	this.maxScoreEle = document.getElementById("maxScoreEle");
	
	//定时器
	this.curTimer = null;
}

// Tetris.prototype.constructor = Tetris;

//创建canvas
Tetris.prototype.createCanvas = function() {
	var _this = this;
	this.tetris_canvas = document.createElement("canvas");

	//设置canvas组件的宽高
	this.tetris_canvas.width = CONFIG.tetris_cols * CONFIG.cell_size;
	this.tetris_canvas.height = CONFIG.tetris_rows * CONFIG.cell_size;

	//设置canvas组件的边框
	this.tetris_canvas.style.border = "1px solid #ddd";

	//获取canvas上得绘图API
	this.tetris_ctx = this.tetris_canvas.getContext('2d');

	//开始创建路径
	this.tetris_ctx.beginPath();

	//绘制相应的横向网格对应的路径
	for(var i = 1; i < CONFIG.tetris_rows; i++){
		this.tetris_ctx.moveTo(0, i * CONFIG.cell_size);
		this.tetris_ctx.lineTo(CONFIG.tetris_cols * CONFIG.cell_size, i * CONFIG.cell_size);
	}

	//绘制相应的纵向网格的对应路径
	for(var i = 1; i < CONFIG.tetris_cols; i++){
		this.tetris_ctx.moveTo(i * CONFIG.cell_size, 0);
		this.tetris_ctx.lineTo(i * CONFIG.cell_size, CONFIG.tetris_rows * CONFIG.cell_size);
	}

	//关闭路径
	this.tetris_ctx.closePath();

	//设置笔触颜色
	this.tetris_ctx.strokeStyle = "#aaa";

	//设置线条粗细
	this.tetris_ctx.lineWidth = 0.01;

	//绘制线条
	this.tetris_ctx.stroke();

	document.getElementById("container").appendChild(_this.tetris_canvas);
};

//定义初始化正在掉落的方块
Tetris.prototype.initBlock = function() {
	var rand = Math.floor(Math.random() * blockArr.length);

	//随机生成正在掉落的方块
	this.currentFall = [
		{x: blockArr[rand][0].x, y: blockArr[rand][0].y, color: blockArr[rand][0].color},
		{x: blockArr[rand][1].x, y: blockArr[rand][1].y, color: blockArr[rand][1].color},
		{x: blockArr[rand][2].x, y: blockArr[rand][2].y, color: blockArr[rand][2].color},
		{x: blockArr[rand][3].x, y: blockArr[rand][3].y, color: blockArr[rand][3].color}
	];
};

//控制方块向下掉
Tetris.prototype.moveDown = function() {
	//定义能否掉落的标识
	var canDown = true;
	var _this = this;
	//遍历每个方块,判断是否能向下掉落
	for(var i = 0; i < this.currentFall.length; i++){
		//判断是否到最底下了
		if(this.currentFall[i].y >= CONFIG.tetris_rows - 1){
			canDown = false;
			break;
		}
		//判断下一格是否“有方块”，如果有，则不能掉落了
		if(this.tetris_status[this.currentFall[i].y + 1][this.currentFall[i].x] != "NO_BLOCK"){
			canDown = false;
			break;
		}
	}

	//如果能掉落
	if(canDown){
		//将下移前的每个方块的背景色屠城白色
		// console.log(this.tetris_ctx);
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = "#fff";
			//绘制矩形
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}

		//遍历每个方块，控制每个方块的y坐标加1
		//也就是每个方块向下落一格
		for(var i = 0; i < this.currentFall.length; i++){
			this.currentFall[i].y ++;
		}

		//将下移后的每个方块的背景涂成该方块的颜色值
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = colors[cur.color];
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}
	}else{//不能向下掉落
		//遍历每个方块，把每个方块的值记录到tetris_status中去
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];

			//如果有方块在最上面，说明已经输了
			if(cur.y < 2){
				//清空Local storage中的当前积分值，游戏状态，当前速度
				localStorage.removeItem("curScore");
				localStorage.removeItem("tetris_status");
				localStorage.removeItem("curSpeed");

				if(confirm("您已经输了！是否参与排名？")){
					//读取LocalStorage里面的maxScore记录
					var maxScore = localStorage.getItem("maxScore");
					maxScore = maxScore == null ? 0 : maxScore;

					//如果当前积分大于最大积分的话
					var curScore = Number(_this.curScoreEle.innerHTML);
					if(curScore >= maxScore){
						//记录最高的积分
						localStorage.setItem("maxScore", curScore);
					}
				}
				//结束游戏
				_this.isPlaying = false;

				//清楚定时器
				clearInterval(_this.curTimer);
				return;
			}

			//把每个方块当前所在位置赋为当前方块的颜色值
			this.tetris_status[cur.y][cur.x] = cur.color;
		}

		//判断是否有“可消除”的行
		this.lineFull();

		//使用localstorage记录俄罗斯方块的游戏状态
		localStorage.setItem("tetris_status", JSON.stringify(_this.tetris_status));

		//开始一组新的方块
		this.initBlock();
	}
};

//判断是否有一行已满
Tetris.prototype.lineFull = function() {
	var _this = this;
	//依次遍历每一行
	for(var i = 0; i < CONFIG.tetris_rows; i++){
		var flag = true;
		//遍历当前行的每个单元格
		for(var j = 0; j < CONFIG.tetris_cols; j++){
			if(this.tetris_status[i][j] == "NO_BLOCK"){
				flag = false;
				break;
			}
		}

		if(flag){
			//将当前的积分加100
			var curScore = Number(_this.curScoreEle.innerHTML);
			_this.curScoreEle.innerHTML = curScore+= 100;

			//记录当前积分
			localStorage.setItem("curScore", curScore);

			//如果当前积分达到了升级的极限
			var curSpeed = Number(_this.curSpeedEle.innerHTML);
			if(curScore >= curSpeed * curSpeed * 500){
				_this.curSpeedEle.innerHTML = curSpeed += 1;
				//使用localstorage记录curspeed
				localStorage.setItem("curSpeed", curSpeed);

				clearInterval(_this.curTimer);
				_this.curTimer = setInterval($.proxy(_this.moveDown, _this), 500 / curSpeed);
			}

			//把当前行的所有方块下移一行
			for(var k = i; k > 0; k--){
				for(var l = 0; l < CONFIG.tetris_cols; l++){
					this.tetris_status[k][l] = this.tetris_status[k-1][l];
				}
			}

			//消除方块后，重新绘制一遍方块
			_this.drawBlock();
		}
	}
};

//初始化方块的状态
// Tetris.prototype.initStatus = function() {
// 	var _this = this;
// 	for(var i = 0; i < CONFIG.tetris_rows; i++){
// 		tetris_status[i] = [];
// 		for(var j = 0; j < CONFIG.tetris_cols; j++){
// 			tetris_status[i][j] = "NO_BLOCK";
// 		}
// 	}
// };

//重新绘制方块的状态
Tetris.prototype.drawBlock = function() {
	var _this = this;
	for(var i = 0; i < CONFIG.tetris_rows; i++){
		for(var j = 0; j < CONFIG.tetris_cols; j++){
			//有方块的地方绘制颜色
			if(this.tetris_status[i][j] != "NO_BLOCK"){
				//设置填充颜色
				this.tetris_ctx.fillStyle = colors[this.tetris_status[i][j]];
				//绘制矩形
				this.tetris_ctx.fillRect(j * CONFIG.cell_size + 1, i * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
			}else{//没有方块的地方绘制白色
				this.tetris_ctx.fillStyle = "#fff";
				//绘制矩形
				this.tetris_ctx.fillRect(j * CONFIG.cell_size + 1, i * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
			}
		}
	}
};

//绑定按键事件
Tetris.prototype.bind = function() {
	var _this = this;
	window.onkeydown = function(evt) {
		switch(evt.keyCode){
			//向下
			case 40:
				if(!_this.isPlaying){
					return;
				}
				_this.moveDown();
				break;
			//向左
			case 37:
				if(!_this.isPlaying){
					return;
				}
				_this.moveLeft();
				break;
			//向右
			case 39:
				if(!_this.isPlaying){
					return;
				}
				_this.moveRight();
				break;
			//向上
			case 38:
				if(!_this.isPlaying){
					return;
				}
				_this.rotate();
				break;
		}
	}
};

//处理方块左移
Tetris.prototype.moveLeft = function() {
	//先判断是否能左移
	var canLeft = true;
	var _this = this;

	for(var i = 0; i < this.currentFall.length; i++){
		//如果已经到最左边了
		if(this.currentFall[i].x <= 0){
			canLeft = false;
			break;
		}
		//如果左边已经有方块
		if(this.tetris_status[this.currentFall[i].y][this.currentFall[i].x - 1] != "NO_BLOCK"){
			canLeft = false;
			break;
		}
	}

	//如果能
	if(canLeft){
		//将左移前的每个方块的背景涂成白色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = "#fff";
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}

		//左移所有的正在掉落的方块
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			cur.x --;
		}

		//将左移的方块背景色涂成对应的颜色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = colors[cur.color];
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}
	}
};

//处理方块右移
Tetris.prototype.moveRight = function() {
	//先判断是否能右移
	var canRight = true;
	var _this = this;

	for(var i = 0; i < this.currentFall.length; i++){
		//如果已经到最右边了
		if(this.currentFall[i].x >= CONFIG.tetris_cols - 1){
			canRight = false;
			break;
		}
		//如果右边已经有方块
		if(this.tetris_status[this.currentFall[i].y][this.currentFall[i].x + 1] != "NO_BLOCK"){
			canRight = false;
			break;
		}
	}

	//如果能
	if(canRight){
		//将右移前的每个方块的背景涂成白色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = "#fff";
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}

		//右移所有的正在掉落的方块
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			cur.x ++;
		}

		//将右移的方块背景色涂成对应的颜色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = colors[cur.color];
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}
	}
};

//判断方块旋转
Tetris.prototype.rotate = function() {
	//定义是否可以旋转的标识
	var canRotate = true;
	var _this = this;

	for(var i = 0; i < this.currentFall.length; i++){
		var preX = this.currentFall[i].x;
		var preY = this.currentFall[i].y;

		//始终以第三个方块作为旋转中心
		//当i == 2时，说明是旋转中心
		if(i != 2){
			//计算方块旋转后的x，y的坐标
			var afterRotateX = this.currentFall[2].x + preY - this.currentFall[2].y;
			var afterRotateY = this.currentFall[2].y + this.currentFall[2].x - preX;

			//如果旋转后的位置已有方块，则表示不能旋转
			if(this.tetris_status[afterRotateY][afterRotateX + 1] != "NO_BLOCK"){
				canRotate = false;
				break;
			}

			//如果旋转后超出了最左边的边界
			if(afterRotateX < 0 || this.tetris_status[afterRotateY - 1][afterRotateX] != "NO_BLOCK"){
				_this.moveRight();
				afterRotateX = this.currentFall[2].x + preY - this.currentFall[2].y;
				afterRotateY = this.currentFall[2].y + this.currentFall[2].x - preX;
				break;
			}
			if(afterRotateX < 0 || this.tetris_status[afterRotateY - 1][afterRotateX] != "NO_BLOCK"){
				_this.moveRight();
				break;
			}

			//如果旋转后超过了最右边的边界
			if(afterRotateX >= CONFIG.tetris_cols - 1 || this.tetris_status[afterRotateY][afterRotateX + 1] != "NO_BLOCK"){
				_this.moveLeft();
				afterRotateX = this.currentFall[2].x + preY - this.currentFall[2].y;
				afterRotateY = this.currentFall[2].y + this.currentFall[2].x - preX;
				break;
			}
			if(afterRotateX >= CONFIG.tetris_cols - 1 || this.tetris_status[afterRotateY][afterRotateX + 1] != "NO_BLOCK"){
				_this.moveLeft();
				break;
			}
		}
	}

	//如果能
	if(canRotate){
		//将旋转前的方块背景涂成白色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = "#fff";
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}

		//旋转所有的正在掉落的方块
		for(var i = 0; i < this.currentFall.length; i++){
			var preX = this.currentFall[i].x;
			var preY = this.currentFall[i].y;

			//始终以第三个方块作为旋转中心
			//当i == 2时，说明是旋转中心
			if(i != 2){
				this.currentFall[i].x = this.currentFall[2].x + preY - this.currentFall[2].y;
				this.currentFall[i].y = this.currentFall[2].y + this.currentFall[2].x - preX;
			}
		}

		//将旋转的方块背景色涂成对应的颜色
		for(var i = 0; i < this.currentFall.length; i++){
			var cur = this.currentFall[i];
			this.tetris_ctx.fillStyle = colors[cur.color];
			this.tetris_ctx.fillRect(cur.x * CONFIG.cell_size + 1, cur.y * CONFIG.cell_size + 1, CONFIG.cell_size - 2, CONFIG.cell_size - 2);
		}
	}
};

//游戏初始化
Tetris.prototype.init = function() {
	var _this = this;
	//创建canvas组件
	this.createCanvas();

	//初始化方块的状态
	// this.initStatus();

	//读取localstorage里面的tetris_status记录
	var tempStatus = localStorage.getItem("tetris_status");
	this.tetris_status = tempStatus == null ? this.tetris_status : JSON.stringify(tempStatus);

	//绘制方块的初始化状态
	this.drawBlock();

	//获取curscore的记录
	var curScore = localStorage.getItem("curScore");
	curScore = curScore == null ? 0 : parseInt(curScore);
	this.curScoreEle.innerHTML = curScore;

	//读取maxScore的记录
	var maxScore = localStorage.getItem("maxScore");
	maxScore = maxScore == null ? 0 : parseInt(maxScore);
	this.maxScoreEle.innerHTML = maxScore;

	//读取curSpeed的记录
	var curSpeed = localStorage.getItem("curSpeed");
	curSpeed = curSpeed == null ? 1 : parseInt(curSpeed);
	this.curSpeedEle.innerHTML = curSpeed;

	//初始化正在掉落的方块
	this.initBlock();

	//绑定键盘事件
	this.bind();

	//控制每隔固定时间执行一下“掉落”
	this.curTimer = setInterval($.proxy(_this.moveDown, _this), 500 / curSpeed);
};












