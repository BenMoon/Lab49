var margin = {top: 20, right: 80, bottom: 30, left: 50},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

d3.tsv("data.tsv", function (d) {
    var series = d3.keys(d[0]).filter(function(key) { return key !== "date"; });
    var colors = d3.scale.category10();
    colors.domain(series);

    var fmt = d3.time.format("%Y%m%d");
    var x0 = fmt.parse(d[0]['date']);
    d.forEach(function(o) { o.date = fmt.parse(o.date)/1000; });

    var dataSets = series.map(function(s) {
    d.forEach(function(o) { o['s'] = s; } );
    return {
        name: s,
        color: colors(s),
        data: d.map(function(e) {
        return { x: e.date.valueOf(), y: parseFloat(e[e.s]) };
        })
    };
    });

    multigraph(dataSets);
});

var multigraph = function(sets) {
    var graph = new Rickshaw.Graph( {
    element: document.querySelector("#chart"), 
    renderer: 'line',
    width: width,
    height: height,
    series: sets
    });

    var time = new Rickshaw.Fixtures.Time();
    var months = time.unit('month');
    var x_axis = new Rickshaw.Graph.Axis.Time({
        graph: graph,
    });

    var y_axis = new Rickshaw.Graph.Axis.Y( {
        graph: graph,
        orientation: 'left',
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        element: document.getElementById('y_axis'),
    } );

    /*
    var legend = new Rickshaw.Graph.Legend( {
        element: document.getElementById('legend'),
        graph: graph
    } );
    */

    graph.render();

    var legend = document.querySelector('#legend');
    
    var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
	render: function(args) {
		legend.innerHTML = args.formattedXValue;
		args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {
			var line = document.createElement('div');
			line.className = 'line';

			var swatch = document.createElement('div');
			swatch.className = 'swatch';
			swatch.style.backgroundColor = d.series.color;

			var label = document.createElement('div');
			label.className = 'label';
			label.innerHTML = d.name + ": " + d.formattedYValue;

			line.appendChild(swatch);
			line.appendChild(label);
			legend.appendChild(line);

			var dot = document.createElement('div');
			dot.className = 'dot';
			dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
			dot.style.borderColor = d.series.color;

			this.element.appendChild(dot);

			dot.className = 'dot active';

			this.show();
		}, this );
        }
});

var hover = new Hover( { graph: graph } ); 

};
