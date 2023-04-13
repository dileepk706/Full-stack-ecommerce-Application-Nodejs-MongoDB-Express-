
$(document).ready(function() {
    "use strict";
    
	fetch('http://localhost:3000/admin/dashboardLineChart',{
		method:'GET'
	}).then(response=>response.json()).then(data=>{
		console.log(data);
		let dateAr=data.ordersByDay.map(e=>{
		  return e.date
		})
		let totalAr=data.ordersByDay.map(e=>{
		  return e.totalAmount
		})
		// console.log(dateAr);
		// console.log(totalAr)
		lineChart(dateAr,totalAr)
	})

;

    
    // apexchart1 
	function lineChart (dateAr,totalAr) {
		console.log(dateAr);
		var options = {
	    chart: {
	        height: 350,
	        type: 'area',
	    },
	    dataLabels: {
	        enabled: false
	    },
	    stroke: {
	        curve: 'smooth'
	    },
	    series: [{
	        name: 'revenue',
	        data: totalAr,
	    },
		//  {
	    //     name: 'loss',
	    //     data: [11000, 32000, 45000, 32000, 34000, 52000, 41000]
	    // }
	],
	    xaxis: {
	        type: 'datetime',
	        categories:dateAr,
	    },
	    tooltip: {
	        x: {
	            format: 'dd/MM/yy HH:mm'
	        },
	    }
	}
	var chart = new ApexCharts(document.querySelector("#apexchart1"), options);
	chart.render();

}


    // apexchart2
	var options = {
	    series: [75],
	      chart: {
	        height: 200,
	        type: "radialBar",
	        toolbar: {
	          show: true
	        }
	      },
	    plotOptions: {
	        radialBar: {
	          startAngle: -135,
	          endAngle: 225,
	          hollow: {
	            margin: 0,
	            size: "70%",
	            background: "#fff",
	            image: undefined,
	            position: "front",
	            dropShadow: {
	              enabled: true,
	              top: 3,
	              left: 0,
	              blur: 4,
	              opacity: 0.24
	            }
	          },
	          track: {
	            background: "#fff",
	            strokeWidth: "67%",
	            margin: 0, // margin is in pixels
	            dropShadow: {
	              enabled: true,
	              top: -3,
	              left: 0,
	              blur: 4,
	              opacity: 0.35
	            }
	          },

	          dataLabels: {
	            show: true,
	            name: {
	              offsetY: -10,
	              show: true,
	              color: "#888",
	              fontSize: "17px"
	            },
	            value: {
	              formatter: function(val) {
	                return parseInt(val.toString(), 10).toString();
	              },
	              color: "#111",
	              fontSize: "36px",
	              show: true
	            }
	          }
	        }
	      },
	    fill: {
	        type: "gradient",
	        gradient: {
	          shade: "dark",
	          type: "horizontal",
	          shadeIntensity: 0.5,
	          gradientToColors: ["#ABE5A1"],
	          inverseColors: true,
	          opacityFrom: 1,
	          opacityTo: 1,
	          stops: [0, 100]
	        }
	      },
	    stroke: {
	        lineCap: "round"
	      },
	      labels: ["Percent"]
	    };
	
	var chart = new ApexCharts(document.querySelector("#apexchart2"), options);
	chart.render();

	// apexchart3
	var options = {
          series: [{
          name: 'Series 1',
          data: [80, 50, 30, 40, 100, 20],
        }],
          chart: {
          height: 350,
          type: 'radar',
        },
        title: {
          text: 'Basic Radar Chart'
        },
        xaxis: {
          categories: ['January', 'February', 'March', 'April', 'May', 'June']
        }
        };
        
	var chart = new ApexCharts(document.querySelector("#apexchart3"), options);
	chart.render();

});