//configuration object

var config = {
    title: "Kenya 3W 2017",
    description: "<p>Click on the charts or the map to filter data.<br />Date: May 2017.<br /><a href='#contacts'>Contacts</a></p>",
    data: "https://proxy.hxlstandard.org/data.json?url=https%3A//docs.google.com/spreadsheets/d/1J2VsI7x2cytIsf-_cWJm-icTIWpfwIrVFPaTrDrU2aY/&strip-headers=on&force=on",
    whoFieldName:"#org",
    whatFieldName:"#sector",
    whereFieldName:"#adm3+code",
    statusFieldName: "#status",
    interventionFieldName: "#sector+subsector",
    activiteFieldName: "#activity+type",
    reached: "#reached",
    targeted: "#targeted",
    geo:"data/KEN_adm.json",
    joinAttribute:"P_CODE",
    colors: ['#227EE8', '#9a181a', '#841517', '#ef8f8f', '#6e1113', '#580e0f', '#420a0b', '#2c0708']
};

// hxlProxyToJSON: reading hxl tags and setting them as keys for each event
// input is an array with hxl tags as first object, and then the data as objects
// output is an array with hxl tags as keys for the data objects

function hxlProxyToJSON(input) {
    var output = [];
    var keys = []
    input.forEach(function (e, i) {
        if (i == 0) {
            e.forEach(function (e2, i2) {
                var parts = e2.split('+');
                var key = parts[0]
                if (parts.length > 1) {
                    var atts = parts.splice(1, parts.length);
                    atts.sort();
                    atts.forEach(function (att) {
                        key += '+' + att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function (e2, i2) {
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}


//function to generate the 3W component
//data is the whole 3W Excel data set
//geom is geojson file

function generate3WComponent(config,data,geom){    
    
    $('#title').html(config.title);
    $('#description').html(config.description);

    var whoChart = dc.rowChart('#hdx-3W-who');
    var whatChart = dc.rowChart('#hdx-3W-what');
    var whereChart = dc.leafletChoroplethChart('#hdx-3W-where');
    var statusChart = dc.rowChart('#hdx-3W-status');
    var interventionChart = dc.rowChart('#intervention');
    var activiteChart = dc.rowChart('#activite');

    var cf = crossfilter(data);

    var whoDimension = cf.dimension(function(d){ return d[config.whoFieldName]; });
    var whatDimension = cf.dimension(function(d){ return d[config.whatFieldName]; });
    var whereDimension = cf.dimension(function(d){ return d[config.whereFieldName]; });
    var statusDimension = cf.dimension(function (d) { return d[config.statusFieldName]; });
    var interventionDimension = cf.dimension(function (d) { return d[config.interventionFieldName]; });
    var activiteDimension = cf.dimension(function (d) { return d[config.activiteFieldName]; });
    var reachedDimension = cf.dimension(function (d) { return d[config.reached]; });

    var whoGroup = whoDimension.group();
    var whatGroup = whatDimension.group();
    var whereGroup = whereDimension.group();
    var statusGroup = statusDimension.group();
    var interventionGroup = interventionDimension.group();
    var activiteGroup = activiteDimension.group();
    var reachedGroup = reachedDimension.group();
    var reached = cf.groupAll().reduceSum(function (d) {
        if (isNaN(d[config.reached])) {
            return 0;
        } else {
            return d[config.reached];
        }
    });
    var targeted = cf.groupAll().reduceSum(function (d) {
        if (isNaN(d[config.targeted])) {
            return 0;
        } else {
            return d[config.targeted];
        }
    });

    var all = cf.groupAll();


    whoChart.width($('#hdx-3W-who').width()).height(200)
            .dimension(whoDimension)
            .group(whoGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(20);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);

    whatChart.width($('#hdx-3W-what').width()).height(200)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);
    
    statusChart.width($('#hdx-3W-status').width()).height(150)
            .dimension(statusDimension)
            .group(statusGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })    
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);

    interventionChart.width($('#intervention').width()).height(150)
            .dimension(interventionDimension)
            .group(interventionGroup)
            .elasticX(true)
            .data(function (group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0, 7])
            .colorAccessor(function (d, i) { return 3; })
            .xAxis().ticks(5);

    activiteChart.width($('#activite').width())
            .dimension(activiteDimension)
            .group(activiteGroup)
            .elasticX(true)
            .height(300)
            .data(function (group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0, 7])
            .colorAccessor(function (d, i) { return 3; })
            .xAxis().ticks(5);

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    dc.dataCount('#reached-info')
            .dimension(cf)
            .group(reached);

    dc.dataCount('#targeted-info')
            .dimension(cf)
            .group(targeted);

    try {
        whereChart.width($('#hxd-3W-where').width()).height(250)
                .dimension(whereDimension)
                .group(whereGroup)
                .center([0.472407, 37.891846])//[6.9167,150.1833])
                .zoom(6)
                .geojson(geom)
                .colors(['#CCCCCC', config.colors[3]])
                .colorDomain([0, 1])
                .colorAccessor(function (d) {
                    if (d > 0) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
                .featureKeyAccessor(function (feature) {
                    return (feature.properties[(config.joinAttribute)]);
                });
    } catch (e) { console.log("Error creating the map: ", e.message) }

    try {
        dc.dataTable("#data-table")
                .dimension(whatDimension)
                .showGroups(false)
                .group(function (d) { return d[config.whatFieldName]; })
                .size(200) //number of lines
                .columns([
                        function (d) {
                            return d['#org'];
                        },
                        function (d) {
                            return d['#adm1+name'];
                        },
                        function (d) {
                            return d['#adm2+name'];
                        },
                        function (d) {
                            return d['#adm3+name'];
                        },
                        function (d) {
                            return d['#adm4+name'];
                        },
                        function (d) {
                            return d['#status'];
                        },
                        function (d) {
                            return d['#sector+subsector'];
                        },
                        function (d) {
                            return d['#activity+type'];
                        },
                        function (d) {
                            return d['#targeted'];
                        },
                        function (d) {
                            return d['#reached'];
                        }
                ])
        //.renderlet(function (table) {
        //         table.selectAll(".dc-table-group").classed("info", true);
        //     });    
    } catch (e) { console.log("Error creating the table: ", e.message) }

    dc.renderAll();
    
    var g = d3.selectAll('#hdx-3W-who').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-who').width()/2)
        .attr('y', 200)
        .text('Activites');

    var g = d3.selectAll('#hdx-3W-what').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-what').width()/2)
        .attr('y', 200)
        .text('Activites');

    var g = d3.selectAll('#hdx-3W-status').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-status').width()/2)
        .attr('y', 150)
        .text('Activites');

}

//load 3W data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: config.data, 
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: config.geo, 
    dataType: 'json'
});

//when both ready construct 3W
$.when(dataCall, geomCall).then(function (dataArgs, geomArgs) {
    dataArgs[0] = hxlProxyToJSON(dataArgs[0]);
        console.log("test1=", dataArgs[0]);
    var geom = topojson.feature(geomArgs[0], geomArgs[0]["objects"]["KEN_adm1-1"]);
    //converts place codes to string
    geom.features.forEach(function(e){
        e.properties[config.joinAttribute] = String(e.properties[config.joinAttribute]);
    });
    generate3WComponent(config,dataArgs[0],geom);
});

