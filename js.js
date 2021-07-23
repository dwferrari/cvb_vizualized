var googleSheet;
function RemoveAccents(strAccents) {
	return strAccents.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

$( document ).ready(function() {
	$('#startAnimation').click(function(){
		
		let gridSelector=$('#gridSelector').val();
		var url = "https://sheets.googleapis.com/v4/spreadsheets/1seCbvijwlS9I1NSROP6EmyDMq5M1DJmUTY2iCLAmxSo?includeGridData=true&ranges=Grid%20"+gridSelector+"!D3:T17&key=AIzaSyAGDpNKNLsmMfk5rANmsJ4hyVF7gdROWFs";
		$.ajax({
			url:url,
			dataType:"jsonp",
			success:function(data) {
				
				googleSheet = data;
				console.log('googleSheetData ',googleSheet);
		
				//googleSheet.sheets[0].data[0].rowData[0].values[0].effectiveValue.stringValue
				let sheetData = googleSheet.sheets[0].data[0];
				
				let stages =[];
				//get stage names
				let etapaOffSet = 2;
				for (let i=etapaOffSet;i<sheetData.rowData[0].values.length;i++){
					stages[i-etapaOffSet] = sheetData.rowData[0].values[i].formattedValue;
				}
				console.log('stages pre filter ', stages);
				let pun = stages[12];
				let drivers =[];
				let teamColor =[];
				//get drivers name
				driverOffSet = 1;
				for (let i=driverOffSet;i<sheetData.rowData.length;i++){
					let piloto = sheetData.rowData[i].values[0].formattedValue;
					let splitedString = piloto.split('-');
					drivers[i-driverOffSet]= splitedString[0];
					teamColor[i-driverOffSet]= splitedString[splitedString.length-1].trim().normalize();
				}
				console.log('drivers ', drivers);
				console.log('teamColors ', teamColor);
				
				let standing=[];
				iOffSet = 1;
				jOffSet = 2;
				for (let i=iOffSet ;i<sheetData.rowData.length;i++){
					for (let j=jOffSet;j<sheetData.rowData[i].values.length;j++){
						if(!standing[j-jOffSet]){
							standing[j-jOffSet] = [];
						}
						standing[j-jOffSet][i-iOffSet ] = sheetData.rowData[i].values[j].formattedValue;
					}
				}
				
				$("#car2").attr("src","top_b.png");
				var teamCar = [];
				teamCar["Alpha"] = "top_b.png";
				teamCar["Beta"]  = "top_g.png";
				teamCar["Delta"] = "top_p.png";
				teamCar["Zeta"]  = "top_o.png";
				teamCar["Omega"] = "top_y.png";
				teamCar["Green Heaven Team (GHT)"] = "top_w.png";
				teamCar["Cachorros Roncadores (CRS)"] = "top_k.png";
				
				console.log('team-colors ',teamCar);
				
				for(let i=0;i<drivers.length;i++){
					console.log('debug_colors:', i, drivers[i],RemoveAccents(teamColor[i]), teamCar[RemoveAccents(teamColor[i])])
					$("#car"+(i+1)).attr("src", teamCar[RemoveAccents(teamColor[i])]);
				}
				//get scores
				console.log('standing pre filter ',standing);
				for (let i=0 ;i<standing.length;i++){
					let onlyZero = true;
					for (let j=0;j<standing[i].length;j++){
						if(standing[i][j] != 0){
							onlyZero = false;
						}
					}
					if(onlyZero){
						standing.splice(i,1);
						stages.splice(i,1);
						i--;
					}
				}
						
				console.log('standing ',standing);
				console.log('stages ',stages);
				
				//calculate standing points
				let standingCalc=[];
				for (let i=0 ;i<standing.length;i++){
					for (let j=0;j<standing[i].length;j++){
						if(!standingCalc[i]){
							standingCalc[i] = [];
						}
						if(stages[i] == pun){
							if(i==0){
								standingCalc[i][j] = Number(standing[i][j]);
							}else{
								standingCalc[i][j] = Number(standingCalc[i-1][j]) - Number(standing[i][j]);
							}
						}else{
							if(i==0){
								standingCalc[i][j] = Number(standing[i][j]);
							}else{
								standingCalc[i][j] = Number(standingCalc[i-1][j]) + Number(standing[i][j]);
							}
							
						}
					}
				}
				console.log('standingsCalc ',standingCalc);
				setTimeout(function(){
					//animation
					let animationTime=$('#durationSelector').val()*1000;
					let movementType=$('#movementType').val();
					console.log('movementType ', movementType);
					
					let max = 0;
					
					for (i=0;i<standingCalc.length;i++){
						for (j=0;j<standingCalc[i].length;j++){
							if(max<standingCalc[i][j]){
								max=standingCalc[i][j];
							}
						}
					}
					
					for(i=0;i<standingCalc.length;i++){
						for (k=0;k<standingCalc[i].length;k++){
							$('#driverContainer'+(k+1)).animate({'margin-left': '-75', animationTime, movementType});
						}
					}
					
					console.log('animation max size: ',max)
					let carWidth = $('#car1').width();
					let maxDistance = (($('#racetrack').width() - carWidth)/100)*80;
					console.log('stages preAnimacao ', stages);
					$("#gpText").html(stages[0]);
					for(i=0;i<standingCalc.length;i++){
						for (k=0;k<standingCalc[i].length;k++){
							$('#driverContainer'+(k+1)).css('margin-left', '-75px');
							$('#text'+(k+1))[0].innerText = drivers[k];
							$('#text'+(k+1)).fadeTo(animationTime,1);
							let x = '';
							if(i+1 < standingCalc.length){
								x=stages[i+1];
							}else{
								x=stages[i];
							}
							$('#driverContainer'+(k+1)).animate({'margin-left':  (maxDistance*standingCalc[i][k])/max} , animationTime, movementType, function(){$("#gpText").html(x);});
						}
					}
				}, 1000);
			},
		});
	});
	
	$('#startAnimationFake').click(function(){
		let animationTime=$('#durationSelector').val()*1000;
		let movementType=$('#movementType').val();
		console.log(movementType);
		
		let currentPoints=[];
		let pontos=[
				[16,36,33,18,28,24,19,15,17,30,20,40,22,26],
				[31,66,69,38,44,46,43,32,35,70,39,73,50,52],
				[50,84,109,53,74,66,65,49,51,103,67,109,76,76],
				[65,108,137,75,100,86,83,65,68,143,103,142,106,95],
				[84,128,163,99,128,108,113,80,84,179,120,182,139,113],
				[100,143,187,119,154,130,130,98,103,212,148,218,169,153],
				[119,161,227,134,184,150,152,115,119,245,176,254,195,177],
				[135,197,260,152,212,174,171,130,136,275,196,294,217,203],
				[285,297,270,252,242,274,271,290,236,285,296,299,237,273]
			];
		let drivers=['GHT_bruno-cjbr','RaFa0L_','RenanFilhotes','bearnaud','CRS_Bil_FAN','GHT_Rafa_Walker','GTE_Glifo','RAXA_ArielChaves','CRS_Carlos_FD','Lucas GravataiRS','dwferrari','NHZAMBONI1974','Gui_Faneco','GTE_HelioSam'];
		let stages=['GP Maggiore','GP Sardegna','GP Red Bull Ring','GP Interlagos','GP Laguna Seca','GP Nurburgring','GP Dragon Trail','GP Suzuka','GP Mount Panorama','GP Dragon Tail'];
		let max = 0;
		
		for (i=0;i<pontos.length;i++){
			for (j=0;j<pontos[i].length;j++){
				if(max<pontos[i][j]){
					max=pontos[i][j];
				}
			}
		}
		
		let carWidth = $('#car1').width();
		let maxDistance = (($('#racetrack').width() - carWidth)/100)*90;
		console.log(stages);
		$("#gpText").html(stages[0]);
		for(i=0;i<pontos.length;i++){
			for (k=0;k<pontos[i].length;k++){
				$('#driverContainer'+(k+1)).css('margin-left', '-75px');
				$('#text'+(k+1))[0].innerText = drivers[k];
				$('#text'+(k+1)).fadeTo(animationTime,1);
				let x = '';
				if(i+1 < pontos.length){
					x=stages[i+1];
				}else{
					x=stages[i];
				}
				$('#driverContainer'+(k+1)).animate({'margin-left':  (maxDistance*pontos[i][k])/max} , animationTime, movementType, function(){$("#gpText").html(x);});
			}
		}
	});
});